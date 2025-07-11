// app/api/inventory/update/route.ts
import { authOptions } from '@/lib/auth';
import  prisma  from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(req: NextRequest) {

  const session = await getServerSession(authOptions);
  
  if (!session?.user?.currentCompanyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, name, sku, quantity, threshold, description } = body;

    const product = await prisma.product.update({
      where: { id },
      data: { name, sku, quantity, threshold, description },
    });

    if (product){
          await prisma.auditLog.create({
            data: {
              action: 'UPDATE',
              entity: 'Product',
              entityId: product.id,
              userId: session.user.id,
              companyId: session.user.currentCompanyId,
              url: req.url,
              description: `Updated a ${product.name} product of $${product.unitPrice} each among ${product.quantity} in Stock`,
            },
          });
        }

    return NextResponse.json(product);
  } catch (err) {
    console.error('Update error:', err);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}
