-- ============================================================================
-- DataCamp Student Club - Complete Unified Production Database Schema
-- Platform: Innovation University DataCamp Student Club
-- Includes: Tables, Sequences, Indexes, Triggers, RLS Policies, Storage Buckets
-- ============================================================================


-- >>> START: 20261010000000_initial_schema.sql <<<
-- ============================================================================
-- DataCamp Student Club - Migration 20261010000000: Initial Schema
-- Tables: profiles, auth_events, courses, lessons, enrollments
-- Row Level Security (RLS) + Automated Triggers + Storage
-- ============================================================================

-- 1. Enable necessary PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 2. Profiles Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL DEFAULT 'Club Member',
  avatar_url TEXT DEFAULT '',
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  provider TEXT DEFAULT 'email',
  member_id TEXT UNIQUE,
  phone TEXT DEFAULT '',
  faculty TEXT DEFAULT 'Faculty of Computer Science & AI',
  university TEXT DEFAULT 'Innovation University',
  total_points INTEGER NOT NULL DEFAULT 50,
  level TEXT NOT NULL DEFAULT 'RECRUIT',
  is_verified BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_sign_in_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_last_seen ON public.profiles(last_seen_at);

-- Sequence for Member IDs
CREATE SEQUENCE IF NOT EXISTS public.member_id_seq START 1001;

-- ============================================================================
-- 3. Activity Tracking Table (auth_events)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.auth_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('signup', 'login', 'logout')),
  provider TEXT NOT NULL CHECK (provider IN ('email', 'google')),
  user_agent TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auth_events_user_id ON public.auth_events(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_events_created_at ON public.auth_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auth_events_event_type ON public.auth_events(event_type);

-- ============================================================================
-- 4. Courses Table
-- ============================================================================
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

CREATE INDEX IF NOT EXISTS idx_courses_slug ON public.courses(slug);
CREATE INDEX IF NOT EXISTS idx_courses_published ON public.courses(is_published);
CREATE INDEX IF NOT EXISTS idx_courses_category ON public.courses(category);

-- ============================================================================
-- 5. Lessons Table
-- ============================================================================
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

CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON public.lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_position ON public.lessons(course_id, position);

-- ============================================================================
-- 6. Enrollments Table
-- ============================================================================
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

CREATE INDEX IF NOT EXISTS idx_enrollments_user ON public.enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON public.enrollments(course_id);

-- ============================================================================
-- 7. Security Definer Helper: is_admin()
-- Avoids infinite recursion in RLS policies by bypassing RLS on profiles query.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  current_role TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;

  SELECT role INTO current_role
  FROM public.profiles
  WHERE id = auth.uid();

  RETURN current_role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Prevent role escalation on client-side profile updates
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role <> OLD.role AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Only administrators can modify roles.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_role_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_escalation();

-- ============================================================================
-- 8. Trigger on auth.users: Automatic Profile Creation & Signup Event
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  is_admin_user BOOLEAN;
  new_member_id TEXT;
  user_full_name TEXT;
  user_provider TEXT;
  user_avatar TEXT;
BEGIN
  -- 1. Identify if this email belongs to the primary Admin (Ammar Tahoun)
  is_admin_user := (
    LOWER(NEW.email) = 'mart33645@gmail.com' OR
    LOWER(NEW.email) = 'admin@datacamp.club' OR
    LOWER(NEW.email) = 'sysadmin@datacamp.club' OR
    LOWER(NEW.email) LIKE '%ammar%' OR
    LOWER(NEW.email) LIKE '%tahoun%'
  );

  -- 2. Resolve display name from metadata or email prefix
  user_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    SPLIT_PART(NEW.email, '@', 1)
  );

  -- 3. Resolve auth provider
  user_provider := CASE
    WHEN NEW.raw_app_meta_data->>'provider' = 'google' OR NEW.app_metadata->>'provider' = 'google' THEN 'google'
    ELSE 'email'
  END;

  -- 4. Resolve avatar
  user_avatar := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture',
    ''
  );

  -- 5. Generate distinct Member ID
  IF is_admin_user THEN
    new_member_id := 'DC-ADM-' || UPPER(SUBSTRING(NEW.id::text, 1, 4));
  ELSE
    new_member_id := 'DC-' || NEXTVAL('public.member_id_seq')::text;
  END IF;

  -- 6. Insert new Profile
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    avatar_url,
    role,
    provider,
    member_id,
    total_points,
    level,
    is_verified,
    created_at,
    last_sign_in_at,
    last_seen_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    user_full_name,
    user_avatar,
    CASE WHEN is_admin_user THEN 'admin' ELSE 'user' END,
    user_provider,
    new_member_id,
    CASE WHEN is_admin_user THEN 10000 ELSE 50 END,
    CASE WHEN is_admin_user THEN 'ARCHITECT' ELSE 'RECRUIT' END,
    true,
    NOW(),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    avatar_url = CASE WHEN public.profiles.avatar_url = '' THEN EXCLUDED.avatar_url ELSE public.profiles.avatar_url END,
    last_sign_in_at = NOW(),
    last_seen_at = NOW();

  -- 7. Record Signup Event in auth_events
  INSERT INTO public.auth_events (
    user_id,
    email,
    event_type,
    provider,
    user_agent,
    created_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    'signup',
    CASE WHEN user_provider = 'google' THEN 'google' ELSE 'email' END,
    'Supabase Auth Trigger',
    NOW()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach Trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 9. Row Level Security (RLS) Policies
-- ============================================================================

-- A. PROFILES TABLE RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles are readable by authenticated users and admins" ON public.profiles;
CREATE POLICY "Profiles are readable by authenticated users and admins"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = id OR
    public.is_admin() OR
    auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
CREATE POLICY "Admins can delete profiles"
  ON public.profiles FOR DELETE
  USING (public.is_admin());

-- B. AUTH_EVENTS TABLE RLS
ALTER TABLE public.auth_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all auth events" ON public.auth_events;
CREATE POLICY "Admins can view all auth events"
  ON public.auth_events FOR SELECT
  USING (public.is_admin() OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own auth events" ON public.auth_events;
CREATE POLICY "Users can insert their own auth events"
  ON public.auth_events FOR INSERT
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- C. COURSES TABLE RLS
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Published courses are viewable by everyone" ON public.courses;
CREATE POLICY "Published courses are viewable by everyone"
  ON public.courses FOR SELECT
  USING (is_published = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins can insert courses" ON public.courses;
CREATE POLICY "Admins can insert courses"
  ON public.courses FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update courses" ON public.courses;
CREATE POLICY "Admins can update courses"
  ON public.courses FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete courses" ON public.courses;
CREATE POLICY "Admins can delete courses"
  ON public.courses FOR DELETE
  USING (public.is_admin());

-- D. LESSONS TABLE RLS
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lessons viewable if course is published or by admin" ON public.lessons;
CREATE POLICY "Lessons viewable if course is published or by admin"
  ON public.lessons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = lessons.course_id
        AND (courses.is_published = true OR public.is_admin())
    )
  );

DROP POLICY IF EXISTS "Admins can insert lessons" ON public.lessons;
CREATE POLICY "Admins can insert lessons"
  ON public.lessons FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update lessons" ON public.lessons;
CREATE POLICY "Admins can update lessons"
  ON public.lessons FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete lessons" ON public.lessons;
CREATE POLICY "Admins can delete lessons"
  ON public.lessons FOR DELETE
  USING (public.is_admin());

-- E. ENROLLMENTS TABLE RLS
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own enrollments" ON public.enrollments;
CREATE POLICY "Users can view their own enrollments"
  ON public.enrollments FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can enroll themselves in courses" ON public.enrollments;
CREATE POLICY "Users can enroll themselves in courses"
  ON public.enrollments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own progress" ON public.enrollments;
CREATE POLICY "Users can update their own progress"
  ON public.enrollments FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- ============================================================================
-- 10. Enable Realtime Publications
-- ============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.auth_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.courses;


-- >>> START: 20261010000002_storage_buckets.sql <<<
-- ============================================================================
-- DataCamp Student Club - Migration 20261010000002: Storage Buckets Setup
-- Buckets: course-thumbnails, avatars
-- ============================================================================

-- 1. Create Storage Buckets if not already created
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-thumbnails', 'course-thumbnails', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage Policies for course-thumbnails
DROP POLICY IF EXISTS "Public can view course thumbnails" ON storage.objects;
CREATE POLICY "Public can view course thumbnails"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'course-thumbnails');

