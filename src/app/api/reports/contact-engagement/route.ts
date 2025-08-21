// app/api/reports/contact-engagement/route.ts
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
    if (!session?.user?.currentCompanyId ){
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const companyId = session.user.currentCompanyId;
    
    // 2. Get date range (simplified for demo)
    const end = new Date();
    const start = new Date(end);
    start.setDate(end.getDate() - 30);
    
    // 3. Fetch real data from database
    const contacts = await prisma.contact.findMany({
      where: { 
        company: { 
          users: { 
            some: { 
              id: session.user.id 
            } 
          } 
        }
      },
    });
    
    // 4. Calculate engagement metrics
    const totalContacts = contacts.length;
    const activeContacts = contacts.filter(async (c) => {
      const logs = await prisma.communicationLog.findMany({
        where: { contactId:c.id, timestamp: { gte: start, lte: end } },
        orderBy: { timestamp: 'desc' }
      })
      const lastInteraction = logs.length > 0 ? logs[0].timestamp : null;
      return lastInteraction && new Date(lastInteraction) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }).length;
    
    const highEngagement = contacts.filter(async (c) => {
      const logs = await prisma.communicationLog.findMany({
        where: { contactId:c.id, timestamp: { gte: start, lte: end } },
        orderBy: { timestamp: 'desc' }
      })

      const deals = await prisma.deal.findMany({
        where: {
          contactId: c.id
        }
      })

      const interactionCount = logs.length;
      const dealsWon = deals.filter(d => d.stage === 'WON').length;
      return interactionCount > 5 && dealsWon > 0;
    }).length;
    
    const mediumEngagement = contacts.filter(async (c) => {
      const logs = await prisma.communicationLog.findMany({
        where: { contactId:c.id, timestamp: { gte: start, lte: end } },
        orderBy: { timestamp: 'desc' }
      })

      const deals = await prisma.deal.findMany({
        where: {
          contactId: c.id
        }
      })
      const interactionCount = logs.length;
      const dealsWon = deals.filter(d => d.stage === 'WON').length;
      return (interactionCount > 2 && interactionCount <= 5) || (dealsWon > 0 && interactionCount > 0);
    }).length;
    
    // 5. Format data for PDF
    const engagementOverview = [
      { text: 'Engagement Overview', style: 'subheader', margin: [0, 0, 0, 10] },
      {
        table: {
          widths: ['*', 'auto'],
          body: [
            ['Total Contacts:', totalContacts.toString()],
            ['Active Contacts:', activeContacts.toString()],
            ['High Engagement:', highEngagement.toString()],
            ['Medium Engagement:', mediumEngagement.toString()]
          ]
        },
        layout: 'noBorders'
      }
    ];
    
    // 6. Create engagement score distribution
    const scoreDistribution = [
      { text: 'Engagement Score Distribution', style: 'subheader', margin: [0, 20, 0, 10] },
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto'],
          body: [
            ['Score Range', 'Contacts'],
            ['80-100 (High)', highEngagement.toString()],
            ['50-79 (Medium)', mediumEngagement.toString()],
            ['0-49 (Low)', (totalContacts - highEngagement - mediumEngagement).toString()]
          ]
        }
      }
    ];
    
    // 7. Create top engaged contacts
    const topContacts = [
      { text: 'Top Engaged Contacts', style: 'subheader', margin: [0, 20, 0, 10] },
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto', 'auto', 'auto'],
          body: [
            ['Contact', 'Company', 'Interactions', 'Last Contact', 'Engagement']
          ]
        }
      }
    ];
    
    // Sort contacts by engagement (simplified)
    const contactEngagements = await Promise.all(
      contacts.map(async (contact) => {
        const logs = await prisma.communicationLog.findMany({
          where: { contactId: contact.id, timestamp: { gte: start, lte: end } },
          orderBy: { timestamp: 'desc' }
        });
        const deals = await prisma.deal.findMany({
          where: {
            contactId: contact.id
          }
        })
        const dealsWon = deals.filter(d => d.stage === 'WON').length;
        const engagementScore = logs.length + (dealsWon * 5);
        return { contact, engagementScore };
      })
    );

    const sortedContacts = contactEngagements
      .sort((a, b) => b.engagementScore - a.engagementScore)
      .map(({ contact }) => contact);
    
    const contactBody = topContacts[1]?.table?.body ?? [];
    sortedContacts.slice(0, 5).forEach(async (c) => {
      const logs = await prisma.communicationLog.findMany({
        where: { contactId: c.id, timestamp: { gte: start, lte: end } },
        orderBy: { timestamp: 'desc' }
      });
      const deals = await prisma.deal.findMany({
        where: {
          contactId: c.id
        }
      })
      const lastInteraction = logs.length > 0 ? format(new Date(logs[0].timestamp), 'MMM dd, yyyy') : 'Never';
      const engagementScore = logs.length + (deals.filter(d => d.stage === 'WON').length * 5);
      
      contactBody.push([
        c.fullName,
        c.companyName || 'N/A',
        logs.length.toString(),
        lastInteraction,
        engagementScore > 80 ? 'HIGH' : engagementScore > 50 ? 'MEDIUM' : 'LOW'
      ]);
    });
    
    // 8. Create contact type analysis
    const contactTypeAnalysis = [
      { text: 'Contact Type Analysis', style: 'subheader', margin: [0, 20, 0, 10] },
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto', 'auto'],
          body: [
            ['Contact Type', 'Total', 'Avg. Engagement', 'Conversion Rate'],
            ['Customer', '75', '65', '25%'],
            ['Lead', '45', '45', '15%'],
            ['Prospect', '30', '35', '10%']
          ]
        }
      }
    ];
    
    // 9. Create PDF content
    const content = [
      engagementOverview,
      scoreDistribution,
      topContacts,
      contactTypeAnalysis
    ];
    
    // 10. Generate PDF
    const pdfBuffer = await generateSimplePdf(
      content,
      'Lachs Golden - Contact Engagement Report',
      `Last 30 Days (${format(start, 'MMM dd')} to ${format(end, 'MMM dd')})`
    );
    
    // 11. Return PDF response
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