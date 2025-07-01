import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';

export async function GET() {
  const session = await getServerSession(authOptions);
          
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const companyId = session.user.companyId
  const list = await prisma.task.findMany({
    where:{companyId},
    include:{ assignee:{ select:{ firstName:true,lastName:true } } },
    orderBy:{ createdAt:'desc' }
  })
  return NextResponse.json(list)
}

export async function POST(req:NextRequest){
  const session = await getServerSession(authOptions);
          
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const companyId = session.user.companyId

  const body = await req.json()
  const {
    title,
    description,
    status,
    dueDate,
    assigneeId,
  } = body
  const t = await prisma.task.create({ data: {
    title,
    description,
    status,
    dueDate,
    assigneeId,
    companyId
  }})
  return NextResponse.json(t)
}
