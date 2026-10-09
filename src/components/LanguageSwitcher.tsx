import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Globe } from 'lucide-react';
import { motion } from 'motion/react';

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'compact' | 'toggle' | 'sidebar' | 'pill';
  isCollapsed?: boolean;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className = '',
  variant = 'toggle',
  isCollapsed = false,
}) => {
  const { language, isArabic, toggleLanguage, setLanguage } = useLanguage();

  if (variant === 'sidebar') {
    if (isCollapsed) {
      return (
        <button
          onClick={toggleLanguage}
          title={isArabic ? 'Switch to English' : 'التحويل إلى العربية'}
          className={`w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 hover:border-primary/50 flex items-center justify-center text-primary transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,255,204,0.3)] mx-auto ${className}`}
        >
          <span className="text-[11px] font-bold font-cyber">{isArabic ? 'EN' : 'ع'}</span>
        </button>
      );
    }

    return (
      <div className={`p-1 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between gap-1 ${className}`}>
        <button
          type="button"
          onClick={() => setLanguage('ar')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1.5 ${
            isArabic
              ? 'bg-primary text-dark-navy shadow-[0_0_12px_rgba(0,255,204,0.35)]'
              : 'text-muted-foreground hover:text-white hover:bg-white/5'
          }`}
        >
          <span>العربية</span>
        </button>
        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1.5 ${
            !isArabic
              ? 'bg-primary text-dark-navy shadow-[0_0_12px_rgba(0,255,204,0.35)]'
              : 'text-muted-foreground hover:text-white hover:bg-white/5'
          }`}
        >
          <span className="font-cyber">English</span>
        </button>
      </div>
    );
  }

  if (variant === 'pill' || variant === 'compact') {
    return (
      <button
        onClick={toggleLanguage}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/15 hover:border-primary/50 text-xs font-medium text-slate-200 hover:text-primary transition-all duration-300 backdrop-blur-md shadow-[0_2px_12px_rgba(0,0,0,0.2)] hover:shadow-[0_0_15px_rgba(0,255,204,0.25)] ${className}`}
        title={isArabic ? 'Switch to English' : 'التحويل إلى العربية'}
      >
        <Globe className="w-3.5 h-3.5 text-primary" />
        <span className="font-bold">{isArabic ? 'English' : 'العربية'}</span>
      </button>
    );
  }

  // Default sleek cyber toggle
  return (
    <div
      className={`inline-flex items-center p-1 rounded-xl bg-dark-navy/80 border border-white/15 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.3)] ${className}`}
      dir="ltr"
    >
      <button
        type="button"
        onClick={() => setLanguage('ar')}
        className={`relative px-3 py-1 text-xs font-bold transition-all duration-200 rounded-lg flex items-center gap-1.5 ${
          isArabic ? 'text-dark-navy' : 'text-slate-400 hover:text-white'
        }`}
      >
        {isArabic && (
          <motion.div
            layoutId="lang-active-pill"
            className="absolute inset-0 bg-primary rounded-lg shadow-[0_0_12px_rgba(0,255,204,0.4)]"
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}
        <span className="relative z-10 font-bold">العربية</span>
      </button>

      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`relative px-3 py-1 text-xs font-bold transition-all duration-200 rounded-lg flex items-center gap-1.5 ${
          !isArabic ? 'text-dark-navy' : 'text-slate-400 hover:text-white'
        }`}
      >
        {!isArabic && (
          <motion.div
            layoutId="lang-active-pill"
            className="absolute inset-0 bg-primary rounded-lg shadow-[0_0_12px_rgba(0,255,204,0.4)]"
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}
        <span className="relative z-10 font-cyber font-bold">EN</span>
      </button>
    </div>
  );
};
