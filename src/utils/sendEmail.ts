// import nodemailer from "nodemailer";
// import env from "../../env.ts";

// const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 465,
//   secure: true,
//   auth: {
//     user: env.EMAIL_USER,
//     pass: env.EMAIL_PASSWORD,
//   },
// });

// interface EmailOptions {
//   to: string;
//   subject: string;
//   html: string;
// }

// export async function sendEmail({
//   to,
//   subject,
//   html,
// }: EmailOptions) {
//   await transporter.sendMail({
//     from: env.EMAIL_USER,
//     to,
//     subject,
//     html,
//   });
// }




import { Resend } from "resend";
import env from "../../env.ts";


const resend = new Resend(env.RESEND_API_KEY);

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
  const { data, error } = await resend.emails.send({
    from: "habitAPI <onboarding@resend.dev>",
    to,
    subject,
    html,
  });

  if (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }

  return data;
}
