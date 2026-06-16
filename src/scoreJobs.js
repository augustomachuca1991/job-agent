import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const jobs = JSON.parse(fs.readFileSync("jobs.json", "utf8"));
const profile = JSON.parse(fs.readFileSync("./data/profile.json", "utf8"));
const promptTemplate = fs.readFileSync(path.join(__dirname, "..", "prompts", "score.txt"), "utf8");

const scoredJobs = [];

for (const job of jobs.slice(0, 20)) {
  const prompt = promptTemplate.replace("{{JOB_DESCRIPTION}}", JSON.stringify(job, null, 2));

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    if (!response.ok) {
      console.error(`Gemini error ${response.status}:`, await response.text());
      continue;
    }

    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      console.error("Gemini: empty response");
      continue;
    }

    const clean = text
      .replace(/```json?/g, "")
      .replace(/```/g, "")
      .trim();
    const analysis = JSON.parse(clean);

    scoredJobs.push({ ...job, ...analysis });
  } catch (err) {
    console.error("Gemini error:", err.message);
  }
}

fs.writeFileSync("scoredJobs.json", JSON.stringify(scoredJobs, null, 2));
console.log(`Scored ${scoredJobs.length} jobs`);
