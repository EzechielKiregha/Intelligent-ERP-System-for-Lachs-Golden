// app/api/db-test/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const result = await prisma.user.findMany({ take: 1 });
    return NextResponse.json({ ok: true, users: result });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
