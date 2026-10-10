import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { toast } from 'sonner';
import { Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const ResetPassword = () => {
  const { isArabic } = useLanguage();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      toast.error(isArabic ? 'كلمة المرور يجب أن لا تقل عن 6 أحرف' : 'Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      toast.error(isArabic ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      toast.success(isArabic ? 'تم تحديث كلمة المرور بنجاح!' : 'Password updated successfully!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      toast.error(err.message || (isArabic ? 'فشل تحديث كلمة المرور' : 'Failed to update password'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-12">
      <Card className="w-full max-w-md border-primary/20 bg-dark-navy/60 backdrop-blur-2xl">
        <CardHeader className="text-center space-y-2">
          {success ? (
            <ShieldCheck className="w-12 h-12 text-primary mx-auto mb-2" />
          ) : (
            <Lock className="w-10 h-10 text-primary mx-auto mb-2" />
          )}
          <CardTitle className="text-2xl font-cyber text-primary">
            {isArabic ? 'إعادة تعيين كلمة المرور' : 'UPDATE_ACCESS_KEY'}
          </CardTitle>
          <CardDescription className="text-xs font-mono">
            {isArabic ? 'أدخل كلمة المرور الجديدة لحسابك' : 'Enter your new secure password'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                {isArabic ? 'تم تغيير كلمة المرور بنجاح. جاري تحويلك لصفحة الدخول...' : 'Password updated successfully. Redirecting to login...'}
              </p>
              <Button variant="cyber" className="w-full" onClick={() => navigate('/login')}>
                {isArabic ? 'تسجيل الدخول الآن' : 'PROCEED TO LOGIN'}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-cyber uppercase tracking-widest text-muted-foreground">
                  {isArabic ? 'كلمة المرور الجديدة' : 'New Password'}
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-cyber uppercase tracking-widest text-muted-foreground">
                  {isArabic ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                </label>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" variant="cyber" className="w-full mt-4" disabled={loading}>
                {loading
                  ? (isArabic ? 'جاري الحفظ...' : 'UPDATING...')
                  : (isArabic ? 'تحديث كلمة المرور' : 'UPDATE PASSWORD')}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
