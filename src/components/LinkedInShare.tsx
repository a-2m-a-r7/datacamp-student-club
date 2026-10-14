import React, { useState } from 'react';
import { Linkedin, Copy, X, ExternalLink } from 'lucide-react';
import { Certificate, Achievement } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './ui/Button';
import { Dialog } from './ui/Dialog';
import { copyText } from '../lib/clipboard';
import { getSiteUrl } from '../lib/siteUrl';
import { CERTIFICATE_ISSUER, LINKEDIN_CERTIFICATION_URL, certificateVerificationUrl, formatCredentialDate, linkedInPostText, linkedInShareUrl } from '../lib/linkedin';

export function LinkedInShare({ item, compact = false }: { item: Certificate | Achievement; compact?: boolean }) {
  const { isArabic } = useLanguage();
  const [open, setOpen] = useState(false);
  const isCertificate = 'verificationCode' in item;
  const title = isCertificate ? item.courseTitle || item.eventTitle || (isArabic ? 'شهادة إكمال' : 'Completion certificate') : item.badgeName;
  const publicUrl = isCertificate ? certificateVerificationUrl(item) : getSiteUrl();
  const post = linkedInPostText(item, isArabic);
  const fields = isCertificate ? [
    [isArabic ? 'اسم الشهادة' : 'Certificate name', title],
    [isArabic ? 'الجهة المصدرة' : 'Issuing organization', CERTIFICATE_ISSUER],
    [isArabic ? 'تاريخ الإصدار' : 'Issue date', formatCredentialDate(item.issuedAt, isArabic)],
    [isArabic ? 'معرّف الشهادة' : 'Credential ID', item.verificationCode],
    [isArabic ? 'رابط الشهادة' : 'Credential URL', publicUrl],
  ].filter(([, value]) => value) : [];
  const copied = isArabic ? 'تم النسخ؛ الصق البيانات في LinkedIn' : 'Copied. Paste into LinkedIn.';

  return <>
    <Button type="button" size="sm" variant="outline" onClick={() => setOpen(true)}
      aria-label={`${isArabic ? 'مشاركة على LinkedIn' : 'Share on LinkedIn'}: ${title}`}
      className={`border-blue-500/30 text-blue-400 hover:bg-blue-500/10 ${compact ? 'w-full px-1 text-[10px] tracking-normal' : 'text-xs'}`}>
      <Linkedin className="w-3.5 h-3.5 shrink-0 me-1" />{compact ? 'LinkedIn' : (isArabic ? 'مشاركة على LinkedIn' : 'SHARE ON LINKEDIN')}
    </Button>
    {open && <Dialog onClose={() => setOpen(false)} aria-label={isArabic ? 'مشاركة على LinkedIn' : 'Share on LinkedIn'}
      className="fixed inset-0 z-[100] bg-black/80 p-3 sm:p-6 flex items-center justify-center print:hidden">
      <div className="bg-dark-navy border border-white/20 rounded-2xl p-4 sm:p-6 w-full max-w-xl max-h-[90dvh] overflow-y-auto space-y-4 text-foreground" dir={isArabic ? 'rtl' : 'ltr'}>
        <div className="flex items-start justify-between gap-3">
          <div><h2 className="font-bold text-lg">{isArabic ? 'شارك إنجازك على LinkedIn' : 'Share your achievement on LinkedIn'}</h2><p className="text-sm break-words text-primary">{title}</p></div>
          <Button type="button" size="icon" variant="ghost" onClick={() => setOpen(false)} aria-label={isArabic ? 'إغلاق' : 'Close'}><X className="w-5 h-5" /></Button>
        </div>
        {isCertificate && <>
          <p className="text-sm text-muted-foreground">{isArabic ? 'افتح نموذج LinkedIn ثم انسخ الحقول أدناه. LinkedIn يتطلب إدخال البيانات وتأكيد الحفظ بنفسك.' : 'Open the LinkedIn form, then copy the fields below. LinkedIn requires you to enter the details and confirm saving.'}</p>
          <div className="space-y-2">{fields.map(([label, value]) => <div key={label} className="flex items-end gap-2">
            <label className="flex-1 min-w-0 text-xs space-y-1"><span>{label}</span><input readOnly value={value} onFocus={event => event.target.select()} className="block w-full bg-black/40 border border-white/15 rounded-lg p-2 text-sm" /></label>
            <Button type="button" size="icon" variant="ghost" aria-label={`${isArabic ? 'نسخ' : 'Copy'} ${label}`} onClick={() => { void copyText(value, copied); }}><Copy className="w-4 h-4" /></Button>
          </div>)}</div>
          <Button asChild size="sm" className="w-full px-2 tracking-normal"><a href={LINKEDIN_CERTIFICATION_URL} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-4 h-4 me-2" />{isArabic ? 'إضافة الشهادة للبروفايل' : 'Add certificate to profile'}</a></Button>
        </>}
        <label className="block text-sm space-y-2"><span>{isArabic ? 'نص المنشور' : 'Post text'}</span><textarea readOnly value={post} rows={6} onFocus={event => event.target.select()} className="w-full bg-black/40 border border-white/15 rounded-lg p-3 text-sm resize-y" /></label>
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="outline" className="px-3 tracking-normal" onClick={() => { void copyText(post, copied); }}><Copy className="w-4 h-4 me-2" />{isArabic ? 'نسخ نص المنشور' : 'Copy post text'}</Button>
          <Button asChild size="sm" className="px-3 tracking-normal"><a href={linkedInShareUrl(publicUrl)} target="_blank" rel="noopener noreferrer"><Linkedin className="w-4 h-4 me-2" />{isArabic ? 'فتح مشاركة المنشور' : 'Open LinkedIn post'}</a></Button>
        </div>
        <p className="text-xs text-muted-foreground">{isArabic ? 'الصق النص في LinkedIn وراجع المنشور قبل نشره. لإرفاق صورة الشهادة أو ملف PDF، نزّلها ثم أرفقها داخل LinkedIn.' : 'Paste the text into LinkedIn and review before publishing. To attach the certificate image or PDF, download it and attach it inside LinkedIn.'}</p>
      </div>
    </Dialog>}
  </>;
}
