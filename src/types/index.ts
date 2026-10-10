import { Timestamp } from 'firebase/firestore';

// ─── USER ROLES & STATUS ────────────────────────────────────────────────────

export type UserRole = 'super_admin' | 'member';

export type UserStatus = 'active' | 'inactive' | 'pending';

export interface UserProfile {
  uid: string;
  id?: string;
  email: string;
  fullName: string;
  role: UserRole;
  memberId: string;
  status: UserStatus;
  isVerified: boolean;
  emailType?: 'university' | 'personal';
  universityName?: string;
  university?: string;
  phoneNumber?: string;
  faculty?: string;
  academicYear?: string;
  photoURL?: string;
  totalPoints?: number;
  level?: UserMemberLevel;
  bio?: string;
  interests?: string[];
  linkedinUrl?: string;
  githubUrl?: string;
  createdAt: string | Timestamp;
  updatedAt: string | Timestamp;
}

// ─── MEMBER LEVELS ──────────────────────────────────────────────────────────

export type UserMemberLevel =
  | 'RECRUIT'
  | 'OPERATIVE'
  | 'SPECIALIST'
  | 'ANALYST'
  | 'ENGINEER'
  | 'ARCHITECT'
  | 'ELITE';

export const LEVEL_THRESHOLDS: Record<UserMemberLevel, { min: number; max: number; color: string; icon: string }> = {
  RECRUIT:    { min: 0,     max: 99,         color: '#6B7280', icon: '🔵' },
  OPERATIVE:  { min: 100,  max: 499,         color: '#10B981', icon: '🟢' },
  SPECIALIST: { min: 500,  max: 999,         color: '#F59E0B', icon: '🟡' },
  ANALYST:    { min: 1000, max: 2499,        color: '#F97316', icon: '🟠' },
  ENGINEER:   { min: 2500, max: 4999,        color: '#EF4444', icon: '🔴' },
  ARCHITECT:  { min: 5000, max: 9999,        color: '#8B5CF6', icon: '🟣' },
  ELITE:      { min: 10000, max: 999999999,  color: '#06B6D4', icon: '💎' },
};

export function getLevelFromPoints(points: number): UserMemberLevel {
  const levels = Object.entries(LEVEL_THRESHOLDS) as [UserMemberLevel, { min: number; max: number }][];
  for (const [level, { min, max }] of levels) {
    if (points >= min && points <= max) return level;
  }
  return 'ELITE';
}

export function getNextLevel(level: UserMemberLevel): UserMemberLevel | null {
  const order: UserMemberLevel[] = ['RECRUIT','OPERATIVE','SPECIALIST','ANALYST','ENGINEER','ARCHITECT','ELITE'];
  const idx = order.indexOf(level);
  return idx < order.length - 1 ? order[idx + 1] : null;
}

// ─── EVENTS ─────────────────────────────────────────────────────────────────

export interface ClubEvent {
  id?: string;
  title: string;
  description: string;
  date: string | Timestamp;
  location: string;
  category: string;
  capacity: number;
  attendees: string[];
  imageURL?: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  organizerId: string;
  createdAt: string | Timestamp;
}

// ─── COURSES ────────────────────────────────────────────────────────────────

export type CourseCategory = 'data_science' | 'ai_ml' | 'software_eng' | 'business_intelligence' | 'cybersecurity' | 'other';
export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';
export type CourseLanguage = 'ar' | 'en' | 'both';
export type CourseStatus = 'draft' | 'published' | 'archived';
export type LessonType = 'video' | 'article' | 'quiz' | 'exercise' | 'project';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex?: number;
  correctAnswer?: number;
  explanation?: string;
}

export interface Course {
  id?: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  instructorId: string;
  instructorName: string;
  instructorTitle?: string;
  coverImage?: string;
  category: CourseCategory;
  level: CourseLevel;
  language?: CourseLanguage;
  durationHours: number;
  totalLessons: number;
  totalModules?: number;
  enrolledCount: number;
  rating: number;
  ratingCount: number;
  tags: string[];
  prerequisites: string[];
  skills: string[];
  pointsReward: number;
  status: CourseStatus;
  isFeatured?: boolean;
  isLocked?: boolean;
  createdAt: string | Timestamp;
  updatedAt: string | Timestamp;
}

export interface CourseModule {
  id?: string;
  courseId: string;
  title: string;
  description?: string;
  order: number;
  totalLessons: number;
  durationMinutes: number;
}

