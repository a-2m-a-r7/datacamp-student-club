import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, ChevronDown, BookOpen, Award, Users, Zap, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useLanguage } from '../contexts/LanguageContext';
import { Link } from 'react-router-dom';

interface FAQItem {
  question: string;
  answer: string;
  category: 'general' | 'courses' | 'points' | 'certificates' | 'membership';
}

const FAQS_EN: FAQItem[] = [
  {
    category: 'general',
    question: 'What is DataCamp Student Club at Innovation University?',
    answer: 'DataCamp Student Club is an officially chartered academic tech community at Innovation University. We empower university students with industry-grade skills across Data Science, Machine Learning, Business Intelligence, and Software Engineering through applied bootcamps, real datasets, and hackathons.'
  },
  {
    category: 'general',
    question: 'Is club membership free for university students?',
    answer: 'Yes! Membership is 100% free for all students at Innovation University and affiliated collegiate partners. You can register using either your official university email (@edu.eg) or personal email to access all interactive lessons, events, and the online compiler.'
  },
  {
    category: 'membership',
    question: 'How do I register with my official University email?',
    answer: 'Simply choose the "University Email" tab on the Register page and input your official institutional email. University accounts receive automatic verification status, institutional affiliation tags, and eligibility for academic leadership roles.'
  },
  {
    category: 'courses',
    question: 'How do the interactive courses and exercises work?',
    answer: 'Each track contains modular units featuring video explanations, architectural diagrams, structured readings, and integrated code challenges executed directly in your browser. Completing quizzes and exercises earns XP toward track completion.'
  },
  {
    category: 'courses',
    question: 'What programming languages are supported in the compiler?',
    answer: 'Our universal compiler engine supports Python 3 with vector math libraries, JavaScript and TypeScript, SQL for relational data queries, plus C++, Java, R, Go, and Rust via cloud execution runners.'
  },
  {
    category: 'points',
    question: 'How does the Points (XP) and Ranking system work?',
    answer: 'You accumulate Experience Points (XP) by finishing units, completing exercises, attending campus events, and earning high quiz scores. As your XP grows, your operative rank elevates from RECRUIT to SPECIALIST, ANALYST, LEAD, and ultimately ARCHITECT on the public Leaderboard.'
  },
  {
    category: 'certificates',
    question: 'How are verified digital certificates generated?',
    answer: 'Upon finishing 100% of a course curriculum and passing assessment benchmarks, the system automatically creates a tamper-proof digital credential featuring a unique verification hash, QR code, and official dual seals from DataCamp Club and Innovation University. You can export it as an A4 PDF or publish to LinkedIn.'
  },
  {
    category: 'certificates',
    question: 'How can employers or universities verify a certificate?',
    answer: 'Anyone can visit our public verification portal (/verify-certificate) and input the certificate code or scan the QR code to instantly validate student identity, course syllabus, completion date, and institutional authenticity.'
  },
  {
    category: 'membership',
    question: 'How can I apply for club executive committees (High Board / Organizers)?',
    answer: 'Recruitment cycles open at the beginning of each academic semester across Academic, Tech, Media & PR, Operations, and HR committees. Watch the Events tab and Announcements for open application calls.'
  }
];

