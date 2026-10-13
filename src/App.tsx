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
const Home = React.lazy(() => import('./pages/Home'));
import { Menu } from 'lucide-react';

// Route-level code splitting & lazy loading
const About = React.lazy(() => import('./pages/About'));
const Projects = React.lazy(() => import('./pages/Projects'));
const Blog = React.lazy(() => import('./pages/Blog'));
const Events = React.lazy(() => import('./pages/Events'));
const Staff = React.lazy(() => import('./pages/Staff'));
const Gallery = React.lazy(() => import('./pages/Gallery'));
const Contact = React.lazy(() => import('./pages/Contact'));
const FAQ = React.lazy(() => import('./pages/FAQ'));
const Privacy = React.lazy(() => import('./pages/Privacy'));
const Terms = React.lazy(() => import('./pages/Terms'));
const Courses = React.lazy(() => import('./pages/Courses'));
const MyCourses = React.lazy(() => import('./pages/MyCourses'));
const CourseDetail = React.lazy(() => import('./pages/CourseDetail'));
const CourseLearning = React.lazy(() => import('./pages/CourseLearning'));
const Leaderboard = React.lazy(() => import('./pages/Leaderboard'));
const VerifyMembership = React.lazy(() => import('./pages/VerifyMembership'));
const CompilerPlayground = React.lazy(() => import('./pages/CompilerPlayground'));
const CourseQuiz = React.lazy(() => import('./pages/CourseQuiz'));
const Certificates = React.lazy(() => import('./pages/Certificates'));
const Notifications = React.lazy(() => import('./pages/Notifications'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = React.lazy(() => import('./pages/ResetPassword'));
const VerifyEmail = React.lazy(() => import('./pages/VerifyEmail'));
const AuthCallback = React.lazy(() => import('./pages/AuthCallback'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Profile = React.lazy(() => import('./pages/Profile'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const PublicFormView = React.lazy(() => import('./pages/PublicFormView'));
const ContentPage = React.lazy(() => import('./components/ContentPage'));
const NotFound = React.lazy(() => import('./pages/NotFound'));
import { PointsProvider } from './contexts/PointsContext';
import { NotificationsProvider } from './contexts/NotificationsContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { AIMentorButton } from './components/AIMentor/AIMentorButton';
import { Toaster } from 'sonner';
import { AnimatePresence, motion } from 'motion/react';
import { useLocation } from 'react-router-dom';
import { Button } from './components/ui/Button';

const GuestRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const { isArabic } = useLanguage();
  const location = useLocation();
  const redirectTo = (location.state as { from?: string } | null)?.from || '/dashboard';
  if (loading) return <div className="h-screen flex items-center justify-center font-cyber text-primary animate-pulse">{isArabic ? 'جاري المزامنة...' : 'SYNCHRONIZING...'}</div>;
  if (user) return <Navigate to={redirectTo} replace />;
  return <>{children}</>;
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, profile, loading, refreshProfile, logout } = useAuth();
  const { isArabic } = useLanguage();
  const location = useLocation();

  // Wait for both auth state AND profile to be resolved before making decisions
  if (loading) return <div className="h-screen flex items-center justify-center font-cyber text-primary animate-pulse">{isArabic ? 'جاري تهيئة الجلسة...' : 'ESTABLISHING_SESSION...'}</div>;
  if (!user) {
    sessionStorage.setItem('datacamp_auth_redirect', location.pathname + location.search);
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  // If user exists but profile hasn't loaded yet, show a brief loading state
  if (user && !profile) {
    return <div role="alert" className="p-8 space-y-4 text-center">
      <p>{isArabic ? 'تعذر تحميل ملفك من قاعدة البيانات. حاول مرة أخرى.' : 'Your profile could not be loaded. Please retry.'}</p>
      <Button onClick={() => refreshProfile().catch(() => {})}>{isArabic ? 'إعادة المحاولة' : 'Retry'}</Button>
      <Button variant="outline" onClick={logout}>{isArabic ? 'تسجيل الخروج' : 'Sign out'}</Button>
    </div>;
  }
  if (profile?.status !== 'active') return <div role="alert" className="p-8 text-center space-y-4">
    <p>{isArabic ? 'حسابك غير نشط. تواصل مع إدارة النادي.' : 'Your account is inactive. Contact the club.'}</p>
    <Button onClick={logout}>{isArabic ? 'تسجيل الخروج' : 'Sign out'}</Button>
  </div>;

  return <>{children}</>;
};

const ManagerRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, profile, loading, isManager } = useAuth();
  const { isArabic } = useLanguage();
  const location = useLocation();
  if (loading) return <div className="h-screen flex items-center justify-center font-cyber text-primary animate-pulse">{isArabic ? 'جاري فحص الصلاحيات...' : 'EVALUATING_PERMISSIONS...'}</div>;
  if (!user) {
    sessionStorage.setItem('datacamp_auth_redirect', location.pathname + location.search);
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  // Enforce email verification
  if (!user.email_confirmed_at && !profile?.isVerified) {
    return <Navigate to="/verify-email" />;
  }

  if (!isManager) return <Navigate to="/dashboard" />;
  return <>{children}</>;
};

const RouteLoadingFallback: React.FC = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 space-y-4">
    <div className="relative w-12 h-12 flex items-center justify-center">
      <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
      <div className="w-10 h-10 rounded-full border-2 border-t-primary border-r-primary border-b-transparent border-l-transparent animate-spin" />
    </div>
    <span className="text-[11px] font-cyber tracking-widest text-primary/80 uppercase animate-pulse">
      SYNCING_NEURAL_INTERFACE...
    </span>
  </div>
);

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

  if (location.pathname.startsWith('/f/')) {
    return (
      <div className="min-h-screen w-full bg-dark-navy text-foreground relative overflow-hidden">
        <Starfield />
        <div className="relative z-10">
          <Routes>
            <Route path="/f/:slug" element={<PublicFormView />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <Toaster position="top-right" theme="dark" richColors />
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
              aria-label="Open navigation"
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 rtl:-mr-2 rtl:ml-0 text-muted-foreground hover:text-primary transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <Logo className="ml-4 rtl:ml-0 rtl:mr-4" iconSize={28} />
          </div>
          <LanguageSwitcher variant="toggle" />
        </header>

        {/* Reserve space so language controls cannot cover page actions. */}
        <div className="hidden lg:flex h-16 shrink-0 px-6 justify-end items-center">
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
              <React.Suspense fallback={<RouteLoadingFallback />}>
                <Routes location={location}>
                <Route path="/" element={<Home />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/my-courses" element={
                  <ProtectedRoute>
                    <MyCourses />
                  </ProtectedRoute>
                } />
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
                <Route path="/verify-membership/:token" element={<VerifyMembership />} />
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
                <Route path="/auth/callback" element={<AuthCallback />} />
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
              </React.Suspense>
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
                <React.Suspense fallback={<div role="status" className="p-8 text-center">Loading page…</div>}><AppContent /></React.Suspense>
              </Router>
            </NotificationsProvider>
          </PointsProvider>
        </AuthProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}
