import { NextResponse } from 'next/server';
import { getStripeServer, STRIPE_PRICES } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  // Step 1: Get user
  let user;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch (error) {
    console.error('Supabase error:', error);
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
  }

  if (!user) {
    return NextResponse.json({ error: 'Please log in first' }, { status: 401 });
  }

  // Step 2: Parse request
  let body;
  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { planType, planKey, billingInterval, planName, price, discountCode } = body;

  // Step 3: Get price ID
  const priceId = STRIPE_PRICES[planType]?.[planKey]?.[billingInterval];

  if (!priceId) {
    return NextResponse.json(
      { error: `Price not configured. Missing STRIPE_PRICE_TEST env variable.` },
      { status: 400 }
    );
  }

  // Step 4: Create Stripe session
  try {
    const stripe = getStripeServer();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://elevatedphysiquefitness.com';

    // Look up Stripe promotion code if discount code provided
    let promotionCodeId: string | undefined;
    if (discountCode) {
      try {
        const promotionCodes = await stripe.promotionCodes.list({
          code: discountCode.toUpperCase(),
          active: true,
          limit: 1,
        });
        if (promotionCodes.data.length > 0) {
          promotionCodeId = promotionCodes.data[0].id;
        }
      } catch (err) {
        console.error('Error looking up promotion code:', err);
      }
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card', 'us_bank_account'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      ...(promotionCodeId && {
        discounts: [{ promotion_code: promotionCodeId }],
      }),
      ...(!promotionCodeId && {
        allow_promotion_codes: true,
      }),
      success_url: `${baseUrl}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout/${planType}/${planKey}?canceled=true`,
      customer_email: user.email,
      metadata: {
        userId: user.id,
        planType,
        planKey,
        planName,
        billingInterval,
        price: price.toString(),
        discountCode: discountCode || '',
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          planType,
          planKey,
          planName,
          billingInterval,
        },
      },
      payment_method_options: {
        us_bank_account: {
          financial_connections: {
            permissions: ['payment_method'],
          },
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Stripe error: ${msg}` }, { status: 500 });
  }
}
