# Cleanup candidates requiring owner approval

Read-only source inventory, 2026-10-15. **No files, dependencies, caches, database objects or data have been deleted.** None of these static candidates is a confirmed runtime bug or a proven safe deletion. The sole executor must approve the exact set and obtain the user's deletion approval before deleting in a separate commit, as required by the pasted request. Do not combine cleanup with application fixes.

The review read `.gitignore`, `.vercelignore`, package metadata and application/config/source files only. It did not open `.env`, private `.runtime` files, cloud credentials or tokens. Metadata below is names and byte lengths only. Package-manager/knip/depcheck execution and the new helper remain for the sole executor.

## Candidate dependencies and dead symbols

| ID | Candidate | Concrete static evidence | Action before proposing removal |
|---|---|---|---|
| CLEAN-001 | Runtime dependency `@google/genai` | Declared in package.json; no import/require in `src`, `api`, `server`, `scripts` or vite config. Gemini chat/video use REST `fetch` instead. | Sole executor runs bounded dependency analysis and confirms no dynamic imports/tool-only use. If approved, remove package+lock entry with npm and update stale architecture docs, then build/lint/type-check and regression. No network install performed by inventory. |
| CLEAN-002 | Runtime dependency `html2canvas` | No application import found. `vite.config.ts:73` retains a `vendor-canvas` manual-chunk rule and README/CHANGELOG mention it. Member card is direct Canvas (`src/lib/memberCard.ts`); certificate code uses its own canvas/export logic. | Confirm emitted dependency graph/current export tests and intended report tooling. Removal candidate includes stale chunk rule/docs; do not remove Canvas/jsPDF functionality. |
| CLEAN-003 | Dev dependency `autoprefixer` | Declared in package.json, no explicit config/import under app or root Vite config; Tailwind uses `@tailwindcss/vite`. No postcss config was present among root files listed. | Verify Tailwind/Vite transitive and external tooling requirements. Literal-import scan alone does not prove a CLI/build dependency unused. |
| CLEAN-004 | `src/components/ContentPage.tsx` and `App.tsx:49` lazy declaration | `ContentPage` appears only in its component declaration/export and App's lazy import, with no rendered `<ContentPage>` or reference found elsewhere in source. | TypeScript/compiler static symbol analysis plus route review. Removing declaration and component requires exact owner approval; no design change. |
| CLEAN-005 | `generateVerificationCode` in `src/services/certificateService.ts:10–18` | Local function declared but no invocation in service or remaining searched source. Actual course issue path calls `issue_course_certificate` RPC. Uses Math.random but appears dormant, so do not misreport it as actual credential generation behavior. | Confirm TS symbol references and remove only after approval. Verify RPC certificate issuance still uses intended DB unique code and QR flows. |
| CLEAN-006 | `runCodeVerification` export in `src/lib/pythonRunner.ts:24` | Definition only in source search. Current `CodeExerciseRunner` executes active language per testcase instead of importing this helper. | Check QA/tool or external API consumers before removal; could be legacy reusable helper. `TestCase` interface and `runPythonCode` are used and must be preserved. |
| CLEAN-007 | `certificateService.getLocalCertificates` at `:76` | Method returns empty array; no source consumer found. Current cert list uses database service. | Confirm all callers including QA; empty legacy method is not itself fake production certificate data. Remove only after approval. |

Do not label the following declared dependencies unused merely because no TS import exists: `tsx`, `vite`, `typescript`, `@playwright/test`, Tailwind tooling and `@types/*` may be used by npm commands/config/type discovery; `jsqr` and `@electric-sql/pglite` are QA imports. The helper reports **candidates**, never automatic removal instructions.

## Legacy root artifacts and historical reports

| ID | Candidate / bytes observed | Evidence and caution |
|---|---|---|
| CLEAN-008 | `storage.rules` — 939 bytes | Contains Firebase Storage/Firestore rules, whereas application packages/services are Supabase and no root/source/docs setup references found. Does not govern current Supabase RLS. Owner should confirm there is no separate legacy Firebase deployment before archival/removal. |
| CLEAN-009 | `firebase-blueprint.json` — 5,786 bytes | Filename suggests historical scaffold; no app/source/README/HANDOVER/docs/npm references found. Contents intentionally not needed for this dependency inventory. Confirm ownership/export tooling before removal. |
| CLEAN-010 | `metadata.json` — 255 bytes | No app/source/README/HANDOVER/docs/npm references found. Could be host/tool metadata convention; absence of import is insufficient proof. |
| CLEAN-011 | `supabase-schema.sql` — 7,554 bytes | Not referenced by current application/setup scan; timestamped migrations exist separately. Do not execute or delete: compare historical schema to migration chain and README first. Removing schema documentation can harm handover. Database schema is entirely outside cleanup authorization. |
| CLEAN-012 | `generate_report_pdf.cjs` — 1,074 bytes | Not in npm scripts nor app setup references. Uses hard-coded Windows Edge path to render root `PROJECT_ADDITIONS_REPORT.html` to PDF, logs paths and launch result. If root report must stay regenerable, preserve generator. |
| CLEAN-013 | `PROJECT_ADDITIONS_REPORT.html` — 37,796 bytes and `.pdf` — 1,385,264 bytes | Not application assets/imports. Referenced by legacy root generator. Historical deliverables, not automatically junk; preserve unless owner selects archival/removal. |
| CLEAN-014 | Historical `qa-audit/REPORT.md`, `FIX_REPORT.md`, older result JSON/images/generators | Search found overlapping prose and older exports. Exact duplicate hash check is pending; do not call them byte-identical. Prior evidence may be required for handover/history; never silently delete because current audit replaces it. |
| CLEAN-015 | `output/pdf/*`, `tmp/pdfs/*` | Published PDF reports are deliverables; rendered PNG intermediates may be reproducible. Distinguish final reports from intermediates and retain evidence needed to audit this work. `tmp/pdfs/` is ignored. |

