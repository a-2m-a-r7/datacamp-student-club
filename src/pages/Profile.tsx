import { saveOwnProfile } from '../services/profileService';
import { authenticatedPost } from '../lib/apiClient';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { toast } from 'sonner';
import {
  User, Mail, Lock, Phone, GraduationCap, Save,
  Shield, AlertCircle, Copy, Check, LogOut, Send, KeyRound
} from 'lucide-react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import ImagePicker from '../components/ImagePicker';
import { Dialog } from '../components/ui/Dialog';


import { getSiteUrl } from '../lib/siteUrl';
import { ROLE_DEFINITIONS } from '../lib/roleDefinitions';
import { UserRole } from '../types';

const Profile = () => {
  const { user, profile, refreshProfile, logout } = useAuth();
  const { isArabic } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [readingPhoto,setReadingPhoto] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const dirty = useRef(false);
  const photoDirty = useRef(false);
  const editingUid = useRef('');

  // Profile Info State
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    faculty: '',
    academicYear: '',
    photoURL: '',
  });

  const [emailDialogOpen,setEmailDialogOpen]=useState(false);
  const [newEmail,setNewEmail]=useState('');

  useEffect(() => {
    if (profile) {
      if (editingUid.current !== profile.uid) { editingUid.current = profile.uid; dirty.current = false; photoDirty.current = false; }
      if (dirty.current) { if (!photoDirty.current) setFormData(previous=>({...previous,photoURL:profile.photoURL||''})); return; }
      setFormData({
        fullName: profile.fullName || '',
        phone: profile.phoneNumber || '',
        faculty: profile.faculty || '',
        academicYear: profile.academicYear || '',
        photoURL: profile.photoURL || '',
      });
      if(!emailDialogOpen)setNewEmail(profile.email || '');
    }
  }, [profile,emailDialogOpen]);


  const handleCopyId = async () => {
    if (profile?.memberId) {
      try {
      await navigator.clipboard.writeText(profile.memberId);
      setCopiedId(true);
      toast.success(isArabic ? 'تم نسخ رقم العضوية إلى الحافظة' : 'Member ID copied to clipboard');
      setTimeout(() => setCopiedId(false), 2000);
      } catch { toast.error(isArabic ? 'تعذر النسخ إلى الحافظة' : 'Unable to copy to clipboard'); }
    }
  };

  const handleSendPasswordReset = async () => {
    if (loading) return;
    const targetEmail = profile?.email || (user as any)?.email;
    if (!targetEmail) {
      toast.error(isArabic ? 'لا يوجد بريد إلكتروني مرتبط بهذا الحساب' : 'No email address found for this account');
      return;
    }
    setLoading(true);
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.resetPasswordForEmail(targetEmail, {
          redirectTo: `${getSiteUrl()}/reset-password`
        });
        if (error) throw error;
        toast.success(isArabic ? `تم إرسال رابط استعادة كلمة المرور إلى ${targetEmail}` : `Password recovery link sent to ${targetEmail}`);
      } else {
        throw new Error('Authentication service is not configured.');
      }
    } catch (err: any) {
      toast.error(err.message || (isArabic ? 'فشل إرسال الرابط' : 'Failed to send reset email'));
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || readingPhoto) return;
    setLoading(true);
    try {
      const activeId=user?.id||user?.uid||profile?.uid;
      const result=await saveOwnProfile({...formData},activeId,photoDirty.current,profile?.photoURL||'');
      dirty.current=false;photoDirty.current=false;
      if(result.photoURL!==undefined)setFormData(previous=>({...previous,photoURL:result.photoURL!}));
      toast.success(isArabic ? 'تم حفظ التعديلات بنجاح في قاعدة البيانات' : 'Profile updated successfully in database');
      if(result.cleanupWarning)toast.warning(isArabic?'حُفظت الصورة الجديدة، وتعذر تنظيف الملف القديم.':'New photo saved; old file cleanup could not complete.');
      await refreshProfile().catch(()=>toast.warning(isArabic?'البيانات محفوظة؛ أعد تحميل الصفحة لتحديث العرض.':'Changes are saved. Reload to refresh the displayed profile.'));
    } catch (error: any) {
      toast.error(error.issues?.[0]?.message||error.message || (isArabic ? 'فشل حفظ التعديلات' : 'Failed to update profile'));
    } finally {
      setLoading(false);
    }
  };

  const handleGooglePhoto = async () => {
    if(loading)return;setLoading(true);
    try {const result=await authenticatedPost('/api/profile/avatar',{action:'use-google'});dirty.current=true;photoDirty.current=false;setFormData(previous=>({...previous,photoURL:result.avatarUrl}));await refreshProfile().catch(()=>toast.warning(isArabic?'الصورة محفوظة؛ أعد تحميل الصفحة لتحديث العرض.':'Photo saved. Reload to refresh the display.'));if(result.concurrentChange)toast.warning(isArabic?'تغيرت الصورة أثناء الحفظ؛ تظهر الصورة الأحدث.':'Photo changed during saving; the latest saved photo is displayed.');else toast.success(isArabic?'صورة Google محفوظة في Storage وسجل الحساب.':'Google photo saved in Storage and your account record.');}
    catch(error:any){toast.error(error.message||'Unable to save Google photo');}finally{setLoading(false);}
  };

  const handleEmailUpdate = async (event: React.FormEvent) => {
    event.preventDefault(); if(loading)return;
    const email=newEmail.trim();
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254)return toast.error(isArabic?'اكتب بريدًا إلكترونيًا صحيحًا':'Enter a valid email address');
    if(email.toLowerCase()===(user?.email||profile?.email||'').toLowerCase())return toast.error(isArabic?'البريد الجديد مطابق للحالي':'New email matches the current email');
    setLoading(true);
    try {
      if(!isSupabaseConfigured)throw Error('Authentication service is not configured.');
      const {error}=await supabase.auth.updateUser({email},{emailRedirectTo:getSiteUrl()+'/auth/callback'});
      if(error)throw error;
      toast.success(isArabic?'تم إرسال رسالة تأكيد التغيير. بريدك الحالي يظل كما هو حتى التأكيد.':'Confirmation sent. Your current email remains unchanged until confirmed.');
      setEmailDialogOpen(false);
    } catch(error:any){toast.error(error.message||'Unable to request email change');}
    finally {setLoading(false);}
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6 pt-24 md:pt-32 pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-cyber tracking-tighter">
            {isArabic ? 'الملف الشخصي' : 'USER'} <span className="text-primary neon-text">{isArabic ? 'للعضو' : 'PROFILE'}</span>
          </h1>
          <p className="text-muted-foreground">
            {isArabic ? 'إدارة بياناتك الشخصية وتأمين حسابك عبر رسائل تأكيد البريد.' : 'Manage your identity and security settings.'}
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
                {isArabic ? 'تحديث بيانات ملفك الشخصي الأكاديمي.' : 'Update your account details.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} onChange={() => { dirty.current = true; }} className="space-y-6">
                <fieldset disabled={loading} className="space-y-6">
                <ImagePicker
                  disabled={loading}
                  allowRemoteUrl={false}
                  onReadingChange={setReadingPhoto}
                  label={isArabic ? 'صورة الملف الشخصي' : 'Profile Picture'}
                  currentImage={formData.photoURL}
                  onImageSelected={(base64) => { dirty.current = true; photoDirty.current = true; setFormData(previous => ({ ...previous, photoURL: base64 })); }}
                />
                {(user?.user_metadata?.avatar_url||user?.user_metadata?.picture||'').includes('.googleusercontent.com/') && <Button type="button" disabled={loading||readingPhoto} onClick={handleGooglePhoto}>{isArabic?'حفظ صورة Google في الحساب':'Save Google photo to account'}</Button>}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-cyber uppercase tracking-widest text-muted-foreground">
                      {isArabic ? 'الاسم بالكامل' : 'Full Name'}
                    </label>
                    <div className="relative">
                      <User className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${isArabic ? 'right-3' : 'left-3'}`} />
                      <Input
                        aria-label="Full name"
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
                        aria-label="Phone number"
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
                        aria-label="Faculty"
                        className={`flex h-10 w-full rounded-md border border-white/10 bg-white/5 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                          isArabic ? 'pr-10 pl-3' : 'pl-10 pr-3'
                        }`}
                        value={formData.faculty}
                        onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                      >
                        <option value="" className="bg-dark-navy">{isArabic ? 'اختر الكلية' : 'Select Faculty'}</option>
                        {formData.faculty&&!['Computer Science','Engineering','Nursing','Physical Therapy','Business','Arts'].includes(formData.faculty)&&<option value={formData.faculty} className="bg-dark-navy">{formData.faculty}</option>}
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
                      aria-label="Academic year"
                      className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      value={formData.academicYear}
                      onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                    >
                      <option value="" className="bg-dark-navy">{isArabic ? 'اختر الفرقة' : 'Select Year'}</option>
                      {formData.academicYear&&!['1','2','3','4','5'].includes(formData.academicYear)&&<option value={formData.academicYear} className="bg-dark-navy">{formData.academicYear}</option>}
                      <option value="1" className="bg-dark-navy">{isArabic ? 'الفرقة الأولى' : 'Year 1'}</option>
                      <option value="2" className="bg-dark-navy">{isArabic ? 'الفرقة الثانية' : 'Year 2'}</option>
                      <option value="3" className="bg-dark-navy">{isArabic ? 'الفرقة الثالثة' : 'Year 3'}</option>
                      <option value="4" className="bg-dark-navy">{isArabic ? 'الفرقة الرابعة' : 'Year 4'}</option>
                      <option value="5" className="bg-dark-navy">{isArabic ? 'الفرقة الخامسة' : 'Year 5'}</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" variant="cyber" disabled={loading||readingPhoto}>
                    <Save className={`w-4 h-4 ${isArabic ? 'ml-2' : 'mr-2'}`} />
                    {isArabic ? 'حفظ التعديلات' : 'SAVE_CHANGES'}
                  </Button>
                </div>
                </fieldset>
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
                {isArabic ? 'تغيير البريد وتحديث كلمة المرور عبر رسائل تأكيد آمنة.' : 'Update your email and password through secure confirmation emails.'}
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
                    aria-label={isArabic ? "إرسال رابط تغيير كلمة المرور" : "Send password reset link"} disabled={loading} onClick={handleSendPasswordReset}
                  >
                    {isArabic ? 'إرسال رابط' : 'SEND LINK'}
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
                    aria-label={isArabic ? "تغيير البريد الإلكتروني" : "Change email address"} disabled={loading} onClick={() => {setNewEmail(user?.email||profile?.email||'');setEmailDialogOpen(true);}}
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
                    ? 'افتح رسالة التأكيد على بريدك لإتمام التغيير. لن يتغير بريد الحساب قبل التأكيد. إذا فقدت الوصول إلى بريدك، تواصل مع إدارة النادي.'
                    : 'Open the confirmation email to finish the change. Your account email stays unchanged until confirmation. Contact club administration if you lose access to your email.'
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

      {emailDialogOpen && <Dialog onClose={()=>setEmailDialogOpen(false)} aria-label={isArabic?'تغيير البريد الإلكتروني':'Change email address'} className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
        <Card className="w-full max-w-md"><CardHeader><CardTitle>{isArabic?'تغيير البريد الإلكتروني':'Change email address'}</CardTitle></CardHeader><CardContent>
          <form onSubmit={handleEmailUpdate} className="space-y-4">
            <p>{isArabic?'يلزم تأكيد التغيير عبر رسالة البريد قبل تحديث بيانات حسابك.':'Confirm the change by email before your account email is updated.'}</p>
            <Input aria-label="New email address" type="email" required value={newEmail} onChange={e=>setNewEmail(e.target.value)} />
            <Button type="submit" disabled={loading}>{isArabic?'إرسال رسالة التأكيد':'Send confirmation'}</Button>
            <Button type="button" variant="outline" onClick={()=>setEmailDialogOpen(false)}>{isArabic?'إلغاء':'Cancel'}</Button>
          </form>
        </CardContent></Card>
      </Dialog>}

    </div>
  );
};

export default Profile;
