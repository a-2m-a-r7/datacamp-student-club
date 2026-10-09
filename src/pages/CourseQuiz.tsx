import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePoints } from '../contexts/PointsContext';
import { useLanguage } from '../contexts/LanguageContext';
import { courseService } from '../services/courseService';
import { Course, CourseLesson, QuizQuestion } from '../types';
import { QuizEngine } from '../components/QuizEngine';
import { ArrowLeft } from 'lucide-react';

export const CourseQuiz = () => {
  const { slug, lessonId } = useParams<{ slug: string; lessonId?: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { grantPoints } = usePoints();
  const { isArabic } = useLanguage();

  const [course, setCourse] = useState<Course | null>(null);
  const [lesson, setLesson] = useState<CourseLesson | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadQuiz() {
      if (!slug) return;
      setLoading(true);
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
          // Fallback assessment questions (English & Arabic)
          const fallbackQuestionsEn: QuizQuestion[] = [
            {
              id: 'q1',
              question: 'Which Python library is primarily utilized for dataframe manipulation and structured data analysis?',
              options: ['NumPy', 'Pandas', 'Matplotlib', 'Requests'],
              correctIndex: 1,
              explanation: 'Pandas provides high-performance data structures like DataFrames specifically for tabular manipulation.',
            },
            {
              id: 'q2',
              question: 'In supervised machine learning, what do features represent?',
              options: ['The target label to predict', 'The input variables or attributes used for training', 'The loss function', 'The hardware processor units'],
              correctIndex: 1,
              explanation: 'Features are the individual measurable properties or characteristics used as input to models.',
            },
            {
              id: 'q3',
              question: 'What is the primary difference between a Series and a DataFrame in Pandas?',
              options: ['A Series is 2-dimensional; a DataFrame is 3-dimensional', 'A Series is 1-dimensional; a DataFrame is a 2-dimensional table', 'There is no difference', 'Series only holds text while DataFrame only holds numbers'],
              correctIndex: 1,
              explanation: 'A Series represents a 1D labeled array (single column), while a DataFrame represents a 2D labeled spreadsheet.',
            },
            {
              id: 'q4',
              question: 'What SQL clause is used to filter records based on aggregated group calculations?',
              options: ['WHERE', 'HAVING', 'GROUP BY', 'FILTER'],
              correctIndex: 1,
              explanation: 'HAVING filters aggregated groups (e.g. HAVING COUNT(*) > 5), whereas WHERE filters individual rows prior to grouping.',
            },
          ];

          const fallbackQuestionsAr: QuizQuestion[] = [
            {
              id: 'q1',
              question: 'ما هي مكتبة بايثون الأساسية المستخدمة في معالجة وهندسة الجداول ومجموعات البيانات الهيكلية؟',
              options: ['NumPy', 'Pandas', 'Matplotlib', 'Requests'],
              correctIndex: 1,
              explanation: 'توفر Pandas هياكل بيانات فائقة الأداء مثل DataFrames لمعالجة وتحليل البيانات الجدولية.',
            },
            {
              id: 'q2',
              question: 'في تعلم الآلة الخاضع للإشراف (Supervised Learning)، ماذا تمثل السمات أو الخصائص (Features)؟',
              options: ['الهدف أو المخرج المراد التنبؤ به', 'متغيرات أو مدخلات التدريب المستخدمة للتنبؤ', 'دالة الخسارة الرياضية', 'معالجات العتاد الصلب'],
              correctIndex: 1,
              explanation: 'السمات (Features) هي الخصائص أو المتغيرات القابلة للقياس والتي تُمرر كمدخلات للنموذج.',
            },
            {
              id: 'q3',
              question: 'ما هو الفرق الأساسي بين كائن Series وكائن DataFrame في مكتبة Pandas؟',
              options: ['Series ثنائي الأبعاد و DataFrame ثلاثي الأبعاد', 'Series هيكل أحادي البعد (عمود واحد) بينما DataFrame جدول ثنائي الأبعاد', 'لا يوجد أي فرق بينهما', 'Series للنصوص فقط و DataFrame للأرقام فقط'],
              correctIndex: 1,
              explanation: 'يمثل Series مصفوفة أحادية البعد معنونة، بينما يمثل DataFrame جدولاً ثنائي الأبعاد يضم صفوفاً وأعمدة.',
            },
            {
              id: 'q4',
              question: 'ما هي جملة SQL المستخدمة لتصفية السجلات بناءً على نتائج الدوال التجميعية (Aggregated Calculations)؟',
              options: ['WHERE', 'HAVING', 'GROUP BY', 'FILTER'],
              correctIndex: 1,
              explanation: 'تُستخدم HAVING لتصفية المجموعات بعد التجميع (مثل HAVING COUNT(*) > 5)، بينما WHERE تصفي الصفوف الفردية قبل التجميع.',
            },
          ];

          setQuestions(isArabic ? fallbackQuestionsAr : fallbackQuestionsEn);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadQuiz();
  }, [slug, lessonId, navigate, isArabic]);

  const handleQuizComplete = async (scorePct: number, passed: boolean) => {
    if (!profile || !course || !course.id) return;

    if (passed) {
      if (scorePct === 100) {
        await grantPoints('QUIZ_PERFECT', isArabic ? `درجة كاملة 100% في اختبار ${course.title}!` : `Perfect 100% on ${course.title} Quiz Assessment!`, { referenceId: course.id, referenceType: 'quiz' });
      } else {
        await grantPoints('QUIZ_PASS', isArabic ? `اجتياز اختبار ${course.title} بنسبة (${scorePct}%)` : `Passed assessment on ${course.title} (${scorePct}%)`, { referenceId: course.id, referenceType: 'quiz' });
      }

      if (lesson?.id) {
        await courseService.completeLesson(profile.uid, course.id, lesson.id, 30, course.totalLessons);
      }
    }
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
        <QuizEngine
          quizTitle={lesson?.title ? `${lesson.title} — ${isArabic ? 'اختبار' : 'Quiz'}` : `${course?.title} — ${isArabic ? 'تقييم شامل' : 'Assessment'}`}
          questions={questions}
          passingScore={80}
          pointsRewardPass={30}
          pointsRewardPerfect={50}
          onComplete={handleQuizComplete}
        />
      </div>
    </div>
  );
};

export default CourseQuiz;
