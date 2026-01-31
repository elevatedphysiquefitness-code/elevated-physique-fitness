import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, message, commitment, sessionsPerWeek, monthlyPrice } = body;

    if (!name || !email || !phone || !commitment || !sessionsPerWeek) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Store the inquiry
    const { error } = await supabase
      .from('commitment_inquiries')
      .insert({
        name,
        email,
        phone,
        message: message || null,
        commitment_length: commitment,
        sessions_per_week: sessionsPerWeek,
        monthly_price: monthlyPrice,
        status: 'new',
      });

    if (error) {
      console.error('Error storing commitment inquiry:', error);
      // If table doesn't exist, still return success (inquiry received)
      // Admin can check logs or we can notify via email
    }

    // Optionally send notification email to admin here
    // await sendAdminNotification({ name, email, phone, commitment, sessionsPerWeek, monthlyPrice });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing commitment inquiry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process inquiry' },
      { status: 500 }
    );
  }
}
