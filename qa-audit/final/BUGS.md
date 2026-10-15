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
