# Roles & Permissions Specification

**Platform:** DataCamp Student Club Platform (`datacamp-student-club`)  
**Version:** 1.0.0 Production  

---

## 1. Role Hierarchy

The platform defines five distinct user roles with hierarchical privilege boundaries:

```
[ super_admin ]
      └── [ admin ]
             ├── [ club_leader ]
             └── [ instructor ]
                    └── [ student ]
                           └── ( public / guest )
```

1. **`guest` (Unauthenticated Visitor):**
   - Can browse public marketing pages, track overviews, upcoming event lists, published blog articles, public gallery photos, and verify certificates via QR code.
2. **`student` (Default Registered Member):**
   - Can enroll in courses, execute code in the interactive playground, submit lesson tasks, earn points and badges, RSVP for club events, download digital tickets, view personal profile, and claim verified certificates.
3. **`instructor` (Academic Facilitator):**
   - All `student` privileges.
   - Can create, edit, reorder, and publish learning tracks, courses, lessons, starter code templates, and automated tests.
4. **`club_leader` (Executive Committee Member):**
   - All `student` privileges.
   - Can create and manage club events, monitor registrations, export attendee rosters, scan event QR tickets via `/admin/scanner`, curate gallery albums, and author blog posts.
5. **`admin` (System Administrator):**
   - Full operational access to dashboard metrics, event management, course management, content curation, and member management.
6. **`super_admin` (Platform Owner / Club President):**
   - Complete unconstrained authority across the entire platform.
   - Can elevate/demote user roles, configure system settings, view security audit logs, and execute administrative SQL RPC functions.

---

## 2. Route Access Matrix

| Route | Minimum Required Role | Description |
|---|---|---|
| `/` | `guest` | Public Landing Page & Club Overview |
| `/tracks` | `guest` | Learning Pathways Listing |
| `/tracks/:id` | `guest` | Track Overview & Course List |
| `/courses/:id/learn/:lessonId` | `student` | Interactive Learning Environment & Code Sandbox |
| `/events` | `guest` | Upcoming & Past Events Calendar |
| `/events/:id` | `guest` | Event Details & Agenda |
| `/events/register/:id` | `student` | Event Registration & RSVP |
| `/blog` | `guest` | Club Technical Articles & Tutorials |
| `/blog/:slug` | `guest` | Article Reader |
| `/gallery` | `guest` | Activity Photos & Event Moments |
| `/verify` | `guest` | Certificate Verification Search |
| `/verify/:serial` | `guest` | Live Certificate Verification & QR Check |
| `/profile` | `student` | Student Profile, Points, Badges, Enrolled Courses |
| `/login`, `/register` | `guest` | Authentication Portals |
| `/admin` | `instructor` / `club_leader` | Admin Management Dashboard Hub |
| `/admin/users` | `admin` | Member Management, Role Promotion, Points Adjustment |
| `/admin/courses` | `instructor` | Course & Curriculum Editor |
| `/admin/events` | `club_leader` | Event Planning & Ticket Management |
| `/admin/scanner` | `club_leader` | In-Browser Camera QR Attendance Scanner |
| `/admin/blog` | `club_leader` | Article & Blog Content Management |
| `/admin/gallery` | `club_leader` | Gallery Media Uploads & Curation |
| `/admin/certificates`| `admin` | Certificate Issuance & Batch Generation |
| `/admin/settings` | `super_admin` | Platform Global Configuration & Social Links |

---

## 3. Data Operation Permissions (CRUD Matrix)

| Entity / Resource | Student | Instructor | Club Leader | Admin | Super Admin |
|---|---|---|---|---|---|
| **Own Profile** | Read / Update | Read / Update | Read / Update | Read / Update | Read / Update |
| **Other Profiles** | Read Basic | Read Basic | Read Basic | Read / Update | Read / Full CRUD |
| **User Roles** | None | None | None | Promote up to Admin | Promote any role |
| **Courses & Lessons** | Read / Submit | Full CRUD | Read | Full CRUD | Full CRUD |
| **Events** | Read / RSVP | Read | Full CRUD | Full CRUD | Full CRUD |
| **QR Attendance** | View own ticket | None | Scan & Verify | Scan & Verify | Scan & Verify |
| **Blog Posts** | Read | Read / Create | Full CRUD | Full CRUD | Full CRUD |
| **Gallery Media** | Read | Read | Upload / Manage | Full CRUD | Full CRUD |
| **Certificates** | Read own | Read own | Read own | Issue & Revoke | Full CRUD |
| **Audit Logs** | None | None | None | Read | Read / Export |
| **System Settings** | Read Public | Read Public | Read Public | Read Public | Read / Update |

---

## 4. Role Promotion Workflows

### 4.1 Via the Administrative Dashboard (UI)
1. Super Admins or Admins navigate to `/admin/users`.
2. Locate the student via search or filter.
3. Click the **Edit Role** action button.
4. Select the target role (`instructor`, `club_leader`, or `admin`) and confirm.
5. The change takes effect immediately on the user's next session token refresh.

### 4.2 Initial Setup via Database SQL (Bootstrap)
For bootstrap situations where no admin exists yet:
```sql
SELECT public.promote_admin_by_email('target-user@university.edu');
```
This PostgreSQL RPC function securely updates the user's role to `super_admin` with database-level security definer privileges.
