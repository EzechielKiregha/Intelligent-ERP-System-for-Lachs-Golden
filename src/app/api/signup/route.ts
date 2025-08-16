// app/api/signup/route.ts

import { hash } from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { EmployeeStatus, Role, UserStatus } from '@/generated/prisma';

// 🔹 Input validation
const signUpSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email'),
  role: z.nativeEnum(Role).optional(), // Use native enum
  status: z.nativeEnum(UserStatus).optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  companyId: z.string().min(1, 'Company ID is required'),
});

// 🔹 Map Role to Workspace Name
function getWorkspaceNameByRole(role: Role): string {
  switch (role) {
    case Role.ACCOUNTANT:
      return 'Finance Space';
    case Role.HR:
      return 'Human Resource Space';
    case Role.EMPLOYEE:
      return 'Sales Space'; // or 'Customer Relations Space' — adjust based on your logic
    case Role.ADMIN:
    case Role.MANAGER:
    case Role.CEO:
    default:
      return 'Lachs Golden Space'; // Default to dashboard
  }
}

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

    // 🔹 1. Check if user already exists
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

    // 🔹 2. Verify company exists
    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) {
      return NextResponse.json({ message: 'Invalid company' }, { status: 400 });
    }

    const hashedPassword = await hash(password, 10);

    // 🔹 3. Get workspace name based on role
    const workspaceName = getWorkspaceNameByRole(role || Role.USER);

    const workspace = await prisma.workspace.findFirst({
      where: {
        name: workspaceName,
        companyId,
      },
    });

    if (!workspace) {
      return NextResponse.json({ message: `Workspace "${workspaceName}" not found` }, { status: 400 });
    }

    // 🔹 4. Create User
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        role: role || Role.USER,
        status: status || UserStatus.PENDING,
        companyId,
        currentCompanyId: companyId,
        images: {
          create: {
            url: "https://lachsgolden.com/wp-content/uploads/2024/01/LACHS-logo-02-2048x1006-removebg-preview-e1735063006450.png",
            pathname: "https://lachsgolden.com/wp-content/uploads/2024/01/LACHS-logo-02-2048x1006-removebg-preview-e1735063006450.png",
            contentType: "image/png",
            size: 10000,
          }
        }
      },
    });

    // 🔹 5. Create Employee record
    const employee = await prisma.employee.create({
      data: {
        firstName,
        lastName,
        email,
        userId: user.id,
        companyId,
        status: EmployeeStatus.INACTIVE, // Default to inactive
      },
    });

    // 🔹 6. Update User with employeeId
    await prisma.user.update({
      where: { id: user.id },
      data: { employeeId: employee.id },
    });

    // 🔹 7. Connect User to Workspace via Member
    await prisma.member.create({
      data: {
        userId: user.id,
        workspaceId: workspace.id,
        role: role || Role.MEMBER,
        name: `${firstName} ${lastName}`,
        email,
        color: '#D4AF37', // Gold accent
      },
    });

    // 🔹 8. Link User to Company
    await prisma.company.update({
      where: { id: companyId },
      data: {
        users: {
          connect: { id: user.id },
        },
      },
    });

    // 🔹 9. Log audit
    await prisma.auditLog.create({
      data: {
        companyId: user.companyId,
        action: 'CREATE',
        description: `Created user ID ${user.id} as ${role} (PENDING)`,
        url: '/api/signup',
        entity: 'User',
        entityId: user.id,
        userId: user.id,
      },
    });

    return NextResponse.json(
      { message: 'Account created successfully! Awaiting approval.' },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('Unexpected error during signup:', err);
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