// app/api/settings/user/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { hash } from 'bcryptjs';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.currentCompanyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        employee: {
          select: {
            id: true,
            jobTitle: true,
            department: { select: { name: true } },
            hireDate: true,
          },
        },
        company: {
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
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (err) {
    console.error('Error fetching user settings:', err);
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 });
  }
}

const updateUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  email: z.string().email('Invalid email').optional(),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  jobTitle: z.string().optional(),
  departmentId: z.string().optional(),
});

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { firstName, lastName, email, password, jobTitle, departmentId } = updateUserSchema.parse(body);

    const updateUserData: any = {};
    if (firstName) updateUserData.firstName = firstName;
    if (lastName) updateUserData.lastName = lastName;
    if (email) updateUserData.email = email;
    if (password) updateUserData.password = await hash(password, 10);

    const updateEmployeeData: any = {};
    if (jobTitle) updateEmployeeData.jobTitle = jobTitle;
    if (departmentId) updateEmployeeData.departmentId = departmentId;

    await prisma.$transaction([
      ...(Object.keys(updateUserData).length > 0
        ? [prisma.user.update({ where: { id: session.user.id }, data: updateUserData })]
        : []),
      ...(Object.keys(updateEmployeeData).length > 0
        ? [prisma.employee.update({ where: { userId: session.user.id }, data: updateEmployeeData })]
        : []),
    ]);

    await prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entity: 'User',
        entityId: session.user.id,
        userId: session.user.id,
        companyId: session.user.currentCompanyId,
        description: 'Updated user or employee profile',
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error updating user settings:', err);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}