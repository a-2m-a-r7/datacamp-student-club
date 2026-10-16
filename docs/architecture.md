# Current architecture - tester-final

React 19 and TypeScript render a Vite SPA with Tailwind 4. React Router owns public, member and administrator routes. The catalog, forms, club content, learning progress, certificates and profile reference Supabase records; there is no production demo-account switcher.

Browser services use a public Supabase key under RLS. Auth uses Supabase GoTrue and per-tab sessionStorage. Refresh persists in the current tab; independent tabs can hold independent accounts. Protected routes wait for the profile and normalize database user/admin to UI member/super_admin. UI guards are supplemented by table RLS, guarded RPCs and server authentication.

Ten Vercel handlers under api/ cover administrator accounts/backup, profile provider-avatar import, form submit/Sheets synchronization, AI chat, TypeScript transpilation, Drive uploads and lesson analysis. Shared authorization verifies the bearer with Auth and checks the persisted active, confirmed administrator. A service key is server-only. Missing provider configuration returns an explicit failure.

SQL RPCs perform enrollment, scoring, course completion, automatic certificate issuance, event registration/check-in and atomic form save/submit. Unique constraints and row/advisory locks protect duplicate rewards, capacity and completion races. Current SQL is versioned under supabase/migrations. Historical migrations include old seeds; use the documented clean-schema path for a new installation.

Images use the configured Storage buckets. Profile images store avatar_url/photo_url references; file bytes remain in Storage. Large course files use the owner's separate Drive OAuth connection, resumable chunks and server-side job records. Gemini proposes bilingual quiz/coding stages for administrator review. PDF/PNG generation and LinkedIn preparation occur on demand; the learner confirms publication on LinkedIn.

watchQuery refreshes visible tabs with bounded polling and refreshes after writes. Optional Realtime subscribes only when VITE_ENABLE_REALTIME=true; subscribed tables must be in supabase_realtime. Consumers unsubscribe on teardown. This does not establish 1000 live-browser/video capacity.

Vercel serves hashed assets and server functions. vercel.json contains security/cache headers and SPA rewrites. Tests serve local builds in a minimal environment; the real-service QA target is separately pinned and never uses production credentials. See qa-audit/final/QA-ENVIRONMENT.md and TEST-MATRIX.md for observed results and limits.
