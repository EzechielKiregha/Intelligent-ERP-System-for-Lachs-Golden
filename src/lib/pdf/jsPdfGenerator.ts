import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import fs from 'fs/promises';
import path from 'path';

// Add the autoTable plugin to the jsPDF prototype
// This is necessary because the import alone doesn't always properly extend the prototype
(jsPDF.prototype as any).autoTable = autoTable;

export interface ContentSection {
  title: string;
  type: 'table' | 'keyValue' | 'text';
  data: any;
}

const DEFAULT_LOGO_PATH = path.join(process.cwd(), "public", "images", "logo.png");

/**
 * Generate a PDF report using jsPDF
 * This is a more lightweight alternative to Puppeteer
 */
export async function generateReportPdf(
  sections: ContentSection[],
  title: string,
  dateRange: string,
): Promise<Buffer> {
  try {
    // Create a new document
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Set default font
    doc.setFont('helvetica');
    
    // Page dimensions
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20; // margin in mm
    const contentWidth = pageWidth - (margin * 2);
    
    // Current Y position tracker
    let yPos = margin;
    
    // Add logo
    try {
      const logoBuffer = await fs.readFile(DEFAULT_LOGO_PATH);
      const logoBase64 = Buffer.from(logoBuffer).toString('base64');
      doc.addImage(`data:image/png;base64,${logoBase64}`, 'PNG', pageWidth / 2 - 15, yPos, 30, 15, undefined, 'FAST');
      yPos += 20;
    } catch (error) {
      // If logo fails to load, use text instead
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('LACHS GOLDEN ERP', pageWidth / 2, yPos, { align: 'center' });
      yPos += 10;
    }
    
    // Add title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(title, pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;
    
    // Add date range
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Report Period: ${dateRange}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;
    
    // Process each section
    for (const section of sections) {
      // Check if we need a new page
      if (yPos > pageHeight - 40) {
        doc.addPage();
        yPos = margin;
      }
      
      // Add section title
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(section.title, margin, yPos);
      yPos += 8;
      
      // Process section content based on type
      if (section.type === 'table') {
        // Create table with autotable
        const tableData = section.data.rows;
        const tableHeaders = section.data.headers ? 
          section.data.headers.map((header: string) => ({ title: header, dataKey: header })) : 
          [];
        
        // Use the autoTable plugin
        try {
          autoTable(doc, {
            head: tableHeaders.length > 0 ? [section.data.headers] : [],
            body: tableData,
            startY: yPos,
            margin: { left: margin, right: margin },
            headStyles: { 
              fillColor: [242, 242, 242], 
              textColor: [0, 0, 0],
              fontStyle: 'bold'
            },
            styles: {
              fontSize: 9,
              cellPadding: 3
            },
            alternateRowStyles: {
              fillColor: [252, 252, 252]
            },
            didDrawPage: (data) => {
              // Add footer to each page
              const pageHeight = doc.internal.pageSize.getHeight();
              
              // Add footer line
              doc.setDrawColor(238, 238, 238);
              doc.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);
              
              // Add footer text
              doc.setFontSize(8);
              doc.setFont('helvetica', 'normal');
              doc.text('Lachs Golden ERP System', margin, pageHeight - 15);
              doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - margin, pageHeight - 15, { align: 'right' });
              doc.text(`Page ${doc.getNumberOfPages()}`, pageWidth / 2, pageHeight - 15, { align: 'center' });
            }
          });
          
          // Get the final Y position after the table
          // @ts-ignore - lastAutoTable is added by the plugin
          yPos = (doc as any).lastAutoTable.finalY + 10;
        } catch (error) {
          console.error('Error generating table with autoTable:', error);
          
          // Fallback to manual table rendering if autoTable fails
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          
          // Draw headers if available
          if (tableHeaders.length > 0) {
            doc.setFont('helvetica', 'bold');
            section.data.headers.forEach((header: string, index: number) => {
              doc.text(header, margin + (index * 40), yPos);
            });
            yPos += 6;
          }
          
          // Draw rows
          doc.setFont('helvetica', 'normal');
          tableData.forEach((row: string[]) => {
            row.forEach((cell, index) => {
              doc.text(cell, margin + (index * 40), yPos);
            });
            yPos += 6;
          });
          
          yPos += 10;
        }
        
      } else if (section.type === 'keyValue') {
        // Create key-value pairs
        doc.setFontSize(9);
        
        const entries = Object.entries(section.data);
        for (const [key, value] of entries) {
          // Check if we need a new page
          if (yPos > pageHeight - 30) {
            doc.addPage();
            yPos = margin;
          }
          
          doc.setFont('helvetica', 'bold');
          doc.text(key, margin, yPos);
          doc.setFont('helvetica', 'normal');
          doc.text(value as string, margin + 50, yPos);
          yPos += 6;
        }
        
        yPos += 5; // Add some space after the key-value section
        
      } else if (section.type === 'text') {
        // Add text content
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        
        // Split text to fit within margins
        const textLines = doc.splitTextToSize(section.data, contentWidth);
        
        // Check if we need a new page
        if (yPos + (textLines.length * 5) > pageHeight - 30) {
          doc.addPage();
          yPos = margin;
        }
        
        doc.text(textLines, margin, yPos);
        yPos += (textLines.length * 5) + 5;
      }
    }
    
    // Add footer to any pages that might not have been processed by autoTable
    const addFooterToPage = (pageNum: number) => {
      doc.setPage(pageNum);
      
      // Add footer line
      doc.setDrawColor(238, 238, 238);
      doc.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);
      
      // Add footer text
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('Lachs Golden ERP System', margin, pageHeight - 15);
      doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - margin, pageHeight - 15, { align: 'right' });
      doc.text(`Page ${pageNum} of ${doc.getNumberOfPages()}`, pageWidth / 2, pageHeight - 15, { align: 'center' });
    };
    
    // Add footer to all pages
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      addFooterToPage(i);
    }
    
    // Convert to Buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    return pdfBuffer;
    
  } catch (error) {
    console.error('Error generating PDF with jsPDF:', error);
    throw error;
  }
}