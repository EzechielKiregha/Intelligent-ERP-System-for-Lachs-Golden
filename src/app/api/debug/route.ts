// /app/api/debug/route.ts

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL ? '✅ PRESENT' : '❌ MISSING',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '✅ PRESENT' : '❌ MISSING',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || '❌ MISSING',
  });
}

