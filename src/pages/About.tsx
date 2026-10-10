import React from 'react';
import { motion } from 'motion/react';
import { 
  Target, 
  Users, 
  Zap, 
  Info, 
  Eye, 
  Award, 
  GraduationCap, 
  Cpu, 
  Code2, 
  Database, 
  TrendingUp, 
  BookOpen, 
  ShieldCheck,
  Building2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, isFirebaseReady } from '../lib/firebase';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { demoAboutData } from '../lib/demoData';
import { Button } from '../components/ui/Button';
import { useLanguage } from '../contexts/LanguageContext';
import { Link } from 'react-router-dom';

export const About = () => {
  const { isArabic } = useLanguage();
  const [aboutData, setAboutData] = React.useState(demoAboutData);

  React.useEffect(() => {
    if (isSupabaseConfigured) {
      supabase
        .from('settings')
        .select('*')
        .eq('key', 'about_data')
        .maybeSingle()
        .then(({ data }) => {
          if (data?.value) {
            setAboutData(data.value);
          }
        });
      return;
    }

    if (!isFirebaseReady) {
      setAboutData(demoAboutData);
      return;
    }

    const unsubscribe = onSnapshot(doc(db, 'settings', 'about'), (snapshot) => {
      if (snapshot.exists()) {
        setAboutData(snapshot.data() as any);
      }
    }, (error) => {
      console.warn("About data listener error:", error);
    });

    return () => unsubscribe();
  }, []);

  const stats = [
    { count: '500+', label: isArabic ? 'عضو نشط' : 'ACTIVE MEMBERS', sublabel: isArabic ? 'طالب مسجل' : 'Registered Students' },
    { count: '24+', label: isArabic ? 'ورشة ومخيم تدريبي' : 'WORKSHOPS & SESSIONS', sublabel: isArabic ? 'مختبرات تطبيقية' : 'Hands-on Labs Conducted' },
    { count: '100%', label: isArabic ? 'تدريب عملي' : 'PRACTICAL LABS', sublabel: isArabic ? 'مشاريع حقيقية معتمدة' : 'Real-world Applied Projects' },
    { count: '300+', label: isArabic ? 'شهادة صادرة' : 'CERTIFICATES ISSUED', sublabel: isArabic ? 'موثقة برمجياً برمز QR' : 'Digitally Verified Credentials' }
  ];

  const tracks = [
    {
      icon: Database,
      title: isArabic ? 'علم وتحليل البيانات' : 'Data Science & Analytics',
      desc: isArabic 
        ? 'إتقان بايثون، ومكتبات Pandas، ولغة SQL، وأدوات التصور البياني لتحويل البيانات الخام إلى رؤى تنفيذية دقيقة.'
        : 'Master Python, Pandas, SQL, and data visualization tools to transform raw messy datasets into actionable executive insights.',
      skills: ['Python', 'Pandas', 'SQL', 'Tableau', 'EDA']
    },
    {
      icon: Cpu,
      title: isArabic ? 'الذكاء الاصطناعي وتعلم الآلة' : 'AI & Machine Learning',
      desc: isArabic
        ? 'غوص عميق في التعلم الخاضع للإشراف، والشبكات العصبية العميقة، ورؤية الحاسوب، ومعالجة اللغات الطبيعية باستخدام PyTorch.'
        : 'Dive into supervised & unsupervised learning, deep neural networks, computer vision, and NLP with PyTorch & Scikit-Learn.',
      skills: ['Scikit-Learn', 'PyTorch', 'Deep Learning', 'NLP', 'Computer Vision']
    },
    {
      icon: TrendingUp,
      title: isArabic ? 'ذكاء الأعمال ونمذجة القرارات' : 'Business Intelligence',
      desc: isArabic
        ? 'تسخير Power BI وقواعد بيانات SQL للتنبؤ بالمؤشرات ومقاييس الأداء المصممة للبيئات التجارية والصناعية.'
        : 'Harness the power of Power BI, SQL databases, metrics forecasting, and predictive KPIs tailored for modern business ecosystems.',
      skills: ['Power BI', 'SQL Analytics', 'Financial Modeling', 'KPI Dashboards']
    },
    {
      icon: Code2,
      title: isArabic ? 'هندسة الأنظمة والبرمجيات' : 'Systems & Software Engineering',
      desc: isArabic
        ? 'بناء خطوط بيانات قوية، وواجهات برمجية FastAPI، ونشر نماذج الذكاء الاصطناعي في بيئات الإنتاج الحية.'
        : 'Build robust pipelines, APIs, and scalable web apps that deploy data models seamlessly into production environments.',
      skills: ['TypeScript', 'FastAPI', 'Docker', 'Git', 'Cloud Deployment']
    }
  ];

  const pillars = [
    { 
      icon: Target, 
      title: isArabic ? 'رسالتنا' : 'Our Mission', 
      desc: isArabic 
        ? ((aboutData as any).missionAr || 'تمكين طلاب الجامعة من إتقان أحدث مهارات علم البيانات، والذكاء الاصطناعي، وهندسة البرمجيات عبر تعليم تطبيقي ومشاريع حقيقية.')
        : (aboutData.mission || 'To empower students with cutting-edge data science, AI, and software engineering skills through hands-on learning and collaborative projects.')
    },
    { 
      icon: Eye, 
      title: isArabic ? 'رؤيتنا' : 'Our Vision', 
      desc: isArabic
        ? ((aboutData as any).visionAr || 'أن نكون المجتمع الطلابي التقني الرائد في مصر والشرق الأوسط، وتخريج كوادر بيانات بمعايير عالمية تنافس كبرى الشركات التقنية.')
        : (aboutData.vision || 'To be the leading student tech community in Egypt and the MENA region, producing world-class data professionals.')
    },
    { 
      icon: Info, 
      title: isArabic ? 'تاريخنا ونشأتنا' : 'Our History', 
      desc: isArabic
        ? ((aboutData as any).historyAr || 'تأسس النادي عام 2024 بجامعة الابتكار، وتطور سريعاً من مجموعة دراسية متخصصة إلى مجتمع تقني يضم أكثر من 500 عضو نشط.')
        : (aboutData.history || 'Founded in 2024 at Innovation University, DataCamp Student Club has grown from a small study group into a thriving community of 500+ active members.')
    },
  ];

  const values = [
    {
      icon: Zap,
      title: isArabic ? 'التطبيق العملي أولاً' : 'Hands-on First',
      desc: isArabic
        ? 'لا محاضرات نظرية مجردة. كل مفهوم يرتبط مباشرة بتطبيق كودي ينفذه الطالب عبر محرر الأكواد التفاعلي في المتصفح.'
        : 'No passive lectures. Every core concept is paired with live interactive coding directly inside our browser playground.'
    },
    {
      icon: Users,
      title: isArabic ? 'الإرشاد الأكاديمي التشاركي' : 'Peer Mentorship',
      desc: isArabic
        ? 'يتعلم الطلاب المبتدئون جنباً إلى جنب مع المرشدين والمعيدين والمطورين الأكثر خبرة لضمان التطور المستمر.'
        : 'Junior operatives learn alongside experienced student mentors and teaching assistants to ensure steady progress.'
    },
    {
      icon: Award,
      title: isArabic ? 'معايير صناعية معتمدة' : 'Verified Industry Standards',
      desc: isArabic
        ? 'كل شارة وشهادة إنجاز صادرة عن النادي قابلة للتحقق الرقمي الفوري، وتمثل كفاءة تقنية حقيقية ومعتمدة.'
        : 'Every milestone badge and diploma is cryptographically verifiable, representing authentic technical competence.'
    },
    {
      icon: Sparkles,
      title: isArabic ? 'شغف الابتكار والتميز' : 'Innovation-Driven',
      desc: isArabic
        ? 'تنمية الطموح التقني لدى طلاب جامعة الابتكار لتحويل الواجبات الدراسية إلى مشاريع منافسة في الهاكاثونات العالمية.'
        : 'Cultivating technological ambition at Innovation University to convert coursework into competitive hackathon entries.'
    }
  ];

  return (
    <div className="pt-20 md:pt-32 pb-24 min-h-screen">
      <div className="px-6 md:px-12 max-w-7xl mx-auto space-y-28">
        
        {/* 1. Hero Section */}
        <div className="max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-cyber tracking-widest uppercase">
            <Building2 className="w-3.5 h-3.5" /> 
            {isArabic ? 'جامعة الابتكار • النادي الطلابي الرسمي' : 'INNOVATION UNIVERSITY • OFFICIAL CLUB'}
          </div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-6xl md:text-7xl font-black font-cyber tracking-tighter neon-text leading-[1.1]"
          >
            {isArabic ? (
              <>تمكين الجيل القادم من <span className="text-white">رواد البيانات والذكاء الاصطناعي</span></>
            ) : (
              <>EMPOWERING THE NEXT GENERATION OF <span className="text-white">DATA PIONEERS</span></>
            )}
          </motion.h1>

          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed font-sans">
            {isArabic
              ? 'نادي DataCamp الطلابي بجامعة الابتكار هو المجتمع التقني الأول لمهندسي وعلماء البيانات ومطوري البرمجيات. نربط بين الأبحاث الأكاديمية المتطورة والمعايير الصناعية العالمية من خلال معسكرات تدريبية مكثفة ومشاريع تطبيقية وبيئة تفاعلية مدعومة بالذكاء الاصطناعي.'
              : 'DataCamp Student Club at Innovation University is the premier technical community for aspiring data scientists, AI engineers, and software architects. We bridge cutting-edge university research with global industry standards through hands-on bootcamps, real datasets, and autonomous AI-assisted learning.'
            }
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <Link to="/courses">
              <Button variant="cyber" size="lg" className="gap-2">
                <BookOpen className="w-4 h-4" /> 
                {isArabic ? 'استكشف المناهج التدريبية' : 'BROWSE CURRICULUM'}
              </Button>
            </Link>
            <Link to="/staff">
              <Button variant="outline" size="lg" className="gap-2">
                <Users className="w-4 h-4" /> 
                {isArabic ? 'تعرف على فريق العمل' : 'MEET THE TEAM'}
              </Button>
            </Link>
          </div>
        </div>

        {/* 2. University Partnership Banner */}
        <div className="glass p-8 md:p-12 rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 via-dark-navy to-primary/5 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-2 space-y-4">
              <span className="text-xs font-cyber uppercase tracking-widest text-purple-300 font-bold flex items-center gap-2">
                <GraduationCap className="w-4 h-4" /> 
                {isArabic ? 'الرعاية الأكاديمية والاعتماد الجامعي' : 'ACADEMIC SPONSORSHIP & ACCREDITATION'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-cyber font-bold text-white">
                {isArabic ? 'جامعة الابتكار • كلية الحاسبات والذكاء الاصطناعي' : 'Innovation University • Faculty of AI & Computing'}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {isArabic
                  ? 'تأسس النادي برعاية رسمية من كلية الحاسبات والذكاء الاصطناعي بجامعة الابتكار، ليكون الميدان التطبيقي الذي يحول المناهج النظرية إلى خطوط إنتاج برمجية ومشاريع متوجة بالجوائز في الهاكاثونات المحلية والدولية.'
                  : 'Founded under the official patronage of the Faculty of Computer Science & AI at Innovation University, our club serves as the active proving ground where theoretical coursework transforms into production-grade data pipelines and hackathon-winning architectures.'
                }
              </p>
            </div>
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-primary shrink-0" />
                <div>
                  <div className="text-xs font-cyber font-bold text-white">
                    {isArabic ? 'شهادات معتمدة وموثقة' : 'Verified Credentials'}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {isArabic ? 'قابلة للتحقق الرقمي المباشر عبر رمز QR' : 'Authenticated via cryptographic QR tokens'}
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                <Award className="w-6 h-6 text-purple-400 shrink-0" />
                <div>
                  <div className="text-xs font-cyber font-bold text-white">
                    {isArabic ? 'معتمد رسمياً بالحرم الجامعي' : 'University Recognized'}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {isArabic ? 'نادي أكاديمي رسمي تحت مظلة الجامعة' : 'Officially chartered on-campus organization'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Stats Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass p-6 rounded-2xl border border-white/10 text-center hover:border-primary/40 transition-all"
            >
              <div className="text-3xl sm:text-4xl font-black font-cyber text-primary neon-text mb-1">
                {stat.count}
              </div>
              <div className="text-xs font-cyber uppercase tracking-wider text-white font-bold mb-1">
                {stat.label}
              </div>
              <div className="text-[11px] text-muted-foreground">
                {stat.sublabel}
              </div>
            </motion.div>
          ))}
        </div>

        {/* 4. Mission, Vision, History */}
        <div>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-black font-cyber text-white mb-3">
              {isArabic ? 'الركائز الأساسية للنادي' : 'OUR FOUNDATIONAL PILLARS'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isArabic ? 'المبادئ الجوهرية التي تقود كل ورشة عمل ومبادرة نطلقها' : 'The core principles that steer every workshop and mission we initiate'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pillars.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="glass p-8 rounded-2xl border border-white/10 hover:border-primary/30 transition-all group flex flex-col justify-between"
              >
                <div>
                  <item.icon className="w-12 h-12 text-primary mb-6 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-bold font-cyber tracking-widest uppercase text-white mb-3">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* 5. Core Learning Tracks */}
        <div>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-cyber uppercase tracking-widest text-primary font-bold">
              {isArabic ? 'المسارات الأكاديمية' : 'CURRICULUM ARCHITECTURE'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black font-cyber text-white mt-2 mb-3">
              {isArabic ? 'مجالات التعلم الرئيسية' : 'CORE LEARNING DOMAINS'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isArabic ? 'أربعة مسارات تخصصية متوافقة مع متطلبات سوق العمل العالمي والشركات الكبرى' : 'Four specialized tracks calibrated against high-demand tech employer expectations'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {tracks.map((track, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="glass p-8 rounded-3xl border border-white/10 hover:border-primary/40 transition-all group relative overflow-hidden"
              >
                <div className="flex items-start gap-5">
                  <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 text-primary group-hover:bg-primary group-hover:text-dark-navy transition-all shrink-0">
                    <track.icon className="w-8 h-8" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold font-cyber text-white group-hover:text-primary transition-colors">
                      {track.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{track.desc}</p>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {track.skills.map((skill, sIdx) => (
                        <span key={sIdx} className="px-2.5 py-1 rounded-md text-[10px] font-mono bg-white/5 border border-white/10 text-gray-300">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* 6. Club Values */}
        <div>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-black font-cyber text-white mb-3">
              {isArabic ? 'منهجيتنا وقيمنا' : 'HOW WE OPERATE'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isArabic ? 'ثقافة ترتكز على التعاون المشترك والعمق البرمجي والإنجاز الملموس' : 'Our culture of mutual accountability, rigorous technical depth, and peer execution'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((val, idx) => (
              <div key={idx} className="glass p-6 rounded-2xl border border-white/10 space-y-3 hover:border-primary/30 transition-all">
                <val.icon className="w-8 h-8 text-primary" />
                <h4 className="font-cyber font-bold text-white text-base">{val.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 7. Call To Action */}
        <div className="glass p-10 md:p-16 rounded-3xl border border-primary/30 bg-gradient-to-r from-primary/10 via-dark-navy to-dark-navy relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="space-y-3 max-w-xl">
            <h3 className="text-2xl sm:text-4xl font-black font-cyber text-white">
              {isArabic ? 'هل أنت مستعد لتطوير مهاراتك البرمجية؟' : 'READY TO ELEVATE YOUR SKILLS?'}
            </h3>
            <p className="text-muted-foreground text-sm sm:text-base">
              {isArabic 
                ? 'انضم إلى مئات الطلاب المتميزين بجامعة الابتكار وابدأ رحلتك في علم البيانات والذكاء الاصطناعي اليوم.'
                : 'Join hundreds of fellow students at Innovation University and begin your journey into data science and artificial intelligence today.'
              }
            </p>
          </div>
          <div className="flex flex-wrap gap-4 shrink-0">
            <Link to="/register">
              <Button variant="cyber" size="lg" className="gap-2">
                {isArabic ? 'انضم إلى النادي الآن' : 'JOIN THE CLUB'} 
                <ArrowRight className={`w-4 h-4 ${isArabic ? 'rotate-180' : ''}`} />
              </Button>
            </Link>
            <Link to="/compiler">
              <Button variant="outline" size="lg">
                {isArabic ? 'تشغيل محرر الأكواد' : 'LAUNCH COMPILER'}
              </Button>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default About;
