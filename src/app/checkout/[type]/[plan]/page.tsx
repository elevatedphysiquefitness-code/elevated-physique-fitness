'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { Tag, CheckCircle, XCircle, Loader2 } from 'lucide-react';

const PLANS = {
  inperson: {
    unlimited: {
      name: 'Unlimited (In-Person)',
      price: 900.0,
      billingCycle: 'monthly',
      planType: 'in-person',
      planKey: 'unlimited',
      planId: process.env.NEXT_PUBLIC_PAYPAL_PLAN_INPERSON_UNLIMITED,
      features: ['5 sessions/week', 'Hands-on coaching', 'Priority support'],
    },
    'elevated-physique': {
      name: 'Elevated Physique (In-Person)',
      price: 720.0,
      billingCycle: 'monthly',
      planType: 'in-person',
      planKey: 'elevated-physique',
      planId: process.env.NEXT_PUBLIC_PAYPAL_PLAN_INPERSON_ELEVATED_PHYSIQUE,
      features: ['4 sessions/week', 'Structured routine', 'Progress tracking'],
    },
    physique: {
      name: 'Physique (In-Person)',
      price: 540.0,
      billingCycle: 'monthly',
      planType: 'in-person',
      planKey: 'physique',
      planId: process.env.NEXT_PUBLIC_PAYPAL_PLAN_INPERSON_PHYSIQUE,
      features: ['3 sessions/week', 'Technique coaching', 'Habit building'],
    },
    elevated: {
      name: 'Elevated (In-Person)',
      price: 360.0,
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
      price: 700.0,
      billingCycle: 'monthly',
      planType: 'online',
      planKey: 'unlimited',
      planId: process.env.NEXT_PUBLIC_PAYPAL_PLAN_ONLINE_UNLIMITED,
      features: ['5 days/week', 'Remote guidance', 'Full access'],
    },
    'elevated-physique': {
      name: 'Elevated Physique (Online)',
      price: 560.0,
      billingCycle: 'monthly',
      planType: 'online',
      planKey: 'elevated-physique',
      planId: process.env.NEXT_PUBLIC_PAYPAL_PLAN_ONLINE_ELEVATED_PHYSIQUE,
      features: ['4 days/week', 'Structured programming', 'Weekly check-ins'],
    },
    physique: {
      name: 'Physique (Online)',
      price: 420.0,
      billingCycle: 'monthly',
      planType: 'online',
      planKey: 'physique',
      planId: process.env.NEXT_PUBLIC_PAYPAL_PLAN_ONLINE_PHYSIQUE,
      features: ['3 days/week', 'Progress tracking', 'Workout library'],
    },
    elevated: {
      name: 'Elevated (Online)',
      price: 280.0,
      billingCycle: 'monthly',
      planType: 'online',
      planKey: 'elevated',
      planId: process.env.NEXT_PUBLIC_PAYPAL_PLAN_ONLINE_ELEVATED,
      features: ['2 days/week', 'Starter plan', 'Email support'],
    },
  },
};

interface DiscountInfo {
  valid: boolean;
  discountCodeId?: string;
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  discountAmount?: number;
  finalPrice?: number;
  error?: string;
}

