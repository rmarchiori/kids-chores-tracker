-- Supabase Storage Setup for Profile Photos
-- Run this in Supabase SQL Editor

-- Create the storage bucket for profile photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their own profile photos
CREATE POLICY "Users can upload profile photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update their own profile photos
CREATE POLICY "Users can update their own profile photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own profile photos
CREATE POLICY "Users can delete their own profile photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public read access to all profile photos (since bucket is public)
CREATE POLICY "Public read access to profile photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-photos');

-- Grant usage on storage schema
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT USAGE ON SCHEMA storage TO public;

-- Grant access to storage.objects table
GRANT SELECT ON storage.objects TO public;
GRANT ALL ON storage.objects TO authenticated;

COMMENT ON POLICY "Users can upload profile photos" ON storage.objects IS
'Allow authenticated users to upload profile photos to their own folder (user_id/filename)';

COMMENT ON POLICY "Public read access to profile photos" ON storage.objects IS
'Allow public read access since profile photos are displayed in the app';
