-- Commitment Inquiries Table
-- Stores inquiries from the commitment pricing table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS commitment_inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT,
  commitment_length TEXT NOT NULL CHECK (commitment_length IN ('3-month', '6-month', '1-year')),
  sessions_per_week INTEGER NOT NULL CHECK (sessions_per_week IN (2, 3, 4, 5)),
  monthly_price DECIMAL NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'converted', 'declined')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quick status lookups
CREATE INDEX IF NOT EXISTS idx_commitment_inquiries_status ON commitment_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_commitment_inquiries_created ON commitment_inquiries(created_at DESC);

-- Enable RLS
ALTER TABLE commitment_inquiries ENABLE ROW LEVEL SECURITY;

-- Only admins can view/manage inquiries
CREATE POLICY "commitment_inquiries_admin_select" ON commitment_inquiries
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "commitment_inquiries_admin_insert" ON commitment_inquiries
  FOR INSERT WITH CHECK (true);  -- Allow anyone to submit inquiry

CREATE POLICY "commitment_inquiries_admin_update" ON commitment_inquiries
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "commitment_inquiries_admin_delete" ON commitment_inquiries
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
