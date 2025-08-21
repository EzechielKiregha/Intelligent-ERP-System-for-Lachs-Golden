// app/api/reports/expense-report/route.ts
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
    const expenses = await prisma.transaction.findMany({
      where: {
        companyId,
        date: { gte: start, lte: end },
        category: { type: 'EXPENSE' }
      }
    });
    
    // 4. Calculate expense metrics
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    const expenseByCategory = expenses.reduce((acc, expense) => {
      const category = expense.categoryId || 'Uncategorized';
      acc[category] = (acc[category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);
    
    // 5. Format data for PDF
    const summaryContent = [
      { text: 'Expense Report', style: 'subheader', margin: [0, 0, 0, 10] },
      {
        table: {
          widths: ['*', 'auto'],
          body: [
            ['Total Expenses:', `$${totalExpenses.toFixed(2)}`],
            ['Number of Expenses:', expenses.length.toString()]
          ]
        },
        layout: 'noBorders'
      }
    ];
    
    // 6. Create category breakdown
    const categoryBreakdown = [
      { text: 'Expense Breakdown by Category', style: 'subheader', margin: [0, 20, 0, 10] },
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto'],
          body: [
            ['Category', 'Amount'],
            ...Object.entries(expenseByCategory).map(async ([category, amount]) => [
              category === 'Uncategorized' ? 'Uncategorized' : 
                (await prisma.category.findUnique({ where: { id: category } }))?.name || category,
              `$${amount.toFixed(2)}`
            ])
          ]
        }
      }
    ];
    
    // 7. Create expense table
    const expenseTable = {
      text: 'Recent Expenses',
      style: 'subheader',
      margin: [0, 20, 0, 10]
    };
    
    const expenseBody = [
      ['Date', 'Description', 'Category', 'Amount']
    ];
    
    expenses.slice(0, 20).forEach(async (expense) => {
      const category = expense.categoryId ? 
        (await prisma.category.findUnique({ where: { id: expense.categoryId } }))?.name || 'Uncategorized' :
        'Uncategorized';
        
      expenseBody.push([
        format(new Date(expense.date), 'MMM dd'),
        expense.description || "No Description Found",
        category,
        `$${expense.amount.toFixed(2)}`
      ]);
    });
    
    // 8. Create PDF content
    const content = [
      summaryContent,
      categoryBreakdown,
      expenseTable,
      {
        table: {
          headerRows: 1,
          widths: ['auto', '*', 'auto', 'auto'],
          body: expenseBody
        }
      }
    ];
    
    // 9. Generate PDF
    const pdfBuffer = await generateSimplePdf(
      content,
      'Lachs Golden - Expense Report',
      `Last 30 Days (${format(start, 'MMM dd')} to ${format(end, 'MMM dd')})`
    );
    
    // 10. Return PDF response
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="expense-report-${format(new Date(), 'yyyy-MM-dd')}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating expense report:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}