// app/api/projects/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

export async function GET(req: NextRequest) {
 const session = await getServerSession(authOptions);;
  if (!session?.user?.companyId) {
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

  const projects = await prisma.project.findMany({
    where: { workspaceId },
    orderBy: { createdAt: 'desc' },
  });

  if (!projects) return NextResponse.json({ error: 'Not Found' }, { status: 404 });

  return NextResponse.json({ documents: projects, total: projects.length });
}

const createProjectSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  workspaceId: z.string().min(1, 'Workspace ID is required'),
  imageUrl: z.string().url().optional(),
  fileId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session?.user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createProjectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { name, workspaceId, imageUrl, fileId } = parsed.data;

    // Verify user is a member of the workspace
    const member = await prisma.member.findFirst({
      where: { workspaceId, userId: session.user.id },
    });
    if (!member) {
      return NextResponse.json({ error: 'Unauthorized: Not a workspace member' }, { status: 401 });
    }

    // Verify workspace belongs to the user's company
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { companyId: true },
    });
    if (!workspace || workspace.companyId !== session.user.companyId) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid workspace' },
        { status: 401 }
      );
    }

    const project = await prisma.project.create({
      data: {
        name,
        workspaceId,
        imageUrl,
        fileId,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Project created',
      data: project,
    });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}