-- Phase 6: public content data hardening and event registration.

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

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS academic_year TEXT;

CREATE OR REPLACE FUNCTION public.register_for_event(target_event_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  current_user_email TEXT;
  event_row public.events%ROWTYPE;
  registration JSONB;
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT email INTO current_user_email
  FROM auth.users
  WHERE id = current_user_id;

  SELECT * INTO event_row
  FROM public.events
  WHERE id = target_event_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Event not found';
  END IF;

  IF COALESCE(event_row.registered_count, 0) >= COALESCE(event_row.capacity, 0) THEN
    RAISE EXCEPTION 'Event is full';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM jsonb_array_elements(COALESCE(event_row.registrations, '[]'::JSONB)) item
    WHERE item->>'userId' = current_user_id::TEXT
  ) THEN
    RAISE EXCEPTION 'Already registered';
  END IF;

  registration := jsonb_build_object(
    'userId', current_user_id::TEXT,
    'userEmail', COALESCE(current_user_email, ''),
    'eventId', target_event_id::TEXT,
    'eventTitle', event_row.title,
    'registeredAt', NOW(),
    'qrCode', 'REG-' || target_event_id::TEXT || '-' || current_user_id::TEXT
  );

  UPDATE public.events
  SET
    registered_count = COALESCE(registered_count, 0) + 1,
    registrations = COALESCE(registrations, '[]'::JSONB) || jsonb_build_array(registration)
  WHERE id = target_event_id;

  INSERT INTO public.notifications (user_id, title, message, read, created_at)
  VALUES (
    current_user_id,
    'Event Registration Confirmed',
    'You are registered for ' || event_row.title,
    FALSE,
    NOW()
  );

  RETURN registration;
END;
$$;

GRANT EXECUTE ON FUNCTION public.register_for_event(UUID) TO authenticated;

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.staff;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.blog;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.gallery;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.settings;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;
