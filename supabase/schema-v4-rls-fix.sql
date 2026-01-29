-- ============================================================
-- ELEVATED PHYSIQUE FITNESS - V4 COMPREHENSIVE RLS & SCHEMA FIX
-- Fixes ALL write failures in production
-- Run this in your Supabase SQL Editor
-- ============================================================

-- ============================================================
-- PART 1: ADD MISSING COLUMNS
-- These columns are referenced by code but may not exist
-- depending on which schema versions were run previously
-- ============================================================

-- client_programs: V1 has program_id but not program_name/total_weeks
-- V2 has program_name/total_weeks but not program_id
-- We need ALL columns
ALTER TABLE client_programs ADD COLUMN IF NOT EXISTS program_name TEXT;
ALTER TABLE client_programs ADD COLUMN IF NOT EXISTS total_weeks INTEGER DEFAULT 12;
ALTER TABLE client_programs ADD COLUMN IF NOT EXISTS assigned_by UUID REFERENCES profiles(id);
ALTER TABLE client_programs ADD COLUMN IF NOT EXISTS assignment_notes TEXT;
ALTER TABLE client_programs ADD COLUMN IF NOT EXISTS is_custom BOOLEAN DEFAULT FALSE;

-- check_ins: Code writes 'adherence' and 'notes' columns that don't exist in V1/V2
ALTER TABLE check_ins ADD COLUMN IF NOT EXISTS adherence TEXT;
ALTER TABLE check_ins ADD COLUMN IF NOT EXISTS notes TEXT;

-- progress_photos: V1 has photo_url but not storage_path; V3 has storage_path
ALTER TABLE progress_photos ADD COLUMN IF NOT EXISTS storage_path TEXT;
ALTER TABLE progress_photos ADD COLUMN IF NOT EXISTS measurement_id UUID;
ALTER TABLE progress_photos ADD COLUMN IF NOT EXISTS thumbnail_path TEXT;

-- Make photo_url nullable (we might only have storage_path)
DO $$
BEGIN
  ALTER TABLE progress_photos ALTER COLUMN photo_url DROP NOT NULL;
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- workout_programs: AI generation feature needs this column
ALTER TABLE workout_programs ADD COLUMN IF NOT EXISTS is_ai_generated BOOLEAN DEFAULT FALSE;

-- workout_templates: AI generation tracking
ALTER TABLE workout_templates ADD COLUMN IF NOT EXISTS is_ai_generated BOOLEAN DEFAULT FALSE;
ALTER TABLE workout_templates ADD COLUMN IF NOT EXISTS ai_prompt TEXT;
ALTER TABLE workout_templates ADD COLUMN IF NOT EXISTS created_for_client_id UUID REFERENCES profiles(id);

-- client_details: Onboarding questionnaire fields (from V3)
ALTER TABLE client_details ADD COLUMN IF NOT EXISTS fitness_goals TEXT[];
ALTER TABLE client_details ADD COLUMN IF NOT EXISTS body_part_goals TEXT[];
ALTER TABLE client_details ADD COLUMN IF NOT EXISTS fitness_level TEXT;
ALTER TABLE client_details ADD COLUMN IF NOT EXISTS available_equipment TEXT;
ALTER TABLE client_details ADD COLUMN IF NOT EXISTS injuries TEXT[];
ALTER TABLE client_details ADD COLUMN IF NOT EXISTS medical_conditions TEXT[];
ALTER TABLE client_details ADD COLUMN IF NOT EXISTS is_pregnant BOOLEAN DEFAULT FALSE;
ALTER TABLE client_details ADD COLUMN IF NOT EXISTS dietary_preferences TEXT[];
ALTER TABLE client_details ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

-- exercises: Enhanced fields (from V3)
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS difficulty_level TEXT;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS equipment_required TEXT[];
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS is_compound BOOLEAN DEFAULT FALSE;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS calories_per_minute DECIMAL;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS primary_muscles TEXT[];
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS secondary_muscles TEXT[];

-- profiles: Avatar storage
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_storage_path TEXT;

-- ============================================================
-- PART 2: FIX CHECK CONSTRAINTS
-- Remove restrictive constraints that block valid form data
-- ============================================================

