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

## BUG-008 — Enrolled course without a thumbnail displays a broken image

- Severity: Medium. Layer: frontend / media fallback.
- Reproduce: create and enroll in a published QA_TEST_ course with no thumbnail, visit `/my-courses` as member in English or Arabic. The rendered img has no src and naturalWidth 0.
- Evidence: `evidence/runs/20261016-regression-02/artifacts/routes-locales-member-en-d-2f8a1-console-and-overflow-census-1440/QA_TEST__my_courses.png` and its error-context; Arabic reproduced independently.
- Expected: missing/broken optional course media uses the existing neutral AssetImage fallback, with no random image.
- Status: Confirmed, pending fix after current baseline run. No database changes required.

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
- Status: Confirmed, pending fix. Provider transport is an isolated adapter, not real Gemini.

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
