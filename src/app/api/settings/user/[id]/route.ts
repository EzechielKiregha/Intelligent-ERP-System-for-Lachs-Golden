// app/api/settings/user/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { Role, UserStatus } from '@/generated/prisma';

const UpdateUserSchema = z.object({
  role: z.nativeEnum(Role).optional(),
  status: z.nativeEnum(UserStatus).optional(),
  workspaceId: z.string().optional()
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {

  const id = (await params).id

  if (!id) return NextResponse.json({ error: 'Contact ID is missing' }, { status: 400 });
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.currentCompanyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const companyId = session.user.currentCompanyId;
    const userId = id;
    
    // Verify the user exists and belongs to the company
    const user = await prisma.user.findFirst({
      where: { 
        id: userId,
        companyId 
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const validatedData = UpdateUserSchema.parse(body);
    
    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role: validatedData.role,
        status: validatedData.status
      }
    });

    // If workspaceId is provided and role has changed, update member record
    if (validatedData.workspaceId && validatedData.role) {
      await prisma.member.updateMany({
        where: { userId },
        data: {
          role: validatedData.role,
          workspaceId: validatedData.workspaceId
        }
      });
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}