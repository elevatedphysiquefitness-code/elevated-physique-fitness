import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      paypalSubscriptionId,
      clientId,
      plan,
      planName,
      planType,
      billingCycle,
      price,
    } = body;

    // Validate required fields
    if (!paypalSubscriptionId || !clientId || !planName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert subscription into database
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('subscriptions').insert({
      client_id: clientId,
      plan_name: planName,
      plan_type: planType,
      price: price,
      billing_cycle: billingCycle || 'monthly',
      paypal_subscription_id: paypalSubscriptionId,
      status: 'active',
      start_date: new Date().toISOString().split('T')[0],
    });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to save subscription' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
