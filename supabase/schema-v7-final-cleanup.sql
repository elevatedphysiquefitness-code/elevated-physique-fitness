-- ============================================
-- ELEVATED PHYSIQUE FITNESS - V7 FINAL CLEANUP
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- PART 1: FIX WORKOUT TEMPLATES TABLE
-- ============================================

-- Create workout_templates if missing
CREATE TABLE IF NOT EXISTS workout_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  focus TEXT,
  duration_minutes INTEGER DEFAULT 45,
  created_by UUID REFERENCES profiles(id),
  created_for_client_id UUID REFERENCES profiles(id),
  is_custom BOOLEAN DEFAULT FALSE,
  is_ai_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns to workout_templates
ALTER TABLE workout_templates ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id);
ALTER TABLE workout_templates ADD COLUMN IF NOT EXISTS created_for_client_id UUID REFERENCES profiles(id);
ALTER TABLE workout_templates ADD COLUMN IF NOT EXISTS is_custom BOOLEAN DEFAULT FALSE;
ALTER TABLE workout_templates ADD COLUMN IF NOT EXISTS is_ai_generated BOOLEAN DEFAULT FALSE;
ALTER TABLE workout_templates ADD COLUMN IF NOT EXISTS focus TEXT;
ALTER TABLE workout_templates ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 45;

-- ============================================
-- PART 2: FIX WORKOUT_TEMPLATE_EXERCISES TABLE
-- ============================================

-- Create workout_template_exercises if missing
CREATE TABLE IF NOT EXISTS workout_template_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID REFERENCES workout_templates(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  sets INTEGER DEFAULT 3,
  reps TEXT DEFAULT '10',
  rest_seconds INTEGER DEFAULT 60,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PART 3: FIX ASSIGNED_WORKOUTS TABLE
-- ============================================

-- Add template_id to assigned_workouts if missing
ALTER TABLE assigned_workouts ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES workout_templates(id) ON DELETE CASCADE;
ALTER TABLE assigned_workouts ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE assigned_workouts ADD COLUMN IF NOT EXISTS notes TEXT;

-- ============================================
-- PART 4: FIX EXERCISES TABLE
-- ============================================

-- Add missing columns to exercises
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS equipment TEXT;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS difficulty_level TEXT DEFAULT 'beginner';
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS youtube_url TEXT;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS instructions TEXT;

-- ============================================
-- PART 5: ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE workout_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_template_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE assigned_workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PART 6: DROP OLD POLICIES (SAFE)
-- ============================================

DROP POLICY IF EXISTS "Users view templates" ON workout_templates;
DROP POLICY IF EXISTS "Admins manage templates" ON workout_templates;
DROP POLICY IF EXISTS "Anyone can view workout_templates" ON workout_templates;
DROP POLICY IF EXISTS "Admins can insert workout_templates" ON workout_templates;
DROP POLICY IF EXISTS "Admins can update workout_templates" ON workout_templates;
DROP POLICY IF EXISTS "Admins can delete workout_templates" ON workout_templates;
DROP POLICY IF EXISTS "Anyone can view workout_template_exercises" ON workout_template_exercises;
DROP POLICY IF EXISTS "Admins can manage workout_template_exercises" ON workout_template_exercises;
DROP POLICY IF EXISTS "Users view exercises" ON exercises;
DROP POLICY IF EXISTS "Admins manage exercises" ON exercises;

-- ============================================
-- PART 7: CREATE PROPER RLS POLICIES
-- ============================================

-- Workout Templates
CREATE POLICY "workout_templates_select" ON workout_templates FOR SELECT USING (true);
CREATE POLICY "workout_templates_insert" ON workout_templates FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  OR auth.uid() = created_for_client_id
);
CREATE POLICY "workout_templates_update" ON workout_templates FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "workout_templates_delete" ON workout_templates FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Workout Template Exercises
CREATE POLICY "workout_template_exercises_select" ON workout_template_exercises FOR SELECT USING (true);
CREATE POLICY "workout_template_exercises_insert" ON workout_template_exercises FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "workout_template_exercises_update" ON workout_template_exercises FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "workout_template_exercises_delete" ON workout_template_exercises FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Assigned Workouts
DROP POLICY IF EXISTS "assigned_workouts_select" ON assigned_workouts;
DROP POLICY IF EXISTS "assigned_workouts_insert" ON assigned_workouts;
DROP POLICY IF EXISTS "assigned_workouts_update" ON assigned_workouts;
DROP POLICY IF EXISTS "assigned_workouts_delete" ON assigned_workouts;