DROP POLICY IF EXISTS "Admins can upload course thumbnails" ON storage.objects;
CREATE POLICY "Admins can upload course thumbnails"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'course-thumbnails' AND (public.is_admin() OR auth.role() = 'authenticated'));

DROP POLICY IF EXISTS "Admins can update course thumbnails" ON storage.objects;
CREATE POLICY "Admins can update course thumbnails"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'course-thumbnails' AND public.is_admin());

DROP POLICY IF EXISTS "Admins can delete course thumbnails" ON storage.objects;
CREATE POLICY "Admins can delete course thumbnails"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'course-thumbnails' AND public.is_admin());

-- 3. Storage Policies for avatars
DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
CREATE POLICY "Public can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);


-- >>> START: 20261010000003_remaining_tables.sql <<<
-- ============================================================================
-- DataCamp Student Club - Migration 20261010000003: Remaining Tables
-- Tables: events, audit_logs, staff, projects, blog, gallery, notifications, settings
-- Row Level Security (RLS) + Initial Seed Data
-- ============================================================================

-- 1. Events Table
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

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Events are viewable by everyone" ON public.events;
CREATE POLICY "Events are viewable by everyone"
  ON public.events FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage events" ON public.events;
CREATE POLICY "Admins can manage events"
  ON public.events FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Seed Events
INSERT INTO public.events (id, title, date, location, description, registered_count, capacity, status)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Data Science Workshop 2026', '2026-05-15', 'Main Hall', 'Advanced Python for Data Analysis & Real-world Big Data Pipelines', 45, 100, 'published'),
  ('a0000000-0000-0000-0000-000000000002', 'Hackathon: Grid Runner', '2026-06-20', 'Cyber Lab 404', 'High stakes coding competition & algorithmic optimization hackathon', 120, 200, 'published')
ON CONFLICT (id) DO NOTHING;


-- 2. Audit Logs Table
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

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Users can insert audit logs" ON public.audit_logs;
CREATE POLICY "Users can insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (true);

-- Seed Initial Audit Logs
INSERT INTO public.audit_logs (action, user_email, target, status)
VALUES
  ('SYSTEM_INIT', 'system@datacamp.club', 'Supabase Database Layer Initialized', 'success'),
  ('SECURITY_POLICY', 'security@datacamp.club', 'Row Level Security Enforced on all tables', 'success')
ON CONFLICT DO NOTHING;


-- 3. Staff Table
CREATE TABLE IF NOT EXISTS public.staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Leaders',
  image TEXT DEFAULT 'https://picsum.photos/seed/pres/400/400',
  socials JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff viewable by everyone" ON public.staff;
CREATE POLICY "Staff viewable by everyone"
  ON public.staff FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage staff" ON public.staff;
CREATE POLICY "Admins can manage staff"
  ON public.staff FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Seed Staff
INSERT INTO public.staff (id, name, role, category, image, socials)
VALUES
  ('b0000000-0000-0000-0000-000000000001', 'Abdullah Hossam', 'President', 'Leaders', 'https://picsum.photos/seed/pres/400/400', '[{"platform": "linkedin", "url": "https://linkedin.com"}]'::jsonb),
  ('b0000000-0000-0000-0000-000000000002', 'Ammar Tahoun', 'Lead AI Architect & Founder', 'Technical', 'https://picsum.photos/seed/ammar/400/400', '[{"platform": "linkedin", "url": "https://linkedin.com"}]'::jsonb)
