import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendForgotPasswordEmail } from '@/components/mailler-send/Otp';

export async function POST(req: Request) {
  try {
    const { email, token } = await req.json();

    if (!email || !token) {
      return NextResponse.json({ message: 'Email and token are required' }, { status: 400 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ message: 'If this email exists, a reset link has been sent.' });
    }

    // Save the token in the database
    await prisma.user.update({
      where: { email },
      data: { resetToken: token },
    });

    // Send the forgot password email
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}}`;
    await sendForgotPasswordEmail( user.firstName, email, resetUrl);

    return NextResponse.json({ message: 'Forgot password email sent successfully' });
  } catch (err) {
    console.error('Forgot password error:', err);
    return NextResponse.json({ message: 'Internal error: ' + err }, { status: 500 });
  }
}
