> Current delivery audit: tester-final (17 October 2026). See qa-audit/final/RESULTS-20261017.md, TEST-MATRIX.md and BUGS.md for actual verification and remaining limits. Publication and production migration are pending final owner approval. Earlier report totals below are historical.

## Current setup

Use Node >=22 and npm >=10, then run npm ci. Copy .env.example to a local .env and fill only the selected environment's genuine credentials. Required browser settings are VITE_SUPABASE_URL, its public key VITE_SUPABASE_ANON_KEY and VITE_SITE_URL. Blank credentials deliberately leave remote services unconfigured; no test/demo data is substituted. Backend admin functions also require server-only SUPABASE_SERVICE_ROLE_KEY.

Run npm run dev for the local app/server, npm run build for production assets and npm run preview for static preview. Static preview does not provide Vercel API handlers. npm run lint is TypeScript checking; also run node node_modules/typescript/bin/tsc --noEmit -p tsconfig.json. Do not point QA scripts at production or use ordinary dev with production dotenv values.

New database installation, effective roles, provider setup and troubleshooting are documented in docs/deployment-guide.md, docs/database-schema-rls.md, docs/roles-permissions.md, docs/architecture.md and docs/maintenance-guide.md. The canonical fresh-schema path starts at 20261013 and excludes historical sample seeds. Do not apply all legacy SQL blindly to a new project.

The isolated regression command is node qa-audit/final/run-isolated.cjs --audit-run=UNIQUE_LABEL node_modules/@playwright/test/cli.js test --config qa-audit/final/full.config.ts. It uses fake transport/real in-memory SQL and a loopback-only build. The explicitly pinned hosted QA suite is separate and keeps credentials in ignored qa-audit/.runtime/final-hosted/. Never attach real Auth traces/HAR files.

The effective product has member and administrator roles. Members cannot browse the club directory. A completed course automatically issues a unique linked certificate; downloading and LinkedIn publication remain learner actions. Large Drive uploads and Gemini generation depend on genuine configured providers and quotas; metadata size validation is not a 2 GiB transfer or 1000-viewer proof.

---

# 🚀 DataCamp Student Club Web Platform

