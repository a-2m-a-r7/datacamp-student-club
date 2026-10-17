# Confirmed bug log

Only reproduced failures are entered here. Source inventory concerns remain pending until triggered. All results are local-only; no production database was contacted.

## BUG-001 — QA launcher can inherit production integration configuration

- Severity: High. Layer: test infrastructure / security isolation.
- Role/page: QA executor; `qa-audit/start-local.cjs` and QA mode `vite.config.ts`.
- Reproduce: execute `node qa-audit/final/run-isolated.cjs --test qa-audit/final/tests/isolation.test.cjs`. The regression uses inert VM child-process/config stubs and fake `QA_TEST_` canaries; it never launches a child or reads dotenv.
- Expected: QA build/server receive only local/dummy settings, optional real providers disabled, and project dotenv excluded.
- Actual: all four regression cases failed: inherited Drive credentials/owner contact, AI/realtime flags, external canonical URLs/server anon alias and Vite dotenv hydration survived.
- Evidence: `evidence/BUG-001-before.txt`.
- Fix: explicit OS allowlist plus local/dummy environment, loopback Node transport guard, no QA dotenv loading and non-destructive QA output generation.
- Status: Fixed; 4/4 targeted regressions and build/lint/explicit type-check passed. Commit recorded by Git fix(BUG-001). Initial sandbox realpath EPERM was retried with approved execution; it was an environment failure, not an application build defect.

## BUG-002 — Public legacy helper grants administrator privileges and XP

- Severity: Critical. Layer: database authorization / privilege escalation.
- Surface: `public.promote_admin_by_email(text)` from the original phase2 migration, retained after the complete migration chain.
- Reproduce: `full-schema-security.mjs` replayed all 24 original timestamped migrations in a fresh memory PostgreSQL database, created QA_TEST_ Auth identities through actual signup triggers, and invoked the helper as anon (no subject) and authenticated (member subject).
- Expected: neither caller may alter role, allowlist or XP; trusted service_role may retain legacy server access.
- Actual before fix: both calls succeeded, changing the real profiles and users mirror from user/member with 0 XP to admin with 10000 XP, and adding the email to admin_emails. Direct caller table privileges remained denied. No production test occurred.
- Evidence: `evidence/BUG-002-before.json` (complete-chain proof), `evidence/BUG-002-candidate-proof.json` (reviewed candidate), `evidence/full-schema-security.json` and `full-schema-security-candidate.json` (installed-fix regressions).
- Approval: user explicitly approved migration addition and local tests only through the numbered approval question.
- Fix: append `20261015000015_restrict_legacy_promotion.sql`; revoke PUBLIC/anon/authenticated execution, grant only service_role. A to_regprocedure guard safely handles installations without the obsolete helper. No rows/function/table are deleted or rewritten.
- Validation: fresh 25-migration replay succeeds; anon/member receive SQLSTATE 42501 with unchanged profile/mirror/allowlist/XP, service_role still functions. Reapplying the same restriction succeeds. Build, lint and explicit TypeScript check passed.
- Status: Fixed and validated locally; production application remains outside approved scope. Commit recorded by Git fix(BUG-002). Historical unpatched-control observations remain deliberately vulnerable and are labeled separately from the current-chain passing regression.

## BUG-003 — Member can forge protected values in legacy account mirror

- Severity: Medium. Layer: database integrity. This is mirror drift, not demonstrated administrator escalation or authoritative XP gain.
- Reproduce: `tests/database-boundaries.mjs` fully replays the migrations in two independent memory databases. With explicitly simulated public-table default grants applied **before** migrations, an authenticated member updates its own `users.total_points/xp` to 7777. The authoritative `profiles` values stay 0; the mirror becomes 7777.
- Evidence: `evidence/BUG-003-004-before.json`, case `PROTECTED-users-own-XP`. The migration-only context rejects direct table access; the provider-default simulation is not a measurement of deployed grants.
- Expected: role, identity, verification, status and earned values in both representations are maintained through trusted operations; personal edits and server synchronization remain available.
- Approval: user approved BUG-003 and BUG-004 migration addition and local tests only. No production changes or backfill authorized.
- Fix: appended `20261015000016_protect_users_mirror.sql` installs an invoker trigger rejecting direct non-admin changes to derived mirror fields, while preserving own personal fields, verified active admin writes and trusted profile-to-mirror synchronization. Existing drift is not silently rewritten.
- Status: Fixed and validated locally; no production application. Commit recorded by Git fix(BUG-003).

## BUG-004 — Public internal counter helper mutates course metadata

