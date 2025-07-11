// app/api/projects/[projectId]/analytics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { TaskStatus } from '@/generated/prisma';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {

  const projectId = (await params).projectId
 const session = await getServerSession(authOptions);;
  if (!session?.user?.currentCompanyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get('workspaceId');
  if (!workspaceId) {
    return NextResponse.json({ error: 'Missing workspaceId' }, { status: 400 });
  }

  const member = await prisma.member.findFirst({
    where: { workspaceId, userId: session.user.id },
  });
  if (!member) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId, workspaceId },
  });
  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  const now = new Date();
  const thisMonthStart = startOfMonth(now);
  const thisMonthEnd = endOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));

  const metrics = await Promise.all([
    prisma.task.count({ where: { projectId: projectId, createdAt: { gte: thisMonthStart, lte: thisMonthEnd } } }),
    prisma.task.count({ where: { projectId: projectId, createdAt: { gte: lastMonthStart, lte: lastMonthEnd } } }),
    prisma.task.count({ where: { projectId: projectId, assigneeId: member.id, createdAt: { gte: thisMonthStart, lte: thisMonthEnd } } }),
    prisma.task.count({ where: { projectId: projectId, assigneeId: member.id, createdAt: { gte: lastMonthStart, lte: lastMonthEnd } } }),
    prisma.task.count({ where: { projectId: projectId, status: { not: TaskStatus.DONE }, createdAt: { gte: thisMonthStart, lte: thisMonthEnd } } }),
    prisma.task.count({ where: { projectId: projectId, status: { not: TaskStatus.DONE }, createdAt: { gte: lastMonthStart, lte: lastMonthEnd } } }),
    prisma.task.count({ where: { projectId: projectId, status: TaskStatus.DONE, createdAt: { gte: thisMonthStart, lte: thisMonthEnd } } }),
    prisma.task.count({ where: { projectId: projectId, status: TaskStatus.DONE, createdAt: { gte: lastMonthStart, lte: lastMonthEnd } } }),
    prisma.task.count({ where: { projectId: projectId, status: { not: TaskStatus.DONE }, dueDate: { lt: now }, createdAt: { gte: thisMonthStart, lte: thisMonthEnd } } }),
    prisma.task.count({ where: { projectId: projectId, status: { not: TaskStatus.DONE }, dueDate: { lt: now }, createdAt: { gte: lastMonthStart, lte: lastMonthEnd } } }),
  ]);

  const [taskCount, lastTaskCount, assignedTaskCount, lastAssignedTaskCount, incompleteTaskCount, lastIncompleteTaskCount, completeTaskCount, lastCompleteTaskCount, overDueTaskCount, lastOverDueTaskCount] = metrics;

  return NextResponse.json({
    data: {
      taskCount,
      taskDiff: taskCount - lastTaskCount,
      assignedTaskCount,
      assignedTaskDiff: assignedTaskCount - lastAssignedTaskCount,
      incompleteTaskCount,
      incompleteTaskDiff: incompleteTaskCount - lastIncompleteTaskCount,
      completeTaskCount,
      completeTaskDiff: completeTaskCount - lastCompleteTaskCount,
      overDueTaskCount,
      overDueTaskDiff: overDueTaskCount - lastOverDueTaskCount,
    },
  });
}