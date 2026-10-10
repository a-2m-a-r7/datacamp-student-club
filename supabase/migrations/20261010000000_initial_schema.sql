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
