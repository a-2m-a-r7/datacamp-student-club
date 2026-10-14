> Historical discovery inventory. Current verified tab operations and limits: [FINAL_TAB_REPORT.md](FINAL_TAB_REPORT.md). This initial inventory is not a 100% test-pass claim.

# Phase 1: Comprehensive Project Audit & Interactive Elements Inventory
**Project:** DataCamp Student Club Web Platform (`datacamp-student-club`)  
**Auditor:** Senior QA Automation Engineer & Full-Stack Debugger  
**Branch:** `qa-audit`  
**Date:** October 2026  
**Status:** PHASE 1 COMPLETE — Ready for User Approval  

---

## 1. Executive Summary & Audit Scope

This document contains the complete, authoritative discovery inventory of the DataCamp Student Club web platform, prepared strictly under Phase 1 requirements.

- **Strict Audit Rule:** No production or project source code has been altered.
- **Dedicated Folder:** All audit assets, test scripts, and reports are located in `qa-audit/`.
- **Scope:** 100% of all routes, tabs, buttons, links, QR codes, forms, dialogs, dropdowns, and interactive widgets across all three access tiers (Public, Normal User, Admin).

---

## 2. Technology Stack & Role Architecture

### 2.1 Technology Stack
- **Frontend Framework:** React 19, TypeScript, Vite 6
- **Styling:** Tailwind CSS v4, Motion (Framer Motion v12), Radix UI primitives
- **Backend & Database:** Supabase (Auth, PostgreSQL Database, Row Level Security, Storage, Realtime)
- **Integrations:**
  - Google Gemini API (`@google/genai`) for NEXUS AI Mentor
  - Google Sheets API via serverless/edge sync
  - SheetJS (`xlsx`) for Excel workbook generation
  - `jspdf` & `html2canvas` for Certificate & Member ID Card exports
  - `qrcode.react` (SVG & Canvas renderers)
  - `html5-qrcode` (Live browser camera QR scanning)

### 2.2 Access Control & Role Hierarchy
1. **Public / Visitor (Logged-Out):**
   - Unrestricted access to promotional, curriculum showcase, compiler, event catalog, blog, and public form response pages.
   - Guarded routes automatically redirect visitors to `/login` with return intent (`state.from`).
2. **Authenticated Member / Normal User (`member`):**
   - Protected by `<ProtectedRoute>`.
   - Access to personal dashboard, profile management, course enrollment/learning, quizzes, and notification center.
3. **Manager & Admin Portal (`<ManagerRoute>`):**
   - Requires verified session and elevated role (`isManager`).
   - Protected by sub-level `<RoleGuard>`:
     - `super_admin`: Full unrestricted access to all tabs, plus `/admin/security` and `/admin/settings`.
     - `admin`: Full management of users, courses, points, forms, events, staff, gallery, projects, blog, content.
     - `hr`: Access to users, staff, and events.
     - `event_manager`: Access to events and attendance scanner.
     - `content_manager`: Access to content announcements, courses, projects, blog, gallery, messages.
     - `editor`: Access to courses, blog, and content.

---

## 3. Discovered Code Anomalies & Broken Elements (Static Analysis)

During Phase 1 static code inspection, the following dead elements and missing handlers were identified before test execution:

| # | File & Location | Element | Issue Description | Severity | Expected Behavior |
|---|-----------------|---------|-------------------|----------|-------------------|
| 1 | `src/components/Footer.tsx` (Lines 60–63) | Social Links (GitHub, Twitter, LinkedIn, Facebook) | Fallback links hardcode `href="#"` when database settings are missing. | Medium | Should link to official club social profiles or hide gracefully. |
| 2 | `src/pages/Contact.tsx` (Lines 190–192) | "Join Discord Server" button | **Dead button.** Has no `onClick`, no `href`, no `<Link>`. Clicking produces zero effect. | High | Should open the official DataCamp Discord invite link in a new tab. |
| 3 | `src/pages/Projects.tsx` (Lines 40, 52, 81, 94) | Sample Project "Live Demo" links | Fallback data sets `liveUrl: '#'`. Clicking navigates to empty hash. | Low | Should link to deployed project demo or disable demo button when URL is absent. |
| 4 | `src/components/CertificateView.tsx` (Line 752) | LinkedIn Share button | Uses `window.location.origin` inside verification URL. On local environments, it creates `http://localhost:3000/...` verification link. | Medium | Should utilize configured production domain fallback for LinkedIn accreditation. |
| 5 | `src/pages/admin/forms/FormBuilder.tsx` (Line 652) | "Submit (Preview)" button | Hardcoded with `disabled` attribute. | Low (Informational) | Intended as visual preview in builder canvas; needs tooltip clarifying non-functional preview status. |

---