Two public logo assets are present, `public/logos/datacamp-mark.png` and `innovation-university-mark.png`; these are actual branded assets and not cleanup candidates without reference+hash review. No duplicate asset claim has been made.

## Logs, debugger, demonstration and random content

| ID | Finding | Interpretation / required review |
|---|---|---|
| CLEAN-016 | `api/forms/sync-sheet.ts:114`, `:196`, `:214`, `:283` actual `console.log` calls | Logs form title, workbook ID/owner email, form ID and response ID. Consider structured/minimized operational logging as a separate privacy fix if execution shows inappropriate disclosure. Do not include actual values in evidence or blanket-delete operational failure logs. |
| CLEAN-017 | `scripts/dev-server.ts:46` actual startup console.log | Local development URL/status, intentional operational output. Retain unless user specifically chooses silent dev startup. |
| CLEAN-018 | Legacy `generate_report_pdf.cjs` console.log calls | Reports local paths and renderer stdout. Candidate only if the generator/report are retired together. |
| CLEAN-019 | `src/lib/universalRunner.ts` starter snippets include `console.log`, synthetic member scores/names | These are editor learning examples, not live app console statements or persisted member data. AST scan distinguishes string templates from actual logging calls. Do not remove useful teaching examples based on text grep. If branding wants examples changed, treat as a product decision. |
| CLEAN-020 | No `debugger` match in source/API/server/scripts scan | Static search only, not runtime guarantee for built dependencies. Recheck final bundle with safe location-only scan. |
| CLEAN-021 | `Math.random` in Starfield and polling jitter | Visual star positions/animation and60–75s jitter; expected. Form builder option IDs/upload temporary filenames also use randomness; these are not fake course/event/member metrics. Review collisions separately if triggered. |
| CLEAN-022 | DiceBear host accepted in existing avatar-import path (`profile-avatar.ts:8`, `AuthContext.tsx:219`) | Existing legacy account image migration/allowlist, not active creation of random avatar as fallback. `AssetImage.tsx` shows a neutral icon on missing/broken media. Removing allowed host could prevent migration of already-stored legacy photos and needs decision. |
| CLEAN-023 | `CourseManagement.tsx:450` Unsplash URL placeholder | Placeholder guidance only; not fetched random image or auto-created data. Source scan found no picsum/pravatar/randomuser/faker/mockData/demoAccounts seed source. DB content has not been inspected by this inventory, so no claim of zero fake database records. |
| CLEAN-024 | `GoogleAccountModal` in Login/Register | Actual Google sign-in information modal gated by Vite DEV. No fabricated account switcher found in this component. Must verify production bundle behavior in test; do not delete merely for having a development modal. |
| CLEAN-025 | `defaultContent.ts` empty defaults | Empty editor defaults, no synthetic records/counters/contact information. `supabase.ts` placeholder client prevents initial constructor crash and `isSupabaseConfigured` gates operations; this is missing-config handling, not persisted fake records. |

Large source sections commented out were not conclusively identified. Existing disabled/inactive scaffolding comments and generated QA reports need syntax-aware inspection before any deletion request; do not auto-remove comments that document auth, RLS, provider contracts or security decisions.

## Caches and generated paths

`git ls-files` for the requested patterns returned **no tracked files** for `dist`, `.vite`, `node_modules/.vite`, `node_modules/.cache`, `.vercel`, `coverage`, `playwright-report`, `test-results`, `*.tsbuildinfo`, `*.log`, `.eslintcache`, `.DS_Store` at inventory time. This does not prove every possible cache path absent. `gitignore` already covers these categories. `.env*` ignored with `!.env.example` exception is correct; preserve `.env.example` as tracked template.

Directory listing showed `dist/`, `.vercel/`, `node_modules/`, `test-results/`, `tmp/`, `qa-audit/site-build/`, `qa-audit/fix-results/`, `qa-audit/qa-audit/` present. Sizes/counts are left to the metadata-only helper because browser tests may currently write these files. **Presence is not permission to delete.**

