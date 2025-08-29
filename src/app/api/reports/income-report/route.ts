// app/api/reports/income-report/route.ts
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
    
    // 2. Get date range (simplified for demo)
    const end = new Date();
    const start = new Date(end);
    start.setMonth(end.getMonth() - 1);
    
    // 3. Fetch real data from database
    const income = await prisma.transaction.findMany({
      where: {
        companyId,
        date: { gte: start, lte: end },
        category: { type: 'INCOME' }
      }
    });
    
    // 4. Calculate income metrics
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const incomeByCategory = income.reduce((acc, inc) => {
      const category = inc.categoryId || 'Uncategorized';
      acc[category] = (acc[category] || 0) + inc.amount;
      return acc;
    }, {} as Record<string, number>);
    
    // 5. Format data for the new PDF generator
    
    // Prepare category data
    const categoryRows = await Promise.all(
      Object.entries(incomeByCategory).map(async ([categoryId, amount]) => {
        const categoryName = categoryId === 'Uncategorized' 
          ? 'Uncategorized' 
          : (await prisma.category.findUnique({ where: { id: categoryId } }))?.name || categoryId;
        
        return [categoryName, `$${amount.toFixed(2)}`];
      })
    );
    
    // Prepare income transaction data
    const incomeRows = await Promise.all(
      income.slice(0, 20).map(async (inc) => {
        const categoryName = inc.categoryId 
          ? (await prisma.category.findUnique({ where: { id: inc.categoryId } }))?.name || 'Uncategorized'
          : 'Uncategorized';
          
        return [
          format(new Date(inc.date), 'MMM dd, yyyy'),
          inc.description || "No Description Found",
          categoryName,
          `$${inc.amount.toFixed(2)}`
        ];
      })
    );
    
    // 8. Create sections for the new PDF generator
    const sections: ContentSection[] = [
      {
        title: 'Income Summary',
        type: 'keyValue',
        data: {
          'Total Income:': `$${totalIncome.toFixed(2)}`,
          'Number of Income Entries:': income.length.toString()
        }
      },
      {
        title: 'Income Breakdown by Category',
        type: 'table',
        data: {
          headers: ['Category', 'Amount'],
          rows: categoryRows
        }
      },
      {
        title: 'Recent Income Transactions',
        type: 'table',
        data: {
          headers: ['Date', 'Description', 'Category', 'Amount'],
          rows: incomeRows
        }
      }
    ];
    
    // 9. Generate PDF with the new generator
    const pdfBuffer = await generateReportPdf(
      sections,
      'Lachs Golden - Income Report',
      `Last 30 Days (${format(start, 'MMM dd')} to ${format(end, 'MMM dd')})`
    );
    
    // 10. Return PDF response
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="income-report-${format(new Date(), 'yyyy-MM-dd')}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating income report:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}