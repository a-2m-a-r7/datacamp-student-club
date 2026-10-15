import type {QuizQuestion, QuizQuestionText} from '../types';

export function quizText(question: QuizQuestion, isArabic: boolean): QuizQuestionText {
  const translation = question.translations?.[isArabic ? 'ar' : 'en'];
  if (translation?.question?.trim() && Array.isArray(translation.options)
      && translation.options.length === question.options.length
      && translation.options.every(option => typeof option === 'string' && option.trim())) return translation;
  // Keep existing quizzes usable until their administrator adds both versions.
  return {question: question.question, options: question.options, explanation: question.explanation};
}
