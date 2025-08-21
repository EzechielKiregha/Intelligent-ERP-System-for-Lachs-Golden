// app/api/settings/user/[id]/route.ts
import { hash } from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { Role, UserStatus } from '@/generated/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// 🔹 Input validation for user update
const userUpdateSchema = z.object({
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  email: z.string().email('Invalid email').optional(),
  role: z.nativeEnum(Role).optional(),
  status: z.nativeEnum(UserStatus).optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
});

// 🔹 Map Role to Workspace Name
function getWorkspaceNameByRole(role: Role): string {
  switch (role) {
    case Role.ACCOUNTANT:
      return 'Finance Space';
    case Role.HR:
      return 'Human Resource Space';
    case Role.EMPLOYEE:
      return 'Sales Space';
    case Role.ADMIN:
    case Role.MANAGER:
    case Role.CEO:
    default:
      return 'Lachs Golden Space';
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {

  const id = (await params).id

  if (!id) return NextResponse.json({ error: 'Account ID is missing' }, { status: 400 });
  try {
    // 1. 🔐 Auth & Role Check
    const session = await getServerSession(authOptions);
    if (!session?.user?.currentCompanyId || 
        (session.user.role !== Role.ADMIN && session.user.role !== Role.SUPER_ADMIN)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parseResult = userUpdateSchema.safeParse(body);
    
    if (!parseResult.success) {
      console.error('Validation error:', parseResult.error.format());
      return NextResponse.json(
        { message: 'Validation error', errors: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { firstName, lastName, email, role, status, password } = parseResult.data;
    const userId = id;
    const companyId = session.user.currentCompanyId;

    // 🔹 1. Check if user exists
    const existingUser = await prisma.user.findUnique({ 
      where: { 
        id: userId,
        companyId 
      } 
    });
    
    if (!existingUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // 🔹 2. Check if email is already used by another user
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({ where: { email } });
      if (emailExists) {
        return NextResponse.json({ message: 'Email already used' }, { status: 400 });
      }
    }

    // 🔹 3. Prepare update data
    const updateData: any = {};
    
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (status) updateData.status = status;
    
    if (password) {
      const hashedPassword = await hash(password, 10);
      updateData.password = hashedPassword;
    }

    // 🔹 4. Update User
    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    // 🔹 5. If role changed, update workspace membership
    if (role && role !== existingUser.role) {
      const workspaceName = getWorkspaceNameByRole(role);
      
      const workspace = await prisma.workspace.findFirst({
        where: {
          name: workspaceName,
          companyId,
        },
      });
      const dpt = await prisma.department.findFirst({
        where: {
          name: workspaceName,
          companyId,
        },
      });

      if (workspace) {
        // Update member role in the workspace
        await prisma.member.updateMany({
          where: {
            userId,
            workspaceId: workspace.id,
          },
          data: {
            role: role,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
          },
        });
      }

      if (dpt && user.employeeId) {
        // Update employee department if needed
        await prisma.employee.update({
          where: { id: user.employeeId },
          data: {
            departmentId: dpt.id,
          },
        });
      }
    }

    // 🔹 6. Log audit
    await prisma.auditLog.create({
      data: {
        companyId: user.companyId,
        action: 'UPDATE',
        description: `Updated user ID ${user.id} details`,
        url: `/api/settings/user/${user.id}`,
        entity: 'User',
        entityId: user.id,
        userId: session.user.id,
      },
    });

    return NextResponse.json(
      { message: 'User updated successfully.', user },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('Unexpected error during user update:', err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}