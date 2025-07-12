import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { Role } from '@/generated/prisma';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.currentCompanyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const company = await prisma.company.findUnique({
      where: { id: session.user.currentCompanyId },
      select: {
        id: true,
        name: true,
        contactEmail: true,
        addressLine1: true,
        city: true,
        state: true,
        postalCode: true,
        country: true,
      },
    });

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    return NextResponse.json(company);
  } catch (err) {
    console.error('Error fetching company settings:', err);
    return NextResponse.json({ error: 'Failed to load company settings' }, { status: 500 });
  }
}

const updateCompanySchema = z.object({
  name: z.string().min(1, 'Company name is required').optional(),
  contactEmail: z.string().email('Invalid email').optional(),
  addressLine1: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
});

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.currentCompanyId || ![Role.ADMIN, Role.OWNER].includes(session.user.role as "ADMIN" | "OWNER")) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, contactEmail, addressLine1, city, state, postalCode, country } = updateCompanySchema.parse(body);

    const updateData: any = {};
    if (name) updateData.name = name;
    if (contactEmail) updateData.contactEmail = contactEmail;
    if (addressLine1) updateData.addressLine1 = addressLine1;
    if (city) updateData.city = city;
    if (state) updateData.state = state;
    if (postalCode) updateData.postalCode = postalCode;
    if (country) updateData.country = country;

    await prisma.company.update({
      where: { id: session.user.currentCompanyId },
      data: updateData,
    });

    await prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entity: 'Company',
        entityId: session.user.currentCompanyId,
        userId: session.user.id,
        companyId: session.user.currentCompanyId,
        description: 'Updated company settings',
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error updating company settings:', err);
    return NextResponse.json({ error: 'Failed to update company settings' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.currentCompanyId || session.user.role !== Role.OWNER) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { companyId } = await req.json();
    if (companyId !== session.user.currentCompanyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.$transaction([
      prisma.user.deleteMany({ where: { companyId } }),
      prisma.employee.deleteMany({ where: { companyId } }),
      prisma.company.delete({ where: { id: companyId } }),
    ]);

    await prisma.auditLog.create({
      data: {
        action: 'DELETE',
        entity: 'Company',
        entityId: companyId,
        userId: session.user.id,
        companyId: companyId,
        description: 'Deleted company',
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error deleting company:', err);
    return NextResponse.json({ error: 'Failed to delete company' }, { status: 500 });
  }
}