-- Fix sleep_quality CHECK - code sends 'poor','fair','good','great','excellent'
-- V1 only allows ('poor','fair','good','excellent') - missing 'great'
DO $$
DECLARE
  constraint_name TEXT;
BEGIN
  SELECT con.conname INTO constraint_name
  FROM pg_constraint con
  JOIN pg_attribute att ON att.attnum = ANY(con.conkey) AND att.attrelid = con.conrelid
  WHERE con.conrelid = 'check_ins'::regclass
    AND att.attname = 'sleep_quality'
    AND con.contype = 'c';

  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE check_ins DROP CONSTRAINT %I', constraint_name);
  END IF;
END $$;

-- Re-add with all valid values (lowercase)
ALTER TABLE check_ins ADD CONSTRAINT check_ins_sleep_quality_check
  CHECK (sleep_quality IN ('poor', 'fair', 'good', 'great', 'excellent'));

-- Fix client_details.goals CHECK if it exists (V2 restricts to enum values
-- but registration form sends free-form text like "Lose fat & get lean")
DO $$
DECLARE
  constraint_name TEXT;
BEGIN
  SELECT con.conname INTO constraint_name
  FROM pg_constraint con
  JOIN pg_attribute att ON att.attnum = ANY(con.conkey) AND att.attrelid = con.conrelid
  WHERE con.conrelid = 'client_details'::regclass
    AND att.attname = 'goals'
    AND con.contype = 'c';

  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE client_details DROP CONSTRAINT %I', constraint_name);
  END IF;
END $$;

-- Fix exercises.muscle_group CHECK - V2 restricts options but AI generates
-- exercises with 'Glutes' which isn't in the original list
DO $$
DECLARE
  constraint_name TEXT;
BEGIN
  SELECT con.conname INTO constraint_name
  FROM pg_constraint con
  JOIN pg_attribute att ON att.attnum = ANY(con.conkey) AND att.attrelid = con.conrelid
  WHERE con.conrelid = 'exercises'::regclass
    AND att.attname = 'muscle_group'
    AND con.contype = 'c';

  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE exercises DROP CONSTRAINT %I', constraint_name);
  END IF;
END $$;

-- ============================================================
-- PART 3: ENABLE RLS ON ALL TABLES
-- Matches exact table list from database
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_contraindications ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plan_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PART 4: DROP ALL EXISTING RLS POLICIES
-- Clean slate to prevent duplicates
-- ============================================================

-- profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;

-- client_details
DROP POLICY IF EXISTS "Users can view own details" ON client_details;
DROP POLICY IF EXISTS "Users can update own details" ON client_details;
DROP POLICY IF EXISTS "Users can insert own details" ON client_details;
DROP POLICY IF EXISTS "Admins can manage all client details" ON client_details;

-- client_programs
DROP POLICY IF EXISTS "Users can view own programs" ON client_programs;
DROP POLICY IF EXISTS "Admins can manage all client programs" ON client_programs;

-- subscriptions
DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Admins can manage all subscriptions" ON subscriptions;

-- messages
DROP POLICY IF EXISTS "Users can view own messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can update own received messages" ON messages;

-- measurements
DROP POLICY IF EXISTS "Users can view own measurements" ON measurements;
DROP POLICY IF EXISTS "Users can create own measurements" ON measurements;
DROP POLICY IF EXISTS "Admins can manage all measurements" ON measurements;

-- check_ins
DROP POLICY IF EXISTS "Users can view own check-ins" ON check_ins;
DROP POLICY IF EXISTS "Users can create own check-ins" ON check_ins;
DROP POLICY IF EXISTS "Admins can manage all check-ins" ON check_ins;

-- habits
DROP POLICY IF EXISTS "Users can view own habits" ON habits;
DROP POLICY IF EXISTS "Users can manage own habits" ON habits;

-- habit_logs
DROP POLICY IF EXISTS "Users can view own habit logs" ON habit_logs;
DROP POLICY IF EXISTS "Users can manage own habit logs" ON habit_logs;

