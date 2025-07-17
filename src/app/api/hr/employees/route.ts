import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import z from 'zod';

export async function GET(_: NextRequest) {
   const session = await getServerSession(authOptions);
    
  if (!session?.user?.currentCompanyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const companyId = session.user.currentCompanyId

  const list = await prisma.employee.findMany({
    where:{ companyId },
    include: { department: true },
    orderBy: { createdAt: 'desc' },
  })
  
  return NextResponse.json(list)
}



const empSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  hireDate: z.coerce.date().optional(),
  jobTitle: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']),
  departmentId: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
    
  if (!session?.user?.currentCompanyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const companyId = session.user.currentCompanyId

  const body = await req.json()

  const parsed = empSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid data', issues: parsed.error.issues }, { status: 400 })
  }
  const {
    firstName,
    lastName,
    email,
    phone,
    hireDate,
    jobTitle,
    status,
    departmentId
  } = parsed.data

  const emp = await prisma.employee.create({ data: {
    firstName,
    lastName,
    email,
    phone,
    hireDate,
    jobTitle,
    status,
    departmentId,
    companyId
  } })
  return NextResponse.json(emp)
}
