import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  const session = await getServerSession(authOptions);
    
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const companyId = session.user.companyId
  const list = await prisma.document.findMany({
    where:{companyId},
    include:{ owner:{ select:{ firstName:true,lastName:true } } },
    orderBy:{ uploadedAt:'desc' }
  })
  return NextResponse.json(list)
}

export async function POST(req:NextRequest){
  const session = await getServerSession(authOptions);
    
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const companyId = session.user.companyId
  const ownerId = session.user.id

  const body = await req.json()
  const { title, fileUrl, description} = body
  const d = await prisma.document.create({ data: {
    title,
    fileUrl,
    description,
    companyId,
    ownerId
  } })
  return NextResponse.json(d)
}
