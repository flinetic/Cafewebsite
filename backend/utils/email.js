/**
 * Email Utility
 * Handles all email sending functionality
 * Supports both Resend (for cloud/production) and Gmail SMTP (for local development)
 * @module utils/email
 */

require("dotenv").config();
const nodemailer = require("nodemailer");

// Try to load Resend - it may not be installed in all environments
let Resend;
try {
  Resend = require("resend").Resend;
} catch (e) {
  console.log("Resend package not installed, using SMTP only");
}

// Create Gmail SMTP transporter (for local development)
const createSMTPTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

/**
 * Send email using Resend (cloud-friendly) or Gmail SMTP (local)
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email HTML content
 * @param {string} options.text - Plain text content (optional)
 */
const sendEmail = async ({ to, subject, html, text }) => {
  // Use Resend if API key is available (recommended for production/cloud)
  if (process.env.RESEND_API_KEY && Resend) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const { data, error } = await resend.emails.send({
        from: process.env.EMAIL_FROM || "BookAVibe <onboarding@resend.dev>",
        to: [to],
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ""),
      });

      if (error) {
        console.error("Resend error:", error);
        throw new Error(error.message);
      }

      console.log("Email sent via Resend:", data?.id);
      return data;
    } catch (error) {
      console.error("Resend email sending failed:", error);
      throw error;
    }
  }

  // Fallback to Gmail SMTP (for local development)
  try {
    const transporter = createSMTPTransporter();

    const mailOptions = {
      from: `"BookAVibe Cafe" <${process.env.SMTP_EMAIL}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ""), // Strip HTML for text version
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent via SMTP:", info.messageId);
    return info;
  } catch (error) {
    console.error("SMTP email sending failed:", error);
    throw error;
  }
};


/**
 * Email templates
 */
const emailTemplates = {
  /**
   * Email verification template
   */
  verifyEmail: (name, verifyURL) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; border-radius: 16px 16px 0 0; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px;">☕ BookAVibe</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Cafe Management System</p>
        </div>
        
        <div style="background: #ffffff; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">Welcome, ${name}! 🎉</h2>
          
          <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            Thank you for joining BookAVibe! You're just one step away from accessing your account.
          </p>
          
          <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
            Please verify your email address by clicking the button below:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyURL}" 
               style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
              Verify Email Address
            </a>
          </div>
          
          <p style="color: #888; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>
          <p style="word-break: break-all; color: #667eea; font-size: 14px; margin: 10px 0 0 0;">
            ${verifyURL}
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; margin: 0;">
            This link will expire in 24 hours.<br>
            If you didn't create this account, you can safely ignore this email.
          </p>
        </div>
        
        <div style="text-align: center; padding: 20px;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            © ${new Date().getFullYear()} BookAVibe. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `,

  /**
   * Password reset template
   */
  resetPassword: (name, resetURL) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; border-radius: 16px 16px 0 0; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px;">☕ BookAVibe</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Cafe Management System</p>
        </div>
        
        <div style="background: #ffffff; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">Password Reset Request 🔐</h2>
          
          <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            Hi ${name},
          </p>
          
          <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            We received a request to reset your password. Click the button below to create a new password:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetURL}" 
               style="display: inline-block; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 15px rgba(245, 87, 108, 0.4);">
              Reset Password
            </a>
          </div>
          
          <p style="color: #888; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>
          <p style="word-break: break-all; color: #667eea; font-size: 14px; margin: 10px 0 0 0;">
            ${resetURL}
          </p>
          
          <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 15px; margin: 30px 0;">
            <p style="color: #856404; font-size: 14px; margin: 0;">
              ⚠️ <strong>Important:</strong> This link expires in 30 minutes.
            </p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; margin: 0;">
            If you didn't request a password reset, please ignore this email or contact support if you have concerns.
          </p>
        </div>
        
        <div style="text-align: center; padding: 20px;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            © ${new Date().getFullYear()} BookAVibe. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `,

  /**
   * Welcome email template (after verification)
   */
  welcome: (name, role) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; border-radius: 16px 16px 0 0; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px;">☕ BookAVibe</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Cafe Management System</p>
        </div>
        
        <div style="background: #ffffff; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">Welcome to the Team! 🎊</h2>
          
          <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            Hi ${name},
          </p>
          
          <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            Your account has been verified and you're now part of the BookAVibe team as a <strong style="color: #667eea;">${role}</strong>.
          </p>
          
          <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            Here's what you can do next:
          </p>
          
          <ul style="color: #555; font-size: 16px; line-height: 1.8; padding-left: 20px;">
            <li>Complete your profile</li>
            <li>Explore the dashboard</li>
            <li>Start managing orders and tasks</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard" 
               style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600;">
              Go to Dashboard
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; margin: 0;">
            If you have any questions, feel free to reach out to your administrator.
          </p>
        </div>
        
        <div style="text-align: center; padding: 20px;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            © ${new Date().getFullYear()} BookAVibe. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `,

  /**
   * Account deactivated notification
   */
  accountDeactivated: (name) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; border-radius: 16px 16px 0 0; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px;">☕ BookAVibe</h1>
        </div>
        
        <div style="background: #ffffff; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">Account Deactivated</h2>
          
          <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            Hi ${name},
          </p>
          
          <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            Your BookAVibe account has been deactivated. You will no longer be able to access the system.
          </p>
          
          <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            If you believe this was done in error, please contact your administrator.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; margin: 0;">
            © ${new Date().getFullYear()} BookAVibe. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `,
};

module.exports = {
  sendEmail,
  emailTemplates,
};
