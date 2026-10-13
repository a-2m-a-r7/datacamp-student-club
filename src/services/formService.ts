/**
 * src/services/formService.ts
 * Data access service for Form Builder, responses, attachments, and submissions.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { FormRecord, FormQuestion, FormResponse, FormStatus, ChoiceOption, QuestionSettings } from '../types/forms';

export const formService = {
 async saveForm(form: FormRecord, questions: FormQuestion[]) {
  if (!isSupabaseConfigured) throw new Error('Database is not configured.');
  const { data, error } = await supabase.rpc('save_form', { p_form: form, p_questions: questions });
  if (error) throw error; if (!data?.form) throw new Error('Form was not saved.');
  return data as { form: FormRecord; questions: FormQuestion[] };
 },
  /**
   * Fetch all forms for the admin list
   */
  async getForms(): Promise<FormRecord[]> {
    if (!isSupabaseConfigured) { return []; }

    try {
      const { data, error } = await supabase
        .from('forms')
        .select('*, form_responses(count)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((row: any) => ({
        ...row,
        theme: typeof row.theme === 'string' ? JSON.parse(row.theme) : row.theme || {},
        response_count: row.form_responses?.[0]?.count ?? 0,
      }));
    } catch (err) { throw err; }
  },

  /**
   * Fetch a single form by its ID
   */
  async getFormById(id: string): Promise<{ form: FormRecord; questions: FormQuestion[] } | null> {
    if (!isSupabaseConfigured) { return null; }

    try {
      const { data: form, error: formError } = await supabase
        .from('forms')
        .select('*')
        .eq('id', id)
        .single();

      if (formError || !form) throw formError || new Error('Form not found');

      const { data: questions, error: qError } = await supabase
        .from('form_questions')
        .select('*')
        .eq('form_id', id)
        .order('position', { ascending: true });

      if (qError) throw qError;

      const formattedForm: FormRecord = {
        ...form,
        theme: typeof form.theme === 'string' ? JSON.parse(form.theme) : form.theme || {},
      };

      const formattedQuestions: FormQuestion[] = (questions || []).map((q: any) => ({
        ...q,
        options: Array.isArray(q.options) ? q.options : [],
        settings: typeof q.settings === 'object' && q.settings !== null ? q.settings : {},
      }));

      return { form: formattedForm, questions: formattedQuestions };
    } catch (err) { throw err; }
  },

  /**
   * Fetch a published form by slug for public respondent page
   */
  async getFormBySlug(slug: string): Promise<{ form: FormRecord; questions: FormQuestion[] } | null> {
    if (!isSupabaseConfigured) { return null; }

    try {
      const { data: form, error: formError } = await supabase
        .from('forms')
        .select('*')
        .eq('slug', slug)
        .single();

      if (formError || !form) throw formError || new Error('Form not found');

      const { data: questions, error: qError } = await supabase
        .from('form_questions')
        .select('*')
        .eq('form_id', form.id)
        .order('position', { ascending: true });

      if (qError) throw qError;

      const formattedForm: FormRecord = {
        ...form,
        theme: typeof form.theme === 'string' ? JSON.parse(form.theme) : form.theme || {},
      };

      const formattedQuestions: FormQuestion[] = (questions || []).map((q: any) => ({
        ...q,
        options: Array.isArray(q.options) ? q.options : [],
        settings: typeof q.settings === 'object' && q.settings !== null ? q.settings : {},
      }));

      return { form: formattedForm, questions: formattedQuestions };
    } catch (err) { throw err; }
  },

  /**
   * Create a new form
   */
  async createForm(formPayload: Partial<FormRecord>, initialQuestions: FormQuestion[] = []): Promise<FormRecord> {
 if (!isSupabaseConfigured) throw new Error('Database is not configured.');
 const remap = new Map(initialQuestions.map(q => [q.id, formPayload.id ? crypto.randomUUID() : (q.id || crypto.randomUUID())]));
 const questions = initialQuestions.map(q => ({ ...q, id: remap.get(q.id), options: (q.options || []).map(o => ({ ...o, ...(o.goToQuestionId ? { goToQuestionId: remap.get(o.goToQuestionId) || o.goToQuestionId } : {}) })) }));
 const payload = { ...formPayload, id: '', slug: formPayload.slug?.trim() || 'form-' + crypto.randomUUID() };
 const { data, error } = await supabase.rpc('save_form', { p_form: payload, p_questions: questions });
 if (error) throw error; if (!data?.form) throw new Error('Form was not saved.');
 return data.form;
},

  /**
   * Update an existing form
   */
  async updateForm(id: string, updates: Partial<FormRecord>): Promise<FormRecord> {
    if (!isSupabaseConfigured) { throw new Error('Database is not configured. No changes were saved.'); }

    const { data, error } = await supabase
      .from('forms')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return {
      ...data,
      theme: typeof data.theme === 'string' ? JSON.parse(data.theme) : data.theme,
    };
  },

  /**
   * Save questions for a form (atomic replace of questions order and properties)
   */
  async saveFormQuestions(formId: string, questions: FormQuestion[]): Promise<FormQuestion[]> {
 if (!isSupabaseConfigured) throw new Error('Database is not configured.');
 const { data, error } = await supabase.rpc('save_form_questions', { p_form_id: formId, p_questions: questions });
 if (error) throw error;
 return data || [];
},

  /**
   * Duplicate a form with all its questions
   */
  async duplicateForm(formId: string): Promise<FormRecord> {
    const existing = await this.getFormById(formId);
    if (!existing) throw new Error('Source form not found');

    const copyTitle = `${existing.form.title} (Copy)`;
    const copySlug = `${existing.form.slug}-copy-${Date.now().toString(36)}`;

    return await this.createForm(
      {
        ...existing.form,
        title: copyTitle,
        slug: copySlug,
        status: 'draft',
        spreadsheet_id: null,
        spreadsheet_url: null,
      },
      existing.questions
    );
  },

  /**
   * Delete a form
   */
  async deleteForm(id: string): Promise<void> {
    if (!isSupabaseConfigured) { throw new Error('Database is not configured. No changes were saved.'); }

    const { error } = await supabase.from('forms').delete().eq('id', id);
    if (error) throw error;
  },

  /**
   * Fetch all responses for a form (Admin view)
   */
  async getFormResponses(formId: string): Promise<FormResponse[]> {
    if (!isSupabaseConfigured) { return []; }

    try {
      const { data, error } = await supabase
        .from('form_responses')
        .select(`
          id,
          form_id,
          respondent_id,
          respondent_email,
          submitted_at,
          metadata,
          form_answers (
            question_id,
            value
          ),
          profiles:respondent_id (
            full_name,
            avatar_url,
            email
          )
        `)
        .eq('form_id', formId)
        .order('submitted_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((row: any) => ({
        id: row.id,
        form_id: row.form_id,
        respondent_id: row.respondent_id,
        respondent_email: row.respondent_email,
        submitted_at: row.submitted_at,
        metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata || {},
        answers: row.form_answers || [],
        respondent_profile: row.profiles
          ? {
              full_name: row.profiles.full_name,
              avatar_url: row.profiles.avatar_url,
              email: row.profiles.email,
            }
          : undefined,
      }));
    } catch (err) { throw err; }
  },

  /**
   * Delete a single response
   */
  async deleteResponse(responseId: string): Promise<void> {
    if (!isSupabaseConfigured) { throw new Error('Database is not configured. No changes were saved.'); }

    const { error } = await supabase.from('form_responses').delete().eq('id', responseId);
    if (error) throw error;
  },

  /**
   * Check if current user has already responded to a form
   */
  async checkHasUserResponded(formId: string, email?: string): Promise<boolean> {
    if (!isSupabaseConfigured) { throw new Error('Database is not configured.'); }

    try {
      const { data, error } = await supabase.rpc('has_user_responded', {
        p_form_id: formId,
        p_email: email || null,
      });

      if (error) throw error;
      return Boolean(data);
    } catch (err) {
      console.warn('[formService.checkHasUserResponded] Check failed:', err);
      return false;
    }
  },

  /**
   * Submit response via atomic database RPC
   */
  async submitResponse(
    formId: string,
    answers: { question_id: string; value: any }[],
    respondentEmail?: string,
    metadata: any = {}
  ): Promise<{ success: boolean; response_id: string; success_message: string; sheets_sync_enabled: boolean }> {
    if (!isSupabaseConfigured) { throw new Error('Database is not configured. No changes were saved.'); }

    const { data } = await supabase.auth.getSession();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (data.session) headers.Authorization = `Bearer ${data.session.access_token}`;
    const response = await fetch('/api/forms/submit', {
      method: 'POST', cache: 'no-store', headers,
      body: JSON.stringify({ formId, answers, respondentEmail, metadata }),
    });
    const result = await response.json().catch(() => null);
    if (!response.ok || !result?.success || !result.response_id) throw new Error(result?.error || 'Submission failed.');
    return result;
  },

  /**
   * Upload attachment to Supabase Storage
   */
  async uploadAttachment(formId: string, file: File): Promise<{ url: string; path: string; name: string; size: number }> {
    if (!isSupabaseConfigured) { throw new Error('Database is not configured. No changes were saved.'); }
    if (file.size > 10 * 1024 * 1024) throw new Error('Maximum attachment size is 10 MB.');
    if (!['image/png', 'image/jpeg', 'image/webp', 'application/pdf', 'text/plain'].includes(file.type)) throw new Error('This attachment type is not supported.');

    const fileExt = file.name.split('.').pop();
    const fileName = `${formId}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('form-attachments')
      .upload(fileName, file, { cacheControl: '0', upsert: false });

    if (uploadError) throw uploadError;

    return {
      url: fileName,
      path: fileName,
      name: file.name,
      size: file.size,
    };
  },
};
