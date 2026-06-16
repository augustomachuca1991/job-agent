import fs from "fs";

const jobs = JSON.parse(fs.readFileSync("scoredJobs.json", "utf8"));

const topJobs = jobs
  .filter((j) => j.score >= 75)
  .sort((a, b) => b.score - a.score)
  .slice(0, 10);

let sent = 0;

for (const job of topJobs) {
  const skills = job.matching_skills?.length
    ? job.matching_skills.join(", ")
    : "No especificadas";

  const message = [
    "🔥 Nueva oportunidad",
    "",
    `🏢 ${job.company}`,
    `💼 ${job.title}`,
    `⭐ Score: ${job.score}/100`,
    "",
    "✅ Skills:",
    skills,
    "",
    `🔗 ${job.url}`,
  ].join("\n");

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${process.env.VITE_TELEGRAM_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: process.env.VITE_TELEGRAM_CHAT_ID,
          text: message,
        }),
      }
    );

    if (res.ok) {
      sent++;
      console.log(`  ✅ ${job.company} — ${job.title}`);
    } else {
      const body = await res.text();
      console.error(`  ❌ ${job.company}: Telegram error ${res.status} — ${body.slice(0, 200)}`);
    }
  } catch (err) {
    console.error(`  ❌ ${job.company}: ${err.message}`);
  }
}

console.log(`\nSent ${sent} / ${topJobs.length} notifications`);
