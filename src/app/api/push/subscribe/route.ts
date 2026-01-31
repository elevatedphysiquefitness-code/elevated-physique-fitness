import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subscription } = await request.json();

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
    }

    // Extract keys from subscription
    const keys = subscription.keys || {};

    // Upsert the subscription (update if endpoint exists, insert if new)
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        user_id: user.id,
        endpoint: subscription.endpoint,
        p256dh: keys.p256dh || '',
        auth: keys.auth || '',
        user_agent: request.headers.get('user-agent') || '',
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'endpoint',
      });

    if (error) {
      console.error('Error saving subscription:', error);
      return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 });
    }

    // Also create default notification preferences if they don't exist
    await supabase
      .from('notification_preferences')
      .upsert({
        user_id: user.id,
      }, {
        onConflict: 'user_id',
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Push subscribe error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { endpoint } = await request.json();

    if (!endpoint) {
      return NextResponse.json({ error: 'Endpoint required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', user.id)
      .eq('endpoint', endpoint);

    if (error) {
      console.error('Error deleting subscription:', error);
      return NextResponse.json({ error: 'Failed to delete subscription' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Push unsubscribe error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
