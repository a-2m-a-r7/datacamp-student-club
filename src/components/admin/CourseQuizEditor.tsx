import React, {useEffect, useState} from 'react';
import { QuizQuestion, QuizQuestionText } from '../../types';
import { Button } from '../ui/Button';
import { useLanguage } from '../../contexts/LanguageContext';

export function CourseQuizEditor({ questions, onChange, disabled }: { questions: QuizQuestion[]; onChange: (questions: QuizQuestion[]) => void; disabled?: boolean }) {
  const { isArabic } = useLanguage();
  const [language, setLanguage] = useState<'ar'|'en'>(isArabic ? 'ar' : 'en');
  useEffect(() => setLanguage(isArabic ? 'ar' : 'en'), [isArabic]);
  const update = (id: string, patch: Partial<QuizQuestion>) => onChange(questions.map(question => question.id === id ? { ...question, ...patch } : question));
  const editable = (question: QuizQuestion, locale: 'ar'|'en'): QuizQuestionText => {
    if (question.translations?.[locale]) return question.translations[locale]!;
    const originalLanguage = /[\u0600-\u06ff]/.test(question.question) ? 'ar' : 'en';
    return originalLanguage === locale
      ? {question: question.question, options: [...question.options], explanation: question.explanation || ''}
      : {question: '', options: question.options.map(() => ''), explanation: ''};
  };
  const updateText = (question: QuizQuestion, patch: Partial<QuizQuestionText>) => {
    const value = {...editable(question, language), ...patch};
    update(question.id, {...value, translations: {ar: editable(question, 'ar'), en: editable(question, 'en'), [language]: value}});
  };
  const addOption = (question: QuizQuestion) => {
    const ar = editable(question, 'ar'), en = editable(question, 'en');
    const translations = {ar: {...ar, options: [...ar.options, '']}, en: {...en, options: [...en.options, '']}};
    update(question.id, {...translations[language], translations});
  };
  return <fieldset disabled={disabled} className="space-y-4 border border-white/10 rounded-lg p-3">
    <legend className="px-2 text-sm">{isArabic ? 'أسئلة الاختبار والإجابات الصحيحة' : 'Quiz questions and correct answers'}</legend>
    <label className="block text-xs">{isArabic ? 'لغة نص الأسئلة' : 'Question text language'} <select aria-label="Quiz text language" value={language} onChange={event => setLanguage(event.target.value as 'ar'|'en')} className="bg-dark-navy border border-white/20 rounded p-2"><option value="ar">العربية</option><option value="en">English</option></select></label>
    <p className="text-xs text-muted-foreground">{isArabic ? 'أكمل السؤال والاختيارات بالعربية والإنجليزية قبل الحفظ. ترتيب الاختيارات والإجابة الصحيحة مشتركان بين اللغتين.' : 'Complete the question and options in Arabic and English before saving. Both languages share the option order and correct answer.'}</p>
    {questions.map((question, index) => {const value = editable(question, language); return <div key={question.id} dir={language === 'ar' ? 'rtl' : 'ltr'} className="space-y-2 border-b border-white/10 pb-3">
      <label className="block text-xs space-y-1"><span>{isArabic ? `السؤال ${index + 1}` : `Question ${index + 1}`}</span><textarea value={value.question} maxLength={4000} required rows={2} onChange={event => updateText(question, { question: event.target.value })} className="w-full p-2 rounded-lg bg-black/30 border border-white/20" /></label>
      {value.options.map((option, optionIndex) => <div key={optionIndex} className="flex gap-2 items-center">
        <input type="radio" name={`correct-${question.id}`} aria-label={isArabic ? `الإجابة الصحيحة ${index + 1}.${optionIndex + 1}` : `Correct answer ${index + 1}.${optionIndex + 1}`} checked={(question.correctIndex ?? question.correctAnswer) === optionIndex} onChange={() => update(question.id, { correctIndex: optionIndex })} />
        <label className="flex-1 text-xs space-y-1"><span>{isArabic ? `الاختيار ${index + 1}.${optionIndex + 1}` : `Option ${index + 1}.${optionIndex + 1}`}</span><input value={option} maxLength={2000} required onChange={event => updateText(question, { options: value.options.map((item, i) => i === optionIndex ? event.target.value : item) })} className="w-full p-2 rounded-lg bg-black/30 border border-white/20" /></label>
      </div>)}
      <label className="block text-xs space-y-1"><span>{isArabic ? `شرح الإجابة ${index + 1}` : `Answer explanation ${index + 1}`}</span><textarea value={value.explanation || ''} maxLength={1500} rows={2} onChange={event => updateText(question, { explanation: event.target.value })} className="w-full p-2 rounded-lg bg-black/30 border border-white/20" /></label>
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="outline" className="px-2 tracking-normal" disabled={disabled || question.options.length >= 10} onClick={() => addOption(question)}>{isArabic ? 'إضافة اختيار' : 'Add option'}</Button>
        <Button type="button" size="sm" variant="ghost" className="px-2 tracking-normal" onClick={() => onChange(questions.filter(value => value.id !== question.id))}>{isArabic ? 'حذف السؤال' : 'Remove question'}</Button>
      </div>
    </div>;})}
    <Button type="button" size="sm" variant="outline" className="px-3 tracking-normal" disabled={disabled || questions.length >= 100} onClick={() => onChange([...questions, { id: crypto.randomUUID(), question: '', options: ['', ''], correctIndex: 0 }])}>{isArabic ? 'إضافة سؤال' : 'Add question'}</Button>
    <p className="text-xs text-muted-foreground">{isArabic ? 'حدد الإجابة الصحيحة بجانب الاختيار. يحسب الخادم النتيجة؛ الشهادة تصدر بعد إكمال الدروس واجتياز الاختبارات.' : 'Select the correct answer beside its option. The server grades answers; certificates are issued after all lessons and assessments are completed.'}</p>
  </fieldset>;
}
