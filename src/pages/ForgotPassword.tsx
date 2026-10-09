import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth, isFirebaseReady } from '../lib/firebase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { toast } from 'sonner';
import { Mail, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const ForgotPassword = () => {
  const { isArabic } = useLanguage();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isFirebaseReady) {
        await sendPasswordResetEmail(auth, email);
      }
      
      setSubmitted(true);
      toast.success(isArabic ? 'تم إرسال رابط استعادة كلمة المرور بنجاح.' : 'Recovery link transmission successful.');
    } catch {
      toast.error(isArabic ? 'إذا كان هذا البريد مسجلاً، فسيتم إرسال رابط الاستعادة إليه.' : 'If this account is registered, a recovery link will be sent.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-6 py-12">
        <Card className="w-full max-w-md border-primary/20 text-center space-y-6">
          <CardHeader>
            <ShieldCheck className="w-12 h-12 text-primary mx-auto mb-4" />
            <CardTitle className="text-3xl font-cyber">
              {isArabic ? 'تم إرسال الرابط' : 'TRANSMISSION_SENT'}
            </CardTitle>
            <CardDescription>
              {isArabic ? 'يرجى مراجعة صندوق الوارد الخاص ببريدك الإلكتروني.' : 'Check your associated communication terminal for internal recovery protocols.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {isArabic ? (
                <>إذا كان هناك حساب مرتبط بالبريد <span className="text-primary">{email}</span>، ستصلك رسالة تحتوي على رابط إعادة تعيين كلمة المرور.</>
              ) : (
                <>If an account is associated with <span className="text-primary">{email}</span>, you will receive a localized access key shortly.</>
              )}
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="cyber" className="w-full" onClick={() => navigate('/login')}>
              {isArabic ? 'العودة لتسجيل الدخول' : 'RETURN_TO_PORTAL'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-12">
      <Card className="w-full max-w-md border-primary/20">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-cyber">
            {isArabic ? 'استعادة كلمة المرور' : 'IDENTITY_RECOVERY'}
          </CardTitle>
          <CardDescription>
            {isArabic ? 'أدخل بريدك الإلكتروني لاستلام تعليمات إعادة تعيين كلمة المرور' : 'Enter your email to receive recovery instructions'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResetRequest} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-cyber uppercase tracking-widest text-muted-foreground">
                {isArabic ? 'البريد الإلكتروني المسجل' : 'Registered Email'}
              </label>
              <div className="relative">
                <Mail className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${isArabic ? 'right-3' : 'left-3'}`} />
                <Input 
                  type="email" 
                  placeholder={isArabic ? 'name@datacamp.club' : 'name@datacamp.club'} 
                  className={isArabic ? 'pr-10' : 'pl-10'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button type="submit" variant="cyber" className="w-full" disabled={loading}>
              {loading 
                ? (isArabic ? 'جاري الإرسال...' : 'TRANSMITTING...') 
                : (isArabic ? 'إرسال رابط الاستعادة' : 'SEND_RECOVERY_CODE')
              }
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <Link to="/login" className="text-sm text-center w-full text-muted-foreground hover:text-primary transition-colors">
            {isArabic ? 'العودة إلى بوابة الدخول' : 'Return to Login Portal'}
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ForgotPassword;
