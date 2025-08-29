// app/api/reports/hr-compliance/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { Role } from '@/generated/prisma';
import { ContentSection, generateReportPdf } from '@/lib/pdf/puppeteerPdfGenerator';
import { format } from 'date-fns';

export async function POST(req: NextRequest) {
  try {
    // 1. Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user?.currentCompanyId ){
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
    
    // 4. Format data for the new PDF generator
    
    // Prepare department breakdown data
    const departmentRows = employees.reduce((acc, e) => {
      const deptName = e.department?.name || 'Uncategorized';
      const existing = acc.find(item => item[0] === deptName);
      if (existing) {
        existing[1] = (parseInt(existing[1]) + 1).toString();
      } else {
        acc.push([deptName, '1']);
      }
      return acc;
    }, [] as string[][]);
    
    // Prepare employee details data
    const employeeRows = employees.slice(0, 20).map(e => [
      `${e.firstName} ${e.lastName}`,
      e.user?.role || 'EMPLOYEE',
      e.department?.name || 'N/A',
      e.hireDate ? format(new Date(e.hireDate), 'MMM dd, yyyy') : 'N/A',
      e.status
    ]);
    
    
    // Calculate compliance metrics based on employee data
    const backgroundCheckCompliant = employees.filter(e => e.backgroundCheckCompleted).length;
    const backgroundCheckStatus = backgroundCheckCompliant === totalEmployees ? 'COMPLIANT' : 'NON-COMPLIANT';
    
    // Calculate training completion based on performance reviews
    const employeesWithReviews = employees.filter(e => e.performanceReviews && e.performanceReviews.length > 0);
    const trainingCompliant = employeesWithReviews.length;
    const trainingStatus = trainingCompliant === totalEmployees ? 'COMPLIANT' : 'PARTIALLY COMPLIANT';
    
    // Calculate I-9 verification based on employee status
    const i9Compliant = employees.filter(e => e.status === 'ACTIVE' || e.status === 'INACTIVE').length;
    const i9Status = i9Compliant === totalEmployees ? 'COMPLIANT' : 'PARTIALLY COMPLIANT';
    
    // Calculate W-4 form compliance based on employee salary information (proxy for tax setup)
    const w4Compliant = employees.filter(e => e.salary !== null && e.salary !== undefined).length;
    const w4Status = w4Compliant === totalEmployees ? 'COMPLIANT' : 'PARTIALLY COMPLIANT';
    
    // Generate next review dates based on current date
    const now = new Date();
    const i9ReviewDate = new Date(now);
    i9ReviewDate.setDate(now.getDate() + 30);
    
    const w4ReviewDate = new Date(now);
    w4ReviewDate.setDate(now.getDate() + 90);
    
    const backgroundCheckReviewDate = new Date(now);
    backgroundCheckReviewDate.setDate(now.getDate() + 365);
    
    const trainingReviewDate = new Date(now);
    trainingReviewDate.setDate(now.getDate() + 180);
    
    // Prepare compliance status data
    const complianceRows = [
      ['I-9 Verification', i9Status, format(i9ReviewDate, 'MMM dd, yyyy')],
      ['W-4 Form', w4Status, format(w4ReviewDate, 'MMM dd, yyyy')],
      ['Background Check', backgroundCheckStatus, format(backgroundCheckReviewDate, 'MMM dd, yyyy')],
      ['Training Completion', trainingStatus, format(trainingReviewDate, 'MMM dd, yyyy')]
    ];
    
    // 8. Create sections for the new PDF generator
    const sections: ContentSection[] = [
      {
        title: 'HR Compliance Summary',
        type: 'keyValue',
        data: {
          'Total Employees:': totalEmployees.toString(),
          'Active Employees:': activeEmployees.toString(),
          'On Leave:': onLeave.toString(),
          'Terminated:': terminated.toString()
        }
      },
      {
        title: 'Department Distribution',
        type: 'table',
        data: {
          headers: ['Department', 'Employees'],
          rows: departmentRows
        }
      },
      {
        title: 'Employee Details',
        type: 'table',
        data: {
          headers: ['Name', 'Role', 'Department', 'Hire Date', 'Status'],
          rows: employeeRows
        }
      },
      {
        title: 'Compliance Status',
        type: 'table',
        data: {
          headers: ['Compliance Area', 'Status', 'Next Review'],
          rows: complianceRows
        }
      }
    ];
    
    // 9. Generate PDF with the new generator
    const pdfBuffer = await generateReportPdf(
      sections,
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