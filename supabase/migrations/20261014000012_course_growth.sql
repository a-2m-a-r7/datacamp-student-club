BEGIN;

-- Bound catalog reads and support activity lookups as the club grows.
CREATE INDEX IF NOT EXISTS dc_course_catalog ON public.courses(created_at DESC,id DESC);
CREATE INDEX IF NOT EXISTS dc_published_catalog ON public.courses(is_published,created_at DESC,id DESC);
CREATE INDEX IF NOT EXISTS dc_course_lessons ON public.lessons(course_id,position,id);
CREATE INDEX IF NOT EXISTS dc_course_enrollments ON public.enrollments(course_id);
CREATE INDEX IF NOT EXISTS dc_member_enrollments ON public.enrollments(user_id,enrolled_at DESC,id);
CREATE INDEX IF NOT EXISTS dc_member_certificates ON public.certificates(user_id,issued_at DESC,id);
CREATE INDEX IF NOT EXISTS dc_reward_lookup ON public.points_log(user_id,action,reference_id);
ALTER TABLE public.courses ALTER COLUMN is_published SET DEFAULT false;

CREATE OR REPLACE FUNCTION public.list_course_catalog(
 p_limit integer DEFAULT 24,p_after timestamptz DEFAULT NULL,p_after_id uuid DEFAULT NULL,
 p_search text DEFAULT '',p_category text DEFAULT NULL,p_level text DEFAULT NULL,p_include_drafts boolean DEFAULT false
) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path=public AS $$
DECLARE page_size integer:=LEAST(100,GREATEST(1,COALESCE(p_limit,24))); items jsonb; more boolean; last_item jsonb;
BEGIN
 IF (p_after IS NULL)<>(p_after_id IS NULL) THEN RAISE EXCEPTION 'Both cursor values are required'; END IF;
 IF length(COALESCE(p_search,''))>200 THEN RAISE EXCEPTION 'Search is limited to 200 characters'; END IF;
 SELECT COALESCE(jsonb_agg(to_jsonb(c) ORDER BY c.created_at DESC,c.id DESC),'[]'::jsonb) INTO items FROM (
  SELECT * FROM courses WHERE (COALESCE(p_include_drafts,false) OR is_published)
   AND (p_after IS NULL OR (created_at,id)<(p_after,p_after_id))
   AND (p_category IS NULL OR category=p_category) AND (p_level IS NULL OR level=p_level)
   AND (COALESCE(trim(p_search),'')='' OR strpos(lower(concat_ws(' ',title,short_description,instructor_name,array_to_string(tags,' '))),lower(trim(p_search)))>0)
  ORDER BY created_at DESC,id DESC LIMIT page_size+1
 ) c;
 more:=jsonb_array_length(items)>page_size;
 IF more THEN items:=items-page_size; END IF;
 last_item:=items->(jsonb_array_length(items)-1);
 RETURN jsonb_build_object('items',items,'hasMore',more,'nextCursor',CASE WHEN more THEN
  jsonb_build_object('createdAt',last_item->>'created_at','id',last_item->>'id') ELSE NULL END);
