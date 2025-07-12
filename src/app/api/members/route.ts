// app/api/members/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
 const session = await getServerSession(authOptions);;
  if (!session?.user?.currentCompanyId) {
    return NextResponse.json({ success: false, message: 'Unauthorized', data: null }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get('workspaceId');
  if (!workspaceId) {
    return NextResponse.json({ success: false, message: 'Missing workspaceId', data: null }, { status: 400 });
  }

  const member = await prisma.member.findFirst({
    where: { workspaceId, userId: session.user.id },
  });
  if (!member) {
    return NextResponse.json({ success: false, message: 'Unauthorized', data: null }, { status: 401 });
  }

  const list = await prisma.member.findMany({
    where: { workspaceId },
    // include: { user: { select: { name: true, email: true } } },
    orderBy:{ createdAt: 'desc' },
  });

  let members = []

  if (!list) {
    members.push(member)
  }
  else {
    list.map( m => ( 
      members.push({ ...m })
    ));
  }

  if (!members) return NextResponse.json({ success: false, message: 'Members not found', data: null }, { status: 404 });

  return NextResponse.json({members}, {status:200});
}