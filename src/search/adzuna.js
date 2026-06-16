const COUNTRIES = ["mx", "br", "es", "us", "gb", "ca", "au", "de", "nl"];
const WHAT_QUERIES = [
  'backend developer', 'full stack developer', 'devops engineer',
  'desarrollador backend', 'desarrollador full stack', 'php developer',
  'nodejs developer', 'laravel developer'
];

export default async function searchAdzuna() {
  const { ADZUNA_APP_ID, ADZUNA_APP_KEY } = process.env;

  if (!ADZUNA_APP_ID || !ADZUNA_APP_KEY) {
    console.warn("Adzuna: missing ADZUNA_APP_ID or ADZUNA_APP_KEY");
    return [];
  }

  const all = [];
  const seen = new Set();

  for (const country of COUNTRIES) {
    for (const what of WHAT_QUERIES) {
      try {
        const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/1?app_id=${ADZUNA_APP_ID}&app_key=${ADZUNA_APP_KEY}&results_per_page=20&what=${encodeURIComponent(what)}`;

        const res = await fetch(url, {
          headers: { "User-Agent": "Mozilla/5.0" },
        });

        if (!res.ok) {
          console.warn(`Adzuna ${country}/${what}: ${res.status}`);
          continue;
        }

        const data = await res.json();

        for (const job of (data.results || [])) {
          if (seen.has(job.redirect_url)) continue;
          seen.add(job.redirect_url);
          all.push({
            title: job.title,
            company: job.company?.display_name || "Unknown",
            description: job.description || "",
            url: job.redirect_url,
            tags: job.category?.label ? [job.category.label] : [],
            source: "Adzuna",
          });
        }
      } catch (err) {
        console.warn(`Adzuna error ${country}/${what}:`, err.message);
      }
    }
  }

  return all;
}
