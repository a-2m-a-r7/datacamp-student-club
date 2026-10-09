import { UserRole } from '../types';

export interface RolePermission {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  category: 'system' | 'users' | 'content' | 'events' | 'finance';
}

export const ALL_PERMISSIONS: RolePermission[] = [
  { id: 'settings:write', nameEn: 'Manage System Settings', nameAr: 'إدارة إعدادات النظام', descriptionEn: 'Configure site-wide toggles, branding, and maintenance mode.', descriptionAr: 'التحكم في إعدادات المنصة ووضع الصيانة.', category: 'system' },
  { id: 'security:manage', nameEn: 'Security & Audit Logs', nameAr: 'الأمان وسجلات التدقيق', descriptionEn: 'Access firewall, blocked IPs, and audit trails.', descriptionAr: 'الوصول لإعدادات الأمان وسجلات النشاط.', category: 'system' },
  { id: 'users:manage', nameEn: 'Manage Users & Members', nameAr: 'إدارة الأعضاء والبيانات', descriptionEn: 'Create, update, activate, and delete user accounts.', descriptionAr: 'إضافة وتعديل وحذف حسابات الأعضاء.', category: 'users' },
  { id: 'roles:assign', nameEn: 'Assign & Edit Roles', nameAr: 'تعديل وتعيين الرولات', descriptionEn: 'Grant or revoke roles and access levels to operatives.', descriptionAr: 'منح وسحب الرولات والصلاحيات من المستخدمين.', category: 'users' },
  { id: 'staff:manage', nameEn: 'Manage Staff Roster', nameAr: 'إدارة فريق العمل والقيادة', descriptionEn: 'Edit club leadership, directors, and core committee roster.', descriptionAr: 'تعديل أعضاء الكادر واللجان الإشرافية.', category: 'users' },
  { id: 'courses:manage', nameEn: 'Manage Courses & Quizzes', nameAr: 'إدارة الدورات والاختبارات', descriptionEn: 'Create curriculum, modules, lessons, and coding quizzes.', descriptionAr: 'نشر وتعديل الدورات والمحتوى التعليمي.', category: 'content' },
  { id: 'content:publish', nameEn: 'Publish Blog & Projects', nameAr: 'نشر المقالات والمشاريع', descriptionEn: 'Author articles, publish student projects, and upload gallery.', descriptionAr: 'نشر المقالات والمشاريع ومعرض الصور.', category: 'content' },
  { id: 'events:manage', nameEn: 'Manage Events & Workshops', nameAr: 'إدارة الفعاليات والورش', descriptionEn: 'Create hackathons, schedule workshops, and manage capacity.', descriptionAr: 'إنشاء الفعاليات والهاكاثونات وتحديد الطاقة الاستيعابية.', category: 'events' },
  { id: 'attendance:scan', nameEn: 'Scan Event Attendance', nameAr: 'مسح تذاكر الحضور (QR)', descriptionEn: 'Check in participants on-site using the QR ticket scanner.', descriptionAr: 'تسجيل حضور المشاركين بمسح كود الـ QR.', category: 'events' },
  { id: 'points:manage', nameEn: 'Manage Points & Leaderboard', nameAr: 'إدارة النقاط والترتيب', descriptionEn: 'Award XP points, grant badges, and reset leaderboard seasons.', descriptionAr: 'منح وتعديل نقاط الـ XP وأوسمة الإنجاز.', category: 'finance' },
  { id: 'certificates:issue', nameEn: 'Issue & Verify Certificates', nameAr: 'إصدار واعتماد الشهادات', descriptionEn: 'Generate cryptographically verified completion certificates.', descriptionAr: 'إصدار واعتماد الشهادات الأكاديمية الرسمية.', category: 'finance' },
];

export interface RoleDetail {
  id: UserRole;
  titleEn: string;
  titleAr: string;
  badgeColor: string;
  badgeBorder: string;
  badgeBg: string;
  tag: string;
  descriptionEn: string;
  descriptionAr: string;
  level: number;
  permissions: string[];
}

export const ROLE_DEFINITIONS: Record<UserRole, RoleDetail> = {
  super_admin: {
    id: 'super_admin',
    titleEn: 'Super Administrator',
    titleAr: 'سوبر أدمن (Super Admin)',
    badgeColor: 'text-rose-400',
    badgeBorder: 'border-rose-500/40',
    badgeBg: 'bg-rose-500/10',
    tag: 'SUPER_ADMIN',
    descriptionEn: 'Full master authority over all platform sub-systems, course management, events, security, settings, and user accounts.',
    descriptionAr: 'صلاحيات كاملة ومطلقة على كافة أنظمة المنصة: إدارة الأعضاء، الدورات، الفعاليات، المقالات، والأمان والإعدادات.',
    level: 10,
    permissions: [
      'settings:write',
      'security:manage',
      'users:manage',
      'roles:assign',
      'staff:manage',
      'courses:manage',
      'content:publish',
      'events:manage',
      'attendance:scan',
      'points:manage',
      'certificates:issue',
    ],
  },
  member: {
    id: 'member',
    titleEn: 'Club Member',
    titleAr: 'عضو بالنادي (Member)',
    badgeColor: 'text-primary',
    badgeBorder: 'border-primary/30',
    badgeBg: 'bg-primary/10',
    tag: 'MEMBER',
    descriptionEn: 'Standard student operative: enroll in courses, run code in playground, compete on leaderboard, and earn verified certificates.',
    descriptionAr: 'عضو مسجل بالنادي: حضور المسارات والدورات، تشغيل الأكواد، التنافس في لوحة المتصدرين ونيل الشهادات المعتمدة.',
    level: 1,
    permissions: [],
  },
};

export const ROLE_LIST: RoleDetail[] = Object.values(ROLE_DEFINITIONS).sort((a, b) => b.level - a.level);
