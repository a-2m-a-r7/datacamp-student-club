BEGIN;
CREATE TABLE IF NOT EXISTS public.course_modules (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
 title text NOT NULL CHECK(length(trim(title)) BETWEEN 1 AND 200),position integer NOT NULL DEFAULT 1 CHECK(position>0)
);
INSERT INTO course_modules(id,course_id,title,position)
 SELECT DISTINCT ON(module_id) module_id,course_id,'Course unit',GREATEST(position,1) FROM lessons
 WHERE module_id IS NOT NULL ORDER BY module_id,position ON CONFLICT(id) DO NOTHING;
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY course_modules_read ON course_modules FOR SELECT USING(public.is_admin() OR EXISTS(SELECT 1 FROM courses c WHERE c.id=course_id AND c.is_published));
CREATE POLICY course_modules_admin ON course_modules FOR ALL TO authenticated USING(public.is_admin()) WITH CHECK(public.is_admin());

CREATE TABLE IF NOT EXISTS public.course_assets (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
 lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,owner_id uuid NOT NULL REFERENCES auth.users(id),
 kind text NOT NULL CHECK(kind IN('video','material','subtitle')),provider text NOT NULL CHECK(provider IN('drive','supabase')),
 name text NOT NULL CHECK(length(name) BETWEEN 1 AND 250),mime_type text NOT NULL,size_bytes bigint NOT NULL CHECK(size_bytes>0 AND size_bytes<=2147483648),
 file_id text NOT NULL,url text NOT NULL,fingerprint text,sha256 text,language text DEFAULT 'ar',created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS course_assets_lesson ON course_assets(lesson_id,created_at,id);
CREATE UNIQUE INDEX IF NOT EXISTS course_assets_drive_file ON course_assets(provider,file_id);
ALTER TABLE course_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY course_assets_read ON course_assets FOR SELECT USING(public.is_admin() OR EXISTS(
 SELECT 1 FROM lessons l JOIN courses c ON c.id=l.course_id WHERE l.id=lesson_id AND c.is_published
 AND (l.is_preview OR EXISTS(SELECT 1 FROM enrollments e WHERE e.course_id=c.id AND e.user_id=auth.uid()))));
-- Writes go through the authenticated server, which verifies the actual uploaded file.
GRANT SELECT ON course_assets TO anon,authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON course_modules TO authenticated;
GRANT SELECT ON course_modules TO anon;

ALTER TABLE lessons ADD COLUMN IF NOT EXISTS video_asset_id uuid REFERENCES course_assets(id) ON DELETE SET NULL;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS source_lesson_id uuid REFERENCES lessons(id) ON DELETE SET NULL;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS exercise_language text NOT NULL DEFAULT 'python';
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
CREATE INDEX IF NOT EXISTS lessons_source_lesson ON lessons(source_lesson_id) WHERE source_lesson_id IS NOT NULL;
CREATE OR REPLACE FUNCTION stamp_course_lesson() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
 IF NEW.module_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM course_modules m WHERE m.id=NEW.module_id AND m.course_id=NEW.course_id) THEN RAISE EXCEPTION 'Unit does not belong to this course'; END IF;
 IF NEW.source_lesson_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM lessons l WHERE l.id=NEW.source_lesson_id AND l.course_id=NEW.course_id AND l.id<>NEW.id) THEN RAISE EXCEPTION 'Source lesson does not belong to this course'; END IF;
 NEW.updated_at:=clock_timestamp();RETURN NEW;
END;$$;
CREATE TRIGGER stamp_course_lesson BEFORE INSERT OR UPDATE ON lessons FOR EACH ROW EXECUTE FUNCTION stamp_course_lesson();

CREATE TABLE IF NOT EXISTS public.lesson_watch_progress (
 user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
 lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,seconds numeric NOT NULL DEFAULT 0 CHECK(seconds>=0 AND seconds<=86400),
 updated_at timestamptz NOT NULL DEFAULT now(),PRIMARY KEY(user_id,lesson_id)
);
ALTER TABLE lesson_watch_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_watch_progress ON lesson_watch_progress FOR ALL TO authenticated USING(user_id=auth.uid()) WITH CHECK(user_id=auth.uid() AND EXISTS(
 SELECT 1 FROM enrollments e JOIN lessons l ON l.course_id=e.course_id WHERE l.id=lesson_id AND e.user_id=auth.uid()));
