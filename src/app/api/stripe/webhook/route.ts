import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getStripeServer } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  const stripe = getStripeServer();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const metadata = session.metadata;

        if (session.mode === 'payment' && metadata?.type === 'past_due_payment') {
          // Handle past due payment - reactivate subscription and advance billing date
          const subscriptionId = metadata.subscription_id;
          if (subscriptionId) {
            const { data: existingSub } = await supabase
              .from('subscriptions')
              .select('billing_cycle, billing_interval, billing_day_1, billing_day_2')
              .eq('id', subscriptionId)
              .single();

            if (existingSub) {
              const { getNextBillingDate } = await import('@/lib/billing');
              const interval = existingSub.billing_interval || existingSub.billing_cycle || 'monthly';
              const nextDate = getNextBillingDate(interval, new Date(), existingSub.billing_day_1, existingSub.billing_day_2);

              await supabase
                .from('subscriptions')
                .update({
                  status: 'active',
                  next_billing_date: nextDate,
                  stripe_customer_id: session.customer as string || undefined,
                  updated_at: new Date().toISOString(),
                })
                .eq('id', subscriptionId);
            }
          }
        } else if (session.mode === 'subscription' && session.subscription) {
          if (metadata?.userId) {
            // Calculate next billing date based on interval
            const startDate = new Date();
            const nextBillingDate = new Date(startDate);
            if (metadata.billingInterval === 'weekly') {
              nextBillingDate.setDate(nextBillingDate.getDate() + 7);
            } else if (metadata.billingInterval === 'biweekly') {
              nextBillingDate.setDate(nextBillingDate.getDate() + 14);
            } else {
              nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
            }

            // Save subscription to database
            const { error: subError } = await supabase.from('subscriptions').insert({
              client_id: metadata.userId,
              user_id: metadata.userId,
              plan_name: metadata.planName,
              plan_type: metadata.planType === 'test' ? 'online' : metadata.planType,
              price: parseFloat(metadata.price || '0'),
              billing_cycle: metadata.billingInterval,
              billing_interval: metadata.billingInterval,
              stripe_subscription_id: session.subscription as string,
              stripe_customer_id: session.customer as string,
              status: 'active',
              start_date: startDate.toISOString().split('T')[0],
              next_billing_date: nextBillingDate.toISOString().split('T')[0],
              payment_method: 'stripe',
            });

            if (subError) {
              console.error('Failed to save subscription:', subError);
            }

            // Update user profile to client role
            const { error: profileError } = await supabase
              .from('profiles')
              .update({
                role: 'client',
                updated_at: new Date().toISOString(),
              })
              .eq('id', metadata.userId);

            if (profileError) {
              console.error('Failed to update profile:', profileError);
            }
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;

        // Update subscription status in database
        await supabase
          .from('subscriptions')
          .update({
            status: subscription.status === 'active' ? 'active' :
                    subscription.status === 'canceled' ? 'cancelled' :
                    subscription.status,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        // Mark subscription as cancelled
        await supabase
          .from('subscriptions')
          .update({
            status: 'cancelled',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const subscriptionId = (invoice as { subscription?: string | { id: string } }).subscription;
        const subId = typeof subscriptionId === 'string' ? subscriptionId : subscriptionId?.id;

        if (subId) {
          // Update subscription status
          await supabase
            .from('subscriptions')
            .update({
              status: 'paused',
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', subId);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice & { subscription?: string | { id: string } };
        const subscriptionId = invoice.subscription;
        const subId = typeof subscriptionId === 'string' ? subscriptionId : subscriptionId?.id;

        if (subId && (invoice as { billing_reason?: string }).billing_reason === 'subscription_cycle') {
          // Get the subscription to find billing interval and custom days
          const { data: existingSub } = await supabase
            .from('subscriptions')
            .select('billing_cycle, billing_interval, billing_day_1, billing_day_2')
            .eq('stripe_subscription_id', subId)
            .single();

          if (existingSub) {
            const { getNextBillingDate } = await import('@/lib/billing');
            const interval = existingSub.billing_interval || existingSub.billing_cycle || 'monthly';
            const nextDate = getNextBillingDate(interval, new Date(), existingSub.billing_day_1, existingSub.billing_day_2);

            await supabase
              .from('subscriptions')
              .update({
                status: 'active',
                next_billing_date: nextDate,
                updated_at: new Date().toISOString(),
              })
              .eq('stripe_subscription_id', subId);
          }
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