export interface CourseLesson {
  id?: string;
  courseId: string;
  moduleId: string;
  title: string;
  type: LessonType;
  content: string;
  videoUrl?: string;
  duration: number;
  order: number;
  isPreview?: boolean;
  attachments?: string[];
  quizQuestions?: QuizQuestion[];
  exercisePrompt?: string;
  exerciseStarterCode?: string;
  exerciseSolution?: string;
  exerciseTestCases?: { input?: any; expectedOutput: string; description: string }[];
  pointsReward: number;
}

export interface Enrollment {
  id?: string;
  userId: string;
  courseId: string;
  enrolledAt: string | Timestamp;
  completedAt?: string | Timestamp;
  progress: number;
  completedLessons: string[];
  completedModules: string[];
  lastAccessedAt: string | Timestamp;
  lastLessonId?: string;
  status: 'active' | 'completed' | 'dropped';
  quizScores: Record<string, number>;
  certificateId?: string;
}

// ─── POINTS & GAMIFICATION ──────────────────────────────────────────────────

export type PointAction =
  | 'SIGNUP'
  | 'PROFILE_COMPLETE'
  | 'EVENT_REGISTER'
  | 'EVENT_ATTEND'
  | 'EVENT_PRESENT'
  | 'COURSE_ENROLL'
  | 'LESSON_COMPLETE'
  | 'QUIZ_PASS'
  | 'QUIZ_PERFECT'
  | 'COURSE_COMPLETE'
  | 'PROJECT_SUBMIT'
  | 'PROJECT_FEATURED'
  | 'BLOG_PUBLISH'
  | 'REFERRAL'
  | 'STREAK_7DAYS'
  | 'STREAK_30DAYS'
  | 'ADMIN_BONUS'
  | 'ADMIN_DEDUCT';

export const POINT_VALUES: Record<PointAction, number> = {
  SIGNUP:           10,
  PROFILE_COMPLETE: 20,
  EVENT_REGISTER:   5,
  EVENT_ATTEND:     50,
  EVENT_PRESENT:    200,
  COURSE_ENROLL:    5,
  LESSON_COMPLETE:  10,
  QUIZ_PASS:        30,
  QUIZ_PERFECT:     50,
  COURSE_COMPLETE:  500,
  PROJECT_SUBMIT:   100,
  PROJECT_FEATURED: 200,
  BLOG_PUBLISH:     50,
  REFERRAL:         100,
  STREAK_7DAYS:     30,
  STREAK_30DAYS:    100,
  ADMIN_BONUS:      0,
  ADMIN_DEDUCT:     0,
};

export interface PointsLog {
  id?: string;
  userId: string;
  points: number;
  action: PointAction;
  description: string;
  referenceId?: string;
  referenceType?: 'event' | 'course' | 'lesson' | 'quiz' | 'project' | 'referral' | 'bonus';
  createdAt: string | Timestamp;
}

export interface UserStats {
  totalPoints: number;
  eventsAttended: number;
  eventsPresented: number;
  coursesCompleted: number;
  coursesEnrolled: number;
  lessonsCompleted: number;
  projectsSubmitted: number;
  blogPostsPublished: number;
  referrals: number;
  streakDays: number;
  quizPerfectScores: number;
}

export interface BadgeDef {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  condition: (stats: UserStats) => boolean;
}

export interface Achievement {
  id?: string;
  userId: string;
  badgeId: string;
  badgeName: string;
  badgeIcon: string;
  badgeColor: string;
  description: string;
  unlockedAt: string | Timestamp;
  isNew: boolean;
}

export interface LeaderboardEntry {
  userId: string;
  fullName: string;
  photoURL?: string;
  faculty?: string;
  totalPoints: number;
  level: UserMemberLevel;
  rank: number;
}

