import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const companyId = session.user.companyId
  try {
    // Fetch budget data for all categories
    const budgetData = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        type: true,
        budgetLimit: true,
        budgetUsed: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Calculate remaining budget for each category
    const transformedData = budgetData.map((category) => ({
      id: category.id,
      name: category.name,
      type: category.type,
      budgetLimit: category.budgetLimit || 0,
      budgetUsed: category.budgetUsed || 0,
      remainingBudget: (category.budgetLimit || 0) - (category.budgetUsed || 0),
    }));

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('Error fetching budget data:', error);
    return NextResponse.json({ error: 'Failed to fetch budget data' }, { status: 500 });
  }
}