import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './ui/Button';
export function GoogleAccountModal({ isOpen, onClose }: {
  isOpen: boolean; onClose: () => void; onSuccess?: () => void;
}) {
  const { loginWithGoogle } = useAuth();
  const { isArabic } = useLanguage();
  const [pending, setPending] = useState(false);
  if (!isOpen) return null;
  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
    <div role="dialog" aria-modal="true" aria-label={isArabic ? 'تسجيل الدخول بحساب Google' : 'Google sign in'}
      className="glass p-6 rounded-xl max-w-md w-full space-y-4" onClick={e => e.stopPropagation()}>
      <Button disabled={pending} onClick={async () => {
        setPending(true);
        try { await loginWithGoogle(); } finally { setPending(false); }
      }}>{isArabic ? 'تسجيل الدخول بحساب Google' : 'Sign in with Google'}</Button>
      <Button variant="outline" onClick={onClose}>{isArabic ? 'إغلاق' : 'Close'}</Button>
    </div>
  </div>;
}
