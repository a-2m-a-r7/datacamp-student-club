/**
 * PointsContext.tsx
 * Provides real-time points, level, achievements, and recent activity
 * to the entire app via React Context.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  subscribeToPointsLog,
  subscribeToAchievements,
  awardPoints,
  checkAndAwardBadges,
} from '../services/pointsService';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import {
  PointsLog,
  Achievement,
  UserMemberLevel,
  UserStats,
  getLevelFromPoints,
  getNextLevel,
  LEVEL_THRESHOLDS,
  PointAction,
} from '../types';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface PointsContextType {
  totalPoints: number;
  level: UserMemberLevel;
  nextLevel: UserMemberLevel | null;
  progressToNextLevel: number; // 0-100
  pointsToNextLevel: number;
  recentLogs: PointsLog[];
  achievements: Achievement[];
  stats: UserStats;
  loading: boolean;
  grantPoints: (action: PointAction, description: string, opts?: { referenceId?: string; referenceType?: PointsLog['referenceType']; customPoints?: number }) => Promise<void>;
}

const PointsContext = createContext<PointsContextType | undefined>(undefined);

// ─── XP Toast Component ──────────────────────────────────────────────────────

const XPToast = ({ points, action }: { points: number; action: string }) => (
  <div className="flex items-center gap-3 font-cyber">
    <div className="text-2xl">⭐</div>
    <div>
      <div className="text-primary font-bold text-lg">+{points} XP</div>
      <div className="text-xs text-muted-foreground uppercase tracking-widest">{action.replace(/_/g, ' ')}</div>
    </div>
  </div>
);

// ─── Provider ────────────────────────────────────────────────────────────────

export const PointsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();

  const [totalPoints, setTotalPoints] = useState(0);
  const [recentLogs, setRecentLogs] = useState<PointsLog[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UserStats>({
    totalPoints: 0,
    eventsAttended: 0,
    eventsPresented: 0,
    coursesCompleted: 0,
    coursesEnrolled: 0,
    lessonsCompleted: 0,
    projectsSubmitted: 0,
    blogPostsPublished: 0,
    referrals: 0,
    streakDays: 0,
    quizPerfectScores: 0,
  });

  // Computed level values
  const level = getLevelFromPoints(totalPoints);
  const nextLevel = getNextLevel(level);
  const levelData = LEVEL_THRESHOLDS[level];
  const nextLevelData = nextLevel ? LEVEL_THRESHOLDS[nextLevel] : null;
  const pointsToNextLevel = nextLevelData ? nextLevelData.min - totalPoints : 0;
  const progressToNextLevel = nextLevelData
    ? Math.round(((totalPoints - levelData.min) / (nextLevelData.min - levelData.min)) * 100)
    : 100;

  // Listen to real-time totalPoints from the Supabase profile mirror
  useEffect(() => {
    if (!user) {
      setTotalPoints(0);
      setLoading(false);
      return;
    }

    const activeUserId = (user as any).id || (user as any).uid;
    setTotalPoints(profile?.totalPoints ?? 0);
    setStats(prev => ({ ...prev, totalPoints: profile?.totalPoints ?? 0 }));
    setLoading(false);

    if (!isSupabaseConfigured || !activeUserId) return;

    const channel = supabase
      .channel(`profile_points_${activeUserId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${activeUserId}` }, (payload) => {
        const nextTotal = Number((payload.new as any)?.total_points ?? (payload.new as any)?.xp ?? 0);
        setTotalPoints(nextTotal);
        setStats(prev => ({ ...prev, totalPoints: nextTotal }));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, profile]);

  useEffect(() => {
    if (!user) return;
    const activeUserId = (user as any).id || (user as any).uid;
    if (!isSupabaseConfigured || !activeUserId) return;

    (async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('total_points, xp')
          .eq('id', activeUserId)
          .maybeSingle();
        const nextTotal = Number((data as any)?.total_points ?? (data as any)?.xp ?? 0);
        setTotalPoints(nextTotal);
        setStats(prev => ({ ...prev, totalPoints: nextTotal }));
      } catch (err) {
        console.warn('[PointsContext] Error fetching points:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  // Listen to recent points log
  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToPointsLog(user.uid, logs => {
      setRecentLogs(logs);
      // Derive stats from logs
      const derived: Partial<UserStats> = {
        eventsAttended:     logs.filter(l => l.action === 'EVENT_ATTEND').length,
        eventsPresented:    logs.filter(l => l.action === 'EVENT_PRESENT').length,
        coursesCompleted:   logs.filter(l => l.action === 'COURSE_COMPLETE').length,
        coursesEnrolled:    logs.filter(l => l.action === 'COURSE_ENROLL').length,
        lessonsCompleted:   logs.filter(l => l.action === 'LESSON_COMPLETE').length,
        projectsSubmitted:  logs.filter(l => l.action === 'PROJECT_SUBMIT').length,
        blogPostsPublished: logs.filter(l => l.action === 'BLOG_PUBLISH').length,
        referrals:          logs.filter(l => l.action === 'REFERRAL').length,
        quizPerfectScores:  logs.filter(l => l.action === 'QUIZ_PERFECT').length,
      };
      setStats(prev => ({ ...prev, ...derived }));
    }, 50);
    return () => unsub();
  }, [user]);

  // Listen to achievements
  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToAchievements(user.uid, ach => {
      // Show toast for newly unlocked badges
      const newBadges = ach.filter(a => a.isNew);
      newBadges.forEach(badge => {
        toast.success(`Badge Unlocked: ${badge.badgeName} ${badge.badgeIcon}`, {
          description: badge.description,
          duration: 5000,
        });
      });
      setAchievements(ach);
    });
    return () => unsub();
  }, [user]);

  // Grant points helper — called from anywhere in the app
  const grantPoints = useCallback(async (
    action: PointAction,
    description: string,
    opts?: { referenceId?: string; referenceType?: PointsLog['referenceType']; customPoints?: number },
  ) => {
    if (!user) return;

    try {
      const result = await awardPoints({
        userId: user.uid,
        action,
        description,
        customPoints: opts?.customPoints,
        referenceId: opts?.referenceId,
        referenceType: opts?.referenceType,
      });

      if (result.points > 0) {
        setTotalPoints(result.newTotal);
        setStats(prev => ({ ...prev, totalPoints: result.newTotal }));
        toast.custom(() => <XPToast points={result.points} action={action} />, {
          duration: 3000,
          position: 'bottom-right',
        });
      }

      // Check for new badge unlocks after every point grant
      await checkAndAwardBadges(user.uid, stats);
    } catch (err) {
      console.error('grantPoints error:', err);
    }
  }, [user, stats]);

  return (
    <PointsContext.Provider
      value={{
        totalPoints,
        level,
        nextLevel,
        progressToNextLevel,
        pointsToNextLevel,
        recentLogs,
        achievements,
        stats,
        loading,
        grantPoints,
      }}
    >
      {children}
    </PointsContext.Provider>
  );
};

export const usePoints = () => {
  const ctx = useContext(PointsContext);
  if (!ctx) throw new Error('usePoints must be used within PointsProvider');
  return ctx;
};
