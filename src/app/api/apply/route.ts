import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullName, email, phone, goals, experience, availability, programInterest, whyElevated } = body;

    if (!fullName || !email || !phone || !goals || !experience || !availability || !programInterest || !whyElevated) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error } = await supabase
      .from('coaching_applications')
      .insert({
        full_name: fullName,
        email,
        phone,
        goals,
        experience_level: experience,
        availability,
        program_interest: programInterest,
        why_elevated: whyElevated,
        status: 'new',
      });

    if (error) {
      console.error('Error saving application:', error);
      return NextResponse.json(
        { error: 'Failed to save application' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Application form error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
