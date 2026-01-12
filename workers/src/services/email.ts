/**
 * Email Service for Cloudflare Workers
 * HTTP-based email API replacing Nodemailer SMTP
 *
 * Supports both Resend and SendGrid APIs.
 * Default: Resend (recommended for simplicity)
 *
 * Required environment secrets (via `wrangler secret put`):
 * - EMAIL_API_KEY: Resend or SendGrid API key
 * - ADMIN_EMAIL: Email to receive lead notifications
 *
 * Optional environment variables:
 * - EMAIL_PROVIDER: 'resend' (default) or 'sendgrid'
 * - EMAIL_FROM: Sender email (default: noreply@grubtech.com)
 */

import type { Env } from '../types/bindings';

/**
 * Lead data interface for email notifications
 */
export interface LeadData {
  id?: string | number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message?: string;
  restaurantType?: string;
  formType?: string;
  form_type?: string;
  source?: string;
}

/**
 * Email send result interface
 */
export interface EmailResult {
  success: boolean;
  message: string;
  messageId?: string;
}

/**
 * Email configuration from environment
 */
interface EmailConfig {
  apiKey: string;
  adminEmail: string;
  fromEmail: string;
  provider: 'resend' | 'sendgrid';
}

/**
 * Get email configuration from environment
 */
function getEmailConfig(env: Env): EmailConfig | null {
  const apiKey = env.EMAIL_API_KEY;
  const adminEmail = env.ADMIN_EMAIL;

  if (!apiKey) {
    return null;
  }

  return {
    apiKey,
    adminEmail: adminEmail || '',
    fromEmail: 'Grubtech <noreply@grubtech.com>',
    provider: 'resend', // Default to Resend
  };
}

/**
 * Send email via Resend API
 * https://resend.com/docs/api-reference/emails/send-email
 */
async function sendViaResend(
  apiKey: string,
  from: string,
  to: string,
  subject: string,
  html: string
): Promise<EmailResult> {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    return {
      success: false,
      message: `Resend API error: ${response.status} - ${error}`,
    };
  }

  const result = await response.json() as { id: string };
  return {
    success: true,
    message: 'Email sent successfully',
    messageId: result.id,
  };
}

/**
 * Send email via SendGrid API
 * https://docs.sendgrid.com/api-reference/mail-send/mail-send
 */
async function sendViaSendGrid(
  apiKey: string,
  from: string,
  to: string,
  subject: string,
  html: string
): Promise<EmailResult> {
  // Parse from email (handle "Name <email>" format)
  const fromMatch = from.match(/^(.+?)\s*<(.+?)>$/);
  const fromEmail = fromMatch ? fromMatch[2] : from;
  const fromName = fromMatch ? fromMatch[1] : undefined;

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: fromName ? { email: fromEmail, name: fromName } : { email: fromEmail },
      subject,
      content: [{ type: 'text/html', value: html }],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    return {
      success: false,
      message: `SendGrid API error: ${response.status} - ${error}`,
    };
  }

  // SendGrid returns 202 Accepted with no body on success
  const messageId = response.headers.get('x-message-id') || '';
  return {
    success: true,
    message: 'Email sent successfully',
    messageId,
  };
}

/**
 * Send email using configured provider
 */
async function sendEmail(
  config: EmailConfig,
  to: string,
  subject: string,
  html: string,
  from?: string
): Promise<EmailResult> {
  const fromEmail = from || config.fromEmail;

  if (config.provider === 'sendgrid') {
    return sendViaSendGrid(config.apiKey, fromEmail, to, subject, html);
  }

  return sendViaResend(config.apiKey, fromEmail, to, subject, html);
}

/**
 * Generate admin notification email HTML
 */
