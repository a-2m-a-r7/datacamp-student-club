# Phase 1 discovery report — 13 October 2026

Scope: current main snapshot, on newly created qa-audit branch. The pre-existing older qa-audit branch was preserved as qa-audit-existing-20261013. No source edits, browser tests, database requests or test data creation. Historical reports elsewhere in qa-audit are not results from this session.

The companion INVENTORY.md contains 685 source-level control declarations with label/expression, element type, file:line, action, conditions and Not tested status. They include shared components, conditional dialogs, inputs, links, media and QR renderers. Mapped arrays and database records produce multiple runtime instances: 685 is not a runtime element count. Generic UI primitives and unused components are included for traceability, not assumed reachable pages. There are 49 concrete route patterns (25 public/session-dependent, 7 member, 17 admin), plus two fallback declarations and two router containers. Distinct page implementations are fewer because routes share components.

## Page / access / interaction inventory

Actions below describe the source's intended flow. Database success, redirects, downloads, permissions and external integrations remain unverified. Every input and conditional action has its source locator in INVENTORY.md.

| Access | Route(s) | Controls and expected outcome |
|---|---|---|
| Public/shared | Standard page layout | Logo and navigation links open their routes; mobile menu opens/closes; overlay dismisses; desktop sidebar collapses; Arabic/English changes language and direction; login/register/profile/logout depend on session; footer links open configured destinations; AI launcher opens chat. The /f layout excludes this standard shell. |
| Public/shared | AI dialog | Open/close, conversation reset, suggestions, text input and send, code-copy controls; replies should come from AI service and clipboard contents should match displayed code. |
| Public | / | Registration, course and compiler calls to action navigate to the corresponding routes. |
| Public | /about | Recruitment/course/contact calls to action and configured social links navigate to their specified destinations. |
| Public | /courses | Search, category/level filters, course links, enrollment and admin shortcut; filter changes card list; authenticated enrollment saves membership, visitor flow requests authentication. |
| Public | /courses/:slug | Back, share, enroll/resume, module accordions and lesson controls; copy current URL, expose syllabus, enroll or resume course. |
| Public | /compiler | Language/template selectors, code editor, stdin, run/reset/copy/clear output, AI dialog; execute code and display stdout/errors, preserve selected runtime and input. |
| Public | /leaderboard | Search and faculty filters; update displayed ranking. Static podium/stat displays are not automatically clickable controls. |
| Public + member conditional | /certificates; /verify-certificate; /verify-certificate/:code | My certificates/verify tabs, verification input/action, certificate viewer and close, link copy, LinkedIn share, print, full-size preview, PNG/PDF downloads and two QR renderers. Anonymous verification should resolve matching certificate; personal list requires user data. |
| Public + member action | /events | Search/category controls, registration and ticket dialog close; save registration and render its QR. Capacity/loading disables registration. |
| Public + conditional submission | /projects | Search/filter, project reader/submission dialogs, form fields/submit, dismiss, GitHub/live links; inspect project and submit fixture with persisted outcome. |
| Public | /blog | Search/tag filters, article reader, share/dismiss and related actions; open matching article, copy its usable link, close reader. |
| Public | /staff | Search/committee filters, contact/recruitment calls to action, configured social/email links; filter roster and open destination. |
| Public | /gallery | Category controls, photo/lightbox controls; filter images, open full image and dismiss. |
| Public | /contact | Contact inputs and submit; validate and persist message. Discord action exists only with configured URL; admin gets configuration link otherwise. |
| Public | /faq | Topic filters and question accordions, contact/course calls to action; filter/expand content and navigate. |
| Public | /privacy; /terms | Content-page shared component and any configured links; no invented page-specific actions. |
| Guest | /login | Google OAuth, email/password, visibility toggle, submit, forgot-password/register links and conditional account modal wiring; authenticate and return to intended route. |
| Guest | /register | Google OAuth, account/profile fields, visibility/choice controls, validation/submit and login link; create test auth/profile and confirm verification flow. |
| Guest | /forgot-password | Email and recovery submission, return navigation; send recovery to dedicated test mailbox. |
| Session/token dependent | /reset-password | New password/confirmation and submit; validate and update only disposable account with valid recovery context. |
| Session dependent | /verify-email | Confirmation status/resend/logout and navigation; resolve confirmation, deliver test email, clear session. |
| OAuth callback | /auth/callback | Callback completion/error/recovery navigation; establish session and return route from valid/invalid callback fixtures. |
| Public or configured auth | /f/:slug | All configured question types/options, respondent email, ratings, dates, files, consent/required states, section navigation, submit and repeat-response; validate and persist answers respecting schedule/limits/login settings. |
| Public fallback | Unknown URL | Return-home control; show fallback and navigate home. Not counted as concrete route pattern. |
| User | /dashboard | Course/certificate/catalog links, member ID PNG download, member QR and conditional admin shortcut; navigate and export own badge. |
| User | /profile | Profile fields/avatar picker/save, password/email update, OTP challenge/verify/resend/dismiss, recovery link; persist own profile and verify credential flow. |
| User | /my-courses | Course status filters and resume/catalog actions; filter enrollment and resume matching lesson. |
| User | /courses/:slug/learn | Syllabus drawer/lesson selection, video controls, code exercise/quiz components, AI, prev/next, completion/certificate actions; play media and persist only fixture progress. |
| User | /courses/:slug/quiz; /courses/:slug/quiz/:lessonId | QuizEngine answer selection, question navigation/submission/retry/result/course-return and coding actions where configured; evaluate and persist fixture result. |
| User | /notifications | All/unread controls, item/read/all-read/dismiss/navigation actions; persist changes to own notifications and check realtime. |
| Admin | /admin | Overview analytics and any wired refresh/navigation controls; fetch staging aggregates. Charts/metric cards without handlers remain passive. |
| Admin | /admin/users | Users/matrix tabs, search/filter/sort, refresh, import/export, add/edit/view/delete dialogs, role/permission editor, confirmation and pagination; use only QA_TEST accounts and verify Auth plus profile lifecycle. |
| Admin | /admin/courses | Search/create/edit/delete/view, thumbnail file picker, curriculum/lesson/quiz editors and ordering controls; persist disposable curriculum and navigate public preview. |
| Admin | /admin/events | Create/edit/delete, filters, attendee/organizer dialogs, camera QR scanner and dismiss; accept fixture tickets and persist attendance. |
| Admin | /admin/points | Member search, XP-award dialog, amount/reason and confirmation; persist disposable member XP and corresponding logs. |
| Admin | /admin/staff | Create/edit/delete, image and roster fields, save/cancel; persist QA_TEST roster entry. |
| Admin | /admin/gallery | Create/upload/URL fields/delete and dialogs; persist and remove QA_TEST image metadata/storage. |
| Admin | /admin/projects | Project search/create/edit/delete, metadata/link fields and dialogs; persist QA_TEST project. |
| Admin | /admin/blog | Post create/edit/delete, article metadata/content fields and dialogs; persist QA_TEST article. |
| Admin | /admin/content | Home/about tabs, branding/contact/social/community fields, image pickers and save; update isolated staging settings and restore prior values. |
| Admin | /admin/messages | Search/filter, message detail/read/reply/delete actions where wired; inspect own test contact submission and verify each declared outcome. External reply behavior needs confirmation. |
| Admin | /admin/security | Logs refresh/filter/export where wired, firewall/blocklist/threat controls and save/apply; distinguish settings persistence from actual enforcement. Isolation and baseline restoration required. |
| Admin | /admin/settings | Config fields/toggles/save and auxiliary actions; confirm maintenance/security side effects and restore staging settings. Handler-less auxiliary controls need clarification. |
| Admin | /admin/forms | Search/status filters, new/edit, share, preview, responses, duplicate/delete and menus; navigate and manage disposable form. |
| Admin | /admin/forms/new; /admin/forms/builder/:id | Title/description/slug, question-type picker, question/options edits, required switches, reorder/duplicate/delete, theme/settings/share dialogs, desktop/mobile preview, save/publish; persist form/questions/settings. Preview inputs/submit are intentionally disabled. |
| Admin | /admin/forms/:id/responses | Summary/individual tabs, search/filter/pagination, export XLSX/CSV, response inspection/deletion, Sheets sync and link actions; verify aggregate/individual fixture data and downloaded contents. |

