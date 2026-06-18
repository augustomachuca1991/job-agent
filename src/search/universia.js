import { chromium } from "playwright";

const TARGETS = [
  { code: "ar", label: "Argentina" },
  { code: "mx", label: "México" },
  { code: "es", label: "España" },
];

const MAX_PAGES = 1;

export default async function searchUniversia() {
  const all = [];
  const seen = new Set();

  const browser = await chromium.launch({ headless: true });

  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

    for (const { code, label } of TARGETS) {
      for (let pageNum = 1; pageNum <= MAX_PAGES; pageNum++) {
        try {
          const url = `https://www.universia.net/${code}/empleo?dateFrom=all&page=${pageNum}`;
          console.log(`Universia ${label} page ${pageNum}...`);
          await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
          await page.waitForTimeout(3000);

          const acceptBtn = page.locator("button:has-text('Aceptar todas las cookies')");
          if (await acceptBtn.count() > 0) {
            await acceptBtn.first().click();
            await page.waitForTimeout(500);
          }

          const cards = page.locator("job-card");
          const cardCount = await cards.count();
          if (cardCount === 0) break;

          for (let i = 0; i < cardCount; i++) {
            try {
              const card = cards.nth(i);

              // Extract visible data from card shadow DOM
              const cardData = await card.evaluate((el) => {
                const root = el.shadowRoot;
                if (!root) return null;
                const title = root.querySelector("h2")?.textContent?.trim() || "";
                const company = root.querySelector(".job-card__subtitle")?.textContent?.trim() || "";
                const location = root.querySelector(".job-card__top-content")?.textContent?.trim() || "";
                const tags = Array.from(root.querySelectorAll(".job-card__tag")).map(
                  (t) => t.textContent?.trim() || ""
                );
                const published = root.querySelector(".job-card__bottom-content")?.textContent?.trim() || "";
                return { title, company, location, tags, published };
              });

              if (!cardData || !cardData.title) continue;

              // Click to get job URL
              await card.click();
              await page.waitForTimeout(400);

              // Extract URL from social links in job-detail (URLs are encoded)
              const jobUrl = await page.evaluate(() => {
                const detail = document.querySelector("job-detail");
                if (!detail?.shadowRoot) return "";
                const links = detail.shadowRoot.querySelectorAll(".social-bar__link");
                for (const link of links) {
                  const href = link.getAttribute("href") || "";
                  try {
                    const decoded = decodeURIComponent(href);
                    const m = decoded.match(/https?:\/\/www\.universia\.net\/[a-z]+\/empleo\/[a-f0-9-]+\/[^"'\s?&]+\.html/);
                    if (m) return m[0].replace(/\?.*/, "");
                  } catch {}
                }
                return "";
              });

              // Also get description from detail panel
              const description = await page.evaluate(() => {
                const detail = document.querySelector("job-detail");
                if (!detail?.shadowRoot) return "";
                const section = detail.shadowRoot.querySelector('#section-description .section-container');
                const text = section?.textContent?.trim() || "";
                return text.replace(/\s+/g, " ").trim();
              });

              const key = jobUrl?.toLowerCase().trim() || `${cardData.title}|${cardData.company}`;
              if (!seen.has(key)) {
                seen.add(key);
                all.push({
                  title: cardData.title,
                  company: cardData.company || "Unknown",
                  description: description || "",
                  location: cardData.location || "",
                  url: jobUrl || "",
                  tags: cardData.tags || [],
                  source: `Universia (${label})`,
                });
              }
            } catch (err) {
              // Skip card on error
            }
          }

          // Check for next page
          const nextLink = page.locator("a.jobs-list__next-page");
          if (await nextLink.count() === 0) break;

        } catch (err) {
          console.warn(`  Error: ${err.message}`);
        }
      }
    }
  } finally {
    await browser.close();
  }

  console.log(`Universia: ${all.length} jobs`);
  return all;
}
