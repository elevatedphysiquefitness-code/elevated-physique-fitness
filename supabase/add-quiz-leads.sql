-- Quiz Leads Table
-- Run this in the Supabase SQL Editor

-- Table to store leads captured from the fitness quiz
CREATE TABLE IF NOT EXISTS quiz_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  goal TEXT,
  fitness_level TEXT,
  time_available TEXT,
  preferred_style TEXT,
  challenges TEXT[],
  status TEXT CHECK (status IN ('new', 'contacted', 'converted', 'closed')) DEFAULT 'new',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_quiz_leads_email ON quiz_leads(email);
CREATE INDEX IF NOT EXISTS idx_quiz_leads_status ON quiz_leads(status);
CREATE INDEX IF NOT EXISTS idx_quiz_leads_created ON quiz_leads(created_at DESC);

-- Enable RLS
ALTER TABLE quiz_leads ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (for anonymous quiz submissions)
CREATE POLICY "quiz_leads_insert" ON quiz_leads FOR INSERT WITH CHECK (true);

-- Only admins can view/update quiz leads
CREATE POLICY "quiz_leads_select" ON quiz_leads FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "quiz_leads_update" ON quiz_leads FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "quiz_leads_delete" ON quiz_leads FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Comment
COMMENT ON TABLE quiz_leads IS 'Leads captured from the fitness assessment quiz';