## 4. QR Codes Inventory

| # | Route / Page | Component | QR Value / Payload | Target Purpose | Verification Criteria |
|---|--------------|-----------|--------------------|----------------|-----------------------|
| 1 | `/certificates` & `/verify-certificate/:code` | `CertificateView.tsx` (SVG & Canvas) | `${origin}/verify-certificate/${code}` | Academic credential verification | Decodes to valid verification URL; loads certificate details matching student and issue date. |
| 2 | `/events` | `Events.tsx` (Success Modal) | `REG-${event.id}-${userId}` | Personal event admission pass | Decodes to correct registration ID format; accepted by event scanner. |
| 3 | `/dashboard` | `Dashboard.tsx` (Member ID Card) | `profile.memberId` (e.g. `DC-XXXXX`) | Official student member badge | Decodes to valid member ID string; embedded correctly into downloadable PNG. |
| 4 | `/admin/forms` | `FormShareModal.tsx` | `${origin}/f/${form.slug}` | Public respondent form link | Decodes to active public form URL; downloadable as high-res PNG. |
| 5 | `/admin/events` | `EventManagement.tsx` | Camera scanner (`Html5QrcodeScanner`) | Realtime check-in scanner | Reads attendee QR codes via webcam, validates against database, increments check-in counter. |

---

## 5. Master Inventory of Interactive Elements

### Group A: Global Shell & Layout
*Visible across all pages.*

| ID | Location | Element | Selector / Implementation | Expected Behavior |
|----|----------|---------|---------------------------|-------------------|
| G-01 | Header / Sidebar | Club Brand Logo | `<Link to="/">` | Navigates to `/` (Home Base). |
| G-02 | Mobile Header | Mobile Menu Drawer Trigger | `<button onClick={() => setSidebarOpen(true)}>` | Opens mobile drawer overlay on viewports < 1024px. |
| G-03 | Mobile Drawer | Mobile Menu Close Button | `<button onClick={() => setIsOpen(false)}>` | Closes drawer overlay. |
| G-04 | Header / Sidebar | Language Toggle | `<LanguageSwitcher variant="toggle">` | Switches application language between Arabic (RTL) and English (LTR). |
| G-05 | Desktop Sidebar | Collapse / Expand Toggle | `<button onClick={() => setIsCollapsed(!isCollapsed)}>` | Toggles sidebar width between 80px and 280px. |
| G-06 | Sidebar | Home Nav Link | `<Link to="/">` | Navigates to `/`. |
| G-07 | Sidebar | Courses Nav Link | `<Link to="/courses">` | Navigates to `/courses`. |
| G-08 | Sidebar | My Courses Nav Link | `<Link to="/my-courses">` | Visible only when logged in; navigates to `/my-courses`. |
| G-09 | Sidebar | Compiler Nav Link | `<Link to="/compiler">` | Navigates to `/compiler`. |
| G-10 | Sidebar | Leaderboard Nav Link | `<Link to="/leaderboard">` | Navigates to `/leaderboard`. |
| G-11 | Sidebar | Certificates Nav Link | `<Link to="/certificates">` | Navigates to `/certificates`. |
| G-12 | Sidebar | Notifications Nav Link | `<Link to="/notifications">` | Navigates to `/notifications`. |
| G-13 | Sidebar | Events Nav Link | `<Link to="/events">` | Navigates to `/events`. |
| G-14 | Sidebar | Projects Nav Link | `<Link to="/projects">` | Navigates to `/projects`. |
| G-15 | Sidebar | Blog Nav Link | `<Link to="/blog">` | Navigates to `/blog`. |
| G-16 | Sidebar | Staff Nav Link | `<Link to="/staff">` | Navigates to `/staff`. |
| G-17 | Sidebar | Gallery Nav Link | `<Link to="/gallery">` | Navigates to `/gallery`. |
| G-18 | Sidebar | About Nav Link | `<Link to="/about">` | Navigates to `/about`. |
| G-19 | Sidebar | Contact Nav Link | `<Link to="/contact">` | Navigates to `/contact`. |
| G-20 | Sidebar (Admin) | Admin Portal Links (14) | `<Link to="/admin/...">` | Visible only to managers; navigates to corresponding admin section. |
| G-21 | Sidebar Footer | Member Profile Link | `<Link to="/profile">` | Visible when logged in; displays avatar/initials; opens `/profile`. |
| G-22 | Sidebar Footer | Logout Button | `<button onClick={handleLogout}>` | Clears Supabase session, navigates to `/`, shows success toast. |
| G-23 | Sidebar Footer | Quick Register Button | `<Button onClick={() => navigate('/register')}>` | Visible when logged out; navigates to `/register`. |
| G-24 | Sidebar Footer | Quick Login Button | `<Button onClick={() => navigate('/login')}>` | Visible when logged out; navigates to `/login`. |
| G-25 | Floating Action | NEXUS AI Mentor Floating Trigger | `AIMentorButton.tsx` | Opens NEXUS AI Chat Modal. |
| G-26 | AI Modal | AI Modal Close Button | `button` with `<X>` | Closes AI modal. |
| G-27 | AI Modal | Gemini API Key Setup Trigger | `button` with `<Key>` | Opens API key configuration dialog. |
| G-28 | AI Modal | Prompt Suggestion Chips | Quick action pills | Auto-fills prompt input and sends question. |
| G-29 | AI Modal | Message Input & Send Button | `<Input>` & `<Button>` (`Send`) | Submits user prompt to Gemini; streams response. |
| G-30 | AI Modal | Clear Chat Button | `<button>` with `<RefreshCw>` | Wipes local conversation history. |
| G-31 | AI Modal | Code Block Copy Button | `<button>` inside code blocks | Copies code snippet to clipboard; displays check icon. |
| G-32 | Footer | Quick Links (7 links) | `<Link to="...">` in `Footer.tsx` | Navigates to `/about`, `/courses`, `/events`, `/projects`, `/blog`, `/staff`, `/gallery`. |
| G-33 | Footer | Support Links (4 links) | `<Link to="...">` in `Footer.tsx` | Navigates to `/faq`, `/contact`, `/privacy`, `/terms`. |
| G-34 | Footer | Social Icons (4 links) | `<a>` tags (GitHub, Twitter, LinkedIn, Facebook) | Opens external links in new window. *(Flagged: dead `#` fallback).* |

