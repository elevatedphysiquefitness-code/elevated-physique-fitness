-- Food Logs Table (if not exists)
-- This table stores client food log entries that persist as their meal plan

CREATE TABLE IF NOT EXISTS food_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  log_date DATE DEFAULT CURRENT_DATE,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack', 'pre_workout', 'post_workout', 'other')),
  food_name TEXT NOT NULL,
  servings DECIMAL DEFAULT 1,
  serving_size TEXT,
  calories INTEGER,
  protein DECIMAL,
  carbs DECIMAL,
  fat DECIMAL,
  notes TEXT,
  food_id UUID, -- Optional reference to a foods database
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if exists and recreate
DROP POLICY IF EXISTS "Users can manage own food logs" ON food_logs;
CREATE POLICY "Users can manage own food logs" ON food_logs
  FOR ALL USING (client_id = auth.uid());

-- Admin can view all food logs
DROP POLICY IF EXISTS "Admins can view all food logs" ON food_logs;
CREATE POLICY "Admins can view all food logs" ON food_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_food_logs_client_date ON food_logs(client_id, log_date);
CREATE INDEX IF NOT EXISTS idx_food_logs_client_id ON food_logs(client_id);

-- Add macro target columns to client_details (if not exists)
ALTER TABLE client_details ADD COLUMN IF NOT EXISTS target_calories INTEGER;
ALTER TABLE client_details ADD COLUMN IF NOT EXISTS target_protein INTEGER;
ALTER TABLE client_details ADD COLUMN IF NOT EXISTS target_carbs INTEGER;
ALTER TABLE client_details ADD COLUMN IF NOT EXISTS target_fat INTEGER;
ALTER TABLE client_details ADD COLUMN IF NOT EXISTS macros_calculated_at TIMESTAMPTZ;

-- Optional: Create a saved_foods table for frequently used foods
CREATE TABLE IF NOT EXISTS saved_foods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  food_name TEXT NOT NULL,
  serving_size TEXT,
  calories INTEGER,
  protein DECIMAL,
  carbs DECIMAL,
  fat DECIMAL,
  is_favorite BOOLEAN DEFAULT false,
  use_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE saved_foods ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own saved foods" ON saved_foods;
CREATE POLICY "Users can manage own saved foods" ON saved_foods
  FOR ALL USING (client_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_saved_foods_client ON saved_foods(client_id);
CREATE INDEX IF NOT EXISTS idx_saved_foods_favorite ON saved_foods(client_id, is_favorite);
