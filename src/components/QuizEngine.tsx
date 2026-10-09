import React, { useState } from 'react';
import { QuizQuestion } from '../types';
import { Button } from './ui/Button';
import {
  CheckCircle2,
  XCircle,
  Sparkles,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Trophy,
  Check
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'sonner';

interface QuizEngineProps {
  quizTitle: string;
  questions: QuizQuestion[];
  passingScore?: number; // default 80%
  pointsRewardPass?: number;
  pointsRewardPerfect?: number;
  onComplete: (scorePercentage: number, passed: boolean) => void;
  onAskAI?: (questionText: string) => void;
}

export const QuizEngine: React.FC<QuizEngineProps> = ({
  quizTitle,
  questions,
  passingScore = 80,
  pointsRewardPass = 30,
  pointsRewardPerfect = 50,
  onComplete,
}) => {
  const { isArabic } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const currentQ = questions[currentIndex];
  const total = questions.length;

  const handleSelectOption = (optionIndex: number) => {
    if (submitted) return;
    setSelectedAnswers(prev => ({ ...prev, [currentIndex]: optionIndex }));
  };

  const handleNext = () => {
    if (currentIndex < total - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmitQuiz = () => {
    // Check if any unanswered
    const answeredCount = Object.keys(selectedAnswers).length;
    if (answeredCount < total) {
      const confirmSubmit = window.confirm(
        isArabic
          ? `لقد أجبت على ${answeredCount} من أصل ${total} أسئلة فقط. هل تريد بالتأكيد تسليم الاختبار الآن؟`
          : `You have only answered ${answeredCount} of ${total} questions. Are you sure you want to submit?`
      );
      if (!confirmSubmit) return;
    }

    setSubmitted(true);

    // Calculate score
    let correctCount = 0;
    questions.forEach((q, idx) => {
      const selected = selectedAnswers[idx];
      const correct = q.correctIndex ?? q.correctAnswer ?? 0;
      if (selected === correct) correctCount++;
    });

    const scorePct = Math.round((correctCount / total) * 100);
    const passed = scorePct >= passingScore;

    if (scorePct === 100) {
      toast.success(isArabic ? `🏆 درجة كاملة! 100% (+${pointsRewardPerfect} XP!)` : `🏆 PERFECT SCORE! 100% (+${pointsRewardPerfect} XP awarded!)`);
    } else if (passed) {
      toast.success(isArabic ? `🎉 تم اجتياز الاختبار بنجاح! ${scorePct}% (+${pointsRewardPass} XP!)` : `🎉 QUIZ PASSED! ${scorePct}% (+${pointsRewardPass} XP awarded!)`);
    } else {
      toast.error(isArabic ? `الدرجة: ${scorePct}%. درجة النجاح هي ${passingScore}%. راجع المنهج وحاول مجدداً!` : `Score: ${scorePct}%. Passing score is ${passingScore}%. Try again!`);
    }

    onComplete(scorePct, passed);
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setSubmitted(false);
    setCurrentIndex(0);
  };

  // Score summary if submitted
  const correctCount = questions.filter((q, idx) => {
    const correct = q.correctIndex ?? q.correctAnswer ?? 0;
    return selectedAnswers[idx] === correct;
  }).length;
  const scorePct = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  const passed = scorePct >= passingScore;

  return (
    <div className="max-w-3xl mx-auto rounded-2xl border border-primary/30 bg-dark-navy/90 backdrop-blur-2xl p-6 sm:p-8 shadow-[0_0_40px_rgba(0,255,204,0.12)] space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-cyber uppercase tracking-wider bg-primary/20 text-primary border border-primary/30">
              {isArabic ? 'تقييم المعرفة والمهارات' : 'KNOWLEDGE ASSESSMENT'}
            </span>
            <span className="text-xs font-mono text-muted-foreground">
              {isArabic ? `درجة النجاح: ${passingScore}%` : `Pass Mark: ${passingScore}%`}
            </span>
          </div>
          <h2 className="text-xl font-cyber font-bold text-white">{quizTitle}</h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-cyber flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> +{pointsRewardPass} XP
          </span>
          {pointsRewardPerfect > pointsRewardPass && (
            <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-cyber flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5" /> +{pointsRewardPerfect} XP (100%)
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar & Question Count */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-mono text-muted-foreground">
          <span>
            {isArabic ? `السؤال ${currentIndex + 1} من ${total}` : `Question ${currentIndex + 1} of ${total}`}
          </span>
          <span>
            {isArabic 
              ? `تمت الإجابة على ${Object.keys(selectedAnswers).length}` 
              : `${Object.keys(selectedAnswers).length} answered`
            }
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-black/40 overflow-hidden border border-white/10">
          <div
            className="h-full bg-gradient-to-r from-primary to-cyan-400 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      {!submitted ? (
        <div className="space-y-6 py-2">
          <div className="space-y-2">
            <h3 className="text-base sm:text-lg font-semibold text-white leading-relaxed">
              {currentQ.question}
            </h3>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQ.options.map((option, optIdx) => {
              const isSelected = selectedAnswers[currentIndex] === optIdx;
              return (
                <button
                  key={optIdx}
                  onClick={() => handleSelectOption(optIdx)}
                  className={`w-full p-4 rounded-xl border font-mono text-xs sm:text-sm transition-all flex items-center justify-between gap-3 ${
                    isArabic ? 'text-right' : 'text-left'
                  } ${
                    isSelected
                      ? 'border-primary bg-primary/20 text-white shadow-[0_0_15px_rgba(0,255,204,0.2)]'
                      : 'border-white/10 bg-white/5 hover:border-white/20 text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-cyber font-bold ${
                        isSelected
                          ? 'bg-primary text-dark-navy'
                          : 'bg-white/10 text-muted-foreground'
                      }`}
                    >
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span>{option}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-primary" />}
                </button>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="font-cyber text-xs border-white/20"
            >
              <ArrowLeft className={`w-3.5 h-3.5 ${isArabic ? 'ml-1 rotate-180' : 'mr-1'}`} /> 
              {isArabic ? 'السابق' : 'PREV'}
            </Button>

            <div className="flex gap-2">
              {currentIndex === total - 1 ? (
                <Button
                  size="sm"
                  onClick={handleSubmitQuiz}
                  className="font-cyber text-xs bg-primary hover:bg-primary/90 text-dark-navy font-bold shadow-[0_0_15px_rgba(0,255,204,0.3)]"
                >
                  {isArabic ? 'تسليم الاختبار' : 'SUBMIT ASSESSMENT'} 
                  <CheckCircle2 className={`w-3.5 h-3.5 ${isArabic ? 'mr-1' : 'ml-1'}`} />
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleNext}
                  className="font-cyber text-xs bg-primary/80 hover:bg-primary text-dark-navy font-bold"
                >
                  {isArabic ? 'التالي' : 'NEXT'} 
                  <ArrowRight className={`w-3.5 h-3.5 ${isArabic ? 'mr-1 rotate-180' : 'ml-1'}`} />
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Results View */
        <div className="space-y-6 py-4 text-center">
          <div
            className={`p-6 rounded-2xl border ${
              passed
                ? 'border-emerald-500/40 bg-emerald-500/10'
                : 'border-red-500/40 bg-red-500/10'
            } space-y-3`}
          >
            <div className="text-4xl">{passed ? (scorePct === 100 ? '🏆' : '🎉') : '📚'}</div>
            <h3 className="text-2xl font-cyber font-black text-white">
              {passed 
                ? (isArabic ? 'تم اجتياز الاختبار بنجاح!' : 'ASSESSMENT COMPLETED!') 
                : (isArabic ? 'بحاجة لمزيد من المراجعة' : 'NEEDS IMPROVEMENT')
              }
            </h3>
            <div className="text-3xl font-cyber font-bold text-primary neon-text">
              {scorePct}% ({correctCount}/{total} {isArabic ? 'صحيحة' : 'Correct'})
            </div>
            <p className="text-xs font-mono text-muted-foreground max-w-md mx-auto">
              {passed
                ? (isArabic 
                    ? `تهانينا! حققت نسبة النجاح (${passingScore}%). تمت إضافة نقاط XP إلى حسابك.`
                    : `Congratulations! You met the passing criteria (${passingScore}%). Your XP bounty has been added to your club record.`)
                : (isArabic
                    ? `حققت ${scorePct}%. درجة النجاح المطلوبة هي ${passingScore}%. راجع محتوى الدورة وأعد المحاولة.`
                    : `You scored ${scorePct}%. The passing threshold is ${passingScore}%. Review the course material and retake when ready.`)}
            </p>
          </div>

          {/* Question by Question Review */}
          <div className="text-left space-y-4 pt-4 border-t border-white/10">
            <h4 className="text-xs font-cyber uppercase tracking-wider text-muted-foreground">
              {isArabic ? 'مراجعة الإجابات' : 'ANSWER REVIEW'}
            </h4>
            {questions.map((q, idx) => {
              const selected = selectedAnswers[idx];
              const correct = q.correctIndex ?? q.correctAnswer ?? 0;
              const isCorrect = selected === correct;

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border text-xs font-mono space-y-2 ${
                    isCorrect
                      ? 'border-emerald-500/20 bg-emerald-500/5'
                      : 'border-red-500/20 bg-red-500/5'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-white">
                      {isArabic ? `س${idx + 1}: ` : `Q${idx + 1}: `}{q.question}
                    </span>
                    {isCorrect ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {isArabic ? 'صحيحة' : 'Correct'}
                      </span>
                    ) : (
                      <span className="text-red-400 font-bold flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> {isArabic ? 'غير صحيحة' : 'Incorrect'}
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] text-muted-foreground space-y-1">
                    <div>
                      {isArabic ? 'إجابتك: ' : 'Your answer: '}
                      <strong className="text-white">{q.options[selected] || (isArabic ? 'لم تتم الإجابة' : 'Not answered')}</strong>
                    </div>
                    {!isCorrect && (
                      <div className="text-emerald-400">
                        {isArabic ? 'الإجابة الصحيحة: ' : 'Correct answer: '}
                        <strong>{q.options[correct]}</strong>
                      </div>
                    )}
                    {q.explanation && (
                      <div className="p-2 rounded bg-white/5 text-slate-300 mt-1">
                        💡 {q.explanation}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center gap-4 pt-4">
            <Button
              variant="outline"
              onClick={handleRetake}
              className="font-cyber text-xs border-white/20"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isArabic ? 'ml-1' : 'mr-1'}`} /> 
              {isArabic ? 'إعادة الاختبار' : 'RETAKE QUIZ'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizEngine;