---

### Group B: Public Pages (Logged-Out Visitors)

#### B.1 Home (`/`)
| ID | Element | Selector / Event | Expected Behavior |
|----|---------|------------------|-------------------|
| P-01 | Hero CTA Primary | `<Link to="/register"><Button variant="cyber">` | Navigates to `/register`. |
| P-02 | Hero CTA Secondary | `<Link to="/courses"><Button variant="outline">` | Navigates to `/courses`. |
| P-03 | Hero CTA Tertiary | `<Link to="/compiler"><Button variant="ghost">` | Navigates to `/compiler`. |
| P-04 | Bottom CTA | `<Link to="/register"><Button variant="cyber">` | Navigates to `/register`. |

#### B.2 Courses Catalog (`/courses`)
| ID | Element | Selector / Event | Expected Behavior |
|----|---------|------------------|-------------------|
| P-05 | Search Input | `<Input value={search}>` | Filters course cards dynamically by keyword. |
| P-06 | Category Filter Tabs | 4 Buttons (All, Data Science, AI/ML, BI) | Filters courses by track. |
| P-07 | Level Filter Tabs | 4 Buttons (Any, Beginner, Intermediate, Advanced) | Filters courses by difficulty level. |
| P-08 | Course Card Link | `<Link to="/courses/:slug">` | Opens course syllabus page. |
| P-09 | Card Direct Enroll Button | `<Button onClick={handleEnrollCourse}>` | Prompts login toast if logged out; enrolls if authenticated. |
| P-10 | Admin Edit Link | `<Link to="/admin/courses">` | Visible to admins only; navigates to course management. |

#### B.3 Course Details (`/courses/:slug`)
| ID | Element | Selector / Event | Expected Behavior |
|----|---------|------------------|-------------------|
| P-11 | Back Link | `<Link to="/courses">` | Navigates back to catalog. |
| P-12 | Enroll / Continue Button | `<Button onClick={handleEnroll}>` | Enrolls user (+50 XP) or redirects to learning view if already enrolled. |
| P-13 | Share Course Button | `<Button onClick={...}>` (`Share2`) | Copies course link to clipboard; triggers toast. |
| P-14 | Module Accordion Toggles | `<button onClick={() => toggleModule(id)}>` | Expands/collapses syllabus modules. |
| P-15 | Syllabus Lesson Items | Lesson rows | Navigates to lesson viewer or shows lock if unenrolled. |

#### B.4 Online Compiler (`/compiler`)
| ID | Element | Selector / Event | Expected Behavior |
|----|---------|------------------|-------------------|
| P-16 | Language Dropdown | `<select>` / custom picker | Changes language (Python, JS, TS, SQL, C++, Java, R, Rust) & loads starter template. |
| P-17 | Run Code Button (`F5`) | `<Button onClick={handleRun}>` | Compiles & runs code; displays stdout/stderr and execution time. |
| P-18 | Ask NEXUS AI Button | `<Button onClick={() => setIsAIModalOpen(true)}>` | Opens AI modal pre-loaded with current editor code. |
| P-19 | Reset Code Button | `<Button onClick={handleReset}>` | Restores original starter code. |
| P-20 | Copy Code Button | `<Button onClick={handleCopy}>` | Copies code to clipboard. |
| P-21 | Stdin Toggle | Stdin expand button | Opens/closes standard input textarea. |
| P-22 | Stdin Textarea | `<textarea>` | Passes user input to runtime stdin. |
| P-23 | Clear Terminal Button | Output panel clear button | Wipes terminal display. |

