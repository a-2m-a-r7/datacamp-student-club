-- Allow required questions skipped by an explicit forward branch to remain unanswered.
CREATE OR REPLACE FUNCTION public.submit_form_response(
    p_form_id UUID,
    p_answers JSONB,
    p_respondent_email TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=public
AS $$
DECLARE
    f public.forms;
    q public.form_questions;
    a JSONB;
    v JSONB;
    id UUID;
    email TEXT := lower(trim(COALESCE(p_respondent_email, '')));
    n INTEGER;
BEGIN
    SELECT * INTO f FROM forms WHERE forms.id = p_form_id FOR UPDATE;
    IF NOT FOUND OR f.status <> 'published' THEN RAISE EXCEPTION 'Form unavailable'; END IF;
    IF (f.opens_at IS NOT NULL AND f.opens_at > now()) OR (f.closes_at IS NOT NULL AND f.closes_at < now()) THEN
        RAISE EXCEPTION 'Form is closed';
    END IF;
    IF NOT f.allow_anonymous AND auth.uid() IS NULL THEN RAISE EXCEPTION 'Sign in before submitting'; END IF;
    IF auth.uid() IS NOT NULL THEN PERFORM public.require_active_user(); END IF;
    IF (f.collect_email OR email <> '') AND email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' THEN
        RAISE EXCEPTION 'Valid email required';
    END IF;
    IF length(email) > 254 OR jsonb_typeof(p_answers) <> 'array' OR jsonb_array_length(p_answers) > 200 THEN
        RAISE EXCEPTION 'Invalid response';
    END IF;
    IF f.one_response_per_user THEN
        IF auth.uid() IS NULL AND email = '' THEN RAISE EXCEPTION 'Email or account required'; END IF;
        IF EXISTS (
            SELECT 1
            FROM form_responses
            WHERE form_id = p_form_id
              AND ((auth.uid() IS NOT NULL AND respondent_id = auth.uid())
                OR (email <> '' AND lower(respondent_email) = email))
        ) THEN
            RAISE EXCEPTION 'Already submitted';
        END IF;
    END IF;

    FOR a IN SELECT value FROM jsonb_array_elements(p_answers) LOOP
        SELECT * INTO q
        FROM form_questions
        WHERE form_id = p_form_id
          AND form_questions.id = (a->>'question_id')::uuid
          AND type <> 'section_header';
        IF NOT FOUND THEN RAISE EXCEPTION 'Question does not belong to this form'; END IF;

        SELECT count(*) INTO n
        FROM jsonb_array_elements(p_answers) x
        WHERE x->>'question_id' = a->>'question_id';
        IF n <> 1 THEN RAISE EXCEPTION 'Duplicate answer'; END IF;

        v := a->'value';
        IF length(v::text) > 20000 THEN RAISE EXCEPTION 'Answer too long'; END IF;
        IF v IS NOT NULL AND v NOT IN ('null'::jsonb, '""'::jsonb, '[]'::jsonb) THEN
            IF q.type IN ('short_text', 'long_text', 'email', 'date', 'time') AND jsonb_typeof(v) <> 'string' THEN
                RAISE EXCEPTION 'Text answer required';
            END IF;
            IF q.type = 'email' AND (v#>>'{}') !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' THEN
                RAISE EXCEPTION 'Invalid email answer';
            END IF;
            IF q.type = 'date' THEN PERFORM (v#>>'{}')::date; END IF;
            IF q.type = 'time' THEN PERFORM (v#>>'{}')::time; END IF;
            IF q.type IN ('number', 'rating', 'linear_scale') THEN
                IF jsonb_typeof(v) NOT IN ('number', 'string') THEN RAISE EXCEPTION 'Numeric answer required'; END IF;
                PERFORM (v#>>'{}')::numeric;
                IF q.settings ? 'min' AND (v#>>'{}')::numeric < (q.settings->>'min')::numeric THEN
                    RAISE EXCEPTION 'Value below minimum';
                END IF;
                IF q.settings ? 'max' AND (v#>>'{}')::numeric > (q.settings->>'max')::numeric THEN
                    RAISE EXCEPTION 'Value above maximum';
                END IF;
            END IF;
            IF q.type IN ('single_choice', 'dropdown')
               AND NOT EXISTS (
                   SELECT 1
                   FROM jsonb_array_elements(q.options) opt
                   WHERE opt->>'id' = v#>>'{}'
               ) THEN
                RAISE EXCEPTION 'Invalid option';
            END IF;
            IF q.type IN ('multiple_choice', 'ranking') THEN
                IF jsonb_typeof(v) <> 'array' THEN RAISE EXCEPTION 'Option list required'; END IF;
                IF EXISTS (
                    SELECT 1
                    FROM jsonb_array_elements_text(v) choice
                    WHERE NOT EXISTS (
                        SELECT 1
                        FROM jsonb_array_elements(q.options) opt
                        WHERE opt->>'id' = choice
                    )
                ) THEN
                    RAISE EXCEPTION 'Invalid option';
                END IF;
            END IF;
            IF q.type = 'file_upload'
               AND (jsonb_typeof(v) <> 'object' OR COALESCE(v->>'path', '') NOT LIKE p_form_id::text || '/%') THEN
                RAISE EXCEPTION 'Invalid file attachment';
            END IF;
        END IF;
    END LOOP;

    FOR q IN
        SELECT *
        FROM form_questions
        WHERE form_id = p_form_id
          AND required
          AND type <> 'section_header'
    LOOP
        SELECT value->'value' INTO v
        FROM jsonb_array_elements(p_answers)
        WHERE value->>'question_id' = q.id::text;

        IF NOT EXISTS (
            SELECT 1
            FROM form_questions branch
            JOIN jsonb_array_elements(p_answers) branch_answer
              ON branch_answer->>'question_id' = branch.id::text
            JOIN jsonb_array_elements(branch.options) selected_option
              ON selected_option->>'id' = branch_answer->>'value'
            WHERE branch.form_id = p_form_id
              AND branch.type IN ('single_choice', 'dropdown')
              AND branch.position < q.position
              AND (
                  selected_option->>'goToQuestionId' = 'end'
                  OR EXISTS (
                      SELECT 1
                      FROM form_questions target
                      WHERE target.form_id = p_form_id
                        AND target.id::text = selected_option->>'goToQuestionId'
                        AND target.position > q.position
                  )
              )
        ) AND (
            v IS NULL
            OR v IN ('null'::jsonb, '""'::jsonb, '[]'::jsonb)
            OR (jsonb_typeof(v) = 'string' AND trim(v#>>'{}') = '')
        ) THEN
            RAISE EXCEPTION 'Required answer missing: %', q.title;
        END IF;
    END LOOP;

    INSERT INTO form_responses(form_id, respondent_id, respondent_email, metadata)
    VALUES (p_form_id, auth.uid(), NULLIF(email, ''), p_metadata)
    RETURNING form_responses.id INTO id;

    INSERT INTO form_answers(response_id, question_id, value)
    SELECT id, (x->>'question_id')::uuid, x->'value'
    FROM jsonb_array_elements(p_answers) x;

    RETURN jsonb_build_object(
        'success', true,
        'response_id', id,
        'success_message', f.success_message,
        'sheets_sync_enabled', f.sheets_sync_enabled
    );
END;
$$;
