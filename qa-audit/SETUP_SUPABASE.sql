-- Owner-authorized DataCamp repair schema; no seed or unrelated-table changes.
-- For a new/staging project. Existing production applies only unapplied migrations.
BEGIN;

-- 20261013000000_missing_schema.sql
-- PREPARED ONLY. Review and apply using the Supabase SQL editor on staging first.
-- No sample INSERTs, secrets, or user data deletions. Creates missing tables only.

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  provider TEXT DEFAULT 'email',
  member_id TEXT,
  phone TEXT,
  faculty TEXT DEFAULT 'Faculty of Computer Science & AI',
  university TEXT DEFAULT 'Innovation University',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  total_points INT DEFAULT 50,
  xp INT DEFAULT 50,
  level TEXT DEFAULT 'RECRUIT',
  is_verified BOOLEAN DEFAULT TRUE,
  bio TEXT DEFAULT '',
  interests TEXT[] DEFAULT '{}',
  linkedin_url TEXT DEFAULT '',
  github_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_sign_in_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.auth_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('signup', 'login', 'logout')),
  provider TEXT NOT NULL CHECK (provider IN ('email', 'google')),
  user_agent TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  thumbnail_url TEXT,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'data_science',
  level TEXT NOT NULL DEFAULT 'beginner',
  duration_hours INTEGER DEFAULT 12,
  total_lessons INTEGER DEFAULT 0,
  points_reward INTEGER DEFAULT 500,
  instructor_name TEXT DEFAULT 'DataCamp Instructor',
  instructor_title TEXT DEFAULT 'Club Lead Mentor',
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  video_url TEXT DEFAULT '',
  position INTEGER NOT NULL DEFAULT 1,
  duration_minutes INTEGER DEFAULT 20,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_lessons TEXT[] DEFAULT '{}',
  progress_percent INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, course_id)
);

