BEGIN;
CREATE TABLE IF NOT EXISTS public.member_cards(user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,token uuid NOT NULL UNIQUE DEFAULT gen_random_uuid());
ALTER TABLE public.member_cards ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION public.get_own_member_card() RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE uid uuid; card_token uuid;
BEGIN
 uid:=public.require_active_user();
 IF NOT EXISTS(SELECT 1 FROM auth.users WHERE id=uid AND email_confirmed_at IS NOT NULL) THEN RAISE EXCEPTION 'Verify your email before issuing a card'; END IF;
 INSERT INTO member_cards(user_id) VALUES(uid) ON CONFLICT(user_id) DO NOTHING;
 SELECT token INTO card_token FROM member_cards WHERE user_id=uid;
 RETURN jsonb_build_object('token',card_token);
END;$$;
CREATE OR REPLACE FUNCTION public.verify_member_card(p_token uuid) RETURNS jsonb LANGUAGE sql SECURITY DEFINER STABLE SET search_path=public AS $$
 SELECT COALESCE((SELECT jsonb_build_object('valid',true,'member_id',p.member_id) FROM member_cards c JOIN profiles p ON p.id=c.user_id JOIN auth.users u ON u.id=p.id WHERE c.token=p_token AND p.status='active' AND u.email_confirmed_at IS NOT NULL),' {"valid":false}'::jsonb);
$$;
REVOKE ALL ON FUNCTION public.get_own_member_card() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.get_own_member_card() TO authenticated;
REVOKE ALL ON FUNCTION public.verify_member_card(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_member_card(uuid) TO anon,authenticated;
CREATE OR REPLACE FUNCTION public.resolve_member_card_ticket(p_ticket text) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE m text[]; member_number text;
BEGIN
 IF NOT public.is_admin() THEN RAISE EXCEPTION 'Administrator required'; END IF;
 m:=regexp_match(p_ticket,'/verify-membership/([0-9a-fA-F-]{36})');
 IF m IS NULL THEN RETURN p_ticket; END IF;
 SELECT p.member_id INTO member_number FROM member_cards c JOIN profiles p ON p.id=c.user_id WHERE c.token=m[1]::uuid AND p.status='active';
 IF member_number IS NULL THEN RAISE EXCEPTION 'Invalid membership card'; END IF;
 RETURN member_number;
END;$$;
REVOKE ALL ON FUNCTION public.resolve_member_card_ticket(text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.resolve_member_card_ticket(text) TO authenticated;
COMMIT;
