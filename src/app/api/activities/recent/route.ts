import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
    
    if (!session?.user?.currentCompanyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const companyId = session.user.currentCompanyId
  try {
    // Fetch recent activities, ordered by timestamp
    const recentActivities = await prisma.auditLog.findMany({
      where:{companyId},
      orderBy: { timestamp: 'desc' },
      take: 10, // Limit to the 10 most recent activities
    });

    return NextResponse.json(recentActivities);
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    return NextResponse.json({ error: 'Failed to fetch recent activities' }, { status: 500 });
  }
}