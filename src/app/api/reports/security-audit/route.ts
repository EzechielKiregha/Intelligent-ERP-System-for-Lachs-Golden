// app/api/reports/security-audit/route.ts
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
    start.setDate(end.getDate() - 7);
    
    // 3. Fetch real data from database
    const logs = await prisma.auditLog.findMany({
      where: {
        companyId,
        timestamp: { gte: start, lte: end }
      },
      orderBy: { timestamp: 'desc' },
      take: 100
    });
    
    // 4. Calculate security metrics
    const totalEvents = logs.length;
    const criticalEvents = logs.filter(l => l.severity === 'CRITICAL').length;
    const highSeverity = logs.filter(l => l.severity === 'HIGH').length;
    const mediumSeverity = logs.filter(l => l.severity === 'MEDIUM').length;
    
    // 5. Format data for PDF
    const summaryContent = [
      { text: 'Security Audit Report', style: 'subheader', margin: [0, 0, 0, 10] },
      {
        table: {
          widths: ['*', 'auto'],
          body: [
            ['Total Events:', totalEvents.toString()],
            ['Critical Events:', criticalEvents.toString()],
            ['High Severity:', highSeverity.toString()],
            ['Medium Severity:', mediumSeverity.toString()]
          ]
        },
        layout: 'noBorders'
      }
    ];
    
    // 6. Create user activity breakdown
    const userActivity = [
      { text: 'User Activity', style: 'subheader', margin: [0, 20, 0, 10] },
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto'],
          body: [
            ['User', 'Events'],
            ...logs.reduce((acc, log) => {
              const userId = log.userId || 'System';
              const existing = acc.find(item => item[0] === userId);
              if (existing) {
                existing[1] = (parseInt(existing[1]) + 1).toString();
              } else {
                acc.push([userId, '1']);
              }
              return acc;
            }, [] as string[][])
          ]
        }
      }
    ];
    
    // 7. Create security events table
    const eventsTable = {
      text: 'Security Events',
      style: 'subheader',
      margin: [0, 20, 0, 10]
    };
    
    const eventsBody = [
      ['Time', 'Action', 'User', 'Severity']
    ];
    
    logs.slice(0, 20).forEach(log => {
      eventsBody.push([
        format(new Date(log.timestamp), 'HH:mm'),
        log.action || "No Action Record",
        log.userId ? 'User' : 'System',
        log.severity
      ]);
    });
    
    // 8. Create critical events section
    const criticalEventsSection = [
      { text: 'Critical Security Events', style: 'subheader', margin: [0, 20, 0, 10] },
      {
        table: {
          headerRows: 1,
          widths: ['auto', '*', 'auto', 'auto'],
          body: [
            ['Time', 'Action', 'User', 'IP Address'],
            ...logs
              .filter(log => log.severity === 'CRITICAL')
              .slice(0, 10)
              .map(log => [
                format(new Date(log.timestamp), 'HH:mm'),
                log.action,
                log.userId ? 'User' : 'System',
                log.ip || 'N/A'
              ])
          ]
        }
      }
    ];
    
    // 9. Create PDF content
    const content = [
      summaryContent,
      userActivity,
      eventsTable,
      {
        table: {
          headerRows: 1,
          widths: ['auto', '*', 'auto', 'auto'],
          body: eventsBody
        }
      },
      criticalEventsSection
    ];
    
    // 10. Generate PDF
    const pdfBuffer = await generateSimplePdf(
      content,
      'Lachs Golden - Security Audit Report',
      `Last 7 Days (${format(start, 'MMM dd')} to ${format(end, 'MMM dd')})`
    );
    
    // 11. Return PDF response
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="security-audit-${format(new Date(), 'yyyy-MM-dd')}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating security audit report:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}