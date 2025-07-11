import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.currentCompanyId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const companyId = session.user.currentCompanyId;
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
  const session = await getServerSession(authOptions);
  if (!session?.user?.currentCompanyId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const companyId = session.user.currentCompanyId;
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

    // Log success directly using Prisma
    await prisma.auditLog.create({
      data: {
        companyId,
        action: 'CREATE',
        description: `Created category with ID ${newCat.id}`,
        url: '/api/finance/categories',
        entity: 'Category',
        entityId: newCat.id,
        userId: session.user.id,
        timestamp: new Date(),
      },
    });

    return NextResponse.json({ category: newCat }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating category:', error);

    // Log failure directly using Prisma
    await prisma.auditLog.create({
      data: {
        companyId,
        action: 'CREATE_FAILED',
        description: `Failed to create category: ${error.message}`,
        url: '/api/finance/categories',
        entity: 'Category',
        entityId: null,
        userId: session.user.id,
        timestamp: new Date(),
      },
    });

    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.currentCompanyId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const companyId = session.user.currentCompanyId;

  // Extract the `id` parameter from the URL
  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get('id');
  if (!categoryId) {
    return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
  }
  try {
    
    const body = await req.json();
    const parse = categorySchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json({ error: 'Invalid data', details: parse.error.errors }, { status: 400 });
    }
    
    // Check ownership
    const existing = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!existing || existing.companyId !== companyId) {
      return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 });
    }
    const updated = await prisma.category.update({
      where: { id: categoryId },
      data: parse.data,
    });

    // Log success directly using Prisma
    await prisma.auditLog.create({
      data: {
        companyId,
        action: 'UPDATE',
        description: `Updated category with ID ${updated.id}`,
        url: '/api/finance/categories',
        entity: 'Category',
        entityId: updated.id,
        userId: session.user.id,
        timestamp: new Date(),
      },
    });

    return NextResponse.json({ category: updated });
  } catch (error:any) {
    console.error('Error updating category:', error);

    // Log failure directly using Prisma
    await prisma.auditLog.create({
      data: {
        companyId,
        action: 'UPDATE_FAILED',
        description: `Failed to update category: ${error.message}`,
        url: '/api/finance/categories',
        entity: 'Category',
        entityId: categoryId,
        userId: session.user.id,
        timestamp: new Date(),
      },
    });

    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
    if (!session?.user?.currentCompanyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const companyId = session.user.currentCompanyId

    // Extract the `id` parameter from the URL
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('id');
    if (!categoryId) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }
  try {
    
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

    // Log success directly using Prisma
    await prisma.auditLog.create({
      data: {
        companyId,
        action: 'DELETE',
        description: `Deleted category with ID ${categoryId}`,
        url: '/api/finance/categories',
        entity: 'Category',
        entityId: categoryId,
        userId: session.user.id,
        timestamp: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error:any) {
    console.error('Error deleting category:', error);

    // Log failure directly using Prisma
    await prisma.auditLog.create({
      data: {
        companyId,
        action: 'DELETE_FAILED',
        description: `Failed to delete category: ${error.message}`,
        url: '/api/finance/categories',
        entity: 'Category',
        entityId: categoryId,
        userId: session.user.id,
        timestamp: new Date(),
      },
    });

    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}