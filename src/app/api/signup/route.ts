import { hash } from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SignUpInput, signUpSchema } from '@/lib/validations/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null); // Handle invalid JSON input
    if (!body) {
      return NextResponse.json({ message: 'Request body is required' }, { status: 400 });
    }

    // Validate request body
    const parseResult = signUpSchema.safeParse(body);
    if (!parseResult.success) {
      const formatted = parseResult.error.format();
      return NextResponse.json(
        { message: "Validation error", errors: formatted },
        { status: 400 }
      );
    }
    const { firstName, lastName, company, email, password } = parseResult.data as SignUpInput;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return NextResponse.json({ message: 'Email already used' }, { status: 400 });

    let companyRecord = await prisma.company.findFirst({ where: { name: company } });
    if (!companyRecord) {
      companyRecord = await prisma.company.create({
        data: { 
          name: 'Lachs Golden & Co',
          contactEmail: 'contact@lachsgolden.com',
          timezone: 'UTC-05:00',
          dateFormat: 'YYYY-MM-DD',
        },
      });
    }

    const hashedPassword = await hash(password, 10);

    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        companyId: companyRecord.id,
        role: 'USER',
      },
    });

    return NextResponse.json({ message: 'Account created' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
