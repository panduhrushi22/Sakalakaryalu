import nodemailer from 'nodemailer';

const SENDER_EMAIL = process.env.ADMIN_EMAIL || 'sakalakaryalu@gmail.com';
const GMAIL_PASSWORD = (process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASSWORD || '').replace(/\s+/g, '');
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GMAIL_REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN || '';

export async function sendOtpEmail(toEmail: string, otpCode: string): Promise<{ sent: boolean; message: string }> {
  try {
    let transporter: nodemailer.Transporter | null = null;

    // Method 1: Google OAuth2 with Client ID, Secret, and Refresh Token
    if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && GMAIL_REFRESH_TOKEN) {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: SENDER_EMAIL,
          clientId: GOOGLE_CLIENT_ID,
          clientSecret: GOOGLE_CLIENT_SECRET,
          refreshToken: GMAIL_REFRESH_TOKEN,
        },
      });
    }
    // Method 2: Standard Gmail App Password / SMTP
    else if (GMAIL_PASSWORD) {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: SENDER_EMAIL,
          pass: GMAIL_PASSWORD,
        },
      });
    }

    if (transporter) {
      const mailOptions = {
        from: `"Sakalakaryalu" <${SENDER_EMAIL}>`,
        to: toEmail,
        subject: `${otpCode} is your Sakalakaryalu Verification Code`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e7e5e4; border-radius: 16px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h2 style="color: #92400e; margin: 0 0 6px 0; font-size: 22px; letter-spacing: 0.05em;">SAKALAKARYALU</h2>
              <p style="color: #78716c; font-size: 13px; margin: 0;">Spiritual & Ritual Services Platform</p>
            </div>
            <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 20px;">
              <p style="color: #78350f; font-size: 13px; margin: 0 0 12px 0; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Your Email Verification Code</p>
              <div style="font-size: 32px; font-weight: 800; letter-spacing: 0.25em; color: #1c1917; font-family: monospace;">${otpCode}</div>
              <p style="color: #92400e; font-size: 11px; margin: 12px 0 0 0;">This code will expire in 10 minutes.</p>
            </div>
            <p style="color: #57534e; font-size: 13px; line-height: 1.5; margin: 0 0 16px 0;">
              Sent from <strong>${SENDER_EMAIL}</strong> to verify your account registration. If you did not request this code, please disregard this email.
            </p>
            <div style="border-top: 1px solid #f5f5f4; padding-top: 16px; text-align: center;">
              <p style="color: #a8a29e; font-size: 11px; margin: 0;">© Sakalakaryalu. All rights reserved.</p>
            </div>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log(`[Email] OTP sent to ${toEmail} from ${SENDER_EMAIL}`);
      return { sent: true, message: `Email successfully delivered to ${toEmail}` };
    } else {
      console.log(`[Email Notice] Mail delivery requires GMAIL_APP_PASSWORD in .env for ${SENDER_EMAIL}. Generated OTP for ${toEmail}: ${otpCode}`);
      return { 
        sent: false, 
        message: 'Email service is not configured yet. Please add GMAIL_APP_PASSWORD to .env so the OTP passcode can be sent to your Gmail inbox.' 
      };
    }
  } catch (error: any) {
    console.error('[Email Error] Failed to send email:', error);
    return { sent: false, message: error.message || 'Transmission error' };
  }
}
