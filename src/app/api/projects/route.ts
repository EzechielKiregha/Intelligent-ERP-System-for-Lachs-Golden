// app/api/projects/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await getServerSession();
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

  return NextResponse.json({ data: { documents: projects, total: projects.length } });
}
// app/api/projects/route.ts
export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await req.formData();
  const name = formData.get('name') as string;
  const workspaceId = formData.get('workspaceId') as string;
  const imageUrl = formData.get('imageUrl');

  if (!name || !workspaceId) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }

  const member = await prisma.member.findFirst({
    where: { workspaceId, userId: session.user.id },
  });
  if (!member) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let imageUrlString: string | undefined;
  let fileId: string | undefined;
  if (imageUrl instanceof File) {
    // Placeholder: Upload to storage (e.g., S3 or Vercel Blob)
    // const uploadedFile = await uploadFile(imageUrl);
    // imageUrlString = uploadedFile.url;
    // fileId = uploadedFile.id;
  } else if (typeof imageUrl === 'string' && imageUrl) {
    imageUrlString = imageUrl;
  }

  const project = await prisma.project.create({
    data: {
      name,
      workspaceId,
      imageUrl: imageUrlString,
      fileId,
    },
  });

  return NextResponse.json({ data: project });
}