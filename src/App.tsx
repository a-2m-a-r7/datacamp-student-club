/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useLanguage } from './contexts/LanguageContext';
import Sidebar from './components/Sidebar';
import Logo from './components/Logo';
import Starfield from './components/Starfield';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import { Menu } from 'lucide-react';
import About from './pages/About';
import Projects from './pages/Projects';
import Blog from './pages/Blog';
import Events from './pages/Events';
import Staff from './pages/Staff';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import CourseLearning from './pages/CourseLearning';
import Leaderboard from './pages/Leaderboard';
import CompilerPlayground from './pages/CompilerPlayground';
import CourseQuiz from './pages/CourseQuiz';
import Certificates from './pages/Certificates';
import Notifications from './pages/Notifications';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import ContentPage from './components/ContentPage';
import { PointsProvider } from './contexts/PointsContext';
import { NotificationsProvider } from './contexts/NotificationsContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { AIMentorButton } from './components/AIMentor/AIMentorButton';
import { Toaster } from 'sonner';
import { AnimatePresence, motion } from 'motion/react';
import { useLocation } from 'react-router-dom';
import { isFirebaseReady } from './lib/firebase';
import { Button } from './components/ui/Button';

const GuestRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const { isArabic } = useLanguage();
  if (loading) return <div className="h-screen flex items-center justify-center font-cyber text-primary animate-pulse">{isArabic ? 'جاري المزامنة...' : 'SYNCHRONIZING...'}</div>;
  if (user) return <Navigate to="/dashboard" />;
  return <>{children}</>;
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, profile, loading } = useAuth();
  const { isArabic } = useLanguage();
  
  // Wait for both auth state AND profile to be resolved before making decisions
  if (loading) return <div className="h-screen flex items-center justify-center font-cyber text-primary animate-pulse">{isArabic ? 'جاري تهيئة الجلسة...' : 'ESTABLISHING_SESSION...'}</div>;
  if (!user) return <Navigate to="/login" />;
  
  // If user exists but profile hasn't loaded yet, show a brief loading state
  if (isFirebaseReady && user && !profile) {
    return <div className="h-screen flex items-center justify-center font-cyber text-primary animate-pulse">{isArabic ? 'جاري تحميل الملف الشخصي...' : 'LOADING_PROFILE...'}</div>;
  }
  
  return <>{children}</>;
};

const ManagerRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, profile, loading, isManager } = useAuth();
  const { isArabic } = useLanguage();
  if (loading) return <div className="h-screen flex items-center justify-center font-cyber text-primary animate-pulse">{isArabic ? 'جاري فحص الصلاحيات...' : 'EVALUATING_PERMISSIONS...'}</div>;
  if (!user) return <Navigate to="/login" />;
  
  // Enforce email verification
  if (isFirebaseReady && !user.emailVerified && !profile?.isVerified) {
    return <Navigate to="/verify-email" />;
  }

  if (!isManager) return <Navigate to="/dashboard" />;
  return <>{children}</>;
};

const NotFound = () => {
  const { isArabic } = useLanguage();
  return (
    <div className="h-[80vh] flex flex-col items-center justify-center text-center p-6">
      <h1 className="text-9xl font-black font-cyber text-primary mb-4 opacity-20">404</h1>
      <h2 className="text-3xl font-bold mb-6 font-cyber">
        {isArabic ? 'انقطع الاتصال • الصفحة غير موجودة' : 'SIGNAL_LOST_IN_VOID'}
      </h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        {isArabic 
          ? 'الإحداثيات المطلوبة لا تتطابق مع أي صفحة معروفة في شبكة نادي DataCamp.' 
          : 'The requested coordinates do not correspond to any known terminal in the network.'}
      </p>
      <Button variant="cyber" onClick={() => window.location.href = '/'}>
        {isArabic ? 'العودة إلى الصفحة الرئيسية' : 'RETURN_TO_HOME_BASE'}
      </Button>
    </div>
  );
};

