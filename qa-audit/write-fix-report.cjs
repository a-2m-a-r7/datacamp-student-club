const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const browser = JSON.parse(fs.readFileSync(path.join(root, 'fix-results.json'), 'utf8'));
const rows = [];
function visit(suite, parents=[]) {
  const chain=[...parents,suite.title].filter(Boolean);
  for (const spec of suite.specs || []) for (const test of spec.tests || []) {
    rows.push({scenario:spec.title, viewport:test.projectName, status:test.results?.at(-1)?.status || test.status,
      source:`${path.basename(spec.file || suite.file || '')}:${spec.line}`, duration:test.results?.at(-1)?.duration || 0});
  }
  for (const child of suite.suites || []) visit(child,chain);
}
for (const suite of browser.suites || []) visit(suite);
const extraFile=path.join(root,'security-failure-results.json');
if(fs.existsSync(extraFile))for(const suite of JSON.parse(fs.readFileSync(extraFile,'utf8')).suites||[])visit(suite);
const seen=new Set();
rows.splice(0,rows.length,...rows.filter(row=>{const key=row.scenario+'|'+row.viewport;if(seen.has(key))return false;seen.add(key);return true;}));
const sqlResults=JSON.parse(fs.readFileSync(path.join(root,'postgres-results.json'),'utf8'));
const migrationCount=fs.readdirSync(path.join(root,'..','supabase','migrations')).filter(file=>file.startsWith('20261013')).length;
const defects = [
 ['Login / all roles','Critical','AuthContext.tsx','Cached fake accounts and role shortcuts could enter protected UI','Real Supabase session, verified identity, active database role; mock shortcuts removed','Browser guards + server auth tests + SQL RLS'],
 ['Admin users','Critical','api/admin/users.ts','Administrative requests relied on unsafe fallback account creation','Bearer identity and database role checked server-side; no default password','Server authorization tests; live account CRUD remains untested'],
 ['Home / About / content pages','High','defaultContent.ts','Invented metrics and sample people/articles/projects replaced missing data','No sample collections; real statistics RPC; unavailable values displayed honestly','Browser checks + live read-only RPC'],
 ['Courses / learning','High','courseService.ts','Enrollment/progress could be simulated and repeated XP awarded','Locked persistent enrollment/completion RPC and idempotent rewards','Isolated PostgreSQL persistence tests'],
 ['Forms builder','High','FormBuilder.tsx / atomic_forms.sql','Separate saves and regenerated IDs could lose historical answers; autosave could race publication','Atomic parent/questions transaction, stable IDs, serial saves','PostgreSQL rollback tests + browser delayed-save scenario'],
 ['Forms response','High','submit_form_response RPC','Client validation/fallback results could imply an unsaved submission succeeded','Server validates ownership, required fields, types, schedule and repeat-response policy','PostgreSQL validation tests'],
 ['Course quiz','High','submit_course_quiz RPC','Client-selected success could grant completion and XP','Server grades stored questions; completion requires passing score','PostgreSQL fail/pass and bypass checks'],
 ['Event scanner','High','check_in_event RPC','Access-granted output did not prove attendance persisted','Registered ticket matched, attendance saved, duplicates rejected','PostgreSQL unknown/valid/duplicate checks; physical camera untested'],
 ['Certificates','High','certificateService.ts','Completed courses could claim a certificate in the UI without automatic issuance','Completion transaction issues one matching persisted certificate and links its enrollment; public verification omits account fields','PostgreSQL atomic rollback/idempotency + browser backed by real isolated SQL + PNG/PDF/QR'],
 ['Notifications / badges','High','notificationService.ts / verified_badges.sql','Fabricated alerts and client-derived achievements; global read state shared','Actual rows, per-member read records, badges derived from persisted progress','PostgreSQL independent reads and forged-badge rejection'],
 ['Google Sheets','High','api/forms/sync-sheet.ts','Public sync endpoint and misleading success on missing configuration','Admin authorization, real failure status, RAW sheet values, no hardcoded sharing recipient','Visitor rejection verified; Google service account integration blocked'],
 ['Compiler','High','universalRunner.ts','Service failure returned invented successful language output','Actual workers/WASM/services; compilation and nonzero runtime failures surfaced','Real JavaScript/TypeScript execution + mocked failure responses'],
 ['Admin blog','Medium','BlogManagement.tsx','Edit control had no saving workflow','Dialog edits and PATCH persist the submitted fields','Browser click, PATCH payload, UI update and dialog close'],
 ['Admin settings','Medium','Settings.tsx / api/admin/backup.ts','Export and clear-cache controls had empty handlers','Protected platform-record JSON download and actual browser cache clearing','Browser download contents and CacheStorage removal'],
 ['Admin staff / security','Medium','StaffManagement.tsx / Security.tsx','Pretend commit, firewall state, security logs and uptime implied backend actions','Real roster refresh, actual audit records and password-reset request; unavailable uptime stays unknown','Route rendering; live reset email delivery remains untested'],
 ['Builder desktop header','High','App.tsx','Floating language control intercepted clicks on Publish','Language control has reserved layout space','Delayed autosave/publish browser click test'],
 ['Contact / footer','Medium','Contact.tsx / Footer.tsx','Invented email, telephone and address shown when not configured','Configured contact data or explicit Not configured state','Source correction and final route checks'],
 ['Dialogs / share / QR','Medium','Dialog.tsx / clipboard.ts / FormShareModal.tsx','Conditional dialogs lacked consistent focus/Escape behavior; QR lacked quiet margin','Portaled accessible dialogs, focus restore, awaited clipboard, decodable QR margin','Browser Escape/focus, badge/form/certificate QR and PNG download'],
 ['Data refresh','Medium','supabase.ts / aiService.ts / vercel.json','Cached RAG context and browser data could show stale or fake records','Fresh database context and no-store; personal AI key is memory-only','Browser legacy-session/cache rejection; realtime delivery needs live role session'],
 ['Dependencies','High','package.json','Known vulnerable SheetJS/qs/esbuild versions','Official SheetJS 0.20.3 distribution and patched transitive packages','npm audit: zero known vulnerabilities'],
];
function source(file, needle) {
  const lines=fs.readFileSync(path.join(root,'..',file),'utf8').split(/\r?\n/);
  const line=lines.findIndex(value=>value.includes(needle))+1;
  return file+':'+Math.max(1,line);
}
const locations=[
 ['src/contexts/AuthContext.tsx','const applySession'],['api/admin/users.ts','authorizeAdmin'],
 ['src/lib/defaultContent.ts','defaultSettings'],['src/services/courseService.ts','enroll_course'],
 ['src/pages/admin/forms/FormBuilder.tsx','persistForm'],['supabase/migrations/20261013000002_atomic_forms.sql','FUNCTION public.submit_form_response'],
 ['supabase/migrations/20261013000004_verified_quizzes.sql','FUNCTION public.submit_course_quiz'],
 ['supabase/migrations/20261013000001_real_operations.sql','FUNCTION public.check_in_event'],
 ['src/services/certificateService.ts','issue_course_certificate'],['src/services/notificationService.ts','read_notifications'],
 ['api/forms/sync-sheet.ts','authorizeAdmin'],['src/lib/universalRunner.ts','async function executeViaPiston'],
 ['src/pages/admin/BlogManagement.tsx','handle'],['src/pages/admin/Settings.tsx','Export Platform Records'],
 ['src/pages/admin/Security.tsx','const'],['src/App.tsx','Reserve space'],
 ['src/pages/Contact.tsx','contactEmail'],['src/components/ui/Dialog.tsx','export'],
 ['src/lib/supabase.ts','global:'],['package.json','overrides'],
];
locations.forEach(([file,needle],index)=>defects[index][2]=source(file,needle));
defects.push(
 ['Profile security','High',source('src/pages/Profile.tsx','handleEmailUpdate'),'Login OTP was incorrectly reused for credential changes, with unsupported SMS text','Real recovery emails and confirmed email changes; no premature profile email writes','Browser request/error/retry checks; actual mailbox delivery unverified'],
 ['Dashboard card download','High',source('src/lib/memberCard.ts','downloadMemberCard'),'html2canvas failed on Tailwind color formats','Direct Canvas PNG export with real member data and embedded decodable QR','Actual 1586×1000 PNG download and QR pixel decode at three sizes'],
 ['Membership QR','High',source('supabase/migrations/20261013000010_member_cards.sql','get_own_member_card'),'Member number displayed as unexplained scan text','Random token verification URL and protected admin ticket resolution','SQL permissions, inactive/unknown tokens and browser verification'],
 ['Dashboard badges','Medium',source('src/pages/Dashboard.tsx','const isUnlocked'),'Fifty points displayed every catalog badge as earned','Only persisted achievements unlock badges','Source repair; badge issuance remains SQL verified']
);
defects.push(['Course completion / certificates','High',source('supabase/migrations/20261013000011_automatic_course_certificates.sql','CREATE TRIGGER'),'Completing a lesson or quiz did not automatically issue/link a course certificate','Atomic database trigger, unique certificate per user/course, safe historical repair, matching course selection and export QR snapshot','Browser operations execute actual PostgreSQL routines in an isolated database; real historical completion repaired in production']);
const q=value=>'"'+String(value).replaceAll('"','""')+'"';
fs.writeFileSync(path.join(root,'broken-buttons.csv'),[ ['Page / tab','Severity','Source / selector','Before','After','Evidence / limitation'].map(q).join(','), ...defects.map(row=>row.map(q).join(','))].join('\n'));
fs.writeFileSync(path.join(root,'tested-elements.csv'),[ ['Scenario','Viewport','Status','Source','Duration ms'].map(q).join(','), ...rows.map(r=>[r.scenario,r.viewport,r.status,r.source,r.duration].map(q).join(','))].join('\n'));
const counts=rows.reduce((out,row)=>(out[row.status]=(out[row.status]||0)+1,out),{});
const table=defects.map((r,i)=>`| ${i+1} | ${r.map(v=>String(v).replaceAll('|','/')).join(' | ')} |`).join('\n');
const report=`# DataCamp repair and QA report — 13 October 2026

The user authorized repairs after the initial discovery and explicitly authorized applying DataCamp schema/security repairs to the existing Supabase project. Work is on branch fix/qa-real-data. This report records current evidence; the Phase 1 inventory remains in discovery-20261013/INVENTORY.md.

## Results and coverage

- Inventory: 49 route patterns, 685 source control declarations. These are not 685 clicked elements.
- Browser scenarios: ${rows.length}; results: ${JSON.stringify(counts)}. Desktop 1440px, tablet 768px, mobile 375px. Exact per-scenario outcomes are below and in tested-elements.csv/fix-results.json.
- PostgreSQL: ${sqlResults.passed} passed, ${sqlResults.failed} failed in an isolated in-memory PostgreSQL database. All ${migrationCount} repair migrations applied and actual SQL rows/rollback/RLS were verified. These tests do not prove authenticated production CRUD.
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
${table}

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
${rows.map(r=>`| ${r.scenario.replaceAll('|','/')} | ${r.viewport} | ${r.status} | ${r.source} |`).join('\n')}
`;
fs.writeFileSync(path.join(root,'FIX_REPORT.md'),report);
fs.writeFileSync(path.join(root,'REPORT.md'),report);
console.log(JSON.stringify({scenarios:rows.length,counts}));
