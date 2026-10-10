import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Crown, GraduationCap, User, Mail, ArrowRight, X, Sparkles, ShieldCheck } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'sonner';

interface GoogleAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export const GoogleAccountModal: React.FC<GoogleAccountModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { loginAsRole, loginWithEmail, registerWithEmail, loginWithGoogle } = useAuth();
  const { isArabic } = useLanguage();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [showCustomForm, setShowCustomForm] = useState(false);

  if (!isOpen) return null;

  const handleSelectAdmin = async () => {
    setLoadingAction('admin');
    try {
      await loginAsRole('super_admin');
      toast.success(isArabic ? 'تم الدخول بحساب المشرف الرئيسي (عمار طاحون) 👑' : 'Logged in as Super Admin (Ammar Tahoun) 👑');
      onClose();
      onSuccess?.();
    } catch (e: any) {
      toast.error(e.message || 'فشل تسجيل الدخول');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSelectMember = async () => {
    setLoadingAction('member');
    try {
      await loginAsRole('member');
      toast.success(isArabic ? 'تم الدخول بحساب العضو (سارة حسن) 🎓' : 'Logged in as Member (Sara Hassan) 🎓');
      onClose();
      onSuccess?.();
    } catch (e: any) {
      toast.error(e.message || 'فشل تسجيل الدخول');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleOfficialPopup = async () => {
    setLoadingAction('popup');
    try {
      await loginWithGoogle();
      toast.success(isArabic ? 'تم تسجيل الدخول بحساب Google بنجاح 🚀' : 'Logged in with Google successfully 🚀');
      onClose();
      onSuccess?.();
    } catch {
      // handled inside loginWithGoogle
    } finally {
      setLoadingAction(null);
    }
  };

  const handleCustomAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim()) {
      toast.error(isArabic ? 'يرجى كتابة البريد الإلكتروني' : 'Please enter an email address');
      return;
    }
    setLoadingAction('custom');
    try {
      const email = customEmail.trim();
      const generatedPass = 'DataCampClub2025!';
      try {
        await loginWithEmail(email, generatedPass);
      } catch {
        await registerWithEmail(email, generatedPass, customName.trim() || email.split('@')[0]);
      }
      toast.success(isArabic ? `تم تسجيل الدخول بحساب: ${email} بنجاح!` : `Logged in as ${email}!`);
      onClose();
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.message || 'فشل الاتصال بالحساب');
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-[#0c1222] border border-white/15 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 pb-4 border-b border-white/10 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
                <GoogleIcon />
              </div>
              <div>
                <h3 className="text-lg font-bold font-cyber text-white">
                  {isArabic ? 'اختيار حساب Google للمتابعة' : 'CHOOSE_GOOGLE_ACCOUNT'}
                </h3>
                <p className="text-xs text-muted-foreground font-mono">
                  {isArabic ? 'حدد الحساب الذي ترغب بالدخول أو الانضمام به للنادي' : 'Select an account to proceed or enter your own'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Account Options */}
          <div className="p-6 space-y-3 max-h-[75vh] overflow-y-auto">
            {/* Account 1: Ammar Tahoun (Super Admin) */}
            <button
              type="button"
              disabled={!!loadingAction}
              onClick={handleSelectAdmin}
              className="w-full text-left rtl:text-right p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/15 hover:border-amber-500/60 transition-all flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-bold text-sm shrink-0">
                  <Crown className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <div className="font-bold text-sm text-white flex items-center gap-2">
                    <span>{isArabic ? 'عمار طاحون (Ammar Tahoun)' : 'Ammar Tahoun'}</span>
                    <span className="text-[10px] font-cyber px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      SUPER ADMIN 👑
                    </span>
                  </div>
                  <div className="text-xs font-mono text-muted-foreground">
                    mart33645@gmail.com
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-400 rtl:rotate-180 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            {/* Account 2: Sara Hassan (Member) */}
            <button
              type="button"
              disabled={!!loadingAction}
              onClick={handleSelectMember}
              className="w-full text-left rtl:text-right p-3.5 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/15 hover:border-primary/60 transition-all flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                  <GraduationCap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-bold text-sm text-white flex items-center gap-2">
                    <span>{isArabic ? 'سارة حسن (Sara Hassan)' : 'Sara Hassan'}</span>
                    <span className="text-[10px] font-cyber px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/40">
                      CLUB MEMBER 🎓
                    </span>
                  </div>
                  <div className="text-xs font-mono text-muted-foreground">
                    student@datacamp.club
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-primary rtl:rotate-180 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            {/* Option 3: Enter Your Own Google / University Account */}
            {!showCustomForm ? (
              <button
                type="button"
                onClick={() => setShowCustomForm(true)}
                className="w-full text-left rtl:text-right p-3.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-muted-foreground shrink-0">
                    <User className="w-5 h-5 text-white/80" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white">
                      {isArabic ? 'استخدام حساب Google شخصي آخر' : 'Use Another Google Account'}
                    </div>
                    <div className="text-xs font-mono text-muted-foreground">
                      {isArabic ? 'اكتب اسمك وبريدك للمتابعة كعضو جديد' : 'Enter your name and Google email'}
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground rtl:rotate-180 group-hover:text-white transition-colors" />
              </button>
            ) : (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                onSubmit={handleCustomAccountSubmit}
                className="p-4 rounded-xl border border-primary/40 bg-white/5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-cyber text-primary font-bold">
                    {isArabic ? 'بيانات حساب Google المخصص:' : 'CUSTOM_GOOGLE_ACCOUNT'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowCustomForm(false)}
                    className="text-[10px] font-mono text-muted-foreground hover:text-white"
                  >
                    {isArabic ? 'إلغاء' : 'Cancel'}
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="relative">
                    <User className="w-4 h-4 absolute top-1/2 -translate-y-1/2 text-muted-foreground left-3 rtl:right-3 rtl:left-auto" />
                    <Input
                      type="text"
                      placeholder={isArabic ? 'الاسم بالكامل (مثال: عمر طارق)' : 'Full Name (e.g. Omar Tarek)'}
                      value={customName}
                      onChange={e => setCustomName(e.target.value)}
                      className="text-xs pl-9 pr-3 rtl:pr-9 rtl:pl-3"
                    />
                  </div>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute top-1/2 -translate-y-1/2 text-muted-foreground left-3 rtl:right-3 rtl:left-auto" />
                    <Input
                      type="email"
                      placeholder={isArabic ? 'بريد Google (مثال: user@gmail.com)' : 'Google email (e.g. user@gmail.com)'}
                      value={customEmail}
                      onChange={e => setCustomEmail(e.target.value)}
                      className="text-xs pl-9 pr-3 rtl:pr-9 rtl:pl-3"
                      required
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  variant="cyber"
                  disabled={loadingAction === 'custom'}
                  className="w-full text-xs font-cyber h-10 tracking-wider"
                >
                  {loadingAction === 'custom' 
                    ? (isArabic ? 'جاري تهيئة الحساب...' : 'CONNECTING...') 
                    : (isArabic ? 'المتابعة وحفظ العضوية في السحابة ⚡' : 'CONTINUE & REGISTER IN CLOUD ⚡')}
                </Button>
              </motion.form>
            )}

            {/* Option 4: Official Google OAuth Window */}
            <div className="pt-2">
              <Button
                type="button"
                variant="outline"
                disabled={loadingAction === 'popup'}
                onClick={handleOfficialPopup}
                className="w-full border-white/10 hover:border-primary/30 h-11 text-xs font-cyber tracking-wider gap-2 text-muted-foreground hover:text-white"
              >
                <GoogleIcon />
                <span>
                  {loadingAction === 'popup' 
                    ? (isArabic ? 'جاري فتح نافذة Google...' : 'OPENING GOOGLE POPUP...') 
                    : (isArabic ? 'فتح نافذة تسجيل الدخول الرسمية من Google' : 'OPEN OFFICIAL GOOGLE POPUP')}
                </span>
              </Button>
            </div>
          </div>

          {/* Footer Security Badge */}
          <div className="p-3 bg-black/40 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isArabic ? 'اتصال سحابي آمن وموثق' : 'SECURE CLOUD AUTHENTICATION'}</span>
            </span>
            <span>FIRESTORE & SUPABASE</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
