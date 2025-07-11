import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }
) {
   const id = (await params).id; 
  const session = await getServerSession(authOptions);
        
      if (!session?.user?.currentCompanyId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
  const rev = await prisma.performanceReview.findUnique({
    where: { id},
    include: { reviewer: { select: { name: true } }, employee: { select: { firstName: true, lastName: true } } },
  })
  return NextResponse.json(rev)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }
) {
   const id = (await params).id; 
  const session = await getServerSession(authOptions);
        
      if (!session?.user?.currentCompanyId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
  const body = await req.json()
  const updated = await prisma.performanceReview.update({
    where: { id},
    data: body,
  })
  return NextResponse.json(updated)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }
) {
   const id = (await params).id; 
  const session = await getServerSession(authOptions);
        
      if (!session?.user?.currentCompanyId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
  await prisma.performanceReview.delete({ where: { id} })
  return NextResponse.json({ success: true })
}
