/**
 * pointsService.ts
 * Handles all points operations: awarding, deducting, fetching logs.
 * Works in both Firebase and Demo modes.
 */

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  doc,
  updateDoc,
  increment,
  serverTimestamp,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db, isFirebaseReady } from '../lib/firebase';
import {
  PointAction,
  PointsLog,
  POINT_VALUES,
  getLevelFromPoints,
  BADGES_CATALOG,
  UserStats,
  Achievement,
} from '../types';

// ─── In-memory demo store ────────────────────────────────────────────────────
const demoPointsLog: PointsLog[] = [];
const demoAchievements: Achievement[] = [];
const demoUserPoints: Record<string, number> = {};

// ─── Award Points ────────────────────────────────────────────────────────────

export interface AwardPointsOptions {
  userId: string;
  action: PointAction;
  description: string;
  customPoints?: number; // override for ADMIN_BONUS / ADMIN_DEDUCT
  referenceId?: string;
  referenceType?: PointsLog['referenceType'];
}

export const awardPoints = async (opts: AwardPointsOptions): Promise<{ points: number; newTotal: number }> => {
  const { userId, action, description, customPoints, referenceId, referenceType } = opts;

  const points = action === 'ADMIN_BONUS' || action === 'ADMIN_DEDUCT'
    ? (customPoints ?? 0)
    : POINT_VALUES[action];

  if (!isFirebaseReady) {
    // Demo mode
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

  try {
    // 1. Add points log entry
    await addDoc(collection(db, 'points_log'), {
      userId,
      points,
      action,
      description,
      referenceId: referenceId ?? null,
      referenceType: referenceType ?? null,
      createdAt: serverTimestamp(),
    });

    // 2. Update user's totalPoints field atomically
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      totalPoints: increment(points),
    });

    // 3. Get new total to return (optimistic: current + awarded)
    // The real total will come from the Firestore listener
    const newTotal = points; // caller can get real total from PointsContext
    return { points, newTotal };
  } catch (err) {
    console.error('awardPoints error:', err);
    throw err;
  }
};

// ─── Get Points Log ──────────────────────────────────────────────────────────

export const getUserPointsLog = async (userId: string, limitCount = 20): Promise<PointsLog[]> => {
  if (!isFirebaseReady) {
    return demoPointsLog
      .filter(l => l.userId === userId)
      .slice(-limitCount)
      .reverse();
  }

  const q = query(
    collection(db, 'points_log'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(limitCount),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as PointsLog));
};

// ─── Real-time Points Log subscription ──────────────────────────────────────

export const subscribeToPointsLog = (
  userId: string,
  callback: (logs: PointsLog[]) => void,
  limitCount = 10,
): Unsubscribe => {
  if (!isFirebaseReady) {
    callback(demoPointsLog.filter(l => l.userId === userId).slice(-limitCount).reverse());
    return () => {};
  }

  const q = query(
    collection(db, 'points_log'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(limitCount),
  );

  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as PointsLog)));
  });
};

// ─── Leaderboard ─────────────────────────────────────────────────────────────

export const getLeaderboard = async (limitCount = 20) => {
  if (!isFirebaseReady) {
    return Object.entries(demoUserPoints)
      .map(([userId, totalPoints], i) => ({ userId, totalPoints, rank: i + 1, fullName: userId, level: getLevelFromPoints(totalPoints) }))
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, limitCount);
  }

  const { getDocs: gd, collection: col, orderBy: ob, limit: lim, query: qry } = await import('firebase/firestore');
  const q = qry(col(db, 'users'), ob('totalPoints', 'desc'), lim(limitCount));
  const snap = await gd(q);
  return snap.docs.map((d, i) => {
    const data = d.data();
    return {
      userId: d.id,
      fullName: data.fullName,
      photoURL: data.photoURL,
      faculty: data.faculty,
      totalPoints: data.totalPoints ?? 0,
      level: getLevelFromPoints(data.totalPoints ?? 0),
      rank: i + 1,
    };
  });
};

// ─── Achievements ────────────────────────────────────────────────────────────

export const checkAndAwardBadges = async (
  userId: string,
  stats: UserStats,
): Promise<Achievement[]> => {
  const newlyUnlocked: Achievement[] = [];

  if (!isFirebaseReady) {
    for (const badge of BADGES_CATALOG) {
      const alreadyHas = demoAchievements.some(a => a.userId === userId && a.badgeId === badge.id);
      if (!alreadyHas && badge.condition(stats)) {
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
        demoAchievements.push(achievement);
        newlyUnlocked.push(achievement);
      }
    }
    return newlyUnlocked;
  }

  // Get already earned badges
  const existing = await getDocs(
    query(collection(db, 'user_achievements'), where('userId', '==', userId)),
  );
  const earnedIds = new Set(existing.docs.map(d => d.data().badgeId as string));

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
      await addDoc(collection(db, 'user_achievements'), {
        ...achievement,
        unlockedAt: serverTimestamp(),
      });
      newlyUnlocked.push(achievement);
    }
  }

  return newlyUnlocked;
};

export const getUserAchievements = async (userId: string): Promise<Achievement[]> => {
  if (!isFirebaseReady) {
    return demoAchievements.filter(a => a.userId === userId);
  }

  const q = query(collection(db, 'user_achievements'), where('userId', '==', userId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Achievement));
};

export const subscribeToAchievements = (
  userId: string,
  callback: (achievements: Achievement[]) => void,
): Unsubscribe => {
  if (!isFirebaseReady) {
    callback(demoAchievements.filter(a => a.userId === userId));
    return () => {};
  }

  const q = query(collection(db, 'user_achievements'), where('userId', '==', userId));
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Achievement)));
  });
};
