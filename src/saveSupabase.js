import fs from "fs";

const jobs = JSON.parse(fs.readFileSync("scoredJobs.json", "utf8"));

for (const job of jobs) {
  if (job.score < 75) continue;

  await fetch(`${process.env.SUPABASE_URL}/rest/v1/jobs`, {
    method: "POST",
    headers: {
      apikey: process.env.SUPABASE_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      title: job.title,
      company: job.company,
      url: job.url,
      score: job.score,
      skills: job.matching_skills,
    }),
  });
}

console.log("Saved to Supabase");
