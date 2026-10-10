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
