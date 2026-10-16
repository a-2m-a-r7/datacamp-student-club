# Maintenance and ownership

Keep a record of the deployed Git commit, database migration history, provider project IDs, owners and quota settings. Rotate server/service keys and OAuth/service-account secrets through the provider, then update only the matching server environment. Rotating the service key also affects locally encrypted course refresh tokens; plan a Drive reconnect. Never paste credentials into tickets, reports or client bundles.

Back up through approved provider tools. The application backup API intentionally exports selected operational tables in pages; it is not a full Supabase/Auth/Storage disaster-recovery backup and does not provide a cross-request snapshot guarantee. Test restore into an empty isolated project before relying on a recovery plan.

Review failed auth, server errors, quota/rate-limit events, stalled resumable uploads, analysis-job states and advisor notices. Keep SDK/Node compatibility current and rerun migration/RLS/role/upload regressions after dependency changes. Do not remove an unused index based solely on new-QA statistics.

Assets are content-hashed; HTML/API/cache headers come from vercel.json. Diagnose stale content against the deployed commit and network headers. The UI cache control covers the browser scopes actually implemented/tested; it is not a Vercel CDN purge. Avoid deleting .vercel metadata or protected .runtime credential files as generic caches.

This audit has deletion approval only for dist, node_modules/.vite, test-results and qa-audit/site-build, after testing stops and absolute paths/untracked status are verified. Other source/dependency/temp candidates require a separate itemized approval. QA fixture cleanup must use exact IDs in the isolated project; Storage objects are removed through its API before Auth fixtures/cascades.

Keep the repository private with package license UNLICENSED. Existing ownership and third-party copyright/license notices remain. No open-source licensing grant is introduced by this audit.

Use qa-audit/final/TEST-MATRIX.md, BUGS.md, BEFORE.md and AFTER.md for evidence-backed delivery status. Older reports/PDFs are historical; they do not replace the latest audit or prove an unexecuted provider flow.
