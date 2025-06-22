import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const categories = await prisma.category.findMany({
      where: { companyId },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        type: true,
        budgetLimit: true,
        budgetUsed: true,
      },
    });
    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

const categorySchema = z.object({
  name: z.string().min(1),
  type: z.enum(['INCOME', 'EXPENSE']),
  budgetLimit: z.number().nonnegative(),
});

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const parse = categorySchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json({ error: 'Invalid data', details: parse.error.errors }, { status: 400 });
    }
    const { name, type, budgetLimit } = parse.data;
    const newCat = await prisma.category.create({
      data: {
        name,
        type,
        budgetLimit,
        budgetUsed: 0,
        company: { connect: { id: companyId } },
      },
    });
    return NextResponse.json({ category: newCat }, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const parse = categorySchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json({ error: 'Invalid data', details: parse.error.errors }, { status: 400 });
    }
    const categoryId = params.id;
    // Check ownership
    const existing = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!existing || existing.companyId !== companyId) {
      return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 });
    }
    const updated = await prisma.category.update({
      where: { id: categoryId },
      data: parse.data,
    });
    return NextResponse.json({ category: updated });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const companyId = session.user.companyId
  try {
    const categoryId = params.id;
    const existing = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!existing || existing.companyId !== companyId) {
      return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 });
    }
    // Optionally: check if transactions exist
    const txCount = await prisma.transaction.count({ where: { categoryId } });
    if (txCount > 0) {
      return NextResponse.json({ error: 'Cannot delete: transactions exist' }, { status: 400 });
    }
    await prisma.category.delete({ where: { id: categoryId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}