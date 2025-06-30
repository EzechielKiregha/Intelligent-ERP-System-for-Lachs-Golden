import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(_:NextRequest,{ params }: { params: Promise<{ id: string }> }
) {
   const id = (await params).id;
  const session = await getServerSession(authOptions);
    
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const d = await prisma.document.findUnique({ where:{id} })
  return NextResponse.json(d)
}

export async function PUT(req:NextRequest,{params}:{params:{id:string}}){
  const session = await getServerSession(authOptions);
    
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const data = await req.json()
  const updated = await prisma.document.update({ where:{id:params.id}, data })
  return NextResponse.json(updated)
}

export async function DELETE(_:NextRequest,{ params }: { params: Promise<{ id: string }> }
) {
   const id = (await params).id;
  const session = await getServerSession(authOptions);
    
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  await prisma.document.delete({ where:{id} })
  return NextResponse.json({ success:true })
}
