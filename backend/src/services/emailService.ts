import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Email Service
 * Handles sending emails for lead notifications and auto-replies
 *
 * Required environment variables:
 * - EMAIL_HOST (e.g., smtp.gmail.com)
 * - EMAIL_PORT (e.g., 587)
 * - EMAIL_USER (your email)
 * - EMAIL_PASS (your email password or app password)
 * - EMAIL_FROM (sender email)
 * - ADMIN_EMAIL (email to receive lead notifications)
 */

class EmailService {
  private transporter: any;
  private isConfigured: boolean;

  constructor() {
    this.transporter = null;
    this.isConfigured = false;
    this.init();
  }

  init() {
    // Check if email is configured
    const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM } = process.env;

    if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASS) {
      console.warn('⚠️  Email not configured. Set EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS in .env');
      console.warn('⚠️  Email notifications will be disabled');
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: EMAIL_HOST,
        port: parseInt(EMAIL_PORT),
        secure: EMAIL_PORT === '465', // true for 465, false for other ports
        auth: {
          user: EMAIL_USER,
          pass: EMAIL_PASS,
        },
      });

      this.isConfigured = true;
      console.log('✅ Email service configured');
    } catch (error: any) {
      console.error('❌ Email service configuration error:', error.message);
    }
  }

  /**
   * Send email notification to admin when new lead is captured
   */
  async sendLeadNotificationToAdmin(lead: any) {
    if (!this.isConfigured) {
      console.log('📧 Email not configured, skipping admin notification');
      return { success: false, message: 'Email not configured' };
    }

    const { EMAIL_FROM, ADMIN_EMAIL } = process.env;

    if (!ADMIN_EMAIL) {
      console.warn('⚠️  ADMIN_EMAIL not set, skipping notification');
      return { success: false, message: 'Admin email not set' };
    }

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a2e; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0d47c0 0%, #0a3a99 100%); color: white; padding: 40px 30px; border-radius: 16px 16px 0 0; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 700; color: white; }
    .header p { color: white; opacity: 0.95; }
    .content { background: #f8fafc; padding: 30px; border-radius: 0 0 16px 16px; }
    .info-box { background: white; padding: 24px; border-radius: 12px; margin: 15px 0; box-shadow: 0 4px 20px rgba(13, 71, 192, 0.08); border: 1px solid #e2e8f0; }
    .info-row { display: flex; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
    .info-row:last-child { border-bottom: none; }
    .info-label { font-weight: 600; width: 140px; color: #64748b; }
    .info-value { flex: 1; color: #1a1a2e; }
    .message-box { background: #fff3cd; border-left: 4px solid #ff6b35; padding: 18px; margin: 15px 0; border-radius: 0 8px 8px 0; }
    .button { display: inline-block; background: #0d47c0; color: white; padding: 14px 32px; text-decoration: none; border-radius: 9999px; margin: 10px 5px; font-weight: 600; box-shadow: 0 4px 12px rgba(13, 71, 192, 0.2); }
    .footer { text-align: center; color: #94a3b8; font-size: 13px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Lead Received!</h1>
      <p style="margin: 5px 0 0 0; opacity: 0.9;">You have a new ${lead.form_type} request from your website</p>
    </div>

    <div class="content">
      <div class="info-box">
        <h2 style="margin-top: 0; color: #0d47c0; font-weight: 700;">Contact Information</h2>
        <div class="info-row">
          <div class="info-label">Name:</div>
          <div class="info-value">${lead.name}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Email:</div>
          <div class="info-value"><a href="mailto:${lead.email}">${lead.email}</a></div>
        </div>
        ${lead.phone ? `
        <div class="info-row">
          <div class="info-label">Phone:</div>
          <div class="info-value"><a href="tel:${lead.phone}">${lead.phone}</a></div>
        </div>
        ` : ''}
        ${lead.company ? `
        <div class="info-row">
          <div class="info-label">Company:</div>
          <div class="info-value">${lead.company}</div>
        </div>
        ` : ''}
        ${lead.restaurantType ? `
        <div class="info-row">
          <div class="info-label">Restaurant Type:</div>
          <div class="info-value">${lead.restaurantType}</div>
        </div>
        ` : ''}
      </div>

      ${lead.message ? `
      <div class="info-box">
        <h2 style="margin-top: 0; color: #0d47c0; font-weight: 700;">Message</h2>
        <div class="message-box">
          <p style="margin: 0;">${lead.message.replace(/\n/g, '<br>')}</p>
        </div>
      </div>
      ` : ''}

      <div class="info-box">
        <h2 style="margin-top: 0; color: #0d47c0; font-weight: 700;">Lead Details</h2>
        <div class="info-row">
          <div class="info-label">Form Type:</div>
          <div class="info-value">${lead.formType || lead.form_type}</div>
        </div>
        ${lead.source ? `
        <div class="info-row">
          <div class="info-label">Source Page:</div>
          <div class="info-value">${lead.source}</div>
        </div>
        ` : ''}
        <div class="info-row">
          <div class="info-label">Submitted:</div>
          <div class="info-value">${new Date().toLocaleString()}</div>
        </div>
      </div>

      <div style="text-align: center; margin-top: 30px;">
        <a href="mailto:${lead.email}" class="button">Reply to ${lead.name}</a>
        ${lead.phone ? `<a href="tel:${lead.phone}" class="button">Call Now</a>` : ''}
      </div>

      <div class="footer">
        <p>This notification was sent from your Grubtech website lead generation system.</p>
        <p>Lead ID: #${lead.id || 'NEW'}</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    try {
      await this.transporter.sendMail({
        from: EMAIL_FROM || process.env.EMAIL_USER,
        to: ADMIN_EMAIL,
        subject: `New ${lead.formType || lead.form_type} Lead: ${lead.name}`,
        html: emailHtml,
      });

      console.log(`✅ Admin notification sent to ${ADMIN_EMAIL}`);
      return { success: true, message: 'Admin notified' };
    } catch (error: any) {
      console.error('❌ Error sending admin notification:', error.message);
      return { success: false, message: error.message };
    }
  }

  /**
   * Send auto-reply email to the person who submitted the form
   */
  async sendAutoReplyToLead(lead: any) {
    if (!this.isConfigured) {
      console.log('📧 Email not configured, skipping auto-reply');
      return { success: false, message: 'Email not configured' };
    }

    const { EMAIL_FROM } = process.env;

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.75; color: #1a1a2e; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0d47c0 0%, #0a3a99 100%); color: white; padding: 48px 40px; border-radius: 16px 16px 0 0; text-align: center; }
    .header h1 { margin: 0; font-size: 32px; font-weight: 700; color: white; }
    .header p { color: white; opacity: 0.95; }
    .content { background: #ffffff; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 8px 30px rgba(13, 71, 192, 0.12); }
    .highlight-box { background: #f0f5ff; border-left: 4px solid #0d47c0; padding: 24px; margin: 24px 0; border-radius: 0 12px 12px 0; box-shadow: 0 2px 8px rgba(13, 71, 192, 0.05); }
    .footer { text-align: center; color: #94a3b8; font-size: 13px; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0; }
    .button { display: inline-block; background: #0d47c0; color: white; padding: 16px 48px; text-decoration: none; border-radius: 9999px; margin: 24px 0; font-weight: 700; box-shadow: 0 4px 20px rgba(13, 71, 192, 0.25); }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Thank You, ${lead.name}!</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">We've received your ${lead.formType || lead.form_type} request</p>
    </div>

    <div class="content">
      <p>Hi ${lead.name.split(' ')[0]},</p>

      <p>Thank you for reaching out to Grubtech! We're excited to help transform your restaurant operations with our cutting-edge technology solutions.</p>

      <div class="highlight-box">
        <p style="margin: 0;"><strong>What happens next?</strong></p>
        <ol style="margin: 10px 0 0 0; padding-left: 20px;">
          <li>Our team will review your request</li>
          <li>We'll get back to you within 24 hours</li>
          <li>We'll schedule a personalized demo if needed</li>
        </ol>
      </div>

      <p>If you have any urgent questions, feel free to reply to this email directly.</p>

      <div style="text-align: center;">
        <a href="https://grubtech.com" class="button">Visit Our Website</a>
      </div>

      <p style="margin-top: 30px;">
        Best regards,<br>
        <strong>The Grubtech Team</strong>
      </p>

      <div class="footer">
        <p><strong>Grubtech</strong> | Restaurant Management Solutions</p>
        <p>Transforming restaurant operations with innovative technology</p>
        <p style="margin-top: 10px;">
          <a href="https://grubtech.com" style="color: #667eea; text-decoration: none;">Website</a> |
          <a href="https://grubtech.com/contact" style="color: #667eea; text-decoration: none;">Contact</a> |
          <a href="https://grubtech.com/privacy-policy" style="color: #667eea; text-decoration: none;">Privacy</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    try {
      await this.transporter.sendMail({
        from: `Grubtech <${EMAIL_FROM || process.env.EMAIL_USER}>`,
        to: lead.email,
        subject: `Thank you for contacting Grubtech, ${lead.name}!`,
        html: emailHtml,
      });

      console.log(`✅ Auto-reply sent to ${lead.email}`);
      return { success: true, message: 'Auto-reply sent' };
    } catch (error: any) {
      console.error('❌ Error sending auto-reply:', error.message);
      return { success: false, message: error.message };
    }
  }

  /**
   * Send both admin notification and auto-reply
   */
  async sendLeadEmails(lead: any) {
    const results = await Promise.allSettled([
      this.sendLeadNotificationToAdmin(lead),
      this.sendAutoReplyToLead(lead)
    ]);

    return {
      adminNotification: results[0].status === 'fulfilled' ? results[0].value : { success: false },
      autoReply: results[1].status === 'fulfilled' ? results[1].value : { success: false }
    };
  }
}

// Export singleton instance
export const emailService = new EmailService();
