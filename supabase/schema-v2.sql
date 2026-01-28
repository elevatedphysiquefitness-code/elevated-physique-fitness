-- =====================================================
-- ELEVATED PHYSIQUE FITNESS - DATABASE SCHEMA V2
-- Complete Progress Tracking & Workout System
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- DROP EXISTING TABLES (if needed for clean reset)
-- Uncomment these if you want to start fresh
-- =====================================================
-- DROP TABLE IF EXISTS habit_logs CASCADE;
-- DROP TABLE IF EXISTS habits CASCADE;
-- DROP TABLE IF EXISTS assigned_workout_logs CASCADE;
-- DROP TABLE IF EXISTS assigned_workouts CASCADE;
-- DROP TABLE IF EXISTS workout_template_exercises CASCADE;
-- DROP TABLE IF EXISTS workout_templates CASCADE;
-- DROP TABLE IF EXISTS measurements CASCADE;
-- DROP TABLE IF EXISTS messages CASCADE;
-- DROP TABLE IF EXISTS check_ins CASCADE;
-- DROP TABLE IF EXISTS progress_photos CASCADE;
-- DROP TABLE IF EXISTS notes CASCADE;
-- DROP TABLE IF EXISTS sessions CASCADE;
-- DROP TABLE IF EXISTS subscriptions CASCADE;
-- DROP TABLE IF EXISTS client_programs CASCADE;
-- DROP TABLE IF EXISTS client_details CASCADE;
-- DROP TABLE IF EXISTS exercises CASCADE;
-- DROP TABLE IF EXISTS profiles CASCADE;

