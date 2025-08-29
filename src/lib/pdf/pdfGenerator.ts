import { ContentSection as PuppeteerContentSection, generateReportPdf as generateWithPuppeteer } from './puppeteerPdfGenerator';
import { ContentSection as JsPdfContentSection, generateReportPdf as generateWithJsPdf } from './jsPdfGenerator';

// Export the ContentSection type from jsPDF implementation
export type ContentSection = JsPdfContentSection;

/**
 * Generate a PDF report using the configured generator
 * This function acts as a facade to switch between different PDF generation implementations
 */
export async function generateReportPdf(
  sections: ContentSection[],
  title: string,
  dateRange: string,
): Promise<Buffer> {
  // Check if we should use jsPDF or Puppeteer
  // This can be controlled via environment variable or config
  const useJsPdf = process.env.USE_JSPDF === 'true';
  
  try {
    if (useJsPdf) {
      console.log('Generating PDF with jsPDF');
      try {
        return await generateWithJsPdf(sections, title, dateRange);
      } catch (jsPdfError) {
        console.error('Error generating PDF with jsPDF:', jsPdfError);
        console.log('jsPDF failed, falling back to Puppeteer');
        return await generateWithPuppeteer(sections, title, dateRange);
      }
    } else {
      console.log('Generating PDF with Puppeteer');
      try {
        return await generateWithPuppeteer(sections, title, dateRange);
      } catch (puppeteerError) {
        console.error('Error generating PDF with Puppeteer:', puppeteerError);
        console.log('Puppeteer failed, falling back to jsPDF');
        return await generateWithJsPdf(sections, title, dateRange);
      }
    }
  } catch (error) {
    console.error('All PDF generation methods failed:', error);
    throw new Error('Failed to generate PDF with any available method');
  }
}