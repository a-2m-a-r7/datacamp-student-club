BEGIN;
UPDATE storage.buckets SET file_size_limit=5242880,
 allowed_mime_types=ARRAY['image/png','image/jpeg','image/webp'] WHERE id='avatars';
-- Public image URLs remain usable; object-directory listing is owner/admin only.
-- Restrictive policy also intersects older permissive policies on this bucket.
DROP POLICY IF EXISTS qa_avatar_directory_private ON storage.objects;
CREATE POLICY qa_avatar_directory_private ON storage.objects AS RESTRICTIVE
 FOR SELECT TO anon,authenticated
 USING(bucket_id<>'avatars' OR (auth.uid() IS NOT NULL AND
 (split_part(name,'/',1)=auth.uid()::text OR public.is_admin())));
COMMIT;
