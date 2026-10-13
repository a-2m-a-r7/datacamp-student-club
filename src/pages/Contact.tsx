import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Send, Mail, Phone, MapPin, MessageSquare, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { toast } from 'sonner';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { contentService } from '../services/contentService';

const Contact = () => {
  const { isArabic } = useLanguage();
  const { isManager } = useAuth();
  const [siteSettings, setSiteSettings] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadSettings = async () => {
      try {
        const data = await contentService.getSetting('site');
        if (mounted && data) setSiteSettings(data);
      } catch (err) {
        console.warn('Failed to load site settings in Contact:', err);
      }
    };
    loadSettings();
    const unsubscribe = contentService.subscribe('settings', loadSettings);
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    const trimmedData = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      subject: formData.subject.trim(),
      message: formData.message.trim(),
    };

    try {
      await contentService.create('messages', {
        ...trimmedData,
        status: 'unread',
      });

      toast.success(isArabic ? 'تم استلام رسالتك بنجاح. سنتواصل معك قريباً.' : 'Transmission received. We will contact you shortly.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch {
      toast.error(isArabic ? 'فشل إرسال الرسالة. يرجى المحاولة لاحقاً.' : 'Failed to send transmission. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-20 md:pt-32 pb-20">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-black font-cyber tracking-tighter mb-4 neon-text uppercase">
              {isArabic ? 'تواصل معنا' : 'ESTABLISH CONTACT'}
            </h1>
            <p className="text-muted-foreground">
              {isArabic
                ? 'أرسل لنا استفسارك المباشر أو تفضل بزيارة مقر النادي بالحرم الجامعي.'
                : 'Send us a secure transmission or visit our physical coordinates.'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: isArabic ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass p-8 md:p-12 rounded-3xl border border-white/10"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-cyber uppercase tracking-widest text-muted-foreground">
                      {isArabic ? 'الاسم بالكامل' : 'Full Name'}
                    </label>
                    <Input
                      placeholder={isArabic ? 'أحمد منصور' : 'John Doe'}
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-cyber uppercase tracking-widest text-muted-foreground">
                      {isArabic ? 'البريد الإلكتروني' : 'Email Address'}
                    </label>
                    <Input
                      type="email"
                      placeholder={isArabic ? 'student@innovation.edu.eg' : 'john@example.com'}
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-cyber uppercase tracking-widest text-muted-foreground">
                    {isArabic ? 'موضوع الرسالة' : 'Subject'}
                  </label>
                  <Input
                    placeholder={isArabic ? 'استفسار عام / انضمام للنادي' : 'General Inquiry'}
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-cyber uppercase tracking-widest text-muted-foreground">
                    {isArabic ? 'نص الرسالة' : 'Message Body'}
                  </label>
                  <textarea
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:ring-1 focus:ring-primary outline-none min-h-[150px] transition-all focus:border-primary/50 text-white"
                    placeholder={isArabic ? 'اكتب تفاصيل استفسارك أو اقتراحك هنا...' : 'Type your transmission here...'}
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    required
                  />
                </div>
                <Button variant="cyber" type="submit" className="w-full py-6 text-lg" disabled={submitting}>
                  <Send className={`w-5 h-5 ${isArabic ? 'ml-2' : 'mr-2'} ${submitting ? 'animate-pulse' : ''}`} />
                  {submitting
                    ? (isArabic ? 'جاري الإرسال...' : 'TRANSMITTING...')
                    : (isArabic ? 'إرسال الرسالة' : 'SEND TRANSMISSION')
                  }
                </Button>
              </form>
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, x: isArabic ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-12"
            >
              <div className="space-y-8">
                <div className="flex items-start space-x-6 gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-cyber font-bold uppercase tracking-widest text-primary mb-1">
                      {isArabic ? 'البريد الإلكتروني الرسمي' : 'Direct Email'}
                    </h4>
                    <p className="text-muted-foreground">{siteSettings?.contactEmail || (isArabic ? 'غير محدد' : 'Not configured')}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-6 gap-4">
                  <div className="w-12 h-12 rounded-xl bg-neon-blue/10 border border-neon-blue/20 flex items-center justify-center shrink-0">
                    <Phone className="w-6 h-6 text-neon-blue" />
                  </div>
                  <div>
                    <h4 className="text-sm font-cyber font-bold uppercase tracking-widest text-neon-blue mb-1">
                      {isArabic ? 'خط التواصل الهاتفي' : 'Voice Line'}
                    </h4>
                    <p className="text-muted-foreground" dir="ltr">{siteSettings?.contactPhone || (isArabic ? 'غير محدد' : 'Not configured')}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-6 gap-4">
                  <div className="w-12 h-12 rounded-xl bg-neon-purple/10 border border-neon-purple/20 flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6 text-neon-purple" />
                  </div>
                  <div>
                    <h4 className="text-sm font-cyber font-bold uppercase tracking-widest text-neon-purple mb-1">
                      {isArabic ? 'الموقع والمقر' : 'Coordinates'}
                    </h4>
                    <p className="text-muted-foreground">
                      {siteSettings?.contactAddress || (isArabic ? 'غير محدد' : 'Not configured')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="glass p-8 rounded-3xl border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full" />
                <h4 className="text-lg font-cyber font-bold mb-4 flex items-center">
                  <MessageSquare className={`w-5 h-5 ${isArabic ? 'ml-2' : 'mr-2'} text-primary`} />
                  {isArabic ? 'الدعم المباشر ومجتمع Discord' : 'LIVE_SUPPORT'}
                </h4>
                <p className="text-sm text-muted-foreground mb-6">
                  {isArabic
                    ? 'مجتمعنا الطلابي متواجد على مدار الساعة. للاستفسارات السريعة وتحديات البرمجة، انضم لقناتنا التفاعلية.'
                    : 'Our neural network is active 24/7. For urgent inquiries, use the priority channel in our Discord.'
                  }
                </p>
                {siteSettings?.discordUrl ? (
                  <a
                    href={siteSettings.discordUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={isArabic ? 'الانضمام لمجتمع Discord الرسمي' : 'Join official Discord community'}
                    className="block w-full"
                  >
                    <Button variant="outline" className="w-full">
                      {isArabic ? 'الانضمام لمجتمع Discord' : 'Join Discord Server'}
                    </Button>
                  </a>
                ) : isManager ? (
                  <Link to="/admin/content" className="block w-full">
                    <Button variant="outline" className="w-full border-amber-500/40 text-amber-300 hover:bg-amber-500/10 gap-2 font-mono text-xs">
                      <Settings className="w-4 h-4 text-amber-400" />
                      {isArabic ? 'إعداد رابط Discord (مشرف)' : 'Configure Discord URL (Admin)'}
                    </Button>
                  </Link>
                ) : (
                  <p className="text-xs text-muted-foreground/70 font-mono text-center py-2 border border-white/5 rounded-lg bg-white/5">
                    {isArabic ? 'رابط مجتمع Discord سيتاح قريباً' : 'Official Discord link coming soon'}
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
