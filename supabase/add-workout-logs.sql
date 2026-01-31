-- Workout Logging Tables
-- Run this in the Supabase SQL Editor

-- Table to log individual exercise sets during workouts
CREATE TABLE IF NOT EXISTS workout_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  assigned_workout_id UUID REFERENCES assigned_workouts(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE NOT NULL,
  workout_date DATE DEFAULT CURRENT_DATE NOT NULL,
  set_number INTEGER NOT NULL,
  weight DECIMAL,
  reps INTEGER,
  rpe DECIMAL CHECK (rpe >= 1 AND rpe <= 10), -- Rate of Perceived Exertion
  notes TEXT,
  is_warmup BOOLEAN DEFAULT FALSE,
  is_pr BOOLEAN DEFAULT FALSE, -- Personal Record flag
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Personal Records table to track all-time bests
CREATE TABLE IF NOT EXISTS personal_records (
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
CREATE TABLE IF NOT EXISTS water_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  log_date DATE DEFAULT CURRENT_DATE NOT NULL,
  amount_oz INTEGER NOT NULL, -- Amount in ounces
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sleep tracking
CREATE TABLE IF NOT EXISTS sleep_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  log_date DATE DEFAULT CURRENT_DATE NOT NULL,
  hours_slept DECIMAL NOT NULL,
  sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 5), -- 1-5 rating
  bed_time TIME,
  wake_time TIME,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id, log_date)
);

-- Client goals and milestones
CREATE TABLE IF NOT EXISTS client_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  goal_type TEXT CHECK (goal_type IN ('weight', 'body_fat', 'strength', 'measurement', 'habit', 'custom')) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_value DECIMAL,
  target_unit TEXT, -- 'lbs', '%', 'inches', 'reps', etc.
  current_value DECIMAL,
  start_value DECIMAL,
  target_date DATE,
  exercise_id UUID REFERENCES exercises(id) ON DELETE SET NULL, -- For strength goals
  status TEXT CHECK (status IN ('active', 'achieved', 'abandoned')) DEFAULT 'active',
  achieved_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_workout_logs_client_date ON workout_logs(client_id, workout_date);
CREATE INDEX IF NOT EXISTS idx_workout_logs_exercise ON workout_logs(client_id, exercise_id);
CREATE INDEX IF NOT EXISTS idx_personal_records_client ON personal_records(client_id);
CREATE INDEX IF NOT EXISTS idx_water_logs_client_date ON water_logs(client_id, log_date);
CREATE INDEX IF NOT EXISTS idx_sleep_logs_client_date ON sleep_logs(client_id, log_date);
CREATE INDEX IF NOT EXISTS idx_client_goals_client ON client_goals(client_id, status);

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

-- Comments
COMMENT ON TABLE workout_logs IS 'Individual set logs for tracking weights and reps during workouts';
COMMENT ON TABLE personal_records IS 'All-time personal records for each exercise';
COMMENT ON TABLE water_logs IS 'Daily water intake tracking';
COMMENT ON TABLE sleep_logs IS 'Daily sleep tracking';
COMMENT ON TABLE client_goals IS 'Client goals and milestones tracking';
