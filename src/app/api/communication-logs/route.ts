// app/api/communication-logs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

// Communication log validation schema
const communicationLogSchema = z.object({
  type: z.string().min(1, 'Type is required'),
  direction: z.string().min(1, 'Direction is required'),
  message: z.string().optional(),
  timestamp: z.string().optional(),
  contactId: z.string().min(1, 'Contact is required'),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.currentCompanyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const contactId = searchParams.get('contactId');

    // Get communication logs
    const logs = await prisma.communicationLog.findMany({
      where: contactId 
        ? { 
            contactId,
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
        : { 
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
            fullName: true
          }
        }
      },
      orderBy: { timestamp: 'desc' }
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching communication logs:', error);
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.currentCompanyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = communicationLogSchema.parse(body);
    
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

    // Create communication log
    const log = await prisma.communicationLog.create({
      data: {
        ...validatedData,
        timestamp: validatedData.timestamp ? new Date(validatedData.timestamp) : new Date(),
      },
    });

    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    console.error('Error creating communication log:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ error: 'Failed to create log' }, { status: 500 });
  }
}