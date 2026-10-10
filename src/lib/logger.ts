import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseReady } from './firebase';
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
    return;
  }

  if (!isFirebaseReady) {
    return;
  }

  try {
    await addDoc(collection(db, 'audit_logs'), {
      action,
      user,
      target: target || '',
      status,
      timestamp: serverTimestamp(),
      ip: 'INTERNAL'
    });
  } catch (error) {
    console.error('Failed to log action:', error);
  }
};
