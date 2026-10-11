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

تعتمد المنصة بنية سحابية كاملة باستخدام **React 19** و **Supabase PostgreSQL** و **Vercel Serverless Functions**، وتوفر تجربة تعليمية فريدة تشمل مرشداً ذكياً بالذكاء الاصطناعي (NEXUS AI Mentor)، ومترجماً سحابياً للأكواد، ومنشئ نماذج ديناميكي متطور مستوحى من Microsoft Forms مع مزامنة فورية إلى جداول بيانات Google Sheets، بالإضافة إلى نظام التحقق الأكاديمي الرقمي من الشهادات عبر رموز QR.

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
  * مزامنة تلقائية لحظية ثنائية الاتجاه مع Google Sheets عبر Google Service Account.
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
| **Spreadsheet Sync** | Google Sheets API v4 & Google Drive API via Service Account |
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
git clone <repository-url>
cd ref_datacamp_temp
npm install
```

### 3. إعداد متغيرات البيئة (Environment Variables)
قم بإنشاء ملف `.env` عبر نسخ النموذج المعتمد:
```bash
cp .env.example .env
```
املأ القيم الخاصة بـ Supabase و Gemini في `.env` (انظر دليل المتغيرات أدناه).

### 4. إعداد قاعدة بيانات Supabase
1. افتح مشروعك في **Supabase Dashboard** -> **SQL Editor**.
2. انسخ محتوى الملف الموحد [`supabase/full_schema.sql`](supabase/full_schema.sql) والصقه في المحرر ونفذه (`RUN`).
3. (اختياري) أضف البيانات التجريبية الأولية بنسخ وتنفيذ [`supabase/seed.sql`](supabase/seed.sql).
4. لترقية أول حساب مسؤول فائق (`Super Admin`)، نفّذ الأمر التالي في SQL Editor:
```sql
SELECT public.promote_admin_by_email('your-admin-email@example.com');
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
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | بريد حساب الخدمة لمزامنة جداول Google Sheets | **Server Only** |
| `GOOGLE_PRIVATE_KEY` | المفتاح الخاص لحساب خدمة Google Sheets | **Server Only** |
| `GOOGLE_SPREADSHEET_OWNER_EMAIL` | البريد الإلكتروني المالك لمجلدات الجداول المتزامنة | **Server Only** |

> ⚠️ **تنبيه أمني هام:** المتغيرات التي تحتوي على مفاتيح سرية (`SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, `GOOGLE_PRIVATE_KEY`) لا تبدأ بـ `VITE_` وتعمل فقط داخل دوال السيرفر (`api/`) ولا تصل إلى متصفح العميل نهائياً.

---

## 🧪 Testing & Verification | فحص واختبار المشروع

تم تزويد المشروع بمجموعة اختبارات E2E شاملة باستخدام Playwright تغطي جميع المسارات والصلاحيات عبر 3 شاشات:

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
