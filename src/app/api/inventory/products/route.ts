// app/api/inventory/products/route.ts
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';

export async function GET() {
  const session = await getServerSession(authOptions);
          
    if (!session?.user?.currentCompanyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const companyId = session.user.currentCompanyId;

    console.log('Fetching products for company:', companyId);
  try {
    const products = await prisma.product.findMany({
      where : {
        companyId,
      },
      select : {
        id:true,
        name: true,
        sku: true,
        unitPrice: true,
        quantity: true,
        threshold: true,
        description: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({products}, { status: 200 });
  } catch (err) {
    console.error('Fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
