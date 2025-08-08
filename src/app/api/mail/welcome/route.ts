import { NextRequest, NextResponse } from 'next/server';
import { render } from '@react-email/render';
import { Resend } from 'resend';
import WelcomeEmail, { PreviewProps } from 'emails/WelcomeEmail';
import prisma from "@/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  console.log('[POST] Received request to send Welcome email');
    const { toEmail } = await req.json();
    console.log(`[POST] Parsed request body: toEmail=${toEmail}`);
  
    if (!toEmail) {
      const errorMessage = { error: 'Missing required field: toEmail' };
      console.log('[POST] Validation failed:', errorMessage);
      return NextResponse.json(errorMessage, { status: 400 });
    }

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

  try {
    const { data, error } = await resend.emails.send({
      from: `${userExist.company?.name}  <support@intelligenterp.dpdns.org>`,
      to: [toEmail],
      subject: `Welcome to ${userExist.company?.name}'s Intelligent ERP`,
      html: await render(WelcomeEmail(PreviewProps)),
      text:  `Welcome to ${userExist.company?.name}'s Intelligent ERP`,
    });

    if (error) {
      return NextResponse.json(error, { status: 400 });
    }

    return NextResponse.json({ message: 'Welcome email sent successfully', data });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to send welcome email', details: err }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Welcome email route is ready to accept POST requests.' });
}
