import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { ContentSection, generateReportPdf } from '@/lib/pdf/puppeteerPdfGenerator';
import { format } from 'date-fns';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.currentCompanyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const companyId = session.user.currentCompanyId;
    
    // Date range
    const end = new Date();
    const start = new Date(end);
    start.setMonth(end.getMonth() - 1);
    
    // Fetch transactions
    const transactions = await prisma.transaction.findMany({
      where: {
        companyId,
        date: { gte: start, lte: end }
      },
      orderBy: { date: 'desc' }
    });
    
    // Calculate metrics
    const totalTransactions = transactions.length;
    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
    const averageAmount = totalTransactions > 0 ? totalAmount / totalTransactions : 0;
    
    // Transaction rows for table
    const transactionRows = transactions.slice(0, 20).map(t => [
      format(new Date(t.date), 'MMM dd, yyyy'),
      t.description || 'No Description',
      t.type,
      `$${t.amount.toFixed(2)}`
    ]);
    
    const sections: ContentSection[] = [
      {
        title: 'Transaction Summary',
        type: 'keyValue',
        data: {
          'Total Transactions:': totalTransactions.toString(),
          'Total Amount:': `$${totalAmount.toFixed(2)}`,
          'Average Amount:': `$${averageAmount.toFixed(2)}`
        }
      },
      {
        title: 'Recent Transactions',
        type: 'table',
        data: {
          headers: ['Date', 'Description', 'Type', 'Amount'],
          rows: transactionRows
        }
      }
    ];
    
    const pdfBuffer = await generateReportPdf(
      sections,
      'Lachs Golden - Transaction Summary Report',
      `Last 30 Days (${format(start, 'MMM dd')} to ${format(end, 'MMM dd')})`,
    );
    
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="transaction-summary-${format(new Date(), 'yyyy-MM-dd')}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating transaction summary report:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}