-- progress_photos
DROP POLICY IF EXISTS "Users can view own photos" ON progress_photos;
DROP POLICY IF EXISTS "Users can upload own photos" ON progress_photos;
DROP POLICY IF EXISTS "Clients can view own progress photos" ON progress_photos;
DROP POLICY IF EXISTS "Clients can upload own progress photos" ON progress_photos;
DROP POLICY IF EXISTS "Clients can delete own progress photos" ON progress_photos;
DROP POLICY IF EXISTS "Admins can view all progress photos" ON progress_photos;
DROP POLICY IF EXISTS "Admins can manage all progress photos" ON progress_photos;

-- progress_entries
DROP POLICY IF EXISTS "Users can view own progress" ON progress_entries;
DROP POLICY IF EXISTS "Users can create own progress" ON progress_entries;
DROP POLICY IF EXISTS "Admins can manage all progress entries" ON progress_entries;

-- exercises
DROP POLICY IF EXISTS "Anyone can view exercises" ON exercises;
DROP POLICY IF EXISTS "Admins can manage exercises" ON exercises;

-- workout_templates
DROP POLICY IF EXISTS "Anyone can view workout templates" ON workout_templates;
DROP POLICY IF EXISTS "Admins can manage workout templates" ON workout_templates;

-- workout_programs
DROP POLICY IF EXISTS "Anyone can view workout programs" ON workout_programs;
DROP POLICY IF EXISTS "Admins can manage workout programs" ON workout_programs;

-- blog_posts
DROP POLICY IF EXISTS "Anyone can view published posts" ON blog_posts;
DROP POLICY IF EXISTS "Admins can manage all blog posts" ON blog_posts;

-- exercise_contraindications
DROP POLICY IF EXISTS "Anyone can view contraindications" ON exercise_contraindications;
DROP POLICY IF EXISTS "Admins can manage contraindications" ON exercise_contraindications;

-- exercise_logs
DROP POLICY IF EXISTS "Users can manage own exercise logs" ON exercise_logs;
DROP POLICY IF EXISTS "Admins can manage all exercise logs" ON exercise_logs;

-- foods
DROP POLICY IF EXISTS "Anyone can view foods" ON foods;
DROP POLICY IF EXISTS "Admins can manage foods" ON foods;

-- meal_plans
DROP POLICY IF EXISTS "Users can view own meal plans" ON meal_plans;
DROP POLICY IF EXISTS "Admins can manage all meal plans" ON meal_plans;

-- meal_plan_days
DROP POLICY IF EXISTS "Users can view own meal plan days" ON meal_plan_days;
DROP POLICY IF EXISTS "Admins can manage all meal plan days" ON meal_plan_days;

-- meals
DROP POLICY IF EXISTS "Users can view own meals" ON meals;
DROP POLICY IF EXISTS "Admins can manage all meals" ON meals;

-- payments
DROP POLICY IF EXISTS "Users can view own payments" ON payments;
DROP POLICY IF EXISTS "Admins can manage all payments" ON payments;

-- usage_tracking
DROP POLICY IF EXISTS "Users can manage own usage" ON usage_tracking;
DROP POLICY IF EXISTS "Admins can manage all usage" ON usage_tracking;

-- webhook_events
DROP POLICY IF EXISTS "Admins can manage webhook events" ON webhook_events;

-- workout_days
DROP POLICY IF EXISTS "Anyone can view workout days" ON workout_days;
DROP POLICY IF EXISTS "Admins can manage workout days" ON workout_days;

-- workout_exercises
DROP POLICY IF EXISTS "Anyone can view workout exercises" ON workout_exercises;
DROP POLICY IF EXISTS "Admins can manage workout exercises" ON workout_exercises;

-- workout_logs
DROP POLICY IF EXISTS "Users can manage own workout logs" ON workout_logs;
DROP POLICY IF EXISTS "Admins can manage all workout logs" ON workout_logs;

-- ============================================================
-- PART 5: CREATE ALL RLS POLICIES (COMPREHENSIVE)
-- ============================================================