- Severity: Low. Layer: database authorization. No arbitrary count or privilege gain was demonstrated.
- Reproduce: anon and authenticated member execute `refresh_course_enrolled_count(uuid)` after a full migration replay. Both calls succeed and alter the selected course's `updated_at` even with no direct table privileges.
- Evidence: `evidence/BUG-003-004-before.json`, `MUTABLE-COUNTER-HELPER-*` in both privilege contexts.
- Expected: derived counter maintenance runs through trusted enrollment triggers or service operations; untrusted direct RPC cannot write course metadata.
- Fix: appended `20261015000017_restrict_course_counter.sql`; revokes PUBLIC/anon/authenticated execution and retains service_role while owner-context triggers retain execution.
- Approval: local migration/test permission received with BUG-003. Status: Fixed and validated locally; no production application. Commit recorded by Git fix(BUG-004).

## BUG-005 — Public form ranking and branching renderer can crash or omit questions

- Severity: High. Layer: public form UI.
- Reproduce: create a dropdown question with a forward `goToQuestionId` and render it beside a target question; select the branch option. The prior renderer computed ranking state from every answer value, including the dropdown string.
- Expected: the selected branch hides only intermediate questions and renders the target; ranking questions render and persist option IDs.
- Actual: the page crashed with `s.map is not a function`, so the target question and submission UI disappeared.
- Evidence: `evidence/regression-artifacts/form-question-types-config-fef8a-red-questions-before-saving-1440/error-context.md`.
- Fix: add a ranking renderer, use stable option IDs for choice controls, and guard ranking state with `q.type === 'ranking' && Array.isArray(currentVal)`.
- Validation: `form-question-types.spec.ts` passed 9/9 across 1440/768/375; main Playwright suite passed 399/399; build, lint and explicit TypeScript check passed.
- Status: Fixed. Commit `d0942e5` (`fix(BUG-005): support public form ranking and branching`).

## BUG-006 — Branching submission rejects required questions intentionally skipped by the selected route

- Severity: High. Layer: database validation.
- Reproduce: submit a published form where a dropdown option targets a later question while an intervening question is required. The UI correctly omits the intervening question, but the original RPC still validated every required question.
- Expected: required validation follows the selected forward branch; skipped questions are not required, while the target remains required.
- Actual: the RPC rejected the otherwise valid response with `Required answer missing` for the skipped question.
- Evidence: the configured-go-to regression trace and isolated migration replay.
- Fix: replace the submission RPC in `20261015000018_branch_aware_form_validation.sql` with branch-aware required-question validation while preserving type, option, duplicate, attachment and authorization checks.
- Validation: `form-question-types.spec.ts` passed 9/9 across 1440/768/375; database boundary suite passed 118 assertions; main Playwright suite passed 399/399.
- Status: Fixed locally; production migration was not applied. Commit `d2ee0e5` (`fix(BUG-006): honor skipped required questions in branching`).

## BUG-007 — QA executions overwrite evidence and historical image exports

- Severity: High. Layer: test/report integrity.
- Reproduce: the shared `browser-results.json` now contains `No tests found`, 0 executed cases, while AFTER.md refers to it as 399/399 proof. Other retained historical JSON reports also have different dates and failing totals. Fixed screenshot/export paths overwrite tracked historical PNGs, and concurrent form/route suites sharing an output directory caused trace ENOENT errors.
- Evidence: the preserved original report/logs and `evidence/20261016-navigation-01.txt`; the independent 20261016 run folders demonstrate separate output ownership.
- Fix: each isolated invocation has a validated unique run label; reusing an existing output folder is refused. Main and focused configurations put JSON, traces and screenshots under that run. Certificate/LinkedIn image outputs use Playwright's per-test output paths. Historical report claims will be reconciled against completed new JSON results, never inferred from an exit code or old file.
- Validation: isolated Node suite 32/32; QA build, lint and explicit type-check passed. New certificate files and separate form/navigation results are retained under `evidence/runs/`; full rerun continues. No prior artifacts deleted.
- Status: Fixed locally; full evidence reconciliation pending completed rerun.

## BUG-008 — Missing course covers and account photos display broken images

