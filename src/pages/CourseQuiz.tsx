import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePoints } from '../contexts/PointsContext';
import { useLanguage } from '../contexts/LanguageContext';
import { courseService } from '../services/courseService';
import { Course, CourseLesson, QuizQuestion } from '../types';
import { QuizEngine } from '../components/QuizEngine';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const CourseQuiz = () => {
  const { slug, lessonId } = useParams<{ slug: string; lessonId?: string }>();
  const navigate = useNavigate();
  const { profile, isAdmin, refreshProfile } = useAuth();
  const { grantPoints } = usePoints();
  const { isArabic } = useLanguage();

  const [course, setCourse] = useState<Course | null>(null);
  const [lesson, setLesson] = useState<CourseLesson | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [certificateId, setCertificateId] = useState<string | null>(null);

  useEffect(() => {
    async function loadQuiz() {
      if (!slug) return;
      setLoading(true);
      setCertificateId(null);
      try {
        const c = await courseService.getCourseBySlug(slug);
        if (!c || !c.id) {
          navigate('/courses');
          return;
        }
        setCourse(c);

        const allLessons = await courseService.getCourseLessons(c.id);
        let foundLesson: CourseLesson | null = null;

        if (lessonId) {
          foundLesson = allLessons.find(l => l.id === lessonId) || null;
        } else {
          foundLesson = allLessons.find(l => l.type === 'quiz' || (l.quizQuestions && l.quizQuestions.length > 0)) || null;
        }

        if (foundLesson && foundLesson.quizQuestions && foundLesson.quizQuestions.length > 0) {
          setLesson(foundLesson);
          setQuestions(foundLesson.quizQuestions);
        } else {
          setLesson(null);
          setQuestions([]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadQuiz();
  // Switching UI language must preserve the mounted quiz and selected answers.
  }, [slug, lessonId, navigate]);

  const handleQuizComplete = async (scorePct: number, passed: boolean, answers: Record<number, number>) => {
 if (!profile || !course?.id || !lesson?.id) throw new Error('Assessment unavailable');
 const payload = Object.fromEntries(questions.map((question, index) => [question.id, answers[index]]).filter(([, answer]) => answer !== undefined));
 const saved = await courseService.submitQuiz(lesson.id, payload as Record<string, number>);
 if (saved.scorePercentage !== scorePct || saved.passed !== passed) throw new Error('Assessment changed. Reload and retry.');
 if (saved.progress?.isCourseFinished) setCertificateId(saved.progress.enrollment.certificate_id);
 await refreshProfile().catch(() => {});
 return Number(saved.progress?.pointsAwarded || 0);
};

  if (loading) {
    return (
      <div className="min-h-screen bg-cyber-black text-foreground pt-28 text-center font-cyber animate-pulse">
        {isArabic ? 'جاري تحميل مصفوفة التقييم والاختبار...' : 'LOADING ASSESSMENT MATRIX...'}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cyber-black text-foreground pt-20 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between">
          <Link
            to={slug ? `/courses/${slug}/learn` : '/courses'}
            className="text-xs font-cyber text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className={`w-3.5 h-3.5 ${isArabic ? 'rotate-180' : ''}`} />
            {isArabic ? 'العودة لبيئة الدورة التعليمية' : 'BACK TO COURSE WORKSPACE'}
          </Link>
          <div className="text-xs font-mono text-muted-foreground">
            {course?.title}
          </div>
        </div>

        {/* Interactive Quiz Engine */}
        {certificateId && <div role="status" className="rounded-xl border border-primary/40 p-4 space-y-3">
          <p>{isArabic ? 'أتممت الكورس وتم إصدار شهادتك تلقائيًا.' : 'Course completed. Your certificate was issued automatically.'}</p>
          <Link to={`/certificates?course=${course?.id}`}><Button>{isArabic ? 'عرض الشهادة' : 'VIEW CERTIFICATE'}</Button></Link>
        </div>}
        <QuizEngine
          previewOnly={isAdmin && course?.status === 'draft'}
          quizTitle={lesson?.title ? `${lesson.title} — ${isArabic ? 'اختبار' : 'Quiz'}` : `${course?.title} — ${isArabic ? 'تقييم شامل' : 'Assessment'}`}
          questions={questions}
          passingScore={80}
          onComplete={handleQuizComplete}
        />
      </div>
    </div>
  );
};

export default CourseQuiz;
