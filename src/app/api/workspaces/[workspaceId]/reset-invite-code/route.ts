import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma  from '@/lib/prisma';

// app/api/workspaces/[workspaceId]/reset-invite-code/route.ts
export async function POST(req: NextRequest, { params }: { params: Promise<{ workspaceId: string }> }) {

  const workspaceId = (await params).workspaceId
  const session = await getServerSession();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const member = await prisma.member.findFirst({
    where: { workspaceId: workspaceId, userId: session.user.id, role: 'ADMIN' },
  });
  if (!member) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const workspace = await prisma.workspace.update({
    where: { id: workspaceId },
    data: { inviteCode: Math.random().toString(36).substring(2, 8) },
  });

  return NextResponse.json({ data: workspace });
}