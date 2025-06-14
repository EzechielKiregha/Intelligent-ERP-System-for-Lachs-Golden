import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // For MVP, we do not send actual emails.
  // You could log the email or integrate a mail service later.
  try {
    const { email } = await req.json();
    // Optionally, check if user exists: prisma.user.findUnique({ where: { email } })
    // But regardless, return generic response
    return NextResponse.json({ message: 'If this email exists, a reset link has been sent.' });
  } catch (err) {
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}
