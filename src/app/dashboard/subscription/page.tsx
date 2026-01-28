'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CreditCard, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';

interface Subscription {
  id: string;
  plan_name: string;
  plan_type: string;
  price: number;
  billing_cycle: string;
  status: string;
  start_date: string;
  next_billing_date: string;
}

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('client_id', user.id)
        .eq('status', 'active')
        .single();

      if (data) {
        setSubscription(data);
      }
    }

    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatPrice = (price: number, cycle: string) => {
    const cycleLabel = cycle === 'weekly' ? '/week' : cycle === 'bi-weekly' ? '/2 weeks' : '/month';
    return `$${price}${cycleLabel}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-grey-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-black">Subscription</h1>
        <p className="text-grey-600 mt-1">Manage your membership and billing</p>
      </div>

      {subscription ? (
        <>
          {/* Current Plan */}
          <div className="bg-white p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-grey-500">Current Plan</p>
                <h2 className="text-2xl font-bold text-black mt-1">{subscription.plan_name}</h2>
                <p className="text-grey-600 mt-1 capitalize">{subscription.plan_type} Coaching</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium capitalize">{subscription.status}</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-grey-500">Price</p>
                  <p className="font-semibold text-black">
                    {formatPrice(subscription.price, subscription.billing_cycle)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-grey-500">Member Since</p>
                  <p className="font-semibold text-black">{formatDate(subscription.start_date)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-grey-500">Next Billing</p>
                  <p className="font-semibold text-black">{formatDate(subscription.next_billing_date)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Plan Benefits */}
          <div className="bg-white p-6">
            <h3 className="text-lg font-bold text-black mb-4">Plan Benefits</h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                'Customized training program',
                'Weekly check-ins with coach',
                'Form review and feedback',
                'Direct messaging support',
                'Progress tracking tools',
                'Exercise video library',
                'Habit tracking',
                'Nutrition guidelines',
              ].map((benefit) => (
                <li key={benefit} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-grey-700">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Manage Subscription */}
          <div className="bg-grey-100 p-6">
            <h3 className="text-lg font-bold text-black mb-2">Manage Subscription</h3>
            <p className="text-grey-600 mb-4">
              Need to make changes to your subscription? Contact your coach to discuss options.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button href="/dashboard/messages" variant="outline">
                Contact Coach
              </Button>
              <Button href="/pricing" variant="ghost">
                View Other Plans
              </Button>
            </div>
          </div>
        </>
      ) : (
        /* No Active Subscription */
        <div className="bg-white p-8 text-center">
          <div className="w-16 h-16 bg-grey-100 mx-auto flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-grey-400" />
          </div>
          <h2 className="text-xl font-bold text-black">No Active Subscription</h2>
          <p className="text-grey-600 mt-2 max-w-md mx-auto">
            You don&apos;t have an active subscription. Choose a plan to start your transformation journey.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Button href="/pricing" variant="primary">
              View Plans
            </Button>
            <Button href="/apply" variant="outline">
              Apply for Coaching
            </Button>
          </div>
        </div>
      )}

      {/* Payment History Placeholder */}
      <div className="bg-white p-6">
        <h3 className="text-lg font-bold text-black mb-4">Payment History</h3>
        <div className="text-center py-8 text-grey-500">
          <p>Payment history will appear here once you have an active subscription.</p>
        </div>
      </div>
    </div>
  );
}
