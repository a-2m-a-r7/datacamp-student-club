import { Dialog } from '../../../components/ui/Dialog';
import { watchQuery } from '../../../lib/watchQuery';
import { authenticatedPost } from '../../../lib/apiClient';
/**
 * src/pages/admin/forms/FormResponses.tsx
 * Admin Responses & Analytics hub: Summary Charts, Individual Table, Realtime, Excel Export, Print/PDF
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, BarChart3, ListFilter, Download, Printer,
  Trash2, RefreshCw, FileSpreadsheet, Search, Calendar,
  CheckCircle2, AlertCircle, Clock, ExternalLink, Eye,
  X, Sparkles, Loader2, Star, UserCheck, Users
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { FormRecord, FormQuestion, FormResponse } from '../../../types/forms';
import { formService } from '../../../services/formService';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase';
import { useLanguage } from '../../../contexts/LanguageContext';

const PIE_COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6'];

export const FormResponses: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isArabic } = useLanguage();
  const printRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState<FormRecord | null>(null);
  const [questions, setQuestions] = useState<FormQuestion[]>([]);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'summary' | 'individual'>('summary');

  // Filters & detail inspection
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResponse, setSelectedResponse] = useState<FormResponse | null>(null);
  const [isResyncing, setIsResyncing] = useState(false);

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const formData = await formService.getFormById(id);
      if (formData) {
        setForm(formData.form);
        setQuestions(formData.questions);
      }
      const respData = await formService.getFormResponses(id);
      setResponses(respData);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load response data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  useEffect(() => {
    if (!id || !isSupabaseConfigured) return;
    return watchQuery(() => formService.getFormResponses(id), setResponses, refresh => {
      const channel = supabase.channel('form-responses-' + id)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'form_responses', filter: 'form_id=eq.' + id }, refresh).subscribe();
      return () => { supabase.removeChannel(channel); };
    }, false);
  }, [id]);

  // Delete Response handler
  const handleDeleteResponse = async (responseId: string) => {
    if (!window.confirm(isArabic ? 'هل أنت متأكد من حذف هذه الاستجابة؟' : 'Delete this response?')) return;
    try {
      await formService.deleteResponse(responseId);
      toast.success(isArabic ? 'تم حذف الاستجابة' : 'Response deleted');
      setResponses((prev) => prev.filter((r) => r.id !== responseId));
      if (selectedResponse?.id === responseId) setSelectedResponse(null);
    } catch (err: any) {
      toast.error(err.message || 'Delete failed');
    }
  };

  // Trigger Google Sheets Resync
  const handleResyncAll = async () => {
 if (!form || isResyncing) return; setIsResyncing(true);
 try {
  const data = await authenticatedPost('/api/forms/sync-sheet', { formId: form.id, resyncAll: true });
  if (!data.spreadsheetUrl) throw new Error('Sync returned no spreadsheet');
  setForm(prev => prev ? { ...prev, spreadsheet_url: data.spreadsheetUrl, spreadsheet_id: data.spreadsheetId } : null);
  toast.success(isArabic ? 'تمت المزامنة' : 'Google Sheets synced');
 } catch (err: any) { toast.error(err.message || 'Sync failed'); }
 finally { setIsResyncing(false); }
};

  // Export to Excel (.xlsx) using xlsx library
  const handleExportExcel = () => {
    if (!form || responses.length === 0) {
      toast.warning(isArabic ? 'لا توجد بيانات لتصديرها' : 'No responses to export');
      return;
    }

    try {
      const questionCols = questions.filter((q) => q.type !== 'section_header');

      // Create headers
      const headers = [
        'Submission ID',
        'Submitted At (UTC)',
        'Respondent Email',
        ...questionCols.map((q) => q.title),
      ];

      // Build data rows
      const rows = responses.map((r) => {
        const rowData: Record<string, any> = {
          'Submission ID': r.id,
          'Submitted At (UTC)': new Date(r.submitted_at).toISOString(),
          'Respondent Email': r.respondent_email || r.respondent_profile?.email || 'Anonymous',
        };

        questionCols.forEach((q) => {
          const answerObj = r.answers?.find((a) => a.question_id === q.id);
          let val = answerObj?.value;
          if (Array.isArray(val)) {
            val = val.join(', ');
          } else if (typeof val === 'object' && val !== null) {
            val = val.url || JSON.stringify(val);
          }
          rowData[q.title] = val !== undefined && val !== null ? val : '';
        });

        return rowData;
      });

      const worksheet = XLSX.utils.json_to_sheet(rows, { header: headers });

      // Auto-fit column widths
      const colWidths = headers.map((col) => {
        const maxLen = Math.max(
          col.length,
          ...rows.map((row) => String(row[col] || '').length)
        );
        return { wch: Math.min(Math.max(maxLen + 4, 12), 50) };
      });
      worksheet['!cols'] = colWidths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Responses');

      const fileName = `${form.slug}-responses-${new Date().toISOString().substring(0, 10)}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      toast.success(isArabic ? 'تم تحميل ملف Excel بنجاح!' : 'Excel workbook downloaded!');
    } catch (err: any) {
      console.error(err);
      toast.error('Export to Excel failed');
    }
  };

  // Print / Save as PDF handler
  const handlePrint = () => {
    window.print();
  };

  // Filtered responses for individual table
  const filteredResponses = useMemo(() => {
    if (!searchQuery.trim()) return responses;
    const q = searchQuery.toLowerCase();
    return responses.filter((r) => {
      const email = (r.respondent_email || r.respondent_profile?.email || '').toLowerCase();
      const name = (r.respondent_profile?.full_name || '').toLowerCase();
      const hasAnswerMatch = r.answers?.some((a) =>
        String(a.value || '').toLowerCase().includes(q)
      );
      return email.includes(q) || name.includes(q) || hasAnswerMatch;
    });
  }, [responses, searchQuery]);

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-xs text-muted-foreground font-mono">
          {isArabic ? 'جاري تحميل الردود والتحليلات...' : 'LOADING_ANALYTICS...'}
        </p>
      </div>
    );
  }

  if (!form) return null;

  return (
    <div className="space-y-6 print:space-y-4" ref={printRef}>
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center space-x-3 rtl:space-x-reverse min-w-0">
          <Link
            to="/admin/forms"
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors shrink-0"
          >
            <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-bold font-cyber text-foreground truncate max-w-xl">
              {form.title} — {isArabic ? 'الردود والتحليلات' : 'Responses & Analytics'}
            </h1>
            <p className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
              <span>{responses.length} {isArabic ? 'استجابة مسجلة' : 'total responses'}</span>
              <span>•</span>
              <span className="font-mono text-primary">/f/{form.slug}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons: Google Sheets, Excel Export, Print, Resync */}
        <div className="flex flex-wrap items-center gap-2">
          {form.spreadsheet_url && (
            <a
              href={form.spreadsheet_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{isArabic ? 'فتح Google Sheet' : 'Open Sheet'}</span>
            </a>
          )}

          <button
            type="button"
            disabled={isResyncing}
            onClick={handleResyncAll}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-foreground border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            title={isArabic ? 'إعادة مزامنة كافة الردود مع Google Sheets' : 'Resync all rows'}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResyncing ? 'animate-spin text-primary' : ''}`} />
            <span>{isArabic ? 'مزامنة السحابة' : 'Resync'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportExcel}
            className="px-3.5 py-2 rounded-xl bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isArabic ? 'تصدير Excel (.xlsx)' : 'Export Excel'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-foreground border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{isArabic ? 'طباعة / PDF' : 'Print / PDF'}</span>
          </button>
        </div>
      </div>

      {/* Printable Header (Visible only on print) */}
      <div className="hidden print:block border-b pb-4 mb-4">
        <h1 className="text-2xl font-bold text-black">{form.title}</h1>
        <p className="text-sm text-gray-600">
          DataCamp Club Survey Report • Total Responses: {responses.length} • Generated on {new Date().toLocaleString()}
        </p>
      </div>

      {/* Tabs Selector: Summary vs Individual */}
      <div className="flex items-center space-x-2 rtl:space-x-reverse border-b border-white/10 pb-2 print:hidden">
        <button
          onClick={() => setActiveTab('summary')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'summary'
              ? 'bg-primary text-white shadow-lg shadow-primary/25'
              : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>{isArabic ? 'الملخص البياني والإحصائيات' : 'Summary & Analytics'}</span>
        </button>

        <button
          onClick={() => setActiveTab('individual')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'individual'
              ? 'bg-primary text-white shadow-lg shadow-primary/25'
              : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
          }`}
        >
          <ListFilter className="w-4 h-4" />
          <span>{isArabic ? 'الاستجابات الفردية' : 'Individual Responses'} ({responses.length})</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: SUMMARY CHARTS & QUESTION METRICS                 */}
      {/* ======================================================== */}
      {activeTab === 'summary' && (
        <div className="space-y-6">
          {responses.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-card/30 border border-white/5 glass space-y-3">
              <Users className="w-12 h-12 text-muted-foreground/40 mx-auto" />
              <h3 className="text-base font-bold text-foreground">
                {isArabic ? 'لا توجد ردود مسجلة بعد' : 'No responses yet'}
              </h3>
              <p className="text-xs text-muted-foreground">
                {isArabic
                  ? 'بمجرد أن يبدأ الطلاب في تعبئة هذا النموذج، ستظهر المخططات والإحصائيات هنا فورياً.'
                  : 'As soon as respondents submit entries, charts and metrics will populate in real time.'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {questions
                .filter((q) => q.type !== 'section_header')
                .map((q, qIndex) => {
                  // Collect answers for this question
                  const allAnswersForQ = responses
                    .map((r) => r.answers?.find((a) => a.question_id === q.id)?.value)
                    .filter((v) => v !== undefined && v !== null && v !== '');

                  return (
                    <div
                      key={q.id}
                      className="bg-card/70 border border-white/10 rounded-2xl p-6 glass shadow-lg space-y-4 print:border-gray-300 print:bg-white print:text-black"
                    >
                      {/* Question Title & Response Count */}
                      <div className="flex items-start justify-between gap-4 border-b border-white/5 pb-3">
                        <div>
                          <span className="text-[10px] font-mono font-bold text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20 mr-2 rtl:ml-2">
                            #{qIndex + 1}
                          </span>
                          <span className="text-sm md:text-base font-bold text-foreground print:text-black">
                            {q.title}
                          </span>
                          {q.description && (
                            <p className="text-xs text-muted-foreground mt-0.5">{q.description}</p>
                          )}
                        </div>
                        <span className="text-xs font-mono text-muted-foreground shrink-0">
                          {allAnswersForQ.length} {isArabic ? 'رد' : 'answers'}
                        </span>
                      </div>

                      {/* Dynamic Visualization according to type */}
                      {(q.type === 'single_choice' ||
                        q.type === 'multiple_choice' ||
                        q.type === 'dropdown') && (
                        (() => {
                          // Aggregate counts for options
                          const counts: Record<string, number> = {};
                          (q.options || []).forEach((opt) => (counts[opt.text] = 0));

                          allAnswersForQ.forEach((val) => {
                            if (Array.isArray(val)) {
                              val.forEach((item) => {
                                counts[item] = (counts[item] || 0) + 1;
                              });
                            } else if (typeof val === 'string') {
                              counts[val] = (counts[val] || 0) + 1;
                            }
                          });

                          const chartData = Object.entries(counts).map(([name, count]) => ({
                            name,
                            count,
                            percentage: allAnswersForQ.length
                              ? Math.round((count / allAnswersForQ.length) * 100)
                              : 0,
                          }));

                          return (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center pt-2">
                              {/* Horizontal Bar Breakdown */}
                              <div className="space-y-3">
                                {chartData.map((item, idx) => (
                                  <div key={item.name} className="space-y-1">
                                    <div className="flex justify-between text-xs font-medium">
                                      <span className="text-foreground truncate max-w-[200px]">
                                        {item.name}
                                      </span>
                                      <span className="text-muted-foreground font-mono">
                                        {item.count} ({item.percentage}%)
                                      </span>
                                    </div>
                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                      <div
                                        className="h-full rounded-full transition-all"
                                        style={{
                                          width: `${item.percentage}%`,
                                          backgroundColor: PIE_COLORS[idx % PIE_COLORS.length],
                                        }}
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Pie Chart Representation */}
                              <div className="h-52 w-full flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                  <PieChart>
                                    <Pie
                                      data={chartData}
                                      dataKey="count"
                                      nameKey="name"
                                      cx="50%"
                                      cy="50%"
                                      outerRadius={75}
                                      innerRadius={45}
                                      paddingAngle={3}
                                    >
                                      {chartData.map((entry, index) => (
                                        <Cell
                                          key={`cell-${index}`}
                                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                                        />
                                      ))}
                                    </Pie>
                                    <Tooltip
                                      contentStyle={{
                                        backgroundColor: '#0f172a',
                                        borderColor: '#334155',
                                        borderRadius: '8px',
                                        fontSize: '12px',
                                      }}
                                    />
                                  </PieChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                          );
                        })()
                      )}

                      {/* Rating / Linear Scale Score Analytics */}
                      {(q.type === 'rating' || q.type === 'linear_scale') && (
                        (() => {
                          const numericVals = allAnswersForQ
                            .map((v) => Number(v))
                            .filter((v) => !isNaN(v));
                          const avg = numericVals.length
                            ? (numericVals.reduce((a, b) => a + b, 0) / numericVals.length).toFixed(1)
                            : '0';

                          return (
                            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-white/5">
                              <div className="text-center sm:text-left rtl:sm:text-right shrink-0">
                                <p className="text-3xl font-black font-cyber text-amber-400">
                                  {avg}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {isArabic ? 'متوسط التقييم العام' : 'Average Score'}
                                </p>
                              </div>
                              <div className="flex-1 w-full flex items-center gap-2">
                                <div className="flex items-center text-amber-400 gap-1">
                                  {Array.from({ length: q.settings?.maxRating || 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-5 h-5 ${
                                        i < Math.round(Number(avg))
                                          ? 'fill-amber-400'
                                          : 'fill-transparent text-white/20'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                          );
                        })()
                      )}

                      {/* Text Answers List */}
                      {(q.type === 'short_text' ||
                        q.type === 'long_text' ||
                        q.type === 'email' ||
                        q.type === 'number') && (
                        <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar p-1">
                          {allAnswersForQ.length === 0 ? (
                            <p className="text-xs text-muted-foreground italic">
                              {isArabic ? 'لا توجد إجابات نصية' : 'No text answers recorded'}
                            </p>
                          ) : (
                            allAnswersForQ.map((ans, aIdx) => (
                              <div
                                key={aIdx}
                                className="p-2.5 rounded-lg bg-white/5 border border-white/5 text-xs text-foreground"
                              >
                                {String(ans)}
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: INDIVIDUAL RESPONSES TABLE                        */}
      {/* ======================================================== */}
      {activeTab === 'individual' && (
        <div className="space-y-4">
          {/* Search Table */}
          <div className="flex items-center justify-between gap-4 bg-card/40 p-3 rounded-2xl border border-white/5 glass">
            <div className="relative w-full max-w-sm">
              <Search className="w-4 h-4 absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isArabic ? 'بحث في الردود والبريد...' : 'Search by email or answer...'}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 rtl:pl-4 rtl:pr-9 py-2 text-xs text-foreground focus:outline-none focus:border-primary/40 transition-colors"
              />
            </div>

            <span className="text-xs text-muted-foreground font-mono">
              {filteredResponses.length} {isArabic ? 'من' : 'of'} {responses.length}
            </span>
          </div>

          {/* Table */}
          <div className="rounded-2xl border border-white/10 bg-card/60 overflow-hidden shadow-xl glass">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left rtl:text-right">
                <thead className="bg-white/5 border-b border-white/10 text-muted-foreground uppercase font-semibold">
                  <tr>
                    <th className="p-3.5">#</th>
                    <th className="p-3.5">{isArabic ? 'المشارك' : 'Respondent'}</th>
                    <th className="p-3.5">{isArabic ? 'التاريخ والوقت' : 'Submitted At'}</th>
                    <th className="p-3.5">{isArabic ? 'المزامنة' : 'Sync Status'}</th>
                    <th className="p-3.5 text-right rtl:text-left">{isArabic ? 'إجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredResponses.map((resp, idx) => (
                    <tr
                      key={resp.id}
                      className="hover:bg-white/5 transition-colors group cursor-pointer"
                      onClick={() => setSelectedResponse(resp)}
                    >
                      <td className="p-3.5 font-mono text-muted-foreground">{idx + 1}</td>
                      <td className="p-3.5 font-medium text-foreground">
                        <div>
                          <p className="font-semibold text-foreground">
                            {resp.respondent_profile?.full_name || resp.respondent_email || (isArabic ? 'مجهول (Anonymous)' : 'Anonymous')}
                          </p>
                          {resp.respondent_email && (
                            <p className="text-[11px] text-muted-foreground">{resp.respondent_email}</p>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 text-muted-foreground">
                        {new Date(resp.submitted_at).toLocaleString()}
                      </td>
                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{isArabic ? 'متزامن' : 'Synced'}</span>
                        </span>
                      </td>
                      <td className="p-3.5 text-right rtl:text-left">
                        <div className="flex items-center justify-end rtl:justify-start gap-1" onClick={(e) => e.stopPropagation()}>
                          <button aria-label={isArabic ? 'عرض التفاصيل' : 'View Details'}
                            type="button"
                            onClick={() => setSelectedResponse(resp)}
                            className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors"
                            title={isArabic ? 'عرض التفاصيل' : 'View Details'}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button aria-label={isArabic ? 'حذف الاستجابة' : 'Delete Response'}
                            type="button"
                            onClick={() => handleDeleteResponse(resp.id)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title={isArabic ? 'حذف الاستجابة' : 'Delete Response'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* INDIVIDUAL RESPONSE DETAIL MODAL                         */}
      {/* ======================================================== */}
      {selectedResponse && (
        <Dialog onClose={() => setSelectedResponse(null)} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-2xl bg-card border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl glass max-h-[85vh] overflow-y-auto custom-scrollbar space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <h3 className="text-lg font-bold font-cyber text-foreground">
                  {isArabic ? 'تفاصيل الاستجابة الفردية' : 'Individual Response Sheet'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {new Date(selectedResponse.submitted_at).toLocaleString()} • {selectedResponse.respondent_email || 'Anonymous'}
                </p>
              </div>
              <button aria-label="Close"
                onClick={() => setSelectedResponse(null)}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Questions & Answers Breakdown */}
            <div className="space-y-4">
              {questions
                .filter((q) => q.type !== 'section_header')
                .map((q, qIdx) => {
                  const ans = selectedResponse.answers?.find((a) => a.question_id === q.id);
                  let displayVal = ans?.value;
                  if (Array.isArray(displayVal)) {
                    displayVal = displayVal.join(', ');
                  } else if (typeof displayVal === 'object' && displayVal !== null) {
                    displayVal = displayVal.name || displayVal.url || JSON.stringify(displayVal);
                  }

                  return (
                    <div key={q.id} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1.5">
                      <p className="text-xs font-semibold text-muted-foreground">
                        #{qIdx + 1}: {q.title}
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {displayVal !== undefined && displayVal !== null && displayVal !== '' ? (
                          String(displayVal)
                        ) : (
                          <span className="text-muted-foreground/50 italic">
                            {isArabic ? 'بدون إجابة' : 'No answer provided'}
                          </span>
                        )}
                      </p>
                      {q.type === 'file_upload' && ans?.value?.path && <button
                        className="text-primary underline text-sm" onClick={async () => {
                          try {
                            const { data, error } = await supabase.storage.from('form-attachments').createSignedUrl(ans.value.path, 60);
                            if (error || !data?.signedUrl) throw error || new Error('File unavailable');
                            window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
                          } catch (err: any) { toast.error(err.message || 'Unable to open attachment'); }
                        }}>{isArabic ? 'فتح الملف المرفق' : 'Open attachment'}</button>}
                    </div>
                  );
                })}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => handleDeleteResponse(selectedResponse.id)}
                className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isArabic ? 'حذف هذه الاستجابة' : 'Delete Response'}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedResponse(null)}
                className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-foreground transition-colors"
              >
                {isArabic ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};