## Static observations requiring Phase 2 or clarification

| Source | Observation | Classification / next step |
|---|---|---|
| api/admin/users.ts:17 | Handler accepts POST and creates/deletes records through a server-side client; no caller token/role verification is present in this function. | High-priority potential permission leak; do not exercise deletion against existing records. Verify unauthorized behavior with isolated fixtures and deployment protection. |
| api/forms/sync-sheet.ts:26 | No caller authentication/authorization gate in the handler before service-account sync. | Potential unauthorized sync/data export; verify API protection on staging only. |
| api/ai/chat.ts:11 | POST AI proxy has no visible caller auth/rate-limit gate in handler. | Clarify whether anonymous AI is intended; inspect deployment limits before judging. |
| src/pages/admin/forms/FormBuilder.tsx:619,627,650 | Constant disabled preview inputs and submit. Submit explicitly says preview only. | Intentional preview controls; not broken buttons. |
| Source candidates listed in INVENTORY.md | 53 buttons lack local click/type declarations, often nested under a Link or form. | Review wrappers and runtime state before classification; no confirmed failure count. |
| Existing qa-audit/INVENTORY.md and REPORT.md | Prior report assumptions differ from present source, including role hierarchy, footer social links and Discord action. | Historical only. This discovery folder is the current run's inventory. |

