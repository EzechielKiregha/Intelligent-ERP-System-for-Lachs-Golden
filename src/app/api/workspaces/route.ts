// app/api/workspaces/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.currentCompanyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const workspaces = await prisma.workspace.findMany({
    where: {
      members: { some: { userId: session.user.id } },
      companyId : session.user.currentCompanyId
    },
    include:{
      images : {
        select : { url : true},
        take: 1 // Get only one image per workspace
      }
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!workspaces) return NextResponse.json({ error: 'Not Found' }, { status: 404 });

  // console.log("[Workspaces] ", workspaces);

  return NextResponse.json({ documents: workspaces }, { status: 200 });
}

// Define schema for JSON payload
const createWorkspaceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  url: z.string().url('Invalid URL'),
  pathname: z.string().optional(),
  contentType: z.string().optional(),
  size: z.number().optional(),
});

export async function POST(req: NextRequest) {

  const session = await getServerSession(authOptions);

  if (!session?.user?.currentCompanyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createWorkspaceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { name, url, pathname, contentType, size} = parsed.data;

    const companyId = session.user.currentCompanyId;

    if (!companyId) {
      return NextResponse.json(
        { error: 'Unauthorized:' },
        { status: 401 }
      );
    }

    const workspace = await prisma.workspace.create({
      data: {
        name,
        companyId,
        description: `Workspace for ${session.user.name || 'Anonymous'}`,
        coreDivisionType: [session.user.role || 'USER'], // Default to USER role
        members: {
          create: {
            userId: session.user.id,
            name : session.user.name || "Anonymous Member",
            email : session.user.email || "anonymous.email@example.com",
            role: 'ADMIN',
            color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
          },
        },
        images:{
          create : {
            url,
            pathname,
            contentType,
            size
          }
        }
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Workspace created',
      data: workspace,
    });
  } catch (error) {
    console.error('Error creating workspace:', error);
    return NextResponse.json(
      { error: 'Failed to create workspace' },
      { status: 500 }
    );
  }
}