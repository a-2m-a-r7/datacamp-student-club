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
