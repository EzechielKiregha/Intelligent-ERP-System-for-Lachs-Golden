// app/api/hr/preview/employees/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.currentCompanyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const recentEmployees = await prisma.employee.findMany({
      where: { companyId: session.user.currentCompanyId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        jobTitle: true,
        department: { select: { name: true } },
        createdAt: true,
      },
    });

    return NextResponse.json(recentEmployees);
  } catch (err) {
    console.error('Error fetching employees preview:', err);
    return NextResponse.json({ error: 'Failed to load employees' }, { status: 500 });
  }
}
