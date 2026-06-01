import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      fullName,
      email,
      phone,
      runningExperience,
      weeklyMileage,
      currentPace,
      runningGoal,
      injuries,
      emergencyContactName,
      emergencyContactPhone,
      howHeard,
    } = body;

    if (!fullName || !email || !runningExperience || !runningGoal) {
      return NextResponse.json(
        { error: 'Full name, email, experience level, and running goal are required' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error } = await supabase.from('run_club_signups').insert({
      full_name: fullName,
      email,
      phone: phone || null,
      running_experience: runningExperience,
      weekly_mileage: weeklyMileage || null,
      current_pace: currentPace || null,
      running_goal: runningGoal,
      injuries: injuries || null,
      emergency_contact_name: emergencyContactName || null,
      emergency_contact_phone: emergencyContactPhone || null,
      how_heard: howHeard || null,
      status: 'new',
    });

    if (error) {
      console.error('Error saving run club signup:', error);
      return NextResponse.json({ error: 'Failed to save signup' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Run club signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
