# Admin UI source inventory — STEP 1 (not executed)

Scope: `src/pages/AdminDashboard.tsx`, every `src/pages/admin/**` page, every `src/components/admin/**` component, and their shared image/identity controls. This is a source inspection only: no application, browser, API, database, or integration tests have been executed for this inventory. Expected outcomes below describe implemented intent, not verified behavior. Every row remains **Pending approval / Not run**. References are repository-relative `file:line` locations.

## Role model and route boundaries

- **ADM-GUARD-01** `/admin/*`: `src/App.tsx:101` ManagerRoute requires a signed-in, confirmed, active profile and `isManager`; otherwise login/dashboard redirects or status feedback. Proposed: visitor, active member, inactive admin, unconfirmed admin, expired session, profile-load failure, direct deep link and refresh.
- **ADM-GUARD-02** nested routes and super-admin bypass: `src/pages/AdminDashboard.tsx:26` RoleGuard; all 14 route destinations are listed below. Proposed: direct URL/API authorization, hidden navigation, history-back after logout, refresh/session expiry while a modal is open.
- **ADM-GUARD-03** frontend has exactly **two roles**: `super_admin` and `member` (`src/types/index.ts:9`, `src/lib/roleDefinitions.ts:40`). All `isAdmin`, `isEditor`, `isHR`, `isEventManager`, `isContentManager`, `isFinanceManager`, `isOrganizer`, `isManager` alias `isSuperAdmin` (`src/contexts/AuthContext.tsx:487`). UI role normalization maps legacy DB admin into super_admin (`src/pages/admin/UserManagement.tsx:32`). Proposed: verify normalization and no false escalation from user metadata.
- **ADM-GUARD-04** database constraint is `profiles.role IN ('user','admin')` (`supabase/migrations/20261010000004_phase2_schema_hardening.sql:52`); user management converts member→user, super_admin→admin (`src/pages/admin/UserManagement.tsx:36`). Server admin endpoints require verified email, active profile, admin/super_admin role (`api/_lib/authorize.ts:4`, `api/_lib/authorize.ts:30`). Proposed: RPC/RLS restrictions and identity-vs-payload trust checks in isolated database.
- **ADM-DECISION-01 — Needs decision:** requested distinct admin/hr/event_manager/content_manager/editor test accounts cannot be assigned distinct existing privileges: those roles do not exist in the current type, role picker, or DB role constraint. Test supported member/super_admin and deny malformed unsupported role payloads; do not implement or silently infer new privileges. Ask whether the two-role design is the accepted product model or a future six-role implementation is required.
- **ADM-DECISION-02 — Needs decision:** role descriptions/permission cards are display metadata, not independently editable ACLs (`src/lib/roleDefinitions.ts:12`, `src/components/admin/RoleEditorModal.tsx:205`). Member description still mentions competing on leaderboard although Sidebar exposes it only for admin (`src/components/Sidebar.tsx:73`). Verify actual privacy intent against backend, without changing access rules from copy alone.

| ID | Admin route / navigation target | Source / effective current access |
|---|---|---|
| ADM-NAV-01 | Overview `/admin` | `src/components/Sidebar.tsx:86`; `src/pages/AdminDashboard.tsx:57`; super_admin |
| ADM-NAV-02 | Courses `/admin/courses` | Sidebar:87; AdminDashboard:107; super_admin |
| ADM-NAV-03 | Points & XP `/admin/points` | Sidebar:88; AdminDashboard:113; super_admin |
| ADM-NAV-04 | Users `/admin/users` | Sidebar:89; AdminDashboard:59; super_admin |
| ADM-NAV-05 | Events `/admin/events` | Sidebar:90; AdminDashboard:65; super_admin |
| ADM-NAV-06 | Forms `/admin/forms/*` | Sidebar:91; AdminDashboard:119; super_admin |
| ADM-NAV-07 | Staff `/admin/staff` | Sidebar:92; AdminDashboard:71; super_admin |
| ADM-NAV-08 | Gallery `/admin/gallery` | Sidebar:93; AdminDashboard:77; super_admin |
| ADM-NAV-09 | Projects `/admin/projects` | Sidebar:94; AdminDashboard:89; super_admin |
| ADM-NAV-10 | Blog `/admin/blog` | Sidebar:95; AdminDashboard:95; super_admin |
| ADM-NAV-11 | Messages `/admin/messages` | Sidebar:96; AdminDashboard:101; super_admin |
| ADM-NAV-12 | Content `/admin/content` | Sidebar:97; AdminDashboard:83; super_admin |
| ADM-NAV-13 | Security `/admin/security` | Sidebar:98; AdminDashboard:125; super_admin |
| ADM-NAV-14 | Profile `/profile` (shared member page) | Sidebar:99; `src/App.tsx:296`; profile inventory belongs in shared/member matrix |
| ADM-NAV-15 | Settings `/admin/settings` | Sidebar:100; AdminDashboard:131; super_admin |

For **each** navigation item propose mouse, keyboard, active marker, AR/EN label, collapsed/mobile menu, direct load, allowed/denied role, and fallback on lazy-module/network failure. Sidebar link expressions retain references to legacy role flags, but those flags currently all resolve to the same super_admin boolean. No distinct legacy-role access has been assumed.

## Shared child interactions

