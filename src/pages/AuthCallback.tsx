import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'sonner';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { isArabic } = useLanguage();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const handleOAuthCallback = async () => {
      try {
        // 1. Check for errors in URL params (e.g., access_denied)
        const params = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
        
        const error = params.get('error') || hashParams.get('error');
        const errorDescription = params.get('error_description') || hashParams.get('error_description');

        if (error) {
          throw new Error(errorDescription || error);
        }

        // 2. Extract code for PKCE exchange
        const code = params.get('code');
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
        }

        // 3. Confirm active session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (session && mounted) {
          toast.success(isArabic ? 'تم تأكيد الدخول بحساب Google بنجاح 🚀' : 'Google authentication verified successfully 🚀');
          const destination = sessionStorage.getItem('datacamp_auth_redirect') || '/dashboard';
          sessionStorage.removeItem('datacamp_auth_redirect');
          navigate(destination.startsWith('/') ? destination : '/dashboard', { replace: true });
          return;
        }

        // If no session found yet, wait briefly and redirect to dashboard
        setTimeout(() => {
          if (mounted) navigate('/dashboard', { replace: true });
        }, 1000);
      } catch (err: any) {
        console.error('[AuthCallback] Verification error:', err);
        if (mounted) {
          setErrorMsg(err.message || 'Failed to complete authentication.');
          toast.error(isArabic ? 'فشل إتمام المصادقة مع Google' : 'Failed to complete Google authentication');
          setTimeout(() => navigate('/login', { replace: true }), 3000);
        }
      }
    };

    handleOAuthCallback();

    return () => {
      mounted = false;
    };
  }, [navigate, isArabic]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-dark-navy text-center">
      <div className="relative p-8 rounded-2xl border border-primary/30 bg-dark-navy/80 backdrop-blur-xl max-w-md w-full shadow-[0_0_50px_rgba(0,255,136,0.1)]">
        <div className="w-16 h-16 mx-auto mb-6 relative">
          <div className="absolute inset-0 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
          <div className="absolute inset-2 rounded-full border-2 border-primary/40 border-b-primary animate-ping opacity-30" />
        </div>

        <h2 className="text-xl font-bold font-cyber text-primary tracking-wide mb-2">
          {isArabic ? 'جاري التحقق من الهوية السحابية...' : 'SYNCHRONIZING_IDENTITY...'}
        </h2>
        <p className="text-xs font-mono text-muted-foreground mb-4">
          {isArabic ? 'يتم الآن ربط الجلسة وتحديث ملفك في قاعدة بيانات النادي' : 'Exchanging secure keys and fetching your operative profile'}
        </p>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs font-mono">
            {errorMsg}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
