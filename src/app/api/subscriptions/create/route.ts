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
      discountCode,
      discountCodeId,
      discountAmount,
      finalPrice,
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
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from('subscriptions')
      .insert({
        client_id: clientId,
        plan_name: planName,
        plan_type: planType,
        price: finalPrice || price,
        billing_cycle: billingCycle || 'monthly',
        paypal_subscription_id: paypalSubscriptionId,
        status: 'active',
        start_date: new Date().toISOString().split('T')[0],
      })
      .select('id')
      .single();

    if (subscriptionError) {
      console.error('Supabase error:', subscriptionError);
      return NextResponse.json(
        { error: 'Failed to save subscription' },
        { status: 500 }
      );
    }

    // If a discount code was used, record the usage
    if (discountCodeId && discountAmount) {
      const { error: usageError } = await supabase
        .from('discount_code_usage')
        .insert({
          discount_code_id: discountCodeId,
          user_id: clientId,
          subscription_id: subscriptionData?.id,
          discount_amount: discountAmount,
          original_price: price,
          final_price: finalPrice,
        });

      if (usageError) {
        console.error('Failed to record discount usage:', usageError);
        // Don't fail the whole request, just log the error
      }

      // Increment the uses_count for the discount code
      await supabase.rpc('increment_discount_uses', { code_id: discountCodeId });
    }

    return NextResponse.json({ success: true, data: subscriptionData });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
