// app/api/workspaces/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.companyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const workspaces = await prisma.workspace.findMany({
    where: {
      members: { some: { userId: session.user.id } },
      companyId : session.user.companyId
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ data: { documents: workspaces, total: workspaces.length } });
}

// app/api/workspaces/route.ts
export async function POST(req: NextRequest) {
  const session = await getServerSession();
  
  console.log("[SESSION] ", session?.user)

  if (!session?.user?.companyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await req.formData();
  const name = formData.get('name') as string;
  const imageUrl = formData.get('imageUrl');
  const companyId = formData.get('companyId') as string; // Assume passed from frontend

  // Validation (use Zod or similar)
  if (!name || !companyId) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });

  let imageUrlString: string | undefined;
  let fileId: string | undefined;
  if (imageUrl instanceof File) {
    // Handle file upload (e.g., to Vercel Blob or S3)
    // imageUrlString = uploadedUrl;
    // fileId = uploadedFileId;
  } else if (typeof imageUrl === 'string') {
    imageUrlString = imageUrl;
  }

  const workspace = await prisma.workspace.create({
    data: {
      name,
      companyId,
      imageUrl: imageUrlString,
      fileId,
      inviteCode: Math.random().toString(36).substring(2, 8), // Simple random code
    },
  });

  console.log("[WORKSPACE] ", workspace)

  await prisma.member.create({
    data: {
      userId: session.user.id,
      workspaceId: workspace.id,
      role: 'ADMIN',
      color: '#' + Math.floor(Math.random()*16777215).toString(16), // Random hex color
    },
  });

  return NextResponse.json({ data: workspace });
}