#### B.5 Leaderboard (`/leaderboard`)
| ID | Element | Selector / Event | Expected Behavior |
|----|---------|------------------|-------------------|
| P-24 | Search Input | `<Input value={search}>` | Searches operatives by name, email, or member ID. |
| P-25 | Faculty Filter Buttons | 6 Category buttons | Filters leaderboard rows by university faculty. |
| P-26 | Top 3 Podium Cards | Interactive podium cards | Displays top rank holders with points & level badges. |

#### B.6 Certificates & Verification (`/certificates`, `/verify-certificate`, `/verify-certificate/:code`)
| ID | Element | Selector / Event | Expected Behavior |
|----|---------|------------------|-------------------|
| P-27 | Tabs Switcher | "My Certificates" / "Verify Certificate" | Switches view modes. |
| P-28 | Verification Code Input | `<Input value={searchCode}>` | Accepts certificate serial code or hash. |
| P-29 | Verify Certificate Button | `<Button onClick={handleVerify}>` | Fetches record from Supabase; displays verified badge & details. |
| P-30 | Copy Verification URL | `<Button onClick={handleCopyLink}>` | Copies verification URL to clipboard. |
| P-31 | Share to LinkedIn | `<Button onClick={handleShareLinkedIn}>` | Opens LinkedIn certificate registration window. |
| P-32 | Download PDF Button | `<Button onClick={handleDownloadPDF}>` | Renders landscape certificate to PDF via `jspdf`. |
| P-33 | Print Certificate Button | `<Button onClick={handlePrint}>` | Triggers browser print stylesheet. |
| P-34 | QR Code Component | `<QRCodeSVG>` & `<QRCodeCanvas>` | Displays dynamic QR linking to verification route. |

#### B.7 Events Showcase (`/events`)
| ID | Element | Selector / Event | Expected Behavior |
|----|---------|------------------|-------------------|
| P-35 | Search Input | Search field | Filters events by title/location. |
| P-36 | Category Filter Tabs | Filter buttons | Filters by All, Workshops, Hackathons, Sessions. |
| P-37 | Event Register Button | `<Button onClick={() => handleRegister(event)}>` | Registers user; opens ticket modal with personalized QR code. |
| P-38 | Success Modal Dismiss | `<Button onClick={() => setShowSuccess(null)}>` | Closes ticket QR modal. |

#### B.8 Projects Showcase (`/projects`)
| ID | Element | Selector / Event | Expected Behavior |
|----|---------|------------------|-------------------|
| P-39 | Search & Filter Tabs | Domain filters | Filters student projects. |
| P-40 | Submit Project Modal Trigger | `<Button onClick={() => setShowSubmitModal(true)}>` | Opens project submission form modal. |
| P-41 | Project Submission Form | Form fields & submit button | Validates & saves project suggestion. |
| P-42 | Project Card Click | Project preview card | Opens modal with description, tech tags, GitHub link, demo link. |
| P-43 | GitHub Link Button | `<a href={project.githubUrl}>` | Opens GitHub repository. |
| P-44 | Live Demo Button | `<a href={project.liveUrl}>` | Opens live demo. *(Flagged: sample `#` fallback).* |

#### B.9 Blog (`/blog`)
| ID | Element | Selector / Event | Expected Behavior |
|----|---------|------------------|-------------------|
| P-45 | Search Input & Filters | Tag filter buttons | Filters articles by topic. |
| P-46 | Article Card Click | Post preview card | Opens full article reader modal. |
| P-47 | Share Article Button | `<button onClick={...}>` (`Share2`) | Copies article link to clipboard. |
| P-48 | Reader Close Button | `<button>` (`X`) | Dismisses article modal. |

#### B.10 Staff & Board (`/staff`)
| ID | Element | Selector / Event | Expected Behavior |
|----|---------|------------------|-------------------|
| P-49 | Search & Committee Filters | Filter buttons | Filters staff members by committee. |
| P-50 | Staff Social Links | Social icon buttons | Opens staff LinkedIn, GitHub, Email, Instagram. |
| P-51 | Recruitment CTA | `<Link to="/contact">` | Navigates to application contact page. |

#### B.11 Gallery (`/gallery`)
| ID | Element | Selector / Event | Expected Behavior |
|----|---------|------------------|-------------------|
| P-52 | Category Filters | Category pills | Filters event photos. |
| P-53 | Photo Card Click | Photo item | Opens full-screen lightbox modal. |
| P-54 | Lightbox Close Button | Close button (`X`) | Closes lightbox. |

