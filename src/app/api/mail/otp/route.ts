// app/api/mail/otp/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { render } from '@react-email/render';
import prisma from '@/lib/prisma';
import OtpEmail from 'emails/OtpEmail';
import { sendEmailJS } from '@/lib/emailjs';

const SERVICE = process.env.EMAILJS_SERVICE_ID!;
const TEMPLATE = process.env.EMAILJS_TEMPLATE_OTP_ID!;
const USER_ID = process.env.EMAILJS_USER_ID!;
const ACCESSTOKEN = process.env.EMAILJS_PRIVATE_KEY!;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://intelligenterp.dpdns.org';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const toEmail = body?.toEmail;
    if (!toEmail) return NextResponse.json({ error: 'Missing toEmail' }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email: toEmail }, include: { company: true } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Generate 6-digit OTP and expiry
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // Persist OTP (and optional expiry field)
    await prisma.user.update({
      where: { email: toEmail },
      data: { otpSecret: otp },
    });

    // Render HTML from React Email
    const html = render(OtpEmail({ verificationCode: otp }));

    // Send via EmailJS
    await sendEmailJS({
      service_id: SERVICE,
      template_id: TEMPLATE,
      user_id: USER_ID,
      template_params: {
        to_name: user.firstName ?? user.name ?? 'User',
        email: user.email,
        company: user.company?.name ?? 'Intelligent ERP',
        company_website: BASE_URL,
        code: otp,
        // html, // optional — if your EmailJS template places {{html}}
      },
      accessToken : ACCESSTOKEN,
    });

    console.log("OTP was sent is :", otp)

    return NextResponse.json({ message: 'OTP sent successfully' });
  } catch (err: any) {
    console.error('OTP route error:', err);
    const status = err?.status ?? 500;
    const details = err?.body ?? err?.message ?? err;
    return NextResponse.json({ error: 'Failed to send OTP', details }, { status });
  }
}








// import { NextRequest, NextResponse } from 'next/server';
// import { render } from '@react-email/render';
// import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";
// import OtpEmail from 'emails/OtpEmail';
// import prisma from "@/lib/prisma";

// // Initialize MailerSend
// const mailerSend = new MailerSend({
//   apiKey: process.env.MAILERSEND_API_KEY || '',
// });

// export async function POST(req: NextRequest) {
//   console.log('[POST] Received request to send OTP');
//   const { toEmail } = await req.json();

//   if (!toEmail) {
//     return NextResponse.json({ error: 'Missing required field: toEmail' }, { status: 400 });
//   }

//   // Generate OTP
//   const otp = Math.floor(100000 + Math.random() * 900000).toString();
//   console.log(`[POST] Generated OTP: ${otp}`);

//   // Lookup user
//   const userExist = await prisma.user.findUnique({
//     where: { email: toEmail },
//     include: { company: true },
//   });

//   if (!userExist) {
//     return NextResponse.json({ error: 'User not found' }, { status: 400 });
//   }

//   // Update OTP in DB
//   await prisma.user.update({
//     where: { email: toEmail },
//     data: { otpSecret: otp },
//   });

//   // Render email HTML
//   const emailHtml = render(OtpEmail({ verificationCode: otp }));

//   const correctedEmail = await Promise.resolve(emailHtml);

//   try {
//     const emailParams = new EmailParams()
//       .setFrom(new Sender("support@intelligenterp.dpdns.org", `${userExist.company?.name || "Intelligent ERP"} Support`))
//       .setTo([new Recipient(userExist.email, userExist.name || "User")])
//       .setSubject(`Your Intelligent ERP OTP: ${otp}`)
//       .setHtml(correctedEmail)
//       .setText(`Your OTP is ${otp}. It will expire in 10 minutes. If you didn’t request this, ignore the message.`);

//     const response = await mailerSend.email.send(emailParams);

//     console.log('[POST] OTP email sent:', response);
//     return NextResponse.json({ message: 'OTP sent successfully' });
//   } catch (err: any) {
//     console.error('[POST] MailerSend failed:', err);
//     return NextResponse.json({ error: 'Failed to send OTP email', details: err.message }, { status: 500 });
//   }
// }

// export async function GET() {
//   return NextResponse.json({ message: 'OTP route ready with MailerSend' });
// }






// import { NextRequest, NextResponse } from 'next/server';
// import { render } from '@react-email/render';
// import { Resend } from 'resend';
// import OtpEmail from 'emails/OtpEmail';
// import { randomBytes } from 'crypto';
// import prisma from "@/lib/prisma";

// const resend = new Resend(process.env.RESEND_API_KEY);

// export async function POST(req: NextRequest) {
//   console.log('[POST] Received request to send OTP');
//   const { toEmail } = await req.json();
//   console.log(`[POST] Parsed request body: toEmail=${toEmail}`);

//   if (!toEmail) {
//     const errorMessage = { error: 'Missing required field: toEmail' };
//     console.log('[POST] Validation failed:', errorMessage);
//     return NextResponse.json(errorMessage, { status: 400 });
//   }

//   // const generateOtp = (): string => randomBytes(3).toString('hex').toUpperCase();
//   const generateOtp = (): string => {
//     const otp = Math.floor(100000 + Math.random() * 900000); // generates a 6-digit number
//     return otp.toString();
//   };
//   const otp = generateOtp();
//   console.log(`[POST] Generated OTP: ${otp}`);

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

//   const user = await prisma.user.update({
//     where: { email: toEmail },
//     data: { otpSecret: otp },
//   });
//   console.log('[POST] Updated user OTP secret in database');

//   const emailHtml = render(OtpEmail({ verificationCode: otp }));
//   console.log('[POST] Rendered OTP email HTML');

//   try {
//     const { data, error } = await resend.emails.send({
//       from: `${userExist.company?.name} ERP  <support@intelligenterp.dpdns.org>`,
//       to: [user.email],
//       subject: `Your Intelligent ERP OTP: ${otp}`,
//       html: await emailHtml,
//       text: `Your OTP is ${otp}. It will expire in 10 minutes. If you didn’t request this, ignore the message.`,
//     });

//     if (error) {
//       const errorMessage = "[Error]: " + error.message;
//       console.log('[POST] Email sending failed:', errorMessage);
//       return NextResponse.json(errorMessage, { status: 400 });
//     }

//     const successMessage = { message: 'OTP sent successfully', data };
//     console.log('[POST] Email sent successfully:', successMessage);
//     return NextResponse.json(successMessage);
//   } catch (err) {
//     const errorMessage = { error: 'Failed to send OTP email', details: err };
//     console.log('[POST] Unexpected error occurred:', errorMessage);
//     return NextResponse.json(errorMessage, { status: 500 });
//   }
// }

// export async function GET() {
//   console.log('[GET] Received request to check OTP route readiness');
//   const message = { message: 'OTP route is ready to accept POST requests.' };
//   console.log('[GET] Response:', message);
//   return NextResponse.json(message);
// }
