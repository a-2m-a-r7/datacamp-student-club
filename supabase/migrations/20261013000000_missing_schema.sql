-- PREPARED ONLY. Review and apply using the Supabase SQL editor on staging first.
-- No sample INSERTs, secrets, or user data deletions. Creates missing tables only.
BEGIN;
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
COMMIT;
