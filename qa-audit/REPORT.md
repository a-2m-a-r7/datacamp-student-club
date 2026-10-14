# DataCamp repair and QA report — updated 14 October 2026

Current growth release: generic Arabic/English draft-course creation, validated quiz editor, automatic course certificates with chosen downloads and LinkedIn fields, keyset catalog pagination, safe lost-response retries and visible-tab polling by default. See FUTURE_READINESS.md. The isolated real PostgreSQL load run simulated 1000 QA members with 20 actual database connections and 10,000 successful requests; this does not certify cloud capacity. Latest live migration verification passed four read-only checks. Background refresh and server authorization passed four Node tests. The deployment paragraph below records an earlier release; current deployment evidence is recorded separately.

The user authorized repairs after the initial discovery and explicitly authorized applying DataCamp schema/security repairs to the existing Supabase project. Work is on branch fix/qa-real-data. This report records current evidence; the Phase 1 inventory remains in discovery-20261013/INVENTORY.md.

## Results and coverage

- Inventory: 49 route patterns, 685 source control declarations. These are not 685 clicked elements.
- Browser scenarios: 270; results: {"passed":270}. Desktop 1440px, tablet 768px, mobile 375px. Exact per-scenario outcomes are below and in tested-elements.csv/fix-results.json.
- PostgreSQL: 56 passed, 0 failed in an isolated in-memory PostgreSQL database. All 13 repair migrations applied and actual SQL rows/rollback/RLS were verified. These tests do not prove authenticated production CRUD.
- Server authorization: one test with five identity cases passed (visitor/member/expired/unverified/verified admin).
- Live read-only integration: 11 checks passed against the connected Supabase and the local API server. Existing server key reads five profiles; anonymous private-row reads expose zero; sanitized events expose two; three unauthenticated admin endpoints return401.
- TypeScript check and production build passed; npm audit reported zero known vulnerabilities. Zero audit findings does not guarantee absence of all defects.
- Public browser checks use intercepted QA_TEST Supabase fixtures; authenticated role tests use mocked QA_TEST sessions. They verify rendering, actual clicks, request contracts, downloads and layout, not real OAuth or production database writes.
- No destructive production tests or QA_TEST records were created in the live database. Fixtures exist only in browser contexts and in-memory PostgreSQL and disappear on close.

## Supabase changes and evidence

The connected dashboard project matched the workspace configuration. Before repair, forms, form_questions, points_log and certificates returned HTTP404; anonymous profile reads exposed five rows. The prepared SETUP_SUPABASE.sql was applied through the owner's logged-in SQL editor in a single transaction and returned Success. No rows returned. Afterwards the missing tables respond successfully, anonymous profiles/events return zero private rows, and public courses remain readable. Events are published through the sanitized public_events projection. Member and staff directories are now admin-only in both the UI and PostgreSQL; direct anonymous directory RPC returns401 and anonymous staff reads return zero rows.

Record counts verified before/after: profiles 5/5, courses 3/3, events 2/2, legacy users 0/0, customers 0/0, sales 0/0. Forms and certificates started empty. Existing records were retained; no seeded content was inserted. The unrelated commerce tables and existing public.users permissions were preserved. Public.users belongs to a legacy mixed schema; DataCamp now uses profiles as the authoritative account/points table.

Auth settings report email and Google providers enabled. This is configuration evidence, not a completed login/OTP/email-delivery test. Storage policies now restrict private form-attachment reads and targeted image writes even if older permissive policies exist.

With the owner's explicit authorization, the existing service-role key was stored only in the Git-ignored local .env file through a local setup form. No key values were printed or committed. Production bundle inspection confirms that the server key is not present in any JavaScript asset. The local development command now serves frontend and API routes together at http://127.0.0.1:3000.

A real Gemini connectivity request through the local /api/ai/chat endpoint returned HTTP200 and a generated reply without an error. Only a short QA_TEST connectivity prompt was sent; no personal data or database records were included.

## Broken controls and before/after comparison

Before descriptions are source findings except where live HTTP404/exposure or browser failures are stated; no invented historical baseline pass count is used. Implemented fixes may still need deployed integration verification as specified in Evidence.

