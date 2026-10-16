-- Proposed additive repair. Local and isolated QA only, pending owner approval.
-- Only application tables already used by realtime subscriptions. Private row
-- visibility remains governed by existing RLS; server-only tables are excluded.
DO $$
DECLARE target text;
BEGIN
 IF NOT EXISTS(SELECT 1 FROM pg_publication WHERE pubname='supabase_realtime') THEN
  CREATE PUBLICATION supabase_realtime;
 END IF;
 FOREACH target IN ARRAY ARRAY[
  'profiles','auth_events','courses','lessons','enrollments','events','staff',
  'projects','blog','gallery','settings','notifications','notification_reads',
  'points_log','user_achievements','form_responses'
 ] LOOP
  IF NOT EXISTS(SELECT 1 FROM pg_publication_tables
    WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename=target) THEN
   EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I',target);
  END IF;
 END LOOP;
END $$;
