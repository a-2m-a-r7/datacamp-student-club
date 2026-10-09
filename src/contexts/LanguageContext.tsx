import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'ar' | 'en';

export interface LanguageContextType {
  language: Language;
  isArabic: boolean;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
  dir: 'rtl' | 'ltr';
}

const translations: Record<Language, Record<string, string>> = {
  ar: {
    // Navigation
    'nav.home': 'الرئيسية',
    'nav.courses': 'الدورات التدريبية',
    'nav.compiler': 'محرر الأكواد',
    'nav.leaderboard': 'لوحة المتصدرين',
    'nav.certificates': 'الشهادات المعتمدة',
    'nav.notifications': 'الإشعارات',
    'nav.events': 'الفعاليات والورش',
    'nav.projects': 'المشاريع',
    'nav.blog': 'المدونة',
    'nav.staff': 'فريق العمل',
    'nav.gallery': 'معرض الصور',
    'nav.about': 'عن النادي',
    'nav.contact': 'اتصل بنا',
    'nav.faq': 'الأسئلة الشائعة',
    'nav.profile': 'الملف الشخصي',
    'nav.login': 'تسجيل الدخول',
    'nav.logout': 'تسجيل الخروج',
    'nav.admin': 'لوحة الإدارة',
    'nav.dashboard': 'لوحة التحكم',
    'nav.main_menu': 'القائمة الرئيسية',
    'nav.admin_portal': 'بوابة الإدارة',

    // Hero Section
    'hero.badge': 'النادي الطلابي المعتمد • جامعة الابتكار',
    'hero.title': 'مستقبل علم البيانات والذكاء الاصطناعي يبدأ هنا',
    'hero.subtitle': 'انضم إلى مجتمع طلابي نخبوي يتقن هندسة البيانات، والذكاء الاصطناعي، ومحرر الأكواد التفاعلي مع شهادات أكاديمية معتمدة.',
    'hero.cta_courses': 'استكشف الدورات',
    'hero.cta_compiler': 'تشغيل محرر الأكواد',
    'hero.cta_join': 'انضم للنادي الآن',

    // Stats
    'stats.members': 'عضو مسجل',
    'stats.events': 'فعالية وورشة',
    'stats.projects': 'مشروع معتمد',
    'stats.certificates': 'شهادة صادرة',
    'stats.xp': 'نقطة XP مكتسبة',

    // Tracks / Features
    'features.data_science': 'علم البيانات والتحليل',
    'features.data_science_desc': 'إتقان بايثون، ومكتبات Pandas و NumPy وبناء النماذج الإحصائية مع ورش تدريبية متخصصة.',
    'features.ai_ml': 'الذكاء الاصطناعي وتعلم الآلة',
    'features.ai_ml_desc': 'غوص عميق في الشبكات العصبية، ورؤية الحاسوب، ومعالجة اللغات الطبيعية باستخدام PyTorch.',
    'features.software_eng': 'هندسة البرمجيات والأنظمة',
    'features.software_eng_desc': 'بناء تطبيقات متكاملة واكتساب أفضل ممارسات كتابة الكود النظيف وإدارة المشاريع.',

    // Common UI
    'ui.language': 'اللغة',
    'ui.arabic': 'العربية',
    'ui.english': 'English',
    'ui.switch_language': 'تغيير اللغة',
    'ui.search': 'بحث...',
    'ui.filter': 'تصفية',
    'ui.all': 'الكل',
    'ui.view_all': 'عرض الكل',
    'ui.read_more': 'اقرأ المزيد',
    'ui.enroll_now': 'سجل في المسار',
    'ui.start_learning': 'ابدأ التعلم',
    'ui.run_code': 'تنفيذ الكود',
    'ui.copy': 'نسخ',
    'ui.copied': 'تم النسخ!',
    'ui.share': 'مشاركة',
    'ui.download_pdf': 'تحميل PDF',
    'ui.verify': 'تحقق من الشهادة',
    'ui.level': 'المستوى',
    'ui.xp_points': 'نقطة XP',
    'ui.hours': 'ساعة',
    'ui.lessons': 'درس',
    'ui.quizzes': 'اختبارات',
    'ui.back': 'رجوع',
    'ui.save': 'حفظ',
    'ui.cancel': 'إلغاء',
    'ui.loading': 'جاري التحميل...',
    'ui.connecting': 'جاري الاتصال...',

    // AI Mentor
    'ai.title': 'مرشدك الذكي NEXUS',
    'ai.subtitle': 'مدعوم بالذكاء الاصطناعي وقاعدة بيانات النادي',
    'ai.placeholder': 'اسأل NEXUS عن الدورات، الأكواد، الفعاليات، أو خطة تعلمك...',
    'ai.send': 'إرسال',
    'ai.new_chat': 'محادثة جديدة',
    'ai.refresh': 'تحديث البيانات',
    'ai.welcome': 'مرحباً بك! أنا NEXUS، مرشدك الذكي في نادي DataCamp بجامعة الابتكار. كيف يمكنني مساعدتك اليوم؟',
    'ai.prompt_courses': '🗺️ ما هي الدورات المتاحة وكيف أبدأ؟',
    'ai.prompt_python': '🐍 اشرح لي كود بايثون وهياكل البيانات',
    'ai.prompt_xp': '⚡ كيف أجمع نقاط XP وأرتقي بالترتيب؟',
    'ai.prompt_path': '🎯 اصنع لي خطة تدريبية لـ 4 أسابيع',

    // Footer
    'footer.quick_links': 'روابط سريعة',
    'footer.tracks': 'المسارات الأكاديمية',
    'footer.university': 'جامعة الابتكار',
    'footer.rights': 'جميع الحقوق محفوظة © نادي داتا كامب الطلابي بجامعة الابتكار.',
    'footer.description': 'تمكين الطلاب من إتقان علم البيانات، الذكاء الاصطناعي، وهندسة البرمجيات عبر تعليم تفاعلي وشهادات معتمدة.',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.courses': 'Courses',
    'nav.compiler': 'Online Compiler',
    'nav.leaderboard': 'Leaderboard',
    'nav.certificates': 'Certificates',
    'nav.notifications': 'Notifications',
    'nav.events': 'Events',
    'nav.projects': 'Projects',
    'nav.blog': 'Blog',
    'nav.staff': 'Staff & Board',
    'nav.gallery': 'Gallery',
    'nav.about': 'About Us',
    'nav.contact': 'Contact',
    'nav.faq': 'FAQ',
    'nav.profile': 'Profile',
    'nav.login': 'Login System',
    'nav.logout': 'Logout',
    'nav.admin': 'Admin Portal',
    'nav.dashboard': 'Dashboard',
    'nav.main_menu': 'Main Menu',
    'nav.admin_portal': 'Admin Portal',

    // Hero Section
    'hero.badge': 'Official University Chapter • Innovation University',
    'hero.title': 'THE FUTURE OF DATA IS HERE',
    'hero.subtitle': 'Accelerate your trajectory in Data Science, Artificial Intelligence, and Software Engineering with an elite student-led community.',
    'hero.cta_courses': 'EXPLORE COURSES',
    'hero.cta_compiler': 'LAUNCH COMPILER',
    'hero.cta_join': 'JOIN CLUB NOW',

    // Stats
    'stats.members': 'Active Operatives',
    'stats.events': 'Missions Hosted',
    'stats.projects': 'Projects Completed',
    'stats.certificates': 'Credentials Issued',
    'stats.xp': 'Total XP Earned',

    // Tracks / Features
    'features.data_science': 'Data Science & Analytics',
    'features.data_science_desc': 'Master Python, R, and statistical modeling with our expert-led workshops.',
    'features.ai_ml': 'AI & Machine Learning',
    'features.ai_ml_desc': 'Deep dive into neural networks, computer vision, and natural language processing.',
    'features.software_eng': 'Software Engineering',
    'features.software_eng_desc': 'Build scalable applications using modern stacks and industry best practices.',

    // Common UI
    'ui.language': 'Language',
    'ui.arabic': 'العربية',
    'ui.english': 'English',
    'ui.switch_language': 'Switch Language',
    'ui.search': 'Search...',
    'ui.filter': 'Filter',
    'ui.all': 'All',
    'ui.view_all': 'View All',
    'ui.read_more': 'Read More',
    'ui.enroll_now': 'Enroll Now',
    'ui.start_learning': 'Start Learning',
    'ui.run_code': 'Run Code',
    'ui.copy': 'Copy',
    'ui.copied': 'Copied!',
    'ui.share': 'Share',
    'ui.download_pdf': 'Download PDF',
    'ui.verify': 'Verify Credential',
    'ui.level': 'Level',
    'ui.xp_points': 'XP Points',
    'ui.hours': 'Hours',
    'ui.lessons': 'Lessons',
    'ui.quizzes': 'Quizzes',
    'ui.back': 'Back',
    'ui.save': 'Save',
    'ui.cancel': 'Cancel',
    'ui.loading': 'Loading...',
    'ui.connecting': 'Connecting...',

    // AI Mentor
    'ai.title': 'NEXUS AI MENTOR',
    'ai.subtitle': 'RAG Neural Intelligence & Database Synced',
    'ai.placeholder': 'Ask NEXUS about courses, events, XP, or code...',
    'ai.send': 'Transmit',
    'ai.new_chat': 'New Session',
    'ai.refresh': 'Refresh Context',
    'ai.welcome': 'Greetings! I am NEXUS, your DataCamp Club AI Mentor at Innovation University. How can I accelerate your learning trajectory today?',
    'ai.prompt_courses': '🗺️ Which course should I start with?',
    'ai.prompt_python': '🐍 Explain Python list & dict performance',
    'ai.prompt_xp': '⚡ How do I level up and earn XP fast?',
    'ai.prompt_path': '🎯 Create a 4-week data roadmap',

    // Footer
    'footer.quick_links': 'Quick Links',
    'footer.tracks': 'Academic Tracks',
    'footer.university': 'Innovation University',
    'footer.rights': 'All rights reserved © DataCamp Student Club • Innovation University.',
    'footer.description': 'Empowering students with data science, AI, and software engineering skills through real-time code execution and verified credentials.',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to Arabic or user's stored preference
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('datacamp_language');
    if (saved === 'en' || saved === 'ar') return saved;
    return 'ar'; // Default to Arabic as requested by user
  });

  const isArabic = language === 'ar';
  const dir = isArabic ? 'rtl' : 'ltr';

  useEffect(() => {
    localStorage.setItem('datacamp_language', language);
    document.documentElement.setAttribute('lang', language);
    document.documentElement.setAttribute('dir', dir);
    
    // Set appropriate font class
    if (isArabic) {
      document.documentElement.classList.add('lang-ar');
      document.documentElement.classList.remove('lang-en');
    } else {
      document.documentElement.classList.add('lang-en');
      document.documentElement.classList.remove('lang-ar');
    }
  }, [language, dir, isArabic]);

  const toggleLanguage = () => {
    setLanguageState(prev => (prev === 'ar' ? 'en' : 'ar'));
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string, fallback?: string): string => {
    return translations[language]?.[key] || fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, isArabic, toggleLanguage, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
