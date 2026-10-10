import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Clock, GraduationCap, Search, Trophy } from 'lucide-react';
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
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={isArabic ? 'ابحث داخل كورساتك...' : 'Search your courses...'}
            className={`${isArabic ? 'pr-10' : 'pl-10'} font-mono text-xs bg-dark-navy/60 border-primary/20`}
          />
        </div>
      </div>

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
              <div key={course.id} className="rounded-xl border border-primary/20 bg-dark-navy/60 overflow-hidden hover:border-primary/50 transition-all">
                <div className="relative h-40 bg-black/40">
                  <img src={course.coverImage} alt={course.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-navy via-dark-navy/40 to-transparent" />
                  <div className="absolute bottom-0 inset-x-0 h-2 bg-black/60">
                    <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground mb-2">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {course.durationHours}h</span>
                      <span className="flex items-center gap-1"><Trophy className="w-3 h-3 text-primary" /> {progress}%</span>
                    </div>
                    <h3 className="font-cyber font-bold text-lg text-white line-clamp-1">{course.title}</h3>
                    <p className="text-xs font-mono text-muted-foreground line-clamp-2 mt-1">{course.shortDescription || course.description}</p>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-white/10">
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {isArabic ? 'آخر وصول:' : 'Last access:'} {enrollment?.lastAccessedAt ? new Date(enrollment.lastAccessedAt as string).toLocaleDateString() : '-'}
                    </span>
                    <Link to={`/courses/${course.slug}/learn`}>
                      <Button variant="cyber" className="h-9 px-3 text-xs font-cyber">
                        {progress >= 100 ? (isArabic ? 'مراجعة' : 'REVIEW') : (isArabic ? 'متابعة' : 'CONTINUE')}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyCourses;
