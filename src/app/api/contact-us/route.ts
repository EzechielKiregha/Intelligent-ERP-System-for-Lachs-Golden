import { NextResponse } from 'next/server';
import  prisma  from '@/lib/prisma'; // Ensure you have Prisma setup

export async function GET() {
  const notifications = await prisma.notification.findMany();
  return NextResponse.json(notifications);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { message, type, email } = body;

  const notification = await prisma.notification.create({
    data: { message, type, userEmail: email },
  });

  return NextResponse.json(notification);
}

export async function DELETE(req: Request) {
  const { id } = await req.json();

  await prisma.notification.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