#### B.12 Contact Us (`/contact`)
| ID | Element | Selector / Event | Expected Behavior |
|----|---------|------------------|-------------------|
| P-55 | Contact Form Inputs | Name, Email, Subject, Message | Captures input; enforces validation. |
| P-56 | Submit Message Button | `<Button type="submit">` | Sends message to Supabase `contact_messages`; shows toast. |
| P-57 | Join Discord Button | `<Button variant="outline">` | **Dead button.** (Flagged in section 3). |

#### B.13 FAQ (`/faq`)
| ID | Element | Selector / Event | Expected Behavior |
|----|---------|------------------|-------------------|
| P-58 | Category Filter Buttons | 5 Topic buttons | Filters FAQ items. |
| P-59 | FAQ Accordion Items | Question rows | Toggles expand/collapse state. |
| P-60 | Contact Link | `<Link to="/contact">` | Navigates to `/contact`. |

#### B.14 Authentication Suite
| ID | Route | Element | Expected Behavior |
|----|-------|---------|-------------------|
| P-61 | `/login` | Google Sign-In Button | Triggers Supabase OAuth popup/redirect with Google. |
| P-62 | `/login` | Demo Accounts Switcher Trigger | Opens modal to switch to Super Admin or Member instantly. |
| P-63 | `/login` | Email & Password Inputs | Captures login credentials. |
| P-64 | `/login` | Password Visibility Toggle | Toggles password masking (`type="password"` vs `"text"`). |
| P-65 | `/login` | Forgot Password Link | Navigates to `/forgot-password`. |
| P-66 | `/login` | Submit Login Button | Authenticates user via Supabase; redirects to dashboard. |
| P-67 | `/login` | Register Link | Navigates to `/register`. |
| P-68 | `/register` | Google Sign-Up Button | Registers/links account via Google OAuth. |
| P-69 | `/register` | Name, Email, Password, Faculty Inputs | Captures registration fields with domain detection badge. |
| P-70 | `/register` | Submit Registration Button | Creates Supabase auth user and profile record; awards +10 XP. |
| P-71 | `/forgot-password` | Email Input & Reset Submit | Sends recovery email via Supabase. |
| P-72 | `/reset-password` | New Password & Submit | Updates user password hash. |
| P-73 | `/verify-email` | Check Status / Resend / Logout Buttons | Verifies confirmation state or resends confirmation email. |

#### B.15 Public Form Response (`/f/:slug`)
| ID | Element | Selector / Event | Expected Behavior |
|----|---------|------------------|-------------------|
| P-74 | Email Input | Respondent email | Pre-fills if logged in; validates email format. |
| P-75 | Question Inputs | 8 Question types | Captures short text, long text, single choice, multiple choice, rating, date, file upload. |
| P-76 | Section Navigation | Next / Previous buttons | Advances multi-section forms with progress bar. |
| P-77 | Submit Form Button | `<button type="submit">` | Checks honeypot, saves responses to Supabase, syncs to Google Sheets. |
| P-78 | Post-Submit CTA | "Submit another response" | Resets form state for new entry. |

---

### Group C: Authenticated Normal User Pages (`<ProtectedRoute>`)

#### C.1 Dashboard (`/dashboard`)
| ID | Element | Selector / Event | Expected Behavior |
|----|---------|------------------|-------------------|
| U-01 | Admin Fast-Track Button | `<Button>` (Crown) | Visible to admins; links directly to `/admin/users`. |
| U-02 | Download ID Card Button | `<Button onClick={downloadIDCard}>` | Renders ID card with Member QR to canvas, downloads PNG file. |
| U-03 | Enrolled Course Cards | Course item | Displays progress percentage; links to `/courses/:slug/learn`. |
| U-04 | Browse Catalog Link | `<Link to="/courses">` | Navigates to `/courses`. |
| U-05 | View Certificates Link | `<Link to="/certificates">` | Navigates to `/certificates`. |

#### C.2 Profile & Security (`/profile`)
| ID | Element | Selector / Event | Expected Behavior |
|----|---------|------------------|-------------------|
| U-06 | Avatar Upload / URL | Avatar field | Updates profile picture in Supabase. |
| U-07 | Profile Info Form | Name, Phone, Faculty, Academic Year, Bio | Updates profile metadata in database. |
| U-08 | Change Password Button | `<Button onClick={() => startOtpFlow('password')}>` | Triggers 6-digit OTP verification modal. |
| U-09 | Change Email Button | `<Button onClick={() => startOtpFlow('email')}>` | Triggers 6-digit OTP verification modal. |
| U-10 | Send Reset Link Button | `<Button onClick={handleSendResetLink}>` | Sends email reset link. |
| U-11 | OTP Modal Inputs | 6-digit OTP input, Verify button, Resend button | Verifies security challenge and applies credential update. |

