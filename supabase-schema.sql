-- ============================================================================
-- DataCamp Student Club - Complete Supabase Database Schema
-- Run this script in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- ============================================================================

-- 1. Create Public Users Profile Table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL DEFAULT 'Member',
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('super_admin', 'admin', 'member')),
  member_id TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  total_points INTEGER NOT NULL DEFAULT 0,
  level TEXT NOT NULL DEFAULT 'EXPLORER',
  is_verified BOOLEAN NOT NULL DEFAULT true,
  photo_url TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  university TEXT DEFAULT 'Innovation University',
  faculty TEXT DEFAULT 'Computer Science & AI',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast queries
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_member_id ON public.users(member_id);

-- 2. Automatic Member ID Counter Sequence
CREATE SEQUENCE IF NOT EXISTS member_id_seq START 1001;

-- 3. Automatic Trigger to Handle New User Signups (Google + Email)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  is_admin_account BOOLEAN;
  new_member_id TEXT;
  user_full_name TEXT;
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

  -- Generate unique Member ID
  IF is_admin_account THEN
    new_member_id := 'DC-SUPER-' || UPPER(SUBSTRING(NEW.id::text, 1, 4));
  ELSE
    new_member_id := 'DC-' || NEXTVAL('member_id_seq')::text;
  END IF;

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
    NEW.id,
    NEW.email,
    user_full_name,
    CASE WHEN is_admin_account THEN 'super_admin' ELSE 'member' END,
    new_member_id,
    'active',
    CASE WHEN is_admin_account THEN 10000 ELSE 50 END,
    CASE WHEN is_admin_account THEN 'ARCHITECT' ELSE 'EXPLORER' END,
    true,
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind Trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Public can read all profiles (needed for leaderboards, roster, members list)
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.users FOR SELECT 
  USING (true);

-- Authenticated users can insert their own profile
CREATE POLICY "Users can insert their own profile" 
  ON public.users FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile, or Super Admin can update any profile
CREATE POLICY "Users and admins can update profiles" 
  ON public.users FOR UPDATE 
  USING (
    auth.uid() = id OR 
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'super_admin')
  );

-- Only Super Admins can delete users
CREATE POLICY "Super Admins can delete users" 
  ON public.users FOR DELETE 
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'super_admin')
  );

-- 5. Additional DataCamp Club Tables (Events, Settings, Logs)
CREATE TABLE IF NOT EXISTS public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  capacity INTEGER DEFAULT 100,
  registered_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'published',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Events viewable by everyone" ON public.events FOR SELECT USING (true);
CREATE POLICY "Events editable by admins" ON public.events FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('super_admin', 'admin'))
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  user_email TEXT,
  target TEXT,
  status TEXT DEFAULT 'success',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Audit logs readable by admins" ON public.audit_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'super_admin')
);
CREATE POLICY "Audit logs insertable by anyone" ON public.audit_logs FOR INSERT WITH CHECK (true);
