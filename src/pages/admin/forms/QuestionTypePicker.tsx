import { Dialog } from '../../../components/ui/Dialog';
/**
 * src/pages/admin/forms/QuestionTypePicker.tsx
 * Interactive question type selector inspired by Microsoft Forms
 */

import React from 'react';
import {
  Type, AlignLeft, CircleDot, CheckSquare, List,
  Star, Sliders, Calendar, Clock, Hash, Mail,
  UploadCloud, ArrowDownUp, Split, Plus, X
} from 'lucide-react';
import { QuestionType } from '../../../types/forms';
import { useLanguage } from '../../../contexts/LanguageContext';

interface QuestionTypePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (type: QuestionType) => void;
}

interface QuestionTypeOption {
  type: QuestionType;
  labelEn: string;
  labelAr: string;
  descEn: string;
  descAr: string;
  icon: React.ElementType;
  badge?: string;
}

export const QUESTION_TYPES: QuestionTypeOption[] = [
  {
    type: 'single_choice',
    labelEn: 'Choice (Single)',
    labelAr: 'اختيار وحيد',
    descEn: 'Radio buttons for one option',
    descAr: 'تحديد إجابة واحدة فقط',
    icon: CircleDot,
  },
  {
    type: 'multiple_choice',
    labelEn: 'Checkboxes (Multi)',
    labelAr: 'مربعات اختيار متعددة',
    descEn: 'Checkboxes for multiple answers',
    descAr: 'تحديد أكثر من خيار',
    icon: CheckSquare,
  },
  {
    type: 'short_text',
    labelEn: 'Text (Short)',
    labelAr: 'نص قصير',
    descEn: 'Single-line text input',
    descAr: 'سطر واحد للإجابة',
    icon: Type,
  },
  {
    type: 'long_text',
    labelEn: 'Text (Long)',
    labelAr: 'فقرة / نص طويل',
    descEn: 'Multi-line detailed answer',
    descAr: 'إجابة مفصلة متعددة الأسطر',
    icon: AlignLeft,
  },
  {
    type: 'rating',
    labelEn: 'Rating',
    labelAr: 'تقييم بالنجوم',
    descEn: 'Stars or numeric rating scale',
    descAr: 'تقييم بالنجوم أو الأرقام',
    icon: Star,
  },
  {
    type: 'linear_scale',
    labelEn: 'Linear Scale / Likert',
    labelAr: 'مقياس خطي',
    descEn: 'Scale from 1 to 10 with labels',
    descAr: 'مقياس درجات من 1 إلى 10',
    icon: Sliders,
  },
  {
    type: 'dropdown',
    labelEn: 'Dropdown',
    labelAr: 'قائمة منسدلة',
    descEn: 'Clean select list for many choices',
    descAr: 'قائمة منسدلة أنيقة للخيارات',
    icon: List,
  },
  {
    type: 'date',
    labelEn: 'Date',
    labelAr: 'تاريخ',
    descEn: 'Calendar date picker',
    descAr: 'اختيار اليوم والشهر والسنة',
    icon: Calendar,
  },
  {
    type: 'time',
    labelEn: 'Time',
    labelAr: 'وقت',
    descEn: 'Time picker with AM/PM',
    descAr: 'تحديد الوقت بالساعات والدقائق',
    icon: Clock,
  },
  {
    type: 'number',
    labelEn: 'Number',
    labelAr: 'رقم',
    descEn: 'Numeric values only',
    descAr: 'أرقام وحسابات فقط',
    icon: Hash,
  },
  {
    type: 'email',
    labelEn: 'Email Address',
    labelAr: 'بريد إلكتروني',
    descEn: 'Validated email format',
    descAr: 'عنوان بريد إلكتروني صالح',
    icon: Mail,
  },
  {
    type: 'file_upload',
    labelEn: 'File Upload',
    labelAr: 'رفع ملف أو مرفق',
    descEn: 'PDFs, images, or documents',
    descAr: 'رفع مستندات أو صور أو ملفات',
    icon: UploadCloud,
    badge: 'Supabase Storage',
  },
  {
    type: 'ranking',
    labelEn: 'Ranking',
    labelAr: 'ترتيب الأولويات',
    descEn: 'Drag to rank items by preference',
    descAr: 'سحب وترتيب العناصر بالأولوية',
    icon: ArrowDownUp,
  },
  {
    type: 'section_header',
    labelEn: 'Section Divider',
    labelAr: 'فاصل قسم جديد',
    descEn: 'Break form into pages or chapters',
    descAr: 'تقسيم النموذج إلى صفحات ومراحل',
    icon: Split,
    badge: 'Page Break',
  },
];

export const QuestionTypePicker: React.FC<QuestionTypePickerProps> = ({
  isOpen,
  onClose,
  onSelectType,
}) => {
  const { isArabic } = useLanguage();

  if (!isOpen) return null;

  return (
    <Dialog onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-card/95 border border-white/10 rounded-2xl p-6 shadow-2xl glass cyber-glow"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-cyber text-foreground">
                {isArabic ? 'إضافة سؤال جديد' : 'Add New Question'}
              </h3>
              <p className="text-xs text-muted-foreground">
                {isArabic ? 'اختر نوع الحقل أو العنصر المناسب لنموذجك' : 'Choose question format inspired by Microsoft Forms'}
              </p>
            </div>
          </div>
          <button aria-label="Close"
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[65vh] overflow-y-auto custom-scrollbar p-1">
          {QUESTION_TYPES.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.type}
                onClick={() => {
                  onSelectType(opt.type);
                  onClose();
                }}
                className="flex items-start space-x-3 rtl:space-x-reverse p-3.5 rounded-xl border border-white/5 bg-background/40 hover:bg-primary/10 hover:border-primary/40 transition-all text-left rtl:text-right group hover:scale-[1.02]"
              >
                <div className="p-2.5 rounded-lg bg-white/5 group-hover:bg-primary/20 group-hover:text-primary transition-colors shrink-0 text-muted-foreground">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                      {isArabic ? opt.labelAr : opt.labelEn}
                    </span>
                    {opt.badge && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">
                        {opt.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">
                    {isArabic ? opt.descAr : opt.descEn}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </Dialog>
  );
};
