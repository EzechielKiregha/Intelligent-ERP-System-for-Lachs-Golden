import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }
) {
   const id = (await params).id; 
  const session = await getServerSession(authOptions);
      
    if (!session?.user?.currentCompanyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  const emp = await prisma.employee.findUnique({
    where: { id },
    include: { payrolls: true }
  })
  if (emp) {
    return NextResponse.json(emp.payrolls)
  }
  const item = await prisma.payroll.findUnique({
    where: { id },
    include: { employee: { select: { firstName: true, lastName: true } } }
  })
  return NextResponse.json(item)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }
) {
   const id = (await params).id; 
  const session = await getServerSession(authOptions);
      
    if (!session?.user?.currentCompanyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  const body = await req.json()
  const updated = await prisma.payroll.update({
    where: { id },
    data: body,
  })
  return NextResponse.json(updated)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }
) {
   const id = (await params).id; 
  await prisma.payroll.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
