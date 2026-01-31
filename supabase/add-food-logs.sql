-- Food Logging Table
-- Run this in the Supabase SQL Editor

CREATE TABLE IF NOT EXISTS food_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  log_date DATE DEFAULT CURRENT_DATE NOT NULL,
  food_name TEXT NOT NULL,
  servings DECIMAL NOT NULL DEFAULT 1,
  serving_size TEXT,
  calories INTEGER NOT NULL,
  protein DECIMAL NOT NULL,
  carbs DECIMAL NOT NULL,
  fat DECIMAL NOT NULL,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack', 'other')),
  notes TEXT,
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast daily queries
CREATE INDEX IF NOT EXISTS idx_food_logs_client_date ON food_logs(client_id, log_date);

-- Enable RLS
ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "food_logs_select" ON food_logs FOR SELECT USING (
  auth.uid() = client_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "food_logs_insert" ON food_logs FOR INSERT WITH CHECK (
  auth.uid() = client_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "food_logs_update" ON food_logs FOR UPDATE USING (
  auth.uid() = client_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "food_logs_delete" ON food_logs FOR DELETE USING (
  auth.uid() = client_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Add comments for documentation
COMMENT ON TABLE food_logs IS 'Client food logging for macro tracking';
COMMENT ON COLUMN food_logs.meal_type IS 'breakfast, lunch, dinner, snack, or other';
COMMENT ON COLUMN food_logs.servings IS 'Number of servings consumed';
COMMENT ON COLUMN food_logs.calories IS 'Total calories for this entry';
COMMENT ON COLUMN food_logs.protein IS 'Protein in grams';
COMMENT ON COLUMN food_logs.carbs IS 'Carbohydrates in grams';
COMMENT ON COLUMN food_logs.fat IS 'Fat in grams';
