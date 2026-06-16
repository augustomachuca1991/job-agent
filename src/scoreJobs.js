import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const jobs = JSON.parse(fs.readFileSync("jobs.json", "utf8"));
const profile = JSON.parse(fs.readFileSync("./data/profile.json", "utf8"));
const promptTemplate = fs.readFileSync(
  path.join(__dirname, "..", "prompts", "score.txt"),
  "utf8"
);

const SKILLS = (profile.skills || []).map((s) => s.toLowerCase());
const ROLES = [
  "backend", "full stack", "frontend", "devops",
  "software engineer", "platform engineer",
];
const KEYWORDS = [...SKILLS, ...ROLES, "remote", "senior", "ssr", "mid"];

function relevanceScore(job) {
  const text = [
    job.title,
    job.description,
    ...(job.tags || []),
  ]
    .join(" ")
    .toLowerCase();

  let score = 0;

  for (const skill of SKILLS) {
    if (text.includes(skill)) score += 3;
  }

  for (const role of ROLES) {
    if (text.includes(role)) score += 2;
  }

  if (text.includes("remote")) score += 2;
  if (text.includes("argentina") || text.includes("latin america")) score += 1;

  return score;
}

const ranked = jobs
  .map((job) => ({ ...job, _rank: relevanceScore(job) }))
  .sort((a, b) => b._rank - a._rank);

const topJobs = ranked.slice(0, 20);

console.log(`Selected top 20 from ${jobs.length} jobs (by relevance)`);
for (const job of topJobs) {
  console.log(`  [${job._rank}] ${job.title} @ ${job.company} (${job.source})`);
}

const scoredJobs = [];
const MS_PER_REQUEST = 7_000;

for (let i = 0; i < topJobs.length; i++) {
  const job = topJobs[i];

  const prompt = promptTemplate.replace(
    "{{JOB_DESCRIPTION}}",
    JSON.stringify(job, null, 2)
  );

  const analysis = await callGeminiWithRetry(prompt);
  if (analysis) {
    scoredJobs.push({ ...job, ...analysis });
  }

  if (i < topJobs.length - 1) {
    await sleep(MS_PER_REQUEST);
  }
}

fs.writeFileSync("scoredJobs.json", JSON.stringify(scoredJobs, null, 2));
console.log(`\nScored ${scoredJobs.length} jobs`);

async function callGeminiWithRetry(prompt, maxRetries = 5) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      if (response.status === 429) {
        const body = await response.json();
        const retryMatch = body?.error?.message?.match(
          /Please retry in (\d+(?:\.\d+)?)s/
        );
        const delay = retryMatch
          ? parseFloat(retryMatch[1]) + 1
          : 60;
        console.warn(`  429 — retrying in ${delay.toFixed(0)}s (attempt ${attempt}/${maxRetries})`);
        await sleep(delay * 1000);
        continue;
      }

      if (!response.ok) {
        console.error(`Gemini error ${response.status}:`, await response.text());
        return null;
      }

      const result = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        console.error("Gemini: empty response");
        return null;
      }

      const clean = text.replace(/```json?/g, "").replace(/```/g, "").trim();
      return JSON.parse(clean);
    } catch (err) {
      console.error(`Gemini error (attempt ${attempt}):`, err.message);
      if (attempt === maxRetries) return null;
      await sleep(10_000);
    }
  }

  return null;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
