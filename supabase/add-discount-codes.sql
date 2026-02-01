-- Add discount codes table for promotional pricing
-- Run this in the Supabase SQL editor

-- Create discount_codes table
CREATE TABLE IF NOT EXISTS discount_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10, 2) NOT NULL,
  min_purchase DECIMAL(10, 2) DEFAULT 0,
  max_uses INTEGER DEFAULT NULL,
  uses_count INTEGER DEFAULT 0,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  applicable_plans TEXT[] DEFAULT NULL, -- NULL means applies to all plans
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster code lookups
CREATE INDEX IF NOT EXISTS idx_discount_codes_code ON discount_codes(code);
CREATE INDEX IF NOT EXISTS idx_discount_codes_active ON discount_codes(is_active, valid_from, valid_until);

-- Create discount_code_usage table to track who used what code
CREATE TABLE IF NOT EXISTS discount_code_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  discount_code_id UUID REFERENCES discount_codes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  discount_amount DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2) NOT NULL,
  final_price DECIMAL(10, 2) NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(discount_code_id, user_id) -- Each user can only use a code once
);

-- Create indexes for usage tracking
CREATE INDEX IF NOT EXISTS idx_discount_code_usage_code ON discount_code_usage(discount_code_id);
CREATE INDEX IF NOT EXISTS idx_discount_code_usage_user ON discount_code_usage(user_id);

-- Enable RLS
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_code_usage ENABLE ROW LEVEL SECURITY;

-- Policies for discount_codes
-- Anyone can read active discount codes (for validation)
CREATE POLICY "Anyone can read active discount codes" ON discount_codes
  FOR SELECT USING (is_active = true);

-- Only admins can manage discount codes
CREATE POLICY "Admins can manage discount codes" ON discount_codes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policies for discount_code_usage
-- Users can see their own usage
CREATE POLICY "Users can view own discount usage" ON discount_code_usage
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own usage
CREATE POLICY "Users can record own discount usage" ON discount_code_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can view all usage
CREATE POLICY "Admins can view all discount usage" ON discount_code_usage
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Function to validate and apply a discount code
CREATE OR REPLACE FUNCTION validate_discount_code(
  p_code TEXT,
  p_plan_key TEXT DEFAULT NULL,
  p_original_price DECIMAL DEFAULT NULL
)
RETURNS TABLE (
  is_valid BOOLEAN,
  discount_code_id UUID,
  discount_type TEXT,
  discount_value DECIMAL,
  discount_amount DECIMAL,
  final_price DECIMAL,
  error_message TEXT
) AS $$
DECLARE
  v_code_record RECORD;
  v_discount_amount DECIMAL;
  v_final_price DECIMAL;
BEGIN
  -- Find the discount code
  SELECT * INTO v_code_record
  FROM discount_codes dc
  WHERE UPPER(dc.code) = UPPER(p_code)
    AND dc.is_active = true
    AND (dc.valid_from IS NULL OR dc.valid_from <= NOW())
    AND (dc.valid_until IS NULL OR dc.valid_until >= NOW())
    AND (dc.max_uses IS NULL OR dc.uses_count < dc.max_uses)
  LIMIT 1;

  -- Code not found or invalid
  IF v_code_record IS NULL THEN
    RETURN QUERY SELECT
      false::BOOLEAN,
      NULL::UUID,
      NULL::TEXT,
      NULL::DECIMAL,
      NULL::DECIMAL,
      NULL::DECIMAL,
      'Invalid or expired discount code'::TEXT;
    RETURN;
  END IF;

  -- Check if plan is applicable
  IF v_code_record.applicable_plans IS NOT NULL AND p_plan_key IS NOT NULL THEN
    IF NOT (p_plan_key = ANY(v_code_record.applicable_plans)) THEN
      RETURN QUERY SELECT
        false::BOOLEAN,
        NULL::UUID,
        NULL::TEXT,
        NULL::DECIMAL,
        NULL::DECIMAL,
        NULL::DECIMAL,
        'This discount code is not valid for the selected plan'::TEXT;
      RETURN;
    END IF;
  END IF;

  -- Check minimum purchase
  IF p_original_price IS NOT NULL AND p_original_price < v_code_record.min_purchase THEN
    RETURN QUERY SELECT
      false::BOOLEAN,
      NULL::UUID,
      NULL::TEXT,
      NULL::DECIMAL,
      NULL::DECIMAL,
      NULL::DECIMAL,
      ('Minimum purchase of $' || v_code_record.min_purchase || ' required')::TEXT;
    RETURN;
  END IF;

  -- Calculate discount
  IF p_original_price IS NOT NULL THEN
    IF v_code_record.discount_type = 'percentage' THEN
      v_discount_amount := ROUND(p_original_price * (v_code_record.discount_value / 100), 2);
    ELSE
      v_discount_amount := v_code_record.discount_value;
    END IF;
    v_final_price := GREATEST(0, p_original_price - v_discount_amount);
  ELSE
    v_discount_amount := NULL;
    v_final_price := NULL;
  END IF;

  RETURN QUERY SELECT
    true::BOOLEAN,
    v_code_record.id,
    v_code_record.discount_type,
    v_code_record.discount_value,
    v_discount_amount,
    v_final_price,
    NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert a sample discount code for clients starting on the 4th
-- 20% discount for the first month
INSERT INTO discount_codes (code, description, discount_type, discount_value, valid_until, applicable_plans)
VALUES (
  'FEB4START',
  '20% off first month for clients starting February 4th',
  'percentage',
  20,
  '2025-02-28 23:59:59+00',
  NULL -- Applies to all plans
)
ON CONFLICT (code) DO UPDATE SET
  description = EXCLUDED.description,
  discount_value = EXCLUDED.discount_value,
  valid_until = EXCLUDED.valid_until,
  updated_at = NOW();

-- Function to increment discount code usage count
CREATE OR REPLACE FUNCTION increment_discount_uses(code_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE discount_codes
  SET uses_count = uses_count + 1,
      updated_at = NOW()
  WHERE id = code_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute on the functions
GRANT EXECUTE ON FUNCTION validate_discount_code TO authenticated;
GRANT EXECUTE ON FUNCTION validate_discount_code TO anon;
GRANT EXECUTE ON FUNCTION increment_discount_uses TO authenticated;
