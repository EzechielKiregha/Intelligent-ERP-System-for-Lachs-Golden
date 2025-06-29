import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
        
      if (!session?.user?.companyId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
  const { name } = await req.json()
  const updated = await prisma.department.update({
    where: { id: params.id },
    data: { name },
    include: { _count: { select: { employees: true } } },
  })
  return NextResponse.json({
    id: updated.id,
    name: updated.name,
    employeeCount: updated._count.employees,
  })
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
        
      if (!session?.user?.companyId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
  await prisma.department.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