- Severity: Medium. Layer: frontend / media fallback.
- Reproduce: create and enroll in a published QA_TEST_ course with no thumbnail, visit `/my-courses` as member in English or Arabic. The rendered img has no src and naturalWidth 0.
- Evidence: `evidence/runs/20261016-regression-02/artifacts/routes-locales-member-en-d-2f8a1-console-and-overflow-census-1440/QA_TEST__my_courses.png` and its error-context; Arabic reproduced independently.
- Expected: missing/broken optional course and account media uses the existing neutral AssetImage fallback, with no random image.
- Fix: reuse AssetImage on the catalog, enrollment list, course detail, admin course list, admin user list/detail and sidebar account photo. Existing layout and branding are preserved.
- Validation: actual absent/404 media regression passed at 1440/768/375, including the admin user detail. All six member route/locale combinations now pass. QA build, configured lint and explicit type-check passed. Evidence: runs/BUG-008-media-before, BUG-008-media-detail-after and BUG-008-member-routes-after; BUG-008-build/lint/typecheck.txt.
- Status: Fixed and validated locally. No database changes required.

## BUG-009 — Fresh installation depends on undeclared table default grants

- Severity: High. Layer: database setup / reproducibility.
- Reproduce: replay the full chain with platform schema/roles but no simulated public DML defaults. On actual QA_TEST_ fixtures, `table-crud.mjs --source-grants` records 248 legitimate CRUD denials (including member own-profile access) with SQLSTATE 42501. The same cases pass when old provider defaults are simulated explicitly before migrations. This does not claim a failure on the deployed project.
- Evidence: `evidence/BUG-009-before.txt` and the independently replayed immutable `runs/BUG-009-historical-control/table-crud-source.json` (only the grants fix explicitly excluded). Original `database-boundaries` also preserves migration-only ACL observations.
- Approval: user approved the exact proposed SQL for a local migration and tests only on 2026-10-16.
- Fix: CLI-generated `20261016152338_explicit_datacamp_data_api_grants.sql` grants only the named DataCamp tables according to the existing RLS access model. Public SELECT/contact INSERT and authenticated RLS-governed DML are explicit. Server-only tables remain inaccessible to clients; unrelated public tables and default privileges are unchanged.
- Validation: 792/792 own/foreign CRUD probes passed with source grants only, and 792/792 passed with old-default simulation. Both replay the complete migration chain and roll each probe back. Legacy promotion security regression, build, lint and explicit type-check passed. The independent clean-schema RLS defect is fixed separately as BUG-012.
- Status: Fixed locally; production application remains prohibited pending final approval.

## BUG-010 — Whitespace-only AI prompt consumes a provider request

- Severity: Medium. Layer: backend input validation.
- Reproduce: configure a dummy server provider key and intercept fetch, then POST prompt containing spaces/newline/tab directly to the actual AI handler. It returns 200 and performs one provider call.
- Expected: an empty/whitespace-only prompt returns 400 before any provider call, consistent with the UI empty-input contract.
- Evidence: `evidence/20261016-public-api-before.txt`, final case; other three new API contract tests passed.
- Fix: validate the trimmed prompt before invoking a provider and send its trimmed text.
- Validation: all four direct API boundary cases passed, including whitespace returning 400 with zero provider calls. The related Node suite passed 32/32. QA build, configured lint and explicit type-check passed. Evidence: BUG-010-api-after.txt, BUG-010-node-regression.txt and BUG-010-build/lint/typecheck.txt. Provider transport is an isolated adapter, not real Gemini.
- Status: Fixed and validated locally.

## BUG-011 — Hidden/stale branches can bypass reachable required questions

- Severity: High. Layer: public forms and SQL validation.
- Reproduce: question A jumps to required target C, skipping question B; B's stale/supplied answer targets end. UI previously applied B even though B became hidden, and SQL treated B as permission to skip C. The actual RPC accepted a payload without C; a browser change from B=end to A=jump also hid C.
- Evidence: `evidence/BUG-011-sql-before.txt`, `BUG-011-ui-before.txt` and its run-specific screenshots/trace.
- Expected: only reachable single-choice/dropdown questions control forward traversal; hidden answers cannot hide later questions or be stored in the selected path.
- Fix: `20261016154014_validate_reachable_form_branch.sql` follows the ordered reachable path, validates its required questions, and rejects submitted hidden answers. PublicFormView applies the same forward walk, so an unreachable stale branch never controls visibility. The browser SQL adapter now includes future timestamped schema migrations and relies on their actual grants instead of blanket re-grants.
- Validation: the previously accepted bypass is rejected with no saved response; the valid path saves. All 12 form browser regressions passed across three viewports, including changing the earlier selection after choosing end. Fresh QA build, lint and explicit type-check passed.
- Approval: user approved local and isolated-QA migrations/testing on 2026-10-16. Status: Fixed locally; no production application.

## BUG-012 — Clean schema installation leaves users mirror without RLS

