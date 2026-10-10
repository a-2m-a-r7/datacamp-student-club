import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { toast } from 'sonner';
import { Mail, RefreshCw, LogOut, ExternalLink } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { analyzeEmail } from '../lib/emailUtils';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const VerifyEmail = () => {
  const { user, profile, logout } = useAuth();
  const { isArabic } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
    } else if (user.email_confirmed_at || profile?.isVerified) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, profile, navigate]);

  const emailInfo = user?.email ? analyzeEmail(user.email) : null;

  const handleResend = async () => {
    if (!user?.email || !isSupabaseConfigured) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) throw error;
      toast.success(isArabic ? 'تم إرسال رابط التفعيل. تحقق من بريدك الإلكتروني.' : 'Verification email sent. Check your inbox.');
    } catch (error: any) {
      toast.error(error.message || (isArabic ? 'فشل إرسال رابط التفعيل.' : 'Failed to send verification email.'));
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    setChecking(true);
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      if (data.user?.email_confirmed_at) {
        toast.success(isArabic ? 'تم تأكيد البريد بنجاح.' : 'Email verified.');
        navigate('/dashboard', { replace: true });
      } else {
        toast.info(isArabic ? 'لم يتم تأكيد البريد بعد. يرجى مراجعة صندوق الوارد.' : 'Email not verified yet. Please check your inbox.');
      }
    } catch (error: any) {
      toast.error(error.message || (isArabic ? 'فشل التحقق من حالة البريد.' : 'Failed to check verification status.'));
    } finally {
      setChecking(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-dark-navy">
      <Card className="w-full max-w-md border-primary/20 bg-dark-navy/80 backdrop-blur-xl">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mb-2">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-cyber text-primary">
            {isArabic ? 'تأكيد البريد الإلكتروني' : 'VERIFY_IDENTITY'}
          </CardTitle>
          <CardDescription className="text-xs font-mono">
            {isArabic 
              ? <>تم إرسال رابط التفعيل إلى: <span className="text-white font-bold">{user?.email}</span>.</>
              : <>Verification link dispatched to <span className="text-white font-bold">{user?.email}</span>.</>
            }
            {emailInfo?.isUniversity && (
              <span className="block mt-2 p-2 rounded bg-primary/10 border border-primary/30 text-primary text-[11px]">
                {isArabic ? 'تم التعرف على حساب أكاديمي' : 'Academic Account Detected'} ({emailInfo.institutionName || 'University Domain'})
              </span>
            )}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2 pt-1">
            <p className="text-[10px] font-cyber text-muted-foreground uppercase tracking-widest text-center">
              {isArabic ? 'الوصول السريع إلى صندوق البريد' : 'QUICK_ACCESS_TO_INBOX'}
            </p>

            {emailInfo?.isUniversity ? (
              <a href={emailInfo.webmailUrl} target="_blank" rel="noopener noreferrer" className="w-full block">
                <Button variant="cyber" className="w-full gap-2 font-cyber text-xs h-11 tracking-wider">
                  <ExternalLink className="w-4 h-4" />
                  {isArabic ? 'فتح بريد أوفيس 365 الجامعي' : 'OPEN OUTLOOK / OFFICE 365'}
                </Button>
              </a>
            ) : emailInfo?.provider === 'gmail' ? (
              <a href="https://mail.google.com/" target="_blank" rel="noopener noreferrer" className="w-full block">
                <Button variant="cyber" className="w-full gap-2 font-cyber text-xs h-11 tracking-wider">
                  <ExternalLink className="w-4 h-4" />
                  {isArabic ? 'فتح بريد GOOGLE GMAIL' : 'OPEN GOOGLE GMAIL'}
                </Button>
              </a>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <a href="https://mail.google.com/" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full text-xs font-mono border-white/10 hover:border-primary/40 gap-1.5 h-10">
                    <ExternalLink className="w-3.5 h-3.5" /> Gmail
                  </Button>
                </a>
                <a href="https://outlook.office.com/mail/" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full text-xs font-mono border-white/10 hover:border-primary/40 gap-1.5 h-10">
                    <ExternalLink className="w-3.5 h-3.5" /> Outlook
                  </Button>
                </a>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-white/10 space-y-2.5">
            <Button variant="outline" className="w-full border-primary/40 text-primary h-11 text-xs font-cyber tracking-wider" onClick={handleCheckStatus} disabled={checking}>
              {checking ? <RefreshCw className={`w-4 h-4 ${isArabic ? 'ml-2' : 'mr-2'} animate-spin`} /> : null}
              {isArabic ? 'فحص حالة التفعيل الآن' : 'CHECK_VERIFICATION_STATUS'}
            </Button>
            
            <Button variant="ghost" className="w-full text-xs font-mono text-muted-foreground" onClick={handleResend} disabled={loading}>
              {loading ? <RefreshCw className={`w-4 h-4 ${isArabic ? 'ml-2' : 'mr-2'} animate-spin`} /> : null}
              {isArabic ? 'إعادة إرسال رابط التفعيل' : 'RESEND_VERIFICATION_LINK'}
            </Button>
          </div>
        </CardContent>

        <CardFooter className="justify-center border-t border-white/5 pt-4">
          <button onClick={handleLogout} className="text-xs font-mono text-muted-foreground hover:text-destructive flex items-center gap-1.5">
            <LogOut className="w-3.5 h-3.5" />
            <span>{isArabic ? 'تسجيل الخروج' : 'DISCONNECT_SESSION'}</span>
          </button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default VerifyEmail;