-- =========================
-- PROFILES
-- =========================
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can manage all profiles" ON profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =========================
-- CLIENT DETAILS
-- =========================
CREATE POLICY "Users can view own details" ON client_details
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own details" ON client_details
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own details" ON client_details
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all client details" ON client_details
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =========================
-- CLIENT PROGRAMS
-- =========================
CREATE POLICY "Users can view own programs" ON client_programs
  FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "Admins can manage all client programs" ON client_programs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =========================
-- SUBSCRIPTIONS
-- =========================
CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "Admins can manage all subscriptions" ON subscriptions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =========================
-- MESSAGES
-- =========================
CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update own received messages" ON messages
  FOR UPDATE USING (auth.uid() = receiver_id);

-- =========================
-- MEASUREMENTS
-- =========================
CREATE POLICY "Users can view own measurements" ON measurements
  FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "Users can create own measurements" ON measurements
  FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Admins can manage all measurements" ON measurements
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =========================
-- CHECK-INS
-- =========================
CREATE POLICY "Users can view own check-ins" ON check_ins
  FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "Users can create own check-ins" ON check_ins
  FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Admins can manage all check-ins" ON check_ins
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =========================
-- HABITS
-- =========================
CREATE POLICY "Users can manage own habits" ON habits
  FOR ALL USING (auth.uid() = client_id);

-- =========================
-- HABIT LOGS
-- =========================
CREATE POLICY "Users can manage own habit logs" ON habit_logs
  FOR ALL USING (auth.uid() = client_id);

-- =========================
-- PROGRESS PHOTOS
-- =========================
CREATE POLICY "Users can view own photos" ON progress_photos
  FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "Users can upload own photos" ON progress_photos
  FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients can delete own progress photos" ON progress_photos
  FOR DELETE USING (auth.uid() = client_id);

CREATE POLICY "Admins can manage all progress photos" ON progress_photos
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =========================
-- PROGRESS ENTRIES
-- =========================
CREATE POLICY "Users can view own progress" ON progress_entries
  FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "Users can create own progress" ON progress_entries
  FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Admins can manage all progress entries" ON progress_entries
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =========================
-- EXERCISES (Library - shared)
-- =========================
CREATE POLICY "Anyone can view exercises" ON exercises
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage exercises" ON exercises
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =========================
-- WORKOUT TEMPLATES
-- =========================
CREATE POLICY "Anyone can view workout templates" ON workout_templates
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage workout templates" ON workout_templates
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =========================
-- WORKOUT PROGRAMS
-- =========================
CREATE POLICY "Anyone can view workout programs" ON workout_programs
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage workout programs" ON workout_programs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =========================
-- BLOG POSTS
-- =========================
-- Public can view published posts
CREATE POLICY "Anyone can view published posts" ON blog_posts
  FOR SELECT USING (published = true);

-- Admins can manage all posts (create, edit, delete, view drafts)
CREATE POLICY "Admins can manage all blog posts" ON blog_posts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =========================
-- EXERCISE CONTRAINDICATIONS (reference data)
-- =========================
CREATE POLICY "Anyone can view contraindications" ON exercise_contraindications
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage contraindications" ON exercise_contraindications
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =========================
-- EXERCISE LOGS
-- =========================
-- Try client_id-based policy (safe: if column doesn't exist, admin policy still works)
DO $$
BEGIN
  EXECUTE 'CREATE POLICY "Users can manage own exercise logs" ON exercise_logs FOR ALL USING (auth.uid() = client_id)';
EXCEPTION
  WHEN undefined_column THEN
    -- Column might be user_id instead
    BEGIN
      EXECUTE 'CREATE POLICY "Users can manage own exercise logs" ON exercise_logs FOR ALL USING (auth.uid() = user_id)';
    EXCEPTION
      WHEN undefined_column THEN NULL; -- Admin-only fallback
    END;
END $$;

CREATE POLICY "Admins can manage all exercise logs" ON exercise_logs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =========================
-- FOODS (reference data)
-- =========================
CREATE POLICY "Anyone can view foods" ON foods
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage foods" ON foods
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =========================
-- MEAL PLANS
-- =========================
CREATE POLICY "Users can view own meal plans" ON meal_plans
  FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "Admins can manage all meal plans" ON meal_plans
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =========================
-- MEAL PLAN DAYS (child of meal_plans)
-- =========================
CREATE POLICY "Users can view own meal plan days" ON meal_plan_days
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM meal_plans WHERE id = meal_plan_days.meal_plan_id AND client_id = auth.uid())
  );

