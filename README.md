# 🚀 DataCamp Student Club Web Platform

<div align="center">

![DataCamp Banner](public/og-image.png)

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4.0-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%7C%20Auth-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-2.5_Flash-8E75B2?logo=google&logoColor=white)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**المنصة الرسمية لنادي DataCamp الطلابي بجامعة الابتكار**  
*The Official Interactive Platform for DataCamp Student Club at Innovation University*

[🌐 Live Demo](#-deployment) • [✨ Key Features](#-features) • [🛠️ Tech Stack](#-tech-stack) • [🚀 Quick Start](#-getting-started)

</div>

---

## 🌟 Overview | نبذة عن المشروع

منصة تفاعلية متكاملة تجمع بين التعليم العملي، الذكاء الاصطناعي التوليدي، وتلعيب مسارات التعلم (Gamification) لتمكين طلبة علوم البيانات والذكاء الاصطناعي من بناء وتطوير مهاراتهم البرمجية والمهنية.

A production-grade, full-stack educational portal empowering students in Data Science, Machine Learning, and Artificial Intelligence with real-time AI mentoring, interactive code playgrounds, course management, and cryptographic certificate verification.

---

## ✨ Features | أهم المميزات

### 🤖 1. NEXUS AI Mentor (المرشد الذكي المدعوم بالذكاء الاصطناعي)
- **RAG-Powered Intelligence**: يربط سياق قاعدة البيانات الحية (Firestore) مباشرة مع نماذج Google Gemini Flash.
- **Fluent Bilingual Guidance**: يقدم استشارات برمجية وشروحات باللغة العربية الفصحى المعاصرة مع كتابة الأكواد باللغة الإنجليزية وتنسيق دقيق.
- **Interactive Code Blocks**: دعم تلوين الكود البرمجي مع زر نسخ مباشر وأدوات لاقتراح المسارات الدراسية المناسبة.
- **Resilient Fallback**: نظام احتياطي ذكي هجين يعمل حتى دون اتصال لضمان توفر الإجابات دائماً.

### 💻 2. Multi-Language Online Compiler (محرر ومترجم الأكواد المتكامل)
- تشغيل بايثون مباشرة في المتصفح باستخدام **Pyodide (WebAssembly)** بدون الحاجة لأي خادم.
- دعم لغات برمجية متعددة (Python, JavaScript, TypeScript, SQL, C++, Java) عبر محرك تنفيذ آمن.
- قياس زمن التنفيذ وعرض مخرجات الأخطاء وتجربة مكتبات البيانات (NumPy, Pandas, Matplotlib).

### 🎮 3. Gamification & XP System (نظام التلعيب والمكافآت)
- نظام رتب ومستويات (Recruit, Explorer, Specialist, Master, Legend).
- لوحة متصدرين حية (Leaderboard) تعرض أداء وتنافس طلاب الكليات والجامعة.
- شارات وإنجازات تلقائية تمنح عند إتمام المهام والاختبارات والمشاريع.

### 📚 4. Course Catalog & Interactive Quizzes (الدورات والاختبارات)
- مسارات تعليمية منظمة: بايثون، علم البيانات، تعلم الآلة، التعلم العميق، قواعد البيانات وPower BI.
- نظام اختبارات تفاعلي بحساب فوري للنقاط ومنح الشهادات.

### 🏅 5. Cryptographic Verification Certificates (الشهادات المعتمدة)
- توليد شهادات تخرج وإتمام بصيغة PDF وطباعة عالية الجودة.
- رمز تحقق فريد (Verification Code) مع باركود QR للتحقق السريع من صحة الشهادة.

### 🛡️ 6. Full Admin Dashboard (لوحة إدارة متكاملة)
- إدارة الأعضاء، الصلاحيات، النقاط، الدورات، الفعاليات، المعرض، والمدونة.
- تدقيق أمني متكامل وامتثال لقواعد أمان Firestore.

### 🌐 7. Complete Bilingual Interface (عربي / إنجليزي)
- دعم كامل لتغيير اللغة الفوري مع اتجاه النص المناسب (RTL / LTR) لكافة عناصر الواجهة.

---

## 🛠️ Tech Stack | التقنيات المستخدمة

- **Frontend Core**: React 19, TypeScript, Vite 6
- **Styling & UI**: Tailwind CSS 4, Motion (Framer Motion), Lucide React
- **Backend & Cloud**: Firebase Authentication, Cloud Firestore, Firebase Storage
- **Generative AI**: Google Gemini API (`gemini-2.5-flash`, `gemini-3.5-flash`, `gemini-3.8-flash`) via REST & `@google/genai`
- **Compiler Engines**: Pyodide (WASM Python in browser) & Piston Execution API
- **Exporting**: jsPDF, html2canvas, QRCode.react

---

## 🚀 Getting Started | التشغيل المحلي

### المتطلبات الأساسية (Prerequisites)
- [Node.js](https://nodejs.org/) (Version 18 or newer)
- npm or pnpm

### خطوات التثبيت (Installation)

1. **استنساخ المستودع (Clone repository):**
   ```bash
   git clone https://github.com/a-2m-a-r7/datacamp-student-club.git
   cd datacamp-student-club
   ```

2. **تثبيت الحزم (Install dependencies):**
   ```bash
   npm install
   ```

3. **إعداد المتغيرات البيئية (Environment Variables):**
   انسخ ملف `.env.example` إلى `.env`:
   ```bash
   cp .env.example .env
   ```
   أضف مفتاح Gemini API الخاص بك (اختياري، يوجد مفتاح افتراضي يعمل مباشرة):
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **تشغيل خادم التطوير (Run Dev Server):**
   ```bash
   npm run dev
   ```
   افتح المتصفح على: `http://localhost:3000` أو `http://localhost:5173`.

5. **بناء النسخة النهائية (Build for Production):**
   ```bash
   npm run build
   ```

---

## 🌐 Deployment | النشر

المشروع جاهز ومُهيّأ بالكامل للنشر على **Vercel**:
- يتضمن ملف `vercel.json` لإعادة توجيه المسارات وحماية الرؤوس الأمنية (Security Headers).
- يُبنى تلقائياً عبر `npm run build` وتكون المخرجات في مجلد `dist/`.

---

## 📄 License | الترخيص

هذا المشروع مرخص تحت رخصة **MIT**. لمزيد من التفاصيل، يرجى مراجعة ملف [LICENSE](LICENSE).

---

<div align="center">

Made with ❤️ for **DataCamp Student Club**  
*Innovation University*

</div>
