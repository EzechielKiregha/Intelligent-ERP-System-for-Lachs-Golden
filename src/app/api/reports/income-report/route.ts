// app/api/reports/income-report/route.ts
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
    if (!session?.user?.currentCompanyId || 
        (session.user.role !== Role.ADMIN && session.user.role !== Role.SUPER_ADMIN)) {
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
    
    // 5. Format data for PDF
    const summaryContent = [
      { text: 'Income Report', style: 'subheader', margin: [0, 0, 0, 10] },
      {
        table: {
          widths: ['*', 'auto'],
          body: [
            ['Total Income:', `$${totalIncome.toFixed(2)}`],
            ['Number of Income Entries:', income.length.toString()]
          ]
        },
        layout: 'noBorders'
      }
    ];
    
    // 6. Create category breakdown
    const categoryBreakdown = [
      { text: 'Income Breakdown by Category', style: 'subheader', margin: [0, 20, 0, 10] },
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto'],
          body: [
            ['Category', 'Amount'],
            ...Object.entries(incomeByCategory).map(async ([category, amount]) => [
              category === 'Uncategorized' ? 'Uncategorized' : 
                (await prisma.category.findUnique({ where: { id: category } }))?.name || category,
              `$${amount.toFixed(2)}`
            ])
          ]
        }
      }
    ];
    
    // 7. Create income table
    const incomeTable = {
      text: 'Recent Income',
      style: 'subheader',
      margin: [0, 20, 0, 10]
    };
    
    const incomeBody = [
      ['Date', 'Description', 'Category', 'Amount']
    ];
    
    income.slice(0, 20).forEach(async (inc) => {
      const category = inc.categoryId ? 
        (await prisma.category.findUnique({ where: { id: inc.categoryId } }))?.name || 'Uncategorized' :
        'Uncategorized';
        
      incomeBody.push([
        format(new Date(inc.date), 'MMM dd'),
        inc.description || "No Description Found",
        category,
        `$${inc.amount.toFixed(2)}`
      ]);
    });
    
    // 8. Create PDF content
    const content = [
      summaryContent,
      categoryBreakdown,
      incomeTable,
      {
        table: {
          headerRows: 1,
          widths: ['auto', '*', 'auto', 'auto'],
          body: incomeBody
        }
      }
    ];
    
    // 9. Generate PDF
    const pdfBuffer = await generateSimplePdf(
      content,
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