CREATE TABLE IF NOT EXISTS public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  location TEXT DEFAULT 'Main Hall',
  description TEXT,
  registered_count INTEGER DEFAULT 0,
  capacity INTEGER DEFAULT 100,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT NOT NULL DEFAULT 'System',
  action TEXT NOT NULL,
  target TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'warning', 'danger')),
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Leaders',
  image TEXT DEFAULT 'https://picsum.photos/seed/pres/400/400',
  socials JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'planning')),
  members TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.blog (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  author TEXT NOT NULL DEFAULT 'Club Mentor',
  date TEXT NOT NULL DEFAULT '2026-04-10',
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.gallery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.admin_emails (
  email TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL DEFAULT 'Club Member',
  avatar_url TEXT DEFAULT '',
  photo_url TEXT DEFAULT '',
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin', 'member')),
  provider TEXT DEFAULT 'email',
  member_id TEXT UNIQUE,
  phone TEXT DEFAULT '',
  faculty TEXT DEFAULT 'Faculty of Computer Science & AI',
  university TEXT DEFAULT 'Innovation University',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  total_points INTEGER NOT NULL DEFAULT 50,
  xp INTEGER NOT NULL DEFAULT 50,
  level TEXT NOT NULL DEFAULT 'RECRUIT',
  is_verified BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_sign_in_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.points_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  action TEXT NOT NULL,
  description TEXT NOT NULL,
  reference_id TEXT,
  reference_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  badge_icon TEXT DEFAULT '',
  badge_color TEXT DEFAULT '',
  description TEXT DEFAULT '',
  is_new BOOLEAN NOT NULL DEFAULT true,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_full_name TEXT NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  course_title TEXT,
  event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  event_title TEXT,
  type TEXT NOT NULL CHECK (type IN ('course', 'event', 'achievement')),
  pdf_url TEXT,
  share_url TEXT,
  verification_code TEXT UNIQUE NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    slug TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed')),
    theme JSONB DEFAULT '{"primaryColor": "#6366f1", "accentColor": "#06b6d4", "backgroundStyle": "cyber", "coverImage": null}'::jsonb,
    allow_anonymous BOOLEAN NOT NULL DEFAULT true,
    one_response_per_user BOOLEAN NOT NULL DEFAULT false,
    collect_email BOOLEAN NOT NULL DEFAULT false,
    opens_at TIMESTAMPTZ,
    closes_at TIMESTAMPTZ,
    success_message TEXT DEFAULT 'Thank you! Your response has been recorded successfully.',
    sheets_sync_enabled BOOLEAN NOT NULL DEFAULT false,
    spreadsheet_id TEXT,
    spreadsheet_url TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.form_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (
        type IN (
            'short_text',
            'long_text',
            'single_choice',
            'multiple_choice',
            'dropdown',
            'rating',
            'linear_scale',
            'date',
            'time',
            'number',
            'email',
            'file_upload',
            'ranking',
            'section_header'
        )
    ),
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    required BOOLEAN NOT NULL DEFAULT false,
    position INTEGER NOT NULL DEFAULT 0,
    options JSONB DEFAULT '[]'::jsonb, -- Array of { id, text, goToQuestionId? }
    settings JSONB DEFAULT '{}'::jsonb, -- min, max, scaleLabels, maxFileSize, etc.
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.form_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
    respondent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    respondent_email TEXT,
    submitted_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.form_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    response_id UUID NOT NULL REFERENCES public.form_responses(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.form_questions(id) ON DELETE CASCADE,
    value JSONB,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
    response_id UUID REFERENCES public.form_responses(id) ON DELETE SET NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'synced', 'failed', 'retrying')),
    error TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS author TEXT,
  ADD COLUMN IF NOT EXISTS image TEXT,
  ADD COLUMN IF NOT EXISTS technologies TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS github_url TEXT,
  ADD COLUMN IF NOT EXISTS live_url TEXT,
  ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;

ALTER TABLE public.blog
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS excerpt TEXT,
  ADD COLUMN IF NOT EXISTS image TEXT,
  ADD COLUMN IF NOT EXISTS read_time TEXT DEFAULT '5 min read';

ALTER TABLE public.gallery
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS date TEXT;

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS registrations JSONB DEFAULT '[]'::JSONB,
  ADD COLUMN IF NOT EXISTS organizers TEXT[] DEFAULT '{}';

ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'admin_message',
  ADD COLUMN IF NOT EXISTS reference_id TEXT,
  ADD COLUMN IF NOT EXISTS reference_type TEXT;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS academic_year TEXT;


ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS xp INTEGER NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS github_url TEXT DEFAULT '';
ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS module_id UUID,
  ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'article',
  ADD COLUMN IF NOT EXISTS is_preview BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS points_reward INTEGER NOT NULL DEFAULT 30,
  ADD COLUMN IF NOT EXISTS quiz_questions JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS exercise_prompt TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS exercise_starter_code TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS exercise_solution TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS exercise_test_cases JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.enrollments
  ADD COLUMN IF NOT EXISTS completed_modules TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS last_lesson_id TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS quiz_scores JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS certificate_id UUID;
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'both',
  ADD COLUMN IF NOT EXISTS enrolled_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rating NUMERIC(3, 2) NOT NULL DEFAULT 5.0,
  ADD COLUMN IF NOT EXISTS rating_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS prerequisites TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_locked BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS photo_url text;
ALTER TABLE public.profiles ALTER COLUMN total_points SET DEFAULT 0, ALTER COLUMN xp SET DEFAULT 0,
 ALTER COLUMN faculty SET DEFAULT '', ALTER COLUMN university SET DEFAULT '', ALTER COLUMN is_verified SET DEFAULT false;
ALTER TABLE public.courses ALTER COLUMN rating SET DEFAULT 0;
ALTER TABLE public.staff ALTER COLUMN image SET DEFAULT '';
ALTER TABLE public.blog ALTER COLUMN author SET DEFAULT '', ALTER COLUMN date SET DEFAULT to_char(now(),'YYYY-MM-DD');

-- 20261013000001_real_operations.sql
-- Apply after 20261013000000_missing_schema.sql. No existing records are deleted.

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

-- 20261013000002_atomic_forms.sql
-- Preserve question IDs and historical answers. A failed save rolls back the entire transaction.
CREATE OR REPLACE FUNCTION public.save_form_questions(p_form_id uuid,p_questions jsonb) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE q jsonb; qid uuid; ids uuid[]:='{}'; position integer:=0;
BEGIN
 IF NOT public.is_admin() THEN RAISE EXCEPTION 'Administrator required'; END IF;
 PERFORM 1 FROM forms WHERE id=p_form_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Form not found'; END IF;
 IF jsonb_typeof(p_questions)<>'array' OR jsonb_array_length(p_questions)>200 THEN RAISE EXCEPTION 'Invalid question list'; END IF;
 FOR q IN SELECT value FROM jsonb_array_elements(p_questions) LOOP
  qid:=COALESCE(NULLIF(q->>'id','')::uuid,gen_random_uuid());
  IF qid=ANY(ids) OR EXISTS(SELECT 1 FROM form_questions WHERE id=qid AND form_id<>p_form_id) THEN RAISE EXCEPTION 'Invalid question identity'; END IF;
  IF length(q->>'title') NOT BETWEEN 1 AND 1000 THEN RAISE EXCEPTION 'Question title required (maximum 1000 characters)'; END IF;
  ids:=array_append(ids,qid);
  INSERT INTO form_questions(id,form_id,type,title,description,required,position,options,settings)
  VALUES(qid,p_form_id,q->>'type',q->>'title',COALESCE(q->>'description',''),COALESCE((q->>'required')::boolean,false),position,
    COALESCE(q->'options','[]'),COALESCE(q->'settings','{}'))
  ON CONFLICT(id) DO UPDATE SET type=EXCLUDED.type,title=EXCLUDED.title,description=EXCLUDED.description,
    required=EXCLUDED.required,position=EXCLUDED.position,options=EXCLUDED.options,settings=EXCLUDED.settings;
  position:=position+1;
 END LOOP;
 IF EXISTS(SELECT 1 FROM form_questions fq JOIN form_answers a ON a.question_id=fq.id
  WHERE fq.form_id=p_form_id AND NOT fq.id=ANY(ids)) THEN RAISE EXCEPTION 'Cannot remove a question with saved answers; duplicate the form instead'; END IF;
 DELETE FROM form_questions WHERE form_id=p_form_id AND NOT id=ANY(ids);
 RETURN COALESCE((SELECT jsonb_agg(fq ORDER BY fq.position) FROM form_questions fq WHERE fq.form_id=p_form_id),'[]');
END;
$$;
CREATE OR REPLACE FUNCTION public.save_form(p_form jsonb,p_questions jsonb) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE row public.forms; target_id uuid; saved jsonb;
BEGIN
 IF NOT public.is_admin() THEN RAISE EXCEPTION 'Administrator required'; END IF;
 target_id:=NULLIF(p_form->>'id','')::uuid;
 IF target_id IS NOT NULL THEN
  SELECT * INTO row FROM forms WHERE forms.id=target_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Form not found'; END IF;
  p_form:=to_jsonb(row)||p_form;
 END IF;
 IF length(p_form->>'title') NOT BETWEEN 1 AND 200 OR (p_form->>'slug') !~ '^[a-zA-Z0-9_-]{1,150}$' THEN RAISE EXCEPTION 'Valid title and slug required'; END IF;
 IF NULLIF(p_form->>'opens_at','')::timestamptz>NULLIF(p_form->>'closes_at','')::timestamptz THEN RAISE EXCEPTION 'Closing time must follow opening time'; END IF;
 INSERT INTO forms(id,title,description,slug,status,theme,allow_anonymous,one_response_per_user,collect_email,opens_at,closes_at,
   success_message,sheets_sync_enabled,created_by)
 VALUES(COALESCE(target_id,gen_random_uuid()),p_form->>'title',COALESCE(p_form->>'description',''),p_form->>'slug',COALESCE(p_form->>'status','draft'),
   COALESCE(p_form->'theme','{}'),COALESCE((p_form->>'allow_anonymous')::boolean,true),COALESCE((p_form->>'one_response_per_user')::boolean,false),
   COALESCE((p_form->>'collect_email')::boolean,false),NULLIF(p_form->>'opens_at','')::timestamptz,NULLIF(p_form->>'closes_at','')::timestamptz,
   COALESCE(p_form->>'success_message','Thank you. Your response was saved.'),COALESCE((p_form->>'sheets_sync_enabled')::boolean,false),auth.uid())
 ON CONFLICT ON CONSTRAINT forms_pkey DO UPDATE SET title=EXCLUDED.title,description=EXCLUDED.description,slug=EXCLUDED.slug,status=EXCLUDED.status,
   theme=EXCLUDED.theme,allow_anonymous=EXCLUDED.allow_anonymous,one_response_per_user=EXCLUDED.one_response_per_user,collect_email=EXCLUDED.collect_email,
   opens_at=EXCLUDED.opens_at,closes_at=EXCLUDED.closes_at,success_message=EXCLUDED.success_message,sheets_sync_enabled=EXCLUDED.sheets_sync_enabled,updated_at=now()
 RETURNING * INTO row;
 saved:=public.save_form_questions(row.id,p_questions);
 RETURN jsonb_build_object('form',to_jsonb(row),'questions',saved);
END;
$$;
CREATE OR REPLACE FUNCTION public.has_user_responded(p_form_id uuid,p_email text DEFAULT NULL) RETURNS boolean
LANGUAGE sql SECURITY DEFINER STABLE SET search_path=public AS $$
 SELECT EXISTS(SELECT 1 FROM form_responses WHERE form_id=p_form_id AND respondent_id=auth.uid());
$$;
CREATE OR REPLACE FUNCTION public.submit_form_response(p_form_id uuid,p_answers jsonb,p_respondent_email text DEFAULT NULL,p_metadata jsonb DEFAULT '{}') RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE f public.forms; q public.form_questions; a jsonb; v jsonb; id uuid; email text:=lower(trim(COALESCE(p_respondent_email,''))); n integer;
BEGIN
 SELECT * INTO f FROM forms WHERE forms.id=p_form_id FOR UPDATE;
 IF NOT FOUND OR f.status<>'published' THEN RAISE EXCEPTION 'Form unavailable'; END IF;
 IF (f.opens_at IS NOT NULL AND f.opens_at>now()) OR (f.closes_at IS NOT NULL AND f.closes_at<now()) THEN RAISE EXCEPTION 'Form is closed'; END IF;
 IF NOT f.allow_anonymous AND auth.uid() IS NULL THEN RAISE EXCEPTION 'Sign in before submitting'; END IF;
 IF auth.uid() IS NOT NULL THEN PERFORM public.require_active_user(); END IF;
 IF (f.collect_email OR email<>'') AND email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' THEN RAISE EXCEPTION 'Valid email required'; END IF;
 IF length(email)>254 OR jsonb_typeof(p_answers)<>'array' OR jsonb_array_length(p_answers)>200 THEN RAISE EXCEPTION 'Invalid response'; END IF;
 IF f.one_response_per_user THEN
  IF auth.uid() IS NULL AND email='' THEN RAISE EXCEPTION 'Email or account required'; END IF;
  IF EXISTS(SELECT 1 FROM form_responses WHERE form_id=p_form_id AND
   ((auth.uid() IS NOT NULL AND respondent_id=auth.uid()) OR (email<>'' AND lower(respondent_email)=email))) THEN RAISE EXCEPTION 'Already submitted'; END IF;
 END IF;
 FOR a IN SELECT value FROM jsonb_array_elements(p_answers) LOOP
  SELECT * INTO q FROM form_questions WHERE form_id=p_form_id AND form_questions.id=(a->>'question_id')::uuid AND type<>'section_header';
  IF NOT FOUND THEN RAISE EXCEPTION 'Question does not belong to this form'; END IF;
  SELECT count(*) INTO n FROM jsonb_array_elements(p_answers) x WHERE x->>'question_id'=a->>'question_id';
  IF n<>1 THEN RAISE EXCEPTION 'Duplicate answer'; END IF;
  v:=a->'value';
  IF length(v::text)>20000 THEN RAISE EXCEPTION 'Answer too long'; END IF;
  IF v IS NOT NULL AND v NOT IN ('null'::jsonb,'""'::jsonb,'[]'::jsonb) THEN
   IF q.type IN ('short_text','long_text','email','date','time') AND jsonb_typeof(v)<>'string' THEN RAISE EXCEPTION 'Text answer required'; END IF;
   IF q.type='email' AND (v#>>'{}') !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' THEN RAISE EXCEPTION 'Invalid email answer'; END IF;
   IF q.type='date' THEN PERFORM (v#>>'{}')::date; END IF;
   IF q.type='time' THEN PERFORM (v#>>'{}')::time; END IF;
   IF q.type IN ('number','rating','linear_scale') THEN
    IF jsonb_typeof(v) NOT IN ('number','string') THEN RAISE EXCEPTION 'Numeric answer required'; END IF;
    PERFORM (v#>>'{}')::numeric;
    IF q.settings ? 'min' AND (v#>>'{}')::numeric<(q.settings->>'min')::numeric THEN RAISE EXCEPTION 'Value below minimum'; END IF;
    IF q.settings ? 'max' AND (v#>>'{}')::numeric>(q.settings->>'max')::numeric THEN RAISE EXCEPTION 'Value above maximum'; END IF;
   END IF;
   IF q.type IN ('single_choice','dropdown') AND NOT EXISTS(SELECT 1 FROM jsonb_array_elements(q.options) opt WHERE opt->>'id'=v#>>'{}') THEN RAISE EXCEPTION 'Invalid option'; END IF;
   IF q.type IN ('multiple_choice','ranking') THEN
    IF jsonb_typeof(v)<>'array' THEN RAISE EXCEPTION 'Option list required'; END IF;
    IF EXISTS(SELECT 1 FROM jsonb_array_elements_text(v) choice WHERE NOT EXISTS(SELECT 1 FROM jsonb_array_elements(q.options) opt WHERE opt->>'id'=choice)) THEN RAISE EXCEPTION 'Invalid option'; END IF;
   END IF;
   IF q.type='file_upload' AND (jsonb_typeof(v)<>'object' OR COALESCE(v->>'path','') NOT LIKE p_form_id::text||'/%') THEN RAISE EXCEPTION 'Invalid file attachment'; END IF;
  END IF;
 END LOOP;
 FOR q IN SELECT * FROM form_questions WHERE form_id=p_form_id AND required AND type<>'section_header' LOOP
  SELECT value->'value' INTO v FROM jsonb_array_elements(p_answers) WHERE value->>'question_id'=q.id::text;
  IF v IS NULL OR v IN ('null'::jsonb,'""'::jsonb,'[]'::jsonb) OR (jsonb_typeof(v)='string' AND trim(v#>>'{}')='') THEN RAISE EXCEPTION 'Required answer missing: %',q.title; END IF;
 END LOOP;
 INSERT INTO form_responses(form_id,respondent_id,respondent_email,metadata) VALUES(p_form_id,auth.uid(),NULLIF(email,''),p_metadata) RETURNING form_responses.id INTO id;
 INSERT INTO form_answers(response_id,question_id,value) SELECT id,(x->>'question_id')::uuid,x->'value' FROM jsonb_array_elements(p_answers) x;
 RETURN jsonb_build_object('success',true,'response_id',id,'success_message',f.success_message,'sheets_sync_enabled',f.sheets_sync_enabled);
END;
$$;
-- The old index disallowed repeat responses even when the setting was off. The locked RPC enforces the setting.
DROP INDEX IF EXISTS public.idx_form_responses_unique_user;
REVOKE ALL ON FUNCTION public.save_form_questions(uuid,jsonb),public.save_form(jsonb,jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.save_form_questions(uuid,jsonb),public.save_form(jsonb,jsonb) TO authenticated;
REVOKE ALL ON FUNCTION public.submit_form_response(uuid,jsonb,text,jsonb),public.has_user_responded(uuid,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_form_response(uuid,jsonb,text,jsonb),public.has_user_responded(uuid,text) TO anon,authenticated;

-- 20261013000003_auth_notifications.sql
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

-- 20261013000004_verified_quizzes.sql
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

-- 20261013000005_storage.sql
INSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types) VALUES
 ('form-attachments','form-attachments',false,10485760,ARRAY['image/png','image/jpeg','image/webp','application/pdf','text/plain']),
 ('avatars','avatars',true,5242880,ARRAY['image/png','image/jpeg','image/webp']),
 ('course-thumbnails','course-thumbnails',true,10485760,ARRAY['image/png','image/jpeg','image/webp']),
 ('uploads','uploads',true,10485760,ARRAY['image/png','image/jpeg','image/webp'])
ON CONFLICT(id) DO NOTHING;
UPDATE storage.buckets SET public=false WHERE id='form-attachments';
-- Remove only the previous named form-attachment policies before applying the tighter rules.
DROP POLICY IF EXISTS form_attachments_admin_all ON storage.objects;
DROP POLICY IF EXISTS form_attachments_upload_public ON storage.objects;
DROP POLICY IF EXISTS qa_attachments_admin ON storage.objects;
CREATE POLICY qa_attachments_admin ON storage.objects FOR ALL TO authenticated
USING(bucket_id='form-attachments' AND public.is_admin()) WITH CHECK(bucket_id='form-attachments' AND public.is_admin());
DROP POLICY IF EXISTS qa_form_upload ON storage.objects;
CREATE POLICY qa_form_upload ON storage.objects FOR INSERT TO anon,authenticated WITH CHECK(
 bucket_id='form-attachments' AND EXISTS(SELECT 1 FROM public.forms f WHERE
 f.id::text=split_part(name,'/',1) AND f.status='published' AND (f.allow_anonymous OR auth.uid() IS NOT NULL)
 AND (f.opens_at IS NULL OR f.opens_at<=now()) AND (f.closes_at IS NULL OR f.closes_at>=now())));
DROP POLICY IF EXISTS qa_public_images ON storage.objects;
CREATE POLICY qa_public_images ON storage.objects FOR SELECT TO anon,authenticated USING(bucket_id IN ('avatars','course-thumbnails','uploads'));
DROP POLICY IF EXISTS qa_images_admin ON storage.objects;
CREATE POLICY qa_images_admin ON storage.objects FOR ALL TO authenticated USING(
 bucket_id IN ('avatars','course-thumbnails','uploads') AND public.is_admin()) WITH CHECK(
 bucket_id IN ('avatars','course-thumbnails','uploads') AND public.is_admin());
DROP POLICY IF EXISTS qa_own_avatar ON storage.objects;
CREATE POLICY qa_own_avatar ON storage.objects FOR ALL TO authenticated USING(
 bucket_id='avatars' AND split_part(name,'/',1)=auth.uid()::text) WITH CHECK(
 bucket_id='avatars' AND split_part(name,'/',1)=auth.uid()::text);
-- Restrictive rules also constrain older permissive policies on these buckets.
DROP POLICY IF EXISTS qa_private_attachment_reads ON storage.objects;
CREATE POLICY qa_private_attachment_reads ON storage.objects AS RESTRICTIVE FOR SELECT TO anon,authenticated
USING(bucket_id<>'form-attachments' OR public.is_admin());
DROP POLICY IF EXISTS qa_target_upload_limits ON storage.objects;
CREATE POLICY qa_target_upload_limits ON storage.objects AS RESTRICTIVE FOR INSERT TO anon,authenticated WITH CHECK(
 bucket_id NOT IN ('avatars','course-thumbnails','uploads','form-attachments') OR public.is_admin()
 OR (bucket_id='avatars' AND split_part(name,'/',1)=auth.uid()::text)
 OR (bucket_id='form-attachments' AND EXISTS(SELECT 1 FROM public.forms f WHERE f.id::text=split_part(name,'/',1)
 AND f.status='published' AND (f.allow_anonymous OR auth.uid() IS NOT NULL)
 AND (f.opens_at IS NULL OR f.opens_at<=now()) AND (f.closes_at IS NULL OR f.closes_at>=now()))));
DROP POLICY IF EXISTS qa_target_update_limits ON storage.objects;
CREATE POLICY qa_target_update_limits ON storage.objects AS RESTRICTIVE FOR UPDATE TO anon,authenticated
USING(bucket_id NOT IN ('avatars','course-thumbnails','uploads','form-attachments') OR public.is_admin()
 OR (bucket_id='avatars' AND split_part(name,'/',1)=auth.uid()::text))
WITH CHECK(bucket_id NOT IN ('avatars','course-thumbnails','uploads','form-attachments') OR public.is_admin()
 OR (bucket_id='avatars' AND split_part(name,'/',1)=auth.uid()::text));
DROP POLICY IF EXISTS qa_target_delete_limits ON storage.objects;
CREATE POLICY qa_target_delete_limits ON storage.objects AS RESTRICTIVE FOR DELETE TO anon,authenticated
USING(bucket_id NOT IN ('avatars','course-thumbnails','uploads','form-attachments') OR public.is_admin()
 OR (bucket_id='avatars' AND split_part(name,'/',1)=auth.uid()::text));

-- 20261013000006_verified_badges.sql
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

-- 20261013000007_analytics.sql
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

-- 20261013000008_member_directory_private.sql
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

-- 20261013000009_staff_directory_private.sql
DROP POLICY IF EXISTS qa_staff_read ON public.staff;

-- 20261013000010_member_cards.sql
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

-- 20261013000011_automatic_course_certificates.sql
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

-- 20261014000012_course_growth.sql
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