CREATE POLICY "Admins can manage all meal plan days" ON meal_plan_days
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =========================
-- MEALS (child of meal_plan_days)
-- =========================
CREATE POLICY "Users can view own meals" ON meals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM meal_plan_days mpd
      JOIN meal_plans mp ON mp.id = mpd.meal_plan_id
      WHERE mpd.id = meals.meal_plan_day_id AND mp.client_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all meals" ON meals
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =========================
-- PAYMENTS
-- =========================
DO $$
BEGIN
  EXECUTE 'CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING (auth.uid() = client_id)';
EXCEPTION
  WHEN undefined_column THEN
    BEGIN
      EXECUTE 'CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING (auth.uid() = user_id)';
    EXCEPTION
      WHEN undefined_column THEN NULL; -- Admin-only fallback
    END;
END $$;

CREATE POLICY "Admins can manage all payments" ON payments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =========================
-- USAGE TRACKING
-- =========================
DO $$
BEGIN
  EXECUTE 'CREATE POLICY "Users can manage own usage" ON usage_tracking FOR ALL USING (auth.uid() = user_id)';
EXCEPTION
  WHEN undefined_column THEN
    BEGIN
      EXECUTE 'CREATE POLICY "Users can manage own usage" ON usage_tracking FOR ALL USING (auth.uid() = client_id)';
    EXCEPTION
      WHEN undefined_column THEN NULL; -- Admin-only fallback
    END;
END $$;

CREATE POLICY "Admins can manage all usage" ON usage_tracking
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =========================
-- WEBHOOK EVENTS (system table - admin only)
-- =========================
CREATE POLICY "Admins can manage webhook events" ON webhook_events
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =========================
-- WORKOUT DAYS (part of programs - shared content)
-- =========================
CREATE POLICY "Anyone can view workout days" ON workout_days
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage workout days" ON workout_days
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =========================
-- WORKOUT EXERCISES (part of programs - shared content)
-- =========================
CREATE POLICY "Anyone can view workout exercises" ON workout_exercises
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage workout exercises" ON workout_exercises
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =========================
-- WORKOUT LOGS
-- =========================
DO $$
BEGIN
  EXECUTE 'CREATE POLICY "Users can manage own workout logs" ON workout_logs FOR ALL USING (auth.uid() = client_id)';
EXCEPTION
  WHEN undefined_column THEN
    BEGIN
      EXECUTE 'CREATE POLICY "Users can manage own workout logs" ON workout_logs FOR ALL USING (auth.uid() = user_id)';
    EXCEPTION
      WHEN undefined_column THEN NULL; -- Admin-only fallback
    END;
END $$;

CREATE POLICY "Admins can manage all workout logs" ON workout_logs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- PART 6: VERIFY
-- ============================================================
-- Run this query after applying to verify all policies:
-- SELECT tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;

-- ============================================================
-- DONE! All RLS policies are now comprehensive.
-- Covers ALL 27 tables in the database.
-- Key fixes:
-- 1. Added INSERT policy on profiles (registration)
-- 2. Added INSERT policy on client_details (registration/onboarding)
-- 3. Added admin ALL policy on client_details (admin can view client info)
-- 4. Added admin ALL policy on client_programs (admin can assign programs)
-- 5. Added admin ALL policy on subscriptions
-- 6. Added admin ALL policy on progress_photos
-- 7. Added progress_entries policies (client + admin)
-- 8. Enabled RLS on workout_programs with proper policies
-- 9. Added RLS for blog_posts, foods, meals, meal_plans, etc.
-- 10. Added RLS for workout_days, workout_exercises, workout_logs
-- 11. Added RLS for payments, usage_tracking, webhook_events
-- 12. Added missing columns for check_ins, client_programs, etc.
-- 13. Fixed sleep_quality CHECK constraint to include 'great'
-- ============================================================
