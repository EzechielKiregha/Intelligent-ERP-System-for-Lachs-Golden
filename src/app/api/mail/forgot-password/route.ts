// app/api/mail/forgot-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { render } from '@react-email/render';
import prisma from '@/lib/prisma';
import cuid2 from '@paralleldrive/cuid2';
import ForgotPasswordEmail from 'emails/ForgotPasswordEmail';
import { sendEmailJS } from '@/lib/emailjs';

const SERVICE = process.env.EMAILJS_SERVICE_ID!;
const TEMPLATE = process.env.EMAILJS_TEMPLATE_FORGOT_ID!;
const USER_ID = process.env.EMAILJS_USER_ID!;
const ACCESSTOKEN = process.env.EMAILJS_PRIVATE_KEY!;
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://intelligenterp.dpdns.org';

export async function POST(req: NextRequest) {
  try {
    const { email: toEmail } = await req.json();
    if (!toEmail) return NextResponse.json({ error: 'Missing email' }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email: toEmail }, include: { company: true } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // create token and expiry
    const token = cuid2.createId();
    const resetLink = `${BASE_URL}/reset-password?token=${token}`;
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { email: toEmail },
      data: { resetToken: token },
    });

    const html = render(ForgotPasswordEmail({
      userFirstname: user.firstName ?? user.name ?? 'User',
      resetPasswordLink: resetLink,
    }));

    await sendEmailJS({
      service_id: SERVICE,
      template_id: TEMPLATE,
      user_id: USER_ID,
      template_params: {
        to_name: user.firstName ?? user.name ?? 'User',
        email: user.email,
        company: user.company?.name ?? 'Intelligent ERP',
        reset_link: resetLink,
        // html,
      },
      accessToken: ACCESSTOKEN,
    });

    // audit log success
    try {
      await prisma.auditLog.create({
        data: {
          companyId: user.companyId ?? 'N/A',
          action: 'EMAIL_SENT',
          description: `Forgot password email sent to ${toEmail}`,
          url: '/api/mail/forgot-password',
          entity: 'Email',
          entityId: null,
          userId: user.id,
        },
      });
    } catch (auditErr) {
      console.warn('Failed to write audit log:', auditErr);
    }

    return NextResponse.json({ message: 'Forgot password email sent' });
  } catch (err: any) {
    console.error('Forgot-password route error:', err);

    // try to write audit failure log if we have userId info (best-effort)
    try {
      const body = await req.json().catch(() => ({} as any));
      const attemptedEmail = body?.email;
      const maybeUser = attemptedEmail ? await prisma.user.findUnique({ where: { email: attemptedEmail } }) : null;
      if (maybeUser) {
        await prisma.auditLog.create({
          data: {
            companyId: maybeUser.companyId ?? 'N/A',
            action: 'EMAIL_FAILED',
            description: `Failed to send forgot password email to ${attemptedEmail}: ${err?.message ?? err}`,
            url: '/api/mail/forgot-password',
            entity: 'Email',
            entityId: null,
            userId: maybeUser.id,
          },
        });
      }
    } catch (auditErr) {
      console.warn('Failed to write failure audit log:', auditErr);
    }

    const status = err?.status ?? 500;
    const details = err?.body ?? err?.message ?? err;
    return NextResponse.json({ error: 'Failed to send forgot password email', details }, { status });
  }
}




// import { NextRequest, NextResponse } from 'next/server';
// import { render } from '@react-email/render';
// import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";
// import ForgotPasswordEmail from 'emails/ForgotPasswordEmail';
// import cuid2 from '@paralleldrive/cuid2';
// import prisma from "@/lib/prisma";

// const mailerSend = new MailerSend({
//   apiKey: process.env.MAILERSEND_API_KEY || '',
// });

// export async function POST(req: NextRequest) {
//   const { searchParams } = new URL(req.url);
//   const toEmail = searchParams.get("email");

//   if (!toEmail) {
//     return NextResponse.json({ error: 'Missing required field: toEmail' }, { status: 400 });
//   }

//   const userExist = await prisma.user.findUnique({
//     where: { email: toEmail },
//     include: { company: true },
//   });

//   if (!userExist) {
//     return NextResponse.json({ error: 'User not found' }, { status: 400 });
//   }

//   const token = cuid2.createId();
//   const resetPasswordLink = `https://intelligenterp.dpdns.org/reset-password?token=${token}`;

//   await prisma.user.update({
//     where: { email: toEmail },
//     data: { resetToken: token },
//   });

//   const emailHtml = render(ForgotPasswordEmail({
//     userFirstname: userExist.firstName,
//     resetPasswordLink,
//   }));

//   const correctedEmail = await Promise.resolve(emailHtml)

//   try {
//     const emailParams = new EmailParams()
//       .setFrom(new Sender("noreply@intelligenterp.dpdns.org", `${userExist.company?.name || "Intelligent ERP"} Security`))
//       .setTo([new Recipient(toEmail, userExist.firstName || "User")])
//       .setSubject("Reset Your Password")
//       .setHtml(correctedEmail)
//       .setText(`Hi ${userExist.firstName}, click the following link to reset your password: ${resetPasswordLink}`);

