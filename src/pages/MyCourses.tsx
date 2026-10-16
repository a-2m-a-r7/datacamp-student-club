import React, { useEffect, useMemo, useState } from 'react';
import { CourseCover } from '../components/courses/CourseCover';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, CheckCircle, Clock, GraduationCap, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { courseService } from '../services/courseService';
import { Course, Enrollment } from '../types';

const MyCourses = () => {
  const { user } = useAuth();
  const { isArabic } = useLanguage();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Record<string, Enrollment>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const userId = user.id || (user as any).uid;
        const enrollmentList = await courseService.getUserEnrollments(userId);
        const enrollmentMap: Record<string, Enrollment> = {};
        enrollmentList.forEach(enrollment => {
          enrollmentMap[enrollment.courseId] = enrollment;
        });
        setEnrollments(enrollmentMap);
        setCourses(await courseService.getCoursesByIds(enrollmentList.map(e => e.courseId)));
      } catch (err: any) {
        toast.error(err.message || (isArabic ? 'فشل تحميل كورساتك' : 'Failed to load your courses'));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, isArabic]);

  const filteredCourses = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return courses;
    return courses.filter(course =>
      course.title.toLowerCase().includes(q) ||
      course.category.toLowerCase().includes(q) ||
      course.tags.some(tag => tag.toLowerCase().includes(q))
    );
  }, [courses, search]);

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-cyber tracking-wider mb-4">
            <GraduationCap className="w-4 h-4" />
            <span>{isArabic ? 'مساراتك المسجلة' : 'YOUR_LEARNING_PATHS'}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-cyber text-foreground">
            {isArabic ? 'كورساتي' : 'MY COURSES'}
          </h1>
          <p className="text-sm text-muted-foreground font-mono mt-2 max-w-2xl">
            {isArabic
              ? 'تابع تقدمك في الدورات التي سجلت بها واستكمل التعلم من آخر نقطة.'
              : 'Resume enrolled courses, track progress, and continue from your latest lesson.'}
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${isArabic ? 'right-3' : 'left-3'}`} />
          <Input
            aria-label={isArabic ? 'البحث داخل كورساتك' : 'Search your courses'}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={isArabic ? 'ابحث داخل كورساتك...' : 'Search your courses...'}
            className={`${isArabic ? 'pr-10' : 'pl-10'} font-mono text-xs bg-dark-navy/60 border-primary/20`}
          />
        </div>
      </div>

      {!loading && courses.length > 0 && <div aria-label={isArabic ? 'ملخص التعلم' : 'Learning summary'} className="grid grid-cols-3 gap-2 sm:gap-4">
        {[{value:courses.length,label:isArabic?'كورساتك':'Enrolled courses'},
          {value:courses.filter(course=>(enrollments[course.id]?.progress||0)<100).length,label:isArabic?'قيد التعلم':'In progress'},
          {value:courses.filter(course=>(enrollments[course.id]?.progress||0)>=100).length,label:isArabic?'مكتملة':'Completed'}].map(item=><div key={item.label} className="min-w-0 rounded-2xl border border-white/10 bg-dark-navy/70 p-3 sm:p-5"><p className="text-2xl sm:text-3xl font-bold text-primary">{item.value}</p><p className="mt-1 text-[11px] sm:text-sm text-muted-foreground">{item.label}</p></div>)}
      </div>}

      {loading ? (
        <div className="py-24 text-center text-primary font-cyber text-xs animate-pulse">
          {isArabic ? 'جاري تحميل تسجيلاتك من Supabase...' : 'LOADING_ENROLLMENTS_FROM_SUPABASE...'}
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="py-20 px-6 rounded-2xl border border-dashed border-white/10 text-center">
          <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
          <h2 className="font-cyber text-xl text-white mb-2">
            {courses.length === 0 ? (isArabic ? 'لم تسجل في أي دورة بعد' : 'NO_ENROLLED_COURSES_YET') : (isArabic ? 'لا توجد نتائج مطابقة' : 'NO_MATCHING_COURSES')}
          </h2>
          <p className="text-xs font-mono text-muted-foreground mb-6">
            {isArabic ? 'استكشف الكتالوج وسجل في أول مسار تدريبي.' : 'Explore the catalog and enroll in your first learning path.'}
          </p>
          <Button variant="cyber" onClick={() => navigate('/courses')} className="font-cyber text-xs">
            {isArabic ? 'استكشف الدورات' : 'EXPLORE_COURSES'}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCourses.map(course => {
            const enrollment = enrollments[course.id];
            const progress = enrollment?.progress || 0;
            return (
              <article key={course.id} className="group min-w-0 flex flex-col rounded-2xl border border-white/10 bg-dark-navy/80 overflow-hidden hover:border-primary/40 transition-colors shadow-lg">
                <CourseCover src={course.coverImage} title={course.title}>
                  <span className={`absolute bottom-3 start-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] backdrop-blur-md ${progress>=100?'border-primary/30 bg-dark-navy/90 text-primary':'border-white/20 bg-dark-navy/90 text-white'}`}>
                    {progress>=100&&<CheckCircle className="h-3.5 w-3.5"/>}{progress>=100?(isArabic?'مكتمل':'Completed'):(isArabic?'قيد التعلم':'In progress')}
                  </span>
                </CourseCover>
                <div className="flex flex-1 flex-col gap-5 p-5">
                  <div className="flex-1 space-y-3">
                    <h3 className="font-bold text-xl leading-snug text-foreground line-clamp-2 break-words"><Link to={`/courses/${course.slug}/learn`} className="hover:text-primary focus-visible:outline-primary">{course.title}</Link></h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed break-words">{course.shortDescription || course.description}</p>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {course.durationHours} {isArabic?'ساعة':course.durationHours===1?'Hour':'Hours'}</span>
                      <span className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5"/> {course.totalLessons} {isArabic?'درس':course.totalLessons===1?'Lesson':'Lessons'}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs"><span className="text-muted-foreground">{isArabic?'تقدمك':'Your progress'}</span><span className="font-semibold text-primary" dir="ltr">{progress}%</span></div>
                    <progress aria-label={isArabic?`تقدمك في ${course.title}`:`Progress in ${course.title}`} value={progress} max={100} className="block h-1.5 w-full overflow-hidden rounded-full accent-primary"/>
                  </div>
                  <div className="space-y-3 pt-4 border-t border-white/10">
                    <p className="text-[11px] text-muted-foreground">
                      {isArabic ? 'آخر وصول:' : 'Last access:'} {enrollment?.lastAccessedAt ? new Date(enrollment.lastAccessedAt as string).toLocaleDateString(isArabic?'ar-EG':'en-GB') : '—'}
                    </p>
                    <Button asChild variant="cyber" className="w-full min-h-11 px-3 text-xs">
                     <Link to={`/courses/${course.slug}/learn`}>
                      {progress >= 100 ? (isArabic ? 'مراجعة' : 'REVIEW') : (isArabic ? 'متابعة' : 'CONTINUE')}<ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180"/>
                     </Link>
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyCourses;
