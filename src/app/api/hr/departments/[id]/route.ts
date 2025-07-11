import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }
) {
   const id = (await params).id; 
  const session = await getServerSession(authOptions);
        
      if (!session?.user?.currentCompanyId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
  const { name, description } = await req.json()
  const updated = await prisma.department.update({
    where: { id },
    data: { name, description },
    include: { _count: { select: { employees: true } } },
  })
  return NextResponse.json({
    id: updated.id,
    name: updated.name,
    description: updated.description,
    employeeCount: updated._count.employees,
  })
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }
) {
   const id = (await params).id; 
  const session = await getServerSession(authOptions);
        
      if (!session?.user?.currentCompanyId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
  await prisma.department.delete({ where: { id} })
  return NextResponse.json({ success: true })
}
