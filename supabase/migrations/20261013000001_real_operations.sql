-- Apply after 20261013000000_missing_schema.sql. No existing records are deleted.
BEGIN;

CREATE OR REPLACE FUNCTION public.is_admin() RETURNS boolean
LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles p JOIN auth.users u ON u.id = p.id
    WHERE p.id = auth.uid() AND p.role IN ('admin','super_admin')
      AND p.status = 'active' AND u.email_confirmed_at IS NOT NULL);
$$;

CREATE OR REPLACE FUNCTION public.require_active_user() RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 IF auth.uid() IS NULL OR NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND status = 'active') THEN
  RAISE EXCEPTION 'Active authenticated account required';
 END IF;
 RETURN auth.uid();
END;
$$;

CREATE OR REPLACE FUNCTION public.protect_profile_fields() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
 IF current_user IN ('authenticated','anon') AND NOT public.is_admin() THEN
  IF NEW.role IS DISTINCT FROM OLD.role OR NEW.status IS DISTINCT FROM OLD.status
   OR NEW.total_points IS DISTINCT FROM OLD.total_points OR NEW.xp IS DISTINCT FROM OLD.xp
    OR NEW.is_verified IS DISTINCT FROM OLD.is_verified OR NEW.email IS DISTINCT FROM OLD.email
    OR NEW.level IS DISTINCT FROM OLD.level OR NEW.member_id IS DISTINCT FROM OLD.member_id THEN
   RAISE EXCEPTION 'Protected account fields must be changed through verified server operations';
  END IF;
 END IF;
 RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS qa_protect_profile_fields ON public.profiles;
DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON public.profiles;
CREATE TRIGGER qa_protect_profile_fields BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_profile_fields();

-- Replace permissive historical policies. Public data is exposed explicitly below.
DO $$
DECLARE t text; p record;
BEGIN
 FOREACH t IN ARRAY ARRAY['profiles','courses','lessons','enrollments','events','staff','projects','blog','gallery',
   'messages','notifications','settings','auth_events','audit_logs','points_log','user_achievements','certificates',
   'forms','form_questions','form_responses','form_answers','sync_logs','admin_emails'] LOOP
  EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename=t LOOP
   EXECUTE format('DROP POLICY %I ON public.%I',p.policyname,t);
  END LOOP;
  EXECUTE format('CREATE POLICY qa_admin ON public.%I FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin())',t);
 END LOOP;
END $$;
CREATE POLICY qa_profile_read ON public.profiles FOR SELECT TO authenticated USING (id=auth.uid());
CREATE POLICY qa_profile_update ON public.profiles FOR UPDATE TO authenticated USING (id=auth.uid()) WITH CHECK (id=auth.uid());
CREATE POLICY qa_course_read ON public.courses FOR SELECT TO anon,authenticated USING (is_published);
CREATE POLICY qa_lesson_read ON public.lessons FOR SELECT TO anon,authenticated USING (
 EXISTS (SELECT 1 FROM public.courses c WHERE c.id=course_id AND c.is_published));
CREATE POLICY qa_enrollment_read ON public.enrollments FOR SELECT TO authenticated USING (user_id=auth.uid());
CREATE POLICY qa_staff_read ON public.staff FOR SELECT TO anon,authenticated USING (true);
CREATE POLICY qa_project_read ON public.projects FOR SELECT TO anon,authenticated USING (status='active');
CREATE POLICY qa_project_submit ON public.projects FOR INSERT TO authenticated WITH CHECK (created_by=auth.uid() AND status='planning');
CREATE POLICY qa_project_own ON public.projects FOR SELECT TO authenticated USING (created_by=auth.uid());
CREATE POLICY qa_blog_read ON public.blog FOR SELECT TO anon,authenticated USING (status='published');
CREATE POLICY qa_gallery_read ON public.gallery FOR SELECT TO anon,authenticated USING (true);
CREATE POLICY qa_settings_read ON public.settings FOR SELECT TO anon,authenticated USING (key IN ('site','general','home_content','about_data'));
CREATE POLICY qa_messages_insert ON public.messages FOR INSERT TO anon,authenticated WITH CHECK (
 length(name) BETWEEN 1 AND 200 AND length(email) BETWEEN 3 AND 254
 AND length(message) BETWEEN 1 AND 10000 AND status='unread');
