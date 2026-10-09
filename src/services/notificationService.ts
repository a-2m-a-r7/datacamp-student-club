/**
 * notificationService.ts
 * Manages user alerts, notifications, and real-time announcements.
 */

import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db, isFirebaseReady } from '../lib/firebase';
import { Notification, NotificationType } from '../types';

const LOCAL_NOTIFS_KEY = 'datacamp_user_notifications';

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-welcome',
    userId: 'demo-user',
    type: 'points_earned',
    title: 'Welcome to DataCamp Club! +50 XP',
    body: 'Your account was verified and your introductory onboarding points were credited.',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'notif-compiler',
    userId: 'demo-user',
    type: 'course_update',
    title: 'New Feature: Universal Online Compiler',
    body: 'The club compiler now supports Python, JavaScript, TypeScript, SQL, C++, Java, R, Go, and Rust!',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'notif-event',
    userId: 'demo-user',
    type: 'event_reminder',
    title: 'AI Summit 2026 Registration Open',
    body: 'Reserve your pass for the premier AI & Data Science gathering this month.',
    isRead: true,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

export const notificationService = {
  /**
   * Get all notifications for a specific user
   */
  async getUserNotifications(userId: string): Promise<Notification[]> {
    if (isFirebaseReady) {
      try {
        const q = query(
          collection(db, 'notifications', userId, 'items'),
          orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          const list: Notification[] = [];
          snap.forEach(d => list.push({ id: d.id, ...d.data() } as Notification));
          return list;
        }
      } catch (err) {
        console.warn('Firestore notifications read fallback:', err);
      }
    }

    const local = this.getLocalNotifications();
    const userNotifs = local.filter(n => n.userId === userId || n.userId === 'demo-user');
    return userNotifs.length > 0 ? userNotifs : INITIAL_NOTIFICATIONS;
  },

  /**
   * Create a new notification
   */
  async sendNotification(
    userId: string,
    type: NotificationType,
    title: string,
    body: string,
    referenceId?: string,
    referenceType?: string
  ): Promise<Notification> {
    const id = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newNotif: Notification = {
      id,
      userId,
      type,
      title,
      body,
      isRead: false,
      referenceId,
      referenceType,
      createdAt: new Date().toISOString(),
    };

    if (isFirebaseReady) {
      try {
        await setDoc(doc(db, 'notifications', userId, 'items', id), {
          ...newNotif,
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        console.warn('Firebase save notification fallback:', err);
      }
    }

    const current = this.getLocalNotifications();
    localStorage.setItem(LOCAL_NOTIFS_KEY, JSON.stringify([newNotif, ...current]));

    return newNotif;
  },

  /**
   * Mark single notification as read
   */
  async markAsRead(userId: string, notificationId: string): Promise<void> {
    if (isFirebaseReady) {
      try {
        await updateDoc(doc(db, 'notifications', userId, 'items', notificationId), {
          isRead: true,
        });
      } catch {}
    }

    const current = this.getLocalNotifications();
    const updated = current.map(n => (n.id === notificationId ? { ...n, isRead: true } : n));
    localStorage.setItem(LOCAL_NOTIFS_KEY, JSON.stringify(updated));
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string): Promise<void> {
    const current = this.getLocalNotifications();
    const updated = current.map(n =>
      n.userId === userId || n.userId === 'demo-user' ? { ...n, isRead: true } : n
    );
    localStorage.setItem(LOCAL_NOTIFS_KEY, JSON.stringify(updated));
  },

  getLocalNotifications(): Notification[] {
    try {
      const data = localStorage.getItem(LOCAL_NOTIFS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
};
