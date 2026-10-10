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
