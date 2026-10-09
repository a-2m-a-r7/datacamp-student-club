import React, { useState } from 'react';
import { Bot, Sparkles } from 'lucide-react';
import { AIMentorModal } from './AIMentorModal';
import { motion } from 'motion/react';
import { useLanguage } from '../../contexts/LanguageContext';

export const AIMentorButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isArabic } = useLanguage();

  return (
    <>
      <div 
        className={`fixed bottom-6 z-40 flex items-center group ${
          isArabic ? 'left-6' : 'right-6'
        }`}
      >
        <motion.div
          initial={{ opacity: 0, x: isArabic ? -10 : 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="me-3 hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-dark-navy/90 border border-primary/40 text-primary text-[11px] font-cyber shadow-[0_0_15px_rgba(0,255,204,0.15)] pointer-events-none group-hover:opacity-100 transition-opacity"
        >
          <Sparkles className="w-3 h-3 text-primary animate-spin" />
          <span>{isArabic ? 'مرشد NEXUS الذكي' : 'NEXUS AI MENTOR'}</span>
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="relative w-14 h-14 rounded-full bg-primary/10 border-2 border-primary text-primary flex items-center justify-center shadow-[0_0_25px_rgba(0,255,204,0.35)] hover:shadow-[0_0_35px_rgba(0,255,204,0.6)] hover:bg-primary hover:text-black transition-all duration-300"
          aria-label={isArabic ? 'فتح مرشد الذكاء الاصطناعي NEXUS' : 'Open AI Mentor'}
        >
          <Bot className="w-7 h-7" />
          <span className={`absolute -top-1 flex h-3.5 w-3.5 ${isArabic ? '-left-1' : '-right-1'}`}>
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border border-dark-navy" />
          </span>
        </motion.button>
      </div>

      <AIMentorModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
