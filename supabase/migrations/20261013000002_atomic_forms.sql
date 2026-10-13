BEGIN;
-- Preserve question IDs and historical answers. A failed save rolls back the entire transaction.
CREATE OR REPLACE FUNCTION public.save_form_questions(p_form_id uuid,p_questions jsonb) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE q jsonb; qid uuid; ids uuid[]:='{}'; position integer:=0;
BEGIN
 IF NOT public.is_admin() THEN RAISE EXCEPTION 'Administrator required'; END IF;
 PERFORM 1 FROM forms WHERE id=p_form_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Form not found'; END IF;
 IF jsonb_typeof(p_questions)<>'array' OR jsonb_array_length(p_questions)>200 THEN RAISE EXCEPTION 'Invalid question list'; END IF;
 FOR q IN SELECT value FROM jsonb_array_elements(p_questions) LOOP
  qid:=COALESCE(NULLIF(q->>'id','')::uuid,gen_random_uuid());
  IF qid=ANY(ids) OR EXISTS(SELECT 1 FROM form_questions WHERE id=qid AND form_id<>p_form_id) THEN RAISE EXCEPTION 'Invalid question identity'; END IF;
  IF length(q->>'title') NOT BETWEEN 1 AND 1000 THEN RAISE EXCEPTION 'Question title required (maximum 1000 characters)'; END IF;
  ids:=array_append(ids,qid);
  INSERT INTO form_questions(id,form_id,type,title,description,required,position,options,settings)
  VALUES(qid,p_form_id,q->>'type',q->>'title',COALESCE(q->>'description',''),COALESCE((q->>'required')::boolean,false),position,
    COALESCE(q->'options','[]'),COALESCE(q->'settings','{}'))
  ON CONFLICT(id) DO UPDATE SET type=EXCLUDED.type,title=EXCLUDED.title,description=EXCLUDED.description,
    required=EXCLUDED.required,position=EXCLUDED.position,options=EXCLUDED.options,settings=EXCLUDED.settings;
  position:=position+1;
 END LOOP;
 IF EXISTS(SELECT 1 FROM form_questions fq JOIN form_answers a ON a.question_id=fq.id
  WHERE fq.form_id=p_form_id AND NOT fq.id=ANY(ids)) THEN RAISE EXCEPTION 'Cannot remove a question with saved answers; duplicate the form instead'; END IF;
 DELETE FROM form_questions WHERE form_id=p_form_id AND NOT id=ANY(ids);
 RETURN COALESCE((SELECT jsonb_agg(fq ORDER BY fq.position) FROM form_questions fq WHERE fq.form_id=p_form_id),'[]');
END;
$$;
CREATE OR REPLACE FUNCTION public.save_form(p_form jsonb,p_questions jsonb) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE row public.forms; target_id uuid; saved jsonb;
BEGIN
 IF NOT public.is_admin() THEN RAISE EXCEPTION 'Administrator required'; END IF;
 target_id:=NULLIF(p_form->>'id','')::uuid;
 IF target_id IS NOT NULL THEN
  SELECT * INTO row FROM forms WHERE forms.id=target_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Form not found'; END IF;
  p_form:=to_jsonb(row)||p_form;
 END IF;
 IF length(p_form->>'title') NOT BETWEEN 1 AND 200 OR (p_form->>'slug') !~ '^[a-zA-Z0-9_-]{1,150}$' THEN RAISE EXCEPTION 'Valid title and slug required'; END IF;
 IF NULLIF(p_form->>'opens_at','')::timestamptz>NULLIF(p_form->>'closes_at','')::timestamptz THEN RAISE EXCEPTION 'Closing time must follow opening time'; END IF;
 INSERT INTO forms(id,title,description,slug,status,theme,allow_anonymous,one_response_per_user,collect_email,opens_at,closes_at,
   success_message,sheets_sync_enabled,created_by)
 VALUES(COALESCE(target_id,gen_random_uuid()),p_form->>'title',COALESCE(p_form->>'description',''),p_form->>'slug',COALESCE(p_form->>'status','draft'),
   COALESCE(p_form->'theme','{}'),COALESCE((p_form->>'allow_anonymous')::boolean,true),COALESCE((p_form->>'one_response_per_user')::boolean,false),
   COALESCE((p_form->>'collect_email')::boolean,false),NULLIF(p_form->>'opens_at','')::timestamptz,NULLIF(p_form->>'closes_at','')::timestamptz,
   COALESCE(p_form->>'success_message','Thank you. Your response was saved.'),COALESCE((p_form->>'sheets_sync_enabled')::boolean,false),auth.uid())
 ON CONFLICT ON CONSTRAINT forms_pkey DO UPDATE SET title=EXCLUDED.title,description=EXCLUDED.description,slug=EXCLUDED.slug,status=EXCLUDED.status,
   theme=EXCLUDED.theme,allow_anonymous=EXCLUDED.allow_anonymous,one_response_per_user=EXCLUDED.one_response_per_user,collect_email=EXCLUDED.collect_email,
   opens_at=EXCLUDED.opens_at,closes_at=EXCLUDED.closes_at,success_message=EXCLUDED.success_message,sheets_sync_enabled=EXCLUDED.sheets_sync_enabled,updated_at=now()
 RETURNING * INTO row;
 saved:=public.save_form_questions(row.id,p_questions);
 RETURN jsonb_build_object('form',to_jsonb(row),'questions',saved);
