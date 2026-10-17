# Accepted baseline and remaining external limits

The owner authorized execution and delegated routine implementation choices. The existing behavior below was preserved and disclosed rather than expanded into unrequested features. Static observations are not runtime-confirmed failures. Production changes, deletion and publication retain their explicit approval boundaries.

| ID | Observed source contract | Proposed conservative baseline | Decision status |
|---|---|---|---|
| DEC-001 | UI roles are `member`/`super_admin`; persisted profile role is `user`/`admin`. Legacy capability flags all alias super_admin. | Preserve the two-role product; test normalization and deny forged unsupported roles. | Preserved baseline; separate positive HR/editor workflows do not exist and are not claimed. |
| DEC-002 | Verification uses emailed links; no typed OTP input exists. | Preserve link flows and test their errors. | Preserved baseline; inbox delivery remains unverified without a controlled mailbox. |
| DEC-003 | Auth uses sessionStorage. | Preserve refresh persistence and independent identities in different tabs. | Preserved baseline; no switch to shared localStorage authentication. |
| DEC-004 | No global light/dark switch exists; form themes do. | Test existing form themes and dark layout. | Global switch: not applicable to the current product. |
| DEC-005 | package.json says UNLICENSED; third-party notices remain. | Private delivery with no public license grant. | Explicit owner choice: private, keep UNLICENSED. |
| DEC-006 | Educational answers are distributed with lessons; server grading enforces prerequisites. | Preserve educational practice behavior and disclose answer visibility. | Preserved baseline; no claim of proctored or secret assessments. |
| DEC-007 | The owner chose free services, a 2 GiB file limit, and a target of 1000 concurrent users. | Real QA transferred 47,808,659 bytes with resume/hash verification; local PostgreSQL exercised 1000 fixture members with 20 connections. | Actual 2 GiB and 1000 simultaneous hosted viewers remain unproven; no production stress or paid resources authorized. |

## Explicit approval gates retained

- Functional execution was authorized by the owner's instruction to start and continue.
- No production data/API/database use in this audit.
- No production or existing schema changes. Any proposed schema fix gets its own SQL diff and approval before application.
- No permanent deletion of code/files/tables/records or cache purges without an itemized, evidenced approval; delete in a separate commit where applicable.
- No push, merge or deployment until the concrete final report is approved.
- Missing real provider credentials remain Blocked. Test adapters are identified separately and never labeled as real integration passes.

The source inventories contain a few additional copy/optional-control ambiguities. They are retained for review, rather than resolved by creating unrequested features.
