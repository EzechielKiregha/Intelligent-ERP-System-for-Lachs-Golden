import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createWriteStream } from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json();
    const { type, dateRange } = body;

    // Define date range for filtering
    const now = new Date();
    let startDate: Date;

    if (dateRange === 'last7days') {
      startDate = new Date(now.setDate(now.getDate() - 7));
    } else if (dateRange === 'last30days') {
      startDate = new Date(now.setDate(now.getDate() - 30));
    } else if (dateRange === 'lastquarter') {
      startDate = new Date(now.setMonth(now.getMonth() - 3));
    } else {
      startDate = new Date(now.setDate(now.getDate() - 7)); // Default to last 7 days
    }

    let reportData;

    // Generate report data based on type
    switch (type) {
      case 'revenue':
        reportData = await prisma.transaction.groupBy({
          by: ['date'],
          _sum: { amount: true },
          where: {
            category: {
              type: 'INCOME',
            },
            date: {
              gte: startDate,
            },
          },
          orderBy: { date: 'asc' },
        });
        break;

      case 'expenses':
        reportData = await prisma.transaction.groupBy({
          by: ['date'],
          _sum: { amount: true },
          where: {
            category: {
              type: 'EXPENSE',
            },
            date: {
              gte: startDate,
            },
          },
          orderBy: { date: 'asc' },
        });
        break;

      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
    }

    // Generate a CSV file (example implementation)
    const filePath = path.join(process.cwd(), 'public', `${type}-report.csv`);
    const stream = createWriteStream(filePath);
    stream.write('Date,Amount\n');
    reportData.forEach((entry) => {
      stream.write(`${entry.date.toISOString()},${entry._sum.amount || 0}\n`);
    });
    stream.end();

    return NextResponse.json({
      message: 'Report generated successfully',
      fileUrl: `/public/${type}-report.csv`,
    });
  } catch (error) {
    console.error('Error generating financial report:', error);
    return NextResponse.json({ error: 'Failed to generate financial report' }, { status: 500 });
  }
}