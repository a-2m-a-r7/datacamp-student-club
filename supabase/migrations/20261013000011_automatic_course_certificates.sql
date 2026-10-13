BEGIN;

CREATE UNIQUE INDEX IF NOT EXISTS qa_one_course_certificate
 ON public.certificates(user_id,course_id) WHERE type='course' AND course_id IS NOT NULL;

-- Only trusted database routines can issue for an arbitrary enrollment owner.
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
    (jsonb_array_length(COALESCE(l.quiz_questions,'[]'::jsonb))>0 AND COALESCE((enrol.quiz_scores->>l.id::text)::integer,0)<80)
   )
  ) THEN RAISE EXCEPTION 'Complete every lesson and pass all assessments before receiving a certificate'; END IF;
  INSERT INTO certificates(user_id,user_full_name,course_id,course_title,type,verification_code)
   SELECT p_user_id,p.full_name,c.id,c.title,'course','DC-'||upper(replace(gen_random_uuid()::text,'-',''))
   FROM profiles p JOIN courses c ON c.id=p_course_id WHERE p.id=p_user_id
   RETURNING * INTO cert;
  IF cert.id IS NULL THEN RAISE EXCEPTION 'Certificate recipient or course not found'; END IF;
 END IF;
 UPDATE enrollments SET certificate_id=cert.id WHERE id=enrol.id AND certificate_id IS DISTINCT FROM cert.id;
 RETURN to_jsonb(cert);
END;$$;
REVOKE ALL ON FUNCTION public.ensure_completed_course_certificate(uuid,uuid) FROM PUBLIC,anon,authenticated,service_role;

CREATE OR REPLACE FUNCTION public.issue_course_certificate(p_course_id uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 RETURN public.ensure_completed_course_certificate(public.require_active_user(),p_course_id);
END;$$;
REVOKE ALL ON FUNCTION public.issue_course_certificate(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.issue_course_certificate(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.issue_certificate_on_course_completion() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 PERFORM public.ensure_completed_course_certificate(NEW.user_id,NEW.course_id);
 RETURN NEW;
END;$$;
REVOKE ALL ON FUNCTION public.issue_certificate_on_course_completion() FROM PUBLIC,anon,authenticated,service_role;
DROP TRIGGER IF EXISTS qa_automatic_course_certificate ON public.enrollments;
CREATE TRIGGER qa_automatic_course_certificate
 AFTER INSERT OR UPDATE OF is_completed,completed_lessons ON public.enrollments
 FOR EACH ROW WHEN (NEW.is_completed)
 EXECUTE FUNCTION public.issue_certificate_on_course_completion();

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
  last_accessed_at=now(),last_lesson_id=p_lesson_id::text WHERE id=row.id;
 -- The AFTER trigger has persisted the certificate and its enrollment link.
 SELECT * INTO row FROM enrollments WHERE id=row.id;
 awarded:=public.award_points(uid,'LESSON_COMPLETE','Completed lesson',NULL,p_lesson_id::text,'lesson');
 IF row.is_completed THEN bonus:=public.award_points(uid,'COURSE_COMPLETE','Completed course',NULL,p_course_id::text,'course'); END IF;
 RETURN jsonb_build_object('enrollment',to_jsonb(row),'isCourseFinished',row.is_completed,'pointsAwarded',
  COALESCE((awarded->>'points')::int,0)+COALESCE((bonus->>'points')::int,0));
END;$$;

CREATE OR REPLACE FUNCTION public.submit_course_quiz(p_lesson_id uuid,p_answers jsonb) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE uid uuid; lesson public.lessons; q jsonb; correct integer:=0; total integer; score integer;
 enrol public.enrollments; saved jsonb;
BEGIN
 uid:=public.require_active_user();
 SELECT * INTO lesson FROM lessons WHERE id=p_lesson_id;
 IF NOT FOUND OR jsonb_typeof(lesson.quiz_questions)<>'array' OR jsonb_array_length(lesson.quiz_questions)=0 THEN RAISE EXCEPTION 'Published assessment required'; END IF;
 SELECT * INTO enrol FROM enrollments WHERE user_id=uid AND course_id=lesson.course_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Enrollment required'; END IF;
 IF jsonb_typeof(p_answers)<>'object' THEN RAISE EXCEPTION 'Answer map required'; END IF;
 total:=jsonb_array_length(lesson.quiz_questions);
 FOR q IN SELECT value FROM jsonb_array_elements(lesson.quiz_questions) LOOP
  IF (p_answers->>(q->>'id'))::integer=COALESCE((q->>'correctIndex')::integer,(q->>'correctAnswer')::integer) THEN correct:=correct+1; END IF;
 END LOOP;
 score:=round(correct*100.0/total);
 UPDATE enrollments SET quiz_scores=jsonb_set(COALESCE(quiz_scores,'{}'),ARRAY[p_lesson_id::text],
  to_jsonb(GREATEST(score,COALESCE((enrol.quiz_scores->>p_lesson_id::text)::integer,0))),true) WHERE id=enrol.id;
 IF score>=80 THEN saved:=public.complete_course_lesson(lesson.course_id,p_lesson_id); END IF;
 RETURN jsonb_build_object('scorePercentage',score,'passed',score>=80,'progress',saved);
END;$$;

-- Preserve existing data; repair only demonstrably completed historical courses.
DO $$ DECLARE e record; BEGIN
 FOR e IN SELECT en.user_id,en.course_id FROM enrollments en WHERE en.is_completed
  AND EXISTS(SELECT 1 FROM lessons WHERE course_id=en.course_id)
  AND NOT EXISTS(SELECT 1 FROM lessons l WHERE l.course_id=en.course_id AND (
   NOT (l.id::text=ANY(COALESCE(en.completed_lessons,'{}'::text[]))) OR
   (jsonb_array_length(COALESCE(l.quiz_questions,'[]'::jsonb))>0 AND COALESCE((en.quiz_scores->>l.id::text)::integer,0)<80)
  ))
 LOOP PERFORM public.ensure_completed_course_certificate(e.user_id,e.course_id); END LOOP;
END;$$;
COMMIT;
