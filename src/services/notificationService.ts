/**
 * notificationService.ts
 * Supabase-backed user alerts, notifications, and real-time announcements.
 */

import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { Notification, NotificationType } from '../types';

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
 if (!isSupabaseConfigured || !userId) return [];
 const { data, error } = await supabase.rpc('get_notifications');
 if (error) throw error; return (data || []).map(mapNotification);
},

  async sendNotification(
    userId: string,
    type: NotificationType,
    title: string,
    body: string,
    referenceId?: string,
    referenceType?: string
  ): Promise<Notification> {
    if (!isSupabaseConfigured) { throw new Error('Database is not configured. No changes were saved.'); }

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
 if (!isSupabaseConfigured) throw new Error('Database is not configured.');
 const { error } = await supabase.rpc('read_notifications', { p_id: notificationId });
 if (error) throw error;
},

  async markAllAsRead(userId: string): Promise<void> {
 if (!isSupabaseConfigured) throw new Error('Database is not configured.');
 const { error } = await supabase.rpc('read_notifications', { p_id: null });
 if (error) throw error;
},

  getLocalNotifications(): Notification[] {
    return [];
  },
};
