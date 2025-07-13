// /api/owner-companies/route.ts
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { Role } from '@/generated/prisma';

export async function GET(req: NextRequest , { params }: { params: Promise<{ companyId: string }> }) {

  const companyId = (await params).companyId
  const session = await getServerSession(authOptions);
  if (!session?.user?.id && !companyId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const company = await prisma.company.findUnique({
      where: {
        id : companyId
      },
      include : { images : {
        select : { url : true },
        take : 1
      } }
    });

    // console.log("[ Companies ] ",comps)
    
    return NextResponse.json({company});
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Failed to fetch companies' }, { status: 500 });
  }
}