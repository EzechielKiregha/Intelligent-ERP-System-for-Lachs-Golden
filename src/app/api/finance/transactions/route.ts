// app/api/finance/transactions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const companyId = session.user.companyId
  try {
    const transactions = await prisma.transaction.findMany({
      where: { companyId },
      include: {
        category: true,
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    // Return array directly; DataTable paginates on client.
    return NextResponse.json({ transactions });
  } catch (error) {
    console.error('Error fetching all transactions:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}