//     const response = await mailerSend.email.send(emailParams);

//     // Audit logging (success)
//     await prisma.auditLog.create({
//       data: {
//         companyId: userExist.companyId || "N/A",
//         action: 'EMAIL_SENT',
//         description: `Forgot password email sent to ${toEmail}`,
//         url: '/api/mail/forgot-password',
//         entity: 'Email',
//         entityId: null,
//         userId: userExist.id,
//       },
//     });

//     return NextResponse.json({ message: 'Forgot password email sent successfully', response });
//   } catch (err: any) {
//     // Audit logging (failure)
//     await prisma.auditLog.create({
//       data: {
//         companyId: userExist.companyId || "N/A",
//         action: 'EMAIL_FAILED',
//         description: `Failed to send forgot password email to ${toEmail}: ${err.message}`,
//         url: '/api/mail/forgot-password',
//         entity: 'Email',
//         entityId: null,
//         userId: userExist.id,
//       },
//     });

//     return NextResponse.json({ error: 'Failed to send forgot password email', details: err.message }, { status: 500 });
//   }
// }

// export async function GET() {
//   return NextResponse.json({ message: 'Forgot password route is ready (MailerSend)' });
// }








// import { NextRequest, NextResponse } from 'next/server';
// import { render } from '@react-email/render';
// import { Resend } from 'resend';
// import ForgotPasswordEmail from 'emails/ForgotPasswordEmail';
// import cuid2 from '@paralleldrive/cuid2';
// import prisma from "@/lib/prisma";

// const resend = new Resend(process.env.RESEND_API_KEY);

// export async function POST(req: NextRequest) {
//   const { searchParams } = new URL(req.url);
//   const toEmail = searchParams.get("email");

//   if (!toEmail) {
//     const errorMessage = { error: 'Missing required fields: toEmail' };
//     console.log(errorMessage);
//     return NextResponse.json(errorMessage, { status: 400 });
//   }

//   // Fetch user and company information
//   const userExist = await prisma.user.findUnique({
//     where: { email: toEmail },
//     include: {
//       company: true, // Include company information
//     },
//   });

//   console.log(`[POST] User lookup result: ${userExist ? 'User found' : 'User not found'}`);
//   if (!userExist) {
//     const errorMessage = { error: 'User with this email does not exist' };
//     console.log('[POST] Validation failed:', errorMessage);
//     return NextResponse.json(errorMessage, { status: 400 });
//   }

//   const token = cuid2.createId();
//   const resetPasswordLink = `https://intelligenterp.dpdns.org/reset-password?token=${token}`;

//   await prisma.user.update({
//     where: { email: toEmail },
//     data: { resetToken: token },
//   });

//   const emailHtml = render(ForgotPasswordEmail({
//     userFirstname: userExist.firstName,
//     resetPasswordLink,
//   }));

//   try {
//     const { data, error } = await resend.emails.send({
//       from: `${userExist.company?.name}  <noreply@intelligenterp.dpdns.org>`,
//       to: [toEmail],
//       subject: 'Reset Your Password',
//       html: await emailHtml,
//     });

//     if (error) {
//       const errorMessage = "[Error]: " + error;
//       console.log(errorMessage);

//       // Log failure using axiosdb
//       await prisma.auditLog.create({
//         data:{
//           companyId : userExist.companyId || "N/A",
//           action: 'EMAIL_FAILED',
//           description: `Failed to send forgot password email to ${toEmail}`,
//           url: '/api/mail/forgot-password',
//           entity: 'Email',
//           entityId: null,
//           userId: userExist.id || "N/A"
//         }
//       })

//       return NextResponse.json(errorMessage, { status: 400 });
//     }

//      // Log success using axiosdb
//      await prisma.auditLog.create(
//       {
//         data: {
//           companyId : "N/A",
//           action: 'EMAIL_SENT',
//           description: `Forgot password email sent to ${toEmail}`,
//           url: '/api/mail/forgot-password',
//           entity: 'Email',
//           entityId: null,
//           userId: userExist.id
//         }
//       }
//     )

//     const successMessage = { message: 'Forgot password email sent successfully', data };
//     console.log(successMessage);

//     return NextResponse.json(successMessage);
//   } catch (err:any) {
//     const errorMessage = { error: 'Failed to send forgot password email', details: err };
//     console.log(errorMessage);

//     // Log failure using axiosdb
//     await prisma.auditLog.create(
//       {
//         data : {
//           companyId : userExist.companyId || "N/A",
//           action: 'EMAIL_FAILED',
//           description: `Failed to send forgot password email to ${toEmail}: ${err.message}`,
//           url: '/api/mail/forgot-password',
//           entity: 'Email',
//           entityId: null,
//           userId: userExist.id || "N/A"
//         }
//       }
//     )

//     return NextResponse.json(errorMessage, { status: 500 });
//   }
// }

// export async function GET() {
//   const message = { message: 'Forgot password route is ready to accept POST requests.' };
//   console.log(message);
//   return NextResponse.json(message);
// }
