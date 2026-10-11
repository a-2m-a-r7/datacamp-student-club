/**
 * src/pages/admin/forms/FormShareModal.tsx
 * Share modal providing public link, copy button, QR code download, and open button
 */

import React, { useState, useRef } from 'react';
import { 
  Share2, Copy, Check, ExternalLink, Download, 
  QrCode, X, Globe, Sparkles 
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import { FormRecord } from '../../../types/forms';
import { useLanguage } from '../../../contexts/LanguageContext';
import { getSiteUrl } from '../../../lib/siteUrl';

interface FormShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: FormRecord;
}

export const FormShareModal: React.FC<FormShareModalProps> = ({
  isOpen,
  onClose,
  form,
}) => {
  const { isArabic } = useLanguage();
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const publicUrl = `${getSiteUrl()}/f/${form.slug}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      toast.success(isArabic ? 'تم نسخ الرابط بنجاح!' : 'Form link copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleDownloadQR = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = 400;
      canvas.height = 400;
      if (ctx) {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 20, 20, 360, 360);
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `${form.slug}-qrcode.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
        toast.success(isArabic ? 'تم تحميل رمز الاستجابة السريعة (QR)' : 'QR Code downloaded!');
      }
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-card/95 border border-white/10 rounded-2xl p-6 shadow-2xl glass cyber-glow"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-cyber text-foreground">
                {isArabic ? 'مشاركة ونشر النموذج' : 'Share & Distribute Form'}
              </h3>
              <p className="text-xs text-muted-foreground truncate max-w-xs">
                {form.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Public Link Box */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-primary" />
              {isArabic ? 'رابط المشاركة المباشر' : 'Public Shareable Link'}
            </label>

            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs font-mono text-foreground truncate select-all">
                {publicUrl}
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 flex items-center gap-1.5 shrink-0 transition-colors shadow-lg shadow-primary/20"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? (isArabic ? 'تم النسخ' : 'Copied!') : isArabic ? 'نسخ' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/5 flex flex-col sm:flex-row items-center gap-6">
            <div
              ref={qrRef}
              className="p-3 bg-white rounded-xl shadow-lg shrink-0 flex items-center justify-center"
            >
              <QRCodeSVG
                value={publicUrl}
                size={130}
                level="M"
                includeMargin={false}
              />
            </div>

            <div className="space-y-2.5 text-center sm:text-left rtl:sm:text-right">
              <div>
                <h4 className="text-sm font-bold text-foreground">
                  {isArabic ? 'رمز الاستجابة السريعة (QR Code)' : 'Scan with Mobile Camera'}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {isArabic
                    ? 'مثالي للعروض التقديمية، البوسترات، والفعاليات الحضورية'
                    : 'Perfect for presentations, event slides, and printed posters'}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleDownloadQR}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-foreground text-xs font-medium flex items-center gap-1.5 transition-colors border border-white/10"
                >
                  <Download className="w-3.5 h-3.5" />
                  {isArabic ? 'تحميل كصورة (PNG)' : 'Download PNG'}
                </button>

                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary text-xs font-medium flex items-center gap-1.5 transition-colors border border-primary/30"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  {isArabic ? 'فتح النموذج الآن' : 'Open Live'}
                </a>
              </div>
            </div>
          </div>

          {/* Audience Summary Badge */}
          <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs text-muted-foreground">
            <span>{isArabic ? 'حالة النموذج:' : 'Form Status:'}</span>
            <span className="font-semibold text-emerald-400">
              {isArabic ? 'منشور وجاهز لاستقبال الردود' : 'Published & Accepting Responses'}
            </span>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 text-foreground text-xs font-semibold hover:bg-white/20 transition-colors"
          >
            {isArabic ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
