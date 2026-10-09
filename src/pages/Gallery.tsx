import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Camera, Search } from 'lucide-react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db, isFirebaseReady } from '../lib/firebase';
import { demoGallery } from '../lib/demoData';
import { Button } from '../components/ui/Button';
import { useLanguage } from '../contexts/LanguageContext';

const SAMPLE_GALLERY_EN = [
  {
    id: 'gal-1',
    title: 'Python for AI Bootcamp: Opening Day',
    category: 'Workshops',
    url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&auto=format&fit=crop&q=80',
    date: 'February 2026',
    description: 'Hands-on practical session at Innovation University Computer Labs introducing students to NumPy vectorization and Pandas.'
  },
  {
    id: 'gal-2',
    title: 'DataCamp Hackathon 2025: Final Pitching',
    category: 'Hackathons',
    url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&auto=format&fit=crop&q=80',
    date: 'December 2025',
    description: 'Teams presenting their computer vision solutions to industry judges and university faculty members.'
  },
  {
    id: 'gal-3',
    title: 'Orientation Day & Welcome Ceremony',
    category: 'Campus Days',
    url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&auto=format&fit=crop&q=80',
    date: 'October 2025',
    description: 'Welcoming 300+ freshmen and sophomores to the DataCamp Student Club community.'
  },
  {
    id: 'gal-4',
    title: 'Neural Networks & Deep Learning Masterclass',
    category: 'Workshops',
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80',
    date: 'January 2026',
    description: 'Training deep models using PyTorch on cloud GPU accelerators.'
  },
  {
    id: 'gal-5',
    title: 'Annual Certificates & Honors Awarding',
    category: 'Ceremonies',
    url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&auto=format&fit=crop&q=80',
    date: 'January 2026',
    description: 'Honoring top leaderboard operatives with certified club credentials and academic medals.'
  },
  {
    id: 'gal-6',
    title: 'Industry Speaker Session: AI in Egypt & MENA',
    category: 'Campus Days',
    url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1200&auto=format&fit=crop&q=80',
    date: 'November 2025',
    description: 'Guest talk discussing data science hiring trends, remote work, and tech industry standards.'
  }
];

const SAMPLE_GALLERY_AR = [
  {
    id: 'gal-1',
    title: 'اليوم الافتتاحي لمعسكر بايثون والذكاء الاصطناعي',
    category: 'Workshops',
    categoryAr: 'ورش العمل',
    url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&auto=format&fit=crop&q=80',
    date: 'فبراير 2026',
    description: 'جلسة تدريبية تطبيقية في مختبرات حاسوب جامعة الابتكار لتدريب الطلاب على مكتبات NumPy و Pandas.'
  },
  {
    id: 'gal-2',
    title: 'هاكاثون DataCamp 2025: العروض التقديمية النهائية',
    category: 'Hackathons',
    categoryAr: 'الهاكاثونات',
    url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&auto=format&fit=crop&q=80',
    date: 'ديسمبر 2025',
    description: 'فرق الطلاب تستعرض حلول رؤية الحاسوب والذكاء الاصطناعي أمام لجنة التحكيم وأعضاء هيئة التدريس.'
  },
  {
    id: 'gal-3',
    title: 'يوم الاستقبال والتعريف بأنشطة النادي',
    category: 'Campus Days',
    categoryAr: 'أيام الحرم الجامعي',
    url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&auto=format&fit=crop&q=80',
    date: 'أكتوبر 2025',
    description: 'استقبال أكثر من 300 طالب وطالبة من الفرق الأولى والثانية وتعريفهم بمسارات النادي.'
  },
  {
    id: 'gal-4',
    title: 'ماستركلاس الشبكات العصبية والتعلم العميق',
    category: 'Workshops',
    categoryAr: 'ورش العمل',
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80',
    date: 'يناير 2026',
    description: 'تدريب مباشر على بناء نماذج التعلم العميق باستخدام مكتبة PyTorch والمعالجات السحابية.'
  },
  {
    id: 'gal-5',
    title: 'حفل تسليم الشهادات وتكريم المتفوقين',
    category: 'Ceremonies',
    categoryAr: 'حفلات التكريم',
    url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&auto=format&fit=crop&q=80',
    date: 'يناير 2026',
    description: 'تكريم متصدري لوحة الأوائل وتوزيع الشهادات الأكاديمية والميداليات المعتمدة.'
  },
  {
    id: 'gal-6',
    title: 'ندوة خبراء الصناعة: الذكاء الاصطناعي وسوق العمل بمصر',
    category: 'Campus Days',
    categoryAr: 'أيام الحرم الجامعي',
    url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1200&auto=format&fit=crop&q=80',
    date: 'نوفمبر 2025',
    description: 'لقاء مفتوح مع خبراء تقنيين حول اتجاهات التوظيف في علم البيانات والعمل عن بعد.'
  }
];

