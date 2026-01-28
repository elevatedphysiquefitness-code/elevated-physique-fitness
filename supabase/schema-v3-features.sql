-- ============================================
-- ELEVATED PHYSIQUE FITNESS - V3 SCHEMA UPDATE
-- New features: AI Workouts, Body Fat, Meal Plans
-- ============================================

-- ============================================
-- 1. CLIENT ONBOARDING / QUESTIONNAIRE
-- ============================================

-- Add onboarding fields to client_details
ALTER TABLE client_details ADD COLUMN IF NOT EXISTS fitness_goals TEXT[];
ALTER TABLE client_details ADD COLUMN IF NOT EXISTS body_part_goals TEXT[];
ALTER TABLE client_details ADD COLUMN IF NOT EXISTS fitness_level TEXT; -- 'beginner', 'intermediate', 'advanced'
ALTER TABLE client_details ADD COLUMN IF NOT EXISTS available_equipment TEXT; -- 'home_gym', 'commercial_gym', 'minimal', 'bodyweight'
ALTER TABLE client_details ADD COLUMN IF NOT EXISTS injuries TEXT[];
ALTER TABLE client_details ADD COLUMN IF NOT EXISTS medical_conditions TEXT[];
ALTER TABLE client_details ADD COLUMN IF NOT EXISTS is_pregnant BOOLEAN DEFAULT FALSE;
ALTER TABLE client_details ADD COLUMN IF NOT EXISTS dietary_preferences TEXT[];
ALTER TABLE client_details ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE client_details ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

-- ============================================
-- 2. BODY FAT TRACKING
-- ============================================

-- Add body fat to measurements table
ALTER TABLE measurements ADD COLUMN IF NOT EXISTS body_fat_percentage DECIMAL;

-- ============================================
-- 3. AI-GENERATED WORKOUT PROGRAMS
-- ============================================

-- Add AI generation tracking to workout_templates
ALTER TABLE workout_templates ADD COLUMN IF NOT EXISTS is_ai_generated BOOLEAN DEFAULT FALSE;
ALTER TABLE workout_templates ADD COLUMN IF NOT EXISTS ai_prompt TEXT;
ALTER TABLE workout_templates ADD COLUMN IF NOT EXISTS created_for_client_id UUID REFERENCES profiles(id);

-- Create contraindications table for exercise safety
CREATE TABLE IF NOT EXISTS exercise_contraindications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
  condition_type TEXT NOT NULL, -- 'injury', 'pregnancy', 'medical'
  condition_value TEXT NOT NULL, -- e.g., 'knee_injury', 'back_pain', 'pregnancy'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add more detail fields to exercises
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS difficulty_level TEXT; -- 'beginner', 'intermediate', 'advanced'
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS equipment_required TEXT[];
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS is_compound BOOLEAN DEFAULT FALSE;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS calories_per_minute DECIMAL;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS primary_muscles TEXT[];
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS secondary_muscles TEXT[];

-- ============================================
-- 4. MEAL PLANS & FOOD RECOMMENDATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS meal_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  target_calories INTEGER,
  target_protein INTEGER,
  target_carbs INTEGER,
  target_fat INTEGER,
  is_ai_generated BOOLEAN DEFAULT FALSE,
  ai_prompt TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS meal_plan_days (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meal_plan_id UUID REFERENCES meal_plans(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL, -- 1-7 for weekly plans
  day_name TEXT, -- 'Monday', 'Tuesday', etc.
  notes TEXT
);

CREATE TABLE IF NOT EXISTS meals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meal_plan_day_id UUID REFERENCES meal_plan_days(id) ON DELETE CASCADE,
  meal_type TEXT NOT NULL, -- 'breakfast', 'lunch', 'dinner', 'snack'
  name TEXT NOT NULL,
  description TEXT,
  calories INTEGER,
  protein INTEGER,
  carbs INTEGER,
  fat INTEGER,
  ingredients TEXT[],
  instructions TEXT,
  prep_time_minutes INTEGER,
  image_url TEXT,
  order_index INTEGER DEFAULT 0
);

-- Food database for recommendations
CREATE TABLE IF NOT EXISTS foods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT, -- 'protein', 'carb', 'fat', 'vegetable', 'fruit', 'dairy'
  serving_size TEXT,
  calories_per_serving INTEGER,
  protein_per_serving DECIMAL,
  carbs_per_serving DECIMAL,
  fat_per_serving DECIMAL,
  fiber_per_serving DECIMAL,
  is_vegetarian BOOLEAN DEFAULT FALSE,
  is_vegan BOOLEAN DEFAULT FALSE,
  is_gluten_free BOOLEAN DEFAULT FALSE,
  is_dairy_free BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. IMAGE STORAGE
-- ============================================