| ID | Control / expected result | Source and service/API | Proposed boundary/error cases |
|---|---|---|---|
| ADM-SHARED-01 | Image import from device → preview; parent saves persistent URL | `src/components/ImagePicker.tsx:23`, `src/services/contentService.ts:225`; storageService uploadFile | JPEG/PNG/WebP, empty/cancel, 5 MiB edge and +1 byte, SVG/executable spoof, FileReader failure, unavailable storage |
| ADM-SHARED-02 | TAKE_PHOTO → capture chooser then same preview path | ImagePicker:91 | desktop/mobile, denied camera, cancel, unsupported format |
| ADM-SHARED-03 | SELECT_PHOTO_ARCHIVE → prompt accepts HTTPS URL only | ImagePicker:100 | cancel, invalid URL, HTTP/data/javascript, broken/blocked image, no random replacement |
| ADM-SHARED-04 | Remove image overlay → clears parent value | ImagePicker:68 | keyboard reachability, touch, disabled/busy, save/reload |
| ADM-SHARED-05 | Identity mode By Email / By ID → clears prior value | `src/components/UserIdentityInput.tsx:31`, :60 | switch with input, stale selection, empty string |
| ADM-SHARED-06 | Identity text + suggestion dropdown → select exact member email/ID | UserIdentityInput:25, :40, :103 | name/email/id partial, case, no matches, max five, blur timing, keyboard, inaccessible member directory |
| ADM-SHARED-07 | Dialog close/Escape/backdrop/focus restore on admin modal | `src/components/ui/Dialog.tsx:1`; callers below | focus trap and return, nested dialog, scroll lock, busy close guards, keyboard-only and AR/RTL |

## Overview `/admin`

| ID | Control / expected result | Source / backend | Proposed cases |
|---|---|---|---|
| ADM-OV-01 | Four statistic cards read actual counts; uptime placeholder is `—` | `src/pages/admin/Overview.tsx:29`; profiles/events exact counts and registered_count sum | zero records, failed one query, large count, no fabricated uptime/trend |
| ADM-OV-02 | Growth chart hover tooltip | Overview:51, :116; RPC admin_growth | empty series, valid dates/counts, mobile tooltip, RPC denial |
| ADM-OV-03 | Audit ellipsis link → `/admin/security` | Overview:139; audit_logs latest 5 | no audit data, forbidden query, link keyboard label |

## Courses `/admin/courses` and nested editors

