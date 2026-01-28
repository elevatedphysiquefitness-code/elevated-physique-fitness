-- =====================================================
-- ELEVATED PHYSIQUE FITNESS - DATABASE SCHEMA
-- Progress Tracking System
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
  goals TEXT,
  experience_level TEXT,
  current_weight DECIMAL,
  target_weight DECIMAL,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. SUBSCRIPTIONS TABLE
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
-- 4. SESSIONS TABLE (Training Sessions)
-- =====================================================
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  session_type TEXT DEFAULT 'training' CHECK (session_type IN ('training', 'consultation', 'assessment')),
  duration_minutes INTEGER DEFAULT 60,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  notes TEXT,
  coach_notes TEXT,
  workout_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_sessions_client_date ON sessions(client_id, session_date);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);

-- =====================================================
-- 5. CHECK-INS TABLE (Weekly Check-ins)
-- =====================================================
CREATE TABLE IF NOT EXISTS check_ins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  week_number INTEGER,
  check_in_date DATE DEFAULT CURRENT_DATE,
  weight DECIMAL,
  sleep_quality TEXT CHECK (sleep_quality IN ('poor', 'fair', 'good', 'excellent')),
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
  stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 10),
  nutrition_adherence INTEGER CHECK (nutrition_adherence >= 0 AND nutrition_adherence <= 100),
  workout_adherence INTEGER CHECK (workout_adherence >= 0 AND workout_adherence <= 100),
  wins TEXT,
  challenges TEXT,
  questions TEXT,
  coach_feedback TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_checkins_client_date ON check_ins(client_id, check_in_date);

-- =====================================================
-- 6. PROGRESS PHOTOS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS progress_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  photo_type TEXT CHECK (photo_type IN ('front', 'side', 'back', 'other')),
  photo_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_photos_client_date ON progress_photos(client_id, photo_date);

-- =====================================================
-- 7. PROGRESS ENTRIES TABLE (Measurements)
-- =====================================================
CREATE TABLE IF NOT EXISTS progress_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  entry_date DATE DEFAULT CURRENT_DATE,
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

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_progress_client_date ON progress_entries(client_id, entry_date);

-- =====================================================
-- 8. HABITS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 9. HABIT LOGS TABLE (Daily Tracking)
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

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_habit_logs_client_date ON habit_logs(client_id, log_date);

-- =====================================================
-- 10. NOTES TABLE (Coach Notes)
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

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_notes_client ON notes(client_id);

-- =====================================================
-- 11. MESSAGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES profiles(id),
  receiver_id UUID REFERENCES profiles(id),
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id, read);

-- =====================================================
-- 12. WORKOUT PROGRAMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS workout_programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  duration_weeks INTEGER,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 13. CLIENT PROGRAMS TABLE (Program Assignments)
-- =====================================================
CREATE TABLE IF NOT EXISTS client_programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  program_id UUID REFERENCES workout_programs(id),
  start_date DATE,
  current_week INTEGER DEFAULT 1,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  assigned_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- FUNCTIONS FOR PROGRESS TRACKING
-- =====================================================

-- Function to get client dashboard stats
CREATE OR REPLACE FUNCTION get_client_stats(p_client_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_sessions_completed', (
      SELECT COUNT(*) FROM sessions
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
    'current_week', (
      SELECT COALESCE(current_week, 1) FROM client_programs
      WHERE client_id = p_client_id AND status = 'active'
      LIMIT 1
    ),
    'unread_messages', (
      SELECT COUNT(*) FROM messages
      WHERE receiver_id = p_client_id AND read = FALSE
    ),
    'sessions_this_week', (
      SELECT COUNT(*) FROM sessions
      WHERE client_id = p_client_id
      AND status = 'completed'
      AND session_date >= date_trunc('week', CURRENT_DATE)
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
    'latest_weight', (
      SELECT weight FROM progress_entries
      WHERE client_id = p_client_id AND weight IS NOT NULL
      ORDER BY entry_date DESC LIMIT 1
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

-- Function to calculate habit streak
CREATE OR REPLACE FUNCTION get_habit_streak(p_client_id UUID)
RETURNS INTEGER AS $$
DECLARE
  streak INTEGER := 0;
  check_date DATE := CURRENT_DATE;
  daily_count INTEGER;
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
    SELECT COUNT(*) INTO daily_count
    FROM habit_logs
    WHERE client_id = p_client_id
    AND log_date = check_date
    AND completed = TRUE;

    IF daily_count >= total_habits THEN
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

-- Function to initialize new client (called after registration)
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
  INSERT INTO habits (client_id, name, description)
  VALUES
    (p_user_id, 'Sleep 7+ hours', 'Get at least 7 hours of quality sleep'),
    (p_user_id, 'Drink 8 glasses of water', 'Stay hydrated throughout the day'),
    (p_user_id, 'Hit protein goal', 'Consume your daily protein target'),
    (p_user_id, 'Complete workout', 'Finish your scheduled workout'),
    (p_user_id, '10-minute walk', 'Take a short walk for active recovery'),
    (p_user_id, 'Meal prep', 'Prepare healthy meals in advance')
  ON CONFLICT DO NOTHING;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_programs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Client details policies
CREATE POLICY "Users can view own details" ON client_details
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own details" ON client_details
  FOR UPDATE USING (auth.uid() = user_id);

-- Sessions policies
CREATE POLICY "Users can view own sessions" ON sessions
  FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Admins can manage all sessions" ON sessions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Check-ins policies
CREATE POLICY "Users can view own check-ins" ON check_ins
  FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Users can create own check-ins" ON check_ins
  FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Admins can manage all check-ins" ON check_ins
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Progress photos policies
CREATE POLICY "Users can view own photos" ON progress_photos
  FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Users can upload own photos" ON progress_photos
  FOR INSERT WITH CHECK (auth.uid() = client_id);

-- Progress entries policies
CREATE POLICY "Users can view own progress" ON progress_entries
  FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Users can create own progress" ON progress_entries
  FOR INSERT WITH CHECK (auth.uid() = client_id);

-- Habits policies
CREATE POLICY "Users can view own habits" ON habits
  FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Users can manage own habits" ON habits
  FOR ALL USING (auth.uid() = client_id);

-- Habit logs policies
CREATE POLICY "Users can view own habit logs" ON habit_logs
  FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Users can manage own habit logs" ON habit_logs
  FOR ALL USING (auth.uid() = client_id);

-- Notes policies (clients see notes about them, admins see all)
CREATE POLICY "Users can view notes about them" ON notes
  FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Admins can manage all notes" ON notes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Messages policies
CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update own received messages" ON messages
  FOR UPDATE USING (auth.uid() = receiver_id);

-- Subscriptions policies
CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = client_id);

-- Client programs policies
CREATE POLICY "Users can view own programs" ON client_programs
  FOR SELECT USING (auth.uid() = client_id);

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
