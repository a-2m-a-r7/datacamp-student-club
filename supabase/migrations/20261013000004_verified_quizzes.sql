BEGIN;
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
 UPDATE enrollments SET quiz_scores=jsonb_set(COALESCE(quiz_scores,'{}'),ARRAY[p_lesson_id::text],to_jsonb(score),true) WHERE id=enrol.id;
 IF score>=80 THEN saved:=public.complete_course_lesson(lesson.course_id,p_lesson_id); END IF;
 RETURN jsonb_build_object('scorePercentage',score,'passed',score>=80,'progress',saved);
END;
$$;
REVOKE ALL ON FUNCTION public.submit_course_quiz(uuid,jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.submit_course_quiz(uuid,jsonb) TO authenticated;
COMMIT;
