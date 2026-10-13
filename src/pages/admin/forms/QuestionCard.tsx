/**
 * src/pages/admin/forms/QuestionCard.tsx
 * Individual editable question block inspired by Microsoft Forms
 */

import React, { useState } from 'react';
import {
  Trash2, Copy, ArrowUp, ArrowDown, GripVertical,
  Plus, X, Star, Heart, Check, Circle, GitBranch,
  Settings2, HelpCircle, Upload, Calendar, Clock, Hash, Mail
} from 'lucide-react';
import { FormQuestion, ChoiceOption, QuestionType } from '../../../types/forms';
import { useLanguage } from '../../../contexts/LanguageContext';
import { QUESTION_TYPES } from './QuestionTypePicker';

interface QuestionCardProps {
  question: FormQuestion;
  index: number;
  totalQuestions: number;
  allQuestions: FormQuestion[];
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updated: FormQuestion) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  index,
  totalQuestions,
  allQuestions,
  isSelected,
  onSelect,
  onUpdate,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
}) => {
  const { isArabic } = useLanguage();
  const [showBranching, setShowBranching] = useState(false);
  const [showDescription, setShowDescription] = useState(Boolean(question.description));

  const typeMeta = QUESTION_TYPES.find((t) => t.type === question.type) || QUESTION_TYPES[0];
  const TypeIcon = typeMeta.icon;

  const isSection = question.type === 'section_header';

  // Handle question title change
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...question, title: e.target.value });
  };

  // Handle question description change
  const handleDescChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onUpdate({ ...question, description: e.target.value });
  };

  // Handle required toggle
  const handleRequiredToggle = () => {
    onUpdate({ ...question, required: !question.required });
  };

  // Choice Options Helpers
  const handleAddOption = () => {
    const currentOptions = question.options || [];
    const newOption: ChoiceOption = {
      id: `opt-${Date.now()}-${currentOptions.length + 1}`,
      text: isArabic ? `الخيار ${currentOptions.length + 1}` : `Option ${currentOptions.length + 1}`,
    };
    onUpdate({ ...question, options: [...currentOptions, newOption] });
  };

  const handleAddOtherOption = () => {
    const currentOptions = question.options || [];
    if (currentOptions.some((o) => o.isOther)) return;
    const otherOption: ChoiceOption = {
      id: `opt-other-${Date.now()}`,
      text: isArabic ? 'أخرى (يرجى التحديد)' : 'Other (please specify)',
      isOther: true,
    };
    onUpdate({ ...question, options: [...currentOptions, otherOption] });
  };

  const handleUpdateOption = (optId: string, text: string) => {
    const currentOptions = question.options || [];
    onUpdate({
      ...question,
      options: currentOptions.map((opt) => (opt.id === optId ? { ...opt, text } : opt)),
    });
  };

  const handleDeleteOption = (optId: string) => {
    const currentOptions = question.options || [];
    if (currentOptions.length <= 1) return;
    onUpdate({
      ...question,
      options: currentOptions.filter((opt) => opt.id !== optId),
    });
  };

  const handleOptionBranching = (optId: string, goToQuestionId: string) => {
    const currentOptions = question.options || [];
    onUpdate({
      ...question,
      options: currentOptions.map((opt) =>
        opt.id === optId ? { ...opt, goToQuestionId: goToQuestionId || undefined } : opt
      ),
    });
  };

  // Rating / Linear scale settings helper
  const handleSettingsChange = (key: string, val: any) => {
    onUpdate({
      ...question,
      settings: {
        ...(question.settings || {}),
        [key]: val,
      },
    });
  };

  return (
    <div
      onClick={onSelect}
      className={`relative rounded-2xl border transition-all duration-200 overflow-hidden ${
        isSelected
          ? 'bg-card/90 border-primary shadow-xl shadow-primary/10 ring-1 ring-primary/40'
          : 'bg-card/40 border-white/10 hover:border-white/20 hover:bg-card/60'
      }`}
    >
      {/* Top accent line if selected */}
      {isSelected && (
        <div className="h-1 w-full bg-gradient-to-r from-primary via-cyan-400 to-indigo-500" />
      )}

      <div className="p-5 md:p-6 space-y-5">
        {/* Top Header Row: Question Number, Type Badge, and Movement Controls */}
        <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-3">
          <div className="flex items-center space-x-3 rtl:space-x-reverse min-w-0">
            <span className="w-7 h-7 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center text-xs font-mono font-bold text-foreground shrink-0">
              {isSection ? '§' : `${index + 1}`}
            </span>
            <div className="flex items-center space-x-2 rtl:space-x-reverse text-xs font-medium text-muted-foreground bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
              <TypeIcon className="w-3.5 h-3.5 text-primary" />
              <span>{isArabic ? typeMeta.labelAr : typeMeta.labelEn}</span>
            </div>
            {question.required && (
              <span className="text-xs text-rose-400 font-semibold px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">
                {isArabic ? 'إلزامي *' : 'Required *'}
              </span>
            )}
          </div>

          {/* Quick Reorder and Actions */}
          <div className="flex items-center space-x-1 rtl:space-x-reverse">
            <button aria-label={isArabic ? 'تحريك لأعلى' : 'Move up'}
              type="button"
              disabled={index === 0}
              onClick={(e) => {
                e.stopPropagation();
                onMoveUp();
              }}
              title={isArabic ? 'تحريك لأعلى' : 'Move up'}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
            <button aria-label={isArabic ? 'تحريك لأسفل' : 'Move down'}
              type="button"
              disabled={index === totalQuestions - 1}
              onClick={(e) => {
                e.stopPropagation();
                onMoveDown();
              }}
              title={isArabic ? 'تحريك لأسفل' : 'Move down'}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
            <button aria-label={isArabic ? 'تكرار السؤال' : 'Duplicate'}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate();
              }}
              title={isArabic ? 'تكرار السؤال' : 'Duplicate'}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button aria-label={isArabic ? 'حذف السؤال' : 'Delete'}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              title={isArabic ? 'حذف السؤال' : 'Delete'}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Question Title & Description Input Area */}
        <div className="space-y-2">
          <input
            type="text"
            value={question.title}
            onChange={handleTitleChange}
            placeholder={
              isSection
                ? isArabic
                  ? 'عنوان القسم (مثال: البيانات الشخصية)'
                  : 'Section Title (e.g. Personal Information)'
                : isArabic
                ? 'اكتب سؤالك هنا...'
                : 'Write your question here...'
            }
            className={`w-full bg-transparent border-b ${
              isSelected ? 'border-primary/40 focus:border-primary' : 'border-white/10'
            } px-1 py-1.5 text-base md:text-lg font-semibold text-foreground focus:outline-none transition-colors placeholder:text-muted-foreground/50`}
          />

          {showDescription ? (
            <div className="relative">
              <input
                type="text"
                value={question.description || ''}
                onChange={handleDescChange}
                placeholder={
                  isArabic
                    ? 'وصف إضافي أو إرشادات للمجيب (اختياري)...'
                    : 'Subtitle or guidance for the respondent (optional)...'
                }
                className="w-full bg-transparent border-b border-white/5 focus:border-primary/30 px-1 py-1 text-xs md:text-sm text-muted-foreground focus:outline-none transition-colors placeholder:text-muted-foreground/40"
              />
              <button aria-label="Close"
                type="button"
                onClick={() => {
                  setShowDescription(false);
                  onUpdate({ ...question, description: '' });
                }}
                className="absolute right-1 top-1 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowDescription(true)}
              className="text-[11px] text-muted-foreground/70 hover:text-primary transition-colors flex items-center gap-1"
            >
              + {isArabic ? 'إضافة وصف توضيحي' : 'Add subtitle/guidance'}
            </button>
          )}
        </div>

        {/* Dynamic Answer Editor by Type */}
        <div className="pt-2">
          {/* 1. Choice / Multi-Choice / Dropdown Options */}
          {(question.type === 'single_choice' ||
            question.type === 'multiple_choice' ||
            question.type === 'dropdown') && (
            <div className="space-y-2.5">
              {(question.options || []).map((opt, optIndex) => (
                <div
                  key={opt.id}
                  className="flex items-center space-x-2.5 rtl:space-x-reverse group/opt"
                >
                  <div className="text-muted-foreground/60 shrink-0">
                    {question.type === 'single_choice' ? (
                      <Circle className="w-4 h-4" />
                    ) : question.type === 'dropdown' ? (
                      <span className="text-xs font-mono font-bold w-4 text-center block">
                        {optIndex + 1}.
                      </span>
                    ) : (
                      <div className="w-4 h-4 rounded border border-white/20" />
                    )}
                  </div>

                  <input
                    type="text"
                    value={opt.text}
                    disabled={opt.isOther}
                    onChange={(e) => handleUpdateOption(opt.id, e.target.value)}
                    className="flex-1 bg-white/5 hover:bg-white/10 focus:bg-white/10 border border-white/10 focus:border-primary/40 rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none transition-colors"
                  />

                  {/* Branching Logic Selector for choice */}
                  {showBranching && (
                    <select
                      value={opt.goToQuestionId || ''}
                      onChange={(e) => handleOptionBranching(opt.id, e.target.value)}
                      className="bg-background border border-primary/30 text-xs rounded-lg px-2 py-1 text-primary focus:outline-none max-w-[140px]"
                    >
                      <option value="">{isArabic ? 'التالي مباشرة' : 'Next Question'}</option>
                      <option value="end">{isArabic ? 'إنهاء النموذج' : 'End Form'}</option>
                      {allQuestions
                        .filter((q) => q.id !== question.id)
                        .map((q, qIdx) => (
                          <option key={q.id} value={q.id}>
                            #{qIdx + 1}: {q.title.substring(0, 15)}...
                          </option>
                        ))}
                    </select>
                  )}

                  <button aria-label="Close"
                    type="button"
                    disabled={(question.options || []).length <= 1}
                    onClick={() => handleDeleteOption(opt.id)}
                    className="p-1 text-muted-foreground/50 hover:text-rose-400 opacity-0 group-hover/opt:opacity-100 disabled:opacity-0 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {/* Add Option & Add Other Buttons */}
              <div className="flex items-center gap-3 pt-1 text-xs">
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="text-primary hover:text-primary/80 font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {isArabic ? 'إضافة خيار' : 'Add option'}
                </button>

                {!question.options?.some((o) => o.isOther) && (
                  <>
                    <span className="text-muted-foreground/30">•</span>
                    <button
                      type="button"
                      onClick={handleAddOtherOption}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      + {isArabic ? 'إضافة خيار "أخرى"' : 'Add "Other"'}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* 2. Text Input Previews */}
          {question.type === 'short_text' && (
            <div className="w-full bg-white/5 border border-dashed border-white/20 rounded-xl p-3 text-xs text-muted-foreground italic">
              {question.settings?.placeholder || (isArabic ? 'إجابة نصية قصيرة للمجيب...' : 'Single-line text response...')}
            </div>
          )}

          {question.type === 'long_text' && (
            <div className="w-full h-20 bg-white/5 border border-dashed border-white/20 rounded-xl p-3 text-xs text-muted-foreground italic">
              {question.settings?.placeholder || (isArabic ? 'إجابة نصية مفصلة متعددة الأسطر...' : 'Multi-line detailed answer response...')}
            </div>
          )}

          {/* 3. Rating Scale Settings & Preview */}
          {question.type === 'rating' && (
            <div className="space-y-3">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span>{isArabic ? 'المستوى الأقصى:' : 'Max Level:'}</span>
                  <select
                    value={question.settings?.maxRating || 5}
                    onChange={(e) => handleSettingsChange('maxRating', parseInt(e.target.value))}
                    className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-foreground"
                  >
                    <option value={5}>5 {isArabic ? 'نجوم' : 'Stars'}</option>
                    <option value={10}>10 {isArabic ? 'نجوم' : 'Stars'}</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span>{isArabic ? 'الرمز:' : 'Icon:'}</span>
                  <select
                    value={question.settings?.ratingIcon || 'star'}
                    onChange={(e) => handleSettingsChange('ratingIcon', e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-foreground"
                  >
                    <option value="star">{isArabic ? 'نجمة' : 'Star'}</option>
                    <option value="heart">{isArabic ? 'قلب' : 'Heart'}</option>
                    <option value="number">{isArabic ? 'أرقام' : 'Number'}</option>
                  </select>
                </div>
              </div>

              {/* Live Preview */}
              <div className="flex items-center gap-2 pt-1 text-amber-400">
                {Array.from({ length: question.settings?.maxRating || 5 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    className="p-1 rounded hover:scale-110 transition-transform"
                  >
                    {question.settings?.ratingIcon === 'heart' ? (
                      <Heart className="w-6 h-6 text-rose-500 fill-rose-500/20" />
                    ) : question.settings?.ratingIcon === 'number' ? (
                      <span className="w-7 h-7 rounded-lg border border-white/20 flex items-center justify-center text-xs text-foreground">
                        {i + 1}
                      </span>
                    ) : (
                      <Star className="w-6 h-6 fill-amber-400/20" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 4. Linear Scale (Likert) */}
          {question.type === 'linear_scale' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-muted-foreground block mb-1">
                    {isArabic ? 'تسمية الدرجة الأدنى (1):' : 'Min Label (1):'}
                  </label>
                  <input
                    type="text"
                    value={question.settings?.scaleMinLabel || ''}
                    placeholder={isArabic ? 'لا أوافق بشدة' : 'Strongly Disagree'}
                    onChange={(e) => handleSettingsChange('scaleMinLabel', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-foreground focus:outline-none focus:border-primary/40"
                  />
                </div>
                <div>
                  <label className="text-muted-foreground block mb-1">
                    {isArabic ? 'تسمية الدرجة القصوى (5 أو 10):' : 'Max Label (5/10):'}
                  </label>
                  <input
                    type="text"
                    value={question.settings?.scaleMaxLabel || ''}
                    placeholder={isArabic ? 'أوافق بشدة' : 'Strongly Agree'}
                    onChange={(e) => handleSettingsChange('scaleMaxLabel', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-foreground focus:outline-none focus:border-primary/40"
                  />
                </div>
              </div>

              {/* Visual Preview */}
              <div className="flex items-center justify-between gap-1 pt-2">
                {[1, 2, 3, 4, 5].map((val) => (
                  <div
                    key={val}
                    className="flex-1 py-2 rounded-xl bg-white/5 border border-white/10 text-center text-xs font-semibold text-muted-foreground"
                  >
                    {val}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. Date / Time / Number / Email Previews */}
          {question.type === 'date' && (
            <div className="flex items-center gap-2 max-w-xs bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-muted-foreground">
              <Calendar className="w-4 h-4 text-primary" />
              <span>YYYY / MM / DD</span>
            </div>
          )}

          {question.type === 'time' && (
            <div className="flex items-center gap-2 max-w-xs bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-muted-foreground">
              <Clock className="w-4 h-4 text-primary" />
              <span>-- : -- AM/PM</span>
            </div>
          )}

          {question.type === 'number' && (
            <div className="flex items-center gap-2 max-w-xs bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-muted-foreground">
              <Hash className="w-4 h-4 text-primary" />
              <span>{isArabic ? 'أرقام فقط (مثال: 42)' : 'Numeric digits only'}</span>
            </div>
          )}

          {question.type === 'email' && (
            <div className="flex items-center gap-2 max-w-xs bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-muted-foreground">
              <Mail className="w-4 h-4 text-primary" />
              <span>name@example.com</span>
            </div>
          )}

          {/* 6. File Upload */}
          {question.type === 'file_upload' && (
            <div className="border border-dashed border-primary/30 bg-primary/5 rounded-xl p-4 text-center space-y-1">
              <Upload className="w-6 h-6 text-primary mx-auto" />
              <p className="text-xs font-semibold text-foreground">
                {isArabic ? 'مربع رفع الملفات والمستندات' : 'Attachment Upload Box'}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {isArabic ? 'الحد الأقصى 10MB • مخزن في Supabase Storage' : 'Max 10MB • Saved to Supabase Storage'}
              </p>
            </div>
          )}

          {/* 7. Section Header */}
          {question.type === 'section_header' && (
            <div className="border-t-2 border-primary/40 pt-2 text-xs text-primary font-mono flex items-center justify-between">
              <span>{isArabic ? 'فاصل قسم جديد — سينتقل المجيب إلى صفحة تالية' : 'Section Divider — Moves respondent to next page'}</span>
            </div>
          )}
        </div>

        {/* Bottom Toolbar: Required Toggle & Branching */}
        {!isSection && (
          <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              {/* Branching Logic Button for choices */}
              {(question.type === 'single_choice' || question.type === 'dropdown') && (
                <button
                  type="button"
                  onClick={() => setShowBranching(!showBranching)}
                  className={`flex items-center gap-1.5 transition-colors ${
                    showBranching ? 'text-primary font-semibold' : 'hover:text-foreground'
                  }`}
                >
                  <GitBranch className="w-3.5 h-3.5" />
                  {isArabic ? 'التفرع والمنطق المشروط' : 'Branching Logic'}
                </button>
              )}
            </div>

            {/* Required Switch */}
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">
                {isArabic ? 'مطلوب للإرسال' : 'Required'}
              </span>
              <button
                type="button"
                onClick={handleRequiredToggle}
                className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
                  question.required ? 'bg-primary' : 'bg-white/20'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    question.required ? 'translate-x-4 rtl:-translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
