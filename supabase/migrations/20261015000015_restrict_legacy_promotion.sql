-- BUG-002: restrict the legacy account-promotion helper to the trusted server.
-- Approved for repository/local testing only; production application is separate.
-- Does not modify existing users, tables, RLS, or the helper's implementation.
-- The QA --candidate harness applies this ONLY to an ephemeral in-memory database.
BEGIN;
DO $$
BEGIN
 IF to_regprocedure('public.promote_admin_by_email(text)') IS NOT NULL THEN
  REVOKE ALL ON FUNCTION public.promote_admin_by_email(text) FROM PUBLIC, anon, authenticated;
  GRANT EXECUTE ON FUNCTION public.promote_admin_by_email(text) TO service_role;
 END IF;
END;
$$;
COMMIT;
