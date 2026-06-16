import fs from "fs";

const jobs = JSON.parse(fs.readFileSync("scoredJobs.json", "utf8"));

const topJobs = jobs
  .filter((j) => j.score >= 75)
  .sort((a, b) => b.score - a.score)
  .slice(0, 10);

for (const job of topJobs) {
  const message = `
🔥 Nueva oportunidad

🏢 ${job.company}

💼 ${job.title}

⭐ Score: ${job.score}/100

✅ Skills:
${job.matching_skills.join(", ")}

🔗 ${job.url}
`;

  await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: process.env.TELEGRAM_CHAT_ID,
      text: message,
    }),
  });
}

console.log("Telegram notifications sent");
