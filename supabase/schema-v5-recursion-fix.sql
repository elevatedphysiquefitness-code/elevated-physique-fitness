-- ============================================================
-- V5 FIX: Infinite Recursion + Missing Columns + Missing Table
-- Run this in Supabase SQL Editor AFTER v4
-- ============================================================

-- ============================================================
-- PART 1: CREATE is_admin() SECURITY DEFINER FUNCTION
-- This bypasses RLS when checking admin status, preventing
-- infinite recursion when admin policies query the profiles table
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ============================================================
-- PART 2: DROP ALL ADMIN POLICIES THAT CAUSE RECURSION
-- These all use inline subqueries against profiles
-- ============================================================

DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can manage all client details" ON client_details;
DROP POLICY IF EXISTS "Admins can manage all client programs" ON client_programs;
DROP POLICY IF EXISTS "Admins can manage all subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Admins can manage all measurements" ON measurements;
DROP POLICY IF EXISTS "Admins can manage all check-ins" ON check_ins;
DROP POLICY IF EXISTS "Admins can manage all progress photos" ON progress_photos;
DROP POLICY IF EXISTS "Admins can manage all progress entries" ON progress_entries;
DROP POLICY IF EXISTS "Admins can manage exercises" ON exercises;
DROP POLICY IF EXISTS "Admins can manage workout templates" ON workout_templates;
DROP POLICY IF EXISTS "Admins can manage workout programs" ON workout_programs;
DROP POLICY IF EXISTS "Admins can manage all blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Admins can manage contraindications" ON exercise_contraindications;
DROP POLICY IF EXISTS "Admins can manage all exercise logs" ON exercise_logs;
DROP POLICY IF EXISTS "Admins can manage foods" ON foods;
DROP POLICY IF EXISTS "Admins can manage all meal plans" ON meal_plans;
DROP POLICY IF EXISTS "Admins can manage all meal plan days" ON meal_plan_days;
DROP POLICY IF EXISTS "Admins can manage all meals" ON meals;
DROP POLICY IF EXISTS "Admins can manage all payments" ON payments;
DROP POLICY IF EXISTS "Admins can manage all usage" ON usage_tracking;
DROP POLICY IF EXISTS "Admins can manage webhook events" ON webhook_events;
DROP POLICY IF EXISTS "Admins can manage workout days" ON workout_days;
DROP POLICY IF EXISTS "Admins can manage workout exercises" ON workout_exercises;
DROP POLICY IF EXISTS "Admins can manage all workout logs" ON workout_logs;

-- ============================================================
-- PART 3: RECREATE ALL ADMIN POLICIES USING is_admin()
-- No more infinite recursion
-- ============================================================

CREATE POLICY "Admins can manage all profiles" ON profiles
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can manage all client details" ON client_details
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can manage all client programs" ON client_programs
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can manage all subscriptions" ON subscriptions
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can manage all measurements" ON measurements
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can manage all check-ins" ON check_ins
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can manage all progress photos" ON progress_photos
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can manage all progress entries" ON progress_entries
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can manage exercises" ON exercises
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can manage workout templates" ON workout_templates
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can manage workout programs" ON workout_programs
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can manage all blog posts" ON blog_posts
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can manage contraindications" ON exercise_contraindications
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can manage all exercise logs" ON exercise_logs
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can manage foods" ON foods
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can manage all meal plans" ON meal_plans
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can manage all meal plan days" ON meal_plan_days
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can manage all meals" ON meals
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can manage all payments" ON payments
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can manage all usage" ON usage_tracking
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can manage webhook events" ON webhook_events
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can manage workout days" ON workout_days
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can manage workout exercises" ON workout_exercises
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can manage all workout logs" ON workout_logs
  FOR ALL USING (public.is_admin());

-- ============================================================
-- PART 4: ADD MISSING COLUMNS
-- ============================================================

-- habits: code uses is_active but column doesn't exist
ALTER TABLE habits ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- habit_logs: code uses client_id and log_date but V2 schema only has date
ALTER TABLE habit_logs ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE habit_logs ADD COLUMN IF NOT EXISTS log_date DATE;

-- Create unique constraint for habit upsert (onConflict: 'habit_id,log_date')
DO $$
BEGIN
  ALTER TABLE habit_logs ADD CONSTRAINT habit_logs_habit_id_log_date_key UNIQUE (habit_id, log_date);
EXCEPTION
  WHEN duplicate_table THEN NULL;
  WHEN duplicate_object THEN NULL;
END $$;

-- progress_photos: code uses photo_date for ordering
ALTER TABLE progress_photos ADD COLUMN IF NOT EXISTS photo_date DATE DEFAULT CURRENT_DATE;

-- client_details: nutrition page selects activity_level
ALTER TABLE client_details ADD COLUMN IF NOT EXISTS activity_level TEXT;

-- measurements: ensure measurement_date exists (V2 has it but just in case)
ALTER TABLE measurements ADD COLUMN IF NOT EXISTS measurement_date DATE DEFAULT CURRENT_DATE;

-- ============================================================
-- PART 5: CREATE MISSING TABLE - assigned_workouts
-- Code in workouts, calendar, and AI pages needs this table
-- ============================================================

CREATE TABLE IF NOT EXISTS assigned_workouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  template_id UUID REFERENCES workout_templates(id),
  workout_date DATE NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'skipped', 'rest')),
  notes TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id, workout_date)
);

CREATE INDEX IF NOT EXISTS idx_assigned_workouts_client_date ON assigned_workouts(client_id, workout_date);

-- Enable RLS and add policies for assigned_workouts
ALTER TABLE assigned_workouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own assigned workouts" ON assigned_workouts
  FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "Users can update own assigned workouts" ON assigned_workouts
  FOR UPDATE USING (auth.uid() = client_id);

CREATE POLICY "Admins can manage all assigned workouts" ON assigned_workouts
  FOR ALL USING (public.is_admin());

-- ============================================================
-- PART 6: FIX habit_logs RLS POLICY
-- The V4 policy uses client_id which may not have existed before
-- Drop and recreate now that column exists
-- ============================================================

DROP POLICY IF EXISTS "Users can manage own habit logs" ON habit_logs;
CREATE POLICY "Users can manage own habit logs" ON habit_logs
  FOR ALL USING (auth.uid() = client_id);

-- ============================================================
-- DONE!
-- Fixes:
-- 1. Infinite recursion: is_admin() SECURITY DEFINER function
-- 2. Missing columns: habits.is_active, habit_logs.client_id/log_date,
--    progress_photos.photo_date, client_details.activity_level
-- 3. Missing table: assigned_workouts (with RLS policies)
-- 4. Fixed habit_logs RLS to use client_id column
-- ============================================================
