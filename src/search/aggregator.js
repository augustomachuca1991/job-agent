import searchRemoteOK from "./remoteok.js";
import searchAdzuna from "./adzuna.js";
import searchSerpAPI from "./serpapi.js";

const SOURCES = [
  { name: "RemoteOK", fn: searchRemoteOK },
  { name: "Adzuna", fn: searchAdzuna },
  { name: "SerpAPI", fn: searchSerpAPI },
];

export default async function aggregateJobs() {
  const results = await Promise.allSettled(
    SOURCES.map(({ name, fn }) =>
      fn().then((jobs) => ({ source: name, jobs }))
    )
  );

  const all = [];
  const seenUrls = new Set();

  for (const result of results) {
    if (result.status === "rejected") {
      console.warn(`Aggregator: ${result.reason?.source || "unknown source"} failed:`, result.reason?.message || result.reason);
      continue;
    }

    const { source, jobs } = result.value;

    if (!Array.isArray(jobs) || jobs.length === 0) {
      console.log(`Aggregator: ${source} returned 0 jobs`);
      continue;
    }

    let added = 0;
    for (const job of jobs) {
      const key = job.url?.toLowerCase().trim() || `${job.title}|${job.company}`;
      if (seenUrls.has(key)) continue;
      seenUrls.add(key);
      all.push(job);
      added++;
    }

    console.log(`Aggregator: ${source} → ${added} new jobs (${jobs.length} total)`);
  }

  return all;
}
