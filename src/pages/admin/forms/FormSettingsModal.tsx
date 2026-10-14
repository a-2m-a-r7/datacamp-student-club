import { Dialog } from '../../../components/ui/Dialog';
/**
 * src/pages/admin/forms/FormSettingsModal.tsx
 * Settings panel for form configuration, dates, access rules, and Google Sheets sync
 */

import React from 'react';
import {
  Settings, X, Shield, Users, Mail, Calendar,
  CheckCircle, FileSpreadsheet, Lock, Sparkles, Globe
} from 'lucide-react';
import { FormRecord } from '../../../types/forms';
import { useLanguage } from '../../../contexts/LanguageContext';

interface FormSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: FormRecord;
  onChange: (updated: Partial<FormRecord>) => void;
}

export const FormSettingsModal: React.FC<FormSettingsModalProps> = ({
  isOpen,
  onClose,
  form,
  onChange,
}) => {
  const { isArabic } = useLanguage();

  if (!isOpen) return null;

  return (
    <Dialog onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-card/95 border border-white/10 rounded-2xl p-6 shadow-2xl glass cyber-glow max-h-[90vh] overflow-y-auto custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-cyber text-foreground">
                {isArabic ? 'إعدادات النموذج والاستبيان' : 'Form Configuration & Settings'}
              </h3>
              <p className="text-xs text-muted-foreground">
                {isArabic ? 'صلاحيات الوصول، التواريخ، والمزامنة السحابية' : 'Manage responder audience, limits, and Google sync'}
              </p>
            </div>
          </div>
          <button aria-label="Close"
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* 1. Who can respond */}
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              {isArabic ? 'من يمكنه تعبئة هذا النموذج؟' : 'Who Can Fill Out This Form?'}
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onChange({ allow_anonymous: true })}
                className={`p-3.5 rounded-xl border text-left rtl:text-right transition-all flex items-start space-x-3 rtl:space-x-reverse ${
                  form.allow_anonymous
                    ? 'border-primary bg-primary/10 ring-1 ring-primary/40'
                    : 'border-white/5 bg-white/5 hover:border-white/20'
                }`}
              >
                <Globe className={`w-5 h-5 mt-0.5 shrink-0 ${form.allow_anonymous ? 'text-primary' : 'text-muted-foreground'}`} />
                <div>
                  <p className="text-xs font-bold text-foreground">
                    {isArabic ? 'أي شخص لديه الرابط' : 'Anyone with the link'}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {isArabic ? 'متاح للعامة دون الحاجة لتسجيل الدخول' : 'Public form, no login required'}
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onChange({ allow_anonymous: false })}
                className={`p-3.5 rounded-xl border text-left rtl:text-right transition-all flex items-start space-x-3 rtl:space-x-reverse ${
                  !form.allow_anonymous
                    ? 'border-primary bg-primary/10 ring-1 ring-primary/40'
                    : 'border-white/5 bg-white/5 hover:border-white/20'
                }`}
              >
                <Lock className={`w-5 h-5 mt-0.5 shrink-0 ${!form.allow_anonymous ? 'text-primary' : 'text-muted-foreground'}`} />
                <div>
                  <p className="text-xs font-bold text-foreground">
                    {isArabic ? 'أعضاء النادي المسجلين فقط' : 'Logged-in Members Only'}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {isArabic ? 'يلزم تسجيل الدخول بحساب النادي للمشاركة' : 'Must authenticate before submitting'}
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* 2. Submission Rules & Restrictions */}
          <div className="space-y-3 pt-3 border-t border-white/5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              {isArabic ? 'قواعد وقيود الإرسال' : 'Response Restrictions'}
            </label>

            <div className="space-y-2.5">
              {/* One response per user */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <div>
                  <p className="text-xs font-semibold text-foreground">
                    {isArabic ? 'استجابة واحدة فقط لكل شخص' : 'One response per person'}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {isArabic ? 'منع الإرسال المتكرر ومراقبة ذلك بقواعد البيانات' : 'Strictly enforce single submission in database'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onChange({ one_response_per_user: !form.one_response_per_user })}
                  className={`w-9 h-5 rounded-full transition-colors relative p-0.5 shrink-0 ${
                    form.one_response_per_user ? 'bg-primary' : 'bg-white/20'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      form.one_response_per_user ? 'translate-x-4 rtl:-translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Collect Email addresses */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <div>
                  <p className="text-xs font-semibold text-foreground">
                    {isArabic ? 'جمع عناوين البريد الإلكتروني' : 'Collect email addresses'}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {isArabic ? 'طلب البريد من المجيب وتوثيقه في الاستجابة' : 'Record respondent email with each submission'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onChange({ collect_email: !form.collect_email })}
                  className={`w-9 h-5 rounded-full transition-colors relative p-0.5 shrink-0 ${
                    form.collect_email ? 'bg-primary' : 'bg-white/20'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      form.collect_email ? 'translate-x-4 rtl:-translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* 3. Availability Schedule (Open & Close Dates) */}
          <div className="space-y-3 pt-3 border-t border-white/5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              {isArabic ? 'جدولة مواعيد الفتح والإغلاق' : 'Availability Dates'}
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-muted-foreground block mb-1">
                  {isArabic ? 'تاريخ ووقت الفتح (اختياري):' : 'Opens At (optional):'}
                </label>
                <input
                  type="datetime-local"
                  value={form.opens_at ? form.opens_at.substring(0, 16) : ''}
                  onChange={(e) =>
                    onChange({
                      opens_at: e.target.value ? new Date(e.target.value).toISOString() : null,
                    })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-foreground focus:outline-none focus:border-primary/40"
                />
              </div>

              <div>
                <label className="text-muted-foreground block mb-1">
                  {isArabic ? 'تاريخ ووقت الإغلاق (اختياري):' : 'Closes At (optional):'}
                </label>
                <input
                  type="datetime-local"
                  value={form.closes_at ? form.closes_at.substring(0, 16) : ''}
                  onChange={(e) =>
                    onChange({
                      closes_at: e.target.value ? new Date(e.target.value).toISOString() : null,
                    })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-foreground focus:outline-none focus:border-primary/40"
                />
              </div>
            </div>
          </div>

          {/* 4. Google Sheets Automatic Sync */}
          <div className="space-y-3 pt-3 border-t border-white/5">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex items-start space-x-3 rtl:space-x-reverse">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-foreground">
                    {isArabic ? 'مزامنة تلقائية مع Google Sheets' : 'Sync to Google Sheets Automatically'}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {isArabic
                      ? 'يتطلب إعداد حساب خدمة Google وصلاحيات الجدول على الخادم. تُحفظ الردود في قاعدة البيانات حتى إن لم تُفعّل المزامنة.'
                      : 'Requires a configured Google service account and spreadsheet access. Responses are saved in the database independently of sync.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onChange({ sheets_sync_enabled: !form.sheets_sync_enabled })}
                className={`w-9 h-5 rounded-full transition-colors relative p-0.5 shrink-0 ${
                  form.sheets_sync_enabled ? 'bg-emerald-500' : 'bg-white/20'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    form.sheets_sync_enabled ? 'translate-x-4 rtl:-translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* 5. Custom Success Message */}
          <div className="space-y-2 pt-3 border-t border-white/5 text-xs">
            <label className="text-muted-foreground block font-semibold uppercase tracking-wider">
              {isArabic ? 'رسالة الشكر بعد إرسال النموذج:' : 'Thank You Confirmation Message:'}
            </label>
            <textarea
              rows={2}
              value={form.success_message || ''}
              onChange={(e) => onChange({ success_message: e.target.value })}
              placeholder={isArabic ? 'شكراً لك! تم تسجيل ردك بنجاح.' : 'Thank you! Your response has been recorded.'}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-foreground focus:outline-none focus:border-primary/40 resize-none text-xs"
            />
          </div>

          {/* 6. Form URL Slug */}
          <div className="space-y-1.5 pt-3 border-t border-white/5 text-xs">
            <label className="text-muted-foreground block font-semibold uppercase tracking-wider">
              {isArabic ? 'مسار الرابط المخصص (Slug):' : 'Custom URL Slug:'}
            </label>
            <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-foreground">
              <span className="text-muted-foreground font-mono">/f/</span>
              <input
                type="text"
                value={form.slug || ''}
                onChange={(e) =>
                  onChange({
                    slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
                  })
                }
                className="flex-1 bg-transparent border-0 px-1 font-mono text-xs focus:outline-none text-primary font-bold"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors"
          >
            {isArabic ? 'حفظ وإغلاق' : 'Done'}
          </button>
        </div>
      </div>
    </Dialog>
  );
};