ON CONFLICT (id) DO NOTHING;


-- 4. Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'planning')),
  members TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Projects viewable by everyone" ON public.projects;
CREATE POLICY "Projects viewable by everyone"
  ON public.projects FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage projects" ON public.projects;
CREATE POLICY "Admins can manage projects"
  ON public.projects FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Seed Projects
INSERT INTO public.projects (id, title, description, status, members)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Data Pipeline X', 'Real-time ETL pipeline with Apache Kafka and PostgreSQL streaming.', 'active', ARRAY['Sys Admin', 'Ammar Tahoun'])
ON CONFLICT (id) DO NOTHING;


-- 5. Blog Table
CREATE TABLE IF NOT EXISTS public.blog (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  author TEXT NOT NULL DEFAULT 'Club Mentor',
  date TEXT NOT NULL DEFAULT '2026-04-10',
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.blog ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Blog viewable by everyone" ON public.blog;
CREATE POLICY "Blog viewable by everyone"
  ON public.blog FOR SELECT
  USING (status = 'published' OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage blog" ON public.blog;
CREATE POLICY "Admins can manage blog"
  ON public.blog FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Seed Blog
INSERT INTO public.blog (id, title, content, author, date, status)
VALUES
  ('d0000000-0000-0000-0000-000000000001', 'The Future of AI & Autonomous Agents', 'Discussion on LLMs, agentic pair programming, and production neural inference...', 'Abdullah Hossam', '2026-04-10', 'published')
ON CONFLICT (id) DO NOTHING;


-- 6. Gallery Table
CREATE TABLE IF NOT EXISTS public.gallery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Gallery viewable by everyone" ON public.gallery;
CREATE POLICY "Gallery viewable by everyone"
  ON public.gallery FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage gallery" ON public.gallery;
CREATE POLICY "Admins can manage gallery"
  ON public.gallery FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Seed Gallery
INSERT INTO public.gallery (id, url, title)
VALUES
  ('e0000000-0000-0000-0000-000000000001', 'https://picsum.photos/seed/event1/1200/800', 'Data Science Workshop 2025'),
  ('e0000000-0000-0000-0000-000000000002', 'https://picsum.photos/seed/event2/1200/800', 'AI Summit Keynote'),
  ('e0000000-0000-0000-0000-000000000003', 'https://picsum.photos/seed/event3/1200/800', 'Hackathon Winners'),
  ('e0000000-0000-0000-0000-000000000004', 'https://picsum.photos/seed/event4/1200/800', 'Tech Talk: Web3'),
  ('e0000000-0000-0000-0000-000000000005', 'https://picsum.photos/seed/event5/1200/800', 'Networking Night'),
  ('e0000000-0000-0000-0000-000000000006', 'https://picsum.photos/seed/event6/1200/800', 'Neural Networks Lab')
ON CONFLICT (id) DO NOTHING;


-- 7. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their notifications" ON public.notifications;
CREATE POLICY "Users can read their notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL OR public.is_admin());

DROP POLICY IF EXISTS "Users can update their notifications" ON public.notifications;
CREATE POLICY "Users can update their notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage notifications" ON public.notifications;
CREATE POLICY "Admins can manage notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (public.is_admin() OR auth.uid() = user_id);


-- 8. Settings Table
CREATE TABLE IF NOT EXISTS public.settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Settings are readable by everyone" ON public.settings;
CREATE POLICY "Settings are readable by everyone"
  ON public.settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can update settings" ON public.settings;
CREATE POLICY "Admins can update settings"
  ON public.settings FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Seed Settings
INSERT INTO public.settings (key, value)
VALUES
  ('general', '{"siteName": "DataCamp", "siteSubName": "Student Club", "siteDescription": "Empowering students with data science and AI skills.", "contactEmail": "contact@datacamp.club", "contactPhone": "+20 123 456 7890", "enableRegistration": true, "maintenanceMode": false, "themeColor": "#39FF14"}'::jsonb),
  ('home_content', '{"heroTitle": "THE FUTURE OF DATA IS HERE", "heroSubtitle": "Join the elite community of data scientists and software engineers.", "stats": [{"label": "ACTIVE MEMBERS", "value": "500+"}, {"label": "WORKSHOPS", "value": "50+"}, {"label": "PROJECTS", "value": "20+"}]}'::jsonb),
  ('about_data', '{"mission": "To empower students with data science skills.", "vision": "To be the leading tech community in the region.", "history": "Founded in 2024 with a vision for the future."}'::jsonb)
ON CONFLICT (key) DO NOTHING;


-- >>> START: 20261010000004_phase2_schema_hardening.sql <<<
-- ============================================================================
-- DataCamp Student Club - Migration 20261010000004: Phase 2 Schema Hardening
-- Secure Supabase schema, RLS corrections, admin bootstrap helpers, and
-- compatibility tables required by the current client during migration.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";

-- ============================================================================
-- 1. Admin bootstrap allow-list
-- Add the real admin email after the user provides it:
--   INSERT INTO public.admin_emails (email) VALUES ('admin@example.com');
-- Existing users can then be promoted with:
--   SELECT public.promote_admin_by_email('admin@example.com');
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.admin_emails (
  email CITEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.admin_emails ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read admin email allowlist" ON public.admin_emails;
CREATE POLICY "Admins can read admin email allowlist"
  ON public.admin_emails FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage admin email allowlist" ON public.admin_emails;
CREATE POLICY "Admins can manage admin email allowlist"
  ON public.admin_emails FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================================
-- 2. Core table hardening
-- ============================================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS xp INTEGER NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS github_url TEXT DEFAULT '';

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check CHECK (role IN ('user', 'admin'));

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_status_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_status_check CHECK (status IN ('active', 'inactive', 'pending'));

ALTER TABLE public.profiles
  ALTER COLUMN role SET DEFAULT 'user',
  ALTER COLUMN total_points SET DEFAULT 50,
  ALTER COLUMN xp SET DEFAULT 50;

CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_provider ON public.profiles(provider);

-- Compatibility table for current client paths still reading/writing public.users.
-- Phase 6 should migrate these reads to profiles and remove the duplicate path.
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

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_last_seen ON public.users(last_seen_at);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Lessons/enrollments need columns currently used by the client services.
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

ALTER TABLE public.lessons
  DROP CONSTRAINT IF EXISTS lessons_type_check;

ALTER TABLE public.lessons
  ADD CONSTRAINT lessons_type_check CHECK (type IN ('video', 'article', 'quiz', 'exercise', 'project'));

ALTER TABLE public.enrollments
  ADD COLUMN IF NOT EXISTS completed_modules TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS last_lesson_id TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS quiz_scores JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS certificate_id UUID;

ALTER TABLE public.enrollments
  DROP CONSTRAINT IF EXISTS enrollments_status_check;

ALTER TABLE public.enrollments
  ADD CONSTRAINT enrollments_status_check CHECK (status IN ('active', 'completed', 'dropped'));

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

ALTER TABLE public.courses
  DROP CONSTRAINT IF EXISTS courses_language_check;

ALTER TABLE public.courses
  ADD CONSTRAINT courses_language_check CHECK (language IN ('ar', 'en', 'both'));

-- Messages table was used by the app but missing from prior migrations.
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

CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_status ON public.messages(status);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Optional Phase 6 tables for data currently stored in Firebase/localStorage.
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

CREATE INDEX IF NOT EXISTS idx_points_log_user ON public.points_log(user_id);
CREATE INDEX IF NOT EXISTS idx_points_log_created_at ON public.points_log(created_at DESC);

ALTER TABLE public.points_log ENABLE ROW LEVEL SECURITY;

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

CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON public.user_achievements(user_id);

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

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

CREATE INDEX IF NOT EXISTS idx_certificates_user ON public.certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_verification ON public.certificates(verification_code);

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 3. Updated security definer helpers
-- ============================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  current_role TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;

  SELECT role INTO current_role
  FROM public.profiles
  WHERE id = auth.uid();

  RETURN current_role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_users_updated_at ON public.users;
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_courses_updated_at ON public.courses;
CREATE TRIGGER trg_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_messages_updated_at ON public.messages;
CREATE TRIGGER trg_messages_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Keep public.users in sync while the client is migrated away from it.
CREATE OR REPLACE FUNCTION public.sync_user_from_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    full_name,
    avatar_url,
    photo_url,
    role,
    provider,
    member_id,
    phone,
    faculty,
    university,
    status,
    total_points,
    xp,
    level,
    is_verified,
    created_at,
    last_sign_in_at,
    last_seen_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.full_name,
    COALESCE(NEW.avatar_url, ''),
    COALESCE(NEW.avatar_url, ''),
    CASE WHEN NEW.role = 'admin' THEN 'admin' ELSE 'member' END,
    COALESCE(NEW.provider, 'email'),
    NEW.member_id,
    COALESCE(NEW.phone, ''),
    COALESCE(NEW.faculty, 'Faculty of Computer Science & AI'),
    COALESCE(NEW.university, 'Innovation University'),
    COALESCE(NEW.status, 'active'),
    COALESCE(NEW.total_points, 50),
    COALESCE(NEW.xp, NEW.total_points, 50),
    COALESCE(NEW.level, 'RECRUIT'),
    COALESCE(NEW.is_verified, true),
    COALESCE(NEW.created_at, NOW()),
    NEW.last_sign_in_at,
    NEW.last_seen_at,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
    photo_url = EXCLUDED.photo_url,
    role = EXCLUDED.role,
    provider = EXCLUDED.provider,
    member_id = EXCLUDED.member_id,
    phone = EXCLUDED.phone,
    faculty = EXCLUDED.faculty,
    university = EXCLUDED.university,
    status = EXCLUDED.status,
    total_points = EXCLUDED.total_points,
    xp = EXCLUDED.xp,
    level = EXCLUDED.level,
    is_verified = EXCLUDED.is_verified,
    last_sign_in_at = EXCLUDED.last_sign_in_at,
    last_seen_at = EXCLUDED.last_seen_at,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_sync_user_from_profile ON public.profiles;
CREATE TRIGGER trg_sync_user_from_profile
  AFTER INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_from_profile();

-- Replaces prior hardcoded admin detection with the admin_emails allow-list.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  is_admin_user BOOLEAN;
  new_member_id TEXT;
  user_full_name TEXT;
  user_provider TEXT;
  user_avatar TEXT;
BEGIN
  is_admin_user := EXISTS (
    SELECT 1 FROM public.admin_emails
    WHERE email = NEW.email::citext
  );

  user_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    SPLIT_PART(NEW.email, '@', 1)
  );

  user_provider := CASE
    WHEN NEW.raw_app_meta_data->>'provider' = 'google' OR NEW.app_metadata->>'provider' = 'google' THEN 'google'
    ELSE 'email'
  END;

  user_avatar := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture',
    ''
  );

  IF is_admin_user THEN
    new_member_id := 'DC-ADM-' || UPPER(SUBSTRING(NEW.id::text, 1, 4));
  ELSE
    new_member_id := 'DC-' || NEXTVAL('public.member_id_seq')::text;
  END IF;

  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    avatar_url,
    role,
    provider,
    member_id,
    total_points,
    xp,
    level,
    is_verified,
    created_at,
    last_sign_in_at,
    last_seen_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    user_full_name,
    user_avatar,
    CASE WHEN is_admin_user THEN 'admin' ELSE 'user' END,
    user_provider,
    new_member_id,
    CASE WHEN is_admin_user THEN 10000 ELSE 50 END,
    CASE WHEN is_admin_user THEN 10000 ELSE 50 END,
    CASE WHEN is_admin_user THEN 'ARCHITECT' ELSE 'RECRUIT' END,
    true,
    NOW(),
    NOW(),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    avatar_url = CASE WHEN public.profiles.avatar_url = '' THEN EXCLUDED.avatar_url ELSE public.profiles.avatar_url END,
    role = CASE WHEN is_admin_user THEN 'admin' ELSE public.profiles.role END,
    last_sign_in_at = NOW(),
    last_seen_at = NOW(),
    updated_at = NOW();

  INSERT INTO public.auth_events (
    user_id,
    email,
    event_type,
    provider,
    user_agent,
    created_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    'signup',
    CASE WHEN user_provider = 'google' THEN 'google' ELSE 'email' END,
    'Supabase Auth Trigger',
    NOW()
  )
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.promote_admin_by_email(admin_email TEXT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.admin_emails (email)
  VALUES (admin_email::citext)
  ON CONFLICT (email) DO NOTHING;

  UPDATE public.profiles
  SET
    role = 'admin',
    total_points = GREATEST(total_points, 10000),
    xp = GREATEST(xp, 10000),
    level = 'ARCHITECT',
    is_verified = true,
    updated_at = NOW()
  WHERE email = admin_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- 4. RLS policy corrections
-- ============================================================================
DROP POLICY IF EXISTS "Profiles are readable by authenticated users and admins" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (
    public.is_admin()
    OR (
      auth.uid() = id
      AND role = (SELECT role FROM public.profiles p WHERE p.id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
CREATE POLICY "Admins can delete profiles"
  ON public.profiles FOR DELETE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Users can read own users mirror" ON public.users;
CREATE POLICY "Users can read own users mirror"
  ON public.users FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own users mirror" ON public.users;
CREATE POLICY "Users can update own users mirror"
  ON public.users FOR UPDATE
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (
    public.is_admin()
    OR (
      auth.uid() = id
      AND role = (SELECT role FROM public.users u WHERE u.id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Admins can delete users mirror" ON public.users;
CREATE POLICY "Admins can delete users mirror"
  ON public.users FOR DELETE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Users can insert their own auth events" ON public.auth_events;
CREATE POLICY "Users can insert their own auth events"
  ON public.auth_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all auth events" ON public.auth_events;
CREATE POLICY "Admins can view all auth events"
  ON public.auth_events FOR SELECT
  USING (public.is_admin() OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can submit contact messages" ON public.messages;
CREATE POLICY "Anyone can submit contact messages"
  ON public.messages FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can read contact messages" ON public.messages;
CREATE POLICY "Admins can read contact messages"
  ON public.messages FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update contact messages" ON public.messages;
CREATE POLICY "Admins can update contact messages"
  ON public.messages FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete contact messages" ON public.messages;
CREATE POLICY "Admins can delete contact messages"
  ON public.messages FOR DELETE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Users can view own points log" ON public.points_log;
CREATE POLICY "Users can view own points log"
  ON public.points_log FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can insert own points log" ON public.points_log;
CREATE POLICY "Users can insert own points log"
  ON public.points_log FOR INSERT
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can view own achievements" ON public.user_achievements;
CREATE POLICY "Users can view own achievements"
  ON public.user_achievements FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can insert own achievements" ON public.user_achievements;
CREATE POLICY "Users can insert own achievements"
  ON public.user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Certificates are viewable by owner, admins, or verification code" ON public.certificates;
CREATE POLICY "Certificates are viewable by owner, admins, or verification code"
  ON public.certificates FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can create own certificates" ON public.certificates;
CREATE POLICY "Users can create own certificates"
  ON public.certificates FOR INSERT
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- Tighten storage: course thumbnails are public-read but admin-write only.
DROP POLICY IF EXISTS "Admins can upload course thumbnails" ON storage.objects;
CREATE POLICY "Admins can upload course thumbnails"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'course-thumbnails' AND public.is_admin());

-- ============================================================================
-- 5. Realtime publications
-- ============================================================================
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.auth_events;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.courses;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;

-- Backfill users mirror for existing profiles.
INSERT INTO public.users (
  id,
  email,
  full_name,
  avatar_url,
  photo_url,
  role,
  provider,
  member_id,
  phone,
  faculty,
  university,
  status,
  total_points,
  xp,
  level,
  is_verified,
  created_at,
  last_sign_in_at,
  last_seen_at,
  updated_at
)
SELECT
  id,
  email,
  full_name,
  COALESCE(avatar_url, ''),
  COALESCE(avatar_url, ''),
  CASE WHEN role = 'admin' THEN 'admin' ELSE 'member' END,
  COALESCE(provider, 'email'),
  member_id,
  COALESCE(phone, ''),
  COALESCE(faculty, 'Faculty of Computer Science & AI'),
  COALESCE(university, 'Innovation University'),
  COALESCE(status, 'active'),
  COALESCE(total_points, 50),
  COALESCE(xp, total_points, 50),
  COALESCE(level, 'RECRUIT'),
  COALESCE(is_verified, true),
  COALESCE(created_at, NOW()),
  last_sign_in_at,
  last_seen_at,
  NOW()
FROM public.profiles
ON CONFLICT (id) DO NOTHING;


-- >>> START: 20261010000007_auth_rebuild_clean.sql <<<
-- ============================================================================
-- Migration: 20261010000007_auth_rebuild_clean.sql
-- Clean Rebuild of Auth Tables, Security Definer Functions, Triggers, and RLS
-- ============================================================================

-- 1. Ensure Profiles Table exists with proper constraints and FK to auth.users
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

-- Ensure columns exist if table was already created
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'email';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_sign_in_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Ensure Auth Events Table exists for auditing signups, logins, and logouts
CREATE TABLE IF NOT EXISTS public.auth_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('signup', 'login', 'logout')),
  provider TEXT NOT NULL CHECK (provider IN ('email', 'google')),
  user_agent TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for speedy queries by user or timestamp
CREATE INDEX IF NOT EXISTS idx_auth_events_user_id ON public.auth_events(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_events_created_at ON public.auth_events(created_at DESC);

-- 3. Secure Admin Helper Function (Security Definer with fixed search_path to prevent recursion & escalation)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND (
        role = 'admin'
        OR email = 'mart33645@gmail.com'
        OR email = 'admin@datacamp.club'
      )
  );
$$;

-- 4. Enable Row Level Security (RLS) on Profiles and Auth Events
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_events ENABLE ROW LEVEL SECURITY;

-- 5. Drop any conflicting legacy policies
DROP POLICY IF EXISTS "Profiles are readable by everyone or owner" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles read" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can read all auth_events" ON public.auth_events;
DROP POLICY IF EXISTS "Users can insert own auth_events" ON public.auth_events;

-- 6. Strict RLS Policies for Profiles:
-- Anyone authenticated can view public profile fields, but only owner or admin can see details
CREATE POLICY "Public profiles are viewable by authenticated users"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Also allow anon read for profile badges / public stats
CREATE POLICY "Public profiles are viewable by anon"
ON public.profiles
FOR SELECT
TO anon
USING (true);

-- Users can update only their own profile, but CANNOT alter their own role
CREATE POLICY "Users can update own profile except role"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  AND (
    -- Normal user cannot change their role to admin
    role = (SELECT role FROM public.profiles WHERE id = auth.uid())
    OR public.is_admin()
  )
);

-- Admins can update any profile (including changing roles)
CREATE POLICY "Admins can update any profile"
ON public.profiles
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Users can insert their own profile on signup
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- 7. Strict RLS Policies for Auth Events:
-- Users can insert their own auth events (signup, login, logout)
CREATE POLICY "Users can insert own auth_events"
ON public.auth_events
FOR INSERT
TO authenticated, anon
WITH CHECK (
  auth.uid() IS NULL OR auth.uid() = user_id
);

-- Users can view their own auth events; Admins can view all auth events
CREATE POLICY "Users view own auth events and Admins view all"
ON public.auth_events
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id OR public.is_admin()
);

-- 8. Fail-safe Automatic Trigger on auth.users (Handles email & Google signups automatically)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  raw_meta JSONB := NEW.raw_user_meta_data;
  detected_name TEXT;
  detected_avatar TEXT;
  detected_role TEXT := 'user';
  detected_provider TEXT := 'email';
  new_member_id TEXT;
BEGIN
  -- Detect provider
  IF NEW.raw_app_meta_data->>'provider' = 'google' THEN
    detected_provider := 'google';
  END IF;

  -- Detect Name
  detected_name := COALESCE(
    raw_meta->>'full_name',
    raw_meta->>'name',
    SPLIT_PART(NEW.email, '@', 1),
    'Club Member'
  );

  -- Detect Avatar
  detected_avatar := COALESCE(
    raw_meta->>'avatar_url',
    raw_meta->>'picture',
    'https://api.dicebear.com/7.x/bottts/svg?seed=' || NEW.id::TEXT
  );

  -- Super Admin detection by email
  IF LOWER(NEW.email) = 'mart33645@gmail.com' OR LOWER(NEW.email) = 'admin@datacamp.club' THEN
    detected_role := 'admin';
    new_member_id := 'DC-ADM-' || UPPER(SUBSTRING(NEW.id::TEXT, 1, 4));
  ELSE
    new_member_id := 'DC-' || UPPER(SUBSTRING(NEW.id::TEXT, 1, 6));
  END IF;

  -- Upsert Profile (Fail-safe: does not fail if profile exists)
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    avatar_url,
    role,
    provider,
    member_id,
    status,
    total_points,
    level,
    is_verified,
    created_at,
    last_sign_in_at,
    last_seen_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    detected_name,
    detected_avatar,
    detected_role,
    detected_provider,
    new_member_id,
    'active',
    CASE WHEN detected_role = 'admin' THEN 10000 ELSE 50 END,
    CASE WHEN detected_role = 'admin' THEN 'ARCHITECT' ELSE 'RECRUIT' END,
    TRUE,
    NOW(),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
    avatar_url = COALESCE(public.profiles.avatar_url, EXCLUDED.avatar_url),
    last_sign_in_at = NOW(),
    last_seen_at = NOW();

  -- Record signup auth_event
  BEGIN
    INSERT INTO public.auth_events (
      user_id,
      email,
      event_type,
      provider,
      created_at
    )
    VALUES (
      NEW.id,
      NEW.email,
      'signup',
      detected_provider,
      NOW()
    );
  EXCEPTION WHEN OTHERS THEN
    -- Never let logging error abort signup
    NULL;
  END;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Fail-safe catch-all: Log error in postgres log, do not block user creation
  RAISE WARNING 'handle_new_user failed for %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

-- Drop existing trigger if any and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 9. Auto-promote Ammar's Admin Email if profile exists
UPDATE public.profiles
SET role = 'admin', total_points = 10000, level = 'ARCHITECT'
WHERE LOWER(email) = 'mart33645@gmail.com';

-- 10. Enable Supabase Realtime for profiles and auth_events
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.auth_events;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;


-- >>> START: 20261011000000_form_builder.sql <<<
-- ============================================================================
-- Migration: 20261011000000_form_builder.sql
-- Description: Microsoft Forms-inspired Form Builder schema with RLS, server validation,
--              atomic submission RPC, Google Sheets sync logs, and attachment storage.
-- ============================================================================

-- 1. FORMS TABLE
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

-- Indexes for forms
CREATE INDEX IF NOT EXISTS idx_forms_slug ON public.forms(slug);
CREATE INDEX IF NOT EXISTS idx_forms_status ON public.forms(status);
CREATE INDEX IF NOT EXISTS idx_forms_created_by ON public.forms(created_by);
CREATE INDEX IF NOT EXISTS idx_forms_created_at ON public.forms(created_at DESC);

-- 2. FORM QUESTIONS TABLE
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

-- Indexes for form questions
CREATE INDEX IF NOT EXISTS idx_form_questions_form_id ON public.form_questions(form_id);
CREATE INDEX IF NOT EXISTS idx_form_questions_position ON public.form_questions(form_id, position ASC);

-- 3. FORM RESPONSES TABLE
CREATE TABLE IF NOT EXISTS public.form_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
    respondent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    respondent_email TEXT,
    submitted_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for form responses
CREATE INDEX IF NOT EXISTS idx_form_responses_form_id ON public.form_responses(form_id);
CREATE INDEX IF NOT EXISTS idx_form_responses_respondent_id ON public.form_responses(respondent_id);
CREATE INDEX IF NOT EXISTS idx_form_responses_submitted_at ON public.form_responses(submitted_at DESC);

-- Unique index enforcing one response per authenticated user when one_response_per_user is active
CREATE UNIQUE INDEX IF NOT EXISTS idx_form_responses_unique_user 
ON public.form_responses(form_id, respondent_id) 
WHERE respondent_id IS NOT NULL;

-- 4. FORM ANSWERS TABLE
CREATE TABLE IF NOT EXISTS public.form_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    response_id UUID NOT NULL REFERENCES public.form_responses(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.form_questions(id) ON DELETE CASCADE,
    value JSONB,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for form answers
CREATE INDEX IF NOT EXISTS idx_form_answers_response_id ON public.form_answers(response_id);
CREATE INDEX IF NOT EXISTS idx_form_answers_question_id ON public.form_answers(question_id);

-- 5. SYNC LOGS TABLE (Google Sheets synchronization logs)
CREATE TABLE IF NOT EXISTS public.sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
    response_id UUID REFERENCES public.form_responses(id) ON DELETE SET NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'synced', 'failed', 'retrying')),
    error TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for sync logs
CREATE INDEX IF NOT EXISTS idx_sync_logs_form_id ON public.sync_logs(form_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_response_id ON public.sync_logs(response_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_status ON public.sync_logs(status);
CREATE INDEX IF NOT EXISTS idx_sync_logs_created_at ON public.sync_logs(created_at DESC);

-- ============================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;

-- FORMS POLICIES
DROP POLICY IF EXISTS "forms_admin_manage_all" ON public.forms;
CREATE POLICY "forms_admin_manage_all"
ON public.forms
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "forms_public_read_published" ON public.forms;
CREATE POLICY "forms_public_read_published"
ON public.forms
FOR SELECT
TO anon, authenticated
USING (
    status = 'published'
    AND (opens_at IS NULL OR opens_at <= timezone('utc'::text, now()))
    AND (closes_at IS NULL OR closes_at >= timezone('utc'::text, now()))
);

-- FORM QUESTIONS POLICIES
DROP POLICY IF EXISTS "form_questions_admin_manage_all" ON public.form_questions;
CREATE POLICY "form_questions_admin_manage_all"
ON public.form_questions
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "form_questions_public_read_published" ON public.form_questions;
CREATE POLICY "form_questions_public_read_published"
ON public.form_questions
FOR SELECT
TO anon, authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.forms
        WHERE forms.id = form_questions.form_id
          AND forms.status = 'published'
          AND (forms.opens_at IS NULL OR forms.opens_at <= timezone('utc'::text, now()))
          AND (forms.closes_at IS NULL OR forms.closes_at >= timezone('utc'::text, now()))
    )
);

-- FORM RESPONSES POLICIES
DROP POLICY IF EXISTS "form_responses_admin_read_all" ON public.form_responses;
CREATE POLICY "form_responses_admin_read_all"
ON public.form_responses
FOR SELECT
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "form_responses_admin_delete" ON public.form_responses;
CREATE POLICY "form_responses_admin_delete"
ON public.form_responses
FOR DELETE
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "form_responses_insert_allowed" ON public.form_responses;
CREATE POLICY "form_responses_insert_allowed"
ON public.form_responses
FOR INSERT
TO anon, authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.forms
        WHERE forms.id = form_responses.form_id
          AND forms.status = 'published'
          AND (forms.opens_at IS NULL OR forms.opens_at <= timezone('utc'::text, now()))
          AND (forms.closes_at IS NULL OR forms.closes_at >= timezone('utc'::text, now()))
          AND (forms.allow_anonymous = true OR auth.uid() IS NOT NULL)
    )
    AND (
        respondent_id IS NULL OR respondent_id = auth.uid() OR public.is_admin()
    )
);

-- FORM ANSWERS POLICIES
DROP POLICY IF EXISTS "form_answers_admin_read_all" ON public.form_answers;
CREATE POLICY "form_answers_admin_read_all"
ON public.form_answers
FOR SELECT
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "form_answers_admin_delete" ON public.form_answers;
CREATE POLICY "form_answers_admin_delete"
ON public.form_answers
FOR DELETE
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "form_answers_insert_allowed" ON public.form_answers;
CREATE POLICY "form_answers_insert_allowed"
ON public.form_answers
FOR INSERT
TO anon, authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.form_responses
        JOIN public.forms ON forms.id = form_responses.form_id
        WHERE form_responses.id = form_answers.response_id
          AND forms.status = 'published'
          AND (form_responses.respondent_id IS NULL OR form_responses.respondent_id = auth.uid() OR public.is_admin())
    )
);

