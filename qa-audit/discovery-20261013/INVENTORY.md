# Phase 1 discovery — 13 October 2026

This is static discovery only. No browser tests, service requests, credentials, data creation, or pass/fail judgments. Existing historical audit files are not evidence for this run. Every row below is a source declaration, not a count of rendered instances: mapped controls must be expanded for every fixture in Phase 2. Shared components inherit access from their callers. Labels are source expressions when runtime labels depend on language/data. Source wiring describes current behavior, not an assumed product requirement.

## Stack and access

React 19 / TypeScript / Vite 6 / React Router 7; Tailwind 4, Motion, Radix. Supabase Auth, PostgreSQL RLS, Storage and realtime. Vercel functions: /api/admin/users, /api/ai/chat, /api/forms/sync-sheet. Google OAuth, Gemini, Google Sheets, Python/browser and universal code runners, html5-qrcode, qrcode.react, SheetJS, jsPDF and html2canvas. Vite alone does not serve the Vercel functions.

AuthContext normalizes members and super admins; isAdmin/isHR/isEditor/isManager and other manager flags currently alias isSuperAdmin. RoleGuard names do not establish distinct active HR/editor roles. ProtectedRoute requires user and profile. ManagerRoute also requires verified email. Maintenance mode changes reachability. Public certificate routes contain conditional user functionality. Public forms have their own layout and configured login/response constraints. Database migration files are declarations; deployed RLS remains unverified.

## Route declarations

App paths are top-level. AdminDashboard paths are relative to /admin; FormManagement paths are relative to /admin/forms. Wildcards are router containers/fallbacks, not additional pages. GuestRoute login/register/forgot-password redirects authenticated sessions. Auth callback/reset/verification pages require appropriate tokens/session fixtures.

| Router file / line | Path | First wrapper or component |
|---|---|---|
| src/App.tsx:160 | "/f/:slug" | PublicFormView |
| src/App.tsx:161 | "*" | NotFound |
| src/App.tsx:217 | "/" | Home |
| src/App.tsx:218 | "/courses" | Courses |
| src/App.tsx:219 | "/my-courses" | ProtectedRoute |
| src/App.tsx:224 | "/courses/:slug" | CourseDetail |
| src/App.tsx:225 | "/courses/:slug/learn" | ProtectedRoute |
| src/App.tsx:230 | "/courses/:slug/quiz" | ProtectedRoute |
| src/App.tsx:235 | "/courses/:slug/quiz/:lessonId" | ProtectedRoute |
| src/App.tsx:240 | "/certificates" | Certificates |
| src/App.tsx:241 | "/verify-certificate" | Certificates |
| src/App.tsx:242 | "/verify-certificate/:code" | Certificates |
| src/App.tsx:243 | "/notifications" | ProtectedRoute |
| src/App.tsx:248 | "/leaderboard" | Leaderboard |
| src/App.tsx:249 | "/compiler" | CompilerPlayground |
| src/App.tsx:250 | "/about" | About |
| src/App.tsx:251 | "/projects" | Projects |
| src/App.tsx:252 | "/events" | Events |
| src/App.tsx:253 | "/blog" | Blog |
| src/App.tsx:254 | "/staff" | Staff |
| src/App.tsx:255 | "/gallery" | Gallery |
| src/App.tsx:256 | "/contact" | Contact |
| src/App.tsx:257 | "/faq" | FAQ |
| src/App.tsx:258 | "/privacy" | Privacy |
| src/App.tsx:259 | "/terms" | Terms |
| src/App.tsx:260 | "/login" | GuestRoute |
| src/App.tsx:265 | "/register" | GuestRoute |
| src/App.tsx:270 | "/forgot-password" | GuestRoute |
| src/App.tsx:275 | "/reset-password" | ResetPassword |
| src/App.tsx:276 | "/verify-email" | VerifyEmail |
| src/App.tsx:277 | "/auth/callback" | AuthCallback |
| src/App.tsx:278 | "/dashboard" | ProtectedRoute |
| src/App.tsx:283 | "/profile" | ProtectedRoute |
| src/App.tsx:288 | "/admin/*" | ManagerRoute |
| src/App.tsx:293 | "*" | NotFound |
| src/pages/AdminDashboard.tsx:57 | "/" | Overview |
| src/pages/AdminDashboard.tsx:59 | "/users" | RoleGuard |
| src/pages/AdminDashboard.tsx:65 | "/events" | RoleGuard |
| src/pages/AdminDashboard.tsx:71 | "/staff" | RoleGuard |
| src/pages/AdminDashboard.tsx:77 | "/gallery" | RoleGuard |
| src/pages/AdminDashboard.tsx:83 | "/content" | RoleGuard |
| src/pages/AdminDashboard.tsx:89 | "/projects" | RoleGuard |
| src/pages/AdminDashboard.tsx:95 | "/blog" | RoleGuard |
| src/pages/AdminDashboard.tsx:101 | "/messages" | RoleGuard |
| src/pages/AdminDashboard.tsx:107 | "/courses" | RoleGuard |
| src/pages/AdminDashboard.tsx:113 | "/points" | RoleGuard |
| src/pages/AdminDashboard.tsx:119 | "/forms/*" | RoleGuard |
| src/pages/AdminDashboard.tsx:125 | "/security" | RoleGuard |
| src/pages/AdminDashboard.tsx:131 | "/settings" | RoleGuard |
| src/pages/admin/forms/FormManagement.tsx:15 | "/" | FormList |
| src/pages/admin/forms/FormManagement.tsx:16 | "/new" | FormBuilder |
| src/pages/admin/forms/FormManagement.tsx:17 | "/builder/:id" | FormBuilder |
| src/pages/admin/forms/FormManagement.tsx:18 | "/:id/responses" | FormResponses |

## Tabs and runtime expansions

Certificates: my_certs / verify. Admin users: users / matrix. Role editor: roles / permissions. Content management: home / about (expand mapped page definitions). Form responses: summary / individual. Course, event, project, blog, gallery, staff, notification, enrollment, compiler language and form-status filters/pickers are included below with their map expressions. Expand all mapped arrays, dynamic database rows, question types, option lists and modal states in the approved fixture environment. Form builder new and edit share a component but require separate scenarios.

## Needed inputs and approval gate

1. Explicit approval to begin Phase 2.
2. Confirm local/staging URL and that its Supabase database/storage, Vercel APIs, OAuth callbacks and Google Sheets are isolated from production. No .env values were read or printed.
3. QA_TEST member and verified super-admin accounts, plus a mailbox/recovery/OAuth account; configure credentials privately, not in committed scripts/reports.
4. Read-only staging database verification access/session and fixture IDs for published courses/lessons/quizzes, certificates, events/registrations and forms covering each question type; clarify cleanup method for QA_TEST records.
5. Clarify intended targets/actions for any ambiguous or handler-less controls below. Confirm QR contracts: certificate/form QR URLs; member QR memberId and event QR registration payloads are identifiers, not necessarily URLs.
6. Confirm permitted disposable email sends, Google sign-in, test Sheets sync/sharing, camera scanning and external AI requests. These integrations may create external artifacts and need dedicated test resources.

## Static review candidates (not runtime failures)

- src/pages/About.tsx:179: no local click handler/type; inspect enclosing link/form before classifying
- src/pages/About.tsx:185: no local click handler/type; inspect enclosing link/form before classifying
- src/pages/About.tsx:374: no local click handler/type; inspect enclosing link/form before classifying
- src/pages/About.tsx:380: no local click handler/type; inspect enclosing link/form before classifying
- src/pages/Blog.tsx:223: no local click handler/type; inspect enclosing link/form before classifying
- src/pages/Blog.tsx:296: no local click handler/type; inspect enclosing link/form before classifying
- src/pages/Blog.tsx:302: no local click handler/type; inspect enclosing link/form before classifying
- src/pages/Certificates.tsx:188: no local click handler/type; inspect enclosing link/form before classifying
- src/pages/Contact.tsx:220: no local click handler/type; inspect enclosing link/form before classifying
- src/pages/Contact.tsx:226: no local click handler/type; inspect enclosing link/form before classifying
- src/pages/CourseDetail.tsx:220: no local click handler/type; inspect enclosing link/form before classifying
- src/pages/CourseDetail.tsx:243: no local click handler/type; inspect enclosing link/form before classifying
- src/pages/CourseDetail.tsx:366: no local click handler/type; inspect enclosing link/form before classifying
- src/pages/CourseLearning.tsx:232: no local click handler/type; inspect enclosing link/form before classifying
- src/pages/CourseLearning.tsx:237: no local click handler/type; inspect enclosing link/form before classifying
- src/pages/Courses.tsx:157: no local click handler/type; inspect enclosing link/form before classifying
- src/pages/Courses.tsx:347: no local click handler/type; inspect enclosing link/form before classifying
- src/pages/Courses.tsx:359: no local click handler/type; inspect enclosing link/form before classifying
- src/pages/Courses.tsx:380: no local click handler/type; inspect enclosing link/form before classifying
- src/pages/Dashboard.tsx:89: no local click handler/type; inspect enclosing link/form before classifying
- src/pages/Dashboard.tsx:175: no local click handler/type; inspect enclosing link/form before classifying
- src/pages/Dashboard.tsx:238: no local click handler/type; inspect enclosing link/form before classifying
- src/pages/Dashboard.tsx:251: no local click handler/type; inspect enclosing link/form before classifying
- src/pages/Dashboard.tsx:282: no local click handler/type; inspect enclosing link/form before classifying
- src/pages/Dashboard.tsx:398: no local click handler/type; inspect enclosing link/form before classifying
- src/pages/Dashboard.tsx:502: no local click handler/type; inspect enclosing link/form before classifying
- src/pages/Dashboard.tsx:509: no local click handler/type; inspect enclosing link/form before classifying
- src/pages/Events.tsx:155: no local click handler/type; inspect enclosing link/form before classifying
- src/pages/Events.tsx:191: no local click handler/type; inspect enclosing link/form before classifying
- src/pages/FAQ.tsx:206: no local click handler/type; inspect enclosing link/form before classifying
- src/pages/FAQ.tsx:274: no local click handler/type; inspect enclosing link/form before classifying
- src/pages/FAQ.tsx:279: no local click handler/type; inspect enclosing link/form before classifying
- src/pages/Home.tsx:140: no local click handler/type; inspect enclosing link/form before classifying
- src/pages/Home.tsx:146: no local click handler/type; inspect enclosing link/form before classifying
- src/pages/Home.tsx:151: no local click handler/type; inspect enclosing link/form before classifying
- src/pages/Home.tsx:158: no local click handler/type; inspect enclosing link/form before classifying
- src/pages/Home.tsx:264: no local click handler/type; inspect enclosing link/form before classifying
- src/pages/MyCourses.tsx:127: no local click handler/type; inspect enclosing link/form before classifying
- src/pages/Notifications.tsx:196: no local click handler/type; inspect enclosing link/form before classifying
- src/pages/Projects.tsx:361: no local click handler/type; inspect enclosing link/form before classifying
- src/pages/Projects.tsx:422: no local click handler/type; inspect enclosing link/form before classifying
- src/pages/Projects.tsx:430: no local click handler/type; inspect enclosing link/form before classifying
- src/pages/Staff.tsx:282: no local click handler/type; inspect enclosing link/form before classifying
- src/pages/Staff.tsx:353: no local click handler/type; inspect enclosing link/form before classifying
- src/pages/VerifyEmail.tsx:104: no local click handler/type; inspect enclosing link/form before classifying
- src/pages/VerifyEmail.tsx:111: no local click handler/type; inspect enclosing link/form before classifying
- src/pages/VerifyEmail.tsx:119: no local click handler/type; inspect enclosing link/form before classifying
- src/pages/VerifyEmail.tsx:124: no local click handler/type; inspect enclosing link/form before classifying
- src/pages/admin/BlogManagement.tsx:120: no local click handler/type; inspect enclosing link/form before classifying
- src/pages/admin/EventManagement.tsx:273: no local click handler/type; inspect enclosing link/form before classifying
- src/pages/admin/Security.tsx:141: no local click handler/type; inspect enclosing link/form before classifying
- src/pages/admin/Settings.tsx:242: no local click handler/type; inspect enclosing link/form before classifying
- src/pages/admin/Settings.tsx:246: no local click handler/type; inspect enclosing link/form before classifying
- src/pages/admin/forms/FormBuilder.tsx:619: constant disabled; clarify whether intentional preview
- src/pages/admin/forms/FormBuilder.tsx:627: constant disabled; clarify whether intentional preview
- src/pages/admin/forms/FormBuilder.tsx:650: constant disabled; clarify whether intentional preview

Search scope also covers TODO/console.log, disabled expressions and event attributes through source review. Missing local handlers alone are not defects: enclosing Link/form and component forwarding can provide behavior. Compiler console.log in starter code is intentional output, not a console-only UI handler.

## Per-element inventory

685 source control declarations across 64 source files. All statuses: Not tested. No elements have been marked working. Each source locator is a starting selector; real browser selectors will be established after approval.

### src/App.tsx — public / conditional / shared

| ID | Element / label expression | Selector / source | Source-declared action (expected behavior pending confirmation) | Wiring / conditions | Status |
|---|---|---|---|---|---|
| E0001 | <Menu className="w-6 h-6" /> | button; src/App.tsx:186 | Trigger {() => setSidebarOpen(true)} | onClick={() => setSidebarOpen(true)} | Not tested |

### src/components/AIMentor/AIMentorButton.tsx — public / conditional / shared

| ID | Element / label expression | Selector / source | Source-declared action (expected behavior pending confirmation) | Wiring / conditions | Status |
|---|---|---|---|---|---|
| E0002 | {isArabic ? 'فتح مرشد الذكاء الاصطناعي NEXUS' : 'Open AI Mentor'} | motion.button; src/components/AIMentor/AIMentorButton.tsx:27 | Trigger {() => setIsOpen(true)} | onClick={() => setIsOpen(true)}; aria-label={isArabic ? 'فتح مرشد الذكاء الاصطناعي NEXUS' : 'Open AI Mentor'} | Not tested |
| E0003 | AIMentorModal | AIMentorModal; src/components/AIMentor/AIMentorButton.tsx:42 | Needs clarification: inspect enclosing link/form or component caller | onClose={() => setIsOpen(false)} | Not tested |

### src/components/AIMentor/AIMentorModal.tsx — public / conditional / shared

| ID | Element / label expression | Selector / source | Source-declared action (expected behavior pending confirmation) | Wiring / conditions | Status |
|---|---|---|---|---|---|
| E0004 | "Copy code" | button; src/components/AIMentor/AIMentorModal.tsx:53 | Trigger {handleCopy} | onClick={handleCopy} | Not tested |
| E0005 | {isArabic ? 'محادثة جديدة' : 'Start new conversation'} | button; src/components/AIMentor/AIMentorModal.tsx:382 | Trigger {handleNewChat} | onClick={handleNewChat} | Not tested |
| E0006 | {isArabic ? 'تحديث سياق قاعدة البيانات' : 'Refresh database context'} | button; src/components/AIMentor/AIMentorModal.tsx:389 | Trigger {handleRefreshContext} | onClick={handleRefreshContext} | Not tested |
| E0007 | {isArabic ? 'تهيئة مفتاح Gemini API' : 'Configure Gemini API Key'} | button; src/components/AIMentor/AIMentorModal.tsx:396 | Trigger {() => setShowApiKeyInput(!showApiKeyInput)} | onClick={() => setShowApiKeyInput(!showApiKeyInput)} | Not tested |
| E0008 | {isArabic ? 'إغلاق' : 'Close'} | button; src/components/AIMentor/AIMentorModal.tsx:403 | Trigger {onClose} | onClick={onClose}; aria-label={isArabic ? 'إغلاق' : 'Close'} | Not tested |
| E0009 | {isArabic ? 'الصق مفتاح Google Gemini API هنا...' : 'Paste your Gemini API Key here...'} | Input; src/components/AIMentor/AIMentorModal.tsx:423 | Update via {e => setApiKey(e.target.value)} | type="password"; value={apiKey}; onChange={e => setApiKey(e.target.value)} | Not tested |
| E0010 | {isArabic ? 'حفظ المفتاح' : 'Save Key'} | Button; src/components/AIMentor/AIMentorModal.tsx:431 | Trigger {handleSaveApiKey} | onClick={handleSaveApiKey}; disabled={!apiKey.trim()} | Not tested |
| E0011 | Google AI Studio | a; src/components/AIMentor/AIMentorModal.tsx:442 | Open "https://aistudio.google.com/apikey" | href="https://aistudio.google.com/apikey" | Not tested |
| E0012 | Google AI Studio | a; src/components/AIMentor/AIMentorModal.tsx:444 | Open "https://aistudio.google.com/apikey" | href="https://aistudio.google.com/apikey" | Not tested |
| E0013 | {isArabic ? 'ربط المفتاح' : 'Connect Key'} | button; src/components/AIMentor/AIMentorModal.tsx:462 | Trigger {() => setShowApiKeyInput(true)} | onClick={() => setShowApiKeyInput(true)} | Not tested |
| E0014 | <span>{act.label}</span> | button; src/components/AIMentor/AIMentorModal.tsx:496 | Trigger {() => handleActionClick(act)} | onClick={() => handleActionClick(act)} | Not tested |
| E0015 | <Input value={input} onChange={e => setInput(e.target.value)} placeholder={isArabic ? 'اسأل NEXUS عن الدورات، الأكواد، الفعاليات، أو خطة تعلمك...' : 'Ask NEXUS about courses, code snippets, events, or learning paths...'} className | form; src/components/AIMentor/AIMentorModal.tsx:536 | Submit via {e => { e.preventDefault(); handleSend(); }} | onSubmit={e => { e.preventDefault(); handleSend(); }} | Not tested |
| E0016 | {isArabic ? 'اسأل NEXUS عن الدورات، الأكواد، الفعاليات، أو خطة تعلمك...' : 'Ask NEXUS about courses, code snippets, events, or learning paths...'} | Input; src/components/AIMentor/AIMentorModal.tsx:543 | Update via {e => setInput(e.target.value)} | value={input}; onChange={e => setInput(e.target.value)} | Not tested |
| E0017 | <Send className="w-4 h-4 mr-1 rtl:rotate-180" /> <span className="hidden sm:inline">{isArabic ? 'إرسال' : 'Send'}</span> | Button; src/components/AIMentor/AIMentorModal.tsx:550 | Submit enclosing form | type="submit"; disabled={!input.trim() \|\| isTyping} | Not tested |

### src/components/CertificateView.tsx — public / conditional / shared

| ID | Element / label expression | Selector / source | Source-declared action (expected behavior pending confirmation) | Wiring / conditions | Status |
|---|---|---|---|---|---|
| E0018 | <QRCodeCanvas ref={hiddenQrCanvasRef} value={verificationUrl} size={300} level="H" bgColor="#FFFFFF" fgColor="#000000" /> | QRCodeCanvas; src/components/CertificateView.tsx:766 | Render QR encoding {verificationUrl} | value={verificationUrl} | Not tested |
| E0019 | <Share2 className="w-3.5 h-3.5 mr-1 rtl:mr-0 rtl:ml-1" /> {isArabic ? 'مشاركة الرابط' : 'SHARE LINK'} | Button; src/components/CertificateView.tsx:824 | Trigger {handleCopyLink} | onClick={handleCopyLink} | Not tested |
| E0020 | <ExternalLink className="w-3.5 h-3.5 mr-1 rtl:mr-0 rtl:ml-1" /> LINKEDIN | Button; src/components/CertificateView.tsx:833 | Trigger {handleShareLinkedIn} | onClick={handleShareLinkedIn} | Not tested |
| E0021 | <Printer className="w-3.5 h-3.5 mr-1 rtl:mr-0 rtl:ml-1" /> {isArabic ? 'طباعة رسمية' : 'PRINT DOCUMENT'} | Button; src/components/CertificateView.tsx:842 | Trigger {handlePrint} | onClick={handlePrint} | Not tested |
| E0022 | <Eye className="w-3.5 h-3.5 mr-1 rtl:mr-0 rtl:ml-1" /> {isArabic ? 'معاينة وفتح' : 'PREVIEW & OPEN'} | Button; src/components/CertificateView.tsx:851 | Trigger {handlePreviewFullSize} | onClick={handlePreviewFullSize}; disabled={downloading} | Not tested |
| E0023 | <Download className="w-3.5 h-3.5 mr-1 rtl:mr-0 rtl:ml-1" /> {isArabic ? 'تنزيل صورة PNG' : 'PNG IMAGE'} | Button; src/components/CertificateView.tsx:861 | Trigger {handleDownloadPNG} | onClick={handleDownloadPNG}; disabled={downloading} | Not tested |
| E0024 | <FileText className="w-3.5 h-3.5 mr-1 rtl:mr-0 rtl:ml-1" /> {downloading ? (isArabic ? 'جاري التحميل...' : 'EXPORTING...') : (isArabic ? 'تنزيل PDF' : 'DOWNLOAD PDF')} | Button; src/components/CertificateView.tsx:871 | Trigger {handleDownloadPDF} | onClick={handleDownloadPDF}; disabled={downloading} | Not tested |
| E0025 | <QRCodeSVG value={verificationUrl} size={65} level="M" /> | QRCodeSVG; src/components/CertificateView.tsx:1017 | Render QR encoding {verificationUrl} | value={verificationUrl} | Not tested |

### src/components/Compiler/CodeExerciseRunner.tsx — public / conditional / shared

| ID | Element / label expression | Selector / source | Source-declared action (expected behavior pending confirmation) | Wiring / conditions | Status |
|---|---|---|---|---|---|
| E0026 | "Reset starter code" | button; src/components/Compiler/CodeExerciseRunner.tsx:147 | Trigger {handleReset} | onClick={handleReset} | Not tested |
| E0027 | "# Write your Python solution here..." | textarea; src/components/Compiler/CodeExerciseRunner.tsx:157 | Update via {e => setCode(e.target.value)} | value={code}; onChange={e => setCode(e.target.value)} | Not tested |
| E0028 | <Bot className="w-3.5 h-3.5 text-primary" /> <span>HINT FROM NEXUS AI</span> | Button; src/components/Compiler/CodeExerciseRunner.tsx:232 | Trigger {() => onAskAI(code)} | type="button"; onClick={() => onAskAI(code)} | Not tested |
| E0029 | <Play className="w-3.5 h-3.5" /> <span>RUN_CODE</span> | Button; src/components/Compiler/CodeExerciseRunner.tsx:245 | Trigger {handleRun} | type="button"; onClick={handleRun}; disabled={isRunning \|\| isVerifying} | Not tested |
| E0030 | <Check className="w-3.5 h-3.5" /> <span>{isCompleted ? 'CHALLENGE_SOLVED' : 'SUBMIT_SOLUTION'}</span> | Button; src/components/Compiler/CodeExerciseRunner.tsx:256 | Trigger {handleVerify} | type="button"; onClick={handleVerify}; disabled={isRunning \|\| isVerifying \|\| isCompleted} | Not tested |

### src/components/ErrorBoundary.tsx — public / conditional / shared

| ID | Element / label expression | Selector / source | Source-declared action (expected behavior pending confirmation) | Wiring / conditions | Status |
|---|---|---|---|---|---|
| E0031 | REBOOT_SYSTEM | Button; src/components/ErrorBoundary.tsx:49 | Trigger {() => window.location.reload()} | onClick={() => window.location.reload()} | Not tested |
| E0032 | ABORT_TO_HOME | Button; src/components/ErrorBoundary.tsx:55 | Trigger {() => window.location.href = '/'} | onClick={() => window.location.href = '/'} | Not tested |

### src/components/Footer.tsx — public / conditional / shared

| ID | Element / label expression | Selector / source | Source-declared action (expected behavior pending confirmation) | Wiring / conditions | Status |
|---|---|---|---|---|---|
| E0033 | <Logo iconSize={42} /> | Link; src/components/Footer.tsx:42 | Navigate to "/" | to="/" | Not tested |
| E0034 | {`DataCamp Student Club on ${platformName}`} | a; src/components/Footer.tsx:61 | Open {link.url} | href={link.url}; aria-label={`DataCamp Student Club on ${platformName}`} | Not tested |
| E0035 | {t('nav.about', 'About Us')} | Link; src/components/Footer.tsx:83 | Navigate to "/about" | to="/about" | Not tested |
| E0036 | {t('nav.courses', 'Courses')} | Link; src/components/Footer.tsx:84 | Navigate to "/courses" | to="/courses" | Not tested |
| E0037 | {t('nav.events', 'Events')} | Link; src/components/Footer.tsx:85 | Navigate to "/events" | to="/events" | Not tested |
| E0038 | {t('nav.projects', 'Projects')} | Link; src/components/Footer.tsx:86 | Navigate to "/projects" | to="/projects" | Not tested |
| E0039 | {t('nav.blog', 'Blog')} | Link; src/components/Footer.tsx:87 | Navigate to "/blog" | to="/blog" | Not tested |
| E0040 | {t('nav.staff', 'Staff')} | Link; src/components/Footer.tsx:88 | Navigate to "/staff" | to="/staff" | Not tested |
| E0041 | {t('nav.gallery', 'Gallery')} | Link; src/components/Footer.tsx:89 | Navigate to "/gallery" | to="/gallery" | Not tested |
| E0042 | {t('nav.faq', 'FAQ')} | Link; src/components/Footer.tsx:98 | Navigate to "/faq" | to="/faq" | Not tested |
| E0043 | {t('nav.contact', 'Contact Us')} | Link; src/components/Footer.tsx:99 | Navigate to "/contact" | to="/contact" | Not tested |
| E0044 | {isArabic ? 'سياسة الخصوصية' : 'Privacy Policy'} | Link; src/components/Footer.tsx:100 | Navigate to "/privacy" | to="/privacy" | Not tested |
| E0045 | {isArabic ? 'الشروط والأحكام' : 'Terms of Service'} | Link; src/components/Footer.tsx:101 | Navigate to "/terms" | to="/terms" | Not tested |

### src/components/GoogleAccountModal.tsx — public / conditional / shared

