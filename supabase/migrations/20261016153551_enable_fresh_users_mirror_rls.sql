-- Approved locally and in the isolated QA project only, 2026-10-16.
-- Complete mirror RLS for the clean installation path, without legacy
-- seed migrations. Never replace existing policies or change/depopulate data.
BEGIN;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
 IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='users' AND policyname='Users can read own users mirror') THEN
  CREATE POLICY "Users can read own users mirror" ON public.users FOR SELECT
   TO authenticated USING (id=auth.uid() OR public.is_admin());
 END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='users' AND policyname='Users can update own users mirror') THEN
  CREATE POLICY "Users can update own users mirror" ON public.users FOR UPDATE
   TO authenticated USING (id=auth.uid() OR public.is_admin())
   WITH CHECK (id=auth.uid() OR public.is_admin());
 END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='users' AND policyname='Admins can delete users mirror') THEN
  CREATE POLICY "Admins can delete users mirror" ON public.users FOR DELETE
   TO authenticated USING (public.is_admin());
 END IF;
END;
$$;
-- Direct INSERT remains unavailable. Trusted synchronization/service creates
-- mirror rows. The approved protected-fields trigger still controls authority.
COMMIT;
