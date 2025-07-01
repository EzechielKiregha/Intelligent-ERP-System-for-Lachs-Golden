import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(_: NextRequest) {
  const session = await getServerSession(authOptions);
      
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  const list = await prisma.payroll.findMany({
    include: {
      employee: { select: { firstName: true, lastName: true } }
    },
    orderBy: { issuedDate: 'desc' },
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
    employeeId,
    payPeriod,
    grossAmount,
    taxAmount,
    netAmount,
    issuedDate,
    notes,
  } = body
  const created = await prisma.payroll.create({ data: {
    employeeId,
    payPeriod,
    grossAmount,
    taxAmount,
    netAmount,
    issuedDate,
    notes,
    companyId
  } })
  return NextResponse.json(created)
}
