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
    
    // Get date range from request
    const body = await req.json().catch(() => ({}));
    const { startDate, endDate } = body;
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    // Fetch audit logs
    const activities = await prisma.auditLog.findMany({
      where: { 
        companyId,
        timestamp: { gte: start, lte: end }
      },
      orderBy: { timestamp: 'desc' },
      take: 100
    });
    
    // Activity summary
    const totalActivities = activities.length;
    const actionCounts = activities.reduce((acc, activity) => {
      acc[activity.action ? activity.action : 0] = (acc[activity.action ? activity.action : 0] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topActions = Object.entries(actionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
    
    // Activity rows for table
    const activityRows = activities.slice(0, 50).map(activity => [
      format(new Date(activity.timestamp), 'MMM dd, HH:mm'),
      activity.action || "No Action",
      activity.userId || 'System',
      activity.entity || "System"
    ]);
    
    const sections: ContentSection[] = [
      {
        title: 'Activity Summary',
        type: 'keyValue',
        data: {
          'Total Activities:': totalActivities.toString(),
          'Date Range:': `${format(start, 'MMM dd')} to ${format(end, 'MMM dd')}`,
          'Most Common Action:': topActions[0] ? `${topActions[0][0]} (${topActions[0][1]})` : 'None'
        }
      },
      {
        title: 'Top Actions',
        type: 'table',
        data: {
          headers: ['Action', 'Count'],
          rows: topActions.map(([action, count]) => [action, count.toString()])
        }
      },
      {
        title: 'Recent Activity',
        type: 'table',
        data: {
          headers: ['Time', 'Action', 'User', 'Entity'],
          rows: activityRows
        }
      }
    ];
    
    const pdfBuffer = await generateReportPdf(
      sections,
      'Lachs Golden - User Activity Report',
      `${format(start, 'MMM dd')} to ${format(end, 'MMM dd, yyyy')}`,
    );
    
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="user-activity-${format(new Date(), 'yyyy-MM-dd')}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating user activity report:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}