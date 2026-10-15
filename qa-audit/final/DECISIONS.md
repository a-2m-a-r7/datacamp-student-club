# Decisions before execution

This is an approval draft, not a bug report. Static observations are not runtime-confirmed failures. The user delegated routine setup choices; this does not silently approve new product permissions, deletion, production changes or deployment.

| ID | Observed source contract | Proposed conservative baseline | Decision status |
|---|---|---|---|
| DEC-001 | UI roles are `member`/`super_admin`; persisted profile role is `user`/`admin`. Legacy capability flags all alias super_admin. Source: `src/types/index.ts:9`, `src/contexts/AuthContext.tsx:487`, `src/lib/roleDefinitions.ts:54`, migration `20261013000000_missing_schema.sql:9`. | Keep the current two-role product. Test DB admin/UI super_admin normalization and deny unsupported forged `hr`, `event_manager`, `content_manager`, `editor` identities. Positive independent workflows for those roles cannot be marked passed or created without a new permission design. | Needs decision with matrix approval. |
| DEC-002 | Profile password/email verification uses emailed links; no typed OTP input exists. Source: `src/pages/Profile.tsx:74`, `:124`, `ResetPassword.tsx`, `VerifyEmail.tsx`. | Test correct/wrong/expired/reused links and actual delivery when an isolated mail/Auth service exists. Do not add a new OTP interface as a bug fix without agreement. | Needs decision: accept links or require a new OTP feature. |
| DEC-003 | Auth storage is sessionStorage. Refresh persists in the current tab; independent tabs can have different identities. Source: `src/lib/supabase.ts:21`. | Preserve per-tab account isolation; test both persistence and account-data separation. Do not silently share tokens through localStorage. | Needs decision: preserve isolation or require shared login across tabs. |
| DEC-004 | There is no global light/dark theme switch in the shell; form theme controls do exist. | Test actual form themes and dark layout. Mark a missing global theme toggle Not present, not passed or automatically added. | Needs decision only if a new global theme feature is required. |
| DEC-005 | package.json says UNLICENSED while some source headers mention Apache-2.0. | Preserve current notices; do not invent a license grant for the owner. Record license choice as pending before final LICENSE authoring. | Owner decision required before delivery documentation finalization. |
| DEC-006 | Quiz correct indices and exercise solutions are distributed with lesson content; grading/progress RPCs still enforce source answers and prerequisites. | Treat current tool as educational practice, not proctored/secret assessment. Verify server grading and disclose answer visibility. A protected assessment model is a separate design. | Needs decision if assessment secrecy is a requirement. |
| DEC-007 | Real 2 GiB media transfer and 1000 concurrent viewers depend on external quotas and an isolated target not currently supplied. | Test local size boundaries/resume/error behavior; leave real large-transfer/load capacity explicitly blocked, without stressing production or spending money. | Real capacity test requires a named isolated environment and resource window. |

## Explicit approval gates retained

- Approve the concrete TEST-MATRIX before functional test execution.
- No production data/API/database use in this audit.
- No production or existing schema changes. Any proposed schema fix gets its own SQL diff and approval before application.
- No permanent deletion of code/files/tables/records or cache purges without an itemized, evidenced approval; delete in a separate commit where applicable.
- No push, merge or deployment until the concrete final report is approved.
- Missing real provider credentials remain Blocked. Test adapters are identified separately and never labeled as real integration passes.

The source inventories contain a few additional copy/optional-control ambiguities. They are retained for review, rather than resolved by creating unrequested features.