| # | Page / tab | Severity | Source / selector | Before | After | Evidence / limitation |
|---|---|---|---|---|---|---|
| 1 | Login / all roles | Critical | src/contexts/AuthContext.tsx:201 | Cached fake accounts and role shortcuts could enter protected UI | Real Supabase session, verified identity, active database role; mock shortcuts removed | Browser guards + server auth tests + SQL RLS |
| 2 | Admin users | Critical | api/admin/users.ts:1 | Administrative requests relied on unsafe fallback account creation | Bearer identity and database role checked server-side; no default password | Server authorization tests; live account CRUD remains untested |
| 3 | Home / About / content pages | High | src/lib/defaultContent.ts:2 | Invented metrics and sample people/articles/projects replaced missing data | No sample collections; real statistics RPC; unavailable values displayed honestly | Browser checks + live read-only RPC |
| 4 | Courses / learning | High | src/services/courseService.ts:281 | Enrollment/progress could be simulated and repeated XP awarded | Locked persistent enrollment/completion RPC and idempotent rewards | Isolated PostgreSQL persistence tests |
| 5 | Forms builder | High | src/pages/admin/forms/FormBuilder.tsx:103 | Separate saves and regenerated IDs could lose historical answers; autosave could race publication | Atomic parent/questions transaction, stable IDs, serial saves | PostgreSQL rollback tests + browser delayed-save scenario |
| 6 | Forms response | High | supabase/migrations/20261013000002_atomic_forms.sql:60 | Client validation/fallback results could imply an unsaved submission succeeded | Server validates ownership, required fields, types, schedule and repeat-response policy | PostgreSQL validation tests |
| 7 | Course quiz | High | supabase/migrations/20261013000004_verified_quizzes.sql:2 | Client-selected success could grant completion and XP | Server grades stored questions; completion requires passing score | PostgreSQL fail/pass and bypass checks |
| 8 | Event scanner | High | supabase/migrations/20261013000001_real_operations.sql:223 | Access-granted output did not prove attendance persisted | Registered ticket matched, attendance saved, duplicates rejected | PostgreSQL unknown/valid/duplicate checks; physical camera untested |
| 9 | Certificates | High | src/services/certificateService.ts:48 | Completed courses could claim a certificate in the UI without automatic issuance | Completion transaction issues one matching persisted certificate and links its enrollment; public verification omits account fields | PostgreSQL atomic rollback/idempotency + browser backed by real isolated SQL + PNG/PDF/QR |
| 10 | Notifications / badges | High | src/services/notificationService.ts:58 | Fabricated alerts and client-derived achievements; global read state shared | Actual rows, per-member read records, badges derived from persisted progress | PostgreSQL independent reads and forged-badge rejection |
| 11 | Google Sheets | High | api/forms/sync-sheet.ts:16 | Public sync endpoint and misleading success on missing configuration | Admin authorization, real failure status, RAW sheet values, no hardcoded sharing recipient | Visitor rejection verified; Google service account integration blocked |
| 12 | Compiler | High | src/lib/universalRunner.ts:44 | Service failure returned invented successful language output | Actual workers/WASM/services; compilation and nonzero runtime failures surfaced | Real JavaScript/TypeScript execution + mocked failure responses |
| 13 | Admin blog | Medium | src/pages/admin/BlogManagement.tsx:1 | Edit control had no saving workflow | Dialog edits and PATCH persist the submitted fields | Browser click, PATCH payload, UI update and dialog close |
| 14 | Admin settings | Medium | src/pages/admin/Settings.tsx:271 | Export and clear-cache controls had empty handlers | Protected platform-record JSON download and actual browser cache clearing | Browser download contents and CacheStorage removal |
| 15 | Admin staff / security | Medium | src/pages/admin/Security.tsx:10 | Pretend commit, firewall state, security logs and uptime implied backend actions | Real roster refresh, actual audit records and password-reset request; unavailable uptime stays unknown | Route rendering; live reset email delivery remains untested |
| 16 | Builder desktop header | High | src/App.tsx:207 | Floating language control intercepted clicks on Publish | Language control has reserved layout space | Delayed autosave/publish browser click test |
| 17 | Contact / footer | Medium | src/pages/Contact.tsx:166 | Invented email, telephone and address shown when not configured | Configured contact data or explicit Not configured state | Source correction and final route checks |
| 18 | Dialogs / share / QR | Medium | src/components/ui/Dialog.tsx:6 | Conditional dialogs lacked consistent focus/Escape behavior; QR lacked quiet margin | Portaled accessible dialogs, focus restore, awaited clipboard, decodable QR margin | Browser Escape/focus, badge/form/certificate QR and PNG download |
| 19 | Data refresh | Medium | src/lib/supabase.ts:22 | Cached RAG context and browser data could show stale or fake records | Fresh database context and no-store; personal AI key is memory-only | Browser legacy-session/cache rejection; realtime delivery needs live role session |
| 20 | Dependencies | High | package.json:12 | Known vulnerable SheetJS/qs/esbuild versions | Official SheetJS 0.20.3 distribution and patched transitive packages | npm audit: zero known vulnerabilities |
| 21 | Profile security | High | src/pages/Profile.tsx:153 | Login OTP was incorrectly reused for credential changes, with unsupported SMS text | Real recovery emails and confirmed email changes; no premature profile email writes | Browser request/error/retry checks; actual mailbox delivery unverified |
| 22 | Dashboard card download | High | src/lib/memberCard.ts:1 | html2canvas failed on Tailwind color formats | Direct Canvas PNG export with real member data and embedded decodable QR | Actual 1586×1000 PNG download and QR pixel decode at three sizes |
| 23 | Membership QR | High | supabase/migrations/20261013000010_member_cards.sql:4 | Member number displayed as unexplained scan text | Random token verification URL and protected admin ticket resolution | SQL permissions, inactive/unknown tokens and browser verification |
| 24 | Dashboard badges | Medium | src/pages/Dashboard.tsx:320 | Fifty points displayed every catalog badge as earned | Only persisted achievements unlock badges | Source repair; badge issuance remains SQL verified |
| 25 | Course completion / certificates | High | supabase/migrations/20261013000011_automatic_course_certificates.sql:48 | Completing a lesson or quiz did not automatically issue/link a course certificate | Atomic database trigger, unique certificate per user/course, safe historical repair, matching course selection and export QR snapshot | Browser operations execute actual PostgreSQL routines in an isolated database; real historical completion repaired in production |