- Severity: Critical. Layer: database privacy / installation security.
- Reproduce: apply only the clean schema migrations (20261013 onward, excluding legacy sample migrations). Catalog shows 33 tables but `users` has RLS disabled. A QA member can SELECT and UPDATE a second QA member's users row. Legacy full-chain replay had enabled RLS earlier, which masked this distinct installation path.
- Evidence: `evidence/20261016-fresh-schema-before.txt` and `runs/20261016-fresh-schema-before/fresh-schema.json` retain the actual foreign-row read/update results.
- Fix: CLI-generated `20261016153551_enable_fresh_users_mirror_rls.sql` enables RLS and creates the three existing own/admin policy contracts only if missing. It preserves existing policies, server-only INSERT, protected-field trigger and all rows.
- Approval: explicit local and isolated-QA approval received; production is excluded.
- Validation: clean replay now has all 33 tables protected; own read succeeds, foreign SELECT/UPDATE return zero rows. Full-chain source-grants CRUD remains 792/792. Build/lint/explicit type-check passed.
- Status: Fixed locally; isolated QA schema initialization follows the remaining approved fix. No production changes.

## BUG-013 — Fresh schema omits the Realtime publication tables

- Severity: Medium. Layer: database installation / Realtime.
- Reproduce: clean hosted QA has zero public tables in supabase_realtime. A real signed-in member subscribes, an administrator inserts a private notification and REST confirms the row, but no change arrives. The corrected hosted control passed its other 11 service probes.
- Evidence: runs/QA_TEST_hosted_control/hosted-services.json and the initial QA catalog. The first immediate after-run also missed the event because channel join preceded PostgreSQL replication readiness; that retained failure is not a pass.
- Approval: owner explicitly approved this additive migration locally and in QA only.
- Fix: CLI-generated 20261016161816_declare_application_realtime_tables.sql adds the 16 subscribed application tables if absent. It preserves RLS and excludes server-only tables.
- Validation: clean local replay confirms all 16 entries and all 33 table RLS flags. Hosted test waits for the actual PostgreSQL subscription system acknowledgement, then observes the exact newly inserted notification ID. All 12 actual Auth/REST/Storage/Realtime probes pass in runs/QA_TEST_hosted_readiness_after. Build, configured lint and explicit type-check passed.
- Status: Fixed and validated locally and in isolated hosted QA; production excluded.

## BUG-014 — Form choices are inaccessible to keyboard users

- Severity: Medium. Layer: frontend accessibility.
- Reproduce: open a published QA form with single/multiple choice and icon rating questions. The choices are click-only labels with no radio/checkbox inputs; rating buttons have no accessible name. Keyboard and role-based selection cannot reach the answer controls.
- Evidence: runs/BUG-014-form-inputs-before retains EN/AR screenshots and failing radio assertions. The separate all-types failures from that run are tracked as BUG-015.
- Fix: actual visually hidden native radio/checkbox inputs retain the current design, synchronize checked state, and show a focus ring on their existing label. Rating buttons expose translated score labels and aria-pressed.
- Validation: all six EN/AR × 1440/768/375 keyboard regressions pass, submit through the real migrated SQL and persist a response. Build, configured lint and explicit type-check passed.
- Status: Fixed and validated locally; no schema change.

## BUG-019 — robots.txt resolves to the SPA HTML document

- Severity: Low. Layer: deployment assets / SEO.
- Reproduce: the fresh production build has no robots.txt, so the SPA fallback returns HTML. All three real mobile Lighthouse pages report robots syntax errors and SEO 92.
- Fix: add a plain static robots.txt allowing public routes and excluding account/admin/API paths. No nonexistent sitemap is advertised. These crawler hints do not replace authorization or promise confidential URLs cannot be indexed.
- Validation: build, configured lint and explicit type-check pass. An actual HTTP request against the built QA preview returns HTTP 200, text/plain and the expected rules, with no HTML. Evidence: BUG-019-http-after.json. Updated Lighthouse remains a separate final gate.
- Status: Fixed and validated locally; deployment awaits final report approval.

## BUG-020 — Public routes eagerly download PDF and chart packages

