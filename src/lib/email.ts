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

export async function sendPaymentReminderEmail(
  recipientEmail: string,
  recipientName: string,
  planName: string,
  amount: string,
  dueDate: string,
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
          <h2 style="color: #3D2314; margin-top: 0;">Payment Reminder</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Hi ${recipientName || 'there'},
          </p>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            This is a friendly reminder that your subscription payment is coming up in <strong>3 days</strong>.
          </p>
          <div style="background-color: #f9f9f9; padding: 20px; margin: 20px 0; border: 1px solid #e0e0e0;">
            <p style="margin: 5px 0; color: #333;"><strong>Plan:</strong> ${planName}</p>
            <p style="margin: 5px 0; color: #333;"><strong>Amount:</strong> $${amount}</p>
            <p style="margin: 5px 0; color: #333;"><strong>Due Date:</strong> ${dueDate}</p>
          </div>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Please ensure your payment method is up to date. If you have any questions, reach out to your coach.
          </p>
          <a href="${dashboardUrl}" style="display: inline-block; background-color: #3D2314; color: white; text-decoration: none; padding: 12px 30px; font-size: 16px; font-weight: bold; margin-top: 20px;">
            View Subscription
          </a>
        </div>
        <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
          <p>&copy; ${new Date().getFullYear()} Elevated Physique Fitness. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: recipientEmail,
    subject: 'Payment Reminder - Elevated Physique Fitness',
    html,
  });
}

export async function sendPaymentPastDueEmail(
  recipientEmail: string,
  recipientName: string,
  planName: string,
  amount: string,
  dueDate: string,
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
          <h2 style="color: #dc2626; margin-top: 0;">Payment Past Due</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Hi ${recipientName || 'there'},
          </p>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Your subscription payment was due on <strong>${dueDate}</strong> and has not been received. Please update your payment method to avoid any interruption to your coaching services.
          </p>
          <div style="background-color: #fef2f2; padding: 20px; margin: 20px 0; border: 1px solid #fecaca;">
            <p style="margin: 5px 0; color: #333;"><strong>Plan:</strong> ${planName}</p>
            <p style="margin: 5px 0; color: #333;"><strong>Amount Due:</strong> $${amount}</p>
            <p style="margin: 5px 0; color: #dc2626;"><strong>Due Date:</strong> ${dueDate} (Past Due)</p>
          </div>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            If you believe this is an error or need assistance, please message your coach directly.
          </p>
          <a href="${dashboardUrl}" style="display: inline-block; background-color: #dc2626; color: white; text-decoration: none; padding: 12px 30px; font-size: 16px; font-weight: bold; margin-top: 20px;">
            Update Payment
          </a>
        </div>
        <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
          <p>&copy; ${new Date().getFullYear()} Elevated Physique Fitness. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: recipientEmail,
    subject: 'Payment Past Due - Elevated Physique Fitness',
    html,
  });
}

export { ADMIN_EMAIL };