export const BADGES_CATALOG: BadgeDef[] = [
  { id: 'first_steps',   name: 'First Steps',      icon: '🥇', color: '#F59E0B', description: 'Completed your first lesson',   condition: s => s.lessonsCompleted >= 1 },
  { id: 'bookworm',      name: 'Bookworm',         icon: '📚', color: '#3B82F6', description: 'Completed 5 courses',           condition: s => s.coursesCompleted >= 5 },
  { id: 'event_star',    name: 'Event Star',       icon: '🎯', color: '#10B981', description: 'Attended 10 events',            condition: s => s.eventsAttended >= 10 },
  { id: 'on_fire',       name: 'On Fire',          icon: '🔥', color: '#EF4444', description: '30-day learning streak',        condition: s => s.streakDays >= 30 },
  { id: 'knowledge',     name: 'Knowledge Seeker', icon: '💡', color: '#8B5CF6', description: 'Enrolled in 3+ courses',        condition: s => s.coursesEnrolled >= 3 },
  { id: 'speaker',       name: 'Speaker',          icon: '🎤', color: '#F97316', description: 'Presented at an event',         condition: s => s.eventsPresented >= 1 },
  { id: 'writer',        name: 'Writer',           icon: '📝', color: '#06B6D4', description: 'Published 3 blog posts',        condition: s => s.blogPostsPublished >= 3 },
  { id: 'connector',     name: 'Connector',        icon: '🤝', color: '#10B981', description: 'Referred 5 members',           condition: s => s.referrals >= 5 },
  { id: 'perfectionist', name: 'Perfectionist',    icon: '⭐', color: '#F59E0B', description: '5 perfect quiz scores',         condition: s => s.quizPerfectScores >= 5 },
  { id: 'speed_learner', name: 'Speed Learner',    icon: '⚡', color: '#EF4444', description: 'Completed a course in 7 days', condition: _s => false },
];

// ─── CERTIFICATES ────────────────────────────────────────────────────────────

export interface Certificate {
  id?: string;
  userId: string;
  userFullName: string;
  courseId?: string;
  courseTitle?: string;
  eventId?: string;
  eventTitle?: string;
  type: 'course' | 'event' | 'achievement';
  issuedAt: string | Timestamp;
  pdfUrl?: string;
  shareUrl?: string;
  verificationCode: string;
}

// ─── NOTIFICATIONS ──────────────────────────────────────────────────────────

export type NotificationType =
  | 'event_reminder'
  | 'event_approved'
  | 'certificate_ready'
  | 'role_changed'
  | 'points_earned'
  | 'badge_unlocked'
  | 'admin_message'
  | 'course_update';

export interface Notification {
  id?: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  referenceId?: string;
  referenceType?: string;
  createdAt: string | Timestamp;
}

// ─── AI MENTOR ──────────────────────────────────────────────────────────────

export interface AIMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

export interface AISession {
  id?: string;
  userId: string;
  messages: AIMessage[];
  createdAt: string | Timestamp;
  updatedAt: string | Timestamp;
}

export interface LearningPathStep {
  week: string;
  courseTitle: string;
  courseSlug?: string;
  goal: string;
  estimatedHours: number;
}

export interface AIRecommendation {
  userId: string;
  suggestedCourses: string[];
  suggestedEvents: string[];
  learningPath: LearningPathStep[];
  weeklyGoal: string;
  strengthAreas: string[];
  improvementAreas: string[];
  motivationalMessage: string;
  generatedAt: string | Timestamp;
}

// ─── REGISTRATIONS ───────────────────────────────────────────────────────────

export type RegistrationStatus = 'pending' | 'approved' | 'rejected' | 'checked_in' | 'no_show';

export interface Registration {
  id?: string;
  userId: string;
  userFullName: string;
  userEmail: string;
  eventId: string;
  eventTitle: string;
  status: RegistrationStatus;
  qrCode: string;
  registeredAt: string | Timestamp;
  checkedInAt?: string | Timestamp;
  certificateIssued: boolean;
  certificateId?: string;
}

// ─── BLOG & CONTENT ──────────────────────────────────────────────────────────

export interface BlogPost {
  id?: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  imageURL?: string;
  category: string;
  status: 'draft' | 'published';
  tags: string[];
  likes: number;
  likedBy: string[];
  createdAt: string | Timestamp;
  updatedAt: string | Timestamp;
}

export interface GalleryImage {
  id?: string;
  url: string;
  thumbnailUrl?: string;
  title: string;
  category: string;
  uploadedBy: string;
  createdAt: string | Timestamp;
}

// ─── SETTINGS ────────────────────────────────────────────────────────────────

export interface Settings {
  clubName: string;
  registrationEnabled: boolean;
  maintenanceMode: boolean;
  theme: 'dark' | 'light' | 'system';
  contactEmail: string;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    github?: string;
  };
}

// ─── AUDIT & SECURITY ────────────────────────────────────────────────────────

export interface AuditLog {
  id?: string;
  action: string;
  userId: string;
  userName: string;
  details: string;
  status: 'success' | 'failure';
  ip?: string;
  createdAt: string | Timestamp;
}

export interface OTPRecord {
  id?: string;
  target: string;
  otp: string;
  type: 'email' | 'phone';
  attempts: number;
  expiresAt: Timestamp;
  createdAt: Timestamp;
}