Literal href="#", javascript:void(0), empty arrow click handlers and disabled={true} were searched. No literal dead-link/empty-handler match found in current src. Dynamic missing URLs still require fixtures and runtime testing. Logging in compiler example programs and server operations is not evidence of a console-only button. Code-defined RLS policies do not prove deployed authorization.

## QR inventory

| Location | Encoded source value | Required verification |
|---|---|---|
| Events.tsx:99 | showSuccess.qrCode, constructed as REG-${event.id}-${activeUserId} at line 63 | Decode exact ticket payload and check scanner acceptance; clarify expected identifier contract. |
| Dashboard.tsx:489 | profile.memberId | Decode own member ID, compare badge export; clarify scanner contract. |
| CertificateView.tsx:766,1017 | verificationUrl | Decode both canvas and SVG/exported artifacts; compare approved domain and certificate code; open verification page. |
| FormShareModal.tsx:132 | Public form share URL | Decode rendered/exported QR, compare approved domain/slug, open intended published form. |
| Admin EventManagement | Camera scanner (not a generated QR) | Permission denied/no camera/invalid/duplicate/valid fixture scans; database attendance check. |

## Inputs needed before testing

- Explicit Phase 2 approval and local/staging URL, with confirmation its database/storage and external integrations use test resources. Vite alone does not execute the three Vercel API handlers.
- Dedicated QA_TEST member and verified super-admin credentials, delivered/configured privately; dedicated recovery/verification mailbox and Google OAuth account. Do not paste service-role keys into chat.
- Staging Supabase verification access (read-only for verification where possible), fixture IDs for all content types, and agreed cleanup method for created records, uploads and external Sheets.
- Expected behavior for handler-less controls without enclosing navigation/submission, admin message reply, security enforcement and demo-account behavior. Confirm member/event QR identifier contracts; these are not URL QRs.
- Dedicated AI/Sheets/camera fixtures and authorization to exercise their normal test flows; confirm expected social/community URLs and supported code runner languages.

No test data was created. No cleanup is required from this run. All browser behavior, mobile/tablet layout, keyboard/accessibility, console/network errors, downloads, QR decoding and database outcomes remain Not tested until approval. Phase 3 pass/fail report and broken-buttons.csv will be generated from actual evidence, not this static inventory.
