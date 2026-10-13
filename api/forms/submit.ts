import { createClient } from '@supabase/supabase-js';
import syncSheet, { internalSubmissionSync } from './sync-sheet.js';

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST.' });
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return res.status(503).json({ error: 'Database is not configured.' });
  const { formId, answers, respondentEmail, metadata } = req.body || {};
  if (typeof formId !== 'string' || !Array.isArray(answers) || answers.length > 200
    || JSON.stringify(req.body).length > 1_000_000) return res.status(400).json({ error: 'Invalid submission.' });
  const headers: Record<string, string> = {};
  if (typeof req.headers?.authorization === 'string') headers.Authorization = req.headers.authorization;
  const client = createClient(url, key, { auth: { persistSession: false }, global: { headers } });
  const { data, error } = await client.rpc('submit_form_response', {
    p_form_id: formId, p_answers: answers, p_respondent_email: respondentEmail || null, p_metadata: metadata || {},
  });
  if (error) return res.status(400).json({ error: error.message });
  if (!data?.success || !data.response_id) return res.status(500).json({ error: 'Submission returned no saved response.' });
  // Only a successful, validated database submission can trigger an anonymous sync.
  // Failure to sync never asks respondents to resubmit an already saved answer.
  let syncStatus = 'disabled';
  if (data.sheets_sync_enabled) {
    syncStatus = 'pending';
    if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
      const sink = { code: 200, setHeader() {}, status(code: number) { this.code = code; return this; }, json(result: any) {
        syncStatus = this.code < 300 && result.success ? 'synced' : 'failed'; return result;
      } };
      try {
        await syncSheet({ method: 'POST', body: { formId, responseId: data.response_id }, [internalSubmissionSync]: true }, sink);
      } catch { syncStatus = 'failed'; }
    }
  }
  return res.status(200).json({ ...data, sync_status: syncStatus });
}
