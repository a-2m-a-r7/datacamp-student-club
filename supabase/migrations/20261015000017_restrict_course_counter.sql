-- Owner approved this appended migration and local verification only on 2026-10-15.
-- The enrollment counter is maintained by trusted triggers, not public RPC.
BEGIN;
DO $$
BEGIN
 IF to_regprocedure('public.refresh_course_enrolled_count(uuid)') IS NOT NULL THEN
  REVOKE ALL ON FUNCTION public.refresh_course_enrolled_count(uuid)
   FROM PUBLIC,anon,authenticated;
  GRANT EXECUTE ON FUNCTION public.refresh_course_enrolled_count(uuid) TO service_role;
 END IF;
END;
$$;
COMMIT;
