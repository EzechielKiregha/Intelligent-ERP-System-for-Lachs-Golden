import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // Fetch recent activities, ordered by timestamp
    const recentActivities = await prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 10, // Limit to the 10 most recent activities
    });

    return NextResponse.json(recentActivities);
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    return NextResponse.json({ error: 'Failed to fetch recent activities' }, { status: 500 });
  }
}