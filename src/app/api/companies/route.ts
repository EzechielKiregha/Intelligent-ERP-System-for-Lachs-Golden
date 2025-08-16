// app/api/companies/route.ts

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { companySchema } from '@/lib/validations/company';
import { NextResponse } from 'next/server';
import { Role, UserStatus } from '@/generated/prisma';
import { hash } from 'bcryptjs';

// 🔹 Define workspace configs for each core division
const WORKSPACE_CONFIGS = [
  {
    name: 'Lachs Golden Space',
    description: 'Central dashboard and system-wide insights',
    coreDivisionType: [Role.SUPER_ADMIN, Role.ADMIN, Role.CEO, Role.MANAGER],
  },
  {
    name: 'Finance Space',
    description: 'Financial management, budgeting, and reporting',
    coreDivisionType: [Role.SUPER_ADMIN, Role.ADMIN, Role.ACCOUNTANT],
  },
  {
    name: 'Sales Space',
    description: 'Inventory, product management, and sales tracking',
    coreDivisionType: [Role.SUPER_ADMIN, Role.ADMIN, Role.EMPLOYEE, Role.MEMBER],
  },
  {
    name: 'Human Resource Space',
    description: 'HR, payroll, performance reviews, and employee management',
    coreDivisionType: [Role.SUPER_ADMIN, Role.ADMIN, Role.HR],
  },
  {
    name: 'Customer Relations Space',
    description: 'CRM, leads, customer interactions, and deals',
    coreDivisionType: [Role.SUPER_ADMIN, Role.ADMIN, Role.EMPLOYEE, Role.MEMBER],
  },
];

export async function POST(req: Request) {
  const isNewOwner = req.headers.get('is-new-owner') === 'true';

  let userId: string;
  

  // ✅ 1. Create the Company
  const body = await req.json();
  const data = companySchema.parse(body);
  const { firstName, lastName, email, password, role, status, ...companyData } = data;
  
  const hashedPassword = await hash(password || 'erp12345', 10);

  const company = await prisma.company.create({
    data: {
      ...companyData,
      images: {
        create: {
          url: 'https://lachsgolden.com/wp-content/uploads/2024/01/LACHS-logo-02-2048x1006-removebg-preview-e1735063006450.png',
          pathname: 'https://lachsgolden.com/wp-content/uploads/2024/01/LACHS-logo-02-2048x1006-removebg-preview-e1735063006450.png',
          contentType: 'image/png',
          size: 10000,
        },
      },
    },
  });

  if (!isNewOwner) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    userId = session.user.id;
    console.log('Creating user for existing company');
  } else {
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email : email || "",
        password: hashedPassword,
        role: role || Role.SUPER_ADMIN,
        status: status || UserStatus.ACCEPTED,
        currentCompanyId: company.id,
        companyId: company.id,
        ownedCompanies: {
          connect: { id: company.id },
        },
        images: {
          create: {
            url: 'https://github.com/evilrabbit.png',
            pathname: `img-evilrabit.png`,
            contentType: 'image/png',
            size: 10000,
          },
        },
      },
    });

    userId = user.id;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 });
  }

  // ✅ 2. Update Company and User: Set Company and Owners, role, ownedCompanies
  await prisma.company.update({
    where: { id: company.id },
    data: {
      owners: {
        connect: { id: user.id },
      },
      users: {
        connect: { id: user.id },
      },
    },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: {
      role: role || Role.SUPER_ADMIN,
      status: status || UserStatus.ACCEPTED,
      ownedCompanies: {
        connect: { id: company.id },
      },
      currentCompanyId: company.id
    },
  });

  // ✅ 3. Create 5 Workspaces
  const workspaces = await prisma.$transaction(
    WORKSPACE_CONFIGS.map((config) =>
      prisma.workspace.create({
        data: {
          name: config.name,
          description: config.description || '',
          companyId: company.id,
          coreDivisionType: config.coreDivisionType,
          images: {
            create: {
              url: "https://lachsgolden.com/wp-content/uploads/2024/01/LACHS-logo-02-2048x1006-removebg-preview-e1735063006450.png",
              pathname: "https://lachsgolden.com/wp-content/uploads/2024/01/LACHS-logo-02-2048x1006-removebg-preview-e1735063006450.png",
              contentType: 'image/png',
              size: 5000,
            },
          },
        },
      })
    )
  );

  await prisma.$transaction(
    workspaces.map((workspace) =>
      prisma.member.create({
        data: {
          userId,
          workspaceId: workspace.id,
          role: Role.SUPER_ADMIN,
          color: '#D4AF37', // Gold accent
          name: user?.firstName || 'Admin',
          email: user?.email || '',
        },
      })
    )
  );

  return NextResponse.json(
    {
      ...company,
      message: 'Company and workspaces created successfully',
    },
    { status: 201 }
  );
}

export async function GET() {
  try {
    const companies = await prisma.company.findMany({
      select: {
        id: true,
        name: true,
        industry: true,
      },
    });
    return NextResponse.json(companies);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Failed to fetch companies' }, { status: 500 });
  }
}