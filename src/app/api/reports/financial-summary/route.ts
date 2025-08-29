// app/api/reports/financial-summary/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { Role } from '@/generated/prisma';
import { generateReportPdf, ContentSection } from '@/lib/pdf/pdfGenerator';
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
    const transactions = await prisma.transaction.findMany({
      where: {
        companyId,
        date: { gte: start, lte: end }
      },
      include: {
        category: true
      }
    });
    
    // 4. Calculate financial metrics
    const totalRevenue = transactions
      .filter(t => t.category.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions
      .filter(t => t.category.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);
    const netProfit = totalRevenue - totalExpenses;
    
    // 5. Format data for PDF - CONVERTED TO NEW FORMAT
    const sections: ContentSection[] = [
      {
        title: 'Financial Summary',
        type: 'keyValue',
        data: {
          'Total Revenue:': `$${totalRevenue.toFixed(2)}`,
          'Total Expenses:': `$${totalExpenses.toFixed(2)}`,
          'Net Profit:': `$${netProfit.toFixed(2)}`
        }
      },
      {
        title: 'Recent Transactions',
        type: 'table',
        data: {
          headers: ['Date', 'Description', 'Type', 'Amount'],
          rows: transactions.slice(0, 20).map(t => [
            format(new Date(t.date), 'MMM dd, yyyy'),
            t.description || "No Description Found",
            t.type,
            `$${t.amount.toFixed(2)}`
          ])
        }
      }
    ];
    
    // 8. Generate PDF
    const pdfBuffer = await generateReportPdf(
      sections,
      'Lachs Golden - Financial Summary Report',
      `Last 30 Days (${format(start, 'MMM dd')} to ${format(end, 'MMM dd')})`,
    );
    
    // 9. Return PDF response
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="financial-summary-${format(new Date(), 'yyyy-MM-dd')}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating financial report:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}