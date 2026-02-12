import { Resend } from 'resend';

let resend: Resend | null = null;

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

const FROM_EMAIL = process.env.FROM_EMAIL || 'Elevated Physique <noreply@elevatedphysiquefitness.com>';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@elevatedphysiquefitness.com';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  const client = getResendClient();

  if (!client) {
    console.log('RESEND_API_KEY not set, skipping email send');
    return { success: false, error: 'Email not configured' };
  }

  try {
    const { data, error } = await client.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
    });

    if (error) {
      console.error('Email send error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: 'Failed to send email' };
  }
}

export async function sendMessageNotificationEmail(
  recipientEmail: string,
  recipientName: string,
  senderName: string,
  messagePreview: string,
  dashboardUrl: string
) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #AB875F; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Elevated Physique Fitness</h1>
        </div>
        <div style="background-color: white; padding: 30px; border: 1px solid #e0e0e0;">
          <h2 style="color: #3D2314; margin-top: 0;">New Message from ${senderName}</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Hi ${recipientName || 'there'},
          </p>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            You have received a new message:
          </p>
          <div style="background-color: #f9f9f9; border-left: 4px solid #AB875F; padding: 15px; margin: 20px 0;">
            <p style="color: #333; font-size: 16px; margin: 0; font-style: italic;">
              "${messagePreview.length > 200 ? messagePreview.substring(0, 200) + '...' : messagePreview}"
            </p>
          </div>
          <a href="${dashboardUrl}" style="display: inline-block; background-color: #3D2314; color: white; text-decoration: none; padding: 12px 30px; font-size: 16px; font-weight: bold; margin-top: 20px;">
            View & Reply
          </a>
        </div>
        <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
          <p>© ${new Date().getFullYear()} Elevated Physique Fitness. All rights reserved.</p>
          <p>You're receiving this because you have an account with us.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: recipientEmail,
    subject: `New message from ${senderName} - Elevated Physique`,
    html,
  });
}

export { ADMIN_EMAIL };