export const Gallery = () => {
  const { isArabic } = useLanguage();
  const [images, setImages] = useState<any[]>([]);
  const [, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<any | null>(null);
  const [selectedCat, setSelectedCat] = useState('ALL');
  const [search, setSearch] = useState('');
  const [showSampleGallery, setShowSampleGallery] = useState(false);

  const categories = isArabic ? [
    { key: 'ALL', label: 'الكل' },
    { key: 'Workshops', label: 'ورش العمل' },
    { key: 'Hackathons', label: 'الهاكاثونات' },
    { key: 'Campus Days', label: 'أيام الحرم الجامعي' },
    { key: 'Ceremonies', label: 'حفلات التكريم' },
  ] : [
    { key: 'ALL', label: 'ALL' },
    { key: 'Workshops', label: 'Workshops' },
    { key: 'Hackathons', label: 'Hackathons' },
    { key: 'Campus Days', label: 'Campus Days' },
    { key: 'Ceremonies', label: 'Ceremonies' },
  ];

  useEffect(() => {
    const sampleData = isArabic ? SAMPLE_GALLERY_AR : SAMPLE_GALLERY_EN;
    if (!isFirebaseReady) {
      setImages(demoGallery.length > 0 ? demoGallery : sampleData);
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'gallery'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setImages(docs);
      setLoading(false);
    }, (error) => {
      console.warn("Gallery listener error:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [isArabic]);

  const activeSamples = isArabic ? SAMPLE_GALLERY_AR : SAMPLE_GALLERY_EN;
  const displaySource = images.length > 0 ? images : (showSampleGallery ? activeSamples : []);

  const filteredImages = displaySource.filter(img => {
    const matchesCat = selectedCat === 'ALL' || (img.category && img.category.toLowerCase() === selectedCat.toLowerCase());
    const matchesSearch = !search ||
      img.title?.toLowerCase().includes(search.toLowerCase()) ||
      img.description?.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="pt-20 md:pt-32 pb-24 min-h-screen">
      <div className="container mx-auto px-6 max-w-6xl space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-cyber tracking-widest uppercase mb-4">
              <Camera className="w-3.5 h-3.5" /> 
              {isArabic ? 'السجل الفوتوغرافي والذكريات' : 'VISUAL RECORD & MEMORIES'}
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black font-cyber tracking-tighter mb-4 neon-text">
              {isArabic ? 'أرشيف' : 'COMMUNITY'} <span className="text-white">{isArabic ? 'معرض صور النادي' : 'ARCHIVE'}</span>
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              {isArabic
                ? 'التوثيق الفوتوغرافي لأهم المؤتمرات، وورش العمل التدريبية، والهاكاثونات البرمجية لنادي DataCamp بجامعة الابتكار.'
                : 'Photographic documentation of keynote events, technical workshops, and hackathons hosted by DataCamp Student Club at Innovation University.'
              }
            </p>
          </div>
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
              placeholder={isArabic ? 'بحث في الفعاليات واللحظات...' : 'Search moments & events...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full py-2 rounded-xl bg-dark-navy/80 border border-white/10 text-white placeholder-muted-foreground/60 text-xs focus:border-primary focus:outline-none transition-all ${
                isArabic ? 'pr-9 pl-4' : 'pl-9 pr-4'
              }`}
            />
          </div>
        </div>

        {/* Gallery Grid or Empty State */}
        {filteredImages.length === 0 ? (
          <div className="p-12 md:p-16 text-center glass rounded-3xl border border-white/10 space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto">
              <Camera className="w-8 h-8" />
            </div>

            <div className="space-y-2 max-w-lg mx-auto">
              <h3 className="text-xl sm:text-2xl font-cyber font-bold text-white">
                {isArabic ? 'أرشيف المعرض جاهز • بانتظار توثيق الفعاليات' : 'GALLERY ARCHIVE READY • PENDING EVENT COVERAGE'}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {isArabic
                  ? 'قاعدة البيانات متصلة ومستعدة لتلقي صور الفعاليات. تقوم لجان الإعلام والعلاقات العامة بتوثيق كل ورشة عمل ورفع الصور هنا.'
                  : 'The live database is connected and ready to receive event coverage photographs. The media and PR committees document every workshop and upload media here.'
                }
              </p>
            </div>

            <div className="flex justify-center pt-2">
              <Button
                variant="cyber"
                size="sm"
                onClick={() => setShowSampleGallery(!showSampleGallery)}
              >
                {showSampleGallery 
                  ? (isArabic ? 'إخفاء الصور التجريبية' : 'HIDE SAMPLE GALLERY') 
                  : (isArabic ? 'معاينة لحظات مصورة' : 'PREVIEW SAMPLE MOMENTS')
                }
              </Button>
            </div>
          </div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {filteredImages.map((img, idx) => (
              <motion.div
                key={img.id || idx}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.06 }}
                whileHover={{ scale: 1.02 }}
                className="relative group cursor-pointer overflow-hidden rounded-2xl border border-white/10 glass break-inside-avoid"
                onClick={() => setSelectedImage(img)}
              >
                <img 
                  src={img.url} 
                  alt={img.title} 
                  className="w-full h-auto object-cover transition-all duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/broken/800/600?blur=10';
                  }}
                />
                
                <div className="absolute inset-0 bg-dark-navy/75 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-6">
                  <div className="transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300 space-y-2">
                    <span className="px-2 py-0.5 rounded text-[9px] font-cyber bg-primary/20 text-primary border border-primary/30 uppercase">
                      {img.categoryAr && isArabic ? img.categoryAr : (img.category || 'Event')}
                    </span>
                    <p className="text-sm font-cyber font-bold text-white leading-tight">
                      {img.title}
                    </p>
                    {img.date && (
                      <p className="text-[10px] font-mono text-muted-foreground">
                        {img.date}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Lightbox Modal */}
        <AnimatePresence>
          {selectedImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-dark-navy/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6"
              onClick={() => setSelectedImage(null)}
            >
              <button 
                className={`absolute top-6 ${isArabic ? 'left-6' : 'right-6'} p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors`}
                onClick={() => setSelectedImage(null)}
              >
                <X className="w-6 h-6" />
              </button>

              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="max-w-4xl max-h-[90vh] flex flex-col glass rounded-3xl border border-white/20 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="overflow-hidden flex items-center justify-center max-h-[70vh] bg-black/40">
                  <img
                    src={selectedImage.url}
                    alt={selectedImage.title}
                    className="max-w-full max-h-[70vh] object-contain"
                  />
                </div>

                <div className="p-6 space-y-2 border-t border-white/10">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-cyber bg-primary/20 text-primary border border-primary/30 uppercase">
                      {selectedImage.categoryAr && isArabic ? selectedImage.categoryAr : (selectedImage.category || 'Archive Photo')}
                    </span>
                    {selectedImage.date && (
                      <span className="text-xs font-mono text-muted-foreground">
                        {selectedImage.date}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-cyber font-bold text-white">
                    {selectedImage.title}
                  </h3>
                  {selectedImage.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {selectedImage.description}
                    </p>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default Gallery;
