import { copyText } from '../lib/clipboard';
import { Dialog } from '../components/ui/Dialog';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  User,
  ArrowRight,
  Tag,
  Search,
  BookOpen,
  Share2,
  X,
  FileText,
  Clock,
  PlusCircle
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { contentService } from '../services/contentService';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { getCanonicalUrl } from '../lib/siteUrl';





export const Blog = () => {
  const { isEditor } = useAuth();
  const { isArabic } = useLanguage();
  const [posts, setPosts] = useState<any[]>([]);
  const [, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [readingPost, setReadingPost] = useState<any | null>(null);


  const categories = isArabic ? [
    { key: 'ALL', label: 'الكل' },
    { key: 'AI & ML', label: 'الذكاء الاصطناعي' },
    { key: 'Data Science', label: 'علم البيانات' },
    { key: 'Engineering', label: 'الهندسة البرمجية' },
    { key: 'Tutorials', label: 'شروحات عملية' },
    { key: 'Career', label: 'المسار المهني' }
  ] : [
    { key: 'ALL', label: 'ALL' },
    { key: 'AI & ML', label: 'AI & ML' },
    { key: 'Data Science', label: 'Data Science' },
    { key: 'Engineering', label: 'Engineering' },
    { key: 'Tutorials', label: 'Tutorials' },
    { key: 'Career', label: 'Career' }
  ];

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const docs = await contentService.list('blog', { orderBy: 'created_at' });
        if (mounted) setPosts(docs);
      } catch (error) {
        console.warn('Blog Supabase load error:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();

    const unsubscribe = contentService.subscribe('blog', load);
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [isArabic]);


  useEffect(() => {
    const article = new URLSearchParams(window.location.search).get('article');
    if (article) { const selected = posts.find(post => post.id === article); if (selected) setReadingPost(selected); }
  }, [posts]);
  const displaySource = posts;

  const filteredPosts = displaySource.filter(post => {
    const matchesCategory = selectedCategory === 'ALL' ||
      (post.category && post.category.toLowerCase() === selectedCategory.toLowerCase()) ||
      (post.tag && post.tag.toLowerCase().includes(selectedCategory.toLowerCase()));

    const matchesSearch = !searchQuery ||
      post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="pt-20 md:pt-32 pb-24 min-h-screen">
      <div className="container mx-auto px-6 max-w-6xl space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-cyber tracking-widest uppercase mb-4">
              <BookOpen className="w-3.5 h-3.5" />
              {isArabic ? 'المقالات والأبحاث التقنية' : 'TECHNICAL DISPATCHES & ARTICLES'}
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black font-cyber tracking-tighter mb-4 neon-text">
              {isArabic ? 'مدونة' : 'COMMUNITY'} <span className="text-white">{isArabic ? 'المعرفة والتقنية' : 'INSIGHTS'}</span>
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              {isArabic
                ? 'مقالات تقنية، وشروحات تعلم عميق، وأبحاث منشورة بإشراف وتأليف أعضاء ومرشدي نادي DataCamp بجامعة الابتكار.'
                : 'Technical articles, deep learning tutorials, and research publications authored by members and mentors of DataCamp Club at Innovation University.'
              }
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isEditor && (
              <Link to="/admin/blog">
                <Button variant="cyber" size="sm" className="gap-2">
                  <PlusCircle className="w-4 h-4" />
                  {isArabic ? 'كتابة مقال جديد' : 'WRITE NEW ARTICLE'}
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Controls: Search & Category Filter */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-4 py-2 rounded-xl text-xs font-cyber tracking-wider transition-all ${
                  selectedCategory === cat.key
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
              placeholder={isArabic ? 'بحث في المقالات والكتّاب...' : 'Search articles & authors...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full py-2 rounded-xl bg-dark-navy/80 border border-white/10 text-white placeholder-muted-foreground/60 text-xs focus:border-primary focus:outline-none transition-all ${
                isArabic ? 'pr-9 pl-4' : 'pl-9 pr-4'
              }`}
            />
          </div>
        </div>

        {/* Articles Feed */}
        {filteredPosts.length === 0 ? (
          <div className="p-12 md:p-16 text-center glass rounded-3xl border border-white/10 space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto">
              <FileText className="w-8 h-8" />
            </div>

            <div className="space-y-2 max-w-lg mx-auto">
              <h3 className="text-xl sm:text-2xl font-cyber font-bold text-white">
                {isArabic ? 'قاعدة البيانات جاهزة • لا توجد مقالات منشورة بعد' : 'DATABASE READY • NO ARTICLES POSTED YET'}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {isArabic
                  ? 'قاعدة بيانات Supabase متصلة وجاهزة للمقالات. يمكن للمحررين نشر المقالات من لوحة التحكم، أو يمكنك معاينة نماذج المقالات أدناه.'
                  : 'The Supabase database is connected and ready for articles. Club editors can publish articles from the Admin Panel, or you can preview sample articles below.'
                }
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">

              {isEditor ? (
                <Link to="/admin/blog">
                  <Button variant="outline" size="sm">
                    {isArabic ? 'فتح لوحة إدارة المقالات' : 'OPEN BLOG MANAGEMENT'}
                  </Button>
                </Link>
              ) : (
                <Link to="/contact">
                  <Button variant="outline" size="sm">
                    {isArabic ? 'اقترح موضوعاً للمدونة' : 'SUGGEST AN ARTICLE TOPIC'}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredPosts.map((post, idx) => (
              <motion.article
                key={post.id || idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                onClick={() => setReadingPost(post)}
                className="group glass p-6 md:p-8 rounded-3xl border border-white/10 hover:border-primary/40 transition-all flex flex-col md:flex-row gap-8 cursor-pointer relative overflow-hidden"
              >
                <div className="w-full md:w-1/3 aspect-video bg-white/5 rounded-2xl overflow-hidden shrink-0 relative">
                  <img
                    src={post.image || `https://picsum.photos/seed/techblog${idx}/800/600`}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <span className={`absolute top-3 ${isArabic ? 'right-3' : 'left-3'} px-2.5 py-1 rounded-md text-[10px] font-cyber bg-dark-navy/80 backdrop-blur-md text-primary border border-primary/30 uppercase`}>
                    {post.category || 'Tech'}
                  </span>
                </div>

                <div className="flex-grow flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-4 text-[11px] font-cyber uppercase tracking-wider text-muted-foreground">
                      <span className="flex items-center text-primary">
                        <Tag className={`w-3 h-3 ${isArabic ? 'ml-1' : 'mr-1'}`} />
                        {post.tag || post.category || (isArabic ? 'علم البيانات' : 'Data Science')}
                      </span>
                      <span className="flex items-center">
                        <Calendar className={`w-3 h-3 ${isArabic ? 'ml-1' : 'mr-1'}`} />
                        {post.date || (isArabic ? 'مؤخراً' : 'Recent')}
                      </span>
                      <span className="flex items-center">
                        <User className={`w-3 h-3 ${isArabic ? 'ml-1' : 'mr-1'}`} />
                        {post.author || (isArabic ? 'عضو بالنادي' : 'Club Operative')}
                      </span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-bold font-cyber text-white group-hover:text-primary transition-colors leading-tight">
                      {post.title}
                    </h2>

                    <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
                      {post.excerpt || post.content?.substring(0, 160) + '...'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {post.readTime || (isArabic ? '4 دقائق قراءة' : '4 min read')}
                    </span>
                    <span className="text-xs font-cyber font-bold text-primary group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      {isArabic ? 'قراءة المقال كاملاً' : 'READ FULL ARTICLE'}
                      <ArrowRight className={`w-3.5 h-3.5 ${isArabic ? 'rotate-180' : ''}`} />
                    </span>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}

        {/* Article Reader Modal */}
        <AnimatePresence>
          {readingPost && (
            <Dialog onClose={() => setReadingPost(null)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-dark-navy/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
              onClick={() => setReadingPost(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="max-w-3xl w-full glass p-6 sm:p-10 rounded-3xl border border-primary/30 max-h-[90vh] overflow-y-auto custom-scrollbar relative space-y-6"
              >
                <button aria-label="Close"
                  onClick={() => setReadingPost(null)}
                  className={`absolute top-6 ${isArabic ? 'left-6' : 'right-6'} p-2 rounded-xl bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white transition-colors`}
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full text-[10px] font-cyber uppercase tracking-wider bg-primary/20 text-primary border border-primary/30">
                      {readingPost.category || (isArabic ? 'مقال تقني' : 'Tech Article')}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground">
                      {readingPost.date}
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-black font-cyber text-white leading-tight">
                    {readingPost.title}
                  </h1>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
                    <span>{isArabic ? 'بقلم:' : 'By'} <strong className="text-white">{readingPost.author}</strong></span>
                    <span>•</span>
                    <span>{readingPost.readTime || (isArabic ? '5 دقائق قراءة' : '5 min read')}</span>
                  </div>
                </div>

                {readingPost.image && (
                  <div className="rounded-2xl overflow-hidden aspect-video border border-white/10">
                    <img src={readingPost.image} alt={readingPost.title} className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="text-muted-foreground text-sm sm:text-base leading-relaxed space-y-4 whitespace-pre-line border-t border-b border-white/10 py-6">
                  {readingPost.content || readingPost.excerpt}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      void copyText(getCanonicalUrl(`/blog?article=${encodeURIComponent(readingPost.id)}`), isArabic ? 'تم نسخ رابط المقال إلى الحافظة!' : 'Article link copied to clipboard!');
                    }}
                    className="gap-2 text-xs font-cyber"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    {isArabic ? 'مشاركة المقال' : 'SHARE TRANSMISSION'}
                  </Button>
                  <Button
                    variant="cyber"
                    size="sm"
                    onClick={() => setReadingPost(null)}
                  >
                    {isArabic ? 'إغلاق القراءة' : 'DONE READING'}
                  </Button>
                </div>
              </motion.div>
            </Dialog>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default Blog;
