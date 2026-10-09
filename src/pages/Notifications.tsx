import React, { useState } from 'react';
import { useNotifications } from '../contexts/NotificationsContext';
import { Button } from '../components/ui/Button';
import {
  Bell,
  CheckCircle2,
  CheckCheck,
  Zap,
  Award,
  BookOpen,
  Calendar,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { NotificationType } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

export const Notifications = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { isArabic } = useLanguage();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifs = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  const getIconForType = (type: NotificationType) => {
    switch (type) {
      case 'points_earned':
        return <Zap className="w-5 h-5 text-neon-green" />;
      case 'badge_unlocked':
        return <Award className="w-5 h-5 text-amber-400" />;
      case 'certificate_ready':
        return <ShieldCheck className="w-5 h-5 text-primary" />;
      case 'course_update':
        return <BookOpen className="w-5 h-5 text-neon-blue" />;
      case 'event_reminder':
      case 'event_approved':
        return <Calendar className="w-5 h-5 text-purple-400" />;
      default:
        return <Bell className="w-5 h-5 text-slate-400" />;
    }
  };

  const getActionLink = (type: NotificationType) => {
    switch (type) {
      case 'points_earned':
      case 'badge_unlocked':
        return { 
          label: isArabic ? 'عرض لوحة المتصدرين' : 'View Leaderboard', 
          path: '/leaderboard' 
        };
      case 'certificate_ready':
        return { 
          label: isArabic ? 'عرض الشهادة المعتمدة' : 'View Certificate', 
          path: '/certificates' 
        };
      case 'course_update':
        return { 
          label: isArabic ? 'استكشف الدورات' : 'Explore Courses', 
          path: '/courses' 
        };
      case 'event_reminder':
        return { 
          label: isArabic ? 'جدول الفعاليات' : 'Events Schedule', 
          path: '/events' 
        };
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-cyber-black text-foreground pt-20 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-cyber uppercase tracking-wider bg-primary/20 text-primary border border-primary/30 flex items-center gap-1">
                <Bell className="w-3 h-3" /> 
                {isArabic ? 'سجل النشاط والتنبيهات' : 'ACTIVITY DISPATCH'}
              </span>
              {unreadCount > 0 && (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                  {unreadCount} {isArabic ? 'غير مقروء' : 'Unread'}
                </span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-cyber font-black tracking-tight text-white flex items-center gap-3">
              {isArabic ? 'الإشعارات' : 'NOTIFICATIONS'} <span className="text-primary neon-text">{isArabic ? 'والتنبيهات الحية' : '& ALERTS'}</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isArabic
                ? 'إعلانات النادي في الوقت الفعلي، وتحديثات نقاط الخبرة XP، وإشعارات الدورات والشهادات.'
                : 'Real-time club announcements, XP progression updates, and course notifications.'
              }
            </p>
          </div>

          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                className="font-cyber text-xs border-primary/30 text-primary hover:bg-primary/10"
              >
                <CheckCheck className={`w-3.5 h-3.5 ${isArabic ? 'ml-1.5' : 'mr-1.5'}`} /> 
                {isArabic ? 'تحديد الكل كمقروء' : 'MARK ALL READ'}
              </Button>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 border-b border-white/10 pb-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 rounded-lg text-xs font-cyber tracking-wider transition-all ${
              filter === 'all'
                ? 'bg-primary text-dark-navy font-bold shadow-[0_0_12px_rgba(0,255,204,0.3)]'
                : 'text-muted-foreground hover:text-white bg-white/5'
            }`}
          >
            {isArabic ? `جميع الإشعارات (${notifications.length})` : `ALL DISPATCHES (${notifications.length})`}
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-1.5 rounded-lg text-xs font-cyber tracking-wider transition-all ${
              filter === 'unread'
                ? 'bg-primary text-dark-navy font-bold shadow-[0_0_12px_rgba(0,255,204,0.3)]'
                : 'text-muted-foreground hover:text-white bg-white/5'
            }`}
          >
            {isArabic ? `غير المقروء فقط (${unreadCount})` : `UNREAD ONLY (${unreadCount})`}
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifs.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-white/10 bg-dark-navy/60 space-y-3">
              <CheckCircle2 className="w-10 h-10 text-primary/40 mx-auto" />
              <p className="font-cyber text-white">
                {isArabic ? 'أنت على اطلاع بكل جديد!' : 'ALL CAUGHT UP'}
              </p>
              <p className="text-xs font-mono text-muted-foreground">
                {isArabic ? 'لا توجد إشعارات جديدة تطابق التصفية الحالية.' : 'No new notifications matching your filter.'}
              </p>
            </div>
          ) : (
            filteredNotifs.map((notif) => {
              const action = getActionLink(notif.type);
              const formattedDate = new Date(notif.createdAt as string).toLocaleString(isArabic ? 'ar-EG' : 'en-US');

              return (
                <div
                  key={notif.id}
                  onClick={() => !notif.isRead && notif.id && markAsRead(notif.id)}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer ${
                    notif.isRead
                      ? 'border-white/5 bg-dark-navy/40 opacity-75 hover:opacity-100'
                      : 'border-primary/40 bg-dark-navy/80 shadow-[0_0_20px_rgba(0,255,204,0.08)]'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex-shrink-0">
                      {getIconForType(notif.type)}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-cyber font-bold text-sm text-white">{notif.title}</h4>
                        {!notif.isRead && (
                          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground font-mono leading-relaxed">
                        {notif.body}
                      </p>
                      <div className="text-[10px] font-mono text-muted-foreground/60 pt-1">
                        {formattedDate}
                      </div>
                    </div>
                  </div>

                  {action && (
                    <Link
                      to={action.path}
                      className="self-start sm:self-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-[11px] font-cyber h-8 px-3 border-primary/30 text-primary hover:bg-primary/10"
                      >
                        {action.label} 
                        <ArrowRight className={`w-3 h-3 ${isArabic ? 'mr-1 rotate-180' : 'ml-1'}`} />
                      </Button>
                    </Link>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
