import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(_: NextRequest) {
   const session = await getServerSession(authOptions);
    
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const list = await prisma.employee.findMany({
    include: { department: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(list)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
    
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json()
  const emp = await prisma.employee.create({ data: body })
  return NextResponse.json(emp)
}
