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
import { GoogleAccountModal } from '../components/GoogleAccountModal';
import { toast } from 'sonner';
import { validatePasswordStrength } from '../lib/utils';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const Register = () => {
  const { user, loading: authLoading, registerWithEmail } = useAuth();
  const { isArabic } = useLanguage();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  React.useEffect(() => {
    if (user && !authLoading) navigate('/dashboard', { replace: true });
  }, [user, authLoading, navigate]);

  const validate = () => {
    const errs: typeof errors = {};
    if (!fullName.trim()) errs.fullName = isArabic ? 'الاسم بالكامل مطلوب.' : 'Full name is required.';
    else if (fullName.trim().length < 3) errs.fullName = isArabic ? 'الاسم يجب أن لا يقل عن 3 أحرف.' : 'Name must be at least 3 characters.';

    if (!email.trim()) errs.email = isArabic ? 'البريد الإلكتروني مطلوب.' : 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = isArabic ? 'صيغة البريد الإلكتروني غير صحيحة.' : 'Invalid email format.';

    if (!password) {
      errs.password = isArabic ? 'كلمة المرور مطلوبة.' : 'Password is required.';
    } else {
      const strength = validatePasswordStrength(password);
      if (!strength.isValid) errs.password = isArabic ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل وتحتوي على حرف كبير وصغير ورقم ورمز.' : strength.message;
    }

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
      const result = await registerWithEmail(email, password, fullName);
      toast.success(isArabic ? 'مرحباً بك! تم إنشاء حسابك وحفظه في السحابة بنجاح' : 'Welcome! Account created successfully');
      navigate(result.needsVerification ? '/verify-email' : '/dashboard');
    } catch {
      // toast shown inside registerWithEmail
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    setShowGoogleModal(true);
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

          <CardContent className="space-y-4 pt-4">
            {/* Google Sign Up - Always Visible */}
            <Button
              type="button"
              variant="outline"
              className="w-full border-primary/40 hover:bg-primary/10 h-12 gap-3 text-xs sm:text-sm font-cyber tracking-wider hover:scale-[1.01] transition-all shadow-sm"
              onClick={handleGoogleSignUp}
              disabled={isLoading}
            >
              {isLoading ? (
                <><div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /><span>{isArabic ? 'جاري الاتصال بـ Google...' : 'CONNECTING TO GOOGLE...'}</span></>
              ) : (
                <><GoogleIcon /><span>{isArabic ? 'التسجيل السريع بحساب Google' : 'SIGN UP WITH GOOGLE'}</span></>
              )}
            </Button>

            {/* Stylish Divider */}
            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-mono tracking-widest">
                <span className="bg-[#0b101b] px-3 text-muted-foreground/80">
                  {isArabic ? 'أو بإنشاء حساب جديد بالبريد الإلكتروني' : 'OR CREATE ACCOUNT WITH EMAIL'}
                </span>
              </div>
            </div>

            {/* Registration Form - Always Visible */}
            <form onSubmit={handleEmailRegister} className="space-y-3.5">
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
                  {isArabic ? 'كلمة المرور القوية' : 'Strong Password'}
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
            </form>
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

      <GoogleAccountModal
        isOpen={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        onSuccess={() => navigate('/dashboard')}
      />
    </div>
  );
};

export default Register;