export default function CheckoutPage({ params }: { params: Promise<{ type: string; plan: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [discountCode, setDiscountCode] = useState('');
  const [discountLoading, setDiscountLoading] = useState(false);
  const [discountInfo, setDiscountInfo] = useState<DiscountInfo | null>(null);

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
      <div className="min-h-screen flex items-center justify-center bg-biscotti-light">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-chocolate" />
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

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;

    setDiscountLoading(true);
    setDiscountInfo(null);

    try {
      const response = await fetch('/api/discount/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: discountCode.trim(),
          planKey: plan.planKey,
          originalPrice: plan.price,
        }),
      });

      const data = await response.json();

      if (data.valid) {
        setDiscountInfo({
          valid: true,
          discountCodeId: data.discountCodeId,
          discountType: data.discountType,
          discountValue: data.discountValue,
          discountAmount: data.discountAmount,
          finalPrice: data.finalPrice,
        });
      } else {
        setDiscountInfo({
          valid: false,
          error: data.error || 'Invalid discount code',
        });
      }
    } catch (error) {
      setDiscountInfo({
        valid: false,
        error: 'Failed to validate discount code',
      });
    }

    setDiscountLoading(false);
  };

  const handleRemoveDiscount = () => {
    setDiscountCode('');
    setDiscountInfo(null);
  };

  const displayPrice = discountInfo?.valid ? discountInfo.finalPrice : plan.price;

  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '';
  const paypalReady = Boolean(plan.planId && paypalClientId);

  return (
    <div className="min-h-screen bg-biscotti-light py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-2 text-chocolate">{plan.name}</h1>

          {/* Price Display */}
          <div className="mb-6">
            {discountInfo?.valid ? (
              <div>
                <p className="text-2xl text-tawny line-through">
                  ${plan.price}/month
                </p>
                <p className="text-4xl font-bold text-chocolate">
                  ${displayPrice}/month
                </p>
                <p className="text-green-600 text-sm mt-1 flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  You save ${discountInfo.discountAmount} ({discountInfo.discountType === 'percentage' ? `${discountInfo.discountValue}%` : `$${discountInfo.discountValue}`} off)
                </p>
              </div>
            ) : (
              <p className="text-4xl font-bold text-chocolate">
                ${plan.price}/month
              </p>
            )}
          </div>

          <ul className="space-y-3 mb-6">
            {plan.features.map((feature, i) => (
              <li key={i} className="flex items-center text-chocolate">
                <svg
                  className="h-5 w-5 text-green-600 mr-2"
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

          {/* Discount Code Section */}
          <div className="mb-8 p-4 bg-biscotti-light border border-biscotti">
            <label className="block text-sm font-medium text-chocolate mb-2">
              <Tag className="h-4 w-4 inline mr-1" />
              Have a discount code?
            </label>
            {discountInfo?.valid ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 p-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-700">{discountCode.toUpperCase()}</span>
                  <span className="text-green-600 text-sm">applied</span>
                </div>
                <button
                  onClick={handleRemoveDiscount}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                  placeholder="Enter code"
                  className="flex-1 border border-biscotti px-4 py-2 text-chocolate focus:outline-none focus:border-chocolate"
                />
                <button
                  onClick={handleApplyDiscount}
                  disabled={discountLoading || !discountCode.trim()}
                  className="bg-chocolate text-white px-4 py-2 font-medium hover:bg-cinnamon-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {discountLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Apply'
                  )}
                </button>
              </div>
            )}
            {discountInfo && !discountInfo.valid && (
              <p className="mt-2 text-red-600 text-sm flex items-center gap-1">
                <XCircle className="h-4 w-4" />
                {discountInfo.error}
              </p>
            )}
          </div>
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
                        discountCode: discountInfo?.valid ? discountCode : null,
                        discountCodeId: discountInfo?.valid ? discountInfo.discountCodeId : null,
                        discountAmount: discountInfo?.valid ? discountInfo.discountAmount : null,
                        finalPrice: discountInfo?.valid ? discountInfo.finalPrice : plan.price,
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
            <div className="p-6 bg-biscotti-light border border-biscotti text-center">
              <p className="font-semibold text-chocolate mb-2">Ready to Get Started?</p>
              <p className="text-tawny text-sm mb-4">
                To complete your enrollment, please contact us directly and we&apos;ll get you set up.
              </p>
              <a
                href={`mailto:elevatedphysiquefitness@gmail.com?subject=Enrollment%20Request%20-%20${encodeURIComponent(plan.name)}${discountInfo?.valid ? `%20(Code:%20${discountCode})` : ''}`}
                className="inline-block bg-chocolate text-white px-6 py-3 font-semibold hover:bg-cinnamon-dark transition-colors"
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
