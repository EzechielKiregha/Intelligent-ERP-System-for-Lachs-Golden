import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const companyId = session.user.companyId

  const { searchParams } = new URL(req.url);
  const catId = searchParams.get("id");

  if (!catId) return NextResponse.json({error : "Category ID is missing"}, { status : 400})

  try {
    const category = await prisma.category.findUnique({
      where : {
        id:catId,
        companyId
      },
      select: {
        id: true,
        name: true,
        type: true,
        budgetLimit: true,
        budgetUsed: true,
      },
    });
    return NextResponse.json({category}, {status: 200});
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}