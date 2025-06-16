import { render } from '@react-email/render';
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";
import OtpEmail from 'emails/OtpEmail';
import ForgotPasswordEmail from 'emails/ForgotPasswordEmail';
import WelcomeEmail from 'emails/WelcomeEmail';


const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY || '',
});

export const sendOtp = async (toEmail: string, otp: string | undefined): Promise<{ sendTo: string; message: string }> => {

  const emailHtml = await render(<OtpEmail verificationCode={otp} />);

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

export const sendForgotPasswordEmail = async (firstname: string | null, toEmail: string, url: string): Promise<{ sendTo: string; message: string }> => {

  const emailHtml = await render(<ForgotPasswordEmail userFirstname={firstname} resetPasswordLink={url} />);

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

export const sendWelcomeEmail = async (toEmail: string): Promise<{ sendTo: string; message: string }> => {

  const emailHtml = await render(<WelcomeEmail />);

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
