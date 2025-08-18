
// app/api/mail/welcome/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { render } from '@react-email/render';
import prisma from '@/lib/prisma';
import WelcomeEmail, { PreviewProps } from 'emails/WelcomeEmail';
import { sendEmailJS } from '@/lib/emailjs';

const SERVICE = process.env.EMAILJS_SERVICE_ID!;
const TEMPLATE = process.env.EMAILJS_TEMPLATE_WELCOME_ID!;
const USER_ID = process.env.EMAILJS_USER_ID!;
const ACCESSTOKEN = process.env.EMAILJS_PRIVATE_KEY!;
const DOCS_URL = process.env.NEXT_PUBLIC_DOCS_URL ?? 'https://intelligenterp.dpdns.org/docs';
const SUPPORT_URL = process.env.NEXT_PUBLIC_SUPPORT_URL ?? 'https://intelligenterp.dpdns.org/support';

export async function POST(req: NextRequest) {
  try {
    const { toEmail } = await req.json();
    if (!toEmail) return NextResponse.json({ error: 'Missing toEmail' }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email: toEmail }, include: { company: true } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Render welcome HTML
    const html = render(WelcomeEmail(PreviewProps));

    await sendEmailJS({
      service_id: SERVICE,
      template_id: TEMPLATE,
      user_id: USER_ID,
      template_params: {
        to_name: user.firstName ?? user.name ?? 'User',
        email: user.email,
        company: user.company?.name ?? 'Intelligent ERP',
        link_docs: DOCS_URL,
        link_support: SUPPORT_URL,
        // html,
      },
      accessToken: ACCESSTOKEN,
    });

    return NextResponse.json({ message: 'Welcome email sent' });
  } catch (err: any) {
    console.error('Welcome route error:', err);
    const status = err?.status ?? 500;
    const details = err?.body ?? err?.message ?? err;
    return NextResponse.json({ error: 'Failed to send welcome email', details }, { status });
  }
}





// import { NextRequest, NextResponse } from 'next/server';
// import { render } from '@react-email/render';
// import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";
// import WelcomeEmail, { PreviewProps } from 'emails/WelcomeEmail';
// import prisma from "@/lib/prisma";

// const mailerSend = new MailerSend({
//   apiKey: process.env.MAILERSEND_API_KEY || '',
// });

// export async function POST(req: NextRequest) {
//   console.log('[POST] Received request to send Welcome email');
//   const { toEmail } = await req.json();

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

//   try {
//     const emailHtml = render(WelcomeEmail(PreviewProps));

//     const correctedEmail = await Promise.resolve(emailHtml)

//     const emailParams = new EmailParams()
//       .setFrom(new Sender("support@intelligenterp.dpdns.org", `${userExist.company?.name || "Intelligent ERP"} Team`))
//       .setTo([new Recipient(toEmail, userExist.firstName || "User")])
//       .setSubject(`Welcome to ${userExist.company?.name || "Intelligent ERP"}`)
//       .setHtml(correctedEmail)
//       .setText(`Welcome to ${userExist.company?.name || "Intelligent ERP"}! We're excited to have you onboard.`);

//     const response = await mailerSend.email.send(emailParams);

//     return NextResponse.json({ message: 'Welcome email sent successfully', response });
//   } catch (err: any) {
//     return NextResponse.json({ error: 'Failed to send welcome email', details: err.message }, { status: 500 });
//   }
// }

// export async function GET() {
//   return NextResponse.json({ message: 'Welcome email route is ready (MailerSend)' });
// }





// import { NextRequest, NextResponse } from 'next/server';
// import { render } from '@react-email/render';
// import { Resend } from 'resend';
// import WelcomeEmail, { PreviewProps } from 'emails/WelcomeEmail';
// import prisma from "@/lib/prisma";

// const resend = new Resend(process.env.RESEND_API_KEY);

// export async function POST(req: NextRequest) {
//   console.log('[POST] Received request to send Welcome email');
//     const { toEmail } = await req.json();
//     console.log(`[POST] Parsed request body: toEmail=${toEmail}`);
  
//     if (!toEmail) {
//       const errorMessage = { error: 'Missing required field: toEmail' };
//       console.log('[POST] Validation failed:', errorMessage);
//       return NextResponse.json(errorMessage, { status: 400 });
//     }

//     // Fetch user and company information
//   const userExist = await prisma.user.findUnique({
//     where: { email: toEmail },
//     include: {
//       company: true, // Include company information
//     },
//   });
//   console.log(`[POST] User lookup result: ${userExist ? 'User found' : 'User not found'}`);

//   if (!userExist) {
//       const errorMessage = { error: 'User with this email does not exist' };
//       console.log('[POST] Validation failed:', errorMessage);
//       return NextResponse.json(errorMessage, { status: 400 });
//     }

//   try {
//     const { data, error } = await resend.emails.send({
//       from: `${userExist.company?.name}  <support@intelligenterp.dpdns.org>`,
//       to: [toEmail],
//       subject: `Welcome to ${userExist.company?.name}'s Intelligent ERP`,
//       html: await render(WelcomeEmail(PreviewProps)),
//       text:  `Welcome to ${userExist.company?.name}'s Intelligent ERP`,
//     });

//     if (error) {
//       return NextResponse.json(error, { status: 400 });
//     }

//     return NextResponse.json({ message: 'Welcome email sent successfully', data });
//   } catch (err) {
//     return NextResponse.json({ error: 'Failed to send welcome email', details: err }, { status: 500 });
//   }
// }

// export async function GET() {
//   return NextResponse.json({ message: 'Welcome email route is ready to accept POST requests.' });
// }
