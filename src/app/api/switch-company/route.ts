// /api/switch-company/route.ts
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const switchCompanySchema = z.object({
  companyId: z.string().min(1, 'Company ID is required'),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { companyId } = switchCompanySchema.parse(body);

    // Check if the user is an owner of the company
    const company = await prisma.company.findFirst({
      where: {
        id: companyId,
        owners: {
          some: {
            id: session.user.id,
          },
        },
      },
    });

    if (!company) {
      return NextResponse.json({ message: 'Unauthorized: Not an owner of this company' }, { status: 403 });
    }

    // Update the user's currentCompanyId
    await prisma.user.update({
      where: { id: session.user.id },
      data: { currentCompanyId: companyId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Failed to switch company' }, { status: 500 });
  }
}