function AppContent() {
  const { settings, isSuperAdmin, loading } = useAuth();
  const { isArabic } = useLanguage();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  
  if (settings?.maintenanceMode && !isSuperAdmin && !loading && location.pathname !== '/login') {
    return (
      <div className="h-screen w-full bg-dark-navy flex flex-col items-center justify-center text-center p-6 relative overflow-hidden">
        <Starfield />
        <div className="relative z-10 space-y-8">
          <Logo iconSize={64} textSize="text-4xl" />
          <div className="space-y-4">
            <h1 className="text-5xl font-black font-cyber text-destructive tracking-tighter">
              {isArabic ? 'المنصة قيد الصيانة' : 'OFFLINE_FOR_MAINTENANCE'}
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto uppercase tracking-widest text-xs">
              {isArabic 
                ? 'تخضع الشبكة حالياً لتحديثات هامة. تم تعليق الدخول غير الضروري مؤقتاً.' 
                : 'The grid is currently undergoing critical updates. All non-essential access is temporarily suspended.'}
            </p>
          </div>
          <div className="flex items-center justify-center space-x-4 rtl:space-x-reverse">
            <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
            <span className="text-[10px] font-mono text-destructive">
              {isArabic ? 'العودة المقدرة: قريباً' : 'ESTIMATED_RESTORATION: UNKNOWN'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-transparent relative overflow-hidden">
      <Starfield />
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div 
        className="absolute inset-0 flex flex-col min-w-0 h-full overflow-y-auto overflow-x-hidden custom-scrollbar"
        style={{ 
          left: isArabic ? 0 : 'var(--sidebar-width, 0px)',
          right: isArabic ? 'var(--sidebar-width, 0px)' : 0,
          width: 'calc(100% - var(--sidebar-width, 0px))',
          transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1), right 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        {/* Mobile Header */}
        <header className="lg:hidden h-16 glass border-b border-white/10 flex items-center justify-between px-6 sticky top-0 z-40 shrink-0">
          <div className="flex items-center">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 rtl:-mr-2 rtl:ml-0 text-muted-foreground hover:text-primary transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <Logo className="ml-4 rtl:ml-0 rtl:mr-4" iconSize={28} />
          </div>
          <LanguageSwitcher variant="toggle" />
        </header>

        {/* Top Floating Language Switcher for Desktop */}
        <div className="hidden lg:flex fixed top-4 right-6 z-40 rtl:right-auto rtl:left-6 items-center">
          <LanguageSwitcher variant="toggle" />
        </div>

        <main className="flex-grow w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 1.02, filter: "blur(10px)" }}
              transition={{ 
                duration: 0.5, 
                ease: [0.22, 1, 0.36, 1] // Custom cubic-bezier for smooth cinematic feel
              }}
              className="w-full h-full"
            >
              <Routes location={location}>
                <Route path="/" element={<Home />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/courses/:slug" element={<CourseDetail />} />
                <Route path="/courses/:slug/learn" element={
                  <ProtectedRoute>
                    <CourseLearning />
                  </ProtectedRoute>
                } />
                <Route path="/courses/:slug/quiz" element={
                  <ProtectedRoute>
                    <CourseQuiz />
                  </ProtectedRoute>
                } />
                <Route path="/courses/:slug/quiz/:lessonId" element={
                  <ProtectedRoute>
                    <CourseQuiz />
                  </ProtectedRoute>
                } />
                <Route path="/certificates" element={<Certificates />} />
                <Route path="/verify-certificate" element={<Certificates />} />
                <Route path="/verify-certificate/:code" element={<Certificates />} />
                <Route path="/notifications" element={
                  <ProtectedRoute>
                    <Notifications />
                  </ProtectedRoute>
                } />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/compiler" element={<CompilerPlayground />} />
                <Route path="/about" element={<About />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/events" element={<Events />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/staff" element={<Staff />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/login" element={
                  <GuestRoute>
                    <Login />
                  </GuestRoute>
                } />
                <Route path="/register" element={
                  <GuestRoute>
                    <Register />
                  </GuestRoute>
                } />
                <Route path="/forgot-password" element={
                  <GuestRoute>
                    <ForgotPassword />
                  </GuestRoute>
                } />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/admin/*" element={
                  <ManagerRoute>
                    <AdminDashboard />
                  </ManagerRoute>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>
        <Footer />
      </div>
      <AIMentorButton />
      <Toaster position="top-right" theme="dark" richColors />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <AuthProvider>
          <PointsProvider>
            <NotificationsProvider>
              <Router>
                <AppContent />
              </Router>
            </NotificationsProvider>
          </PointsProvider>
        </AuthProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}
