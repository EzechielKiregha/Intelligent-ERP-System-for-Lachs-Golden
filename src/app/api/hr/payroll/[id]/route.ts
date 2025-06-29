import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
      
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  const item = await prisma.payroll.findUnique({
    where: { id: params.id },
    include: { employee: { select: { firstName: true, lastName: true } } }
  })
  return NextResponse.json(item)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
      
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  const body = await req.json()
  const updated = await prisma.payroll.update({
    where: { id: params.id },
    data: body,
  })
  return NextResponse.json(updated)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await prisma.payroll.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
