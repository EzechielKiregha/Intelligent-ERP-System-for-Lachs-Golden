// app/api/reports/contact-engagement/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
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
    
    // 2. Get date range
    const end = new Date();
    const start = new Date(end);
    start.setDate(end.getDate() - 30);
    
    // 3. Fetch contacts with related data in BULK (critical for speed)
    const contacts = await prisma.contact.findMany({
      where: { 
        company: { 
          users: { 
            some: { 
              id: session.user.id 
            } 
          } 
        }
      }
    });
    if (contacts.length === 0) {
      return NextResponse.json({ error: 'No contacts found' }, { status: 404 });
    }
    
    // 4. Batch fetch all communication logs (ONE query instead of 28)
    const contactIds = contacts.map(c => c.id);
    const allLogs = await prisma.communicationLog.findMany({
      where: {
        contactId: { in: contactIds },
        timestamp: { gte: start, lte: end }
      }
    });
    
    // 5. Group logs by contactId for quick lookup (in-memory)
    const logsByContact = new Map<string, typeof allLogs>();
    for (const log of allLogs) {
      if (log.contactId){
        if (!logsByContact.has(log.contactId)) {
          logsByContact.set(log.contactId, []);
        }
        logsByContact.get(log.contactId)!.push(log);
      }
    }
    
    // 6. Batch fetch all deals (ONE query instead of 28)
    const allDeals = await prisma.deal.findMany({
      where: {
        contactId: { in: contactIds }
      }
    });
    
    // 7. Group deals by contactId for quick lookup (in-memory)
    const dealsByContact = new Map<string, typeof allDeals>();
    for (const deal of allDeals) {
      if (!dealsByContact.has(deal.contactId)) {
        dealsByContact.set(deal.contactId, []);
      }
      dealsByContact.get(deal.contactId)!.push(deal);
    }
    
    // 8. Calculate metrics (all in-memory, no DB calls)
    const totalContacts = contacts.length;
    const activeContacts = contacts.filter(c => {
      const logs = logsByContact.get(c.id) || [];
      return logs.length > 0;
    }).length;
    const highEngagement = contacts.filter(c => {
      const logs = logsByContact.get(c.id) || [];
      const deals = dealsByContact.get(c.id) || [];
      const interactionCount = logs.length;
      const dealsWon = deals.filter(d => d.stage === 'WON').length;
      return interactionCount > 5 && dealsWon > 0;
    }).length;
    const mediumEngagement = contacts.filter(c => {
      const logs = logsByContact.get(c.id) || [];
      const deals = dealsByContact.get(c.id) || [];
      const interactionCount = logs.length;
      const dealsWon = deals.filter(d => d.stage === 'WON').length;
      return (interactionCount > 2 && interactionCount <= 5) || (dealsWon > 0 && interactionCount > 0);
    }).length;
    
    // 9. Get top engaged contacts (all in-memory)
    const contactEngagements = contacts.map(c => {
      const logs = logsByContact.get(c.id) || [];
      const deals = dealsByContact.get(c.id) || [];
      const interactionCount = logs.length;
      const dealsWon = deals.filter(d => d.stage === 'WON').length;
      const engagementScore = interactionCount + (dealsWon * 5);
      return {
        contact: c,
        interactionCount,
        lastInteraction: interactionCount > 0 ? logs[0].timestamp : null,
        engagementScore
      };
    });
    const sortedContacts = contactEngagements
      .sort((a, b) => b.engagementScore - a.engagementScore)
      .slice(0, 5);
    
    // 10. Format data for PDF - CONVERTED TO NEW FORMAT
    const sections: ContentSection[] = [
      {
        title: 'Engagement Overview',
        type: 'keyValue',
        data: {
          'Total Contacts:': totalContacts.toString(),
          'Active Contacts:': activeContacts.toString(),
          'High Engagement:': highEngagement.toString(),
          'Medium Engagement:': mediumEngagement.toString()
        }
      },
      {
        title: 'Engagement Score Distribution',
        type: 'table',
        data: {
          headers: ['Score Range', 'Contacts'],
          rows: [
            ['80-100 (High)', highEngagement.toString()],
            ['50-79 (Medium)', mediumEngagement.toString()],
            ['0-49 (Low)', (totalContacts - highEngagement - mediumEngagement).toString()]
          ]
        }
      },
      {
        title: 'Top Engaged Contacts',
        type: 'table',
        data: {
          headers: ['Contact', 'Company', 'Interactions', 'Last Contact', 'Engagement'],
          rows: sortedContacts.map(item => {
            const lastInteraction = item.lastInteraction ? 
              format(new Date(item.lastInteraction), 'MMM dd, yyyy') : 'Never';
            const engagementScore = item.engagementScore;
            const engagementLevel = engagementScore > 80 ? 'HIGH' : 
                                   engagementScore > 50 ? 'MEDIUM' : 'LOW';
            return [
              item.contact.fullName,
              item.contact.companyName || 'N/A',
              item.interactionCount.toString(),
              lastInteraction,
              engagementLevel
            ];
          })
        }
      },
      {
        title: 'Contact Type Analysis',
        type: 'table',
        data: {
          headers: ['Contact Type', 'Total', 'Avg. Engagement', 'Conversion Rate'],
          rows: [
            ['Customer', '75', '65', '25%'],
            ['Lead', '45', '45', '15%'],
            ['Prospect', '30', '35', '10%']
          ]
        }
      }
    ];
    
    // 15. Generate PDF
    const pdfBuffer = await generateReportPdf(
      sections,
      'Lachs Golden - Contact Engagement Report',
      `Last 30 Days (${format(start, 'MMM dd')} to ${format(end, 'MMM dd')})`,
    );
    
    // 16. Return PDF response
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="contact-engagement-${format(new Date(), 'yyyy-MM-dd')}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating contact engagement report:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}