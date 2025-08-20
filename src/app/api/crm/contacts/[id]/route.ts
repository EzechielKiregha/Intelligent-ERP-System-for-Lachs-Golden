// app/api/contacts/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

// Contact validation schema
const contactSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  companyName: z.string().optional(),
  jobTitle: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {

  const id = (await params).id

  if (!id) return NextResponse.json({ error: 'Contact ID is missing' }, { status: 400 });

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.currentCompanyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contact = await prisma.contact.findUnique({
      where: { 
        id,
        company: { 
          users: { 
            some: { 
              id: session.user.id 
            } 
          } 
        } 
      },
      include: {
        company: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    return NextResponse.json(contact);
  } catch (error) {
    console.error('Error fetching contact:', error);
    return NextResponse.json({ error: 'Failed to fetch contact' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.currentCompanyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = contactSchema.parse(body);

    // Verify user has access to this contact
    const contact = await prisma.contact.findFirst({
      where: { 
        id: params.id,
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

    // Update contact
    const updatedContact = await prisma.contact.update({
      where: { id: params.id },
      data: validatedData,
    });

    return NextResponse.json(updatedContact);
  } catch (error) {
    console.error('Error updating contact:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ error: 'Failed to update contact' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.currentCompanyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user has access to this contact
    const contact = await prisma.contact.findFirst({
      where: { 
        id: params.id,
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

    // Delete contact
    await prisma.contact.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact:', error);
    return NextResponse.json({ error: 'Failed to delete contact' }, { status: 500 });
  }
}