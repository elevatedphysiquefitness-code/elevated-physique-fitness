-- ============================================
-- ALL NEW TABLES FOR ELEVATED PHYSIQUE FITNESS
-- Run this in the Supabase SQL Editor
-- ============================================

-- ============================================
-- DROP ALL TABLES FIRST (CASCADE drops policies too)
-- ============================================

DROP TABLE IF EXISTS personal_records CASCADE;
DROP TABLE IF EXISTS workout_logs CASCADE;
DROP TABLE IF EXISTS water_logs CASCADE;
DROP TABLE IF EXISTS sleep_logs CASCADE;
DROP TABLE IF EXISTS client_goals CASCADE;
DROP TABLE IF EXISTS quiz_leads CASCADE;
DROP TABLE IF EXISTS referrals CASCADE;
DROP TABLE IF EXISTS referral_codes CASCADE;
DROP TABLE IF EXISTS testimonial_requests CASCADE;
DROP TABLE IF EXISTS testimonials CASCADE;
DROP TABLE IF EXISTS notification_logs CASCADE;
DROP TABLE IF EXISTS notification_preferences CASCADE;
DROP TABLE IF EXISTS push_subscriptions CASCADE;

-- ============================================
-- 1. WORKOUT LOGGING TABLES
-- ============================================

-- Table to log individual exercise sets during workouts
CREATE TABLE workout_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  assigned_workout_id UUID REFERENCES assigned_workouts(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE NOT NULL,
  workout_date DATE DEFAULT CURRENT_DATE NOT NULL,
  set_number INTEGER NOT NULL,
  weight DECIMAL,
  reps INTEGER,
  rpe DECIMAL CHECK (rpe >= 1 AND rpe <= 10),
  notes TEXT,
  is_warmup BOOLEAN DEFAULT FALSE,
  is_pr BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Personal Records table to track all-time bests
CREATE TABLE personal_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE NOT NULL,
  record_type TEXT CHECK (record_type IN ('1rm', '3rm', '5rm', '10rm', 'max_reps', 'max_weight')) NOT NULL,
  weight DECIMAL,
  reps INTEGER,
  achieved_date DATE NOT NULL,
  workout_log_id UUID REFERENCES workout_logs(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id, exercise_id, record_type)
);

-- Water intake tracking
CREATE TABLE water_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  log_date DATE DEFAULT CURRENT_DATE NOT NULL,
  amount_oz INTEGER NOT NULL,
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sleep tracking
CREATE TABLE sleep_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  log_date DATE DEFAULT CURRENT_DATE NOT NULL,
  hours_slept DECIMAL NOT NULL,
  sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 5),
  bed_time TIME,
  wake_time TIME,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id, log_date)
);

-- Client goals and milestones
CREATE TABLE client_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  goal_type TEXT CHECK (goal_type IN ('weight', 'body_fat', 'strength', 'measurement', 'habit', 'custom')) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_value DECIMAL,
  target_unit TEXT,
  current_value DECIMAL,
  start_value DECIMAL,
  target_date DATE,
  exercise_id UUID REFERENCES exercises(id) ON DELETE SET NULL,
  status TEXT CHECK (status IN ('active', 'achieved', 'abandoned')) DEFAULT 'active',
  achieved_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_workout_logs_client_date ON workout_logs(client_id, workout_date);
CREATE INDEX idx_workout_logs_exercise ON workout_logs(client_id, exercise_id);
CREATE INDEX idx_personal_records_client ON personal_records(client_id);
CREATE INDEX idx_water_logs_client_date ON water_logs(client_id, log_date);
CREATE INDEX idx_sleep_logs_client_date ON sleep_logs(client_id, log_date);
CREATE INDEX idx_client_goals_client ON client_goals(client_id, status);

