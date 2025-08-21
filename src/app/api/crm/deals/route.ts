// app/api/deals/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { DealStage } from '@/generated/prisma';

// Deal validation schema
const dealSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  amount: z.number().min(0, 'Amount must be positive'),
  stage: z.nativeEnum(DealStage).default('NEW'),
  expectedCloseDate: z.coerce.date(),
  contactId: z.string().min(1, 'Contact is required'),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.currentCompanyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const companyId = session.user.currentCompanyId;
    
    // Get all deals for the current company
    const deals = await prisma.deal.findMany({
      where: { 
        contact: { 
          company: { 
            users: { 
              some: { 
                id: session.user.id 
              } 
            } 
          } 
        } 
      },
      include: {
        contact: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(deals);
  } catch (error) {
    console.error('Error fetching deals:', error);
    return NextResponse.json({ error: 'Failed to fetch deals' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.currentCompanyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = dealSchema.parse(body);
    
    // Verify contact exists and belongs to company
    const contact = await prisma.contact.findFirst({
      where: { 
        id: validatedData.contactId,
        company: { 
          users: { 
            some: { 
              id: session.user.id 
            } 
          } 
        } 
      }
    });

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found or access denied' }, { status: 404 });
    }

    // Create deal
    const deal = await prisma.deal.create({
      data: {
        ...validatedData,
        ownerId: session.user.id,
      },
    });

    return NextResponse.json(deal, { status: 201 });
  } catch (error) {
    console.error('Error creating deal:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ error: 'Failed to create deal' }, { status: 500 });
  }
}