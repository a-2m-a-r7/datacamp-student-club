-- PROPOSED ONLY. Owner approval required before creating/applying a real migration.
-- Protect server-derived account fields in the legacy public.users mirror.
-- Keep existing ownership RLS and editable personal fields unchanged.
-- This is SECURITY INVOKER: do not turn it into a definer function, because
-- current_user must distinguish direct API writes from trusted definer sync.
BEGIN;
CREATE OR REPLACE FUNCTION public.protect_users_mirror_fields()
RETURNS trigger
LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
BEGIN
 IF current_user IN ('authenticated','anon') AND NOT public.is_admin() THEN
  IF NEW.id IS DISTINCT FROM OLD.id
   OR NEW.email IS DISTINCT FROM OLD.email
   OR NEW.role IS DISTINCT FROM OLD.role
   OR NEW.provider IS DISTINCT FROM OLD.provider
   OR NEW.member_id IS DISTINCT FROM OLD.member_id
   OR NEW.status IS DISTINCT FROM OLD.status
   OR NEW.total_points IS DISTINCT FROM OLD.total_points
   OR NEW.xp IS DISTINCT FROM OLD.xp
   OR NEW.level IS DISTINCT FROM OLD.level
   OR NEW.is_verified IS DISTINCT FROM OLD.is_verified
   OR NEW.created_at IS DISTINCT FROM OLD.created_at
   OR NEW.last_sign_in_at IS DISTINCT FROM OLD.last_sign_in_at THEN
   RAISE EXCEPTION 'Protected account mirror fields must be changed through verified server operations';
  END IF;
 END IF;
 RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.protect_users_mirror_fields() FROM PUBLIC,anon,authenticated;
DROP TRIGGER IF EXISTS qa_protect_users_mirror_fields ON public.users;
CREATE TRIGGER qa_protect_users_mirror_fields
 BEFORE UPDATE ON public.users
 FOR EACH ROW EXECUTE FUNCTION public.protect_users_mirror_fields();
COMMIT;

-- No backfill is performed: existing mirror drift must be reviewed separately.
-- full_name/avatar_url/photo_url/phone/faculty/university/last_seen_at remain
-- editable under existing own-row RLS. Server profile->mirror sync, trusted
-- service-role writes and verified active administrator operations remain valid.
