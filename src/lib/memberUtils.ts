import { isSupabaseConfigured, supabase } from './supabase';

export const generateMemberId = async (existingUsers: any[] = []): Promise<string> => {
  if (isSupabaseConfigured) {
    try {
      const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      const nextNum = (count || 0) + 1;
      return nextNum.toString();
    } catch {
      // Fallback below
    }
  }

  // Fallback: Increment based on existing items in memory or timestamp
  const maxId = existingUsers.reduce((max: number, u: any) => {
    const id = parseInt(u.memberId || u.member_id);
    return (isNaN(id) || !u.memberId) ? max : Math.max(max, id);
  }, 0);

  if (maxId > 0) {
    return (maxId + 1).toString();
  }

  return Date.now().toString().slice(-6);
};

