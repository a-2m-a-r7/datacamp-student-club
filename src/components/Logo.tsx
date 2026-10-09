import React, { useState } from 'react';
import { motion } from 'motion/react';

interface LogoProps {
  className?: string;
  iconSize?: number;
  textSize?: string;
  subtextSize?: string;
  isCollapsed?: boolean;
  showPartner?: boolean;
}

// ─── DataCamp Official Emblem (Mark Only • No Text) ─────────────────────────
export const DataCampOfficialLogo = ({ 
  size = 44, 
  className = '', 
}: { 
  size?: number; 
  className?: string; 
  isCompact?: boolean; 
}) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className={`relative rounded-xl overflow-hidden bg-white p-1.5 border border-[#03EF62]/50 shadow-[0_0_16px_rgba(3,239,98,0.25)] flex items-center justify-center transition-all duration-300 hover:shadow-[0_0_24px_rgba(3,239,98,0.45)] hover:scale-105 shrink-0 ${className}`}
      style={{ width: size, height: size }}
      title="DataCamp Official Emblem"
    >
      {!imgError ? (
        <img
          src="/logos/datacamp-mark.png"
          alt="DataCamp Emblem"
          className="w-full h-full object-contain"
          onError={() => setImgError(true)}
        />
      ) : (
        <svg
          viewBox="0 0 24 24"
          fill="#03EF62"
          className="w-full h-full p-0.5"
        >
          <path d="M12.946 18.151v-5.239L21.209 8.2 19.2 7.048l-6.254 3.567V5.36c0-.356-.192-.689-.5-.866L4.922.177a1.434 1.434 0 0 0-1.455.044 1.438 1.438 0 0 0-.676 1.224v14.777A1.44 1.44 0 0 0 4.92 17.49l6.032-3.44v4.683a1 1 0 0 0 .504.867l7.73 4.4 2.01-1.152-8.25-4.697zM10.953 5.938v5.814L4.785 15.27V2.4l6.168 3.539v-.001z"/>
        </svg>
      )}
    </div>
  );
};

// ─── Innovation University Official Crest (Mark Only • No Text) ─────────────
export const InnovationUniversityOfficialLogo = ({ 
  size = 44, 
  className = '', 
}: { 
  size?: number; 
  className?: string; 
  isCompact?: boolean; 
}) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className={`relative rounded-xl overflow-hidden bg-[#45287c] p-1.5 border border-purple-400/50 shadow-[0_0_16px_rgba(147,51,234,0.3)] flex items-center justify-center transition-all duration-300 hover:shadow-[0_0_24px_rgba(147,51,234,0.5)] hover:scale-105 shrink-0 ${className}`}
      style={{ width: size, height: size }}
      title="Innovation University Crest"
    >
      {!imgError ? (
        <img
          src="/logos/innovation-university-mark.png"
          alt="Innovation University Crest"
          className="w-full h-full object-contain"
          onError={() => setImgError(true)}
        />
      ) : (
        <svg viewBox="0 0 32 32" fill="none" className="w-full h-full p-0.5">
          <path d="M14 6C9 6 6 10 6 16C6 22 9 26 14 26V6Z" fill="white" />
          <path d="M18 6C23 6 26 10 26 16C26 22 23 26 18 26V6Z" fill="white" />
        </svg>
      )}
    </div>
  );
};

// ─── Dual-Branded Interface Logos (100% Visual Marks • Zero Names • No 'X') ─
const Logo: React.FC<LogoProps> = ({ 
  className = "", 
  iconSize = 44, 
  isCollapsed = false,
  showPartner = true,
}) => {
  if (isCollapsed) {
    return (
      <div className={`flex flex-col items-center gap-2.5 py-1 ${className}`}>
        <DataCampOfficialLogo size={Math.max(30, iconSize - 8)} />
        {showPartner && (
          <InnovationUniversityOfficialLogo size={Math.max(30, iconSize - 8)} />
        )}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2.5 p-1.5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.25)] hover:border-white/20 transition-all ${className}`}>
      {/* 1. Official DataCamp Green Emblem */}
      <motion.div 
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
        className="shrink-0"
      >
        <DataCampOfficialLogo size={iconSize} />
      </motion.div>

      {/* 2. Official Innovation University Crest */}
      {showPartner && (
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
          className="shrink-0"
        >
          <InnovationUniversityOfficialLogo size={iconSize} />
        </motion.div>
      )}
    </div>
  );
};

export default Logo;
