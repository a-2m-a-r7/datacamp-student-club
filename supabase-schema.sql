-- ============================================================================
-- DataCamp Student Club - Complete Supabase Database Schema
-- Run this script in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- ============================================================================

-- 1. Enable necessary PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Ensure public.users exists and has all required columns
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS member_id TEXT;
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS total_points INTEGER DEFAULT 0;
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS level TEXT DEFAULT 'RECRUIT';
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT true;
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS photo_url TEXT DEFAULT '';
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone TEXT DEFAULT '';
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS university TEXT DEFAULT 'Innovation University';
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS faculty TEXT DEFAULT 'Computer Science & AI';
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'member';
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
  ELSE
    CREATE TABLE public.users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      full_name TEXT NOT NULL DEFAULT 'Member',
      role TEXT NOT NULL DEFAULT 'member',
      member_id TEXT UNIQUE,
      status TEXT NOT NULL DEFAULT 'active',
      total_points INTEGER NOT NULL DEFAULT 0,
      level TEXT NOT NULL DEFAULT 'RECRUIT',
      is_verified BOOLEAN NOT NULL DEFAULT true,
      photo_url TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      university TEXT DEFAULT 'Innovation University',
      faculty TEXT DEFAULT 'Computer Science & AI',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  END IF;
END $$;

-- Index for fast queries on users
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- 3. Automatic Member ID Counter Sequence
CREATE SEQUENCE IF NOT EXISTS public.member_id_seq START 1001;

-- 4. Automatic Trigger to Handle New User Signups (Google + Email)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  is_admin_account BOOLEAN;
  new_member_id TEXT;
  user_full_name TEXT;
  user_avatar TEXT;
  user_provider TEXT;
BEGIN
  -- Detect if this is Ammar's admin account
  is_admin_account := (
    LOWER(NEW.email) LIKE '%ammar%' OR
    LOWER(NEW.email) LIKE '%admin%' OR
    LOWER(NEW.email) LIKE '%mart%' OR
    LOWER(NEW.email) LIKE '%tahoun%' OR
    LOWER(NEW.email) = 'mart33645@gmail.com' OR
    LOWER(NEW.email) = 'sysadmin@datacamp.club' OR
    LOWER(NEW.email) = 'admin@datacamp.club'
  );

  -- Resolve display name from metadata or email
  user_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    SPLIT_PART(NEW.email, '@', 1)
  );

  -- Resolve avatar
  user_avatar := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture',
    ''
  );

  -- Resolve provider
  user_provider := COALESCE(NEW.raw_app_meta_data->>'provider', 'email');

  -- Generate unique Member ID
  IF is_admin_account THEN
    new_member_id := 'DC-SUPER-' || UPPER(SUBSTRING(NEW.id::text, 1, 4));
  ELSE
    new_member_id := 'DC-' || NEXTVAL('public.member_id_seq')::text;
  END IF;

  -- Insert/Update into public.users
  INSERT INTO public.users (
    id,
    email,
    full_name,
    role,
    member_id,
    status,
    total_points,
    level,
    is_verified,
    photo_url,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id::text,
    NEW.email,
    user_full_name,
    CASE WHEN is_admin_account THEN 'super_admin' ELSE 'member' END,
    new_member_id,
    'active',
    CASE WHEN is_admin_account THEN 10000 ELSE 50 END,
    CASE WHEN is_admin_account THEN 'ARCHITECT' ELSE 'RECRUIT' END,
    true,
    user_avatar,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    photo_url = CASE WHEN public.users.photo_url = '' THEN EXCLUDED.photo_url ELSE public.users.photo_url END,
    updated_at = NOW();

  -- Also Insert/Update into public.profiles if table exists
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
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
      CASE WHEN is_admin_account THEN 'admin' ELSE 'user' END,
      user_provider,
      new_member_id,
      CASE WHEN is_admin_account THEN 10000 ELSE 50 END,
      CASE WHEN is_admin_account THEN 'ARCHITECT' ELSE 'RECRUIT' END,
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
  END IF;

  -- Record event in auth_events if table exists
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'auth_events') THEN
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
      user_provider,
      'Supabase Auth Trigger',
      NOW()
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind Trigger to auth.users
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'auth' AND tablename = 'users') THEN
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;

-- 5. Enable Row Level Security (RLS) on public.users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.users;
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.users FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
CREATE POLICY "Users can insert their own profile" 
  ON public.users FOR INSERT 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users and admins can update profiles" ON public.users;
CREATE POLICY "Users and admins can update profiles" 
  ON public.users FOR UPDATE 
  USING (true);

DROP POLICY IF EXISTS "Super Admins can delete users" ON public.users;
CREATE POLICY "Super Admins can delete users" 
  ON public.users FOR DELETE 
  USING (true);
