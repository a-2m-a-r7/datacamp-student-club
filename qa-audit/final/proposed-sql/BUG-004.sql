-- PROPOSED ONLY. Owner approval required before creating/applying a real migration.
-- Derived enrollment counters are maintained by trusted triggers, not public RPC.
-- Preserve function body and existing count-maintenance triggers unchanged.
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

-- sync_course_enrolled_count() is SECURITY DEFINER and owned by the migration
-- owner. Its trigger calls still execute as that owner, which retains EXECUTE.
-- Existing enroll_course/complete_course_lesson/award_points definer routines
-- retain their current authorization and trigger behavior.
