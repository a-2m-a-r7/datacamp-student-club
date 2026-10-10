import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, Info, Calendar, BookOpen, Code, 
  FileText, Users, Image as ImageIcon, Mail, 
  LayoutDashboard, LogOut, ChevronLeft, ChevronRight,
  Settings as SettingsIcon, Shield, BarChart3, X, User, Menu,
  Trophy, Sparkles, Bell, Award, UserPlus, LogIn, GraduationCap
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './ui/Button';
import { toast } from 'sonner';
import Logo from './Logo';
import { LanguageSwitcher } from './LanguageSwitcher';

const Sidebar = ({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (val: boolean) => void }) => {
  const { 
    user, 
    profile, 
    logout,
    isSuperAdmin,
    isAdmin, 
    isEditor,
    isHR, 
    isEventManager,
    isContentManager,
    isFinanceManager,
    isOrganizer,
    isManager 
  } = useAuth();
  const { t, isArabic } = useLanguage();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      
      // Update global CSS variable for layout spacing
      if (desktop) {
        document.documentElement.style.setProperty('--sidebar-width', isCollapsed ? '80px' : '280px');
      } else {
        document.documentElement.style.setProperty('--sidebar-width', '0px');
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isCollapsed]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    closeOnMobile();
  };

  const closeOnMobile = () => {
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  const mainLinks = [
    { name: t('nav.home', 'Home'), path: '/', icon: Home },
    { name: t('nav.courses', 'Courses'), path: '/courses', icon: BookOpen },
    ...(user ? [{ name: isArabic ? 'كورساتي' : 'My Courses', path: '/my-courses', icon: GraduationCap }] : []),
    { name: t('nav.compiler', 'Online Compiler'), path: '/compiler', icon: Code },
    { name: t('nav.leaderboard', 'Leaderboard'), path: '/leaderboard', icon: Trophy },
    { name: t('nav.certificates', 'Certificates'), path: '/certificates', icon: Trophy },
    { name: t('nav.notifications', 'Notifications'), path: '/notifications', icon: Bell },
    { name: t('nav.events', 'Events'), path: '/events', icon: Calendar },
    { name: t('nav.projects', 'Projects'), path: '/projects', icon: Code },
    { name: t('nav.blog', 'Blog'), path: '/blog', icon: FileText },
    { name: t('nav.staff', 'Staff'), path: '/staff', icon: Users },
    { name: t('nav.gallery', 'Gallery'), path: '/gallery', icon: ImageIcon },
    { name: t('nav.about', 'About'), path: '/about', icon: Info },
    { name: t('nav.contact', 'Contact'), path: '/contact', icon: Mail },
  ];

  const adminLinks = [
    { name: isArabic ? 'نظرة عامة' : 'Overview', path: '/admin', icon: BarChart3, visible: isManager },
    { name: isArabic ? 'إدارة الدورات' : 'Courses', path: '/admin/courses', icon: BookOpen, visible: isAdmin || isEditor || isContentManager },
    { name: isArabic ? 'النقاط والـ XP' : 'Points & XP', path: '/admin/points', icon: Sparkles, visible: isAdmin || isManager },
    { name: isArabic ? 'الأعضاء' : 'Users', path: '/admin/users', icon: Users, visible: isAdmin || isHR },
    { name: isArabic ? 'الفعاليات' : 'Events', path: '/admin/events', icon: Calendar, visible: isAdmin || isHR || isEventManager },
    { name: isArabic ? 'فريق العمل' : 'Staff', path: '/admin/staff', icon: User, visible: isAdmin },
    { name: isArabic ? 'المعرض' : 'Gallery', path: '/admin/gallery', icon: ImageIcon, visible: isAdmin || isContentManager },
    { name: isArabic ? 'المشاريع' : 'Projects', path: '/admin/projects', icon: Code, visible: isAdmin || isContentManager },
    { name: isArabic ? 'المقالات' : 'Blog', path: '/admin/blog', icon: FileText, visible: isAdmin || isEditor || isContentManager },
    { name: isArabic ? 'الرسائل' : 'Messages', path: '/admin/messages', icon: Mail, visible: isAdmin || isContentManager },
    { name: isArabic ? 'إعلانات المحتوى' : 'Content', path: '/admin/content', icon: LayoutDashboard, visible: isAdmin || isEditor || isContentManager },
    { name: isArabic ? 'مركز الأمان' : 'Security', path: '/admin/security', icon: Shield, visible: isSuperAdmin },
    { name: isArabic ? 'الملف الشخصي' : 'Profile', path: '/profile', icon: User, visible: true },
    { name: isArabic ? 'إعدادات المنصة' : 'Settings', path: '/admin/settings', icon: SettingsIcon, visible: isSuperAdmin },
  ].filter(link => link.visible);

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside 
        initial={false}
        animate={{ 
          width: isDesktop ? (isCollapsed ? '80px' : '280px') : '280px',
          x: isDesktop || isOpen ? 0 : (isArabic ? 280 : -280),
          visibility: isDesktop || isOpen ? 'visible' : 'hidden'
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`fixed top-0 ${isArabic ? 'right-0 border-l' : 'left-0 border-r'} h-screen glass border-white/10 z-50 flex flex-col cyber-grid flex-shrink-0 ${!isDesktop && !isOpen ? 'pointer-events-none' : ''}`}
      >
        {/* Logo Section - Fixed at top */}
        <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'justify-start space-x-3 rtl:space-x-reverse'} border-b border-white/5`}>
          <Link to="/" className="shrink-0 group" onClick={closeOnMobile}>
            <Logo isCollapsed={isCollapsed && isDesktop} iconSize={42} />
          </Link>
          {/* Mobile Close Button */}
          <button onClick={() => setIsOpen(false)} className="lg:hidden ml-auto rtl:ml-0 rtl:mr-auto text-muted-foreground">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Links - Scrollable */}
        <div className="flex-grow overflow-y-auto overflow-x-hidden px-3 py-6 space-y-2 custom-scrollbar">
          <div className="mb-4">
            {(!isCollapsed || !isDesktop) && (
              <motion.p 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-[10px] font-cyber tracking-widest text-muted-foreground px-4 mb-4"
              >
                {t('nav.main_menu', 'Navigation')}
              </motion.p>
            )}
            {mainLinks.map((link, idx) => (
              <motion.div
                key={link.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Link
                  to={link.path}
                  onClick={closeOnMobile}
                  className={`flex items-center ${(isCollapsed && isDesktop) ? 'justify-center' : 'space-x-4 rtl:space-x-reverse px-4'} py-3 rounded-xl transition-all group relative border-2 ${
                    location.pathname === link.path 
                    ? 'bg-primary/10 text-primary border-primary/30 shadow-[0_0_15px_rgba(57,255,20,0.1)]' 
                    : 'text-muted-foreground hover:bg-white/5 hover:text-white border-transparent hover:border-white/10'
                  }`}
                >
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <link.icon className={`w-5 h-5 shrink-0 ${location.pathname === link.path ? 'text-primary' : 'group-hover:text-primary transition-colors'}`} />
                  </motion.div>
                  {(!isCollapsed || !isDesktop) && <span className="font-cyber text-sm tracking-wider">{link.name}</span>}
                  
                  {/* Active Indicator for Collapsed Mode */}
                  {location.pathname === link.path && (isCollapsed && isDesktop) && (
                    <motion.div layoutId="active-dot" className={`absolute ${isArabic ? 'right-0 rounded-l-full' : 'left-0 rounded-r-full'} w-1 h-6 bg-primary shadow-[0_0_10px_#39FF14]`} />
                  )}
                  
                  {/* Tooltip for Collapsed Mode */}
                  {(isCollapsed && isDesktop) && (
                    <div className={`absolute ${isArabic ? 'right-full mr-4' : 'left-full ml-4'} px-3 py-1 bg-dark-navy border border-white/10 rounded text-[10px] font-cyber tracking-widest opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 whitespace-nowrap z-50`}>
                      {link.name}
                    </div>
                  )}
                </Link>
              </motion.div>
            ))}
          </div>

          {isManager && (
            <div className="pt-6 border-t border-white/5">
              {(!isCollapsed || !isDesktop) && <p className="text-[10px] font-cyber tracking-widest text-muted-foreground px-4 mb-4">{t('nav.admin_portal', 'Admin Portal')}</p>}
              {adminLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={closeOnMobile}
                  className={`flex items-center ${(isCollapsed && isDesktop) ? 'justify-center' : 'space-x-4 rtl:space-x-reverse px-4'} py-3 rounded-xl transition-all group relative border-2 ${
                    (link.path === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(link.path)) 
                    ? 'bg-neon-purple/10 text-neon-purple border-neon-purple/30 shadow-[0_0_15px_rgba(188,19,254,0.1)]' 
                    : 'text-muted-foreground hover:bg-white/5 hover:text-white border-transparent hover:border-white/10'
                  }`}
                >
                  <link.icon className={`w-5 h-5 shrink-0 ${
                    (link.path === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(link.path)) 
                    ? 'text-neon-purple' 
                    : 'group-hover:text-neon-purple transition-colors'
                  }`} />
                  {(!isCollapsed || !isDesktop) && <span className="font-cyber text-sm tracking-wider">{link.name}</span>}
                  
                  {(isCollapsed && isDesktop) && (
                    <div className={`absolute ${isArabic ? 'right-full mr-4' : 'left-full ml-4'} px-3 py-1 bg-dark-navy border border-white/10 rounded text-[10px] font-cyber tracking-widest opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50`}>
                      {link.name}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Footer Section */}
        <div className="p-4 border-t border-white/5 space-y-2">
          {user ? (
            <div className="space-y-2">
              <Link 
                to="/profile"
                onClick={closeOnMobile}
                className={`flex items-center ${(isCollapsed && isDesktop) ? 'justify-center' : 'space-x-3 rtl:space-x-reverse'} p-2 rounded-lg transition-all ${
                  location.pathname === '/profile' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0 overflow-hidden">
                  {profile?.photoURL ? (
                    <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <span className="text-xs font-bold text-primary">{user.email?.[0].toUpperCase()}</span>
                  )}
                </div>
                {(!isCollapsed || !isDesktop) && (
                  <div className="flex-grow min-w-0">
                    <p className="text-xs font-bold truncate">{profile?.fullName || user.email?.split('@')[0]}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{isManager ? (isArabic ? 'مشرف' : 'Admin') : (isArabic ? 'عضو' : 'Member')}</p>
                  </div>
                )}
                {(isCollapsed && isDesktop) && (
                  <div className={`absolute ${isArabic ? 'right-full mr-4' : 'left-full ml-4'} px-3 py-1 bg-dark-navy border border-white/10 rounded text-[10px] font-cyber tracking-widest opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50`}>
                    {t('nav.profile', 'Profile')}
                  </div>
                )}
              </Link>
              
              {(!isCollapsed || !isDesktop) && (
                <button 
                  onClick={handleLogout} 
                  className="w-full flex items-center space-x-3 rtl:space-x-reverse p-2 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/5"
                >
                  <LogOut className="w-4 h-4 rtl:rotate-180" />
                  <span className="text-xs font-bold uppercase tracking-wider">{t('nav.logout', 'Logout')}</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <Button 
                variant="cyber" 
                className="w-full text-xs font-cyber font-bold tracking-wider h-10 gap-2" 
                size="sm"
                onClick={() => {
                  navigate('/register');
                  closeOnMobile();
                }}
              >
                <UserPlus className="w-4 h-4 shrink-0" />
                {(!isCollapsed || !isDesktop) && (isArabic ? 'إنشاء حساب جديد' : 'INITIALIZE_MEMBERSHIP')}
              </Button>
              {(!isCollapsed || !isDesktop) && (
                <Button 
                  variant="outline" 
                  className="w-full text-xs font-cyber tracking-wider h-9 border-white/10 hover:border-primary/40 text-muted-foreground hover:text-white" 
                  size="sm"
                  onClick={() => {
                    navigate('/login');
                    closeOnMobile();
                  }}
                >
                  {isArabic ? 'تسجيل الدخول' : 'LOGIN_SYSTEM'}
                </Button>
              )}
            </div>
          )}

          {/* Language Switcher */}
          <div className="pt-2">
            <LanguageSwitcher variant="sidebar" isCollapsed={isCollapsed && isDesktop} />
          </div>
          
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex w-full items-center justify-center p-2 text-muted-foreground hover:text-primary transition-colors"
          >
            {isCollapsed 
              ? (isArabic ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />)
              : (isArabic ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />)}
          </button>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