CREATE POLICY qa_notifications_read ON public.notifications FOR SELECT TO authenticated USING (user_id=auth.uid());
CREATE POLICY qa_notifications_update ON public.notifications FOR UPDATE TO authenticated USING (user_id=auth.uid()) WITH CHECK (user_id=auth.uid());
CREATE POLICY qa_notifications_insert ON public.notifications FOR INSERT TO authenticated WITH CHECK (user_id=auth.uid());
CREATE POLICY qa_auth_events_read ON public.auth_events FOR SELECT TO authenticated USING (user_id=auth.uid());
CREATE POLICY qa_auth_events_insert ON public.auth_events FOR INSERT TO authenticated WITH CHECK (user_id=auth.uid());
CREATE POLICY qa_points_read ON public.points_log FOR SELECT TO authenticated USING (user_id=auth.uid());
CREATE POLICY qa_badges_read ON public.user_achievements FOR SELECT TO authenticated USING (user_id=auth.uid());
CREATE POLICY qa_badges_insert ON public.user_achievements FOR INSERT TO authenticated WITH CHECK (user_id=auth.uid());
CREATE POLICY qa_certificates_read ON public.certificates FOR SELECT TO authenticated USING (user_id=auth.uid());
CREATE POLICY qa_forms_read ON public.forms FOR SELECT TO anon,authenticated USING (status='published');
CREATE POLICY qa_questions_read ON public.form_questions FOR SELECT TO anon,authenticated USING (
 EXISTS (SELECT 1 FROM public.forms f WHERE f.id=form_id AND f.status='published'));

-- Public event rows contain no registration emails or attendance lists.
CREATE OR REPLACE VIEW public.public_events AS SELECT id,title,date,location,description,registered_count,capacity,status,created_at
 FROM public.events WHERE status='published';
GRANT SELECT ON public.public_events TO anon,authenticated;

CREATE OR REPLACE FUNCTION public.public_stats() RETURNS jsonb
LANGUAGE sql SECURITY DEFINER STABLE SET search_path=public AS $$
 SELECT jsonb_build_object('members',(SELECT count(*) FROM profiles WHERE status='active'),
 'events',(SELECT count(*) FROM events WHERE status='published'),
 'projects',(SELECT count(*) FROM projects WHERE status='active'),
 'certificates',(SELECT count(*) FROM certificates));
$$;
CREATE OR REPLACE FUNCTION public.public_leaderboard(p_limit integer DEFAULT 50) RETURNS jsonb
LANGUAGE sql SECURITY DEFINER STABLE SET search_path=public AS $$
 SELECT COALESCE(jsonb_agg(x),'[]'::jsonb) FROM (
 SELECT id,full_name,avatar_url,faculty,member_id,total_points,level FROM profiles
 WHERE status='active' AND role IN ('user','member') ORDER BY total_points DESC,id LIMIT LEAST(GREATEST(p_limit,1),100)
 ) x;
$$;

