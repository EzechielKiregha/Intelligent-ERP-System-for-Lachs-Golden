import { render } from '@react-email/render';
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";
import { OtpEmail, ForgotPasswordEmail, WelcomeEmail } from "./Email";
import { randomBytes } from "crypto";


const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY || '',
});

export const generateOtp = (): string => {
  return randomBytes(3).toString('hex').toUpperCase(); // Generates a 6-character OTP
};

export const sendOtp = async (toEmail: string, otp: string | undefined): Promise<{ sendTo: string; message: string }> => {

  const emailHtml = await render(<OtpEmail code={otp} />);

  const sentFrom = new Sender("alicebunani5@gmail.com", "Intelligent ERP");
  const recipients = [new Recipient(toEmail, "Dear User")];

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setSubject("Your OTP Code")
    .setHtml(emailHtml);

  await mailerSend.email.send(emailParams);

  return { message: "OTP sent successfully", sendTo: toEmail };
};

export const sendForgotPasswordEmail = async (toEmail: string, url: string, token: string): Promise<{ sendTo: string; message: string }> => {

  const emailHtml = await render(<ForgotPasswordEmail url={url} token={token} />);

  const sentFrom = new Sender("alicebunani5@gmail.com", "Intelligent ERP");
  const recipients = [new Recipient(toEmail, "Dear User")];

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setSubject("Reset Your Password")
    .setHtml(emailHtml);

  await mailerSend.email.send(emailParams);

  return { message: "Forgot password email sent successfully", sendTo: toEmail };
};

export const sendWelcomeEmail = async (toEmail: string, url: string, otp: string | undefined): Promise<{ sendTo: string; message: string }> => {

  const emailHtml = await render(<WelcomeEmail url={url} code={otp} />);

  const sentFrom = new Sender("alicebunani5@gmail.com", "Intelligent ERP");
  const recipients = [new Recipient(toEmail, "Dear User")];

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setSubject("Welcome to Our Platform")
    .setHtml(emailHtml);

  await mailerSend.email.send(emailParams);

  return { message: "Welcome email sent successfully", sendTo: toEmail };
};
