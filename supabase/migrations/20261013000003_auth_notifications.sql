BEGIN;
CREATE TABLE IF NOT EXISTS public.notification_reads (
 user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 notification_id uuid NOT NULL REFERENCES public.notifications(id) ON DELETE CASCADE,
 read_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(user_id,notification_id)
);
ALTER TABLE public.notification_reads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS qa_reads ON public.notification_reads;
CREATE POLICY qa_reads ON public.notification_reads FOR SELECT TO authenticated USING (user_id=auth.uid());
CREATE OR REPLACE FUNCTION public.get_notifications() RETURNS jsonb
LANGUAGE sql SECURITY DEFINER STABLE SET search_path=public AS $$
 SELECT COALESCE(jsonb_agg(x ORDER BY created_at DESC),'[]') FROM (
 SELECT n.id,n.user_id,n.title,n.message,n.type,n.reference_id,n.reference_type,n.created_at,
  (n.read AND n.user_id=auth.uid()) OR EXISTS(SELECT 1 FROM notification_reads r WHERE r.notification_id=n.id AND r.user_id=auth.uid()) AS read
 FROM notifications n WHERE auth.uid() IS NOT NULL AND (n.user_id=auth.uid() OR n.user_id IS NULL)
 ) x;
$$;
CREATE OR REPLACE FUNCTION public.read_notifications(p_id uuid DEFAULT NULL) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 PERFORM public.require_active_user();
 IF p_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM notifications WHERE id=p_id AND (user_id=auth.uid() OR user_id IS NULL)) THEN
  RAISE EXCEPTION 'Notification not found';
 END IF;
 INSERT INTO notification_reads(user_id,notification_id) SELECT auth.uid(),id FROM notifications
 WHERE (user_id=auth.uid() OR user_id IS NULL) AND (p_id IS NULL OR id=p_id)
 ON CONFLICT(user_id,notification_id) DO NOTHING;
END;
$$;
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 INSERT INTO profiles(id,email,full_name,avatar_url,role,provider,member_id,status,total_points,xp,is_verified)
 VALUES(NEW.id,COALESCE(NEW.email,''),COALESCE(NEW.raw_user_meta_data->>'full_name',NEW.raw_user_meta_data->>'name',''),
 COALESCE(NEW.raw_user_meta_data->>'avatar_url',''),'user',COALESCE(NEW.raw_app_meta_data->>'provider','email'),
 'DC-'||upper(replace(NEW.id::text,'-','')),'active',0,0,NEW.email_confirmed_at IS NOT NULL)
 ON CONFLICT(id) DO NOTHING;
 RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
CREATE OR REPLACE FUNCTION public.sync_verified_identity() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 UPDATE profiles SET email=COALESCE(NEW.email,''),is_verified=NEW.email_confirmed_at IS NOT NULL,updated_at=now() WHERE id=NEW.id;
 RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS qa_verified_identity ON auth.users;
CREATE TRIGGER qa_verified_identity AFTER UPDATE OF email,email_confirmed_at ON auth.users FOR EACH ROW EXECUTE FUNCTION public.sync_verified_identity();
REVOKE ALL ON FUNCTION public.get_notifications(),public.read_notifications(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.get_notifications(),public.read_notifications(uuid) TO authenticated;
GRANT SELECT ON public.notification_reads TO authenticated;
COMMIT;
