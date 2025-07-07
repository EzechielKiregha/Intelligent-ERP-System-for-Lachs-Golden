// app/api/members/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.id) {
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

  const members = await prisma.member.findMany({
    relationLoadStrategy:"join",
    where: { workspaceId },
    include: { user: { select: { name: true, email: true } } },
    orderBy: [{ role: 'asc' }, { createdAt: 'desc' }],
  });

  // const populatedMembers = members.map(m => ({
  //   ...m,
  //   name: m.user.name || m.user.email.split('@')[0],
  //   email: m.user.email,
  // }));

  return NextResponse.json({ success: true, message: 'Success', data: members });
}