const FAQS_AR: FAQItem[] = [
  {
    category: 'general',
    question: 'ما هو نادي DataCamp الطلابي بجامعة الابتكار؟',
    answer: 'نادي DataCamp هو مجتمع تقني وأكاديمي رسمي معتمد بجامعة الابتكار. يهدف النادي إلى تمكين طلاب الجامعة من إتقان علم البيانات، والذكاء الاصطناعي، وهندسة البرمجيات، عبر معسكرات تدريبية عملية وتحديات برمجية حقيقية وهاكاثونات.'
  },
  {
    category: 'general',
    question: 'هل عضوية النادي مجانية للطلاب؟',
    answer: 'نعم! العضوية مجانية بالكامل بنسبة 100% لجميع طلاب جامعة الابتكار والجامعات الشريكة. يمكنك التسجيل ببريدك الجامعي الرسمي (@edu.eg) أو ببريدك الشخصي للوصول المباشر إلى جميع الدورات والمحرر والفعاليات.'
  },
  {
    category: 'membership',
    question: 'كيف أسجل باستخدام البريد الجامعي الرسمي؟',
    answer: 'اختر تبويب البريد الجامعي في صفحة التسجيل واكتب بريدك الجامعي. تحصل الحسابات الجامعية على شارة التحقق الأكاديمي التلقائي وأولوية الانضمام للجان القيادية وورش العمل المتقدمة.'
  },
  {
    category: 'courses',
    question: 'كيف تسير الدورات والدروس التفاعلية؟',
    answer: 'يحتوي كل مسار تدريبي على وحدات تتضمن شروحات ومخططات وتحديات برمجية مباشرة تُنفذ وتُصحح داخل المتصفح تلقائياً. عند إتمام التمارين والاختبارات القصيرة، تكسب نقاط XP ترتقي بك في لوحة المتصدرين.'
  },
  {
    category: 'courses',
    question: 'ما هي اللغات البرمجية المدعومة في محرر الأكواد؟',
    answer: 'يدعم المحرر لغات متعددة تشمل Python 3 مع مكتبات التحليل الرياضي، و JavaScript، و TypeScript، ولغة SQL للاستعلامات، بالإضافة إلى C++ و Java و R عبر خوادم التنفيذ السحابية.'
  },
  {
    category: 'points',
    question: 'كيف يعمل نظام نقاط الخبرة (XP) والتصنيفات؟',
    answer: 'تكتسب نقاط XP بمجرد إكمال الدروس وحل التحديات وحضور الفعاليات واجتياز الاختبارات. ومع زيادة نقاطك يرتفع تصنيفك من مبتدئ إلى أخصائي، ثم محلل، فقائد، وصولاً إلى مهندس معماري (ARCHITECT).'
  },
  {
    category: 'certificates',
    question: 'كيف يتم إصدار الشهادات الرقمية المعتمدة؟',
    answer: 'بمجرد إكمال 100% من متطلبات أي دورة واجتياز تقييمها النهائي، يُصدر النظام شهادة رقمية مشفرة برمز QR وختمين رسميين من نادي DataCamp وجامعة الابتكار. يمكنك تصديرها كملف PDF عالي الجودة أو مشاركتها على LinkedIn.'
  },
  {
    category: 'certificates',
    question: 'كيف يمكن للشركات أو جهات التوظيف التحقق من صحة الشهادة؟',
    answer: 'يمكن لأي جهة زيارة بوابة التحقق المباشرة (/certificates) وإدخال كود الشهادة أو مسح رمز QR للتأكد فوراً من هوية الطالب وتاريخ التخرج ومفردات المنهج المعتمد.'
  },
  {
    category: 'membership',
    question: 'كيف يمكنني الانضمام إلى اللجان التنظيمية (High Board / اللجان)؟',
    answer: 'يُفتح باب التقديم للجان مع بداية كل فصل دراسي في لجان: الأكاديمية، والتقنية، والإعلام، والعمليات، والموارد البشرية. تابع تبويب الفعاليات والإشعارات لمعرفة مواعيد المقابلات.'
  }
];

