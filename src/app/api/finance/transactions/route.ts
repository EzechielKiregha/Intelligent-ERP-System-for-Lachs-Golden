import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CategoryType } from '@/generated/prisma';

export async function GET(req: NextRequest) {
  try {
    // Parse query parameters for pagination and filtering
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10', 10);
    const categoryType = url.searchParams.get('categoryType'); // INCOME or EXPENSE

    // Calculate pagination offsets
    const skip = (page - 1) * pageSize;

    // Fetch transactions with optional filtering by category type
    const transactions = await prisma.transaction.findMany({
      where: categoryType
        ? {
            category: {
              type: categoryType as CategoryType, // Cast categoryType to CategoryType
            },
          }
        : undefined,
      include: {
        category: true, // Include category details
        user: true, // Include user details
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: pageSize,
    });

    // Count total transactions for pagination
    const totalTransactions = await prisma.transaction.count({
      where: categoryType
        ? {
            category: {
              type: categoryType as CategoryType, // Cast categoryType to CategoryType
            },
          }
        : undefined,
    });

    return NextResponse.json({
      transactions,
      totalTransactions,
      totalPages: Math.ceil(totalTransactions / pageSize),
      currentPage: page,
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}