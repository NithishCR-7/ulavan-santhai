import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const userEmail = (process.env.USER_EMAIL || '').trim();
const userPass = (process.env.USER_PASS || '').trim();

if (!userEmail || !userPass) {
  console.warn('[MAIL CONFIG] Warning: USER_EMAIL or USER_PASS is missing in .env');
}

/**
 * Reusable Nodemailer transporter configured for Gmail SMTP
 */
export const mailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: userEmail,
    pass: userPass,
  },
});

/**
 * Verifies SMTP connection health
 */
export const verifyMailConnection = async () => {
  try {
    await mailTransporter.verify();
    console.log(`[SMTP] Connected successfully via Gmail (${userEmail})`);
    return { ok: true };
  } catch (err) {
    console.error(`[SMTP ERROR] Connection failed: ${err.message}`);
    return { ok: false, error: err.message };
  }
};