-- Enable RLS
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleep_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workout_logs
CREATE POLICY "workout_logs_select" ON workout_logs FOR SELECT USING (
  auth.uid() = client_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "workout_logs_insert" ON workout_logs FOR INSERT WITH CHECK (
  auth.uid() = client_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "workout_logs_update" ON workout_logs FOR UPDATE USING (
  auth.uid() = client_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "workout_logs_delete" ON workout_logs FOR DELETE USING (
  auth.uid() = client_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for personal_records
CREATE POLICY "personal_records_select" ON personal_records FOR SELECT USING (
  auth.uid() = client_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "personal_records_insert" ON personal_records FOR INSERT WITH CHECK (
  auth.uid() = client_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "personal_records_update" ON personal_records FOR UPDATE USING (
  auth.uid() = client_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "personal_records_delete" ON personal_records FOR DELETE USING (
  auth.uid() = client_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for water_logs
CREATE POLICY "water_logs_select" ON water_logs FOR SELECT USING (
  auth.uid() = client_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "water_logs_insert" ON water_logs FOR INSERT WITH CHECK (
  auth.uid() = client_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "water_logs_update" ON water_logs FOR UPDATE USING (
  auth.uid() = client_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "water_logs_delete" ON water_logs FOR DELETE USING (
  auth.uid() = client_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for sleep_logs
CREATE POLICY "sleep_logs_select" ON sleep_logs FOR SELECT USING (
  auth.uid() = client_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "sleep_logs_insert" ON sleep_logs FOR INSERT WITH CHECK (
  auth.uid() = client_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "sleep_logs_update" ON sleep_logs FOR UPDATE USING (
  auth.uid() = client_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "sleep_logs_delete" ON sleep_logs FOR DELETE USING (
  auth.uid() = client_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for client_goals
CREATE POLICY "client_goals_select" ON client_goals FOR SELECT USING (
  auth.uid() = client_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "client_goals_insert" ON client_goals FOR INSERT WITH CHECK (
  auth.uid() = client_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "client_goals_update" ON client_goals FOR UPDATE USING (
  auth.uid() = client_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "client_goals_delete" ON client_goals FOR DELETE USING (
  auth.uid() = client_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================
-- 2. QUIZ LEADS TABLE
-- ============================================

CREATE TABLE quiz_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  goal TEXT,
  fitness_level TEXT,
  time_available TEXT,
  preferred_style TEXT,
  challenges TEXT[],
  status TEXT CHECK (status IN ('new', 'contacted', 'converted', 'closed')) DEFAULT 'new',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quiz_leads_email ON quiz_leads(email);
CREATE INDEX idx_quiz_leads_status ON quiz_leads(status);
CREATE INDEX idx_quiz_leads_created ON quiz_leads(created_at DESC);

ALTER TABLE quiz_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quiz_leads_insert" ON quiz_leads FOR INSERT WITH CHECK (true);
CREATE POLICY "quiz_leads_select" ON quiz_leads FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "quiz_leads_update" ON quiz_leads FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "quiz_leads_delete" ON quiz_leads FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================
-- 3. REFERRAL TABLES
-- ============================================

CREATE TABLE referral_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  total_referrals INTEGER DEFAULT 0,
  successful_referrals INTEGER DEFAULT 0,
  rewards_earned DECIMAL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  referred_email TEXT NOT NULL,
  referred_name TEXT,
  referred_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT CHECK (status IN ('pending', 'signed_up', 'subscribed', 'expired')) DEFAULT 'pending',
  reward_type TEXT CHECK (reward_type IN ('credit', 'free_month', 'discount', 'none')) DEFAULT 'none',
  reward_amount DECIMAL DEFAULT 0,
  reward_claimed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  converted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
);

CREATE INDEX idx_referral_codes_client ON referral_codes(client_id);
CREATE INDEX idx_referral_codes_code ON referral_codes(code);
CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX idx_referrals_email ON referrals(referred_email);
CREATE INDEX idx_referrals_status ON referrals(status);

ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "referral_codes_select" ON referral_codes FOR SELECT USING (
  auth.uid() = client_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "referral_codes_insert" ON referral_codes FOR INSERT WITH CHECK (
  auth.uid() = client_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "referral_codes_update" ON referral_codes FOR UPDATE USING (
  auth.uid() = client_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "referrals_select" ON referrals FOR SELECT USING (
  auth.uid() = referrer_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "referrals_insert" ON referrals FOR INSERT WITH CHECK (
  auth.uid() = referrer_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "referrals_update" ON referrals FOR UPDATE USING (
  auth.uid() = referrer_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================
-- 4. TESTIMONIALS TABLES
-- ============================================

CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  testimonial_text TEXT NOT NULL,
  results_achieved TEXT,
  before_photo_url TEXT,
  after_photo_url TEXT,
  video_url TEXT,
  status TEXT CHECK (status IN ('pending', 'approved', 'featured', 'rejected')) DEFAULT 'pending',
  display_name TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  admin_notes TEXT,
  requested_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE testimonial_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  reminder_sent_at TIMESTAMPTZ,
  completed BOOLEAN DEFAULT FALSE,
  testimonial_id UUID REFERENCES testimonials(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_testimonials_client ON testimonials(client_id);
CREATE INDEX idx_testimonials_status ON testimonials(status);
CREATE INDEX idx_testimonial_requests_client ON testimonial_requests(client_id);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonial_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "testimonials_select_own" ON testimonials FOR SELECT USING (
  auth.uid() = client_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  OR status IN ('approved', 'featured')
);
CREATE POLICY "testimonials_insert" ON testimonials FOR INSERT WITH CHECK (
  auth.uid() = client_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "testimonials_update" ON testimonials FOR UPDATE USING (
  auth.uid() = client_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "testimonials_delete" ON testimonials FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "testimonial_requests_select" ON testimonial_requests FOR SELECT USING (
  auth.uid() = client_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "testimonial_requests_insert" ON testimonial_requests FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "testimonial_requests_update" ON testimonial_requests FOR UPDATE USING (
  auth.uid() = client_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================
-- 5. PUSH NOTIFICATIONS TABLES
-- ============================================

CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  workout_reminders BOOLEAN DEFAULT TRUE,
  check_in_reminders BOOLEAN DEFAULT TRUE,
  habit_reminders BOOLEAN DEFAULT TRUE,
  coach_messages BOOLEAN DEFAULT TRUE,
  progress_updates BOOLEAN DEFAULT TRUE,
  promotional BOOLEAN DEFAULT FALSE,
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end TIME DEFAULT '07:00',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE notification_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  data JSONB,
  status TEXT CHECK (status IN ('sent', 'failed', 'clicked')) DEFAULT 'sent',
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  clicked_at TIMESTAMPTZ
);

CREATE INDEX idx_push_subscriptions_user ON push_subscriptions(user_id);
CREATE INDEX idx_notification_preferences_user ON notification_preferences(user_id);
CREATE INDEX idx_notification_logs_user ON notification_logs(user_id);
CREATE INDEX idx_notification_logs_type ON notification_logs(notification_type);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "push_subscriptions_select" ON push_subscriptions FOR SELECT USING (
  auth.uid() = user_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "push_subscriptions_insert" ON push_subscriptions FOR INSERT WITH CHECK (
  auth.uid() = user_id
);
CREATE POLICY "push_subscriptions_update" ON push_subscriptions FOR UPDATE USING (
  auth.uid() = user_id
);
CREATE POLICY "push_subscriptions_delete" ON push_subscriptions FOR DELETE USING (
  auth.uid() = user_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "notification_preferences_select" ON notification_preferences FOR SELECT USING (
  auth.uid() = user_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "notification_preferences_insert" ON notification_preferences FOR INSERT WITH CHECK (
  auth.uid() = user_id
);
CREATE POLICY "notification_preferences_update" ON notification_preferences FOR UPDATE USING (
  auth.uid() = user_id
);

CREATE POLICY "notification_logs_select" ON notification_logs FOR SELECT USING (
  auth.uid() = user_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "notification_logs_insert" ON notification_logs FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  OR auth.uid() = user_id
);

-- ============================================
-- DONE!
-- ============================================