export const FAQ = () => {
  const { isArabic } = useLanguage();
  const [selectedCat, setSelectedCat] = useState('all');
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [searchTerm, setSearchTerm] = useState('');

  const categories = isArabic ? [
    { id: 'all', label: 'جميع الأسئلة', icon: HelpCircle },
    { id: 'general', label: 'عامة', icon: Zap },
    { id: 'courses', label: 'الدورات والمحرر', icon: BookOpen },
    { id: 'points', label: 'النقاط والتصنيف', icon: Award },
    { id: 'certificates', label: 'الشهادات المعتمدة', icon: ShieldCheck },
    { id: 'membership', label: 'العضوية واللجان', icon: Users },
  ] : [
    { id: 'all', label: 'ALL INQUIRIES', icon: HelpCircle },
    { id: 'general', label: 'GENERAL', icon: Zap },
    { id: 'courses', label: 'COURSES & COMPILER', icon: BookOpen },
    { id: 'points', label: 'XP & RANKINGS', icon: Award },
    { id: 'certificates', label: 'CERTIFICATES', icon: ShieldCheck },
    { id: 'membership', label: 'MEMBERSHIP & TEAMS', icon: Users },
  ];

  const activeFaqs = isArabic ? FAQS_AR : FAQS_EN;

  const filteredFaqs = activeFaqs.filter(faq => {
    const matchesCat = selectedCat === 'all' || faq.category === selectedCat;
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="pt-20 md:pt-32 pb-24 min-h-screen">
      <div className="container mx-auto px-6 max-w-5xl">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-cyber tracking-widest uppercase mb-4">
            <HelpCircle className="w-3.5 h-3.5" /> 
            {isArabic ? 'قاعدة المعرفة والاستفسارات' : 'KNOWLEDGE PROTOCOL'}
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black font-cyber tracking-tighter mb-4 neon-text">
            {isArabic ? 'الأسئلة' : 'FREQUENTLY ASKED'} <span className="text-white">{isArabic ? 'الشائعة والمساعدة' : 'QUESTIONS'}</span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            {isArabic
              ? 'معلومات أساسية وإجابات شاملة حول نادي DataCamp بجامعة الابتكار، والمسارات الأكاديمية، والشهادات المعتمدة، ومحرر الأكواد.'
              : 'Essential information regarding DataCamp Student Club at Innovation University, curriculum pathways, verified certificates, and compiler execution.'
            }
          </p>

          {/* Search */}
          <div className="mt-8 relative max-w-md mx-auto">
            <input
              type="text"
              placeholder={isArabic ? 'ابحث في الأسئلة الشائعة والأجوبة...' : 'Search questions & answers...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-5 py-3 rounded-2xl bg-dark-navy/80 border border-white/10 text-white placeholder-muted-foreground/60 focus:border-primary focus:outline-none text-sm transition-all shadow-inner"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCat === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-cyber tracking-wider transition-all ${
                  isSelected
                    ? 'bg-primary text-dark-navy font-bold shadow-[0_0_15px_rgba(0,255,204,0.4)]'
                    : 'bg-white/5 border border-white/10 text-muted-foreground hover:text-white hover:border-white/20'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-16 glass rounded-3xl border border-white/10 p-8">
              <HelpCircle className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
              <h3 className="font-cyber text-lg text-white mb-2">
                {isArabic ? 'لم يتم العثور على نتائج مطابقة' : 'NO MATCHING ANSWERS FOUND'}
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                {isArabic ? 'لم تتطابق أي نتيجة مع كلمات بحثك. يمكنك التواصل مع فريقنا مباشرة.' : 'No inquiry matched your search parameters. Reach out to our team directly.'}
              </p>
              <Link to="/contact">
                <Button variant="cyber">
                  {isArabic ? 'تواصل مع الدعم' : 'CONTACT SUPPORT'}
                </Button>
              </Link>
            </div>
          ) : (
            filteredFaqs.map((faq, idx) => {
              const isOpen = openIdx === idx;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`glass rounded-2xl border transition-all overflow-hidden ${
                    isOpen ? 'border-primary/40 bg-dark-navy/80 shadow-[0_0_20px_rgba(0,255,204,0.06)]' : 'border-white/10 hover:border-white/20 bg-dark-navy/40'
                  }`}
                >
                  <button
                    onClick={() => setOpenIdx(isOpen ? null : idx)}
                    className="w-full p-6 text-left flex items-center justify-between gap-4 transition-colors"
                  >
                    <span className="font-cyber font-bold text-base sm:text-lg text-white flex items-center gap-3">
                      <span className="text-primary font-mono text-sm">0{idx + 1}.</span>
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-primary shrink-0 transition-transform duration-300 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="px-6 pb-6 pt-2 text-sm text-muted-foreground leading-relaxed border-t border-white/5">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Bottom CTA Box */}
        <div className="mt-20 p-8 md:p-12 rounded-3xl glass border border-primary/20 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl font-cyber font-bold text-white">
              {isArabic ? 'ما زال لديك استفسارات؟' : 'Still have questions?'}
            </h3>
            <p className="text-muted-foreground text-sm max-w-md">
              {isArabic
                ? 'مشرفونا الأكاديميون وقادة اللجان بجامعة الابتكار متواجدون لمساعدتك في استكشاف مسارك التدريبي وتطوير مهاراتك.'
                : 'Our academic advisors and community leads at Innovation University are available to help you navigate your learning track.'
              }
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/contact">
              <Button variant="cyber">
                {isArabic ? 'تواصل معنا' : 'GET IN TOUCH'}
              </Button>
            </Link>
            <Link to="/courses">
              <Button variant="outline">
                {isArabic ? 'استكشف الدورات' : 'EXPLORE COURSES'}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
