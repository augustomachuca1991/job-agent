import fs from "fs";
import aggregateJobs from "./search/aggregator.js";

const jobs = await aggregateJobs();

fs.writeFileSync("jobs.json", JSON.stringify(jobs, null, 2));

console.log(`\nTotal: ${jobs.length} jobs from aggregator`);