-- =====================================================
-- 1. PROFILES TABLE (extends Supabase auth.users)
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  role TEXT DEFAULT 'client' CHECK (role IN ('client', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. CLIENT DETAILS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS client_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  workout_days_per_week INTEGER DEFAULT 0,
  availability TEXT,
  goals TEXT CHECK (goals IN ('fat_loss', 'muscle_gain', 'recomposition', 'maintenance', 'strength', 'general_fitness')),
  experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')),
  activity_level TEXT CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. MEASUREMENTS TABLE (Weight & Body Measurements)
-- =====================================================
CREATE TABLE IF NOT EXISTS measurements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  measurement_date DATE DEFAULT CURRENT_DATE,
  weight DECIMAL,
  body_fat_percentage DECIMAL,
  chest DECIMAL,
  waist DECIMAL,
  hips DECIMAL,
  thigh DECIMAL,
  bicep DECIMAL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_measurements_client_date ON measurements(client_id, measurement_date DESC);

-- =====================================================
-- 4. EXERCISES TABLE (Exercise Library)
-- =====================================================
CREATE TABLE IF NOT EXISTS exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  muscle_group TEXT CHECK (muscle_group IN ('Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs', 'Core', 'Full Body', 'Cardio')),
  youtube_url TEXT,
  instructions TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. WORKOUT TEMPLATES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS workout_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  focus TEXT, -- e.g., "Chest, Shoulders, Triceps"
  duration_minutes INTEGER DEFAULT 60,
  created_by UUID REFERENCES profiles(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 6. WORKOUT TEMPLATE EXERCISES (exercises in a template)
-- =====================================================
CREATE TABLE IF NOT EXISTS workout_template_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID REFERENCES workout_templates(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  sets INTEGER DEFAULT 3,
  reps TEXT DEFAULT '8-12', -- Can be "8-12" or "AMRAP" etc.
  rest_seconds INTEGER DEFAULT 90,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_template_exercises ON workout_template_exercises(template_id, order_index);

-- =====================================================
-- 7. ASSIGNED WORKOUTS (per client, per date)
-- =====================================================
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

-- =====================================================
-- 8. ASSIGNED WORKOUT LOGS (exercise performance)
-- =====================================================
CREATE TABLE IF NOT EXISTS assigned_workout_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assigned_workout_id UUID REFERENCES assigned_workouts(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(id),
  set_number INTEGER,
  reps_completed INTEGER,
  weight_used DECIMAL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 9. HABITS TABLE (Default + Custom)
-- =====================================================
CREATE TABLE IF NOT EXISTS habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Note: Habits are always client-specific. Default habits are created
-- when a new client is initialized via the initialize_new_client function.

-- =====================================================
-- 10. HABIT LOGS TABLE (Daily Tracking)
-- =====================================================
CREATE TABLE IF NOT EXISTS habit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  log_date DATE DEFAULT CURRENT_DATE,
  completed BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(habit_id, log_date)
);

CREATE INDEX IF NOT EXISTS idx_habit_logs_client_date ON habit_logs(client_id, log_date);

-- =====================================================
-- 11. CHECK-INS TABLE (Weekly Check-ins)
-- =====================================================
CREATE TABLE IF NOT EXISTS check_ins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  week_number INTEGER,
  check_in_date DATE DEFAULT CURRENT_DATE,
  weight DECIMAL,
  sleep_quality TEXT CHECK (sleep_quality IN ('poor', 'fair', 'good', 'great', 'excellent')),
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5),
  nutrition_adherence TEXT CHECK (nutrition_adherence IN ('< 50%', '50-75%', '75-90%', '90-100%')),
  workout_adherence TEXT,
  wins TEXT,
  challenges TEXT,
  questions TEXT,
  coach_feedback TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_checkins_client_date ON check_ins(client_id, check_in_date DESC);

-- =====================================================
-- 12. PROGRESS PHOTOS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS progress_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  check_in_id UUID REFERENCES check_ins(id) ON DELETE SET NULL,
  photo_url TEXT NOT NULL,
  photo_type TEXT CHECK (photo_type IN ('front', 'side', 'back', 'other')),
  photo_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_photos_client_date ON progress_photos(client_id, photo_date DESC);

-- =====================================================
-- 13. MESSAGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES profiles(id),
  receiver_id UUID REFERENCES profiles(id),
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id, read);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(sender_id, receiver_id, created_at);

-- =====================================================
-- 14. NOTES TABLE (Coach Notes)
-- =====================================================
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  coach_id UUID REFERENCES profiles(id),
  title TEXT,
  content TEXT NOT NULL,
  note_type TEXT DEFAULT 'general' CHECK (note_type IN ('general', 'session', 'progress', 'nutrition', 'important')),
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notes_client ON notes(client_id);

-- =====================================================
-- 15. SUBSCRIPTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  plan_name TEXT,
  plan_type TEXT CHECK (plan_type IN ('in-person', 'online')),
  price DECIMAL,
  billing_cycle TEXT DEFAULT 'monthly',
  paypal_subscription_id TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled', 'expired')),
  start_date DATE,
  next_billing_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 16. CLIENT PROGRAMS TABLE (legacy support)
-- =====================================================
CREATE TABLE IF NOT EXISTS client_programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  program_name TEXT,
  start_date DATE,
  current_week INTEGER DEFAULT 1,
  total_weeks INTEGER DEFAULT 12,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  assigned_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 17. SESSIONS TABLE (Training Sessions - legacy support)
-- =====================================================
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  session_type TEXT DEFAULT 'training' CHECK (session_type IN ('training', 'consultation', 'assessment')),
  duration_minutes INTEGER DEFAULT 60,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- FUNCTIONS FOR PROGRESS TRACKING
-- =====================================================

-- Function to calculate habit streak for a client
CREATE OR REPLACE FUNCTION get_habit_streak(p_client_id UUID)
RETURNS INTEGER AS $$
DECLARE
  streak INTEGER := 0;
  check_date DATE := CURRENT_DATE;
  daily_completed INTEGER;
  total_habits INTEGER;
BEGIN
  -- Get total active habits for user
  SELECT COUNT(*) INTO total_habits
  FROM habits
  WHERE client_id = p_client_id AND is_active = TRUE;

  IF total_habits = 0 THEN
    RETURN 0;
  END IF;

  -- Count consecutive days where all habits were completed
  LOOP
    SELECT COUNT(*) INTO daily_completed
    FROM habit_logs
    WHERE client_id = p_client_id
    AND log_date = check_date
    AND completed = TRUE;

    IF daily_completed >= total_habits THEN
      streak := streak + 1;
      check_date := check_date - INTERVAL '1 day';
    ELSE
      EXIT;
    END IF;

    -- Safety limit
    IF streak > 365 THEN
      EXIT;
    END IF;
  END LOOP;

  RETURN streak;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get weekly habit completion percentage
CREATE OR REPLACE FUNCTION get_weekly_habit_percentage(p_client_id UUID)
RETURNS INTEGER AS $$
DECLARE
  total_possible INTEGER;
  total_completed INTEGER;
  week_start DATE;
BEGIN
  -- Get start of current week (Monday)
  week_start := date_trunc('week', CURRENT_DATE)::DATE;

  -- Get total active habits
  SELECT COUNT(*) * 7 INTO total_possible
  FROM habits
  WHERE client_id = p_client_id AND is_active = TRUE;

  IF total_possible = 0 THEN
    RETURN 0;
  END IF;

  -- Get completed habits this week
  SELECT COUNT(*) INTO total_completed
  FROM habit_logs
  WHERE client_id = p_client_id
  AND log_date >= week_start
  AND log_date <= CURRENT_DATE
  AND completed = TRUE;

  -- Calculate percentage based on days elapsed in week
  total_possible := (SELECT COUNT(*) FROM habits WHERE client_id = p_client_id AND is_active = TRUE)
                    * (EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 1);

  IF total_possible = 0 THEN
    RETURN 0;
  END IF;

  RETURN ROUND((total_completed::DECIMAL / total_possible::DECIMAL) * 100);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get client dashboard stats
CREATE OR REPLACE FUNCTION get_client_stats(p_client_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_workouts_completed', (
      SELECT COUNT(*) FROM assigned_workouts
      WHERE client_id = p_client_id AND status = 'completed'
    ),
    'total_check_ins', (
      SELECT COUNT(*) FROM check_ins
      WHERE client_id = p_client_id
    ),
    'total_progress_photos', (
      SELECT COUNT(*) FROM progress_photos
      WHERE client_id = p_client_id
    ),
    'total_habits_completed', (
      SELECT COUNT(*) FROM habit_logs
      WHERE client_id = p_client_id AND completed = TRUE
    ),
    'total_notes', (
      SELECT COUNT(*) FROM notes
      WHERE client_id = p_client_id
    ),
    'unread_messages', (
      SELECT COUNT(*) FROM messages
      WHERE receiver_id = p_client_id AND read = FALSE
    ),
    'current_week', (
      SELECT COALESCE(current_week, 1) FROM client_programs
      WHERE client_id = p_client_id AND status = 'active'
      LIMIT 1
    ),
    'workouts_this_week', (
      SELECT COUNT(*) FROM assigned_workouts
      WHERE client_id = p_client_id
      AND status = 'completed'
      AND workout_date >= date_trunc('week', CURRENT_DATE)
    ),
    'habits_today', (
      SELECT COUNT(*) FROM habit_logs
      WHERE client_id = p_client_id
      AND log_date = CURRENT_DATE
      AND completed = TRUE
    ),
    'total_habits_today', (
      SELECT COUNT(*) FROM habits
      WHERE client_id = p_client_id AND is_active = TRUE
    ),
    'habit_streak', (
      SELECT get_habit_streak(p_client_id)
    ),
    'weekly_habit_percentage', (
      SELECT get_weekly_habit_percentage(p_client_id)
    ),
    'latest_weight', (
      SELECT weight FROM measurements
      WHERE client_id = p_client_id AND weight IS NOT NULL
      ORDER BY measurement_date DESC LIMIT 1
    ),
    'starting_weight', (
      SELECT weight FROM measurements
      WHERE client_id = p_client_id AND weight IS NOT NULL
      ORDER BY measurement_date ASC LIMIT 1
    ),
    'subscription_status', (
      SELECT status FROM subscriptions
      WHERE client_id = p_client_id
      ORDER BY created_at DESC LIMIT 1
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to initialize new client
CREATE OR REPLACE FUNCTION initialize_new_client(p_user_id UUID, p_full_name TEXT, p_email TEXT)
RETURNS VOID AS $$
BEGIN
  -- Create profile if not exists
  INSERT INTO profiles (id, full_name, email, role)
  VALUES (p_user_id, p_full_name, p_email, 'client')
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    email = COALESCE(EXCLUDED.email, profiles.email),
    updated_at = NOW();

  -- Create client_details if not exists
  INSERT INTO client_details (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Create default habits for new client
  -- Only insert if no habits exist for this client
  IF NOT EXISTS (SELECT 1 FROM habits WHERE client_id = p_user_id) THEN
    INSERT INTO habits (client_id, name, description)
    VALUES
      (p_user_id, 'Drink 1 gallon of water', 'Stay hydrated throughout the day'),
      (p_user_id, 'Sleep 7+ hours', 'Get quality sleep for recovery'),
      (p_user_id, 'Hit protein goal', 'Consume your daily protein target'),
      (p_user_id, '10,000 steps', 'Stay active with daily walking'),
      (p_user_id, 'Complete workout', 'Finish your scheduled workout'),
      (p_user_id, 'Meal prep', 'Prepare healthy meals in advance');
  END IF;

  -- Note: We do NOT create any habit_logs, measurements, check_ins,
  -- assigned_workouts, or any other progress data. All progress starts at zero.

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_template_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE assigned_workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE assigned_workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "Admins can manage all profiles" ON profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Client details policies
DROP POLICY IF EXISTS "Users can view own details" ON client_details;
DROP POLICY IF EXISTS "Users can update own details" ON client_details;

CREATE POLICY "Users can view own details" ON client_details
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own details" ON client_details
  FOR UPDATE USING (auth.uid() = user_id);

-- Measurements policies
DROP POLICY IF EXISTS "Users can view own measurements" ON measurements;
DROP POLICY IF EXISTS "Users can create own measurements" ON measurements;
DROP POLICY IF EXISTS "Admins can manage all measurements" ON measurements;

CREATE POLICY "Users can view own measurements" ON measurements
  FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Users can create own measurements" ON measurements
  FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Admins can manage all measurements" ON measurements
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Exercises policies (everyone can view, admins can manage)
DROP POLICY IF EXISTS "Anyone can view exercises" ON exercises;
DROP POLICY IF EXISTS "Admins can manage exercises" ON exercises;

CREATE POLICY "Anyone can view exercises" ON exercises
  FOR SELECT USING (true);
CREATE POLICY "Admins can manage exercises" ON exercises
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Workout templates policies (everyone can view, admins can manage)
DROP POLICY IF EXISTS "Anyone can view workout templates" ON workout_templates;
DROP POLICY IF EXISTS "Admins can manage workout templates" ON workout_templates;

CREATE POLICY "Anyone can view workout templates" ON workout_templates
  FOR SELECT USING (true);
CREATE POLICY "Admins can manage workout templates" ON workout_templates
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Workout template exercises policies
DROP POLICY IF EXISTS "Anyone can view template exercises" ON workout_template_exercises;
DROP POLICY IF EXISTS "Admins can manage template exercises" ON workout_template_exercises;

CREATE POLICY "Anyone can view template exercises" ON workout_template_exercises
  FOR SELECT USING (true);
CREATE POLICY "Admins can manage template exercises" ON workout_template_exercises
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Assigned workouts policies
DROP POLICY IF EXISTS "Users can view own assigned workouts" ON assigned_workouts;
DROP POLICY IF EXISTS "Users can update own assigned workouts" ON assigned_workouts;
DROP POLICY IF EXISTS "Admins can manage all assigned workouts" ON assigned_workouts;

CREATE POLICY "Users can view own assigned workouts" ON assigned_workouts
  FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Users can update own assigned workouts" ON assigned_workouts
  FOR UPDATE USING (auth.uid() = client_id);
CREATE POLICY "Admins can manage all assigned workouts" ON assigned_workouts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Assigned workout logs policies
DROP POLICY IF EXISTS "Users can manage own workout logs" ON assigned_workout_logs;

CREATE POLICY "Users can manage own workout logs" ON assigned_workout_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM assigned_workouts
      WHERE id = assigned_workout_logs.assigned_workout_id
      AND client_id = auth.uid()
    )
  );

-- Habits policies
DROP POLICY IF EXISTS "Users can view own habits" ON habits;
DROP POLICY IF EXISTS "Users can manage own habits" ON habits;

CREATE POLICY "Users can view own habits" ON habits
  FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Users can manage own habits" ON habits
  FOR ALL USING (auth.uid() = client_id);

-- Habit logs policies
DROP POLICY IF EXISTS "Users can view own habit logs" ON habit_logs;
DROP POLICY IF EXISTS "Users can manage own habit logs" ON habit_logs;

CREATE POLICY "Users can view own habit logs" ON habit_logs
  FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Users can manage own habit logs" ON habit_logs
  FOR ALL USING (auth.uid() = client_id);

-- Check-ins policies
DROP POLICY IF EXISTS "Users can view own check-ins" ON check_ins;
DROP POLICY IF EXISTS "Users can create own check-ins" ON check_ins;
DROP POLICY IF EXISTS "Admins can manage all check-ins" ON check_ins;

CREATE POLICY "Users can view own check-ins" ON check_ins
  FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Users can create own check-ins" ON check_ins
  FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Admins can manage all check-ins" ON check_ins
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Progress photos policies
DROP POLICY IF EXISTS "Users can view own photos" ON progress_photos;
DROP POLICY IF EXISTS "Users can upload own photos" ON progress_photos;

CREATE POLICY "Users can view own photos" ON progress_photos
  FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Users can upload own photos" ON progress_photos
  FOR INSERT WITH CHECK (auth.uid() = client_id);

-- Messages policies
DROP POLICY IF EXISTS "Users can view own messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can update own received messages" ON messages;

CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update own received messages" ON messages
  FOR UPDATE USING (auth.uid() = receiver_id);

-- Notes policies
DROP POLICY IF EXISTS "Users can view notes about them" ON notes;
DROP POLICY IF EXISTS "Admins can manage all notes" ON notes;

CREATE POLICY "Users can view notes about them" ON notes
  FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Admins can manage all notes" ON notes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Subscriptions policies
DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;

CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = client_id);

-- Client programs policies
DROP POLICY IF EXISTS "Users can view own programs" ON client_programs;

CREATE POLICY "Users can view own programs" ON client_programs
  FOR SELECT USING (auth.uid() = client_id);

-- Sessions policies
DROP POLICY IF EXISTS "Users can view own sessions" ON sessions;
DROP POLICY IF EXISTS "Admins can manage all sessions" ON sessions;

CREATE POLICY "Users can view own sessions" ON sessions
  FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Admins can manage all sessions" ON sessions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =====================================================
-- TRIGGER: Auto-create profile on user signup
-- =====================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM initialize_new_client(
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger (drop first if exists)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- SEED DATA: Sample Exercises for Video Library
-- =====================================================
INSERT INTO exercises (name, description, muscle_group, youtube_url, instructions) VALUES
  ('Barbell Bench Press', 'Primary chest exercise for building mass and strength', 'Chest', 'https://www.youtube.com/embed/rT7DgCr-3pg', 'Lie flat on bench, grip bar slightly wider than shoulders, lower to chest, press up.'),
  ('Incline Dumbbell Press', 'Upper chest focus with dumbbells', 'Chest', 'https://www.youtube.com/embed/8iPEnn-ltC8', 'Set bench to 30-45 degrees, press dumbbells up, lower with control.'),
  ('Cable Flyes', 'Isolation exercise for chest definition', 'Chest', 'https://www.youtube.com/embed/Iwe6AmxVf7o', 'Stand between cables, bring handles together in front, squeeze chest.'),
  ('Pull-ups', 'Compound back exercise for width and strength', 'Back', 'https://www.youtube.com/embed/eGo4IYlbE5g', 'Hang from bar, pull yourself up until chin clears bar, lower with control.'),
  ('Barbell Row', 'Compound back exercise for thickness', 'Back', 'https://www.youtube.com/embed/kBWAon7ItDw', 'Hinge at hips, pull bar to lower chest, squeeze back, lower with control.'),
  ('Lat Pulldown', 'Machine exercise for back width', 'Back', 'https://www.youtube.com/embed/CAwf7n6Luuc', 'Grip bar wide, pull to upper chest, squeeze lats, return with control.'),
  ('Overhead Press', 'Primary shoulder exercise for building mass', 'Shoulders', 'https://www.youtube.com/embed/2yjwXTZQDDI', 'Bar at collar bone, press overhead, lower with control.'),
  ('Lateral Raises', 'Isolation exercise for side delts', 'Shoulders', 'https://www.youtube.com/embed/3VcKaXpzqRo', 'Arms at sides, raise dumbbells to shoulder height, lower with control.'),
  ('Face Pulls', 'Rear delt and upper back exercise', 'Shoulders', 'https://www.youtube.com/embed/rep-qVOkqgk', 'Pull rope to face, elbows high, squeeze rear delts.'),
  ('Barbell Curl', 'Primary bicep exercise', 'Biceps', 'https://www.youtube.com/embed/LY1V6UbRHFM', 'Stand with bar at thighs, curl up, squeeze biceps, lower with control.'),
  ('Hammer Curls', 'Bicep exercise targeting brachialis', 'Biceps', 'https://www.youtube.com/embed/zC3nLlEvin4', 'Neutral grip, curl dumbbells up, lower with control.'),
  ('Tricep Pushdowns', 'Isolation exercise for triceps', 'Triceps', 'https://www.youtube.com/embed/2-LAMcpzODU', 'Push bar down, keep elbows pinned, squeeze triceps.'),
  ('Overhead Tricep Extension', 'Tricep exercise for long head', 'Triceps', 'https://www.youtube.com/embed/-Vyt2QdsR7E', 'Dumbbell overhead, lower behind head, extend up.'),
  ('Barbell Squat', 'King of leg exercises for overall lower body', 'Legs', 'https://www.youtube.com/embed/ultWZbUMPL8', 'Bar on upper back, feet shoulder width, squat down until thighs parallel, drive up.'),
  ('Romanian Deadlift', 'Posterior chain exercise for hamstrings and glutes', 'Legs', 'https://www.youtube.com/embed/7j-2w4-P14I', 'Hold bar at hips, hinge forward keeping back straight, feel stretch in hamstrings, return.'),
  ('Leg Press', 'Machine exercise for quads and glutes', 'Legs', 'https://www.youtube.com/embed/IZxyjW7MPJQ', 'Feet shoulder width on platform, lower weight, press up without locking knees.'),
  ('Plank', 'Core stability exercise', 'Core', 'https://www.youtube.com/embed/ASdvN_XEl_c', 'Forearms on ground, body in straight line, hold position.'),
  ('Cable Crunches', 'Weighted ab exercise', 'Core', 'https://www.youtube.com/embed/AV5PmSJdpwc', 'Kneel at cable, crunch down bringing elbows to thighs.')
ON CONFLICT DO NOTHING;

-- =====================================================
-- REALTIME SUBSCRIPTIONS (for messaging)
-- =====================================================
-- Enable realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
