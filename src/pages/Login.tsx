import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeEmail } from '../lib/emailUtils';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const Login = () => {
  const { user, loading: authLoading, loginWithGoogle, loginWithEmail, loginAsRole } = useAuth();
  const { isArabic } = useLanguage();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'email' | 'google'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  React.useEffect(() => {
    if (user && !authLoading) navigate('/dashboard', { replace: true });
  }, [user, authLoading, navigate]);

  const validate = () => {
    const errs: typeof errors = {};
    if (!email.trim()) errs.email = isArabic ? 'البريد الإلكتروني مطلوب.' : 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = isArabic ? 'صيغة البريد الإلكتروني غير صحيحة.' : 'Invalid email format.';
    if (!password) errs.password = isArabic ? 'كلمة المرور مطلوبة.' : 'Password is required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || isLoading) return;
    setIsLoading(true);
    try {
      await loginWithEmail(email, password);
    } catch {
      // error handled inside loginWithEmail
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (isLoading || authLoading) return;
    setIsLoading(true);
    try {
      await new Promise(r => setTimeout(r, 800));
      await loginWithGoogle();
      await new Promise(r => setTimeout(r, 300));
      navigate('/dashboard');
    } catch {
      // handled internally
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading && !isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-primary font-cyber animate-pulse text-sm tracking-widest">
          {isArabic ? 'جاري التحقق من الجلسة...' : 'SYNCHRONIZING...'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-primary/20 bg-dark-navy/60 backdrop-blur-2xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-cyber text-primary tracking-tighter">
              {isArabic ? 'تسجيل الدخول' : 'ESTABLISH_CONNECTION'}
            </CardTitle>
            <CardDescription className="font-mono text-xs">
              {isArabic ? 'سجل دخولك للوصول إلى حسابك في نادي DataCamp' : 'Sign in to access your DataCamp Club account'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5 pt-4">
            {/* Tab Switcher */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-white/5 rounded-lg border border-white/10">
              {(['email', 'google'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-2 text-xs font-cyber tracking-widest uppercase rounded-md transition-all duration-200 ${
                    activeTab === tab
                      ? 'bg-primary text-black font-bold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab === 'email' 
                    ? (isArabic ? 'البريد / كلمة المرور' : 'EMAIL / PASS') 
                    : (isArabic ? 'جوجل' : 'GOOGLE')
                  }
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'email' ? (
                <motion.form
                  key="email-form"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleEmailLogin}
                  className="space-y-4"
                >
                  {/* Email Field */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-cyber text-muted-foreground uppercase tracking-widest flex items-center justify-between">
                      <span>{isArabic ? 'البريد الإلكتروني' : 'Email Address'}</span>
                      <span className="text-[9px] font-mono text-primary/70">
                        {isArabic ? 'جامعي أو شخصي' : 'UNIVERSITY OR PERSONAL'}
                      </span>
                    </label>
                    <div className="relative">
                      <Mail className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${isArabic ? 'right-3' : 'left-3'}`} />
                      <Input
                        type="email"
                        value={email}
                        onChange={e => { setEmail(e.target.value); setErrors(p => ({...p, email: undefined})); }}
                        placeholder={isArabic ? 'student@eng.asu.edu.eg أو personal@gmail.com' : 'student@eng.asu.edu.eg or personal@gmail.com'}
                        className={`${isArabic ? 'pr-10 pl-3' : 'pl-10 pr-3'} ${errors.email ? 'border-destructive' : ''}`}
                        autoComplete="email"
                      />
                    </div>
                    {errors.email && <p className="text-destructive text-[10px] font-mono">{errors.email}</p>}

                    {email.includes('@') && email.includes('.') && (
                      <div className="pt-1">
                        {analyzeEmail(email).isUniversity ? (
                          <div className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-1 rounded-md flex items-center gap-1.5 animate-fadeIn">
                            <span>🏛️</span>
                            <span><strong>{isArabic ? 'هوية جامعية معتمدة:' : 'Academic Identity:'}</strong> {analyzeEmail(email).institutionName || 'University Domain'}</span>
                          </div>
                        ) : (
                          <div className="text-[10px] font-mono text-muted-foreground bg-white/5 border border-white/10 px-2.5 py-1 rounded-md flex items-center gap-1.5">
                            <span>👤</span>
                            <span><strong>{isArabic ? 'هوية شخصية:' : 'Personal Identity:'}</strong> {analyzeEmail(email).providerLabel}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-cyber text-muted-foreground uppercase tracking-widest">
                      {isArabic ? 'كلمة المرور' : 'Password'}
                    </label>
                    <div className="relative">
                      <Lock className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${isArabic ? 'right-3' : 'left-3'}`} />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => { setPassword(e.target.value); setErrors(p => ({...p, password: undefined})); }}
                        placeholder="••••••••••••"
                        className={`${isArabic ? 'pr-10 pl-10' : 'pl-10 pr-10'} ${errors.password ? 'border-destructive' : ''}`}
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(v => !v)}
                        className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors ${isArabic ? 'left-3' : 'right-3'}`}
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-destructive text-[10px] font-mono">{errors.password}</p>}
                  </div>

                  <div className="flex justify-end">
                    <Link
                      to="/forgot-password"
                      className="text-[10px] text-primary font-mono hover:underline"
                    >
                      {isArabic ? 'نسيت كلمة المرور؟' : 'FORGOT_PASSWORD?'}
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    variant="cyber"
                    className="w-full h-12 font-cyber tracking-wider"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /><span>{isArabic ? 'جاري التحقق...' : 'AUTHENTICATING...'}</span></>
                    ) : (isArabic ? 'دخول إلى المنصة' : 'CONNECT_TO_NETWORK')}
                  </Button>
                </motion.form>
              ) : (
                <motion.div
                  key="google-form"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <Button
                    variant="outline"
                    className="w-full border-primary/30 hover:bg-primary/10 h-14 gap-3 text-sm font-cyber tracking-wider"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <><div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /><span>{isArabic ? 'جاري الاتصال بـ Google...' : 'CONNECTING TO GOOGLE...'}</span></>
                    ) : (
                      <><GoogleIcon /><span>{isArabic ? 'المتابعة بحساب Google' : 'CONTINUE_WITH_GOOGLE'}</span></>
                    )}
                  </Button>

                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-2"
                    >
                      <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-400">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                        <span>{isArabic ? 'جاري إنشاء اتصال OAuth 2.0 آمن...' : 'Establishing secure OAuth 2.0 connection...'}</span>
                      </div>
                      <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full"
                          initial={{ width: '0%' }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 1.1, ease: 'easeInOut' }}
                        />
                      </div>
                    </motion.div>
                  )}

                  <div className="bg-white/5 border border-white/10 rounded-lg p-3 space-y-2">
                    <p className="text-[10px] text-muted-foreground font-mono leading-relaxed">
                      {isArabic
                        ? '🔒 يتم إنشاء حسابك تلقائياً عند أول تسجيل دخول. نستخدم بروتوكول المصادقة الآمن من Google.'
                        : '🔒 Your account will be created automatically on first sign-in. We use Google\'s secure authentication protocol.'
                      }
                    </p>
                    <div className="flex items-center gap-3 text-[9px] text-muted-foreground/70 font-mono">
                      <span className="flex items-center gap-1"><span className="text-emerald-400">✓</span> {isArabic ? 'تشفير SSL' : 'SSL Encrypted'}</span>
                      <span className="flex items-center gap-1"><span className="text-emerald-400">✓</span> {isArabic ? 'بدون حفظ كلمات المرور' : 'No Password Stored'}</span>
                      <span className="flex items-center gap-1"><span className="text-emerald-400">✓</span> OAuth 2.0</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quick Role Tester Bar */}
            <div className="pt-4 border-t border-white/10 space-y-2.5">
              <div className="text-[10px] font-cyber tracking-widest text-muted-foreground uppercase flex items-center justify-between">
                <span>{isArabic ? 'تجربة سريعة للأدوار' : 'QUICK ROLE DEMO ACCESS'}</span>
                <span className="text-primary font-mono text-[9px]">{isArabic ? 'بدون بيانات سرية' : 'NO CREDENTIALS NEEDED'}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    await loginAsRole('super_admin');
                    navigate('/dashboard');
                  }}
                  className="h-12 text-[11px] font-cyber border-amber-500/40 text-amber-300 hover:bg-amber-500/15 flex flex-col items-center justify-center p-1.5 transition-all shadow-sm shadow-amber-500/10"
                >
                  <span className="font-bold flex items-center gap-1">👑 {isArabic ? 'سوبر أدمن' : 'SUPER ADMIN'}</span>
                  <span className="text-[9px] text-muted-foreground font-mono">{isArabic ? 'صلاحيات كاملة للمنصة' : 'Root Access & Admin'}</span>
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    await loginAsRole('member');
                    navigate('/dashboard');
                  }}
                  className="h-12 text-[11px] font-cyber border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/15 flex flex-col items-center justify-center p-1.5 transition-all shadow-sm shadow-emerald-500/10"
                >
                  <span className="font-bold flex items-center gap-1">👥 {isArabic ? 'عضو النادي' : 'MEMBER'}</span>
                  <span className="text-[9px] text-muted-foreground font-mono">{isArabic ? 'حساب الطالب والفعاليات' : 'Student & Events'}</span>
                </Button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="justify-center pt-2">
            <p className="text-xs text-muted-foreground tracking-widest font-mono">
              {isArabic ? 'عضو جديد؟ ' : 'NEW_MEMBER? '}
              <Link to="/register" className="text-primary font-bold hover:underline">
                {isArabic ? 'إنشاء حساب جديد' : 'INITIALIZE_MEMBERSHIP'}
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
