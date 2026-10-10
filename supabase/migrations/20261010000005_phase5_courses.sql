-- ============================================================================
-- Phase 5: Course system hardening
-- ============================================================================
-- Adds reliable course enrollment counters and complete storage policies for
-- course thumbnails. Apply after 20261010000004_phase2_schema_hardening.sql.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-thumbnails',
  'course-thumbnails',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Course thumbnails are publicly readable" ON storage.objects;
CREATE POLICY "Course thumbnails are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'course-thumbnails');

DROP POLICY IF EXISTS "Admins can upload course thumbnails" ON storage.objects;
CREATE POLICY "Admins can upload course thumbnails"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'course-thumbnails' AND public.is_admin());

DROP POLICY IF EXISTS "Admins can update course thumbnails" ON storage.objects;
CREATE POLICY "Admins can update course thumbnails"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'course-thumbnails' AND public.is_admin())
  WITH CHECK (bucket_id = 'course-thumbnails' AND public.is_admin());

DROP POLICY IF EXISTS "Admins can delete course thumbnails" ON storage.objects;
CREATE POLICY "Admins can delete course thumbnails"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'course-thumbnails' AND public.is_admin());

CREATE OR REPLACE FUNCTION public.refresh_course_enrolled_count(target_course_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.courses
  SET
    enrolled_count = (
      SELECT COUNT(*)::INTEGER
      FROM public.enrollments
      WHERE course_id = target_course_id
    ),
    updated_at = NOW()
  WHERE id = target_course_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.sync_course_enrolled_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.refresh_course_enrolled_count(NEW.course_id);
    RETURN NEW;
  END IF;

  IF TG_OP = 'DELETE' THEN
    PERFORM public.refresh_course_enrolled_count(OLD.course_id);
    RETURN OLD;
  END IF;

  IF TG_OP = 'UPDATE' AND NEW.course_id IS DISTINCT FROM OLD.course_id THEN
    PERFORM public.refresh_course_enrolled_count(OLD.course_id);
    PERFORM public.refresh_course_enrolled_count(NEW.course_id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_sync_course_enrolled_count ON public.enrollments;
CREATE TRIGGER trg_sync_course_enrolled_count
  AFTER INSERT OR UPDATE OR DELETE ON public.enrollments
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_course_enrolled_count();

-- Backfill counts for existing enrollments.
UPDATE public.courses c
SET enrolled_count = counts.total
FROM (
  SELECT course_id, COUNT(*)::INTEGER AS total
  FROM public.enrollments
  GROUP BY course_id
) counts
WHERE c.id = counts.course_id;

-- Realtime support for curriculum and progress views.
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.lessons;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.enrollments;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;
