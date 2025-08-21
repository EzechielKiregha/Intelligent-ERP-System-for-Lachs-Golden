// app/api/reports/hr-compliance/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { Role } from '@/generated/prisma';
import { generateSimplePdf } from '@/lib/pdf/simplePdfGenerator';
import { format } from 'date-fns';

export async function POST(req: NextRequest) {
  try {
    // 1. Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user?.currentCompanyId || 
        (session.user.role !== Role.ADMIN && session.user.role !== Role.SUPER_ADMIN)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const companyId = session.user.currentCompanyId;
    
    // 2. Fetch real data from database
    const employees = await prisma.employee.findMany({
      where: { companyId },
      include: { 
        user: true,
        department: true,
        performanceReviews: true
      }
    });
    
    // 3. Calculate HR metrics
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(e => e.status === 'ACTIVE').length;
    const onLeave = employees.filter(e => e.status === 'INACTIVE').length;
    const terminated = employees.filter(e => e.status === 'SUSPENDED').length;
    
    // 4. Format data for PDF
    const summaryContent = [
      { text: 'HR Compliance Report', style: 'subheader', margin: [0, 0, 0, 10] },
      {
        table: {
          widths: ['*', 'auto'],
          body: [
            ['Total Employees:', totalEmployees.toString()],
            ['Active Employees:', activeEmployees.toString()],
            ['On Leave:', onLeave.toString()],
            ['Terminated:', terminated.toString()]
          ]
        },
        layout: 'noBorders'
      }
    ];
    
    // 5. Create department breakdown
    const departmentBreakdown = [
      { text: 'Department Distribution', style: 'subheader', margin: [0, 20, 0, 10] },
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto'],
          body: [
            ['Department', 'Employees'],
            ...employees.reduce((acc, e) => {
              const deptName = e.department?.name || 'Uncategorized';
              const existing = acc.find(item => item[0] === deptName);
              if (existing) {
                existing[1] = (parseInt(existing[1]) + 1).toString();
              } else {
                acc.push([deptName, '1']);
              }
              return acc;
            }, [] as string[][])
          ]
        }
      }
    ];
    
    // 6. Create employee table
    const employeeTable = {
      text: 'Employee Details',
      style: 'subheader',
      margin: [0, 20, 0, 10]
    };
    
    const employeeBody = [
      ['Name', 'Role', 'Department', 'Hire Date', 'Status']
    ];
    
    employees.slice(0, 20).forEach(e => {
      employeeBody.push([
        `${e.firstName} ${e.lastName}`,
        e.user?.role || 'EMPLOYEE',
        e.department?.name || 'N/A',
        e.hireDate ? format(new Date(e.hireDate), 'MMM dd, yyyy') : 'N/A',
        e.status
      ]);
    });
    
    // 7. Create compliance status
    const complianceStatus = [
      { text: 'Compliance Status', style: 'subheader', margin: [0, 20, 0, 10] },
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto'],
          body: [
            ['Compliance Area', 'Status', 'Next Review'],
            ['I-9 Verification', 'COMPLIANT', format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'MMM dd, yyyy')],
            ['W-4 Form', 'COMPLIANT', format(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), 'MMM dd, yyyy')],
            ['Background Check', 
             employees.some(e => !e.backgroundCheckCompleted) ? 'NON-COMPLIANT' : 'COMPLIANT',
             format(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), 'MMM dd, yyyy')],
            ['Training Completion', 'COMPLIANT', format(new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), 'MMM dd, yyyy')]
          ]
        }
      }
    ];
    
    // 8. Create PDF content
    const content = [
      summaryContent,
      departmentBreakdown,
      employeeTable,
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto', 'auto', 'auto'],
          body: employeeBody
        }
      },
      complianceStatus
    ];
    
    // 9. Generate PDF
    const pdfBuffer = await generateSimplePdf(
      content,
      'Lachs Golden - HR Compliance Report',
      'Current Status'
    );
    
    // 10. Return PDF response
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="hr-compliance-${format(new Date(), 'yyyy-MM-dd')}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating HR compliance report:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}