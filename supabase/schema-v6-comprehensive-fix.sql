-- ============================================================
-- V6 COMPREHENSIVE FIX
-- Fixes: missing columns, missing admin RLS policies,
-- missing admin messages policy, habits admin access
-- Run this in Supabase SQL Editor
-- ============================================================

-- ============================================================
-- PART 1: ENSURE is_admin() FUNCTION EXISTS
-- (Should already exist from V5, but just in case)
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
-- PART 2: ADD MISSING COLUMNS
-- ============================================================

-- client_details: onboarding_completed (V3 had it but V4 missed it)
ALTER TABLE client_details ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- habits: is_active column used by dashboard
ALTER TABLE habits ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- habit_logs: client_id and log_date columns
ALTER TABLE habit_logs ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE habit_logs ADD COLUMN IF NOT EXISTS log_date DATE;

-- progress_photos: photo_date for ordering
ALTER TABLE progress_photos ADD COLUMN IF NOT EXISTS photo_date DATE DEFAULT CURRENT_DATE;

-- client_details: activity_level used by nutrition page
ALTER TABLE client_details ADD COLUMN IF NOT EXISTS activity_level TEXT;

-- measurements: measurement_date
ALTER TABLE measurements ADD COLUMN IF NOT EXISTS measurement_date DATE DEFAULT CURRENT_DATE;

-- Unique constraint for habit_logs upsert
DO $$
BEGIN
  ALTER TABLE habit_logs ADD CONSTRAINT habit_logs_habit_id_log_date_key UNIQUE (habit_id, log_date);
EXCEPTION
  WHEN duplicate_table THEN NULL;
  WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- PART 3: ADD MISSING ADMIN RLS POLICIES
-- V4/V5 missed admin policies for messages, habits, habit_logs
-- ============================================================

-- Messages: Admin needs to see ALL client messages
DROP POLICY IF EXISTS "Admins can manage all messages" ON messages;
CREATE POLICY "Admins can manage all messages" ON messages
  FOR ALL USING (public.is_admin());

-- Habits: Admin needs to see client habits
DROP POLICY IF EXISTS "Admins can manage all habits" ON habits;
CREATE POLICY "Admins can manage all habits" ON habits
  FOR ALL USING (public.is_admin());

-- Habit logs: Admin needs to see client habit logs
DROP POLICY IF EXISTS "Admins can manage all habit logs" ON habit_logs;
CREATE POLICY "Admins can manage all habit logs" ON habit_logs
  FOR ALL USING (public.is_admin());

-- Assigned workouts: Ensure admin policy exists (should from V5)
DROP POLICY IF EXISTS "Admins can manage all assigned workouts" ON assigned_workouts;
CREATE POLICY "Admins can manage all assigned workouts" ON assigned_workouts
  FOR ALL USING (public.is_admin());

-- Workout template exercises: Ensure admin policy exists
DROP POLICY IF EXISTS "Admins can manage all template exercises" ON workout_template_exercises;
CREATE POLICY "Admins can manage all template exercises" ON workout_template_exercises
  FOR ALL USING (public.is_admin());

-- Workout template exercises: Users can view
DROP POLICY IF EXISTS "Anyone can view template exercises" ON workout_template_exercises;
CREATE POLICY "Anyone can view template exercises" ON workout_template_exercises
  FOR SELECT USING (true);

-- ============================================================
-- PART 4: ENSURE PRESET HABITS EXIST (for new users)
-- Only insert if the habits table is empty
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM habits WHERE is_active = true LIMIT 1) THEN
    -- These will be client_id = NULL (preset templates)
    -- Users get their own copies when they set up habits
    NULL; -- Skip for now, users create their own
  END IF;
END $$;

-- ============================================================
-- PART 5: VERIFY ALL POLICIES
-- Run this query after to check:
-- SELECT tablename, policyname FROM pg_policies
-- WHERE schemaname = 'public' ORDER BY tablename;
-- ============================================================

-- DONE!
-- Fixes:
-- 1. Missing onboarding_completed column on client_details
-- 2. Missing is_active, client_id, log_date columns
-- 3. Missing admin RLS policies for messages, habits, habit_logs
-- 4. Missing admin policy for assigned_workouts, workout_template_exercises
