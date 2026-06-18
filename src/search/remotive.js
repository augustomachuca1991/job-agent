export default async function searchRemotive() {
  try {
    const res = await fetch("https://remotive.com/api/remote-jobs?limit=200", {
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    if (!res.ok) {
      console.warn(`Remotive: ${res.status}`);
      return [];
    }

    const data = await res.json();
    const jobs = data.jobs || [];

    // Filter for relevant categories
    const relevantCategories = [
      "software-dev", "full-stack-programming", "backend-programming",
      "devops-sysadmin", "frontend-programming",
      "data-engineering", "data-science", "product",
      "marketing", "customer-support",
    ];

    return jobs
      .filter((j) => relevantCategories.includes(j.category) && j.title)
      .map((j) => ({
        title: j.title,
        company: j.company_name || "Unknown",
        description: j.description || "",
        url: j.url,
        tags: j.tags || [],
        source: "Remotive",
      }));
  } catch (err) {
    console.warn("Remotive error:", err.message);
    return [];
  }
}