| ID | Control / expected result | Source / backend | Proposed cases |
|---|---|---|---|
| ADM-CRS-01 | Search title/category/instructor, asynchronous course list | `src/pages/admin/CourseManagement.tsx:252`; `src/services/courseService.ts:110` list_course_catalog RPC | blank, Arabic/English/case, no matches, rapid out-of-order responses, SQL wildcard input |
| ADM-CRS-02 | Retry courses | CourseManagement:224; fetchCourses/loadMore | first-page vs later-page error, preserve visible records |
| ADM-CRS-03 | Load more courses | CourseManagement:406; cursor RPC | empty/final page, concurrent click, tied created_at, search resets cursor, no duplicates |
| ADM-CRS-04 | Add course → clean draft editor | CourseManagement:70, :239 | reopen after canceled edit, create IDs stable on retry |
| ADM-CRS-05 | Row Edit course → editor populated | CourseManagement:91, :366 | null optional values, old formats, all fields round trip |
| ADM-CRS-06 | Row publish/unpublish → persisted status | CourseManagement:111, :357; courseService.setCoursePublished:446 | missing lessons, incomplete assessments, repeated clicks, denial, enrolled learners visibility |
| ADM-CRS-07 | Row delete → confirmation → deleteCourse | CourseManagement:96, :375; courseService:369 | cancel, enrolled course, FK failure, stale ID, repeated confirm; isolated QADM-owned data only |
| ADM-CRS-08 | Row Manage Lessons → loads selected course only | CourseManagement:122, :348; getCourseLessons:193 | no lessons, >100 lessons, load failure, rapid different course selection |
| ADM-CRS-09 | Editor cover ImagePicker and direct upload | CourseManagement:55, :425, :431; uploadThumbnail:462 | shared image cases, pending read/upload blocks save, two different image workflows persist |
| ADM-CRS-10 | Editor cover URL | CourseManagement:447 | empty, valid HTTPS, invalid/broken URL, external image failure |
| ADM-CRS-11 | Editor title, slug | CourseManagement:463, :476; saveCourse:297, courseSlug:27 | required/whitespace, Arabic title, duplicate/changed slug, max DB limits |
| ADM-CRS-12 | Editor category data_science/ai_ml/business_intelligence/software_eng | CourseManagement:491 | every option round trip, invalid request enum |
| ADM-CRS-13 | Editor level beginner/intermediate/advanced | CourseManagement:507 | each option, invalid enum |
| ADM-CRS-14 | Editor status draft/published; publish disabled for unsaved course | CourseManagement:522 | force request bypass, zero lessons, switching published existing course |
| ADM-CRS-15 | Editor XP, duration hours, total lessons numeric fields | CourseManagement:539, :551, :563 | zero/negative/fraction/nonfinite/maxsafe, derived count consistency |
| ADM-CRS-16 | Instructor, short description, full description | CourseManagement:577, :590, :603 | empty optional, whitespace, Unicode, multiline, HTML/script shown safely |
| ADM-CRS-17 | Tags, skills, prerequisites comma-separated | CourseManagement:617, :628, :639 | trim, empty entries, duplicates, Arabic commas, array reload |
| ADM-CRS-18 | Save course | CourseManagement:197, :660; saveCourse:297 | duplicate-submit, response lost after insert, dirty/new vs edit, DB error retains inputs |
| ADM-CRS-19 | Editor Close / Cancel | CourseManagement:417, :650 | unsaved input, busy disabled, Escape/backdrop, reopen cleanly |
| ADM-LSN-01 | Lesson manager Add lesson / close manager | CourseManagement:136, :681, :685 | unsaved lesson vs saved selection, busy media blocks manager close |
| ADM-LSN-02 | Lesson row edit / delete with confirmation | CourseManagement:179, :724, :732; saveLesson/deleteLesson | cancel, stale row, dependent quiz/exercise/assets/progress; only QA data |
| ADM-LSN-03 | Lesson row drag/drop order | CourseManagement:195, :702; RPC reorder_course_lessons | first/last/same/invalid target, duplicate IDs, concurrency, permission failure rollback |
| ADM-LSN-04 | Move lesson up/down accessible buttons | CourseManagement:722 | first/last disabled, stable positions after reload |
| ADM-LSN-05 | Lesson title, unit selector/general lessons | CourseManagement:758, :765 | required title, removed/noncourse unit ID, correct group after reload |
| ADM-LSN-06 | Type article/video/quiz/exercise/project | CourseManagement:768 | each branch and switch branch with unsaved values |
| ADM-LSN-07 | Position, duration minutes, XP | CourseManagement:780, :790, :797 | zero, negative, decimal, huge value, position collision |
| ADM-LSN-08 | Video URL and content/instructions | CourseManagement:806, :813 | supported embed vs external, invalid URL/script, Markdown/multiline content |
| ADM-LSN-09 | Public preview checkbox | CourseManagement:823 | public published visibility, private drafts remain private, unenrolled access |
| ADM-LSN-10 | Save lesson / Cancel / X | CourseManagement:158, :753, :835, :838; courseService.saveLesson:383 | double save, validation, network loss, busy media locks, preserve in-memory data on error |
| ADM-UNIT-01 | Unit title and Add unit | `src/components/admin/CourseUnitsEditor.tsx:11`, :13; course_modules upsert | blank trimmed disabled, 200 chars/+1, duplicate names, valid position |
| ADM-UNIT-02 | Unit Edit / Save unit / Cancel | CourseUnitsEditor:11, :13 | preserve ID/order/lessons, cancel clears edit, failures retain correct item |
| ADM-UNIT-03 | Unit drag/drop; Up; Down | CourseUnitsEditor:12, :13; reorder_course_modules RPC | same target, first/last disabled, missing IDs, unauthorized request, concurrent reorder |
| ADM-QUIZ-01 | Quiz text language ar/en | `src/components/admin/CourseQuizEditor.tsx:29` | persist both versions; UI language vs editing language; no correct-index drift |
| ADM-QUIZ-02 | Per-question text max 4000 | CourseQuizEditor:32; courseService.saveLesson:383 | blank/whitespace/max/+1, legacy question, bilingual missing counterpart |
| ADM-QUIZ-03 | Per-option text max 2000 and correct answer radio | CourseQuizEditor:34, :35 | 2–10 choices, duplicates/blank, index bounds, stable order across languages |
| ADM-QUIZ-04 | Per-question explanation max 1500 | CourseQuizEditor:37 | optional blank, both languages, multiline/max/+1, safe rendering |
| ADM-QUIZ-05 | Add option / Remove question / Add question | CourseQuizEditor:39, :40, :43 | option ceiling10, question ceiling100, unique IDs, remove selected correct question, empty quiz rejection |
| ADM-EX-01 | Exercise language python/javascript/typescript/sql/cpp/java/r/go/rust | `src/components/admin/CourseExerciseEditor.tsx:8` | each language persisted; external runtime unavailable disclosed |
| ADM-EX-02 | Instructions, starter code, reference solution | CourseExerciseEditor:8; courseService.saveLesson | empty required fields, indentation/Unicode, escaping, long source limits |
| ADM-EX-03 | Per-test description/stdin/exact stdout | CourseExerciseEditor:8 | empty stdin, trailing newline, multiline, Unicode, wrong output rejected in learner flow |
| ADM-EX-04 | Add test case / Remove test | CourseExerciseEditor:8 | max10, zero tests rejection, shared editor state after removal |
| ADM-MEDIADM-01 | Connect/Reconnect Google Drive | `src/components/admin/LessonMediaEditor.tsx:23`, :28; POST /api/courses/drive status/connect | unconfigured disabled, OAuth denial/state expiry, old token refresh, scope unchanged; integration Needs credentials |
| ADM-MEDIADM-02 | Video file chooser MP4/WebM/MOV | LessonMediaEditor:16, :31; fileHashes→driveUpload; /api/courses/media start/restart/finish | cancel/0bytes/2GiB edge/+1, MIME/signature mismatch, insufficient quota, hashing abort |
| ADM-MEDIADM-03 | Material chooser PDF/Office/CSV/text/ZIP/notebook/code/SQL/JSON | LessonMediaEditor:32; same media service kind material | each allowed class, wrong extension/signature, duplicate file, original name safe |
| ADM-MEDIADM-04 | Subtitle SRT/VTT chooser and ar/en language | LessonMediaEditor:33, :34 | valid conversion/encoding, malformed cue timing, no text, malicious tags, correct track locale |
| ADM-MEDIADM-05 | Auto AI checkbox | LessonMediaEditor:36 | checked sends video copy to Gemini only after upload; unchecked upload-only; materials never auto analyzed |
| ADM-MEDIADM-06 | Privacy details link new tab | LessonMediaEditor:37 | correct /privacy, noopener/noreferrer, AR/EN disclosure |
| ADM-MEDIADM-07 | Analyze saved lesson video chooser | LessonMediaEditor:22, :38; /api/courses/analyze prepare/status/generate | disabled without saved video, mismatch file fingerprint, provider timeout/quota/malformed response, resume pending job |
| ADM-MEDIADM-08 | Pause upload / progress status | LessonMediaEditor:39; courseMediaService:9, :25 | pause hashing/Drive/Gemini, same-file resume, expired session restart, lost final response recovery, no duplicate asset |
| ADM-MEDIADM-09 | Existing saved file Open file links | LessonMediaEditor:41 | video/material/subtitle, correct persisted Drive link, removed provider object, accessible link policy |
| ADM-MEDIADM-10 | AI review bilingual questions/correct choices/explanations; optional coding exercise | LessonMediaEditor:42; quizText; /api/courses/analyze latest/generate | unsupported video claims, no-code content→null exercise, invalid bilingual structure rejected, prompt-injection in source |
| ADM-MEDIADM-11 | Apply summary, quiz and coding practice | LessonMediaEditor:24, :42; /api/courses/analyze apply | repeated application idempotent, correct source lesson/course, no stale overwrite, failure retry, generated content remains editable |

