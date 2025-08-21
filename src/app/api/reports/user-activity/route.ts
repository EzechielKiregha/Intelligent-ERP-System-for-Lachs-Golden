// app/api/reports/user-activity/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { Role } from '@/generated/prisma';
import { format } from 'date-fns';
import { generateSimplePdf } from '@/lib/pdf/simplePdfGenerator';

export async function POST(req: NextRequest) {
  try {
    // 1. Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user?.currentCompanyId || 
        (session.user.role !== Role.ADMIN && session.user.role !== Role.SUPER_ADMIN)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const companyId = session.user.currentCompanyId;
    
    // 2. Get date range from request (simplified)
    const { startDate, endDate } = await req.json();
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    // 3. Fetch real data from database
    const activities = await prisma.auditLog.findMany({
      where: { 
        companyId,
        timestamp: { gte: start, lte: end }
      },
      orderBy: { timestamp: 'desc' },
      take: 100
    });
    
    // 4. Format data for PDF
    const tableBody = [
      ['Timestamp', 'Action', 'User', 'Entity'],
      ...activities.map(activity => [
        format(new Date(activity.timestamp), 'MMM dd, yyyy HH:mm'),
        activity.action,
        activity.userId ? 'System User' : 'System',
        activity.entity
      ])
    ];
    
    // 5. Create PDF content
    const content = [
      {
        text: 'User Activity Report',
        style: 'header'
      },
      {
        text: `Showing ${activities.length} activities from ${format(start, 'MMM dd, yyyy')} to ${format(end, 'MMM dd, yyyy')}`,
        margin: [0, 0, 0, 10]
      },
      {
        table: {
          headerRows: 1,
          widths: ['auto', '*', 'auto', 'auto'],
          body: tableBody
        }
      }
    ];
    
    // 6. Generate PDF
    const pdfBuffer = await generateSimplePdf(
      content,
      'Lachs Golden - User Activity Report',
      `${format(start, 'MMM dd')} to ${format(end, 'MMM dd, yyyy')}`
    );
    
    // 7. Return PDF response
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="user-activity-report-${format(new Date(), 'yyyy-MM-dd')}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating user activity report:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}