-- Progress photos table (linked to Supabase Storage)
CREATE TABLE IF NOT EXISTS progress_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  measurement_id UUID REFERENCES measurements(id) ON DELETE SET NULL,
  photo_type TEXT NOT NULL, -- 'front', 'side', 'back', 'other'
  storage_path TEXT NOT NULL, -- Path in Supabase Storage
  thumbnail_path TEXT,
  notes TEXT,
  taken_at DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profile photos
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_storage_path TEXT;

-- ============================================
-- 6. ADMIN WORKOUT ASSIGNMENT
-- ============================================

-- Track workout program assignments
ALTER TABLE client_programs ADD COLUMN IF NOT EXISTS assigned_by UUID REFERENCES profiles(id);
ALTER TABLE client_programs ADD COLUMN IF NOT EXISTS assignment_notes TEXT;
ALTER TABLE client_programs ADD COLUMN IF NOT EXISTS is_custom BOOLEAN DEFAULT FALSE;

-- ============================================
-- 7. ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on new tables
ALTER TABLE exercise_contraindications ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plan_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_photos ENABLE ROW LEVEL SECURITY;

-- Contraindications (admin can manage, everyone can read)
CREATE POLICY "Anyone can view contraindications" ON exercise_contraindications
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage contraindications" ON exercise_contraindications
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Meal plans (clients see own, admins see all)
CREATE POLICY "Clients can view own meal plans" ON meal_plans
  FOR SELECT USING (client_id = auth.uid());

CREATE POLICY "Admins can view all meal plans" ON meal_plans
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can manage meal plans" ON meal_plans
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Clients can create own meal plans" ON meal_plans
  FOR INSERT WITH CHECK (client_id = auth.uid());

-- Meal plan days (inherit from meal_plans)
CREATE POLICY "Users can view meal plan days" ON meal_plan_days
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM meal_plans
      WHERE id = meal_plan_days.meal_plan_id
      AND (client_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
    )
  );

-- Meals (inherit from meal_plan_days)
CREATE POLICY "Users can view meals" ON meals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM meal_plan_days mpd
      JOIN meal_plans mp ON mp.id = mpd.meal_plan_id
      WHERE mpd.id = meals.meal_plan_day_id
      AND (mp.client_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
    )
  );

-- Foods (everyone can read)
CREATE POLICY "Anyone can view foods" ON foods
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage foods" ON foods
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Progress photos (clients see own, admins see all)
CREATE POLICY "Clients can view own progress photos" ON progress_photos
  FOR SELECT USING (client_id = auth.uid());

CREATE POLICY "Clients can upload own progress photos" ON progress_photos
  FOR INSERT WITH CHECK (client_id = auth.uid());

CREATE POLICY "Clients can delete own progress photos" ON progress_photos
  FOR DELETE USING (client_id = auth.uid());

CREATE POLICY "Admins can view all progress photos" ON progress_photos
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- 8. SEED DATA - COMMON FOODS
-- ============================================

INSERT INTO foods (name, category, serving_size, calories_per_serving, protein_per_serving, carbs_per_serving, fat_per_serving, is_vegetarian, is_vegan, is_gluten_free, is_dairy_free) VALUES
-- Proteins
('Chicken Breast (grilled)', 'protein', '4 oz', 165, 31, 0, 3.6, false, false, true, true),
('Salmon (baked)', 'protein', '4 oz', 233, 25, 0, 14, false, false, true, true),
('Ground Turkey (93% lean)', 'protein', '4 oz', 170, 21, 0, 9, false, false, true, true),
('Eggs (whole)', 'protein', '2 large', 156, 12, 1, 11, true, false, true, true),
('Egg Whites', 'protein', '4 large', 68, 14, 1, 0, true, false, true, true),
('Greek Yogurt (non-fat)', 'protein', '1 cup', 100, 17, 6, 0, true, false, true, false),
('Cottage Cheese (low-fat)', 'protein', '1 cup', 163, 28, 6, 2, true, false, true, false),
('Tofu (firm)', 'protein', '4 oz', 88, 10, 2, 5, true, true, true, true),
('Black Beans', 'protein', '1 cup cooked', 227, 15, 41, 1, true, true, true, true),
('Lentils', 'protein', '1 cup cooked', 230, 18, 40, 1, true, true, true, true),

-- Carbs
('Brown Rice', 'carb', '1 cup cooked', 216, 5, 45, 2, true, true, true, true),
('White Rice', 'carb', '1 cup cooked', 206, 4, 45, 0, true, true, true, true),
('Oatmeal', 'carb', '1 cup cooked', 166, 6, 28, 4, true, true, true, true),
('Sweet Potato', 'carb', '1 medium', 103, 2, 24, 0, true, true, true, true),
('Quinoa', 'carb', '1 cup cooked', 222, 8, 39, 4, true, true, true, true),
('Whole Wheat Bread', 'carb', '2 slices', 160, 8, 28, 2, true, true, false, true),
('Banana', 'carb', '1 medium', 105, 1, 27, 0, true, true, true, true),
('Apple', 'carb', '1 medium', 95, 0, 25, 0, true, true, true, true),

