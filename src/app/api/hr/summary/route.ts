import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { TaskStatus } from '@/generated/prisma';

export async function GET(_: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.currentCompanyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const companyId = session.user.currentCompanyId
  try {
    const [
      totalEmployees,
      departmentCount,
      pendingTasks,
      documentCount,
      payrollThisMonth,
    ] = await Promise.all([
      prisma.employee.count({
        where:{companyId}
      }),
      prisma.department.count({
        where:{companyId}
      }),
      prisma.task.count({ where: { companyId, status: TaskStatus.BACKLOG } }),
      prisma.document.count({
        where:{companyId}
      }),
      prisma.payroll.findMany({
        where:{companyId},
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
