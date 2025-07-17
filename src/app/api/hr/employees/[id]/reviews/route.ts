// app/api/hr/preview/reviews/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }
) {
   const id = (await params).id; 

  const session = await getServerSession(authOptions);
  if (!session?.user?.currentCompanyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const reviews = await prisma.performanceReview.findMany({
      where: { employeeId: id, companyId: session.user.currentCompanyId },
      orderBy: { reviewDate: 'desc' },
      take: 5,
      select: {
        id: true,
        reviewDate: true,
        rating: true,
        comments: true,
        employee: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        reviewer: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(reviews);
  } catch (err) {
    console.error('Error fetching reviews:', err);
    return NextResponse.json({ error: 'Failed to load reviews' }, { status: 500 });
  }
}
