import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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
      return NextResponse.json({ message: 'Invalid token or user not found' }, { status: 400 });
    }

    // Hash the new password
    const hashedPassword = await hash(password, 10);

    // Update the user's password and clear the reset token
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, resetToken: null },
    });

    return NextResponse.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('Reset-password error:', err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
