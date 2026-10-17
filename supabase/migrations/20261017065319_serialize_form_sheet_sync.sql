BEGIN;
-- One durable, server-only coordination row per form. This coalesces concurrent
-- requests and prevents two function instances from writing the same Sheet.
CREATE TABLE IF NOT EXISTS public.form_sheet_sync_jobs (
 form_id uuid PRIMARY KEY REFERENCES public.forms(id) ON DELETE CASCADE,
 requested_revision bigint NOT NULL DEFAULT 0,
 synced_revision bigint NOT NULL DEFAULT 0,
 owner_token uuid,
 lease_until timestamptz,
 last_error text,
 updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 CHECK(synced_revision>=0 AND requested_revision>=synced_revision)
);
ALTER TABLE public.form_sheet_sync_jobs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.form_sheet_sync_jobs FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON TABLE public.form_sheet_sync_jobs TO service_role;

CREATE OR REPLACE FUNCTION public.queue_form_sheet_sync(p_form_id uuid,p_token uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=public,pg_temp AS $$
DECLARE state public.form_sheet_sync_jobs;
BEGIN
 IF p_form_id IS NULL OR p_token IS NULL THEN RAISE EXCEPTION 'Form and owner token required'; END IF;
 INSERT INTO public.form_sheet_sync_jobs(form_id,requested_revision,owner_token,lease_until)
 VALUES(p_form_id,1,p_token,clock_timestamp()+interval '5 minutes')
 ON CONFLICT(form_id) DO UPDATE SET
  requested_revision=form_sheet_sync_jobs.requested_revision+1,
  owner_token=CASE WHEN form_sheet_sync_jobs.owner_token IS NULL OR form_sheet_sync_jobs.lease_until<=clock_timestamp() THEN EXCLUDED.owner_token ELSE form_sheet_sync_jobs.owner_token END,
  lease_until=CASE WHEN form_sheet_sync_jobs.owner_token IS NULL OR form_sheet_sync_jobs.lease_until<=clock_timestamp() THEN EXCLUDED.lease_until ELSE form_sheet_sync_jobs.lease_until END,
  updated_at=clock_timestamp()
 RETURNING * INTO state;
 RETURN jsonb_build_object('acquired',state.owner_token=p_token,'revision',state.requested_revision);
END;$$;

CREATE OR REPLACE FUNCTION public.finish_form_sheet_sync(p_form_id uuid,p_token uuid,p_revision bigint,p_error text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=public,pg_temp AS $$
DECLARE state public.form_sheet_sync_jobs; pending boolean;
BEGIN
 SELECT * INTO state FROM public.form_sheet_sync_jobs WHERE form_id=p_form_id FOR UPDATE;
 IF NOT FOUND OR state.owner_token IS DISTINCT FROM p_token THEN
  RETURN jsonb_build_object('owned',false,'pending',true);
 END IF;
 IF p_revision<0 OR p_revision>state.requested_revision THEN RAISE EXCEPTION 'Invalid sync revision'; END IF;
 IF p_error IS NOT NULL THEN
  UPDATE public.form_sheet_sync_jobs SET owner_token=NULL,lease_until=NULL,last_error=left(p_error,500),updated_at=clock_timestamp() WHERE form_id=p_form_id;
  RETURN jsonb_build_object('owned',true,'pending',true,'revision',state.requested_revision);
 END IF;
 state.synced_revision:=GREATEST(state.synced_revision,p_revision);
 pending:=state.requested_revision>state.synced_revision;
 UPDATE public.form_sheet_sync_jobs SET synced_revision=state.synced_revision,
  owner_token=CASE WHEN pending THEN p_token ELSE NULL END,
  lease_until=CASE WHEN pending THEN clock_timestamp()+interval '5 minutes' ELSE NULL END,
  last_error=NULL,updated_at=clock_timestamp() WHERE form_id=p_form_id;
 RETURN jsonb_build_object('owned',true,'pending',pending,'revision',state.requested_revision);
END;$$;
REVOKE ALL ON FUNCTION public.queue_form_sheet_sync(uuid,uuid) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.finish_form_sheet_sync(uuid,uuid,bigint,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.queue_form_sheet_sync(uuid,uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.finish_form_sheet_sync(uuid,uuid,bigint,text) TO service_role;
COMMIT;