function generateAdminNotificationHtml(lead: LeadData): string {
  const formType = lead.formType || lead.form_type || 'Contact';

  return `
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
      <p style="margin: 5px 0 0 0; opacity: 0.9;">You have a new ${formType} request from your website</p>
    </div>

    <div class="content">
      <div class="info-box">
        <h2 style="margin-top: 0; color: #0d47c0; font-weight: 700;">Contact Information</h2>
        <div class="info-row">
          <div class="info-label">Name:</div>
          <div class="info-value">${escapeHtml(lead.name)}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Email:</div>
          <div class="info-value"><a href="mailto:${escapeHtml(lead.email)}">${escapeHtml(lead.email)}</a></div>
        </div>
        ${lead.phone ? `
        <div class="info-row">
          <div class="info-label">Phone:</div>
          <div class="info-value"><a href="tel:${escapeHtml(lead.phone)}">${escapeHtml(lead.phone)}</a></div>
        </div>
        ` : ''}
        ${lead.company ? `
        <div class="info-row">
          <div class="info-label">Company:</div>
          <div class="info-value">${escapeHtml(lead.company)}</div>
        </div>
        ` : ''}
        ${lead.restaurantType ? `
        <div class="info-row">
          <div class="info-label">Restaurant Type:</div>
          <div class="info-value">${escapeHtml(lead.restaurantType)}</div>
        </div>
        ` : ''}
      </div>

      ${lead.message ? `
      <div class="info-box">
        <h2 style="margin-top: 0; color: #0d47c0; font-weight: 700;">Message</h2>
        <div class="message-box">
          <p style="margin: 0;">${escapeHtml(lead.message).replace(/\n/g, '<br>')}</p>
        </div>
      </div>
      ` : ''}

      <div class="info-box">
        <h2 style="margin-top: 0; color: #0d47c0; font-weight: 700;">Lead Details</h2>
        <div class="info-row">
          <div class="info-label">Form Type:</div>
          <div class="info-value">${escapeHtml(formType)}</div>
        </div>
        ${lead.source ? `
        <div class="info-row">
          <div class="info-label">Source Page:</div>
          <div class="info-value">${escapeHtml(lead.source)}</div>
        </div>
        ` : ''}
        <div class="info-row">
          <div class="info-label">Submitted:</div>
          <div class="info-value">${new Date().toLocaleString()}</div>
        </div>
      </div>

      <div style="text-align: center; margin-top: 30px;">
        <a href="mailto:${escapeHtml(lead.email)}" class="button">Reply to ${escapeHtml(lead.name)}</a>
        ${lead.phone ? `<a href="tel:${escapeHtml(lead.phone)}" class="button">Call Now</a>` : ''}
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
}

/**
 * Generate auto-reply email HTML for leads
 */
function generateAutoReplyHtml(lead: LeadData): string {
  const formType = lead.formType || lead.form_type || 'Contact';
  const firstName = lead.name.split(' ')[0];

  return `
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
      <h1>Thank You, ${escapeHtml(lead.name)}!</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">We've received your ${escapeHtml(formType)} request</p>
    </div>

    <div class="content">
      <p>Hi ${escapeHtml(firstName)},</p>

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
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text: string): string {
  const escapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => escapeMap[char] || char);
}

/**
 * Email Service class for Cloudflare Workers
 * Uses HTTP-based email APIs (Resend/SendGrid)
 */
export class EmailService {
  private config: EmailConfig | null;
  private isConfigured: boolean;

  constructor(env: Env) {
    this.config = getEmailConfig(env);
    this.isConfigured = this.config !== null;
  }

  /**
   * Check if email service is configured
   */
  isReady(): boolean {
    return this.isConfigured;
  }

  /**
   * Send email notification to admin when new lead is captured
   */
  async sendLeadNotificationToAdmin(lead: LeadData): Promise<EmailResult> {
    if (!this.isConfigured || !this.config) {
      return { success: false, message: 'Email not configured' };
    }

    if (!this.config.adminEmail) {
      return { success: false, message: 'Admin email not set' };
    }

    const formType = lead.formType || lead.form_type || 'Contact';
    const subject = `New ${formType} Lead: ${lead.name}`;
    const html = generateAdminNotificationHtml(lead);

    try {
      const result = await sendEmail(
        this.config,
        this.config.adminEmail,
        subject,
        html
      );
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, message: `Failed to send admin notification: ${message}` };
    }
  }

  /**
   * Send auto-reply email to the person who submitted the form
   */
  async sendAutoReplyToLead(lead: LeadData): Promise<EmailResult> {
    if (!this.isConfigured || !this.config) {
      return { success: false, message: 'Email not configured' };
    }

    const subject = `Thank you for contacting Grubtech, ${lead.name}!`;
    const html = generateAutoReplyHtml(lead);

    try {
      const result = await sendEmail(
        this.config,
        lead.email,
        subject,
        html
      );
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, message: `Failed to send auto-reply: ${message}` };
    }
  }

  /**
   * Send both admin notification and auto-reply
   */
  async sendLeadEmails(lead: LeadData): Promise<{
    adminNotification: EmailResult;
    autoReply: EmailResult;
  }> {
    const results = await Promise.allSettled([
      this.sendLeadNotificationToAdmin(lead),
      this.sendAutoReplyToLead(lead),
    ]);

    return {
      adminNotification:
        results[0].status === 'fulfilled'
          ? results[0].value
          : { success: false, message: 'Failed to send admin notification' },
      autoReply:
        results[1].status === 'fulfilled'
          ? results[1].value
          : { success: false, message: 'Failed to send auto-reply' },
    };
  }
}

/**
 * Create email service instance from environment
 * Use this in route handlers: const emailService = createEmailService(c.env)
 */
export function createEmailService(env: Env): EmailService {
  return new EmailService(env);
}
