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
