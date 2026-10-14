import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { notificationService } from '../services/notificationService';
import { Notification, NotificationType } from '../types';
import { toast } from 'sonner';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { watchQuery } from '../lib/watchQuery';

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
  const currentUid = useRef(profile?.uid); currentUid.current = profile?.uid;

  const fetchNotifs = async () => {
    try {
      if (!profile?.uid) { setNotifications([]); return; }
      const list = await notificationService.getUserNotifications(profile.uid);
      if (currentUid.current === profile.uid) setNotifications(list);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setNotifications([]);
    if (!profile?.uid || !isSupabaseConfigured) { setLoading(false); return; }
    setLoading(true);
    const uid = profile.uid;
    const stop = watchQuery(() => notificationService.getUserNotifications(uid), list => { setNotifications(list); setLoading(false); }, refresh => {
      const channel = supabase.channel(`notifications_${uid}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, refresh)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'notification_reads', filter: `user_id=eq.${uid}` }, refresh).subscribe();
      return () => { supabase.removeChannel(channel); };
    });
    // A failed initial request must not leave the bell spinning indefinitely.
    const loadingTimeout = setTimeout(() => setLoading(false), 15000);
    return () => { stop(); clearTimeout(loadingTimeout); };
  }, [profile?.uid]);

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
