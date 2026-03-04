'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CreditCard, Calendar, CheckCircle, AlertCircle, Receipt, Download, Clock, ExternalLink } from 'lucide-react';
import Button from '@/components/ui/Button';

interface Subscription {
  id: string;
  plan_name: string;
  plan_type: string;
  price: number;
  billing_cycle: string;
  billing_interval: string;
  status: string;
  start_date: string;
  next_billing_date: string;
  stripe_customer_id?: string;
}

interface PaymentRecord {
  id: string;
  amount: number;
  status: string;
  created: string;
  invoice_url?: string;
}

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [loadingPortal, setLoadingPortal] = useState(false);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // Check both client_id and user_id for backwards compatibility
      const { data } = await supabase
        .from('subscriptions')
        .select('*')
        .or(`client_id.eq.${user.id},user_id.eq.${user.id}`)
        .in('status', ['active', 'past_due'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setSubscription(data);
        // Fetch payment history if we have a stripe customer
        if (data.stripe_customer_id) {
          fetchPaymentHistory(data.stripe_customer_id);
        }
      }
    }

    setLoading(false);
  };

  const fetchPaymentHistory = async (customerId: string) => {
    setLoadingPayments(true);
    try {
      const response = await fetch(`/api/stripe/payments?customer_id=${customerId}`);
      if (response.ok) {
        const data = await response.json();
        setPayments(data.payments || []);
      }
    } catch (error) {
      console.error('Error fetching payment history:', error);
    }
    setLoadingPayments(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatPrice = (price: number, cycle: string) => {
    const interval = cycle || 'monthly';
    const cycleLabel = interval === 'weekly' ? '/week' : interval === 'biweekly' || interval === 'bi-weekly' ? '/2 weeks' : '/month';
    return `$${price}${cycleLabel}`;
  };

  const formatPaymentDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDaysUntilDue = () => {
    if (!subscription?.next_billing_date) return null;
    const due = new Date(subscription.next_billing_date + 'T00:00:00');
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const openBillingPortal = async () => {
    setLoadingPortal(true);
    try {
      const response = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await response.json();
      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Unable to open payment portal. Please contact your coach.');
      }
    } catch {
      alert('Something went wrong. Please try again.');
    }
    setLoadingPortal(false);
  };

  const daysUntilDue = getDaysUntilDue();
  const isPastDue = subscription?.status === 'past_due' || (daysUntilDue !== null && daysUntilDue < 0);

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
          {/* Past Due Alert */}
          {isPastDue && (
            <div className="bg-red-50 border border-red-200 p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-800">Payment Past Due</p>
                <p className="text-sm text-red-700 mt-1">
                  Your payment was due on {formatDate(subscription.next_billing_date)}.
                  Please update your payment method to avoid interruption to your coaching services.
                </p>
                <Button href="/dashboard/messages" variant="primary" className="mt-3 !bg-red-600 !hover:bg-red-700">
                  Contact Coach
                </Button>
              </div>
            </div>
          )}

          {/* Current Plan */}
          <div className="bg-white p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-grey-500">Current Plan</p>
                <h2 className="text-2xl font-bold text-black mt-1">{subscription.plan_name}</h2>
                <p className="text-grey-600 mt-1 capitalize">{subscription.plan_type} Coaching</p>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1 ${
                isPastDue
                  ? 'bg-red-100 text-red-700'
                  : 'bg-green-100 text-green-700'
              }`}>
                {isPastDue ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                <span className="text-sm font-medium capitalize">
                  {isPastDue ? 'Past Due' : subscription.status}
                </span>
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
                    {formatPrice(subscription.price, subscription.billing_interval || subscription.billing_cycle)}
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
                <div className={`w-10 h-10 flex items-center justify-center ${
                  isPastDue ? 'bg-red-100' : daysUntilDue !== null && daysUntilDue <= 3 ? 'bg-yellow-100' : 'bg-orange-100'
                }`}>
                  {isPastDue ? (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  ) : (
                    <Calendar className={`h-5 w-5 ${daysUntilDue !== null && daysUntilDue <= 3 ? 'text-yellow-600' : 'text-orange-600'}`} />
                  )}
                </div>
                <div>
                  <p className="text-sm text-grey-500">Next Billing</p>
                  <p className="font-semibold text-black">{formatDate(subscription.next_billing_date)}</p>
                  {daysUntilDue !== null && (
                    <p className={`text-xs font-medium mt-0.5 ${
                      isPastDue ? 'text-red-600' :
                      daysUntilDue <= 3 ? 'text-yellow-600' :
                      'text-grey-500'
                    }`}>
                      {isPastDue
                        ? `${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) !== 1 ? 's' : ''} overdue`
                        : daysUntilDue === 0
                        ? 'Due today'
                        : daysUntilDue === 1
                        ? 'Due tomorrow'
                        : `Due in ${daysUntilDue} days`
                      }
                    </p>
                  )}
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
              {subscription.stripe_customer_id && (
                <button
                  onClick={openBillingPortal}
                  disabled={loadingPortal}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#3D2314] text-white font-medium hover:bg-[#2a1810] disabled:opacity-50 transition-colors"
                >
                  <CreditCard className="h-4 w-4" />
                  {loadingPortal ? 'Opening...' : 'Manage Payment Method'}
                  {!loadingPortal && <ExternalLink className="h-3.5 w-3.5" />}
                </button>
              )}
              <Button href="/dashboard/messages" variant="outline">
                Contact Coach
              </Button>
              <Button href="/pricing" variant="ghost">
                View Other Plans
              </Button>
            </div>
            {!subscription.stripe_customer_id && (
              <p className="text-sm text-grey-500 mt-3">
                To update your payment method, please contact your coach directly.
              </p>
            )}
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

      {/* Payment History */}
      <div className="bg-white p-6">
        <h3 className="text-lg font-bold text-black mb-4">Payment History</h3>
        {loadingPayments ? (
          <div className="text-center py-8 text-grey-500">
            <p>Loading payment history...</p>
          </div>
        ) : payments.length > 0 ? (
          <div className="space-y-3">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-4 bg-grey-50 border border-grey-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 flex items-center justify-center">
                    <Receipt className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-black">
                      ${(payment.amount / 100).toFixed(2)}
                    </p>
                    <p className="text-sm text-grey-500">
                      {formatPaymentDate(payment.created)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs px-2 py-1 ${
                      payment.status === 'paid' || payment.status === 'succeeded'
                        ? 'bg-green-100 text-green-700'
                        : payment.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {payment.status === 'succeeded' ? 'Paid' : payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                  </span>
                  {payment.invoice_url && (
                    <a
                      href={payment.invoice_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-grey-500">
            <Receipt className="h-10 w-10 mx-auto text-grey-300 mb-3" />
            <p>No payment history yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
