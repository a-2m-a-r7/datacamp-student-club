# Effective database and RLS

The clean DataCamp schema has 33 public tables. The hosted QA catalog confirms RLS is enabled on all 33. Grants and RLS are distinct: explicit table privileges are declared by 20261016152338_explicit_datacamp_data_api_grants.sql. Do not re-grant all tables after applying migrations.

| Domain | Tables |
|---|---|
| Identity/security | profiles, users (legacy mirror), admin_emails, auth_events, audit_logs, member_cards |
| Learning/rewards | courses, course_modules, lessons, enrollments, lesson_watch_progress, certificates, points_log, user_achievements |
| Course media/jobs | course_assets, course_drive_connections, course_upload_jobs, lesson_analysis_jobs, course_request_windows |
| Community/content | events, staff, projects, blog, gallery, messages, notifications, notification_reads, settings |
| Forms | forms, form_questions, form_responses, form_answers, sync_logs |

Own-profile policies and protected-field triggers reject role/status/earned-field forgery. Members cannot browse the club directory; directory RPCs require administrator status. Internal promote/counter helpers are revoked from public callers. Server-only job/token tables intentionally have no client policy/grant. This produces informational advisor notices and is deliberate deny-by-default behavior.

The public_events view exposes nine published fields and excludes registrations and organizers. Its owner-context projection is intentional because raw events contain private registrations; an advisor flags it for manual review. Do not blindly switch it to invoker or expose raw events. Actual QA tests verify projection privacy. Public verification RPCs also have deliberately narrow projections; privileged functions must retain explicit authorization and search_path.

| Storage bucket | Public bytes | Maximum | Allowed types / writes |
|---|---:|---:|---|
| avatars | Yes, known URL | 5 MiB | PNG/JPEG/WebP; owner-directory/admin writes; directory listing private |
| course-thumbnails | Yes | 10 MiB | PNG/JPEG/WebP; admin writes |
| uploads | Yes | 10 MiB | PNG/JPEG/WebP; admin writes |
| form-attachments | No | 10 MiB | PNG/JPEG/WebP/PDF/text; published-form upload contract; admin reads/signs |

Public avatar bytes are intentionally public by URL. Private directory listing is a separate policy. File deletion must use Storage APIs, not direct storage.objects SQL, so bytes and metadata remain consistent.

The Realtime migration declares 16 application tables, retaining RLS. It excludes server-only capability tables. A channel join alone is not proof of replication readiness; QA verifies the provider's PostgreSQL subscription acknowledgement and exact delivered row ID.

For a new, empty project use sorted canonical schema migrations dated 20261013 onward; do not run historical sample seeds or combined_migration.sql blindly. Existing installations require a migration-history review and owner-approved targeted changes. No production migration has been applied by the tester-final audit.

The QA advisor report retains missing-FK-index, auth-initplan and overlapping-policy performance notices. Unused-index notices in an empty QA database are not deletion proof. These observations and the local 20-connection benchmark do not guarantee hosted 1000-user capacity.
