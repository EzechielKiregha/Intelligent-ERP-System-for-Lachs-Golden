import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma  from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params:  Promise<{ workspaceId: string; inviteCode: string }> }) {

  const workspaceId = (await params).workspaceId
  const inviteCode = (await params).inviteCode
 const session = await getServerSession(authOptions);;
  if (!session?.user?.companyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
  });
  if (!workspace || workspace.inviteCode !== inviteCode) {
    return NextResponse.json({ error: 'Invalid invite code' }, { status: 400 });
  }

  const existingMember = await prisma.member.findFirst({
    where: { workspaceId: workspaceId, userId: session.user.id },
  });
  if (existingMember) return NextResponse.json({ error: 'Already a member' }, { status: 400 });

  await prisma.member.create({
    data: {
      userId: session.user.id,
      workspaceId: workspaceId,
      role: 'MEMBER',
      color: '#' + Math.floor(Math.random()*16777215).toString(16),
    },
  });

  return NextResponse.json({ data: workspace });
}