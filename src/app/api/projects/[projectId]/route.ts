// app/api/projects/[projectId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {

  const projectId = (await params).projectId
  const session = await getServerSession();
  if (!session?.user?.id) {
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

  return NextResponse.json({ data: project });
}

// app/api/projects/[projectId]/route.ts
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {

  const projectId = (await params).projectId
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await req.formData();
  const name = formData.get('name') as string;
  const workspaceId = formData.get('workspaceId') as string;
  const imageUrl = formData.get('imageUrl');

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

  let imageUrlString: string | undefined = project.imageUrl || '';
  let fileId: string | undefined = project.fileId || '';
  if (imageUrl instanceof File) {
    // Delete old image if exists, then upload new one
    // if (project.fileId) await deleteFile(project.fileId);
    // const uploadedFile = await uploadFile(imageUrl);
    // imageUrlString = uploadedFile.url;
    // fileId = uploadedFile.id;
  } else if (typeof imageUrl === 'string') {
    // if (project.fileId && imageUrl === '') await deleteFile(project.fileId);
    imageUrlString = imageUrl || undefined;
    fileId = imageUrl ? fileId : undefined;
  }

  const updatedProject = await prisma.project.update({
    where: { id: projectId },
    data: {
      name: name || project.name,
      workspaceId,
      imageUrl: imageUrlString,
      fileId,
    },
  });

  return NextResponse.json({ data: updatedProject });
}

// app/api/projects/[projectId]/route.ts
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {

  const projectId = (await params).projectId
  const session = await getServerSession();
  if (!session?.user?.id) {
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