import nodemailer from "nodemailer";

const EMAIL_FROM = process.env.EMAIL_FROM;
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASSWORD,
  },
});

// Sends an email through Gmail SMTP via Nodemailer.
export async function sendEmailNotification({ to, subject, text, html }) {
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    throw new Error(
      "Gmail SMTP is not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD.",
    );
  }

  try {
    await transporter.sendMail({
      from: `"MediLink" <${EMAIL_FROM || GMAIL_USER}>`,
      to,
      subject,
      text,
      html: html || undefined,
    });
  } catch (error) {
    console.error("Email send failed:", error.message);
    throw new Error(`Email send failed: ${error.message}`);
  }
}
