import { isSupabaseConfigured, supabase } from './supabase';

export const logAction = async (action: string, user: string, target?: string, status: 'success' | 'warning' | 'error' = 'success') => {
  if (isSupabaseConfigured) {
    try {
      await supabase.from('audit_logs').insert({
        action,
        user_email: user,
        target: target || '',
        status: status === 'error' ? 'danger' : status,
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.warn('Failed to log action in Supabase:', error);
    }
  }
};

