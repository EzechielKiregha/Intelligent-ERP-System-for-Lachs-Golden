// app/api/workspaces/[workspaceId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma  from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ workspaceId: string }> }) {

  const workspaceId = (await params).workspaceId
 const session = await getServerSession(authOptions);;
  if (!session?.user?.companyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const member = await prisma.member.findFirst({
    where: { workspaceId: workspaceId, userId: session.user.id },
  });
  if (!member) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
  });
  if (!workspace) return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });

  return NextResponse.json({ data: workspace });
}

// app/api/workspaces/[workspaceId]/route.ts
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ workspaceId: string }> }) {

  const workspaceId = (await params).workspaceId
 const session = await getServerSession(authOptions);;
  if (!session?.user?.companyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const member = await prisma.member.findFirst({
    where: { workspaceId: workspaceId, userId: session.user.id, role: 'ADMIN' },
  });
  if (!member) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await req.formData();
  const name = formData.get('name') as string;
  const imageUrl = formData.get('imageUrl');

  let imageUrlString: string | undefined;
  let fileId: string | undefined;
  if (imageUrl instanceof File) {
    // Handle file upload and deletion of old file if exists
  } else if (typeof imageUrl === 'string') {
    imageUrlString = imageUrl;
  }

  const workspace = await prisma.workspace.update({
    where: { id: workspaceId },
    data: { name, imageUrl: imageUrlString, fileId },
  });

  return NextResponse.json({ data: workspace });
}

// app/api/workspaces/[workspaceId]/route.ts
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ workspaceId: string }> }) {

  const workspaceId = (await params).workspaceId
 const session = await getServerSession(authOptions);;
  if (!session?.user?.companyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const member = await prisma.member.findFirst({
    where: { workspaceId: workspaceId, userId: session.user.id, role: 'ADMIN' },
  });
  if (!member) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Delete related data (members, tasks) and optionally the image file
  await prisma.$transaction([
    prisma.member.deleteMany({ where: { workspaceId: workspaceId } }),
    prisma.task.deleteMany({ where: { project : { workspaceId: workspaceId } } }),
    prisma.workspace.delete({ where: { id: workspaceId } }),
  ]);

  return NextResponse.json({ message: 'Workspace deleted' });
}