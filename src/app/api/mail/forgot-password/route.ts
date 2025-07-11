import { NextRequest, NextResponse } from 'next/server';
import { render } from '@react-email/render';
import { Resend } from 'resend';
import ForgotPasswordEmail from 'emails/ForgotPasswordEmail';
import cuid2 from '@paralleldrive/cuid2';
import prisma from "@/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const toEmail = searchParams.get("email");

  if (!toEmail) {
    const errorMessage = { error: 'Missing required fields: toEmail' };
    console.log(errorMessage);
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

  const token = cuid2.createId();
  const resetPasswordLink = `https://intelligenterp.dpdns.org/reset-password?token=${token}`;

  await prisma.user.update({
    where: { email: toEmail },
    data: { resetToken: token },
  });

  const emailHtml = render(ForgotPasswordEmail({
    userFirstname: userExist.firstName,
    resetPasswordLink,
  }));

  try {
    const { data, error } = await resend.emails.send({
      from: `${userExist.company?.name}  <noreply@intelligenterp.dpdns.org>`,
      to: [toEmail],
      subject: 'Reset Your Password',
      html: await emailHtml,
    });

    if (error) {
      const errorMessage = "[Error]: " + error;
      console.log(errorMessage);

      // Log failure using axiosdb
      await prisma.auditLog.create({
        data:{
          companyId : userExist.companyId || "N/A",
          action: 'EMAIL_FAILED',
          description: `Failed to send forgot password email to ${toEmail}`,
          url: '/api/mail/forgot-password',
          entity: 'Email',
          entityId: null,
          userId: userExist.id || "N/A"
        }
      })

      return NextResponse.json(errorMessage, { status: 400 });
    }

     // Log success using axiosdb
     await prisma.auditLog.create(
      {
        data: {
          companyId : "N/A",
          action: 'EMAIL_SENT',
          description: `Forgot password email sent to ${toEmail}`,
          url: '/api/mail/forgot-password',
          entity: 'Email',
          entityId: null,
          userId: userExist.id
        }
      }
    )

    const successMessage = { message: 'Forgot password email sent successfully', data };
    console.log(successMessage);

    return NextResponse.json(successMessage);
  } catch (err:any) {
    const errorMessage = { error: 'Failed to send forgot password email', details: err };
    console.log(errorMessage);

    // Log failure using axiosdb
    await prisma.auditLog.create(
      {
        data : {
          companyId : userExist.companyId || "N/A",
          action: 'EMAIL_FAILED',
          description: `Failed to send forgot password email to ${toEmail}: ${err.message}`,
          url: '/api/mail/forgot-password',
          entity: 'Email',
          entityId: null,
          userId: userExist.id || "N/A"
        }
      }
    )

    return NextResponse.json(errorMessage, { status: 500 });
  }
}

export async function GET() {
  const message = { message: 'Forgot password route is ready to accept POST requests.' };
  console.log(message);
  return NextResponse.json(message);
}
