import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(_: NextRequest) {
   const session = await getServerSession(authOptions);
    
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const companyId = session.user.companyId
  const list = await prisma.employee.findMany({
    where:{ companyId },
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

  const companyId = session.user.companyId

  const body = await req.json()
  const {
    firstName,
    lastName,
    email,
    phone,
    hireDate,
    jobTitle,
    status,
    departmentId
  } = body
  const emp = await prisma.employee.create({ data: {
    firstName,
    lastName,
    email,
    phone,
    hireDate,
    jobTitle,
    status,
    departmentId,
    companyId
  } })
  return NextResponse.json(emp)
}
