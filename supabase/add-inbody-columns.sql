-- Add InBody data columns to measurements table
-- Run this in the Supabase SQL Editor

ALTER TABLE measurements
ADD COLUMN IF NOT EXISTS skeletal_muscle_mass DECIMAL,
ADD COLUMN IF NOT EXISTS body_fat_mass DECIMAL,
ADD COLUMN IF NOT EXISTS total_body_water DECIMAL,
ADD COLUMN IF NOT EXISTS lean_body_mass DECIMAL,
ADD COLUMN IF NOT EXISTS bmi DECIMAL,
ADD COLUMN IF NOT EXISTS basal_metabolic_rate DECIMAL,
ADD COLUMN IF NOT EXISTS visceral_fat_level INTEGER;

-- Add comments to describe the columns
COMMENT ON COLUMN measurements.skeletal_muscle_mass IS 'InBody: Skeletal Muscle Mass in lbs';
COMMENT ON COLUMN measurements.body_fat_mass IS 'InBody: Body Fat Mass in lbs';
COMMENT ON COLUMN measurements.total_body_water IS 'InBody: Total Body Water in lbs';
COMMENT ON COLUMN measurements.lean_body_mass IS 'InBody: Lean Body Mass in lbs';
COMMENT ON COLUMN measurements.bmi IS 'InBody: Body Mass Index';
COMMENT ON COLUMN measurements.basal_metabolic_rate IS 'InBody: Basal Metabolic Rate in kcal';
COMMENT ON COLUMN measurements.visceral_fat_level IS 'InBody: Visceral Fat Level (1-20 scale)';
