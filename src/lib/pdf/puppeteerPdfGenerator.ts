import puppeteer from "puppeteer";
import chromium from "@sparticuz/chromium";
import path from "path";

export interface ContentSection {
  title: string;
  type: 'table' | 'keyValue' | 'text';
  data: any;
}

/**
 * Simplified PDF generator with better error handling
 */
export async function generateReportPdf(
  sections: ContentSection[],
  title: string,
  dateRange: string,
): Promise<Buffer> {
  const isDev = process.env.NODE_ENV !== "production";
  let browser = null;

  try {
    // Launch browser with minimal options for stability
    browser = await puppeteer.launch({
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ],
      defaultViewport: {
        width: 1024,
        height: 1200,
      },
      executablePath: isDev
        ? (await import('puppeteer')).executablePath()
        : await chromium.executablePath(),
      headless: true,
    });

    // Create a new page
    const page = await browser.newPage();
    
    // Prepare HTML content
    const htmlContent = generateHtml(sections, title, dateRange);
    
    // Set content with longer timeout
    await page.setContent(htmlContent, { 
      waitUntil: 'networkidle0',
      timeout: 90000 // 90 seconds timeout
    });
    
    // Generate PDF with longer timeout
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', right: '20px', bottom: '80px', left: '20px' },
      timeout: 90000 // 90 seconds timeout
    });
    
    // Close browser
    await browser.close();
    browser = null;
    
    // Return PDF buffer
    return Buffer.from(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  } finally {
    // Make sure browser is always closed
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('Error closing browser:', closeError);
      }
    }
  }
}

/**
 * Generate HTML content for the PDF
 */
function generateHtml(
  sections: ContentSection[],
  title: string,
  dateRange: string
): string {
  // Simple logo
  const logoHtml = '<div class="logo">LACHS GOLDEN ERP</div>';
  
  // Build sections HTML
  let sectionsHtml = '';
  for (const section of sections) {
    sectionsHtml += `<div class="section"><div class="section-title">${section.title}</div>`;
    
    if (section.type === 'table') {
      sectionsHtml += '<table>';
      
      // Add headers if they exist
      if (section.data.headers) {
        sectionsHtml += '<thead><tr>';
        for (const header of section.data.headers) {
          sectionsHtml += `<th>${header}</th>`;
        }
        sectionsHtml += '</tr></thead>';
      }
      
      // Add rows
      sectionsHtml += '<tbody>';
      for (const row of section.data.rows) {
        sectionsHtml += '<tr>';
        for (const cell of row) {
          sectionsHtml += `<td>${cell}</td>`;
        }
        sectionsHtml += '</tr>';
      }
      sectionsHtml += '</tbody></table>';
      
    } else if (section.type === 'keyValue') {
      sectionsHtml += '<table class="key-value-table">';
      for (const [key, value] of Object.entries(section.data)) {
        sectionsHtml += `<tr><td>${key}</td><td>${value}</td></tr>`;
      }
      sectionsHtml += '</table>';
      
    } else {
      sectionsHtml += `<p>${section.data}</p>`;
    }
    
    sectionsHtml += '</div>';
  }

  // Complete HTML document
  return `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body{font-family:Arial,sans-serif;font-size:10px;color:#333;margin:20px}
          .logo{text-align:center;margin-bottom:20px;font-weight:bold;font-size:14px}
          .header{font-size:20px;font-weight:bold;text-align:center;margin-bottom:10px}
          .subheader{text-align:center;margin-bottom:20px}
          .section{margin-bottom:15px;border-top:1px solid #eee;padding-top:10px}
          .section-title{font-size:14px;font-weight:bold;margin-bottom:8px}
          table{width:100%;border-collapse:collapse;margin-bottom:10px}
          table,th,td{border:1px solid #ddd}
          th,td{padding:6px;text-align:left}
          th{background-color:#f2f2f2}
          .key-value-table td:first-child{font-weight:bold;width:30%}
          .footer{position:fixed;bottom:20px;left:20px;right:20px;border-top:1px solid #eee;padding-top:10px;display:flex;justify-content:space-between;font-size:8px}
        </style>
      </head>
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
    </html>`;
}
