import { NextRequest, NextResponse } from 'next/server';
import { render } from '@react-email/render';
import { Resend } from 'resend';
import OtpEmail from 'emails/OtpEmail';
import { randomBytes } from 'crypto';
import { prisma } from '@/lib/prisma';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { toEmail } = await req.json().catch(() => null);

  if (!toEmail) {
    const errorMessage = { error: 'Missing required field: toEmail' };
    console.log(errorMessage);
    return NextResponse.json(errorMessage, { status: 400 });
  }

  const generateOtp = (): string => randomBytes(3).toString('hex').toUpperCase();

  const otp = generateOtp();

  const user = await prisma.user.findUnique({ where: { email: toEmail } });

  if (!user) {
    const errorMessage = { error: 'User with this email does not exist' };
    console.log(errorMessage);
    return NextResponse.json(errorMessage, { status: 400 });
  }

  await prisma.user.update({
    where: { email: toEmail },
    data: { otpSecret: otp },
  });

  const emailHtml = render(OtpEmail({ verificationCode: otp }));

  try {
    const { data, error } = await resend.emails.send({
      from: 'Intelligent ERP  <onboarding@resend.dev>',
      to: [toEmail],
      subject: 'Your OTP Code',
      html: await emailHtml,
    });

    if (error) {
      const errorMessage = "[Error]: " + error;
      console.log(errorMessage);
      return NextResponse.json(errorMessage, { status: 400 });
    }

    const successMessage = { message: 'OTP sent successfully', data };
    console.log(successMessage);
    return NextResponse.json(successMessage);
  } catch (err) {
    const errorMessage = { error: 'Failed to send OTP email', details: err };
    console.log(errorMessage);
    return NextResponse.json(errorMessage, { status: 500 });
  }
}

export async function GET() {
  const message = { message: 'OTP route is ready to accept POST requests.' };
  console.log(message);
  return NextResponse.json(message);
}
