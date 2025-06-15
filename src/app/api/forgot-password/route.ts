import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // For MVP, we do not send actual emails.
  // You could log the email or integrate a mail service later.
  try {
    const { email } = await req.json();
    // Optionally, check if user exists: prisma.user.findUnique({ where: { email } })

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    // Simulate sending a reset link

    // But regardless, return generic response
    return NextResponse.json({ message: 'If this email exists, a reset link has been sent.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    return NextResponse.json({ message: 'Internal error : '+ err }, { status: 500 });
  }
}
