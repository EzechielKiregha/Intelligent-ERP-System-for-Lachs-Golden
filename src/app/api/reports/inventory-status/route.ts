// app/api/reports/inventory-status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { Role } from '@/generated/prisma';
import { ContentSection, generateReportPdf } from '@/lib/pdf/puppeteerPdfGenerator';
import { format } from 'date-fns';

export async function POST(req: NextRequest) {
  try {
    // 1. Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user?.currentCompanyId ){
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const companyId = session.user.currentCompanyId;
    
    // 2. Fetch real data from database
    const products = await prisma.product.findMany({
      where: { companyId },
    });
    
    // 3. Calculate inventory metrics
    const totalItems = products.length;
    const inStock = products.filter(p => p.quantity > 0).length;
    const lowStock = products.filter(p => p.quantity <= (p.threshold || 10)).length;
    const outOfStock = products.filter(p => p.quantity === 0).length;
    
    const totalValue = products.reduce((sum, p) => sum + (p.unitPrice * p.quantity), 0);
    
    // 4. Format data for the new PDF generator
    
    // Prepare low stock items data
    const lowStockRows = products
      .filter(p => p.quantity <= (p.threshold || 10))
      .slice(0, 20)
      .map(p => [
        p.sku,
        p.name,
        p.quantity.toString(),
        (p.threshold || 10).toString()
      ]);
    
    // Group products by category
    const productsByCategory = products.reduce((acc, p) => {
      const category = "INVENTORY";
      if (!acc[category]) {
        acc[category] = {
          count: 0,
          value: 0,
          lowStock: 0
        };
      }
      acc[category].count++;
      acc[category].value += p.unitPrice * p.quantity;
      if (p.quantity <= (p.threshold || 10)) {
        acc[category].lowStock++;
      }
      return acc;
    }, {} as Record<string, { count: number; value: number; lowStock: number }>);
    
    // Prepare category data
    const categoryRows = await Promise.all(
      Object.entries(productsByCategory).map(async ([categoryId, data]) => {
        const categoryName = categoryId === 'Uncategorized' 
          ? 'Uncategorized' 
          : (await prisma.category.findUnique({ where: { id: categoryId } }))?.name || 'Uncategorized';
        
        return [
          categoryName,
          data.count.toString(),
          `$${data.value.toFixed(2)}`,
          data.lowStock.toString()
        ];
      })
    );
    
    // 7. Create sections for the new PDF generator
    const sections: ContentSection[] = [
      {
        title: 'Inventory Summary',
        type: 'keyValue',
        data: {
          'Total Items:': totalItems.toString(),
          'In Stock:': inStock.toString(),
          'Low Stock Items:': lowStock.toString(),
          'Out of Stock:': outOfStock.toString(),
          'Total Value:': `$${totalValue.toFixed(2)}`
        }
      },
      {
        title: 'Low Stock Items',
        type: 'table',
        data: {
          headers: ['SKU', 'Name', 'Current', 'Threshold'],
          rows: lowStockRows
        }
      },
      {
        title: 'Inventory by Category',
        type: 'table',
        data: {
          headers: ['Category', 'Items', 'Value', 'Low Stock'],
          rows: categoryRows
        }
      }
    ];
    
    // 8. Generate PDF with the new generator
    const pdfBuffer = await generateReportPdf(
      sections,
      'Lachs Golden - Inventory Status Report',
      'Current Status'
    );
    
    // 9. Return PDF response
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="inventory-status-${format(new Date(), 'yyyy-MM-dd')}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating inventory report:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}