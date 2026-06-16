import fs from "fs";
import path from "path";
import { supabase, markProcessed } from "./processedJobs.js";

const JOBS = JSON.parse(fs.readFileSync("scoredJobs.json", "utf8"));
const eligible = JOBS.filter((j) => j.score >= 75);

function safeName(str) {
  return str.replace(/[^a-z0-9]/gi, "_").toLowerCase();
}

function fileBase(job) {
  return `${safeName(job.company)}_${safeName(job.title).slice(0, 20)}`;
}

async function uploadToStorage(localPath, storagePath, contentType) {
  const content = fs.readFileSync(localPath);
  const { error } = await supabase.storage
    .from("job-documents")
    .upload(storagePath, content, { contentType, upsert: true });

  if (error) {
    console.error(`  ⚠ ${storagePath} upload failed: ${error.message}`);
    return null;
  }

  const { data } = supabase.storage.from("job-documents").getPublicUrl(storagePath);
  return data?.publicUrl || null;
}

async function uploadFile(base, suffix, folder) {
  const pdfPath = path.join("generated", `${base}-${suffix}.pdf`);
  const mdPath = path.join("generated", `${base}-${suffix}.md`);
  let pdfUrl = null;

  if (fs.existsSync(pdfPath)) {
    pdfUrl = await uploadToStorage(pdfPath, `${folder}/${base}-${suffix}.pdf`, "application/pdf");
  }

  if (fs.existsSync(mdPath)) {
    await uploadToStorage(mdPath, `${folder}/${base}-${suffix}.md`, "text/markdown");
  }

  return pdfUrl;
}

let saved = 0;
let failed = 0;

for (let i = 0; i < eligible.length; i++) {
  const job = eligible[i];
  const label = `[${i + 1}/${eligible.length}] ${job.title} @ ${job.company}`;

  try {
    const base = fileBase(job);
    const [cvUrl, coverUrl] = await Promise.all([
      uploadFile(base, "cv", "cvs"),
      uploadFile(base, "cover", "covers"),
    ]);

    const res = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/applications`, {
      method: "POST",
      headers: {
        apikey: process.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${process.env.VITE_SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        company: job.company,
        title: job.title,
        score: job.score,
        job_url: job.url,
        cv_url: cvUrl,
        cover_url: coverUrl,
        status: "NEW",
      }),
    });

    if (res.ok) {
      try {
        await markProcessed(job.url, job.company, job.title, job.score);
      } catch (err) {
        console.error(`  ⚠ Failed to mark processed: ${err.message}`);
      }

      saved++;
      const extras = [];
      if (cvUrl) extras.push("cv");
      if (coverUrl) extras.push("cover");
      console.log(`  ✅ ${label}${extras.length ? ` (${extras.join(" + ")})` : ""}`);
    } else {
      failed++;
      const body = await res.text();
      console.error(`  ❌ ${label} — ${res.status}: ${body.slice(0, 200)}`);
    }
  } catch (err) {
    failed++;
    console.error(`  ❌ ${label} — ${err.message}`);
  }
}

console.log(`\nSaved ${saved} / ${eligible.length} eligible jobs${failed ? ` (${failed} failed)` : ""}`);

// Limpiar archivos locales del generated/
if (fs.existsSync("generated")) {
  const files = fs.readdirSync("generated").filter((f) => f !== ".gitkeep" && f.endsWith(".pdf"));
  for (const f of files) {
    fs.unlinkSync(path.join("generated", f));
  }
  if (files.length > 0) console.log(`🧹 Cleaned ${files.length} local files from generated/`);
}
