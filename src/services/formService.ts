/**
 * src/services/formService.ts
 * Data access service for Form Builder, responses, attachments, and submissions.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { FormRecord, FormQuestion, FormResponse, FormStatus, ChoiceOption, QuestionSettings } from '../types/forms';

// In-memory mock storage for local testing when Supabase credentials are unset
let mockForms: FormRecord[] = [
  {
    id: 'f-demo-001',
    title: 'DataCamp AI BootCamp 2026 Registration',
    description: 'Welcome to the flagship AI & Data Science BootCamp. Please complete this form to reserve your seat and specify your workshop tracks.',
    slug: 'ai-bootcamp-2026',
    status: 'published',
    theme: {
      primaryColor: '#6366f1',
      accentColor: '#06b6d4',
      backgroundStyle: 'cyber',
      coverImage: null,
    },
    allow_anonymous: true,
    one_response_per_user: true,
    collect_email: true,
    opens_at: null,
    closes_at: null,
    success_message: 'Your registration has been submitted successfully! See you at the BootCamp.',
    sheets_sync_enabled: true,
    spreadsheet_id: 'mock-sheet-123',
    spreadsheet_url: 'https://docs.google.com/spreadsheets/d/mock-sheet-123/edit',
    created_by: 'usr_ammar_tahoun_adm',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    response_count: 14,
  },
  {
    id: 'f-demo-002',
    title: 'Member Feedback & Course Requests Q1',
    description: 'Help us shape the upcoming tracks by sharing your thoughts on our latest machine learning workshops.',
    slug: 'q1-member-feedback',
    status: 'draft',
    theme: {
      primaryColor: '#ec4899',
      accentColor: '#8b5cf6',
      backgroundStyle: 'glow',
      coverImage: null,
    },
    allow_anonymous: false,
    one_response_per_user: true,
    collect_email: true,
    opens_at: null,
    closes_at: null,
    success_message: 'Thank you for your valuable feedback!',
    sheets_sync_enabled: false,
    spreadsheet_id: null,
    spreadsheet_url: null,
    created_by: 'usr_ammar_tahoun_adm',
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    updated_at: new Date().toISOString(),
    response_count: 0,
  },
];

let mockQuestions: Record<string, FormQuestion[]> = {
  'f-demo-001': [
    {
      id: 'q-1',
      form_id: 'f-demo-001',
      type: 'short_text',
      title: 'Full Name',
      description: 'As you want it printed on your certificate of attendance',
      required: true,
      position: 0,
      options: [],
      settings: { placeholder: 'e.g. Alex Turing' },
    },
    {
      id: 'q-2',
      form_id: 'f-demo-001',
      type: 'email',
      title: 'University / Personal Email',
      description: 'We will send confirmation details and workshop materials here',
      required: true,
      position: 1,
      options: [],
      settings: { placeholder: 'you@university.edu' },
    },
    {
      id: 'q-3',
      form_id: 'f-demo-001',
      type: 'single_choice',
      title: 'Experience Level in Machine Learning',
      description: 'Select the option that best reflects your current background',
      required: true,
      position: 2,
      options: [
        { id: 'opt-1', text: 'Beginner (Basic Python syntax, no ML experience)' },
        { id: 'opt-2', text: 'Intermediate (Scikit-Learn, Pandas, basic models)' },
        { id: 'opt-3', text: 'Advanced (PyTorch, Deep Learning, LLM fine-tuning)' },
      ],
      settings: {},
    },
    {
      id: 'q-4',
      form_id: 'f-demo-001',
      type: 'multiple_choice',
      title: 'Workshops You Plan to Attend',
      description: 'Choose all tracks that interest you',
      required: false,
      position: 3,
      options: [
        { id: 'opt-w1', text: 'Prompt Engineering & Agentic AI with Gemini' },
        { id: 'opt-w2', text: 'Computer Vision with YOLOv11' },
        { id: 'opt-w3', text: 'Data Engineering with DuckDB & dbt' },
        { id: 'opt-w4', text: 'MLOps & Model Deployment with Docker' },
      ],
      settings: {},
    },
    {
      id: 'q-5',
      form_id: 'f-demo-001',
      type: 'rating',
      title: 'How excited are you for the BootCamp?',
      description: '',
      required: false,
      position: 4,
      options: [],
      settings: { ratingIcon: 'star', maxRating: 5 },
    },
    {
      id: 'q-6',
      form_id: 'f-demo-001',
      type: 'long_text',
      title: 'Any specific questions or topics you would like covered?',
      description: 'Optional',
      required: false,
      position: 5,
      options: [],
      settings: { placeholder: 'Write your thoughts here...' },
    },
  ],
};

let mockResponses: Record<string, FormResponse[]> = {
  'f-demo-001': [
    {
      id: 'resp-001',
      form_id: 'f-demo-001',
      respondent_id: 'usr-sara-01',
      respondent_email: 'sara@example.com',
      submitted_at: new Date(Date.now() - 3600000 * 5).toISOString(),
      metadata: { browser: 'Chrome 122', os: 'Windows 11', completionSeconds: 78 },
      respondent_profile: { full_name: 'Sara Hassan', email: 'sara@example.com' },
      answers: [
        { question_id: 'q-1', value: 'Sara Hassan' },
        { question_id: 'q-2', value: 'sara@example.com' },
        { question_id: 'q-3', value: 'Intermediate (Scikit-Learn, Pandas, basic models)' },
        { question_id: 'q-4', value: ['Prompt Engineering & Agentic AI with Gemini', 'MLOps & Model Deployment with Docker'] },
        { question_id: 'q-5', value: 5 },
        { question_id: 'q-6', value: 'Looking forward to building autonomous agents!' },
      ],
    },
    {
      id: 'resp-002',
      form_id: 'f-demo-001',
      respondent_id: null,
      respondent_email: 'omar.k@gmail.com',
      submitted_at: new Date(Date.now() - 3600000 * 12).toISOString(),
      metadata: { browser: 'Safari 17', os: 'macOS', completionSeconds: 110 },
      respondent_profile: { full_name: 'Omar Khaled', email: 'omar.k@gmail.com' },
      answers: [
        { question_id: 'q-1', value: 'Omar Khaled' },
        { question_id: 'q-2', value: 'omar.k@gmail.com' },
        { question_id: 'q-3', value: 'Beginner (Basic Python syntax, no ML experience)' },
        { question_id: 'q-4', value: ['Prompt Engineering & Agentic AI with Gemini'] },
        { question_id: 'q-5', value: 4 },
        { question_id: 'q-6', value: '' },
      ],
    },
  ],
};

export const formService = {
  /**
   * Fetch all forms for the admin list
   */
  async getForms(): Promise<FormRecord[]> {
    if (!isSupabaseConfigured) {
      return [...mockForms].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

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
    } catch (err) {
      console.warn('[formService.getForms] Falling back to mock data:', err);
      return [...mockForms];
    }
  },

  /**
   * Fetch a single form by its ID
   */
  async getFormById(id: string): Promise<{ form: FormRecord; questions: FormQuestion[] } | null> {
    if (!isSupabaseConfigured) {
      const form = mockForms.find((f) => f.id === id);
      if (!form) return null;
      const questions = mockQuestions[id] || [];
      return { form, questions };
    }

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
    } catch (err) {
      console.warn(`[formService.getFormById] Falling back for ID ${id}:`, err);
      const form = mockForms.find((f) => f.id === id);
      if (!form) return null;
      return { form, questions: mockQuestions[id] || [] };
    }
  },

  /**
   * Fetch a published form by slug for public respondent page
   */
  async getFormBySlug(slug: string): Promise<{ form: FormRecord; questions: FormQuestion[] } | null> {
    if (!isSupabaseConfigured) {
      const form = mockForms.find((f) => f.slug === slug);
      if (!form) return null;
      const questions = mockQuestions[form.id] || [];
      return { form, questions };
    }

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
    } catch (err) {
      console.warn(`[formService.getFormBySlug] Error for slug ${slug}:`, err);
      const form = mockForms.find((f) => f.slug === slug);
      if (!form) return null;
      return { form, questions: mockQuestions[form.id] || [] };
    }
  },

  /**
   * Create a new form
   */
  async createForm(formPayload: Partial<FormRecord>, initialQuestions: FormQuestion[] = []): Promise<FormRecord> {
    const slug =
      formPayload.slug?.trim() ||
      formPayload.title
        ?.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') + `-${Date.now().toString(36)}`;

    if (!isSupabaseConfigured) {
      const newForm: FormRecord = {
        id: `f-${Date.now()}`,
        title: formPayload.title || 'Untitled Form',
        description: formPayload.description || '',
        slug,
        status: formPayload.status || 'draft',
        theme: formPayload.theme || {
          primaryColor: '#6366f1',
          accentColor: '#06b6d4',
          backgroundStyle: 'cyber',
          coverImage: null,
        },
        allow_anonymous: formPayload.allow_anonymous ?? true,
        one_response_per_user: formPayload.one_response_per_user ?? false,
        collect_email: formPayload.collect_email ?? false,
        opens_at: formPayload.opens_at || null,
        closes_at: formPayload.closes_at || null,
        success_message: formPayload.success_message || 'Thank you! Your response has been recorded.',
        sheets_sync_enabled: formPayload.sheets_sync_enabled ?? false,
        spreadsheet_id: null,
        spreadsheet_url: null,
        created_by: formPayload.created_by || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        response_count: 0,
      };

      mockForms.unshift(newForm);
      mockQuestions[newForm.id] = initialQuestions.map((q, idx) => ({
        ...q,
        id: q.id || `q-${Date.now()}-${idx}`,
        form_id: newForm.id,
        position: idx,
      }));

      return newForm;
    }

    const { data: user } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('forms')
      .insert({
        title: formPayload.title || 'Untitled Form',
        description: formPayload.description || '',
        slug,
        status: formPayload.status || 'draft',
        theme: formPayload.theme || {
          primaryColor: '#6366f1',
          accentColor: '#06b6d4',
          backgroundStyle: 'cyber',
        },
        allow_anonymous: formPayload.allow_anonymous ?? true,
        one_response_per_user: formPayload.one_response_per_user ?? false,
        collect_email: formPayload.collect_email ?? false,
        opens_at: formPayload.opens_at || null,
        closes_at: formPayload.closes_at || null,
        success_message: formPayload.success_message || 'Thank you! Your response has been recorded.',
        sheets_sync_enabled: formPayload.sheets_sync_enabled ?? false,
        created_by: user?.user?.id || null,
      })
      .select('*')
      .single();

    if (error) throw error;

    if (initialQuestions.length > 0) {
      const qInserts = initialQuestions.map((q, idx) => ({
        form_id: data.id,
        type: q.type,
        title: q.title,
        description: q.description || '',
        required: q.required ?? false,
        position: idx,
        options: q.options || [],
        settings: q.settings || {},
      }));

      await supabase.from('form_questions').insert(qInserts);
    }

    return {
      ...data,
      theme: typeof data.theme === 'string' ? JSON.parse(data.theme) : data.theme,
      response_count: 0,
    };
  },

  /**
   * Update an existing form
   */
  async updateForm(id: string, updates: Partial<FormRecord>): Promise<FormRecord> {
    if (!isSupabaseConfigured) {
      const idx = mockForms.findIndex((f) => f.id === id);
      if (idx === -1) throw new Error('Form not found');
      mockForms[idx] = {
        ...mockForms[idx],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      return mockForms[idx];
    }

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
    if (!isSupabaseConfigured) {
      mockQuestions[formId] = questions.map((q, idx) => ({
        ...q,
        position: idx,
        form_id: formId,
      }));
      return mockQuestions[formId];
    }

    // Delete existing questions and re-insert in ordered batch
    const { error: delError } = await supabase.from('form_questions').delete().eq('form_id', formId);
    if (delError) throw delError;

    if (questions.length === 0) return [];

    const qInserts = questions.map((q, idx) => ({
      form_id: formId,
      type: q.type,
      title: q.title,
      description: q.description || '',
      required: q.required ?? false,
      position: idx,
      options: q.options || [],
      settings: q.settings || {},
    }));

    const { data, error: insError } = await supabase
      .from('form_questions')
      .insert(qInserts)
      .select('*')
      .order('position', { ascending: true });

    if (insError) throw insError;
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
    if (!isSupabaseConfigured) {
      mockForms = mockForms.filter((f) => f.id !== id);
      delete mockQuestions[id];
      delete mockResponses[id];
      return;
    }

    const { error } = await supabase.from('forms').delete().eq('id', id);
    if (error) throw error;
  },

  /**
   * Fetch all responses for a form (Admin view)
   */
  async getFormResponses(formId: string): Promise<FormResponse[]> {
    if (!isSupabaseConfigured) {
      return mockResponses[formId] || [];
    }

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
    } catch (err) {
      console.warn(`[formService.getFormResponses] Mock fallback for form ${formId}:`, err);
      return mockResponses[formId] || [];
    }
  },

  /**
   * Delete a single response
   */
  async deleteResponse(responseId: string): Promise<void> {
    if (!isSupabaseConfigured) {
      for (const formId in mockResponses) {
        mockResponses[formId] = mockResponses[formId].filter((r) => r.id !== responseId);
      }
      return;
    }

    const { error } = await supabase.from('form_responses').delete().eq('id', responseId);
    if (error) throw error;
  },

  /**
   * Check if current user has already responded to a form
   */
  async checkHasUserResponded(formId: string, email?: string): Promise<boolean> {
    if (!isSupabaseConfigured) {
      const resps = mockResponses[formId] || [];
      if (!email) return false;
      return resps.some((r) => r.respondent_email?.toLowerCase() === email.toLowerCase());
    }

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
    if (!isSupabaseConfigured) {
      const newRespId = `resp-${Date.now()}`;
      const newResponse: FormResponse = {
        id: newRespId,
        form_id: formId,
        respondent_id: null,
        respondent_email: respondentEmail || null,
        submitted_at: new Date().toISOString(),
        metadata,
        answers: answers.map((a) => ({ question_id: a.question_id, value: a.value })),
      };

      if (!mockResponses[formId]) mockResponses[formId] = [];
      mockResponses[formId].unshift(newResponse);

      const form = mockForms.find((f) => f.id === formId);
      if (form) form.response_count = (form.response_count || 0) + 1;

      return {
        success: true,
        response_id: newRespId,
        success_message: form?.success_message || 'Thank you! Your response has been recorded.',
        sheets_sync_enabled: Boolean(form?.sheets_sync_enabled),
      };
    }

    const { data, error } = await supabase.rpc('submit_form_response', {
      p_form_id: formId,
      p_answers: answers,
      p_respondent_email: respondentEmail || null,
      p_metadata: metadata,
    });

    if (error) throw error;
    return data as any;
  },

  /**
   * Upload attachment to Supabase Storage
   */
  async uploadAttachment(formId: string, file: File): Promise<{ url: string; name: string; size: number }> {
    if (!isSupabaseConfigured) {
      return {
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
      };
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${formId}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('form-attachments')
      .upload(fileName, file, { cacheControl: '3600', upsert: false });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage.from('form-attachments').getPublicUrl(fileName);

    return {
      url: urlData.publicUrl,
      name: file.name,
      size: file.size,
    };
  },
};
