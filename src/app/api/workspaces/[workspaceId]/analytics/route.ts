import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma  from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';

export async function GET(req: NextRequest, { params }: { params: Promise<{ workspaceId: string }> }) {

  const workspaceId = (await params).workspaceId
 const session = await getServerSession(authOptions);;
  if (!session?.user?.currentCompanyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const member = await prisma.member.findFirst({
    where: { workspaceId: workspaceId, userId: session.user.id },
  });
  if (!member) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const now = new Date();
  const thisMonthStart = startOfMonth(now);
  const thisMonthEnd = endOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));

  const [thisMonthTasks, lastMonthTasks] = await Promise.all([
    prisma.task.count({
      where: { project : { workspaceId: workspaceId }, createdAt: { gte: thisMonthStart, lte: thisMonthEnd } },
    }),
    prisma.task.count({
      where: { project : { workspaceId: workspaceId }, createdAt: { gte: lastMonthStart, lte: lastMonthEnd } },
    }),
  ]);

  const taskCount = thisMonthTasks;
  const taskDiff = thisMonthTasks - lastMonthTasks;

  // Add more analytics (e.g., assignedTaskCount, incompleteTaskCount) as needed

  return NextResponse.json({ data: { taskCount, taskDiff } });
}