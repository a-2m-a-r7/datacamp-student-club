BEGIN;
DROP POLICY IF EXISTS qa_badges_insert ON public.user_achievements;
CREATE OR REPLACE FUNCTION public.refresh_badges() RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE uid uuid; result jsonb;
BEGIN
 uid:=public.require_active_user();
 WITH eligible AS (
 SELECT 'first_steps'::text AS id,'First Steps'::text AS name,'🥇'::text AS icon,'#39FF14'::text AS color,'Completed your first lesson'::text AS description
 WHERE EXISTS(SELECT 1 FROM enrollments WHERE user_id=uid AND cardinality(completed_lessons)>0)
 UNION ALL SELECT 'bookworm','Bookworm','📚','#3B82F6','Completed 5 courses' WHERE (SELECT count(*) FROM enrollments WHERE user_id=uid AND is_completed)>=5
 UNION ALL SELECT 'knowledge','Knowledge Seeker','💡','#8B5CF6','Enrolled in 3+ courses' WHERE (SELECT count(*) FROM enrollments WHERE user_id=uid)>=3
 UNION ALL SELECT 'speed_learner','Speed Learner','⚡','#EF4444','Completed a course in 7 days' WHERE EXISTS(SELECT 1 FROM enrollments WHERE user_id=uid AND is_completed AND completed_at-enrolled_at<=interval '7 days')
 UNION ALL SELECT 'perfectionist','Perfectionist','⭐','#F59E0B','5 perfect quiz scores' WHERE
 (SELECT count(*) FROM enrollments e CROSS JOIN LATERAL jsonb_each_text(e.quiz_scores) s WHERE e.user_id=uid AND s.value='100')>=5
 ), inserted AS (
 INSERT INTO user_achievements(user_id,badge_id,badge_name,badge_icon,badge_color,description,is_new)
 SELECT uid,id,name,icon,color,description,true FROM eligible ON CONFLICT(user_id,badge_id) DO NOTHING RETURNING *
 ) SELECT COALESCE(jsonb_agg(inserted),'[]') INTO result FROM inserted;
 RETURN result;
END;
$$;
CREATE OR REPLACE FUNCTION public.acknowledge_badges() RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 PERFORM public.require_active_user(); UPDATE user_achievements SET is_new=false WHERE user_id=auth.uid();
END;
$$;
REVOKE ALL ON FUNCTION public.refresh_badges(),public.acknowledge_badges() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.refresh_badges(),public.acknowledge_badges() TO authenticated;
COMMIT;
