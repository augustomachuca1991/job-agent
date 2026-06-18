const QUERIES = [
  "backend", "fullstack", "full-stack", "devops",
  "php", "laravel", "node", "nodejs",
  "frontend", "react", "python", "data",
];

export default async function searchRemoteOK() {
  const all = [];
  const seen = new Set();

  for (const tag of QUERIES) {
    try {
      const url = `https://remoteok.com/api?tags=${encodeURIComponent(tag)}`;
      const response = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0" },
      });

      if (!response.ok) {
        console.warn(`RemoteOK ${tag}: ${response.status}`);
        continue;
      }

      const jobs = await response.json();

      for (const job of jobs) {
        if (!job.position) continue;
        const key = job.url?.toLowerCase().trim() || `${job.position}|${job.company}`;
        if (seen.has(key)) continue;
        seen.add(key);

        all.push({
          title: job.position,
          company: job.company,
          description: job.description || "",
          url: job.url,
          tags: job.tags || [],
          source: "RemoteOK",
        });
      }
    } catch (err) {
      console.warn(`RemoteOK ${tag} error:`, err.message);
    }
  }

  return all;
}
