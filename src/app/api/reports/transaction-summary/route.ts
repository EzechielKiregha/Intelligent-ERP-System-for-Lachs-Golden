// app/api/reports/transaction-summary/route.ts
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
    const transactions = await prisma.transaction.findMany({
      where: {
        companyId,
        date: { gte: start, lte: end }
      }
    });
    
    // 4. Calculate summary metrics
    const totalTransactions = transactions.length;
    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
    const averageAmount = totalTransactions > 0 ? totalAmount / totalTransactions : 0;
    
    // 5. Format data for PDF
    const summaryContent = [
      { text: 'Transaction Summary', style: 'subheader', margin: [0, 0, 0, 10] },
      {
        table: {
          widths: ['*', 'auto'],
          body: [
            ['Total Transactions:', totalTransactions.toString()],
            ['Total Amount:', `$${totalAmount.toFixed(2)}`],
            ['Average Amount:', `$${averageAmount.toFixed(2)}`]
          ]
        },
        layout: 'noBorders'
      }
    ];
    
    // 6. Create transaction table
    const transactionTable = {
      text: 'Recent Transactions',
      style: 'subheader',
      margin: [0, 20, 0, 10]
    };
    
    const transactionBody = [
      ['Date', 'Description', 'Type', 'Amount']
    ];
    
    transactions.slice(0, 20).forEach(t => {
      transactionBody.push([
        format(new Date(t.date), 'MMM dd'),
        t.description || "No Description Found",
        t.type,
        `$${t.amount.toFixed(2)}`
      ]);
    });
    
    // 7. Create PDF content
    const content = [
      summaryContent,
      transactionTable,
      {
        table: {
          headerRows: 1,
          widths: ['auto', '*', 'auto', 'auto'],
          body: transactionBody
        }
      }
    ];
    
    // 8. Generate PDF
    const pdfBuffer = await generateSimplePdf(
      content,
      'Lachs Golden - Transaction Summary Report',
      `Last 30 Days (${format(start, 'MMM dd')} to ${format(end, 'MMM dd')})`
    );
    
    // 9. Return PDF response
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