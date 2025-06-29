import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(_: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const [
      totalEmployees,
      departmentCount,
      pendingTasks,
      documentCount,
      payrollThisMonth,
    ] = await Promise.all([
      prisma.employee.count(),
      prisma.department.count(),
      prisma.task.count({ where: { status: 'PENDING' } }),
      prisma.document.count(),
      prisma.payroll.findMany({
        select : {
          id : true,
          netAmount : true
        }
      })
    ])

    const totalPayrollThisMonth = payrollThisMonth.reduce((sum, payroll) => sum + payroll.netAmount , 0)

    return NextResponse.json({
      totalEmployees,
      departmentCount,
      pendingTasks,
      documentCount,
      totalPayrollThisMonth,
    })
  } catch (error) {
    console.error('HR summary error:', error)
    return NextResponse.json(
      { error: 'Failed to load HR summary' },
      { status: 500 }
    )
  }
}
