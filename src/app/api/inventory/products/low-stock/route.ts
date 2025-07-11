// app/api/inventory/products/low-stock/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  const session = await getServerSession(authOptions);
    
  if (!session?.user?.currentCompanyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const list = await prisma.product.findMany({
    where:{ quantity:{ lt: prisma.product.fields.threshold } }
  })
  return NextResponse.json(list)
}
