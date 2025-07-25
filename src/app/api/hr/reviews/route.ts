import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(_: NextRequest) {
  const session = await getServerSession(authOptions);
        
  if (!session?.user?.currentCompanyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const companyId = session.user.currentCompanyId

  const list = await prisma.performanceReview.findMany({
    where:{companyId},
    include: {
      reviewer: { select: { firstName: true, lastName: true } },
      employee: { select: { firstName: true, lastName: true } },
    },
    orderBy: { reviewDate: 'desc' },
  })

  return NextResponse.json(list)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
        
  if (!session?.user?.currentCompanyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const companyId = session.user.currentCompanyId

  const body = await req.json()
  const {
    reviewDate,
    rating,
    comments,
    reviewerId,
    employeeId,
  } = body
  const created = await prisma.performanceReview.create({ data: {
    reviewDate,
    rating,
    comments,
    reviewerId : session.user.id, // Default to current user if no reviewer specified
    employeeId,
    companyId
  } })
  return NextResponse.json(created)
}
