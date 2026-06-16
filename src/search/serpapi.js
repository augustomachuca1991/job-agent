const QUERIES = [
  'site:linkedin.com/jobs backend developer remote',
  'site:linkedin.com/jobs full stack developer remote',
  'site:linkedin.com/jobs devops engineer remote',
  'site:linkedin.com/jobs php developer remote',
  'site:linkedin.com/jobs \u201cbackend developer\u201d Argentina',
  'site:linkedin.com/jobs laravel developer remote',
];

export default async function searchSerpAPI() {
  const { SERPAPI_KEY } = process.env;

  if (!SERPAPI_KEY) {
    console.warn("SerpAPI: missing SERPAPI_KEY");
    return [];
  }

  const all = [];
  const seen = new Set();

  for (const q of QUERIES) {
    try {
      const url = `https://serpapi.com/search.json?q=${encodeURIComponent(q)}&api_key=${SERPAPI_KEY}&engine=google&gl=ar&hl=es`;

      const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
      if (!res.ok) {
        console.warn(`SerpAPI ${q.slice(0, 40)}: ${res.status}`);
        continue;
      }

      const data = await res.json();

      for (const result of (data.organic_results || [])) {
        if (seen.has(result.link)) continue;
        seen.add(result.link);

        all.push({
          title: result.title || "",
          company: extractCompanyFromLinkedIn(result.title, result.snippet),
          description: result.snippet || "",
          url: result.link,
          tags: [],
          source: "LinkedIn (via Google)",
        });
      }
    } catch (err) {
      console.warn("SerpAPI error:", err.message);
    }
  }

  return all;
}

function extractCompanyFromLinkedIn(title, snippet) {
  const match = snippet?.match(/·\s*(.+?)(?:\.|,|\n|$)/);
  return match ? match[1].trim() : title?.split(/ at | – | — | - /)?.[1] || "Unknown";
}