GRANT SELECT,INSERT,UPDATE,DELETE ON lesson_watch_progress TO authenticated;
CREATE OR REPLACE FUNCTION save_lesson_watch_progress(p_lesson_id uuid,p_seconds numeric) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE uid uuid:=public.require_active_user();cid uuid;
BEGIN
 IF p_seconds IS NULL OR NOT(p_seconds BETWEEN 0 AND 86400) OR p_seconds::text IN('NaN','Infinity','-Infinity') THEN RAISE EXCEPTION 'Invalid watch position'; END IF;
 SELECT course_id INTO cid FROM lessons WHERE id=p_lesson_id;
 IF NOT EXISTS(SELECT 1 FROM enrollments WHERE user_id=uid AND course_id=cid) THEN RAISE EXCEPTION 'Enrollment required'; END IF;
 INSERT INTO lesson_watch_progress(user_id,lesson_id,seconds) VALUES(uid,p_lesson_id,p_seconds)
 ON CONFLICT(user_id,lesson_id) DO UPDATE SET seconds=EXCLUDED.seconds,updated_at=now();
 UPDATE enrollments SET last_lesson_id=p_lesson_id,last_accessed_at=now() WHERE user_id=uid AND course_id=cid;
END;$$;
REVOKE ALL ON FUNCTION save_lesson_watch_progress(uuid,numeric) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION save_lesson_watch_progress(uuid,numeric) TO authenticated;

