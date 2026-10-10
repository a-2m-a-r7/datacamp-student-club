import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { toast } from 'sonner';
import { 
  User, Mail, Lock, Phone, GraduationCap, Save, 
  Shield, CheckCircle2, AlertCircle, 
  Smartphone, ArrowRight, X, Key, Copy, Check, LogOut, Send, KeyRound
} from 'lucide-react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import ImagePicker from '../components/ImagePicker';
import { sendOTP, verifyOTP } from '../lib/otp';
import { motion, AnimatePresence } from 'motion/react';
import { validatePasswordStrength } from '../lib/utils';

import { profileSchema } from '../lib/schemas';
import { ROLE_DEFINITIONS } from '../lib/roleDefinitions';
import { UserRole } from '../types';

const Profile = () => {
  const { user, profile, setMockUser, logout } = useAuth();
  const { isArabic } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  
  // Profile Info State
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    faculty: '',
    academicYear: '',
    photoURL: '',
  });

  // OTP Flow State
  const [otpStep, setOtpStep] = useState<'none' | 'verify' | 'success'>('none');
  const [otpAction, setOtpAction] = useState<'password' | 'email' | 'none'>('none');
  const [otpTarget, setOtpTarget] = useState('');
  const [otpType, setOtpType] = useState<'email' | 'phone'>('email');
  const [otpCode, setOtpCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  
  const MAX_ATTEMPTS = 5;

  // Re-auth State
  const [currentPassword, setCurrentPassword] = useState('');
  
  // New Data State
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        phone: profile.phoneNumber || '',
        faculty: profile.faculty || '',
        academicYear: profile.academicYear || '',
        photoURL: profile.photoURL || '',
      });
      setNewEmail(profile.email || '');
    }
  }, [profile]);

  useEffect(() => {
    let timer: any;
    if (timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [timeLeft]);

  const validatePhone = (phone: string) => {
    const cleaned = phone.replace(/[\s-]/g, '');
    return /^(\+20|0)?1[0125][0-9]{8}$/.test(cleaned);
  };

  const handleCopyId = () => {
    if (profile?.memberId) {
      navigator.clipboard.writeText(profile.memberId);
      setCopiedId(true);
      toast.success(isArabic ? 'تم نسخ رقم العضوية إلى الحافظة' : 'Member ID copied to clipboard');
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleSendPasswordReset = async () => {
    const targetEmail = profile?.email || (user as any)?.email;
    if (!targetEmail) {
      toast.error(isArabic ? 'لا يوجد بريد إلكتروني مرتبط بهذا الحساب' : 'No email address found for this account');
      return;
    }
    setLoading(true);
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.resetPasswordForEmail(targetEmail, {
          redirectTo: `${window.location.origin}/reset-password`
        });
        if (error) throw error;
        toast.success(isArabic ? `تم إرسال رابط استعادة كلمة المرور إلى ${targetEmail}` : `Password recovery link sent to ${targetEmail}`);
      } else {
        toast.success(isArabic ? `تم إرسال رابط استعادة كلمة المرور إلى ${targetEmail}` : `Password recovery link sent to ${targetEmail}`);
      }
    } catch (err: any) {
      toast.error(err.message || (isArabic ? 'فشل إرسال الرابط' : 'Failed to send reset email'));
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      profileSchema.parse(formData);
      
      let finalPhotoURL = formData.photoURL;

      if (formData.photoURL.startsWith('data:image')) {
        try {
          const response = await fetch(formData.photoURL);
          const blob = await response.blob();
          const { uploadFile, getStoragePath } = await import('../services/storageService');
          const activeUid = (user as any)?.id || (user as any)?.uid || 'user';
          const file = new File([blob], `avatar_${Date.now()}.jpg`, { type: 'image/jpeg' });
          finalPhotoURL = await uploadFile(getStoragePath('avatars', activeUid, file.name), file);
        } catch {
          console.warn("Storage upload fallback");
        }
      }

      if (formData.phone && formData.phone.trim().length > 0 && !validatePhone(formData.phone)) {
        toast.error(isArabic ? 'صيغة رقم الهاتف المصري غير صحيحة (+201XXXXXXXXX)' : 'Invalid Egyptian phone format (+201XXXXXXXXX)');
        setLoading(false);
        return;
      }

      if (isSupabaseConfigured) {
        const activeId = (user as any)?.id || (user as any)?.uid || profile?.uid;
        if (activeId) {
          const { error } = await supabase.from('profiles').update({
            full_name: formData.fullName,
            phone: formData.phone,
            faculty: formData.faculty,
            academic_year: formData.academicYear,
            avatar_url: finalPhotoURL,
            photo_url: finalPhotoURL,
            updated_at: new Date().toISOString()
          }).eq('id', activeId);

          if (error) throw error;

          if (profile) {
            profile.fullName = formData.fullName;
            profile.phoneNumber = formData.phone;
            profile.faculty = formData.faculty;
            profile.academicYear = formData.academicYear;
            profile.photoURL = finalPhotoURL;
          }

          toast.success(isArabic ? 'تم حفظ التعديلات بنجاح في قاعدة البيانات' : 'Profile updated successfully in database');
          setLoading(false);
          return;
        }
      }

      if (setMockUser && profile) {
        setMockUser({
          ...profile,
          fullName: formData.fullName,
          phoneNumber: formData.phone,
          faculty: formData.faculty,
          academicYear: formData.academicYear,
          photoURL: finalPhotoURL,
        });
      }
      toast.success(isArabic ? 'تم تحديث البيانات محلياً' : 'Profile updated locally');
    } catch (error: any) {
      toast.error(error.message || (isArabic ? 'فشل حفظ التعديلات' : 'Failed to update profile'));
    } finally {
      setLoading(false);
    }
  };

  const startOtpFlow = async (action: 'password' | 'email', type: 'email' | 'phone' = 'email') => {
    if (isBlocked) {
      return toast.error(isArabic ? 'تم استنفاد المحاولات. يرجى المحاولة لاحقاً.' : 'Too many failed attempts. Please try again later.');
    }
    if (timeLeft > 0) {
      return toast.error(isArabic ? `يرجى الانتظار ${timeLeft} ثانية قبل طلب رمز جديد.` : `Please wait ${timeLeft}s before requesting a new code.`);
    }

    const target = type === 'email' ? profile?.email : profile?.phoneNumber;
    
    if (!target) {
      toast.error(isArabic ? `لا يوجد ${type === 'email' ? 'بريد' : 'هاتف'} مرتبط بهذا الحساب.` : `No ${type} associated with this account.`);
      return;
    }

    setLoading(true);
    const success = await sendOTP(target, type);
    setLoading(false);

    if (success) {
      setOtpAction(action);
      setOtpTarget(target);
      setOtpType(type);
      setOtpStep('verify');
      setTimeLeft(60);
      setAttempts(0);
      toast.success(isArabic ? `تم إرسال الرمز إلى ${target}` : `OTP sent to ${target}`);
    } else {
      toast.error(isArabic ? 'فشل إرسال رمز التحقق. يرجى المحاولة لاحقاً.' : 'Failed to send OTP. Please try again.');
    }
  };

  const handleVerifyOTP = async () => {
    if (otpCode.length !== 6 || isBlocked) return;
    
    setLoading(true);
    const isValid = await verifyOTP(otpTarget, otpCode, otpType);
    setLoading(false);

    if (isValid) {
      setOtpStep('success');
      toast.success(isArabic ? 'تم تأكيد الهوية بنجاح' : 'Identity verified');
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= MAX_ATTEMPTS) {
        setIsBlocked(true);
        toast.error(isArabic ? 'تم استنفاد الحد الأقصى للمحاولات.' : 'Maximum attempts reached. Access blocked.');
      } else {
        toast.error(isArabic ? `رمز غير صالح. متبقي ${MAX_ATTEMPTS - newAttempts} محاولات.` : `Invalid or expired OTP. ${MAX_ATTEMPTS - newAttempts} attempts remaining.`);
      }
      setOtpCode('');
    }
  };

  const finalizeAction = async () => {
    if (otpAction === 'password') {
      const passwordCheck = validatePasswordStrength(newPassword);
      if (!passwordCheck.isValid) {
        return toast.error(passwordCheck.message);
      }
      if (newPassword !== confirmPassword) {
        toast.error(isArabic ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
        return;
      }
    }

    setLoading(true);
    try {
      if (isSupabaseConfigured) {
        if (otpAction === 'password') {
          const { error } = await supabase.auth.updateUser({ password: newPassword });
          if (error) throw error;
          toast.success(isArabic ? 'تم تحديث كلمة المرور بنجاح' : 'Password updated successfully');
        } else if (otpAction === 'email') {
          const { error } = await supabase.auth.updateUser({ email: newEmail });
          if (error) throw error;
          const activeId = (user as any)?.id || (user as any)?.uid || profile?.uid;
          if (activeId) {
            await supabase.from('profiles').update({ email: newEmail }).eq('id', activeId);
          }
          toast.success(isArabic ? 'تم إرسال رابط تأكيد للبريد الإلكتروني الجديد' : 'Confirmation link sent to new email');
        }
        setOtpStep('none');
        setOtpAction('none');
        setNewPassword('');
        setConfirmPassword('');
        setOtpCode('');
        setCurrentPassword('');
        setLoading(false);
        return;
      }

      toast.success(isArabic ? 'تم تأكيد العملية' : 'Action confirmed');
      
      setOtpStep('none');
      setOtpAction('none');
      setNewPassword('');
      setConfirmPassword('');
      setOtpCode('');
      setCurrentPassword('');
    } catch (error: any) {
      toast.error(error.message || (isArabic ? 'فشلت العملية' : 'Action failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6 pt-24 md:pt-32 pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-cyber tracking-tighter">
            {isArabic ? 'الملف الشخصي' : 'USER'} <span className="text-primary neon-text">{isArabic ? 'للعضو' : 'PROFILE'}</span>
          </h1>
          <p className="text-muted-foreground">
            {isArabic ? 'إدارة بياناتك الشخصية، وبيانات الكلية، وتأمين حسابك عبر رمز OTP.' : 'Manage your identity and security settings.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-lg">
            <span className="text-[10px] font-cyber uppercase tracking-widest text-primary font-mono">
              {isArabic ? `رقم العضوية: ${profile?.memberId}` : `Member ID: ${profile?.memberId}`}
            </span>
            <button
              onClick={handleCopyId}
              className="p-1 rounded text-primary hover:bg-primary/20 transition-colors"
              title={isArabic ? 'نسخ رقم العضوية' : 'Copy Member ID'}
            >
              {copiedId ? <Check className="w-3.5 h-3.5 text-neon-green" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          {profile?.role && (() => {
            const rDef = ROLE_DEFINITIONS[profile.role as UserRole] || ROLE_DEFINITIONS.member;
            return (
              <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${rDef.badgeBg} ${rDef.badgeBorder}`}>
                <Shield className={`w-3.5 h-3.5 ${rDef.badgeColor}`} />
                <span className={`text-[10px] font-cyber uppercase tracking-widest font-bold ${rDef.badgeColor}`}>
                  {isArabic ? rDef.titleAr : rDef.titleEn}
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/40 text-white/70">
                  LVL {rDef.level}
                </span>
              </div>
            );
          })()}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile Info */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center space-x-2 gap-2 text-primary mb-2">
                <User className="w-5 h-5" />
                <CardTitle className="text-lg">
                  {isArabic ? 'البيانات الشخصية' : 'Personal Information'}
                </CardTitle>
              </div>
              <CardDescription>
                {isArabic ? 'تحديث بيانات ملفك الشخصي الأكاديمي.' : 'Update your public profile details.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <ImagePicker 
                  label={isArabic ? 'صورة الملف الشخصي' : 'Profile Picture'}
                  currentImage={formData.photoURL}
                  onImageSelected={(base64) => setFormData({ ...formData, photoURL: base64 })}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-cyber uppercase tracking-widest text-muted-foreground">
                      {isArabic ? 'الاسم بالكامل' : 'Full Name'}
                    </label>
                    <div className="relative">
                      <User className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${isArabic ? 'right-3' : 'left-3'}`} />
                      <Input 
                        value={formData.fullName} 
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} 
                        className={isArabic ? 'pr-10' : 'pl-10'}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-cyber uppercase tracking-widest text-muted-foreground">
                      {isArabic ? 'رقم الهاتف' : 'Phone Number'}
                    </label>
                    <div className="relative">
                      <Phone className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${isArabic ? 'right-3' : 'left-3'}`} />
                      <Input 
                        value={formData.phone} 
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                        className={isArabic ? 'pr-10' : 'pl-10'}
                        placeholder="+20 123 456 7890"
                        dir="ltr"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-cyber uppercase tracking-widest text-muted-foreground">
                      {isArabic ? 'الكلية' : 'Faculty'}
                    </label>
                    <div className="relative">
                      <GraduationCap className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${isArabic ? 'right-3' : 'left-3'}`} />
                      <select 
                        className={`flex h-10 w-full rounded-md border border-white/10 bg-white/5 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                          isArabic ? 'pr-10 pl-3' : 'pl-10 pr-3'
                        }`}
                        value={formData.faculty}
                        onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                      >
                        <option value="" className="bg-dark-navy">{isArabic ? 'اختر الكلية' : 'Select Faculty'}</option>
                        <option value="Computer Science" className="bg-dark-navy">{isArabic ? 'حاسبات ومعلومات / ذكاء اصطناعي' : 'Computer Science'}</option>
                        <option value="Engineering" className="bg-dark-navy">{isArabic ? 'الهندسة' : 'Engineering'}</option>
                        <option value="Nursing" className="bg-dark-navy">{isArabic ? 'التمريض' : 'Nursing'}</option>
                        <option value="Physical Therapy" className="bg-dark-navy">{isArabic ? 'العلاج الطبيعي' : 'Physical Therapy'}</option>
                        <option value="Business" className="bg-dark-navy">{isArabic ? 'إدارة الأعمال' : 'Business'}</option>
                        <option value="Arts" className="bg-dark-navy">{isArabic ? 'الآداب والفنون' : 'Arts'}</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-cyber uppercase tracking-widest text-muted-foreground">
                      {isArabic ? 'الفرقة الدراسية' : 'Academic Year'}
                    </label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      value={formData.academicYear}
                      onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                    >
                      <option value="" className="bg-dark-navy">{isArabic ? 'اختر الفرقة' : 'Select Year'}</option>
                      <option value="1" className="bg-dark-navy">{isArabic ? 'الفرقة الأولى' : 'Year 1'}</option>
                      <option value="2" className="bg-dark-navy">{isArabic ? 'الفرقة الثانية' : 'Year 2'}</option>
                      <option value="3" className="bg-dark-navy">{isArabic ? 'الفرقة الثالثة' : 'Year 3'}</option>
                      <option value="4" className="bg-dark-navy">{isArabic ? 'الفرقة الرابعة' : 'Year 4'}</option>
                      <option value="5" className="bg-dark-navy">{isArabic ? 'الفرقة الخامسة' : 'Year 5'}</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" variant="cyber" disabled={loading}>
                    <Save className={`w-4 h-4 ${isArabic ? 'ml-2' : 'mr-2'}`} />
                    {isArabic ? 'حفظ التعديلات' : 'SAVE_CHANGES'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Security */}
        <div className="space-y-8">
          <Card className="border-neon-blue/20">
            <CardHeader>
              <div className="flex items-center space-x-2 gap-2 text-neon-blue mb-2">
                <Shield className="w-5 h-5" />
                <CardTitle className="text-lg">
                  {isArabic ? 'إعدادات الأمان' : 'Security Controls'}
                </CardTitle>
              </div>
              <CardDescription>
                {isArabic ? 'إدارة بيانات الدخول وتحديث كلمة المرور بأمان عبر OTP.' : 'Manage your access credentials securely via OTP.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 glass rounded-xl border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-neon-purple/10 rounded-lg">
                      <Lock className="w-4 h-4 text-neon-purple" />
                    </div>
                    <span className="text-sm font-bold">
                      {isArabic ? 'كلمة المرور' : 'Password'}
                    </span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-[10px] font-cyber h-8"
                    onClick={() => startOtpFlow('password')}
                  >
                    {isArabic ? 'تغيير' : 'CHANGE'}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-neon-blue/10 rounded-lg">
                      <Mail className="w-4 h-4 text-neon-blue" />
                    </div>
                    <span className="text-sm font-bold">
                      {isArabic ? 'البريد الإلكتروني' : 'Email'}
                    </span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-[10px] font-cyber h-8"
                    onClick={() => startOtpFlow('email')}
                  >
                    {isArabic ? 'تغيير' : 'CHANGE'}
                  </Button>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-neon-cyan/10 rounded-lg">
                      <KeyRound className="w-4 h-4 text-neon-cyan" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">
                        {isArabic ? 'إعادة ضبط كلمة المرور' : 'Password Reset'}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {isArabic ? 'إرسال رابط عبر البريد' : 'Send link via email'}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-[10px] font-cyber h-8 gap-1.5"
                    onClick={handleSendPasswordReset}
                    disabled={loading}
                  >
                    <Send className="w-3 h-3" />
                    {isArabic ? 'إرسال' : 'SEND'}
                  </Button>
                </div>
              </div>

              <div className="bg-destructive/5 border border-destructive/20 p-4 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-[10px] font-cyber uppercase tracking-widest">
                    {isArabic ? 'ملاحظة أمنية' : 'Security Note'}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  {isArabic
                    ? 'الإجراءات الحساسة تتطلب التحقق من الهوية برمز تأكيد. إذا تعذر الوصول لبريدك، يمكنك استخدام رمز التحقق عبر الرسائل النصية SMS.'
                    : 'Sensitive actions require identity verification. If you cannot access your email, use the SMS fallback option.'
                  }
                </p>
              </div>

              <div className="pt-2">
                <Button 
                  variant="ghost" 
                  className="w-full text-destructive hover:bg-destructive/10 text-xs font-cyber gap-2 border border-destructive/20 hover:border-destructive/40"
                  onClick={async () => {
                    await logout();
                    navigate('/login');
                  }}
                >
                  <LogOut className="w-4 h-4" />
                  {isArabic ? 'تسجيل الخروج من الحساب' : 'SIGN_OUT'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* OTP Verification Overlay */}
      <AnimatePresence>
        {otpStep !== 'none' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-dark-navy/90 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md"
            >
              <Card className="border-primary/30 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-neon-blue to-neon-purple" />
                <button 
                  onClick={() => setOtpStep('none')}
                  className={`absolute top-4 ${isArabic ? 'left-4' : 'right-4'} text-muted-foreground hover:text-white transition-colors`}
                >
                  <X className="w-5 h-5" />
                </button>

                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    {otpStep === 'verify' ? <Shield className="w-8 h-8 text-primary" /> : <CheckCircle2 className="w-8 h-8 text-primary" />}
                  </div>
                  <CardTitle className="font-cyber tracking-tighter">
                    {otpStep === 'verify' 
                      ? (isArabic ? 'التحقق من الهوية' : 'IDENTITY_VERIFICATION') 
                      : (isArabic ? 'تم التحقق بنجاح' : 'VERIFICATION_SUCCESS')
                    }
                  </CardTitle>
                  <CardDescription>
                    {otpStep === 'verify' 
                      ? (isArabic ? `أدخل الرمز المكون من 6 أرقام المرسل إلى ${otpTarget}` : `Enter the 6-digit code sent to ${otpTarget}`)
                      : (isArabic ? `يمكنك الآن استكمال تحديث ${otpAction === 'password' ? 'كلمة المرور' : 'البريد'}.` : `You can now finalize your ${otpAction} update.`)}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {otpStep === 'verify' ? (
                    <div className="space-y-6">
                      <div className="flex justify-center gap-2">
                        <Input 
                          className="text-center text-2xl font-black tracking-[1em] h-14 font-mono"
                          maxLength={6}
                          placeholder="000000"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                          dir="ltr"
                        />
                      </div>
                      <div className="flex flex-col gap-3">
                        <Button variant="cyber" className="w-full" onClick={handleVerifyOTP} disabled={loading || otpCode.length !== 6}>
                          {isArabic ? 'تأكيد الرمز' : 'VERIFY_CODE'}
                        </Button>
                        <div className="flex justify-between items-center text-[10px] font-cyber uppercase tracking-widest text-muted-foreground">
                          <span>{isArabic ? 'لم تستلم الرمز؟' : "Didn't receive code?"}</span>
                          <button 
                            className={`text-primary hover:underline ${timeLeft > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={() => startOtpFlow(otpAction as any, otpType)}
                            disabled={timeLeft > 0}
                          >
                            {timeLeft > 0 ? (isArabic ? `إعادة الإرسال (${timeLeft}ث)` : `RESEND (${timeLeft}s)`) : (isArabic ? 'إعادة الإرسال' : 'RESEND')}
                          </button>
                        </div>
                        {otpType === 'email' && profile?.phoneNumber && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-[10px] font-cyber text-neon-blue"
                            onClick={() => startOtpFlow(otpAction as any, 'phone')}
                          >
                            <Smartphone className={`w-3 h-3 ${isArabic ? 'ml-2' : 'mr-2'}`} />
                            {isArabic ? 'استخدام رسالة نصية SMS' : 'USE SMS FALLBACK'}
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {otpAction === 'email' ? (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-cyber uppercase tracking-widest text-muted-foreground">
                              {isArabic ? 'البريد الإلكتروني الجديد' : 'New Email Address'}
                            </label>
                            <Input 
                              type="email"
                              value={newEmail}
                              onChange={(e) => setNewEmail(e.target.value)}
                              placeholder="new@example.com"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-cyber uppercase tracking-widest text-muted-foreground">
                              {isArabic ? 'كلمة المرور الجديدة' : 'New Password'}
                            </label>
                            <Input 
                              type="password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="••••••••"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-cyber uppercase tracking-widest text-muted-foreground">
                              {isArabic ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'}
                            </label>
                            <Input 
                              type="password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder="••••••••"
                            />
                          </div>
                        </div>
                      )}

                      <Button variant="cyber" className="w-full" onClick={finalizeAction} disabled={loading}>
                        {isArabic ? 'تأكيد التحديث' : 'FINALIZE_UPDATE'}
                        <ArrowRight className={`w-4 h-4 ${isArabic ? 'mr-2 rotate-180' : 'ml-2'}`} />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
