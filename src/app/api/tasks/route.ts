import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { Prisma, TaskStatus } from '@/generated/prisma';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
 const session = await getServerSession(authOptions);;
  if (!session?.user?.currentCompanyId) {
    return NextResponse.json({ success: false, message: 'Unauthorized', data: null }, { status: 401 });
  }

  const companyId = session.user.currentCompanyId

  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get('workspaceId');
  const projectId = searchParams.get('projectId');
  const assigneeId = searchParams.get('assigneeId');
  const status = searchParams.get('status');
  const dueDate = searchParams.get('dueDate');
  const search = searchParams.get('search');

  if (!workspaceId || !companyId) {
    return NextResponse.json({ success: false, message: 'Missing workspaceId or ProjectID', data: null }, { status: 400 });
  }

  const member = await prisma.member.findFirst({
    where: { workspaceId, userId: session.user.id },
    include:{
      tasks: true
    }
  });
  if (!member) {
    return NextResponse.json({ success: false, message: 'Unauthorized', data: null }, { status: 401 });
  }

  // const where = {
  //   workspaceId,
  //   ...(projectId && { projectId }),
  //   ...(assigneeId && { assigneeId }),
  //   ...(status && { TaskStatus }),
  //   ...(dueDate && { dueDate: new Date(dueDate) }),
  //   ...(search && { title: { contains: search } }),
  //   companyId
  // };

  const tasks = await prisma.task.findMany({
    where : {
      companyId, assigneeId : member.id
    },
    include: {
      project: true,
      assignee: true, // Fetch Member data
    },
    orderBy: { createdAt: 'desc' },
  });

  // console.log("[Member Tasks] :", member.tasks )

  if (!tasks) return NextResponse.json({ data : member.tasks});

  // console.log("[ Tasks] :", tasks )

  return NextResponse.json({ data: tasks });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);;
  if (!session?.user?.currentCompanyId || !session?.user?.currentCompanyId) {
    return NextResponse.json({ success: false, message: 'Unauthorized', data: null }, { status: 401 });
  }
  const companyId = session.user.currentCompanyId
  const body = await req.json();
  const { workspaceId, title, projectId, assigneeId, status, dueDate, description } = body;

  if (!workspaceId || !title || !projectId || !assigneeId || !status) {
    return NextResponse.json({ success: false, message: 'Invalid data', data: null }, { status: 400 });
  }

  const member = await prisma.member.findFirst({
    where: { workspaceId },
  });
  if (!member) {
    return NextResponse.json({ success: false, message: 'Unauthorized', data: null }, { status: 401 });
  }

  const highestPositionTask = await prisma.task.findFirst({
    where: { workspaceId, projectId, status },
    orderBy: { position: 'asc' },
  });

  const newPosition = highestPositionTask ? highestPositionTask.position + 1000 : 1000;

  const task = await prisma.task.create({
    data: {
      title,
      workspaceId,
      projectId,
      assigneeId,
      status,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      description,
      position: newPosition,
      companyId
    },
  });

  return NextResponse.json({ success: true, message: 'Successfully created new task', data: task });
}