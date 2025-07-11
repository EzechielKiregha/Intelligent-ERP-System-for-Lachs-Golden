import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma  from '@/lib/prisma';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';

const createImageSchema = z.object({
  url: z.string().url('Invalid URL'),
  pathname: z.string().optional(),
  contentType: z.string().optional(),
  size: z.number().optional(),
  companyId: z.string().min(1, 'Company ID is required'),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const contentType = req.headers.get('content-type')?.toLowerCase();
  if (!contentType?.includes('application/json')) {
    return NextResponse.json({ error: 'Unsupported Content-Type. Use application/json.' }, { status: 415 });
  }

  try {
    const body = await req.json();
    const parsed = createImageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data', details: parsed.error.errors }, { status: 400 });
    }

    const { url, pathname, contentType, size, companyId } = parsed.data;

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true },
    });
    if (!company) {
      return NextResponse.json({ error: 'Invalid companyId' }, { status: 400 });
    }

    const image = await prisma.image.create({
      data: {
        url,
        pathname,
        contentType,
        size,
        companyId,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Image created',
      data: image,
    });
  } catch (error) {
    console.error('Error creating image:', error);
    return NextResponse.json({ error: 'Failed to create image' }, { status: 500 });
  }
}