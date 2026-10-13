BEGIN;
CREATE OR REPLACE FUNCTION public.admin_growth() RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE result jsonb;
BEGIN
 IF NOT public.is_admin() THEN RAISE EXCEPTION 'Administrator required'; END IF;
 WITH members AS (SELECT date_trunc('month',created_at) AS month,count(*) AS users FROM profiles GROUP BY 1),
 events AS (SELECT date_trunc('month',created_at) AS month,count(*) AS events FROM public.events GROUP BY 1),
 points AS (SELECT to_char(COALESCE(m.month,e.month),'YYYY-MM') AS name,COALESCE(m.users,0) AS users,COALESCE(e.events,0) AS events
 FROM members m FULL JOIN events e ON m.month=e.month ORDER BY COALESCE(m.month,e.month))
 SELECT COALESCE(jsonb_agg(points),'[]') INTO result FROM points;
 RETURN result;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_growth() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.admin_growth() TO authenticated;
COMMIT;
