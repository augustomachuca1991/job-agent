import fs from "fs";
import path from "path";
import MarkdownIt from "markdown-it";
import { chromium } from "playwright";

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});

const GENERATED_DIR = "generated";

async function ensureBrowser() {
  try {
    const browser = await chromium.launch({ headless: true });
    return browser;
  } catch (err) {
    console.error(
      "❌ Chromium no está instalado. Ejecutá: npx playwright install chromium"
    );
    console.error(`   Error: ${err.message}`);
    process.exit(1);
  }
}

function buildHTML(markdown, fileName) {
  const body = md.render(markdown);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @page {
      size: letter;
      margin: 20mm 13mm;
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: Tahoma, 'Segoe UI', sans-serif;
      font-size: 8.5pt;
      line-height: 1.4;
      color: #3D3D3D;
    }
    h1 {
      font-family: 'Times New Roman', Times, serif;
      font-weight: 700;
      font-size: 18pt;
      text-align: center;
      margin-bottom: 2pt;
      color: #333;
    }
    h1 + p {
      font-family: Tahoma, 'Segoe UI', sans-serif;
      font-size: 11.5pt;
      color: #6F7878;
      margin-bottom: 8pt;
    }
    h2 {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 11.5pt;
      font-weight: 400;
      letter-spacing: 1pt;
      color: #333;
      text-transform: uppercase;
      border-top: 0.5px solid #333;
      border-bottom: 0.5px solid #333;
      padding: 3pt 0;
      margin-top: 14pt;
      margin-bottom: 6pt;
    }
    h3 {
      font-family: Tahoma, 'Segoe UI', sans-serif;
      font-size: 9.5pt;
      font-weight: 600;
      color: #333;
      display: flex;
      justify-content: space-between;
      margin-top: 8pt;
      margin-bottom: 2pt;
    }
    p {
      margin-bottom: 4pt;
    }
    ul, ol {
      padding-left: 16pt;
      margin-bottom: 4pt;
    }
    li {
      margin-bottom: 1pt;
    }
    a {
      color: #333;
      text-decoration: none;
    }
    hr {
      border: none;
      border-top: 0.5px solid #333;
      margin: 10pt 0;
    }
    strong {
      color: #333;
      font-weight: 600;
    }
    code {
      font-size: 8pt;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 6pt 0;
    }
    th, td {
      border: 0.5px solid #999;
      padding: 3pt 6pt;
      text-align: left;
      font-size: 8pt;
    }
    th {
      background: #f5f5f5;
    }
  </style>
</head>
<body>
  ${body}
</body>
</html>`;
}

if (!fs.existsSync(GENERATED_DIR)) {
  console.error("❌ La carpeta 'generated/' no existe. Ejecutá 'npm run cv' y 'npm run cover' primero.");
  process.exit(1);
}

const files = fs
  .readdirSync(GENERATED_DIR)
  .filter((f) => f.endsWith(".md"))
  .sort();

if (files.length === 0) {
  console.log("⚠️  No hay archivos .md en generated/. Nada que convertir.");
  process.exit(0);
}

console.log(`Found ${files.length} markdown files`);

const browser = await ensureBrowser();
let converted = 0;
let failed = 0;

for (const file of files) {
  const filePath = path.join(GENERATED_DIR, file);

  try {
    const markdown = fs.readFileSync(filePath, "utf8");
    const html = buildHTML(markdown, file);

    const page = await browser.newPage({ viewport: { width: 792, height: 1024 } });
    await page.setContent(html, { waitUntil: "networkidle" });

    const pdfFile = file.replace(/\.md$/i, ".pdf");
    const pdfPath = path.join(GENERATED_DIR, pdfFile);

    await page.pdf({
      path: pdfPath,
      format: "A4",
      margin: { top: "20mm", bottom: "20mm", left: "13mm", right: "13mm" },
      printBackground: true,
    });

    await page.close();
    converted++;
    console.log(`  ✅ ${file} → ${pdfFile}`);
  } catch (err) {
    failed++;
    console.error(`  ❌ ${file}: ${err.message}`);
  }
}

await browser.close();
console.log(
  `\nConverted ${converted} / ${files.length} files to PDF${failed ? ` (${failed} failed)` : ""}`
);