## Users `/admin/users` and role editor

| ID | Control / expected result | Source / backend | Proposed cases |
|---|---|---|---|
| ADM-USR-01 | Refresh directory/activity and toggle live activity feed | `src/pages/admin/UserManagement.tsx:137`, :379, :389; profiles/enrollments directory pages, auth_events latest40; realtime channel | zero rows, >500 rows, feed show/hide, revoked session, duplicated realtime, missing timestamps |
| ADM-USR-02 | Export all loaded members to XLSX | UserManagement:310, :397; XLSX.writeFile | empty records, filtered-vs-all expected export, Unicode/date cells, formula injection, no password/token |
| ADM-USR-03 | Import CSV/XLSX metadata only | UserManagement:333, :613; RPC import_member_metadata | known Emails required, Name/Faculty edits only, unknown/duplicate email, empty/bad workbook, first-sheet contract, attempt role/password columns ignored, atomic failure |
| ADM-USR-04 | Add member opens form | UserManagement:401, :1146 | clean form reopening, no inherited role |
| ADM-USR-05 | New full name/email/password | UserManagement:1149, :1158, :1168; /api/admin/users create | whitespace, malformed/duplicate email, password <8, strong server rules, email confirmation contract |
| ADM-USR-06 | New role / faculty dropdowns | UserManagement:1179, :1190 | both supported roles, every faculty value, unsupported crafted role rejects |
| ADM-USR-07 | New account submit / Abort | UserManagement:297, :1205; authenticatedPost /api/admin/users | repeated click, auth create→profile update failure rollback, inputs retained on failure, no production fixture |
| ADM-USR-08 | Users / permissions matrix top tabs | UserManagement:564, :579 | tab state, data counts accurate, keyboard |
| ADM-USR-09 | Directory search name/email/member ID | UserManagement:193, :603 | trim/case/Arabic/no results, exact existing values, page reset |
| ADM-USR-10 | Role / provider / status filters | UserManagement:629, :651, :668 | all role options; Google/email; active/inactive/online; intersect filters; 5min online cutoff boundaries |
| ADM-USR-11 | Sort newest/oldest/name/points/activity | UserManagement:223, :686 | equal/null/invalid timestamps, locale name sorting, page reset |
| ADM-USR-12 | Previous / next pagination | UserManagement:246, :909, :922 | zero/one/full page, first/last disabled, filter while on last page, no lost rows |
| ADM-USR-13 | Row grant super-admin shortcut and role dropdown | UserManagement:830, :842; pendingRoleChange→assign_member_role | both role directions, self/last-admin protections, stale selected user, no server bypass |
| ADM-USR-14 | Role change confirmation Apply / Cancel | UserManagement:258, :1086, :1093; assign_member_role RPC | failure retains confirmation; repeated confirm; own role UI and session after change |
| ADM-USR-15 | Row Permissions Editor | UserManagement:864; RoleEditorModal | target identity correct, no cross-user stale state |
| ADM-USR-16 | Row View Intel opens details | UserManagement:873, :1236 | populated email/faculty/points/enrollment/role vs truthful missing fields; no fake placeholder interpreted as fact |
| ADM-USR-17 | Detail Edit Permissions / Close / X | UserManagement:1276, :1288, :1236 | transitions target identity, focus restoration |
| ADM-USR-18 | Row Delete opens confirm; Cancel / Delete | UserManagement:882, :1123, :1126; /api/admin/users delete | current account deletion server denied, orphan/cascade behavior, nonadmin denied, retry after lost response |
| ADM-USR-19 | Matrix role card VIEW_USERS | UserManagement:971 | sets role filter and users tab accurately |
| ADM-ROLE-01 | Role modal Select Role / Permissions Matrix tabs | `src/components/admin/RoleEditorModal.tsx:116`, :124 | current/proposed summaries and counts, display-only permission cards |
| ADM-ROLE-02 | Select member / super_admin cards mouse + Enter/Space | RoleEditorModal:139, :149 | unchanged selection disables save; role permission display matches metadata |
| ADM-ROLE-03 | Apply clearance / Cancel / X | RoleEditorModal:45, :88, :269, :272; parent pendingRoleChange callback | save pending, failure, target switch, both modal layers, no privilege until RPC succeeds |

## Points `/admin/points`