#### C.3 My Courses (`/my-courses`)
| ID | Element | Selector / Event | Expected Behavior |
|----|---------|------------------|-------------------|
| U-12 | Filter Tabs | "In Progress" / "Completed" | Filters enrolled courses list. |
| U-13 | Resume Learning Button | `<Button>` | Navigates to active course lesson. |

#### C.4 Course Learning Runner (`/courses/:slug/learn`)
| ID | Element | Selector / Event | Expected Behavior |
|----|---------|------------------|-------------------|
| U-14 | Back to Details Link | `<Link to="...">` | Returns to course overview. |
| U-15 | Syllabus Drawer Toggle | Sidebar toggle button | Hides/shows lesson playlist sidebar. |
| U-16 | Lesson Selectors | Lesson items | Switches active lesson video/text/exercise. |
| U-17 | Video Player Controls | Video element | Play, pause, seek video lecture. |
| U-18 | Exercise Code Runner | In-lesson code runner | Executes exercise code and verifies test assertions. |
| U-19 | In-Lesson Quiz | Quiz choices & submit | Evaluates quiz answers and computes score. |
| U-20 | Ask AI Mentor Button | `<Button>` (NEXUS AI) | Opens AI modal populated with current lesson topic. |
| U-21 | Prev / Next Lesson Buttons | Navigation buttons | Navigates sequentially across syllabus. |
| U-22 | Complete Lesson Button | `<Button onClick={handleCompleteCurrentLesson}>` | Saves lesson progress (+15 XP), updates progress bar. |
| U-23 | Claim Certificate Button | Certificate unlock CTA | Unlocks digital certificate when course progress hits 100%. |

#### C.5 Notifications Center (`/notifications`)
| ID | Element | Selector / Event | Expected Behavior |
|----|---------|------------------|-------------------|
| U-24 | Tabs | "All" / "Unread" | Filters notification feed. |
| U-25 | Mark All Read Button | Action button | Marks all notifications read in Supabase. |
| U-26 | Delete Notification | Item delete button | Dismisses notification. |

---

### Group D: Admin & Manager Portal (`/admin/*`)

#### D.1 System Overview (`/admin`)
| ID | Element | Selector / Event | Expected Behavior |
|----|---------|------------------|-------------------|
| A-01 | Metric Cards | Stat cards | Displays realtime member, event, and registration aggregates. |
| A-02 | Analytics Charts | Recharts graphs | Visualizes monthly user growth and event participation. |
| A-03 | Audit Stream | Recent activity rows | Displays latest administrative and authentication events. |

#### D.2 User Management (`/admin/users`)
| ID | Element | Selector / Event | Expected Behavior |
|----|---------|------------------|-------------------|
| A-04 | Tab Switcher | "Users List" / "Role Permissions Matrix" | Toggles between member directory and permission matrix. |
| A-05 | Search Input | `<Input value={searchTerm}>` | Searches users by name, email, or member ID. |
| A-06 | Role Filter Dropdown | `<select>` (All, Admin, Member) | Filters users by permission tier. |
| A-07 | Provider Filter Dropdown | `<select>` (All, Google, Email) | Filters users by auth provider. |
| A-08 | Status Filter Dropdown | `<select>` (All, Active, Inactive, Online) | Filters by account state. |
| A-09 | Sort Dropdown | `<select>` (Newest, Oldest, Name, Points) | Sorts user list. |
| A-10 | Refresh List Button | `<Button>` (`RefreshCw`) | Re-fetches users from Supabase. |
| A-11 | Export to Excel Button | `<Button>` (`FileSpreadsheet`) | Generates and downloads `.xlsx` spreadsheet. |
| A-12 | Add User Modal Trigger | `<Button>` (`UserPlus`) | Opens manual user registration modal. |
| A-13 | Add User Form | Inputs & submit button | Validates and creates new user in database. |
| A-14 | Role Change Selector | Per-user role dropdown | Triggers role change confirmation modal. |
| A-15 | Role Change Dialog | Confirm / Cancel buttons | Commits role change to Supabase with audit log. |
| A-16 | Edit Permissions Button | Per-user `<Button>` (`Shield`) | Opens `RoleEditorModal` with granular permission checkboxes. |
| A-17 | View Profile Modal | Per-user `<Button>` (`Eye`) | Displays full operative details and course enrollments. |
| A-18 | Delete User Button | Per-user `<Button>` (`Trash2`) | Opens deletion confirmation prompt. |
| A-19 | Pagination Controls | Prev, Next, page buttons | Navigates paginated user list. |

