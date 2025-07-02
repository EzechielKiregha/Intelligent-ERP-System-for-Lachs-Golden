import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(_: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const companyId = session.user.companyId;

  const list = await prisma.department.findMany({
    where: {
      companyId,
    },
    orderBy: { name: 'asc' },
  });

  // Use Promise.all to wait for all employee count promises to resolve
  const result = await Promise.all(
    list.map(async (d) => {
      const empCount = await prisma.employee.count({
        where: {
          companyId,
          departmentId: d.id,
        },
      });
      return {
        id: d.id,
        name: d.name,
        employeeCount: empCount,
        description: d.description,
      };
    })
  );

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const companyId = session.user.companyId;

  const { name, description } = await req.json();
  if (!name) return NextResponse.json({ message: "Department Name missing" }, { status: 400 });

  const dept = await prisma.department.create({
    data: {
      name,
      description,
      companyId,
    },
  });

  return NextResponse.json({ id: dept.id, name: dept.name, employeeCount: 0, description: dept.description });
}