import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Facebook, 
  Linkedin, 
  Instagram, 
  Twitter, 
  Github, 
  Mail, 
  Globe, 
  Users, 
  Search,
  Briefcase
} from 'lucide-react';
import { contentService } from '../services/contentService';
import { Button } from '../components/ui/Button';
import { useLanguage } from '../contexts/LanguageContext';
import { Link } from 'react-router-dom';

const SAMPLE_STAFF_EN = [
  {
    id: 'staff-1',
    name: 'Ammar Ahmed',
    role: 'President & Founder',
    category: 'High Board',
    bio: 'Leading the strategic expansion of DataCamp Student Club at Innovation University, with deep focus on AI research and student empowerment.',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    socials: [
      { platform: 'linkedin', url: 'https://linkedin.com' },
      { platform: 'github', url: 'https://github.com' }
    ]
  },
  {
    id: 'staff-2',
    name: 'Dr. Tamer Mostafa',
    role: 'Faculty Advisor & AI Lead',
    category: 'Academic Committee',
    bio: 'Associate Professor of Computer Science at Innovation University, guiding academic curricula and research publications.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    socials: [
      { platform: 'linkedin', url: 'https://linkedin.com' },
      { platform: 'mail', url: 'mailto:advisor@datacamp.club' }
    ]
  },
  {
    id: 'staff-3',
    name: 'Eng. Sarah Al-Sayed',
    role: 'Head of Machine Learning',
    category: 'Academic Committee',
    bio: 'Curating deep learning workshops, hands-on notebooks, and hackathon challenges for student members.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    socials: [
      { platform: 'linkedin', url: 'https://linkedin.com' },
      { platform: 'github', url: 'https://github.com' }
    ]
  },
  {
    id: 'staff-4',
    name: 'Youssef El-Shenawy',
    role: 'Vice President & Logistics',
    category: 'High Board',
    bio: 'Overseeing venue operations, university administrative coordination, and on-campus hackathon logistics.',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    socials: [
      { platform: 'linkedin', url: 'https://linkedin.com' }
    ]
  },
  {
    id: 'staff-5',
    name: 'Mariam Adel',
    role: 'Director of Media & Marketing',
    category: 'Media & PR',
    bio: 'Managing club branding, visual identity, event coverage, and social media transmissions.',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    socials: [
      { platform: 'instagram', url: 'https://instagram.com' },
      { platform: 'linkedin', url: 'https://linkedin.com' }
    ]
  },
  {
    id: 'staff-6',
    name: 'Ziad Mahmoud',
    role: 'Lead Cloud & Systems Architect',
    category: 'Tech & Development',
    bio: 'Maintaining our cloud infrastructure, interactive compiler runners, and platform security.',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
    socials: [
      { platform: 'github', url: 'https://github.com' }
    ]
  }
];