| ID | Control / expected result | Source / backend | Proposed cases |
|---|---|---|---|
| ADM-XP-01 | Search member by name/email/id | `src/pages/admin/PointsManagement.tsx:36`, :67, :105; profiles read | no matches/empty, Arabic/case, large directory, no member access |
| ADM-XP-02 | GRANT_XP opens chosen member dialog | PointsManagement:147 | correct target, multiple reopen, current total |
| ADM-XP-03 | Presets +50/+100/+200/+350/+500 | PointsManagement:180 | each fills amount, no save until submit; top bounty cards are informational |
| ADM-XP-04 | Amount / reason fields | PointsManagement:195, :206 | positive safe integer/reason required; zero/negative/fraction/overflow/whitespace |
| ADM-XP-05 | DISPATCH_POINTS | PointsManagement:51, :224; pointsService.awardPoints:52 → award_points RPC ADMIN_BONUS | authorization, duplicate submission, DB total/log consistency, lost response retry |
| ADM-XP-06 | Close / Cancel | PointsManagement:171, :216 | no award on cancel; keyboard/dialog accessibility |

## Events `/admin/events`

| ID | Control / expected result | Source / backend | Proposed cases |
|---|---|---|---|
| ADM-EVT-01 | Create event / edit row modal | `src/pages/admin/EventManagement.tsx:173`, :192; contentService events list/create/update | empty list, existing registered_count retained, realtime refresh, permission error |
| ADM-EVT-02 | Create title, description, datetime, location, capacity | EventManagement:428, :431, :440, :451, :460, :469 | required title/date/location; valid UTC/local round trip and DST; integer capacity>=1 |
| ADM-EVT-03 | Publish event / Abort creation | EventManagement:135, :472, :473; contentService.create events | double submit, DB failure, date invalid, capacity zero/negative/fraction |
| ADM-EVT-04 | Edit title/description/date/location/capacity | EventManagement:304, :307, :315, :325, :334, :342 | capacity cannot be below registered; registration concurrent with editing; stale editor cannot overwrite tickets/counter |
| ADM-EVT-05 | Update parameters / Abort edit | EventManagement:80, :345, :346; contentService.update events | exact target, retained registrations/organizers, failure inputs retained |
| ADM-EVT-06 | Delete row / Abort / Purge | EventManagement:200, :290, :291; contentService.remove events | cancel, FK cascade/tickets, active attendees, denial/retry; QADM-owned only |
| ADM-EVT-07 | Public link new tab `/events?event=id` | EventManagement:269 | correct event selected, missing/stale event ID, no opener leak |
| ADM-EVT-08 | SCAN QR opens scanner; scanner library camera/file controls | EventManagement:54, :72, :239; html5-qrcode → resolve_member_card_ticket then check_in_event RPC | denied/no camera, file QR, malformed/expired ticket, other event, unregistered member, duplicate scan concurrency, scanner cleanup on close |
| ADM-EVT-09 | Scan modal X | EventManagement:359 | stop tracks, unmount cleanup, no late duplicate attendance after closing |
| ADM-EVT-10 | Organizers modal; identity By Email/ID and suggestion picker | EventManagement:253, :374, :379; profiles suggestions + shared UserIdentityInput | unknown/duplicate/empty identity, selected target event, exact member |
| ADM-EVT-11 | Organizer Add / row Delete | EventManagement:92, :387, :395; contentService.update events.organizers | preserve counters/registrations, stale concurrent editor, same organizer twice |
| ADM-EVT-12 | Organizers X | EventManagement:374 | close/reopen resets target, keyboard |

## Staff, Gallery, Projects, Blog, Messages

