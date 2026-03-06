import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { getStripeServer } from '@/lib/stripe';

export async function POST() {
  try {
    // Authenticate user
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Look up subscription details
    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: subscription } = await adminSupabase
      .from('subscriptions')
      .select('id, plan_name, price, stripe_customer_id, billing_interval')
      .or(`client_id.eq.${user.id},user_id.eq.${user.id}`)
      .in('status', ['active', 'past_due'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!subscription || !subscription.price) {
      return NextResponse.json(
        { error: 'No active subscription found.' },
        { status: 404 }
      );
    }

    const stripe = getStripeServer();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://elevatedphysiquefitness.com';

    // Build checkout session params
    const sessionParams: any = {
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${subscription.plan_name || 'Subscription'} Payment`,
              description: 'Past due payment for your coaching subscription',
            },
            unit_amount: Math.round(subscription.price * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/dashboard/subscription?payment=success`,
      cancel_url: `${baseUrl}/dashboard/subscription?payment=cancelled`,
      metadata: {
        subscription_id: subscription.id,
        user_id: user.id,
        type: 'past_due_payment',
      },
    };

    // Attach existing Stripe customer if available
    if (subscription.stripe_customer_id) {
      sessionParams.customer = subscription.stripe_customer_id;
    } else {
      // Look up user email for new customers
      const { data: profile } = await adminSupabase
        .from('profiles')
        .select('email')
        .eq('id', user.id)
        .single();

      if (profile?.email) {
        sessionParams.customer_email = profile.email;
      }
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Pay now error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment session' },
      { status: 500 }
    );
  }
}
