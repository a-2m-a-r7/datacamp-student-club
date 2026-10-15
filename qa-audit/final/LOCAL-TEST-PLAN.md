# Local-only execution plan — executed with blockers recorded

## Accepted setup choices

User authorization: “اسمح لك اعتمد عليك افعل ما تراه مناسب”. Choose localhost and isolated `QA_TEST_` fixtures. Production domain from this conversation is `https://datacamp-student-club.vercel.app`; the associated live Supabase project and production credentials are excluded. This authorization does not supersede the requested matrix/final-report/deletion/schema gates.

- Source branch: tester-final, based on 4d4ea0964dfc6671cd76bc24d1e2bf96c401f821.
- Proposed browser origin: `http://127.0.0.1:3100` using an exclusively owned test process after matrix approval. Do not reuse an existing unknown server.
- Viewports: 1440×900,768×900,375×900, each Arabic RTL and English LTR.
- Fixtures: anonymous visitor, `QA_TEST_MEMBER_A/B`, `QA_TEST_ADMIN_A/B`, unconfirmed/pending/suspended identities, forged/unsupported role payloads. No actual account creation has occurred. Role-positive expansion awaits DEC-001.
- The sole test executor is the primary agent; inventory assistance has only read source and written plans, and has not performed tests.

## Environment isolation must precede any test launch

1. Do not launch `npm run dev`: `scripts/dev-server.ts:16` explicitly loads existing `.env`. Do not copy or print production secrets into a test environment.
2. The existing start-local helper is only a candidate. It overrides Supabase but clears only some provider variables; inherited Drive/Gemini/Google/canonical settings must be audited and scrubbed. The test runner must use a minimal explicit environment and a separate env directory, no production `.env` loading.
3. Set test canonical/browser and server redirect origins explicitly. A separate offline canonical-production URL assertion may inspect the expected production-domain string and intercept all navigation; never visit production as a side effect of QR/share/OAuth tests.
4. Allow only the local database/test server and explicit test adapters. Browser/server egress protection must reject production Supabase/Vercel/Google account writes and all undeclared network calls. Use fake canary configuration, not real credentials, to verify isolation. Record attempted forbidden destinations without credential/query strings.
5. In-process API mocks must be scoped and restored. Separate actual browser worker/SQL execution from simulated Auth/Storage/provider responses in result labels.

## Available and missing capabilities (read-only discovery)

| Capability | Source / discovery | Execution meaning |
|---|---|---|
| React/Vite, TypeScript, Playwright, PGlite | Installed package inventory; baseline build and type checks succeeded. | Ready for planning; no functional suite has run in this audit. |
| Local full Supabase CLI/Docker/PostgreSQL tools | Get-Command docker,supabase,psql returned no executable paths in current shell. No supabase/config.toml is present. | Full GoTrue/Storage/PostgREST/Realtime is not configured; do not call PGlite transport adapters a real Supabase stack. |
| Existing SQL harness | qa-audit/fix-tests/persisted-platform.ts replays only October13–15 migrations and bootstraps Auth/storage tables. | Useful actual SQL/RLS tests, but full timestamped replay is a separate required case. |
| Existing browser harness | qa-audit/fixes.config.ts, start-local.cjs, local-server.mjs. | After isolation review, can trigger real UI and local handlers with transport adapters; adapters must be named in evidence. |
| Google OAuth/Drive/Sheets/Gemini test accounts/keys | No independent test credentials supplied or verified. Production settings explicitly excluded. | Real external-provider tests Blocked. Local contract/error cases can run after approval. |
| Email/OTP delivery | No independent test Auth/mail inbox service configured. | Link generation/UI failure tests may use adapters; actual delivery/password/email change is Blocked until isolated service exists. |
| Piston remote languages | No independent test runner supplied. | C++/Java/R/Go/Rust real provider tests Blocked. Local Python/JS/TS/SQL execution still needs actual triggering. |

Do not install software, initialize a new backend schema, or contact a vendor merely to turn a Blocked result into an assumed pass. If a full local stack is needed, present the exact install/bootstrap plan and schema diff before executing it.

## Database provenance and cleanup

- Replay all timestamped migrations in an empty, isolated database only after the schema/bootstrap gate is approved. Historical sample inserts/deletes and duplicate combined/full_schema files require inspection, not blind execution against a nonempty database.
- Test rows/files must carry `QA_TEST_` names or an explicit ownership/ID ledger where the schema only permits UUID/token fields. Historical sample data from migrations must be distinguished from test fixtures and never imported into production.
- Record every created database row/storage object in a fixture ledger. Avoid broad cleanup statements. Deletion tests and final fixture cleanup require approval of the exact disposable scope and recovery/deletion method.
- No test data or local test accounts have been created yet. No cleanup is currently needed.

## Planned first execution order after approval

1. Confirm safe environment and test-owned local server, then verify isolated schema/grants and high-risk legacy SECURITY DEFINER functions; source findings are hypotheses until triggered.
2. Run database/API negatives and critical identity/permission boundaries before ordinary UI writes.
3. Execute each approved route/interaction across the full role/locale/viewport expansion; capture real response/row/file evidence, with blocked real-provider variants separate.
4. Log each reproduced failure, fix in severity order, one bug commit each, run targeted/regression/build/lint/type-check after every fix, and stop on failure.
5. Rerun full approved matrix; prepare cleanup candidates/SQL and documentation; obtain cleanup/final-report approvals before deletion or deployment.

STEP 1 does not run any item above. Every new functional result is currently Pending approval, Needs decision or Blocked.
