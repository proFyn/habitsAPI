import nodemailer from "nodemailer";
import env from "../../env.ts";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASSWORD,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({
  to,
  subject,
  html,
}: EmailOptions) {
  await transporter.sendMail({
    from: env.EMAIL_USER,
    to,
    subject,
    html,
  });
}
