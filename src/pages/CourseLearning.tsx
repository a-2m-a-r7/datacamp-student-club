import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePoints } from '../contexts/PointsContext';
import { useLanguage } from '../contexts/LanguageContext';
import { courseService, courseModulesFromLessons } from '../services/courseService';
import { Course, CourseModule, CourseLesson, Enrollment } from '../types';
import { Button } from '../components/ui/Button';
import {
  ArrowLeft,
  CheckCircle2,
  PlayCircle,
  FileText,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Award,
  List,
  Check,
  RotateCcw
} from 'lucide-react';
import { toast } from 'sonner';
import { CodeExerciseRunner } from '../components/Compiler/CodeExerciseRunner';
import { AIMentorModal } from '../components/AIMentor/AIMentorModal';
import {LessonResources} from '../components/courses/LessonResources';

const CourseLearning = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const { grantPoints } = usePoints();
  const { isArabic } = useLanguage();

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [lessons, setLessons] = useState<CourseLesson[]>([]);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [currentLesson, setCurrentLesson] = useState<CourseLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [, setQuizScore] = useState<number | null>(null);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

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

        const less = await courseService.getCourseLessons(c.id);
        const units=less.some(l=>/^[a-f0-9-]{36}$/i.test(l.moduleId))?await courseService.getCourseUnits(c.id):[];
        const mods = courseModulesFromLessons(c.id, less,units);
        less.sort((a,b)=>mods.findIndex(m=>m.id===a.moduleId)-mods.findIndex(m=>m.id===b.moduleId)||a.order-b.order);
        setModules(mods);
        setLessons(less);

        if(user&&c.status==='draft'&&['admin','super_admin'].includes(user.role)){setEnrollment(null);setCurrentLesson(less[0]||null);}
        else if (user) {
          const currentUserId = user.id || (user as any).uid;
          let enr = await courseService.getUserEnrollment(currentUserId, c.id);
          if (!enr) {
            enr = await courseService.enrollCourse(currentUserId, c.id);
          }
          setEnrollment(enr);

          // resume from last lesson or start from first
          const lastLesson = less.find(l => l.id === enr?.lastLessonId) || less[0];
          setCurrentLesson(lastLesson || null);
        } else {
          setCurrentLesson(less[0] || null);
        }
      } catch (err) {
        console.error('Learning view load error:', err);
        toast.error((err as Error).message||(isArabic?'تعذر تحميل الدروس.':'Unable to load lessons.'));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug, user, navigate, isArabic]);

  const handleLessonSelect = (lesson: CourseLesson) => {
    setCurrentLesson(lesson);
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
  };

  const handleCompleteCurrentLesson = async () => {
    if (!user || !course || !currentLesson || completing) return false;

    setCompleting(true);
    try {
      const currentUserId = user.id || (user as any).uid;
      const res = await courseService.completeLesson(
        currentUserId,
        course.id,
        currentLesson.id,
        course.totalLessons,
        currentLesson.pointsReward
      );

      setEnrollment(res.enrollment);
      await refreshProfile().catch(() => {});
      toast.success(isArabic ? `تم إكمال الدرس! +${res.pointsAwarded} XP أضيفت لحسابك.` : `Lesson completed! +${res.pointsAwarded} XP claimed.`);

      if (res.isCourseFinished) {
        toast.success(isArabic ? 'مبروك! أتممت الكورس وتم إصدار شهادتك وحفظها.' : 'Course completed! Your certificate has been issued and saved.', {
          duration: 8000,
        });
      }

      // Automatically advance to next lesson if available
      const currentIndex = lessons.findIndex(l => l.id === currentLesson.id);
      if (currentIndex < lessons.length - 1) {
        handleLessonSelect(lessons[currentIndex + 1]);
      }
      return true;
    } catch (error: any) {
      toast.error(error.message || (isArabic ? 'فشل حفظ إتمام الدرس.' : 'Failed to complete lesson.'));
      return false;
    } finally {
      setCompleting(false);
    }
  };

  const handleQuizSubmit = async () => {
 if (!currentLesson?.quizQuestions?.length || completing) return;
 setCompleting(true);
 try {
  const result = await courseService.submitQuiz(currentLesson.id, selectedAnswers);
  setQuizScore(result.scorePercentage); setQuizSubmitted(true);
  if (result.passed) {
   const rows = await courseService.getUserEnrollment(user.id || user.uid, course.id);
   if (rows) setEnrollment(rows);
   await refreshProfile().catch(() => {});
   toast.success(isArabic ? 'تم اجتياز الاختبار وحفظ النتيجة' : 'Assessment passed and result saved');
   if (result.progress?.isCourseFinished && rows?.certificateId) toast.success(isArabic ? 'تم إصدار شهادة الكورس تلقائيًا' : 'Your course certificate was issued automatically');
   const next=lessons[lessons.findIndex(l=>l.id===currentLesson.id)+1];
   if(next?.type==='exercise'&&next.sourceLessonId&&next.sourceLessonId===currentLesson.sourceLessonId)handleLessonSelect(next);
  } else toast.error(isArabic ? 'درجة النجاح 80%' : 'Passing score is 80%');
 } catch (err: any) { toast.error(err.message || 'Unable to save assessment'); }
 finally { setCompleting(false); }
};

  if (!loading && (!course || !currentLesson)) {
    return <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p>{isArabic ? 'لا توجد دروس متاحة لهذا الكورس حالياً.' : 'No lessons are currently available for this course.'}</p>
      <Link to="/courses" className="text-primary underline">{isArabic ? 'العودة للكورسات' : 'Back to courses'}</Link>
    </div>;
  }
  if (loading || !course || !currentLesson) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 bg-dark-navy">
        <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-primary font-cyber text-xs tracking-widest animate-pulse">
          {isArabic ? 'جاري الاتصال ببيئة التعلم التفاعلية...' : 'CONNECTING_TO_CLASSROOM_STREAM...'}
        </p>
      </div>
    );
  }

  const currentIndex = lessons.findIndex(l => l.id === currentLesson.id);
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;
  const isCompleted = enrollment?.completedLessons?.includes(currentLesson.id);
  const overallProgress = enrollment?.progress || 0;

  return (
    <div className="min-h-screen flex flex-col bg-dark-navy text-foreground">
      {/* Top Learning Bar */}
      <header className="h-16 px-4 sm:px-6 border-b border-primary/20 bg-dark-navy/90 backdrop-blur-xl flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link
            to={`/courses/${course.slug}`}
            className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className={`w-5 h-5 ${isArabic ? 'rotate-180' : ''}`} />
          </Link>
          <div className="hidden sm:block">
            <h2 className="font-cyber font-bold text-sm text-foreground line-clamp-1">{course.title}</h2>
            <p className="text-[10px] font-mono text-muted-foreground">{currentLesson.title}</p>
          </div>
        </div>

        {/* Center Progress */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-32 sm:w-48 h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-primary shadow-[0_0_10px_rgba(0,255,204,0.6)] transition-all duration-300"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <span className="text-xs font-mono text-primary font-bold">{overallProgress}%</span>
          </div>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-white/5 transition-colors lg:hidden"
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Learning Grid */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left / Middle: Lesson Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 custom-scrollbar">
          <div className="max-w-4xl mx-auto space-y-6">
            {overallProgress >= 100 && (
              <div className="p-4 rounded-xl border border-primary/40 bg-primary/10 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[0_0_20px_rgba(0,255,204,0.15)]">
                <div className="flex items-center gap-3">
                  <Award className="w-8 h-8 text-primary shrink-0" />
                  <div>
                    <h4 className="font-cyber font-bold text-white text-sm">
                      {isArabic ? 'تم إكمال منهج الدورة بالكامل!' : 'COURSE CURRICULUM COMPLETED!'}
                    </h4>
                    <p className="text-xs font-mono text-muted-foreground">
                      {enrollment?.certificateId ? (isArabic ? 'تم إصدار الشهادة وحفظها ويمكنك عرضها الآن.' : 'Your certificate has been issued and saved. You can view it now.') : (isArabic ? 'لم يتأكد إصدار الشهادة بعد. أعد تحميل الصفحة أو تواصل مع الإدارة.' : 'Certificate issuance is not confirmed. Reload or contact administration.')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {lessons.some(lesson => lesson.quizQuestions?.length) && <Link to={`/courses/${course.slug}/quiz`}>
                    <Button variant="outline" className="text-xs font-cyber h-9 px-3 border-amber-500/40 text-amber-400 hover:bg-amber-500/10">
                      {isArabic ? 'مراجعة الاختبار' : 'REVIEW ASSESSMENT'}
                    </Button>
                  </Link>}
                  {enrollment?.certificateId && <Link to={`/certificates?course=${course.id}`}>
                    <Button variant="cyber" className="text-xs font-cyber h-9 px-4">
                      {isArabic ? 'عرض الشهادة' : 'VIEW CERTIFICATE'}
                    </Button>
                  </Link>}
                </div>
              </div>
            )}

            {/* Lesson Title Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div>
                <span className="text-[10px] font-cyber text-primary tracking-widest uppercase">
                  {isArabic ? `الدرس ${currentLesson.order}` : `LESSON ${currentLesson.order}`} • {currentLesson.type.toUpperCase()}
                </span>
                <h1 className="text-2xl sm:text-3xl font-black font-cyber text-foreground mt-1">
                  {currentLesson.title}
                </h1>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-cyber flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  +{currentLesson.pointsReward} XP
                </span>
                {isCompleted && (
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" /> {isArabic ? 'مكتمل' : 'Completed'}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2" role="tablist" aria-label={isArabic?'مراحل الدرس':'Learning stages'}>
              {lessons.filter(l=>l.id===(currentLesson.sourceLessonId||currentLesson.id)||l.sourceLessonId===(currentLesson.sourceLessonId||currentLesson.id)).map(l=><button key={l.id} type="button" role="tab" aria-selected={l.id===currentLesson.id} onClick={()=>handleLessonSelect(l)} className={`px-4 py-2 rounded-lg border text-sm ${l.id===currentLesson.id?'border-primary text-primary bg-primary/10':'border-white/15'}`}>{l.type==='video'?(isArabic?'الفيديو':'Video'):l.type==='quiz'?(isArabic?'الكويز':'Quiz'):l.type==='exercise'?(isArabic?'التطبيق البرمجي':'Coding'):l.title}</button>)}
            </div>
            <LessonResources key={`${user?.id||user?.uid||'visitor'}:${currentLesson.id}`} lesson={currentLesson} onVideoEnded={()=>{if(!isCompleted)handleCompleteCurrentLesson();}}/>
            {/* Article Content */}
            {currentLesson.type !== 'quiz' && currentLesson.content && (
              <div className="p-6 sm:p-8 rounded-2xl border border-white/10 bg-dark-navy/60 backdrop-blur-xl prose prose-invert max-w-none font-mono text-xs sm:text-sm leading-relaxed space-y-4">
                <div className="whitespace-pre-wrap">{currentLesson.content}</div>
              </div>
            )}

            {/* Quiz Interactive Engine */}
            {currentLesson.type === 'quiz' && currentLesson.quizQuestions && (
              <div className="space-y-6">
                <div className="p-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 backdrop-blur-xl">
                  <h3 className="font-cyber font-bold text-lg text-amber-400 mb-1">
                    {isArabic ? 'التحقق من المعرفة والفهم' : 'KNOWLEDGE_VERIFICATION'}
                  </h3>
                  <p className="text-xs font-mono text-muted-foreground">
                    {isArabic
                      ? `أجب على جميع الأسئلة بدقة. يلزم 80% على الأقل لكسب +${currentLesson.pointsReward} XP.`
                      : `Answer all questions correctly. Minimum 80% required to claim +${currentLesson.pointsReward} XP.`
                    }
                  </p>
                </div>

                <div className="space-y-6">
                  {currentLesson.quizQuestions.map((q, qIndex) => {
                    const selected = selectedAnswers[q.id];

                    return (
                      <div
                        key={q.id}
                        className="p-6 rounded-xl border border-white/10 bg-dark-navy/60 backdrop-blur-xl space-y-4"
                      >
                        <h4 className="font-cyber font-semibold text-foreground text-sm">
                          {qIndex + 1}. {q.question}
                        </h4>

                        <div className="space-y-2">
                          {q.options.map((option, optIndex) => {
                            const isThisChosen = selected === optIndex;
                            let btnStyle = 'border-white/10 hover:border-white/30 text-muted-foreground';

                            if (quizSubmitted) {
                              if (optIndex === (q.correctIndex ?? q.correctAnswer)) {
                                btnStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold';
                              } else if (isThisChosen) {
                                btnStyle = 'border-destructive bg-destructive/10 text-destructive';
                              }
                            } else if (isThisChosen) {
                              btnStyle = 'border-primary bg-primary/10 text-primary font-bold';
                            }

                            return (
                              <button
                                key={optIndex}
                                disabled={quizSubmitted}
                                onClick={() => setSelectedAnswers(p => ({ ...p, [q.id]: optIndex }))}
                                className={`w-full p-3.5 rounded-lg border text-xs font-mono transition-all flex items-center justify-between ${
                                  isArabic ? 'text-right' : 'text-left'
                                } ${btnStyle}`}
                              >
                                <span>{option}</span>
                                {isThisChosen && <div className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                              </button>
                            );
                          })}
                        </div>

                        {quizSubmitted && q.explanation && (
                          <p className="text-[11px] font-mono text-muted-foreground pt-2 border-t border-white/5">
                            💡 <strong>{isArabic ? 'التوضيح:' : 'Explanation:'}</strong> {q.explanation}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center gap-4 pt-2">
                  {!quizSubmitted ? (
                    <Button
                      variant="cyber"
                      className="font-cyber tracking-wider px-6 h-12"
                      onClick={handleQuizSubmit}
                      disabled={Object.keys(selectedAnswers).length < currentLesson.quizQuestions.length}
                    >
                      {isArabic ? 'تسليم التقييم' : 'SUBMIT_ASSESSMENT'}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="font-cyber tracking-wider border-white/20 gap-2"
                      onClick={() => {
                        setQuizSubmitted(false);
                        setSelectedAnswers({});
                        setQuizScore(null);
                      }}
                    >
                      <RotateCcw className={`w-4 h-4 ${isArabic ? 'ml-2' : 'mr-2'}`} />
                      {isArabic ? 'إعادة الاختبار' : 'RETRY_QUIZ'}
                    </Button>
                  )}
                </div>
              </div>
            )}

            {currentLesson.exercisePrompt&&<Link className="text-primary underline text-sm" to={`/compiler?lesson=${encodeURIComponent(currentLesson.id)}`}>{isArabic?'فتح التمرين في محرر الأكواد الكامل':'Open practice in the full coding tab'}</Link>}
            {/* Practical Coding Exercise / Online Compiler */}
            {currentLesson.exercisePrompt && (
              <div className="pt-2">
                <CodeExerciseRunner key={currentLesson.id} language={currentLesson.exerciseLanguage||'python'}
                  exerciseTitle={isArabic ? `التحدي البرمجي: ${currentLesson.title}` : `Practical Challenge: ${currentLesson.title}`}
                  exercisePrompt={currentLesson.exercisePrompt}
                  starterCode={currentLesson.exerciseStarterCode || '# Write your solution here\n'}
                  testCases={currentLesson.exerciseTestCases || [{ description: isArabic ? 'فحص التنفيذ' : 'Execution check', expectedOutput: '' }]}
                  pointsReward={currentLesson.pointsReward}
                  onSuccess={handleCompleteCurrentLesson}
                  onAskAI={() => {
                    setIsAIModalOpen(true);
                  }}
                />
              </div>
            )}

            {/* Bottom Navigation & Complete Action */}
            <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                {prevLesson ? (
                  <Button
                    variant="outline"
                    className="font-cyber text-xs border-white/10 hover:border-primary/40 gap-2"
                    onClick={() => handleLessonSelect(prevLesson)}
                  >
                    <ChevronLeft className={`w-4 h-4 ${isArabic ? 'rotate-180' : ''}`} />
                    {isArabic ? 'الدرس السابق' : 'PREVIOUS'}
                  </Button>
                ) : <div />}
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="cyber"
                  className="font-cyber text-xs tracking-wider h-11 px-6 shadow-[0_0_20px_rgba(0,255,204,0.25)]"
                  onClick={handleCompleteCurrentLesson}
                  disabled={completing || isCompleted || currentLesson.type==='quiz' || currentLesson.type==='exercise'}
                >
                  {isCompleted ? (
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      {isArabic ? 'تم إكمال الدرس' : 'LESSON COMPLETED'}
                    </span>
                  ) : completing ? (
                    isArabic ? 'جاري تسجيل الإنجاز...' : 'RECORDING PROGRESS...'
                  ) : (
                    isArabic ? `إكمال وحصد +${currentLesson.pointsReward} XP` : `COMPLETE & CLAIM +${currentLesson.pointsReward} XP`
                  )}
                </Button>

                {nextLesson && (
                  <Button
                    variant="outline"
                    className="font-cyber text-xs border-white/10 hover:border-primary/40 gap-2"
                    onClick={() => handleLessonSelect(nextLesson)}
                  >
                    {isArabic ? 'الدرس التالي' : 'NEXT'}
                    <ChevronRight className={`w-4 h-4 ${isArabic ? 'rotate-180' : ''}`} />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Right Sidebar: Curriculum Playlist */}
        <aside
          className={`${
            sidebarOpen ? `w-80 ${isArabic ? 'border-r' : 'border-l'} border-primary/20` : 'w-0 border-l-0 border-r-0 overflow-hidden'
          } bg-dark-navy/95 backdrop-blur-2xl transition-all duration-300 hidden lg:flex flex-col shrink-0`}
        >
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="font-cyber font-bold text-xs tracking-wider text-primary">
              {isArabic ? 'فهرس الدورة' : 'COURSE_INDEX'}
            </h3>
            <span className="text-[10px] font-mono text-muted-foreground">
              {lessons.length} {isArabic ? 'درس' : 'Lessons'}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
            {modules.map(mod => {
              const modLessons = lessons.filter(l => l.moduleId === mod.id);

              return (
                <div key={mod.id} className="space-y-1.5">
                  <div className="px-2 py-1 text-[10px] font-cyber text-muted-foreground uppercase tracking-widest">
                    {mod.title}
                  </div>

                  <div className="space-y-1">
                    {modLessons.map(lesson => {
                      const isCurrent = currentLesson.id === lesson.id;
                      const isDone = enrollment?.completedLessons?.includes(lesson.id);

                      return (
                        <button
                          key={lesson.id}
                          onClick={() => handleLessonSelect(lesson)}
                          className={`w-full p-2.5 rounded-lg border text-xs font-mono transition-all flex items-center gap-2.5 ${
                            isArabic ? 'text-right' : 'text-left'
                          } ${
                            isCurrent
                              ? 'bg-primary/20 border-primary text-foreground font-semibold shadow-[0_0_15px_rgba(0,255,204,0.15)]'
                              : isDone
                              ? 'bg-white/5 border-emerald-500/30 text-muted-foreground hover:text-foreground'
                              : 'bg-white/5 border-transparent text-muted-foreground hover:bg-white/10 hover:text-foreground'
                          }`}
                        >
                          {isDone ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          ) : lesson.type === 'video' ? (
                            <PlayCircle className="w-3.5 h-3.5 text-primary shrink-0" />
                          ) : lesson.type === 'quiz' ? (
                            <HelpCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          ) : (
                            <FileText className="w-3.5 h-3.5 text-secondary shrink-0" />
                          )}

                          <span className="truncate flex-1 text-[11px]">{lesson.title}</span>
                          <span className="text-[9px] text-primary/70 shrink-0">+{lesson.pointsReward}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
      </div>

      <AIMentorModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} />
    </div>
  );
};

export default CourseLearning;
