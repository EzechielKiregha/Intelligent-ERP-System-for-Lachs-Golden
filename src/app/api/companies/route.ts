import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import  prisma  from '@/lib/prisma';
import { companySchema } from '@/lib/validations/company';
import { NextResponse } from 'next/server';
import { Role } from '@/generated/prisma';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = companySchema.parse(body); // Server-side validation

    const company = await prisma.company.create({
      data: {
        ...data,
        owners: { connect: { id: session.user.id, role: Role.OWNER } },
      },
    });

    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Failed to create company' }, { status: 500 });
  }
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