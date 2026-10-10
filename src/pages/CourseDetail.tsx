import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { courseService } from '../services/courseService';
import { Course, CourseModule, CourseLesson, Enrollment } from '../types';
import { Button } from '../components/ui/Button';
import {
  BookOpen,
  Clock,
  Award,
  Star,
  Users,
  CheckCircle2,
  PlayCircle,
  FileText,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Sparkles,
  Share2,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';

const CourseDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, isAdmin, isEditor } = useAuth();
  const { isArabic } = useLanguage();

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [lessons, setLessons] = useState<CourseLesson[]>([]);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!slug) return;
    const load = async () => {
      setLoading(true);
      try {
        const c = await courseService.getCourseBySlug(slug);
        if (!c) {
          toast.error(isArabic ? 'الدورة غير موجودة' : 'Course not found');
          navigate('/courses');
          return;
        }
        setCourse(c);

        const [mods, less] = await Promise.all([
          courseService.getCourseModules(c.id),
          courseService.getCourseLessons(c.id),
        ]);
        setModules(mods);
        setLessons(less);

        const exp: Record<string, boolean> = {};
        mods.forEach(m => { exp[m.id] = true; });
        setExpandedModules(exp);

        if (user) {
          const currentUserId = user.id || (user as any).uid;
          const enr = await courseService.getUserEnrollment(currentUserId, c.id);
          setEnrollment(enr);
        }
      } catch (err) {
        console.error('Error fetching course detail:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug, user, navigate, isArabic]);

  const handleEnroll = async () => {
    if (!user) {
      toast.info(isArabic ? 'يرجى تسجيل الدخول للالتحاق بالدورة واكتساب نقاط XP.' : 'Please sign in to enroll in club courses and earn XP.');
      navigate('/login');
      return;
    }
    if (!course) return;

    setEnrolling(true);
    try {
      const currentUserId = user.id || (user as any).uid;
      const enr = await courseService.enrollCourse(currentUserId, course.id);
      setEnrollment(enr);
      toast.success(isArabic ? `تم التسجيل بنجاح في ${course.title}! تم منح +50 XP.` : `Successfully enrolled in ${course.title}! +50 XP awarded.`);
    } catch {
      toast.error(isArabic ? 'فشل التسجيل في الدورة.' : 'Failed to enroll.');
    } finally {
      setEnrolling(false);
    }
  };

  const toggleModule = (id: string) => {
    setExpandedModules(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-primary font-cyber text-xs tracking-widest animate-pulse">
          {isArabic ? 'جاري تحميل تفاصيل المنهج...' : 'DECRYPTING_COURSE_SYLLABUS...'}
        </p>
      </div>
    );
  }

  if (!course) return null;

  const isEnrolled = !!enrollment;
  const progress = enrollment?.progress || 0;

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Back button */}
      <Link
        to="/courses"
        className="inline-flex items-center gap-2 text-xs font-cyber text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className={`w-4 h-4 ${isArabic ? 'rotate-180' : ''}`} />
        <span>{isArabic ? 'العودة لقائمة الدورات' : 'BACK_TO_CATALOG'}</span>
      </Link>

      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 rounded-md text-xs font-cyber tracking-wider bg-primary/10 border border-primary/30 text-primary uppercase">
              {course.category.replace('_', ' ')}
            </span>
            <span className="px-3 py-1 rounded-md text-xs font-cyber tracking-wider bg-white/5 border border-white/10 text-muted-foreground uppercase">
              {course.level}
            </span>
            <span className="px-3 py-1 rounded-md text-xs font-mono bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              {course.rating} ({course.ratingCount} {isArabic ? 'تقييم' : 'reviews'})
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black font-cyber text-foreground tracking-tight leading-tight">
            {course.title}
          </h1>

          <p className="text-muted-foreground font-mono text-sm leading-relaxed">
            {course.description}
          </p>

          {/* Instructor Brief */}
          <div className="p-4 rounded-xl border border-white/10 bg-dark-navy/40 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center font-cyber font-bold text-primary text-lg">
              {course.instructorName[0]}
            </div>
            <div>
              <p className="text-[10px] font-cyber text-primary tracking-widest uppercase">
                {isArabic ? 'مدرب الدورة' : 'COURSE INSTRUCTOR'}
              </p>
              <h4 className="font-semibold text-foreground text-sm">{course.instructorName}</h4>
              <p className="text-xs font-mono text-muted-foreground">
                {course.instructorTitle || (isArabic ? 'مشرف أكاديمي بنادي DataCamp' : 'DataCamp Club Faculty Mentor')}
              </p>
            </div>
          </div>

          {/* Skills Grid */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-cyber text-primary tracking-widest uppercase">
              {isArabic ? 'المهارات التي ستتقنها' : 'SKILLS_YOU_WILL_MASTER'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {course.skills.map((skill, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2.5 rounded-lg bg-white/5 border border-white/10 text-xs font-mono">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span>{skill}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sticky Action Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl border border-primary/30 bg-dark-navy/80 backdrop-blur-2xl overflow-hidden shadow-[0_0_40px_rgba(0,255,204,0.15)] space-y-6">
            <div className="relative h-48 w-full overflow-hidden">
              <img src={course.coverImage} alt={course.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-navy via-transparent to-transparent" />
              <div className={`absolute top-3 ${isArabic ? 'left-3' : 'right-3'}`}>
                <span className="px-3 py-1 rounded-full text-xs font-cyber tracking-wider bg-black/70 backdrop-blur-md border border-primary/40 text-primary flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,255,204,0.4)]">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  +{course.pointsReward} XP
                </span>
              </div>
            </div>

            <div className="p-6 pt-0 space-y-6">
              {/* Progress if enrolled */}
              {isEnrolled && (
                <div className="space-y-2 p-3 rounded-xl bg-primary/10 border border-primary/20">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-primary font-bold">{isArabic ? 'نسبة تقدمك' : 'YOUR_PROGRESS'}</span>
                    <span className="text-foreground">{progress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-black/40 overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                {isEnrolled ? (
                  <Link to={`/courses/${course.slug}/learn`}>
                    <Button variant="cyber" className="w-full h-12 font-cyber tracking-wider text-sm shadow-[0_0_20px_rgba(0,255,204,0.3)]">
                      {progress >= 100 
                        ? (isArabic ? 'مراجعة الدورة' : 'REVIEW_COURSE') 
                        : (isArabic ? 'استكمال التعلم' : 'CONTINUE_LEARNING')
                      }
                    </Button>
                  </Link>
                ) : (
                  <Button
                    variant="cyber"
                    className="w-full h-12 font-cyber tracking-wider text-sm shadow-[0_0_20px_rgba(0,255,204,0.3)]"
                    onClick={handleEnroll}
                    disabled={enrolling}
                  >
                    {enrolling 
                      ? (isArabic ? 'جاري تفعيل الحساب...' : 'INITIALIZING_ACCESS...') 
                      : (isArabic ? 'سجل في المسار (+5 XP)' : 'ENROLL_NOW (+5 XP)')
                    }
                  </Button>
                )}

                {(isAdmin || isEditor) && (
                  <Link to="/admin/courses">
                    <Button
                      variant="outline"
                      className="w-full h-10 font-cyber text-xs border-amber-500/40 text-amber-300 hover:bg-amber-500/10 gap-2"
                    >
                      <span>⚙️ {isArabic ? 'تعديل في لوحة الإدارة' : 'EDIT IN ADMIN PANEL'}</span>
                    </Button>
                  </Link>
                )}

                <Button
                  variant="outline"
                  className="w-full h-10 font-cyber text-xs border-white/10 hover:border-primary/40 gap-2"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success(isArabic ? 'تم نسخ رابط الدورة إلى الحافظة!' : 'Course link copied to clipboard!');
                  }}
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{isArabic ? 'مشاركة رابط الدورة' : 'SHARE_WITH_PEERS'}</span>
                </Button>
              </div>

              {/* Course Meta Specs */}
              <div className="space-y-3 pt-4 border-t border-white/10 text-xs font-mono">
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-primary" /> {isArabic ? 'المدة الزمنية' : 'Duration'}</span>
                  <span className="text-foreground font-bold">{course.durationHours} {isArabic ? 'ساعة' : 'Hours'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5 text-secondary" /> {isArabic ? 'إجمالي الدروس' : 'Total Lessons'}</span>
                  <span className="text-foreground font-bold">{course.totalLessons} {isArabic ? 'درس' : 'Lessons'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-primary" /> {isArabic ? 'الطلاب المسجلون' : 'Enrolled Members'}</span>
                  <span className="text-foreground font-bold">{course.enrolledCount} {isArabic ? 'طالب' : 'Students'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground flex items-center gap-1.5"><Award className="w-3.5 h-3.5 text-amber-400" /> {isArabic ? 'الشهادة الأكاديمية' : 'Certificate'}</span>
                  <span className="text-foreground font-bold">{isArabic ? 'معتمدة برمز QR' : 'Verified on Completion'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Curriculum Syllabus Accordion */}
      <div className="space-y-6 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black font-cyber text-foreground tracking-tight">
            {isArabic ? 'المنهج الدراسي والوحدات' : 'COURSE_CURRICULUM'}
          </h2>
          <span className="text-xs font-mono text-muted-foreground">
            {modules.length} {isArabic ? 'وحدات' : 'Modules'} • {lessons.length} {isArabic ? 'دروس' : 'Lessons'}
          </span>
        </div>

        <div className="space-y-4">
          {modules.map(mod => {
            const isExpanded = !!expandedModules[mod.id];
            const modLessons = lessons.filter(l => l.moduleId === mod.id);

            return (
              <div
                key={mod.id}
                className="rounded-xl border border-white/10 bg-dark-navy/60 backdrop-blur-xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleModule(mod.id)}
                  className="w-full p-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-cyber text-primary tracking-widest uppercase">
                      {isArabic ? `الوحدة ${mod.order}` : `MODULE ${mod.order}`}
                    </span>
                    <h4 className="font-cyber font-bold text-foreground text-base">{mod.title}</h4>
                    <p className="text-xs font-mono text-muted-foreground">{mod.description}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <span className="text-xs font-mono text-muted-foreground hidden sm:inline">
                      {modLessons.length} {isArabic ? 'دروس' : 'Lessons'} • {mod.durationMinutes}{isArabic ? 'د' : 'm'}
                    </span>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-primary" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-white/10 divide-y divide-white/5 bg-black/20">
                    {modLessons.map(lesson => {
                      const isCompleted = enrollment?.completedLessons?.includes(lesson.id);

                      return (
                        <div
                          key={lesson.id}
                          className="p-4 px-6 flex items-center justify-between hover:bg-white/5 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            ) : lesson.type === 'video' ? (
                              <PlayCircle className="w-4 h-4 text-primary shrink-0" />
                            ) : lesson.type === 'quiz' ? (
                              <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
                            ) : (
                              <FileText className="w-4 h-4 text-secondary shrink-0" />
                            )}

                            <div>
                              <p className="text-xs sm:text-sm font-mono text-foreground font-medium">
                                {lesson.title}
                              </p>
                              <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground">
                                <span>{lesson.duration} {isArabic ? 'دقيقة' : 'mins'}</span>
                                <span>•</span>
                                <span className="text-primary">+{lesson.pointsReward} XP</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {isEnrolled ? (
                              <Link to={`/courses/${course.slug}/learn`}>
                                <Button variant="outline" className="h-8 text-[11px] font-cyber px-3 border-primary/30 text-primary">
                                  {isCompleted ? (isArabic ? 'مراجعة' : 'REVIEW') : (isArabic ? 'ابدأ' : 'START')}
                                </Button>
                              </Link>
                            ) : lesson.isPreview ? (
                              <span className="text-[10px] font-cyber px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                {isArabic ? 'معاينة مجانية' : 'FREE PREVIEW'}
                              </span>
                            ) : (
                              <Lock className="w-3.5 h-3.5 text-muted-foreground/40" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
