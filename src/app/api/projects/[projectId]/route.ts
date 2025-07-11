// app/api/projects/[projectId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import z from 'zod';

export async function GET(req: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {

  const projectId = (await params).projectId
 const session = await getServerSession(authOptions);;
  if (!session?.user?.currentCompanyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { workspace: true, images : { select : { url : true}} },
  });
  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  const member = await prisma.member.findFirst({
    where: { workspaceId: project.workspaceId, userId: session.user.id },
  });
  if (!member) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({ data: project });
}

const createProjectSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  workspaceId: z.string().min(1, 'Workspace ID is required'),
  // url: z.string().url('Invalid URL'),
  // pathname: z.string().optional(),
  // contentType: z.string().optional(),
  // size: z.number().optional(),
});

// app/api/projects/[projectId]/route.ts
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {

  const projectId = (await params).projectId
 const session = await getServerSession(authOptions);;
  if (!session?.user?.currentCompanyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
      const parsed = createProjectSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Invalid data', details: parsed.error.errors },
          { status: 400 }
        );
      }
  
      const { name, workspaceId } = parsed.data;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { workspace: true },
  });
  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  const member = await prisma.member.findFirst({
    where: { workspaceId: project.workspaceId, userId: session.user.id },
  });
  if (!member) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const updatedProject = await prisma.project.update({
    where: { id: projectId },
    data: {
      name: name || project.name,
      workspaceId,
    },
  });

  return NextResponse.json({ data: updatedProject });
}

// app/api/projects/[projectId]/route.ts
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {

  const projectId = (await params).projectId
 const session = await getServerSession(authOptions);;
  if (!session?.user?.currentCompanyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { workspace: true },
  });
  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  const member = await prisma.member.findFirst({
    where: { workspaceId: project.workspaceId, userId: session.user.id },
  });
  if (!member) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await prisma.task.deleteMany({ where: { projectId: projectId } });
  // if (project.fileId) await deleteFile(project.fileId);
  await prisma.project.delete({ where: { id: projectId } });

  return NextResponse.json({ message: 'Project deleted' });
}