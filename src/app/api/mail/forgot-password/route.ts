import { NextRequest, NextResponse } from 'next/server';
import { render } from '@react-email/render';
import { Resend } from 'resend';
import ForgotPasswordEmail from 'emails/ForgotPasswordEmail';
import cuid2 from '@paralleldrive/cuid2';
import { prisma } from '@/lib/prisma';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { toEmail } = await req.json().catch(() => null);

  if (!toEmail) {
    return NextResponse.json({ error: 'Missing required fields: toEmail' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: toEmail } });
  if (!user) {
    return NextResponse.json({ error: 'If this email exists, a reset link has been sent.' }, { status: 400 });
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
      return NextResponse.json(error, { status: 400 });
    }

    return NextResponse.json({ message: 'Forgot password email sent successfully', data });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to send forgot password email', details: err }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Forgot password route is ready to accept POST requests.' });
}
