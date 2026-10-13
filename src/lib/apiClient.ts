import { isSupabaseConfigured, supabase } from './supabase';

export async function authenticatedPost<T = any>(url: string, payload: unknown): Promise<T> {
  if (!isSupabaseConfigured) throw new Error('Database is not configured.');
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) throw new Error('Sign in again to continue.');
  const response = await fetch(url, {
    method: 'POST', cache: 'no-store',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session.access_token}` },
    body: JSON.stringify(payload),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result || result.success === false) {
    throw new Error(result?.error || result?.message || 'The server could not complete this operation.');
  }
  return result as T;
}
