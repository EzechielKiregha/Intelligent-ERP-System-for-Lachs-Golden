// app/api/reports/expense-report/route.ts
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
    if (!session?.user?.currentCompanyId) {
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
    
    // 5. Format data for PDF - CONVERTED TO NEW FORMAT
    const sections: ContentSection[] = [
      {
        title: 'Expense Report',
        type: 'keyValue',
        data: {
          'Total Expenses:': `$${totalExpenses.toFixed(2)}`,
          'Number of Expenses:': expenses.length.toString()
        }
      }
    ];
    
    // 6. Create category breakdown (with proper async handling)
    const expenseByCategory = expenses.reduce((acc, expense) => {
      const category = expense.categoryId || 'Uncategorized';
      acc[category] = (acc[category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);
    
    // Get category names synchronously in one query
    const categoryIds = Object.keys(expenseByCategory).filter(id => id !== 'Uncategorized');
    const categories = categoryIds.length > 0 
      ? await prisma.category.findMany({
          where: { id: { in: categoryIds } }
        })
      : [];
    
    const categoryMap = new Map(categories.map(c => [c.id, c.name]));
    
    const categoryRows = Object.entries(expenseByCategory).map(([categoryId, amount]) => {
      const categoryName = categoryId === 'Uncategorized' 
        ? 'Uncategorized' 
        : categoryMap.get(categoryId) || categoryId;
      return [categoryName, `$${amount.toFixed(2)}`];
    });
    
    sections.push({
      title: 'Expense Breakdown by Category',
      type: 'table',
      data: {
        headers: ['Category', 'Amount'],
        rows: categoryRows
      }
    });
    
    // 7. Create expense table
    const expenseRows = expenses.slice(0, 20).map(expense => {
      const categoryName = expense.categoryId 
        ? categoryMap.get(expense.categoryId) || 'Uncategorized'
        : 'Uncategorized';
      
      return [
        format(new Date(expense.date), 'MMM dd, yyyy'),
        expense.description || "No Description Found",
        categoryName,
        `$${expense.amount.toFixed(2)}`
      ];
    });
    
    sections.push({
      title: 'Recent Expenses',
      type: 'table',
      data: {
        headers: ['Date', 'Description', 'Category', 'Amount'],
        rows: expenseRows
      }
    });
    
    // 8. Generate PDF
    const pdfBuffer = await generateReportPdf(
      sections,
      'Lachs Golden - Expense Report',
      `Last 30 Days (${format(start, 'MMM dd')} to ${format(end, 'MMM dd')})`,
    );
    
    // 9. Return PDF response
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