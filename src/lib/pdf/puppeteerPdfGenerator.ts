import puppeteer from "puppeteer";
import chromium from "@sparticuz/chromium";
import fs from "fs/promises";
import path from "path";

export interface ContentSection {
  title: string;
  type: 'table' | 'keyValue' | 'text';
  data: any;
}

const DEFAULT_LOGO_PATH = path.join(process.cwd(), "public", "images", "logo.png");

export async function generateReportPdf(
  sections: ContentSection[],
  title: string,
  dateRange: string,
): Promise<Buffer> {
  const isDev = process.env.NODE_ENV !== "production";

  // --- Start of corrected code ---
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: null,
    executablePath: isDev
      ? (await import('puppeteer')).executablePath()
      : await chromium.executablePath(),
    headless: isDev ? true : false,
  });
  // --- End of corrected code ---

  const page = await browser.newPage();

  // --- Load logo once, fallback to text if missing ---
  let logoHtml = '<div class="logo">LACHS GOLDEN ERP</div>';
  try {
    const logoBuffer = await fs.readFile(DEFAULT_LOGO_PATH);
    const base64 = logoBuffer.toString('base64');
    logoHtml = `<div class="logo"><img src="data:image/png;base64,${base64}" alt="Logo"></div>`;
  } catch {
    console.warn('⚠️ Logo not found at /public/images/logo.png, using fallback text.');
  }

  // --- Build sections ---
  const sectionsHtml = sections
    .map((section) => {
      let content = `<div class="section"><div class="section-title">${section.title}</div>`;
      if (section.type === 'table') {
        content += `
          <table>
            ${
              section.data.headers
                ? `<thead><tr>${section.data.headers
                    .map((h: string) => `<th>${h}</th>`)
                    .join('')}</tr></thead>`
                : ''
            }
            <tbody>
              ${section.data.rows
                .map(
                  (r: string[]) =>
                    `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`
                )
                .join('')}
            </tbody>
          </table>
        `;
      } else if (section.type === 'keyValue') {
        content += `<table class="key-value-table">${Object.entries(
          section.data,
        )
          .map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`)
          .join('')}</table>`;
      } else {
        content += `<p>${section.data}</p>`;
      }
      return content + `</div>`;
    })
    .join('');

  // --- Final HTML ---
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head><meta charset="UTF-8">${getBaseStyles()}</head>
      <body>
        ${logoHtml}
        <div class="header">${title}</div>
        <div class="subheader">Report Period: ${dateRange}</div>
        ${sectionsHtml}
        <div class="footer">
          <div>Lachs Golden ERP System</div>
          <div>Generated: ${new Date().toLocaleString()}</div>
        </div>
      </body>
    </html>
  `;

  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '20px', right: '20px', bottom: '80px', left: '20px' },
  });

  await browser.close();
  return Buffer.from(pdfBuffer);
}

function getBaseStyles() {
  return `
    <style>
      body {
        font-family: sans-serif;
        font-size: 10px;
        color: #333;
        margin: 20px;
      }
      .logo {
        text-align: center;
        margin-bottom: 20px;
      }
      .logo img {
        width: 100px;
      }
      .header {
        font-size: 24px;
        font-weight: bold;
        text-align: center;
        margin-bottom: 10px;
      }
      .subheader {
        text-align: center;
        margin-bottom: 30px;
      }
      .section {
        margin-bottom: 20px;
        border-top: 1px solid #eee;
        padding-top: 10px;
      }
      .section-title {
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 10px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 10px;
      }
      table, th, td {
        border: 1px solid #ddd;
      }
      th, td {
        padding: 8px;
        text-align: left;
      }
      th {
        background-color: #f2f2f2;
      }
      .key-value-table td:first-child {
        font-weight: bold;
        width: 30%;
      }
      .footer {
        position: fixed;
        bottom: 20px;
        left: 20px;
        right: 20px;
        border-top: 1px solid #eee;
        padding-top: 10px;
        display: flex;
        justify-content: space-between;
        font-size: 9px;
      }
    </style>
  `;
}
