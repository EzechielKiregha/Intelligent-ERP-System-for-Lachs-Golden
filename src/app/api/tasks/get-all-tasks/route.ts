import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
 const session = await getServerSession(authOptions);;
  if (!session?.user?.currentCompanyId) {
    return NextResponse.json({ success: false, message: 'Unauthorized', data: null }, { status: 401 });
  }

  const companyId = session.user.currentCompanyId

  const tasks = await prisma.task.findMany({
    where : {
      companyId
    },
    include: {
      project: {
        include: { images: { select: { url: true } } },
      },
      assignee: true, // Fetch Member data
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ data: tasks });
}