END;
$$;
CREATE OR REPLACE FUNCTION public.has_user_responded(p_form_id uuid,p_email text DEFAULT NULL) RETURNS boolean
LANGUAGE sql SECURITY DEFINER STABLE SET search_path=public AS $$
 SELECT EXISTS(SELECT 1 FROM form_responses WHERE form_id=p_form_id AND respondent_id=auth.uid());
$$;
CREATE OR REPLACE FUNCTION public.submit_form_response(p_form_id uuid,p_answers jsonb,p_respondent_email text DEFAULT NULL,p_metadata jsonb DEFAULT '{}') RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE f public.forms; q public.form_questions; a jsonb; v jsonb; id uuid; email text:=lower(trim(COALESCE(p_respondent_email,''))); n integer;
BEGIN
 SELECT * INTO f FROM forms WHERE forms.id=p_form_id FOR UPDATE;
 IF NOT FOUND OR f.status<>'published' THEN RAISE EXCEPTION 'Form unavailable'; END IF;
 IF (f.opens_at IS NOT NULL AND f.opens_at>now()) OR (f.closes_at IS NOT NULL AND f.closes_at<now()) THEN RAISE EXCEPTION 'Form is closed'; END IF;
 IF NOT f.allow_anonymous AND auth.uid() IS NULL THEN RAISE EXCEPTION 'Sign in before submitting'; END IF;
 IF auth.uid() IS NOT NULL THEN PERFORM public.require_active_user(); END IF;
 IF (f.collect_email OR email<>'') AND email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' THEN RAISE EXCEPTION 'Valid email required'; END IF;
 IF length(email)>254 OR jsonb_typeof(p_answers)<>'array' OR jsonb_array_length(p_answers)>200 THEN RAISE EXCEPTION 'Invalid response'; END IF;
 IF f.one_response_per_user THEN
  IF auth.uid() IS NULL AND email='' THEN RAISE EXCEPTION 'Email or account required'; END IF;
  IF EXISTS(SELECT 1 FROM form_responses WHERE form_id=p_form_id AND
   ((auth.uid() IS NOT NULL AND respondent_id=auth.uid()) OR (email<>'' AND lower(respondent_email)=email))) THEN RAISE EXCEPTION 'Already submitted'; END IF;
 END IF;
 FOR a IN SELECT value FROM jsonb_array_elements(p_answers) LOOP
  SELECT * INTO q FROM form_questions WHERE form_id=p_form_id AND form_questions.id=(a->>'question_id')::uuid AND type<>'section_header';
  IF NOT FOUND THEN RAISE EXCEPTION 'Question does not belong to this form'; END IF;
  SELECT count(*) INTO n FROM jsonb_array_elements(p_answers) x WHERE x->>'question_id'=a->>'question_id';
  IF n<>1 THEN RAISE EXCEPTION 'Duplicate answer'; END IF;
  v:=a->'value';
  IF length(v::text)>20000 THEN RAISE EXCEPTION 'Answer too long'; END IF;
  IF v IS NOT NULL AND v NOT IN ('null'::jsonb,'""'::jsonb,'[]'::jsonb) THEN
   IF q.type IN ('short_text','long_text','email','date','time') AND jsonb_typeof(v)<>'string' THEN RAISE EXCEPTION 'Text answer required'; END IF;
   IF q.type='email' AND (v#>>'{}') !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' THEN RAISE EXCEPTION 'Invalid email answer'; END IF;
   IF q.type='date' THEN PERFORM (v#>>'{}')::date; END IF;
   IF q.type='time' THEN PERFORM (v#>>'{}')::time; END IF;
   IF q.type IN ('number','rating','linear_scale') THEN
    IF jsonb_typeof(v) NOT IN ('number','string') THEN RAISE EXCEPTION 'Numeric answer required'; END IF;
    PERFORM (v#>>'{}')::numeric;
    IF q.settings ? 'min' AND (v#>>'{}')::numeric<(q.settings->>'min')::numeric THEN RAISE EXCEPTION 'Value below minimum'; END IF;
    IF q.settings ? 'max' AND (v#>>'{}')::numeric>(q.settings->>'max')::numeric THEN RAISE EXCEPTION 'Value above maximum'; END IF;
   END IF;
   IF q.type IN ('single_choice','dropdown') AND NOT EXISTS(SELECT 1 FROM jsonb_array_elements(q.options) opt WHERE opt->>'id'=v#>>'{}') THEN RAISE EXCEPTION 'Invalid option'; END IF;
   IF q.type IN ('multiple_choice','ranking') THEN
    IF jsonb_typeof(v)<>'array' THEN RAISE EXCEPTION 'Option list required'; END IF;
    IF EXISTS(SELECT 1 FROM jsonb_array_elements_text(v) choice WHERE NOT EXISTS(SELECT 1 FROM jsonb_array_elements(q.options) opt WHERE opt->>'id'=choice)) THEN RAISE EXCEPTION 'Invalid option'; END IF;
   END IF;
   IF q.type='file_upload' AND (jsonb_typeof(v)<>'object' OR COALESCE(v->>'path','') NOT LIKE p_form_id::text||'/%') THEN RAISE EXCEPTION 'Invalid file attachment'; END IF;
  END IF;
 END LOOP;
 FOR q IN SELECT * FROM form_questions WHERE form_id=p_form_id AND required AND type<>'section_header' LOOP
  SELECT value->'value' INTO v FROM jsonb_array_elements(p_answers) WHERE value->>'question_id'=q.id::text;
  IF v IS NULL OR v IN ('null'::jsonb,'""'::jsonb,'[]'::jsonb) OR (jsonb_typeof(v)='string' AND trim(v#>>'{}')='') THEN RAISE EXCEPTION 'Required answer missing: %',q.title; END IF;
 END LOOP;
 INSERT INTO form_responses(form_id,respondent_id,respondent_email,metadata) VALUES(p_form_id,auth.uid(),NULLIF(email,''),p_metadata) RETURNING form_responses.id INTO id;
 INSERT INTO form_answers(response_id,question_id,value) SELECT id,(x->>'question_id')::uuid,x->'value' FROM jsonb_array_elements(p_answers) x;
 RETURN jsonb_build_object('success',true,'response_id',id,'success_message',f.success_message,'sheets_sync_enabled',f.sheets_sync_enabled);
END;
$$;
-- The old index disallowed repeat responses even when the setting was off. The locked RPC enforces the setting.
DROP INDEX IF EXISTS public.idx_form_responses_unique_user;
REVOKE ALL ON FUNCTION public.save_form_questions(uuid,jsonb),public.save_form(jsonb,jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.save_form_questions(uuid,jsonb),public.save_form(jsonb,jsonb) TO authenticated;
REVOKE ALL ON FUNCTION public.submit_form_response(uuid,jsonb,text,jsonb),public.has_user_responded(uuid,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_form_response(uuid,jsonb,text,jsonb),public.has_user_responded(uuid,text) TO anon,authenticated;
COMMIT;
