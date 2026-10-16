/**
 * src/pages/PublicFormView.tsx
 * Public Form Respondent Page at /f/:slug
 * Mobile-first, accessible, theme-styled, multi-section progress, honeypot protection,
 * client & server validation, and custom thank-you screen.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import {
  CheckCircle2, AlertCircle, Clock, Lock, ArrowRight,
  ArrowLeft, Upload, Star, Heart, Check, Circle,
  Sparkles, Loader2, Globe, Shield, RefreshCw, Send,
  FileText, LogIn
} from 'lucide-react';
import { toast } from 'sonner';
import { FormRecord, FormQuestion, ChoiceOption } from '../types/forms';
import { formService } from '../services/formService';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import Logo from '../components/Logo';

export const PublicFormView: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const { user, loginWithGoogle } = useAuth();
  const { isArabic } = useLanguage();

  const [form, setForm] = useState<FormRecord | null>(null);
  const [questions, setQuestions] = useState<FormQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState<'not_found' | 'draft' | 'closed' | 'not_open' | 'already_responded' | null>(null);

  // Respondent answers state: question_id -> value
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [respondentEmail, setRespondentEmail] = useState('');
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

  // Honeypot spam trap
  const [honeypot, setHoneypot] = useState('');

  // Submitting state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [successPayload, setSuccessPayload] = useState<{ referenceId?: string; message?: string }>({});

  // File upload progress tracking: question_id -> boolean
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({});

  // 1. Fetch form data and evaluate availability
  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setErrorState(null);

    formService
      .getFormBySlug(slug)
      .then(async (res) => {
        if (!res) {
          setErrorState('not_found');
          return;
        }

        const { form: formData, questions: qData } = res;
        setForm(formData);
        setQuestions(qData);

        const now = new Date();

        // Check Draft
        if (formData.status === 'draft') {
          setErrorState('draft');
          return;
        }

        // Check Closed
        if (formData.status === 'closed') {
          setErrorState('closed');
          return;
        }

        // Check Opens At schedule
        if (formData.opens_at && new Date(formData.opens_at) > now) {
          setErrorState('not_open');
          return;
        }

        // Check Closes At schedule
        if (formData.closes_at && new Date(formData.closes_at) < now) {
          setErrorState('closed');
          return;
        }

        // Check if user already responded (if one response per user is active)
        if (formData.one_response_per_user && user?.email) {
          const alreadySubmitted = await formService.checkHasUserResponded(formData.id, user.email);
          if (alreadySubmitted) {
            setErrorState('already_responded');
            return;
          }
        }
      })
      .catch((err) => {
        console.error('Error loading public form:', err);
        setErrorState('not_found');
      })
      .finally(() => setLoading(false));
  }, [slug, user]);

  // Pre-fill respondent email if logged in
  useEffect(() => {
    if (user?.email && !respondentEmail) {
      setRespondentEmail(user.email);
    }
  }, [user, respondentEmail]);

  // Divide questions into sections (by section_header)
  const sections = useMemo(() => {
    const list: { title: string; description?: string; questions: FormQuestion[] }[] = [];
    let currentSec: { title: string; description?: string; questions: FormQuestion[] } = {
      title: form?.title || '',
      description: form?.description || '',
      questions: [],
    };

    questions.forEach((q) => {
      if (q.type === 'section_header') {
        if (currentSec.questions.length > 0 || list.length === 0) {
          list.push(currentSec);
        }
        currentSec = {
          title: q.title,
          description: q.description,
          questions: [],
        };
      } else {
        currentSec.questions.push(q);
      }
    });

    list.push(currentSec);
    return list;
  }, [questions, form]);

  const visibleQuestionIds = useMemo(() => {
    const orderedQuestions = questions.filter((q) => q.type !== 'section_header')
      .sort((a,b) => a.position-b.position || a.id.localeCompare(b.id));
    const visible = new Set<string>();
    let index = 0;
    while (index < orderedQuestions.length) {
      const q = orderedQuestions[index];
      visible.add(q.id);
      const answer = answers[q.id];
      const option = (q.type === 'single_choice' || q.type === 'dropdown')
        ? (q.options || []).find((candidate) => candidate.id === answer || candidate.text === answer)
        : undefined;
      if (option?.goToQuestionId === 'end') break;
      const targetIndex = orderedQuestions.findIndex((candidate) => candidate.id === option?.goToQuestionId);
      index = targetIndex > index ? targetIndex : index+1;
    }
    return visible;
  }, [answers, questions]);

  const activeSection = sections[currentSectionIndex] || sections[0];
  const activeQuestions = activeSection?.questions.filter((q) => visibleQuestionIds.has(q.id)) || [];
  const isLastSection = currentSectionIndex === sections.length - 1;

  // Answer change handlers
  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleMultipleChoiceToggle = (questionId: string, optionText: string) => {
    const current = (answers[questionId] as string[]) || [];
    if (current.includes(optionText)) {
      setAnswers((prev) => ({
        ...prev,
        [questionId]: current.filter((item) => item !== optionText),
      }));
    } else {
      setAnswers((prev) => ({
        ...prev,
        [questionId]: [...current, optionText],
      }));
    }
  };

  const handleRankingDrop = (questionId: string, sourceId: string, targetId: string) => {
    if (sourceId === targetId) return;
    const current = (answers[questionId] as string[]) || [];
    const next = current.length > 0 ? [...current] : (questions.find((q) => q.id === questionId)?.options || []).map((option) => option.id);
    const sourceIndex = next.indexOf(sourceId);
    const targetIndex = next.indexOf(targetId);
    if (sourceIndex < 0 || targetIndex < 0) return;
    next.splice(sourceIndex, 1);
    next.splice(targetIndex, 0, sourceId);
    handleAnswerChange(questionId, next);
  };

  // File upload handler
  const handleFileUpload = async (questionId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !form) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error(isArabic ? 'حجم الملف يتجاوز الحد الأقصى (10MB)' : 'File size exceeds maximum 10MB limit');
      return;
    }

    setUploadingFiles((prev) => ({ ...prev, [questionId]: true }));
    try {
      const uploaded = await formService.uploadAttachment(form.id, file);
      handleAnswerChange(questionId, uploaded);
      toast.success(isArabic ? 'تم رفع الملف بنجاح' : 'File uploaded successfully');
    } catch (err: any) {
      toast.error(err.message || 'File upload failed');
    } finally {
      setUploadingFiles((prev) => ({ ...prev, [questionId]: false }));
    }
  };

  // Section Validation: check required questions in current section
  const validateCurrentSection = (): boolean => {
    if (!activeSection) return true;

    for (const q of activeQuestions) {
      if (q.required) {
        const val = answers[q.id];
        if (
          val === undefined ||
          val === null ||
          val === '' ||
          (Array.isArray(val) && val.length === 0)
        ) {
          toast.error(
            isArabic
              ? `السؤال "${q.title}" إلزامي للمتابعة`
              : `"${q.title}" is required to proceed`
          );
          return false;
        }
      }
    }

    // If collect_email is required and on last section
    if (form?.collect_email && isLastSection) {
      if (!respondentEmail || !respondentEmail.includes('@')) {
        toast.error(isArabic ? 'يرجى إدخال بريد إلكتروني صحيح' : 'Please provide a valid email address');
        return false;
      }
    }

    return true;
  };

  const handleNextSection = () => {
    if (validateCurrentSection()) {
      setCurrentSectionIndex((prev) => Math.min(prev + 1, sections.length - 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevSection = () => {
    setCurrentSectionIndex((prev) => Math.max(prev - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;

    // Honeypot bot check
    if (honeypot) {
      console.warn('Bot submission trapped via honeypot.');
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        setSubmissionSuccess(true);
      }, 1000);
      return;
    }

    if (!validateCurrentSection()) return;

    // Check login requirement
    if (!form.allow_anonymous && !user) {
      toast.error(isArabic ? 'يجب تسجيل الدخول لإرسال هذا النموذج' : 'Sign in is required to submit this form');
      return;
    }

    setIsSubmitting(true);
    try {
      // Format answers payload
      const formattedAnswers = Object.entries(answers)
        .filter(([qId]) => visibleQuestionIds.has(qId))
        .map(([qId, val]) => ({
        question_id: qId,
        value: val,
        }));

      const metadata = {
        browser: navigator.userAgent,
        submittedVia: 'web',
      };

      const result = await formService.submitResponse(
        form.id,
        formattedAnswers,
        respondentEmail || user?.email || undefined,
        metadata
      );

      setSuccessPayload({
        referenceId: result.response_id,
        message: result.success_message || form.success_message,
      });

      setSubmissionSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      toast.error(err.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================================
  // LOADING STATE
  // ==========================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-dark-navy flex flex-col items-center justify-center p-6 text-center space-y-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-sm font-cyber text-primary tracking-widest animate-pulse">
          {isArabic ? 'جاري فتح النموذج...' : 'LOADING_SECURE_FORM...'}
        </p>
      </div>
    );
  }

  // ==========================================================
  // SPECIAL ERROR & NOTICE STATES
  // ==========================================================
  if (errorState) {
    return (
      <div className="min-h-screen bg-dark-navy flex flex-col items-center justify-center p-6 text-center">
        <div className="w-full max-w-md bg-card/80 border border-white/10 rounded-3xl p-8 glass shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-300">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-primary">
            {errorState === 'draft' ? (
              <Clock className="w-8 h-8 text-amber-400" />
            ) : errorState === 'closed' ? (
              <Lock className="w-8 h-8 text-rose-400" />
            ) : errorState === 'already_responded' ? (
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            ) : (
              <AlertCircle className="w-8 h-8 text-muted-foreground" />
            )}
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold font-cyber text-foreground">
              {errorState === 'draft'
                ? isArabic
                  ? 'النموذج قيد الإعداد'
                  : 'Form In Preparation'
                : errorState === 'closed'
                ? isArabic
                  ? 'النموذج مغلق حالياً'
                  : 'Form Is Closed'
                : errorState === 'not_open'
                ? isArabic
                  ? 'النموذج لم يبدأ بعد'
                  : 'Form Not Yet Open'
                : errorState === 'already_responded'
                ? isArabic
                  ? 'لقد قمت بإرسال ردك مسبقاً'
                  : 'Response Already Recorded'
                : isArabic
                ? 'النموذج غير موجود'
                : 'Form Not Found'}
            </h2>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {errorState === 'draft'
                ? isArabic
                  ? 'يقوم المنظم حالياً بإعداد هذا النموذج وسيتم نشره قريباً.'
                  : 'This form is currently being drafted by the organizers and is not yet accepting responses.'
                : errorState === 'closed'
                ? isArabic
                  ? 'انتهت فترة استقبال الردود على هذا النموذج. شكراً لاهتمامك.'
                  : 'This form has closed and is no longer accepting submissions.'
                : errorState === 'already_responded'
                ? isArabic
                  ? 'شكراً لك! يسمح هذا الاستبيان برد واحد فقط لكل مستخدم وقد تم تسجيل مشاركتك بنجاح.'
                  : 'You have already submitted a response to this form. One submission allowed per user.'
                : isArabic
                ? 'الرابط المطلوب غير متطابق مع أي نموذج نشط في نادي DataCamp.'
                : 'The requested form URL does not exist or has been archived.'}
            </p>
          </div>

          <Link
            to="/"
            className="inline-block px-6 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
          >
            {isArabic ? 'العودة للصفحة الرئيسية' : 'Return to Club Home'}
          </Link>
        </div>
      </div>
    );
  }

  // ==========================================================
  // LOGIN REQUIRED STATE (for forms with allow_anonymous = false)
  // ==========================================================
  if (form && !form.allow_anonymous && !user) {
    return (
      <div className="min-h-screen bg-dark-navy flex flex-col items-center justify-center p-6 text-center">
        <div className="w-full max-w-md bg-card/80 border border-white/10 rounded-3xl p-8 glass shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold font-cyber text-foreground">
              {isArabic ? 'تسجيل الدخول مطلوب' : 'Authentication Required'}
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {isArabic
                ? `هذا النموذج (${form.title}) مخصص لأعضاء نادي DataCamp فقط. يرجى تسجيل الدخول بحسابك للمتابعة.`
                : `This form is restricted to verified DataCamp Club members. Please sign in to submit your response.`}
            </p>
          </div>

          <button
            onClick={() => loginWithGoogle(location.pathname)}
            className="w-full py-3 px-4 rounded-xl bg-white text-gray-900 font-bold text-xs flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors shadow-lg"
          >
            <LogIn className="w-4 h-4 text-primary" />
            <span>{isArabic ? 'تسجيل الدخول بواسطة Google' : 'Sign in with Google'}</span>
          </button>
        </div>
      </div>
    );
  }

  // ==========================================================
  // SUBMISSION SUCCESS / THANK YOU STATE
  // ==========================================================
  if (submissionSuccess && form) {
    return (
      <div className="min-h-screen bg-dark-navy flex flex-col items-center justify-center p-6 text-center">
        <div className="w-full max-w-lg bg-card/90 border border-white/10 rounded-3xl p-8 md:p-10 glass shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center mx-auto text-emerald-400 shadow-xl shadow-emerald-500/10">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-bold font-cyber text-foreground">
              {isArabic ? 'تم إرسال استجابتك بنجاح!' : 'Response Submitted Successfully!'}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {successPayload.message || form.success_message}
            </p>
          </div>

          {successPayload.referenceId && (
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 font-mono text-[11px] text-muted-foreground flex items-center justify-between">
              <span>{isArabic ? 'الرقم المرجعي للاستجابة:' : 'Reference ID:'}</span>
              <span className="text-primary font-bold">{successPayload.referenceId.slice(0, 8)}...</span>
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
            >
              {isArabic ? 'زيارة نادي DataCamp' : 'Visit Club Portal'}
            </Link>

            {form.allow_anonymous && !form.one_response_per_user && (
              <button
                type="button"
                onClick={() => {
                  setAnswers({});
                  setSubmissionSuccess(false);
                  setCurrentSectionIndex(0);
                }}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-foreground text-xs font-semibold border border-white/10 transition-colors"
              >
                {isArabic ? 'إرسال رد آخر' : 'Submit Another Response'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!form) return null;

  // Calculate Progress percentage
  const progressPercent = Math.round(((currentSectionIndex + 1) / sections.length) * 100);

  return (
    <div className="min-h-screen bg-dark-navy text-foreground py-6 md:py-12 px-4 relative overflow-x-hidden">
      {/* Background Accent Gradient based on form theme */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 opacity-15 pointer-events-none blur-3xl rounded-full"
        style={{
          background: `radial-gradient(circle, ${form.theme?.primaryColor || '#6366f1'} 0%, transparent 70%)`,
        }}
      />

      <div className="max-w-2xl mx-auto space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="flex items-center justify-between pb-2">
          <Link to="/" className="inline-block hover:opacity-80 transition-opacity">
            <Logo iconSize={32} />
          </Link>
          {user && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="truncate max-w-[160px]">{user.email}</span>
            </div>
          )}
        </div>

        {/* Form Main Container */}
        <div className="rounded-3xl border border-white/10 bg-card/80 backdrop-blur-xl shadow-2xl glass overflow-hidden">
          {/* Theme Color Bar at Top */}
          <div
            className="h-2.5 w-full"
            style={{
              background: `linear-gradient(90deg, ${form.theme?.primaryColor || '#6366f1'}, ${
                form.theme?.accentColor || '#06b6d4'
              })`,
            }}
          />

          {/* Form Header Info */}
          <div className="p-6 md:p-8 border-b border-white/5 space-y-3">
            <h1 className="text-2xl md:text-3xl font-black font-cyber text-foreground">
              {activeSection.title || form.title}
            </h1>
            {(activeSection.description || form.description) && (
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {activeSection.description || form.description}
              </p>
            )}

            {/* Multi-Section Progress Bar */}
            {sections.length > 1 && (
              <div className="pt-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
                  <span>
                    {isArabic
                      ? `القسم ${currentSectionIndex + 1} من ${sections.length}`
                      : `Section ${currentSectionIndex + 1} of ${sections.length}`}
                  </span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Form Questions Form */}
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
            {/* Honeypot hidden input */}
            <input
              type="text"
              name="club_hp_field"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              className="opacity-0 absolute -left-[9999px] pointer-events-none"
            />

            {/* Questions list for active section */}
            <div className="space-y-6">
              {activeQuestions.map((q, qIndex) => {
                const currentVal = answers[q.id];
                const rankingAnswer = q.type === 'ranking' && Array.isArray(currentVal)
                  ? currentVal
                  : [];
                const rankingOptions = rankingAnswer.length
                  ? rankingAnswer
                      .map((optionId) => (q.options || []).find((option) => option.id === optionId))
                      .filter((option): option is ChoiceOption => Boolean(option))
                  : q.options || [];

                return (
                  <div
                    key={q.id}
                    className="p-5 md:p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all space-y-3"
                  >
                    {/* Question Header */}
                    <div className="space-y-1">
                      <label className="text-sm md:text-base font-bold text-foreground block">
                        <span>{q.title}</span>
                        {q.required && <span className="text-rose-400 ml-1 rtl:mr-1">*</span>}
                      </label>
                      {q.description && (
                        <p className="text-xs text-muted-foreground">{q.description}</p>
                      )}
                    </div>

                    {/* Inputs by Question Type */}
                    <div className="pt-1">
                      {/* 1. Short Text */}
                      {q.type === 'short_text' && (
                        <input
                          type="text"
                          value={currentVal || ''}
                          onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                          placeholder={q.settings?.placeholder || (isArabic ? 'إجابتك...' : 'Your answer...')}
                          className="w-full bg-white/5 border border-white/10 focus:border-primary rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none transition-colors"
                        />
                      )}

                      {/* 2. Long Text */}
                      {q.type === 'long_text' && (
                        <textarea
                          rows={3}
                          value={currentVal || ''}
                          onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                          placeholder={q.settings?.placeholder || (isArabic ? 'اكتب إجابتك بالتفصيل هنا...' : 'Enter your detailed answer here...')}
                          className="w-full bg-white/5 border border-white/10 focus:border-primary rounded-xl p-4 text-sm text-foreground focus:outline-none transition-colors resize-none"
                        />
                      )}

                      {/* 3. Single Choice (Radio) */}
                      {q.type === 'single_choice' && (
                        <div className="space-y-2">
                          {(q.options || []).map((opt) => {
                            const isChecked = currentVal === opt.id;
                            return (
                              <label
                                key={opt.id}
                                className={`flex items-center space-x-3 rtl:space-x-reverse p-3.5 rounded-xl border cursor-pointer transition-all focus-within:ring-2 focus-within:ring-primary ${
                                  isChecked
                                    ? 'border-primary bg-primary/10 shadow-md shadow-primary/10'
                                    : 'border-white/5 bg-white/5 hover:border-white/20 hover:bg-white/10'
                                }`}
                              >
                                <input type="radio" name={`question-${q.id}`} value={opt.id}
                                  checked={isChecked} onChange={() => handleAnswerChange(q.id, opt.id)}
                                  className="sr-only" />
                                <div
                                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                                    isChecked
                                      ? 'border-primary bg-primary text-white'
                                      : 'border-white/30 bg-transparent'
                                  }`}
                                >
                                  {isChecked && <div className="w-2 h-2 rounded-full bg-white" />}
                                </div>
                                <span className="text-sm font-medium text-foreground">{opt.text}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}

                      {/* 4. Multiple Choice (Checkboxes) */}
                      {q.type === 'multiple_choice' && (
                        <div className="space-y-2">
                          {(q.options || []).map((opt) => {
                            const isChecked = ((currentVal as string[]) || []).includes(opt.id);
                            return (
                              <label
                                key={opt.id}
                                className={`flex items-center space-x-3 rtl:space-x-reverse p-3.5 rounded-xl border cursor-pointer transition-all focus-within:ring-2 focus-within:ring-primary ${
                                  isChecked
                                    ? 'border-primary bg-primary/10 shadow-md shadow-primary/10'
                                    : 'border-white/5 bg-white/5 hover:border-white/20 hover:bg-white/10'
                                }`}
                              >
                                <input type="checkbox" name={`question-${q.id}`} value={opt.id}
                                  checked={isChecked} onChange={() => handleMultipleChoiceToggle(q.id, opt.id)}
                                  className="sr-only" />
                                <div
                                  className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                                    isChecked
                                      ? 'border-primary bg-primary text-white'
                                      : 'border-white/30 bg-transparent'
                                  }`}
                                >
                                  {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                </div>
                                <span className="text-sm font-medium text-foreground">{opt.text}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}

                      {/* 5. Dropdown */}
                      {q.type === 'dropdown' && (
                        <select
                          value={currentVal || ''}
                          onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                          className="w-full bg-card border border-white/10 focus:border-primary rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none transition-colors"
                        >
                          <option value="">{isArabic ? '-- اختر خياراً من القائمة --' : '-- Select an option --'}</option>
                          {(q.options || []).map((opt) => (
                            <option key={opt.id} value={opt.id} className="bg-dark-navy text-foreground">
                              {opt.text}
                            </option>
                          ))}
                        </select>
                      )}

                      {/* 6. Ranking */}
                      {q.type === 'ranking' && (
                        <div className="space-y-2">
                          {rankingOptions.map((opt) => (
                            <div
                              key={opt.id}
                              draggable
                              onDragOver={(event) => event.preventDefault()}
                              onDrop={(event) => {
                                event.preventDefault();
                                handleRankingDrop(q.id, event.dataTransfer.getData('text/plain'), opt.id);
                              }}
                              onDragStart={(event) => {
                                event.dataTransfer.setData('text/plain', opt.id);
                                event.dataTransfer.effectAllowed = 'move';
                              }}
                              className="p-3.5 rounded-xl border border-white/10 bg-white/5 cursor-grab active:cursor-grabbing text-sm font-medium text-foreground"
                            >
                              {opt.text}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* 7. Rating */}
                      {q.type === 'rating' && (
                        <div className="flex items-center gap-2 pt-1 text-amber-400">
                          {Array.from({ length: q.settings?.maxRating || 5 }).map((_, i) => {
                            const val = i + 1;
                            const isSelected = Number(currentVal) >= val;
                            return (
                              <button
                                key={i}
                                type="button"
                                aria-label={isArabic ? `تقييم ${val} من ${q.settings?.maxRating || 5}` : `Rate ${val} of ${q.settings?.maxRating || 5}`}
                                aria-pressed={Number(currentVal) === val}
                                onClick={() => handleAnswerChange(q.id, val)}
                                className="p-1 rounded-lg hover:scale-115 transition-transform"
                              >
                                {q.settings?.ratingIcon === 'heart' ? (
                                  <Heart
                                    className={`w-7 h-7 ${
                                      isSelected ? 'fill-rose-500 text-rose-500' : 'text-white/20'
                                    }`}
                                  />
                                ) : q.settings?.ratingIcon === 'number' ? (
                                  <span
                                    className={`w-8 h-8 rounded-xl border flex items-center justify-center text-sm font-bold transition-colors ${
                                      isSelected
                                        ? 'border-primary bg-primary text-white'
                                        : 'border-white/20 text-muted-foreground'
                                    }`}
                                  >
                                    {val}
                                  </span>
                                ) : (
                                  <Star
                                    className={`w-7 h-7 ${
                                      isSelected ? 'fill-amber-400 text-amber-400' : 'text-white/20'
                                    }`}
                                  />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* 7. Linear Scale (Likert) */}
                      {q.type === 'linear_scale' && (
                        <div className="space-y-3 pt-1">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{q.settings?.scaleMinLabel || '1'}</span>
                            <span>{q.settings?.scaleMaxLabel || '5'}</span>
                          </div>
                          <div className="flex items-center justify-between gap-1.5">
                            {[1, 2, 3, 4, 5].map((val) => {
                              const isSelected = Number(currentVal) === val;
                              return (
                                <button
                                  key={val}
                                  type="button"
                                  onClick={() => handleAnswerChange(q.id, val)}
                                  className={`flex-1 py-3 rounded-xl border text-xs font-bold transition-all ${
                                    isSelected
                                      ? 'border-primary bg-primary text-white shadow-md shadow-primary/20 scale-105'
                                      : 'border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground'
                                  }`}
                                >
                                  {val}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* 8. Date */}
                      {q.type === 'date' && (
                        <input
                          type="date"
                          value={currentVal || ''}
                          onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                          className="w-full max-w-xs bg-white/5 border border-white/10 focus:border-primary rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none transition-colors"
                        />
                      )}

                      {/* 9. Time */}
                      {q.type === 'time' && (
                        <input
                          type="time"
                          value={currentVal || ''}
                          onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                          className="w-full max-w-xs bg-white/5 border border-white/10 focus:border-primary rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none transition-colors"
                        />
                      )}

                      {/* 10. Number */}
                      {q.type === 'number' && (
                        <input
                          type="number"
                          value={currentVal || ''}
                          onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                          placeholder="42"
                          className="w-full max-w-xs bg-white/5 border border-white/10 focus:border-primary rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none transition-colors"
                        />
                      )}

                      {/* 11. Email */}
                      {q.type === 'email' && (
                        <input
                          type="email"
                          value={currentVal || ''}
                          onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                          placeholder="name@example.com"
                          className="w-full bg-white/5 border border-white/10 focus:border-primary rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none transition-colors"
                        />
                      )}

                      {/* 12. File Upload */}
                      {q.type === 'file_upload' && (
                        <div className="space-y-2">
                          <label className="border-2 border-dashed border-white/20 hover:border-primary/50 bg-white/5 rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer transition-colors group">
                            <Upload className="w-7 h-7 text-primary mb-2 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-semibold text-foreground">
                              {uploadingFiles[q.id]
                                ? (isArabic ? 'جاري الرفع إلى سحابة Supabase...' : 'Uploading...')
                                : isArabic
                                ? 'انقر لاختيار ملف للرفع (حد أقصى 10MB)'
                                : 'Click to select attachment (Max 10MB)'}
                            </span>
                            <input
                              type="file"
                              disabled={uploadingFiles[q.id]}
                              onChange={(e) => handleFileUpload(q.id, e)}
                              className="hidden"
                            />
                          </label>

                          {currentVal?.url && (
                            <div className="flex items-center justify-between p-3 rounded-xl bg-primary/10 border border-primary/20 text-xs text-primary">
                              <span className="truncate max-w-xs">{currentVal.name || 'Attachment uploaded'}</span>
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Respondent Email input if form collects email */}
            {form.collect_email && isLastSection && (
              <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20 space-y-2">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <span>{isArabic ? 'البريد الإلكتروني للمشارك' : 'Respondent Email Address'}</span>
                  <span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={respondentEmail}
                  onChange={(e) => setRespondentEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-white/5 border border-white/10 focus:border-primary rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none transition-colors"
                />
              </div>
            )}

            {/* Navigation and Submit Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-white/5 gap-3">
              {currentSectionIndex > 0 ? (
                <button
                  type="button"
                  onClick={handlePrevSection}
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-foreground text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
                  <span>{isArabic ? 'السابق' : 'Previous'}</span>
                </button>
              ) : <div />}

              {!isLastSection ? (
                <button
                  type="button"
                  onClick={handleNextSection}
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-primary/25 transition-all"
                >
                  <span>{isArabic ? 'التالي' : 'Next'}</span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-7 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-bold flex items-center gap-2 shadow-xl shadow-primary/30 transition-all hover:scale-102 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>{isArabic ? 'إرسال الاستجابة' : 'Submit Form'}</span>
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Footer Note */}
        <p className="text-center text-[11px] text-muted-foreground/60">
          Powered by DataCamp Student Club • Secured with Supabase RLS
        </p>
      </div>
    </div>
  );
};

export default PublicFormView;
