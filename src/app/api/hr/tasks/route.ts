import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';

export async function GET() {
  const session = await getServerSession(authOptions);
          
        if (!session?.user?.companyId) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
  const list = await prisma.task.findMany({
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
  const body = await req.json()
  const t = await prisma.task.create({ data: body })
  return NextResponse.json(t)
}
