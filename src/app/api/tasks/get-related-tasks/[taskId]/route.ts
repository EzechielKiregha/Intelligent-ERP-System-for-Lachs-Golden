import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ taskId: string } >}) {

  const taskId = (await params).taskId
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

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      project: {
        include: { images: { select: { url: true } } },
      },
      assignee: true,
    },
  });
  if (!task || task.workspaceId !== workspaceId) {
    return NextResponse.json({ success: false, message: 'Task not found', data: null }, { status: 404 });
  }

  const relatedTasks = await prisma.task.findMany({
    where: {
      workspaceId,
      assigneeId: task.assigneeId,
      id: { not: taskId },
    },
    include: {
      project: {
        include: { images: { select: { url: true } } },
      },
      assignee: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  // console.log("[GET /api/tasks/get-related-tasks] Related tasks found:", relatedTasks.length);
  // console.log("[GET /api/tasks/get-related-tasks] Task:", task);

  return NextResponse.json({ task, relatedTasks });
}