## QR results

Browser tests decode the member-card SVG and the QR in the downloaded 1586×1000 PNG. Its value is a verification URL with a random token, and opening it displays membership validity and the member number without personal contact data. Form SVG/PNG and certificate SVG/canvas also decode to their matching URLs. The card uses Canvas image export instead of html2canvas, which failed with Tailwind color formats. Event-ticket print/download and physical camera scans remain unverified. See SECURITY_CARD_FIXES.md for the deployed regression evidence.

## Permissions and remaining integration work

Local SQL tests reject self-assigned admin roles/XP, forged badges, unknown/duplicate tickets, quiz bypasses and cross-form answers. Anonymous live profile/event privacy was verified after applying RLS. Admin server APIs validate bearer identity against Supabase and database role; absence of configuration causes explicit503 rather than fake success.

Still unverified or blocked:

1. A real member and admin session in the application: Google/email login, signup, logout, recovery/email-confirmation delivery, profile saves and admin create/delete require a private QA environment/account; dashboard sign-in alone does not log into the app. Profile security now uses real email recovery and email-change confirmation, with no fabricated OTP or SMS fallback.
2. Google Sheets synchronization requires GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY and GOOGLE_SPREADSHEET_OWNER_EMAIL plus spreadsheet permissions. No credentials were fabricated and no sheet was created/shared.
3. Production is deployed at https://datacamp-student-club.vercel.app from GitHub main (verified application commit 4088524). Deployment completed. Forty-five direct page/API checks passed, plus four checks for genuine production certificate verification, matching data and PNG/PDF/QR export. Three deployed UI checks with isolated QA network fixtures confirmed card PNG/QR, recovery and email confirmation. The server key is configured privately in Production, and VITE_GEMINI_API_KEY was removed. Three admin endpoints return401 for visitors; the TypeScript endpoint previously returned200. The genuine historical eligible completion now has its linked course certificate; no production QA records were created.
4. Live realtime delivery and file uploads, storage download, CSV/Excel/PDF/print variants, notification actions, all dynamic filters/sorting/pagination/drag/drop, and exhaustive keyboard/mobile hit-target checks for all 685 declarations are not fully exercised. Untested declarations retain Not tested status in the original inventory.
5. Python/SQL CDN loading and Piston language availability still need live external checks. JavaScript/TypeScript execution, Gemini connectivity and service-failure handling were tested; TypeScript transpilation reports syntax diagnostics, not complete semantic type checking.
6. Existing database content could have been historical sample data; it was not deleted without a reliable record classification. Configure real contact content in admin settings.
7. The Supabase dashboard separately flags RLS disabled on unrelated commerce tables (malls/shops/customers/sales). These belong to another project scope and were preserved.

No claim that every button or all external services work is made. Missing service configuration remains visible to users as an actual error. Manager-style guards currently use the existing admin role model; distinct HR/editor permission semantics still need a product decision.

## Priority order

1. Complete a separate QA environment for every remaining authenticated operation.
2. Verify real member/admin sessions in a separate QA environment.
3. Complete Google service-account configuration and Sheets permissions.
4. Verify login redirects, reset/OTP emails and phone-provider setup.
5. Verify real CRUD, imports, uploads and realtime subscriptions.
6. Test live compiler/AI dependencies and language-specific error cases.
7. Audit every remaining dynamic inventory instance.
8. Verify exports/PDF/printing and physical-camera scanning.
9. Classify any historical sample records with the owner before removal.
10. Review the unrelated commerce database's security separately.

## Reproduce

Run npm run dev for the local frontend plus API server; Vite alone cannot serve the api functions. Use npm run test:qa, npm run test:qa:database and npm run test:qa:auth for isolated verification. Test server configuration explicitly uses nonexistent QA keys and intercepted fixtures; it never uses the live service-role key. The QA entry module is included only in the qa build, not production.

## Every executed browser scenario

