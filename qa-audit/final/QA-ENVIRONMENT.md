# Isolated hosted QA environment

User explicitly approved creating a free QA project in the selected organization, populating only QA_TEST_ fixtures and cleaning those fixtures afterward. The connector confirmed the organization plan is `free` / `tier_free`; no nonzero charge or plan upgrade was authorized.

- Project name: `QA_TEST_DataCamp_final`.
- Exact project reference: `kcqgnkfdpfibwkrghubl`.
- Organization reference: `rvdsfyncsvffzrpazbiu`.
- Region: eu-west-1. PostgreSQL 17.11.0.003, ACTIVE_HEALTHY.
- Initial SQL inspection: public schema had no tables.
- Production reference `rxasbnwibbjgdndncllb` is excluded from test queries, schema operations and fixture creation/deletion.

New-QA schema/data operations are separately authorized. This does not authorize applying any pending migration to production, pushing Git, Vercel/Sites publication or paid capacity. Local/adapter outcomes remain separate from hosted-provider outcomes until real requests and persisted rows/bytes/events are observed.

The 22 reviewed schema migrations were applied separately after the clean-install and branch regressions passed. BUG-013 adds the missing Realtime publication tables after separate owner approval. All 33 public tables have RLS enabled; the four storage buckets have their expected public/private and size/MIME settings. No legacy sample seeds were applied.

Three temporary QA_TEST_ Auth identities (member, administrator, unconfirmed) were generated with private random passwords. The actual signup trigger created their profiles, ignoring a forged administrator role in user metadata. One known QA profile was explicitly promoted through the trusted setup connection. Hosted service results are retained under runs/QA_TEST_hosted_readiness_after: 12 probes passed. This includes GoTrue password/refresh/logout, REST privacy, persisted avatar bytes and references, Storage foreign-write/MIME/size denial, event registration and actual Realtime notification delivery. It does not prove email, Google OAuth, Drive, Sheets, Gemini, all frontend controls or production capacity.

Credentials are stored only in ignored `qa-audit/.runtime/final-hosted/` or session memory; never in this report, a committed trace or the chat. Exact temporary object/row inventories are retained there for the authorized cleanup after testing. Cleanup is not yet complete.
