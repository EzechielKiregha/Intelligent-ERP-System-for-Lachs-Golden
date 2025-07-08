import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
 const session = await getServerSession(authOptions);;
  if (!session?.user?.companyId) {
    return NextResponse.json({ success: false, message: 'Unauthorized', data: null }, { status: 401 });
  }

  const body = await req.json();
  const { tasks } = body;
  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get('workspaceId');

  if (!workspaceId || !tasks || tasks.length === 0) {
    return NextResponse.json({ success: false, message: 'Invalid data', data: null }, { status: 400 });
  }

  const member = await prisma.member.findFirst({
    where: { workspaceId, userId: session.user.id },
  });
  if (!member) {
    return NextResponse.json({ success: false, message: 'Unauthorized', data: null }, { status: 401 });
  }

  const taskIds = tasks.map((t: { $id: any; }) => t.$id);
  const existingTasks = await prisma.task.findMany({
    where: { id: { in: taskIds }, workspaceId },
  });

  if (existingTasks.length !== tasks.length) {
    return NextResponse.json({ success: false, message: 'Some tasks not found or not in the same workspace', data: null }, { status: 404 });
  }

  const updatedTasks = await Promise.all(
    tasks.map(async (task: { $id: any; position: any; status: any; }) => {
      return await prisma.task.update({
        where: { id: task.$id },
        data: { position: task.position, status: task.status },
      });
    })
  );

  return NextResponse.json({ success: true, message: 'Successfully updated the tasks', data: updatedTasks });
}