| Scenario | Viewport | Status | Source |
|---|---|---|---|
| last lesson automatically issues one certificate, exports real PNG/PDF and verifies saved course | 1440 | passed | course-certificates.spec.ts:67 |
| partial completion and failed inline assessment do not issue; passing final assessment does | 1440 | passed | course-certificates.spec.ts:97 |
| standalone final quiz creates and opens the matching persisted certificate | 1440 | passed | course-certificates.spec.ts:107 |
| database certificate failure rolls back the UI flow; storage and list retries recover honestly | 1440 | passed | course-certificates.spec.ts:115 |
| last lesson automatically issues one certificate, exports real PNG/PDF and verifies saved course | 768 | passed | course-certificates.spec.ts:67 |
| partial completion and failed inline assessment do not issue; passing final assessment does | 768 | passed | course-certificates.spec.ts:97 |
| standalone final quiz creates and opens the matching persisted certificate | 768 | passed | course-certificates.spec.ts:107 |
| database certificate failure rolls back the UI flow; storage and list retries recover honestly | 768 | passed | course-certificates.spec.ts:115 |
| last lesson automatically issues one certificate, exports real PNG/PDF and verifies saved course | 375 | passed | course-certificates.spec.ts:67 |
| partial completion and failed inline assessment do not issue; passing final assessment does | 375 | passed | course-certificates.spec.ts:97 |
| standalone final quiz creates and opens the matching persisted certificate | 375 | passed | course-certificates.spec.ts:107 |
| database certificate failure rolls back the UI flow; storage and list retries recover honestly | 375 | passed | course-certificates.spec.ts:115 |
| admin creates a future Arabic course and quiz; learner automatically earns and shares its own certificate | 1440 | passed | course-growth.spec.ts:68 |
| duplicate slugs cannot overwrite another course and stale admin edits cannot overwrite newer data | 1440 | passed | course-growth.spec.ts:78 |
| catalog pages, debounced search, cancellation and honest retry use bounded database requests | 1440 | passed | course-growth.spec.ts:84 |
| future long Arabic course titles and member names export PNG/PDF with the correct verification QR | 1440 | passed | course-growth.spec.ts:90 |
| lost course response retries the same draft and image tools never submit the form | 1440 | passed | course-growth.spec.ts:98 |
| admin creates a future Arabic course and quiz; learner automatically earns and shares its own certificate | 768 | passed | course-growth.spec.ts:68 |
| duplicate slugs cannot overwrite another course and stale admin edits cannot overwrite newer data | 768 | passed | course-growth.spec.ts:78 |
| catalog pages, debounced search, cancellation and honest retry use bounded database requests | 768 | passed | course-growth.spec.ts:84 |
| future long Arabic course titles and member names export PNG/PDF with the correct verification QR | 768 | passed | course-growth.spec.ts:90 |
| lost course response retries the same draft and image tools never submit the form | 768 | passed | course-growth.spec.ts:98 |
| admin creates a future Arabic course and quiz; learner automatically earns and shares its own certificate | 375 | passed | course-growth.spec.ts:68 |
| duplicate slugs cannot overwrite another course and stale admin edits cannot overwrite newer data | 375 | passed | course-growth.spec.ts:78 |
| catalog pages, debounced search, cancellation and honest retry use bounded database requests | 375 | passed | course-growth.spec.ts:84 |
| future long Arabic course titles and member names export PNG/PDF with the correct verification QR | 375 | passed | course-growth.spec.ts:90 |
| lost course response retries the same draft and image tools never submit the form | 375 | passed | course-growth.spec.ts:98 |
| certificate sharing copies actual fields and post, opens LinkedIn safely, and follows selected certificate | 1440 | passed | linkedin.spec.ts:32 |
| dashboard shares only persisted earned badges, without private directory or invented credential | 1440 | passed | linkedin.spec.ts:66 |
| Arabic sharing keeps data selectable when clipboard permission fails | 1440 | passed | linkedin.spec.ts:83 |
| certificate sharing copies actual fields and post, opens LinkedIn safely, and follows selected certificate | 768 | passed | linkedin.spec.ts:32 |
| dashboard shares only persisted earned badges, without private directory or invented credential | 768 | passed | linkedin.spec.ts:66 |
| Arabic sharing keeps data selectable when clipboard permission fails | 768 | passed | linkedin.spec.ts:83 |
| certificate sharing copies actual fields and post, opens LinkedIn safely, and follows selected certificate | 375 | passed | linkedin.spec.ts:32 |
| dashboard shares only persisted earned badges, without private directory or invented credential | 375 | passed | linkedin.spec.ts:66 |
| Arabic sharing keeps data selectable when clipboard permission fails | 375 | passed | linkedin.spec.ts:83 |
| public route renders without exceptions: / | 1440 | passed | public.spec.ts:16 |
| public route renders without exceptions: /about | 1440 | passed | public.spec.ts:16 |
| public route renders without exceptions: /courses | 1440 | passed | public.spec.ts:16 |
| public route renders without exceptions: /projects | 1440 | passed | public.spec.ts:16 |
| public route renders without exceptions: /events | 1440 | passed | public.spec.ts:16 |
| public route renders without exceptions: /blog | 1440 | passed | public.spec.ts:16 |
| public route renders without exceptions: /staff | 1440 | passed | public.spec.ts:16 |
| public route renders without exceptions: /gallery | 1440 | passed | public.spec.ts:16 |
| public route renders without exceptions: /contact | 1440 | passed | public.spec.ts:16 |
| public route renders without exceptions: /faq | 1440 | passed | public.spec.ts:16 |
| public route renders without exceptions: /privacy | 1440 | passed | public.spec.ts:16 |
| public route renders without exceptions: /terms | 1440 | passed | public.spec.ts:16 |
| public route renders without exceptions: /leaderboard | 1440 | passed | public.spec.ts:16 |
| public route renders without exceptions: /certificates | 1440 | passed | public.spec.ts:16 |
| public route renders without exceptions: /verify-certificate | 1440 | passed | public.spec.ts:16 |
| public route renders without exceptions: /compiler | 1440 | passed | public.spec.ts:16 |
| public route renders without exceptions: /login | 1440 | passed | public.spec.ts:16 |
| public route renders without exceptions: /register | 1440 | passed | public.spec.ts:16 |
| public route renders without exceptions: /forgot-password | 1440 | passed | public.spec.ts:16 |
| public route renders without exceptions: /reset-password | 1440 | passed | public.spec.ts:16 |
| public route renders without exceptions: /verify-email | 1440 | passed | public.spec.ts:16 |
| public route renders without exceptions: /f/qa-test-missing | 1440 | passed | public.spec.ts:16 |
| public route renders without exceptions: /not-a-real-page | 1440 | passed | public.spec.ts:16 |
| a cached fabricated admin does not authenticate | 1440 | passed | public.spec.ts:28 |
| visitor guard redirects: /dashboard | 1440 | passed | public.spec.ts:37 |
| visitor guard redirects: /profile | 1440 | passed | public.spec.ts:37 |
| visitor guard redirects: /my-courses | 1440 | passed | public.spec.ts:37 |
| visitor guard redirects: /notifications | 1440 | passed | public.spec.ts:37 |
| visitor guard redirects: /courses/qa-test/learn | 1440 | passed | public.spec.ts:37 |
| visitor guard redirects: /courses/qa-test/quiz | 1440 | passed | public.spec.ts:37 |
| visitor guard redirects: /admin/forms/new | 1440 | passed | public.spec.ts:37 |
| visitor guard redirects: /admin/settings | 1440 | passed | public.spec.ts:37 |
| sample controls and fabricated site metrics are absent | 1440 | passed | public.spec.ts:42 |
| language changes direction and mobile drawer navigates | 1440 | passed | public.spec.ts:50 |
| contact does not submit invalid or empty values | 1440 | passed | public.spec.ts:61 |
| JavaScript compiler actually executes and reports syntax errors | 1440 | passed | public.spec.ts:69 |
| compiled service outage reports failure rather than invented output | 1440 | passed | public.spec.ts:80 |
| form backend errors never replace results with sample records | 1440 | passed | public.spec.ts:90 |
| admin server rejects unauthenticated direct requests | 1440 | passed | public.spec.ts:101 |
| TypeScript compiles real types and runs the resulting code | 1440 | passed | public.spec.ts:109 |
| backend compilation failure is surfaced even when HTTP returns 200 | 1440 | passed | public.spec.ts:116 |
| nonzero runtime exit without stderr is treated as an error | 1440 | passed | public.spec.ts:123 |
| public route renders without exceptions: / | 768 | passed | public.spec.ts:16 |
| public route renders without exceptions: /about | 768 | passed | public.spec.ts:16 |
| public route renders without exceptions: /courses | 768 | passed | public.spec.ts:16 |
| public route renders without exceptions: /projects | 768 | passed | public.spec.ts:16 |
| public route renders without exceptions: /events | 768 | passed | public.spec.ts:16 |
| public route renders without exceptions: /blog | 768 | passed | public.spec.ts:16 |
| public route renders without exceptions: /staff | 768 | passed | public.spec.ts:16 |
| public route renders without exceptions: /gallery | 768 | passed | public.spec.ts:16 |
| public route renders without exceptions: /contact | 768 | passed | public.spec.ts:16 |
| public route renders without exceptions: /faq | 768 | passed | public.spec.ts:16 |
| public route renders without exceptions: /privacy | 768 | passed | public.spec.ts:16 |
| public route renders without exceptions: /terms | 768 | passed | public.spec.ts:16 |
| public route renders without exceptions: /leaderboard | 768 | passed | public.spec.ts:16 |
| public route renders without exceptions: /certificates | 768 | passed | public.spec.ts:16 |
| public route renders without exceptions: /verify-certificate | 768 | passed | public.spec.ts:16 |
| public route renders without exceptions: /compiler | 768 | passed | public.spec.ts:16 |
| public route renders without exceptions: /login | 768 | passed | public.spec.ts:16 |
| public route renders without exceptions: /register | 768 | passed | public.spec.ts:16 |
| public route renders without exceptions: /forgot-password | 768 | passed | public.spec.ts:16 |
| public route renders without exceptions: /reset-password | 768 | passed | public.spec.ts:16 |
| public route renders without exceptions: /verify-email | 768 | passed | public.spec.ts:16 |
| public route renders without exceptions: /f/qa-test-missing | 768 | passed | public.spec.ts:16 |
| public route renders without exceptions: /not-a-real-page | 768 | passed | public.spec.ts:16 |
| a cached fabricated admin does not authenticate | 768 | passed | public.spec.ts:28 |
| visitor guard redirects: /dashboard | 768 | passed | public.spec.ts:37 |
| visitor guard redirects: /profile | 768 | passed | public.spec.ts:37 |
| visitor guard redirects: /my-courses | 768 | passed | public.spec.ts:37 |
| visitor guard redirects: /notifications | 768 | passed | public.spec.ts:37 |
| visitor guard redirects: /courses/qa-test/learn | 768 | passed | public.spec.ts:37 |
| visitor guard redirects: /courses/qa-test/quiz | 768 | passed | public.spec.ts:37 |
| visitor guard redirects: /admin/forms/new | 768 | passed | public.spec.ts:37 |
| visitor guard redirects: /admin/settings | 768 | passed | public.spec.ts:37 |
| sample controls and fabricated site metrics are absent | 768 | passed | public.spec.ts:42 |
| language changes direction and mobile drawer navigates | 768 | passed | public.spec.ts:50 |
| contact does not submit invalid or empty values | 768 | passed | public.spec.ts:61 |
| JavaScript compiler actually executes and reports syntax errors | 768 | passed | public.spec.ts:69 |
| compiled service outage reports failure rather than invented output | 768 | passed | public.spec.ts:80 |
| form backend errors never replace results with sample records | 768 | passed | public.spec.ts:90 |
| admin server rejects unauthenticated direct requests | 768 | passed | public.spec.ts:101 |
| TypeScript compiles real types and runs the resulting code | 768 | passed | public.spec.ts:109 |
| backend compilation failure is surfaced even when HTTP returns 200 | 768 | passed | public.spec.ts:116 |
| nonzero runtime exit without stderr is treated as an error | 768 | passed | public.spec.ts:123 |
| public route renders without exceptions: / | 375 | passed | public.spec.ts:16 |
| public route renders without exceptions: /about | 375 | passed | public.spec.ts:16 |
| public route renders without exceptions: /courses | 375 | passed | public.spec.ts:16 |
| public route renders without exceptions: /projects | 375 | passed | public.spec.ts:16 |
| public route renders without exceptions: /events | 375 | passed | public.spec.ts:16 |
| public route renders without exceptions: /blog | 375 | passed | public.spec.ts:16 |
| public route renders without exceptions: /staff | 375 | passed | public.spec.ts:16 |
| public route renders without exceptions: /gallery | 375 | passed | public.spec.ts:16 |
| public route renders without exceptions: /contact | 375 | passed | public.spec.ts:16 |
| public route renders without exceptions: /faq | 375 | passed | public.spec.ts:16 |
| public route renders without exceptions: /privacy | 375 | passed | public.spec.ts:16 |
| public route renders without exceptions: /terms | 375 | passed | public.spec.ts:16 |
| public route renders without exceptions: /leaderboard | 375 | passed | public.spec.ts:16 |
| public route renders without exceptions: /certificates | 375 | passed | public.spec.ts:16 |
| public route renders without exceptions: /verify-certificate | 375 | passed | public.spec.ts:16 |
| public route renders without exceptions: /compiler | 375 | passed | public.spec.ts:16 |
| public route renders without exceptions: /login | 375 | passed | public.spec.ts:16 |
| public route renders without exceptions: /register | 375 | passed | public.spec.ts:16 |
| public route renders without exceptions: /forgot-password | 375 | passed | public.spec.ts:16 |
| public route renders without exceptions: /reset-password | 375 | passed | public.spec.ts:16 |
| public route renders without exceptions: /verify-email | 375 | passed | public.spec.ts:16 |
| public route renders without exceptions: /f/qa-test-missing | 375 | passed | public.spec.ts:16 |
| public route renders without exceptions: /not-a-real-page | 375 | passed | public.spec.ts:16 |
| a cached fabricated admin does not authenticate | 375 | passed | public.spec.ts:28 |
| visitor guard redirects: /dashboard | 375 | passed | public.spec.ts:37 |
| visitor guard redirects: /profile | 375 | passed | public.spec.ts:37 |
| visitor guard redirects: /my-courses | 375 | passed | public.spec.ts:37 |
| visitor guard redirects: /notifications | 375 | passed | public.spec.ts:37 |
| visitor guard redirects: /courses/qa-test/learn | 375 | passed | public.spec.ts:37 |
| visitor guard redirects: /courses/qa-test/quiz | 375 | passed | public.spec.ts:37 |
| visitor guard redirects: /admin/forms/new | 375 | passed | public.spec.ts:37 |
| visitor guard redirects: /admin/settings | 375 | passed | public.spec.ts:37 |
| sample controls and fabricated site metrics are absent | 375 | passed | public.spec.ts:42 |
| language changes direction and mobile drawer navigates | 375 | passed | public.spec.ts:50 |
| contact does not submit invalid or empty values | 375 | passed | public.spec.ts:61 |
| JavaScript compiler actually executes and reports syntax errors | 375 | passed | public.spec.ts:69 |
| compiled service outage reports failure rather than invented output | 375 | passed | public.spec.ts:80 |
| form backend errors never replace results with sample records | 375 | passed | public.spec.ts:90 |
| admin server rejects unauthenticated direct requests | 375 | passed | public.spec.ts:101 |
| TypeScript compiles real types and runs the resulting code | 375 | passed | public.spec.ts:109 |
| backend compilation failure is surfaced even when HTTP returns 200 | 375 | passed | public.spec.ts:116 |
| nonzero runtime exit without stderr is treated as an error | 375 | passed | public.spec.ts:123 |
| member cannot search or download the club member directory | 1440 | passed | roles.spec.ts:47 |
| profile saves edited name, rejects invalid phone and logs out | 1440 | passed | roles.spec.ts:57 |
| form publish waits for autosave and reuses the created ID | 1440 | passed | roles.spec.ts:73 |
| member direct admin URL stays outside admin controls | 1440 | passed | roles.spec.ts:96 |
| authenticated fixture renders /admin | 1440 | passed | roles.spec.ts:106 |
| authenticated fixture renders /admin/users | 1440 | passed | roles.spec.ts:106 |
| authenticated fixture renders /admin/events | 1440 | passed | roles.spec.ts:106 |
| authenticated fixture renders /admin/staff | 1440 | passed | roles.spec.ts:106 |
| authenticated fixture renders /admin/gallery | 1440 | passed | roles.spec.ts:106 |
| authenticated fixture renders /admin/content | 1440 | passed | roles.spec.ts:106 |
| authenticated fixture renders /admin/projects | 1440 | passed | roles.spec.ts:106 |
| authenticated fixture renders /admin/blog | 1440 | passed | roles.spec.ts:106 |
| authenticated fixture renders /admin/messages | 1440 | passed | roles.spec.ts:106 |
| authenticated fixture renders /admin/courses | 1440 | passed | roles.spec.ts:106 |
| authenticated fixture renders /admin/points | 1440 | passed | roles.spec.ts:106 |
| authenticated fixture renders /admin/forms | 1440 | passed | roles.spec.ts:106 |
| authenticated fixture renders /admin/forms/new | 1440 | passed | roles.spec.ts:106 |
| authenticated fixture renders /admin/security | 1440 | passed | roles.spec.ts:106 |
| authenticated fixture renders /admin/settings | 1440 | passed | roles.spec.ts:106 |
| authenticated fixture renders /dashboard | 1440 | passed | roles.spec.ts:106 |
| authenticated fixture renders /profile | 1440 | passed | roles.spec.ts:106 |
| authenticated fixture renders /my-courses | 1440 | passed | roles.spec.ts:106 |
| authenticated fixture renders /notifications | 1440 | passed | roles.spec.ts:106 |
| blog edit opens, saves via PATCH and closes | 1440 | passed | roles.spec.ts:117 |
| modal Escape closes and restores trigger focus | 1440 | passed | roles.spec.ts:128 |
| record export downloads actual returned JSON and cache button clears browser cache | 1440 | passed | roles.spec.ts:135 |
| member card downloads a real PNG whose QR opens private-safe verification | 1440 | passed | roles.spec.ts:163 |
| profile security sends recovery link and requests email confirmation without profile overwrite | 1440 | passed | roles.spec.ts:178 |
| profile email-change rejection stays visible and does not claim success | 1440 | passed | roles.spec.ts:193 |
| form QR has correct URL and download is a decodable PNG | 1440 | passed | roles.spec.ts:202 |
| certificate SVG and canvas QR decode to the matching verification URL | 1440 | passed | roles.spec.ts:225 |
| card issuance failure disables download and retry recovers | 1440 | passed | roles.spec.ts:237 |
| password recovery rejection is visible and retry works | 1440 | passed | roles.spec.ts:248 |
| malformed membership URL is rejected without database lookup | 1440 | passed | roles.spec.ts:257 |
| unknown membership token exposes no personal details | 1440 | passed | roles.spec.ts:263 |
| password reset validates strength and surfaces authentication rejection | 1440 | passed | roles.spec.ts:270 |
| member cannot search or download the club member directory | 768 | passed | roles.spec.ts:47 |
| profile saves edited name, rejects invalid phone and logs out | 768 | passed | roles.spec.ts:57 |
| form publish waits for autosave and reuses the created ID | 768 | passed | roles.spec.ts:73 |
| member direct admin URL stays outside admin controls | 768 | passed | roles.spec.ts:96 |
| authenticated fixture renders /admin | 768 | passed | roles.spec.ts:106 |
| authenticated fixture renders /admin/users | 768 | passed | roles.spec.ts:106 |
| authenticated fixture renders /admin/events | 768 | passed | roles.spec.ts:106 |
| authenticated fixture renders /admin/staff | 768 | passed | roles.spec.ts:106 |
| authenticated fixture renders /admin/gallery | 768 | passed | roles.spec.ts:106 |
| authenticated fixture renders /admin/content | 768 | passed | roles.spec.ts:106 |
| authenticated fixture renders /admin/projects | 768 | passed | roles.spec.ts:106 |
| authenticated fixture renders /admin/blog | 768 | passed | roles.spec.ts:106 |
| authenticated fixture renders /admin/messages | 768 | passed | roles.spec.ts:106 |
| authenticated fixture renders /admin/courses | 768 | passed | roles.spec.ts:106 |
| authenticated fixture renders /admin/points | 768 | passed | roles.spec.ts:106 |
| authenticated fixture renders /admin/forms | 768 | passed | roles.spec.ts:106 |
| authenticated fixture renders /admin/forms/new | 768 | passed | roles.spec.ts:106 |
| authenticated fixture renders /admin/security | 768 | passed | roles.spec.ts:106 |
| authenticated fixture renders /admin/settings | 768 | passed | roles.spec.ts:106 |
| authenticated fixture renders /dashboard | 768 | passed | roles.spec.ts:106 |
| authenticated fixture renders /profile | 768 | passed | roles.spec.ts:106 |
| authenticated fixture renders /my-courses | 768 | passed | roles.spec.ts:106 |
| authenticated fixture renders /notifications | 768 | passed | roles.spec.ts:106 |
| blog edit opens, saves via PATCH and closes | 768 | passed | roles.spec.ts:117 |
| modal Escape closes and restores trigger focus | 768 | passed | roles.spec.ts:128 |
| record export downloads actual returned JSON and cache button clears browser cache | 768 | passed | roles.spec.ts:135 |
| member card downloads a real PNG whose QR opens private-safe verification | 768 | passed | roles.spec.ts:163 |
| profile security sends recovery link and requests email confirmation without profile overwrite | 768 | passed | roles.spec.ts:178 |
| profile email-change rejection stays visible and does not claim success | 768 | passed | roles.spec.ts:193 |
| form QR has correct URL and download is a decodable PNG | 768 | passed | roles.spec.ts:202 |
| certificate SVG and canvas QR decode to the matching verification URL | 768 | passed | roles.spec.ts:225 |
| card issuance failure disables download and retry recovers | 768 | passed | roles.spec.ts:237 |
| password recovery rejection is visible and retry works | 768 | passed | roles.spec.ts:248 |
| malformed membership URL is rejected without database lookup | 768 | passed | roles.spec.ts:257 |
| unknown membership token exposes no personal details | 768 | passed | roles.spec.ts:263 |
| password reset validates strength and surfaces authentication rejection | 768 | passed | roles.spec.ts:270 |
| member cannot search or download the club member directory | 375 | passed | roles.spec.ts:47 |
| profile saves edited name, rejects invalid phone and logs out | 375 | passed | roles.spec.ts:57 |
| form publish waits for autosave and reuses the created ID | 375 | passed | roles.spec.ts:73 |
| member direct admin URL stays outside admin controls | 375 | passed | roles.spec.ts:96 |
| authenticated fixture renders /admin | 375 | passed | roles.spec.ts:106 |
| authenticated fixture renders /admin/users | 375 | passed | roles.spec.ts:106 |
| authenticated fixture renders /admin/events | 375 | passed | roles.spec.ts:106 |
| authenticated fixture renders /admin/staff | 375 | passed | roles.spec.ts:106 |
| authenticated fixture renders /admin/gallery | 375 | passed | roles.spec.ts:106 |
| authenticated fixture renders /admin/content | 375 | passed | roles.spec.ts:106 |
| authenticated fixture renders /admin/projects | 375 | passed | roles.spec.ts:106 |
| authenticated fixture renders /admin/blog | 375 | passed | roles.spec.ts:106 |
| authenticated fixture renders /admin/messages | 375 | passed | roles.spec.ts:106 |
| authenticated fixture renders /admin/courses | 375 | passed | roles.spec.ts:106 |
| authenticated fixture renders /admin/points | 375 | passed | roles.spec.ts:106 |
| authenticated fixture renders /admin/forms | 375 | passed | roles.spec.ts:106 |
| authenticated fixture renders /admin/forms/new | 375 | passed | roles.spec.ts:106 |
| authenticated fixture renders /admin/security | 375 | passed | roles.spec.ts:106 |
| authenticated fixture renders /admin/settings | 375 | passed | roles.spec.ts:106 |
| authenticated fixture renders /dashboard | 375 | passed | roles.spec.ts:106 |
| authenticated fixture renders /profile | 375 | passed | roles.spec.ts:106 |
| authenticated fixture renders /my-courses | 375 | passed | roles.spec.ts:106 |
| authenticated fixture renders /notifications | 375 | passed | roles.spec.ts:106 |
| blog edit opens, saves via PATCH and closes | 375 | passed | roles.spec.ts:117 |
| modal Escape closes and restores trigger focus | 375 | passed | roles.spec.ts:128 |
| record export downloads actual returned JSON and cache button clears browser cache | 375 | passed | roles.spec.ts:135 |
| member card downloads a real PNG whose QR opens private-safe verification | 375 | passed | roles.spec.ts:163 |
| profile security sends recovery link and requests email confirmation without profile overwrite | 375 | passed | roles.spec.ts:178 |
| profile email-change rejection stays visible and does not claim success | 375 | passed | roles.spec.ts:193 |
| form QR has correct URL and download is a decodable PNG | 375 | passed | roles.spec.ts:202 |
| certificate SVG and canvas QR decode to the matching verification URL | 375 | passed | roles.spec.ts:225 |
| card issuance failure disables download and retry recovers | 375 | passed | roles.spec.ts:237 |
| password recovery rejection is visible and retry works | 375 | passed | roles.spec.ts:248 |
| malformed membership URL is rejected without database lookup | 375 | passed | roles.spec.ts:257 |
| unknown membership token exposes no personal details | 375 | passed | roles.spec.ts:263 |
| password reset validates strength and surfaces authentication rejection | 375 | passed | roles.spec.ts:270 |
