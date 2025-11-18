-- Sprint 1.2: Storage Bucket Security Policies
-- Secure task-images storage bucket with family-based isolation
-- Created: 2025-11-18

-- ============================================================================
-- Create task-images storage bucket if it doesn't exist
-- ============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('task-images', 'task-images', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- Storage Policies: Family-based isolation for custom uploads
-- ============================================================================

-- Policy 1: Users can upload images to their own family folder
CREATE POLICY "Users can upload to own family folder"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'task-images'
  AND (storage.foldername(name))[1] = 'custom'
  AND (storage.foldername(name))[2] IN (
    SELECT family_id::text FROM family_members
    WHERE user_id = auth.uid()
  )
);

-- Policy 2: Users can read images from library (public) or their own family
CREATE POLICY "Users can read library and own family images"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'task-images'
  AND (
    -- Can read library images
    (storage.foldername(name))[1] = 'library'
    OR
    -- Can read their family's custom images
    (
      (storage.foldername(name))[1] = 'custom'
      AND (storage.foldername(name))[2] IN (
        SELECT family_id::text FROM family_members
        WHERE user_id = auth.uid()
      )
    )
  )
);

-- Policy 3: Users can delete their own family's custom images
CREATE POLICY "Users can delete own family images"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'task-images'
  AND (storage.foldername(name))[1] = 'custom'
  AND (storage.foldername(name))[2] IN (
    SELECT family_id::text FROM family_members
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'parent')  -- Only admins and parents can delete
  )
);

-- Policy 4: Users can update their own family's custom images
CREATE POLICY "Users can update own family images"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'task-images'
  AND (storage.foldername(name))[1] = 'custom'
  AND (storage.foldername(name))[2] IN (
    SELECT family_id::text FROM family_members
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'parent')
  )
);

-- ============================================================================
-- File Size Limits
-- ============================================================================
-- Note: File size limit (1MB) is enforced at application level
-- Supabase storage doesn't support per-bucket size limits in policies
