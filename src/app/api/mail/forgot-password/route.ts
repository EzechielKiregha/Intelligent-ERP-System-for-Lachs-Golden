import { NextRequest, NextResponse } from 'next/server';
import { render } from '@react-email/render';
import { Resend } from 'resend';
import ForgotPasswordEmail from 'emails/ForgotPasswordEmail';
import cuid2 from '@paralleldrive/cuid2';
import { prisma } from '@/lib/prisma';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const toEmail = searchParams.get("email");

  if (!toEmail) {
    const errorMessage = { error: 'Missing required fields: toEmail' };
    console.log(errorMessage);
    return NextResponse.json(errorMessage, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: toEmail } });
  if (!user) {
    const errorMessage = { error: 'If this email exists, a reset link has been sent.' };
    console.log(errorMessage);
    return NextResponse.json(errorMessage, { status: 400 });
  }

  const token = cuid2.createId();
  const resetPasswordLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;

  await prisma.user.update({
    where: { email: toEmail },
    data: { resetToken: token },
  });

  const emailHtml = render(ForgotPasswordEmail({
    userFirstname: user.firstName,
    resetPasswordLink,
  }));

  try {
    const { data, error } = await resend.emails.send({
      from: 'Intelligent ERP <onboarding@resend.dev>',
      to: [toEmail],
      subject: 'Reset Your Password',
      html: await emailHtml,
    });

    if (error) {
      const errorMessage = "[Error]: " + error;
      console.log(errorMessage);
      return NextResponse.json(errorMessage, { status: 400 });
    }

    const successMessage = { message: 'Forgot password email sent successfully', data };
    console.log(successMessage);
    return NextResponse.json(successMessage);
  } catch (err) {
    const errorMessage = { error: 'Failed to send forgot password email', details: err };
    console.log(errorMessage);
    return NextResponse.json(errorMessage, { status: 500 });
  }
}

export async function GET() {
  const message = { message: 'Forgot password route is ready to accept POST requests.' };
  console.log(message);
  return NextResponse.json(message);
}
