'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Tag, CheckCircle, XCircle, Loader2, Calendar, CreditCard } from 'lucide-react';

type BillingInterval = 'weekly' | 'biweekly' | 'monthly';
type PaymentMethod = 'stripe';

interface PlanConfig {
  name: string;
  monthlyPrice: number;
  planType: string;
  planKey: string;
  planIds: {
    weekly: string | undefined;
    biweekly: string | undefined;
    monthly: string | undefined;
  };
  features: string[];
}

const BILLING_INTERVALS = {
  weekly: { label: 'Weekly', divisor: 4, suffix: '/week' },
  biweekly: { label: 'Bi-Weekly', divisor: 2, suffix: '/2 weeks' },
  monthly: { label: 'Monthly', divisor: 1, suffix: '/month' },
};

const PLANS = {
  test: {
    'test-plan': {
      name: 'Test Plan ($1)',
      monthlyPrice: 4.0, // $1/week = $4/month equivalent
      planType: 'online', // Use 'online' to match database constraint
      planKey: 'test-plan',
      planIds: {
        weekly: process.env.NEXT_PUBLIC_PAYPAL_PLAN_TEST,
        biweekly: process.env.NEXT_PUBLIC_PAYPAL_PLAN_TEST,
        monthly: process.env.NEXT_PUBLIC_PAYPAL_PLAN_TEST,
      },
      features: ['Test payment only', 'Cancel after testing', '$1 weekly charge'],
    },
  },
  inperson: {
    unlimited: {
      name: 'Unlimited (In-Person)',
      monthlyPrice: 900.0,
      planType: 'in-person',
      planKey: 'unlimited',
      planIds: {
        weekly: process.env.NEXT_PUBLIC_PAYPAL_PLAN_INPERSON_UNLIMITED_WEEKLY,
        biweekly: process.env.NEXT_PUBLIC_PAYPAL_PLAN_INPERSON_UNLIMITED_BIWEEKLY,
        monthly: process.env.NEXT_PUBLIC_PAYPAL_PLAN_INPERSON_UNLIMITED,
      },
      features: ['5 sessions/week', 'Hands-on coaching', 'Priority support'],
    },
    'elevated-physique': {
      name: 'Elevated Physique (In-Person)',
      monthlyPrice: 720.0,
      planType: 'in-person',
      planKey: 'elevated-physique',
      planIds: {
        weekly: process.env.NEXT_PUBLIC_PAYPAL_PLAN_INPERSON_ELEVATED_PHYSIQUE_WEEKLY,
        biweekly: process.env.NEXT_PUBLIC_PAYPAL_PLAN_INPERSON_ELEVATED_PHYSIQUE_BIWEEKLY,
        monthly: process.env.NEXT_PUBLIC_PAYPAL_PLAN_INPERSON_ELEVATED_PHYSIQUE,
      },
      features: ['4 sessions/week', 'Structured routine', 'Progress tracking'],
    },
    physique: {
      name: 'Physique (In-Person)',
      monthlyPrice: 540.0,
      planType: 'in-person',
      planKey: 'physique',
      planIds: {
        weekly: process.env.NEXT_PUBLIC_PAYPAL_PLAN_INPERSON_PHYSIQUE_WEEKLY,
        biweekly: process.env.NEXT_PUBLIC_PAYPAL_PLAN_INPERSON_PHYSIQUE_BIWEEKLY,
        monthly: process.env.NEXT_PUBLIC_PAYPAL_PLAN_INPERSON_PHYSIQUE,
      },
      features: ['3 sessions/week', 'Technique coaching', 'Habit building'],
    },
    elevated: {
      name: 'Elevated (In-Person)',
      monthlyPrice: 360.0,
      planType: 'in-person',
      planKey: 'elevated',
      planIds: {
        weekly: process.env.NEXT_PUBLIC_PAYPAL_PLAN_INPERSON_ELEVATED_WEEKLY,
        biweekly: process.env.NEXT_PUBLIC_PAYPAL_PLAN_INPERSON_ELEVATED_BIWEEKLY,
        monthly: process.env.NEXT_PUBLIC_PAYPAL_PLAN_INPERSON_ELEVATED,
      },
      features: ['2 sessions/week', 'Form fundamentals', 'Flexible structure'],
    },
  },
  online: {
    unlimited: {
      name: 'Unlimited (Online)',
      monthlyPrice: 700.0,
      planType: 'online',
      planKey: 'unlimited',
      planIds: {
        weekly: process.env.NEXT_PUBLIC_PAYPAL_PLAN_ONLINE_UNLIMITED_WEEKLY,
        biweekly: process.env.NEXT_PUBLIC_PAYPAL_PLAN_ONLINE_UNLIMITED_BIWEEKLY,
        monthly: process.env.NEXT_PUBLIC_PAYPAL_PLAN_ONLINE_UNLIMITED,
      },
      features: ['5 days/week', 'Remote guidance', 'Full access'],
    },
    'elevated-physique': {
      name: 'Elevated Physique (Online)',
      monthlyPrice: 560.0,
      planType: 'online',
      planKey: 'elevated-physique',
      planIds: {
        weekly: process.env.NEXT_PUBLIC_PAYPAL_PLAN_ONLINE_ELEVATED_PHYSIQUE_WEEKLY,
        biweekly: process.env.NEXT_PUBLIC_PAYPAL_PLAN_ONLINE_ELEVATED_PHYSIQUE_BIWEEKLY,
        monthly: process.env.NEXT_PUBLIC_PAYPAL_PLAN_ONLINE_ELEVATED_PHYSIQUE,
      },
      features: ['4 days/week', 'Structured programming', 'Weekly check-ins'],
    },
    physique: {
      name: 'Physique (Online)',
      monthlyPrice: 420.0,
      planType: 'online',
      planKey: 'physique',
      planIds: {
        weekly: process.env.NEXT_PUBLIC_PAYPAL_PLAN_ONLINE_PHYSIQUE_WEEKLY,
        biweekly: process.env.NEXT_PUBLIC_PAYPAL_PLAN_ONLINE_PHYSIQUE_BIWEEKLY,
        monthly: process.env.NEXT_PUBLIC_PAYPAL_PLAN_ONLINE_PHYSIQUE,
      },
      features: ['3 days/week', 'Progress tracking', 'Workout library'],
    },
    elevated: {
      name: 'Elevated (Online)',
      monthlyPrice: 280.0,
      planType: 'online',
      planKey: 'elevated',
      planIds: {
        weekly: process.env.NEXT_PUBLIC_PAYPAL_PLAN_ONLINE_ELEVATED_WEEKLY,
        biweekly: process.env.NEXT_PUBLIC_PAYPAL_PLAN_ONLINE_ELEVATED_BIWEEKLY,
        monthly: process.env.NEXT_PUBLIC_PAYPAL_PLAN_ONLINE_ELEVATED,
      },
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
  const [billingInterval, setBillingInterval] = useState<BillingInterval>('monthly');
  const [stripeLoading, setStripeLoading] = useState(false);

  const planGroup = PLANS[resolvedParams.type as keyof typeof PLANS] as Record<string, PlanConfig> | undefined;
  const plan = planGroup?.[resolvedParams.plan] as PlanConfig | undefined;

  // Calculate price based on billing interval
  const getIntervalPrice = (monthlyPrice: number, interval: BillingInterval) => {
    const divisor = BILLING_INTERVALS[interval].divisor;
    return Math.round((monthlyPrice / divisor) * 100) / 100;
  };

  const currentPrice = plan ? getIntervalPrice(plan.monthlyPrice, billingInterval) : 0;
  const currentPlanId = plan?.planIds[billingInterval];

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
    if (!discountCode.trim() || !plan) return;

    setDiscountLoading(true);
    setDiscountInfo(null);

    try {
      const response = await fetch('/api/discount/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: discountCode.trim(),
          planKey: plan.planKey,
          originalPrice: currentPrice,
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

  // Reset discount when billing interval changes
  const handleIntervalChange = (interval: BillingInterval) => {
    setBillingInterval(interval);
    setDiscountInfo(null);
    setDiscountCode('');
  };

  // Handle Stripe checkout
  const handleStripeCheckout = async () => {
    if (!plan) return;

    setStripeLoading(true);
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planType: resolvedParams.type,
          planKey: plan.planKey,
          billingInterval,
          planName: plan.name,
          price: currentPrice,
          discountCode: discountInfo?.valid ? discountCode : null,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Failed to start checkout');
      }
    } catch (error) {
      console.error('Stripe checkout error:', error);
      alert('Failed to start checkout. Please try again.');
    }
    setStripeLoading(false);
  };

  const displayPrice = discountInfo?.valid ? discountInfo.finalPrice : currentPrice;
  const intervalSuffix = BILLING_INTERVALS[billingInterval].suffix;

  return (
    <div className="min-h-screen bg-biscotti-light py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-2 text-chocolate">{plan.name}</h1>

          {/* Billing Interval Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-chocolate mb-3">
              <Calendar className="h-4 w-4 inline mr-1" />
              Choose Payment Schedule
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(BILLING_INTERVALS) as BillingInterval[]).map((interval) => (
                <button
                  key={interval}
                  onClick={() => handleIntervalChange(interval)}
                  className={`p-3 text-center border-2 transition-colors ${
                    billingInterval === interval
                      ? 'border-chocolate bg-chocolate text-white'
                      : 'border-biscotti bg-white text-chocolate hover:border-chocolate'
                  }`}
                >
                  <span className="block font-semibold">{BILLING_INTERVALS[interval].label}</span>
                  <span className="block text-sm mt-1">
                    ${getIntervalPrice(plan.monthlyPrice, interval).toFixed(2)}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-xs text-grey-500 mt-2 text-center">
              Same total monthly cost, just different payment frequencies
            </p>
          </div>

          {/* Price Display */}
          <div className="mb-6">
            {discountInfo?.valid ? (
              <div>
                <p className="text-2xl text-tawny line-through">
                  ${currentPrice.toFixed(2)}{intervalSuffix}
                </p>
                <p className="text-4xl font-bold text-chocolate">
                  ${displayPrice?.toFixed(2)}{intervalSuffix}
                </p>
                <p className="text-green-600 text-sm mt-1 flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  You save ${discountInfo.discountAmount?.toFixed(2)} ({discountInfo.discountType === 'percentage' ? `${discountInfo.discountValue}%` : `$${discountInfo.discountValue}`} off)
                </p>
              </div>
            ) : (
              <p className="text-4xl font-bold text-chocolate">
                ${currentPrice.toFixed(2)}{intervalSuffix}
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
          {/* Stripe Payment */}
          <button
            onClick={handleStripeCheckout}
            disabled={stripeLoading}
            className="w-full bg-[#635BFF] hover:bg-[#5851DB] text-white py-4 font-semibold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {stripeLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Redirecting to Checkout...
              </>
            ) : (
              <>
                <CreditCard className="h-5 w-5" />
                Pay with Card / Bank
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
