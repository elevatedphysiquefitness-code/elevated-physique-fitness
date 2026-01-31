-- Testimonials Table
-- Run this in the Supabase SQL Editor

-- Table to store client testimonials
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  testimonial_text TEXT NOT NULL,
  results_achieved TEXT,
  before_photo_url TEXT,
  after_photo_url TEXT,
  video_url TEXT,
  status TEXT CHECK (status IN ('pending', 'approved', 'featured', 'rejected')) DEFAULT 'pending',
  display_name TEXT, -- Optional override for display
  is_anonymous BOOLEAN DEFAULT FALSE,
  admin_notes TEXT,
  requested_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table to track testimonial requests sent to clients
CREATE TABLE IF NOT EXISTS testimonial_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  reminder_sent_at TIMESTAMPTZ,
  completed BOOLEAN DEFAULT FALSE,
  testimonial_id UUID REFERENCES testimonials(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_testimonials_client ON testimonials(client_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_status ON testimonials(status);
CREATE INDEX IF NOT EXISTS idx_testimonial_requests_client ON testimonial_requests(client_id);

-- Enable RLS
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonial_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for testimonials
-- Clients can view and create their own
CREATE POLICY "testimonials_select_own" ON testimonials FOR SELECT USING (
  auth.uid() = client_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  OR status IN ('approved', 'featured') -- Public can see approved testimonials
);

CREATE POLICY "testimonials_insert" ON testimonials FOR INSERT WITH CHECK (
  auth.uid() = client_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "testimonials_update" ON testimonials FOR UPDATE USING (
  auth.uid() = client_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "testimonials_delete" ON testimonials FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for testimonial_requests
CREATE POLICY "testimonial_requests_select" ON testimonial_requests FOR SELECT USING (
  auth.uid() = client_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "testimonial_requests_insert" ON testimonial_requests FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "testimonial_requests_update" ON testimonial_requests FOR UPDATE USING (
  auth.uid() = client_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Comments
COMMENT ON TABLE testimonials IS 'Client testimonials and reviews';
COMMENT ON TABLE testimonial_requests IS 'Track when testimonial requests are sent to clients';
