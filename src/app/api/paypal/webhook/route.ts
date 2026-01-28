import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Create admin client for webhook (lazy initialization)
let supabaseAdmin: SupabaseClient | null = null;

function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdmin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
      throw new Error('Missing Supabase environment variables');
    }

    supabaseAdmin = createClient(url, key);
  }
  return supabaseAdmin;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const eventType = body.event_type;

    // Verify webhook signature in production
    // const webhookId = process.env.PAYPAL_WEBHOOK_ID;
    // Implement PayPal webhook verification here

    const supabase = getSupabaseAdmin();

    switch (eventType) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
        await handleSubscriptionActivated(supabase, body.resource);
        break;

      case 'BILLING.SUBSCRIPTION.CANCELLED':
        await handleSubscriptionCancelled(supabase, body.resource);
        break;

      case 'BILLING.SUBSCRIPTION.SUSPENDED':
        await handleSubscriptionSuspended(supabase, body.resource);
        break;

      case 'BILLING.SUBSCRIPTION.PAYMENT.FAILED':
        await handlePaymentFailed(supabase, body.resource);
        break;

      case 'PAYMENT.SALE.COMPLETED':
        await handlePaymentCompleted(supabase, body.resource);
        break;

      default:
        console.log('Unhandled PayPal event:', eventType);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('PayPal webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleSubscriptionActivated(supabase: SupabaseClient, resource: any) {
  const subscriptionId = resource.id;

  await supabase
    .from('subscriptions')
    .update({ status: 'active' })
    .eq('paypal_subscription_id', subscriptionId);
}

async function handleSubscriptionCancelled(supabase: SupabaseClient, resource: any) {
  const subscriptionId = resource.id;

  await supabase
    .from('subscriptions')
    .update({ status: 'cancelled' })
    .eq('paypal_subscription_id', subscriptionId);
}

async function handleSubscriptionSuspended(supabase: SupabaseClient, resource: any) {
  const subscriptionId = resource.id;

  await supabase
    .from('subscriptions')
    .update({ status: 'suspended' })
    .eq('paypal_subscription_id', subscriptionId);
}

async function handlePaymentFailed(supabase: SupabaseClient, resource: any) {
  const subscriptionId = resource.id;

  // Update subscription status and log the failure
  const { data: subscription } = await supabase
    .from('subscriptions')
    .update({
      status: 'payment_failed',
      updated_at: new Date().toISOString()
    })
    .eq('paypal_subscription_id', subscriptionId)
    .select('client_id')
    .single();

  // Create a message to admin about the payment failure
  if (subscription?.client_id) {
    const { data: admin } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'admin')
      .limit(1)
      .single();

    if (admin) {
      await supabase.from('messages').insert({
        sender_id: subscription.client_id,
        receiver_id: admin.id,
        content: `[SYSTEM] Payment failed for subscription ${subscriptionId}. Please follow up with this client.`,
        read: false,
      });
    }
  }
}

async function handlePaymentCompleted(supabase: SupabaseClient, resource: any) {
  // Update next billing date after successful payment
  const subscriptionId = resource.billing_agreement_id;

  if (subscriptionId) {
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('billing_cycle')
      .eq('paypal_subscription_id', subscriptionId)
      .single();

    if (subscription) {
      const today = new Date();
      let nextBillingDate: Date;

      switch (subscription.billing_cycle) {
        case 'weekly':
          nextBillingDate = new Date(today.setDate(today.getDate() + 7));
          break;
        case 'bi-weekly':
          nextBillingDate = new Date(today.setDate(today.getDate() + 14));
          break;
        default:
          nextBillingDate = new Date(today.setMonth(today.getMonth() + 1));
      }

      await supabase
        .from('subscriptions')
        .update({
          status: 'active',
          next_billing_date: nextBillingDate.toISOString().split('T')[0],
        })
        .eq('paypal_subscription_id', subscriptionId);
    }
  }
}
