import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ExternalLink, 
  Github, 
  Eye, 
  Search, 
  Plus, 
  FolderGit2, 
  X
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { contentService } from '../services/contentService';
import { toast } from 'sonner';

const SAMPLE_PROJECTS_EN = [
  {
    id: 'proj-1',
    title: 'NileSense: Agricultural Crop Yield Predictor',
    category: 'Machine Learning',
    author: 'Karim Zaki & Omar Khaled',
    image: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=800&auto=format&fit=crop&q=80',
    description: 'An end-to-end computer vision and regression system that analyzes multi-spectral satellite imagery to predict Egyptian wheat yield with 94.2% accuracy.',
    technologies: ['Python', 'PyTorch', 'Rasterio', 'FastAPI', 'React'],
    githubUrl: 'https://github.com',
    liveUrl: 'https://demo.datacamp.club',
    featured: true
  },
  {
    id: 'proj-2',
    title: 'EGY-Traffic: Real-Time Flow Optimization',
    category: 'Computer Vision',
    author: 'Nouran Mostafa',
    image: 'https://images.unsplash.com/photo-1508873696983-2df5703bc20d?w=800&auto=format&fit=crop&q=80',
    description: 'Edge-deployed object detection pipeline tracking vehicle density at major Cairo intersections to dynamically calibrate green light intervals.',
    technologies: ['YOLOv8', 'OpenCV', 'DeepSort', 'Docker'],
    githubUrl: 'https://github.com',
    liveUrl: '#',
    featured: true
  },
  {
    id: 'proj-3',
    title: 'UniPulse: Student Sentiment & Course Feedback NLP',
    category: 'Data Science',
    author: 'DataCamp NLP Cohort',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
    description: 'BERT-based sentiment classification model fine-tuned on university discussion datasets to aggregate and analyze course feedback.',
    technologies: ['Transformers', 'HuggingFace', 'Pandas', 'Streamlit'],
    githubUrl: 'https://github.com',
    liveUrl: '#',
    featured: false
  }
];

const SAMPLE_PROJECTS_AR = [
  {
    id: 'proj-1',
    title: 'NileSense: التنبؤ بإنتاجية المحاصيل الزراعية',
    category: 'Machine Learning',
    categoryAr: 'تعلم الآلة',
    author: 'كريم زكي وعمر خالد',
    image: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=800&auto=format&fit=crop&q=80',
    description: 'نظام متكامل يدمج الرؤية الحاسوبية والانحدار الإحصائي لتحليل صور الأقمار الصناعية متعددة الأطياف للتنبؤ بإنتاجية القمح المصري بدقة 94.2%.',
    technologies: ['Python', 'PyTorch', 'Rasterio', 'FastAPI', 'React'],
    githubUrl: 'https://github.com',
    liveUrl: 'https://demo.datacamp.club',
    featured: true
  },
  {
    id: 'proj-2',
    title: 'EGY-Traffic: تحسين السيولة المرورية في الوقت الفعلي',
    category: 'Computer Vision',
    categoryAr: 'رؤية الحاسوب',
    author: 'نوران مصطفى',
    image: 'https://images.unsplash.com/photo-1508873696983-2df5703bc20d?w=800&auto=format&fit=crop&q=80',
    description: 'خط معالجة متقدم لاكتشاف وتتبع كثافة المركبات في تقاطعات القاهرة الكبرى لمعايرة فترات الإشارة الخضراء ديناميكياً على الأجهزة الطرفية.',
    technologies: ['YOLOv8', 'OpenCV', 'DeepSort', 'Docker'],
    githubUrl: 'https://github.com',
    liveUrl: '#',
    featured: true
  },
  {
    id: 'proj-3',
    title: 'UniPulse: تحليل مشاعر وآراء الطلاب عبر معالجة اللغات الطبيعية',
    category: 'Data Science',
    categoryAr: 'علم البيانات',
    author: 'فريق معالجة اللغات الطبيعية بالنادي',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
    description: 'نموذج BERT تم تدريبه وضبطه بدقة على مجموعات بيانات مناقشات واستبيانات الجامعة لتصنيف انطباعات وتقييمات الطلاب حول المقررات.',
    technologies: ['Transformers', 'HuggingFace', 'Pandas', 'Streamlit'],
    githubUrl: 'https://github.com',
    liveUrl: '#',
    featured: false
  }
];

