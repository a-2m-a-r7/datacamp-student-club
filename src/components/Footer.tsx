import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import { Github, Twitter, Linkedin, Facebook, Mail, Phone, MapPin, Instagram, Link as LinkIcon } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { contentService } from '../services/contentService';

const Footer = () => {
  const { isArabic, t } = useLanguage();
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setSettings(await contentService.getSetting('site'));
      } catch (error) {
        console.warn('Footer settings load error:', error);
      }
    };

    loadSettings();
    return contentService.subscribe('settings', loadSettings);
  }, []);

  const getIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'facebook': return Facebook;
      case 'twitter': return Twitter;
      case 'instagram': return Instagram;
      case 'linkedin': return Linkedin;
      case 'github': return Github;
      default: return LinkIcon;
    }
  };

  return (
    <footer className="bg-dark-navy border-t border-white/10 pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="space-y-6">
            <Link to="/" className="inline-block">
              <Logo iconSize={42} />
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {isArabic 
                ? 'تمكين الطلاب من إتقان علم البيانات، الذكاء الاصطناعي، وهندسة البرمجيات عبر تعليم تفاعلي وشهادات معتمدة.' 
                : (settings?.siteDescription || 'Empowering students with data science, AI, and software engineering skills.')}
            </p>
            <div className="flex space-x-4 rtl:space-x-reverse">
              {settings?.socialLinks?.map((link: any, idx: number) => {
                const Icon = getIcon(link.platform);
                return (
                  <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                    <Icon className="w-5 h-5" />
                  </a>
                );
              }) || (
                <>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Github className="w-5 h-5" /></a>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Twitter className="w-5 h-5" /></a>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Linkedin className="w-5 h-5" /></a>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Facebook className="w-5 h-5" /></a>
                </>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-cyber text-sm font-bold mb-6 tracking-widest text-neon-blue">
              {t('footer.quick_links', 'Quick Links')}
            </h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-primary transition-colors">{t('nav.about', 'About Us')}</Link></li>
              <li><Link to="/courses" className="hover:text-primary transition-colors">{t('nav.courses', 'Courses')}</Link></li>
              <li><Link to="/events" className="hover:text-primary transition-colors">{t('nav.events', 'Events')}</Link></li>
              <li><Link to="/projects" className="hover:text-primary transition-colors">{t('nav.projects', 'Projects')}</Link></li>
              <li><Link to="/blog" className="hover:text-primary transition-colors">{t('nav.blog', 'Blog')}</Link></li>
              <li><Link to="/staff" className="hover:text-primary transition-colors">{t('nav.staff', 'Staff')}</Link></li>
              <li><Link to="/gallery" className="hover:text-primary transition-colors">{t('nav.gallery', 'Gallery')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-cyber text-sm font-bold mb-6 tracking-widest text-neon-purple">
              {isArabic ? 'الدعم والمساعدة' : 'Support'}
            </h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><Link to="/faq" className="hover:text-primary transition-colors">{t('nav.faq', 'FAQ')}</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">{t('nav.contact', 'Contact Us')}</Link></li>
              <li><Link to="/privacy" className="hover:text-primary transition-colors">{isArabic ? 'سياسة الخصوصية' : 'Privacy Policy'}</Link></li>
              <li><Link to="/terms" className="hover:text-primary transition-colors">{isArabic ? 'الشروط والأحكام' : 'Terms of Service'}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-cyber text-sm font-bold mb-6 tracking-widest text-neon-green">
              {isArabic ? 'معلومات التواصل' : 'Contact Info'}
            </h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li className="flex items-center space-x-3 rtl:space-x-reverse">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <span>{settings?.contactEmail || 'contact@datacamp.club'}</span>
              </li>
              <li className="flex items-center space-x-3 rtl:space-x-reverse">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <span>{settings?.contactPhone || '+20 123 456 7890'}</span>
              </li>
              <li className="flex items-center space-x-3 rtl:space-x-reverse">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <span>{isArabic ? 'الحرم الجامعي، مبنى التكنولوجيا' : 'University Campus, Tech Building'}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-muted-foreground gap-4">
          <p>
            {isArabic 
              ? 'جميع الحقوق محفوظة © 2026 نادي داتا كامب الطلابي • جامعة الابتكار.' 
              : `© 2026 ${settings?.siteName || 'DataCamp Student Club'}. All rights reserved.`}
          </p>
          <div className="flex items-center gap-4">
            <LanguageSwitcher variant="pill" />
            <span className="font-mono text-[10px]">VERSION: 2.5.0-AR</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
