/**
 * notificationService.ts
 * Supabase-backed user alerts, notifications, and real-time announcements.
 */

import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { Notification, NotificationType } from '../types';

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
];

const mapNotification = (row: any): Notification => ({
  id: row.id,
  userId: row.user_id || '',
  type: (row.type || 'admin_message') as NotificationType,
  title: row.title,
  body: row.message || row.body || '',
  isRead: Boolean(row.read),
  referenceId: row.reference_id || undefined,
  referenceType: row.reference_type || undefined,
  createdAt: row.created_at,
});

export const notificationService = {
  async getUserNotifications(userId: string): Promise<Notification[]> {
    if (!isSupabaseConfigured) {
      return INITIAL_NOTIFICATIONS.filter(n => n.userId === userId || n.userId === 'demo-user');
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .or(`user_id.eq.${userId},user_id.is.null`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(mapNotification);
  },

  async sendNotification(
    userId: string,
    type: NotificationType,
    title: string,
    body: string,
    referenceId?: string,
    referenceType?: string
  ): Promise<Notification> {
    const fallback: Notification = {
      id: `notif_${Date.now()}`,
      userId,
      type,
      title,
      body,
      isRead: false,
      referenceId,
      referenceType,
      createdAt: new Date().toISOString(),
    };

    if (!isSupabaseConfigured) return fallback;

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message: body,
        read: false,
        type,
        reference_id: referenceId,
        reference_type: referenceType,
      } as any)
      .select()
      .single();

    if (error) throw error;
    return mapNotification(data);
  },

  async markAsRead(userId: string, notificationId: string): Promise<void> {
    if (!isSupabaseConfigured) return;

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .eq('user_id', userId);

    if (error) throw error;
  },

  async markAllAsRead(userId: string): Promise<void> {
    if (!isSupabaseConfigured) return;

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId);

    if (error) throw error;
  },

  getLocalNotifications(): Notification[] {
    return INITIAL_NOTIFICATIONS;
  },
};
