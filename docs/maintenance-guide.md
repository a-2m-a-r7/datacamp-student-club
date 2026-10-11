# Platform Maintenance & Operational Runbook

**Platform:** DataCamp Student Club Platform (`datacamp-student-club`)  
**Audience:** Club Technical Officers, Platform Administrators & Faculty Advisors  
**Version:** 1.0.0 Production  

---

## 1. Routine Operational Tasks

### 1.1 Managing Members & Elevating Roles
1. Navigate to `/admin/users`.
2. Use the search bar to locate students by name, email, or student ID.
3. To assign leadership privileges:
   - Select **Edit Role**.
   - Choose `instructor` for course creators, or `club_leader` for event and media coordinators.
   - Click **Save**.
4. To grant full operational access, promote to `admin`. Only current Super Admins can promote to `super_admin`.

### 1.2 Creating and Managing Events
1. Navigate to `/admin/events`.
2. Click **Add Event** (`+`).
3. Fill in the event title, agenda, scheduled date/time, capacity limit, and cover image.
4. Set event status to `upcoming`.
5. Once the event date arrives, staff members at the entrance desk open `/admin/scanner` on a mobile device or laptop camera to scan attendees' ticket QR codes.
6. To export the attendance roster, click **Export Attendance (CSV / Excel)**.

### 1.3 Issuing Certificates
1. Navigate to `/admin/certificates`.
2. Click **Issue Certificate**.
3. Select the recipient student and the corresponding event or track.
4. Enter certificate details and issue date.
5. A cryptographically unique serial number is generated automatically.
6. The certificate is immediately verifiable publicly at `/verify/:serial` and visible in the student's personal profile.

---

## 2. Database Maintenance & Backups

### 2.1 Automated Supabase Backups
* Supabase projects automatically take daily physical snapshots.
* Point-in-time recovery (PITR) is available on Pro tiers.

### 2.2 Manual Schema & Data Export
Before making any large data migrations or restructuring:
1. Open **Supabase Dashboard** -> **Database** -> **Backups**.
2. Click **Download Backup** for a full PostgreSQL dump.
3. Alternatively, run via PostgreSQL CLI:
   ```bash
   pg_dump "postgres://postgres:[PASSWORD]@[HOST]:5432/postgres" > backup_$(date +%F).sql
   ```

### 2.3 Storage Bucket Housekeeping
* Regularly inspect Supabase Storage usage under **Storage** -> **Usage**.
* If storage exceeds quotas, clean old temporary event images in the `gallery` bucket.
* Verify public bucket download limits and ensure uploaded photos are optimized JPEG/WebP.

---

## 3. Secret & Credential Rotation Protocol

It is recommended to rotate sensitive keys every 6 to 12 months, or immediately if an administrator leaves the organization.

### 3.1 Rotating Google Gemini AI Key
1. Go to [Google AI Studio](https://aistudio.google.com).
2. Generate a new API key.
3. Go to **Vercel Dashboard** -> **Project Settings** -> **Environment Variables**.
4. Update `GEMINI_API_KEY` with the new key value.
5. Trigger a **Redeploy** on Vercel.
6. Verify the AI chat bubble functions properly.
7. Delete the old key from Google AI Studio.

### 3.2 Rotating Supabase Keys
1. Go to **Supabase Dashboard** -> **Project Settings** -> **API**.
2. Click **Generate new secret key**.
3. Update `VITE_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` in Vercel.
4. Redeploy Vercel.

---

## 4. Troubleshooting Common Issues

### 4.1 QR Attendance Scanner Fails to Open Camera
* **Symptom:** Camera feed is blank or shows permission error.
* **Cause 1:** The site is accessed via insecure HTTP. Browser camera APIs strictly require `HTTPS`.
  - **Resolution:** Ensure the domain is loaded with `https://`.
* **Cause 2:** The user denied camera permission in their browser settings.
  - **Resolution:** Click the padlock icon in the browser address bar -> Permissions -> Camera -> Allow, then reload the page.
* **Cause 3:** Permissions-Policy header blocking.
  - **Resolution:** Verify `vercel.json` contains `"camera=(self)"` in `Permissions-Policy`.

### 4.2 In-Browser Python Code Sandbox Timeout
* **Symptom:** Student clicks "Run Code" and the playground hangs or crashes.
* **Cause:** Infinite loop in student code or excessive memory usage inside the Pyodide WebAssembly sandbox.
  - **Resolution:** The code execution engine includes a 10-second timeout handler. Instruct the student to reload the lesson page to reset the WebAssembly virtual machine memory.

### 4.3 AI Mentor Returns "Rate Limit Exceeded"
* **Symptom:** AI chat responds with error code 429.
* **Cause:** Free tier Gemini API requests per minute (RPM) exhausted by concurrent students.
  - **Resolution:** Upgrade Google AI Studio project to Pay-As-You-Go, or adjust request throttling in `api/chat.ts`.

### 4.4 User Reports "Permission Denied" on Dashboard
* **Symptom:** Admin navigates to `/admin` and sees access restricted message.
* **Cause:** Database `profiles.role` does not match session or was modified recently without session refresh.
  - **Resolution:** Have the user log out and log back in to refresh their Supabase JWT session claims.
