import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const jobs = JSON.parse(fs.readFileSync("scoredJobs.json", "utf8"));
const masterCV = fs.readFileSync("./cv/master_cv.md", "utf8");
const template = fs.readFileSync(path.join(__dirname, "..", "prompts", "cover.txt"), "utf8");

if (!fs.existsSync("generated")) {
  fs.mkdirSync("generated", { recursive: true });
}

const eligible = jobs.filter((j) => j.score >= 80);
let generated = 0;

for (let i = 0; i < eligible.length; i++) {
  const job = eligible[i];
  const label = `[${i + 1}/${eligible.length}] ${job.title} @ ${job.company}`;

  const prompt = template
    .replace("{{MASTER_CV}}", masterCV)
    .replace("{{COMPANY_NAME}}", job.company || "")
    .replace("{{JOB_TITLE}}", job.title || "")
    .replace("{{JOB_DESCRIPTION}}", JSON.stringify(job, null, 2));

  const cover = await callGeminiWithRetry(prompt);
  if (!cover) {
    console.error(`  ❌ ${label} — failed after retries`);
    continue;
  }

  const baseName = `${job.company.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_${job.title
    .replace(/[^a-z0-9]/gi, "_")
    .toLowerCase()
    .slice(0, 20)}`;
  fs.writeFileSync(`generated/${baseName}-cover.md`, cover);
  generated++;
  console.log(`  ✅ ${label}`);

  if (i < eligible.length - 1) await sleep(3_000);
}

console.log(`\nGenerated ${generated} / ${eligible.length} cover letters`);

async function callGeminiWithRetry(prompt, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-3.1-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
        signal: AbortSignal.timeout(60_000),
      });

      if (response.status === 429) {
        const body = await response.json();
        const retryMatch = body?.error?.message?.match(/Please retry in (\d+(?:\.\d+)?)s/);
        const delay = retryMatch ? parseFloat(retryMatch[1]) + 1 : 30;
        console.warn(`  429 — retrying in ${delay.toFixed(0)}s (attempt ${attempt}/${maxRetries})`);
        await sleep(delay * 1000);
        continue;
      }

      if (!response.ok) {
        console.error(`  API error ${response.status}:`, await response.text().catch(() => ""));
        return null;
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
    } catch (err) {
      if (err.name === "TimeoutError") {
        console.warn(`  ⏱ Timeout (attempt ${attempt}/${maxRetries})`);
      } else {
        console.error(`  Error (attempt ${attempt}):`, err.message);
      }
      if (attempt === maxRetries) return null;
      await sleep(10_000);
    }
  }
  return null;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
