import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.currentCompanyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const companyId = session.user.currentCompanyId;

  try {
    const auditLogs = await prisma.auditLog.findMany({
      where: { companyId },
      orderBy: { timestamp: 'desc' },
      take: 50, // Limit to the most recent 50 logs
    });

    return NextResponse.json(auditLogs);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
    const {companyId, action, description, url, entity, entityId, userId } = body;

    // Validate required fields
    if (!action || !description || !url || !entity || !entityId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    await prisma.auditLog.create({
      data: {
        companyId,
        action,
        description,
        url,
        entity,
        entityId,
        userId: userId || "N/A", // Use session user ID if not provided
        timestamp: new Date(),
      },
    });
}