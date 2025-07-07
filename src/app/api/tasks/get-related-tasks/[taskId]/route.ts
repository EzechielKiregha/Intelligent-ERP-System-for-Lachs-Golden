import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: Promise<{ taskId: string } >}) {

  const taskId = (await params).taskId
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

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { assignee: true },
  });
  if (!task || task.workspaceId !== workspaceId) {
    return NextResponse.json({ success: false, message: 'Task not found', data: null }, { status: 404 });
  }

  const relatedTasks = await prisma.task.findMany({
    where: {
      workspaceId,
      assigneeId: task.assigneeId,
      id: { not: task.id },
    },
    include: {
      project: true,
      assignee: { include: { user: { select: { name: true, email: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });

  // const populatedRelatedTasks = relatedTasks.map(t => ({
  //   ...t,
  //   assignee: {
  //     ...t.assignee,
  //     name: t.assignee.user.name || t.assignee.user.email.split('@')[0],
  //     email: t.assignee.user.email,
  //  // Other fields...
  //   },
  // }));

  // const populatedTask = {
  //   ...task,
  //   relatedTasks: populatedRelatedTasks,
  //   assignee: {
  //     ...task.assignee,
  //     name: task.assignee.user.name || task.assignee.user.email.split('@')[0],
  //     email: task.assignee.user.email,
  //   },
  // };

  return NextResponse.json({ data: relatedTasks });
}