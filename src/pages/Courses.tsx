import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePoints } from '../contexts/PointsContext';
import { useLanguage } from '../contexts/LanguageContext';
import { courseService } from '../services/courseService';
import { Course, CourseCategory, CourseLevel, Enrollment } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
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

const Courses = () => {
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

  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Record<string, Enrollment>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CourseCategory | 'all'>('all');
  const [selectedLevel, setSelectedLevel] = useState<CourseLevel | 'all'>('all');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const list = await courseService.getCourses();
        setCourses(list);

        if (user) {
          const userEnr = await courseService.getUserEnrollments(user.uid);
          const map: Record<string, Enrollment> = {};
          userEnr.forEach(e => { map[e.courseId] = e; });
          setEnrollments(map);
        }
      } catch (err) {
        console.error('Error loading courses:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  const filteredCourses = courses.filter(c => {
    const matchCategory = selectedCategory === 'all' || c.category === selectedCategory;
    const matchLevel = selectedLevel === 'all' || c.level === selectedLevel;
    const matchSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase()) ||
      c.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    return matchCategory && matchLevel && matchSearch;
  });

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Header Banner */}
      <div className="relative rounded-2xl border border-primary/20 bg-dark-navy/60 backdrop-blur-xl p-8 sm:p-12 overflow-hidden shadow-[0_0_50px_rgba(0,255,204,0.06)]">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-cyber tracking-wider">
            <GraduationCap className="w-4 h-4" />
            <span>{isArabic ? 'أكاديمية داتا كامب • المنهج التدريبي 2026' : 'DATACAMP ACADEMY // 2026 CURRICULUM'}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black font-cyber text-foreground tracking-tight">
            {isArabic ? 'احترف علم البيانات والذكاء الاصطناعي' : 'MASTER DATA SCIENCE & AI'}
          </h1>

          <p className="text-muted-foreground font-mono text-xs sm:text-sm leading-relaxed max-w-2xl">
            {isArabic 
              ? 'مسارات تدريبية تطبيقية صممها خبراء ومهندسون وباحثون أكاديميون. أكمل الدروس البرمجية، واكسب شهادات معتمدة ونقاط XP للتنافس على صدارة الجامعة.'
              : 'Hands-on courses created by senior engineers and university researchers. Complete lessons, ace code assessments, earn verified certificates, and accumulate XP to ascend the club leaderboard.'}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
              <Award className="w-4 h-4 text-primary" />
              <span>{isArabic ? 'اكسب حتى ' : 'Earn Up to '}<strong className="text-primary font-bold">800 XP</strong>{isArabic ? ' لكل مسار' : ' per course'}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
              <Users className="w-4 h-4 text-secondary" />
              <span>{isArabic ? '+350 طالب نشط بالنادي' : '350+ Active Club Students'}</span>
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
          <Link to="/admin/courses">
            <Button className="bg-amber-400 hover:bg-amber-500 text-black font-cyber font-bold text-xs h-9 px-4">
              {isArabic ? '+ إضافة دورة جديدة' : '+ ADD NEW COURSE'}
            </Button>
          </Link>
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
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
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
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-primary font-cyber text-xs tracking-widest animate-pulse">
            {isArabic ? 'جاري استدعاء سجل الدورات التدريبية...' : 'QUERYING_ACADEMY_REGISTRY...'}
          </p>
        </div>
      ) : filteredCourses.length === 0 ? (
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course, idx) => {
            const enrollment = enrollments[course.id];
            const isEnrolled = !!enrollment;
            const progress = enrollment?.progress || 0;

            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="group flex flex-col rounded-xl border border-primary/20 hover:border-primary/50 bg-dark-navy/60 hover:bg-dark-navy/80 backdrop-blur-xl overflow-hidden transition-all duration-300 shadow-[0_0_20px_rgba(0,0,0,0.4)] hover:shadow-[0_0_30px_rgba(0,255,204,0.15)]"
              >
                {/* Course Banner */}
                <div className="relative h-44 w-full overflow-hidden bg-black/40">
                  <img
                    src={course.coverImage}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-navy via-dark-navy/40 to-transparent" />

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

                  {/* Progress bar if enrolled */}
                  {isEnrolled && (
                    <div className="absolute bottom-0 inset-x-0 h-1.5 bg-black/60">
                      <div
                        className="h-full bg-primary shadow-[0_0_10px_rgba(0,255,204,0.8)] transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div className="flex-1 p-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        {course.durationHours} {isArabic ? 'ساعة' : 'Hours'}
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-secondary" />
                        {course.totalLessons} {isArabic ? 'درس' : 'Lessons'}
                      </span>
                      <span className="flex items-center gap-1 text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {course.rating}
                      </span>
                    </div>

                    <h3 className="font-cyber font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {course.title}
                    </h3>

                    <p className="font-mono text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {course.shortDescription || course.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {course.tags.slice(0, 3).map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 border border-white/10 text-muted-foreground"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Footer & CTA */}
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-mono text-muted-foreground uppercase">{isArabic ? 'المدرب' : 'INSTRUCTOR'}</p>
                      <p className="text-xs font-mono text-foreground font-medium">{course.instructorName}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {(isAdmin || isEditor) && (
                        <Link to="/admin/courses">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-9 px-3 text-[11px] font-cyber border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                            title="Edit course in admin panel"
                          >
                            {isArabic ? 'تعديل' : 'EDIT'}
                          </Button>
                        </Link>
                      )}
                      <Link to={`/courses/${course.slug}`}>
                        <Button
                          variant={isEnrolled ? "cyber" : "outline"}
                          className="h-9 px-4 text-xs font-cyber tracking-wider border-primary/40 group-hover:border-primary"
                        >
                          {isEnrolled ? (
                            progress >= 100 ? (
                              <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> {isArabic ? 'مكتمل' : 'COMPLETED'}</span>
                            ) : (
                              <span>{isArabic ? `متابعة (${progress}%)` : `RESUME (${progress}%)`}</span>
                            )
                          ) : (
                            <span className="flex items-center gap-1">{isArabic ? 'استكشاف الدورة' : 'EXPLORE'} <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" /></span>
                          )}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Courses;
