import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePoints } from '../contexts/PointsContext';
import { useLanguage } from '../contexts/LanguageContext';
import { courseService } from '../services/courseService';
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

const CourseLearning = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
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

        const [mods, less] = await Promise.all([
          courseService.getCourseModules(c.id),
          courseService.getCourseLessons(c.id),
        ]);
        setModules(mods);
        setLessons(less);

        if (user) {
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
    if (!user || !course || !currentLesson || completing) return;

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
      toast.success(isArabic ? `تم إكمال الدرس! +${res.pointsAwarded} XP أضيفت لحسابك.` : `Lesson completed! +${res.pointsAwarded} XP claimed.`);

      if (res.isCourseFinished) {
        toast.success(isArabic ? `🏆 مبروك! أتممت الدورة وحصلت على الشهادة المعتمدة و 500 XP إضافية!` : `🏆 COURSE COMPLETED! You unlocked the Master Certificate & 500 Bonus XP!`, {
          duration: 8000,
        });
      }

      // Automatically advance to next lesson if available
      const currentIndex = lessons.findIndex(l => l.id === currentLesson.id);
      if (currentIndex < lessons.length - 1) {
        handleLessonSelect(lessons[currentIndex + 1]);
      }
    } catch {
      toast.error(isArabic ? 'فشل حفظ إتمام الدرس.' : 'Failed to complete lesson.');
    } finally {
      setCompleting(false);
    }
  };

  const handleQuizSubmit = async () => {
    if (!currentLesson?.quizQuestions) return;
    const questions = currentLesson.quizQuestions;
    let correct = 0;

    questions.forEach(q => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        correct++;
      }
    });

    const percentage = Math.round((correct / questions.length) * 100);
    setQuizScore(percentage);
    setQuizSubmitted(true);

    if (percentage >= 70) {
      toast.success(isArabic ? `تم اجتياز الاختبار بنسبة ${percentage}%! عمل رائع!` : `Quiz passed with ${percentage}%! Great job!`);
      await handleCompleteCurrentLesson();
    } else {
      toast.error(isArabic ? `الدرجة: ${percentage}%. تحتاج 70% على الأقل للاجتياز.` : `Score: ${percentage}%. You need at least 70% to pass this unit.`);
    }
  };

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
                      {isArabic ? 'لقد فتحت شهادتك الرسمية المعتمدة ويمكنك استعراضها الآن.' : 'You have unlocked your official verifiable certificate.'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link to={`/courses/${course.slug}/quiz`}>
                    <Button variant="outline" className="text-xs font-cyber h-9 px-3 border-amber-500/40 text-amber-400 hover:bg-amber-500/10">
                      {isArabic ? 'خوض الاختبار النهائي (+50 XP)' : 'TAKE FINAL QUIZ (+50 XP)'}
                    </Button>
                  </Link>
                  <Link to="/certificates">
                    <Button variant="cyber" className="text-xs font-cyber h-9 px-4">
                      {isArabic ? 'عرض الشهادة' : 'VIEW CERTIFICATE'}
                    </Button>
                  </Link>
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

            {/* Video Player */}
            {currentLesson.type === 'video' && (
              <div className="relative rounded-2xl overflow-hidden border border-primary/30 bg-black aspect-video shadow-[0_0_40px_rgba(0,0,0,0.8)]">
                {currentLesson.videoUrl ? (
                  <iframe
                    src={currentLesson.videoUrl}
                    title={currentLesson.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-3">
                    <PlayCircle className="w-16 h-16 text-primary animate-pulse" />
                    <p className="font-mono text-xs">
                      {isArabic ? 'جاري معالجة وبث الفيديو التعليمي...' : 'Video stream currently processing.'}
                    </p>
                  </div>
                )}
              </div>
            )}

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
                      ? `أجب على جميع الأسئلة بدقة. يلزم 70% على الأقل لكسب +${currentLesson.pointsReward} XP.` 
                      : `Answer all questions correctly. Minimum 70% required to claim +${currentLesson.pointsReward} XP.`
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
                              if (optIndex === q.correctAnswer) {
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

            {/* Practical Coding Exercise / Online Compiler */}
            {currentLesson.exercisePrompt && (
              <div className="pt-2">
                <CodeExerciseRunner
                  exerciseTitle={isArabic ? `التحدي البرمجي: ${currentLesson.title}` : `Practical Challenge: ${currentLesson.title}`}
                  exercisePrompt={currentLesson.exercisePrompt}
                  starterCode={currentLesson.exerciseStarterCode || '# Write your solution here\n'}
                  testCases={currentLesson.exerciseTestCases || [{ description: isArabic ? 'فحص التنفيذ' : 'Execution check', expectedOutput: '' }]}
                  pointsReward={currentLesson.pointsReward}
                  onSuccess={() => {
                    handleCompleteCurrentLesson();
                  }}
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
                  disabled={completing || isCompleted}
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
