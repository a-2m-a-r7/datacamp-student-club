import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePoints } from '../contexts/PointsContext';
import { useLanguage } from '../contexts/LanguageContext';
import { courseService } from '../services/courseService';
import { Course, CourseCategory, CourseLevel, Enrollment } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { toast } from 'sonner';
import {
  BookOpen,
  Search,
  Clock,
  Award,
  Star,
  Users,
  Sparkles,
  ArrowRight,
  Filter,
  CheckCircle,
  GraduationCap
} from 'lucide-react';
import { motion } from 'motion/react';
import { useCourseCatalog } from '../lib/useCourseCatalog';
import { CourseCover } from '../components/courses/CourseCover';

const Courses = () => {
  const navigate = useNavigate();
  const { user, profile, isAdmin, isEditor } = useAuth();
  const { totalPoints, level } = usePoints();
  const { isArabic, t } = useLanguage();

  const CATEGORIES: { id: CourseCategory | 'all'; label: string }[] = [
    { id: 'all', label: isArabic ? 'جميع المسارات' : 'ALL TRACKS' },
    { id: 'data_science', label: isArabic ? 'علم البيانات' : 'DATA SCIENCE' },
    { id: 'ai_ml', label: isArabic ? 'الذكاء الاصطناعي وتعلم الآلة' : 'AI & MACHINE LEARNING' },
    { id: 'business_intelligence', label: isArabic ? 'ذكاء الأعمال' : 'BUSINESS INTELLIGENCE' },
  ];

  const LEVELS: { id: CourseLevel | 'all'; label: string }[] = [
    { id: 'all', label: isArabic ? 'جميع المستويات' : 'ANY LEVEL' },
    { id: 'beginner', label: isArabic ? 'مبتدئ' : 'BEGINNER' },
    { id: 'intermediate', label: isArabic ? 'متوسط' : 'INTERMEDIATE' },
    { id: 'advanced', label: isArabic ? 'متقدم' : 'ADVANCED' },
  ];

  const [enrollments, setEnrollments] = useState<Record<string, Enrollment>>({});
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CourseCategory | 'all'>('all');
  const [selectedLevel, setSelectedLevel] = useState<CourseLevel | 'all'>('all');
  const { courses, cursor, loading, loadingMore, error, reload, loadMore } = useCourseCatalog(search, selectedCategory, selectedLevel);
  const [enrollingIds, setEnrollingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      try {
        if (user) {
          const currentUserId = user.id || (user as any).uid;
          const userEnr = await courseService.getUserEnrollments(currentUserId, courses.map(course => course.id));
          const map: Record<string, Enrollment> = {};
          userEnr.forEach(e => { map[e.courseId] = e; });
          if (active) setEnrollments(map);
        } else if (active) setEnrollments({});
      } catch (err) {
        console.error('Error loading courses:', err);
      }
    };
    loadData();
    return () => { active = false; };
  }, [user, courses]);

  const handleEnrollCourse = async (e: React.MouseEvent, course: Course) => {
    e.preventDefault();
    e.stopPropagation();
    if (enrollingIds.has(course.id)) return;
    if (!user) {
      toast.info(isArabic ? 'يرجى تسجيل الدخول أولاً للالتحاق بالدورة' : 'Please sign in to enroll in this course');
      navigate('/login');
      return;
    }
    const currentUserId = user.id || (user as any).uid;
    setEnrollingIds(previous => new Set(previous).add(course.id));
    try {
      const enr = await courseService.enrollCourse(currentUserId, course.id);
      setEnrollments(prev => ({ ...prev, [course.id]: enr }));
      toast.success(isArabic ? `تم التسجيل بنجاح في ${course.title}! 🚀` : `Successfully enrolled in ${course.title}! 🚀`);
    } catch {
      toast.error(isArabic ? 'فشل التسجيل في الدورة' : 'Failed to enroll');
    } finally { setEnrollingIds(previous => { const next = new Set(previous); next.delete(course.id); return next; }); }
  };

  const filteredCourses = courses;

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Header Banner */}
      <div className="relative rounded-3xl border border-primary/20 bg-dark-navy/80 p-6 sm:p-10 overflow-hidden shadow-[0_0_50px_rgba(0,255,204,0.06)]">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-cyber tracking-wider">
            <GraduationCap className="w-4 h-4" />
            <span>{isArabic ? `أكاديمية داتا كامب • المنهج التدريبي ${new Date().getFullYear()}` : `DATACAMP ACADEMY // ${new Date().getFullYear()} CURRICULUM`}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black font-cyber text-foreground tracking-tight">
            {isArabic ? 'احترف علم البيانات والذكاء الاصطناعي' : 'MASTER DATA SCIENCE & AI'}
          </h1>

          <p className="text-muted-foreground font-mono text-xs sm:text-sm leading-relaxed max-w-2xl">
            {isArabic
              ? 'تصفح الكورسات المتاحة وتابع تقدمك في الدروس والاختبارات. إكمال المنهج يصدر شهادة من نادي داتا كامب يمكن التحقق منها ومشاركتها.'
              : 'Explore available courses and track your lessons and assessments. Complete the curriculum to earn a verifiable DataCamp Student Club certificate you can share.'}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
              <Award className="w-4 h-4 text-primary" />
              <span>{isArabic ? 'مكافأة كل كورس موضحة في بطاقته' : 'Each course shows its own XP reward'}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
              <Users className="w-4 h-4 text-secondary" />
              <span>{isArabic ? 'تقدمك محفوظ في حسابك' : 'Progress saved to your account'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Role Privileges & Management Bar */}
      {(isAdmin || isEditor) ? (
        <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_0_25px_rgba(245,158,11,0.15)]">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-lg bg-amber-500/20 text-amber-400 font-cyber font-bold text-xs">
              {isAdmin ? (isArabic ? '👑 صلاحيات المدير' : '👑 ADMIN CLEARANCE') : (isArabic ? '✍️ صلاحيات المحرر' : '✍️ EDITOR CLEARANCE')}
            </span>
            <div>
              <h4 className="font-cyber font-bold text-sm text-white">
                {isArabic ? 'وضع إدارة المناهج التعليمية نشط' : 'Curriculum Management Mode Active'}
              </h4>
              <p className="text-xs font-mono text-muted-foreground">
                {isArabic
                  ? 'لديك صلاحيات إدارة ونشر وتحديث الدروس والمسارات الخاصة بالنادي.'
                  : 'You have administrative authority to publish, update lessons, and manage club courses.'}
              </p>
            </div>
          </div>
            <Button asChild className="bg-amber-400 hover:bg-amber-500 text-black font-cyber font-bold text-xs h-9 px-4">
             <Link to="/admin/courses">
              {isArabic ? '+ إضافة دورة جديدة' : '+ ADD NEW COURSE'}
             </Link>
            </Button>
        </div>
      ) : (
        <div className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-primary font-bold">
            <GraduationCap className="w-4 h-4" />
            <span>{isArabic ? 'بوابة الطالب' : 'STUDENT PORTAL'} • {profile?.fullName || (isArabic ? 'طالب متميز' : 'Student Learner')}</span>
          </div>
          <span className="text-muted-foreground hidden sm:inline">
            {isArabic ? 'تعلم ذاتي تفاعلي • شهادات معتمدة فور إكمال 100%' : 'Self-paced interactive learning • Verified certificates on 100% completion'}
          </span>
        </div>
      )}

      {/* Search & Filter Bar */}
      <section aria-label={isArabic ? 'البحث وتصفية الكورسات' : 'Course search and filters'} className="space-y-4 rounded-2xl border border-white/10 bg-dark-navy/50 p-4 sm:p-5">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              aria-label={isArabic ? 'البحث في الكورسات' : 'Search courses'}
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={isArabic ? 'ابحث بالمهارة أو التقنية (مثل: بايثون، Pandas، Scikit-Learn)...' : 'Search by topic, skill, or library (e.g. Pandas, Scikit-Learn)...'}
              className="pl-10 rtl:pl-4 rtl:pr-10 font-mono text-xs bg-dark-navy/60 border-primary/20 h-11"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {LEVELS.map(lvl => (
              <button
                key={lvl.id}
                aria-pressed={selectedLevel === lvl.id}
                onClick={() => setSelectedLevel(lvl.id)}
                className={`px-3 py-1.5 text-[11px] font-cyber tracking-wider rounded-md border transition-all ${
                  selectedLevel === lvl.id
                    ? 'bg-primary text-black border-primary font-bold'
                    : 'bg-white/5 text-muted-foreground border-white/10 hover:text-foreground hover:border-white/20'
                }`}
              >
                {lvl.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex overflow-x-auto gap-2 pb-2 custom-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              aria-pressed={selectedCategory === cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 text-xs font-cyber tracking-widest uppercase rounded-lg border whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-primary/20 border-primary text-primary font-bold shadow-[0_0_15px_rgba(0,255,204,0.15)]'
                  : 'bg-dark-navy/40 border-white/10 text-muted-foreground hover:text-foreground hover:border-white/20'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {!loading && !error && filteredCourses.length > 0 && <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold">{isArabic ? 'اختر خطوتك التالية' : 'Find your next course'}</h2>
        <p role="status" className="text-xs text-muted-foreground">{isArabic ? `${filteredCourses.length} كورس معروض${cursor ? ' · المزيد متاح' : ''}` : `${filteredCourses.length} ${filteredCourses.length===1?'course':'courses'} shown${cursor ? ' · More available' : ''}`}</p>
      </div>}

      {/* Courses Grid */}
      {error && <div role="alert" className="p-4 border border-red-500/30 rounded-xl space-y-3"><p>{isArabic ? 'تعذر تحميل الدورات. أعد المحاولة.' : error}</p><Button onClick={courses.length ? loadMore : reload}>{isArabic ? 'إعادة المحاولة' : 'Retry courses'}</Button></div>}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-primary font-cyber text-xs tracking-widest animate-pulse">
            {isArabic ? 'جاري استدعاء سجل الدورات التدريبية...' : 'QUERYING_ACADEMY_REGISTRY...'}
          </p>
        </div>
      ) : !error && filteredCourses.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl p-8">
          <BookOpen className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="text-lg font-cyber text-foreground mb-2">
            {isArabic ? 'لم يتم العثور على دورات مطابقة' : 'NO_COURSES_MATCHED'}
          </h3>
          <p className="text-xs font-mono text-muted-foreground max-w-sm mx-auto mb-6">
            {isArabic
              ? 'لا توجد دورات تدريبية تطابق معايير البحث الحالية. جرب إعادة تعيين الفلاتر أو تغيير كلمة البحث.'
              : 'No training modules match your current filter parameters. Try clearing your search query.'}
          </p>
          <Button
            variant="outline"
            onClick={() => { setSearch(''); setSelectedCategory('all'); setSelectedLevel('all'); }}
            className="font-cyber text-xs border-primary/30 text-primary"
          >
            {isArabic ? 'إعادة ضبط الفلاتر' : 'RESET_FILTERS'}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCourses.map((course, idx) => {
            const enrollment = enrollments[course.id];
            const isEnrolled = !!enrollment;
            const progress = enrollment?.progress || 0;

            return (
              <motion.article
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(idx, 5) * 0.04 }}
                className="group min-w-0 flex flex-col rounded-2xl border border-white/10 hover:border-primary/40 bg-dark-navy/80 overflow-hidden transition-colors duration-300 shadow-lg"
              >
                {/* Course Banner */}
                <CourseCover src={course.coverImage} title={course.title}>

                  {/* Level & XP Badges */}
                  <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3 flex gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-cyber tracking-wider bg-black/60 backdrop-blur-md border border-white/20 text-white uppercase">
                      {course.level === 'beginner' ? (isArabic ? 'مبتدئ' : 'BEGINNER') : course.level === 'intermediate' ? (isArabic ? 'متوسط' : 'INTERMEDIATE') : (isArabic ? 'متقدم' : 'ADVANCED')}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3 rtl:right-auto rtl:left-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-cyber tracking-wider bg-primary/20 backdrop-blur-md border border-primary/40 text-primary flex items-center gap-1 shadow-[0_0_10px_rgba(0,255,204,0.3)]">
                      <Sparkles className="w-3 h-3" />
                      +{course.pointsReward} XP
                    </span>
                  </div>

                </CourseCover>

                {/* Card Content */}
                <div className="flex-1 p-5 flex flex-col gap-5">
                  <div className="flex-1 space-y-3">
                    <p className="text-[11px] font-semibold text-primary">{CATEGORIES.find(category => category.id === course.category)?.label || course.category}</p>
                    <h3 className="font-bold text-xl leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2 break-words">
                      <Link to={`/courses/${course.slug}`} className="focus-visible:outline-primary">{course.title}</Link>
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed break-words">
                      {course.shortDescription || course.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        {course.durationHours} {isArabic ? 'ساعة' : course.durationHours===1?'Hour':'Hours'}
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-secondary" />
                        {course.totalLessons} {isArabic ? 'درس' : course.totalLessons===1?'Lesson':'Lessons'}
                      </span>
                      {course.ratingCount > 0 && <span className="flex items-center gap-1 text-amber-400" aria-label={isArabic ? 'تقييم الكورس' : 'Course rating'}>
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {course.rating}
                      </span>}
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {course.tags.slice(0, 3).map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="max-w-full break-words px-2 py-1 rounded-md text-[10px] bg-white/5 border border-white/10 text-muted-foreground"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Footer & CTA */}
                  <div className="pt-4 border-t border-white/10 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                     <div className="min-w-0">
                      <p className="text-[10px] font-mono text-muted-foreground uppercase">{isArabic ? 'المدرب' : 'INSTRUCTOR'}</p>
                      <p className="text-sm text-foreground font-medium break-words">{course.instructorName || (isArabic ? 'غير محدد' : 'Not specified')}</p>
                     </div>
                      {(isAdmin || isEditor) && (
                          <Button asChild
                            size="sm"
                            variant="outline"
                            className="h-9 px-3 text-[11px] font-cyber border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                            title={isArabic ? 'تعديل الكورس في لوحة الإدارة' : 'Edit course in admin panel'}
                          >
                           <Link to="/admin/courses">
                            {isArabic ? 'تعديل' : 'EDIT'}
                           </Link>
                          </Button>
                      )}
                    </div>
                    {isEnrolled && <div className="space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground"><span>{isArabic ? 'تقدمك' : 'Your progress'}</span><span dir="ltr">{progress}%</span></div>
                      <progress aria-label={isArabic ? `تقدمك في ${course.title}` : `Progress in ${course.title}`} value={progress} max={100} className="block h-1.5 w-full overflow-hidden rounded-full accent-primary"/>
                    </div>}
                      {isEnrolled ? (
                          <Button asChild
                            variant="cyber"
                            className="w-full h-auto min-h-11 py-2 px-3 text-[11px] whitespace-normal"
                          >
                           <Link to={`/courses/${course.slug}`}>
                            {progress >= 100 ? (
                              <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> {isArabic ? 'مكتمل' : 'COMPLETED'}</span>
                            ) : (
                              <span className="flex items-center gap-1.5">{isArabic ? `متابعة التعلم (${progress}%)` : `CONTINUE LEARNING (${progress}%)`} <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" /></span>
                            )}
                           </Link>
                          </Button>
                      ) : (
                        <div className="flex items-stretch gap-2">
                          <Button
                            variant="cyber"
                            onClick={(e) => handleEnrollCourse(e, course)}
                            disabled={enrollingIds.has(course.id)}
                            className="flex-1 min-h-11 px-3 text-xs"
                          >
                            {isArabic ? 'سجل الآن ⚡' : 'ENROLL NOW ⚡'}
                          </Button>
                            <Button asChild aria-label={isArabic ? 'معاينة تفاصيل المنهج' : 'View Course Syllabus'}
                              variant="outline"
                              className="h-11 w-11 shrink-0 px-2.5 text-xs border-white/10 hover:border-primary/40"
                              title={isArabic ? 'معاينة تفاصيل المنهج' : 'View Course Syllabus'}
                            >
                             <Link to={`/courses/${course.slug}`}>
                              <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                             </Link>
                            </Button>
                        </div>
                      )}
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}
      {cursor && !loading && <div className="text-center"><Button onClick={loadMore} disabled={loadingMore}>{loadingMore ? (isArabic ? 'جاري التحميل...' : 'Loading more...') : (isArabic ? 'تحميل المزيد من الكورسات' : 'Load more courses')}</Button></div>}
    </div>
  );
};

export default Courses;