export const Projects = () => {
  const { user, profile } = useAuth();
  const { isArabic } = useLanguage();
  const [projects, setProjects] = useState<any[]>([]);
  const [, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showSampleProjects, setShowSampleProjects] = useState(false);

  // Form submission state
  const [submitForm, setSubmitForm] = useState({
    title: '',
    category: 'Machine Learning',
    description: '',
    technologies: '',
    githubUrl: '',
    liveUrl: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const categories = isArabic ? [
    { key: 'ALL', label: 'الكل' },
    { key: 'Machine Learning', label: 'تعلم الآلة' },
    { key: 'Computer Vision', label: 'رؤية الحاسوب' },
    { key: 'Data Science', label: 'علم البيانات' },
    { key: 'Web & Cloud', label: 'الويب والسحابة' },
  ] : [
    { key: 'ALL', label: 'ALL' },
    { key: 'Machine Learning', label: 'Machine Learning' },
    { key: 'Computer Vision', label: 'Computer Vision' },
    { key: 'Data Science', label: 'Data Science' },
    { key: 'Web & Cloud', label: 'Web & Cloud' },
  ];

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setProjects(await contentService.list('projects', { orderBy: 'created_at' }));
      } catch (error) {
        console.warn('Projects load error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
    return contentService.subscribe('projects', loadProjects);
  }, [isArabic]);

  const activeSamples = isArabic ? SAMPLE_PROJECTS_AR : SAMPLE_PROJECTS_EN;
  const displaySource = projects.length > 0 ? projects : (showSampleProjects ? activeSamples : []);

  const filteredProjects = displaySource.filter(p => {
    const matchesCat = selectedCat === 'ALL' || (p.category && p.category.toLowerCase() === selectedCat.toLowerCase());
    const matchesSearch = !search ||
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase()) ||
      p.author?.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submitForm.title || !submitForm.description) {
      toast.error(isArabic ? 'يرجى إدخال عنوان ووصف المشروع' : 'Please enter project title and description');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: submitForm.title.trim(),
        category: submitForm.category,
        description: submitForm.description.trim(),
        author: profile?.fullName || user?.displayName || (isArabic ? 'عضو بالنادي' : 'Club Member'),
        authorEmail: user?.email || '',
        technologies: submitForm.technologies.split(',').map(s => s.trim()).filter(Boolean),
        githubUrl: submitForm.githubUrl.trim(),
        liveUrl: submitForm.liveUrl.trim(),
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
        status: 'active',
        createdAt: new Date().toISOString(),
      };

      const createdProject = await contentService.create('projects', payload);
      setProjects(prev => [createdProject, ...prev]);
      toast.success(isArabic ? 'تم نشر المشروع في مستودع النادي!' : 'Project published to the club repository!');

      setShowSubmitModal(false);
      setSubmitForm({
        title: '',
        category: 'Machine Learning',
        description: '',
        technologies: '',
        githubUrl: '',
        liveUrl: '',
      });
    } catch {
      toast.error(isArabic ? 'فشل نشر المشروع. يرجى المحاولة لاحقاً.' : 'Failed to submit project. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-20 md:pt-32 pb-24 min-h-screen">
      <div className="container mx-auto px-6 max-w-6xl space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-cyber tracking-widest uppercase mb-4">
              <FolderGit2 className="w-3.5 h-3.5" /> 
              {isArabic ? 'مستودع الأكواد والابتكارات البرمجية' : 'INNOVATION CODEBASE REPOSITORY'}
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black font-cyber tracking-tighter mb-4 neon-text">
              {isArabic ? 'معرض' : 'PROJECT'} <span className="text-white">{isArabic ? 'المشاريع والابتكارات' : 'SHOWCASE'}</span>
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              {isArabic
                ? 'استعراض للابتكارات البرمجية، وخطوط هندسة البيانات، ونماذج الذكاء الاصطناعي المطورة بواسطة طلاب وباحثي نادي DataCamp بجامعة الابتكار.'
                : 'Showcase of software innovations, data engineering pipelines, and artificial intelligence models developed by DataCamp Student Club members at Innovation University.'
              }
            </p>
          </div>

          <Button
            variant="cyber"
            size="sm"
            onClick={() => setShowSubmitModal(true)}
            className="gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" /> 
            {isArabic ? 'أضف مشروعك للتوثيق' : 'SUBMIT YOUR PROJECT'}
          </Button>
        </div>

        {/* Filters */}
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
              placeholder={isArabic ? 'بحث في المشاريع والتقنيات والمطورين...' : 'Search projects, stack, authors...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full py-2 rounded-xl bg-dark-navy/80 border border-white/10 text-white placeholder-muted-foreground/60 text-xs focus:border-primary focus:outline-none transition-all ${
                isArabic ? 'pr-9 pl-4' : 'pl-9 pr-4'
              }`}
            />
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="p-12 md:p-16 text-center glass rounded-3xl border border-white/10 space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto">
              <FolderGit2 className="w-8 h-8" />
            </div>

            <div className="space-y-2 max-w-lg mx-auto">
              <h3 className="text-xl sm:text-2xl font-cyber font-bold text-white">
                {isArabic ? 'قاعدة البيانات جاهزة • لا توجد مشاريع مسجلة بعد' : 'DATABASE READY • NO PROJECTS REGISTERED YET'}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {isArabic
                  ? 'قاعدة البيانات الحية متصلة ومستعدة لتلقي مشاريع الطلاب ومشاريع التخرج ونماذج الذكاء الاصطناعي لتوثيقها وعرضها هنا.'
                  : 'The live database is connected and ready to receive student projects. Students and project teams can submit capstones, hackathon submissions, and research models to be curated and showcased here.'
                }
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Button
                variant="cyber"
                size="sm"
                onClick={() => setShowSampleProjects(!showSampleProjects)}
              >
                {showSampleProjects 
                  ? (isArabic ? 'إخفاء المشاريع التجريبية' : 'HIDE SAMPLE PROJECTS')
                  : (isArabic ? 'معاينة مشاريع تجريبية' : 'PREVIEW SAMPLE PROJECTS')
                }
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSubmitModal(true)}
              >
                {isArabic ? 'أضف أول مشروع الآن' : 'SUBMIT FIRST PROJECT'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredProjects.map((project, idx) => (
              <motion.div
                key={project.id || idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="group relative overflow-hidden rounded-3xl border border-white/10 glass hover:border-primary/40 transition-all flex flex-col justify-between"
              >
                <div className="aspect-video w-full overflow-hidden relative">
                  <img 
                    src={project.image || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800'} 
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-navy via-dark-navy/40 to-transparent" />
                  <span className={`absolute top-4 ${isArabic ? 'right-4' : 'left-4'} px-2.5 py-1 rounded-md text-[10px] font-cyber bg-dark-navy/80 backdrop-blur-md text-primary border border-primary/30 uppercase`}>
                    {project.categoryAr && isArabic ? project.categoryAr : (project.category || 'Tech')}
                  </span>
                </div>

                <div className="p-6 sm:p-8 space-y-4 flex-grow flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="text-xl sm:text-2xl font-bold font-cyber text-white group-hover:text-primary transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-xs text-muted-foreground uppercase font-mono tracking-wider">
                      {isArabic ? 'بواسطة:' : 'BY'} {project.author || (isArabic ? 'فريق النادي' : 'DataCamp Team')}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed pt-1">
                      {project.description}
                    </p>
                  </div>

                  {project.technologies && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {(Array.isArray(project.technologies) ? project.technologies : String(project.technologies).split(',')).map((tech: string, tIdx: number) => (
                        <span key={tIdx} className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 border border-white/10 text-gray-300">
                          {tech.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                    <Button 
                      variant="cyber" 
                      size="sm"
                      onClick={() => setSelectedProject(project)}
                      className="gap-1.5 text-xs font-cyber"
                    >
                      <Eye className="w-3.5 h-3.5" /> 
                      {isArabic ? 'عرض دراسة الحالة' : 'VIEW CASE STUDY'}
                    </Button>
                    {project.githubUrl && (
                      <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="gap-1.5 text-xs font-cyber">
                          <Github className="w-3.5 h-3.5" /> 
                          {isArabic ? 'الكود المصدري' : 'SOURCE'}
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Project Case Study Modal */}
        <AnimatePresence>
          {selectedProject && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-dark-navy/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
              onClick={() => setSelectedProject(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="max-w-3xl w-full glass p-6 sm:p-10 rounded-3xl border border-primary/30 max-h-[90vh] overflow-y-auto custom-scrollbar relative space-y-6"
              >
                <button
                  onClick={() => setSelectedProject(null)}
                  className={`absolute top-6 ${isArabic ? 'left-6' : 'right-6'} p-2 rounded-xl bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white transition-colors`}
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="space-y-2 pt-2">
                  <span className="px-3 py-1 rounded-full text-[10px] font-cyber uppercase tracking-wider bg-primary/20 text-primary border border-primary/30">
                    {selectedProject.categoryAr && isArabic ? selectedProject.categoryAr : selectedProject.category}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black font-cyber text-white">
                    {selectedProject.title}
                  </h2>
                  <p className="text-xs font-mono text-muted-foreground">
                    {isArabic ? 'تطوير المهندس:' : 'Engineered by:'} <strong className="text-white">{selectedProject.author}</strong>
                  </p>
                </div>

                <div className="rounded-2xl overflow-hidden aspect-video border border-white/10">
                  <img src={selectedProject.image} alt={selectedProject.title} className="w-full h-full object-cover" />
                </div>

                <div className="space-y-4 text-sm text-muted-foreground leading-relaxed whitespace-pre-line border-t border-b border-white/10 py-6">
                  {selectedProject.description}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                  <div className="flex items-center gap-3">
                    {selectedProject.githubUrl && (
                      <a href={selectedProject.githubUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="gap-2 text-xs font-cyber">
                          <Github className="w-4 h-4" /> 
                          {isArabic ? 'المستودع على GitHub' : 'VIEW ON GITHUB'}
                        </Button>
                      </a>
                    )}
                    {selectedProject.liveUrl && selectedProject.liveUrl !== '#' && (
                      <a href={selectedProject.liveUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="cyber" size="sm" className="gap-2 text-xs font-cyber">
                          <ExternalLink className="w-4 h-4" /> 
                          {isArabic ? 'المعاينة الحية' : 'LIVE DEPLOYMENT'}
                        </Button>
                      </a>
                    )}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setSelectedProject(null)}>
                    {isArabic ? 'إغلاق' : 'CLOSE'}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Project Submission Modal */}
        <AnimatePresence>
          {showSubmitModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-dark-navy/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
              onClick={() => setShowSubmitModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="max-w-2xl w-full glass p-6 sm:p-10 rounded-3xl border border-primary/30 max-h-[90vh] overflow-y-auto custom-scrollbar relative space-y-6"
              >
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className={`absolute top-6 ${isArabic ? 'left-6' : 'right-6'} p-2 rounded-xl bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white transition-colors`}
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="space-y-1 pt-2">
                  <h2 className="text-2xl font-black font-cyber text-white">
                    {isArabic ? 'إرسال مشروع جديد' : 'SUBMIT A PROJECT'}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {isArabic
                      ? 'أرسل مشروعك البرمجي، أو خط بياناتك، أو نموذج الذكاء الاصطناعي لتوثيقه في مستودع النادي.'
                      : 'Submit your software project, data pipeline, or AI model to be featured in the club repository.'
                    }
                  </p>
                </div>

                <form onSubmit={handleProjectSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-cyber text-gray-300 block mb-1">
                      {isArabic ? 'عنوان المشروع *' : 'PROJECT TITLE *'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={isArabic ? 'مثال: محلل المشاعر للنصوص العربية' : 'e.g. Arabic Sentiment Analyzer'}
                      value={submitForm.title}
                      onChange={e => setSubmitForm({ ...submitForm, title: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-dark-navy border border-white/10 text-white text-sm focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-cyber text-gray-300 block mb-1">
                      {isArabic ? 'التصنيف والمجال *' : 'CATEGORY *'}
                    </label>
                    <select
                      value={submitForm.category}
                      onChange={e => setSubmitForm({ ...submitForm, category: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-dark-navy border border-white/10 text-white text-sm focus:border-primary focus:outline-none"
                    >
                      <option value="Machine Learning">{isArabic ? 'تعلم الآلة' : 'Machine Learning'}</option>
                      <option value="Computer Vision">{isArabic ? 'رؤية الحاسوب' : 'Computer Vision'}</option>
                      <option value="Data Science">{isArabic ? 'علم البيانات' : 'Data Science'}</option>
                      <option value="Web & Cloud">{isArabic ? 'الويب والسحابة' : 'Web & Cloud'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-cyber text-gray-300 block mb-1">
                      {isArabic ? 'التقنيات المستخدمة (مفصولة بفواصل)' : 'TECH STACK (comma-separated)'}
                    </label>
                    <input
                      type="text"
                      placeholder="Python, PyTorch, FastAPI, React"
                      value={submitForm.technologies}
                      onChange={e => setSubmitForm({ ...submitForm, technologies: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-dark-navy border border-white/10 text-white text-sm focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-cyber text-gray-300 block mb-1">
                      {isArabic ? 'الوصف والمعمارية التقنية للمشروع *' : 'DESCRIPTION & ARCHITECTURE *'}
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder={isArabic ? 'اشرح ما يقدمه المشروع، معمارية النموذج، مجموعة البيانات المستخدمة، وأهم النتائج...' : 'Explain what the project does, the model architecture, dataset used, and key findings...'}
                      value={submitForm.description}
                      onChange={e => setSubmitForm({ ...submitForm, description: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-dark-navy border border-white/10 text-white text-sm focus:border-primary focus:outline-none resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-cyber text-gray-300 block mb-1">
                        {isArabic ? 'رابط مستودع GitHub' : 'GITHUB REPO URL'}
                      </label>
                      <input
                        type="url"
                        placeholder="https://github.com/..."
                        value={submitForm.githubUrl}
                        onChange={e => setSubmitForm({ ...submitForm, githubUrl: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-dark-navy border border-white/10 text-white text-sm focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-cyber text-gray-300 block mb-1">
                        {isArabic ? 'رابط المعاينة الحية (اختياري)' : 'LIVE DEMO URL (Optional)'}
                      </label>
                      <input
                        type="url"
                        placeholder="https://my-model.app"
                        value={submitForm.liveUrl}
                        onChange={e => setSubmitForm({ ...submitForm, liveUrl: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-dark-navy border border-white/10 text-white text-sm focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                    <Button type="button" variant="outline" onClick={() => setShowSubmitModal(false)}>
                      {isArabic ? 'إلغاء' : 'CANCEL'}
                    </Button>
                    <Button type="submit" variant="cyber" disabled={submitting}>
                      {submitting 
                        ? (isArabic ? 'جاري الإرسال...' : 'TRANSMITTING...') 
                        : (isArabic ? 'إرسال المشروع' : 'TRANSMIT PROJECT')
                      }
                    </Button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default Projects;
