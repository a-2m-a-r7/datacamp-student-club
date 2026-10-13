BEGIN;
INSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types) VALUES
 ('form-attachments','form-attachments',false,10485760,ARRAY['image/png','image/jpeg','image/webp','application/pdf','text/plain']),
 ('avatars','avatars',true,5242880,ARRAY['image/png','image/jpeg','image/webp']),
 ('course-thumbnails','course-thumbnails',true,10485760,ARRAY['image/png','image/jpeg','image/webp']),
 ('uploads','uploads',true,10485760,ARRAY['image/png','image/jpeg','image/webp'])
ON CONFLICT(id) DO NOTHING;
UPDATE storage.buckets SET public=false WHERE id='form-attachments';
-- Remove only the previous named form-attachment policies before applying the tighter rules.
DROP POLICY IF EXISTS form_attachments_admin_all ON storage.objects;
DROP POLICY IF EXISTS form_attachments_upload_public ON storage.objects;
DROP POLICY IF EXISTS qa_attachments_admin ON storage.objects;
CREATE POLICY qa_attachments_admin ON storage.objects FOR ALL TO authenticated
USING(bucket_id='form-attachments' AND public.is_admin()) WITH CHECK(bucket_id='form-attachments' AND public.is_admin());
DROP POLICY IF EXISTS qa_form_upload ON storage.objects;
CREATE POLICY qa_form_upload ON storage.objects FOR INSERT TO anon,authenticated WITH CHECK(
 bucket_id='form-attachments' AND EXISTS(SELECT 1 FROM public.forms f WHERE
 f.id::text=split_part(name,'/',1) AND f.status='published' AND (f.allow_anonymous OR auth.uid() IS NOT NULL)
 AND (f.opens_at IS NULL OR f.opens_at<=now()) AND (f.closes_at IS NULL OR f.closes_at>=now())));
DROP POLICY IF EXISTS qa_public_images ON storage.objects;
CREATE POLICY qa_public_images ON storage.objects FOR SELECT TO anon,authenticated USING(bucket_id IN ('avatars','course-thumbnails','uploads'));
DROP POLICY IF EXISTS qa_images_admin ON storage.objects;
CREATE POLICY qa_images_admin ON storage.objects FOR ALL TO authenticated USING(
 bucket_id IN ('avatars','course-thumbnails','uploads') AND public.is_admin()) WITH CHECK(
 bucket_id IN ('avatars','course-thumbnails','uploads') AND public.is_admin());
DROP POLICY IF EXISTS qa_own_avatar ON storage.objects;
CREATE POLICY qa_own_avatar ON storage.objects FOR ALL TO authenticated USING(
 bucket_id='avatars' AND split_part(name,'/',1)=auth.uid()::text) WITH CHECK(
 bucket_id='avatars' AND split_part(name,'/',1)=auth.uid()::text);
-- Restrictive rules also constrain older permissive policies on these buckets.
DROP POLICY IF EXISTS qa_private_attachment_reads ON storage.objects;
CREATE POLICY qa_private_attachment_reads ON storage.objects AS RESTRICTIVE FOR SELECT TO anon,authenticated
USING(bucket_id<>'form-attachments' OR public.is_admin());
DROP POLICY IF EXISTS qa_target_upload_limits ON storage.objects;
CREATE POLICY qa_target_upload_limits ON storage.objects AS RESTRICTIVE FOR INSERT TO anon,authenticated WITH CHECK(
 bucket_id NOT IN ('avatars','course-thumbnails','uploads','form-attachments') OR public.is_admin()
 OR (bucket_id='avatars' AND split_part(name,'/',1)=auth.uid()::text)
 OR (bucket_id='form-attachments' AND EXISTS(SELECT 1 FROM public.forms f WHERE f.id::text=split_part(name,'/',1)
 AND f.status='published' AND (f.allow_anonymous OR auth.uid() IS NOT NULL)
 AND (f.opens_at IS NULL OR f.opens_at<=now()) AND (f.closes_at IS NULL OR f.closes_at>=now()))));
DROP POLICY IF EXISTS qa_target_update_limits ON storage.objects;
CREATE POLICY qa_target_update_limits ON storage.objects AS RESTRICTIVE FOR UPDATE TO anon,authenticated
USING(bucket_id NOT IN ('avatars','course-thumbnails','uploads','form-attachments') OR public.is_admin()
 OR (bucket_id='avatars' AND split_part(name,'/',1)=auth.uid()::text))
WITH CHECK(bucket_id NOT IN ('avatars','course-thumbnails','uploads','form-attachments') OR public.is_admin()
 OR (bucket_id='avatars' AND split_part(name,'/',1)=auth.uid()::text));
DROP POLICY IF EXISTS qa_target_delete_limits ON storage.objects;
CREATE POLICY qa_target_delete_limits ON storage.objects AS RESTRICTIVE FOR DELETE TO anon,authenticated
USING(bucket_id NOT IN ('avatars','course-thumbnails','uploads','form-attachments') OR public.is_admin()
 OR (bucket_id='avatars' AND split_part(name,'/',1)=auth.uid()::text));
COMMIT;
