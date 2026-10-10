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

const demoPointsLog: PointsLog[] = [];
const demoAchievements: Achievement[] = [];
const demoUserPoints: Record<string, number> = {};

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
  const { userId, action, description, customPoints, referenceId, referenceType } = opts;

  const points = action === 'ADMIN_BONUS' || action === 'ADMIN_DEDUCT'
    ? (customPoints ?? 0)
    : POINT_VALUES[action];

  if (!isSupabaseConfigured) {
    demoUserPoints[userId] = (demoUserPoints[userId] ?? 0) + points;
    demoPointsLog.push({
      userId,
      points,
      action,
      description,
      referenceId,
      referenceType,
      createdAt: new Date().toISOString(),
    });
    return { points, newTotal: demoUserPoints[userId] };
  }

  const { error: logError } = await supabase.from('points_log').insert({
    user_id: userId,
    points,
    action,
    description,
    reference_id: referenceId ?? null,
    reference_type: referenceType ?? null,
  });

  if (logError) throw logError;

  const { data: profile } = await supabase
    .from('profiles')
    .select('total_points, xp')
    .eq('id', userId)
    .maybeSingle();

  const currentTotal = Number((profile as any)?.total_points ?? (profile as any)?.xp ?? 0);
  const newTotal = currentTotal + points;
  const nextLevel = getLevelFromPoints(newTotal);

  const updatePayload = {
    total_points: newTotal,
    xp: newTotal,
    level: nextLevel,
    updated_at: new Date().toISOString(),
  };

  await Promise.all([
    supabase.from('profiles').update(updatePayload as any).eq('id', userId),
    supabase.from('users').update(updatePayload as any).eq('id', userId),
  ]);

  return { points, newTotal };
};

export const getUserPointsLog = async (userId: string, limitCount = 20): Promise<PointsLog[]> => {
  if (!isSupabaseConfigured) {
    return demoPointsLog.filter(l => l.userId === userId).slice(-limitCount).reverse();
  }

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
  if (!isSupabaseConfigured) return () => {};

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
  if (!isSupabaseConfigured) {
    return Object.entries(demoUserPoints)
      .map(([userId, totalPoints], i) => ({ userId, totalPoints, rank: i + 1, fullName: userId, level: getLevelFromPoints(totalPoints) }))
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, limitCount);
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, photo_url, avatar_url, faculty, total_points, xp')
    .order('total_points', { ascending: false })
    .limit(limitCount);

  if (error) throw error;
  return (data || []).map((row: any, i: number) => {
    const totalPoints = row.total_points ?? row.xp ?? 0;
    return {
      userId: row.id,
      fullName: row.full_name || 'Member',
      photoURL: row.photo_url || row.avatar_url,
      faculty: row.faculty,
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
  const newlyUnlocked: Achievement[] = [];

  const existing = await getUserAchievements(userId);
  const earnedIds = new Set(existing.map(item => item.badgeId));

  for (const badge of BADGES_CATALOG) {
    if (!earnedIds.has(badge.id) && badge.condition(stats)) {
      const achievement: Achievement = {
        userId,
        badgeId: badge.id,
        badgeName: badge.name,
        badgeIcon: badge.icon,
        badgeColor: badge.color,
        description: badge.description,
        unlockedAt: new Date().toISOString(),
        isNew: true,
      };

      if (isSupabaseConfigured) {
        const { error } = await supabase.from('user_achievements').insert({
          user_id: userId,
          badge_id: badge.id,
          badge_name: badge.name,
          badge_icon: badge.icon,
          badge_color: badge.color,
          description: badge.description,
          is_new: true,
        });
        if (error) throw error;
      } else {
        demoAchievements.push(achievement);
      }

      newlyUnlocked.push(achievement);
    }
  }

  return newlyUnlocked;
};

export const getUserAchievements = async (userId: string): Promise<Achievement[]> => {
  if (!isSupabaseConfigured) return demoAchievements.filter(a => a.userId === userId);

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
  getUserAchievements(userId).then(callback).catch(console.error);
  if (!isSupabaseConfigured) return () => {};

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
