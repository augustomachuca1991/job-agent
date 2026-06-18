const QUERIES = [
  "backend developer", "full stack developer", "devops engineer",
  "php developer", "nodejs developer", "laravel developer",
  "frontend developer", "react developer", "python developer",
  "data engineer", "desarrollador backend", "desarrollador full stack",
];

const MAX_PAGES = 2;

export default async function searchHimalayas() {
  const all = [];
  const seen = new Set();

  for (const q of QUERIES) {
    for (let page = 1; page <= MAX_PAGES; page++) {
      try {
        const url = `https://himalayas.app/jobs/api/search?q=${encodeURIComponent(q)}&page=${page}`;

        const res = await fetch(url, {
          headers: { "User-Agent": "Mozilla/5.0" },
        });

        if (!res.ok) {
          console.warn(`Himalayas ${q} page ${page}: ${res.status}`);
          break;
        }

        const data = await res.json();
        const jobs = data.jobs || [];

        if (jobs.length === 0) break;

        for (const job of jobs) {
          if (!job.url) continue;
          if (seen.has(job.url)) continue;
          seen.add(job.url);

          all.push({
            title: job.title || "Unknown",
            company: job.company?.name || job.company_name || "Unknown",
            description: job.description || "",
            url: job.url,
            tags: job.skills || job.tags || [],
            source: "Himalayas",
          });
        }
      } catch (err) {
        console.warn(`Himalayas error ${q} page ${page}:`, err.message);
      }
    }
  }

  return all;
}
