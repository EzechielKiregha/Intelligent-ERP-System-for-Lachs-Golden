import { NextRequest, NextResponse } from 'next/server';
import { render } from '@react-email/render';
import { Resend } from 'resend';
import WelcomeEmail, { PreviewProps } from 'emails/WelcomeEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { toEmail } = await req.json().catch(() => null);

  if (!toEmail) {
    return NextResponse.json({ error: 'Missing required field: toEmail' }, { status: 400 });
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'Intelligent ERP <onboarding@resend.dev>',
      to: [toEmail],
      subject: 'Welcome to Intelligent ERP',
      html: await render(WelcomeEmail(PreviewProps)),
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
