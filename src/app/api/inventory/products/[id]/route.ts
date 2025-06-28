// app/api/inventory/products/[id]/route.ts
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(_:NextRequest,{params}:{params:{id:string}}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const prod = await prisma.product.findUnique({ where:{id:params.id} })
  return NextResponse.json(prod)
}

export async function PATCH(req:NextRequest,{params}:{params:{id:string}}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json()
  const updated = await prisma.product.update({
    where:{id:params.id},
    data:body
  })
  return NextResponse.json(updated)
}

export async function DELETE(req : NextRequest) {

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")

  if (!id)  return NextResponse.json({ message : "Product ID is missing"}, {status : 400})

  const session = await getServerSession(authOptions);
  
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  
  try {
    const product = await prisma.product.delete({ where: { id } });

    if (product){
          await prisma.auditLog.create({
            data: {
              action: 'DELETE',
              entity: 'Product',
              entityId: product.id,
              userId: session.user.id,
              companyId: session.user.companyId,
              url: req.url,
              description: `Delete a ${product.name} product`,
            },
          });
        }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Delete error:', err);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
