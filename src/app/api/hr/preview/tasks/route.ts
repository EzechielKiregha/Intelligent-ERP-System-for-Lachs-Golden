// app/api/hr/preview/tasks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { TaskStatus } from '@/generated/prisma';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.currentCompanyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const pendingTasks = await prisma.task.findMany({
      where: {
        companyId: session.user.currentCompanyId,
        status: TaskStatus.BACKLOG,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        description: true,
        dueDate: true,
        assignee: {
          select: {
            user : true
          },
        },
        createdAt: true,
      },
    });

    return NextResponse.json(pendingTasks);
  } catch (err) {
    console.error('Error fetching pending tasks:', err);
    return NextResponse.json({ error: 'Failed to load tasks' }, { status: 500 });
  }
}
