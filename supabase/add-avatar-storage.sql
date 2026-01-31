-- Profile Avatar Storage Setup
-- Run this in Supabase SQL Editor

-- Create the storage bucket if it doesn't exist
-- Note: This needs to be done via Supabase Dashboard or using the Supabase CLI
-- The bucket 'profile-avatars' should be created with public access

-- Storage policies for profile-avatars bucket
-- These allow users to upload their own avatars and admins to manage all

-- Policy: Allow authenticated users to upload their own avatar
INSERT INTO storage.policies (name, bucket_id, operation, definition)
SELECT
  'Users can upload own avatar',
  'profile-avatars',
  'INSERT',
  'bucket_id = ''profile-avatars'' AND (storage.foldername(name))[1] = ''avatars'' AND auth.uid()::text = split_part((storage.filename(name)), ''-'', 1)'
WHERE NOT EXISTS (
  SELECT 1 FROM storage.policies
  WHERE name = 'Users can upload own avatar' AND bucket_id = 'profile-avatars'
);

-- Policy: Allow public read access to all avatars
INSERT INTO storage.policies (name, bucket_id, operation, definition)
SELECT
  'Public avatar access',
  'profile-avatars',
  'SELECT',
  'bucket_id = ''profile-avatars'''
WHERE NOT EXISTS (
  SELECT 1 FROM storage.policies
  WHERE name = 'Public avatar access' AND bucket_id = 'profile-avatars'
);

-- Policy: Allow users to update their own avatar
INSERT INTO storage.policies (name, bucket_id, operation, definition)
SELECT
  'Users can update own avatar',
  'profile-avatars',
  'UPDATE',
  'bucket_id = ''profile-avatars'' AND auth.uid()::text = split_part((storage.filename(name)), ''-'', 1)'
WHERE NOT EXISTS (
  SELECT 1 FROM storage.policies
  WHERE name = 'Users can update own avatar' AND bucket_id = 'profile-avatars'
);

-- Policy: Allow users to delete their own avatar
INSERT INTO storage.policies (name, bucket_id, operation, definition)
SELECT
  'Users can delete own avatar',
  'profile-avatars',
  'DELETE',
  'bucket_id = ''profile-avatars'' AND auth.uid()::text = split_part((storage.filename(name)), ''-'', 1)'
WHERE NOT EXISTS (
  SELECT 1 FROM storage.policies
  WHERE name = 'Users can delete own avatar' AND bucket_id = 'profile-avatars'
);

-- Policy: Allow admins full access
INSERT INTO storage.policies (name, bucket_id, operation, definition)
SELECT
  'Admin full access to avatars',
  'profile-avatars',
  'ALL',
  'bucket_id = ''profile-avatars'' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = ''admin'')'
WHERE NOT EXISTS (
  SELECT 1 FROM storage.policies
  WHERE name = 'Admin full access to avatars' AND bucket_id = 'profile-avatars'
);

-- Alternative simpler approach: Just run these in Dashboard -> Storage -> Policies
--
-- For the 'profile-avatars' bucket, create these policies:
--
-- 1. SELECT (public read):
--    authenticated and anon users
--    true
--
-- 2. INSERT (authenticated upload):
--    authenticated users only
--    (bucket_id = 'profile-avatars')
--
-- 3. UPDATE (authenticated update):
--    authenticated users only
--    (bucket_id = 'profile-avatars')
--
-- 4. DELETE (authenticated delete):
--    authenticated users only
--    (bucket_id = 'profile-avatars')
