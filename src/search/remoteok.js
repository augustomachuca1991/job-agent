export default async function searchRemoteOK() {
  const response = await fetch("https://remoteok.com/api", {
    headers: { "User-Agent": "Mozilla/5.0" },
  });

  if (!response.ok) {
    console.error(`RemoteOK error: ${response.status}`);
    return [];
  }

  const jobs = await response.json();

  return jobs
    .filter((job) => job.position)
    .map((job) => ({
      title: job.position,
      company: job.company,
      description: job.description || "",
      url: job.url,
      tags: job.tags || [],
      source: "RemoteOK",
    }));
}
