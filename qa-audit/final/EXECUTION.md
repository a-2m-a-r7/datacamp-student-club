# Execution ledger

User approved beginning execution on 2026-10-15: “ابدا ولا تتوقف حتى تنتهي من البرومبت الذي ارسلته لك”. The current two-role/link-confirmation/tab-isolation behavior is the baseline; unsupported legacy roles get denial tests, not invented positive privileges. No new OTP/role product feature is authorized by this audit.

No production tests, schema application, push or deployment were performed. All Node execution uses a minimal test environment and loopback-only transport guard; no production env file is loaded intentionally. Local in-memory QA fixtures are disposable/reproducible; permanent files, existing databases and production data remain outside test deletion scope.

The earlier 399-case run is historical. The latest current-source run, `QA_TEST_full_delivery_504`, passed **504/504** browser cases across EN/AR and 1440/768/375. Specific evidence, timestamps and limitations are retained per run rather than inferred from static inventories.

Database boundary execution passed 118 assertions. The CRUD permission suites exercised 792 probes across 33 tables under each of two grant configurations; a table catalogue is not a functional test. Real PostgreSQL testing used 20 connections, 1,000 QA members and 10,000 operations (11/11 assertions, zero operation errors); it does not establish 1,000 simultaneous hosted viewers or large-file throughput.

The isolated hosted QA project now exists. Actual GoTrue/REST/Storage/Realtime service tests passed 12/12 probes. Actual browser email login/profile/image persistence tests passed 6/6 cases across EN/AR and the three widths in `QA_TEST_hosted_browser_03`. These results do not establish email inbox delivery, Google sign-in, Drive uploads, Sheets sync, Gemini output or a Piston service. Google OAuth is being configured separately inside the new Google QA project; configuration readiness must not be reported as completed provider testing.

Build, configured lint and explicit TypeScript checking passed after the course UI changes. The approved hosted-provider and learner-flow checks also passed. No destructive file cleanup, push, merge or publication has been performed during this final audit.

The owner explicitly requested a drag-and-drop/click-to-select upload area and a more professional course layout on 2026-10-16. This authorizes those layout changes beyond the audit's original minimal-design rule. They retain persisted course/enrollment/asset data and the existing resumable upload service. The focused runs preserve both test-oracle failures (incorrect translated button name; hidden mobile sidebar text selected instead of the visible lesson heading) and their corrections; neither is counted as a product bug.
