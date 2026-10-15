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
