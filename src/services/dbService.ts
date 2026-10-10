/**
 * dbService.ts
 * Supabase Database Service - Supplies context data and CRUD operations via PostgreSQL.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';

// ─── Database Status Check ──────────────────────────────────────────────────

export async function checkDatabaseConnection(): Promise<{
  connected: boolean;
  collections: string[];
  error?: string;
}> {
  if (!isSupabaseConfigured) {
    return {
      connected: false,
      collections: [],
      error: 'Supabase not configured in .env',
    };
  }

  try {
    const { data, error } = await supabase.from('profiles').select('id').limit(1);
    if (error) throw error;
    return {
      connected: true,
      collections: ['profiles', 'courses', 'events', 'staff', 'enrollments', 'audit_logs'],
    };
  } catch (err: any) {
    return {
      connected: false,
      collections: [],
      error: err.message || 'Failed to connect to Supabase',
    };
  }
}

// ─── Generic Helpers ────────────────────────────────────────────────────────

export async function getCollectionDocs<T = any>(tableName: string): Promise<T[]> {
  if (!isSupabaseConfigured) return [];
  try {
    const { data, error } = await supabase.from(tableName).select('*');
    if (error) throw error;
    return (data || []) as T[];
  } catch (err) {
    console.warn(`Supabase read error on ${tableName}:`, err);
    return [];
  }
}

export async function getDocById<T = any>(tableName: string, docId: string): Promise<T | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase.from(tableName).select('*').eq('id', docId).maybeSingle();
    if (error) throw error;
    return data as T | null;
  } catch (err) {
    console.warn(`Supabase read error on ${tableName}/${docId}:`, err);
    return null;
  }
}

export async function addCollectionDoc(tableName: string, docData: Record<string, any>): Promise<string | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase.from(tableName).insert(docData).select('id').single();
    if (error) throw error;
    return data?.id || null;
  } catch (err) {
    console.error(`Supabase insert error on ${tableName}:`, err);
    return null;
  }
}

export async function updateCollectionDoc(tableName: string, docId: string, docData: Record<string, any>): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const { error } = await supabase.from(tableName).update(docData).eq('id', docId);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error(`Supabase update error on ${tableName}/${docId}:`, err);
    return false;
  }
}

export async function deleteCollectionDoc(tableName: string, docId: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const { error } = await supabase.from(tableName).delete().eq('id', docId);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error(`Supabase delete error on ${tableName}/${docId}:`, err);
    return false;
  }
}

// ─── AI Context Retrieval (for RAG) ─────────────────────────────────────────

export async function getAIContextData(): Promise<{
  courses: any[];
  events: any[];
  staff: any[];
  settings: any;
  stats: {
    totalUsers: number;
    totalCourses: number;
    totalEvents: number;
  };
}> {
  if (!isSupabaseConfigured) {
    return {
      courses: [],
      events: [],
      staff: [],
      settings: null,
      stats: { totalUsers: 0, totalCourses: 0, totalEvents: 0 },
    };
  }

  try {
    const [coursesRes, eventsRes, staffRes, profilesRes, settingsRes] = await Promise.all([
      supabase.from('courses').select('*').limit(20),
      supabase.from('events').select('*').limit(10),
      supabase.from('staff').select('*').limit(10),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('settings').select('*').limit(1).maybeSingle(),
    ]);

    return {
      courses: coursesRes.data || [],
      events: eventsRes.data || [],
      staff: staffRes.data || [],
      settings: settingsRes.data?.value || null,
      stats: {
        totalUsers: profilesRes.count || 0,
        totalCourses: (coursesRes.data || []).length,
        totalEvents: (eventsRes.data || []).length,
      },
    };
  } catch (err) {
    console.warn('AI context retrieval error:', err);
    return {
      courses: [],
      events: [],
      staff: [],
      settings: null,
      stats: { totalUsers: 0, totalCourses: 0, totalEvents: 0 },
    };
  }
}

// ─── Get User Learning Context for AI ───────────────────────────────────────

export async function getUserLearningContext(userId: string): Promise<{
  enrollments: any[];
  pointsLog: any[];
  achievements: any[];
  certificates: any[];
}> {
  if (!isSupabaseConfigured || !userId) {
    return { enrollments: [], pointsLog: [], achievements: [], certificates: [] };
  }

  try {
    const [enrollRes, pointsRes, achieveRes, certRes] = await Promise.all([
      supabase.from('enrollments').select('*').eq('user_id', userId),
      supabase.from('points_history').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(20),
      supabase.from('user_achievements').select('*').eq('user_id', userId),
      supabase.from('certificates').select('*').eq('user_id', userId),
    ]);

    return {
      enrollments: enrollRes.data || [],
      pointsLog: pointsRes.data || [],
      achievements: achieveRes.data || [],
      certificates: certRes.data || [],
    };
  } catch (err) {
    console.warn('User learning context retrieval error:', err);
    return { enrollments: [], pointsLog: [], achievements: [], certificates: [] };
  }
}
