/**
 * src/pages/admin/forms/FormBuilder.tsx
 * Full-featured Form Builder inspired by Microsoft Forms
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Settings, Palette, Eye, Share2, 
  Save, Check, AlertCircle, Smartphone, Monitor, 
  Send, Sparkles, Loader2, Globe, FileSpreadsheet, Lock
} from 'lucide-react';
import { toast } from 'sonner';
import { FormRecord, FormQuestion, QuestionType, FormTheme } from '../../../types/forms';
import { formService } from '../../../services/formService';
import { useLanguage } from '../../../contexts/LanguageContext';
import { QuestionCard } from './QuestionCard';
import { QuestionTypePicker } from './QuestionTypePicker';
import { FormThemePicker } from './FormThemePicker';
import { FormSettingsModal } from './FormSettingsModal';
import { FormShareModal } from './FormShareModal';

export const FormBuilder: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isArabic } = useLanguage();

  const isNew = !id || id === 'new';

  const [form, setForm] = useState<FormRecord>({
    id: isNew ? '' : id,
    title: isArabic ? 'نموذج جديد بدون عنوان' : 'Untitled Form',
    description: '',
    slug: `form-${Date.now().toString(36)}`,
    status: 'draft',
    theme: {
      primaryColor: '#6366f1',
      accentColor: '#06b6d4',
      backgroundStyle: 'cyber',
      coverImage: null,
    },
    allow_anonymous: true,
    one_response_per_user: false,
    collect_email: false,
    opens_at: null,
    closes_at: null,
    success_message: isArabic
      ? 'شكراً لك! تم تسجيل ردك بنجاح.'
      : 'Thank you! Your response has been recorded.',
    sheets_sync_enabled: true,
    spreadsheet_id: null,
    spreadsheet_url: null,
    created_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  const [questions, setQuestions] = useState<FormQuestion[]>([
    {
      id: `q-${Date.now()}-1`,
      form_id: '',
      type: 'short_text',
      title: isArabic ? 'الاسم بالكامل' : 'Full Name',
      description: '',
      required: true,
      position: 0,
      options: [],
      settings: { placeholder: isArabic ? 'اكتب اسمك هنا...' : 'Enter your name...' },
    },
    {
      id: `q-${Date.now()}-2`,
      form_id: '',
      type: 'email',
      title: isArabic ? 'البريد الإلكتروني' : 'Email Address',
      description: '',
      required: true,
      position: 1,
      options: [],
      settings: { placeholder: 'user@example.com' },
    },
  ]);

  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number>(0);
  const [loading, setLoading] = useState(!isNew);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'dirty'>('saved');
  const [previewMode, setPreviewMode] = useState<'off' | 'desktop' | 'mobile'>('off');

  // Modals
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Dirty state tracking for autosave debounce
  const isDirtyRef = useRef(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load existing form data if editing
  useEffect(() => {
    if (!isNew && id) {
      setLoading(true);
      formService
        .getFormById(id)
        .then((res) => {
          if (res) {
            setForm(res.form);
            if (res.questions.length > 0) {
              setQuestions(res.questions);
            }
          } else {
            toast.error(isArabic ? 'لم يتم العثور على النموذج' : 'Form not found');
            navigate('/admin/forms');
          }
        })
        .catch((err) => {
          console.error(err);
          toast.error('Failed to load form');
        })
        .finally(() => setLoading(false));
    }
  }, [id, isNew, navigate, isArabic]);

  // Autosave function
  const triggerAutoSave = useCallback(
    async (updatedForm: FormRecord, updatedQuestions: FormQuestion[]) => {
      setSaveStatus('saving');
      try {
        if (isNew && !updatedForm.id) {
          // Create new form record
          const created = await formService.createForm(updatedForm, updatedQuestions);
          setForm(created);
          isDirtyRef.current = false;
          setSaveStatus('saved');
          // Update URL silently without full reload
          window.history.replaceState(null, '', `/admin/forms/builder/${created.id}`);
        } else {
          // Update existing
          await formService.updateForm(updatedForm.id, updatedForm);
          await formService.saveFormQuestions(updatedForm.id, updatedQuestions);
          isDirtyRef.current = false;
          setSaveStatus('saved');
        }
      } catch (err) {
        console.error('Autosave error:', err);
        setSaveStatus('dirty');
      }
    },
    [isNew]
  );

  // Debounce autosave on form or questions change
  const scheduleSave = (newForm: FormRecord, newQuestions: FormQuestion[]) => {
    isDirtyRef.current = true;
    setSaveStatus('dirty');
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      triggerAutoSave(newForm, newQuestions);
    }, 1500);
  };

  // Warn on unsaved changes before leaving
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirtyRef.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Update question
  const handleUpdateQuestion = (updated: FormQuestion, index: number) => {
    const newQuestions = [...questions];
    newQuestions[index] = updated;
    setQuestions(newQuestions);
    scheduleSave(form, newQuestions);
  };

  // Add question
  const handleAddQuestion = (type: QuestionType) => {
    const defaultOptions =
      type === 'single_choice' || type === 'multiple_choice' || type === 'dropdown'
        ? [
            { id: `opt-${Date.now()}-1`, text: isArabic ? 'الخيار 1' : 'Option 1' },
            { id: `opt-${Date.now()}-2`, text: isArabic ? 'الخيار 2' : 'Option 2' },
          ]
        : [];

    const newQ: FormQuestion = {
      id: `q-${Date.now()}`,
      form_id: form.id,
      type,
      title: isArabic ? 'سؤال جديد' : 'New Question',
      description: '',
      required: false,
      position: questions.length,
      options: defaultOptions,
      settings: type === 'rating' ? { maxRating: 5, ratingIcon: 'star' } : {},
    };

    const newQuestions = [...questions, newQ];
    setQuestions(newQuestions);
    setSelectedQuestionIndex(newQuestions.length - 1);
    scheduleSave(form, newQuestions);
  };

  // Duplicate question
  const handleDuplicateQuestion = (index: number) => {
    const target = questions[index];
    const cloned: FormQuestion = {
      ...target,
      id: `q-${Date.now()}`,
      title: `${target.title} (${isArabic ? 'نسخة' : 'Copy'})`,
      options: (target.options || []).map((o) => ({ ...o, id: `opt-${Date.now()}-${Math.random()}` })),
      position: index + 1,
    };
    const newQuestions = [...questions];
    newQuestions.splice(index + 1, 0, cloned);
    setQuestions(newQuestions);
    setSelectedQuestionIndex(index + 1);
    scheduleSave(form, newQuestions);
  };

  // Delete question
  const handleDeleteQuestion = (index: number) => {
    if (questions.length <= 1) {
      toast.warning(isArabic ? 'يجب أن يحتوي النموذج على سؤال واحد على الأقل' : 'A form must contain at least one question');
      return;
    }
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
    setSelectedQuestionIndex(Math.max(0, index - 1));
    scheduleSave(form, newQuestions);
  };

  // Move up
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newQuestions = [...questions];
    const temp = newQuestions[index];
    newQuestions[index] = newQuestions[index - 1];
    newQuestions[index - 1] = temp;
    setQuestions(newQuestions);
    setSelectedQuestionIndex(index - 1);
    scheduleSave(form, newQuestions);
  };

  // Move down
  const handleMoveDown = (index: number) => {
    if (index === questions.length - 1) return;
    const newQuestions = [...questions];
    const temp = newQuestions[index];
    newQuestions[index] = newQuestions[index + 1];
    newQuestions[index + 1] = temp;
    setQuestions(newQuestions);
    setSelectedQuestionIndex(index + 1);
    scheduleSave(form, newQuestions);
  };

  // Form info changes
  const handleFormChange = (updates: Partial<FormRecord>) => {
    const newForm = { ...form, ...updates };
    setForm(newForm);
    scheduleSave(newForm, questions);
  };

  // Publish form
  const handlePublish = async () => {
    // Validation: Title must exist
    if (!form.title.trim()) {
      toast.error(isArabic ? 'يرجى كتابة عنوان للنموذج أولاً' : 'Please provide a form title before publishing');
      return;
    }

    // Validation: Questions cannot have empty titles
    const emptyQ = questions.find((q) => !q.title.trim() && q.type !== 'section_header');
    if (emptyQ) {
      toast.error(isArabic ? 'يرجى كتابة نصوص الأسئلة الفارغة قبل النشر' : 'Some questions have empty titles');
      return;
    }

    setSaveStatus('saving');
    try {
      const publishedForm: FormRecord = {
        ...form,
        status: 'published',
      };
      let saved: FormRecord = publishedForm;
      if (isNew && !form.id) {
        saved = await formService.createForm(publishedForm, questions);
      } else {
        saved = await formService.updateForm(form.id, publishedForm);
        await formService.saveFormQuestions(form.id, questions);
      }
      setForm(saved);
      setSaveStatus('saved');
      toast.success(isArabic ? 'تم نشر النموذج بنجاح!' : 'Form published successfully!');
      setShowShareModal(true);
    } catch (err: any) {
      toast.error(err.message || 'Publish failed');
      setSaveStatus('dirty');
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-xs text-muted-foreground font-mono">
          {isArabic ? 'جاري تحميل محرر النماذج...' : 'LOADING_FORM_BUILDER...'}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col -m-4 md:-m-8 bg-background relative">
      {/* ======================================================== */}
      {/* 1. TOP BUILDER TOOLBAR                                   */}
      {/* ======================================================== */}
      <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-md border-b border-white/10 px-4 md:px-8 py-3.5 flex items-center justify-between gap-4">
        <div className="flex items-center space-x-3 rtl:space-x-reverse min-w-0">
          <Link
            to="/admin/forms"
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors shrink-0"
            title={isArabic ? 'العودة لقائمة النماذج' : 'Back to Forms'}
          >
            <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
          </Link>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm md:text-base font-bold font-cyber text-foreground truncate max-w-xs md:max-w-md">
                {form.title || (isArabic ? 'نموذج جديد' : 'Untitled Form')}
              </h2>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full border shrink-0 ${
                  form.status === 'published'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}
              >
                {form.status === 'published'
                  ? isArabic
                    ? 'منشور'
                    : 'PUBLISHED'
                  : isArabic
                  ? 'مسودة'
                  : 'DRAFT'}
              </span>
            </div>

            {/* Autosave Status Indicator */}
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              {saveStatus === 'saving' ? (
                <>
                  <Loader2 className="w-3 h-3 text-primary animate-spin" />
                  <span>{isArabic ? 'جاري الحفظ التلقائي...' : 'Saving changes...'}</span>
                </>
              ) : saveStatus === 'saved' ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span>{isArabic ? 'تم الحفظ في سحابة Supabase' : 'Saved to Supabase'}</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span>{isArabic ? 'تغييرات غير محفوظة...' : 'Unsaved changes...'}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Toolbar Center / Right Action Buttons */}
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          {/* Preview Toggle (Desktop / Mobile / Off) */}
          <div className="hidden sm:flex items-center p-1 rounded-xl bg-white/5 border border-white/10 text-xs">
            <button
              onClick={() => setPreviewMode(previewMode === 'desktop' ? 'off' : 'desktop')}
              className={`p-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                previewMode === 'desktop' ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
              title={isArabic ? 'معاينة سطح المكتب' : 'Desktop Preview'}
            >
              <Monitor className="w-4 h-4" />
              <span className="hidden lg:inline">{isArabic ? 'معاينة شاشة' : 'Desktop'}</span>
            </button>
            <button
              onClick={() => setPreviewMode(previewMode === 'mobile' ? 'off' : 'mobile')}
              className={`p-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                previewMode === 'mobile' ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
              title={isArabic ? 'معاينة الهاتف المحمول' : 'Mobile Preview'}
            >
              <Smartphone className="w-4 h-4" />
              <span className="hidden lg:inline">{isArabic ? 'معاينة هاتف' : 'Mobile'}</span>
            </button>
          </div>

          {/* Theme Color Picker */}
          <button
            onClick={() => setShowThemePicker(true)}
            className="p-2.5 rounded-xl border border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
            title={isArabic ? 'تغيير المظهر والألوان' : 'Form Theme'}
          >
            <Palette className="w-4 h-4" />
          </button>

          {/* Settings Modal */}
          <button
            onClick={() => setShowSettingsModal(true)}
            className="p-2.5 rounded-xl border border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
            title={isArabic ? 'إعدادات الوصول والمزامنة' : 'Settings'}
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Responses Link */}
          {form.id && (
            <Link
              to={`/admin/forms/${form.id}/responses`}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>{isArabic ? 'الردود والتحليلات' : 'Responses'}</span>
            </Link>
          )}

          {/* Share Button (if already published) */}
          {form.status === 'published' && (
            <button
              onClick={() => setShowShareModal(true)}
              className="p-2.5 rounded-xl border border-white/10 text-primary hover:bg-primary/10 transition-colors"
              title={isArabic ? 'مشاركة الرابط والـ QR' : 'Share Form'}
            >
              <Share2 className="w-4 h-4" />
            </button>
          )}

          {/* Publish Action Button */}
          <button
            onClick={handlePublish}
            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-xs md:text-sm flex items-center gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-102"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{form.status === 'published' ? (isArabic ? 'تحديث النشر' : 'Update') : isArabic ? 'نشر النموذج' : 'Publish'}</span>
          </button>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 2. MAIN BUILDER BODY & CANVAS                            */}
      {/* ======================================================== */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8 space-y-6">
        {/* Banner Preview or Color Accent Top */}
        <div
          className="h-3 rounded-full shadow-lg"
          style={{
            background: `linear-gradient(90deg, ${form.theme?.primaryColor || '#6366f1'}, ${
              form.theme?.accentColor || '#06b6d4'
            })`,
          }}
        />

        {/* Form Title & Description Card */}
        <div className="bg-card/90 border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl glass relative overflow-hidden space-y-3">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Sparkles className="w-24 h-24 text-primary" />
          </div>

          <input
            type="text"
            value={form.title}
            onChange={(e) => handleFormChange({ title: e.target.value })}
            placeholder={isArabic ? 'عنوان النموذج أو الاستبيان...' : 'Form Title...'}
            className="w-full bg-transparent border-b border-white/10 focus:border-primary px-1 py-2 text-2xl md:text-3xl font-black font-cyber text-foreground focus:outline-none transition-colors"
          />

          <textarea
            rows={2}
            value={form.description}
            onChange={(e) => handleFormChange({ description: e.target.value })}
            placeholder={isArabic ? 'أدخل وصفاً توضيحياً للمشاركين عن أهداف هذا النموذج...' : 'Enter a description or instructions for respondents...'}
            className="w-full bg-transparent border-0 px-1 py-1 text-sm md:text-base text-muted-foreground focus:outline-none resize-none transition-colors"
          />

          {/* Quick Audience Indicator Badge */}
          <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/5">
              <Globe className="w-3.5 h-3.5 text-primary" />
              {form.allow_anonymous
                ? isArabic
                  ? 'متاح لأي شخص مع الرابط'
                  : 'Anyone with link'
                : isArabic
                ? 'أعضاء النادي فقط'
                : 'Members only'}
            </span>
            {form.one_response_per_user && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/5">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                {isArabic ? 'رد واحد لكل مستخدم' : '1 response limit'}
              </span>
            )}
            {form.sheets_sync_enabled && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <FileSpreadsheet className="w-3.5 h-3.5" />
                {isArabic ? 'مزامنة Sheets نشطة' : 'Sheets sync on'}
              </span>
            )}
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {questions.map((question, index) => (
            <QuestionCard
              key={question.id}
              question={question}
              index={index}
              totalQuestions={questions.length}
              allQuestions={questions}
              isSelected={selectedQuestionIndex === index}
              onSelect={() => setSelectedQuestionIndex(index)}
              onUpdate={(updated) => handleUpdateQuestion(updated, index)}
              onDuplicate={() => handleDuplicateQuestion(index)}
              onDelete={() => handleDeleteQuestion(index)}
              onMoveUp={() => handleMoveUp(index)}
              onMoveDown={() => handleMoveDown(index)}
            />
          ))}
        </div>

        {/* "+ Add Question" Button */}
        <div className="pt-2 flex justify-center">
          <button
            type="button"
            onClick={() => setShowTypePicker(true)}
            className="w-full py-4 border-2 border-dashed border-primary/30 hover:border-primary rounded-2xl bg-primary/5 hover:bg-primary/10 flex items-center justify-center gap-2 text-primary font-bold text-sm transition-all group hover:scale-[1.01]"
          >
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <Plus className="w-4 h-4" />
            </div>
            <span>{isArabic ? 'إضافة سؤال أو قسم جديد' : 'Add Question or Section'}</span>
          </button>
        </div>
      </main>

      {/* ======================================================== */}
      {/* 3. LIVE PREVIEW MODAL / OVERLAY                          */}
      {/* ======================================================== */}
      {previewMode !== 'off' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-4xl flex items-center justify-between pb-4 text-white">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-bold font-cyber">
                {previewMode === 'mobile'
                  ? isArabic
                    ? 'معاينة الهاتف المحمول'
                    : 'Mobile Live Preview'
                  : isArabic
                  ? 'معاينة سطح المكتب'
                  : 'Desktop Live Preview'}
              </h3>
              <span className="text-xs text-muted-foreground font-mono">
                {form.slug}
              </span>
            </div>
            <button
              onClick={() => setPreviewMode('off')}
              className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors"
            >
              {isArabic ? 'إغلاق المعاينة' : 'Exit Preview'}
            </button>
          </div>

          <div
            className={`overflow-y-auto custom-scrollbar bg-card border border-white/10 shadow-2xl rounded-3xl transition-all duration-300 p-6 md:p-8 ${
              previewMode === 'mobile'
                ? 'w-[375px] h-[720px] max-h-[85vh] ring-8 ring-white/10 rounded-[40px]'
                : 'w-full max-w-3xl h-[85vh]'
            }`}
          >
            {/* Live Form Mock in Preview */}
            <div className="space-y-6">
              <div
                className="h-2 rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${form.theme?.primaryColor || '#6366f1'}, ${
                    form.theme?.accentColor || '#06b6d4'
                  })`,
                }}
              />
              <div>
                <h1 className="text-xl md:text-2xl font-bold font-cyber text-foreground">
                  {form.title}
                </h1>
                {form.description && (
                  <p className="text-xs md:text-sm text-muted-foreground mt-2">
                    {form.description}
                  </p>
                )}
              </div>

              <div className="space-y-5 pt-3 border-t border-white/10">
                {questions.map((q, idx) => (
                  <div key={q.id} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                    <label className="text-sm font-semibold text-foreground block">
                      {idx + 1}. {q.title} {q.required && <span className="text-rose-400">*</span>}
                    </label>
                    {q.description && (
                      <p className="text-xs text-muted-foreground">{q.description}</p>
                    )}
                    <div className="pt-1">
                      {q.type === 'short_text' && (
                        <input
                          type="text"
                          disabled
                          placeholder={q.settings?.placeholder || 'Short answer...'}
                          className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-muted-foreground"
                        />
                      )}
                      {q.type === 'long_text' && (
                        <textarea
                          rows={2}
                          disabled
                          placeholder={q.settings?.placeholder || 'Detailed answer...'}
                          className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-muted-foreground resize-none"
                        />
                      )}
                      {(q.type === 'single_choice' || q.type === 'multiple_choice') && (
                        <div className="space-y-1.5">
                          {(q.options || []).map((o) => (
                            <div key={o.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                              <div className={`w-3.5 h-3.5 border border-white/20 ${q.type === 'single_choice' ? 'rounded-full' : 'rounded'}`} />
                              <span>{o.text}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  disabled
                  title={isArabic ? 'معاينة فقط، تم تعطيل الإرسال داخل منشئ النماذج' : 'Preview only, submission is disabled in the builder.'}
                  aria-label="Preview only, submission is disabled in the builder."
                  className="px-6 py-2 rounded-xl bg-primary/50 text-white text-xs font-semibold cursor-not-allowed opacity-75"
                >
                  {isArabic ? 'إرسال (معاينة)' : 'Submit (Preview)'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. MODALS & PICKERS                                      */}
      {/* ======================================================== */}
      <QuestionTypePicker
        isOpen={showTypePicker}
        onClose={() => setShowTypePicker(false)}
        onSelectType={handleAddQuestion}
      />

      <FormThemePicker
        isOpen={showThemePicker}
        onClose={() => setShowThemePicker(false)}
        theme={form.theme}
        onChange={(theme) => handleFormChange({ theme })}
      />

      <FormSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        form={form}
        onChange={handleFormChange}
      />

      <FormShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        form={form}
      />
    </div>
  );
};
