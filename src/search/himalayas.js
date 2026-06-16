const QUERIES = [
  "backend developer", "full stack developer", "devops engineer",
  "php developer", "nodejs developer", "laravel developer",
];

export default async function searchHimalayas() {
  const all = [];
  const seen = new Set();

  for (const q of QUERIES) {
    try {
      const url = `https://himalayas.app/jobs/api/search?q=${encodeURIComponent(q)}&page=1`;

      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0" },
      });

      if (!res.ok) {
        console.warn(`Himalayas ${q}: ${res.status}`);
        continue;
      }

      const data = await res.json();
      const jobs = data.jobs || [];

      for (const job of jobs) {
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
      console.warn("Himalayas error:", err.message);
    }
  }

  return all;
}
