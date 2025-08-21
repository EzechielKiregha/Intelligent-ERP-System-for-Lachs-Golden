// app/api/reports/inventory-status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { Role } from '@/generated/prisma';
import { generateSimplePdf } from '@/lib/pdf/simplePdfGenerator';
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
    
    // 4. Format data for PDF
    const summaryContent = [
      { text: 'Inventory Status Report', style: 'subheader', margin: [0, 0, 0, 10] },
      {
        table: {
          widths: ['*', 'auto'],
          body: [
            ['Total Items:', totalItems.toString()],
            ['In Stock:', inStock.toString()],
            ['Low Stock Items:', lowStock.toString()],
            ['Out of Stock:', outOfStock.toString()],
            ['Total Value:', `$${totalValue.toFixed(2)}`]
          ]
        },
        layout: 'noBorders'
      }
    ];
    
    // 5. Create low stock items table
    const lowStockTable = {
      text: 'Low Stock Items',
      style: 'subheader',
      margin: [0, 20, 0, 10]
    };
    
    const lowStockBody = [
      ['SKU', 'Name', 'Current', 'Threshold']
    ];
    
    products
      .filter(p => p.quantity <= (p.threshold || 10))
      .slice(0, 20)
      .forEach(p => {
        lowStockBody.push([
          p.sku,
          p.name,
          p.quantity.toString(),
          (p.threshold || 10).toString()
        ]);
      });
    
    // 6. Create inventory by category table
    const categoryTable = {
      text: 'Inventory by Category',
      style: 'subheader',
      margin: [0, 20, 0, 10]
    };
    
    // Group products by category
    const productsByCategory = products.reduce((acc, p) => {
      const category = "INVENTORY" ;
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
    
    const categoryBody = [
      ['Category', 'Items', 'Value', 'Low Stock']
    ];
    
    for (const [categoryId, data] of Object.entries(productsByCategory)) {
      const category = categoryId === 'Uncategorized' ? 
        'Uncategorized' : 
        (await prisma.category.findUnique({ where: { id: categoryId } }))?.name || 'Uncategorized';
        
      categoryBody.push([
        category,
        data.count.toString(),
        `$${data.value.toFixed(2)}`,
        data.lowStock.toString()
      ]);
    }
    
    // 7. Create PDF content
    const content = [
      summaryContent,
      lowStockTable,
      {
        table: {
          headerRows: 1,
          widths: ['auto', '*', 'auto', 'auto'],
          body: lowStockBody
        }
      },
      categoryTable,
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto', 'auto'],
          body: categoryBody
        }
      }
    ];
    
    // 8. Generate PDF
    const pdfBuffer = await generateSimplePdf(
      content,
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