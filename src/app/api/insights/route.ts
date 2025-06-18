import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // Fetch insights from the database (example: AuditLog or Notification models)
    const insights = await prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 5, // Limit to the 5 most recent insights
    });

    return NextResponse.json(insights);
  } catch (error) {
    console.error('Error fetching AI insights:', error);
    return NextResponse.json({ error: 'Failed to fetch AI insights' }, { status: 500 });
  }
}