<div align="center">

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4.0-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20%7C%20Auth%20%7C%20Storage-3ECF8E?logo=supabase&logoColor=black)](https://supabase.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-2.5_Flash-8E75B2?logo=google&logoColor=white)](https://ai.google.dev/)
[![Vercel](https://img.shields.io/badge/Vercel-Serverless%20Edge-000000?logo=vercel&logoColor=white)](https://vercel.com/)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)](LICENSE)

**المنصة الرقمية المتكاملة لنادي DataCamp الطلابي بجامعة الابتكار**  
*The Official Interactive Platform for DataCamp Student Club at Innovation University*

[🌐 Live Production Platform](https://datacamp-student-club.vercel.app) • [✨ Features](#-features) • [🛠️ Tech Stack](#-tech-stack) • [🚀 Setup Guide](#-quick-start--installation) • [📖 Documentation](#-documentation)

</div>

---

## 🌟 Overview | نبذة عن المشروع

منصة تعليمية وإدارية تفاعلية متكاملة، مصممة بأعلى معايير الويب الحديثة (Cyberpunk Dark Aesthetics) لخدمة مجتمع طلاب علم البيانات، وهندسة الذكاء الاصطناعي، والبرمجيات بجامعة الابتكار.

تعتمد المنصة على **React 19** و **Supabase PostgreSQL** و **Vercel Serverless Functions**، وتشمل مرشدًا بالذكاء الاصطناعي ومترجم أكواد ونماذج تحفظ الردود في قاعدة البيانات. إكمال الكورس يصدر شهادة تلقائيًا داخل معاملة الإكمال، مع تحقق عبر QR. مزامنة Google Sheets تستخدم ربط Drive لمالك النموذج بصلاحية drive.file، أو حساب خدمة يملك صلاحيات ومساحة فعلية كمسار بديل.

نتائج الإصلاح والتسليم الحالية: [HANDOVER.md](qa-audit/HANDOVER.md). تفاصيل ربط الشهادات: [COURSE_CERTIFICATES.md](qa-audit/COURSE_CERTIFICATES.md). الملفات والاختبارات المعزولة ليست بيانات مستخدمين في الإنتاج.

---

## ✨ Features by Role | المزايا والوظائف بحسب الأدوار

### 1. Public Visitors & Prospective Members (الزوار والطلاب الجدد)
* **استكشاف مسارات التعلم:** تصفح الدورات الأكاديمية والمشاريع المعتمدة والمعرض والمدونة.
* **NEXUS AI Mentor:** محادثة فورية مع المرشد الذكي للإرشاد الأكاديمي والبرمجي.
* **محرر الأكواد السحابي (Compiler Playground):** كتابة وتنفيذ أكواد Python, JavaScript, TypeScript, SQL في المتصفح.
* **التحقق من الشهادات الرقمية:** فحص فوري لصحة أي شهادة صادرة عبر `/verify-certificate/:code` أو مسح رمز QR.
* **الاستجابة للنماذج العامة:** تعبئة النماذج والاستبيانات عبر روابط مخصصة `/f/:slug`.
* **دعم ثنائي اللغة كامل (Bilingual i18n):** تبديل سلس بنقرة واحدة بين العربية (RTL) والإنجليزية (LTR).

### 2. Registered Club Members (أعضاء النادي والطلاب)
* **لوحة التحكم الشخصية (Student Dashboard):** بطاقة عضوية رقمية فريدة (ID Card) مع QR قابل للتنزيل.
* **تتبع المسارات ونقاط الخبرة (XP & Gamification):** لوحة متصدرين حية ومستويات تقدم (Recruit إلى Legend).
* **الدورات والاختبارات التفاعلية:** متابعة الدروس وحل الاختبارات القصيرة وإصدار الشهادات فور اجتيازها.
* **شهادات معتمدة قابلة للتصدير:** تصدير بصيغة PDF عالية الدقة ومشاركتها مباشرة على LinkedIn.
* **مركز الإشعارات الحية:** استقبال تحديثات الفعاليات وتعديل الملف الشخصي والاهتمامات.

### 3. Administrators & Management Portal (لوحة الإدارة الشاملة)
محمية بنظام أدوار وصلاحيات هرمي (`super_admin`, `admin`, `hr`, `event_manager`, `content_manager`, `editor`):
* **Form Builder (منشئ النماذج المتقدم):**
  * سحب وإفلات وإضافة 14 نوعاً من الأسئلة مع شروط الإلزام والحدود.
  * مزامنة ردود النماذج إلى Google Sheets دون تكرار عبر ربط Drive لمالك النموذج، مع مسار بديل لحساب خدمة مجهّز فعليًا.
  * لوحة تحليلات وإحصاءات بيانية فورية للردود وتصدير Excel / CSV بنقرة واحدة.
* **إدارة المستخدمين والصلاحيات (User Management):** تعيين الأدوار وترقية المشرفين وتصدير السجلات.
* **إدارة الفعاليات وماسح الحضور بالكاميرا (Event Scanner):** مسح تذاكر QR للطلاب بكاميرا المتصفح وتسجيل الحضور المباشر.
* **إدارة الدورات والمحتوى:** إضافة الدورات والدروس وتعديل إعدادات الموقع وسياسات الأمان.

---

## 🛠️ Technology Stack | البنية البرمجية

| الطبقة (Layer) | التقنيات المستخدمة (Technologies) |
|---|---|
| **Frontend Core** | React 19, TypeScript ~5.8, Vite 6 |
| **Styling & UI** | Tailwind CSS v4, Motion (Framer Motion v12), Lucide React, Sonner (Toasts) |
| **Backend & Database** | Supabase (PostgreSQL 15+, Row Level Security, Realtime, Storage Buckets, Auth) |
| **Serverless & Edge** | Vercel Serverless Functions (`api/ai/chat.ts`, `api/forms/sync-sheet.ts`, `api/admin/users.ts`) |
| **AI Integration** | Google Gemini 2.5 Flash API via Serverless Proxy |
| **Spreadsheet Sync** | Google Sheets/Drive APIs via owner OAuth drive.file; configured service-account fallback |
| **Testing & Automation**| Playwright E2E Suite, jsQR, Vitest-compatible tooling |
| **Exports & Media** | jsPDF, html2canvas, SheetJS (xlsx), qrcode.react, html5-qrcode |

---

## 📁 Repository Structure | هيكلية المشروع

```text
datacamp-student-club/
├── api/                          # Vercel Serverless Functions
│   ├── admin/users.ts            # Secure user management via Service Role
│   ├── ai/chat.ts                # Gemini AI secure proxy (Zero secret in client)
│   └── forms/sync-sheet.ts       # Google Sheets automated sync
├── docs/                         # Comprehensive Technical & Operational Documentation
│   ├── architecture.md           # Full system architecture & data flow
│   ├── database-schema-rls.md    # Database schema, tables, and RLS policies
│   ├── deployment-guide.md       # Vercel & Supabase production deployment steps
│   ├── maintenance-guide.md      # Administrator operational guide
│   └── roles-permissions.md      # RBAC roles and permissions matrix
├── public/                       # Static production assets (logos, marks)
├── qa-audit/                     # Complete QA audit inventory, tests, and deliverables
│   ├── final/BEFORE.md           # Baseline state metrics
│   ├── tests/                    # Playwright E2E automated test suites
│   ├── broken-buttons.csv        # Complete remediation inventory
│   ├── playwright.config.ts      # Multi-viewport test configuration
│   └── REPORT.md                 # Detailed Phase 2 audit report
├── src/
│   ├── components/               # Reusable UI primitives and widgets
│   │   ├── AIMentor/             # NEXUS AI mentor floating button & modal
│   │   ├── forms/                # Form builder canvas, renderer, share modal
│   │   ├── ui/                   # Cyberpunk cards, buttons, inputs
│   │   ├── ErrorBoundary.tsx     # Global crash resilience boundary
│   │   └── LanguageSwitcher.tsx  # Dynamic AR/EN language switcher
│   ├── contexts/                 # React Contexts (Auth, Language, Points, Notifications)
│   ├── lib/                      # Core helpers (Supabase client, siteUrl, code runners)
│   ├── pages/                    # 25+ application pages (Public, Student, Admin)
│   ├── services/                 # API service abstractions
│   ├── types/                    # Shared TypeScript interfaces and schemas
│   ├── App.tsx                   # Route-level code-splitting router & shell
│   └── main.tsx                  # Application bootstrap
├── supabase/                     # Database migrations & seeds
│   ├── migrations/               # Sequential SQL migration files
│   ├── full_schema.sql           # Unified 1-click database deployment schema
│   └── seed.sql                  # Initial clean demo seed data
├── .env.example                  # Environment configuration template
├── HANDOVER.md                   # Formal delivery and ownership transfer guide
├── CHANGELOG.md                  # Detailed version release notes
├── LICENSE                       # Proprietary License
└── vercel.json                   # Security headers, CSP, and rewrite rules
```

---

## 🚀 Quick Start & Installation | التشغيل المحلي

### 1. المتطلبات الأساسية (Prerequisites)
* **Node.js:** الإصدار `20.x` أو أعلى.
* **npm:** الإصدار `10.x` أو أعلى.
* حساب مجاني على [Supabase](https://supabase.com).
* حساب مجاني على [Google AI Studio](https://aistudio.google.com) للحصول على مفتاح Gemini API.

### 2. استنساخ المستودع وتثبيت الاعتمادات
```bash
git clone https://github.com/a-2m-a-r7/datacamp-student-club.git
cd datacamp-student-club
npm ci
```

### 3. إعداد متغيرات البيئة (Environment Variables)
قم بإنشاء ملف `.env` عبر نسخ النموذج المعتمد:
```bash
cp .env.example .env
```
املأ القيم الخاصة بـ Supabase و Gemini في `.env` (انظر دليل المتغيرات أدناه).

### 4. إعداد قاعدة بيانات Supabase
1. افتح مشروعك في **Supabase Dashboard** -> **SQL Editor**.
2. للجداول والصلاحيات الحالية استخدم [`qa-audit/SETUP_SUPABASE.sql`](qa-audit/SETUP_SUPABASE.sql)، وهو يجمع ترقيات الإصلاح دون بيانات تجريبية. المشروع الحالي طُبقت عليه الترقيات بالفعل؛ لا يلزم إعادة تهيئته.
3. لا تنفذ ملفات seed أو الأمثلة القديمة على الإنتاج. إكمال كورس حقيقي مؤهل يصدر شهادته تلقائيًا؛ الكورس الخالي من الدروس لا يمنح شهادة.
4. عند إعداد مشروع جديد فقط، سجّل حساب المسؤول وأكد بريده، ثم اختر هذا الحساب الموجود صراحة من SQL Editor بصلاحية مالك المشروع:
```sql
UPDATE public.profiles AS p SET role='admin'
FROM auth.users AS u
WHERE p.id=u.id AND lower(u.email)=lower('your-admin-email@example.com')
  AND u.email_confirmed_at IS NOT NULL AND p.status='active';
```

### 5. تشغيل خادم التطوير المحلي
```bash
npm run dev
```
افتح المتصفح على: `http://localhost:3000`

---

## 🔐 Environment Variables Guide | دليل متغيرات البيئة

| المتغير (Variable) | الوصف (Description) | النطاق (Scope) |
|---|---|---|
| `VITE_SUPABASE_URL` | رابط مشروع Supabase (`https://xxx.supabase.co`) | Frontend Client |
| `VITE_SUPABASE_ANON_KEY` | المفتاح العام المجهول لـ Supabase | Frontend Client |
| `SUPABASE_SERVICE_ROLE_KEY` | المفتاح الإداري السري للـ Serverless Functions | **Server Only** |
| `GEMINI_API_KEY` | مفتاح Google Gemini API للمرشد الذكي | **Server Only** |
| `VITE_SITE_URL` | النطاق المعتمد للروابط ورموز QR (`https://datacamp-student-club.vercel.app`) | Frontend Client |
| `VITE_ENABLE_REALTIME` | الافتراضي false: تحديث الخلفية كل 60–75 ثانية أثناء ظهور التبويب؛ true يتطلب حصة Realtime مناسبة | Frontend Client |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | بريد حساب الخدمة لمزامنة جداول Google Sheets | **Server Only** |
| `GOOGLE_PRIVATE_KEY` | المفتاح الخاص لحساب خدمة Google Sheets | **Server Only** |
| `GOOGLE_SPREADSHEET_OWNER_EMAIL` | البريد الإلكتروني المالك لمجلدات الجداول المتزامنة | **Server Only** |

> ⚠️ **تنبيه أمني هام:** المتغيرات التي تحتوي على مفاتيح سرية (`SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, `GOOGLE_PRIVATE_KEY`) لا تبدأ بـ `VITE_` وتعمل فقط داخل دوال السيرفر (`api/`) ولا تصل إلى متصفح العميل نهائياً.

---

## 🧪 Testing & Verification | فحص واختبار المشروع

الكورسات الجديدة تُحفظ كمسودة، ويضاف المنهج والاختبارات ثم تُنشر. إكمال المنهج يصدر شهادة الكورس تلقائيًا؛ تنزيل PDF/PNG يتم من زر الشهادة، وبيانات LinkedIn جاهزة للنسخ والمشاركة. راجع [تجهيز النمو وهدف 1000 مستخدم](qa-audit/FUTURE_READINESS.md) للحماية من إعادة الطلبات ونتيجة الضغط المحلي وحدود اعتماد السعة السحابية.

اختبارات Playwright تفحص مسارات وصلاحيات وتدفقات محددة على 3 أحجام شاشة. اختبارات الكورسات والشهادات تنفذ روتينات PostgreSQL الفعلية في قاعدة معزولة، مع هوية Auth خاصة بالاختبار. راجع تقرير التسليم للتغطية الفعلية وحدود الاختبارات؛ ليست هذه شهادة بأن كل زر أو تكامل خارجي اختُبر.

```bash
# تشغيل فحص الأنواع (TypeScript Typecheck)
npm run lint

# تشغيل بناء حزمة الإنتاج (Production Build)
npm run build

# تشغيل جميع اختبارات الجودة الآلية (Playwright Suite)
npm run test:qa
```

---

## 🚢 Deployment to Vercel | النشر على Vercel

1. ارفع المشروع إلى مستودع GitHub الخاص بك.
2. اربط المستودع في منصة [Vercel](https://vercel.com).
3. اختر Framework Preset: **Vite**.
4. أضف متغيرات البيئة من ملف `.env` في لوحة تحكم Vercel (`Project Settings -> Environment Variables`).
5. اضغط **Deploy**. سيتكفل ملف [`vercel.json`](vercel.json) بتوجيه مسارات الواجهة والـ Serverless Functions وتطبيق ترويسات الأمان (CSP).

---

## 📖 Technical Documentation | ملفات التوثيق الفني

* 🏗️ **الهيكلية وتدفق البيانات:** [docs/architecture.md](docs/architecture.md)
* 🗄️ **قواعد البيانات وسياسات الأمان (RLS):** [docs/database-schema-rls.md](docs/database-schema-rls.md)
* 🛡️ **مصفوفة الأدوار والصلاحيات:** [docs/roles-permissions.md](docs/roles-permissions.md)
* 🚀 **دليل النشر والإنتاج:** [docs/deployment-guide.md](docs/deployment-guide.md)
* 🔧 **دليل الصيانة والإدارة التشغيلية:** [docs/maintenance-guide.md](docs/maintenance-guide.md)
* 📦 **محضر الاستلام والتسليم الرسمي:** [HANDOVER.md](HANDOVER.md)

---

## 📜 License | حقوق الملكية

هذا البرنامج محمي بحقوق ملكية خاصة حصرية لصالح **نادي DataCamp الطلابي وجامعة الابتكار** (All Rights Reserved). انظر ملف [LICENSE](LICENSE) لمزيد من التفاصيل.

## Final tab review

See [qa-audit/FINAL_TAB_REPORT.md](qa-audit/FINAL_TAB_REPORT.md) for the final member/admin operation matrix, persisted database tests, production seed archival and external setup limits. Compiled languages require an independently hosted Piston server; set the public VITE_PISTON_API_URL endpoint and its CSP hostname after provisioning. Do not put credentials in client variables.

Historical profile/Storage review: [qa-audit/PROFILE_FINAL_REPORT.md](qa-audit/PROFILE_FINAL_REPORT.md). For a new installation follow the current canonical migration sequence in [docs/deployment-guide.md](docs/deployment-guide.md), including the later security, Realtime and Sheets coordination fixes. The older consolidated qa-audit/SETUP_SUPABASE.sql is not a replacement for that current sequence. Previously migrated production pictures are historical work; this audit uses isolated QA only.
