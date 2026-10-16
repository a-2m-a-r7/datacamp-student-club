# Requested course upload and presentation update — 2026-10-16

The owner explicitly requested a drop area that also opens the file picker and a more professional course presentation. This is an authorized feature/layout change on the local `tester-final` branch, awaiting final-report approval before any publication.

- Video, material and subtitle areas accept one dropped file or mouse/keyboard selection. Busy/disconnected states disable selection; file picker cancellation leaves the existing lesson intact. The existing chunked/resumable service still owns uploads and persistence.
- Empty files, videos with an unsupported MIME type, declared video sizes over 2 GiB and multiple dropped files are rejected before an upload request. Subtitle files retain the existing 5 MiB server limit. Material formats and all final file checks remain enforced by the server.
- Course catalog and enrolled-course cards use consistent 16:9 covers, neutral missing-cover graphics, readable two-line titles, wrapping metadata and separate instructor/actions. There are no generated ratings, invented enrollment totals or stock photos.
- Search/category/level filters and cursor loading retain their data source. Enrolled cards show saved progress. My Courses displays actual loaded enrollment/completion counts and a direct continue/review link. Link actions use a single anchor instead of a nested button.

## Verification

`QA_TEST_course_presentation_03` passed **18/18** cases: EN/AR × 1440/768/375 × three workflows. The real browser opened the native picker by click and Enter, dropped files, exercised busy/pause and invalid-file cases, filtered courses, enrolled once through the RPC and continued to the visible lesson. Network payloads and persisted SQL asset/enrollment rows were independently checked, including reload.

This suite uses real migrated SQL with an isolated Auth/Storage/Drive transport adapter. It does **not** prove a live Google Drive upload or 2 GiB transfer. The declared-size boundary is explicitly a metadata probe. The earlier 10 MiB upload regression exercises chunk recovery and reviewed AI application through provider transport adapters. Hosted provider verification remains separate.

The first two focused runs are retained as test development evidence: incorrect Arabic control names and selection of a hidden mobile sidebar label caused test-oracle failures. Run 03 uses the actual translated controls and visible lesson heading; none of those failures are claimed as application defects.

Build, configured lint and explicit `tsc --noEmit` passed (`QA_TEST_course_ui_*_02.txt`). The complete browser rerun is tracked independently in `QA_TEST_full_course_ui_01`; an unfinished run must not be reported as passed.
