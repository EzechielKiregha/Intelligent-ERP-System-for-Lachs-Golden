import OtpEmail from 'emails/OtpEmail';
import { randomBytes } from 'crypto';
import prisma from "@/lib/prisma";
import { NextResponse } from 'next/server';
import { render } from '@react-email/render';
import { sendEmail } from '@/lib/sendEmail';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email are required' }, { status: 400 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`[POST] Generated OTP: ${otp}`);

    const userExist = await prisma.user.findUnique({
      where: { email },
      include: { company: true },
    });
  
    if (!userExist) {
      return NextResponse.json({ error: 'User not found' }, { status: 400 });
    }
  
    // Update OTP in DB
    await prisma.user.update({
      where: { email },
      data: { otpSecret: otp },
    });

    const html = await render(OtpEmail({ verificationCode: otp }));

    await sendEmail(email, 'Your OTP Code', html);

    return NextResponse.json({ message: 'OTP email sent successfully' });
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
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
  // const otp = Math.floor(100000 + Math.random() * 900000).toString();
  // console.log(`[POST] Generated OTP: ${otp}`);

//   // Lookup user
  // const userExist = await prisma.user.findUnique({
  //   where: { email: toEmail },
  //   include: { company: true },
  // });

  // if (!userExist) {
  //   return NextResponse.json({ error: 'User not found' }, { status: 400 });
  // }

  // // Update OTP in DB
  // await prisma.user.update({
  //   where: { email: toEmail },
  //   data: { otpSecret: otp },
  // });

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
