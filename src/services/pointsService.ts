/**
 * pointsService.ts
 * Supabase-backed points, leaderboard, and achievements operations.
 */

import { isSupabaseConfigured, supabase } from '../lib/supabase';
import {
  PointAction,
  PointsLog,
  POINT_VALUES,
  getLevelFromPoints,
  BADGES_CATALOG,
  UserStats,
  Achievement,
} from '../types';

type Unsubscribe = () => void;

export interface AwardPointsOptions {
  userId: string;
  action: PointAction;
  description: string;
  customPoints?: number;
  referenceId?: string;
  referenceType?: PointsLog['referenceType'];
}

const mapPointsLog = (row: any): PointsLog => ({
  id: row.id,
  userId: row.user_id,
  points: row.points,
  action: row.action,
  description: row.description,
  referenceId: row.reference_id || undefined,
  referenceType: row.reference_type || undefined,
  createdAt: row.created_at,
});

const mapAchievement = (row: any): Achievement => ({
  id: row.id,
  userId: row.user_id,
  badgeId: row.badge_id,
  badgeName: row.badge_name,
  badgeIcon: row.badge_icon,
  badgeColor: row.badge_color,
  description: row.description,
  unlockedAt: row.unlocked_at,
  isNew: Boolean(row.is_new),
});

export const awardPoints = async (opts: AwardPointsOptions): Promise<{ points: number; newTotal: number }> => {
 if (!isSupabaseConfigured) throw new Error('Database is not configured.');
 const { data, error } = await supabase.rpc('award_points', {
  p_user_id: opts.userId, p_action: opts.action, p_description: opts.description,
  p_custom_points: opts.customPoints ?? null, p_reference_id: opts.referenceId ?? null, p_reference_type: opts.referenceType ?? null,
 });
 if (error) throw error;
 if (!data || typeof data.newTotal !== 'number') throw new Error('Points were not saved');
 return data;
};

export const getUserPointsLog = async (userId: string, limitCount = 20): Promise<PointsLog[]> => {
  if (!isSupabaseConfigured) { return []; }

  const { data, error } = await supabase
    .from('points_log')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limitCount);

  if (error) throw error;
  return (data || []).map(mapPointsLog);
};

export const subscribeToPointsLog = (
  userId: string,
  callback: (logs: PointsLog[]) => void,
  limitCount = 10,
): Unsubscribe => {
  getUserPointsLog(userId, limitCount).then(callback).catch(console.error);
  if (!isSupabaseConfigured) { throw new Error('Database is not configured. No changes were saved.'); }

  const channel = supabase
    .channel(`points_log_${userId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'points_log', filter: `user_id=eq.${userId}` }, () => {
      getUserPointsLog(userId, limitCount).then(callback).catch(console.error);
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

export const getLeaderboard = async (limitCount = 20) => {
  if (!isSupabaseConfigured) { return []; }

  const { data, error } = await supabase.rpc('public_leaderboard', { p_limit: limitCount });

  if (error) throw error;
  return (data || []).map((row: any, i: number) => {
    const totalPoints = row.total_points ?? row.xp ?? 0;
    return {
      userId: row.id,
      fullName: row.full_name || 'Member',
      photoURL: row.photo_url || row.avatar_url,
      faculty: row.faculty,
      memberId: row.member_id,
      totalPoints,
      level: getLevelFromPoints(totalPoints),
      rank: i + 1,
    };
  });
};

export const checkAndAwardBadges = async (
  userId: string,
  stats: UserStats,
): Promise<Achievement[]> => {
 if (!isSupabaseConfigured) throw new Error('Database is not configured.');
 const { data, error } = await supabase.rpc('refresh_badges');
 if (error) throw error;
 return (data || []).map(mapAchievement);
};

export const getUserAchievements = async (userId: string): Promise<Achievement[]> => {
  if (!isSupabaseConfigured) { return []; }

  const { data, error } = await supabase
    .from('user_achievements')
    .select('*')
    .eq('user_id', userId)
    .order('unlocked_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapAchievement);
};

export const subscribeToAchievements = (
  userId: string,
  callback: (achievements: Achievement[]) => void,
): Unsubscribe => {
  getUserAchievements(userId).then(async items => { callback(items); if (items.some(item => item.isNew)) await supabase.rpc('acknowledge_badges'); }).catch(console.error);
  if (!isSupabaseConfigured) { throw new Error('Database is not configured. No changes were saved.'); }

  const channel = supabase
    .channel(`achievements_${userId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'user_achievements', filter: `user_id=eq.${userId}` }, () => {
      getUserAchievements(userId).then(callback).catch(console.error);
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