#### D.3 Course Management (`/admin/courses`)
| ID | Element | Selector / Event | Expected Behavior |
|----|---------|------------------|-------------------|
| A-20 | Create Course Button | `<Button>` (`Plus`) | Opens Course Creator modal. |
| A-21 | Search Courses Box | `<Input value={search}>` | Filters course list. |
| A-22 | Manage Lessons Drawer | `<Button>` (`GraduationCap`) | Opens lesson builder (Add, Edit, Reorder, Delete lessons). |
| A-23 | Edit Course Button | `<Button>` (`Edit`) | Opens modal to edit course metadata and thumbnail upload. |
| A-24 | Delete Course Button | `<Button>` (`Trash2`) | Prompts confirmation and deletes course. |
| A-25 | View Course Link | `<Button>` (`Eye`) | Navigates to public course page `/courses/:slug`. |

#### D.4 Event Management (`/admin/events`)
| ID | Element | Selector / Event | Expected Behavior |
|----|---------|------------------|-------------------|
| A-26 | Create Event Button | `<Button>` (`Plus`) | Opens Event Creator modal (Title, Date, Time, Location, Capacity, Image). |
| A-27 | Scan QR Modal Trigger | `<Button>` (`Scan`) | Opens webcam QR scanner via `Html5QrcodeScanner`. |
| A-28 | Live Camera Scanner | Scanner viewport | Reads student QR codes and marks attendance in database. |
| A-29 | Manage Organizers Button | `<Button>` (`UserPlus`) | Opens modal to add/remove event organizers by email or ID. |
| A-30 | Edit Event Button | `<Button>` (`Edit`) | Opens event editor. |
| A-31 | Delete Event Button | `<Button>` (`Trash2`) | Deletes event record. |

#### D.5 Form Builder Suite (`/admin/forms/*`)
| ID | Element | Selector / Event | Expected Behavior |
|----|---------|------------------|-------------------|
| A-32 | Create New Form Button | `<Button>` | Navigates to `/admin/forms/new`. |
| A-33 | Form Status Filters | Tabs (All, Active, Draft, Closed) | Filters forms list. |
| A-34 | Form Share Modal Trigger | Card share button | Opens `FormShareModal` with public link, QR Code SVG, and PNG download. |
| A-35 | Download Form QR Button | `<Button>` inside share modal | Downloads public form QR code as PNG. |
| A-36 | Form Builder Title / Desc | Title & description fields | Updates form headers. |
| A-37 | Add Question Picker | `QuestionTypePicker` | Inserts new question of chosen type (8 types). |
| A-38 | Question Card Controls | Reorder, Duplicate, Delete, Required toggle | Configures question properties and options. |
| A-39 | Form Theme Picker | `FormThemePicker` | Applies color themes to form. |
| A-40 | Form Settings Modal | `FormSettingsModal` | Configures schedule, response limits, single-response lock, Sheets sync. |
| A-41 | Live Preview Drawer | Preview toggle | Toggles Desktop/Mobile preview mockup. *(Flagged: submit button disabled).* |
| A-42 | Save Form Button | `<Button>` (Save) | Persists form and question records to Supabase. |
| A-43 | Responses Summary / Individual | Tabs switcher | Toggles between aggregate charts and individual submissions. |
| A-44 | Export Responses to Excel | `<Button>` (`XLSX`) | Downloads responses as `.xlsx` file. |
| A-45 | Export Responses to CSV | `<Button>` (`CSV`) | Downloads responses as `.csv` file. |
| A-46 | Re-sync to Google Sheets | `<Button>` (`RefreshCw`) | Triggers manual synchronization to connected Google Sheet. |

#### D.6 Points Management (`/admin/points`)
| ID | Element | Selector / Event | Expected Behavior |
|----|---------|------------------|-------------------|
| A-47 | Member Search Input | Search field | Filters members directory. |
| A-48 | Award XP Modal Trigger | `<Button>` (`PlusCircle`) | Opens Bonus XP award modal. |
| A-49 | Award XP Form & Submit | Points input, reason, submit | Adds XP to member profile, writes to `audit_logs`, shows toast. |

#### D.7 Staff Management (`/admin/staff`)
| ID | Element | Selector / Event | Expected Behavior |
|----|---------|------------------|-------------------|
| A-50 | Add Staff Member Button | `<Button>` (`Plus`) | Opens staff creator modal. |
| A-51 | Edit / Delete Staff Buttons | Action buttons | Modifies staff bio, photo, social links, or removes member. |

#### D.8 Gallery Management (`/admin/gallery`)
| ID | Element | Selector / Event | Expected Behavior |
|----|---------|------------------|-------------------|
| A-52 | Add Image Modal Trigger | `<Button>` (`Plus`) | Opens photo upload/URL modal. |
| A-53 | Delete Image Button | Action button | Removes photo from gallery. |

