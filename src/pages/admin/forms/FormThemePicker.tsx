import { Dialog } from '../../../components/ui/Dialog';
/**
 * src/pages/admin/forms/FormThemePicker.tsx
 * Visual theme & color palette selector for forms
 */

import React from 'react';
import { Palette, Check, Sparkles, X } from 'lucide-react';
import { FormTheme } from '../../../types/forms';
import { useLanguage } from '../../../contexts/LanguageContext';

interface FormThemePickerProps {
  isOpen: boolean;
  onClose: () => void;
  theme: FormTheme;
  onChange: (updatedTheme: FormTheme) => void;
}

interface ThemePreset {
  id: string;
  nameEn: string;
  nameAr: string;
  primary: string;
  accent: string;
  backgroundStyle: 'cyber' | 'gradient' | 'minimal' | 'glow';
}

const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'cyber-indigo',
    nameEn: 'Cyber Indigo',
    nameAr: 'نيلي سيبراني',
    primary: '#6366f1',
    accent: '#06b6d4',
    backgroundStyle: 'cyber',
  },
  {
    id: 'neon-emerald',
    nameEn: 'Matrix Emerald',
    nameAr: 'زمردي مصفوفي',
    primary: '#10b981',
    accent: '#3b82f6',
    backgroundStyle: 'cyber',
  },
  {
    id: 'hyper-violet',
    nameEn: 'Hyper Violet',
    nameAr: 'بنفسجي هايبر',
    primary: '#8b5cf6',
    accent: '#ec4899',
    backgroundStyle: 'glow',
  },
  {
    id: 'crimson-amber',
    nameEn: 'Solar Flare',
    nameAr: 'توهج شمسي',
    primary: '#f59e0b',
    accent: '#ef4444',
    backgroundStyle: 'gradient',
  },
  {
    id: 'synth-rose',
    nameEn: 'Synthwave Rose',
    nameAr: 'وردي سينثويف',
    primary: '#ec4899',
    accent: '#8b5cf6',
    backgroundStyle: 'glow',
  },
  {
    id: 'stealth-dark',
    nameEn: 'Stealth Minimal',
    nameAr: 'مظلم هادئ',
    primary: '#38bdf8',
    accent: '#94a3b8',
    backgroundStyle: 'minimal',
  },
];

export const FormThemePicker: React.FC<FormThemePickerProps> = ({
  isOpen,
  onClose,
  theme,
  onChange,
}) => {
  const { isArabic } = useLanguage();

  if (!isOpen) return null;

  return (
    <Dialog onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-card/95 border border-white/10 rounded-2xl p-6 shadow-2xl glass cyber-glow"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-cyber text-foreground">
                {isArabic ? 'مظهر وتنسيق النموذج' : 'Form Theme & Style'}
              </h3>
              <p className="text-xs text-muted-foreground">
                {isArabic ? 'خصص الألوان ونمط العرض للمجيبين' : 'Customize palette and accents for respondents'}
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

        <div className="space-y-4">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
            {isArabic ? 'حزم الألوان الجاهزة' : 'Theme Presets'}
          </label>

          <div className="grid grid-cols-2 gap-3">
            {THEME_PRESETS.map((p) => {
              const isSelected = theme.primaryColor === p.primary;
              return (
                <button
                  key={p.id}
                  onClick={() =>
                    onChange({
                      ...theme,
                      primaryColor: p.primary,
                      accentColor: p.accent,
                      backgroundStyle: p.backgroundStyle,
                    })
                  }
                  className={`p-3 rounded-xl border text-left rtl:text-right transition-all flex items-center justify-between group ${
                    isSelected
                      ? 'border-primary bg-primary/10 shadow-lg shadow-primary/10'
                      : 'border-white/5 bg-background/50 hover:border-white/20 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
                    <div className="flex -space-x-1 rtl:-space-x-reverse">
                      <div
                        className="w-5 h-5 rounded-full border border-white/20 shadow-sm"
                        style={{ backgroundColor: p.primary }}
                      />
                      <div
                        className="w-5 h-5 rounded-full border border-white/20 shadow-sm"
                        style={{ backgroundColor: p.accent }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-foreground">
                      {isArabic ? p.nameAr : p.nameEn}
                    </span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Custom Color Pickers */}
          <div className="pt-3 border-t border-white/5 grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-muted-foreground block mb-1.5">
                {isArabic ? 'اللون الرئيسي:' : 'Primary Color:'}
              </label>
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg p-2">
                <input
                  type="color"
                  value={theme.primaryColor || '#6366f1'}
                  onChange={(e) => onChange({ ...theme, primaryColor: e.target.value })}
                  className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent p-0"
                />
                <span className="font-mono text-[11px] text-foreground">{theme.primaryColor}</span>
              </div>
            </div>

            <div>
              <label className="text-muted-foreground block mb-1.5">
                {isArabic ? 'لون التمييز:' : 'Accent Color:'}
              </label>
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg p-2">
                <input
                  type="color"
                  value={theme.accentColor || '#06b6d4'}
                  onChange={(e) => onChange({ ...theme, accentColor: e.target.value })}
                  className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent p-0"
                />
                <span className="font-mono text-[11px] text-foreground">{theme.accentColor}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors"
          >
            {isArabic ? 'تم وتطبيق' : 'Apply Theme'}
          </button>
        </div>
      </div>
    </Dialog>
  );
};