const SAMPLE_STAFF_AR = [
  {
    id: 'staff-1',
    name: 'عمار أحمد',
    role: 'رئيس ومؤسس النادي',
    category: 'High Board',
    categoryAr: 'المجلس الأعلى',
    bio: 'يقود التوسع الاستراتيجي لنادي DataCamp بجامعة الابتكار، مع التركيز على أبحاث الذكاء الاصطناعي وتمكين الطلاب.',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    socials: [
      { platform: 'linkedin', url: 'https://linkedin.com' },
      { platform: 'github', url: 'https://github.com' }
    ]
  },
  {
    id: 'staff-2',
    name: 'د. تامر مصطفى',
    role: 'المشرف الأكاديمي وقائد أبحاث AI',
    category: 'Academic Committee',
    categoryAr: 'اللجنة الأكاديمية',
    bio: 'أستاذ مشارك لعلوم الحاسب بجامعة الابتكار، يوجه المناهج الأكاديمية ونشر الأوراق البحثية الطلابية.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    socials: [
      { platform: 'linkedin', url: 'https://linkedin.com' },
      { platform: 'mail', url: 'mailto:advisor@datacamp.club' }
    ]
  },
  {
    id: 'staff-3',
    name: 'م. سارة السيد',
    role: 'رئيسة لجنة تعلم الآلة',
    category: 'Academic Committee',
    categoryAr: 'اللجنة الأكاديمية',
    bio: 'إعداد ورش التعلم العميق العملية وتحديات دفاتر Jupyter وتوجيه الطلاب في الهاكاثونات.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    socials: [
      { platform: 'linkedin', url: 'https://linkedin.com' },
      { platform: 'github', url: 'https://github.com' }
    ]
  },
  {
    id: 'staff-4',
    name: 'يوسف الشناوي',
    role: 'نائب الرئيس ومسؤول اللوجستيات',
    category: 'High Board',
    categoryAr: 'المجلس الأعلى',
    bio: 'الإشراف على تشغيل القاعات والتنسيق الإداري مع الجامعة وتنظيم لوجستيات هاكاثونات الحرم الجامعي.',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    socials: [
      { platform: 'linkedin', url: 'https://linkedin.com' }
    ]
  },
  {
    id: 'staff-5',
    name: 'مريم عادل',
    role: 'مديرة الإعلام والتسويق',
    category: 'Media & PR',
    categoryAr: 'الإعلام والعلاقات العامة',
    bio: 'إدارة الهوية البصرية والتغطية الفوتوغرافية للفعاليات والحملات الرقمية على منصات التواصل الاجتماعي.',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    socials: [
      { platform: 'instagram', url: 'https://instagram.com' },
      { platform: 'linkedin', url: 'https://linkedin.com' }
    ]
  },
  {
    id: 'staff-6',
    name: 'زياد محمود',
    role: 'مهندس السحابة والأنظمة الرئيسي',
    category: 'Tech & Development',
    categoryAr: 'التطوير والتقنية',
    bio: 'صيانة البنية التحتية السحابية ومحرك تشغيل الأكواد البرمجية التفاعلي وحماية المنصة.',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
    socials: [
      { platform: 'github', url: 'https://github.com' }
    ]
  }
];

const COMMITTEES_EN = [
  { name: 'High Board', desc: 'Strategic planning, university relations, and cross-committee management.' },
  { name: 'Academic Committee', desc: 'Course authoring, workshop delivery, coding challenge design, and research mentoring.' },
  { name: 'Tech & Development', desc: 'Web platform maintenance, online compiler, database engineering, and AI pipelines.' },
  { name: 'Media & PR', desc: 'Visual identity, photography, digital campaigns, and community sponsorships.' },
  { name: 'HR & Operations', desc: 'Member onboarding, event attendance tracking, logistics, and feedback analytics.' }
];

const COMMITTEES_AR = [
  { name: 'المجلس الأعلى (High Board)', desc: 'التخطيط الاستراتيجي، العلاقات الأكاديمية مع الجامعة، والإشراف العام على اللجان.' },
  { name: 'اللجنة الأكاديمية', desc: 'إعداد المناهج، تقديم ورش العمل، تصميم التحديات البرمجية، والإشراف البحثي.' },
  { name: 'التطوير والتقنية (Tech)', desc: 'تطوير وصيانة المنصة، محرر الأكواد، هندسة قواعد البيانات، وخوادم الذكاء الاصطناعي.' },
  { name: 'الإعلام والعلاقات العامة (Media & PR)', desc: 'الهوية البصرية، التوثيق والتصوير، إدارة الحملات الرقمية، والرعايات المجتمعية.' },
  { name: 'الموارد البشرية والعمليات (HR & Operations)', desc: 'استقبال وتوجيه الأعضاء الجدد، إدارة الحضور في الفعاليات، واللوجستيات التنظيمية.' }
];

