import { transporter } from './nodemailer';

export const sendEmail = async (to: string, subject: string, html: string) => {
  await transporter.sendMail({
    from: `"Intelligent ERP" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
};