CREATE TABLE IF NOT EXISTS public.course_drive_connections (
 owner_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,encrypted_refresh_token text NOT NULL,updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.course_upload_jobs (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),owner_id uuid NOT NULL REFERENCES auth.users(id),lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
 kind text NOT NULL,name text NOT NULL,mime_type text NOT NULL,size_bytes bigint NOT NULL, fingerprint text NOT NULL,sha256 text NOT NULL,
 upload_url text NOT NULL,status text NOT NULL DEFAULT 'uploading',asset_id uuid REFERENCES course_assets(id),created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.lesson_analysis_jobs (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),owner_id uuid NOT NULL REFERENCES auth.users(id),lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
 status text NOT NULL DEFAULT 'uploading',size_bytes bigint NOT NULL,mime_type text NOT NULL,sha256 text NOT NULL,upload_url text NOT NULL,
 file_name text,file_uri text,source_updated_at timestamptz NOT NULL,plan jsonb,result jsonb,error text,
 created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS course_upload_jobs_owner ON course_upload_jobs(owner_id,lesson_id,created_at DESC);
CREATE INDEX IF NOT EXISTS lesson_analysis_jobs_owner ON lesson_analysis_jobs(owner_id,lesson_id,created_at DESC);
-- OAuth tokens and upload capabilities are server-only, including to administrators.
ALTER TABLE course_drive_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_upload_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_analysis_jobs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON course_drive_connections,course_upload_jobs,lesson_analysis_jobs FROM anon,authenticated;
GRANT ALL ON course_drive_connections,course_upload_jobs,lesson_analysis_jobs,course_assets,course_modules,lesson_watch_progress TO service_role;

CREATE OR REPLACE FUNCTION reorder_course_lessons(p_course_id uuid,p_ids uuid[]) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF NOT public.is_admin() THEN RAISE EXCEPTION 'Administrator required'; END IF;
 PERFORM 1 FROM courses WHERE id=p_course_id FOR UPDATE;
 IF cardinality(p_ids)<> (SELECT count(*) FROM lessons WHERE course_id=p_course_id) OR cardinality(p_ids)<>(SELECT count(DISTINCT x) FROM unnest(p_ids) x)
 OR EXISTS(SELECT 1 FROM unnest(p_ids) x WHERE NOT EXISTS(SELECT 1 FROM lessons WHERE id=x AND course_id=p_course_id)) THEN RAISE EXCEPTION 'Reload the course before reordering'; END IF;
 UPDATE lessons l SET position=u.n FROM unnest(p_ids) WITH ORDINALITY u(id,n) WHERE l.id=u.id;
END;$$;
CREATE OR REPLACE FUNCTION reorder_course_modules(p_course_id uuid,p_ids uuid[]) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF NOT public.is_admin() THEN RAISE EXCEPTION 'Administrator required'; END IF;
 PERFORM 1 FROM courses WHERE id=p_course_id FOR UPDATE;
 IF cardinality(p_ids)<>(SELECT count(*) FROM course_modules WHERE course_id=p_course_id) OR cardinality(p_ids)<>(SELECT count(DISTINCT x) FROM unnest(p_ids) x)
 OR EXISTS(SELECT 1 FROM unnest(p_ids) x WHERE NOT EXISTS(SELECT 1 FROM course_modules WHERE id=x AND course_id=p_course_id)) THEN RAISE EXCEPTION 'Reload units before reordering'; END IF;
 UPDATE course_modules m SET position=u.n FROM unnest(p_ids) WITH ORDINALITY u(id,n) WHERE m.id=u.id;
END;$$;
REVOKE ALL ON FUNCTION reorder_course_lessons(uuid,uuid[]),reorder_course_modules(uuid,uuid[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION reorder_course_lessons(uuid,uuid[]),reorder_course_modules(uuid,uuid[]) TO authenticated;

CREATE OR REPLACE FUNCTION apply_lesson_analysis(p_job_id uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE j lesson_analysis_jobs; src lessons; qid uuid; eid uuid; p jsonb; n integer:=1;
BEGIN
 SELECT * INTO j FROM lesson_analysis_jobs WHERE id=p_job_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Analysis not found'; END IF;
 IF j.status='applied' THEN RETURN j.result; END IF;
 IF j.status<>'ready' THEN RAISE EXCEPTION 'Analysis is not ready'; END IF;
 SELECT * INTO src FROM lessons WHERE id=j.lesson_id;
 PERFORM 1 FROM courses WHERE id=src.course_id FOR UPDATE;
 SELECT * INTO src FROM lessons WHERE id=j.lesson_id FOR UPDATE;
 IF src.updated_at<>j.source_updated_at THEN RAISE EXCEPTION 'Lesson changed. Analyze the current video again'; END IF;
 IF EXISTS(SELECT 1 FROM lessons WHERE source_lesson_id=src.id) THEN RAISE EXCEPTION 'Generated lessons already exist; edit them instead of duplicating them'; END IF;
 p:=j.plan;
 IF jsonb_typeof(p->'questions')<>'array' OR jsonb_array_length(p->'questions') NOT BETWEEN 3 AND 5 THEN RAISE EXCEPTION 'Invalid generated quiz'; END IF;
 IF p->'exercise'<>'null'::jsonb THEN n:=2; END IF;
 UPDATE lessons SET position=position+n WHERE course_id=src.course_id AND position>src.position;
 UPDATE lessons SET content=p->>'summary' WHERE id=src.id;
 INSERT INTO lessons(course_id,module_id,title,type,position,duration_minutes,is_preview,points_reward,quiz_questions,source_lesson_id)
 VALUES(src.course_id,src.module_id,left(src.title,285)||' — Quiz','quiz',src.position+1,5,false,10,p->'questions',src.id) RETURNING id INTO qid;
 IF n=2 THEN
 INSERT INTO lessons(course_id,module_id,title,type,position,duration_minutes,is_preview,points_reward,exercise_prompt,exercise_starter_code,exercise_solution,exercise_test_cases,exercise_language,source_lesson_id)
 VALUES(src.course_id,src.module_id,left(src.title,285)||' — Coding','exercise',src.position+2,10,false,10,p->'exercise'->>'prompt',p->'exercise'->>'starterCode',p->'exercise'->>'solution',p->'exercise'->'testCases',p->'exercise'->>'language',src.id) RETURNING id INTO eid;
 END IF;
 UPDATE lesson_analysis_jobs SET status='applied',result=jsonb_build_object('quizId',qid,'exerciseId',eid),updated_at=now() WHERE id=j.id;
 RETURN jsonb_build_object('quizId',qid,'exerciseId',eid);
END;$$;
REVOKE ALL ON FUNCTION apply_lesson_analysis(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION apply_lesson_analysis(uuid) TO service_role;
CREATE OR REPLACE FUNCTION validate_generated_lesson_progress() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE l lessons;q uuid;
BEGIN
 FOR l IN SELECT * FROM lessons WHERE course_id=NEW.course_id AND source_lesson_id IS NOT NULL AND id::text=ANY(NEW.completed_lessons)
 AND NOT(id::text=ANY(COALESCE(OLD.completed_lessons,'{}'))) LOOP
  IF NOT(l.source_lesson_id::text=ANY(NEW.completed_lessons)) THEN RAISE EXCEPTION 'Complete the source video first'; END IF;
  IF l.type='exercise' THEN
   SELECT id INTO q FROM lessons WHERE source_lesson_id=l.source_lesson_id AND type='quiz' ORDER BY position,id LIMIT 1;
   IF q IS NOT NULL AND NOT(q::text=ANY(NEW.completed_lessons)) THEN RAISE EXCEPTION 'Pass the lesson quiz before completing its coding practice'; END IF;
  END IF;
 END LOOP;RETURN NEW;
END;$$;
CREATE TRIGGER validate_generated_lesson_progress BEFORE UPDATE OF completed_lessons ON enrollments FOR EACH ROW EXECUTE FUNCTION validate_generated_lesson_progress();
COMMIT;