-- Fats
('Avocado', 'fat', '1/2 medium', 161, 2, 9, 15, true, true, true, true),
('Almonds', 'fat', '1 oz (23 nuts)', 164, 6, 6, 14, true, true, true, true),
('Peanut Butter', 'fat', '2 tbsp', 188, 8, 6, 16, true, true, true, true),
('Olive Oil', 'fat', '1 tbsp', 119, 0, 0, 14, true, true, true, true),
('Walnuts', 'fat', '1 oz', 185, 4, 4, 18, true, true, true, true),

-- Vegetables
('Broccoli', 'vegetable', '1 cup', 55, 4, 11, 1, true, true, true, true),
('Spinach (raw)', 'vegetable', '2 cups', 14, 2, 2, 0, true, true, true, true),
('Asparagus', 'vegetable', '1 cup', 27, 3, 5, 0, true, true, true, true),
('Green Beans', 'vegetable', '1 cup', 44, 2, 10, 0, true, true, true, true),
('Bell Peppers', 'vegetable', '1 medium', 24, 1, 6, 0, true, true, true, true),
('Cucumber', 'vegetable', '1 cup sliced', 16, 1, 4, 0, true, true, true, true),
('Tomatoes', 'vegetable', '1 medium', 22, 1, 5, 0, true, true, true, true),
('Zucchini', 'vegetable', '1 cup', 21, 2, 4, 0, true, true, true, true)
ON CONFLICT DO NOTHING;

-- ============================================
-- 9. SEED DATA - EXERCISE CONTRAINDICATIONS
-- ============================================

-- Get exercise IDs dynamically and add contraindications
DO $$
DECLARE
  squat_id UUID;
  deadlift_id UUID;
  bench_id UUID;
  ohp_id UUID;
BEGIN
  -- Get exercise IDs
  SELECT id INTO squat_id FROM exercises WHERE name ILIKE '%squat%' LIMIT 1;
  SELECT id INTO deadlift_id FROM exercises WHERE name ILIKE '%deadlift%' LIMIT 1;
  SELECT id INTO bench_id FROM exercises WHERE name ILIKE '%bench press%' LIMIT 1;
  SELECT id INTO ohp_id FROM exercises WHERE name ILIKE '%overhead%' OR name ILIKE '%shoulder press%' LIMIT 1;

  -- Add contraindications if exercises exist
  IF squat_id IS NOT NULL THEN
    INSERT INTO exercise_contraindications (exercise_id, condition_type, condition_value) VALUES
    (squat_id, 'injury', 'knee_injury'),
    (squat_id, 'injury', 'lower_back_injury'),
    (squat_id, 'pregnancy', 'third_trimester')
    ON CONFLICT DO NOTHING;
  END IF;

  IF deadlift_id IS NOT NULL THEN
    INSERT INTO exercise_contraindications (exercise_id, condition_type, condition_value) VALUES
    (deadlift_id, 'injury', 'lower_back_injury'),
    (deadlift_id, 'injury', 'herniated_disc'),
    (deadlift_id, 'pregnancy', 'second_trimester'),
    (deadlift_id, 'pregnancy', 'third_trimester')
    ON CONFLICT DO NOTHING;
  END IF;

  IF bench_id IS NOT NULL THEN
    INSERT INTO exercise_contraindications (exercise_id, condition_type, condition_value) VALUES
    (bench_id, 'injury', 'shoulder_injury'),
    (bench_id, 'pregnancy', 'second_trimester'),
    (bench_id, 'pregnancy', 'third_trimester')
    ON CONFLICT DO NOTHING;
  END IF;

  IF ohp_id IS NOT NULL THEN
    INSERT INTO exercise_contraindications (exercise_id, condition_type, condition_value) VALUES
    (ohp_id, 'injury', 'shoulder_injury'),
    (ohp_id, 'injury', 'neck_injury'),
    (ohp_id, 'medical', 'high_blood_pressure')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- ============================================
-- 10. STORAGE BUCKET SETUP (Run in Supabase Dashboard)
-- ============================================
-- NOTE: Run these in the Supabase Storage section:
--
-- 1. Create bucket: progress-photos (public: false)
-- 2. Create bucket: profile-avatars (public: true)
-- 3. Create bucket: meal-photos (public: false)
--
-- Storage Policies (add via Supabase Dashboard > Storage > Policies):
--
-- For progress-photos bucket:
-- - SELECT: auth.uid() = (storage.foldername(name))[1]::uuid
-- - INSERT: auth.uid() = (storage.foldername(name))[1]::uuid
-- - DELETE: auth.uid() = (storage.foldername(name))[1]::uuid
--
-- For profile-avatars bucket:
-- - SELECT: true (public read)
-- - INSERT: auth.uid()::text = (storage.foldername(name))[1]
-- - UPDATE: auth.uid()::text = (storage.foldername(name))[1]
-- - DELETE: auth.uid()::text = (storage.foldername(name))[1]

-- ============================================
-- DONE! Run this SQL in your Supabase SQL Editor
-- ============================================
