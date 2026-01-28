'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';

const PLANS = {
  inperson: {
    unlimited: {
      name: 'Unlimited (In-Person)',
      price: 720.0,
      billingCycle: 'monthly',
      planType: 'in-person',
      planKey: 'unlimited',
      planId: process.env.NEXT_PUBLIC_PAYPAL_PLAN_INPERSON_UNLIMITED,
      features: ['5 sessions/week', 'Hands-on coaching', 'Priority support'],
    },
    'elevated-physique': {
      name: 'Elevated Physique (In-Person)',
      price: 520.0,
      billingCycle: 'monthly',
      planType: 'in-person',
      planKey: 'elevated-physique',
      planId: process.env.NEXT_PUBLIC_PAYPAL_PLAN_INPERSON_ELEVATED_PHYSIQUE,
      features: ['4 sessions/week', 'Structured routine', 'Progress tracking'],
    },
    physique: {
      name: 'Physique (In-Person)',
      price: 420.0,
      billingCycle: 'monthly',
      planType: 'in-person',
      planKey: 'physique',
      planId: process.env.NEXT_PUBLIC_PAYPAL_PLAN_INPERSON_PHYSIQUE,
      features: ['3 sessions/week', 'Technique coaching', 'Habit building'],
    },
    elevated: {
      name: 'Elevated (In-Person)',
      price: 320.0,
      billingCycle: 'monthly',
      planType: 'in-person',
      planKey: 'elevated',
      planId: process.env.NEXT_PUBLIC_PAYPAL_PLAN_INPERSON_ELEVATED,
      features: ['2 sessions/week', 'Form fundamentals', 'Flexible structure'],
    },
  },
  online: {
    unlimited: {
      name: 'Unlimited (Online)',
      price: 360.0,
      billingCycle: 'monthly',
      planType: 'online',
      planKey: 'unlimited',
      planId: process.env.NEXT_PUBLIC_PAYPAL_PLAN_ONLINE_UNLIMITED,
      features: ['5 days/week', 'Remote guidance', 'Full access'],
    },
    'elevated-physique': {
      name: 'Elevated Physique (Online)',
      price: 260.0,
      billingCycle: 'monthly',
      planType: 'online',
      planKey: 'elevated-physique',
      planId: process.env.NEXT_PUBLIC_PAYPAL_PLAN_ONLINE_ELEVATED_PHYSIQUE,
      features: ['4 days/week', 'Structured programming', 'Weekly check-ins'],
    },
    physique: {
      name: 'Physique (Online)',
      price: 210.0,
      billingCycle: 'monthly',
      planType: 'online',
      planKey: 'physique',
      planId: process.env.NEXT_PUBLIC_PAYPAL_PLAN_ONLINE_PHYSIQUE,
      features: ['3 days/week', 'Progress tracking', 'Workout library'],
    },
    elevated: {
      name: 'Elevated (Online)',
      price: 150.0,
      billingCycle: 'monthly',
      planType: 'online',
      planKey: 'elevated',
      planId: process.env.NEXT_PUBLIC_PAYPAL_PLAN_ONLINE_ELEVATED,
      features: ['2 days/week', 'Starter plan', 'Email support'],
    },
  },
};

export default function CheckoutPage({ params }: { params: Promise<{ type: string; plan: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const planGroup = PLANS[resolvedParams.type as keyof typeof PLANS];
  const plan = planGroup?.[resolvedParams.plan as keyof typeof planGroup];

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push(`/login?redirect=/checkout/${resolvedParams.type}/${resolvedParams.plan}`);
        return;
      }
      setUser(user);
      setLoading(false);
    }
    load();
  }, [resolvedParams.plan, resolvedParams.type, router, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-xl font-semibold text-red-600 mb-4">
          Plan not found
        </p>
        <button
          onClick={() => router.push('/pricing')}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          View Plans
        </button>
      </div>
    );
  }

  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '';
  const paypalReady = Boolean(plan.planId && paypalClientId);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-2">{plan.name}</h1>
          <p className="text-4xl font-bold text-blue-600 mb-6">
            ${plan.price}/month
          </p>
          <ul className="space-y-3 mb-8">
            {plan.features.map((feature, i) => (
              <li key={i} className="flex items-center">
                <svg
                  className="h-5 w-5 text-green-500 mr-2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M5 13l4 4L19 7" />
                </svg>
                {feature}
              </li>
            ))}
          </ul>
          {paypalReady && paypalClientId ? (
            <PayPalScriptProvider
              options={{
                clientId: paypalClientId,
                vault: true,
                intent: 'subscription',
                components: 'buttons',
              }}
            >
              <PayPalButtons
                style={{
                  layout: 'vertical',
                  shape: 'rect',
                  color: 'gold',
                  label: 'subscribe',
                }}
                createSubscription={(data, actions) => {
                  return actions.subscription.create({
                    plan_id: plan.planId!,
                  });
                }}
                onApprove={async (data) => {
                  try {
                    const response = await fetch('/api/subscriptions/create', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        paypalSubscriptionId: data.subscriptionID,
                        clientId: user.id,
                        plan: plan.planKey,
                        planName: plan.name,
                        planType: plan.planType,
                        billingCycle: plan.billingCycle,
                        price: plan.price,
                      }),
                    });
                    if (!response.ok) {
                      throw new Error('Failed to save subscription');
                    }
                    router.push('/dashboard?success=true');
                  } catch (e) {
                    console.error('Error saving subscription:', e);
                    alert('Subscription created but failed to save. Please contact support with your subscription ID: ' + data.subscriptionID);
                  }
                }}
                onError={(err) => {
                  console.error('PayPal error details:', err);
                  alert('Payment failed. Please check that you are logged into PayPal and try again. Error: ' + (err instanceof Error ? err.message : 'Unknown error'));
                }}
              />
            </PayPalScriptProvider>
          ) : (
            <div className="p-6 bg-grey-100 border border-grey-200 text-center">
              <p className="font-semibold text-black mb-2">Ready to Get Started?</p>
              <p className="text-grey-600 text-sm mb-4">
                To complete your enrollment, please contact us directly and we&apos;ll get you set up.
              </p>
              <a
                href="mailto:elevatedphysiquefitness@gmail.com?subject=Enrollment%20Request%20-%20{plan.name}"
                className="inline-block bg-blue-600 text-white px-6 py-3 font-semibold hover:bg-blue-700 transition-colors"
              >
                Contact to Enroll
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
