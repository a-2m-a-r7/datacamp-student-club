-- PROPOSED ONLY: owner approval required. Explicit privileges for fresh installs
-- without public table default grants. RLS remains enabled and unchanged.
BEGIN;
GRANT SELECT,INSERT,UPDATE,DELETE ON
 public.profiles,public.users,public.auth_events,public.courses,public.lessons,
 public.enrollments,public.events,public.staff,public.projects,public.blog,
 public.gallery,public.settings,public.messages,public.notifications,
 public.audit_logs,public.points_log,public.user_achievements,public.certificates,
 public.forms,public.form_questions,public.form_responses,public.form_answers,
 public.sync_logs,public.admin_emails TO authenticated;
GRANT SELECT ON public.courses,public.lessons,public.projects,public.blog,
 public.gallery,public.settings,public.forms,public.form_questions TO anon;
GRANT INSERT ON public.messages TO anon;
GRANT SELECT ON public.notification_reads TO authenticated;
GRANT ALL ON
 public.profiles,public.users,public.auth_events,public.courses,public.lessons,
 public.enrollments,public.events,public.staff,public.projects,public.blog,
 public.gallery,public.settings,public.messages,public.notifications,
 public.audit_logs,public.points_log,public.user_achievements,public.certificates,
 public.forms,public.form_questions,public.form_responses,public.form_answers,
 public.sync_logs,public.admin_emails,public.notification_reads,public.member_cards,
 public.course_request_windows,public.course_modules,public.course_assets,
 public.lesson_watch_progress,public.course_drive_connections,
 public.course_upload_jobs,public.lesson_analysis_jobs TO service_role;
-- Course media tables already declare client grants in their own migration.
-- No grants to clients on member_cards or the four server-only job/rate tables.
-- No default privileges are changed; unrelated public tables are untouched.
COMMIT;
