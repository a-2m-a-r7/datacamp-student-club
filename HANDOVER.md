# Formal Project Handover Document | محضر الاستلام والتسليم الرسمي

**مشروع منصة نادي داتا كامب الطلابي | DataCamp Student Club Platform**  
**الجهة المستلمة:** نادي DataCamp الطلابي وإدارة جامعة الابتكار (Innovation University)  
**تاريخ التسليم:** أكتوبر 2026  
**الإصدار:** Version 1.0.0 (Production Ready)  
**حالة المشروع:** تم اجتياز كافة اختبارات الجودة (96/96 Playwright Tests Passed) بنسبة 100%

---

## 1. Overview & System Identity | نظرة عامة وبيانات النظام

تم تطوير وبناء هذه المنصة لتكون المنصة الرقمية الرسمية لنادي **DataCamp Student Club** بجامعة الابتكار، لتقديم بيئة تعليمية تفاعلية ومحطة متكاملة لإدارة الأنشطة والفعاليات والدورات والشهادات والذكاء الاصطناعي التوليدي.

### 🌐 البيئات الرسمية (Official Environments)
* **رابط الإنتاج الرسمي (Production URL):** [https://datacamp-student-club.vercel.app](https://datacamp-student-club.vercel.app)
* **منصة الاستضافة (Frontend & Serverless):** [Vercel](https://vercel.com)
* **قاعدة البيانات والتحقق (Database & Auth):** [Supabase Cloud](https://supabase.com) (PostgreSQL 15+)
* **محرك الذكاء الاصطناعي (AI Engine):** Google Gemini Models (`gemini-2.5-flash`) عبر دوال سيرفر خلفية محمية.
* **محرك تنفيذ الأكواد (Code Execution):** Pyodide (Python WebAssembly in-browser) & Piston API.

---

## 2. Deliverables Checklist | قائمة المخرجات المسلّمة

- [x] **الكود المصدري الكامل (Source Code):** مستودع Git نظيف ومبني بأحدث المعايير (React 19 + TypeScript + Vite 6 + Tailwind v4).
- [x] **قاعدة البيانات وسياسات الأمان (Database Schema & RLS):** ملف [`supabase/full_schema.sql`](supabase/full_schema.sql) لإنشاء الجداول والسياسات والأدوار بضغطة زر واحدة.
- [x] **بيانات أولية تجريبية (Seed Data):** ملف [`supabase/seed.sql`](supabase/seed.sql) يحتوي على تصنيفات ومسارات وورش عمل جاهزة.
- [x] **حزمة التوثيق الفني الشاملة (`docs/`):**
  - دليل الهيكلية البرمجية ([`docs/architecture.md`](docs/architecture.md))
  - مرجع قاعدة البيانات والأمان ([`docs/database-schema-rls.md`](docs/database-schema-rls.md))
  - مصفوفة الأدوار والصلاحيات ([`docs/roles-permissions.md`](docs/roles-permissions.md))
  - دليل النشر السحابي ([`docs/deployment-guide.md`](docs/deployment-guide.md))
  - دليل الصيانة والتشغيل الإداري ([`docs/maintenance-guide.md`](docs/maintenance-guide.md))
- [x] **حزمة الاختبارات الآلية (E2E Test Suite):** 96 اختبار جودة آلي بنظام Playwright عبر أجهزة الحاسوب، الأجهزة اللوحية، والهواتف الذكية.
- [x] **الترخيص وحقوق الملكية:** ملف [`LICENSE`](LICENSE) يضمن حقوق الملكية الحصرية للنادي والجامعة.

---

## 3. Credentials & Keys Checklist | قائمة الحسابات والمفاتيح السرية

> ⚠️ **إجراء أمني وقائي:** عملاً بأفضل ممارسات الأمن السيبراني، **لا يتم تدوين المفاتيح السرية الحقيقية نهائياً داخل هذا المستند أو داخل مستودع Git**. يوضح الجدول التالي قائمة المفاتيح المطلوبة وأماكن إدارتها وكيفية تدويرها:

| اسم المتغير (Secret Name) | الغرض والاستخدام | مكان الإعداد الآمن | آلية التدوير (Rotation) |
|---|---|---|---|
| `VITE_SUPABASE_URL` | رابط مشروع قاعدة البيانات | Vercel Environment Variables & `.env` | من لوحة Supabase Dashboard -> Settings -> API |
| `VITE_SUPABASE_ANON_KEY` | المفتاح العام المجهول لـ Supabase | Vercel Environment Variables & `.env` | من لوحة Supabase Dashboard -> Settings -> API |
| `SUPABASE_SERVICE_ROLE_KEY` | المفتاح الإداري السري للتحقق الإداري | **Vercel Serverless Only** (لا يوضع بالواجهة) | من لوحة Supabase Dashboard -> Settings -> API |
| `GEMINI_API_KEY` | مفتاح Google Gemini API للمرشد الذكي | **Vercel Serverless Only** | من لوحة [Google AI Studio](https://aistudio.google.com) |
| `VITE_SITE_URL` | النطاق المعتمد للروابط ورموز QR | Vercel Environment Variables (`https://datacamp-student-club.vercel.app`) | يعدل عند ربط نطاق مخصص جديد |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | بريد حساب Google لمزامنة Sheets | **Vercel Serverless Only** | من Google Cloud Console |
| `GOOGLE_PRIVATE_KEY` | المفتاح الخاص لمزامنة Sheets | **Vercel Serverless Only** | من Google Cloud Console |
| `GOOGLE_SPREADSHEET_OWNER_EMAIL` | بريد المالك لمجلدات الجداول | **Vercel Serverless Only** | البريد المؤسسي لنادي DataCamp |

---

## 4. Ownership Transfer Protocol | إجراءات نقل الملكية الرسمية

لنقل الملكية الكاملة للمنصة إلى الإدارة الجديدة، يُرجى اتباع الخطوات المعتمدة التالية:

### أ. نقل مشروع Vercel
1. يدخل المالك الحالي إلى [Vercel Dashboard](https://vercel.com) -> المشروع `datacamp-student-club`.
2. الانتقال إلى **Settings** -> **Transfer Project**.
3. تحديد حساب أو منظمة الإدارة الجديدة (Team / Organization).
4. بعد الموافقة، تنتقل استضافة المنصة ونطاقاتها بالكامل.

### ب. نقل منظمة Supabase
1. يدخل مسؤول قاعدة البيانات إلى [Supabase Dashboard](https://supabase.com).
2. الانتقال إلى **Organization Settings** -> **Members**.
3. إضافة البريد الإلكتروني للمسؤول التقني الجديد ودعوته برتبة `Owner`.
4. قبول الدعوة ثم حذف الحساب المؤقت السابق إن لزم الأمر.

### ج. نقل مستودع GitHub
1. الانتقال إلى إعدادات المستودع في GitHub (`Settings -> Danger Zone -> Transfer ownership`).
2. تحديد المنظمة الرسمية المستلمة (مثل `datacamp-innovation-university`).

---

## 5. Super Admin Elevation Guide | تفعيل أول حساب مسؤول فائق

لتسجيل الدخول لأول مرة وتفعيل صلاحيات المسؤول الفائق (`Super Admin`) لكامل لوحة التحكم:

1. قم بزيارة المنصة الرسمية وسجل حساباً جديداً عبر صفحة **إنشاء حساب**:
   [https://datacamp-student-club.vercel.app/register](https://datacamp-student-club.vercel.app/register)
2. افتح لوحة تحكم قاعدة البيانات في **Supabase** -> **SQL Editor**.
3. قم بتنفيذ هذا الاستعلام البرمجي المضمّن مسبقاً (استبدل البريد ببريدك المسجل):
   ```sql
   SELECT public.promote_admin_by_email('your-email@example.com');
   ```
4. أعد تسجيل الدخول في المنصة، وستظهر لك فوراً لوحة التحكم الشاملة مع كامل الصلاحيات الإدارية (`/admin`).

---

## 6. Incident Response & Emergency Contacts | خطة الطوارئ والدعم الفني

* **في حال تسريب أي مفتاح سري:**
  1. قم فوراً بزيارة المزود المعني (Supabase أو Google AI Studio).
  2. أعد توليد المفتاح (Regenerate Key).
  3. حدّث القيمة في لوحة **Vercel -> Project Settings -> Environment Variables**.
  4. اضغط **Redeploy** لآخر نسخة لتطبيق المفتاح الجديد في غضون ثوانٍ.

* **في حال حدوث خطأ في النشر (Deployment Failure):**
  1. في لوحة Vercel -> Deployments، اختر النسخة السابقة المستقرة.
  2. اضغط **Instant Rollback** لاسترجاع الموقع فوراً بدون أي توقف (Zero-Downtime Rollback).

---

## 7. Sign-Off & Acceptance | محضر الاعتماد والتسليم

| الطرف (Party) | الاسم والصفة (Name & Role) | التوقيع / الاعتماد (Status) | التاريخ (Date) |
|---|---|---|---|
| **الطرف المسلّم (Developer / Release Manager):** | Antigravity AI & Engineering Team | معتمد بالكامل (Verified) | 2026-10-11 |
| **الطرف المستلم (DataCamp Club Leadership):** | قيادة نادي DataCamp الطلابي | قيد الاعتماد الرسمي | ___________ |
| **الجهة الإشرافية (University Representative):** | إدارة جامعة الابتكار - كلية الحاسبات | قيد الاعتماد الرسمي | ___________ |