CREATE POLICY "assigned_workouts_select" ON assigned_workouts FOR SELECT USING (
  auth.uid() = client_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "assigned_workouts_insert" ON assigned_workouts FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  OR auth.uid() = client_id
);
CREATE POLICY "assigned_workouts_update" ON assigned_workouts FOR UPDATE USING (
  auth.uid() = client_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "assigned_workouts_delete" ON assigned_workouts FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Exercises
CREATE POLICY "exercises_select" ON exercises FOR SELECT USING (true);
CREATE POLICY "exercises_insert" ON exercises FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "exercises_update" ON exercises FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "exercises_delete" ON exercises FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Measurements
DROP POLICY IF EXISTS "measurements_select" ON measurements;
DROP POLICY IF EXISTS "measurements_insert" ON measurements;
DROP POLICY IF EXISTS "measurements_update" ON measurements;

CREATE POLICY "measurements_select" ON measurements FOR SELECT USING (
  auth.uid() = client_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "measurements_insert" ON measurements FOR INSERT WITH CHECK (
  auth.uid() = client_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "measurements_update" ON measurements FOR UPDATE USING (
  auth.uid() = client_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Habits
DROP POLICY IF EXISTS "habits_select" ON habits;
DROP POLICY IF EXISTS "habits_insert" ON habits;
DROP POLICY IF EXISTS "habits_update" ON habits;
DROP POLICY IF EXISTS "habits_delete" ON habits;

CREATE POLICY "habits_select" ON habits FOR SELECT USING (
  auth.uid() = client_id OR client_id IS NULL
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "habits_insert" ON habits FOR INSERT WITH CHECK (
  auth.uid() = client_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "habits_update" ON habits FOR UPDATE USING (
  auth.uid() = client_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "habits_delete" ON habits FOR DELETE USING (
  auth.uid() = client_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Habit Logs
DROP POLICY IF EXISTS "habit_logs_select" ON habit_logs;
DROP POLICY IF EXISTS "habit_logs_insert" ON habit_logs;
DROP POLICY IF EXISTS "habit_logs_update" ON habit_logs;

CREATE POLICY "habit_logs_select" ON habit_logs FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM habits WHERE habits.id = habit_logs.habit_id
    AND (habits.client_id = auth.uid() OR habits.client_id IS NULL)
  )
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "habit_logs_insert" ON habit_logs FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM habits WHERE habits.id = habit_logs.habit_id
    AND (habits.client_id = auth.uid() OR habits.client_id IS NULL)
  )
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "habit_logs_update" ON habit_logs FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM habits WHERE habits.id = habit_logs.habit_id
    AND (habits.client_id = auth.uid() OR habits.client_id IS NULL)
  )
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Check-ins
DROP POLICY IF EXISTS "check_ins_select" ON check_ins;
DROP POLICY IF EXISTS "check_ins_insert" ON check_ins;
DROP POLICY IF EXISTS "check_ins_update" ON check_ins;

CREATE POLICY "check_ins_select" ON check_ins FOR SELECT USING (
  auth.uid() = client_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "check_ins_insert" ON check_ins FOR INSERT WITH CHECK (
  auth.uid() = client_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "check_ins_update" ON check_ins FOR UPDATE USING (
  auth.uid() = client_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Messages
DROP POLICY IF EXISTS "messages_select" ON messages;
DROP POLICY IF EXISTS "messages_insert" ON messages;
DROP POLICY IF EXISTS "messages_update" ON messages;

CREATE POLICY "messages_select" ON messages FOR SELECT USING (
  auth.uid() = sender_id OR auth.uid() = receiver_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "messages_insert" ON messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "messages_update" ON messages FOR UPDATE USING (
  auth.uid() = receiver_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================
-- PART 8: ADD COMPREHENSIVE EXERCISE LIBRARY
-- ============================================

-- First, ensure unique constraint exists
ALTER TABLE exercises DROP CONSTRAINT IF EXISTS exercises_name_key;
ALTER TABLE exercises ADD CONSTRAINT exercises_name_key UNIQUE (name);

-- Insert all exercises
INSERT INTO exercises (name, description, muscle_group, equipment, difficulty_level) VALUES
-- CHEST
('Barbell Bench Press', 'Flat bench pressing movement', 'Chest', 'Barbell', 'intermediate'),
('Incline Barbell Press', 'Incline pressing for upper chest', 'Chest', 'Barbell', 'intermediate'),
('Decline Barbell Press', 'Decline pressing for lower chest', 'Chest', 'Barbell', 'intermediate'),
('Dumbbell Bench Press', 'Flat dumbbell pressing', 'Chest', 'Dumbbells', 'beginner'),
('Incline Dumbbell Press', 'Incline dumbbell pressing', 'Chest', 'Dumbbells', 'beginner'),
('Dumbbell Flyes', 'Chest isolation with dumbbells', 'Chest', 'Dumbbells', 'beginner'),
('Cable Crossover', 'Cable chest fly movement', 'Chest', 'Cable', 'intermediate'),
('Push-Ups', 'Bodyweight chest exercise', 'Chest', 'Bodyweight', 'beginner'),
('Diamond Push-Ups', 'Close grip push-ups for chest and triceps', 'Chest', 'Bodyweight', 'intermediate'),
('Chest Dips', 'Dips leaning forward for chest', 'Chest', 'Bodyweight', 'intermediate'),
('Machine Chest Press', 'Seated chest press machine', 'Chest', 'Machine', 'beginner'),
('Pec Deck Fly', 'Machine chest fly', 'Chest', 'Machine', 'beginner'),

-- BACK
('Barbell Deadlift', 'Conventional deadlift', 'Back', 'Barbell', 'advanced'),
('Sumo Deadlift', 'Wide stance deadlift', 'Back', 'Barbell', 'advanced'),
('Romanian Deadlift', 'Stiff leg deadlift variation', 'Back', 'Barbell', 'intermediate'),
('Barbell Row', 'Bent over barbell row', 'Back', 'Barbell', 'intermediate'),
('Pendlay Row', 'Explosive barbell row', 'Back', 'Barbell', 'intermediate'),
('T-Bar Row', 'T-bar rowing movement', 'Back', 'Barbell', 'intermediate'),
('Dumbbell Row', 'Single arm dumbbell row', 'Back', 'Dumbbells', 'beginner'),
('Pull-Ups', 'Bodyweight vertical pull', 'Back', 'Bodyweight', 'intermediate'),
('Chin-Ups', 'Underhand grip pull-ups', 'Back', 'Bodyweight', 'intermediate'),
('Lat Pulldown', 'Cable lat pulldown', 'Back', 'Cable', 'beginner'),
('Seated Cable Row', 'Horizontal cable row', 'Back', 'Cable', 'beginner'),
('Face Pulls', 'Rear delt and upper back', 'Back', 'Cable', 'beginner'),
('Straight Arm Pulldown', 'Lat isolation', 'Back', 'Cable', 'beginner'),
('Hyperextensions', 'Lower back extension', 'Back', 'Bodyweight', 'beginner'),
('Good Mornings', 'Hip hinge for lower back', 'Back', 'Barbell', 'intermediate'),

-- SHOULDERS
('Overhead Press', 'Standing barbell press', 'Shoulders', 'Barbell', 'intermediate'),
('Seated Dumbbell Press', 'Seated shoulder press', 'Shoulders', 'Dumbbells', 'beginner'),
('Arnold Press', 'Rotating dumbbell press', 'Shoulders', 'Dumbbells', 'intermediate'),
('Lateral Raises', 'Side delt isolation', 'Shoulders', 'Dumbbells', 'beginner'),
('Front Raises', 'Front delt isolation', 'Shoulders', 'Dumbbells', 'beginner'),
('Rear Delt Flyes', 'Rear delt isolation', 'Shoulders', 'Dumbbells', 'beginner'),
('Upright Rows', 'Shoulder and trap exercise', 'Shoulders', 'Barbell', 'intermediate'),
('Cable Lateral Raise', 'Constant tension lateral raise', 'Shoulders', 'Cable', 'beginner'),
('Machine Shoulder Press', 'Seated machine press', 'Shoulders', 'Machine', 'beginner'),
('Reverse Pec Deck', 'Machine rear delt fly', 'Shoulders', 'Machine', 'beginner'),

-- LEGS
('Barbell Back Squat', 'High bar back squat', 'Legs', 'Barbell', 'intermediate'),
('Front Squat', 'Front loaded squat', 'Legs', 'Barbell', 'advanced'),
('Goblet Squat', 'Dumbbell or kettlebell squat', 'Legs', 'Dumbbells', 'beginner'),
('Bulgarian Split Squat', 'Rear foot elevated split squat', 'Legs', 'Dumbbells', 'intermediate'),
('Lunges', 'Walking or stationary lunges', 'Legs', 'Dumbbells', 'beginner'),
('Reverse Lunges', 'Backward stepping lunges', 'Legs', 'Dumbbells', 'beginner'),
('Leg Press', 'Machine leg press', 'Legs', 'Machine', 'beginner'),
('Hack Squat', 'Machine hack squat', 'Legs', 'Machine', 'intermediate'),
('Leg Extensions', 'Quad isolation', 'Legs', 'Machine', 'beginner'),
('Leg Curls', 'Hamstring isolation', 'Legs', 'Machine', 'beginner'),
('Standing Calf Raises', 'Calf exercise standing', 'Legs', 'Machine', 'beginner'),
('Seated Calf Raises', 'Seated calf exercise', 'Legs', 'Machine', 'beginner'),
('Hip Thrusts', 'Glute focused exercise', 'Glutes', 'Barbell', 'intermediate'),
('Glute Bridge', 'Bodyweight glute exercise', 'Glutes', 'Bodyweight', 'beginner'),
('Cable Kickbacks', 'Glute isolation', 'Glutes', 'Cable', 'beginner'),
('Sumo Squats', 'Wide stance squat', 'Glutes', 'Dumbbells', 'beginner'),
('Step-Ups', 'Single leg step up', 'Legs', 'Dumbbells', 'beginner'),
('Box Jumps', 'Plyometric box jump', 'Legs', 'Bodyweight', 'intermediate'),

-- BICEPS
('Barbell Curls', 'Standing barbell curl', 'Biceps', 'Barbell', 'beginner'),
('EZ Bar Curls', 'Curved bar curls', 'Biceps', 'Barbell', 'beginner'),
('Dumbbell Curls', 'Alternating dumbbell curls', 'Biceps', 'Dumbbells', 'beginner'),
('Hammer Curls', 'Neutral grip curls', 'Biceps', 'Dumbbells', 'beginner'),
('Concentration Curls', 'Seated isolation curls', 'Biceps', 'Dumbbells', 'beginner'),
('Preacher Curls', 'Supported bicep curls', 'Biceps', 'Barbell', 'beginner'),
('Incline Dumbbell Curls', 'Incline bench curls', 'Biceps', 'Dumbbells', 'intermediate'),
('Cable Curls', 'Constant tension curls', 'Biceps', 'Cable', 'beginner'),
('Spider Curls', 'Prone incline curls', 'Biceps', 'Dumbbells', 'intermediate'),

-- TRICEPS
('Tricep Pushdowns', 'Cable pushdowns', 'Triceps', 'Cable', 'beginner'),
('Overhead Tricep Extension', 'Cable or dumbbell overhead', 'Triceps', 'Cable', 'beginner'),
('Skull Crushers', 'Lying tricep extension', 'Triceps', 'Barbell', 'intermediate'),
('Close Grip Bench Press', 'Narrow grip bench', 'Triceps', 'Barbell', 'intermediate'),
('Tricep Dips', 'Parallel bar dips', 'Triceps', 'Bodyweight', 'intermediate'),
('Tricep Kickbacks', 'Dumbbell kickbacks', 'Triceps', 'Dumbbells', 'beginner'),
('Rope Pushdowns', 'Rope attachment pushdowns', 'Triceps', 'Cable', 'beginner'),

-- CORE
('Plank', 'Isometric core hold', 'Core', 'Bodyweight', 'beginner'),
('Side Plank', 'Lateral core hold', 'Core', 'Bodyweight', 'beginner'),
('Crunches', 'Basic ab crunch', 'Core', 'Bodyweight', 'beginner'),
('Bicycle Crunches', 'Rotating crunches', 'Core', 'Bodyweight', 'beginner'),
('Leg Raises', 'Hanging or lying leg raises', 'Core', 'Bodyweight', 'intermediate'),
('Mountain Climbers', 'Dynamic core exercise', 'Core', 'Bodyweight', 'beginner'),
('Russian Twists', 'Rotational core exercise', 'Core', 'Bodyweight', 'beginner'),
('Ab Wheel Rollouts', 'Ab wheel exercise', 'Core', 'Equipment', 'advanced'),
('Cable Woodchops', 'Rotational cable exercise', 'Core', 'Cable', 'intermediate'),
('Dead Bug', 'Anti-extension core exercise', 'Core', 'Bodyweight', 'beginner'),
('Bird Dog', 'Core stability exercise', 'Core', 'Bodyweight', 'beginner'),
('Hollow Body Hold', 'Gymnastics core hold', 'Core', 'Bodyweight', 'intermediate'),

-- CARDIO
('Treadmill Running', 'Running on treadmill', 'Cardio', 'Machine', 'beginner'),
('Stair Climber', 'Stair climbing machine', 'Cardio', 'Machine', 'beginner'),
('Rowing Machine', 'Ergometer rowing', 'Cardio', 'Machine', 'beginner'),
('Stationary Bike', 'Cycling machine', 'Cardio', 'Machine', 'beginner'),
('Jump Rope', 'Skipping rope', 'Cardio', 'Equipment', 'beginner'),
('Burpees', 'Full body cardio exercise', 'Cardio', 'Bodyweight', 'intermediate'),
('Jumping Jacks', 'Basic cardio movement', 'Cardio', 'Bodyweight', 'beginner'),
('High Knees', 'Running in place', 'Cardio', 'Bodyweight', 'beginner'),
('Battle Ropes', 'Rope wave exercises', 'Cardio', 'Equipment', 'intermediate'),
('Kettlebell Swings', 'Hip hinge cardio', 'Cardio', 'Kettlebell', 'intermediate')
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  muscle_group = EXCLUDED.muscle_group,
  equipment = EXCLUDED.equipment,
  difficulty_level = EXCLUDED.difficulty_level;

-- ============================================
-- PART 9: VERIFY TABLES EXIST
-- ============================================

-- Create client_details if missing
CREATE TABLE IF NOT EXISTS client_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  fitness_goals TEXT[],
  fitness_level TEXT,
  available_equipment TEXT,
  workout_days_per_week INTEGER,
  injuries TEXT[],
  activity_level TEXT,
  goals TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create measurements if missing
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

-- Create progress_photos if missing
CREATE TABLE IF NOT EXISTS progress_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  measurement_id UUID REFERENCES measurements(id) ON DELETE SET NULL,
  photo_url TEXT,
  photo_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create habits if missing
CREATE TABLE IF NOT EXISTS habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_preset BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create habit_logs if missing
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

-- Add client_id to habit_logs if missing
ALTER TABLE habit_logs ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES profiles(id) ON DELETE CASCADE;

-- Create check_ins if missing
CREATE TABLE IF NOT EXISTS check_ins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  week_number INTEGER,
  weight DECIMAL,
  sleep_quality TEXT,
  energy_level INTEGER,
  stress_level INTEGER,
  adherence TEXT,
  wins TEXT,
  challenges TEXT,
  questions TEXT,
  notes TEXT,
  coach_feedback TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create messages if missing
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE client_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_photos ENABLE ROW LEVEL SECURITY;

-- Client details policies
DROP POLICY IF EXISTS "client_details_select" ON client_details;
DROP POLICY IF EXISTS "client_details_insert" ON client_details;
DROP POLICY IF EXISTS "client_details_update" ON client_details;

CREATE POLICY "client_details_select" ON client_details FOR SELECT USING (
  auth.uid() = user_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "client_details_insert" ON client_details FOR INSERT WITH CHECK (
  auth.uid() = user_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "client_details_update" ON client_details FOR UPDATE USING (
  auth.uid() = user_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Progress photos policies
DROP POLICY IF EXISTS "progress_photos_select" ON progress_photos;
DROP POLICY IF EXISTS "progress_photos_insert" ON progress_photos;

CREATE POLICY "progress_photos_select" ON progress_photos FOR SELECT USING (
  auth.uid() = client_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "progress_photos_insert" ON progress_photos FOR INSERT WITH CHECK (
  auth.uid() = client_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================
-- PART 10: INSERT DEFAULT HABITS
-- ============================================

INSERT INTO habits (name, description, is_preset, client_id)
SELECT name, description, true, null FROM (VALUES
  ('Sleep 7+ hours', 'Get at least 7 hours of quality sleep'),
  ('Drink 8 glasses of water', 'Stay hydrated throughout the day'),
  ('Hit protein goal', 'Consume your daily protein target'),
  ('Complete workout', 'Finish your scheduled workout'),
  ('10-minute walk', 'Take a short walk for active recovery'),
  ('Meal prep', 'Prepare healthy meals in advance'),
  ('No late-night eating', 'Stop eating 2-3 hours before bed'),
  ('Morning routine', 'Complete your morning routine')
) AS t(name, description)
WHERE NOT EXISTS (SELECT 1 FROM habits WHERE is_preset = true LIMIT 1);

-- ============================================
-- DONE! Run this entire script in Supabase SQL Editor
-- ============================================
