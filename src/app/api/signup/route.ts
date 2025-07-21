// /api/signup/route.ts
import { hash } from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { Role, UserStatus } from '@/generated/prisma';

const signUpSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email'),
  role: z.enum([Role.ADMIN, Role.ADMIN, Role.USER]).optional(),
  status: z.enum([UserStatus.PENDING, UserStatus.ACCEPTED, UserStatus.BLOCKED]).optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  companyId: z.string().min(1, 'Company ID is required'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body) {
      return NextResponse.json({ message: 'Request body is required' }, { status: 400 });
    }

    const parseResult = signUpSchema.safeParse(body);
    if (!parseResult.success) {
      console.error('Validation error:', parseResult.error.format());
      return NextResponse.json(
        { message: 'Validation error', errors: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { firstName, lastName, email, password, companyId, role, status } = parseResult.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      await prisma.auditLog.create({
        data: {
          companyId: existingUser.companyId || 'N/A',
          action: 'CREATE_FAILED',
          description: `Failed to create user: Email ${email} already exists`,
          url: '/api/signup',
          entity: 'User',
          entityId: null,
          userId: existingUser.id,
        },
      });
      return NextResponse.json({ message: 'Email already used' }, { status: 400 });
    }

    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) {
      return NextResponse.json({ message: 'Invalid company' }, { status: 400 });
    }

    const hashedPassword = await hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        role: role || 'USER',
        status: status || UserStatus.PENDING,
        companyId,
        currentCompanyId: companyId,
        images: {
          create: {
            url: "https://lachsgolden.com/wp-content/uploads/2024/01/LACHS-logo-02-2048x1006-removebg-preview-e1735063006450.png",
            pathname: "https://lachsgolden.com/wp-content/uploads/2024/01/LACHS-logo-02-2048x1006-removebg-preview-e1735063006450.png",
            contentType: "https://lachsgolden.com/wp-content/uploads/2024/01/LACHS-logo-02-2048x1006-removebg-preview-e1735063006450.png",
            size: 10000,
          }
        }
      },
    });

    const updatedCompany = await prisma.company.update({
      where: { id: companyId },
      data: {
        users: {
          connect: { id: user.id },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        companyId: user.companyId || 'N/A',
        action: 'CREATE',
        description: `Created user with ID ${user.id} (PENDING)`,
        url: '/api/signup',
        entity: 'User',
        entityId: user.id,
        userId: user.id,
      },
    });

    return NextResponse.json({ message: 'Account created successfully! Awaiting approval.' }, { status: 200 });
  } catch (err: any) {
    console.error('Unexpected espèce error during signup:', err);
    await prisma.auditLog.create({
      data: {
        companyId: 'N/A',
        action: 'CREATE_FAILED',
        description: `Failed to create user: ${err.message}`,
        url: '/api/signup',
        entity: 'User',
        entityId: null,
        userId: null,
      },
    });
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}