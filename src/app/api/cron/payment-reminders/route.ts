import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendPaymentReminderEmail, sendPaymentPastDueEmail, sendEmail, ADMIN_EMAIL } from '@/lib/email';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://elevatedphysiquefitness.com';
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // Calculate 3 days from now
  const threeDaysOut = new Date(today);
  threeDaysOut.setDate(threeDaysOut.getDate() + 3);
  const threeDaysStr = threeDaysOut.toISOString().split('T')[0];

  let remindersSent = 0;
  let pastDueProcessed = 0;

  try {
    // --- 3-Day Payment Reminders ---
    const { data: upcomingSubs } = await supabase
      .from('subscriptions')
      .select('id, client_id, user_id, plan_name, price, next_billing_date')
      .eq('status', 'active')
      .eq('next_billing_date', threeDaysStr);

    if (upcomingSubs && upcomingSubs.length > 0) {
      for (const sub of upcomingSubs) {
        const clientId = sub.client_id || sub.user_id;
        if (!clientId) continue;

        // Get client profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('email, full_name')
          .eq('id', clientId)
          .single();

        if (!profile?.email) continue;

        const dueDate = new Date(sub.next_billing_date).toLocaleDateString('en-US', {
          month: 'long', day: 'numeric', year: 'numeric'
        });
        const amount = sub.price ? Number(sub.price).toFixed(2) : '0.00';

        // Send reminder email
        await sendPaymentReminderEmail(
          profile.email,
          profile.full_name || 'there',
          sub.plan_name || 'Subscription',
          amount,
          dueDate,
          `${baseUrl}/dashboard/subscription`
        );

        // Send push notification
        try {
          await fetch(`${baseUrl}/api/push/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: clientId,
              notificationType: 'payment',
              payload: {
                title: 'Payment Reminder',
                body: `Your ${sub.plan_name || 'subscription'} payment of $${amount} is due in 3 days.`,
                url: `${baseUrl}/dashboard/subscription`,
                tag: 'payment-reminder',
              },
            }),
          });
        } catch (pushErr) {
          console.error('Push notification error:', pushErr);
        }

        remindersSent++;
      }
    }

    // --- Past Due Detection ---
    const { data: pastDueSubs } = await supabase
      .from('subscriptions')
      .select('id, client_id, user_id, plan_name, price, next_billing_date')
      .in('status', ['active', 'past_due'])
      .lt('next_billing_date', todayStr);

    if (pastDueSubs && pastDueSubs.length > 0) {
      const pastDueClients: string[] = [];

      for (const sub of pastDueSubs) {
        const clientId = sub.client_id || sub.user_id;
        if (!clientId) continue;

        // Update status to past_due if still active
        if (sub.id) {
          await supabase
            .from('subscriptions')
            .update({ status: 'past_due', updated_at: new Date().toISOString() })
            .eq('id', sub.id);
        }

        // Get client profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('email, full_name')
          .eq('id', clientId)
          .single();

        if (!profile?.email) continue;

        const dueDate = new Date(sub.next_billing_date).toLocaleDateString('en-US', {
          month: 'long', day: 'numeric', year: 'numeric'
        });
        const amount = sub.price ? Number(sub.price).toFixed(2) : '0.00';

        // Send past due email to client
        await sendPaymentPastDueEmail(
          profile.email,
          profile.full_name || 'there',
          sub.plan_name || 'Subscription',
          amount,
          dueDate,
          `${baseUrl}/dashboard/subscription`
        );

        // Send push notification to client
        try {
          await fetch(`${baseUrl}/api/push/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: clientId,
              notificationType: 'payment',
              payload: {
                title: 'Payment Past Due',
                body: `Your ${sub.plan_name || 'subscription'} payment of $${amount} is past due. Please update your payment method.`,
                url: `${baseUrl}/dashboard/subscription`,
                tag: 'payment-past-due',
              },
            }),
          });
        } catch (pushErr) {
          console.error('Push notification error:', pushErr);
        }

        pastDueClients.push(`${profile.full_name || profile.email} - ${sub.plan_name} ($${amount})`);
        pastDueProcessed++;
      }

      // Send summary to admin
      if (pastDueClients.length > 0) {
        await sendEmail({
          to: ADMIN_EMAIL,
          subject: `${pastDueClients.length} Past Due Payment(s) - Elevated Physique`,
          html: `
            <h2>Past Due Payments Alert</h2>
            <p>The following clients have past due payments:</p>
            <ul>${pastDueClients.map(c => '<li>' + c + '</li>').join('')}</ul>
            <p><a href="${baseUrl}/admin/clients">View Clients</a></p>
          `,
        });
      }
    }

    return NextResponse.json({
      success: true,
      remindersSent,
      pastDueProcessed,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Payment reminders cron error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
