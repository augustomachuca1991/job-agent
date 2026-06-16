const QUERIES = [
  { count: 50, tag: "backend developer" },
  { count: 50, tag: "full stack developer" },
  { count: 50, tag: "devops engineer" },
  { count: 50, tag: "php developer" },
  { count: 50, tag: "nodejs developer" },
  { count: 50, tag: "laravel developer" },
];

export default async function searchJobicy() {
  const all = [];
  const seen = new Set();

  for (const { count, tag } of QUERIES) {
    try {
      const url = `https://jobicy.com/api/v2/remote-jobs?count=${count}&tag=${encodeURIComponent(tag)}`;

      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0" },
      });

      if (!res.ok) {
        console.warn(`Jobicy ${tag}: ${res.status}`);
        continue;
      }

      const data = await res.json();
      const jobs = data.jobs || [];

      for (const job of jobs) {
        if (seen.has(job.url)) continue;
        seen.add(job.url);

        all.push({
          title: job.jobTitle || job.title || "Unknown",
          company: job.companyName || job.company || "Unknown",
          description: job.jobDescription || job.description || "",
          url: job.url || job.applyUrl || "",
          tags: job.jobCategory ? [job.jobCategory] : job.industries || [],
          source: "Jobicy",
        });
      }
    } catch (err) {
      console.warn("Jobicy error:", err.message);
    }
  }

  return all;
}
