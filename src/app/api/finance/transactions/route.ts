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

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { categoryId, amount, description, type, status } = await req.json();

  if (!categoryId || !amount || !type || !status) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const transaction = await prisma.transaction.create({
      data: {
        category: { connect: { id: categoryId } },
        company: { connect: { id: session.user.companyId } },
        user: { connect: { id: session.user.id } },
        amount: parseFloat(amount),
        description,
        date: new Date(),
        type,
        status,
      },
      include: {
        category: true,
        user: true,
      },
    });

    if (transaction){
      const cat = await prisma.category.findUnique({
        where : { id : transaction.categoryId},
      })

      if(cat){
        await prisma.category.update(
          {
            where : {
              id: transaction.categoryId
            },
            data : {
              budgetUsed: cat.budgetUsed !== null ? cat.budgetUsed + transaction.amount : transaction.amount
            }
          }
        )
      }
    }

    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entity: 'Transaction',
        entityId: transaction.id,
        userId: session.user.id,
        companyId: session.user.companyId,
        url: req.url,
        description: `Created a ${type} transaction of $${amount} in category ${transaction.category.name}`,
      },
    });

    return NextResponse.json(transaction);
  } catch (err) {
    console.error('Transaction create error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