CREATE OR REPLACE FUNCTION public.import_member_metadata(p_rows jsonb) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE r jsonb;
BEGIN
 IF NOT public.is_admin() THEN RAISE EXCEPTION 'Administrator required'; END IF;
 IF jsonb_typeof(p_rows)<>'array' OR jsonb_array_length(p_rows)>1000 THEN RAISE EXCEPTION 'Invalid import'; END IF;
 FOR r IN SELECT value FROM jsonb_array_elements(p_rows) LOOP
  IF length(r->>'full_name') NOT BETWEEN 1 AND 200 THEN RAISE EXCEPTION 'Invalid member name'; END IF;
  UPDATE profiles SET full_name=r->>'full_name',faculty=COALESCE(r->>'faculty',''),updated_at=now() WHERE id=(r->>'id')::uuid;
  IF NOT FOUND THEN RAISE EXCEPTION 'Member not found'; END IF;
 END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.assign_member_role(p_user_id uuid,p_role text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF NOT public.is_admin() OR p_role NOT IN ('user','admin') THEN RAISE EXCEPTION 'Administrator and valid role required'; END IF;
 IF p_user_id=auth.uid() AND p_role='user' THEN RAISE EXCEPTION 'Cannot revoke your current administrator access'; END IF;
 UPDATE profiles SET role=p_role,updated_at=now() WHERE id=p_user_id;
 IF NOT FOUND THEN RAISE EXCEPTION 'Member not found'; END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.award_points(p_user_id uuid,p_action text,p_description text,
 p_custom_points integer DEFAULT NULL,p_reference_id text DEFAULT NULL,p_reference_type text DEFAULT NULL) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE points integer; total integer; actor uuid; enrol record;
BEGIN
 actor:=public.require_active_user();
 IF actor<>p_user_id AND NOT public.is_admin() THEN RAISE EXCEPTION 'Cannot award points to another member'; END IF;
 SELECT COALESCE(total_points,0) INTO total FROM profiles WHERE id=p_user_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Member not found'; END IF;
 IF p_action IN ('ADMIN_BONUS','ADMIN_DEDUCT') THEN
  IF NOT public.is_admin() OR p_custom_points IS NULL OR abs(p_custom_points)>100000 THEN RAISE EXCEPTION 'Invalid admin award'; END IF;
  points:=p_custom_points;
 ELSE
  IF p_reference_id IS NULL THEN RAISE EXCEPTION 'Verified activity reference required'; END IF;
  IF p_action='COURSE_ENROLL' THEN
   IF NOT EXISTS (SELECT 1 FROM enrollments WHERE user_id=p_user_id AND course_id::text=p_reference_id) THEN RAISE EXCEPTION 'Enrollment required'; END IF;
   points:=5;
  ELSIF p_action='LESSON_COMPLETE' THEN
   IF NOT EXISTS (SELECT 1 FROM enrollments WHERE user_id=p_user_id AND p_reference_id=ANY(completed_lessons)) THEN RAISE EXCEPTION 'Completed lesson required'; END IF;
   SELECT COALESCE(points_reward,10) INTO points FROM lessons WHERE id::text=p_reference_id;
  ELSIF p_action='COURSE_COMPLETE' THEN
   IF NOT EXISTS (SELECT 1 FROM enrollments WHERE user_id=p_user_id AND course_id::text=p_reference_id AND is_completed) THEN RAISE EXCEPTION 'Completed course required'; END IF;
   SELECT COALESCE(points_reward,500) INTO points FROM courses WHERE id::text=p_reference_id;
  ELSIF p_action='EVENT_REGISTER' THEN
   IF NOT EXISTS (SELECT 1 FROM events, jsonb_array_elements(registrations) r WHERE events.id::text=p_reference_id AND r->>'userId'=p_user_id::text) THEN RAISE EXCEPTION 'Event registration required'; END IF;
   points:=5;
  ELSIF p_action='PROJECT_SUBMIT' THEN
   IF NOT EXISTS (SELECT 1 FROM projects WHERE id::text=p_reference_id AND created_by=p_user_id) THEN RAISE EXCEPTION 'Project submission required'; END IF;
   points:=100;
  ELSE
   -- Unverified client events cannot mint XP. Dedicated server assessments can be added later.
   RAISE EXCEPTION 'This reward requires a verified server activity';
  END IF;
  IF EXISTS (SELECT 1 FROM points_log WHERE user_id=p_user_id AND action=p_action AND reference_id=p_reference_id) THEN
   RETURN jsonb_build_object('points',0,'newTotal',total);
  END IF;
 END IF;
 IF points IS NULL THEN RAISE EXCEPTION 'Activity not found'; END IF;
 total:=GREATEST(0,total+points);
 INSERT INTO points_log(user_id,points,action,description,reference_id,reference_type)
 VALUES(p_user_id,points,p_action,COALESCE(p_description,''),p_reference_id,p_reference_type);
 UPDATE profiles SET total_points=total,xp=total,updated_at=now() WHERE id=p_user_id;
 RETURN jsonb_build_object('points',points,'newTotal',total);
END;
$$;

CREATE OR REPLACE FUNCTION public.enroll_course(p_course_id uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE uid uuid; row public.enrollments;
BEGIN
 uid:=public.require_active_user();
 IF NOT EXISTS(SELECT 1 FROM courses WHERE id=p_course_id AND is_published AND NOT is_locked) THEN RAISE EXCEPTION 'Course unavailable'; END IF;
 INSERT INTO enrollments(user_id,course_id) VALUES(uid,p_course_id) ON CONFLICT(user_id,course_id) DO NOTHING;
 SELECT * INTO row FROM enrollments WHERE user_id=uid AND course_id=p_course_id;
 PERFORM public.award_points(uid,'COURSE_ENROLL','Course enrollment',NULL,p_course_id::text,'course');
 RETURN to_jsonb(row);
END;
$$;
CREATE OR REPLACE FUNCTION public.complete_course_lesson(p_course_id uuid,p_lesson_id uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE uid uuid; row public.enrollments; total integer; done integer; awarded jsonb; bonus jsonb;
BEGIN
 uid:=public.require_active_user();
 IF NOT EXISTS(SELECT 1 FROM lessons WHERE id=p_lesson_id AND course_id=p_course_id) THEN RAISE EXCEPTION 'Lesson not found'; END IF;
 SELECT * INTO row FROM enrollments WHERE user_id=uid AND course_id=p_course_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Enroll before completing lessons'; END IF;
 IF EXISTS(SELECT 1 FROM lessons WHERE id=p_lesson_id AND jsonb_array_length(quiz_questions)>0)
  AND COALESCE((row.quiz_scores->>p_lesson_id::text)::integer,0)<80 THEN RAISE EXCEPTION 'Pass the assessment before completing this lesson'; END IF;
 IF NOT p_lesson_id::text=ANY(row.completed_lessons) THEN row.completed_lessons:=array_append(row.completed_lessons,p_lesson_id::text); END IF;
 SELECT count(*) INTO total FROM lessons WHERE course_id=p_course_id;
 SELECT count(*) INTO done FROM lessons WHERE course_id=p_course_id AND id::text=ANY(row.completed_lessons);
 UPDATE enrollments SET completed_lessons=row.completed_lessons,progress_percent=LEAST(100,round(done*100.0/GREATEST(total,1))),
 is_completed=(total>0 AND done=total),status=CASE WHEN total>0 AND done=total THEN 'completed' ELSE 'active' END,
 completed_at=CASE WHEN total>0 AND done=total THEN COALESCE(completed_at,now()) ELSE NULL END,
 last_accessed_at=now(),last_lesson_id=p_lesson_id::text WHERE id=row.id RETURNING * INTO row;
 awarded:=public.award_points(uid,'LESSON_COMPLETE','Completed lesson',NULL,p_lesson_id::text,'lesson');
 IF row.is_completed THEN bonus:=public.award_points(uid,'COURSE_COMPLETE','Completed course',NULL,p_course_id::text,'course'); END IF;
 RETURN jsonb_build_object('enrollment',to_jsonb(row),'isCourseFinished',row.is_completed,'pointsAwarded',
 COALESCE((awarded->>'points')::int,0)+COALESCE((bonus->>'points')::int,0));
END;
$$;

CREATE OR REPLACE FUNCTION public.register_for_event(target_event_id uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE uid uuid; row public.events; registration jsonb;
BEGIN
 uid:=public.require_active_user();
 SELECT * INTO row FROM events WHERE id=target_event_id AND status='published' FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Event unavailable'; END IF;
 IF EXISTS(SELECT 1 FROM jsonb_array_elements(COALESCE(row.registrations,'[]')) r WHERE r->>'userId'=uid::text) THEN RAISE EXCEPTION 'Already registered'; END IF;
 IF row.registered_count>=row.capacity THEN RAISE EXCEPTION 'Event is full'; END IF;
 registration:=jsonb_build_object('userId',uid,'eventId',target_event_id,'eventTitle',row.title,'registeredAt',now(),'qrCode','REG-'||target_event_id||'-'||uid);
 UPDATE events SET registrations=COALESCE(registrations,'[]')||jsonb_build_array(registration),registered_count=registered_count+1 WHERE id=target_event_id;
 RETURN registration;
END;
$$;
CREATE OR REPLACE FUNCTION public.check_in_event(p_event_id uuid,p_ticket text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE row public.events; r jsonb; result jsonb; updated jsonb:='[]'; matched boolean:=false;
BEGIN
 IF NOT public.is_admin() THEN RAISE EXCEPTION 'Administrator required'; END IF;
 SELECT * INTO row FROM events WHERE id=p_event_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Event not found'; END IF;
 FOR r IN SELECT value FROM jsonb_array_elements(COALESCE(row.registrations,'[]')) LOOP
  IF r->>'qrCode'=p_ticket OR EXISTS(SELECT 1 FROM profiles p WHERE p.id::text=r->>'userId' AND p.member_id=p_ticket) THEN
   IF COALESCE(r->>'checkedInAt','')<>'' THEN RAISE EXCEPTION 'Ticket already checked in'; END IF;
   r:=r||jsonb_build_object('checkedInAt',now()); matched:=true; result:=r;
  END IF;
  updated:=updated||jsonb_build_array(r);
 END LOOP;
 IF NOT matched THEN RAISE EXCEPTION 'Ticket is not registered for this event'; END IF;
 UPDATE events SET registrations=updated WHERE id=p_event_id;
 RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.verify_certificate(p_code text) RETURNS jsonb
LANGUAGE sql SECURITY DEFINER STABLE SET search_path=public AS $$
 SELECT jsonb_build_object('id',id,'user_full_name',user_full_name,'course_title',course_title,'event_title',event_title,
 'type',type,'issued_at',issued_at,'verification_code',verification_code) FROM certificates
 WHERE verification_code=upper(trim(p_code)) LIMIT 1;
$$;
CREATE OR REPLACE FUNCTION public.issue_course_certificate(p_course_id uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE uid uuid; row public.certificates;
BEGIN
 uid:=public.require_active_user();
 PERFORM 1 FROM enrollments WHERE user_id=uid AND course_id=p_course_id AND is_completed FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Course completion required'; END IF;
 SELECT * INTO row FROM certificates WHERE user_id=uid AND course_id=p_course_id LIMIT 1;
 IF NOT FOUND THEN
  INSERT INTO certificates(user_id,user_full_name,course_id,course_title,type,verification_code)
  SELECT uid,p.full_name,c.id,c.title,'course','DC-'||upper(replace(gen_random_uuid()::text,'-',''))
  FROM profiles p,courses c WHERE p.id=uid AND c.id=p_course_id RETURNING * INTO row;
 END IF;
 RETURN to_jsonb(row);
END;
$$;

-- Explicit execute grants; PostgreSQL otherwise gives PUBLIC execute by default.
REVOKE ALL ON FUNCTION public.require_active_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.assign_member_role(uuid,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.assign_member_role(uuid,text) TO authenticated;
REVOKE ALL ON FUNCTION public.import_member_metadata(jsonb),public.award_points(uuid,text,text,integer,text,text),
 public.enroll_course(uuid),public.complete_course_lesson(uuid,uuid),public.register_for_event(uuid),
 public.check_in_event(uuid,text),public.issue_course_certificate(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.require_active_user(),public.import_member_metadata(jsonb),public.award_points(uuid,text,text,integer,text,text),
 public.enroll_course(uuid),public.complete_course_lesson(uuid,uuid),public.register_for_event(uuid),
 public.check_in_event(uuid,text),public.issue_course_certificate(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.public_stats(),public.public_leaderboard(integer),public.verify_certificate(text) TO anon,authenticated;
COMMIT;
