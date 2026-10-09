import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Eye, EyeOff, Mail, Lock, User as UserIcon, CheckCircle2, ExternalLink } from 'lucide-react';
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

const Register = () => {
  const { user, loading: authLoading, loginWithGoogle, registerWithEmail } = useAuth();
  const { isArabic } = useLanguage();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'email' | 'google'>('email');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const [unauthorizedDomain, setUnauthorizedDomain] = useState<string | null>(null);

  React.useEffect(() => {
    if (user && !authLoading) navigate('/dashboard', { replace: true });
  }, [user, authLoading, navigate]);

  const validate = () => {
    const errs: typeof errors = {};
    if (!fullName.trim()) errs.fullName = isArabic ? 'الاسم بالكامل مطلوب.' : 'Full name is required.';
    else if (fullName.trim().length < 3) errs.fullName = isArabic ? 'الاسم يجب أن لا يقل عن 3 أحرف.' : 'Name must be at least 3 characters.';

    if (!email.trim()) errs.email = isArabic ? 'البريد الإلكتروني مطلوب.' : 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = isArabic ? 'صيغة البريد الإلكتروني غير صحيحة.' : 'Invalid email format.';

    if (!password) errs.password = isArabic ? 'كلمة المرور مطلوبة.' : 'Password is required.';
    else if (password.length < 6) errs.password = isArabic ? 'كلمة المرور يجب ألا تقل عن 6 أحرف.' : 'Password must be at least 6 characters.';

    if (password !== confirmPassword) {
      errs.confirmPassword = isArabic ? 'كلمتا المرور غير متطابقتين.' : 'Passwords do not match.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || isLoading) return;
    setIsLoading(true);
    try {
      const res = await registerWithEmail(email, password, fullName);
      if (res.needsVerification) {
        setRegisteredSuccess(true);
      }
    } catch {
      // toast shown inside registerWithEmail
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    if (isLoading || authLoading) return;
    setIsLoading(true);
    setUnauthorizedDomain(null);
    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err: any) {
      if (err?.code === 'auth/unauthorized-domain' || err?.message?.includes('unauthorized-domain')) {
        setUnauthorizedDomain(window.location.hostname);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading && !isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-primary font-cyber animate-pulse text-sm tracking-widest">
          {isArabic ? 'جاري المزامنة...' : 'SYNCHRONIZING...'}
        </div>
      </div>
    );
  }

  if (registeredSuccess) {
    const emailInfo = analyzeEmail(email);

    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-6">
        <Card className="w-full max-w-md border-primary/30 bg-dark-navy/70 backdrop-blur-2xl text-center p-6 space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto text-primary">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <CardTitle className="text-2xl font-cyber text-primary tracking-tight">
            {isArabic ? 'تم إنشاء الحساب بنجاح' : 'INITIALIZATION_COMPLETE'}
          </CardTitle>
          <p className="text-muted-foreground font-mono text-xs leading-relaxed">
            {isArabic ? (
              <>تم إرسال رابط تأكيد وتفعيل الحساب إلى البريد: <span className="text-foreground font-bold">{email}</span>. يرجى تأكيد بريدك للتمتع بكافة الصلاحيات.</>
            ) : (
              <>A verification link was dispatched to <span className="text-foreground font-bold">{email}</span>. Please verify your email address to activate your clearance.</>
            )}
          </p>

          {emailInfo.isUniversity && (
            <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono text-left">
              🏛️ <strong>{isArabic ? 'حساب طالب جامعي معتمد:' : 'Academic Student Account:'}</strong> {emailInfo.institutionName || 'University Domain'}
            </div>
          )}

          <div className="space-y-2.5 pt-2">
            <a
              href={emailInfo.webmailUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full block"
            >
              <Button variant="cyber" className="w-full font-cyber tracking-wider text-xs h-11 gap-2 shadow-[0_0_20px_rgba(0,255,204,0.3)]">
                <ExternalLink className="w-4 h-4" />
                {emailInfo.isUniversity
                  ? (isArabic ? 'فتح بريد أوفيس 365 الجامعي' : 'OPEN OUTLOOK / OFFICE 365 (UNIVERSITY MAIL)')
                  : emailInfo.provider === 'gmail'
                  ? (isArabic ? 'فتح بريد GOOGLE GMAIL' : 'OPEN GOOGLE GMAIL')
                  : (isArabic ? 'فتح صندوق البريد' : 'OPEN INBOX')
                }
              </Button>
            </a>

            <Button variant="outline" className="w-full font-cyber text-xs border-white/20" onClick={() => navigate('/login')}>
              {isArabic ? 'الانتقال لتسجيل الدخول' : 'PROCEED_TO_LOGIN'}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 gap-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-primary/20 bg-dark-navy/60 backdrop-blur-2xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-cyber text-primary tracking-tighter">
              {isArabic ? 'إنشاء حساب عضوية' : 'INITIALIZE_MEMBERSHIP'}
            </CardTitle>
            <CardDescription className="font-mono text-xs">
              {isArabic ? 'انضم لنادي DataCamp واحصل على +10 نقاط XP ترحيبية' : 'Join DataCamp Student Club & claim +10 Starter XP'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5 pt-4">
            {/* Tab Switcher */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-white/5 rounded-lg border border-white/10">
              {(['email', 'google'] as const).map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`py-2 text-xs font-cyber tracking-widest uppercase rounded-md transition-all duration-200 ${
                    activeTab === tab
                      ? 'bg-primary text-black font-bold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab === 'email' 
                    ? (isArabic ? 'التسجيل بالبريد' : 'EMAIL REGISTRATION') 
                    : (isArabic ? 'حساب GOOGLE' : 'GOOGLE OAUTH')
                  }
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'email' ? (
                <motion.form
                  key="reg-email"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleEmailRegister}
                  className="space-y-3.5"
                >
                  {/* Full Name */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-cyber text-muted-foreground uppercase tracking-widest">
                      {isArabic ? 'الاسم بالكامل' : 'Full Name'}
                    </label>
                    <div className="relative">
                      <UserIcon className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${isArabic ? 'right-3' : 'left-3'}`} />
                      <Input
                        type="text"
                        value={fullName}
                        onChange={e => { setFullName(e.target.value); setErrors(p => ({...p, fullName: undefined})); }}
                        placeholder={isArabic ? 'أحمد منصور' : 'Ahmed Mansour'}
                        className={`${isArabic ? 'pr-10 pl-3' : 'pl-10 pr-3'} ${errors.fullName ? 'border-destructive' : ''}`}
                      />
                    </div>
                    {errors.fullName && <p className="text-destructive text-[10px] font-mono">{errors.fullName}</p>}
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-cyber text-muted-foreground uppercase tracking-widest flex items-center justify-between">
                      <span>{isArabic ? 'البريد الإلكتروني' : 'Email Address'}</span>
                      <span className="text-[9px] font-mono text-primary/70">
                        {isArabic ? 'جامعي أو شخصي' : 'UNIVERSITY (.EDU) OR PERSONAL'}
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

                  {/* Password */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-cyber text-muted-foreground uppercase tracking-widest">
                      {isArabic ? 'كلمة المرور (6 أحرف على الأقل)' : 'Password (min 6 characters)'}
                    </label>
                    <div className="relative">
                      <Lock className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${isArabic ? 'right-3' : 'left-3'}`} />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => { setPassword(e.target.value); setErrors(p => ({...p, password: undefined})); }}
                        placeholder="••••••••••••"
                        className={`${isArabic ? 'pr-10 pl-10' : 'pl-10 pr-10'} ${errors.password ? 'border-destructive' : ''}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(v => !v)}
                        className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground ${isArabic ? 'left-3' : 'right-3'}`}
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-destructive text-[10px] font-mono">{errors.password}</p>}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-cyber text-muted-foreground uppercase tracking-widest">
                      {isArabic ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                    </label>
                    <div className="relative">
                      <Lock className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${isArabic ? 'right-3' : 'left-3'}`} />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={e => { setConfirmPassword(e.target.value); setErrors(p => ({...p, confirmPassword: undefined})); }}
                        placeholder="••••••••••••"
                        className={`${isArabic ? 'pr-10 pl-10' : 'pl-10 pr-10'} ${errors.confirmPassword ? 'border-destructive' : ''}`}
                      />
                    </div>
                    {errors.confirmPassword && <p className="text-destructive text-[10px] font-mono">{errors.confirmPassword}</p>}
                  </div>

                  <Button
                    type="submit"
                    variant="cyber"
                    className="w-full h-12 font-cyber tracking-wider mt-2"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin mr-2" /><span>{isArabic ? 'جاري التسجيل...' : 'INITIALIZING...'}</span></>
                    ) : (isArabic ? 'تسجيل العضوية بالمنصة' : 'ENROLL_INTO_NETWORK')}
                  </Button>
                </motion.form>
              ) : (
                <motion.div
                  key="reg-google"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <Button
                    variant="outline"
                    className="w-full border-primary/30 hover:bg-primary/10 h-14 gap-3 text-sm font-cyber tracking-wider"
                    onClick={handleGoogleSignUp}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <><div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /><span>{isArabic ? 'جاري الاتصال...' : 'CONNECTING...'}</span></>
                    ) : (
                      <><GoogleIcon /><span>{isArabic ? 'الانضمام بحساب Google' : 'JOIN_WITH_GOOGLE'}</span></>
                    )}
                  </Button>
                  {unauthorizedDomain && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 space-y-2 text-amber-200 text-xs"
                    >
                      <div className="flex items-center gap-2 font-bold text-amber-300">
                        <span>⚠️</span>
                        <span>{isArabic ? 'إعداد إضافي لنطاق Vercel في Firebase' : 'Firebase Authorized Domain Setup Required'}</span>
                      </div>
                      <p className="text-[11px] font-mono leading-relaxed text-amber-100/90">
                        {isArabic 
                          ? `نطاق هذا الموقع (${unauthorizedDomain}) يحتاج للإضافة في قائمة النطاقات المصرح بها في Firebase Console لتشغيل زر Google.`
                          : `Domain (${unauthorizedDomain}) must be added to Firebase Authorized Domains.`
                        }
                      </p>
                      <div className="pt-1 flex flex-col gap-2">
                        <a 
                          href="https://console.firebase.google.com/project/datacampclub/authentication/settings" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-full text-center py-2 px-3 rounded bg-amber-500 hover:bg-amber-400 text-black font-bold text-[11px] transition shadow-md"
                        >
                          {isArabic ? '🔗 فتح إعدادات Firebase لإضافة النطاق' : '🔗 Open Firebase Console Auth Settings'}
                        </a>
                        <button
                          type="button"
                          onClick={() => setActiveTab('email')}
                          className="text-[10px] text-primary hover:underline font-mono text-center pt-1"
                        >
                          {isArabic ? '← أو سجل باستخدام البريد وكلمة المرور للربط المباشر بقاعدة البيانات فوراً' : '← Or use Email/Password for instant database enrollment'}
                        </button>
                      </div>
                    </motion.div>
                  )}

                  <p className="text-center text-[10px] text-muted-foreground font-mono leading-relaxed px-2">
                    {isArabic 
                      ? '🔒 يتم حفظ بيانات حسابك مباشرة في قاعدة بيانات Firestore السحابية فور تسجيل الدخول.' 
                      : '🔒 Your account is saved directly to cloud Firestore database upon enrollment.'
                    }
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>

          <CardFooter className="justify-center pt-0">
            <p className="text-xs text-muted-foreground tracking-widest font-mono">
              {isArabic ? 'لديك حساب بالفعل؟ ' : 'ALREADY_IDENTIFIED? '}
              <Link to="/login" className="text-primary font-bold hover:underline">
                {isArabic ? 'تسجيل الدخول' : 'ACCESS_PORTAL'}
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default Register;