| ID | Control / expected result | Source / backend | Proposed cases |
|---|---|---|---|
| ADM-STF-01 | Roster refresh (handleSave is read-only refresh) | `src/pages/admin/StaffManagement.tsx:41`, :102; contentService.list staff | actual label vs behavior, denied fetch, realtime update |
| ADM-STF-02 | Add member opens modal; name/title fields | StaffManagement:106, :179, :183 | required trimmed values, Unicode/long strings; no existing-row Edit control in this source |
| ADM-STF-03 | Category five choices | StaffManagement:189 | High Board/Academic Committee/Tech & Development/Media & PR/HR & Operations persist and public grouping |
| ADM-STF-04 | Operative Image picker | StaffManagement:198; shared ImagePicker + contentService persistent image | shared image cases, canceled add must not pretend saved |
| ADM-STF-05 | Add social; per-social platform/url | StaffManagement:87, :210, :217, :228 | empty/unsafe URL, multiple socials, icon mapping; no per-social delete control exposed here |
| ADM-STF-06 | INITIALIZE / ABORT | StaffManagement:49, :243, :244; contentService.create staff + logAction | double submit, upload failure, successful record but audit log failure, clean reopen |
| ADM-STF-07 | Row delete; Abort/confirm | StaffManagement:73, :117, :159, :160; remove staff + storageService.deleteFile + audit | canceled/no change, storage cleanup failure warns, database remains source of truth |
| ADM-GAL-01 | Visual Asset ImagePicker | `src/pages/admin/GalleryManagement.tsx:81`; contentService image persist | shared image limits/remote URL/capture |
| ADM-GAL-02 | Caption/title and category selector four options | GalleryManagement:89, :101 | Campus Days/Workshops/Hackathons/Ceremonies, empty title/image, safe Unicode |
| ADM-GAL-03 | ADD TO GRID | GalleryManagement:32, :95; contentService.create gallery | repeated click, storage/DB error, image visible after reload/public filter |
| ADM-GAL-04 | Row Delete / Abort / confirmation | GalleryManagement:55, :114, :138, :139; remove gallery | cancel, failure, correct row, archive category existing data; no edit/reorder control in source |
| ADM-PRJ-01 | Add project opens modal | `src/pages/admin/ProjectManagement.tsx:118`; contentService.list/subscribe projects | no records/network failure/realtime |
| ADM-PRJ-02 | Title/category/tech stack/project URL/description | ProjectManagement:185, :189, :196, :200, :224 | title and description required by service, split comma tech, HTTP(S) only, URL currently copied into both github_url/live_url |
| ADM-PRJ-03 | Lead developer optional identity picker | ProjectManagement:206; UserIdentityInput + profiles list | both modes, absent fallback, correct saved author label |
| ADM-PRJ-04 | Cover ImagePicker | ProjectManagement:216 | shared upload validation/persistence |
| ADM-PRJ-05 | Publish/create and Abort | ProjectManagement:65, :83, :233; contentService.create projects active, created_by auth user | duplicate submit, malformed URL, missing auth, save error/reopen clean |
| ADM-PRJ-06 | Pending project Publish approval | ProjectManagement:136; contentService.update status active | pending→active visible publicly, preserved fields, unauthorized request |
| ADM-PRJ-07 | Row Delete + cancel/confirm modal | ProjectManagement:103, :130, :167, :168; contentService.remove projects | correct target, canceled deletion, failure; no edit control exposed |
| ADM-BLOG-01 | NEW_POST / row Edit | `src/pages/admin/BlogManagement.tsx:107`, :127; contentService.list/subscribe blog | form reset vs existing content populated, author identity old format |
| ADM-BLOG-02 | Title / Article Content / optional author identity picker | BlogManagement:167, :171, :179 | required title/content, multiline/Unicode/XSS, optional default Club Admin, By ID/Email correct |
| ADM-BLOG-03 | PUBLISH / ABORT | BlogManagement:53, :188, :189; contentService.create/update blog | repeated save, DB failure, maintain existing status/id, no phantom success |
| ADM-BLOG-04 | Delete / Abort / Confirm purge | BlogManagement:88, :132, :150, :151; contentService.remove blog | canceled/no effect, correct row, failure retained |
| ADM-MSG-01 | View message marks read and opens detail modal | `src/pages/admin/MessageManagement.tsx:43`, :104; contentService.update messages status read | persisted unread→read, mark-read failure not falsely represented, actual message content safe |
| ADM-MSG-02 | Detail Close / REPLY_VIA_EMAIL | MessageManagement:170; mailto target only | closes focus correctly, safe address/no header injection, opens mail client; does not send email automatically |
| ADM-MSG-03 | Row Delete / Cancel / Delete confirmation | MessageManagement:33, :107, :132; contentService.remove messages | exact target, cancellation, failed delete, empty/loading/listener states |

## Content `/admin/content`, Security and Settings

| ID | Control / expected result | Source / backend | Proposed cases |
|---|---|---|---|
| ADM-CNT-01 | Home Page / About Us / Discord & Social Links tabs | `src/pages/admin/ContentManagement.tsx:15`, :112 | tab retains unsaved state, keyboard/focus, mobile |
| ADM-CNT-02 | Hero title and subtitle | ContentManagement:138, :145 | Unicode, multiline, empty/long, public Home after reload |
| ADM-CNT-03 | Mission / Vision / History | ContentManagement:171, :179, :198 | all three persisted/public About; HTML safe |
| ADM-CNT-04 | Discord/GitHub/LinkedIn/Twitter/Facebook URL fields | ContentManagement:226, :252, :260, :268, :276 | empty hides, malformed/unsafe URL, changes reflected footer/contact/public UI |
| ADM-CNT-05 | Save all content | ContentManagement:68, :104; contentService.upsertSetting home/about/site aliases | load failure prevents save, partial multi-record failure visible, general merges preserve branding, retry/double click |
| ADM-SEC-01 | Refresh audit records | `src/pages/admin/Security.tsx:12`, :32; audit_logs newest100 | no records, denied query, timestamp/action/actor/status, busy throttle |
| ADM-SEC-02 | Send password recovery email to current user only | Security:22, :33; Supabase resetPasswordForEmail redirect site/reset-password | missing email disabled, throttle/provider failure, redirect correct, controlled test inbox only |
| ADM-SET-01 | Site main name / subname / description / contact email / phone | `src/pages/admin/Settings.tsx:114`, :121, :135, :143, :151 | blank/Unicode/length/invalid email/phone, public reflect after reload |
| ADM-SET-02 | Platform Logo ImagePicker | Settings:128; persistent branding image | all shared cases, load/save failure |
| ADM-SET-03 | Add Link; social Platform and URL; row Delete | Settings:60, :169, :180, :188, :195 | empty/multiple/duplicate/unsafe URLs, remove correct index, public footer hides absent |
| ADM-SET-04 | Primary Neon Color picker | Settings:220 | valid color persisted/applied globally, invalid crafted value, accessible contrast review |
| ADM-SET-05 | Open Registration toggle | Settings:246 | local staged value until Commit; registration blocked by backend too; existing sessions retained |
| ADM-SET-06 | Maintenance Mode toggle | Settings:258; App:138 | staged then saved, super_admin bypass, member/visitor lock, login reachable, isolated environment only |
| ADM-SET-07 | Export Platform Records JSON | Settings:17, :277; /api/admin/backup | all documented tables paginated500, valid JSON, no passwords/secrets/storage blobs, one table failure not a partial success |
| ADM-SET-08 | Clear Browser Cache | Settings:30, :281 | removes CacheStorage/service workers/legacy local keys only; failure handling; no server data deletion or implied global cache purge |
| ADM-SET-09 | Commit Changes | Settings:80, :289; contentService.upsertSetting site→general | ready flag/load error, busy duplicate, shared content preservation, failed save retains controls |

