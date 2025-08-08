import { NextRequest, NextResponse } from 'next/server';
import { render } from '@react-email/render';
import { Resend } from 'resend';
import OtpEmail from 'emails/OtpEmail';
import { randomBytes } from 'crypto';
import prisma from "@/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  console.log('[POST] Received request to send OTP');
  const { toEmail } = await req.json();
  console.log(`[POST] Parsed request body: toEmail=${toEmail}`);

  if (!toEmail) {
    const errorMessage = { error: 'Missing required field: toEmail' };
    console.log('[POST] Validation failed:', errorMessage);
    return NextResponse.json(errorMessage, { status: 400 });
  }

  // const generateOtp = (): string => randomBytes(3).toString('hex').toUpperCase();
  const generateOtp = (): string => {
    const otp = Math.floor(100000 + Math.random() * 900000); // generates a 6-digit number
    return otp.toString();
  };
  const otp = generateOtp();
  console.log(`[POST] Generated OTP: ${otp}`);

  // Fetch user and company information
  const userExist = await prisma.user.findUnique({
    where: { email: toEmail },
    include: {
      company: true, // Include company information
    },
  });
  console.log(`[POST] User lookup result: ${userExist ? 'User found' : 'User not found'}`);

  if (!userExist) {
    const errorMessage = { error: 'User with this email does not exist' };
    console.log('[POST] Validation failed:', errorMessage);
    return NextResponse.json(errorMessage, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { email: toEmail },
    data: { otpSecret: otp },
  });
  console.log('[POST] Updated user OTP secret in database');

  const emailHtml = render(OtpEmail({ verificationCode: otp }));
  console.log('[POST] Rendered OTP email HTML');

  try {
    const { data, error } = await resend.emails.send({
      from: `${userExist.company?.name} ERP  <support@intelligenterp.dpdns.org>`,
      to: [user.email],
      subject: `Your Intelligent ERP OTP: ${otp}`,
      html: await emailHtml,
      text: `Your OTP is ${otp}. It will expire in 10 minutes. If you didn’t request this, ignore the message.`,
    });

    if (error) {
      const errorMessage = "[Error]: " + error.message;
      console.log('[POST] Email sending failed:', errorMessage);
      return NextResponse.json(errorMessage, { status: 400 });
    }

    const successMessage = { message: 'OTP sent successfully', data };
    console.log('[POST] Email sent successfully:', successMessage);
    return NextResponse.json(successMessage);
  } catch (err) {
    const errorMessage = { error: 'Failed to send OTP email', details: err };
    console.log('[POST] Unexpected error occurred:', errorMessage);
    return NextResponse.json(errorMessage, { status: 500 });
  }
}

export async function GET() {
  console.log('[GET] Received request to check OTP route readiness');
  const message = { message: 'OTP route is ready to accept POST requests.' };
  console.log('[GET] Response:', message);
  return NextResponse.json(message);
}