#### D.9 Content Management (`/admin/content`)
| ID | Element | Selector / Event | Expected Behavior |
|----|---------|------------------|-------------------|
| A-54 | Site Title / Subtitle Editors | Text inputs | Updates landing page marketing copy in Supabase settings. |
| A-55 | Social Media Links Manager | URL inputs | Configures official club social media links. |
| A-56 | Save Content Settings | `<Button>` | Persists updates to Supabase `settings` table. |

#### D.10 Project Management (`/admin/projects`)
| ID | Element | Selector / Event | Expected Behavior |
|----|---------|------------------|-------------------|
| A-57 | Add Project Modal Trigger | `<Button>` (`Plus`) | Opens project creator modal. |
| A-58 | Edit / Delete Project | Action buttons | Modifies project details, tech tags, demo links, or deletes entry. |

#### D.11 Blog Management (`/admin/blog`)
| ID | Element | Selector / Event | Expected Behavior |
|----|---------|------------------|-------------------|
| A-59 | Add Article Modal Trigger | `<Button>` (`Plus`) | Opens article creator modal with Markdown editor. |
| A-60 | Edit / Delete Article | Action buttons | Updates article content or removes post. |

#### D.12 Message Management (`/admin/messages`)
| ID | Element | Selector / Event | Expected Behavior |
|----|---------|------------------|-------------------|
| A-61 | Mark as Read / Unread | Status toggle button | Updates message state in Supabase `contact_messages`. |
| A-62 | Delete Message Button | `<Button>` (`Trash2`) | Removes message from inbox. |
| A-63 | Reply via Email Link | `<a href="mailto:...">` | Opens email client pre-addressed to sender. |

#### D.13 Security Center (`/admin/security`) *(Super Admin Only)*
| ID | Element | Selector / Event | Expected Behavior |
|----|---------|------------------|-------------------|
| A-64 | Search Audit Logs | Search input | Filters security logs by keyword or user email. |
| A-65 | Action Filter Dropdown | `<select>` | Filters by action type (LOGIN, ROLE_CHANGE, XP_BONUS, etc.). |
| A-66 | Refresh Logs Button | `<Button>` (`RefreshCw`) | Re-fetches latest audit events from Supabase. |
| A-67 | Export Logs Button | `<Button>` (`Download`) | Exports audit log trail. |
| A-68 | RLS Health Status Display | Status cards | Displays active status of PostgreSQL Row Level Security. |

#### D.14 Platform Settings (`/admin/settings`) *(Super Admin Only)*
| ID | Element | Selector / Event | Expected Behavior |
|----|---------|------------------|-------------------|
| A-69 | Maintenance Mode Toggle | Switch component | Toggles platform maintenance lockdown for non-superadmins. |
| A-70 | Allow Registrations Toggle | Switch component | Enables/disables new user signups. |
| A-71 | Default Starting XP Input | Number input | Configures initial starter XP granted on signup. |
| A-72 | Gemini API Key Input | Password input | Saves platform-wide Google Gemini API key. |
| A-73 | Save Platform Settings Button | `<Button>` | Persists global configuration to Supabase `settings`. |

---

## 6. Phase 2 Automation Strategy & Quality Checks

During Phase 2, a complete Playwright test suite will be installed and run against every element cataloged above:

1. **Role Partitioning:**
   - Suite 1: Logged-out Visitor (`qa-audit/tests/public.spec.ts`)
   - Suite 2: Normal Authenticated User (`qa-audit/tests/user.spec.ts`)
   - Suite 3: Admin & Manager Portal (`qa-audit/tests/admin.spec.ts`)
   - Suite 4: QR Code Verification & Decoding (`qa-audit/tests/qr-decoder.spec.ts`)
2. **Multi-Viewport Testing:**
   - Desktop (1440 × 900)
   - Tablet (768 × 1024)
   - Mobile (375 × 667)
3. **Automated Verification:**
   - Network requests (200 OK responses, no 4xx/5xx).
   - Console inspection (capture unhandled exceptions, runtime errors, missing keys).
   - Database verification (confirm Supabase state changes).
   - Real QR image decoding via `jsQR` / canvas extraction.
   - Screenshot capture for any failing element.

---

## 7. Required Inputs for Phase 2 Approval

Before running any tests, please confirm:
1. **Target URL:** Run against local dev server (`http://localhost:3000`) or staging Vercel deployment (`https://datacamp-student-club.vercel.app`)?
2. **Auth Method:** Use the built-in 1-click Demo Account Switcher (`super_admin` / `member`) or provide specific test user credentials?
3. **Execution Approval:** Confirm approval to start Phase 2 automated test execution.
