/**
 * src/pages/admin/forms/FormList.tsx
 * Admin management overview of all forms, metrics, filters, and actions
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus, Search, Filter, MoreVertical, Edit, Eye,
  Copy, Share2, Trash2, FileSpreadsheet, ExternalLink,
  Lock, Globe, CheckCircle2, Clock, AlertCircle,
  RefreshCw, BarChart3, Users, Sparkles, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { FormRecord, FormStatus } from '../../../types/forms';
import { formService } from '../../../services/formService';
import { useLanguage } from '../../../contexts/LanguageContext';
import { FormShareModal } from './FormShareModal';

export const FormList: React.FC = () => {
  const navigate = useNavigate();
  const { isArabic } = useLanguage();

  const [forms, setForms] = useState<FormRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | FormStatus>('all');

  // Modals state
  const [selectedFormForShare, setSelectedFormForShare] = useState<FormRecord | null>(null);
  const [deleteConfirmForm, setDeleteConfirmForm] = useState<FormRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadForms = async () => {
    setLoading(true);
    try {
      const data = await formService.getForms();
      setForms(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load forms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadForms();
  }, []);

  // Duplicate handler
  const handleDuplicate = async (form: FormRecord) => {
    try {
      toast.loading(isArabic ? 'جاري تكرار النموذج...' : 'Duplicating form...', { id: 'dup' });
      const duplicated = await formService.duplicateForm(form.id);
      toast.success(isArabic ? 'تم تكرار النموذج بنجاح!' : 'Form duplicated successfully!', { id: 'dup' });
      await loadForms();
      navigate(`/admin/forms/builder/${duplicated.id}`);
    } catch (err: any) {
      toast.error(err.message || 'Duplicate failed', { id: 'dup' });
    }
  };

  // Toggle status (close / reopen)
  const handleToggleStatus = async (form: FormRecord) => {
    const nextStatus: FormStatus = form.status === 'published' ? 'closed' : 'published';
    try {
      await formService.updateForm(form.id, { status: nextStatus });
      toast.success(
        nextStatus === 'published'
          ? isArabic
            ? 'تم فتح واستئناف استقبال الردود'
            : 'Form reopened & published'
          : isArabic
          ? 'تم إغلاق النموذج بنجاح'
          : 'Form closed'
      );
      loadForms();
    } catch (err: any) {
      toast.error(err.message || 'Status update failed');
    }
  };

  // Delete form handler
  const handleDelete = async () => {
    if (!deleteConfirmForm) return;
    setIsDeleting(true);
    try {
      await formService.deleteForm(deleteConfirmForm.id);
      toast.success(isArabic ? 'تم حذف النموذج بنجاح' : 'Form deleted');
      setDeleteConfirmForm(null);
      loadForms();
    } catch (err: any) {
      toast.error(err.message || 'Delete failed');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered forms list
  const filteredForms = forms.filter((f) => {
    const matchesSearch =
      f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || f.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Metrics summary
  const totalResponses = forms.reduce((acc, f) => acc + (f.response_count || 0), 0);
  const publishedCount = forms.filter((f) => f.status === 'published').length;
  const sheetsSyncedCount = forms.filter((f) => f.sheets_sync_enabled).length;

  return (
    <div className="space-y-6">
      {/* Header with Title and Create Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black font-cyber text-foreground flex items-center gap-3">
            <span className="p-2 rounded-xl bg-primary/20 text-primary border border-primary/30">
              <Sparkles className="w-6 h-6" />
            </span>
            <span>{isArabic ? 'إدارة النماذج والاستبيانات' : 'Forms & Surveys Hub'}</span>
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            {isArabic
              ? 'إنشاء استبيانات احترافية على طراز Microsoft Forms ومزامنة فورية مع Google Sheets'
              : 'Microsoft Forms-inspired builder, Supabase RLS security, and instant Google Sheets sync'}
          </p>
        </div>

        <Link
          to="/admin/forms/new"
          className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs md:text-sm flex items-center gap-2 shadow-lg shadow-primary/25 transition-all hover:scale-102 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{isArabic ? '+ نموذج جديد' : '+ New Form'}</span>
        </Link>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-card/60 border border-white/5 glass">
          <p className="text-xs text-muted-foreground font-medium">
            {isArabic ? 'إجمالي النماذج' : 'Total Forms'}
          </p>
          <p className="text-2xl font-black font-cyber text-foreground mt-1">
            {forms.length}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-card/60 border border-white/5 glass">
          <p className="text-xs text-muted-foreground font-medium">
            {isArabic ? 'النماذج النشطة' : 'Active Published'}
          </p>
          <p className="text-2xl font-black font-cyber text-emerald-400 mt-1">
            {publishedCount}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-card/60 border border-white/5 glass">
          <p className="text-xs text-muted-foreground font-medium">
            {isArabic ? 'إجمالي الاستجابات' : 'Total Responses'}
          </p>
          <p className="text-2xl font-black font-cyber text-cyan-400 mt-1">
            {totalResponses}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-card/60 border border-white/5 glass">
          <p className="text-xs text-muted-foreground font-medium">
            {isArabic ? 'متصل بـ Google Sheets' : 'Google Sheets Linked'}
          </p>
          <p className="text-2xl font-black font-cyber text-amber-400 mt-1">
            {sheetsSyncedCount}
          </p>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card/40 border border-white/5 p-3 rounded-2xl glass">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isArabic ? 'البحث عن نموذج أو رابط...' : 'Search by title, description or slug...'}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 rtl:pl-4 rtl:pr-9 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/40 transition-colors"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center space-x-1 rtl:space-x-reverse w-full sm:w-auto overflow-x-auto">
          {(['all', 'published', 'draft', 'closed'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
              }`}
            >
              {st === 'all'
                ? isArabic
                  ? 'الكل'
                  : 'All'
                : st === 'published'
                ? isArabic
                  ? 'المنشورة'
                  : 'Published'
                : st === 'draft'
                ? isArabic
                  ? 'المسودات'
                  : 'Drafts'
                : isArabic
                ? 'المغلقة'
                : 'Closed'}
            </button>
          ))}
        </div>
      </div>

      {/* Forms List Content */}
      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-xs text-muted-foreground font-mono">
            {isArabic ? 'جاري تحميل النماذج...' : 'LOADING_FORMS...'}
          </p>
        </div>
      ) : filteredForms.length === 0 ? (
        /* Empty State */
        <div className="p-12 text-center rounded-3xl bg-card/30 border border-white/5 glass space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto">
            <Sparkles className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-cyber text-foreground">
              {searchQuery || statusFilter !== 'all'
                ? isArabic
                  ? 'لا توجد نتائج مطابقة'
                  : 'No matching forms found'
                : isArabic
                ? 'لا توجد نماذج حتى الآن'
                : 'No forms created yet'}
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
              {isArabic
                ? 'ابدأ بإنشاء أول نموذج أو استبيان وشاركه مع أعضاء النادي أو طلاب الجامعة'
                : 'Create your first Microsoft Forms-inspired survey and start collecting responses'}
            </p>
          </div>
          <Link
            to="/admin/forms/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-lg shadow-primary/20 hover:scale-102 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{isArabic ? 'إنشاء أول نموذج الآن' : 'Create First Form'}</span>
          </Link>
        </div>
      ) : (
        /* Grid of Form Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredForms.map((form) => {
            const isPublished = form.status === 'published';
            const isClosed = form.status === 'closed';

            return (
              <div
                key={form.id}
                className="group relative rounded-2xl border border-white/10 bg-card/60 hover:bg-card/90 hover:border-primary/40 transition-all duration-200 overflow-hidden shadow-lg glass flex flex-col"
              >
                {/* Accent Color Header Line */}
                <div
                  className="h-1.5 w-full"
                  style={{
                    backgroundColor: form.theme?.primaryColor || '#6366f1',
                  }}
                />

                <div className="p-5 flex-1 flex flex-col space-y-3">
                  {/* Status Badge & Created Date */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full border font-bold ${
                        isPublished
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : isClosed
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {form.status}
                    </span>

                    <span className="text-[11px] text-muted-foreground">
                      {new Date(form.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="flex-1">
                    <Link
                      to={`/admin/forms/builder/${form.id}`}
                      className="text-base font-bold text-foreground hover:text-primary transition-colors line-clamp-1 block"
                    >
                      {form.title}
                    </Link>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {form.description || (isArabic ? 'بدون وصف' : 'No description')}
                    </p>
                  </div>

                  {/* Badges Info (Responses & Google Sheets) */}
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-white/5">
                    <Link
                      to={`/admin/forms/${form.id}/responses`}
                      className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors font-medium"
                      title={isArabic ? 'عرض كافة الردود' : 'View responses'}
                    >
                      <Users className="w-3.5 h-3.5 text-cyan-400" />
                      <span>
                        {form.response_count || 0} {isArabic ? 'استجابة' : 'responses'}
                      </span>
                    </Link>

                    {form.sheets_sync_enabled && (
                      <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span>Google Sheets</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Buttons Bar */}
                <div className="bg-white/5 border-t border-white/5 px-4 py-2.5 flex items-center justify-between gap-1 text-xs">
                  <div className="flex items-center space-x-1 rtl:space-x-reverse">
                    {/* Edit Builder */}
                    <Link
                      to={`/admin/forms/builder/${form.id}`}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
                      title={isArabic ? 'تعديل المحتوى' : 'Edit Form'}
                    >
                      <Edit className="w-4 h-4" />
                    </Link>

                    {/* View Responses */}
                    <Link
                      to={`/admin/forms/${form.id}/responses`}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
                      title={isArabic ? 'التحليلات والردود' : 'Responses & Analytics'}
                    >
                      <BarChart3 className="w-4 h-4 text-cyan-400" />
                    </Link>

                    {/* Share Modal */}
                    <button aria-label={isArabic ? 'مشاركة الرابط والـ QR' : 'Share Link & QR'}
                      type="button"
                      onClick={() => setSelectedFormForShare(form)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
                      title={isArabic ? 'مشاركة الرابط والـ QR' : 'Share Link & QR'}
                    >
                      <Share2 className="w-4 h-4 text-primary" />
                    </button>

                    {/* Duplicate */}
                    <button aria-label={isArabic ? 'تكرار النموذج' : 'Duplicate'}
                      type="button"
                      onClick={() => handleDuplicate(form)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
                      title={isArabic ? 'تكرار النموذج' : 'Duplicate'}
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    {/* Open Google Sheet if exists */}
                    {form.spreadsheet_url && (
                      <a
                        href={form.spreadsheet_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                        title={isArabic ? 'فتح جدول Google Sheets' : 'Open Google Sheet'}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>

                  <div className="flex items-center space-x-1 rtl:space-x-reverse">
                    {/* Close / Reopen */}
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(form)}
                      className="px-2 py-1 rounded-lg text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
                    >
                      {form.status === 'published'
                        ? isArabic
                          ? 'إغلاق'
                          : 'Close'
                        : isArabic
                        ? 'إعادة فتح'
                        : 'Reopen'}
                    </button>

                    {/* Delete */}
                    <button aria-label={isArabic ? 'حذف النموذج' : 'Delete'}
                      type="button"
                      onClick={() => setDeleteConfirmForm(form)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title={isArabic ? 'حذف النموذج' : 'Delete'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Share Modal */}
      {selectedFormForShare && (
        <FormShareModal
          isOpen={Boolean(selectedFormForShare)}
          onClose={() => setSelectedFormForShare(null)}
          form={selectedFormForShare}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-card/95 border border-white/10 rounded-2xl p-6 shadow-2xl glass space-y-4">
            <div className="flex items-center space-x-3 rtl:space-x-reverse text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-foreground">
                {isArabic ? 'تأكيد حذف النموذج' : 'Delete Form Confirmation'}
              </h3>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {isArabic
                ? `هل أنت متأكد من رغبتك في حذف النموذج "${deleteConfirmForm.title}"؟ سيتم حذف جميع الأسئلة والردود المرتبطة به نهائياً.`
                : `Are you sure you want to permanently delete "${deleteConfirmForm.title}"? All questions and collected responses will be removed.`}
            </p>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteConfirmForm(null)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-foreground transition-colors"
              >
                {isArabic ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-xs font-semibold text-white transition-colors flex items-center gap-1.5 shadow-lg shadow-rose-500/20"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{isArabic ? 'نعم، حذف نهائي' : 'Yes, Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
