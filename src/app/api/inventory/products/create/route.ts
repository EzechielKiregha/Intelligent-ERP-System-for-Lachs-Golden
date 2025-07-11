// app/api/inventory/create/route.ts
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {

  const session = await getServerSession(authOptions);
  
    if (!session?.user?.currentCompanyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  
    const companyId = session.user.currentCompanyId;
  
  try {
    const body = await req.json();
    const { name, sku, quantity, threshold, unitPrice, description } = body;

    const product = await prisma.product.create({
      data: {
        name,
        sku,
        quantity,
        threshold,
        unitPrice,
        description,
        companyId
      },
    });

    if (product){
      await prisma.auditLog.create({
        data: {
          action: 'CREATE',
          entity: 'Product',
          entityId: product.id,
          userId: session.user.id,
          companyId: companyId,
          url: req.url,
          description: `Created a ${product.name} product of $${product.unitPrice} each among ${product.quantity} in Stock`,
        },
      });
    }

    return NextResponse.json(product);
  } catch (err) {
    console.error('Create error:', err);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