| ID | Element / label expression | Selector / source | Source-declared action (expected behavior pending confirmation) | Wiring / conditions | Status |
|---|---|---|---|---|---|
| E0046 | <X className="w-5 h-5" /> | button; src/components/GoogleAccountModal.tsx:136 | Trigger {onClose} | onClick={onClose} | Not tested |
| E0047 | <div className="flex items-center gap-3"> <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-bold text-sm shrink-0"> <Crown className="w-5 h-5 tex | button; src/components/GoogleAccountModal.tsx:147 | Trigger {handleSelectAdmin} | type="button"; disabled={!!loadingAction}; onClick={handleSelectAdmin} | Not tested |
| E0048 | <div className="flex items-center gap-3"> <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-bold text-sm shrink-0"> <GraduationCap className="w-5 h-5 t | button; src/components/GoogleAccountModal.tsx:173 | Trigger {handleSelectMember} | type="button"; disabled={!!loadingAction}; onClick={handleSelectMember} | Not tested |
| E0049 | <div className="flex items-center gap-3"> <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-muted-foreground shrink-0"> <User className="w-5 h-5 text-white/80" /> </div> <div> <div className= | button; src/components/GoogleAccountModal.tsx:200 | Trigger {() => setShowCustomForm(true)} | type="button"; onClick={() => setShowCustomForm(true)} | Not tested |
| E0050 | <div className="flex items-center justify-between"> <span className="text-xs font-cyber text-primary font-bold"> {isArabic ? 'بيانات حساب Google المخصص:' : 'CUSTOM_GOOGLE_ACCOUNT'} </span> <button type="button" onClick={() => setS | motion.form; src/components/GoogleAccountModal.tsx:221 | Submit via {handleCustomAccountSubmit} | onSubmit={handleCustomAccountSubmit} | Not tested |
| E0051 | {isArabic ? 'إلغاء' : 'Cancel'} | button; src/components/GoogleAccountModal.tsx:231 | Trigger {() => setShowCustomForm(false)} | type="button"; onClick={() => setShowCustomForm(false)} | Not tested |
| E0052 | {isArabic ? 'الاسم بالكامل (مثال: عمر طارق)' : 'Full Name (e.g. Omar Tarek)'} | Input; src/components/GoogleAccountModal.tsx:242 | Update via {e => setCustomName(e.target.value)} | type="text"; value={customName}; onChange={e => setCustomName(e.target.value)} | Not tested |
| E0053 | {isArabic ? 'بريد Google (مثال: user@gmail.com)' : 'Google email (e.g. user@gmail.com)'} | Input; src/components/GoogleAccountModal.tsx:252 | Update via {e => setCustomEmail(e.target.value)} | type="email"; value={customEmail}; onChange={e => setCustomEmail(e.target.value)}; required=true | Not tested |
| E0054 | {loadingAction === 'custom' ? (isArabic ? 'جاري تهيئة الحساب...' : 'CONNECTING...') : (isArabic ? 'المتابعة وحفظ العضوية في السحابة ⚡' : 'CONTINUE & REGISTER IN CLOUD ⚡')} | Button; src/components/GoogleAccountModal.tsx:262 | Submit enclosing form | type="submit"; disabled={loadingAction === 'custom'} | Not tested |
| E0055 | <GoogleIcon /> <span> {loadingAction === 'popup' ? (isArabic ? 'جاري فتح نافذة Google...' : 'OPENING GOOGLE POPUP...') : (isArabic ? 'فتح نافذة تسجيل الدخول الرسمية من Google' : 'OPEN OFFICIAL GOOGLE POPUP')} </span> | Button; src/components/GoogleAccountModal.tsx:277 | Trigger {handleOfficialPopup} | type="button"; disabled={loadingAction === 'popup'}; onClick={handleOfficialPopup} | Not tested |

### src/components/ImagePicker.tsx — public / conditional / shared

| ID | Element / label expression | Selector / source | Source-declared action (expected behavior pending confirmation) | Wiring / conditions | Status |
|---|---|---|---|---|---|
| E0056 | <X className="w-5 h-5" /> | Button; src/components/ImagePicker.tsx:48 | Trigger {() => onImageSelected('')} | onClick={() => onImageSelected('')} | Not tested |
| E0057 | <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} /> <Button variant="outline" size="sm" className="justify-start" onClick={triggerUpload}> <Upload className="w-4 h-4 mr-2" /> IM | input; src/components/ImagePicker.tsx:60 | Update via {handleFileChange} | type="file"; accept="image/*"; onChange={handleFileChange} | Not tested |
| E0058 | <Upload className="w-4 h-4 mr-2" /> IMPORT_FROM_DEVICE | Button; src/components/ImagePicker.tsx:68 | Trigger {triggerUpload} | onClick={triggerUpload} | Not tested |
| E0059 | <ImageIcon className="w-4 h-4 mr-2" /> SELECT_PHOTO_ARCHIVE | Button; src/components/ImagePicker.tsx:73 | Trigger {() => { // Simulate camera/select photo const url = prompt('Enter Image URL (Simulating Select Photo):'); if (url) onImageSelected(url); }} | onClick={() => { // Simulate camera/select photo const url = prompt('Enter Image URL (Simulating Select Photo):'); if (url) onImageSelected(url); }} | Not tested |
| E0060 | <Camera className="w-4 h-4 mr-2" /> TAKE_PHOTO_LIVE | Button; src/components/ImagePicker.tsx:82 | Trigger {() => { alert('Camera access requested... (Simulated)'); }} | onClick={() => { alert('Camera access requested... (Simulated)'); }} | Not tested |

### src/components/LanguageSwitcher.tsx — public / conditional / shared

| ID | Element / label expression | Selector / source | Source-declared action (expected behavior pending confirmation) | Wiring / conditions | Status |
|---|---|---|---|---|---|
| E0061 | {isArabic ? 'Switch to English' : 'التحويل إلى العربية'} | button; src/components/LanguageSwitcher.tsx:22 | Trigger {toggleLanguage} | onClick={toggleLanguage} | Not tested |
| E0062 | <span>العربية</span> | button; src/components/LanguageSwitcher.tsx:34 | Trigger {() => setLanguage('ar')} | type="button"; onClick={() => setLanguage('ar')} | Not tested |
| E0063 | <span className="font-cyber">English</span> | button; src/components/LanguageSwitcher.tsx:45 | Trigger {() => setLanguage('en')} | type="button"; onClick={() => setLanguage('en')} | Not tested |
| E0064 | {isArabic ? 'Switch to English' : 'التحويل إلى العربية'} | button; src/components/LanguageSwitcher.tsx:62 | Trigger {toggleLanguage} | onClick={toggleLanguage} | Not tested |
| E0065 | {isArabic && ( <motion.div layoutId="lang-active-pill" className="absolute inset-0 bg-primary rounded-lg shadow-[0_0_12px_rgba(0,255,204,0.4)]" transition={{ type: 'spring', stiffness: 400, damping: 30 }} /> )} <span className="re | button; src/components/LanguageSwitcher.tsx:79 | Trigger {() => setLanguage('ar')} | type="button"; onClick={() => setLanguage('ar')} | Not tested |
| E0066 | {!isArabic && ( <motion.div layoutId="lang-active-pill" className="absolute inset-0 bg-primary rounded-lg shadow-[0_0_12px_rgba(0,255,204,0.4)]" transition={{ type: 'spring', stiffness: 400, damping: 30 }} /> )} <span className="r | button; src/components/LanguageSwitcher.tsx:96 | Trigger {() => setLanguage('en')} | type="button"; onClick={() => setLanguage('en')} | Not tested |

### src/components/Logo.tsx — public / conditional / shared

| ID | Element / label expression | Selector / source | Source-declared action (expected behavior pending confirmation) | Wiring / conditions | Status |
|---|---|---|---|---|---|
| E0067 | img | img; src/components/Logo.tsx:31 | Needs clarification: inspect enclosing link/form or component caller | src="/logos/datacamp-mark.png"; onError={() => setImgError(true)} | Not tested |
| E0068 | img | img; src/components/Logo.tsx:68 | Needs clarification: inspect enclosing link/form or component caller | src="/logos/innovation-university-mark.png"; onError={() => setImgError(true)} | Not tested |

### src/components/QuizEngine.tsx — public / conditional / shared

| ID | Element / label expression | Selector / source | Source-declared action (expected behavior pending confirmation) | Wiring / conditions | Status |
|---|---|---|---|---|---|
| E0069 | <div className="flex items-center gap-3"> <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-cyber font-bold ${ isSelected ? 'bg-primary text-dark-navy' : 'bg-white/10 text-muted-foreground' }`} > { | button; src/components/QuizEngine.tsx:173 | Trigger {() => handleSelectOption(optIdx)} | onClick={() => handleSelectOption(optIdx)} | Not tested |
| E0070 | <ArrowLeft className={`w-3.5 h-3.5 ${isArabic ? 'ml-1 rotate-180' : 'mr-1'}`} /> {isArabic ? 'السابق' : 'PREV'} | Button; src/components/QuizEngine.tsx:204 | Trigger {handlePrev} | onClick={handlePrev}; disabled={currentIndex === 0} | Not tested |
| E0071 | {isArabic ? 'تسليم الاختبار' : 'SUBMIT ASSESSMENT'} <CheckCircle2 className={`w-3.5 h-3.5 ${isArabic ? 'mr-1' : 'ml-1'}`} /> | Button; src/components/QuizEngine.tsx:217 | Trigger {handleSubmitQuiz} | onClick={handleSubmitQuiz} | Not tested |
| E0072 | {isArabic ? 'التالي' : 'NEXT'} <ArrowRight className={`w-3.5 h-3.5 ${isArabic ? 'mr-1 rotate-180' : 'ml-1'}`} /> | Button; src/components/QuizEngine.tsx:226 | Trigger {handleNext} | onClick={handleNext} | Not tested |
| E0073 | <RotateCcw className={`w-3.5 h-3.5 ${isArabic ? 'ml-1' : 'mr-1'}`} /> {isArabic ? 'إعادة الاختبار' : 'RETAKE QUIZ'} | Button; src/components/QuizEngine.tsx:326 | Trigger {handleRetake} | onClick={handleRetake} | Not tested |

### src/components/Sidebar.tsx — public / conditional / shared

| ID | Element / label expression | Selector / source | Source-declared action (expected behavior pending confirmation) | Wiring / conditions | Status |
|---|---|---|---|---|---|
| E0074 | motion.div | motion.div; src/components/Sidebar.tsx:108 | Trigger {() => setIsOpen(false)} | onClick={() => setIsOpen(false)} | Not tested |
| E0075 | <Logo isCollapsed={isCollapsed && isDesktop} iconSize={42} /> | Link; src/components/Sidebar.tsx:130 | Navigate to "/" | to="/"; onClick={closeOnMobile} | Not tested |
| E0076 | <X className="w-6 h-6" /> | button; src/components/Sidebar.tsx:134 | Trigger {() => setIsOpen(false)} | onClick={() => setIsOpen(false)} | Not tested |
| E0077 | <motion.div whileHover={{ scale: 1.2, rotate: 5 }} whileTap={{ scale: 0.9 }} > <link.icon className={`w-5 h-5 shrink-0 ${location.pathname === link.path ? 'text-primary' : 'group-hover:text-primary transition-colors'}`} /> </motio | Link; src/components/Sidebar.tsx:158 | Navigate to {link.path} | to={link.path}; onClick={closeOnMobile} | Not tested |
| E0078 | <link.icon className={`w-5 h-5 shrink-0 ${ (link.path === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(link.path)) ? 'text-neon-purple' : 'group-hover:text-neon-purple transition-colors' }`} /> {(!isCol | Link; src/components/Sidebar.tsx:195 | Navigate to {link.path} | to={link.path}; onClick={closeOnMobile} | Not tested |
| E0079 | <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0 overflow-hidden"> {profile?.photoURL ? ( <img src={profile.photoURL} alt="Profile" className="w-full h-full obje | Link; src/components/Sidebar.tsx:227 | Navigate to "/profile" | to="/profile"; onClick={closeOnMobile} | Not tested |
| E0080 | <LogOut className="w-4 h-4 rtl:rotate-180" /> <span className="text-xs font-bold uppercase tracking-wider">{t('nav.logout', 'Logout')}</span> | button; src/components/Sidebar.tsx:255 | Trigger {handleLogout} | onClick={handleLogout} | Not tested |
| E0081 | <UserPlus className="w-4 h-4 shrink-0" /> {(!isCollapsed \\|\\| !isDesktop) && (isArabic ? 'إنشاء حساب جديد' : 'INITIALIZE_MEMBERSHIP')} | Button; src/components/Sidebar.tsx:266 | Trigger {() => { navigate('/register'); closeOnMobile(); }} | onClick={() => { navigate('/register'); closeOnMobile(); }} | Not tested |
| E0082 | {isArabic ? 'تسجيل الدخول' : 'LOGIN_SYSTEM'} | Button; src/components/Sidebar.tsx:279 | Trigger {() => { navigate('/login'); closeOnMobile(); }} | onClick={() => { navigate('/login'); closeOnMobile(); }} | Not tested |
| E0083 | {isCollapsed ? (isArabic ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />) : (isArabic ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />)} | button; src/components/Sidebar.tsx:299 | Trigger {() => setIsCollapsed(!isCollapsed)} | onClick={() => setIsCollapsed(!isCollapsed)} | Not tested |

### src/components/UserIdentityInput.tsx — public / conditional / shared

| ID | Element / label expression | Selector / source | Source-declared action (expected behavior pending confirmation) | Wiring / conditions | Status |
|---|---|---|---|---|---|
| E0084 | By Email | button; src/components/UserIdentityInput.tsx:48 | Trigger {() => handleTypeChange('email')} | type="button"; onClick={() => handleTypeChange('email')} | Not tested |
| E0085 | By ID | button; src/components/UserIdentityInput.tsx:55 | Trigger {() => handleTypeChange('id')} | type="button"; onClick={() => handleTypeChange('id')} | Not tested |
| E0086 | {placeholder \|\| (type === 'email' ? "operative@datacamp.com" : "Member ID (e.g. 123)")} | Input; src/components/UserIdentityInput.tsx:64 | Update via {(e) => handleChange(e.target.value)} | value={value}; onChange={(e) => handleChange(e.target.value)}; onFocus={() => setShowSuggestions(true)}; onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} | Not tested |
| E0087 | <div className="font-bold">{s.fullName}</div> <div className="text-[10px] text-muted-foreground"> {type === 'email' ? s.email : `ID: ${s.memberId}`} </div> | button; src/components/UserIdentityInput.tsx:75 | Trigger {() => { const selectedVal = type === 'email' ? s.email : s.memberId; setValue(selectedVal); onValueChange(selectedVal, type); setShowSuggestions(false); }} | type="button"; onClick={() => { const selectedVal = type === 'email' ? s.email : s.memberId; setValue(selectedVal); onValueChange(selectedVal, type); setShowSuggestions(false); }} | Not tested |

### src/components/admin/RoleEditorModal.tsx — admin

| ID | Element / label expression | Selector / source | Source-declared action (expected behavior pending confirmation) | Wiring / conditions | Status |
|---|---|---|---|---|---|
| E0088 | <X className="w-5 h-5" /> | button; src/components/admin/RoleEditorModal.tsx:87 | Trigger {onClose} | onClick={onClose} | Not tested |
| E0089 | {isArabic ? 'اختيار الرول' : 'SELECT ROLE'} | button; src/components/admin/RoleEditorModal.tsx:115 | Trigger {() => setActiveTab('roles')} | onClick={() => setActiveTab('roles')} | Not tested |
| E0090 | {isArabic ? 'مصفوفة الصلاحيات' : 'PERMISSIONS MATRIX'} | button; src/components/admin/RoleEditorModal.tsx:123 | Trigger {() => setActiveTab('permissions')} | onClick={() => setActiveTab('permissions')} | Not tested |
| E0091 | <div> <div className="flex items-start justify-between gap-2 mb-2"> <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold border ${role.badgeBg} ${role.badgeBorder} ${role.badgeColor}`}> {role.tag} </span | div; src/components/admin/RoleEditorModal.tsx:143 | Trigger {() => setSelectedRole(role.id)} | onClick={() => setSelectedRole(role.id)} | Not tested |
| E0092 | {isArabic ? 'إلغاء' : 'CANCEL'} | Button; src/components/admin/RoleEditorModal.tsx:264 | Trigger {onClose} | onClick={onClose}; disabled={saving} | Not tested |
| E0093 | {saving ? ( <> <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> {isArabic ? 'جاري الحفظ...' : 'UPDATING...'} </> ) : ( <> <UserCheck className="w-4 h-4" /> {isArabic ? 'تطبيق وحفظ ال | Button; src/components/admin/RoleEditorModal.tsx:267 | Trigger {handleSave} | onClick={handleSave}; disabled={!hasChanged \|\| saving} | Not tested |

### src/components/ui/Input.tsx — public / conditional / shared

| ID | Element / label expression | Selector / source | Source-declared action (expected behavior pending confirmation) | Wiring / conditions | Status |
|---|---|---|---|---|---|
| E0094 | input | input; src/components/ui/Input.tsx:10 | Accept input; validation/consumer shown in source | type={type} | Not tested |

### src/pages/About.tsx — public / conditional / shared

| ID | Element / label expression | Selector / source | Source-declared action (expected behavior pending confirmation) | Wiring / conditions | Status |
|---|---|---|---|---|---|
| E0095 | <Button variant="cyber" size="lg" className="gap-2"> <BookOpen className="w-4 h-4" /> {isArabic ? 'استكشف المناهج التدريبية' : 'BROWSE CURRICULUM'} </Button> | Link; src/pages/About.tsx:178 | Navigate to "/courses" | to="/courses" | Not tested |
| E0096 | <BookOpen className="w-4 h-4" /> {isArabic ? 'استكشف المناهج التدريبية' : 'BROWSE CURRICULUM'} | Button; src/pages/About.tsx:179 | Needs clarification: inspect enclosing link/form or component caller |  | Not tested |
| E0097 | <Button variant="outline" size="lg" className="gap-2"> <Users className="w-4 h-4" /> {isArabic ? 'تعرف على فريق العمل' : 'MEET THE TEAM'} </Button> | Link; src/pages/About.tsx:184 | Navigate to "/staff" | to="/staff" | Not tested |
| E0098 | <Users className="w-4 h-4" /> {isArabic ? 'تعرف على فريق العمل' : 'MEET THE TEAM'} | Button; src/pages/About.tsx:185 | Needs clarification: inspect enclosing link/form or component caller |  | Not tested |
| E0099 | <Button variant="cyber" size="lg" className="gap-2"> {isArabic ? 'انضم إلى النادي الآن' : 'JOIN THE CLUB'} <ArrowRight className={`w-4 h-4 ${isArabic ? 'rotate-180' : ''}`} /> </Button> | Link; src/pages/About.tsx:373 | Navigate to "/register" | to="/register" | Not tested |
| E0100 | {isArabic ? 'انضم إلى النادي الآن' : 'JOIN THE CLUB'} <ArrowRight className={`w-4 h-4 ${isArabic ? 'rotate-180' : ''}`} /> | Button; src/pages/About.tsx:374 | Needs clarification: inspect enclosing link/form or component caller |  | Not tested |
| E0101 | <Button variant="outline" size="lg"> {isArabic ? 'تشغيل محرر الأكواد' : 'LAUNCH COMPILER'} </Button> | Link; src/pages/About.tsx:379 | Navigate to "/compiler" | to="/compiler" | Not tested |
| E0102 | {isArabic ? 'تشغيل محرر الأكواد' : 'LAUNCH COMPILER'} | Button; src/pages/About.tsx:380 | Needs clarification: inspect enclosing link/form or component caller |  | Not tested |

### src/pages/Blog.tsx — public / conditional / shared

| ID | Element / label expression | Selector / source | Source-declared action (expected behavior pending confirmation) | Wiring / conditions | Status |
|---|---|---|---|---|---|
| E0103 | <Button variant="cyber" size="sm" className="gap-2"> <PlusCircle className="w-4 h-4" /> {isArabic ? 'كتابة مقال جديد' : 'WRITE NEW ARTICLE'} </Button> | Link; src/pages/Blog.tsx:222 | Navigate to "/admin/blog" | to="/admin/blog" | Not tested |
| E0104 | <PlusCircle className="w-4 h-4" /> {isArabic ? 'كتابة مقال جديد' : 'WRITE NEW ARTICLE'} | Button; src/pages/Blog.tsx:223 | Needs clarification: inspect enclosing link/form or component caller |  | Not tested |
| E0105 | {cat.label} | button; src/pages/Blog.tsx:236 | Trigger {() => setSelectedCategory(cat.key)} | onClick={() => setSelectedCategory(cat.key)} | Not tested |
| E0106 | {isArabic ? 'بحث في المقالات والكتّاب...' : 'Search articles & authors...'} | input; src/pages/Blog.tsx:252 | Update via {(e) => setSearchQuery(e.target.value)} | type="text"; value={searchQuery}; onChange={(e) => setSearchQuery(e.target.value)} | Not tested |
| E0107 | {showSampleArticles ? (isArabic ? 'إخفاء المقالات التجريبية' : 'HIDE SAMPLE ARTICLES') : (isArabic ? 'معاينة مقالات تجريبية' : 'PREVIEW SAMPLE ARTICLES') } | Button; src/pages/Blog.tsx:284 | Trigger {() => setShowSampleArticles(!showSampleArticles)} | onClick={() => setShowSampleArticles(!showSampleArticles)} | Not tested |
| E0108 | <Button variant="outline" size="sm"> {isArabic ? 'فتح لوحة إدارة المقالات' : 'OPEN BLOG MANAGEMENT'} </Button> | Link; src/pages/Blog.tsx:295 | Navigate to "/admin/blog" | to="/admin/blog" | Not tested |
| E0109 | {isArabic ? 'فتح لوحة إدارة المقالات' : 'OPEN BLOG MANAGEMENT'} | Button; src/pages/Blog.tsx:296 | Needs clarification: inspect enclosing link/form or component caller |  | Not tested |
| E0110 | <Button variant="outline" size="sm"> {isArabic ? 'اقترح موضوعاً للمدونة' : 'SUGGEST AN ARTICLE TOPIC'} </Button> | Link; src/pages/Blog.tsx:301 | Navigate to "/contact" | to="/contact" | Not tested |
| E0111 | {isArabic ? 'اقترح موضوعاً للمدونة' : 'SUGGEST AN ARTICLE TOPIC'} | Button; src/pages/Blog.tsx:302 | Needs clarification: inspect enclosing link/form or component caller |  | Not tested |
| E0112 | <div className="w-full md:w-1/3 aspect-video bg-white/5 rounded-2xl overflow-hidden shrink-0 relative"> <img src={post.image \\|\\| `https://picsum.photos/seed/techblog${idx}/800/600`} alt={post.title} className="w-full h-full objec | motion.article; src/pages/Blog.tsx:312 | Trigger {() => setReadingPost(post)} | onClick={() => setReadingPost(post)} | Not tested |
| E0113 | <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="max-w-3xl w-full glass p-6 sm:p-10 rounded-3xl bo | motion.div; src/pages/Blog.tsx:376 | Trigger {() => setReadingPost(null)} | onClick={() => setReadingPost(null)} | Not tested |
| E0114 | <button onClick={() => setReadingPost(null)} className={`absolute top-6 ${isArabic ? 'left-6' : 'right-6'} p-2 rounded-xl bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white transition-colors`} > <X className="w-5 | motion.div; src/pages/Blog.tsx:383 | Trigger {(e) => e.stopPropagation()} | onClick={(e) => e.stopPropagation()} | Not tested |
| E0115 | <X className="w-5 h-5" /> | button; src/pages/Blog.tsx:390 | Trigger {() => setReadingPost(null)} | onClick={() => setReadingPost(null)} | Not tested |
| E0116 | <Share2 className="w-3.5 h-3.5" /> {isArabic ? 'مشاركة المقال' : 'SHARE TRANSMISSION'} | Button; src/pages/Blog.tsx:427 | Trigger {() => { navigator.clipboard.writeText(getCanonicalUrl('/blog')); toast.success(isArabic ? 'تم نسخ رابط المقال إلى الحافظة!' : 'Article link copied to clipboard!'); }} | onClick={() => { navigator.clipboard.writeText(getCanonicalUrl('/blog')); toast.success(isArabic ? 'تم نسخ رابط المقال إلى الحافظة!' : 'Article link copied to clipboard!'); }} | Not tested |
| E0117 | {isArabic ? 'إغلاق القراءة' : 'DONE READING'} | Button; src/pages/Blog.tsx:439 | Trigger {() => setReadingPost(null)} | onClick={() => setReadingPost(null)} | Not tested |

### src/pages/Certificates.tsx — public / conditional / shared

| ID | Element / label expression | Selector / source | Source-declared action (expected behavior pending confirmation) | Wiring / conditions | Status |
|---|---|---|---|---|---|
| E0118 | <Award className="w-3.5 h-3.5" /> {isArabic ? `شهاداتي المعتمدة (${userCerts.length})` : `MY CREDENTIALS (${userCerts.length})`} | button; src/pages/Certificates.tsx:113 | Trigger {() => setActiveTab('my_certs')} | onClick={() => setActiveTab('my_certs')} | Not tested |
| E0119 | <Search className="w-3.5 h-3.5" /> {isArabic ? 'التحقق من كود الشهادة' : 'VERIFY CODE'} | button; src/pages/Certificates.tsx:123 | Trigger {() => setActiveTab('verify')} | onClick={() => setActiveTab('verify')} | Not tested |
| E0120 | <div className="flex items-start justify-between gap-2 mb-2"> <span className="text-[10px] font-cyber uppercase px-2 py-0.5 rounded bg-primary/20 text-primary"> {cert.type} </span> <span className="text-[10px] font-mono text-muted | div; src/pages/Certificates.tsx:145 | Trigger {() => setSelectedCert(cert)} | onClick={() => setSelectedCert(cert)} | Not tested |
| E0121 | <Button variant="cyber" className="text-xs font-cyber"> {isArabic ? 'تصفح المسارات والدورات' : 'BROWSE COURSES'} <ArrowRight className="w-3.5 h-3.5 ml-1 rtl:rotate-180" /> </Button> | Link; src/pages/Certificates.tsx:187 | Navigate to "/courses" | to="/courses" | Not tested |
| E0122 | {isArabic ? 'تصفح المسارات والدورات' : 'BROWSE COURSES'} <ArrowRight className="w-3.5 h-3.5 ml-1 rtl:rotate-180" /> | Button; src/pages/Certificates.tsx:188 | Needs clarification: inspect enclosing link/form or component caller |  | Not tested |
| E0123 | "e.g. DC-PY99-X2K4" | input; src/pages/Certificates.tsx:218 | Update via {(e) => setSearchCode(e.target.value.toUpperCase())} | type="text"; value={searchCode}; onChange={(e) => setSearchCode(e.target.value.toUpperCase())}; onKeyDown={(e) => e.key === 'Enter' && handleVerify()} | Not tested |
| E0124 | {verifying ? (isArabic ? 'جاري الفحص...' : 'CHECKING...') : (isArabic ? 'تحقق الآن' : 'VERIFY')} | Button; src/pages/Certificates.tsx:226 | Trigger {() => handleVerify()} | onClick={() => handleVerify()}; disabled={verifying} | Not tested |

### src/pages/CompilerPlayground.tsx — public / conditional / shared

| ID | Element / label expression | Selector / source | Source-declared action (expected behavior pending confirmation) | Wiring / conditions | Status |
|---|---|---|---|---|---|
| E0125 | <Bot className="w-4 h-4 text-neon-green" /> {isArabic ? 'استشر مرشد الـ AI' : 'ASK NEXUS AI'} | Button; src/pages/CompilerPlayground.tsx:140 | Trigger {() => setIsAIModalOpen(true)} | onClick={() => setIsAIModalOpen(true)} | Not tested |
| E0126 | {isRunning ? ( <> <div className="w-4 h-4 border-2 border-dark-navy border-t-transparent rounded-full animate-spin" /> {isArabic ? 'جاري التنفيذ...' : 'COMPILING...'} </> ) : ( <> <Play className="w-4 h-4 fill-dark-navy" /> {isAra | Button; src/pages/CompilerPlayground.tsx:147 | Trigger {handleRun} | onClick={handleRun}; disabled={isRunning} | Not tested |
| E0127 | <span>{lang.icon}</span> <span>{lang.name}</span> <span className={`text-[10px] px-1 rounded ${isSelected ? 'bg-dark-navy/20' : 'bg-black/30'}`}> {lang.version} </span> | button; src/pages/CompilerPlayground.tsx:176 | Trigger {() => handleLanguageChange(lang.id)} | onClick={() => handleLanguageChange(lang.id)} | Not tested |
| E0128 | {tpl.description} | button; src/pages/CompilerPlayground.tsx:203 | Trigger {() => { setCode(tpl.code); toast.info(`${isArabic ? 'تم تحميل النموذج' : 'Loaded template'}: ${tpl.name}`); }} | onClick={() => { setCode(tpl.code); toast.info(`${isArabic ? 'تم تحميل النموذج' : 'Loaded template'}: ${tpl.name}`); }} | Not tested |
| E0129 | "Toggle Stdin Input" | button; src/pages/CompilerPlayground.tsx:236 | Trigger {() => setShowStdin(!showStdin)} | onClick={() => setShowStdin(!showStdin)} | Not tested |
| E0130 | "Copy Code" | button; src/pages/CompilerPlayground.tsx:246 | Trigger {handleCopy} | onClick={handleCopy} | Not tested |
| E0131 | "Download Source File" | button; src/pages/CompilerPlayground.tsx:253 | Trigger {handleDownload} | onClick={handleDownload} | Not tested |
| E0132 | "Reset Code" | button; src/pages/CompilerPlayground.tsx:260 | Trigger {handleReset} | onClick={handleReset} | Not tested |
| E0133 | <textarea value={code} onChange={(e) => setCode(e.target.value)} className="w-full h-full p-4 font-mono text-sm bg-transparent text-emerald-300 resize-none focus:outline-none focus:ring-0 leading-relaxed selection:bg-primary/30" s | textarea; src/pages/CompilerPlayground.tsx:272 | Update via {(e) => setCode(e.target.value)} | value={code}; onChange={(e) => setCode(e.target.value)} | Not tested |
| E0134 | {isArabic ? 'أدخل أسطر المدخلات هنا...' : 'Enter standard input lines here...'} | textarea; src/pages/CompilerPlayground.tsx:289 | Update via {(e) => setStdin(e.target.value)} | value={stdin}; onChange={(e) => setStdin(e.target.value)} | Not tested |
| E0135 | {isArabic ? 'مسح' : 'Clear'} | button; src/pages/CompilerPlayground.tsx:330 | Trigger {() => { setOutput(''); setError(null); }} | onClick={() => { setOutput(''); setError(null); }} | Not tested |
| E0136 | <Sparkles className="w-3 h-3 mr-1" /> DEBUG WITH NEXUS AI | Button; src/pages/CompilerPlayground.tsx:385 | Trigger {() => setIsAIModalOpen(true)} | onClick={() => setIsAIModalOpen(true)} | Not tested |
| E0137 | {/* Header */} <div className="max-w-7xl mx-auto mb-6"> <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"> <div> <div className="flex items-center gap-2 mb-1"> <span className="px-2.5 py-0.5 round | AIMentorModal; src/pages/CompilerPlayground.tsx:410 | Needs clarification: inspect enclosing link/form or component caller | onClose={() => setIsAIModalOpen(false)} | Not tested |

### src/pages/Contact.tsx — public / conditional / shared

| ID | Element / label expression | Selector / source | Source-declared action (expected behavior pending confirmation) | Wiring / conditions | Status |
|---|---|---|---|---|---|
| E0138 | <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> <div className="space-y-2"> <label className="text-[10px] font-cyber uppercase tracking-widest text-muted-foreground"> {isArabic ? 'الاسم بالكامل' : 'Full Name'} </label> <In | form; src/pages/Contact.tsx:92 | Submit via {handleSubmit} | onSubmit={handleSubmit} | Not tested |
| E0139 | {isArabic ? 'أحمد منصور' : 'John Doe'} | Input; src/pages/Contact.tsx:98 | Update via {(e) => setFormData({...formData, name: e.target.value})} | value={formData.name}; onChange={(e) => setFormData({...formData, name: e.target.value})}; required=true | Not tested |
| E0140 | {isArabic ? 'student@innovation.edu.eg' : 'john@example.com'} | Input; src/pages/Contact.tsx:109 | Update via {(e) => setFormData({...formData, email: e.target.value})} | type="email"; value={formData.email}; onChange={(e) => setFormData({...formData, email: e.target.value})}; required=true | Not tested |
| E0141 | {isArabic ? 'استفسار عام / انضمام للنادي' : 'General Inquiry'} | Input; src/pages/Contact.tsx:122 | Update via {(e) => setFormData({...formData, subject: e.target.value})} | value={formData.subject}; onChange={(e) => setFormData({...formData, subject: e.target.value})}; required=true | Not tested |
| E0142 | {isArabic ? 'اكتب تفاصيل استفسارك أو اقتراحك هنا...' : 'Type your transmission here...'} | textarea; src/pages/Contact.tsx:133 | Update via {(e) => setFormData({...formData, message: e.target.value})} | value={formData.message}; onChange={(e) => setFormData({...formData, message: e.target.value})}; required=true | Not tested |
| E0143 | <Send className={`w-5 h-5 ${isArabic ? 'ml-2' : 'mr-2'} ${submitting ? 'animate-pulse' : ''}`} /> {submitting ? (isArabic ? 'جاري الإرسال...' : 'TRANSMITTING...') : (isArabic ? 'إرسال الرسالة' : 'SEND TRANSMISSION') } | Button; src/pages/Contact.tsx:141 | Submit enclosing form | type="submit"; disabled={submitting} | Not tested |
| E0144 | {isArabic ? 'الانضمام لمجتمع Discord الرسمي' : 'Join official Discord community'} | a; src/pages/Contact.tsx:213 | Open {siteSettings.discordUrl} | href={siteSettings.discordUrl}; aria-label={isArabic ? 'الانضمام لمجتمع Discord الرسمي' : 'Join official Discord community'} | Not tested |
| E0145 | {isArabic ? 'الانضمام لمجتمع Discord' : 'Join Discord Server'} | Button; src/pages/Contact.tsx:220 | Needs clarification: inspect enclosing link/form or component caller |  | Not tested |
| E0146 | <Button variant="outline" className="w-full border-amber-500/40 text-amber-300 hover:bg-amber-500/10 gap-2 font-mono text-xs"> <Settings className="w-4 h-4 text-amber-400" /> {isArabic ? 'إعداد رابط Discord (مشرف)' : 'Configure Di | Link; src/pages/Contact.tsx:225 | Navigate to "/admin/content" | to="/admin/content" | Not tested |
| E0147 | <Settings className="w-4 h-4 text-amber-400" /> {isArabic ? 'إعداد رابط Discord (مشرف)' : 'Configure Discord URL (Admin)'} | Button; src/pages/Contact.tsx:226 | Needs clarification: inspect enclosing link/form or component caller |  | Not tested |

### src/pages/CourseDetail.tsx — public / conditional / shared

| ID | Element / label expression | Selector / source | Source-declared action (expected behavior pending confirmation) | Wiring / conditions | Status |
|---|---|---|---|---|---|
| E0148 | <ArrowLeft className={`w-4 h-4 ${isArabic ? 'rotate-180' : ''}`} /> <span>{isArabic ? 'العودة لقائمة الدورات' : 'BACK_TO_CATALOG'}</span> | Link; src/pages/CourseDetail.tsx:124 | Navigate to "/courses" | to="/courses" | Not tested |
| E0149 | <Button variant="cyber" className="w-full h-12 font-cyber tracking-wider text-sm shadow-[0_0_20px_rgba(0,255,204,0.3)]"> {progress >= 100 ? (isArabic ? 'مراجعة الدورة' : 'REVIEW_COURSE') : (isArabic ? 'استكمال التعلم' : 'CONTINUE_ | Link; src/pages/CourseDetail.tsx:219 | Navigate to {`/courses/${course.slug}/learn`} | to={`/courses/${course.slug}/learn`} | Not tested |
| E0150 | {progress >= 100 ? (isArabic ? 'مراجعة الدورة' : 'REVIEW_COURSE') : (isArabic ? 'استكمال التعلم' : 'CONTINUE_LEARNING') } | Button; src/pages/CourseDetail.tsx:220 | Needs clarification: inspect enclosing link/form or component caller |  | Not tested |
| E0151 | {enrolling ? (isArabic ? 'جاري تفعيل الحساب...' : 'INITIALIZING_ACCESS...') : (isArabic ? 'سجل في المسار (+5 XP)' : 'ENROLL_NOW (+5 XP)') } | Button; src/pages/CourseDetail.tsx:228 | Trigger {handleEnroll} | onClick={handleEnroll}; disabled={enrolling} | Not tested |
| E0152 | <Button variant="outline" className="w-full h-10 font-cyber text-xs border-amber-500/40 text-amber-300 hover:bg-amber-500/10 gap-2" > <span>⚙️ {isArabic ? 'تعديل في لوحة الإدارة' : 'EDIT IN ADMIN PANEL'}</span> </Button> | Link; src/pages/CourseDetail.tsx:242 | Navigate to "/admin/courses" | to="/admin/courses" | Not tested |
| E0153 | <span>⚙️ {isArabic ? 'تعديل في لوحة الإدارة' : 'EDIT IN ADMIN PANEL'}</span> | Button; src/pages/CourseDetail.tsx:243 | Needs clarification: inspect enclosing link/form or component caller |  | Not tested |
| E0154 | <Share2 className="w-3.5 h-3.5" /> <span>{isArabic ? 'مشاركة رابط الدورة' : 'SHARE_WITH_PEERS'}</span> | Button; src/pages/CourseDetail.tsx:252 | Trigger {() => { navigator.clipboard.writeText(getCanonicalUrl(`/courses/${course.slug}`)); toast.success(isArabic ? 'تم نسخ رابط الدورة إلى الحافظة!' : 'Course link copied to clipboard!'); }} | onClick={() => { navigator.clipboard.writeText(getCanonicalUrl(`/courses/${course.slug}`)); toast.success(isArabic ? 'تم نسخ رابط الدورة إلى الحافظة!' : 'Course link copied to clipboard!'); }} | Not tested |
| E0155 | <div className="space-y-1"> <span className="text-[10px] font-cyber text-primary tracking-widest uppercase"> {isArabic ? `الوحدة ${mod.order}` : `MODULE ${mod.order}`} </span> <h4 className="font-cyber font-bold text-foreground te | button; src/pages/CourseDetail.tsx:310 | Trigger {() => toggleModule(mod.id)} | onClick={() => toggleModule(mod.id)} | Not tested |
| E0156 | <Button variant="outline" className="h-8 text-[11px] font-cyber px-3 border-primary/30 text-primary"> {isCompleted ? (isArabic ? 'مراجعة' : 'REVIEW') : (isArabic ? 'ابدأ' : 'START')} </Button> | Link; src/pages/CourseDetail.tsx:365 | Navigate to {`/courses/${course.slug}/learn`} | to={`/courses/${course.slug}/learn`} | Not tested |
| E0157 | {isCompleted ? (isArabic ? 'مراجعة' : 'REVIEW') : (isArabic ? 'ابدأ' : 'START')} | Button; src/pages/CourseDetail.tsx:366 | Needs clarification: inspect enclosing link/form or component caller |  | Not tested |

### src/pages/CourseLearning.tsx — user

| ID | Element / label expression | Selector / source | Source-declared action (expected behavior pending confirmation) | Wiring / conditions | Status |
|---|---|---|---|---|---|
| E0158 | <ArrowLeft className={`w-5 h-5 ${isArabic ? 'rotate-180' : ''}`} /> | Link; src/pages/CourseLearning.tsx:179 | Navigate to {`/courses/${course.slug}`} | to={`/courses/${course.slug}`} | Not tested |
| E0159 | <List className="w-5 h-5" /> | button; src/pages/CourseLearning.tsx:203 | Trigger {() => setSidebarOpen(!sidebarOpen)} | onClick={() => setSidebarOpen(!sidebarOpen)} | Not tested |
| E0160 | <Button variant="outline" className="text-xs font-cyber h-9 px-3 border-amber-500/40 text-amber-400 hover:bg-amber-500/10"> {isArabic ? 'خوض الاختبار النهائي (+50 XP)' : 'TAKE FINAL QUIZ (+50 XP)'} </Button> | Link; src/pages/CourseLearning.tsx:231 | Navigate to {`/courses/${course.slug}/quiz`} | to={`/courses/${course.slug}/quiz`} | Not tested |
| E0161 | {isArabic ? 'خوض الاختبار النهائي (+50 XP)' : 'TAKE FINAL QUIZ (+50 XP)'} | Button; src/pages/CourseLearning.tsx:232 | Needs clarification: inspect enclosing link/form or component caller |  | Not tested |
| E0162 | <Button variant="cyber" className="text-xs font-cyber h-9 px-4"> {isArabic ? 'عرض الشهادة' : 'VIEW CERTIFICATE'} </Button> | Link; src/pages/CourseLearning.tsx:236 | Navigate to "/certificates" | to="/certificates" | Not tested |
| E0163 | {isArabic ? 'عرض الشهادة' : 'VIEW CERTIFICATE'} | Button; src/pages/CourseLearning.tsx:237 | Needs clarification: inspect enclosing link/form or component caller |  | Not tested |
| E0164 | {currentLesson.title} | iframe; src/pages/CourseLearning.tsx:273 | Load media; exercise browser/player controls | src={currentLesson.videoUrl} | Not tested |
| E0165 | <span>{option}</span> {isThisChosen && <div className="w-2 h-2 rounded-full bg-primary shrink-0" />} | button; src/pages/CourseLearning.tsx:342 | Trigger {() => setSelectedAnswers(p => ({ ...p, [q.id]: optIndex }))} | disabled={quizSubmitted}; onClick={() => setSelectedAnswers(p => ({ ...p, [q.id]: optIndex }))} | Not tested |
| E0166 | {isArabic ? 'تسليم التقييم' : 'SUBMIT_ASSESSMENT'} | Button; src/pages/CourseLearning.tsx:369 | Trigger {handleQuizSubmit} | onClick={handleQuizSubmit}; disabled={Object.keys(selectedAnswers).length < currentLesson.quizQuestions.length} | Not tested |
| E0167 | <RotateCcw className={`w-4 h-4 ${isArabic ? 'ml-2' : 'mr-2'}`} /> {isArabic ? 'إعادة الاختبار' : 'RETRY_QUIZ'} | Button; src/pages/CourseLearning.tsx:378 | Trigger {() => { setQuizSubmitted(false); setSelectedAnswers({}); setQuizScore(null); }} | onClick={() => { setQuizSubmitted(false); setSelectedAnswers({}); setQuizScore(null); }} | Not tested |
| E0168 | <CodeExerciseRunner exerciseTitle={isArabic ? `التحدي البرمجي: ${currentLesson.title}` : `Practical Challenge: ${currentLesson.title}`} exercisePrompt={currentLesson.exercisePrompt} starterCode={currentLesson.exerciseStarterCode \ | CodeExerciseRunner; src/pages/CourseLearning.tsx:398 | Needs clarification: inspect enclosing link/form or component caller | onSuccess={() => { handleCompleteCurrentLesson(); }}; onAskAI={() => { setIsAIModalOpen(true); }} | Not tested |
| E0169 | <ChevronLeft className={`w-4 h-4 ${isArabic ? 'rotate-180' : ''}`} /> {isArabic ? 'الدرس السابق' : 'PREVIOUS'} | Button; src/pages/CourseLearning.tsx:418 | Trigger {() => handleLessonSelect(prevLesson)} | onClick={() => handleLessonSelect(prevLesson)} | Not tested |
| E0170 | {isCompleted ? ( <span className="flex items-center gap-2"> <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {isArabic ? 'تم إكمال الدرس' : 'LESSON COMPLETED'} </span> ) : completing ? ( isArabic ? 'جاري تسجيل الإنجاز...' : ' | Button; src/pages/CourseLearning.tsx:430 | Trigger {handleCompleteCurrentLesson} | onClick={handleCompleteCurrentLesson}; disabled={completing \|\| isCompleted} | Not tested |
| E0171 | {isArabic ? 'الدرس التالي' : 'NEXT'} <ChevronRight className={`w-4 h-4 ${isArabic ? 'rotate-180' : ''}`} /> | Button; src/pages/CourseLearning.tsx:449 | Trigger {() => handleLessonSelect(nextLesson)} | onClick={() => handleLessonSelect(nextLesson)} | Not tested |
| E0172 | {isDone ? ( <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> ) : lesson.type === 'video' ? ( <PlayCircle className="w-3.5 h-3.5 text-primary shrink-0" /> ) : lesson.type === 'quiz' ? ( <HelpCircle className="w-3. | button; src/pages/CourseLearning.tsx:494 | Trigger {() => handleLessonSelect(lesson)} | onClick={() => handleLessonSelect(lesson)} | Not tested |
| E0173 | {/* Top Learning Bar */} <header className="h-16 px-4 sm:px-6 border-b border-primary/20 bg-dark-navy/90 backdrop-blur-xl flex items-center justify-between sticky top-0 z-30"> <div className="flex items-center gap-3"> <Link to={`/ | AIMentorModal; src/pages/CourseLearning.tsx:530 | Needs clarification: inspect enclosing link/form or component caller | onClose={() => setIsAIModalOpen(false)} | Not tested |

### src/pages/CourseQuiz.tsx — user

| ID | Element / label expression | Selector / source | Source-declared action (expected behavior pending confirmation) | Wiring / conditions | Status |
|---|---|---|---|---|---|
| E0174 | <ArrowLeft className={`w-3.5 h-3.5 ${isArabic ? 'rotate-180' : ''}`} /> {isArabic ? 'العودة لبيئة الدورة التعليمية' : 'BACK TO COURSE WORKSPACE'} | Link; src/pages/CourseQuiz.tsx:152 | Navigate to {slug ? `/courses/${slug}/learn` : '/courses'} | to={slug ? `/courses/${slug}/learn` : '/courses'} | Not tested |
| E0175 | {/* Breadcrumb Navigation */} <div className="flex items-center justify-between"> <Link to={slug ? `/courses/${slug}/learn` : '/courses'} className="text-xs font-cyber text-muted-foreground hover:text-primary transition-colors fle | QuizEngine; src/pages/CourseQuiz.tsx:165 | Needs clarification: inspect enclosing link/form or component caller | onComplete={handleQuizComplete} | Not tested |

### src/pages/Courses.tsx — public / conditional / shared

| ID | Element / label expression | Selector / source | Source-declared action (expected behavior pending confirmation) | Wiring / conditions | Status |
|---|---|---|---|---|---|
| E0176 | <Button className="bg-amber-400 hover:bg-amber-500 text-black font-cyber font-bold text-xs h-9 px-4"> {isArabic ? '+ إضافة دورة جديدة' : '+ ADD NEW COURSE'} </Button> | Link; src/pages/Courses.tsx:156 | Navigate to "/admin/courses" | to="/admin/courses" | Not tested |
| E0177 | {isArabic ? '+ إضافة دورة جديدة' : '+ ADD NEW COURSE'} | Button; src/pages/Courses.tsx:157 | Needs clarification: inspect enclosing link/form or component caller |  | Not tested |
| E0178 | {isArabic ? 'ابحث بالمهارة أو التقنية (مثل: بايثون، Pandas، Scikit-Learn)...' : 'Search by topic, skill, or library (e.g. Pandas, Scikit-Learn)...'} | Input; src/pages/Courses.tsx:179 | Update via {e => setSearch(e.target.value)} | value={search}; onChange={e => setSearch(e.target.value)} | Not tested |
| E0179 | {lvl.label} | button; src/pages/Courses.tsx:189 | Trigger {() => setSelectedLevel(lvl.id)} | onClick={() => setSelectedLevel(lvl.id)} | Not tested |
| E0180 | {cat.label} | button; src/pages/Courses.tsx:207 | Trigger {() => setSelectedCategory(cat.id)} | onClick={() => setSelectedCategory(cat.id)} | Not tested |
| E0181 | {isArabic ? 'إعادة ضبط الفلاتر' : 'RESET_FILTERS'} | Button; src/pages/Courses.tsx:241 | Trigger {() => { setSearch(''); setSelectedCategory('all'); setSelectedLevel('all'); }} | onClick={() => { setSearch(''); setSelectedCategory('all'); setSelectedLevel('all'); }} | Not tested |
| E0182 | <Button size="sm" variant="outline" className="h-9 px-3 text-[11px] font-cyber border-amber-500/30 text-amber-400 hover:bg-amber-500/10" title="Edit course in admin panel" > {isArabic ? 'تعديل' : 'EDIT'} </Button> | Link; src/pages/Courses.tsx:346 | Navigate to "/admin/courses" | to="/admin/courses" | Not tested |
| E0183 | "Edit course in admin panel" | Button; src/pages/Courses.tsx:347 | Needs clarification: inspect enclosing link/form or component caller |  | Not tested |
| E0184 | <Button variant="cyber" className="h-9 px-4 text-xs font-cyber tracking-wider shadow-[0_0_15px_rgba(57,255,20,0.2)]" > {progress >= 100 ? ( <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emera | Link; src/pages/Courses.tsx:358 | Navigate to {`/courses/${course.slug}`} | to={`/courses/${course.slug}`} | Not tested |
| E0185 | {progress >= 100 ? ( <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> {isArabic ? 'مكتمل' : 'COMPLETED'}</span> ) : ( <span className="flex items-center gap-1.5">{isArabic ? `متا | Button; src/pages/Courses.tsx:359 | Needs clarification: inspect enclosing link/form or component caller |  | Not tested |
| E0186 | {isArabic ? 'سجل الآن ⚡' : 'ENROLL NOW ⚡'} | Button; src/pages/Courses.tsx:372 | Trigger {(e) => handleEnrollCourse(e, course)} | onClick={(e) => handleEnrollCourse(e, course)} | Not tested |
| E0187 | <Button variant="outline" className="h-9 px-2.5 text-xs font-cyber border-white/10 hover:border-primary/40" title={isArabic ? 'معاينة تفاصيل المنهج' : 'View Course Syllabus'} > <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" /> | Link; src/pages/Courses.tsx:379 | Navigate to {`/courses/${course.slug}`} | to={`/courses/${course.slug}`} | Not tested |
| E0188 | {isArabic ? 'معاينة تفاصيل المنهج' : 'View Course Syllabus'} | Button; src/pages/Courses.tsx:380 | Needs clarification: inspect enclosing link/form or component caller |  | Not tested |

### src/pages/Dashboard.tsx — user

| ID | Element / label expression | Selector / source | Source-declared action (expected behavior pending confirmation) | Wiring / conditions | Status |
|---|---|---|---|---|---|
| E0189 | <Button variant="cyber" className="gap-2 font-cyber tracking-wider text-xs h-11 px-4 shadow-lg shadow-primary/25 hover:scale-105 transition-all border-amber-500/40 text-amber-300 hover:text-white" > <Users className="w-4 h-4 text- | Link; src/pages/Dashboard.tsx:88 | Navigate to "/admin/users" | to="/admin/users" | Not tested |
| E0190 | <Users className="w-4 h-4 text-amber-400" /> <span>{isArabic ? 'إدارة الأعضاء وترقية المشرفين 👑' : 'MANAGE MEMBERS & PROMOTE ADMINS 👑'}</span> | Button; src/pages/Dashboard.tsx:89 | Needs clarification: inspect enclosing link/form or component caller |  | Not tested |
| E0191 | <Button variant="cyber" className="w-full md:w-auto gap-2 font-cyber tracking-wider text-xs h-11 px-5 shadow-lg shadow-amber-500/20 border-amber-500/50 bg-amber-500 text-black hover:bg-amber-400 hover:scale-105 transition-all" > < | Link; src/pages/Dashboard.tsx:174 | Navigate to "/admin/users" | to="/admin/users" | Not tested |
| E0192 | <Users className="w-4 h-4" /> <span>{isArabic ? 'دخول إدارة الأعضاء وترقية المشرفين 👑' : 'OPEN USER MANAGEMENT & PROMOTE 👑'}</span> | Button; src/pages/Dashboard.tsx:175 | Needs clarification: inspect enclosing link/form or component caller |  | Not tested |
| E0193 | <Button variant="outline" className="text-xs font-cyber h-8 px-3 border-primary/30 text-primary"> {isArabic ? 'استكشف الكل' : 'EXPLORE_ALL'} <ArrowRight className={`w-3.5 h-3.5 ${isArabic ? 'mr-1 rotate-180' : 'ml-1'}`} /> </Butto | Link; src/pages/Dashboard.tsx:237 | Navigate to "/courses" | to="/courses" | Not tested |
| E0194 | {isArabic ? 'استكشف الكل' : 'EXPLORE_ALL'} <ArrowRight className={`w-3.5 h-3.5 ${isArabic ? 'mr-1 rotate-180' : 'ml-1'}`} /> | Button; src/pages/Dashboard.tsx:238 | Needs clarification: inspect enclosing link/form or component caller |  | Not tested |
| E0195 | <Button variant="cyber" className="text-xs font-cyber"> {isArabic ? 'سجل في أول دورة (+5 XP)' : 'ENROLL IN FIRST COURSE (+5 XP)'} </Button> | Link; src/pages/Dashboard.tsx:250 | Navigate to "/courses" | to="/courses" | Not tested |
| E0196 | {isArabic ? 'سجل في أول دورة (+5 XP)' : 'ENROLL IN FIRST COURSE (+5 XP)'} | Button; src/pages/Dashboard.tsx:251 | Needs clarification: inspect enclosing link/form or component caller |  | Not tested |
| E0197 | <Button variant="cyber" className="h-8 text-xs font-cyber px-3"> {enrollment.progress >= 100 ? (isArabic ? 'مراجعة' : 'REVIEW') : (isArabic ? 'متابعة' : 'RESUME') } </Button> | Link; src/pages/Dashboard.tsx:281 | Navigate to {`/courses/${course.slug}/learn`} | to={`/courses/${course.slug}/learn`} | Not tested |
| E0198 | {enrollment.progress >= 100 ? (isArabic ? 'مراجعة' : 'REVIEW') : (isArabic ? 'متابعة' : 'RESUME') } | Button; src/pages/Dashboard.tsx:282 | Needs clarification: inspect enclosing link/form or component caller |  | Not tested |
| E0199 | <Button variant="outline" className="text-xs font-cyber h-8 px-3 border-primary/30 text-primary"> {isArabic ? 'عرض لوحة المتصدرين' : 'VIEW LEADERBOARD'} <ArrowRight className={`w-3.5 h-3.5 ${isArabic ? 'mr-1 rotate-180' : 'ml-1'}` | Link; src/pages/Dashboard.tsx:397 | Navigate to "/leaderboard" | to="/leaderboard" | Not tested |
| E0200 | {isArabic ? 'عرض لوحة المتصدرين' : 'VIEW LEADERBOARD'} <ArrowRight className={`w-3.5 h-3.5 ${isArabic ? 'mr-1 rotate-180' : 'ml-1'}`} /> | Button; src/pages/Dashboard.tsx:398 | Needs clarification: inspect enclosing link/form or component caller |  | Not tested |
| E0201 | <QRCodeSVG value={profile.memberId} size={60} level="H" /> | QRCodeSVG; src/pages/Dashboard.tsx:489 | Render QR encoding {profile.memberId} | value={profile.memberId} | Not tested |
| E0202 | <Download className={`w-4 h-4 ${isArabic ? 'ml-2' : 'mr-2'}`} /> {isArabic ? 'تحميل بطاقة الهوية' : 'Download ID Card'} | Button; src/pages/Dashboard.tsx:495 | Trigger {downloadIDCard} | onClick={downloadIDCard} | Not tested |
| E0203 | <Button variant="outline" className="w-full border-primary/40 text-primary hover:bg-primary/10 font-cyber text-xs"> <Award className={`w-4 h-4 ${isArabic ? 'ml-2' : 'mr-2'} text-neon-green`} /> {isArabic ? 'عرض شهاداتي الرقمية الم | Link; src/pages/Dashboard.tsx:501 | Navigate to "/certificates" | to="/certificates" | Not tested |
| E0204 | <Award className={`w-4 h-4 ${isArabic ? 'ml-2' : 'mr-2'} text-neon-green`} /> {isArabic ? 'عرض شهاداتي الرقمية المعتمدة' : 'VIEW MY DIGITAL CERTIFICATES'} | Button; src/pages/Dashboard.tsx:502 | Needs clarification: inspect enclosing link/form or component caller |  | Not tested |
| E0205 | <Button variant="outline" className="w-full border-white/20 hover:border-primary text-foreground font-cyber text-xs"> <Sparkles className={`w-4 h-4 ${isArabic ? 'ml-2' : 'mr-2'} text-primary`} /> {isArabic ? 'تشغيل محرر الأكواد ال | Link; src/pages/Dashboard.tsx:508 | Navigate to "/compiler" | to="/compiler" | Not tested |
| E0206 | <Sparkles className={`w-4 h-4 ${isArabic ? 'ml-2' : 'mr-2'} text-primary`} /> {isArabic ? 'تشغيل محرر الأكواد المتعدد' : 'OPEN MULTI-LANGUAGE COMPILER'} | Button; src/pages/Dashboard.tsx:509 | Needs clarification: inspect enclosing link/form or component caller |  | Not tested |

### src/pages/Events.tsx — public / conditional / shared

| ID | Element / label expression | Selector / source | Source-declared action (expected behavior pending confirmation) | Wiring / conditions | Status |
|---|---|---|---|---|---|
| E0207 | <QRCodeSVG value={showSuccess.qrCode} size={180} /> | QRCodeSVG; src/pages/Events.tsx:99 | Render QR encoding {showSuccess.qrCode} | value={showSuccess.qrCode} | Not tested |
| E0208 | {isArabic ? 'إغلاق النافذة' : 'DISMISS'} | Button; src/pages/Events.tsx:109 | Trigger {() => setShowSuccess(null)} | onClick={() => setShowSuccess(null)} | Not tested |
| E0209 | {isArabic ? 'ابحث في الفعاليات والورش...' : 'Search missions...'} | input; src/pages/Events.tsx:146 | Update via {(e) => setSearchTerm(e.target.value)} | type="text"; value={searchTerm}; onChange={(e) => setSearchTerm(e.target.value)} | Not tested |
| E0210 | <Filter className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" /> {isArabic ? 'تصفية' : 'FILTER'} | Button; src/pages/Events.tsx:155 | Needs clarification: inspect enclosing link/form or component caller |  | Not tested |
| E0211 | {isArabic ? 'عرض نماذج الفعاليات' : 'PREVIEW SAMPLE MISSIONS'} | Button; src/pages/Events.tsx:183 | Trigger {() => setEvents(demoEvents)} | onClick={() => setEvents(demoEvents)} | Not tested |
| E0212 | <Button variant="outline" size="sm"> {isArabic ? 'اقترح ورشة عمل' : 'PROPOSE A WORKSHOP'} </Button> | Link; src/pages/Events.tsx:190 | Navigate to "/contact" | to="/contact" | Not tested |
| E0213 | {isArabic ? 'اقترح ورشة عمل' : 'PROPOSE A WORKSHOP'} | Button; src/pages/Events.tsx:191 | Needs clarification: inspect enclosing link/form or component caller |  | Not tested |
| E0214 | {registering === event.id ? (isArabic ? 'جاري المعالجة...' : 'PROCESSING...') : event.registeredCount >= event.capacity ? (isArabic ? 'اكتمل العدد' : 'MISSION FULL') : (isArabic ? 'تأكيد التسجيل في الفعالية' : 'INITIALIZE REGISTRA | Button; src/pages/Events.tsx:249 | Trigger {() => handleRegister(event)} | disabled={registering === event.id \|\| event.registeredCount >= event.capacity}; onClick={() => handleRegister(event)} | Not tested |

### src/pages/FAQ.tsx — public / conditional / shared

| ID | Element / label expression | Selector / source | Source-declared action (expected behavior pending confirmation) | Wiring / conditions | Status |
|---|---|---|---|---|---|
| E0215 | {isArabic ? 'ابحث في الأسئلة الشائعة والأجوبة...' : 'Search questions & answers...'} | input; src/pages/FAQ.tsx:162 | Update via {(e) => setSearchTerm(e.target.value)} | type="text"; value={searchTerm}; onChange={(e) => setSearchTerm(e.target.value)} | Not tested |
| E0216 | <Icon className="w-3.5 h-3.5" /> {cat.label} | button; src/pages/FAQ.tsx:178 | Trigger {() => setSelectedCat(cat.id)} | onClick={() => setSelectedCat(cat.id)} | Not tested |
| E0217 | <Button variant="cyber"> {isArabic ? 'تواصل مع الدعم' : 'CONTACT SUPPORT'} </Button> | Link; src/pages/FAQ.tsx:205 | Navigate to "/contact" | to="/contact" | Not tested |
| E0218 | {isArabic ? 'تواصل مع الدعم' : 'CONTACT SUPPORT'} | Button; src/pages/FAQ.tsx:206 | Needs clarification: inspect enclosing link/form or component caller |  | Not tested |
| E0219 | <span className="font-cyber font-bold text-base sm:text-lg text-white flex items-center gap-3"> <span className="text-primary font-mono text-sm">0{idx + 1}.</span> {faq.question} </span> <ChevronDown className={`w-5 h-5 text-prima | button; src/pages/FAQ.tsx:224 | Trigger {() => setOpenIdx(isOpen ? null : idx)} | onClick={() => setOpenIdx(isOpen ? null : idx)} | Not tested |
| E0220 | <Button variant="cyber"> {isArabic ? 'تواصل معنا' : 'GET IN TOUCH'} </Button> | Link; src/pages/FAQ.tsx:273 | Navigate to "/contact" | to="/contact" | Not tested |
| E0221 | {isArabic ? 'تواصل معنا' : 'GET IN TOUCH'} | Button; src/pages/FAQ.tsx:274 | Needs clarification: inspect enclosing link/form or component caller |  | Not tested |
| E0222 | <Button variant="outline"> {isArabic ? 'استكشف الدورات' : 'EXPLORE COURSES'} </Button> | Link; src/pages/FAQ.tsx:278 | Navigate to "/courses" | to="/courses" | Not tested |
| E0223 | {isArabic ? 'استكشف الدورات' : 'EXPLORE COURSES'} | Button; src/pages/FAQ.tsx:279 | Needs clarification: inspect enclosing link/form or component caller |  | Not tested |

### src/pages/ForgotPassword.tsx — public / conditional / shared

| ID | Element / label expression | Selector / source | Source-declared action (expected behavior pending confirmation) | Wiring / conditions | Status |
|---|---|---|---|---|---|
| E0224 | {isArabic ? 'العودة لتسجيل الدخول' : 'RETURN_TO_PORTAL'} | Button; src/pages/ForgotPassword.tsx:63 | Trigger {() => navigate('/login')} | onClick={() => navigate('/login')} | Not tested |
| E0225 | <div className="space-y-2"> <label className="text-xs font-cyber uppercase tracking-widest text-muted-foreground"> {isArabic ? 'البريد الإلكتروني المسجل' : 'Registered Email'} </label> <div className="relative"> <Mail className={` | form; src/pages/ForgotPassword.tsx:84 | Submit via {handleResetRequest} | onSubmit={handleResetRequest} | Not tested |
| E0226 | {isArabic ? 'name@datacamp.club' : 'name@datacamp.club'} | Input; src/pages/ForgotPassword.tsx:91 | Update via {(e) => setEmail(e.target.value)} | type="email"; value={email}; onChange={(e) => setEmail(e.target.value)}; required=true | Not tested |
| E0227 | {loading ? (isArabic ? 'جاري الإرسال...' : 'TRANSMITTING...') : (isArabic ? 'إرسال رابط الاستعادة' : 'SEND_RECOVERY_CODE') } | Button; src/pages/ForgotPassword.tsx:101 | Submit enclosing form | type="submit"; disabled={loading} | Not tested |
| E0228 | {isArabic ? 'العودة إلى بوابة الدخول' : 'Return to Login Portal'} | Link; src/pages/ForgotPassword.tsx:110 | Navigate to "/login" | to="/login" | Not tested |

### src/pages/Gallery.tsx — public / conditional / shared

| ID | Element / label expression | Selector / source | Source-declared action (expected behavior pending confirmation) | Wiring / conditions | Status |
|---|---|---|---|---|---|
| E0229 | {cat.label} | button; src/pages/Gallery.tsx:191 | Trigger {() => setSelectedCat(cat.key)} | onClick={() => setSelectedCat(cat.key)} | Not tested |
| E0230 | {isArabic ? 'بحث في الفعاليات واللحظات...' : 'Search moments & events...'} | input; src/pages/Gallery.tsx:207 | Update via {(e) => setSearch(e.target.value)} | type="text"; value={search}; onChange={(e) => setSearch(e.target.value)} | Not tested |
| E0231 | {showSampleGallery ? (isArabic ? 'إخفاء الصور التجريبية' : 'HIDE SAMPLE GALLERY') : (isArabic ? 'معاينة لحظات مصورة' : 'PREVIEW SAMPLE MOMENTS') } | Button; src/pages/Gallery.tsx:239 | Trigger {() => setShowSampleGallery(!showSampleGallery)} | onClick={() => setShowSampleGallery(!showSampleGallery)} | Not tested |
| E0232 | <img src={img.url} alt={img.title} className="w-full h-auto object-cover transition-all duration-700 group-hover:scale-105" referrerPolicy="no-referrer" onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos | motion.div; src/pages/Gallery.tsx:254 | Trigger {() => setSelectedImage(img)} | onClick={() => setSelectedImage(img)} | Not tested |
| E0233 | <img src={img.url} alt={img.title} className="w-full h-auto object-cover transition-all duration-700 group-hover:scale-105" referrerPolicy="no-referrer" onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos | img; src/pages/Gallery.tsx:263 | Needs clarification: inspect enclosing link/form or component caller | src={img.url}; onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/broken/800/600?blur=10'; }} | Not tested |
| E0234 | <button className={`absolute top-6 ${isArabic ? 'left-6' : 'right-6'} p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors`} onClick={() => setSelectedImage(null)} > <X className="w-6 h-6" /> </button> <motion | motion.div; src/pages/Gallery.tsx:296 | Trigger {() => setSelectedImage(null)} | onClick={() => setSelectedImage(null)} | Not tested |
| E0235 | <X className="w-6 h-6" /> | button; src/pages/Gallery.tsx:303 | Trigger {() => setSelectedImage(null)} | onClick={() => setSelectedImage(null)} | Not tested |
| E0236 | <div className="overflow-hidden flex items-center justify-center max-h-[70vh] bg-black/40"> <img src={selectedImage.url} alt={selectedImage.title} className="max-w-full max-h-[70vh] object-contain" /> </div> <div className="p-6 sp | motion.div; src/pages/Gallery.tsx:310 | Trigger {(e) => e.stopPropagation()} | onClick={(e) => e.stopPropagation()} | Not tested |

### src/pages/Home.tsx — public / conditional / shared

| ID | Element / label expression | Selector / source | Source-declared action (expected behavior pending confirmation) | Wiring / conditions | Status |
|---|---|---|---|---|---|
| E0237 | <Button size="lg" variant="cyber" className="w-full sm:w-auto font-bold shadow-[0_0_20px_rgba(57,255,20,0.2)]"> {isArabic ? 'إنشاء حساب جديد • انضم الآن' : 'Initialize Membership • Join Now'} <ArrowRight className="ml-2 w-5 h-5 rt | Link; src/pages/Home.tsx:139 | Navigate to "/register" | to="/register" | Not tested |
| E0238 | {isArabic ? 'إنشاء حساب جديد • انضم الآن' : 'Initialize Membership • Join Now'} <ArrowRight className="ml-2 w-5 h-5 rtl:rotate-180" /> | Button; src/pages/Home.tsx:140 | Needs clarification: inspect enclosing link/form or component caller |  | Not tested |
| E0239 | <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/20 hover:border-primary/50"> {isArabic ? 'استكشف الدورات' : 'Explore Courses'} </Button> | Link; src/pages/Home.tsx:145 | Navigate to "/courses" | to="/courses" | Not tested |
| E0240 | {isArabic ? 'استكشف الدورات' : 'Explore Courses'} | Button; src/pages/Home.tsx:146 | Needs clarification: inspect enclosing link/form or component caller |  | Not tested |
| E0241 | <Button size="lg" variant="ghost" className="w-full sm:w-auto text-muted-foreground hover:text-white"> {isArabic ? 'محرر الأكواد' : 'Launch Compiler'} </Button> | Link; src/pages/Home.tsx:150 | Navigate to "/compiler" | to="/compiler" | Not tested |
| E0242 | {isArabic ? 'محرر الأكواد' : 'Launch Compiler'} | Button; src/pages/Home.tsx:151 | Needs clarification: inspect enclosing link/form or component caller |  | Not tested |
| E0243 | <Button size="lg" variant="cyber" className="w-full sm:w-auto font-bold"> {isArabic ? 'لوحة التحكم' : 'Access Dashboard'} <ArrowRight className="ml-2 w-5 h-5 rtl:rotate-180" /> </Button> | Link; src/pages/Home.tsx:157 | Navigate to "/dashboard" | to="/dashboard" | Not tested |
| E0244 | {isArabic ? 'لوحة التحكم' : 'Access Dashboard'} <ArrowRight className="ml-2 w-5 h-5 rtl:rotate-180" /> | Button; src/pages/Home.tsx:158 | Needs clarification: inspect enclosing link/form or component caller |  | Not tested |
| E0245 | <Button size="lg" variant="cyber" className="w-full sm:px-16 py-8 text-lg md:text-xl font-bold"> {user ? (isArabic ? 'الدخول للوحة التحكم' : 'Access Dashboard') : (isArabic ? 'انضم للنادي الآن' : 'Join the club now')} </Button> | Link; src/pages/Home.tsx:263 | Navigate to {user ? "/dashboard" : "/register"} | to={user ? "/dashboard" : "/register"} | Not tested |
| E0246 | {user ? (isArabic ? 'الدخول للوحة التحكم' : 'Access Dashboard') : (isArabic ? 'انضم للنادي الآن' : 'Join the club now')} | Button; src/pages/Home.tsx:264 | Needs clarification: inspect enclosing link/form or component caller |  | Not tested |

### src/pages/Leaderboard.tsx — public / conditional / shared

| ID | Element / label expression | Selector / source | Source-declared action (expected behavior pending confirmation) | Wiring / conditions | Status |
|---|---|---|---|---|---|
| E0247 | {isArabic ? 'ابحث باسم العضو أو رقم العضوية...' : 'Search member name or Member ID...'} | Input; src/pages/Leaderboard.tsx:213 | Update via {e => setSearch(e.target.value)} | value={search}; onChange={e => setSearch(e.target.value)} | Not tested |
| E0248 | {fac === 'all' ? (isArabic ? 'جميع الكليات' : 'ALL FACULTIES') : (isArabic ? (fac === 'Computer Science' ? 'حاسبات ومعلومات' : fac === 'Engineering' ? 'الهندسة' : fac === 'Artificial Intelligence' ? 'الذكاء الاصطناعي' : fac === 'B | button; src/pages/Leaderboard.tsx:223 | Trigger {() => setSelectedFaculty(fac)} | onClick={() => setSelectedFaculty(fac)} | Not tested |

### src/pages/Login.tsx — public / conditional / shared

| ID | Element / label expression | Selector / source | Source-declared action (expected behavior pending confirmation) | Wiring / conditions | Status |
|---|---|---|---|---|---|
| E0249 | {isLoading ? ( <><div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /><span>{isArabic ? 'جاري الاتصال بـ Google...' : 'CONNECTING TO GOOGLE...'}</span></> ) : ( <><GoogleIcon /><span>{is | Button; src/pages/Login.tsx:103 | Trigger {handleGoogleSignIn} | type="button"; onClick={handleGoogleSignIn}; disabled={isLoading} | Not tested |
| E0250 | {isArabic ? '⚡ تجربة الحسابات السريعة (حساب المشرف / حساب العضو)' : '⚡ Quick Demo Accounts Switcher'} | button; src/pages/Login.tsx:119 | Trigger {() => setShowGoogleModal(true)} | type="button"; onClick={() => setShowGoogleModal(true)} | Not tested |
| E0251 | {/* Email Field */} <div className="space-y-1"> <label className="text-[10px] font-cyber text-muted-foreground uppercase tracking-widest flex items-center justify-between"> <span>{isArabic ? 'البريد الإلكتروني' : 'Email Address'}< | form; src/pages/Login.tsx:142 | Submit via {handleEmailLogin} | onSubmit={handleEmailLogin} | Not tested |
| E0252 | {isArabic ? 'student@eng.asu.edu.eg أو personal@gmail.com' : 'student@eng.asu.edu.eg or personal@gmail.com'} | Input; src/pages/Login.tsx:153 | Update via {e => { setEmail(e.target.value); setErrors(p => ({...p, email: undefined})); }} | type="email"; value={email}; onChange={e => { setEmail(e.target.value); setErrors(p => ({...p, email: undefined})); }} | Not tested |
| E0253 | "••••••••••••" | Input; src/pages/Login.tsx:188 | Update via {e => { setPassword(e.target.value); setErrors(p => ({...p, password: undefined})); }} | type={showPassword ? 'text' : 'password'}; value={password}; onChange={e => { setPassword(e.target.value); setErrors(p => ({...p, password: undefined})); }} | Not tested |
| E0254 | {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />} | button; src/pages/Login.tsx:196 | Trigger {() => setShowPassword(v => !v)} | type="button"; onClick={() => setShowPassword(v => !v)} | Not tested |
| E0255 | {isArabic ? 'نسيت كلمة المرور؟' : 'FORGOT_PASSWORD?'} | Link; src/pages/Login.tsx:209 | Navigate to "/forgot-password" | to="/forgot-password" | Not tested |
| E0256 | {isLoading ? ( <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /><span>{isArabic ? 'جاري التحقق...' : 'AUTHENTICATING...'}</span></> ) : (isArabic ? 'دخول إلى المنصة' : 'CONNECT_TO_NETW | Button; src/pages/Login.tsx:217 | Submit enclosing form | type="submit"; disabled={isLoading} | Not tested |
| E0257 | {isArabic ? 'إنشاء حساب جديد' : 'INITIALIZE_MEMBERSHIP'} | Link; src/pages/Login.tsx:242 | Navigate to "/register" | to="/register" | Not tested |
| E0258 | GoogleAccountModal | GoogleAccountModal; src/pages/Login.tsx:251 | Needs clarification: inspect enclosing link/form or component caller | onClose={() => setShowGoogleModal(false)}; onSuccess={() => navigate('/dashboard')} | Not tested |

### src/pages/MyCourses.tsx — user

| ID | Element / label expression | Selector / source | Source-declared action (expected behavior pending confirmation) | Wiring / conditions | Status |
|---|---|---|---|---|---|
| E0259 | {isArabic ? 'ابحث داخل كورساتك...' : 'Search your courses...'} | Input; src/pages/MyCourses.tsx:73 | Update via {e => setSearch(e.target.value)} | value={search}; onChange={e => setSearch(e.target.value)} | Not tested |
| E0260 | {isArabic ? 'استكشف الدورات' : 'EXPLORE_COURSES'} | Button; src/pages/MyCourses.tsx:95 | Trigger {() => navigate('/courses')} | onClick={() => navigate('/courses')} | Not tested |
| E0261 | <Button variant="cyber" className="h-9 px-3 text-xs font-cyber"> {progress >= 100 ? (isArabic ? 'مراجعة' : 'REVIEW') : (isArabic ? 'متابعة' : 'CONTINUE')} </Button> | Link; src/pages/MyCourses.tsx:126 | Navigate to {`/courses/${course.slug}/learn`} | to={`/courses/${course.slug}/learn`} | Not tested |
| E0262 | {progress >= 100 ? (isArabic ? 'مراجعة' : 'REVIEW') : (isArabic ? 'متابعة' : 'CONTINUE')} | Button; src/pages/MyCourses.tsx:127 | Needs clarification: inspect enclosing link/form or component caller |  | Not tested |

### src/pages/NotFound.tsx — public / conditional / shared

| ID | Element / label expression | Selector / source | Source-declared action (expected behavior pending confirmation) | Wiring / conditions | Status |
|---|---|---|---|---|---|
| E0263 | {isArabic ? 'العودة إلى الصفحة الرئيسية' : 'RETURN_TO_HOME_BASE'} | Button; src/pages/NotFound.tsx:18 | Trigger {() => window.location.href = '/'} | onClick={() => window.location.href = '/'} | Not tested |

### src/pages/Notifications.tsx — user

| ID | Element / label expression | Selector / source | Source-declared action (expected behavior pending confirmation) | Wiring / conditions | Status |
|---|---|---|---|---|---|
| E0264 | <CheckCheck className={`w-3.5 h-3.5 ${isArabic ? 'ml-1.5' : 'mr-1.5'}`} /> {isArabic ? 'تحديد الكل كمقروء' : 'MARK ALL READ'} | Button; src/pages/Notifications.tsx:105 | Trigger {markAllAsRead} | onClick={markAllAsRead} | Not tested |
| E0265 | {isArabic ? `جميع الإشعارات (${notifications.length})` : `ALL DISPATCHES (${notifications.length})`} | button; src/pages/Notifications.tsx:120 | Trigger {() => setFilter('all')} | onClick={() => setFilter('all')} | Not tested |
| E0266 | {isArabic ? `غير المقروء فقط (${unreadCount})` : `UNREAD ONLY (${unreadCount})`} | button; src/pages/Notifications.tsx:130 | Trigger {() => setFilter('unread')} | onClick={() => setFilter('unread')} | Not tested |
| E0267 | <div className="flex items-start gap-4"> <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex-shrink-0"> {getIconForType(notif.type)} </div> <div className="space-y-1"> <div className="flex items-center gap-2"> <h | div; src/pages/Notifications.tsx:160 | Trigger {() => !notif.isRead && notif.id && markAsRead(notif.id)} | onClick={() => !notif.isRead && notif.id && markAsRead(notif.id)} | Not tested |
| E0268 | <Button size="sm" variant="outline" className="text-[11px] font-cyber h-8 px-3 border-primary/30 text-primary hover:bg-primary/10" > {action.label} <ArrowRight className={`w-3 h-3 ${isArabic ? 'mr-1 rotate-180' : 'ml-1'}`} /> </Bu | Link; src/pages/Notifications.tsx:191 | Navigate to {action.path} | to={action.path}; onClick={(e) => e.stopPropagation()} | Not tested |
| E0269 | {action.label} <ArrowRight className={`w-3 h-3 ${isArabic ? 'mr-1 rotate-180' : 'ml-1'}`} /> | Button; src/pages/Notifications.tsx:196 | Needs clarification: inspect enclosing link/form or component caller |  | Not tested |

### src/pages/Profile.tsx — user

| ID | Element / label expression | Selector / source | Source-declared action (expected behavior pending confirmation) | Wiring / conditions | Status |
|---|---|---|---|---|---|
| E0270 | {isArabic ? 'نسخ رقم العضوية' : 'Copy Member ID'} | button; src/pages/Profile.tsx:321 | Trigger {handleCopyId} | onClick={handleCopyId} | Not tested |
| E0271 | <ImagePicker label={isArabic ? 'صورة الملف الشخصي' : 'Profile Picture'} currentImage={formData.photoURL} onImageSelected={(base64) => setFormData({ ...formData, photoURL: base64 })} /> <div className="grid grid-cols-1 md:grid-cols | form; src/pages/Profile.tsx:362 | Submit via {handleProfileUpdate} | onSubmit={handleProfileUpdate} | Not tested |
| E0272 | <ImagePicker label={isArabic ? 'صورة الملف الشخصي' : 'Profile Picture'} currentImage={formData.photoURL} onImageSelected={(base64) => setFormData({ ...formData, photoURL: base64 })} /> <div className="grid grid-cols-1 md:grid-cols | ImagePicker; src/pages/Profile.tsx:363 | Needs clarification: inspect enclosing link/form or component caller | onImageSelected={(base64) => setFormData({ ...formData, photoURL: base64 })} | Not tested |
| E0273 | <User className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${isArabic ? 'right-3' : 'left-3'}`} /> <Input value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} cl | Input; src/pages/Profile.tsx:376 | Update via {(e) => setFormData({ ...formData, fullName: e.target.value })} | value={formData.fullName}; onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} | Not tested |
| E0274 | "+20 123 456 7890" | Input; src/pages/Profile.tsx:389 | Update via {(e) => setFormData({ ...formData, phone: e.target.value })} | value={formData.phone}; onChange={(e) => setFormData({ ...formData, phone: e.target.value })} | Not tested |
| E0275 | <option value="" className="bg-dark-navy">{isArabic ? 'اختر الكلية' : 'Select Faculty'}</option> <option value="Computer Science" className="bg-dark-navy">{isArabic ? 'حاسبات ومعلومات / ذكاء اصطناعي' : 'Computer Science'}</option> | select; src/pages/Profile.tsx:404 | Update via {(e) => setFormData({ ...formData, faculty: e.target.value })} | value={formData.faculty}; onChange={(e) => setFormData({ ...formData, faculty: e.target.value })} | Not tested |
| E0276 | <option value="" className="bg-dark-navy">{isArabic ? 'اختر الفرقة' : 'Select Year'}</option> <option value="1" className="bg-dark-navy">{isArabic ? 'الفرقة الأولى' : 'Year 1'}</option> <option value="2" className="bg-dark-navy">{ | select; src/pages/Profile.tsx:425 | Update via {(e) => setFormData({ ...formData, academicYear: e.target.value })} | value={formData.academicYear}; onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })} | Not tested |
| E0277 | <Save className={`w-4 h-4 ${isArabic ? 'ml-2' : 'mr-2'}`} /> {isArabic ? 'حفظ التعديلات' : 'SAVE_CHANGES'} | Button; src/pages/Profile.tsx:441 | Submit enclosing form | type="submit"; disabled={loading} | Not tested |
| E0278 | {isArabic ? 'تغيير' : 'CHANGE'} | Button; src/pages/Profile.tsx:476 | Trigger {() => startOtpFlow('password')} | onClick={() => startOtpFlow('password')} | Not tested |
| E0279 | {isArabic ? 'تغيير' : 'CHANGE'} | Button; src/pages/Profile.tsx:494 | Trigger {() => startOtpFlow('email')} | onClick={() => startOtpFlow('email')} | Not tested |
| E0280 | <Send className="w-3 h-3" /> {isArabic ? 'إرسال' : 'SEND'} | Button; src/pages/Profile.tsx:518 | Trigger {handleSendPasswordReset} | onClick={handleSendPasswordReset}; disabled={loading} | Not tested |
| E0281 | <LogOut className="w-4 h-4" /> {isArabic ? 'تسجيل الخروج من الحساب' : 'SIGN_OUT'} | Button; src/pages/Profile.tsx:547 | Trigger {async () => { await logout(); navigate('/login'); }} | onClick={async () => { await logout(); navigate('/login'); }} | Not tested |
| E0282 | <X className="w-5 h-5" /> | button; src/pages/Profile.tsx:581 | Trigger {() => setOtpStep('none')} | onClick={() => setOtpStep('none')} | Not tested |
| E0283 | "000000" | Input; src/pages/Profile.tsx:609 | Update via {(e) => setOtpCode(e.target.value.replace(/\D/g, ''))} | value={otpCode}; onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))} | Not tested |
| E0284 | {isArabic ? 'تأكيد الرمز' : 'VERIFY_CODE'} | Button; src/pages/Profile.tsx:619 | Trigger {handleVerifyOTP} | onClick={handleVerifyOTP}; disabled={loading \|\| otpCode.length !== 6} | Not tested |
| E0285 | {timeLeft > 0 ? (isArabic ? `إعادة الإرسال (${timeLeft}ث)` : `RESEND (${timeLeft}s)`) : (isArabic ? 'إعادة الإرسال' : 'RESEND')} | button; src/pages/Profile.tsx:624 | Trigger {() => startOtpFlow(otpAction as any, otpType)} | onClick={() => startOtpFlow(otpAction as any, otpType)}; disabled={timeLeft > 0} | Not tested |
| E0286 | <Smartphone className={`w-3 h-3 ${isArabic ? 'ml-2' : 'mr-2'}`} /> {isArabic ? 'استخدام رسالة نصية SMS' : 'USE SMS FALLBACK'} | Button; src/pages/Profile.tsx:633 | Trigger {() => startOtpFlow(otpAction as any, 'phone')} | onClick={() => startOtpFlow(otpAction as any, 'phone')} | Not tested |
| E0287 | "new@example.com" | Input; src/pages/Profile.tsx:653 | Update via {(e) => setNewEmail(e.target.value)} | type="email"; value={newEmail}; onChange={(e) => setNewEmail(e.target.value)} | Not tested |
| E0288 | "••••••••" | Input; src/pages/Profile.tsx:667 | Update via {(e) => setNewPassword(e.target.value)} | type="password"; value={newPassword}; onChange={(e) => setNewPassword(e.target.value)} | Not tested |
| E0289 | "••••••••" | Input; src/pages/Profile.tsx:678 | Update via {(e) => setConfirmPassword(e.target.value)} | type="password"; value={confirmPassword}; onChange={(e) => setConfirmPassword(e.target.value)} | Not tested |
| E0290 | {isArabic ? 'تأكيد التحديث' : 'FINALIZE_UPDATE'} <ArrowRight className={`w-4 h-4 ${isArabic ? 'mr-2 rotate-180' : 'ml-2'}`} /> | Button; src/pages/Profile.tsx:688 | Trigger {finalizeAction} | onClick={finalizeAction}; disabled={loading} | Not tested |

### src/pages/Projects.tsx — public / conditional / shared

| ID | Element / label expression | Selector / source | Source-declared action (expected behavior pending confirmation) | Wiring / conditions | Status |
|---|---|---|---|---|---|
| E0291 | <Plus className="w-4 h-4" /> {isArabic ? 'أضف مشروعك للتوثيق' : 'SUBMIT YOUR PROJECT'} | Button; src/pages/Projects.tsx:221 | Trigger {() => setShowSubmitModal(true)} | onClick={() => setShowSubmitModal(true)} | Not tested |
| E0292 | {cat.label} | button; src/pages/Projects.tsx:236 | Trigger {() => setSelectedCat(cat.key)} | onClick={() => setSelectedCat(cat.key)} | Not tested |
| E0293 | {isArabic ? 'بحث في المشاريع والتقنيات والمطورين...' : 'Search projects, stack, authors...'} | input; src/pages/Projects.tsx:252 | Update via {(e) => setSearch(e.target.value)} | type="text"; value={search}; onChange={(e) => setSearch(e.target.value)} | Not tested |
| E0294 | {showSampleProjects ? (isArabic ? 'إخفاء المشاريع التجريبية' : 'HIDE SAMPLE PROJECTS') : (isArabic ? 'معاينة مشاريع تجريبية' : 'PREVIEW SAMPLE PROJECTS') } | Button; src/pages/Projects.tsx:284 | Trigger {() => setShowSampleProjects(!showSampleProjects)} | onClick={() => setShowSampleProjects(!showSampleProjects)} | Not tested |
| E0295 | {isArabic ? 'أضف أول مشروع الآن' : 'SUBMIT FIRST PROJECT'} | Button; src/pages/Projects.tsx:294 | Trigger {() => setShowSubmitModal(true)} | onClick={() => setShowSubmitModal(true)} | Not tested |
| E0296 | <Eye className="w-3.5 h-3.5" /> {isArabic ? 'عرض دراسة الحالة' : 'VIEW CASE STUDY'} | Button; src/pages/Projects.tsx:350 | Trigger {() => setSelectedProject(project)} | onClick={() => setSelectedProject(project)} | Not tested |
| E0297 | <Button variant="outline" size="sm" className="gap-1.5 text-xs font-cyber"> <Github className="w-3.5 h-3.5" /> {isArabic ? 'الكود المصدري' : 'SOURCE'} </Button> | a; src/pages/Projects.tsx:360 | Open {project.githubUrl} | href={project.githubUrl} | Not tested |
| E0298 | <Github className="w-3.5 h-3.5" /> {isArabic ? 'الكود المصدري' : 'SOURCE'} | Button; src/pages/Projects.tsx:361 | Needs clarification: inspect enclosing link/form or component caller |  | Not tested |
| E0299 | <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="max-w-3xl w-full glass p-6 sm:p-10 rounded-3xl bo | motion.div; src/pages/Projects.tsx:377 | Trigger {() => setSelectedProject(null)} | onClick={() => setSelectedProject(null)} | Not tested |
| E0300 | <button onClick={() => setSelectedProject(null)} className={`absolute top-6 ${isArabic ? 'left-6' : 'right-6'} p-2 rounded-xl bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white transition-colors`} > <X className=" | motion.div; src/pages/Projects.tsx:384 | Trigger {(e) => e.stopPropagation()} | onClick={(e) => e.stopPropagation()} | Not tested |
| E0301 | <X className="w-5 h-5" /> | button; src/pages/Projects.tsx:391 | Trigger {() => setSelectedProject(null)} | onClick={() => setSelectedProject(null)} | Not tested |
| E0302 | <Button variant="outline" size="sm" className="gap-2 text-xs font-cyber"> <Github className="w-4 h-4" /> {isArabic ? 'المستودع على GitHub' : 'VIEW ON GITHUB'} </Button> | a; src/pages/Projects.tsx:421 | Open {selectedProject.githubUrl} | href={selectedProject.githubUrl} | Not tested |
| E0303 | <Github className="w-4 h-4" /> {isArabic ? 'المستودع على GitHub' : 'VIEW ON GITHUB'} | Button; src/pages/Projects.tsx:422 | Needs clarification: inspect enclosing link/form or component caller |  | Not tested |
| E0304 | <Button variant="cyber" size="sm" className="gap-2 text-xs font-cyber"> <ExternalLink className="w-4 h-4" /> {isArabic ? 'المعاينة الحية' : 'LIVE DEPLOYMENT'} </Button> | a; src/pages/Projects.tsx:429 | Open {selectedProject.liveUrl} | href={selectedProject.liveUrl} | Not tested |
| E0305 | <ExternalLink className="w-4 h-4" /> {isArabic ? 'المعاينة الحية' : 'LIVE DEPLOYMENT'} | Button; src/pages/Projects.tsx:430 | Needs clarification: inspect enclosing link/form or component caller |  | Not tested |
| E0306 | {isArabic ? 'إغلاق' : 'CLOSE'} | Button; src/pages/Projects.tsx:437 | Trigger {() => setSelectedProject(null)} | onClick={() => setSelectedProject(null)} | Not tested |
| E0307 | <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="max-w-2xl w-full glass p-6 sm:p-10 rounded-3xl bo | motion.div; src/pages/Projects.tsx:449 | Trigger {() => setShowSubmitModal(false)} | onClick={() => setShowSubmitModal(false)} | Not tested |
| E0308 | <button onClick={() => setShowSubmitModal(false)} className={`absolute top-6 ${isArabic ? 'left-6' : 'right-6'} p-2 rounded-xl bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white transition-colors`} > <X className= | motion.div; src/pages/Projects.tsx:456 | Trigger {(e) => e.stopPropagation()} | onClick={(e) => e.stopPropagation()} | Not tested |
| E0309 | <X className="w-5 h-5" /> | button; src/pages/Projects.tsx:463 | Trigger {() => setShowSubmitModal(false)} | onClick={() => setShowSubmitModal(false)} | Not tested |
| E0310 | <div> <label className="text-xs font-cyber text-gray-300 block mb-1"> {isArabic ? 'عنوان المشروع *' : 'PROJECT TITLE *'} </label> <input type="text" required placeholder={isArabic ? 'مثال: محلل المشاعر للنصوص العربية' : 'e.g. Arab | form; src/pages/Projects.tsx:482 | Submit via {handleProjectSubmit} | onSubmit={handleProjectSubmit} | Not tested |
| E0311 | {isArabic ? 'مثال: محلل المشاعر للنصوص العربية' : 'e.g. Arabic Sentiment Analyzer'} | input; src/pages/Projects.tsx:487 | Update via {e => setSubmitForm({ ...submitForm, title: e.target.value })} | type="text"; required=true; value={submitForm.title}; onChange={e => setSubmitForm({ ...submitForm, title: e.target.value })} | Not tested |
| E0312 | <option value="Machine Learning">{isArabic ? 'تعلم الآلة' : 'Machine Learning'}</option> <option value="Computer Vision">{isArabic ? 'رؤية الحاسوب' : 'Computer Vision'}</option> <option value="Data Science">{isArabic ? 'علم البيان | select; src/pages/Projects.tsx:501 | Update via {e => setSubmitForm({ ...submitForm, category: e.target.value })} | value={submitForm.category}; onChange={e => setSubmitForm({ ...submitForm, category: e.target.value })} | Not tested |
| E0313 | "Python, PyTorch, FastAPI, React" | input; src/pages/Projects.tsx:517 | Update via {e => setSubmitForm({ ...submitForm, technologies: e.target.value })} | type="text"; value={submitForm.technologies}; onChange={e => setSubmitForm({ ...submitForm, technologies: e.target.value })} | Not tested |
| E0314 | {isArabic ? 'اشرح ما يقدمه المشروع، معمارية النموذج، مجموعة البيانات المستخدمة، وأهم النتائج...' : 'Explain what the project does, the model architecture, dataset used, and key findings...'} | textarea; src/pages/Projects.tsx:530 | Update via {e => setSubmitForm({ ...submitForm, description: e.target.value })} | required=true; value={submitForm.description}; onChange={e => setSubmitForm({ ...submitForm, description: e.target.value })} | Not tested |
| E0315 | "https://github.com/..." | input; src/pages/Projects.tsx:545 | Update via {e => setSubmitForm({ ...submitForm, githubUrl: e.target.value })} | type="url"; value={submitForm.githubUrl}; onChange={e => setSubmitForm({ ...submitForm, githubUrl: e.target.value })} | Not tested |
| E0316 | "https://my-model.app" | input; src/pages/Projects.tsx:557 | Update via {e => setSubmitForm({ ...submitForm, liveUrl: e.target.value })} | type="url"; value={submitForm.liveUrl}; onChange={e => setSubmitForm({ ...submitForm, liveUrl: e.target.value })} | Not tested |
| E0317 | {isArabic ? 'إلغاء' : 'CANCEL'} | Button; src/pages/Projects.tsx:568 | Trigger {() => setShowSubmitModal(false)} | type="button"; onClick={() => setShowSubmitModal(false)} | Not tested |
| E0318 | {submitting ? (isArabic ? 'جاري الإرسال...' : 'TRANSMITTING...') : (isArabic ? 'إرسال المشروع' : 'TRANSMIT PROJECT') } | Button; src/pages/Projects.tsx:571 | Submit enclosing form | type="submit"; disabled={submitting} | Not tested |

### src/pages/PublicFormView.tsx — public / conditional / shared

| ID | Element / label expression | Selector / source | Source-declared action (expected behavior pending confirmation) | Wiring / conditions | Status |
|---|---|---|---|---|---|
| E0319 | {isArabic ? 'العودة للصفحة الرئيسية' : 'Return to Club Home'} | Link; src/pages/PublicFormView.tsx:384 | Navigate to "/" | to="/" | Not tested |
| E0320 | <LogIn className="w-4 h-4 text-primary" /> <span>{isArabic ? 'تسجيل الدخول بواسطة Google' : 'Sign in with Google'}</span> | button; src/pages/PublicFormView.tsx:417 | Trigger {() => loginWithGoogle(location.pathname)} | onClick={() => loginWithGoogle(location.pathname)} | Not tested |
| E0321 | {isArabic ? 'زيارة نادي DataCamp' : 'Visit Club Portal'} | Link; src/pages/PublicFormView.tsx:457 | Navigate to "/" | to="/" | Not tested |
| E0322 | {isArabic ? 'إرسال رد آخر' : 'Submit Another Response'} | button; src/pages/PublicFormView.tsx:465 | Trigger {() => { setAnswers({}); setSubmissionSuccess(false); setCurrentSectionIndex(0); }} | type="button"; onClick={() => { setAnswers({}); setSubmissionSuccess(false); setCurrentSectionIndex(0); }} | Not tested |
| E0323 | <Logo iconSize={32} /> | Link; src/pages/PublicFormView.tsx:501 | Navigate to "/" | to="/" | Not tested |
| E0324 | {/* Honeypot hidden input */} <input type="text" name="club_hp_field" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} tabIndex={-1} autoComplete="off" className="opacity-0 absolute -left-[9999px] pointer-events-none | form; src/pages/PublicFormView.tsx:557 | Submit via {handleSubmit} | onSubmit={handleSubmit} | Not tested |
| E0325 | "club_hp_field" | input; src/pages/PublicFormView.tsx:559 | Update via {(e) => setHoneypot(e.target.value)} | type="text"; value={honeypot}; onChange={(e) => setHoneypot(e.target.value)} | Not tested |
| E0326 | {q.settings?.placeholder \|\| (isArabic ? 'إجابتك...' : 'Your answer...')} | input; src/pages/PublicFormView.tsx:594 | Update via {(e) => handleAnswerChange(q.id, e.target.value)} | type="text"; value={currentVal \|\| ''}; onChange={(e) => handleAnswerChange(q.id, e.target.value)} | Not tested |
| E0327 | {q.settings?.placeholder \|\| (isArabic ? 'اكتب إجابتك بالتفصيل هنا...' : 'Enter your detailed answer here...')} | textarea; src/pages/PublicFormView.tsx:605 | Update via {(e) => handleAnswerChange(q.id, e.target.value)} | value={currentVal \|\| ''}; onChange={(e) => handleAnswerChange(q.id, e.target.value)} | Not tested |
| E0328 | <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${ isChecked ? 'border-primary bg-primary text-white' : 'border-white/30 bg-transparent' }`} > {isChecked && <div className=" | label; src/pages/PublicFormView.tsx:620 | Trigger {() => handleAnswerChange(q.id, opt.text)} | onClick={() => handleAnswerChange(q.id, opt.text)} | Not tested |
| E0329 | <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${ isChecked ? 'border-primary bg-primary text-white' : 'border-white/30 bg-transparent' }`} > {isChecked && <Check className=" | label; src/pages/PublicFormView.tsx:651 | Trigger {() => handleMultipleChoiceToggle(q.id, opt.text)} | onClick={() => handleMultipleChoiceToggle(q.id, opt.text)} | Not tested |
| E0330 | <option value="">{isArabic ? '-- اختر خياراً من القائمة --' : '-- Select an option --'}</option> {(q.options \\|\\| []).map((opt) => ( <option key={opt.id} value={opt.text} className="bg-dark-navy text-foreground"> {opt.text} </opti | select; src/pages/PublicFormView.tsx:678 | Update via {(e) => handleAnswerChange(q.id, e.target.value)} | value={currentVal \|\| ''}; onChange={(e) => handleAnswerChange(q.id, e.target.value)} | Not tested |
| E0331 | {q.settings?.ratingIcon === 'heart' ? ( <Heart className={`w-7 h-7 ${ isSelected ? 'fill-rose-500 text-rose-500' : 'text-white/20' }`} /> ) : q.settings?.ratingIcon === 'number' ? ( <span className={`w-8 h-8 rounded-xl border flex | button; src/pages/PublicFormView.tsx:699 | Trigger {() => handleAnswerChange(q.id, val)} | type="button"; onClick={() => handleAnswerChange(q.id, val)} | Not tested |
| E0332 | {val} | button; src/pages/PublicFormView.tsx:745 | Trigger {() => handleAnswerChange(q.id, val)} | type="button"; onClick={() => handleAnswerChange(q.id, val)} | Not tested |
| E0333 | input | input; src/pages/PublicFormView.tsx:765 | Update via {(e) => handleAnswerChange(q.id, e.target.value)} | type="date"; value={currentVal \|\| ''}; onChange={(e) => handleAnswerChange(q.id, e.target.value)} | Not tested |
| E0334 | input | input; src/pages/PublicFormView.tsx:775 | Update via {(e) => handleAnswerChange(q.id, e.target.value)} | type="time"; value={currentVal \|\| ''}; onChange={(e) => handleAnswerChange(q.id, e.target.value)} | Not tested |
| E0335 | "42" | input; src/pages/PublicFormView.tsx:785 | Update via {(e) => handleAnswerChange(q.id, e.target.value)} | type="number"; value={currentVal \|\| ''}; onChange={(e) => handleAnswerChange(q.id, e.target.value)} | Not tested |
| E0336 | "name@example.com" | input; src/pages/PublicFormView.tsx:796 | Update via {(e) => handleAnswerChange(q.id, e.target.value)} | type="email"; value={currentVal \|\| ''}; onChange={(e) => handleAnswerChange(q.id, e.target.value)} | Not tested |
| E0337 | <Upload className="w-7 h-7 text-primary mb-2 group-hover:scale-110 transition-transform" /> <span className="text-xs font-semibold text-foreground"> {uploadingFiles[q.id] ? (isArabic ? 'جاري الرفع إلى سحابة Supabase...' : 'Uploadi | input; src/pages/PublicFormView.tsx:817 | Update via {(e) => handleFileUpload(q.id, e)} | type="file"; disabled={uploadingFiles[q.id]}; onChange={(e) => handleFileUpload(q.id, e)} | Not tested |
| E0338 | "you@example.com" | input; src/pages/PublicFormView.tsx:846 | Update via {(e) => setRespondentEmail(e.target.value)} | type="email"; required=true; value={respondentEmail}; onChange={(e) => setRespondentEmail(e.target.value)} | Not tested |
| E0339 | <ArrowLeft className="w-4 h-4 rtl:rotate-180" /> <span>{isArabic ? 'السابق' : 'Previous'}</span> | button; src/pages/PublicFormView.tsx:860 | Trigger {handlePrevSection} | type="button"; onClick={handlePrevSection} | Not tested |
| E0340 | <span>{isArabic ? 'التالي' : 'Next'}</span> <ArrowRight className="w-4 h-4 rtl:rotate-180" /> | button; src/pages/PublicFormView.tsx:871 | Trigger {handleNextSection} | type="button"; onClick={handleNextSection} | Not tested |
| E0341 | {isSubmitting ? ( <Loader2 className="w-4 h-4 animate-spin" /> ) : ( <Send className="w-4 h-4" /> )} <span>{isArabic ? 'إرسال الاستجابة' : 'Submit Form'}</span> | button; src/pages/PublicFormView.tsx:880 | Submit enclosing form | type="submit"; disabled={isSubmitting} | Not tested |

### src/pages/Register.tsx — public / conditional / shared

| ID | Element / label expression | Selector / source | Source-declared action (expected behavior pending confirmation) | Wiring / conditions | Status |
|---|---|---|---|---|---|
| E0342 | {isLoading ? ( <><div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /><span>{isArabic ? 'جاري الاتصال بـ Google...' : 'CONNECTING TO GOOGLE...'}</span></> ) : ( <><GoogleIcon /><span>{is | Button; src/pages/Register.tsx:124 | Trigger {handleGoogleSignUp} | type="button"; onClick={handleGoogleSignUp}; disabled={isLoading} | Not tested |
| E0343 | {isArabic ? '⚡ تجربة الحسابات السريعة (حساب المشرف / حساب العضو)' : '⚡ Quick Demo Accounts Switcher'} | button; src/pages/Register.tsx:140 | Trigger {() => setShowGoogleModal(true)} | type="button"; onClick={() => setShowGoogleModal(true)} | Not tested |
| E0344 | {/* Full Name */} <div className="space-y-1"> <label className="text-[10px] font-cyber text-muted-foreground uppercase tracking-widest"> {isArabic ? 'الاسم بالكامل' : 'Full Name'} </label> <div className="relative"> <UserIcon clas | form; src/pages/Register.tsx:163 | Submit via {handleEmailRegister} | onSubmit={handleEmailRegister} | Not tested |
| E0345 | {isArabic ? 'أحمد منصور' : 'Ahmed Mansour'} | Input; src/pages/Register.tsx:171 | Update via {e => { setFullName(e.target.value); setErrors(p => ({...p, fullName: undefined})); }} | type="text"; value={fullName}; onChange={e => { setFullName(e.target.value); setErrors(p => ({...p, fullName: undefined})); }} | Not tested |
| E0346 | {isArabic ? 'student@eng.asu.edu.eg أو personal@gmail.com' : 'student@eng.asu.edu.eg or personal@gmail.com'} | Input; src/pages/Register.tsx:192 | Update via {e => { setEmail(e.target.value); setErrors(p => ({...p, email: undefined})); }} | type="email"; value={email}; onChange={e => { setEmail(e.target.value); setErrors(p => ({...p, email: undefined})); }} | Not tested |
| E0347 | "••••••••••••" | Input; src/pages/Register.tsx:226 | Update via {e => { setPassword(e.target.value); setErrors(p => ({...p, password: undefined})); }} | type={showPassword ? 'text' : 'password'}; value={password}; onChange={e => { setPassword(e.target.value); setErrors(p => ({...p, password: undefined})); }} | Not tested |
| E0348 | {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />} | button; src/pages/Register.tsx:233 | Trigger {() => setShowPassword(v => !v)} | type="button"; onClick={() => setShowPassword(v => !v)} | Not tested |
| E0349 | "••••••••••••" | Input; src/pages/Register.tsx:252 | Update via {e => { setConfirmPassword(e.target.value); setErrors(p => ({...p, confirmPassword: undefined})); }} | type={showPassword ? 'text' : 'password'}; value={confirmPassword}; onChange={e => { setConfirmPassword(e.target.value); setErrors(p => ({...p, confirmPassword: undefined})); }} | Not tested |
| E0350 | {isLoading ? ( <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin mr-2" /><span>{isArabic ? 'جاري التسجيل...' : 'INITIALIZING...'}</span></> ) : (isArabic ? 'تسجيل العضوية بالمنصة' : 'ENROL | Button; src/pages/Register.tsx:263 | Submit enclosing form | type="submit"; disabled={isLoading} | Not tested |
| E0351 | {isArabic ? 'تسجيل الدخول' : 'ACCESS_PORTAL'} | Link; src/pages/Register.tsx:279 | Navigate to "/login" | to="/login" | Not tested |
| E0352 | GoogleAccountModal | GoogleAccountModal; src/pages/Register.tsx:288 | Needs clarification: inspect enclosing link/form or component caller | onClose={() => setShowGoogleModal(false)}; onSuccess={() => navigate('/dashboard')} | Not tested |

### src/pages/ResetPassword.tsx — public / conditional / shared

| ID | Element / label expression | Selector / source | Source-declared action (expected behavior pending confirmation) | Wiring / conditions | Status |
|---|---|---|---|---|---|
| E0353 | {isArabic ? 'تسجيل الدخول الآن' : 'PROCEED TO LOGIN'} | Button; src/pages/ResetPassword.tsx:67 | Trigger {() => navigate('/login')} | onClick={() => navigate('/login')} | Not tested |
| E0354 | <div className="space-y-1.5"> <label className="text-xs font-cyber uppercase tracking-widest text-muted-foreground"> {isArabic ? 'كلمة المرور الجديدة' : 'New Password'} </label> <div className="relative"> <Input type={showPassword | form; src/pages/ResetPassword.tsx:72 | Submit via {handleUpdatePassword} | onSubmit={handleUpdatePassword} | Not tested |
| E0355 | "••••••••" | Input; src/pages/ResetPassword.tsx:78 | Update via {(e) => setPassword(e.target.value)} | type={showPassword ? 'text' : 'password'}; value={password}; onChange={(e) => setPassword(e.target.value)}; required=true | Not tested |
| E0356 | {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />} | button; src/pages/ResetPassword.tsx:86 | Trigger {() => setShowPassword(!showPassword)} | type="button"; onClick={() => setShowPassword(!showPassword)} | Not tested |
| E0357 | "••••••••" | Input; src/pages/ResetPassword.tsx:100 | Update via {(e) => setConfirmPassword(e.target.value)} | type={showPassword ? 'text' : 'password'}; value={confirmPassword}; onChange={(e) => setConfirmPassword(e.target.value)}; required=true | Not tested |
| E0358 | {loading ? (isArabic ? 'جاري الحفظ...' : 'UPDATING...') : (isArabic ? 'تحديث كلمة المرور' : 'UPDATE PASSWORD')} | Button; src/pages/ResetPassword.tsx:109 | Submit enclosing form | type="submit"; disabled={loading} | Not tested |

### src/pages/Staff.tsx — public / conditional / shared

| ID | Element / label expression | Selector / source | Source-declared action (expected behavior pending confirmation) | Wiring / conditions | Status |
|---|---|---|---|---|---|
| E0359 | <Button variant="cyber" size="sm" className="gap-2 shrink-0"> <Briefcase className="w-4 h-4" /> {isArabic ? 'التقديم للانضمام للجان' : 'APPLY FOR COMMITTEES'} </Button> | Link; src/pages/Staff.tsx:281 | Navigate to "/contact" | to="/contact" | Not tested |
| E0360 | <Briefcase className="w-4 h-4" /> {isArabic ? 'التقديم للانضمام للجان' : 'APPLY FOR COMMITTEES'} | Button; src/pages/Staff.tsx:282 | Needs clarification: inspect enclosing link/form or component caller |  | Not tested |
| E0361 | {cat.label} | button; src/pages/Staff.tsx:293 | Trigger {() => setSelectedCat(cat.key)} | onClick={() => setSelectedCat(cat.key)} | Not tested |
| E0362 | {isArabic ? 'بحث في الأعضاء، الأدوار، واللجان...' : 'Search members, roles, committees...'} | input; src/pages/Staff.tsx:309 | Update via {(e) => setSearch(e.target.value)} | type="text"; value={search}; onChange={(e) => setSearch(e.target.value)} | Not tested |
| E0363 | {showSampleStaff ? (isArabic ? 'إخفاء الهيكل التنظيمي' : 'HIDE SAMPLE STRUCTURE') : (isArabic ? 'معاينة الهيكل التنظيمي' : 'PREVIEW ORGANIZATIONAL STRUCTURE') } | Button; src/pages/Staff.tsx:342 | Trigger {() => setShowSampleStaff(!showSampleStaff)} | onClick={() => setShowSampleStaff(!showSampleStaff)} | Not tested |
| E0364 | <Button variant="outline" size="sm"> {isArabic ? 'انضم لإحدى اللجان' : 'JOIN A COMMITTEE'} </Button> | Link; src/pages/Staff.tsx:352 | Navigate to "/contact" | to="/contact" | Not tested |
| E0365 | {isArabic ? 'انضم لإحدى اللجان' : 'JOIN A COMMITTEE'} | Button; src/pages/Staff.tsx:353 | Needs clarification: inspect enclosing link/form or component caller |  | Not tested |
| E0366 | <Icon className="w-3.5 h-3.5" /> | a; src/pages/Staff.tsx:430 | Open {social.url} | href={social.url} | Not tested |

### src/pages/Terms.tsx — public / conditional / shared

| ID | Element / label expression | Selector / source | Source-declared action (expected behavior pending confirmation) | Wiring / conditions | Status |
|---|---|---|---|---|---|
| E0367 | <span>{isArabic ? '← لديك استفسارات؟ تفضل بزيارة صفحة الأسئلة الشائعة (FAQ)' : '← Have questions? Review our Frequently Asked Questions (FAQ)'}</span> | Link; src/pages/Terms.tsx:141 | Navigate to "/faq" | to="/faq" | Not tested |

### src/pages/VerifyEmail.tsx — public / conditional / shared

| ID | Element / label expression | Selector / source | Source-declared action (expected behavior pending confirmation) | Wiring / conditions | Status |
|---|---|---|---|---|---|
| E0368 | <Button variant="cyber" className="w-full gap-2 font-cyber text-xs h-11 tracking-wider"> <ExternalLink className="w-4 h-4" /> {isArabic ? 'فتح بريد أوفيس 365 الجامعي' : 'OPEN OUTLOOK / OFFICE 365'} </Button> | a; src/pages/VerifyEmail.tsx:103 | Open {emailInfo.webmailUrl} | href={emailInfo.webmailUrl} | Not tested |
| E0369 | <ExternalLink className="w-4 h-4" /> {isArabic ? 'فتح بريد أوفيس 365 الجامعي' : 'OPEN OUTLOOK / OFFICE 365'} | Button; src/pages/VerifyEmail.tsx:104 | Needs clarification: inspect enclosing link/form or component caller |  | Not tested |
| E0370 | <Button variant="cyber" className="w-full gap-2 font-cyber text-xs h-11 tracking-wider"> <ExternalLink className="w-4 h-4" /> {isArabic ? 'فتح بريد GOOGLE GMAIL' : 'OPEN GOOGLE GMAIL'} </Button> | a; src/pages/VerifyEmail.tsx:110 | Open "https://mail.google.com/" | href="https://mail.google.com/" | Not tested |
| E0371 | <ExternalLink className="w-4 h-4" /> {isArabic ? 'فتح بريد GOOGLE GMAIL' : 'OPEN GOOGLE GMAIL'} | Button; src/pages/VerifyEmail.tsx:111 | Needs clarification: inspect enclosing link/form or component caller |  | Not tested |
| E0372 | <Button variant="outline" className="w-full text-xs font-mono border-white/10 hover:border-primary/40 gap-1.5 h-10"> <ExternalLink className="w-3.5 h-3.5" /> Gmail </Button> | a; src/pages/VerifyEmail.tsx:118 | Open "https://mail.google.com/" | href="https://mail.google.com/" | Not tested |
| E0373 | <ExternalLink className="w-3.5 h-3.5" /> Gmail | Button; src/pages/VerifyEmail.tsx:119 | Needs clarification: inspect enclosing link/form or component caller |  | Not tested |
| E0374 | <Button variant="outline" className="w-full text-xs font-mono border-white/10 hover:border-primary/40 gap-1.5 h-10"> <ExternalLink className="w-3.5 h-3.5" /> Outlook </Button> | a; src/pages/VerifyEmail.tsx:123 | Open "https://outlook.office.com/mail/" | href="https://outlook.office.com/mail/" | Not tested |
| E0375 | <ExternalLink className="w-3.5 h-3.5" /> Outlook | Button; src/pages/VerifyEmail.tsx:124 | Needs clarification: inspect enclosing link/form or component caller |  | Not tested |
| E0376 | {checking ? <RefreshCw className={`w-4 h-4 ${isArabic ? 'ml-2' : 'mr-2'} animate-spin`} /> : null} {isArabic ? 'فحص حالة التفعيل الآن' : 'CHECK_VERIFICATION_STATUS'} | Button; src/pages/VerifyEmail.tsx:133 | Trigger {handleCheckStatus} | onClick={handleCheckStatus}; disabled={checking} | Not tested |
| E0377 | {loading ? <RefreshCw className={`w-4 h-4 ${isArabic ? 'ml-2' : 'mr-2'} animate-spin`} /> : null} {isArabic ? 'إعادة إرسال رابط التفعيل' : 'RESEND_VERIFICATION_LINK'} | Button; src/pages/VerifyEmail.tsx:138 | Trigger {handleResend} | onClick={handleResend}; disabled={loading} | Not tested |
| E0378 | <LogOut className="w-3.5 h-3.5" /> <span>{isArabic ? 'تسجيل الخروج' : 'DISCONNECT_SESSION'}</span> | button; src/pages/VerifyEmail.tsx:146 | Trigger {handleLogout} | onClick={handleLogout} | Not tested |

### src/pages/admin/BlogManagement.tsx — admin

| ID | Element / label expression | Selector / source | Source-declared action (expected behavior pending confirmation) | Wiring / conditions | Status |
|---|---|---|---|---|---|
| E0379 | <Plus className="w-4 h-4 mr-2" /> NEW_POST | Button; src/pages/admin/BlogManagement.tsx:100 | Trigger {() => setShowAddModal(true)} | onClick={() => setShowAddModal(true)} | Not tested |
| E0380 | <Edit3 className="w-4 h-4" /> | Button; src/pages/admin/BlogManagement.tsx:120 | Needs clarification: inspect enclosing link/form or component caller |  | Not tested |
| E0381 | <Trash2 className="w-4 h-4" /> | Button; src/pages/admin/BlogManagement.tsx:121 | Trigger {() => setDeleteConfirmId(post.id)} | onClick={() => setDeleteConfirmId(post.id)} | Not tested |
| E0382 | ABORT | Button; src/pages/admin/BlogManagement.tsx:139 | Trigger {() => setDeleteConfirmId(null)} | onClick={() => setDeleteConfirmId(null)} | Not tested |
| E0383 | CONFIRM_PURGE | Button; src/pages/admin/BlogManagement.tsx:140 | Trigger {() => { deletePost(deleteConfirmId); setDeleteConfirmId(null); }} | onClick={() => { deletePost(deleteConfirmId); setDeleteConfirmId(null); }} | Not tested |
| E0384 | <label className="text-[10px] font-cyber uppercase tracking-widest text-muted-foreground">Title</label> <Input value={newPost.title} onChange={(e) => setNewPost({...newPost, title: e.target.value})} /> | Input; src/pages/admin/BlogManagement.tsx:156 | Update via {(e) => setNewPost({...newPost, title: e.target.value})} | value={newPost.title}; onChange={(e) => setNewPost({...newPost, title: e.target.value})} | Not tested |
| E0385 | <label className="text-[10px] font-cyber uppercase tracking-widest text-muted-foreground">Excerpt / Summary</label> <textarea className="w-full bg-white/5 border border-white/10 rounded-md p-3 text-sm focus:ring-1 focus:ring-prima | textarea; src/pages/admin/BlogManagement.tsx:160 | Update via {(e) => setNewPost({...newPost, excerpt: e.target.value})} | value={newPost.excerpt}; onChange={(e) => setNewPost({...newPost, excerpt: e.target.value})} | Not tested |
| E0386 | <label className="text-[10px] font-cyber uppercase tracking-widest text-muted-foreground">Author Identification (Optional)</label> <UserIdentityInput suggestions={users} onValueChange={(val, type) => { setNewPost({...newPost, auth | UserIdentityInput; src/pages/admin/BlogManagement.tsx:168 | Accept input; validation/consumer shown in source | onValueChange={(val, type) => { setNewPost({...newPost, author: val}); setAuthorType(type); }} | Not tested |
| E0387 | ABORT | Button; src/pages/admin/BlogManagement.tsx:177 | Trigger {() => { setShowAddModal(false); resetForm(); }} | onClick={() => { setShowAddModal(false); resetForm(); }} | Not tested |
| E0388 | {isSubmitting ? 'PUBLISHING...' : 'PUBLISH'} | Button; src/pages/admin/BlogManagement.tsx:178 | Trigger {addPost} | onClick={addPost}; disabled={isSubmitting} | Not tested |

### src/pages/admin/ContentManagement.tsx — admin

| ID | Element / label expression | Selector / source | Source-declared action (expected behavior pending confirmation) | Wiring / conditions | Status |
|---|---|---|---|---|---|
| E0389 | <Save className="w-4 h-4 mr-2" /> Save All Changes | Button; src/pages/admin/ContentManagement.tsx:95 | Trigger {handleSave} | onClick={handleSave} | Not tested |
| E0390 | <page.icon className="w-4 h-4" /> <span className="text-xs font-cyber uppercase tracking-widest">{page.name}</span> | button; src/pages/admin/ContentManagement.tsx:103 | Trigger {() => setActiveTab(page.id)} | onClick={() => setActiveTab(page.id)} | Not tested |
| E0391 | <label className="text-[10px] font-cyber uppercase tracking-widest text-muted-foreground">Main Heading</label> <Input value={homeContent.heroTitle} onChange={(e) => setHomeContent({...homeContent, heroTitle: e.target.value})} /> | Input; src/pages/admin/ContentManagement.tsx:129 | Update via {(e) => setHomeContent({...homeContent, heroTitle: e.target.value})} | value={homeContent.heroTitle}; onChange={(e) => setHomeContent({...homeContent, heroTitle: e.target.value})} | Not tested |
| E0392 | <label className="text-[10px] font-cyber uppercase tracking-widest text-muted-foreground">Sub-heading</label> <textarea className="w-full bg-white/5 border border-white/10 rounded-md p-3 text-sm focus:ring-1 focus:ring-primary out | textarea; src/pages/admin/ContentManagement.tsx:136 | Update via {(e) => setHomeContent({...homeContent, heroSubtitle: e.target.value})} | value={homeContent.heroSubtitle}; onChange={(e) => setHomeContent({...homeContent, heroSubtitle: e.target.value})} | Not tested |
| E0393 | <Input value={stat.value} className="h-8 text-center font-bold" onChange={(e) => { const newStats = [...homeContent.stats]; newStats[idx].value = e.target.value; setHomeContent({...homeContent, stats: newStats}); }} /> <Input valu | Input; src/pages/admin/ContentManagement.tsx:148 | Update via {(e) => { const newStats = [...homeContent.stats]; newStats[idx].value = e.target.value; setHomeContent({...homeContent, stats: newStats}); }} | value={stat.value}; onChange={(e) => { const newStats = [...homeContent.stats]; newStats[idx].value = e.target.value; setHomeContent({...homeContent, stats: newStats}); }} | Not tested |
| E0394 | <Input value={stat.value} className="h-8 text-center font-bold" onChange={(e) => { const newStats = [...homeContent.stats]; newStats[idx].value = e.target.value; setHomeContent({...homeContent, stats: newStats}); }} /> <Input valu | Input; src/pages/admin/ContentManagement.tsx:157 | Update via {(e) => { const newStats = [...homeContent.stats]; newStats[idx].label = e.target.value; setHomeContent({...homeContent, stats: newStats}); }} | value={stat.label}; onChange={(e) => { const newStats = [...homeContent.stats]; newStats[idx].label = e.target.value; setHomeContent({...homeContent, stats: newStats}); }} | Not tested |
| E0395 | <label className="text-[10px] font-cyber uppercase tracking-widest text-muted-foreground">Club Mission</label> <textarea className="w-full bg-white/5 border border-white/10 rounded-md p-3 text-sm focus:ring-1 focus:ring-primary ou | textarea; src/pages/admin/ContentManagement.tsx:186 | Update via {(e) => setAboutData({...aboutData, mission: e.target.value})} | value={aboutData.mission}; onChange={(e) => setAboutData({...aboutData, mission: e.target.value})} | Not tested |
| E0396 | <label className="text-[10px] font-cyber uppercase tracking-widest text-muted-foreground">Club Vision</label> <textarea className="w-full bg-white/5 border border-white/10 rounded-md p-3 text-sm focus:ring-1 focus:ring-primary out | textarea; src/pages/admin/ContentManagement.tsx:194 | Update via {(e) => setAboutData({...aboutData, vision: e.target.value})} | value={aboutData.vision}; onChange={(e) => setAboutData({...aboutData, vision: e.target.value})} | Not tested |
| E0397 | <label className="text-[10px] font-cyber uppercase tracking-widest text-muted-foreground">History Text</label> <textarea className="w-full bg-white/5 border border-white/10 rounded-md p-3 text-sm focus:ring-1 focus:ring-primary ou | textarea; src/pages/admin/ContentManagement.tsx:213 | Update via {(e) => setAboutData({...aboutData, history: e.target.value})} | value={aboutData.history}; onChange={(e) => setAboutData({...aboutData, history: e.target.value})} | Not tested |
| E0398 | "https://discord.gg/your-club-invite" | Input; src/pages/admin/ContentManagement.tsx:241 | Update via {(e) => setSiteSettings({...siteSettings, discordUrl: e.target.value})} | value={siteSettings.discordUrl}; onChange={(e) => setSiteSettings({...siteSettings, discordUrl: e.target.value})} | Not tested |
| E0399 | "https://github.com/datacamp-club" | Input; src/pages/admin/ContentManagement.tsx:267 | Update via {(e) => setSiteSettings({...siteSettings, githubUrl: e.target.value})} | value={siteSettings.githubUrl}; onChange={(e) => setSiteSettings({...siteSettings, githubUrl: e.target.value})} | Not tested |
| E0400 | "https://linkedin.com/company/datacamp-club" | Input; src/pages/admin/ContentManagement.tsx:275 | Update via {(e) => setSiteSettings({...siteSettings, linkedinUrl: e.target.value})} | value={siteSettings.linkedinUrl}; onChange={(e) => setSiteSettings({...siteSettings, linkedinUrl: e.target.value})} | Not tested |
| E0401 | "https://x.com/datacamp_club" | Input; src/pages/admin/ContentManagement.tsx:283 | Update via {(e) => setSiteSettings({...siteSettings, twitterUrl: e.target.value})} | value={siteSettings.twitterUrl}; onChange={(e) => setSiteSettings({...siteSettings, twitterUrl: e.target.value})} | Not tested |
| E0402 | "https://facebook.com/datacamp.club" | Input; src/pages/admin/ContentManagement.tsx:291 | Update via {(e) => setSiteSettings({...siteSettings, facebookUrl: e.target.value})} | value={siteSettings.facebookUrl}; onChange={(e) => setSiteSettings({...siteSettings, facebookUrl: e.target.value})} | Not tested |

### src/pages/admin/CourseManagement.tsx — admin

| ID | Element / label expression | Selector / source | Source-declared action (expected behavior pending confirmation) | Wiring / conditions | Status |
|---|---|---|---|---|---|
| E0403 | <Plus className="w-4 h-4" /> {isArabic ? 'إضافة دورة جديدة' : 'NEW_COURSE'} | Button; src/pages/admin/CourseManagement.tsx:244 | Trigger {handleOpenCreate} | onClick={handleOpenCreate} | Not tested |
| E0404 | {isArabic ? 'البحث في الدورات أو المدربين أو التصنيفات...' : 'Filter courses by title, category, instructor...'} | Input; src/pages/admin/CourseManagement.tsx:257 | Update via {e => setSearch(e.target.value)} | value={search}; onChange={e => setSearch(e.target.value)} | Not tested |
| E0405 | {isArabic ? 'معاينة في الكتالوج' : 'View in Catalog'} | Link; src/pages/admin/CourseManagement.tsx:331 | Navigate to {`/courses/${course.slug}`} | to={`/courses/${course.slug}`} | Not tested |
| E0406 | {isArabic ? 'فتح بيئة التعلم التفاعلية' : 'Open Learning Room'} | Link; src/pages/admin/CourseManagement.tsx:342 | Navigate to {`/courses/${course.slug}/learn`} | to={`/courses/${course.slug}/learn`} | Not tested |
| E0407 | {isArabic ? 'إدارة دروس الدورة' : 'Manage Lessons'} | button; src/pages/admin/CourseManagement.tsx:353 | Trigger {() => openLessonManager(course)} | onClick={() => openLessonManager(course)} | Not tested |
| E0408 | {course.status === 'published' ? (isArabic ? 'إلغاء النشر' : 'Unpublish') : (isArabic ? 'نشر الدورة' : 'Publish')} | button; src/pages/admin/CourseManagement.tsx:362 | Trigger {() => handleTogglePublish(course)} | onClick={() => handleTogglePublish(course)} | Not tested |
| E0409 | {isArabic ? 'تعديل الدورة' : 'Edit Course'} | button; src/pages/admin/CourseManagement.tsx:371 | Trigger {() => handleOpenEdit(course)} | onClick={() => handleOpenEdit(course)} | Not tested |
| E0410 | {isArabic ? 'حذف الدورة' : 'Delete Course'} | button; src/pages/admin/CourseManagement.tsx:380 | Trigger {() => handleDelete(course.id)} | onClick={() => handleDelete(course.id)} | Not tested |
| E0411 | <X className="w-5 h-5" /> | button; src/pages/admin/CourseManagement.tsx:421 | Trigger {() => setIsModalOpen(false)} | onClick={() => setIsModalOpen(false)} | Not tested |
| E0412 | {/* Cover Image with direct ImagePicker */} <div className="space-y-2"> <ImagePicker label={isArabic ? 'غلاف الدورة التدريبية (رفع من الجهاز)' : 'Course Cover Image (Upload from device)'} currentImage={editingCourse.coverImage} on | form; src/pages/admin/CourseManagement.tsx:426 | Submit via {handleSave} | onSubmit={handleSave} | Not tested |
| E0413 | <ImagePicker label={isArabic ? 'غلاف الدورة التدريبية (رفع من الجهاز)' : 'Course Cover Image (Upload from device)'} currentImage={editingCourse.coverImage} onImageSelected={(base64) => setEditingCourse(p => ({ ...p, coverImage: ba | ImagePicker; src/pages/admin/CourseManagement.tsx:429 | Needs clarification: inspect enclosing link/form or component caller | onImageSelected={(base64) => setEditingCourse(p => ({ ...p, coverImage: base64 }))} | Not tested |
| E0414 | <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={uploadingImage} /> <div className="flex items-center justify-center px-3 py-2 bg-primary/10 border border-primary/30 rounded-md text-xs f | input; src/pages/admin/CourseManagement.tsx:436 | Update via {handleFileUpload} | type="file"; accept="image/*"; onChange={handleFileUpload}; disabled={uploadingImage} | Not tested |
| E0415 | "https://images.unsplash.com/... or uploaded URL" | Input; src/pages/admin/CourseManagement.tsx:451 | Update via {e => setEditingCourse(p => ({ ...p, coverImage: e.target.value }))} | value={editingCourse.coverImage \|\| ''}; onChange={e => setEditingCourse(p => ({ ...p, coverImage: e.target.value }))} | Not tested |
| E0416 | "e.g. Advanced Deep Learning with PyTorch" | Input; src/pages/admin/CourseManagement.tsx:467 | Update via {e => setEditingCourse(p => ({ ...p, title: e.target.value }))} | value={editingCourse.title \|\| ''}; onChange={e => setEditingCourse(p => ({ ...p, title: e.target.value }))}; required=true | Not tested |
| E0417 | "auto-generated-from-title" | Input; src/pages/admin/CourseManagement.tsx:480 | Update via {e => setEditingCourse(p => ({ ...p, slug: e.target.value }))} | value={editingCourse.slug \|\| ''}; onChange={e => setEditingCourse(p => ({ ...p, slug: e.target.value }))} | Not tested |
| E0418 | <option value="data_science">{isArabic ? 'علوم البيانات' : 'Data Science'}</option> <option value="ai_ml">{isArabic ? 'الذكاء الاصطناعي وتعلم الآلة' : 'AI & ML'}</option> <option value="business_intelligence">{isArabic ? 'ذكاء الأ | select; src/pages/admin/CourseManagement.tsx:495 | Update via {e => setEditingCourse(p => ({ ...p, category: e.target.value as CourseCategory }))} | value={editingCourse.category \|\| 'data_science'}; onChange={e => setEditingCourse(p => ({ ...p, category: e.target.value as CourseCategory }))} | Not tested |
| E0419 | <option value="beginner">{isArabic ? 'مبتدئ' : 'Beginner'}</option> <option value="intermediate">{isArabic ? 'متوسط' : 'Intermediate'}</option> <option value="advanced">{isArabic ? 'متقدم' : 'Advanced'}</option> | select; src/pages/admin/CourseManagement.tsx:511 | Update via {e => setEditingCourse(p => ({ ...p, level: e.target.value as CourseLevel }))} | value={editingCourse.level \|\| 'beginner'}; onChange={e => setEditingCourse(p => ({ ...p, level: e.target.value as CourseLevel }))} | Not tested |
| E0420 | <option value="published">{isArabic ? 'منشور للطلاب' : 'Published'}</option> <option value="draft">{isArabic ? 'مسودة خاصة' : 'Draft'}</option> | select; src/pages/admin/CourseManagement.tsx:526 | Update via {e => setEditingCourse(p => ({ ...p, status: e.target.value as any }))} | value={editingCourse.status \|\| 'published'}; onChange={e => setEditingCourse(p => ({ ...p, status: e.target.value as any }))} | Not tested |
| E0421 | <label className="text-[10px] font-cyber text-muted-foreground uppercase"> {isArabic ? 'مكافأة الـ XP' : 'XP Bounty'} </label> <Input type="number" value={editingCourse.pointsReward \\|\\| 500} onChange={e => setEditingCourse(p => ( | Input; src/pages/admin/CourseManagement.tsx:543 | Update via {e => setEditingCourse(p => ({ ...p, pointsReward: Number(e.target.value) }))} | type="number"; value={editingCourse.pointsReward \|\| 500}; onChange={e => setEditingCourse(p => ({ ...p, pointsReward: Number(e.target.value) }))} | Not tested |
| E0422 | <label className="text-[10px] font-cyber text-muted-foreground uppercase"> {isArabic ? 'المدة (ساعات)' : 'Duration (Hours)'} </label> <Input type="number" value={editingCourse.durationHours \\|\\| 12} onChange={e => setEditingCourse | Input; src/pages/admin/CourseManagement.tsx:555 | Update via {e => setEditingCourse(p => ({ ...p, durationHours: Number(e.target.value) }))} | type="number"; value={editingCourse.durationHours \|\| 12}; onChange={e => setEditingCourse(p => ({ ...p, durationHours: Number(e.target.value) }))} | Not tested |
| E0423 | <label className="text-[10px] font-cyber text-muted-foreground uppercase"> {isArabic ? 'عدد الدروس' : 'Total Lessons'} </label> <Input type="number" value={editingCourse.totalLessons \\|\\| 10} onChange={e => setEditingCourse(p => ( | Input; src/pages/admin/CourseManagement.tsx:567 | Update via {e => setEditingCourse(p => ({ ...p, totalLessons: Number(e.target.value) }))} | type="number"; value={editingCourse.totalLessons \|\| 10}; onChange={e => setEditingCourse(p => ({ ...p, totalLessons: Number(e.target.value) }))} | Not tested |
| E0424 | "Dr. Tamer Mostafa / Eng. Sarah Al-Sayed" | Input; src/pages/admin/CourseManagement.tsx:581 | Update via {e => setEditingCourse(p => ({ ...p, instructorName: e.target.value }))} | value={editingCourse.instructorName \|\| ''}; onChange={e => setEditingCourse(p => ({ ...p, instructorName: e.target.value }))} | Not tested |
| E0425 | {isArabic ? 'ملخص سريع لأهم مهارات الدورة...' : 'Brief 1-line overview of the curriculum...'} | Input; src/pages/admin/CourseManagement.tsx:594 | Update via {e => setEditingCourse(p => ({ ...p, shortDescription: e.target.value }))} | value={editingCourse.shortDescription \|\| ''}; onChange={e => setEditingCourse(p => ({ ...p, shortDescription: e.target.value }))} | Not tested |
| E0426 | {isArabic ? 'اكتب تفاصيل المنهج والمتطلبات السابقة...' : 'Comprehensive description of the syllabus, outcomes, and prerequisites...'} | textarea; src/pages/admin/CourseManagement.tsx:607 | Update via {e => setEditingCourse(p => ({ ...p, description: e.target.value }))} | value={editingCourse.description \|\| ''}; onChange={e => setEditingCourse(p => ({ ...p, description: e.target.value }))} | Not tested |
| E0427 | "Python, Pandas, AI" | Input; src/pages/admin/CourseManagement.tsx:621 | Update via {e => setEditingCourse(p => ({ ...p, tags: e.target.value.split(',').map(v => v.trim()).filter(Boolean) }))} | value={toCsv(editingCourse.tags)}; onChange={e => setEditingCourse(p => ({ ...p, tags: e.target.value.split(',').map(v => v.trim()).filter(Boolean) }))} | Not tested |
| E0428 | "Data Analysis, Modeling" | Input; src/pages/admin/CourseManagement.tsx:632 | Update via {e => setEditingCourse(p => ({ ...p, skills: e.target.value.split(',').map(v => v.trim()).filter(Boolean) }))} | value={toCsv(editingCourse.skills)}; onChange={e => setEditingCourse(p => ({ ...p, skills: e.target.value.split(',').map(v => v.trim()).filter(Boolean) }))} | Not tested |
| E0429 | "Basic Python" | Input; src/pages/admin/CourseManagement.tsx:643 | Update via {e => setEditingCourse(p => ({ ...p, prerequisites: e.target.value.split(',').map(v => v.trim()).filter(Boolean) }))} | value={toCsv(editingCourse.prerequisites)}; onChange={e => setEditingCourse(p => ({ ...p, prerequisites: e.target.value.split(',').map(v => v.trim()).filter(Boolean) }))} | Not tested |
| E0430 | {isArabic ? 'إلغاء' : 'CANCEL'} | Button; src/pages/admin/CourseManagement.tsx:654 | Trigger {() => setIsModalOpen(false)} | type="button"; onClick={() => setIsModalOpen(false)} | Not tested |
| E0431 | {saving ? (isArabic ? 'جاري الحفظ...' : 'SAVING...') : (isArabic ? 'حفظ الدورة' : 'SAVE_COURSE')} | Button; src/pages/admin/CourseManagement.tsx:662 | Submit enclosing form | type="submit"; disabled={saving} | Not tested |
| E0432 | <Plus className="w-4 h-4 mr-1 rtl:mr-0 rtl:ml-1" /> {isArabic ? 'درس جديد' : 'NEW_LESSON'} | Button; src/pages/admin/CourseManagement.tsx:683 | Trigger {handleOpenCreateLesson} | onClick={handleOpenCreateLesson} | Not tested |
| E0433 | {isArabic ? 'إغلاق' : 'CLOSE'} | Button; src/pages/admin/CourseManagement.tsx:687 | Trigger {() => setLessonCourse(null)} | onClick={() => setLessonCourse(null)} | Not tested |
| E0434 | {isArabic ? 'تعديل الدرس' : 'Edit lesson'} | button; src/pages/admin/CourseManagement.tsx:721 | Trigger {() => setEditingLesson({ ...lesson })} | onClick={() => setEditingLesson({ ...lesson })} | Not tested |
| E0435 | {isArabic ? 'حذف الدرس' : 'Delete lesson'} | button; src/pages/admin/CourseManagement.tsx:728 | Trigger {() => handleDeleteLesson(lesson.id)} | onClick={() => handleDeleteLesson(lesson.id)} | Not tested |
| E0436 | <div className="flex items-center justify-between"> <h4 className="font-cyber text-primary text-sm"> {editingLesson.id ? (isArabic ? 'تعديل الدرس' : 'EDIT_LESSON') : (isArabic ? 'إنشاء درس جديد' : 'CREATE_LESSON')} </h4> <button t | form; src/pages/admin/CourseManagement.tsx:742 | Submit via {handleSaveLesson} | onSubmit={handleSaveLesson} | Not tested |
| E0437 | <X className="w-4 h-4" /> | button; src/pages/admin/CourseManagement.tsx:747 | Trigger {() => setEditingLesson(null)} | type="button"; onClick={() => setEditingLesson(null)} | Not tested |
| E0438 | {isArabic ? 'عنوان الدرس' : 'Lesson title'} | Input; src/pages/admin/CourseManagement.tsx:752 | Update via {e => setEditingLesson(p => ({ ...p, title: e.target.value }))} | value={editingLesson.title \|\| ''}; onChange={e => setEditingLesson(p => ({ ...p, title: e.target.value }))}; required=true | Not tested |
| E0439 | <option value="article">Article</option> <option value="video">Video</option> <option value="quiz">Quiz</option> <option value="exercise">Exercise</option> <option value="project">Project</option> | select; src/pages/admin/CourseManagement.tsx:761 | Update via {e => setEditingLesson(p => ({ ...p, type: e.target.value as LessonType }))} | value={editingLesson.type \|\| 'article'}; onChange={e => setEditingLesson(p => ({ ...p, type: e.target.value as LessonType }))} | Not tested |
| E0440 | "Position" | Input; src/pages/admin/CourseManagement.tsx:772 | Update via {e => setEditingLesson(p => ({ ...p, order: Number(e.target.value) }))} | type="number"; value={editingLesson.order \|\| 1}; onChange={e => setEditingLesson(p => ({ ...p, order: Number(e.target.value) }))} | Not tested |
| E0441 | "Duration minutes" | Input; src/pages/admin/CourseManagement.tsx:782 | Update via {e => setEditingLesson(p => ({ ...p, duration: Number(e.target.value) }))} | type="number"; value={editingLesson.duration \|\| 20}; onChange={e => setEditingLesson(p => ({ ...p, duration: Number(e.target.value) }))} | Not tested |
| E0442 | "XP" | Input; src/pages/admin/CourseManagement.tsx:789 | Update via {e => setEditingLesson(p => ({ ...p, pointsReward: Number(e.target.value) }))} | type="number"; value={editingLesson.pointsReward \|\| 30}; onChange={e => setEditingLesson(p => ({ ...p, pointsReward: Number(e.target.value) }))} | Not tested |
| E0443 | "https://www.youtube.com/embed/..." | Input; src/pages/admin/CourseManagement.tsx:798 | Update via {e => setEditingLesson(p => ({ ...p, videoUrl: e.target.value }))} | value={editingLesson.videoUrl \|\| ''}; onChange={e => setEditingLesson(p => ({ ...p, videoUrl: e.target.value }))} | Not tested |
| E0444 | {isArabic ? 'محتوى الدرس أو تعليمات التمرين...' : 'Lesson content or exercise instructions...'} | textarea; src/pages/admin/CourseManagement.tsx:805 | Update via {e => setEditingLesson(p => ({ ...p, content: e.target.value }))} | value={editingLesson.content \|\| ''}; onChange={e => setEditingLesson(p => ({ ...p, content: e.target.value }))} | Not tested |
| E0445 | <input type="checkbox" checked={!!editingLesson.isPreview} onChange={e => setEditingLesson(p => ({ ...p, isPreview: e.target.checked }))} /> {isArabic ? 'متاح كمعاينة مجانية' : 'Available as free preview'} | input; src/pages/admin/CourseManagement.tsx:814 | Update via {e => setEditingLesson(p => ({ ...p, isPreview: e.target.checked }))} | type="checkbox"; onChange={e => setEditingLesson(p => ({ ...p, isPreview: e.target.checked }))} | Not tested |
| E0446 | {isArabic ? 'إلغاء' : 'CANCEL'} | Button; src/pages/admin/CourseManagement.tsx:823 | Trigger {() => setEditingLesson(null)} | type="button"; onClick={() => setEditingLesson(null)} | Not tested |
| E0447 | {isArabic ? 'حفظ الدرس' : 'SAVE_LESSON'} | Button; src/pages/admin/CourseManagement.tsx:826 | Submit enclosing form | type="submit" | Not tested |

### src/pages/admin/EventManagement.tsx — admin

| ID | Element / label expression | Selector / source | Source-declared action (expected behavior pending confirmation) | Wiring / conditions | Status |
|---|---|---|---|---|---|
| E0448 | <Plus className="w-4 h-4 mr-2" /> CREATE EVENT | Button; src/pages/admin/EventManagement.tsx:173 | Trigger {() => setShowAddModal(true)} | onClick={() => setShowAddModal(true)} | Not tested |
| E0449 | <Edit className="w-4 h-4" /> | Button; src/pages/admin/EventManagement.tsx:192 | Trigger {() => setEditingEvent(event)} | onClick={() => setEditingEvent(event)} | Not tested |
| E0450 | <Trash2 className="w-4 h-4" /> | Button; src/pages/admin/EventManagement.tsx:200 | Trigger {() => setDeleteConfirmId(event.id)} | onClick={() => setDeleteConfirmId(event.id)} | Not tested |
| E0451 | <Scan className="w-3.5 h-3.5 mr-2" /> SCAN QR | Button; src/pages/admin/EventManagement.tsx:239 | Trigger {() => { setSelectedEvent(event); setShowScanModal(true); }} | onClick={() => { setSelectedEvent(event); setShowScanModal(true); }} | Not tested |
| E0452 | <UserPlus className="w-3.5 h-3.5 mr-2" /> ORGANIZERS | Button; src/pages/admin/EventManagement.tsx:253 | Trigger {() => { setSelectedEvent(event); setShowOrganizersModal(true); }} | onClick={() => { setSelectedEvent(event); setShowOrganizersModal(true); }} | Not tested |
| E0453 | <ExternalLink className="w-3.5 h-3.5 mr-2" /> PUBLIC LINK | Button; src/pages/admin/EventManagement.tsx:269 | Trigger {() => window.open(`/events/${event.id}`, '_blank')} | onClick={() => window.open(`/events/${event.id}`, '_blank')} | Not tested |
| E0454 | <ImageIcon className="w-3.5 h-3.5 mr-2" /> VIEW POSTER | Button; src/pages/admin/EventManagement.tsx:273 | Needs clarification: inspect enclosing link/form or component caller |  | Not tested |
| E0455 | ABORT | Button; src/pages/admin/EventManagement.tsx:294 | Trigger {() => setDeleteConfirmId(null)} | onClick={() => setDeleteConfirmId(null)} | Not tested |
| E0456 | PURGE DATA | Button; src/pages/admin/EventManagement.tsx:295 | Trigger {() => handleDeleteEvent(deleteConfirmId)} | onClick={() => handleDeleteEvent(deleteConfirmId)} | Not tested |
| E0457 | <div className="space-y-2"> <label className="text-[10px] font-cyber uppercase tracking-widest text-muted-foreground">Event Title</label> <Input value={editingEvent.title} onChange={(e) => setEditingEvent({...editingEvent, title: | form; src/pages/admin/EventManagement.tsx:308 | Submit via {handleUpdateEvent} | onSubmit={handleUpdateEvent} | Not tested |
| E0458 | <label className="text-[10px] font-cyber uppercase tracking-widest text-muted-foreground">Event Title</label> <Input value={editingEvent.title} onChange={(e) => setEditingEvent({...editingEvent, title: e.target.value})} required / | Input; src/pages/admin/EventManagement.tsx:311 | Update via {(e) => setEditingEvent({...editingEvent, title: e.target.value})} | value={editingEvent.title}; onChange={(e) => setEditingEvent({...editingEvent, title: e.target.value})}; required=true | Not tested |
| E0459 | <label className="text-[10px] font-cyber uppercase tracking-widest text-muted-foreground">Description</label> <textarea className="w-full bg-white/5 border border-white/10 rounded-md p-3 text-sm focus:ring-1 focus:ring-primary out | textarea; src/pages/admin/EventManagement.tsx:319 | Update via {(e) => setEditingEvent({...editingEvent, description: e.target.value})} | value={editingEvent.description}; onChange={(e) => setEditingEvent({...editingEvent, description: e.target.value})}; required=true | Not tested |
| E0460 | <label className="text-[10px] font-cyber uppercase tracking-widest text-muted-foreground">Date & Time</label> <Input type="datetime-local" value={editingEvent.date} onChange={(e) => setEditingEvent({...editingEvent, date: e.target | Input; src/pages/admin/EventManagement.tsx:329 | Update via {(e) => setEditingEvent({...editingEvent, date: e.target.value})} | type="datetime-local"; value={editingEvent.date}; onChange={(e) => setEditingEvent({...editingEvent, date: e.target.value})}; required=true | Not tested |
| E0461 | <label className="text-[10px] font-cyber uppercase tracking-widest text-muted-foreground">Location</label> <Input value={editingEvent.location} onChange={(e) => setEditingEvent({...editingEvent, location: e.target.value})} require | Input; src/pages/admin/EventManagement.tsx:338 | Update via {(e) => setEditingEvent({...editingEvent, location: e.target.value})} | value={editingEvent.location}; onChange={(e) => setEditingEvent({...editingEvent, location: e.target.value})}; required=true | Not tested |
| E0462 | ABORT | Button; src/pages/admin/EventManagement.tsx:346 | Trigger {() => setEditingEvent(null)} | type="button"; onClick={() => setEditingEvent(null)} | Not tested |
| E0463 | UPDATE PARAMETERS | Button; src/pages/admin/EventManagement.tsx:347 | Submit enclosing form | type="submit" | Not tested |
| E0464 | <X className="w-4 h-4" /> | Button; src/pages/admin/EventManagement.tsx:360 | Trigger {() => setShowScanModal(false)} | onClick={() => setShowScanModal(false)} | Not tested |
| E0465 | <X className="w-4 h-4" /> | Button; src/pages/admin/EventManagement.tsx:375 | Trigger {() => setShowOrganizersModal(false)} | onClick={() => setShowOrganizersModal(false)} | Not tested |
| E0466 | <UserIdentityInput suggestions={users} onValueChange={(val, type) => { setOrganizerValue(val); setIdentityType(type); }} /> | UserIdentityInput; src/pages/admin/EventManagement.tsx:380 | Accept input; validation/consumer shown in source | onValueChange={(val, type) => { setOrganizerValue(val); setIdentityType(type); }} | Not tested |
| E0467 | ADD | Button; src/pages/admin/EventManagement.tsx:388 | Trigger {handleAddOrganizer} | onClick={handleAddOrganizer} | Not tested |
| E0468 | <Trash2 className="w-3 h-3" /> | Button; src/pages/admin/EventManagement.tsx:396 | Trigger {async () => { const updated = selectedEvent.organizers.filter((_: any, index: number) => index !== i); const updatedEvent = { ...selectedEvent, organizers: updated }; await contentService.update('events', selectedEvent.id, updatedEvent); setEvents(prev => prev.map(e => e.id === selectedEvent.id ? updatedEvent : e)); setSelectedEvent(updatedEvent); }} | onClick={async () => { const updated = selectedEvent.organizers.filter((_: any, index: number) => index !== i); const updatedEvent = { ...selectedEvent, organizers: updated }; await contentService.update('events', selectedEvent.id, updatedEvent); setEvents(prev => prev.map(e => e.id === selectedEvent.id ? updatedEvent : e)); setSelectedEvent(updatedEvent); }} | Not tested |
| E0469 | <div className="space-y-2"> <label className="text-[10px] font-cyber uppercase tracking-widest text-muted-foreground">Event Title</label> <Input placeholder="e.g. Data Science Summit" value={newEvent.title} onChange={(e) => setNew | form; src/pages/admin/EventManagement.tsx:427 | Submit via {handleAddEvent} | onSubmit={handleAddEvent} | Not tested |
| E0470 | "e.g. Data Science Summit" | Input; src/pages/admin/EventManagement.tsx:430 | Update via {(e) => setNewEvent({...newEvent, title: e.target.value})} | value={newEvent.title}; onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}; required=true | Not tested |
| E0471 | "What is this event about?" | textarea; src/pages/admin/EventManagement.tsx:439 | Update via {(e) => setNewEvent({...newEvent, description: e.target.value})} | value={newEvent.description}; onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}; required=true | Not tested |
| E0472 | <label className="text-[10px] font-cyber uppercase tracking-widest text-muted-foreground">Date & Time</label> <Input type="datetime-local" value={newEvent.date} onChange={(e) => setNewEvent({...newEvent, date: e.target.value})} re | Input; src/pages/admin/EventManagement.tsx:450 | Update via {(e) => setNewEvent({...newEvent, date: e.target.value})} | type="datetime-local"; value={newEvent.date}; onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}; required=true | Not tested |
| E0473 | "Room or Link" | Input; src/pages/admin/EventManagement.tsx:459 | Update via {(e) => setNewEvent({...newEvent, location: e.target.value})} | value={newEvent.location}; onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}; required=true | Not tested |
| E0474 | ABORT MISSION | Button; src/pages/admin/EventManagement.tsx:468 | Trigger {() => setShowAddModal(false)} | type="button"; onClick={() => setShowAddModal(false)} | Not tested |
| E0475 | PUBLISH TO GRID | Button; src/pages/admin/EventManagement.tsx:469 | Submit enclosing form | type="submit" | Not tested |

### src/pages/admin/GalleryManagement.tsx — admin

| ID | Element / label expression | Selector / source | Source-declared action (expected behavior pending confirmation) | Wiring / conditions | Status |
|---|---|---|---|---|---|
| E0476 | <ImagePicker label="Visual Asset" currentImage={newImage.url} onImageSelected={(base64) => setNewImage({...newImage, url: base64})} /> <div className="flex gap-4 items-end"> <div className="flex-grow space-y-2"> <label className=" | ImagePicker; src/pages/admin/GalleryManagement.tsx:73 | Needs clarification: inspect enclosing link/form or component caller | onImageSelected={(base64) => setNewImage({...newImage, url: base64})} | Not tested |
| E0477 | "Event Name" | Input; src/pages/admin/GalleryManagement.tsx:81 | Update via {(e) => setNewImage({...newImage, title: e.target.value})} | value={newImage.title}; onChange={(e) => setNewImage({...newImage, title: e.target.value})} | Not tested |
| E0478 | <Plus className="w-4 h-4 mr-2" /> ADD TO GRID | Button; src/pages/admin/GalleryManagement.tsx:87 | Trigger {handleAdd} | onClick={handleAdd} | Not tested |
| E0479 | <Trash2 className="w-5 h-5" /> | Button; src/pages/admin/GalleryManagement.tsx:101 | Trigger {() => setDeleteConfirmId(img.id)} | onClick={() => setDeleteConfirmId(img.id)} | Not tested |
| E0480 | ABORT | Button; src/pages/admin/GalleryManagement.tsx:125 | Trigger {() => setDeleteConfirmId(null)} | onClick={() => setDeleteConfirmId(null)} | Not tested |
| E0481 | CONFIRM_PURGE | Button; src/pages/admin/GalleryManagement.tsx:126 | Trigger {() => { removeImage(deleteConfirmId); setDeleteConfirmId(null); }} | onClick={() => { removeImage(deleteConfirmId); setDeleteConfirmId(null); }} | Not tested |

### src/pages/admin/MessageManagement.tsx — admin

| ID | Element / label expression | Selector / source | Source-declared action (expected behavior pending confirmation) | Wiring / conditions | Status |
|---|---|---|---|---|---|
| E0482 | <Eye className="w-4 h-4" /> | Button; src/pages/admin/MessageManagement.tsx:91 | Trigger {() => { setViewingMessage(msg); markAsRead(msg.id); }} | onClick={() => { setViewingMessage(msg); markAsRead(msg.id); }} | Not tested |
| E0483 | <Trash2 className="w-4 h-4" /> | Button; src/pages/admin/MessageManagement.tsx:94 | Trigger {() => setDeleteConfirmId(msg.id)} | onClick={() => setDeleteConfirmId(msg.id)} | Not tested |
| E0484 | CANCEL | Button; src/pages/admin/MessageManagement.tsx:115 | Trigger {() => setDeleteConfirmId(null)} | onClick={() => setDeleteConfirmId(null)} | Not tested |
| E0485 | DELETE | Button; src/pages/admin/MessageManagement.tsx:116 | Trigger {() => { deleteMessage(deleteConfirmId); setDeleteConfirmId(null); }} | onClick={() => { deleteMessage(deleteConfirmId); setDeleteConfirmId(null); }} | Not tested |
| E0486 | CLOSE | Button; src/pages/admin/MessageManagement.tsx:144 | Trigger {() => setViewingMessage(null)} | onClick={() => setViewingMessage(null)} | Not tested |
| E0487 | REPLY_VIA_EMAIL | Button; src/pages/admin/MessageManagement.tsx:145 | Trigger {() => window.location.href = `mailto:${viewingMessage.email}`} | onClick={() => window.location.href = `mailto:${viewingMessage.email}`} | Not tested |

### src/pages/admin/PointsManagement.tsx — admin

| ID | Element / label expression | Selector / source | Source-declared action (expected behavior pending confirmation) | Wiring / conditions | Status |
|---|---|---|---|---|---|
| E0488 | "Search member by name or ID..." | Input; src/pages/admin/PointsManagement.tsx:172 | Update via {e => setSearch(e.target.value)} | value={search}; onChange={e => setSearch(e.target.value)} | Not tested |
| E0489 | <Sparkles className="w-3.5 h-3.5 mr-1" /> GRANT_XP | Button; src/pages/admin/PointsManagement.tsx:214 | Trigger {() => setSelectedMember(member)} | onClick={() => setSelectedMember(member)} | Not tested |
| E0490 | <X className="w-5 h-5" /> | button; src/pages/admin/PointsManagement.tsx:238 | Trigger {() => setSelectedMember(null)} | onClick={() => setSelectedMember(null)} | Not tested |
| E0491 | <div className="space-y-1"> <label className="text-[10px] font-cyber text-muted-foreground uppercase">XP Amount</label> <div className="flex gap-2"> {[50, 100, 200, 350, 500].map(amt => ( <button key={amt} type="button" onClick={( | form; src/pages/admin/PointsManagement.tsx:243 | Submit via {handleGrantBonus} | onSubmit={handleGrantBonus} | Not tested |
| E0492 | + {amt} | button; src/pages/admin/PointsManagement.tsx:248 | Trigger {() => setPointsAmount(amt)} | type="button"; onClick={() => setPointsAmount(amt)} | Not tested |
| E0493 | <label className="text-[10px] font-cyber text-muted-foreground uppercase">XP Amount</label> <div className="flex gap-2"> {[50, 100, 200, 350, 500].map(amt => ( <button key={amt} type="button" onClick={() => setPointsAmount(amt)} c | Input; src/pages/admin/PointsManagement.tsx:262 | Update via {e => setPointsAmount(Number(e.target.value))} | type="number"; value={pointsAmount}; onChange={e => setPointsAmount(Number(e.target.value))}; required=true | Not tested |
| E0494 | "e.g. Outstanding presentation in Week 3" | Input; src/pages/admin/PointsManagement.tsx:273 | Update via {e => setReason(e.target.value)} | value={reason}; onChange={e => setReason(e.target.value)}; required=true | Not tested |
| E0495 | CANCEL | Button; src/pages/admin/PointsManagement.tsx:283 | Trigger {() => setSelectedMember(null)} | type="button"; onClick={() => setSelectedMember(null)} | Not tested |
| E0496 | {isSubmitting ? 'DISPATCHING...' : 'DISPATCH_POINTS'} | Button; src/pages/admin/PointsManagement.tsx:291 | Submit enclosing form | type="submit"; disabled={isSubmitting} | Not tested |

### src/pages/admin/ProjectManagement.tsx — admin

| ID | Element / label expression | Selector / source | Source-declared action (expected behavior pending confirmation) | Wiring / conditions | Status |
|---|---|---|---|---|---|
| E0497 | <Plus className="w-4 h-4 mr-2" /> ADD_PROJECT | Button; src/pages/admin/ProjectManagement.tsx:118 | Trigger {() => setShowAddModal(true)} | onClick={() => setShowAddModal(true)} | Not tested |
| E0498 | <Trash2 className="w-4 h-4" /> | Button; src/pages/admin/ProjectManagement.tsx:130 | Trigger {() => setDeleteConfirmId(project.id)} | onClick={() => setDeleteConfirmId(project.id)} | Not tested |
| E0499 | ABORT | Button; src/pages/admin/ProjectManagement.tsx:160 | Trigger {() => setDeleteConfirmId(null)} | onClick={() => setDeleteConfirmId(null)} | Not tested |
| E0500 | CONFIRM_PURGE | Button; src/pages/admin/ProjectManagement.tsx:161 | Trigger {() => { deleteProject(deleteConfirmId); setDeleteConfirmId(null); }} | onClick={() => { deleteProject(deleteConfirmId); setDeleteConfirmId(null); }} | Not tested |
| E0501 | <label className="text-[10px] font-cyber uppercase tracking-widest text-muted-foreground">Project Title</label> <Input value={newProject.title} onChange={(e) => setNewProject({...newProject, title: e.target.value})} /> | Input; src/pages/admin/ProjectManagement.tsx:178 | Update via {(e) => setNewProject({...newProject, title: e.target.value})} | value={newProject.title}; onChange={(e) => setNewProject({...newProject, title: e.target.value})} | Not tested |
| E0502 | <label className="text-[10px] font-cyber uppercase tracking-widest text-muted-foreground">Category (e.g. NLP, Web3)</label> <Input value={newProject.category} onChange={(e) => setNewProject({...newProject, category: e.target.value | Input; src/pages/admin/ProjectManagement.tsx:182 | Update via {(e) => setNewProject({...newProject, category: e.target.value})} | value={newProject.category}; onChange={(e) => setNewProject({...newProject, category: e.target.value})} | Not tested |
| E0503 | <label className="text-[10px] font-cyber uppercase tracking-widest text-muted-foreground">Tech Stack</label> <Input value={newProject.tech} onChange={(e) => setNewProject({...newProject, tech: e.target.value})} /> | Input; src/pages/admin/ProjectManagement.tsx:189 | Update via {(e) => setNewProject({...newProject, tech: e.target.value})} | value={newProject.tech}; onChange={(e) => setNewProject({...newProject, tech: e.target.value})} | Not tested |
| E0504 | <label className="text-[10px] font-cyber uppercase tracking-widest text-muted-foreground">Project Link (URL)</label> <Input value={newProject.link} onChange={(e) => setNewProject({...newProject, link: e.target.value})} /> | Input; src/pages/admin/ProjectManagement.tsx:193 | Update via {(e) => setNewProject({...newProject, link: e.target.value})} | value={newProject.link}; onChange={(e) => setNewProject({...newProject, link: e.target.value})} | Not tested |
| E0505 | <label className="text-[10px] font-cyber uppercase tracking-widest text-muted-foreground">Lead Developer / Author (Optional)</label> <UserIdentityInput suggestions={users} onValueChange={(val, type) => { setNewProject({...newProje | UserIdentityInput; src/pages/admin/ProjectManagement.tsx:199 | Accept input; validation/consumer shown in source | onValueChange={(val, type) => { setNewProject({...newProject, author: val}); setAuthorType(type); }} | Not tested |
| E0506 | <ImagePicker label="Project Cover Image" currentImage={newProject.image} onImageSelected={(base64) => setNewProject({...newProject, image: base64})} /> | ImagePicker; src/pages/admin/ProjectManagement.tsx:209 | Needs clarification: inspect enclosing link/form or component caller | onImageSelected={(base64) => setNewProject({...newProject, image: base64})} | Not tested |
| E0507 | <label className="text-[10px] font-cyber uppercase tracking-widest text-muted-foreground">Description</label> <textarea className="w-full bg-white/5 border border-white/10 rounded-md p-3 text-sm focus:ring-1 focus:ring-primary out | textarea; src/pages/admin/ProjectManagement.tsx:218 | Update via {(e) => setNewProject({...newProject, description: e.target.value})} | value={newProject.description}; onChange={(e) => setNewProject({...newProject, description: e.target.value})} | Not tested |
| E0508 | ABORT | Button; src/pages/admin/ProjectManagement.tsx:225 | Trigger {() => { setShowAddModal(false); resetForm(); }} | onClick={() => { setShowAddModal(false); resetForm(); }} | Not tested |
| E0509 | {isSubmitting ? 'PUBLISHING...' : 'PUBLISH_PROJECT'} | Button; src/pages/admin/ProjectManagement.tsx:226 | Trigger {addProject} | onClick={addProject}; disabled={isSubmitting} | Not tested |

### src/pages/admin/Security.tsx — admin

| ID | Element / label expression | Selector / source | Source-declared action (expected behavior pending confirmation) | Wiring / conditions | Status |
|---|---|---|---|---|---|
| E0510 | <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} /> Refresh Status | Button; src/pages/admin/Security.tsx:127 | Trigger {handleRefreshLogs} | onClick={handleRefreshLogs}; disabled={isRefreshing} | Not tested |
| E0511 | <History className="w-4 h-4 mr-2" /> Full History | Button; src/pages/admin/Security.tsx:141 | Needs clarification: inspect enclosing link/form or component caller |  | Not tested |
| E0512 | <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${securitySettings.firewallActive ? 'left-5.5' : 'left-0.5'}`} /> | button; src/pages/admin/Security.tsx:191 | Trigger {() => setSecuritySettings({...securitySettings, firewallActive: !securitySettings.firewallActive})} | onClick={() => setSecuritySettings({...securitySettings, firewallActive: !securitySettings.firewallActive})} | Not tested |
| E0513 | Save Firewall Config | Button; src/pages/admin/Security.tsx:198 | Trigger {handleUpdateSecurity} | onClick={handleUpdateSecurity} | Not tested |
| E0514 | {level} | button; src/pages/admin/Security.tsx:217 | Trigger {() => setSecuritySettings({...securitySettings, threatLevel: level})} | onClick={() => setSecuritySettings({...securitySettings, threatLevel: level})} | Not tested |
| E0515 | Update Threat Level | Button; src/pages/admin/Security.tsx:230 | Trigger {handleUpdateSecurity} | onClick={handleUpdateSecurity} | Not tested |
| E0516 | <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${securitySettings.mfaEnforced ? 'left-7' : 'left-1'}`} /> | button; src/pages/admin/Security.tsx:244 | Trigger {() => { const newVal = !securitySettings.mfaEnforced; setSecuritySettings({...securitySettings, mfaEnforced: newVal}); toast.info(`MFA ${newVal ? 'Enabled' : 'Disabled'}`); }} | onClick={() => { const newVal = !securitySettings.mfaEnforced; setSecuritySettings({...securitySettings, mfaEnforced: newVal}); toast.info(`MFA ${newVal ? 'Enabled' : 'Disabled'}`); }} | Not tested |
| E0517 | <Key className="w-4 h-4 mr-2" /> Save MFA Policy | Button; src/pages/admin/Security.tsx:255 | Trigger {handleUpdateSecurity} | onClick={handleUpdateSecurity} | Not tested |

### src/pages/admin/Settings.tsx — admin

| ID | Element / label expression | Selector / source | Source-declared action (expected behavior pending confirmation) | Wiring / conditions | Status |
|---|---|---|---|---|---|
| E0518 | <label className="text-[10px] font-cyber uppercase tracking-widest text-muted-foreground">Platform Main Name (Logo)</label> <Input value={settings.siteName} onChange={(e) => setSettings({...settings, siteName: e.target.value})} /> | Input; src/pages/admin/Settings.tsx:79 | Update via {(e) => setSettings({...settings, siteName: e.target.value})} | value={settings.siteName}; onChange={(e) => setSettings({...settings, siteName: e.target.value})} | Not tested |
| E0519 | <label className="text-[10px] font-cyber uppercase tracking-widest text-muted-foreground">Platform Sub Name</label> <Input value={settings.siteSubName} onChange={(e) => setSettings({...settings, siteSubName: e.target.value})} /> | Input; src/pages/admin/Settings.tsx:86 | Update via {(e) => setSettings({...settings, siteSubName: e.target.value})} | value={settings.siteSubName}; onChange={(e) => setSettings({...settings, siteSubName: e.target.value})} | Not tested |
| E0520 | <ImagePicker label="Platform Logo" currentImage={settings.logoUrl} onImageSelected={(base64) => setSettings({...settings, logoUrl: base64})} /> | ImagePicker; src/pages/admin/Settings.tsx:92 | Needs clarification: inspect enclosing link/form or component caller | onImageSelected={(base64) => setSettings({...settings, logoUrl: base64})} | Not tested |
| E0521 | <label className="text-[10px] font-cyber uppercase tracking-widest text-muted-foreground">Tagline / Description</label> <Input value={settings.siteDescription} onChange={(e) => setSettings({...settings, siteDescription: e.target.v | Input; src/pages/admin/Settings.tsx:100 | Update via {(e) => setSettings({...settings, siteDescription: e.target.value})} | value={settings.siteDescription}; onChange={(e) => setSettings({...settings, siteDescription: e.target.value})} | Not tested |
| E0522 | <label className="text-[10px] font-cyber uppercase tracking-widest text-muted-foreground">Contact Email</label> <Input type="email" value={settings.contactEmail} onChange={(e) => setSettings({...settings, contactEmail: e.target.va | Input; src/pages/admin/Settings.tsx:108 | Update via {(e) => setSettings({...settings, contactEmail: e.target.value})} | type="email"; value={settings.contactEmail}; onChange={(e) => setSettings({...settings, contactEmail: e.target.value})} | Not tested |
| E0523 | <label className="text-[10px] font-cyber uppercase tracking-widest text-muted-foreground">Contact Phone</label> <Input value={settings.contactPhone} onChange={(e) => setSettings({...settings, contactPhone: e.target.value})} /> | Input; src/pages/admin/Settings.tsx:116 | Update via {(e) => setSettings({...settings, contactPhone: e.target.value})} | value={settings.contactPhone}; onChange={(e) => setSettings({...settings, contactPhone: e.target.value})} | Not tested |
| E0524 | <Plus className="w-4 h-4 mr-2" /> Add Link | Button; src/pages/admin/Settings.tsx:134 | Trigger {handleAddSocial} | onClick={handleAddSocial} | Not tested |
| E0525 | "e.g. Facebook" | Input; src/pages/admin/Settings.tsx:145 | Update via {(e) => updateSocial(idx, 'platform', e.target.value)} | value={link.platform}; onChange={(e) => updateSocial(idx, 'platform', e.target.value)} | Not tested |
| E0526 | "https://..." | Input; src/pages/admin/Settings.tsx:153 | Update via {(e) => updateSocial(idx, 'url', e.target.value)} | value={link.url}; onChange={(e) => updateSocial(idx, 'url', e.target.value)} | Not tested |
| E0527 | <Trash2 className="w-4 h-4" /> | Button; src/pages/admin/Settings.tsx:160 | Trigger {() => removeSocial(idx)} | onClick={() => removeSocial(idx)} | Not tested |
| E0528 | <Input type="color" className="w-12 h-12 p-1 bg-transparent" value={settings.themeColor} onChange={(e) => setSettings({...settings, themeColor: e.target.value})} /> <span className="font-mono text-xs uppercase">{settings.themeColo | Input; src/pages/admin/Settings.tsx:185 | Update via {(e) => setSettings({...settings, themeColor: e.target.value})} | type="color"; value={settings.themeColor}; onChange={(e) => setSettings({...settings, themeColor: e.target.value})} | Not tested |
| E0529 | <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.enableRegistration ? 'left-7' : 'left-1'}`} /> | button; src/pages/admin/Settings.tsx:211 | Trigger {() => setSettings({...settings, enableRegistration: !settings.enableRegistration})} | onClick={() => setSettings({...settings, enableRegistration: !settings.enableRegistration})} | Not tested |
| E0530 | <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.maintenanceMode ? 'left-7' : 'left-1'}`} /> | button; src/pages/admin/Settings.tsx:223 | Trigger {() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})} | onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})} | Not tested |
| E0531 | <Save className="w-4 h-4 mr-2" /> Download System Backup | Button; src/pages/admin/Settings.tsx:242 | Needs clarification: inspect enclosing link/form or component caller |  | Not tested |
| E0532 | Clear System Cache | Button; src/pages/admin/Settings.tsx:246 | Needs clarification: inspect enclosing link/form or component caller |  | Not tested |
| E0533 | <Save className="w-4 h-4 mr-2" /> Commit Changes | Button; src/pages/admin/Settings.tsx:254 | Trigger {handleSave} | onClick={handleSave} | Not tested |

### src/pages/admin/StaffManagement.tsx — admin

| ID | Element / label expression | Selector / source | Source-declared action (expected behavior pending confirmation) | Wiring / conditions | Status |
|---|---|---|---|---|---|
| E0534 | <Save className="w-4 h-4 mr-2" /> Commit Changes | Button; src/pages/admin/StaffManagement.tsx:110 | Trigger {handleSave} | onClick={handleSave} | Not tested |
| E0535 | <Plus className="w-4 h-4 mr-2" /> Add Operative | Button; src/pages/admin/StaffManagement.tsx:114 | Trigger {() => setShowAddModal(true)} | onClick={() => setShowAddModal(true)} | Not tested |
| E0536 | <Trash2 className="w-4 h-4" /> | Button; src/pages/admin/StaffManagement.tsx:125 | Trigger {() => setDeleteConfirmId(member.id)} | onClick={() => setDeleteConfirmId(member.id)} | Not tested |
| E0537 | ABORT | Button; src/pages/admin/StaffManagement.tsx:167 | Trigger {() => setDeleteConfirmId(null)} | onClick={() => setDeleteConfirmId(null)} | Not tested |
| E0538 | CONFIRM_PURGE | Button; src/pages/admin/StaffManagement.tsx:168 | Trigger {() => { removeMember(deleteConfirmId); setDeleteConfirmId(null); }} | onClick={() => { removeMember(deleteConfirmId); setDeleteConfirmId(null); }} | Not tested |
| E0539 | <label className="text-[10px] font-cyber uppercase tracking-widest text-muted-foreground">Full Name</label> <Input value={newMember.name} onChange={(e) => setNewMember({...newMember, name: e.target.value})} /> | Input; src/pages/admin/StaffManagement.tsx:187 | Update via {(e) => setNewMember({...newMember, name: e.target.value})} | value={newMember.name}; onChange={(e) => setNewMember({...newMember, name: e.target.value})} | Not tested |
| E0540 | <label className="text-[10px] font-cyber uppercase tracking-widest text-muted-foreground">Role / Title</label> <Input value={newMember.role} onChange={(e) => setNewMember({...newMember, role: e.target.value})} /> | Input; src/pages/admin/StaffManagement.tsx:191 | Update via {(e) => setNewMember({...newMember, role: e.target.value})} | value={newMember.role}; onChange={(e) => setNewMember({...newMember, role: e.target.value})} | Not tested |
| E0541 | <option value="Leaders" className="bg-dark-navy">Leaders</option> <option value="Technical" className="bg-dark-navy">Technical</option> <option value="HR & Events" className="bg-dark-navy">HR & Events</option> <option value="Mento | select; src/pages/admin/StaffManagement.tsx:197 | Update via {(e) => setNewMember({...newMember, category: e.target.value})} | value={newMember.category}; onChange={(e) => setNewMember({...newMember, category: e.target.value})} | Not tested |
| E0542 | <ImagePicker label="Operative Image" currentImage={newMember.image} onImageSelected={(base64) => setNewMember({...newMember, image: base64})} /> | ImagePicker; src/pages/admin/StaffManagement.tsx:209 | Needs clarification: inspect enclosing link/form or component caller | onImageSelected={(base64) => setNewMember({...newMember, image: base64})} | Not tested |
| E0543 | <label className="text-[10px] font-cyber uppercase tracking-widest text-muted-foreground">Linked User (Optional)</label> <UserIdentityInput suggestions={users} onValueChange={(val, type) => setNewMember({...newMember, linkedUser: | UserIdentityInput; src/pages/admin/StaffManagement.tsx:219 | Accept input; validation/consumer shown in source | onValueChange={(val, type) => setNewMember({...newMember, linkedUser: val, linkedUserType: type})} | Not tested |
| E0544 | <Plus className="w-3 h-3 mr-2" /> Add Link | Button; src/pages/admin/StaffManagement.tsx:228 | Trigger {addSocialToNew} | onClick={addSocialToNew} | Not tested |
| E0545 | "Platform" | Input; src/pages/admin/StaffManagement.tsx:235 | Update via {(e) => { const updated = [...newMember.socials]; updated[idx].platform = e.target.value; updated[idx].icon = e.target.value; setNewMember({...newMember, socials: updated}); }} | value={s.platform}; onChange={(e) => { const updated = [...newMember.socials]; updated[idx].platform = e.target.value; updated[idx].icon = e.target.value; setNewMember({...newMember, socials: updated}); }} | Not tested |
| E0546 | "URL" | Input; src/pages/admin/StaffManagement.tsx:246 | Update via {(e) => { const updated = [...newMember.socials]; updated[idx].url = e.target.value; setNewMember({...newMember, socials: updated}); }} | value={s.url}; onChange={(e) => { const updated = [...newMember.socials]; updated[idx].url = e.target.value; setNewMember({...newMember, socials: updated}); }} | Not tested |
| E0547 | ABORT | Button; src/pages/admin/StaffManagement.tsx:261 | Trigger {() => setShowAddModal(false)} | onClick={() => setShowAddModal(false)} | Not tested |
| E0548 | INITIALIZE | Button; src/pages/admin/StaffManagement.tsx:262 | Trigger {handleAddMember} | onClick={handleAddMember} | Not tested |

### src/pages/admin/UserManagement.tsx — admin

| ID | Element / label expression | Selector / source | Source-declared action (expected behavior pending confirmation) | Wiring / conditions | Status |
|---|---|---|---|---|---|
| E0549 | {isArabic ? 'مزامنة وتحديث فوري لقائمة الأعضاء من قاعدة البيانات السحابية' : 'Force Sync & Refresh from Cloud'} | Button; src/pages/admin/UserManagement.tsx:530 | Trigger {handleManualRefresh} | onClick={handleManualRefresh}; disabled={refreshing} | Not tested |
| E0550 | <Radio className="w-4 h-4 animate-pulse text-neon-blue" /> <span>{isArabic ? (showActivityFeed ? 'إخفاء شريط النشاط' : 'شريط النشاط الحي') : (showActivityFeed ? 'HIDE LIVE FEED' : 'LIVE FEED')}</span> | Button; src/pages/admin/UserManagement.tsx:540 | Trigger {() => setShowActivityFeed(!showActivityFeed)} | onClick={() => setShowActivityFeed(!showActivityFeed)} | Not tested |
| E0551 | <Download className="w-4 h-4 mr-1 rtl:mr-0 rtl:ml-1" /> {isArabic ? 'تصدير إكسيل' : 'EXPORT'} | Button; src/pages/admin/UserManagement.tsx:548 | Trigger {handleExport} | onClick={handleExport} | Not tested |
| E0552 | <UserPlus className="w-4 h-4 mr-1 rtl:mr-0 rtl:ml-1" /> {isArabic ? 'إضافة عضو جديد' : 'ADD OPERATIVE'} | Button; src/pages/admin/UserManagement.tsx:552 | Trigger {() => setShowAddModal(true)} | onClick={() => setShowAddModal(true)} | Not tested |
| E0553 | <Search className="w-4 h-4" /> <span>{isArabic ? 'قائمة الأعضاء والمشغلين' : 'OPERATIVES_ROSTER'}</span> <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white"> {filteredAndSortedUsers.length} </sp | button; src/pages/admin/UserManagement.tsx:715 | Trigger {() => setActiveTab('users')} | onClick={() => setActiveTab('users')} | Not tested |
| E0554 | <Shield className="w-4 h-4" /> <span>{isArabic ? 'مصفوفة الرولات والصلاحيات' : 'ROLES_PERMISSIONS_MATRIX'}</span> <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/20 text-primary"> {ROLE_LIST.length} Role | button; src/pages/admin/UserManagement.tsx:730 | Trigger {() => setActiveTab('matrix')} | onClick={() => setActiveTab('matrix')} | Not tested |
| E0555 | {isArabic ? 'البحث بالاسم، البريد، أو رقم العضوية...' : 'Search by name, ID, or email...'} | Input; src/pages/admin/UserManagement.tsx:754 | Update via {(e) => setSearchTerm(e.target.value)} | value={searchTerm}; onChange={(e) => setSearchTerm(e.target.value)} | Not tested |
| E0556 | <input type="file" accept=".csv, .xlsx" className="hidden" onChange={handleImportCSV} /> <div className="flex items-center px-3 py-2 bg-white/5 border border-white/10 rounded-md text-[10px] font-bold hover:bg-white/10 transition-c | input; src/pages/admin/UserManagement.tsx:764 | Update via {handleImportCSV} | type="file"; accept=".csv, .xlsx"; onChange={handleImportCSV} | Not tested |
| E0557 | <option value="all" className="bg-dark-navy text-white"> {isArabic ? 'الكل (ALL)' : 'ALL'} </option> {ROLE_LIST.map(r => ( <option key={r.id} value={r.id} className="bg-dark-navy text-white"> {isArabic ? `${r.titleAr} (${r.tag})` | select; src/pages/admin/UserManagement.tsx:780 | Update via {(e) => setFilterRole(e.target.value)} | value={filterRole}; onChange={(e) => setFilterRole(e.target.value)} | Not tested |
| E0558 | <option value="all" className="bg-dark-navy text-white">{isArabic ? 'الكل' : 'ALL'}</option> <option value="google" className="bg-dark-navy text-red-400">Google</option> <option value="email" className="bg-dark-navy text-neon-blue | select; src/pages/admin/UserManagement.tsx:802 | Update via {(e) => setFilterProvider(e.target.value as any)} | value={filterProvider}; onChange={(e) => setFilterProvider(e.target.value as any)} | Not tested |
| E0559 | <option value="all" className="bg-dark-navy text-white">{isArabic ? 'الكل' : 'ALL'}</option> <option value="online" className="bg-dark-navy text-neon-green">{isArabic ? 'متصل الآن (Online)' : 'Online Now'}</option> <option value=" | select; src/pages/admin/UserManagement.tsx:819 | Update via {(e) => setFilterStatus(e.target.value as any)} | value={filterStatus}; onChange={(e) => setFilterStatus(e.target.value as any)} | Not tested |
| E0560 | <option value="newest" className="bg-dark-navy text-white">{isArabic ? 'الأحدث تسجيلاً' : 'Newest'}</option> <option value="oldest" className="bg-dark-navy text-white">{isArabic ? 'الأقدم تسجيلاً' : 'Oldest'}</option> <option valu | select; src/pages/admin/UserManagement.tsx:837 | Update via {(e) => setSortBy(e.target.value as any)} | value={sortBy}; onChange={(e) => setSortBy(e.target.value as any)} | Not tested |
| E0561 | {isArabic ? 'ترقية العضو إلى أدمن' : 'Promote to Admin'} | button; src/pages/admin/UserManagement.tsx:981 | Trigger {() => setPendingRoleChange({ user, newRole: 'super_admin' })} | type="button"; onClick={() => setPendingRoleChange({ user, newRole: 'super_admin' })} | Not tested |
| E0562 | {isArabic ? 'تغيير الرتبة' : 'Change Role'} | select; src/pages/admin/UserManagement.tsx:993 | Update via {(e) => { if (e.target.value !== user.role) { setPendingRoleChange({ user, newRole: e.target.value }); } }} | value={user.role}; onChange={(e) => { if (e.target.value !== user.role) { setPendingRoleChange({ user, newRole: e.target.value }); } }} | Not tested |
| E0563 | {isArabic ? 'محرر الصلاحيات' : 'Permissions Editor'} | Button; src/pages/admin/UserManagement.tsx:1015 | Trigger {() => setEditingRoleUser(user)} | onClick={() => setEditingRoleUser(user)} | Not tested |
| E0564 | {isArabic ? 'عرض التفاصيل' : 'View Intel'} | Button; src/pages/admin/UserManagement.tsx:1024 | Trigger {() => setViewingUser(user)} | onClick={() => setViewingUser(user)} | Not tested |
| E0565 | {isArabic ? 'حذف العضو' : 'Delete Operative'} | Button; src/pages/admin/UserManagement.tsx:1033 | Trigger {() => setShowDeleteConfirm(user.id)} | onClick={() => setShowDeleteConfirm(user.id)} | Not tested |
| E0566 | <ChevronLeft className="w-3.5 h-3.5 mr-1 rtl:mr-0 rtl:ml-1" /> {isArabic ? 'السابق' : 'Prev'} | Button; src/pages/admin/UserManagement.tsx:1060 | Trigger {() => setCurrentPage(p => Math.max(1, p - 1))} | disabled={currentPage <= 1}; onClick={() => setCurrentPage(p => Math.max(1, p - 1))} | Not tested |
| E0567 | {isArabic ? 'التالي' : 'Next'} <ChevronRight className="w-3.5 h-3.5 ml-1 rtl:ml-0 rtl:mr-1" /> | Button; src/pages/admin/UserManagement.tsx:1073 | Trigger {() => setCurrentPage(p => Math.min(totalPages, p + 1))} | disabled={currentPage >= totalPages}; onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} | Not tested |
| E0568 | {isArabic ? 'عرض الأعضاء ↗' : 'VIEW_USERS ↗'} | button; src/pages/admin/UserManagement.tsx:1122 | Trigger {() => { setFilterRole(role.id); setActiveTab('users'); }} | onClick={() => { setFilterRole(role.id); setActiveTab('users'); }} | Not tested |
| E0569 | {isArabic ? 'إلغاء' : 'CANCEL'} | Button; src/pages/admin/UserManagement.tsx:1237 | Trigger {() => setPendingRoleChange(null)} | onClick={() => setPendingRoleChange(null)} | Not tested |
| E0570 | {isArabic ? 'تأكيد التغيير الآن 👑' : 'AUTHORIZE ROLE CHANGE 👑'} | Button; src/pages/admin/UserManagement.tsx:1244 | Trigger {confirmRoleChange} | onClick={confirmRoleChange} | Not tested |
| E0571 | {isArabic ? 'إلغاء' : 'CANCEL'} | Button; src/pages/admin/UserManagement.tsx:1274 | Trigger {() => setShowDeleteConfirm(null)} | onClick={() => setShowDeleteConfirm(null)} | Not tested |
| E0572 | {isArabic ? 'تأكيد الحذف النهائي' : 'REDACT_OPERATIVE'} | Button; src/pages/admin/UserManagement.tsx:1277 | Trigger {() => deleteUser(showDeleteConfirm)} | onClick={() => deleteUser(showDeleteConfirm)} | Not tested |
| E0573 | <div className="space-y-1.5"> <label className="text-[10px] font-cyber uppercase tracking-widest text-muted-foreground">{isArabic ? 'الاسم بالكامل' : 'Full Name'}</label> <Input placeholder="e.g. John Doe" value={newUser.fullName} | form; src/pages/admin/UserManagement.tsx:1297 | Submit via {handleAddUser} | onSubmit={handleAddUser} | Not tested |
| E0574 | "e.g. John Doe" | Input; src/pages/admin/UserManagement.tsx:1300 | Update via {(e) => setNewUser({...newUser, fullName: e.target.value})} | value={newUser.fullName}; onChange={(e) => setNewUser({...newUser, fullName: e.target.value})}; required=true | Not tested |
| E0575 | "operative@datacamp.club" | Input; src/pages/admin/UserManagement.tsx:1309 | Update via {(e) => setNewUser({...newUser, email: e.target.value})} | type="email"; value={newUser.email}; onChange={(e) => setNewUser({...newUser, email: e.target.value})}; required=true | Not tested |
| E0576 | "Set temporary password" | Input; src/pages/admin/UserManagement.tsx:1319 | Update via {(e) => setNewUser({...newUser, password: e.target.value})} | type="password"; value={newUser.password}; onChange={(e) => setNewUser({...newUser, password: e.target.value})}; required=true | Not tested |
| E0577 | <option value="member" className="bg-dark-navy">Member</option> <option value="super_admin" className="bg-dark-navy text-primary">Admin</option> | select; src/pages/admin/UserManagement.tsx:1330 | Update via {(e) => setNewUser({...newUser, role: e.target.value})} | value={newUser.role}; onChange={(e) => setNewUser({...newUser, role: e.target.value})} | Not tested |
| E0578 | <option value="Computer Science" className="bg-dark-navy">Computer Science</option> <option value="Engineering" className="bg-dark-navy">Engineering</option> <option value="Nursing" className="bg-dark-navy">Nursing</option> <optio | select; src/pages/admin/UserManagement.tsx:1341 | Update via {(e) => setNewUser({...newUser, faculty: e.target.value})} | value={newUser.faculty}; onChange={(e) => setNewUser({...newUser, faculty: e.target.value})} | Not tested |
| E0579 | {isArabic ? 'إلغاء' : 'ABORT'} | Button; src/pages/admin/UserManagement.tsx:1356 | Trigger {() => setShowAddModal(false)} | type="button"; onClick={() => setShowAddModal(false)} | Not tested |
| E0580 | {loading ? (isArabic ? 'جاري الحفظ...' : 'SAVING...') : (isArabic ? 'تأكيد الإضافة ⚡' : 'CONFIRM_ENTRY')} | Button; src/pages/admin/UserManagement.tsx:1357 | Submit enclosing form | type="submit"; disabled={loading} | Not tested |
| E0581 | <XCircle className="w-5 h-5" /> | Button; src/pages/admin/UserManagement.tsx:1387 | Trigger {() => setViewingUser(null)} | onClick={() => setViewingUser(null)} | Not tested |
| E0582 | <Shield className="w-3.5 h-3.5" /> {isArabic ? 'تعديل الصلاحيات' : 'EDIT_PERMISSIONS'} | Button; src/pages/admin/UserManagement.tsx:1427 | Trigger {() => { const target = viewingUser; setViewingUser(null); setEditingRoleUser(target); }} | onClick={() => { const target = viewingUser; setViewingUser(null); setEditingRoleUser(target); }} | Not tested |
| E0583 | {isArabic ? 'إغلاق' : 'CLOSE'} | Button; src/pages/admin/UserManagement.tsx:1439 | Trigger {() => setViewingUser(null)} | onClick={() => setViewingUser(null)} | Not tested |
| E0584 | RoleEditorModal | RoleEditorModal; src/pages/admin/UserManagement.tsx:1450 | Needs clarification: inspect enclosing link/form or component caller | onClose={() => setEditingRoleUser(null)}; onSaveRole={async (userId, newRole) => { setPendingRoleChange({ user: editingRoleUser, newRole }); setEditingRoleUser(null); }} | Not tested |

### src/pages/admin/forms/FormBuilder.tsx — admin

| ID | Element / label expression | Selector / source | Source-declared action (expected behavior pending confirmation) | Wiring / conditions | Status |
|---|---|---|---|---|---|
| E0585 | {isArabic ? 'العودة لقائمة النماذج' : 'Back to Forms'} | Link; src/pages/admin/forms/FormBuilder.tsx:325 | Navigate to "/admin/forms" | to="/admin/forms" | Not tested |
| E0586 | {isArabic ? 'معاينة سطح المكتب' : 'Desktop Preview'} | button; src/pages/admin/forms/FormBuilder.tsx:381 | Trigger {() => setPreviewMode(previewMode === 'desktop' ? 'off' : 'desktop')} | onClick={() => setPreviewMode(previewMode === 'desktop' ? 'off' : 'desktop')} | Not tested |
| E0587 | {isArabic ? 'معاينة الهاتف المحمول' : 'Mobile Preview'} | button; src/pages/admin/forms/FormBuilder.tsx:391 | Trigger {() => setPreviewMode(previewMode === 'mobile' ? 'off' : 'mobile')} | onClick={() => setPreviewMode(previewMode === 'mobile' ? 'off' : 'mobile')} | Not tested |
| E0588 | {isArabic ? 'تغيير المظهر والألوان' : 'Form Theme'} | button; src/pages/admin/forms/FormBuilder.tsx:404 | Trigger {() => setShowThemePicker(true)} | onClick={() => setShowThemePicker(true)} | Not tested |
| E0589 | {isArabic ? 'إعدادات الوصول والمزامنة' : 'Settings'} | button; src/pages/admin/forms/FormBuilder.tsx:413 | Trigger {() => setShowSettingsModal(true)} | onClick={() => setShowSettingsModal(true)} | Not tested |
| E0590 | <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> <span>{isArabic ? 'الردود والتحليلات' : 'Responses'}</span> | Link; src/pages/admin/forms/FormBuilder.tsx:423 | Navigate to {`/admin/forms/${form.id}/responses`} | to={`/admin/forms/${form.id}/responses`} | Not tested |
| E0591 | {isArabic ? 'مشاركة الرابط والـ QR' : 'Share Form'} | button; src/pages/admin/forms/FormBuilder.tsx:434 | Trigger {() => setShowShareModal(true)} | onClick={() => setShowShareModal(true)} | Not tested |
| E0592 | <Send className="w-3.5 h-3.5" /> <span>{form.status === 'published' ? (isArabic ? 'تحديث النشر' : 'Update') : isArabic ? 'نشر النموذج' : 'Publish'}</span> | button; src/pages/admin/forms/FormBuilder.tsx:444 | Trigger {handlePublish} | onClick={handlePublish} | Not tested |
| E0593 | {isArabic ? 'عنوان النموذج أو الاستبيان...' : 'Form Title...'} | input; src/pages/admin/forms/FormBuilder.tsx:474 | Update via {(e) => handleFormChange({ title: e.target.value })} | type="text"; value={form.title}; onChange={(e) => handleFormChange({ title: e.target.value })} | Not tested |
| E0594 | {isArabic ? 'أدخل وصفاً توضيحياً للمشاركين عن أهداف هذا النموذج...' : 'Enter a description or instructions for respondents...'} | textarea; src/pages/admin/forms/FormBuilder.tsx:482 | Update via {(e) => handleFormChange({ description: e.target.value })} | value={form.description}; onChange={(e) => handleFormChange({ description: e.target.value })} | Not tested |
| E0595 | QuestionCard | QuestionCard; src/pages/admin/forms/FormBuilder.tsx:520 | Needs clarification: inspect enclosing link/form or component caller | totalQuestions={questions.length}; onSelect={() => setSelectedQuestionIndex(index)}; onUpdate={(updated) => handleUpdateQuestion(updated, index)}; onDuplicate={() => handleDuplicateQuestion(index)}; onDelete={() => handleDeleteQuestion(index)}; onMoveUp={() => handleMoveUp(index)}; onMoveDown={() => handleMoveDown(index)} | Not tested |
| E0596 | <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform"> <Plus className="w-4 h-4" /> </div> <span>{isArabic ? 'إضافة سؤال أو قسم جديد' : 'Add Qu | button; src/pages/admin/forms/FormBuilder.tsx:539 | Trigger {() => setShowTypePicker(true)} | type="button"; onClick={() => setShowTypePicker(true)} | Not tested |
| E0597 | {isArabic ? 'إغلاق المعاينة' : 'Exit Preview'} | button; src/pages/admin/forms/FormBuilder.tsx:572 | Trigger {() => setPreviewMode('off')} | onClick={() => setPreviewMode('off')} | Not tested |
| E0598 | {q.settings?.placeholder \|\| 'Short answer...'} | input; src/pages/admin/forms/FormBuilder.tsx:619 | Accept input; validation/consumer shown in source | type="text"; disabled=true | Not tested |
| E0599 | {q.settings?.placeholder \|\| 'Detailed answer...'} | textarea; src/pages/admin/forms/FormBuilder.tsx:627 | Accept input; validation/consumer shown in source | disabled=true | Not tested |
| E0600 | "Preview only, submission is disabled in the builder." | button; src/pages/admin/forms/FormBuilder.tsx:650 | Needs clarification: inspect enclosing link/form or component caller | type="button"; disabled=true; aria-label="Preview only, submission is disabled in the builder." | Not tested |
| E0601 | {/* ======================================================== */} {/* 1. TOP BUILDER TOOLBAR */} {/* ======================================================== */} <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-md bord | QuestionTypePicker; src/pages/admin/forms/FormBuilder.tsx:668 | Needs clarification: inspect enclosing link/form or component caller | onClose={() => setShowTypePicker(false)}; onSelectType={handleAddQuestion} | Not tested |
| E0602 | {/* ======================================================== */} {/* 1. TOP BUILDER TOOLBAR */} {/* ======================================================== */} <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-md bord | FormThemePicker; src/pages/admin/forms/FormBuilder.tsx:674 | Update via {(theme) => handleFormChange({ theme })} | onClose={() => setShowThemePicker(false)}; onChange={(theme) => handleFormChange({ theme })} | Not tested |
| E0603 | {/* ======================================================== */} {/* 1. TOP BUILDER TOOLBAR */} {/* ======================================================== */} <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-md bord | FormSettingsModal; src/pages/admin/forms/FormBuilder.tsx:681 | Update via {handleFormChange} | onClose={() => setShowSettingsModal(false)}; onChange={handleFormChange} | Not tested |
| E0604 | {/* ======================================================== */} {/* 1. TOP BUILDER TOOLBAR */} {/* ======================================================== */} <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-md bord | FormShareModal; src/pages/admin/forms/FormBuilder.tsx:688 | Needs clarification: inspect enclosing link/form or component caller | onClose={() => setShowShareModal(false)} | Not tested |

### src/pages/admin/forms/FormList.tsx — admin

| ID | Element / label expression | Selector / source | Source-declared action (expected behavior pending confirmation) | Wiring / conditions | Status |
|---|---|---|---|---|---|
| E0605 | <Plus className="w-4 h-4" /> <span>{isArabic ? '+ نموذج جديد' : '+ New Form'}</span> | Link; src/pages/admin/forms/FormList.tsx:133 | Navigate to "/admin/forms/new" | to="/admin/forms/new" | Not tested |
| E0606 | {isArabic ? 'البحث عن نموذج أو رابط...' : 'Search by title, description or slug...'} | input; src/pages/admin/forms/FormList.tsx:186 | Update via {(e) => setSearchQuery(e.target.value)} | type="text"; value={searchQuery}; onChange={(e) => setSearchQuery(e.target.value)} | Not tested |
| E0607 | {st === 'all' ? isArabic ? 'الكل' : 'All' : st === 'published' ? isArabic ? 'المنشورة' : 'Published' : st === 'draft' ? isArabic ? 'المسودات' : 'Drafts' : isArabic ? 'المغلقة' : 'Closed'} | button; src/pages/admin/forms/FormList.tsx:198 | Trigger {() => setStatusFilter(st)} | onClick={() => setStatusFilter(st)} | Not tested |
| E0608 | <Plus className="w-4 h-4" /> <span>{isArabic ? 'إنشاء أول نموذج الآن' : 'Create First Form'}</span> | Link; src/pages/admin/forms/FormList.tsx:257 | Navigate to "/admin/forms/new" | to="/admin/forms/new" | Not tested |
| E0609 | {form.title} | Link; src/pages/admin/forms/FormList.tsx:307 | Navigate to {`/admin/forms/builder/${form.id}`} | to={`/admin/forms/builder/${form.id}`} | Not tested |
| E0610 | {isArabic ? 'عرض كافة الردود' : 'View responses'} | Link; src/pages/admin/forms/FormList.tsx:320 | Navigate to {`/admin/forms/${form.id}/responses`} | to={`/admin/forms/${form.id}/responses`} | Not tested |
| E0611 | {isArabic ? 'تعديل المحتوى' : 'Edit Form'} | Link; src/pages/admin/forms/FormList.tsx:344 | Navigate to {`/admin/forms/builder/${form.id}`} | to={`/admin/forms/builder/${form.id}`} | Not tested |
| E0612 | {isArabic ? 'التحليلات والردود' : 'Responses & Analytics'} | Link; src/pages/admin/forms/FormList.tsx:353 | Navigate to {`/admin/forms/${form.id}/responses`} | to={`/admin/forms/${form.id}/responses`} | Not tested |
| E0613 | {isArabic ? 'مشاركة الرابط والـ QR' : 'Share Link & QR'} | button; src/pages/admin/forms/FormList.tsx:362 | Trigger {() => setSelectedFormForShare(form)} | type="button"; onClick={() => setSelectedFormForShare(form)} | Not tested |
| E0614 | {isArabic ? 'تكرار النموذج' : 'Duplicate'} | button; src/pages/admin/forms/FormList.tsx:372 | Trigger {() => handleDuplicate(form)} | type="button"; onClick={() => handleDuplicate(form)} | Not tested |
| E0615 | {isArabic ? 'فتح جدول Google Sheets' : 'Open Google Sheet'} | a; src/pages/admin/forms/FormList.tsx:383 | Open {form.spreadsheet_url} | href={form.spreadsheet_url} | Not tested |
| E0616 | {form.status === 'published' ? isArabic ? 'إغلاق' : 'Close' : isArabic ? 'إعادة فتح' : 'Reopen'} | button; src/pages/admin/forms/FormList.tsx:397 | Trigger {() => handleToggleStatus(form)} | type="button"; onClick={() => handleToggleStatus(form)} | Not tested |
| E0617 | {isArabic ? 'حذف النموذج' : 'Delete'} | button; src/pages/admin/forms/FormList.tsx:412 | Trigger {() => setDeleteConfirmForm(form)} | type="button"; onClick={() => setDeleteConfirmForm(form)} | Not tested |
| E0618 | FormShareModal | FormShareModal; src/pages/admin/forms/FormList.tsx:430 | Needs clarification: inspect enclosing link/form or component caller | onClose={() => setSelectedFormForShare(null)} | Not tested |
| E0619 | {isArabic ? 'إلغاء' : 'Cancel'} | button; src/pages/admin/forms/FormList.tsx:457 | Trigger {() => setDeleteConfirmForm(null)} | type="button"; disabled={isDeleting}; onClick={() => setDeleteConfirmForm(null)} | Not tested |
| E0620 | {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />} <span>{isArabic ? 'نعم، حذف نهائي' : 'Yes, Delete'}</span> | button; src/pages/admin/forms/FormList.tsx:465 | Trigger {handleDelete} | type="button"; disabled={isDeleting}; onClick={handleDelete} | Not tested |

### src/pages/admin/forms/FormResponses.tsx — admin

| ID | Element / label expression | Selector / source | Source-declared action (expected behavior pending confirmation) | Wiring / conditions | Status |
|---|---|---|---|---|---|
| E0621 | <ArrowLeft className="w-5 h-5 rtl:rotate-180" /> | Link; src/pages/admin/forms/FormResponses.tsx:240 | Navigate to "/admin/forms" | to="/admin/forms" | Not tested |
| E0622 | <ExternalLink className="w-3.5 h-3.5" /> <span>{isArabic ? 'فتح Google Sheet' : 'Open Sheet'}</span> | a; src/pages/admin/forms/FormResponses.tsx:261 | Open {form.spreadsheet_url} | href={form.spreadsheet_url} | Not tested |
| E0623 | {isArabic ? 'إعادة مزامنة كافة الردود مع Google Sheets' : 'Resync all rows'} | button; src/pages/admin/forms/FormResponses.tsx:272 | Trigger {handleResyncAll} | type="button"; disabled={isResyncing}; onClick={handleResyncAll} | Not tested |
| E0624 | <Download className="w-3.5 h-3.5" /> <span>{isArabic ? 'تصدير Excel (.xlsx)' : 'Export Excel'}</span> | button; src/pages/admin/forms/FormResponses.tsx:283 | Trigger {handleExportExcel} | type="button"; onClick={handleExportExcel} | Not tested |
| E0625 | <Printer className="w-3.5 h-3.5" /> <span>{isArabic ? 'طباعة / PDF' : 'Print / PDF'}</span> | button; src/pages/admin/forms/FormResponses.tsx:292 | Trigger {handlePrint} | type="button"; onClick={handlePrint} | Not tested |
| E0626 | <BarChart3 className="w-4 h-4" /> <span>{isArabic ? 'الملخص البياني والإحصائيات' : 'Summary & Analytics'}</span> | button; src/pages/admin/forms/FormResponses.tsx:313 | Trigger {() => setActiveTab('summary')} | onClick={() => setActiveTab('summary')} | Not tested |
| E0627 | <ListFilter className="w-4 h-4" /> <span>{isArabic ? 'الاستجابات الفردية' : 'Individual Responses'} ({responses.length})</span> | button; src/pages/admin/forms/FormResponses.tsx:325 | Trigger {() => setActiveTab('individual')} | onClick={() => setActiveTab('individual')} | Not tested |
| E0628 | {isArabic ? 'بحث في الردود والبريد...' : 'Search by email or answer...'} | input; src/pages/admin/forms/FormResponses.tsx:557 | Update via {(e) => setSearchQuery(e.target.value)} | type="text"; value={searchQuery}; onChange={(e) => setSearchQuery(e.target.value)} | Not tested |
| E0629 | <td className="p-3.5 font-mono text-muted-foreground">{idx + 1}</td> <td className="p-3.5 font-medium text-foreground"> <div> <p className="font-semibold text-foreground"> {resp.respondent_profile?.full_name \\|\\| resp.respondent_e | tr; src/pages/admin/forms/FormResponses.tsx:586 | Trigger {() => setSelectedResponse(resp)} | onClick={() => setSelectedResponse(resp)} | Not tested |
| E0630 | <button type="button" onClick={() => setSelectedResponse(resp)} className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors" title={isArabic ? 'عرض التفاصيل' : 'View Details'} > <Eye className="w-4 h-4" /> </but | div; src/pages/admin/forms/FormResponses.tsx:612 | Trigger {(e) => e.stopPropagation()} | onClick={(e) => e.stopPropagation()} | Not tested |
| E0631 | {isArabic ? 'عرض التفاصيل' : 'View Details'} | button; src/pages/admin/forms/FormResponses.tsx:613 | Trigger {() => setSelectedResponse(resp)} | type="button"; onClick={() => setSelectedResponse(resp)} | Not tested |
| E0632 | {isArabic ? 'حذف الاستجابة' : 'Delete Response'} | button; src/pages/admin/forms/FormResponses.tsx:621 | Trigger {() => handleDeleteResponse(resp.id)} | type="button"; onClick={() => handleDeleteResponse(resp.id)} | Not tested |
| E0633 | <div className="flex items-center justify-between pb-4 border-b border-white/10"> <div> <h3 className="text-lg font-bold font-cyber text-foreground"> {isArabic ? 'تفاصيل الاستجابة الفردية' : 'Individual Response Sheet'} </h3> <p c | div; src/pages/admin/forms/FormResponses.tsx:645 | Trigger {(e) => e.stopPropagation()} | onClick={(e) => e.stopPropagation()} | Not tested |
| E0634 | <X className="w-5 h-5" /> | button; src/pages/admin/forms/FormResponses.tsx:658 | Trigger {() => setSelectedResponse(null)} | onClick={() => setSelectedResponse(null)} | Not tested |
| E0635 | <Trash2 className="w-3.5 h-3.5" /> <span>{isArabic ? 'حذف هذه الاستجابة' : 'Delete Response'}</span> | button; src/pages/admin/forms/FormResponses.tsx:699 | Trigger {() => handleDeleteResponse(selectedResponse.id)} | type="button"; onClick={() => handleDeleteResponse(selectedResponse.id)} | Not tested |
| E0636 | {isArabic ? 'إغلاق' : 'Close'} | button; src/pages/admin/forms/FormResponses.tsx:708 | Trigger {() => setSelectedResponse(null)} | type="button"; onClick={() => setSelectedResponse(null)} | Not tested |

### src/pages/admin/forms/FormSettingsModal.tsx — admin

| ID | Element / label expression | Selector / source | Source-declared action (expected behavior pending confirmation) | Wiring / conditions | Status |
|---|---|---|---|---|---|
| E0637 | <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5"> <div className="flex items-center space-x-3 rtl:space-x-reverse"> <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 f | div; src/pages/admin/forms/FormSettingsModal.tsx:33 | Trigger {(e) => e.stopPropagation()} | onClick={(e) => e.stopPropagation()} | Not tested |
| E0638 | <X className="w-5 h-5" /> | button; src/pages/admin/forms/FormSettingsModal.tsx:51 | Trigger {onClose} | onClick={onClose} | Not tested |
| E0639 | <Globe className={`w-5 h-5 mt-0.5 shrink-0 ${form.allow_anonymous ? 'text-primary' : 'text-muted-foreground'}`} /> <div> <p className="text-xs font-bold text-foreground"> {isArabic ? 'أي شخص لديه الرابط' : 'Anyone with the link'} | button; src/pages/admin/forms/FormSettingsModal.tsx:68 | Trigger {() => onChange({ allow_anonymous: true })} | type="button"; onClick={() => onChange({ allow_anonymous: true })} | Not tested |
| E0640 | <Lock className={`w-5 h-5 mt-0.5 shrink-0 ${!form.allow_anonymous ? 'text-primary' : 'text-muted-foreground'}`} /> <div> <p className="text-xs font-bold text-foreground"> {isArabic ? 'أعضاء النادي المسجلين فقط' : 'Logged-in Member | button; src/pages/admin/forms/FormSettingsModal.tsx:88 | Trigger {() => onChange({ allow_anonymous: false })} | type="button"; onClick={() => onChange({ allow_anonymous: false })} | Not tested |
| E0641 | <div className={`w-4 h-4 rounded-full bg-white transition-transform ${ form.one_response_per_user ? 'translate-x-4 rtl:-translate-x-4' : 'translate-x-0' }`} /> | button; src/pages/admin/forms/FormSettingsModal.tsx:128 | Trigger {() => onChange({ one_response_per_user: !form.one_response_per_user })} | type="button"; onClick={() => onChange({ one_response_per_user: !form.one_response_per_user })} | Not tested |
| E0642 | <div className={`w-4 h-4 rounded-full bg-white transition-transform ${ form.collect_email ? 'translate-x-4 rtl:-translate-x-4' : 'translate-x-0' }`} /> | button; src/pages/admin/forms/FormSettingsModal.tsx:153 | Trigger {() => onChange({ collect_email: !form.collect_email })} | type="button"; onClick={() => onChange({ collect_email: !form.collect_email })} | Not tested |
| E0643 | <label className="text-muted-foreground block mb-1"> {isArabic ? 'تاريخ ووقت الفتح (اختياري):' : 'Opens At (optional):'} </label> <input type="datetime-local" value={form.opens_at ? form.opens_at.substring(0, 16) : ''} onChange={( | input; src/pages/admin/forms/FormSettingsModal.tsx:182 | Update via {(e) => onChange({ opens_at: e.target.value ? new Date(e.target.value).toISOString() : null, }) } | type="datetime-local"; value={form.opens_at ? form.opens_at.substring(0, 16) : ''}; onChange={(e) => onChange({ opens_at: e.target.value ? new Date(e.target.value).toISOString() : null, }) } | Not tested |
| E0644 | <label className="text-muted-foreground block mb-1"> {isArabic ? 'تاريخ ووقت الإغلاق (اختياري):' : 'Closes At (optional):'} </label> <input type="datetime-local" value={form.closes_at ? form.closes_at.substring(0, 16) : ''} onChan | input; src/pages/admin/forms/FormSettingsModal.tsx:198 | Update via {(e) => onChange({ closes_at: e.target.value ? new Date(e.target.value).toISOString() : null, }) } | type="datetime-local"; value={form.closes_at ? form.closes_at.substring(0, 16) : ''}; onChange={(e) => onChange({ closes_at: e.target.value ? new Date(e.target.value).toISOString() : null, }) } | Not tested |
| E0645 | <div className={`w-4 h-4 rounded-full bg-white transition-transform ${ form.sheets_sync_enabled ? 'translate-x-4 rtl:-translate-x-4' : 'translate-x-0' }`} /> | button; src/pages/admin/forms/FormSettingsModal.tsx:228 | Trigger {() => onChange({ sheets_sync_enabled: !form.sheets_sync_enabled })} | type="button"; onClick={() => onChange({ sheets_sync_enabled: !form.sheets_sync_enabled })} | Not tested |
| E0646 | {isArabic ? 'شكراً لك! تم تسجيل ردك بنجاح.' : 'Thank you! Your response has been recorded.'} | textarea; src/pages/admin/forms/FormSettingsModal.tsx:249 | Update via {(e) => onChange({ success_message: e.target.value })} | value={form.success_message \|\| ''}; onChange={(e) => onChange({ success_message: e.target.value })} | Not tested |
| E0647 | <span className="text-muted-foreground font-mono">/f/</span> <input type="text" value={form.slug \\|\\| ''} onChange={(e) => onChange({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'), }) } className="flex-1 bg-transp | input; src/pages/admin/forms/FormSettingsModal.tsx:265 | Update via {(e) => onChange({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'), }) } | type="text"; value={form.slug \|\| ''}; onChange={(e) => onChange({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'), }) } | Not tested |
| E0648 | {isArabic ? 'حفظ وإغلاق' : 'Done'} | button; src/pages/admin/forms/FormSettingsModal.tsx:280 | Trigger {onClose} | onClick={onClose} | Not tested |

### src/pages/admin/forms/FormShareModal.tsx — admin

| ID | Element / label expression | Selector / source | Source-declared action (expected behavior pending confirmation) | Wiring / conditions | Status |
|---|---|---|---|---|---|
| E0649 | <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5"> <div className="flex items-center space-x-3 rtl:space-x-reverse"> <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 f | div; src/pages/admin/forms/FormShareModal.tsx:77 | Trigger {(e) => e.stopPropagation()} | onClick={(e) => e.stopPropagation()} | Not tested |
| E0650 | <X className="w-5 h-5" /> | button; src/pages/admin/forms/FormShareModal.tsx:95 | Trigger {onClose} | onClick={onClose} | Not tested |
| E0651 | {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} <span>{copied ? (isArabic ? 'تم النسخ' : 'Copied!') : isArabic ? 'نسخ' : 'Copy'}</span> | button; src/pages/admin/forms/FormShareModal.tsx:115 | Trigger {handleCopyLink} | type="button"; onClick={handleCopyLink} | Not tested |
| E0652 | <QRCodeSVG value={publicUrl} size={130} level="M" includeMargin={false} /> | QRCodeSVG; src/pages/admin/forms/FormShareModal.tsx:132 | Render QR encoding {publicUrl} | value={publicUrl} | Not tested |
| E0653 | <Download className="w-3.5 h-3.5" /> {isArabic ? 'تحميل كصورة (PNG)' : 'Download PNG'} | button; src/pages/admin/forms/FormShareModal.tsx:153 | Trigger {handleDownloadQR} | type="button"; onClick={handleDownloadQR} | Not tested |
| E0654 | <ExternalLink className="w-3.5 h-3.5" /> {isArabic ? 'فتح النموذج الآن' : 'Open Live'} | a; src/pages/admin/forms/FormShareModal.tsx:162 | Open {publicUrl} | href={publicUrl} | Not tested |
| E0655 | {isArabic ? 'إغلاق' : 'Close'} | button; src/pages/admin/forms/FormShareModal.tsx:185 | Trigger {onClose} | onClick={onClose} | Not tested |

### src/pages/admin/forms/FormThemePicker.tsx — admin

| ID | Element / label expression | Selector / source | Source-declared action (expected behavior pending confirmation) | Wiring / conditions | Status |
|---|---|---|---|---|---|
| E0656 | <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5"> <div className="flex items-center space-x-3 rtl:space-x-reverse"> <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 f | div; src/pages/admin/forms/FormThemePicker.tsx:90 | Trigger {(e) => e.stopPropagation()} | onClick={(e) => e.stopPropagation()} | Not tested |
| E0657 | <X className="w-5 h-5" /> | button; src/pages/admin/forms/FormThemePicker.tsx:108 | Trigger {onClose} | onClick={onClose} | Not tested |
| E0658 | <div className="flex items-center space-x-2.5 rtl:space-x-reverse"> <div className="flex -space-x-1 rtl:-space-x-reverse"> <div className="w-5 h-5 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: p.primary | button; src/pages/admin/forms/FormThemePicker.tsx:125 | Trigger {() => onChange({ ...theme, primaryColor: p.primary, accentColor: p.accent, backgroundStyle: p.backgroundStyle, }) } | onClick={() => onChange({ ...theme, primaryColor: p.primary, accentColor: p.accent, backgroundStyle: p.backgroundStyle, }) } | Not tested |
| E0659 | <input type="color" value={theme.primaryColor \\|\\| '#6366f1'} onChange={(e) => onChange({ ...theme, primaryColor: e.target.value })} className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent p-0" /> <span className="font-m | input; src/pages/admin/forms/FormThemePicker.tsx:169 | Update via {(e) => onChange({ ...theme, primaryColor: e.target.value })} | type="color"; value={theme.primaryColor \|\| '#6366f1'}; onChange={(e) => onChange({ ...theme, primaryColor: e.target.value })} | Not tested |
| E0660 | <input type="color" value={theme.accentColor \\|\\| '#06b6d4'} onChange={(e) => onChange({ ...theme, accentColor: e.target.value })} className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent p-0" /> <span className="font-mon | input; src/pages/admin/forms/FormThemePicker.tsx:184 | Update via {(e) => onChange({ ...theme, accentColor: e.target.value })} | type="color"; value={theme.accentColor \|\| '#06b6d4'}; onChange={(e) => onChange({ ...theme, accentColor: e.target.value })} | Not tested |
| E0661 | {isArabic ? 'تم وتطبيق' : 'Apply Theme'} | button; src/pages/admin/forms/FormThemePicker.tsx:197 | Trigger {onClose} | onClick={onClose} | Not tested |

### src/pages/admin/forms/QuestionCard.tsx — admin

| ID | Element / label expression | Selector / source | Source-declared action (expected behavior pending confirmation) | Wiring / conditions | Status |
|---|---|---|---|---|---|
| E0662 | {/* Top accent line if selected */} {isSelected && ( <div className="h-1 w-full bg-gradient-to-r from-primary via-cyan-400 to-indigo-500" /> )} <div className="p-5 md:p-6 space-y-5"> {/* Top Header Row: Question Number, Type Badge | div; src/pages/admin/forms/QuestionCard.tsx:127 | Trigger {onSelect} | onClick={onSelect} | Not tested |
| E0663 | {isArabic ? 'تحريك لأعلى' : 'Move up'} | button; src/pages/admin/forms/QuestionCard.tsx:160 | Trigger {(e) => { e.stopPropagation(); onMoveUp(); }} | type="button"; disabled={index === 0}; onClick={(e) => { e.stopPropagation(); onMoveUp(); }} | Not tested |
| E0664 | {isArabic ? 'تحريك لأسفل' : 'Move down'} | button; src/pages/admin/forms/QuestionCard.tsx:172 | Trigger {(e) => { e.stopPropagation(); onMoveDown(); }} | type="button"; disabled={index === totalQuestions - 1}; onClick={(e) => { e.stopPropagation(); onMoveDown(); }} | Not tested |
| E0665 | {isArabic ? 'تكرار السؤال' : 'Duplicate'} | button; src/pages/admin/forms/QuestionCard.tsx:184 | Trigger {(e) => { e.stopPropagation(); onDuplicate(); }} | type="button"; onClick={(e) => { e.stopPropagation(); onDuplicate(); }} | Not tested |
| E0666 | {isArabic ? 'حذف السؤال' : 'Delete'} | button; src/pages/admin/forms/QuestionCard.tsx:195 | Trigger {(e) => { e.stopPropagation(); onDelete(); }} | type="button"; onClick={(e) => { e.stopPropagation(); onDelete(); }} | Not tested |
| E0667 | { isSection ? isArabic ? 'عنوان القسم (مثال: البيانات الشخصية)' : 'Section Title (e.g. Personal Information)' : isArabic ? 'اكتب سؤالك هنا...' : 'Write your question here...' } | input; src/pages/admin/forms/QuestionCard.tsx:211 | Update via {handleTitleChange} | type="text"; value={question.title}; onChange={handleTitleChange} | Not tested |
| E0668 | { isArabic ? 'وصف إضافي أو إرشادات للمجيب (اختياري)...' : 'Subtitle or guidance for the respondent (optional)...' } | input; src/pages/admin/forms/QuestionCard.tsx:231 | Update via {handleDescChange} | type="text"; value={question.description \|\| ''}; onChange={handleDescChange} | Not tested |
| E0669 | <X className="w-3.5 h-3.5" /> | button; src/pages/admin/forms/QuestionCard.tsx:242 | Trigger {() => { setShowDescription(false); onUpdate({ ...question, description: '' }); }} | type="button"; onClick={() => { setShowDescription(false); onUpdate({ ...question, description: '' }); }} | Not tested |
| E0670 | + {isArabic ? 'إضافة وصف توضيحي' : 'Add subtitle/guidance'} | button; src/pages/admin/forms/QuestionCard.tsx:254 | Trigger {() => setShowDescription(true)} | type="button"; onClick={() => setShowDescription(true)} | Not tested |
| E0671 | <div className="text-muted-foreground/60 shrink-0"> {question.type === 'single_choice' ? ( <Circle className="w-4 h-4" /> ) : question.type === 'dropdown' ? ( <span className="text-xs font-mono font-bold w-4 text-center block"> {o | input; src/pages/admin/forms/QuestionCard.tsx:288 | Update via {(e) => handleUpdateOption(opt.id, e.target.value)} | type="text"; value={opt.text}; disabled={opt.isOther}; onChange={(e) => handleUpdateOption(opt.id, e.target.value)} | Not tested |
| E0672 | <option value="">{isArabic ? 'التالي مباشرة' : 'Next Question'}</option> <option value="end">{isArabic ? 'إنهاء النموذج' : 'End Form'}</option> {allQuestions .filter((q) => q.id !== question.id) .map((q, qIdx) => ( <option key={q. | select; src/pages/admin/forms/QuestionCard.tsx:298 | Update via {(e) => handleOptionBranching(opt.id, e.target.value)} | value={opt.goToQuestionId \|\| ''}; onChange={(e) => handleOptionBranching(opt.id, e.target.value)} | Not tested |
| E0673 | <X className="w-4 h-4" /> | button; src/pages/admin/forms/QuestionCard.tsx:315 | Trigger {() => handleDeleteOption(opt.id)} | type="button"; disabled={(question.options \|\| []).length <= 1}; onClick={() => handleDeleteOption(opt.id)} | Not tested |
| E0674 | <Plus className="w-3.5 h-3.5" /> {isArabic ? 'إضافة خيار' : 'Add option'} | button; src/pages/admin/forms/QuestionCard.tsx:328 | Trigger {handleAddOption} | type="button"; onClick={handleAddOption} | Not tested |
| E0675 | + {isArabic ? 'إضافة خيار "أخرى"' : 'Add "Other"'} | button; src/pages/admin/forms/QuestionCard.tsx:340 | Trigger {handleAddOtherOption} | type="button"; onClick={handleAddOtherOption} | Not tested |
| E0676 | <option value={5}>5 {isArabic ? 'نجوم' : 'Stars'}</option> <option value={10}>10 {isArabic ? 'نجوم' : 'Stars'}</option> | select; src/pages/admin/forms/QuestionCard.tsx:372 | Update via {(e) => handleSettingsChange('maxRating', parseInt(e.target.value))} | value={question.settings?.maxRating \|\| 5}; onChange={(e) => handleSettingsChange('maxRating', parseInt(e.target.value))} | Not tested |
| E0677 | <option value="star">{isArabic ? 'نجمة' : 'Star'}</option> <option value="heart">{isArabic ? 'قلب' : 'Heart'}</option> <option value="number">{isArabic ? 'أرقام' : 'Number'}</option> | select; src/pages/admin/forms/QuestionCard.tsx:383 | Update via {(e) => handleSettingsChange('ratingIcon', e.target.value)} | value={question.settings?.ratingIcon \|\| 'star'}; onChange={(e) => handleSettingsChange('ratingIcon', e.target.value)} | Not tested |
| E0678 | {question.settings?.ratingIcon === 'heart' ? ( <Heart className="w-6 h-6 text-rose-500 fill-rose-500/20" /> ) : question.settings?.ratingIcon === 'number' ? ( <span className="w-7 h-7 rounded-lg border border-white/20 flex items-c | button; src/pages/admin/forms/QuestionCard.tsx:398 | Needs clarification: inspect enclosing link/form or component caller | type="button" | Not tested |
| E0679 | {isArabic ? 'لا أوافق بشدة' : 'Strongly Disagree'} | input; src/pages/admin/forms/QuestionCard.tsx:426 | Update via {(e) => handleSettingsChange('scaleMinLabel', e.target.value)} | type="text"; value={question.settings?.scaleMinLabel \|\| ''}; onChange={(e) => handleSettingsChange('scaleMinLabel', e.target.value)} | Not tested |
| E0680 | {isArabic ? 'أوافق بشدة' : 'Strongly Agree'} | input; src/pages/admin/forms/QuestionCard.tsx:438 | Update via {(e) => handleSettingsChange('scaleMaxLabel', e.target.value)} | type="text"; value={question.settings?.scaleMaxLabel \|\| ''}; onChange={(e) => handleSettingsChange('scaleMaxLabel', e.target.value)} | Not tested |
| E0681 | <GitBranch className="w-3.5 h-3.5" /> {isArabic ? 'التفرع والمنطق المشروط' : 'Branching Logic'} | button; src/pages/admin/forms/QuestionCard.tsx:518 | Trigger {() => setShowBranching(!showBranching)} | type="button"; onClick={() => setShowBranching(!showBranching)} | Not tested |
| E0682 | <div className={`w-4 h-4 rounded-full bg-white transition-transform ${ question.required ? 'translate-x-4 rtl:-translate-x-4' : 'translate-x-0' }`} /> | button; src/pages/admin/forms/QuestionCard.tsx:536 | Trigger {handleRequiredToggle} | type="button"; onClick={handleRequiredToggle} | Not tested |

### src/pages/admin/forms/QuestionTypePicker.tsx — admin

| ID | Element / label expression | Selector / source | Source-declared action (expected behavior pending confirmation) | Wiring / conditions | Status |
|---|---|---|---|---|---|
| E0683 | <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5"> <div className="flex items-center space-x-3 rtl:space-x-reverse"> <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 f | div; src/pages/admin/forms/QuestionTypePicker.tsx:159 | Trigger {(e) => e.stopPropagation()} | onClick={(e) => e.stopPropagation()} | Not tested |
| E0684 | <X className="w-5 h-5" /> | button; src/pages/admin/forms/QuestionTypePicker.tsx:177 | Trigger {onClose} | onClick={onClose} | Not tested |
| E0685 | <div className="p-2.5 rounded-lg bg-white/5 group-hover:bg-primary/20 group-hover:text-primary transition-colors shrink-0 text-muted-foreground"> <Icon className="w-5 h-5" /> </div> <div className="min-w-0 flex-1"> <div className= | button; src/pages/admin/forms/QuestionTypePicker.tsx:189 | Trigger {() => { onSelectType(opt.type); onClose(); }} | onClick={() => { onSelectType(opt.type); onClose(); }} | Not tested |
