import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'

export async function GET(_:NextRequest,{ params }: { params: Promise<{ id: string }> }
) {
   const id = (await params).id; 
  const session = await getServerSession(authOptions);
          
        if (!session?.user?.currentCompanyId) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
  const t = await prisma.task.findUnique({ where:{id} })
  return NextResponse.json(t)
}

export async function PUT(req:NextRequest,{ params }: { params: Promise<{ id: string }> }
) {
   const id = (await params).id; 
  const session = await getServerSession(authOptions);
          
        if (!session?.user?.currentCompanyId) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
  const data = await req.json()
  const updated = await prisma.task.update({ where:{id}, data })
  return NextResponse.json(updated)
}

export async function DELETE(_:NextRequest,{ params }: { params: Promise<{ id: string }> }
) {
   const id = (await params).id; 
  const session = await getServerSession(authOptions);
          
        if (!session?.user?.currentCompanyId) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
  await prisma.task.delete({ where:{id} })
  return NextResponse.json({ success:true })
}