export const Staff = () => {
  const { isArabic } = useLanguage();
  const [staff, setStaff] = useState<any[]>([]);
  const [, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState('ALL');
  const [search, setSearch] = useState('');
  const [showSampleStaff, setShowSampleStaff] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const docs = await contentService.list('staff', { orderBy: 'created_at' });
        if (mounted) setStaff(docs);
      } catch (error) {
        console.warn('Staff Supabase load error:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();

    const unsubscribe = contentService.subscribe('staff', load);
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [isArabic]);

  const getIcon = (iconName: string) => {
    switch (iconName?.toLowerCase()) {
      case 'facebook': return Facebook;
      case 'linkedin': return Linkedin;
      case 'instagram': return Instagram;
      case 'twitter': return Twitter;
      case 'github': return Github;
      case 'mail': return Mail;
      default: return Globe;
    }
  };

  const activeSamples = isArabic ? SAMPLE_STAFF_AR : SAMPLE_STAFF_EN;
  const displaySource = staff.length > 0 ? staff : (showSampleStaff ? activeSamples : []);

  const categories = isArabic ? [
    { key: 'ALL', label: 'الكل' },
    { key: 'High Board', label: 'المجلس الأعلى' },
    { key: 'Academic Committee', label: 'اللجنة الأكاديمية' },
    { key: 'Tech & Development', label: 'التطوير والتقنية' },
    { key: 'Media & PR', label: 'الإعلام والعلاقات' },
    { key: 'HR & Operations', label: 'العمليات والموارد' }
  ] : [
    { key: 'ALL', label: 'ALL' },
    { key: 'High Board', label: 'High Board' },
    { key: 'Academic Committee', label: 'Academic Committee' },
    { key: 'Tech & Development', label: 'Tech & Development' },
    { key: 'Media & PR', label: 'Media & PR' },
    { key: 'HR & Operations', label: 'HR & Operations' }
  ];

  const filteredStaff = displaySource.filter(member => {
    const matchesCat = selectedCat === 'ALL' || (member.category || 'General').toLowerCase() === selectedCat.toLowerCase();
    const matchesSearch = !search ||
      member.name?.toLowerCase().includes(search.toLowerCase()) ||
      member.role?.toLowerCase().includes(search.toLowerCase()) ||
      member.bio?.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const activeCommittees = isArabic ? COMMITTEES_AR : COMMITTEES_EN;

  return (
    <div className="pt-20 md:pt-32 pb-24 min-h-screen">
      <div className="container mx-auto px-6 max-w-6xl space-y-16">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-cyber tracking-widest uppercase mb-4">
              <Users className="w-3.5 h-3.5" /> 
              {isArabic ? 'الهيئة الإدارية والمجلس الاستشاري' : 'EXECUTIVE BOARD & ADVISORY COUNCIL'}
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black font-cyber tracking-tighter mb-4 neon-text">
              {isArabic ? 'قيادات' : 'CLUB'} <span className="text-white">{isArabic ? 'وفريق عمل النادي' : 'OPERATIVES'}</span>
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              {isArabic
                ? 'مجلس الإدارة التنفيذي، ورؤساء اللجان التقنية، والمشرفون الأكاديميون القائمون على قيادة نادي DataCamp بجامعة الابتكار.'
                : 'Executive leadership board, technical directors, and academic advisors governing DataCamp Student Club at Innovation University.'
              }
            </p>
          </div>

          <Link to="/contact">
            <Button variant="cyber" size="sm" className="gap-2 shrink-0">
              <Briefcase className="w-4 h-4" /> 
              {isArabic ? 'التقديم للانضمام للجان' : 'APPLY FOR COMMITTEES'}
            </Button>
          </Link>
        </div>

        {/* Filter & Search */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat.key}
                onClick={() => setSelectedCat(cat.key)}
                className={`px-4 py-2 rounded-xl text-xs font-cyber tracking-wider transition-all ${
                  selectedCat === cat.key
                    ? 'bg-primary text-dark-navy font-bold shadow-[0_0_15px_rgba(0,255,204,0.4)]'
                    : 'bg-white/5 border border-white/10 text-muted-foreground hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative min-w-[280px]">
            <Search className={`w-4 h-4 text-muted-foreground absolute top-1/2 -translate-y-1/2 ${isArabic ? 'right-3' : 'left-3'}`} />
            <input
              type="text"
              placeholder={isArabic ? 'بحث في الأعضاء، الأدوار، واللجان...' : 'Search members, roles, committees...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full py-2 rounded-xl bg-dark-navy/80 border border-white/10 text-white placeholder-muted-foreground/60 text-xs focus:border-primary focus:outline-none transition-all ${
                isArabic ? 'pr-9 pl-4' : 'pl-9 pr-4'
              }`}
            />
          </div>
        </div>

        {/* Staff Grid or Empty State */}
        {filteredStaff.length === 0 ? (
          <div className="space-y-12">
            <div className="p-12 md:p-16 text-center glass rounded-3xl border border-white/10 space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto">
                <Users className="w-8 h-8" />
              </div>

              <div className="space-y-2 max-w-lg mx-auto">
                <h3 className="text-xl sm:text-2xl font-cyber font-bold text-white">
                  {isArabic ? 'قاعدة البيانات جاهزة • جاري فتح باب الترشح للجان' : 'DATABASE READY • COMMITTEE ELECTIONS IN PROGRESS'}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {isArabic
                    ? 'قاعدة البيانات متصلة وجاهزة لتسجيل الهيكل التنظيمي للعام الأكاديمي. يمكن للإدارة إضافة الأعضاء من لوحة التحكم أو معاينة الهيكل التنظيمي أدناه.'
                    : 'The live database is connected and ready to receive organizational staff entries for academic year. Administrators can onboard team members via the admin dashboard, or preview the organizational structure below.'
                  }
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <Button
                  variant="cyber"
                  size="sm"
                  onClick={() => setShowSampleStaff(!showSampleStaff)}
                >
                  {showSampleStaff 
                    ? (isArabic ? 'إخفاء الهيكل التنظيمي' : 'HIDE SAMPLE STRUCTURE') 
                    : (isArabic ? 'معاينة الهيكل التنظيمي' : 'PREVIEW ORGANIZATIONAL STRUCTURE')
                  }
                </Button>
                <Link to="/contact">
                  <Button variant="outline" size="sm">
                    {isArabic ? 'انضم لإحدى اللجان' : 'JOIN A COMMITTEE'}
                  </Button>
                </Link>
              </div>
            </div>

            {/* Committee Structure Overview */}
            <div className="space-y-6">
              <div className="text-center max-w-xl mx-auto">
                <h3 className="text-2xl font-cyber font-bold text-white">
                  {isArabic ? 'نظرة عامة على لجان النادي' : 'CLUB COMMITTEES OVERVIEW'}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {isArabic 
                    ? 'الأذرع التنظيمية واللجان التشغيلية التي تدير فعاليات ومسارات نادي DataCamp بجامعة الابتكار'
                    : 'Operational committees organizing DataCamp Student Club activities at Innovation University'
                  }
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {activeCommittees.map((comm, cIdx) => (
                  <div key={cIdx} className="glass p-6 rounded-2xl border border-white/10 space-y-2">
                    <span className="text-[10px] font-mono text-primary uppercase">
                      {isArabic ? `اللجنة 0${cIdx + 1}` : `Committee 0${cIdx + 1}`}
                    </span>
                    <h4 className="font-cyber font-bold text-white text-base">{comm.name}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{comm.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredStaff.map((member, idx) => (
              <motion.div
                key={member.id || idx}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="group glass rounded-3xl border border-white/10 hover:border-primary/40 transition-all overflow-hidden flex flex-col justify-between"
              >
                <div className="aspect-square relative overflow-hidden bg-white/5">
                  <img 
                    src={member.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'} 
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-navy via-transparent to-transparent opacity-80" />
                  <span className={`absolute top-4 ${isArabic ? 'right-4' : 'left-4'} px-2.5 py-1 rounded-md text-[10px] font-cyber bg-dark-navy/80 backdrop-blur-md text-primary border border-primary/30 uppercase`}>
                    {member.categoryAr && isArabic ? member.categoryAr : (member.category || 'Core Team')}
                  </span>
                </div>

                <div className="p-6 space-y-4 flex-grow flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <h3 className="text-xl font-bold font-cyber text-white group-hover:text-primary transition-colors">
                      {member.name}
                    </h3>
                    <div className="text-xs font-cyber text-primary tracking-wider uppercase font-semibold">
                      {member.role}
                    </div>
                    {member.bio && (
                      <p className="text-xs text-muted-foreground leading-relaxed pt-2 line-clamp-3">
                        {member.bio}
                      </p>
                    )}
                  </div>

                  {member.socials && member.socials.length > 0 && (
                    <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                      {member.socials.map((social: any, sIdx: number) => {
                        const Icon = getIcon(social.icon || social.platform);
                        return (
                          <a
                            key={sIdx}
                            href={social.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-primary/20 hover:text-primary border border-white/10 flex items-center justify-center text-muted-foreground transition-all"
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default Staff;