- Severity: Medium. Layer: frontend build / performance.
- Reproduce: serve the fresh-clone production build and open Login or Courses. The entry imports Vite's preload helper from vendor-pdf and shared UI utilities from vendor-charts, fetching both feature packages before they are used.
- Evidence: runs/QA_TEST_mobile_lighthouse_fresh_01 and the production bundle import inventory. The initial onlyExplicitManualChunks candidate produced circular chunks and failed real browser loading; it was rejected. Subsequent retained failures distinguish sandbox connectivity/setup and the one-month chart oracle from product failures.
- Fix: assign CommonJS/Vite preload helpers to vendor-runtime and clsx/tailwind-merge to vendor-ui, retaining Rollup's normal dependency merging.
- Validation: production-after-06 passes all three actual Chromium workflows: Login/Courses do not request PDF/chart packages, an administrator reads real hosted QA growth data and renders its month axis, and a member completes a real QA course then downloads a genuine PDF certificate. Synthetic course/certificate rows are removed in teardown. Final build, configured lint and explicit type-check pass; the final production build has no circular-chunk warnings.
- Limits: the final 480-case regression and updated Lighthouse sample are separate remaining gates. No production deployment is claimed.
- Status: Fixed and validated locally against the isolated QA backend.

## BUG-018 — Empty course and footer headings skip levels

- Severity: Low. Layer: frontend accessibility.
- Reproduce: the real fresh-production mobile Lighthouse sample reports the empty Courses h3 directly after h1 and footer h4 headings after h2. The failing DOM nodes are preserved in runs/QA_TEST_mobile_lighthouse_fresh_01/courses.json and home.json.
- Fix: make the empty-state heading and the three independent footer section headings h2. Their classes and layout stay unchanged.
- Validation: all 18 related course UI regressions pass across EN/AR and 1440/768/375; build, configured lint and explicit type-check pass. Updated production Lighthouse is a final verification gate, not claimed here.
- Status: Fixed and validated locally; no schema change.

## BUG-017 — Password visibility buttons have a 16px touch target

- Severity: Medium. Layer: frontend accessibility / authentication controls.
- Reproduce: mobile Lighthouse on the real fresh-clone production build flags the login visibility control as a 16×16px target. The same pattern appears in Register and Reset Password. Six local before cases reproduce the undersized control in both languages.
- Evidence: runs/QA_TEST_mobile_lighthouse_fresh_01/login.json, runs/BUG-017-password-before. The first after run used an exact floating-point 40px comparison during the route transition; 39.999px rounding was a test-oracle failure, retained separately.
- Fix: 40px button hit areas, input text padding to match, visible keyboard focus, translated show/hide labels and aria-pressed. Existing password values and submit handlers are unchanged.
- Validation: all 18 EN/AR × 1440/768/375 × login/register/reset cases pass in runs/BUG-017-password-after-02, including real bounds after the transition, Space/Enter toggles, value preservation and no horizontal overflow. QA build, configured lint and explicit type-check passed. These tests do not submit a password change to a real provider.
- Status: Fixed and validated locally; full-suite rerun after subsequent audit fixes remains pending.

## BUG-016 — Declared Node minimum contradicts locked Supabase packages

- Severity: Low. Layer: installation / compatibility metadata.
- Reproduce: root package.json and lockfile advertise Node >=20; installed/locked @supabase/supabase-js and auth-js 2.117.3 both require Node >=22. The root contract therefore accepts an unsupported runtime.
- Evidence: BUG-016-engine-contract.json reads actual package metadata and the previous committed root manifest without executing Node20. No Node20 runtime success or failure is claimed.
- Fix: root manifest and root lockfile metadata now require Node >=22. No dependency version or integrity changes.
- Validation: QA build, configured lint and explicit type-check passed on recorded Node25.8.0; clean clone/install is a separate final gate.
- Status: Fixed and validated locally.

## BUG-015 — Returning to the final section can submit without pressing Submit

- Severity: High. Layer: frontend forms / unintended save.
- Reproduce: fill a two-section form including its attachment, return to the first section, then click Next. Instead of showing the final section for review, the response is saved and the success page appears. Both locales reproduce it.
- Evidence: runs/BUG-014-form-inputs-before, all-14-types cases: the number field expected after Next is absent because the actual success page is already rendered.
- Expected: Next only changes sections; saving requires the explicit Submit action.
- Cause: React reuses the same button across Next and Submit branches and changes its type during the click before the browser's default action.
- Fix: give Next and Submit distinct React keys and cancel Next's browser default before advancing sections.
- Validation: all 24 form regressions pass, including all 14 types, Arabic/emoji/injection text, attachment persistence, previous/next retained answers and zero stored responses until explicit Submit, both languages and three widths. QA build, configured lint and explicit type-check passed. Evidence: BUG-015-forms-after.txt and runs/BUG-015-forms-after.
- Status: Fixed and validated locally; no schema change.