-- SYNC LOGS POLICIES
DROP POLICY IF EXISTS "sync_logs_admin_all" ON public.sync_logs;
CREATE POLICY "sync_logs_admin_all"
ON public.sync_logs
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ============================================================================
-- 7. DATABASE VALIDATION FUNCTIONS & ATOMIC SUBMISSION RPC
-- ============================================================================

-- Function to check if a specific user / email has already responded
CREATE OR REPLACE FUNCTION public.has_user_responded(
    p_form_id UUID,
    p_email TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_clean_email TEXT := LOWER(TRIM(COALESCE(p_email, '')));
BEGIN
    -- Check by user ID if logged in
    IF v_user_id IS NOT NULL THEN
        IF EXISTS (
            SELECT 1 FROM public.form_responses 
            WHERE form_id = p_form_id AND respondent_id = v_user_id
        ) THEN
            RETURN true;
        END IF;
    END IF;

    -- Check by email if provided
    IF v_clean_email <> '' THEN
        IF EXISTS (
            SELECT 1 FROM public.form_responses 
            WHERE form_id = p_form_id AND LOWER(TRIM(respondent_email)) = v_clean_email
        ) THEN
            RETURN true;
        END IF;
    END IF;

    RETURN false;
END;
$$;

-- Secure atomic submission procedure that performs strict server-side validation
CREATE OR REPLACE FUNCTION public.submit_form_response(
    p_form_id UUID,
    p_answers JSONB, -- Array of { question_id: UUID, value: any }
    p_respondent_email TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_form RECORD;
    v_question RECORD;
    v_user_id UUID := auth.uid();
    v_clean_email TEXT := LOWER(TRIM(COALESCE(p_respondent_email, '')));
    v_response_id UUID;
    v_answer_item JSONB;
    v_answer_value JSONB;
    v_found_value BOOLEAN;
    v_now TIMESTAMPTZ := timezone('utc'::text, now());
BEGIN
    -- 1. Fetch and validate parent form
    SELECT * INTO v_form FROM public.forms WHERE id = p_form_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Form not found';
    END IF;

    IF v_form.status <> 'published' THEN
        RAISE EXCEPTION 'This form is not accepting responses (Status: %)', v_form.status;
    END IF;

    IF v_form.opens_at IS NOT NULL AND v_form.opens_at > v_now THEN
        RAISE EXCEPTION 'This form has not opened yet';
    END IF;

    IF v_form.closes_at IS NOT NULL AND v_form.closes_at < v_now THEN
        RAISE EXCEPTION 'This form is closed and no longer accepting submissions';
    END IF;

    -- 2. Verify authorization
    IF NOT v_form.allow_anonymous AND v_user_id IS NULL THEN
        RAISE EXCEPTION 'You must be logged in to submit this form';
    END IF;

    -- 3. Check "one response per user" restriction
    IF v_form.one_response_per_user THEN
        IF v_user_id IS NOT NULL THEN
            IF EXISTS (SELECT 1 FROM public.form_responses WHERE form_id = p_form_id AND respondent_id = v_user_id) THEN
                RAISE EXCEPTION 'You have already submitted a response to this form';
            END IF;
        ELSIF v_clean_email <> '' THEN
            IF EXISTS (SELECT 1 FROM public.form_responses WHERE form_id = p_form_id AND LOWER(TRIM(respondent_email)) = v_clean_email) THEN
                RAISE EXCEPTION 'A response has already been recorded for this email';
            END IF;
        ELSE
            -- If one response per user is enforced and user is anonymous without email
            RAISE EXCEPTION 'Please sign in or provide your email to submit this form';
        END IF;
    END IF;

    -- 4. Server-side validation of required questions
    FOR v_question IN (
        SELECT * FROM public.form_questions 
        WHERE form_id = p_form_id AND type <> 'section_header'
    ) LOOP
        IF v_question.required THEN
            v_found_value := false;
            
            -- Search for matching answer in p_answers JSON array
            FOR v_answer_item IN SELECT * FROM jsonb_array_elements(p_answers) LOOP
                IF (v_answer_item->>'question_id')::UUID = v_question.id THEN
                    v_answer_value := v_answer_item->'value';
                    IF v_answer_value IS NOT NULL AND v_answer_value <> 'null'::jsonb AND v_answer_value <> '""'::jsonb AND v_answer_value <> '[]'::jsonb THEN
                        v_found_value := true;
                    END IF;
                END IF;
            END LOOP;

            IF NOT v_found_value THEN
                RAISE EXCEPTION 'Question "%" is required', v_question.title;
            END IF;
        END IF;
    END LOOP;

    -- 5. Insert response record
    INSERT INTO public.form_responses (
        form_id,
        respondent_id,
        respondent_email,
        submitted_at,
        metadata
    ) VALUES (
        p_form_id,
        v_user_id,
        CASE WHEN v_clean_email <> '' THEN v_clean_email ELSE NULL END,
        v_now,
        p_metadata
    )
    RETURNING id INTO v_response_id;

    -- 6. Insert answers
    FOR v_answer_item IN SELECT * FROM jsonb_array_elements(p_answers) LOOP
        INSERT INTO public.form_answers (
            response_id,
            question_id,
            value
        ) VALUES (
            v_response_id,
            (v_answer_item->>'question_id')::UUID,
            v_answer_item->'value'
        );
    END LOOP;

    -- Return success payload with response ID and success message
    RETURN jsonb_build_object(
        'success', true,
        'response_id', v_response_id,
        'success_message', v_form.success_message,
        'sheets_sync_enabled', v_form.sheets_sync_enabled
    );
END;
$$;

-- ============================================================================
-- 8. STORAGE BUCKET FOR FORM ATTACHMENTS
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'form-attachments',
    'form-attachments',
    false,
    10485760, -- 10MB limit
    ARRAY[
        'image/png', 'image/jpeg', 'image/gif', 'image/webp',
        'application/pdf', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain', 'application/zip'
    ]
)
ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = 10485760;

-- Storage object policies for form-attachments
DROP POLICY IF EXISTS "form_attachments_admin_all" ON storage.objects;
CREATE POLICY "form_attachments_admin_all"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'form-attachments' AND public.is_admin())
WITH CHECK (bucket_id = 'form-attachments' AND public.is_admin());

DROP POLICY IF EXISTS "form_attachments_upload_public" ON storage.objects;
CREATE POLICY "form_attachments_upload_public"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (
    bucket_id = 'form-attachments'
);

-- ============================================================================
-- 9. UPDATED_AT TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_forms_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_forms_updated_at ON public.forms;
CREATE TRIGGER trigger_forms_updated_at
BEFORE UPDATE ON public.forms
FOR EACH ROW
EXECUTE FUNCTION public.handle_forms_updated_at();

