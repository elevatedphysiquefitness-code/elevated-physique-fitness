import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import webpush from 'web-push';

// Configure web-push with VAPID keys
// You need to set these environment variables:
// NEXT_PUBLIC_VAPID_PUBLIC_KEY - Public key for client
// VAPID_PRIVATE_KEY - Private key for server
// VAPID_EMAIL - Your email for VAPID

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';
const vapidEmail = process.env.VAPID_EMAIL || 'mailto:admin@elevatedphysiquefitness.com';

// Only configure if keys are present (done at runtime, not build time)
let vapidConfigured = false;
function ensureVapidConfigured() {
  if (!vapidConfigured && vapidPublicKey && vapidPrivateKey) {
    try {
      webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);
      vapidConfigured = true;
    } catch (error) {
      console.error('Failed to configure VAPID:', error);
    }
  }
  return vapidConfigured;
}

interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  tag?: string;
  actions?: { action: string; title: string }[];
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin (for sending to others) or sending test to self
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const { userId, payload, notificationType } = await request.json();

    // Only admins can send to other users
    const targetUserId = profile?.role === 'admin' ? (userId || user.id) : user.id;

    if (!payload || !payload.title) {
      return NextResponse.json({ error: 'Payload with title required' }, { status: 400 });
    }

    // Ensure VAPID is configured
    if (!ensureVapidConfigured()) {
      return NextResponse.json({
        error: 'Push notifications not configured. Set VAPID keys in environment variables.'
      }, { status: 500 });
    }

    // Get user's push subscriptions
    const { data: subscriptions } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', targetUserId);

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({
        error: 'No push subscriptions found for user',
        sent: 0
      }, { status: 404 });
    }

    // Check user's notification preferences
    const { data: preferences } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', targetUserId)
      .single();

    // Check if notification type is enabled
    if (preferences && notificationType) {
      const typeMap: { [key: string]: string } = {
        workout: 'workout_reminders',
        checkin: 'check_in_reminders',
        habit: 'habit_reminders',
        message: 'coach_messages',
        progress: 'progress_updates',
        promo: 'promotional',
      };
      const prefKey = typeMap[notificationType];
      if (prefKey && preferences[prefKey] === false) {
        return NextResponse.json({
          error: 'User has disabled this notification type',
          sent: 0
        }, { status: 200 });
      }
    }

    const pushPayload: PushPayload = {
      title: payload.title,
      body: payload.body || '',
      icon: payload.icon || '/icon-192x192.png',
      badge: payload.badge || '/icon-192x192.png',
      url: payload.url || '/dashboard',
      tag: payload.tag || notificationType || 'default',
      actions: payload.actions,
    };

    let sent = 0;
    let failed = 0;

    // Send to all subscriptions
    for (const sub of subscriptions) {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      };

      try {
        await webpush.sendNotification(pushSubscription, JSON.stringify(pushPayload));
        sent++;
      } catch (error: unknown) {
        const pushError = error as { statusCode?: number };
        console.error('Push send error:', error);
        failed++;

        // If subscription is invalid (410 Gone), delete it
        if (pushError.statusCode === 410) {
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('id', sub.id);
        }
      }
    }

    // Log the notification
    await supabase.from('notification_logs').insert({
      user_id: targetUserId,
      notification_type: notificationType || 'general',
      title: payload.title,
      body: payload.body,
      data: payload,
      status: sent > 0 ? 'sent' : 'failed',
    });

    return NextResponse.json({
      success: true,
      sent,
      failed,
      total: subscriptions.length
    });
  } catch (error) {
    console.error('Push send error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
