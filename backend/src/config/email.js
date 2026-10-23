const path = require('path');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');

// Ensure environment variables are loaded
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// Create reusable transporter object using SMTP transport
function createTransporter() {
  const user = process.env.EMAIL_USER;
  const rawPass = process.env.EMAIL_PASS;

  if (!user || !rawPass) {
    return null; // SMTP not configured, fallback to console logging
  }

  const pass = rawPass.replace(/\s+/g, '');

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: process.env.EMAIL_PORT === '465', // true for 465, false for 587
    auth: {
      user: user.trim(),
      pass: pass
    }
  });
}

/**
 * Send 6-digit OTP verification email to user
 * @param {string} toEmail - Recipient email
 * @param {string} otp - 6-digit OTP code
 */
async function sendOTPEmail(toEmail, otp) {
  const transporter = createTransporter();

  // If no SMTP configured, log cleanly for immediate testing
  if (!transporter) {
    console.log('\n======================================================');
    console.log(`📨 [EMAIL OTP SIMULATION]`);
    console.log(`Recipient: ${toEmail}`);
    console.log(`Verification Code: ${otp}`);
    console.log(`Expires in: 10 minutes`);
    console.log(`(Set EMAIL_USER and EMAIL_PASS in .env for real inbox delivery)`);
    console.log('======================================================\n');
    return { success: true, simulated: true, otp };
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f5f0; margin: 0; padding: 30px 10px; }
        .card { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 18px; border: 1px solid #e5e0d3; padding: 36px 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
        .logo { font-size: 24px; font-weight: 800; color: #1e3d2f; letter-spacing: -0.5px; margin-bottom: 24px; text-align: center; }
        .logo span { color: #2e7d32; }
        .title { font-size: 20px; font-weight: 700; color: #2d3748; margin-bottom: 12px; text-align: center; }
        .subtitle { font-size: 14px; color: #718096; line-height: 1.5; text-align: center; margin-bottom: 28px; }
        .otp-box { background: #f0f7f2; border: 2px dashed #2e7d32; border-radius: 12px; padding: 18px; text-align: center; margin-bottom: 24px; }
        .otp-code { font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #1e3d2f; font-family: monospace; }
        .expiry { font-size: 12px; color: #718096; margin-top: 8px; font-weight: 500; }
        .footer { font-size: 12px; color: #a0aec0; text-align: center; margin-top: 24px; border-top: 1px solid #edf2f7; padding-top: 18px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="logo">Agro<span>Bridge</span> 🌾</div>
        <div class="title">Verify Your Email Address</div>
        <div class="subtitle">Welcome to AgroBridge! Please enter the 6-digit verification code below to confirm your account:</div>
        
        <div class="otp-box">
          <div class="otp-code">${otp}</div>
          <div class="expiry">⏰ Valid for 10 minutes only</div>
        </div>

        <div class="subtitle" style="font-size: 13px; margin-bottom: 0;">
          If you did not request this verification, you can safely ignore this email.
        </div>

        <div class="footer">
          AgroBridge Sustainable Agricultural Marketplace • Direct Farm to Buyer
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"AgroBridge" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: `AgroBridge Verification Code: ${otp}`,
      text: `Your AgroBridge verification code is: ${otp}. It expires in 10 minutes.`,
      html: htmlContent
    });

    console.log(`[EMAIL OTP] Sent verification email to ${toEmail}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[EMAIL OTP ERROR] Failed to send email via SMTP:`, error.message);
    // Fallback to console so user is never blocked
    console.log(`[EMAIL OTP FALLBACK] Code for ${toEmail} is: ${otp}`);
    return { success: true, simulated: true, otp, error: error.message };
  }
}

module.exports = {
  sendOTPEmail
};
