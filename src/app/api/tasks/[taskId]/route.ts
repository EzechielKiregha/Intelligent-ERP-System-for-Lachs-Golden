import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma  from '@/lib/prisma';
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
      project: true,
      assignee: { include: { user: { select: { name: true, email: true } } } },
    },
  });
  if (!task || task.workspaceId !== workspaceId) {
    return NextResponse.json({ success: false, message: 'Task not found', data: null }, { status: 404 });
  }

  // const populatedTask = {
  //   ...task,
  //   assignee: {
  //     ...task.assignee,
  //     name: task.assignee.user.name || task.assignee.user.email.split('@')[0],
  //     email: task.assignee.user.email,
  //   },
  // };

  return NextResponse.json({ data: task });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ taskId: string } >}) {

  const taskId = (await params).taskId
 const session = await getServerSession(authOptions);;
  if (!session?.user?.currentCompanyId) {
    return NextResponse.json({ success: false, message: 'Unauthorized', data: null }, { status: 401 });
  }

  const body = await req.json();
  const { workspaceId, title, projectId, assigneeId, status, dueDate, description } = body;

  const member = await prisma.member.findFirst({
    where: { workspaceId, userId: session.user.id },
  });
  if (!member) {
    return NextResponse.json({ success: false, message: 'Unauthorized', data: null }, { status: 401 });
  }

  const task = await prisma.task.update({
    where: { id: taskId },
    data: {
      title,
      projectId,
      assigneeId,
      status,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      description,
    },
  });

  return NextResponse.json({ success: true, message: 'Successfully updated the task', data: task });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ taskId: string } >}) {

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
  });
  if (!task || task.workspaceId !== workspaceId) {
    return NextResponse.json({ success: false, message: 'Task not found', data: null }, { status: 404 });
  }

  await prisma.task.delete({ where: { id: taskId } });

  return NextResponse.json({ success: true, message: 'Successfully deleted the task', data: { projectId: task.projectId } });
}