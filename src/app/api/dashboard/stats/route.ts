import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Query each table individually
    const [
      workoutsResult,
      checkInsResult,
      photosResult,
      habitsResult,
      messagesResult,
      programResult,
      todayHabitsResult,
      totalHabitsResult,
    ] = await Promise.all([
      // Total completed workouts (using assigned_workouts table)
      supabase
        .from('assigned_workouts')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', clientId)
        .eq('status', 'completed'),

      // Total check-ins
      supabase
        .from('check_ins')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', clientId),

      // Total progress photos
      supabase
        .from('progress_photos')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', clientId),

      // Total habits completed (all time)
      supabase
        .from('habit_logs')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', clientId)
        .eq('completed', true),

      // Unread messages
      supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', clientId)
        .eq('read', false),

      // Current program week
      supabase
        .from('client_programs')
        .select('current_week')
        .eq('client_id', clientId)
        .eq('status', 'active')
        .single(),

      // Today's completed habits
      supabase
        .from('habit_logs')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', clientId)
        .eq('log_date', new Date().toISOString().split('T')[0])
        .eq('completed', true),

      // Total active habits
      supabase
        .from('habits')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', clientId)
        .eq('is_active', true),
    ]);

    // Calculate workouts this week
    const startOfWeek = getStartOfWeek();
    const { count: workoutsThisWeek } = await supabase
      .from('assigned_workouts')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', clientId)
      .eq('status', 'completed')
      .gte('workout_date', startOfWeek);

    const stats = {
      total_sessions_completed: workoutsResult.count || 0,
      total_check_ins: checkInsResult.count || 0,
      total_progress_photos: photosResult.count || 0,
      total_habits_completed: habitsResult.count || 0,
      total_notes: 0,
      unread_messages: messagesResult.count || 0,
      current_week: programResult.data?.current_week || 1,
      sessions_this_week: workoutsThisWeek || 0,
      habits_today: todayHabitsResult.count || 0,
      total_habits_today: totalHabitsResult.count || 0,
      habit_streak: 0,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}

function getStartOfWeek(): string {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const startOfWeek = new Date(now.setDate(diff));
  return startOfWeek.toISOString().split('T')[0];
}
