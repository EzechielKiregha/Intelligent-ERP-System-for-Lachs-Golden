// app/api/workspaces/[workspaceId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma  from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

export async function GET(req: NextRequest, { params }: { params: Promise<{ workspaceId: string }> }) {

  const workspaceId = (await params).workspaceId
 const session = await getServerSession(authOptions);;
  if (!session?.user?.currentCompanyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const member = await prisma.member.findFirst({
    where: { workspaceId: workspaceId, userId: session.user.id },
  });
  if (!member) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      images: {
        select: {
          url: true,
        },
      }
    },
  });
  if (!workspace) return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });

  return NextResponse.json({ data: workspace });
}


// Define schema for JSON payload
const createWorkspaceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  companyId: z.string().min(1, 'Company ID is required'),
  // url: z.string().url('Invalid URL'),
  // pathname: z.string().optional(),
  // contentType: z.string().optional(),
  // size: z.number().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ workspaceId: string }> }) {

  const workspaceId = (await params).workspaceId

 const session = await getServerSession(authOptions);;
  if (!session?.user?.currentCompanyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
    const parsed = createWorkspaceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { name, companyId, 
      // url, pathname, contentType, size
    } = parsed.data;

    if (companyId !== session.user.currentCompanyId) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid companyId' },
        { status: 401 }
      );
    }

  const member = await prisma.member.findFirst({
    where: {
      workspaceId: workspaceId,
      userId: session.user.id,
      role: 'ADMIN' },
  });
  if (!member) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const workspace = await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      name,
    }
  });

  return NextResponse.json({ data: workspace });
}

// app/api/workspaces/[workspaceId]/route.ts
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ workspaceId: string }> }) {

  const workspaceId = (await params).workspaceId
 const session = await getServerSession(authOptions);;
  if (!session?.user?.currentCompanyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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