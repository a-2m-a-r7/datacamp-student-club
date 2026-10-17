# Changelog

All notable changes to the **DataCamp Student Club Platform** (`datacamp-student-club`) will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## Unreleased — final audit branch, 2026-10-17

- Added accessible drop/click/keyboard file selection for lesson videos, materials and subtitles, retaining resumable uploads and existing server validation.
- Organized course catalog and enrolled-course cards with consistent covers, readable titles, saved progress and clear actions. Missing media uses neutral graphics.
- Fixed persisted-role and legacy user/RPC authorization, clean-install grants/RLS and Realtime setup through separately approved migrations.
- Fixed live Gemini model selection, owner-authorized Sheets creation, serialized canonical Sheets resync, generated lesson save states, quiz code formatting, saved file sizes, stdin, enrollment confirmation and long-page footer overlap.
- Validated real isolated QA providers: Supabase Auth/Storage/Realtime, Drive chunk resume/read-back, bilingual Gemini output, Sheets schema/retry synchronization, learning completion and one automatically issued downloadable certificate. Attachment integrity now rejects nonexistent/empty references and uses Storage size. Exact scope and remaining external limits are in the audit results; production was excluded.
- These changes are local and have not been pushed or deployed. Detailed test evidence and external-service limitations are recorded in `qa-audit/final/COURSE-UI.md` and the final audit ledger. Historical release claims below are not verification of this branch.

## [1.0.0] - 2026-10-11

### 🚀 Production Release & Final Audit Delivery

This major milestone marks the official production-ready release of the DataCamp Student Club platform, featuring a modernized full-stack architecture, comprehensive quality assurance verification, strict security hardening, and extreme performance optimization.

---

### ⚡ Performance & Bundle Optimization
- **Route-Level Code Splitting:** Implemented `React.lazy()` and `Suspense` for all non-home pages with a branded micro-loading fallback, preventing heavy modules from being loaded on initial visit.
- **Vendor Chunk Splitting:** Configured fine-grained Rollup chunks in `vite.config.ts`:
  - `vendor-react` (React 19, React DOM, React Router v7)
  - `vendor-icons` (Lucide React icon system)
  - `vendor-supabase` (Supabase Client & Auth SDK)
  - `vendor-motion` (Motion / Framer Motion animations)
  - `vendor-charts` (Recharts & graphing utilities)
  - `vendor-exports` (jsPDF, html2canvas, xlsx)
- **Bundle Size Reduction:** Slashed main entry JS bundle from **3,193 KB (3.2 MB)** down to **214 KB** — an unprecedented **93.4% reduction**.
- **Build Speed Acceleration:** Reduced Vite compilation time from **23.8 seconds** down to **6.6 seconds** (a 72% speedup).
- **Resolved Static/Dynamic Import Collisions:** Refactored dynamic imports in `src/pages/admin/GalleryManagement.tsx` to eliminate bundle collision warnings with `Profile.tsx` and `StaffManagement.tsx`.

---

### 🛡️ Security Hardening & Zero-Leak Verification
- **Strict Content-Security-Policy (CSP):** Implemented enterprise CSP headers in `vercel.json` restricting script execution, styles, images, and fonts to authorized origins.
- **Hardware Permissions Policy:** Added explicit Permissions-Policy allowing `camera=(self)` for the in-browser QR attendance scanner while locking down `microphone` and `geolocation`.
- **Zero Secret Leaks:** Audited entire client codebase and production bundle (`dist/`); verified 0 leaked API keys, tokens, or service role credentials.
- **Zero Localhost Leaks:** Removed and sanitized all development `localhost` URLs across the platform, wiring production fallbacks to `VITE_SITE_URL` and `getSiteUrl()`.
- **Vulnerability Elimination:** Pruned vulnerable legacy packages (`undici`, `firebase`), reducing npm audit vulnerabilities from **5 High** to **0 High/Critical**.

---

### 🗄️ Database & Backend Architecture (Supabase)
- **Complete Schema Consolidation:** Created [`supabase/full_schema.sql`](supabase/full_schema.sql) (77.5 KB) containing the full database structure, 13 core tables, indexes, triggers, and Row Level Security (RLS) policies.
- **Admin Elevation RPC:** Implemented secure PostgreSQL function `public.promote_admin_by_email` allowing verified 1-click super admin promotion via SQL Editor.
- **Automated Profile Sync:** Wired database trigger on `auth.users` to automatically synchronize profiles with points, badges, and roles upon registration.
- **Seed Data Suite:** Provided [`supabase/seed.sql`](supabase/seed.sql) with realistic demo workshops, tracks, events, blog posts, and leadership data.
- **Legacy Firebase Sunset:** Completely removed orphaned Firebase artifacts (`src/lib/firebase.ts`, `firebase-applet-config.json`, `firestore.rules`, and `src/services/userService.ts`).

---

### 🎨 User Experience & Interface Polish
- **Dedicated 404 Not Found Page:** Extracted inline router 404 into [`src/pages/NotFound.tsx`](src/pages/NotFound.tsx) with branded bilingual illustration and quick-return navigation.
- **Responsive Layout & Navigation:** Fully tested navigation bar, mobile menu drawer, and dashboard layouts across 3 viewports (Desktop 1440px, Tablet 768px, Mobile 375px).
- **Bilingual Internationalization:** Complete Arabic (RTL) and English (LTR) interface localization with instant dynamic switching.
- **QR Code Attendance Scanner:** Integrated camera-based QR code verification in the event management system with clear status feedback.

---

### 🧹 Dependency Hygiene & Code Cleanup
- **Package Reduction:** Pruned **242 unused packages** from `package-lock.json` (3,913 lines removed).
- **Dependency Rationalization:**
  - Cut production dependencies from 42 down to 20.
  - Eliminated duplicate Vite declaration (was listed in both `dependencies` and `devDependencies`).
  - Moved build tooling (`@tailwindcss/vite`, `@vitejs/plugin-react`) to `devDependencies`.
  - Removed 13 unused `@radix-ui/*` packages.
- **Asset Cleanup:** Removed obsolete backup files (`*.bak`), temporary archives, and unused logo variants.
- **Engine Enforcement:** Added explicit Node (`>=20.0.0`) and npm (`>=10.0.0`) engine requirements in `package.json`.

---

### 🧪 Quality Assurance & Automated Testing
- **Playwright Test Suite:** 96 comprehensive automated E2E tests covering:
  - Navigation & Route Integrity (32 tests @ 1440px)
  - Tablet Viewport & Layout (32 tests @ 768px)
  - Mobile Responsiveness & Drawer Menus (32 tests @ 375px)
- **100% Pass Rate:** 96 of 96 tests passing consistently with 0 failures and 0 flaky tests.
- **TypeScript Strictness:** Maintained 100% clean TypeScript compilation (`tsc --noEmit`) with 0 errors.

---

### 📚 Documentation & Handover
- **Bilingual README:** Completely rewritten with step-by-step setup, architecture diagrams, and environment variable references.
- **Formal Handover Package:** Authored [`HANDOVER.md`](HANDOVER.md) with comprehensive transfer protocols for Innovation University Leadership.
- **Full Technical Documentation (`docs/`):**
  - Architecture overview (`docs/architecture.md`)
  - Database schema & RLS rules (`docs/database-schema-rls.md`)
  - Roles and permissions matrix (`docs/roles-permissions.md`)
  - Production deployment guide (`docs/deployment-guide.md`)
  - Operational maintenance guide (`docs/maintenance-guide.md`)
