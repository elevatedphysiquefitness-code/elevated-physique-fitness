-- Referral Program Tables
-- Run this in the Supabase SQL Editor

-- Table to store referral codes for each client
CREATE TABLE IF NOT EXISTS referral_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  total_referrals INTEGER DEFAULT 0,
  successful_referrals INTEGER DEFAULT 0,
  rewards_earned DECIMAL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table to track individual referrals
CREATE TABLE IF NOT EXISTS referrals (
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_referral_codes_client ON referral_codes(client_id);
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON referral_codes(code);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_email ON referrals(referred_email);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);

-- Enable RLS
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for referral_codes
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

-- RLS Policies for referrals
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

-- Comments
COMMENT ON TABLE referral_codes IS 'Unique referral codes for each client';
COMMENT ON TABLE referrals IS 'Individual referral tracking';
