# Isolated hosted QA environment

User explicitly approved creating a free QA project in the selected organization, populating only QA_TEST_ fixtures and cleaning those fixtures afterward. The connector confirmed the organization plan is `free` / `tier_free`; no nonzero charge or plan upgrade was authorized.

- Project name: `QA_TEST_DataCamp_final`.
- Exact project reference: `kcqgnkfdpfibwkrghubl`.
- Organization reference: `rvdsfyncsvffzrpazbiu`.
- Region: eu-west-1. PostgreSQL 17.11.0.003, ACTIVE_HEALTHY.
- Initial SQL inspection: public schema had no tables.
- Production reference `rxasbnwibbjgdndncllb` is excluded from test queries, schema operations and fixture creation/deletion.

New-QA schema/data operations are separately authorized. This does not authorize applying any pending migration to production, pushing Git, Vercel/Sites publication or paid capacity. Local/adapter outcomes remain separate from hosted-provider outcomes until real requests and persisted rows/bytes/events are observed.

Schema initialization is held until the clean-install RLS and reachable-form-path regressions pass. Credentials must be generated/stored only in ignored `qa-audit/.runtime/final-hosted/` or session memory; never in this report, a committed trace or the chat.
