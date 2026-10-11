# Production Deployment Guide

**Platform:** DataCamp Student Club Platform (`datacamp-student-club`)  
**Target Environments:** Vercel (Frontend & Serverless) + Supabase Cloud (Backend & DB)  
**Version:** 1.0.0 Production  

---

## 1. Prerequisites

Before starting deployment, ensure you have:
1. A [GitHub](https://github.com) account hosting your repository.
2. A free or pro [Vercel](https://vercel.com) account.
3. A free or pro [Supabase](https://supabase.com) account.
4. A [Google AI Studio](https://aistudio.google.com) account for Gemini API access.
5. Node.js `20.x` or higher installed locally for verification.

---

## 2. Step 1: Supabase Database Provisioning

1. **Create a New Supabase Project:**
   - Log in to [Supabase Dashboard](https://supabase.com/dashboard).
   - Click **New Project**.
   - Set the project name (e.g. `datacamp-student-club-prod`).
   - Choose a strong database password and select the region closest to your users.

2. **Execute Full Database Schema:**
   - Go to **SQL Editor** from the left navigation menu.
   - Click **New Query**.
   - Copy the entire contents of [`supabase/full_schema.sql`](../supabase/full_schema.sql) (77.5 KB unified schema).
   - Paste into the query editor and click **Run**.
   - Verify that all 13 tables, RLS policies, triggers, and RPC functions created successfully.

3. **(Optional) Load Initial Seed Data:**
   - In SQL Editor, open a new query tab.
   - Copy and execute [`supabase/seed.sql`](../supabase/seed.sql) to populate initial sample tracks, courses, events, and settings.

4. **Retrieve API Credentials:**
   - Go to **Project Settings** -> **API**.
   - Copy:
     - **Project URL** (`https://xxxxxxxxxxxx.supabase.co`)
     - **`anon` `public` Key**
     - **`service_role` `secret` Key** (keep this confidential!)

---

## 3. Step 2: Vercel Project Setup

1. **Import Git Repository:**
   - Log in to [Vercel Dashboard](https://vercel.com).
   - Click **Add New...** -> **Project**.
   - Select your GitHub repository (`datacamp-student-club`).

2. **Configure Build & Output Settings:**
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

3. **Configure Environment Variables:**
   Under **Environment Variables**, add the following keys for **Production**, **Preview**, and **Development**:

   | Name | Value Source | Target |
   |---|---|---|
   | `VITE_SUPABASE_URL` | Supabase Project URL | Production, Preview |
   | `VITE_SUPABASE_ANON_KEY` | Supabase Anon Key | Production, Preview |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key | Production, Preview |
   | `GEMINI_API_KEY` | Google AI Studio Gemini API Key | Production, Preview |
   | `VITE_SITE_URL` | `https://datacamp-student-club.vercel.app` (or custom domain) | Production, Preview |
   | `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Google Cloud Console (Optional for Sheets) | Production, Preview |
   | `GOOGLE_PRIVATE_KEY` | Google Cloud Console (Optional for Sheets) | Production, Preview |
   | `GOOGLE_SPREADSHEET_OWNER_EMAIL`| Club Admin Email | Production, Preview |

4. **Deploy:**
   - Click **Deploy**.
   - Vercel will build the frontend bundle, package serverless functions from `api/`, and distribute across global edge points.

---

## 4. Step 3: Initial Super Admin Setup

Once the deployment completes and the site is live:
1. Open the live site in your browser.
2. Click **انضم إلينا / Register** and create an account with your official club administrator email.
3. Open your **Supabase Dashboard** -> **SQL Editor**.
4. Run the promotion RPC command:
   ```sql
   SELECT public.promote_admin_by_email('your-admin-email@university.edu');
   ```
5. Log out and log back in on the platform. The administrative portal (`/admin`) will now be accessible.

---

## 5. Step 4: Custom Domain Configuration (Optional)

To connect a custom university domain (e.g. `datacamp.innovation.edu`):
1. In Vercel, go to **Project Settings** -> **Domains**.
2. Enter your custom domain name and click **Add**.
3. In your university DNS management console, create the recommended DNS records:
   - For Apex domain (`example.edu`): A Record pointing to `76.76.21.21`
   - For Subdomain (`datacamp.example.edu`): CNAME Record pointing to `cname.vercel-dns.com`
4. Once verified, update `VITE_SITE_URL` in Vercel environment variables to match the new custom domain.

---

## 6. Step 5: Post-Deployment Smoke Test Checklist

- [ ] Visit home page (`/`) — verify loads under 1 second without errors.
- [ ] Test language toggle between Arabic (RTL) and English (LTR).
- [ ] Test student registration and login flow.
- [ ] Navigate to `/tracks` and open a lesson — verify in-browser code editor runs sample Python code.
- [ ] Navigate to `/admin` using the super admin account — verify all dashboards load.
- [ ] Test the QR attendance camera scanner at `/admin/scanner` (accept browser camera permission).
- [ ] Verify AI mentor chat bubble triggers response without revealing API keys in network tab.
