import { mailTransporter } from '../config/mail.js';

const SENDER_EMAIL = (process.env.USER_EMAIL || '').trim();
const SENDER_NAME = 'Ulavan Santhai';

/**
 * Sends a 6-digit verification code to the user's email address
 * @param {object} params
 * @param {string} params.to - Recipient email address
 * @param {string} params.name - Recipient user's name
 * @param {string} params.otp - 6-digit OTP string
 * @param {number} [params.expiresInMinutes=10] - Expiration duration in minutes
 * @returns {Promise<object>} Nodemailer send result
 */
export const sendVerificationEmail = async ({ to, name, otp, expiresInMinutes = 10 }) => {
  const mailOptions = {
    from: `"${SENDER_NAME}" <${SENDER_EMAIL}>`,
    to: to.trim().toLowerCase(),
    subject: `${otp} is your Ulavan Santhai Verification Code`,
    text: `Hello ${name},\n\nYour 6-digit verification code is: ${otp}\n\nThis code will expire in ${expiresInMinutes} minutes.\n\nIf you did not initiate this registration, please disregard this message.\n\nRegards,\nUlavan Santhai Team`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 24px;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); margin: 0 auto;">
          <!-- Header -->
          <tr>
            <td style="background-color: #1b5e20; padding: 24px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px;">Ulavan Santhai</h1>
              <p style="color: #c8e6c9; margin: 6px 0 0 0; font-size: 13px;">AGRICULTURAL MARKETPLACE</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 32px 28px;">
              <h2 style="color: #212121; margin: 0 0 12px 0; font-size: 18px; font-weight: 600;">Verify Your Email Address</h2>
              <p style="color: #555555; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
                Hello <strong>${name}</strong>,<br>
                Thank you for creating an account with Ulavan Santhai. Please enter the following 6-digit verification code on your screen to activate your account:
              </p>
              
              <!-- OTP Box -->
              <div style="background-color: #e8f5e9; border: 2px dashed #2e7d32; border-radius: 6px; padding: 18px; text-align: center; margin: 24px 0;">
                <span style="font-size: 32px; font-weight: 700; color: #1b5e20; letter-spacing: 6px; font-family: monospace;">${otp}</span>
                <p style="color: #2e7d32; font-size: 12px; margin: 8px 0 0 0; font-weight: 500;">Valid for ${expiresInMinutes} minutes</p>
              </div>

              <p style="color: #777777; font-size: 13px; line-height: 1.5; margin: 20px 0 0 0;">
                If you did not request this code, no further action is required. Your account will not be activated without this verification code.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #fafafa; padding: 16px; text-align: center; border-top: 1px solid #eeeeee;">
              <p style="color: #9e9e9e; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} Ulavan Santhai. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  const info = await mailTransporter.sendMail(mailOptions);
  console.log(`[EMAIL DISPATCHED] Verification code sent to ${to} (Message ID: ${info.messageId})`);
  return info;
};

