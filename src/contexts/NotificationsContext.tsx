import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { notificationService } from '../services/notificationService';
import { Notification, NotificationType } from '../types';
import { toast } from 'sonner';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  sendNotification: (
    type: NotificationType,
    title: string,
    body: string,
    refId?: string,
    refType?: string
  ) => Promise<void>;
  refresh: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchNotifs = async () => {
    try {
      if (!profile?.uid) { setNotifications([]); return; }
      const list = await notificationService.getUserNotifications(profile.uid);
      setNotifications(list);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
    if (!profile?.uid || !isSupabaseConfigured) return;
    const channel = supabase.channel(`notifications_${profile.uid}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, fetchNotifs)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notification_reads', filter: `user_id=eq.${profile.uid}` }, fetchNotifs)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [profile]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = async (id: string) => {
    if (!profile?.uid) throw new Error('Authentication required');
    await notificationService.markAsRead(profile.uid, id);
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllAsRead = async () => {
    if (!profile?.uid) throw new Error('Authentication required');
    await notificationService.markAllAsRead(profile.uid);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    toast.success('All notifications marked as read');
  };

  const sendNotification = async (
    type: NotificationType,
    title: string,
    body: string,
    refId?: string,
    refType?: string
  ) => {
    if (!profile?.uid) throw new Error('Authentication required');
    const newNotif = await notificationService.sendNotification(
      profile.uid,
      type,
      title,
      body,
      refId,
      refType
    );
    setNotifications(prev => [newNotif, ...prev]);
    toast.info(title, { description: body });
  };

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        sendNotification,
        refresh: fetchNotifs,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};
