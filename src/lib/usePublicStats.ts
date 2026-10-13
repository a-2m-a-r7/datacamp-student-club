import { useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from './supabase';

export function usePublicStats() {
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  useEffect(() => {
    let active = true;
    if (isSupabaseConfigured) supabase.rpc('public_stats').then(({ data, error }) => {
      if (active && !error && data) setStats(data);
    });
    return () => { active = false; };
  }, []);
  return stats;
}
