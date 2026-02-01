-- Contact Messages & Coaching Applications Tables
-- Run this in Supabase SQL Editor

-- =====================================================
-- CONTACT MESSAGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  workout_days TEXT,
  availability TEXT,
  goals TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created ON contact_messages(created_at DESC);

-- Enable RLS
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "contact_messages_insert" ON contact_messages
  FOR INSERT WITH CHECK (true);  -- Anyone can submit

CREATE POLICY "contact_messages_admin_select" ON contact_messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "contact_messages_admin_update" ON contact_messages
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "contact_messages_admin_delete" ON contact_messages
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =====================================================
-- COACHING APPLICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS coaching_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  goals TEXT NOT NULL,
  experience_level TEXT NOT NULL,
  availability TEXT NOT NULL,
  program_interest TEXT NOT NULL,
  why_elevated TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewing', 'approved', 'declined', 'converted')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_coaching_applications_status ON coaching_applications(status);
CREATE INDEX IF NOT EXISTS idx_coaching_applications_created ON coaching_applications(created_at DESC);

-- Enable RLS
ALTER TABLE coaching_applications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "coaching_applications_insert" ON coaching_applications
  FOR INSERT WITH CHECK (true);  -- Anyone can submit

CREATE POLICY "coaching_applications_admin_select" ON coaching_applications
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "coaching_applications_admin_update" ON coaching_applications
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "coaching_applications_admin_delete" ON coaching_applications
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =====================================================
-- SITE IMAGES TABLE (for AdminImageUpload component)
-- =====================================================
CREATE TABLE IF NOT EXISTS site_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_key TEXT UNIQUE NOT NULL,
  image_url TEXT NOT NULL,
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE site_images ENABLE ROW LEVEL SECURITY;

-- Policies - anyone can view, only admins can modify
CREATE POLICY "site_images_select" ON site_images
  FOR SELECT USING (true);

CREATE POLICY "site_images_admin_insert" ON site_images
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "site_images_admin_update" ON site_images
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "site_images_admin_delete" ON site_images
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
