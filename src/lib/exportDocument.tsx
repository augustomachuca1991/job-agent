// src/lib/exportDocument.ts

import MarkdownIt from "markdown-it";
import {
    Document,
    Packer,
    Paragraph,
    TextRun,
    HeadingLevel,
} from "docx";

const md = new MarkdownIt({ html: false, linkify: true });
const FONT = "Calibri";

// ---------------------------------------------------------------------
// PDF — vía el diálogo de impresión del navegador (texto real, no imagen)
// ---------------------------------------------------------------------

function buildPrintableHTML(markdown: string, title: string): string {
    const body = md.render(markdown);

    // Esta es la misma idea de CSS que usabas en generatePDFs.js (Playwright),
    // pero ahora la podés editar y probar al instante en el navegador.
    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${title}</title>
<style>
  @page { size: A4; margin: 16mm 14mm; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: Calibri, Arial, "Segoe UI", sans-serif;
    font-size: 10.5pt;
    line-height: 1.45;
    color: #1a1a1a;
  }
  h1 { font-size: 19pt; font-weight: 700; text-align: center; margin: 0 0 3pt; }
  h1 + p { text-align: center; font-size: 9.5pt; color: #555; margin: 0 0 10pt; }
  h2 {
    font-size: 11.5pt; font-weight: 700; text-transform: uppercase;
    letter-spacing: .04em; border-bottom: 1pt solid #333;
    padding-bottom: 3pt; margin: 14pt 0 7pt;
  }
  h3 { font-size: 10.5pt; font-weight: 700; margin: 8pt 0 2pt; }
  p { margin: 0 0 6pt; }
  ul { margin: 0 0 6pt; padding-left: 16pt; }
  li { margin-bottom: 2pt; }
  strong { font-weight: 700; }
  a { color: #1a1a1a; text-decoration: none; }
</style>
</head>
<body>${body}</body>
</html>`;
}

export function openCvPdfPrintWindow(markdown: string, title = "CV") {
    const html = buildPrintableHTML(markdown, title);
    const win = window.open("", "_blank", "width=850,height=1100");

    if (!win) {
        alert("El navegador bloqueó la ventana. Habilitá los pop-ups para este sitio.");
        return;
    }

    win.document.open();
    win.document.write(html);
    win.document.close();

    const triggerPrint = () => {
        win.focus();
        win.print();
    };
    win.onload = triggerPrint;
    // fallback por si onload no llega a tiempo (carga de fuentes, etc.)
    setTimeout(triggerPrint, 350);
}

// ---------------------------------------------------------------------
// Word (.docx) — recorre el HTML ya renderizado por markdown-it
// ---------------------------------------------------------------------

function runsFromInline(node: Node, base: Record<string, any> = {}): TextRun[] {
    const runs: TextRun[] = [];
    node.childNodes.forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
            const text = child.textContent || "";
            if (text) runs.push(new TextRun({ text, font: FONT, ...base }));
        } else if (child.nodeType === Node.ELEMENT_NODE) {
            const el = child as HTMLElement;
            const tag = el.tagName.toLowerCase();
            if (tag === "strong" || tag === "b") runs.push(...runsFromInline(el, { ...base, bold: true }));
            else if (tag === "em" || tag === "i") runs.push(...runsFromInline(el, { ...base, italics: true }));
            else if (tag === "br") runs.push(new TextRun({ text: "", break: 1 }));
            else runs.push(...runsFromInline(el, base));
        }
    });
    return runs;
}

const HEADING_MAP: Record<string, string> = {
    h1: HeadingLevel.HEADING_1,
    h2: HeadingLevel.HEADING_2,
    h3: HeadingLevel.HEADING_3,
    h4: HeadingLevel.HEADING_4,
};

function walkBlock(el: Element, children: Paragraph[], listLevel = 0) {
    const tag = el.tagName.toLowerCase();

    if (/^h[1-4]$/.test(tag)) {
        children.push(new Paragraph({
            children: runsFromInline(el),
            heading: (HEADING_MAP[tag] ?? HeadingLevel.HEADING_4) as any,
            spacing: { before: 220, after: 100 },
        }));
    } else if (tag === "p") {
        children.push(new Paragraph({ children: runsFromInline(el), spacing: { after: 120 } }));
    } else if (tag === "ul" || tag === "ol") {
        Array.from(el.children).forEach((li) => {
            const liClone = li.cloneNode(true) as Element;
            Array.from(liClone.querySelectorAll("ul, ol")).forEach((nested) => nested.remove());

            children.push(new Paragraph({
                children: runsFromInline(liClone),
                bullet: { level: listLevel },
                spacing: { after: 60 },
            }));

            Array.from(li.children).forEach((nested) => {
                if (/^(ul|ol)$/i.test(nested.tagName)) walkBlock(nested, children, listLevel + 1);
            });
        });
    } else if (tag === "blockquote") {
        Array.from(el.children).forEach((child) => walkBlock(child, children, listLevel));
    } else if (tag === "hr") {
        children.push(new Paragraph({ text: "" }));
    } else if (tag === "table") {
        Array.from(el.querySelectorAll("tr")).forEach((tr) => {
            const rowText = Array.from(tr.children).map((td) => td.textContent?.trim() ?? "").join("   |   ");
            children.push(new Paragraph({ text: rowText, spacing: { after: 60 } }));
        });
    } else {
        Array.from(el.children).forEach((child) => walkBlock(child, children, listLevel));
    }
}

export async function generateDocxFromMarkdown(markdown: string): Promise<Blob> {
    const html = md.render(markdown);
    const dom = new DOMParser().parseFromString(html, "text/html");

    const children: Paragraph[] = [];
    Array.from(dom.body.children).forEach((el) => walkBlock(el, children));

    const doc = new Document({
        sections: [{ properties: {}, children }],
        styles: { default: { document: { run: { font: FONT, size: 22 } } } },
    });

    return Packer.toBlob(doc);
}