## Forms `/admin/forms/*` (all child controls)

Routes: list `/admin/forms`, new `/admin/forms/new`, edit `/admin/forms/builder/:id`, responses `/admin/forms/:id/responses` (`src/pages/admin/forms/FormManagement.tsx:14`). Public `/f/:slug` belongs to public/member matrix. All rows below retain admin authorization requirement.

| ID | Control / expected result | Source / backend | Proposed cases |
|---|---|---|---|
| ADM-FORM-01 | Create links (header and empty state) → new builder | `src/pages/admin/forms/FormList.tsx:133`, :257 | same destination, keyboard, clean draft |
| ADM-FORM-02 | Search title/description and status all/draft/published/closed chips | FormList:101, :186, :200 | case/Arabic/no match, combined filters, actual counts |
| ADM-FORM-03 | Card title/edit and action edit links → builder | FormList:307, :344 | exact ID, deleted/unknown ID, no stale draft |
| ADM-FORM-04 | Card response count and responses links | FormList:320, :353 | zero/many, correct ID, deleted form |
| ADM-FORM-05 | Card Share opens modal | FormList:364 | published/draft semantics, correct public slug |
| ADM-FORM-06 | Duplicate form | FormList:52, :374; formService.duplicateForm:163 | questions/options new IDs, original unchanged, branch references rewritten, response data excluded |
| ADM-FORM-07 | Open spreadsheet link | FormList:384 | optional link only when present, safe URL/new tab |
| ADM-FORM-08 | Publish/close status toggle | FormList:65, :399; formService.updateForm | published→closed and draft/closed→published, empty/malformed questions, availability dates |
| ADM-FORM-09 | Delete / Cancel / Confirm deletion | FormList:85, :414, :460, :468; formService.deleteForm | responses/questions dependencies, repeated confirm, no production fixtures |
| ADM-BLD-01 | Back to forms | `src/pages/admin/forms/FormBuilder.tsx:339` | unsaved/queued autosave and beforeunload behavior, no silently lost changes |
| ADM-BLD-02 | Title and description editable fields | FormBuilder:488, :496; scheduleSave:167 | nonempty publish title, Unicode/length; serialized autosaves preserve newest revision |
| ADM-BLD-03 | Question card select | FormBuilder:508; QuestionCard:128 | correct selected index after reorder/delete/duplicate |
| ADM-BLD-04 | Add question opens type picker | FormBuilder:555 | close/cancel and keyboard |
| ADM-BLD-05 | Type picker 14 buttons | `src/pages/admin/forms/QuestionTypePicker.tsx:32`, :190 | EACH single_choice/multiple_choice/short_text/long_text/rating/linear_scale/dropdown/date/time/number/email/file_upload/ranking/section_header creates expected initialized question |
| ADM-BLD-06 | Type picker X/backdrop | QuestionTypePicker:178 | dismiss adds nothing, focus restore |
| ADM-BLD-07 | Per-question move up/down | `src/pages/admin/forms/QuestionCard.tsx:160`, :172; FormBuilder:255 | first/last restrictions, branch targets preserved |
| ADM-BLD-08 | Per-question Duplicate / Delete | QuestionCard:184, :195; FormBuilder:226, :243 | last-question guard, unique IDs and options, selected index valid, branching to removed question validated |
| ADM-BLD-09 | Question title / Add description / description / remove description X | QuestionCard:211, :231, :242, :254 | section-header title semantics, empty required title, no content erased on mere select |
| ADM-BLD-10 | Choice/dropdown option text and Delete option | QuestionCard:288, :315 | preserve stable IDs, last option disabled, empty/duplicate choices rejected |
| ADM-BLD-11 | Add Option / Add Other | QuestionCard:328, :340 | Other only once, choice order, save/reload, max server limits |
| ADM-BLD-12 | Branching toggle and per-option destination dropdown | QuestionCard:298, :518 | next question/end/valid forward target, invalid/stale/backward/cycle references, hidden branch answers excluded |
| ADM-BLD-13 | Required toggle | QuestionCard:536 | enforced on public form by server, section-header nonquestion |
| ADM-BLD-14 | Rating Max Level 5/10 and Icon star/heart/number | QuestionCard:372, :383 | all combinations persisted/rendered; rating preview spans are informational |
| ADM-BLD-15 | Linear scale minimum/maximum labels | QuestionCard:426, :438 | Unicode, empty labels, actual displayed scale1–5 vs copy mentioning10; no scale-length input in this source |
| ADM-BLD-16 | Other type previews (text/date/time/number/email/file/section/ranking) | QuestionCard:354, :360, :463, :470, :477, :484, :492, :505 | preview-only components not mistaken for functioning submission controls; ranking editor configurability Needs decision if absent |
| ADM-BLD-17 | Desktop / Mobile preview toggles and Close preview | FormBuilder:396, :406, :587 | true width, title/theme/questions, short/long inputs and Submit intentionally disabled; no responses created |
| ADM-BLD-18 | Theme / Settings / Responses / Share toolbar | FormBuilder:419, :428, :437, :449 | responses/share only saved form, modal state and active target |
| ADM-BLD-19 | Publish/republish | FormBuilder:287, :459; formService.createForm/saveForm → save_form RPC | empty title/question validation, atomic question save, autosave queue ordering, update existing sameID, failures show dirty state |
| ADM-BLD-20 | Autosave state and unload protection | FormBuilder:104, :147, :167, :179 | new form single creation, rapid edits slow server, retry failed save, navigation unmount flush, latest revision wins |
| ADM-THM-01 | Six theme preset buttons | `src/pages/admin/forms/FormThemePicker.tsx:32`, :126 | Cyber Indigo/Matrix Emerald/Hyper Violet/Solar Flare/Synthwave Rose/Stealth Minimal; persisted background/color combination |
| ADM-THM-02 | Primary color / accent color pickers | FormThemePicker:170, :185 | colors round trip, invalid crafted values, contrast/mobile |
| ADM-THM-03 | Theme X / Done / backdrop | FormThemePicker:109, :198 | updates immediately schedule parent autosave; close is not transactional cancel |
| ADM-FSET-01 | Anyone with link / Logged-in Members only audience buttons | `src/pages/admin/forms/FormSettingsModal.tsx:69`, :89 | server anonymous acceptance/rejection matches saved flag |
| ADM-FSET-02 | One response/person toggle; collect email toggle | FormSettingsModal:129, :154 | authenticated/anonymous duplicates, valid required email, concurrency, privacy of response records |
| ADM-FSET-03 | Opens at / Closes at datetime-local | FormSettingsModal:183, :199 | timezone roundtrip, closes<opens, exact boundary, null dates |
| ADM-FSET-04 | Google Sheets sync toggle | FormSettingsModal:229; /api/forms/sync-sheet | requires server service-account/sheet ACL; disabled/unconfigured retains DB responses; integration Needs test config |
| ADM-FSET-05 | Success thank-you message and custom slug | FormSettingsModal:250, :266 | safe text, slug lowercases/sanitizes, blank/collision, existing public URL change |
| ADM-FSET-06 | X / Done / backdrop | FormSettingsModal:52, :281 | immediate parent autosave semantics, validation error, focus |
| ADM-SHARE-01 | Copy link | `src/pages/admin/forms/FormShareModal.tsx:37`, :116 | clipboard denied, correct origin/slug, transient copied state |
| ADM-SHARE-02 | Download QR PNG | FormShareModal:48, :154 | image file nonempty and decodes exact public URL, Unicode title filename, canvas failure |
| ADM-SHARE-03 | Open public form link | FormShareModal:164 | correct target/new tab, published/closed/draft access |
| ADM-SHARE-04 | X / bottom Close / backdrop | FormShareModal:96, :186 | focus restore, no mutation |
| ADM-RESP-01 | Load form/responses and realtime updates | `src/pages/admin/forms/FormResponses.tsx:46`, :71; formService.getFormById/getFormResponses | empty/unknown/denied form, large response sets, stable ordered question columns |
| ADM-RESP-02 | Open Google Sheet; resync all | FormResponses:227, :237; authenticatedPost /api/forms/sync-sheet:95 | no config/URL, permission error, repeated resync idempotent, queued/failed records, no lost database response |
| ADM-RESP-03 | Export Excel | FormResponses:104, :248; XLSX.writeFile | all question types flatten correctly, formula safety, Unicode/multiline/file links, zero responses disabled |
| ADM-RESP-04 | Print | FormResponses:169, :257; window.print | usable print CSS, multiple pages, no interactive sidebar overlay |
| ADM-RESP-05 | Summary / Individual tabs | FormResponses:278, :290 | counts/charts match actual answers across14types, no fabricated values |
| ADM-RESP-06 | Individual response search | FormResponses:522 | email/name/answer fields contract, Arabic/case/empty/no matches |
| ADM-RESP-07 | Click response row or View Details icon | FormResponses:554, :578 | correct respondent/answers/timestamp, safe text, missing/deleted question |
| ADM-RESP-08 | Row Delete and modal Delete | FormResponses:79, :586, :672; browser confirm then deleteResponse | cancel, exact response target, parent/modal refresh, sync implications, repeat/denial |
| ADM-RESP-09 | Attachment Open/download button | FormResponses:658; form-attachments createSignedUrl 60sec | path must belong to response, expired URL, missing blob, no anonymous attachments access |
| ADM-RESP-10 | Detail X / Close / backdrop | FormResponses:623, :681 | focus restore, live deletion while open |

## Proposed cross-cutting evidence requirements (not execution)

1. Every writable row: isolated QA_TEST_ fixture ownership, before/after persistence after refresh, direct endpoint/RLS denial for member and visitor, cancellation/no write, network error and repeated click. No writes to production or real user rows.
2. Every row: desktop/tablet/mobile, keyboard/focus, Arabic/English and RTL, console/network errors, empty/loading/failed state, no random image/data fallback presented as real saved content. Shared profile and shell controls must be linked from the master matrix rather than counted as absent here.
3. Data boundaries requiring real integrations remain **Needs configuration / Not run**, not automatic pass: Google Drive OAuth/provider quotas, unpaid Gemini, Google Sheets service account, password-recovery delivery, camera hardware and 2 GiB transfer. Test fixtures/mock provider tests must be separately labeled from end-to-end provider success.
4. No pagination/sort/reorder/upload controls are assumed beyond those explicitly inventoried: Staff/Gallery/Projects/Blog/Events/Messages source currently has no general search/sort/pagination control; form builder uses up/down instead of drag reorder; CourseUnits has no delete control. Missing optional capabilities are a product decision, not an invented failing test.

Inventory created by admin source-inspection subtask only. The parent agent remains the only test executor and owner of the final consolidated matrix.


