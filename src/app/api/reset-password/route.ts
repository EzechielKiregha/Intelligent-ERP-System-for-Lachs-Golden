import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { hash } from 'bcryptjs';
import { resetPasswordSchema } from '@/lib/validations/reset';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = resetPasswordSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { message: 'Validation error', errors: parseResult.error.format() },
        { status: 400 }
      );
    }
    const { token, password } = parseResult.data;

    // Find user by reset token
    const user = await prisma.user.findUnique({ where: { resetToken: token } });
    if (!user) {
      // Log failure directly using Prisma
      await prisma.auditLog.create({
        data: {
          companyId: "N/A",
          action: 'UPDATE_FAILED',
          description: `Failed password reset: Invalid token`,
          url: '/api/reset-password',
          entity: 'User',
          entityId: null,
          userId: null,
          timestamp: new Date(),
        },
      });
      return NextResponse.json({ message: 'Invalid token or user not found' }, { status: 400 });
    }

    // Hash the new password
    const hashedPassword = await hash(password, 10);

    // Update the user's password and clear the reset token
    const updateUser = await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, resetToken: null },
    });

    // Log success directly using Prisma
    await prisma.auditLog.create({
      data: {
        companyId: user.companyId || "N/A" ,
        action: 'UPDATE',
        description: `Password reset for user ID ${user.id}`,
        url: '/api/reset-password',
        entity: 'User',
        entityId: user.id,
        userId: user.id,
        timestamp: new Date(),
      },
    });

    return NextResponse.json({ message: 'Password reset successful' });
  } catch (err : any) {
    console.error('Reset-password error:', err);

    // Log failure directly using Prisma
    await prisma.auditLog.create({
      data: {
        companyId: "N/A",
        action: 'UPDATE_FAILED',
        description: `Failed password reset: ${err.message}`,
        url: '/api/reset-password',
        entity: 'User',
        entityId: null,
        userId: null,
        timestamp: new Date(),
      },
    });

    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