END;$$;
REVOKE ALL ON FUNCTION public.list_course_catalog(integer,timestamptz,uuid,text,text,text,boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_course_catalog(integer,timestamptz,uuid,text,text,text,boolean) TO anon,authenticated;

-- One bounded row per member, rather than a growing request/event log.
CREATE TABLE IF NOT EXISTS public.course_request_windows (
 user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 window_started timestamptz NOT NULL, requests integer NOT NULL
);
ALTER TABLE public.course_request_windows ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.course_request_windows FROM anon,authenticated;

CREATE OR REPLACE FUNCTION public.lock_course_activity(p_course_id uuid) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE uid uuid; accepted uuid;
BEGIN
 uid:=public.require_active_user();
 PERFORM set_config('lock_timeout','5s',true);
 -- Lock the profile BEFORE the enrollment for every entry point. This avoids
 -- cross-course deadlocks between a completion and a separate points request.
 PERFORM 1 FROM profiles WHERE id=uid FOR UPDATE;
 PERFORM public.require_active_user();
 INSERT INTO course_request_windows(user_id,window_started,requests) VALUES(uid,clock_timestamp(),1)
 ON CONFLICT(user_id) DO UPDATE SET
  requests=CASE WHEN course_request_windows.window_started<=clock_timestamp()-interval '1 minute' THEN 1 ELSE course_request_windows.requests+1 END,
  window_started=CASE WHEN course_request_windows.window_started<=clock_timestamp()-interval '1 minute' THEN clock_timestamp() ELSE course_request_windows.window_started END
 WHERE course_request_windows.window_started<=clock_timestamp()-interval '1 minute' OR course_request_windows.requests<120
 RETURNING user_id INTO accepted;
 IF accepted IS NULL THEN RAISE SQLSTATE 'PT429' USING MESSAGE='Too many course requests. Retry in one minute.'; END IF;
 -- Learners can work concurrently. Curriculum edits exclusively lock only
 -- this course, so completion validates one consistent lesson set.
 PERFORM pg_advisory_xact_lock_shared(hashtextextended('datacamp-course:'||p_course_id::text,0));
 IF NOT EXISTS(SELECT 1 FROM courses WHERE id=p_course_id AND is_published AND NOT is_locked) THEN RAISE EXCEPTION 'Course unavailable'; END IF;
 RETURN uid;
END;$$;
REVOKE ALL ON FUNCTION public.lock_course_activity(uuid) FROM PUBLIC,anon,authenticated,service_role;

CREATE OR REPLACE FUNCTION public.lock_course_curriculum() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE cid uuid; q jsonb; correct text;
BEGIN
 FOR cid IN SELECT DISTINCT v FROM unnest(ARRAY[
  CASE WHEN TG_OP<>'INSERT' THEN OLD.course_id END,CASE WHEN TG_OP<>'DELETE' THEN NEW.course_id END
 ]) v WHERE v IS NOT NULL ORDER BY v LOOP
  PERFORM pg_advisory_xact_lock(hashtextextended('datacamp-course:'||cid::text,0));
 END LOOP;
 IF TG_OP<>'DELETE' AND NEW.type='quiz' THEN
  IF COALESCE(jsonb_typeof(NEW.quiz_questions),'null')<>'array' OR jsonb_array_length(NEW.quiz_questions) NOT BETWEEN 1 AND 100 THEN RAISE EXCEPTION 'A quiz needs 1 to 100 valid questions'; END IF;
  IF (SELECT count(DISTINCT value->>'id') FROM jsonb_array_elements(NEW.quiz_questions))<>jsonb_array_length(NEW.quiz_questions) THEN RAISE EXCEPTION 'Quiz question IDs must be unique'; END IF;
  FOR q IN SELECT value FROM jsonb_array_elements(NEW.quiz_questions) LOOP
   correct:=COALESCE(q->>'correctIndex',q->>'correctAnswer');
   IF COALESCE(trim(q->>'id'),'')='' OR COALESCE(trim(q->>'question'),'')='' OR COALESCE(jsonb_typeof(q->'options'),'null')<>'array' OR jsonb_array_length(q->'options') NOT BETWEEN 2 AND 10 THEN RAISE EXCEPTION 'Quiz questions and options are required'; END IF;
   IF correct IS NULL OR correct !~ '^\d$' THEN RAISE EXCEPTION 'A valid correct answer is required'; END IF;
   IF correct::integer>=jsonb_array_length(q->'options') OR EXISTS(SELECT 1 FROM jsonb_array_elements(q->'options') o WHERE jsonb_typeof(o)<>'string' OR trim(o#>>'{}')='') THEN RAISE EXCEPTION 'A valid correct answer and nonempty options are required'; END IF;
  END LOOP;
 END IF;
 IF TG_OP='DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;$$;
REVOKE ALL ON FUNCTION public.lock_course_curriculum() FROM PUBLIC,anon,authenticated,service_role;
DROP TRIGGER IF EXISTS dc_lock_curriculum ON public.lessons;
CREATE TRIGGER dc_lock_curriculum BEFORE INSERT OR UPDATE OR DELETE ON public.lessons FOR EACH ROW EXECUTE FUNCTION public.lock_course_curriculum();

CREATE OR REPLACE FUNCTION public.adjust_course_counters() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE old_course uuid; new_course uuid; cid uuid; delta integer;
BEGIN
 IF TG_OP<>'INSERT' THEN old_course:=OLD.course_id; END IF;
 IF TG_OP<>'DELETE' THEN new_course:=NEW.course_id; END IF;
 IF TG_OP='UPDATE' AND old_course IS NOT DISTINCT FROM new_course THEN RETURN NEW; END IF;
 FOR cid IN SELECT DISTINCT v FROM unnest(ARRAY[old_course,new_course]) v WHERE v IS NOT NULL ORDER BY v LOOP
  delta:=(CASE WHEN cid=new_course THEN 1 ELSE 0 END)-(CASE WHEN cid=old_course THEN 1 ELSE 0 END);
  IF TG_TABLE_NAME='lessons' THEN
   UPDATE courses SET total_lessons=GREATEST(0,COALESCE(total_lessons,0)+delta) WHERE id=cid;
  ELSE
   UPDATE courses SET enrolled_count=GREATEST(0,COALESCE(enrolled_count,0)+delta) WHERE id=cid;
  END IF;
 END LOOP;
 IF TG_OP='DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;$$;
REVOKE ALL ON FUNCTION public.adjust_course_counters() FROM PUBLIC,anon,authenticated,service_role;
-- Repair counts from genuine rows; do not create or delete learning records.
UPDATE courses c SET total_lessons=(SELECT count(*) FROM lessons l WHERE l.course_id=c.id),
 enrolled_count=(SELECT count(*) FROM enrollments e WHERE e.course_id=c.id);
DROP TRIGGER IF EXISTS dc_lesson_counts ON public.lessons;
CREATE TRIGGER dc_lesson_counts AFTER INSERT OR DELETE OR UPDATE OF course_id ON public.lessons FOR EACH ROW EXECUTE FUNCTION public.adjust_course_counters();
DROP TRIGGER IF EXISTS dc_enrollment_counts ON public.enrollments;
CREATE TRIGGER dc_enrollment_counts AFTER INSERT OR DELETE OR UPDATE OF course_id ON public.enrollments FOR EACH ROW EXECUTE FUNCTION public.adjust_course_counters();

CREATE OR REPLACE FUNCTION public.guard_course_metadata() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF TG_OP='INSERT' THEN NEW.total_lessons:=0; NEW.enrolled_count:=0;
 ELSIF pg_trigger_depth()=1 THEN NEW.total_lessons:=OLD.total_lessons; NEW.enrolled_count:=OLD.enrolled_count; END IF;
 IF TG_OP='UPDATE' AND NEW.is_published AND NOT OLD.is_published AND NOT EXISTS(SELECT 1 FROM lessons WHERE course_id=NEW.id) THEN
  RAISE EXCEPTION 'Add course lessons before publishing';
 END IF;
 RETURN NEW;
END;$$;
REVOKE ALL ON FUNCTION public.guard_course_metadata() FROM PUBLIC,anon,authenticated,service_role;
DROP TRIGGER IF EXISTS dc_course_metadata ON public.courses;
CREATE TRIGGER dc_course_metadata BEFORE INSERT OR UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.guard_course_metadata();

CREATE OR REPLACE FUNCTION public.ensure_completed_course_certificate(p_user_id uuid,p_course_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE enrol public.enrollments; cert public.certificates;
BEGIN
 SELECT * INTO enrol FROM enrollments WHERE user_id=p_user_id AND course_id=p_course_id FOR UPDATE;
 IF NOT FOUND OR NOT enrol.is_completed THEN RAISE EXCEPTION 'Course completion required'; END IF;
 SELECT * INTO cert FROM certificates WHERE user_id=p_user_id AND course_id=p_course_id AND type='course';
 IF NOT FOUND THEN
  IF NOT EXISTS(SELECT 1 FROM lessons WHERE course_id=p_course_id) OR EXISTS(
   SELECT 1 FROM lessons l WHERE l.course_id=p_course_id AND (
    NOT (l.id::text=ANY(COALESCE(enrol.completed_lessons,'{}'::text[]))) OR
    (l.type='quiz' AND (COALESCE(jsonb_typeof(l.quiz_questions),'null')<>'array' OR jsonb_array_length(l.quiz_questions)=0)) OR
    (jsonb_array_length(COALESCE(l.quiz_questions,'[]'::jsonb))>0 AND COALESCE((enrol.quiz_scores->>l.id::text)::integer,0)<80)
   )
  ) THEN RAISE EXCEPTION 'Complete every lesson and pass all assessments before receiving a certificate'; END IF;
  INSERT INTO certificates(user_id,user_full_name,course_id,course_title,type,verification_code)
   SELECT p_user_id,p.full_name,c.id,c.title,'course','DC-'||upper(replace(gen_random_uuid()::text,'-',''))
   FROM profiles p JOIN courses c ON c.id=p_course_id WHERE p.id=p_user_id RETURNING * INTO cert;
  IF cert.id IS NULL THEN RAISE EXCEPTION 'Certificate recipient or course not found'; END IF;
 END IF;
 UPDATE enrollments SET certificate_id=cert.id WHERE id=enrol.id AND certificate_id IS DISTINCT FROM cert.id;
 RETURN to_jsonb(cert);
END;$$;
REVOKE ALL ON FUNCTION public.ensure_completed_course_certificate(uuid,uuid) FROM PUBLIC,anon,authenticated,service_role;

CREATE OR REPLACE FUNCTION public.enroll_course(p_course_id uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE uid uuid; enrol public.enrollments;
BEGIN
 uid:=public.lock_course_activity(p_course_id);
 IF NOT EXISTS(SELECT 1 FROM lessons WHERE course_id=p_course_id) THEN RAISE EXCEPTION 'Course curriculum is not ready'; END IF;
 INSERT INTO enrollments(user_id,course_id) VALUES(uid,p_course_id) ON CONFLICT(user_id,course_id) DO NOTHING;
 SELECT * INTO enrol FROM enrollments WHERE user_id=uid AND course_id=p_course_id FOR UPDATE;
 PERFORM public.award_points(uid,'COURSE_ENROLL','Course enrollment',NULL,p_course_id::text,'course');
 RETURN to_jsonb(enrol);
END;$$;

CREATE OR REPLACE FUNCTION public.complete_course_lesson(p_course_id uuid,p_lesson_id uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE uid uuid; enrol public.enrollments; total integer; done integer; awarded jsonb; bonus jsonb; finished boolean;
BEGIN
 uid:=public.lock_course_activity(p_course_id);
 IF NOT EXISTS(SELECT 1 FROM lessons WHERE id=p_lesson_id AND course_id=p_course_id) THEN RAISE EXCEPTION 'Lesson not found'; END IF;
 SELECT * INTO enrol FROM enrollments WHERE user_id=uid AND course_id=p_course_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Enroll before completing lessons'; END IF;
 IF EXISTS(SELECT 1 FROM lessons WHERE id=p_lesson_id AND jsonb_array_length(quiz_questions)>0)
  AND COALESCE((enrol.quiz_scores->>p_lesson_id::text)::integer,0)<80 THEN RAISE EXCEPTION 'Pass the assessment before completing this lesson'; END IF;
 IF NOT p_lesson_id::text=ANY(COALESCE(enrol.completed_lessons,'{}')) THEN enrol.completed_lessons:=array_append(COALESCE(enrol.completed_lessons,'{}'),p_lesson_id::text); END IF;
 SELECT count(*) INTO total FROM lessons WHERE course_id=p_course_id;
 SELECT count(*) INTO done FROM lessons WHERE course_id=p_course_id AND id::text=ANY(enrol.completed_lessons);
 -- A later curriculum addition does not revoke an already earned credential.
 finished:=enrol.certificate_id IS NOT NULL OR (total>0 AND done=total);
 UPDATE enrollments SET completed_lessons=enrol.completed_lessons,progress_percent=CASE WHEN finished THEN 100 ELSE LEAST(100,round(done*100.0/GREATEST(total,1))) END,
  is_completed=finished,status=CASE WHEN finished THEN 'completed' ELSE 'active' END,
  completed_at=CASE WHEN finished THEN COALESCE(completed_at,now()) ELSE NULL END,
  last_accessed_at=now(),last_lesson_id=p_lesson_id::text WHERE id=enrol.id;
 SELECT * INTO enrol FROM enrollments WHERE id=enrol.id;
 awarded:=public.award_points(uid,'LESSON_COMPLETE','Completed lesson',NULL,p_lesson_id::text,'lesson');
 IF finished THEN bonus:=public.award_points(uid,'COURSE_COMPLETE','Completed course',NULL,p_course_id::text,'course'); END IF;
 RETURN jsonb_build_object('enrollment',to_jsonb(enrol),'isCourseFinished',finished,'pointsAwarded',
  COALESCE((awarded->>'points')::int,0)+COALESCE((bonus->>'points')::int,0));
END;$$;

CREATE OR REPLACE FUNCTION public.submit_course_quiz(p_lesson_id uuid,p_answers jsonb) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE uid uuid; lesson public.lessons; requested_course uuid; q jsonb; correct integer:=0; total integer; score integer; enrol public.enrollments; saved jsonb;
BEGIN
 SELECT * INTO lesson FROM lessons WHERE id=p_lesson_id;
 IF NOT FOUND THEN RAISE EXCEPTION 'Published assessment required'; END IF;
 requested_course:=lesson.course_id;
 uid:=public.lock_course_activity(requested_course);
 -- Reload after the curriculum lock: an administrator may have edited it.
 SELECT * INTO lesson FROM lessons WHERE id=p_lesson_id AND course_id=requested_course;
 IF NOT FOUND OR COALESCE(jsonb_typeof(lesson.quiz_questions),'null')<>'array' OR jsonb_array_length(lesson.quiz_questions)=0 THEN RAISE EXCEPTION 'Published assessment required'; END IF;
 SELECT * INTO enrol FROM enrollments WHERE user_id=uid AND course_id=lesson.course_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Enrollment required'; END IF;
 IF jsonb_typeof(p_answers)<>'object' OR octet_length(p_answers::text)>100000 THEN RAISE EXCEPTION 'Valid answer map required'; END IF;
 total:=jsonb_array_length(lesson.quiz_questions);
 FOR q IN SELECT value FROM jsonb_array_elements(lesson.quiz_questions) LOOP
  IF COALESCE(p_answers->>(q->>'id'),'')~'^\d{1,2}$' AND (p_answers->>(q->>'id'))::integer=COALESCE((q->>'correctIndex')::integer,(q->>'correctAnswer')::integer) THEN correct:=correct+1; END IF;
 END LOOP;
 score:=round(correct*100.0/total);
 UPDATE enrollments SET quiz_scores=jsonb_set(COALESCE(quiz_scores,'{}'),ARRAY[p_lesson_id::text],to_jsonb(GREATEST(score,COALESCE((enrol.quiz_scores->>p_lesson_id::text)::integer,0))),true) WHERE id=enrol.id;
 IF score>=80 THEN saved:=public.complete_course_lesson(lesson.course_id,p_lesson_id); END IF;
 RETURN jsonb_build_object('scorePercentage',score,'passed',score>=80,'progress',saved);
END;$$;

COMMIT;
