// app/api/deals/[id]/route.ts
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
  contactId: z.string().min(1, 'Contact is required'),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {

  const id = (await params).id

  if (!id) return NextResponse.json({ error: 'Contact ID is missing' }, { status: 400 });

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.currentCompanyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const deal = await prisma.deal.findFirst({
      where: { 
        id,
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
      }
    });

    if (!deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    return NextResponse.json(deal);
  } catch (error) {
    console.error('Error fetching deal:', error);
    return NextResponse.json({ error: 'Failed to fetch deal' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.currentCompanyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = dealSchema.partial().parse(body);

    // Verify user has access to this deal
    const deal = await prisma.deal.findFirst({
      where: { 
        id: params.id,
        contact: { 
          company: { 
            users: { 
              some: { 
                id: session.user.id 
              } 
            } 
          } 
        } 
      }
    });

    if (!deal) {
      return NextResponse.json({ error: 'Deal not found or access denied' }, { status: 404 });
    }

    // Verify contact still belongs to company if changing contact
    if (validatedData.contactId) {
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
    }

    // Update deal
    const updatedDeal = await prisma.deal.update({
      where: { id: params.id },
       data: { ...validatedData },
    });

    return NextResponse.json(updatedDeal);
  } catch (error) {
    console.error('Error updating deal:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ error: 'Failed to update deal' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.currentCompanyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user has access to this deal
    const deal = await prisma.deal.findFirst({
      where: { 
        id: params.id,
        contact: { 
          company: { 
            users: { 
              some: { 
                id: session.user.id 
              } 
            } 
          } 
        } 
      }
    });

    if (!deal) {
      return NextResponse.json({ error: 'Deal not found or access denied' }, { status: 404 });
    }

    // Delete deal
    await prisma.deal.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Deal deleted successfully' });
  } catch (error) {
    console.error('Error deleting deal:', error);
    return NextResponse.json({ error: 'Failed to delete deal' }, { status: 500 });
  }
}