| Candidate group | Safe next step after owner approval |
|---|---|
| Reproducible `dist`, `.vite`, node cache, build report folders | Stop dependent processes first, resolve absolute paths inside repo, enumerate exact approved list/bytes, ensure no tracked files, then use native PowerShell `Remove-Item -LiteralPath` only. Never recursively target a computed unchecked parent path. |
| `.vercel/` | Contains project linkage and may contain downloaded env metadata; do not read/print contents in cleanup evidence. Deleting breaks local project linkage and needs explicit inclusion in approved list. |
| `test-results`, `playwright-report`, `qa-audit/fix-results` | Failure screenshots/traces are evidence, not disposable until needed artifacts copied to final evidence and reviewed for secrets. Wait until current executions finish. |
| `qa-audit/.runtime/`, `.postgres/` | **Protected from broad cleanup:** may hold OAuth JSON, runtime secrets, private proof/helper files and isolated DB. Do not treat as generic temp. Need exact reviewed recovery/preservation plan; never copy secret content to reports. |
| `node_modules/` | User requested clean npm reinstall later; deletion/reinstall should be a separately approved concrete action after tests/fix loop. Prefer `npm ci` once approved, preserve lockfile and single package manager. Never invoke Windows npm `clean` script blindly: current package `clean` uses Unix `rm -rf dist`. |

Current `.vercelignore` excludes `.env*` wholesale, including the example, which is reasonable for deployment payload; Git tracking exception remains in `.gitignore`. It also excludes `qa-audit`, Supabase sources and dependencies; retain handover docs in Git independently. No ignore edits performed.

## Environment template completeness — variable names only

Confirmed public names consumed by source: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SITE_URL`, `VITE_ENABLE_REALTIME`, `VITE_PISTON_API_URL`.

Confirmed server names: `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_SPREADSHEET_OWNER_EMAIL`, `GOOGLE_DRIVE_CLIENT_ID`, `GOOGLE_DRIVE_CLIENT_SECRET`, `GEMINI_COURSE_ENABLED`, `GEMINI_COURSE_MODEL`.

Names used but absent from `.env.example`: `SUPABASE_URL`, `SUPABASE_ANON_KEY` (server aliases), `COURSE_SITE_URL` (server-only canonical override), `DISABLE_HMR` (development toggle). Add documented optional aliases only if parent confirms intended support; never add real values. `.env.example` documents `VITE_APP_URL` and `VITE_AUTH_REDIRECT_URL` but no app source read found; describe whether they are external-provider setup guidance or obsolete configuration before removing them.

Vite `DEV` is built-in, not a secret template entry. QA names `QA_RESULTS_FILE`, `TEST_BASE_URL` belong to test documentation. Bracket-index env reads or dynamic variable references require manual review; the helper's regex list is not proof of exhaustive environment use. Never enumerate runtime process.env values.

## Helper and recommended sole-executor checks

Created ignored source-only helper `qa-audit/.runtime/final-static-scan.mjs`; **not executed by inventory agent**. Run from repo root:

```powershell
node qa-audit/.runtime/final-static-scan.mjs
```

It parses only selected nonsecret source/config files; outputs file/line metadata for actual AST console/debugger statements, unresolved-package candidates, inbound-import candidates, exact byte duplicate groups, known-cache metadata, tracked-generated path names and env variable names. It never reads dotenv files, existing `.runtime` contents, `.git` objects, dependencies' content or generated private traces. Dependency imports inside templates and CLI usage may escape AST resolution; manual verification remains necessary.

Recommended security scans for sole executor (separate from cleanup and never leak values):

1. Tracked secret-path **names only**: use `git ls-files` then match `.env`, credentials JSON/private-key filenames; allow `.env.example`. Avoid `git show`/diff raw secret blobs in tool output.
2. Source/bundle secret-pattern checks should print **relative path, line number, detector category and count only**, never matched line/token. Scan `dist` emitted after isolated build; secret variable names alone are not secret values.
3. Git history: use a redacting scanner with verified no-raw-value/no-secret-snippet mode (or a parent-authored local script reading blobs in memory and emitting commit/path/category/count only). Never paste `git log -p` or raw `git grep` matching credential lines. Separate credentials from fixture/example canaries and public anon keys; cannot declare secrets absent just because one pattern finds none.
4. Exact known-secret comparison is permissible only through an approved private local scanner that reads necessary secret values in memory, prints counts/path metadata and does not embed values in shell arguments or write them. Do not bulk-download Vercel secrets for comparison.
5. Browser traces/screenshots/HAR downloads can hold auth headers, form emails, provider session URLs or personal data; sanitize artifact copies before commit and preserve private originals separately. Never upload existing private evidence wholesale.
6. For static unused analysis, prefer existing local TypeScript/lockfile tools or explicitly approved knip/depcheck installation. The current literal import evidence is a candidate list; do not claim tool execution that has not happened.

Owner approval proposal should name exact candidate IDs and paths/dependencies, preservation plan and expected savings. A broad “cleanup everything” command is not suitable for this repository's private runtime files and historical delivery evidence.
