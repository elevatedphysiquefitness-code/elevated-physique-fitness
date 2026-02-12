import { NextResponse } from 'next/server';
import { getStripeServer } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get('customer_id');

  if (!customerId) {
    return NextResponse.json({ error: 'Customer ID required' }, { status: 400 });
  }

  // Verify the user is authenticated and this is their customer ID
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify this customer ID belongs to the user
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .or(`client_id.eq.${user.id},user_id.eq.${user.id}`)
      .eq('stripe_customer_id', customerId)
      .single();

    if (!subscription) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch payments from Stripe (invoices for subscriptions)
    const stripe = getStripeServer();

    // Get invoices (subscription payments)
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit: 20,
    });

    const payments = invoices.data
      .filter((invoice) => invoice.status === 'paid' || invoice.amount_paid > 0)
      .map((invoice) => ({
        id: invoice.id,
        amount: invoice.amount_paid,
        status: invoice.status === 'paid' ? 'succeeded' : invoice.status || 'unknown',
        created: new Date(invoice.created * 1000).toISOString(),
        invoice_url: invoice.hosted_invoice_url || invoice.invoice_pdf || null,
      }));

    return NextResponse.json({ payments });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}
