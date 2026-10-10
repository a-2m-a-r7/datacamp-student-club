-- ============================================================================
-- DataCamp Student Club - Migration 20261010000002: Storage Buckets Setup
-- Buckets: course-thumbnails, avatars
-- ============================================================================

-- 1. Create Storage Buckets if not already created
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-thumbnails', 'course-thumbnails', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage Policies for course-thumbnails
DROP POLICY IF EXISTS "Public can view course thumbnails" ON storage.objects;
CREATE POLICY "Public can view course thumbnails"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'course-thumbnails');

DROP POLICY IF EXISTS "Admins can upload course thumbnails" ON storage.objects;
CREATE POLICY "Admins can upload course thumbnails"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'course-thumbnails' AND (public.is_admin() OR auth.role() = 'authenticated'));

DROP POLICY IF EXISTS "Admins can update course thumbnails" ON storage.objects;
CREATE POLICY "Admins can update course thumbnails"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'course-thumbnails' AND public.is_admin());

DROP POLICY IF EXISTS "Admins can delete course thumbnails" ON storage.objects;
CREATE POLICY "Admins can delete course thumbnails"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'course-thumbnails' AND public.is_admin());

-- 3. Storage Policies for avatars
DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
CREATE POLICY "Public can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);
