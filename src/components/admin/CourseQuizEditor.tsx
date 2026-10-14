import React from 'react';
import { QuizQuestion } from '../../types';
import { Button } from '../ui/Button';
import { useLanguage } from '../../contexts/LanguageContext';

export function CourseQuizEditor({ questions, onChange, disabled }: { questions: QuizQuestion[]; onChange: (questions: QuizQuestion[]) => void; disabled?: boolean }) {
  const { isArabic } = useLanguage();
  const update = (id: string, patch: Partial<QuizQuestion>) => onChange(questions.map(question => question.id === id ? { ...question, ...patch } : question));
  return <fieldset disabled={disabled} className="space-y-4 border border-white/10 rounded-lg p-3">
    <legend className="px-2 text-sm">{isArabic ? 'أسئلة الاختبار والإجابات الصحيحة' : 'Quiz questions and correct answers'}</legend>
    {questions.map((question, index) => <div key={question.id} className="space-y-2 border-b border-white/10 pb-3">
      <label className="block text-xs space-y-1"><span>{isArabic ? `السؤال ${index + 1}` : `Question ${index + 1}`}</span><textarea value={question.question} maxLength={4000} required rows={2} onChange={event => update(question.id, { question: event.target.value })} className="w-full p-2 rounded-lg bg-black/30 border border-white/20" /></label>
      {question.options.map((option, optionIndex) => <div key={optionIndex} className="flex gap-2 items-center">
        <input type="radio" name={`correct-${question.id}`} aria-label={isArabic ? `الإجابة الصحيحة ${index + 1}.${optionIndex + 1}` : `Correct answer ${index + 1}.${optionIndex + 1}`} checked={(question.correctIndex ?? question.correctAnswer) === optionIndex} onChange={() => update(question.id, { correctIndex: optionIndex })} />
        <label className="flex-1 text-xs space-y-1"><span>{isArabic ? `الاختيار ${index + 1}.${optionIndex + 1}` : `Option ${index + 1}.${optionIndex + 1}`}</span><input value={option} maxLength={2000} required onChange={event => update(question.id, { options: question.options.map((value, i) => i === optionIndex ? event.target.value : value) })} className="w-full p-2 rounded-lg bg-black/30 border border-white/20" /></label>
      </div>)}
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="outline" className="px-2 tracking-normal" disabled={disabled || question.options.length >= 10} onClick={() => update(question.id, { options: [...question.options, ''] })}>{isArabic ? 'إضافة اختيار' : 'Add option'}</Button>
        <Button type="button" size="sm" variant="ghost" className="px-2 tracking-normal" onClick={() => onChange(questions.filter(value => value.id !== question.id))}>{isArabic ? 'حذف السؤال' : 'Remove question'}</Button>
      </div>
    </div>)}
    <Button type="button" size="sm" variant="outline" className="px-3 tracking-normal" disabled={disabled || questions.length >= 100} onClick={() => onChange([...questions, { id: crypto.randomUUID(), question: '', options: ['', ''], correctIndex: 0 }])}>{isArabic ? 'إضافة سؤال' : 'Add question'}</Button>
    <p className="text-xs text-muted-foreground">{isArabic ? 'حدد الإجابة الصحيحة بجانب الاختيار. يحسب الخادم النتيجة؛ الشهادة تصدر بعد إكمال الدروس واجتياز الاختبارات.' : 'Select the correct answer beside its option. The server grades answers; certificates are issued after all lessons and assessments are completed.'}</p>
  </fieldset>;
}
