BEGIN;
CREATE OR REPLACE FUNCTION public.public_leaderboard(p_limit integer DEFAULT 50) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path=public AS $$
DECLARE result jsonb;
BEGIN
 IF NOT public.is_admin() THEN RAISE EXCEPTION 'Administrator required'; END IF;
 SELECT COALESCE(jsonb_agg(x),'[]'::jsonb) INTO result FROM (
  SELECT id,full_name,avatar_url,faculty,member_id,total_points,level FROM profiles
  WHERE status='active' AND role IN ('user','member') ORDER BY total_points DESC,id
  LIMIT LEAST(GREATEST(p_limit,1),100)
 ) x;
 RETURN result;
END;
$$;
REVOKE ALL ON FUNCTION public.public_leaderboard(integer) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.public_leaderboard(integer) TO authenticated;
COMMIT;
