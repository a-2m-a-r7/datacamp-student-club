import React, { useState, useEffect, useMemo } from 'react';
import { logAction } from '../../lib/logger';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { 
  Search, Filter, Download, UserPlus, FileSpreadsheet, Trash2, ShieldAlert, Eye, Calendar,
  Shield, Key, Crown, RefreshCw, Radio, LogIn, Clock, ArrowUpDown, ChevronLeft, ChevronRight,
  Activity, Mail, Users, CheckCircle, XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { generateMemberId } from '../../lib/memberUtils';
import { RoleEditorModal } from '../../components/admin/RoleEditorModal';
import { ROLE_DEFINITIONS, ROLE_LIST, ALL_PERMISSIONS } from '../../lib/roleDefinitions';
import { UserRole } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';

interface AuthEventItem {
  id: string;
  email: string;
  event_type: 'signup' | 'login' | 'logout';
  provider: 'email' | 'google';
  created_at: string;
  user_id?: string;
}

const toUiRole = (role: string | null | undefined): UserRole => {
  return role === 'admin' || role === 'super_admin' ? 'super_admin' : 'member';
};

const toDatabaseRole = (role: string | null | undefined): 'user' | 'admin' => {
  return role === 'admin' || role === 'super_admin' ? 'admin' : 'user';
};

const toUsersMirrorRole = (role: string | null | undefined): 'member' | 'admin' => {
  return toDatabaseRole(role) === 'admin' ? 'admin' : 'member';
};

const normalizeUser = (u: any) => ({
  ...u,
  id: u.id || u.uid,
  fullName: u.full_name || u.fullName || 'Member',
  memberId: u.member_id || u.memberId || 'DC-000',
  isVerified: u.is_verified ?? u.isVerified ?? true,
  createdAt: u.created_at || u.createdAt || new Date().toISOString(),
  lastSeenAt: u.last_seen_at || u.lastSeenAt || u.last_sign_in_at || u.createdAt || new Date().toISOString(),
  lastLoginAt: u.last_sign_in_at || u.lastLoginAt || u.created_at || null,
  provider: u.provider || (u.email?.includes('gmail') ? 'google' : 'email'),
  photoURL: u.avatar_url || u.photo_url || u.photoURL || '',
  totalPoints: u.total_points ?? u.totalPoints ?? 0,
  faculty: u.faculty || 'Engineering',
  role: toUiRole(u.role),
  databaseRole: toDatabaseRole(u.role),
  status: u.status || 'active'
});

const isUserOnline = (lastSeenAt: string | undefined): boolean => {
  if (!lastSeenAt) return false;
  const lastTime = new Date(lastSeenAt).getTime();
  if (isNaN(lastTime)) return false;
  return (Date.now() - lastTime) < (3 * 60 * 1000); // 3 minutes window
};

const formatTimeAgo = (dateStr: string | null | undefined, isArabic: boolean): string => {
  if (!dateStr) return isArabic ? 'غير معروف' : 'Never';
  const time = new Date(dateStr).getTime();
  if (isNaN(time)) return isArabic ? 'غير معروف' : 'Unknown';
  const diffSec = Math.floor((Date.now() - time) / 1000);
  if (diffSec < 60) return isArabic ? 'الآن' : 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return isArabic ? `منذ ${diffMin} دقيقة` : `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return isArabic ? `منذ ${diffHour} ساعة` : `${diffHour}h ago`;
  const diffDay = Math.floor(diffHour / 24);
  return isArabic ? `منذ ${diffDay} يوم` : `${diffDay}d ago`;
};

const UserManagement = () => {
  const { isArabic } = useLanguage();
  const [users, setUsers] = useState<any[]>([]);
  const [enrollmentCounts, setEnrollmentCounts] = useState<Record<string, number>>({});
  const [authEvents, setAuthEvents] = useState<AuthEventItem[]>([]);
  const [showActivityFeed, setShowActivityFeed] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters, search & sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterProvider, setFilterProvider] = useState<'all' | 'google' | 'email'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'online'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name' | 'points' | 'activity'>('newest');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modals & Confirmation dialogs
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [pendingRoleChange, setPendingRoleChange] = useState<{ user: any; newRole: string } | null>(null);
  const [viewingUser, setViewingUser] = useState<any>(null);
  const [editingRoleUser, setEditingRoleUser] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'matrix'>('users');

  const [newUser, setNewUser] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'member',
    faculty: 'Engineering',
    status: 'active'
  });

  // 1. Fetch Users, Enrollments & Auth Events from Supabase
  const fetchData = async () => {
    if (isSupabaseConfigured) {
      try {
        // Query profiles table
        const { data: profilesData, error: profilesErr } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (!profilesErr && profilesData) {
          setUsers(profilesData.map(normalizeUser));
        } else {
          // Fallback to users table if profiles returned an error
          const { data: usersData } = await supabase.from('users').select('*').order('created_at', { ascending: false });
          if (usersData) setUsers(usersData.map(normalizeUser));
        }

        // Query enrollment counts
        const { data: enrollmentsData } = await supabase.from('enrollments').select('user_id');
        if (enrollmentsData) {
          const counts: Record<string, number> = {};
          enrollmentsData.forEach((row: any) => {
            if (row.user_id) counts[row.user_id] = (counts[row.user_id] || 0) + 1;
          });
          setEnrollmentCounts(counts);
        }

        // Query auth_events
        const { data: eventsData } = await supabase
          .from('auth_events')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(40);
        if (eventsData) {
          setAuthEvents(eventsData as AuthEventItem[]);
        }
      } catch (err) {
        console.warn('Error fetching Supabase user intelligence:', err);
      } finally {
        setLoading(false);
      }
      return;
    }

    setUsers([]);
    setAuthEvents([]);
    setEnrollmentCounts({});
    setLoading(false);
  };

  useEffect(() => {
    fetchData();

    if (isSupabaseConfigured) {
      // Realtime listener for Auth Events (login / signup / logout)
      const authEventsChannel = supabase.channel('realtime_admin_auth_events')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'auth_events' }, (payload) => {
          const newEvent = payload.new as AuthEventItem;
          setAuthEvents(prev => [newEvent, ...prev.slice(0, 39)]);
          // Also refresh users if signup
          if (newEvent.event_type === 'signup') {
            fetchData();
          }
        })
        .subscribe();

      // Realtime listener for profiles changes
      const profilesChannel = supabase.channel('realtime_admin_profiles')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
          fetchData();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(authEventsChannel);
        supabase.removeChannel(profilesChannel);
      };
    }
  }, []);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
    toast.success(isArabic ? 'تم تحديث البيانات وقائمة الأعضاء بنجاح ⚡' : 'Refreshed cloud operative intel ⚡');
  };

  // Top Summary Metrics
  const summaryMetrics = useMemo(() => {
    const totalUsers = users.length;
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const newUsersToday = users.filter(u => {
      const created = new Date(u.createdAt).getTime();
      return !isNaN(created) && created >= startOfToday.getTime();
    }).length;

    const activeNow = users.filter(u => isUserOnline(u.lastSeenAt)).length;

    const loginsToday = authEvents.filter(e => {
      const eventTime = new Date(e.created_at).getTime();
      return e.event_type === 'login' && !isNaN(eventTime) && eventTime >= startOfToday.getTime();
    }).length;

    return { totalUsers, newUsersToday, activeNow, loginsToday };
  }, [users, authEvents]);

  // Filtered and Sorted Users
  const filteredAndSortedUsers = useMemo(() => {
    let result = users.filter(user => {
      // 1. Search Query
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch = !q || 
        String(user.fullName || '').toLowerCase().includes(q) ||
        String(user.email || '').toLowerCase().includes(q) ||
        String(user.memberId || '').toLowerCase().includes(q);

      // 2. Role Filter
      const matchesRole = filterRole === 'all' || user.role === filterRole;

      // 3. Provider Filter
      const userProv = (user.provider || (user.email?.includes('gmail') ? 'google' : 'email')).toLowerCase();
      const matchesProvider = filterProvider === 'all' || userProv === filterProvider;

      // 4. Status Filter
      let matchesStatus = true;
      if (filterStatus === 'online') {
        matchesStatus = isUserOnline(user.lastSeenAt);
      } else if (filterStatus === 'active') {
        matchesStatus = user.status === 'active';
      } else if (filterStatus === 'inactive') {
        matchesStatus = user.status === 'inactive';
      }

      return matchesSearch && matchesRole && matchesProvider && matchesStatus;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === 'name') {
        return (a.fullName || '').localeCompare(b.fullName || '');
      }
      if (sortBy === 'points') {
        return (b.totalPoints || 0) - (a.totalPoints || 0);
      }
      if (sortBy === 'activity') {
        return new Date(b.lastSeenAt).getTime() - new Date(a.lastSeenAt).getTime();
      }
      return 0;
    });

    return result;
  }, [users, searchTerm, filterRole, filterProvider, filterStatus, sortBy]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredAndSortedUsers.length / pageSize));
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedUsers.slice(start, start + pageSize);
  }, [filteredAndSortedUsers, currentPage, pageSize]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterRole, filterProvider, filterStatus, sortBy]);

  // Execute Role Change (after confirmation dialog)
  const confirmRoleChange = async () => {
    if (!pendingRoleChange) return;
    const { user, newRole } = pendingRoleChange;

    const updatePayload: any = { role: newRole };
    if (newRole === 'super_admin' || newRole === 'admin') {
      updatePayload.level = 'ARCHITECT';
      updatePayload.isVerified = true;
      updatePayload.is_verified = true;
    }

    // Optimistic local state update
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, ...updatePayload } : u));
    setPendingRoleChange(null);

    if (isSupabaseConfigured) {
      try {
        const dbRole = toDatabaseRole(newRole);
        const usersMirrorRole = toUsersMirrorRole(newRole);
        const updateData: any = { role: dbRole };
        if (dbRole === 'admin') {
          updateData.level = 'ARCHITECT';
          updateData.is_verified = true;
        }
        // Update profiles table
        const { error: profileErr } = await supabase.from('profiles').update(updateData).eq('id', user.id);
        // Also update users table for consistency
        await supabase.from('users').update({ ...updateData, role: usersMirrorRole }).eq('id', user.id);

        if (profileErr) throw profileErr;
        await logAction('USER_ROLE_CHANGE', 'Admin', `${user.email} -> ${newRole}`, 'success');
        toast.success(isArabic ? `تم تحديث رتبة العضو إلى ${newRole} بنجاح 👑` : `Role updated to ${newRole} successfully 👑`);
      } catch (err: any) {
        console.error('Failed to update role in Supabase:', err);
        toast.error(isArabic ? 'حدث خطأ أثناء حفظ الرتبة في Supabase' : 'Failed to update role');
        fetchData(); // Rollback
      }
      return;
    }

    toast.error(isArabic ? 'Supabase غير مفعّل، لا يمكن حفظ تغيير الرول.' : 'Supabase is not configured; role changes cannot be saved.');
  };

  // Toggle user active / inactive status
  const toggleUserStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));

    if (isSupabaseConfigured) {
      try {
        await supabase.from('profiles').update({ status: newStatus } as any).eq('id', userId);
        await supabase.from('users').update({ status: newStatus }).eq('id', userId);
        toast.success(`User status changed to ${newStatus}`);
      } catch {
        toast.error('Failed to update status');
      }
      return;
    }

    toast.error(isArabic ? 'Supabase غير مفعّل، لا يمكن حفظ حالة الحساب.' : 'Supabase is not configured; status changes cannot be saved.');
  };

  // Delete user confirmation
  const deleteUser = async (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    setShowDeleteConfirm(null);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('profiles').delete().eq('id', userId);
        await supabase.from('users').delete().eq('id', userId);
        await logAction('USER_DELETED', 'Admin', userId, 'warning');
        toast.success(isArabic ? 'تم حذف العضو من قاعدة البيانات' : 'User removed from database');
      } catch {
        toast.error('Failed to delete user');
        fetchData();
      }
      return;
    }

    toast.error(isArabic ? 'Supabase غير مفعّل، لا يمكن حذف المستخدم.' : 'Supabase is not configured; user deletion cannot be saved.');
  };

  // Add new user operative
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    const memberId = await generateMemberId(users);

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: newUser.email.trim(),
          password: newUser.password || 'DataCampClub2025!',
          options: {
            data: {
              full_name: newUser.fullName.trim(),
            }
          }
        });
        if (error) throw error;
        if (data.user) {
          const dbRole = toDatabaseRole(newUser.role);
          // Update profile attributes
          await supabase.from('profiles').update({
            role: dbRole,
            faculty: newUser.faculty,
            member_id: memberId,
          }).eq('id', data.user.id);
          await supabase.from('users').update({
            role: toUsersMirrorRole(newUser.role),
            faculty: newUser.faculty,
            member_id: memberId,
          }).eq('id', data.user.id);
        }
        toast.success(isArabic ? 'تمت إضافة العضو بنجاح في Supabase' : 'Operative created successfully in Supabase');
        setShowAddModal(false);
        fetchData();
      } catch (err: any) {
        toast.error(err.message || 'Failed to create operative');
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(false);
    toast.error(isArabic ? 'Supabase غير مفعّل، لا يمكن إنشاء مستخدم جديد.' : 'Supabase is not configured; new users cannot be created.');
  };

  // Export to Excel
  const handleExport = () => {
    const exportData = users.map(u => ({
      ID: u.memberId,
      Name: u.fullName,
      Email: u.email,
      Role: u.role,
      Provider: u.provider || 'email',
      Status: u.status,
      Online: isUserOnline(u.lastSeenAt) ? 'ONLINE' : 'OFFLINE',
      CoursesEnrolled: enrollmentCounts[u.id] || 0,
      TotalPoints: u.totalPoints,
      Faculty: u.faculty,
      JoinedAt: u.createdAt,
      LastSeen: u.lastSeenAt
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Members");
    XLSX.writeFile(wb, "DataCamp_Club_Operatives.xlsx");
    toast.success(isArabic ? 'تم تصدير سجل الأعضاء بنجاح' : 'Exporting member database...');
  };

  // Import CSV/Excel
  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary', raw: true });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawData: any[] = XLSX.utils.sheet_to_json(ws);
        toast.info(isArabic ? `تم استيراد ${rawData.length} سجل بنجاح` : `Imported ${rawData.length} records`);
      } catch {
        toast.error('Failed to parse file.');
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-black font-cyber tracking-tighter text-white">
              {isArabic ? 'إدارة الأعضاء والنشاط الحي' : 'USER MANAGEMENT & REALTIME INTEL'}
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-cyber bg-primary/20 text-primary border border-primary/40 font-bold">
              SUPABASE v2
            </span>
          </div>
          <p className="text-muted-foreground text-sm">
            {isArabic 
              ? 'مراقبة الأعضاء، تعقب الأحداث الحية، وتعديل الصلاحيات والرتب من قاعدة البيانات السحابية.' 
              : 'Realtime member control, session tracking, permission grants, and analytics.'}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Button 
            variant="outline" 
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="border-primary/40 text-primary hover:bg-primary/10 gap-2 font-cyber text-xs shadow-sm hover:scale-105 transition-all"
            title={isArabic ? 'مزامنة وتحديث فوري لقائمة الأعضاء من قاعدة البيانات السحابية' : 'Force Sync & Refresh from Cloud'}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{isArabic ? 'مزامنة السحابة ⚡' : 'SYNC CLOUD ⚡'}</span>
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowActivityFeed(!showActivityFeed)}
            className={`border-neon-blue/40 text-neon-blue hover:bg-neon-blue/10 gap-2 font-cyber text-xs transition-all ${showActivityFeed ? 'bg-neon-blue/10 shadow-[0_0_15px_rgba(0,243,255,0.2)]' : ''}`}
          >
            <Radio className="w-4 h-4 animate-pulse text-neon-blue" />
            <span>{isArabic ? (showActivityFeed ? 'إخفاء شريط النشاط' : 'شريط النشاط الحي') : (showActivityFeed ? 'HIDE LIVE FEED' : 'LIVE FEED')}</span>
          </Button>
          <Button variant="outline" onClick={handleExport} className="border-primary/30 text-xs">
            <Download className="w-4 h-4 mr-1 rtl:mr-0 rtl:ml-1" />
            {isArabic ? 'تصدير إكسيل' : 'EXPORT'}
          </Button>
          <Button variant="cyber" onClick={() => setShowAddModal(true)} className="text-xs">
            <UserPlus className="w-4 h-4 mr-1 rtl:mr-0 rtl:ml-1" />
            {isArabic ? 'إضافة عضو جديد' : 'ADD OPERATIVE'}
          </Button>
        </div>
      </div>

      {/* Phase 4 Requirement: Top Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-dark-navy/80 p-5 shadow-lg backdrop-blur hover:border-primary/40 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-cyber uppercase tracking-widest text-muted-foreground">
                {isArabic ? 'إجمالي الأعضاء' : 'TOTAL OPERATIVES'}
              </p>
              <h3 className="text-3xl font-black font-cyber text-white mt-1">
                {summaryMetrics.totalUsers}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(57,255,20,0.2)]">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono">
            <span className="text-neon-green">●</span> {isArabic ? 'مسجلين في Supabase DB' : 'Synced with Cloud DB'}
          </div>
        </div>

        {/* New Users Today */}
        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-dark-navy/80 p-5 shadow-lg backdrop-blur hover:border-neon-blue/40 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-cyber uppercase tracking-widest text-muted-foreground">
                {isArabic ? 'أعضاء جدد اليوم' : 'NEW TODAY'}
              </p>
              <h3 className="text-3xl font-black font-cyber text-neon-blue mt-1">
                +{summaryMetrics.newUsersToday}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-neon-blue/10 border border-neon-blue/20 flex items-center justify-center text-neon-blue shadow-[0_0_15px_rgba(0,243,255,0.2)]">
              <UserPlus className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono">
            <Clock className="w-3 h-3 text-neon-blue" /> {isArabic ? 'خلال الـ 24 ساعة الماضية' : 'Registered past 24h'}
          </div>
        </div>

        {/* Active Now */}
        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-dark-navy/80 p-5 shadow-lg backdrop-blur hover:border-neon-green/40 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-cyber uppercase tracking-widest text-muted-foreground">
                {isArabic ? 'نشط الآن (أونلاين)' : 'ACTIVE NOW'}
              </p>
              <h3 className="text-3xl font-black font-cyber text-neon-green mt-1 flex items-center gap-2">
                {summaryMetrics.activeNow}
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-neon-green animate-ping" />
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-neon-green/10 border border-neon-green/20 flex items-center justify-center text-neon-green shadow-[0_0_15px_rgba(57,255,20,0.25)]">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono">
            <span className="text-neon-green font-bold">●</span> {isArabic ? 'آخر ظهور خلال 3 دقائق' : 'Heartbeat active (<3m)'}
          </div>
        </div>

        {/* Logins Today */}
        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-dark-navy/80 p-5 shadow-lg backdrop-blur hover:border-amber-400/40 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-cyber uppercase tracking-widest text-muted-foreground">
                {isArabic ? 'تسجيلات دخول اليوم' : 'LOGINS TODAY'}
              </p>
              <h3 className="text-3xl font-black font-cyber text-amber-400 mt-1">
                {summaryMetrics.loginsToday}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.2)]">
              <LogIn className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono">
            <Activity className="w-3 h-3 text-amber-400" /> {isArabic ? 'أحداث auth_events اليومية' : 'Live auth_events today'}
          </div>
        </div>
      </div>

      {/* Phase 4 Requirement: Realtime Activity Feed Card/Drawer */}
      {showActivityFeed && (
        <Card className="border-neon-blue/30 bg-dark-navy/90 shadow-[0_0_25px_rgba(0,243,255,0.08)]">
          <CardHeader className="py-3 px-5 flex flex-row items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-neon-blue animate-ping" />
              <CardTitle className="text-sm font-cyber text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-neon-blue" />
                {isArabic ? 'شريط أحداث الحسابات الحي (REALTIME AUTH STREAM)' : 'LIVE AUTH_EVENTS STREAM'}
              </CardTitle>
            </div>
            <span className="text-[10px] font-mono text-neon-blue/80 bg-neon-blue/10 px-2 py-0.5 rounded border border-neon-blue/20">
              {authEvents.length} {isArabic ? 'حدث مرصود' : 'events captured'}
            </span>
          </CardHeader>
          <CardContent className="p-4">
            {authEvents.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4 font-mono">
                {isArabic ? 'لا توجد أحداث تسجيل دخول مسجلة حالياً.' : 'Awaiting live authentication events from Supabase...'}
              </p>
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                {authEvents.slice(0, 10).map((ev) => {
                  const isLogin = ev.event_type === 'login';
                  const isSignup = ev.event_type === 'signup';
                  return (
                    <div 
                      key={ev.id} 
                      className={`min-w-[220px] p-2.5 rounded-lg border text-xs flex flex-col justify-between shrink-0 transition-all ${
                        isLogin 
                          ? 'border-neon-green/30 bg-neon-green/5' 
                          : isSignup 
                            ? 'border-neon-blue/30 bg-neon-blue/5' 
                            : 'border-white/10 bg-white/5'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-cyber font-bold uppercase tracking-wider ${
                          isLogin 
                            ? 'bg-neon-green/20 text-neon-green border border-neon-green/30' 
                            : isSignup 
                              ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue/30' 
                              : 'bg-white/10 text-muted-foreground'
                        }`}>
                          {ev.event_type}
                        </span>
                        <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded ${
                          ev.provider === 'google' 
                            ? 'text-red-400 bg-red-500/10 border border-red-500/20' 
                            : 'text-neon-blue bg-neon-blue/10 border border-neon-blue/20'
                        }`}>
                          {ev.provider}
                        </span>
                      </div>
                      <div className="font-bold text-white text-[11px] truncate mb-1" title={ev.email}>
                        {ev.email}
                      </div>
                      <div className="text-[9px] font-mono text-muted-foreground flex items-center justify-between pt-1 border-t border-white/5">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{formatTimeAgo(ev.created_at, isArabic)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* View Switcher: Users List vs Roles Matrix */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-cyber tracking-wider transition-all border ${
            activeTab === 'users'
              ? 'bg-primary/10 border-primary text-primary shadow-[0_0_15px_rgba(57,255,20,0.15)] font-bold'
              : 'border-white/5 text-muted-foreground hover:text-white hover:bg-white/5'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>{isArabic ? 'قائمة الأعضاء والمشغلين' : 'OPERATIVES_ROSTER'}</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white">
            {filteredAndSortedUsers.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('matrix')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-cyber tracking-wider transition-all border ${
            activeTab === 'matrix'
              ? 'bg-primary/10 border-primary text-primary shadow-[0_0_15px_rgba(57,255,20,0.15)] font-bold'
              : 'border-white/5 text-muted-foreground hover:text-white hover:bg-white/5'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>{isArabic ? 'مصفوفة الرولات والصلاحيات' : 'ROLES_PERMISSIONS_MATRIX'}</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/20 text-primary">
            {ROLE_LIST.length} Roles
          </span>
        </button>
      </div>

      {activeTab === 'users' ? (
        <Card className="border-white/10 bg-dark-navy/60 backdrop-blur">
          {/* Filters, Search & Tools Toolbar */}
          <CardHeader className="flex flex-col gap-4 border-b border-white/5 pb-5">
            <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
              {/* Search Box */}
              <div className="relative flex-1 max-w-md">
                <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${isArabic ? 'right-3' : 'left-3'}`} />
                <Input 
                  placeholder={isArabic ? 'البحث بالاسم، البريد، أو رقم العضوية...' : 'Search by name, ID, or email...'} 
                  className={isArabic ? 'pr-10' : 'pl-10'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* CSV Import */}
              <label className="cursor-pointer shrink-0">
                <input type="file" accept=".csv, .xlsx" className="hidden" onChange={handleImportCSV} />
                <div className="flex items-center px-3 py-2 bg-white/5 border border-white/10 rounded-md text-[10px] font-bold hover:bg-white/10 transition-colors">
                  <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 rtl:mr-0 rtl:ml-1.5 text-neon-green" /> 
                  {isArabic ? 'استيراد CSV' : 'IMPORT_CSV'}
                </div>
              </label>
            </div>

            {/* Filter Dropdowns & Sorting Row */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              {/* Role Filter */}
              <div className="flex items-center bg-white/5 border border-white/10 rounded-md px-2.5 py-1">
                <Filter className="w-3.5 h-3.5 mr-1.5 rtl:mr-0 rtl:ml-1.5 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground font-cyber mr-1 rtl:mr-0 rtl:ml-1">
                  {isArabic ? 'الرول:' : 'Role:'}
                </span>
                <select 
                  className="bg-transparent border-none text-[11px] font-bold uppercase tracking-wider outline-none text-foreground cursor-pointer"
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                >
                  <option value="all" className="bg-dark-navy text-white">
                    {isArabic ? 'الكل (ALL)' : 'ALL'}
                  </option>
                  {ROLE_LIST.map(r => (
                    <option key={r.id} value={r.id} className="bg-dark-navy text-white">
                      {isArabic ? `${r.titleAr} (${r.tag})` : `${r.titleEn} (${r.tag})`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Provider Filter */}
              <div className="flex items-center bg-white/5 border border-white/10 rounded-md px-2.5 py-1">
                <Mail className="w-3.5 h-3.5 mr-1.5 rtl:mr-0 rtl:ml-1.5 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground font-cyber mr-1 rtl:mr-0 rtl:ml-1">
                  {isArabic ? 'طريقة الدخول:' : 'Provider:'}
                </span>
                <select 
                  className="bg-transparent border-none text-[11px] font-bold uppercase tracking-wider outline-none text-foreground cursor-pointer"
                  value={filterProvider}
                  onChange={(e) => setFilterProvider(e.target.value as any)}
                >
                  <option value="all" className="bg-dark-navy text-white">{isArabic ? 'الكل' : 'ALL'}</option>
                  <option value="google" className="bg-dark-navy text-red-400">Google</option>
                  <option value="email" className="bg-dark-navy text-neon-blue">Email / Pass</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center bg-white/5 border border-white/10 rounded-md px-2.5 py-1">
                <Radio className="w-3.5 h-3.5 mr-1.5 rtl:mr-0 rtl:ml-1.5 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground font-cyber mr-1 rtl:mr-0 rtl:ml-1">
                  {isArabic ? 'الحالة:' : 'Status:'}
                </span>
                <select 
                  className="bg-transparent border-none text-[11px] font-bold uppercase tracking-wider outline-none text-foreground cursor-pointer"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                >
                  <option value="all" className="bg-dark-navy text-white">{isArabic ? 'الكل' : 'ALL'}</option>
                  <option value="online" className="bg-dark-navy text-neon-green">{isArabic ? 'متصل الآن (Online)' : 'Online Now'}</option>
                  <option value="active" className="bg-dark-navy text-white">{isArabic ? 'نشط (Active)' : 'Active'}</option>
                  <option value="inactive" className="bg-dark-navy text-destructive">{isArabic ? 'معطل (Inactive)' : 'Inactive'}</option>
                </select>
              </div>

              {/* Sorting Filter */}
              <div className="flex items-center bg-white/5 border border-white/10 rounded-md px-2.5 py-1 ml-auto rtl:ml-0 rtl:mr-auto">
                <ArrowUpDown className="w-3.5 h-3.5 mr-1.5 rtl:mr-0 rtl:ml-1.5 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground font-cyber mr-1 rtl:mr-0 rtl:ml-1">
                  {isArabic ? 'ترتيب:' : 'Sort:'}
                </span>
                <select 
                  className="bg-transparent border-none text-[11px] font-bold uppercase tracking-wider outline-none text-foreground cursor-pointer"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                >
                  <option value="newest" className="bg-dark-navy text-white">{isArabic ? 'الأحدث تسجيلاً' : 'Newest'}</option>
                  <option value="oldest" className="bg-dark-navy text-white">{isArabic ? 'الأقدم تسجيلاً' : 'Oldest'}</option>
                  <option value="activity" className="bg-dark-navy text-white">{isArabic ? 'آخر نشاط' : 'Last Seen'}</option>
                  <option value="name" className="bg-dark-navy text-white">{isArabic ? 'الاسم أبجدياً' : 'Name A-Z'}</option>
                  <option value="points" className="bg-dark-navy text-white">{isArabic ? 'الأعلى نقاطاً' : 'Highest Points'}</option>
                </select>
              </div>
            </div>
          </CardHeader>

          {/* Members Table */}
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left rtl:text-right border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] uppercase tracking-widest text-muted-foreground bg-white/[0.02]">
                    <th className="p-4 font-medium">{isArabic ? 'العضو' : 'Operative'}</th>
                    <th className="p-4 font-medium">{isArabic ? 'رقم العضوية' : 'Member ID'}</th>
                    <th className="p-4 font-medium">{isArabic ? 'طريقة الدخول' : 'Provider'}</th>
                    <th className="p-4 font-medium">{isArabic ? 'الحالة والاتصال' : 'Presence'}</th>
                    <th className="p-4 font-medium">{isArabic ? 'الدورات المسجلة' : 'Courses'}</th>
                    <th className="p-4 font-medium">{isArabic ? 'الرول والصلاحية' : 'Role & Clearance'}</th>
                    <th className="p-4 font-medium">{isArabic ? 'إجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="p-12 text-center animate-pulse text-muted-foreground font-cyber">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                        {isArabic ? 'جاري الاتصال بـ Supabase وتحميل بيانات الأعضاء...' : 'QUERYING SUPABASE DATABASE...'}
                      </td>
                    </tr>
                  ) : paginatedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-12 text-center text-muted-foreground font-cyber">
                        {isArabic ? 'لم يتم العثور على أي أعضاء مطابقين للبحث.' : 'NO OPERATIVES MATCHING SPECIFIED FILTERS.'}
                      </td>
                    </tr>
                  ) : paginatedUsers.map((user) => {
                    const roleDef = ROLE_DEFINITIONS[user.role as UserRole] || ROLE_DEFINITIONS.member;
                    const online = isUserOnline(user.lastSeenAt);
                    const isGoogle = (user.provider || '').toLowerCase() === 'google' || user.email?.toLowerCase().includes('gmail');
                    const coursesCount = enrollmentCounts[user.id] || 0;

                    return (
                      <tr key={user.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors group">
                        {/* Member Info */}
                        <td className="p-4">
                          <div className="flex items-center space-x-3 rtl:space-x-reverse">
                            <div className="relative">
                              <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs shrink-0 overflow-hidden">
                                {user.photoURL ? (
                                  <img src={user.photoURL} alt={user.fullName} className="w-full h-full object-cover" />
                                ) : (
                                  user.fullName?.charAt(0) || '?'
                                )}
                              </div>
                              {/* Online live dot badge on avatar */}
                              <span 
                                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-dark-navy ${
                                  online ? 'bg-neon-green ring-2 ring-neon-green/30 animate-pulse' : 'bg-zinc-600'
                                }`} 
                                title={online ? 'Online now' : 'Offline'}
                              />
                            </div>
                            <div>
                              <div className="font-bold text-white flex items-center gap-1.5">
                                <span>{user.fullName}</span>
                                {user.role === 'admin' || user.role === 'super_admin' ? (
                                  <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                ) : null}
                              </div>
                              <div className="text-[11px] text-muted-foreground font-mono">{user.email}</div>
                            </div>
                          </div>
                        </td>

                        {/* Member ID & Points */}
                        <td className="p-4">
                          <div className="font-mono text-xs text-neon-blue font-bold">{user.memberId}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">
                            {user.totalPoints || 0} PTS
                          </div>
                        </td>

                        {/* Provider Badge */}
                        <td className="p-4">
                          {isGoogle ? (
                            <span className="px-2.5 py-1 rounded-md border border-red-500/30 bg-red-500/10 text-red-400 font-mono text-[10px] font-bold inline-flex items-center gap-1.5 shadow-sm">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                              Google
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-md border border-neon-blue/30 bg-neon-blue/10 text-neon-blue font-mono text-[10px] font-bold inline-flex items-center gap-1.5 shadow-sm">
                              <Mail className="w-3 h-3" />
                              Email
                            </span>
                          )}
                        </td>

                        {/* Presence / Status & Last Seen */}
                        <td className="p-4">
                          {online ? (
                            <div className="flex items-center gap-1.5 text-neon-green font-cyber text-[11px] font-bold">
                              <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                              <span>{isArabic ? 'متصل الآن' : 'ONLINE'}</span>
                            </div>
                          ) : (
                            <div className="text-[11px] text-muted-foreground font-mono flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{formatTimeAgo(user.lastSeenAt, isArabic)}</span>
                            </div>
                          )}
                          <div className="text-[9px] text-muted-foreground/70 font-mono mt-0.5">
                            {user.status === 'active' ? (
                              <span className="text-neon-green/80 uppercase">● {isArabic ? 'حساب نشط' : 'ACTIVE'}</span>
                            ) : (
                              <span className="text-destructive uppercase">● {isArabic ? 'معطل' : 'INACTIVE'}</span>
                            )}
                          </div>
                        </td>

                        {/* Enrolled Courses */}
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-white/5 border border-white/10 text-foreground font-bold inline-flex items-center gap-1">
                            {coursesCount} {isArabic ? 'دورات' : 'courses'}
                          </span>
                        </td>

                        {/* Role & Quick Role Switcher */}
                        <td className="p-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            {user.role === 'super_admin' || user.role === 'admin' ? (
                              <span className="px-2 py-0.5 rounded-md border border-amber-500/50 bg-amber-500/15 text-amber-300 font-cyber text-[10px] font-bold flex items-center gap-1 shrink-0">
                                <Crown className="w-3 h-3 text-amber-400" />
                                <span>{isArabic ? 'أدمن 👑' : 'ADMIN 👑'}</span>
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setPendingRoleChange({ user, newRole: 'super_admin' })}
                                className="px-2 py-0.5 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-cyber text-[10px] font-bold flex items-center gap-1 transition-all hover:scale-105 shrink-0 cursor-pointer"
                                title={isArabic ? 'ترقية العضو إلى أدمن' : 'Promote to Admin'}
                              >
                                <Crown className="w-3 h-3 text-amber-400" />
                                <span>{isArabic ? 'ترقية لأدمن' : 'PROMOTE'}</span>
                              </button>
                            )}

                            {/* Dropdown to change role (triggers confirmation dialog) */}
                            <select 
                              className="bg-dark-navy border border-white/10 rounded px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground outline-none focus:border-primary cursor-pointer max-w-[105px]"
                              value={user.role}
                              onChange={(e) => {
                                if (e.target.value !== user.role) {
                                  setPendingRoleChange({ user, newRole: e.target.value });
                                }
                              }}
                              title={isArabic ? 'تغيير الرتبة' : 'Change Role'}
                            >
                              {ROLE_LIST.map(r => (
                                <option key={r.id} value={r.id} className="bg-dark-navy text-white">
                                  {r.id}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="p-4">
                          <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="w-7 h-7 text-amber-400 hover:bg-amber-400/10"
                              onClick={() => setEditingRoleUser(user)}
                              title={isArabic ? 'محرر الصلاحيات' : 'Permissions Editor'}
                            >
                              <Shield className="w-3.5 h-3.5" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="w-7 h-7 text-primary hover:bg-primary/10"
                              onClick={() => setViewingUser(user)}
                              title={isArabic ? 'عرض التفاصيل' : 'View Intel'}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="w-7 h-7 text-destructive hover:bg-destructive/10"
                              onClick={() => setShowDeleteConfirm(user.id)}
                              title={isArabic ? 'حذف العضو' : 'Delete Operative'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <span className="text-muted-foreground font-mono">
                  {isArabic 
                    ? `عرض ${(currentPage - 1) * pageSize + 1} إلى ${Math.min(currentPage * pageSize, filteredAndSortedUsers.length)} من إجمالي ${filteredAndSortedUsers.length} عضو` 
                    : `Showing ${(currentPage - 1) * pageSize + 1} to ${Math.min(currentPage * pageSize, filteredAndSortedUsers.length)} of ${filteredAndSortedUsers.length} operatives`}
                </span>
                <div className="flex items-center gap-1.5">
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className="h-7 text-xs border-white/10"
                  >
                    <ChevronLeft className="w-3.5 h-3.5 mr-1 rtl:mr-0 rtl:ml-1" />
                    {isArabic ? 'السابق' : 'Prev'}
                  </Button>
                  <span className="px-3 py-1 font-mono text-[11px] bg-white/5 rounded border border-white/10 text-white font-bold">
                    {currentPage} / {totalPages}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className="h-7 text-xs border-white/10"
                  >
                    {isArabic ? 'التالي' : 'Next'}
                    <ChevronRight className="w-3.5 h-3.5 ml-1 rtl:ml-0 rtl:mr-1" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        /* Roles & Permissions Matrix Tab */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {ROLE_LIST.map((role) => {
              const count = users.filter(u => u.role === role.id).length;

              return (
                <div
                  key={role.id}
                  className={`p-4 rounded-xl border transition-all ${role.badgeBg} ${role.badgeBorder} flex flex-col justify-between`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold border ${role.badgeBg} ${role.badgeBorder} ${role.badgeColor}`}>
                        {role.tag}
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        Level {role.level}/10
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-white font-cyber mb-1">
                      {isArabic ? role.titleAr : role.titleEn}
                    </h3>
                    <p className="text-[11px] text-muted-foreground line-clamp-2">
                      {isArabic ? role.descriptionAr : role.descriptionEn}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                    <span className="text-xs font-mono">
                      <strong className="text-white text-sm">{count}</strong> {isArabic ? 'أعضاء' : 'Operatives'}
                    </span>
                    <button
                      onClick={() => {
                        setFilterRole(role.id);
                        setActiveTab('users');
                      }}
                      className="text-[10px] font-cyber text-primary hover:underline"
                    >
                      {isArabic ? 'عرض الأعضاء ↗' : 'VIEW_USERS ↗'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <Card className="border-white/10 bg-dark-navy/60">
            <CardHeader>
              <CardTitle className="text-lg font-cyber flex items-center gap-2">
                <Key className="w-5 h-5 text-primary" />
                {isArabic ? 'جدول توزيع الصلاحيات حسب الرول' : 'SYSTEM PERMISSIONS MATRIX'}
              </CardTitle>
              <CardDescription>
                {isArabic 
                  ? 'مصفوفة تفصيلية لجميع الصلاحيات والأنظمة الفرعية مقابل كل رول داخل نادي DataCamp.' 
                  : 'Comprehensive cross-matrix of all functional platform capabilities mapped against assigned clearances.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left rtl:text-right border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-[10px] uppercase tracking-widest text-muted-foreground">
                      <th className="p-3 font-medium min-w-[200px]">{isArabic ? 'الصلاحية / الوظيفة' : 'Capability'}</th>
                      {ROLE_LIST.map(r => (
                        <th key={r.id} className="p-3 font-medium text-center min-w-[90px]">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono ${r.badgeColor}`}>
                            {r.tag}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ALL_PERMISSIONS.map((perm) => (
                      <tr key={perm.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-3">
                          <div className="font-bold text-white font-cyber">{isArabic ? perm.nameAr : perm.nameEn}</div>
                          <div className="text-[10px] text-muted-foreground">{isArabic ? perm.descriptionAr : perm.descriptionEn}</div>
                        </td>
                        {ROLE_LIST.map(r => {
                          const isGranted = r.permissions.includes(perm.id);
                          return (
                            <td key={r.id} className="p-3 text-center">
                              {isGranted ? (
                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-neon-green/20 text-neon-green font-bold">
                                  ✓
                                </span>
                              ) : (
                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/5 text-muted-foreground/30 font-bold">
                                  —
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Phase 4 Requirement: Role Change Confirmation Dialog */}
      {pendingRoleChange && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-dark-navy/90 backdrop-blur-md">
          <Card className="w-full max-w-md border-amber-500/40 shadow-[0_0_50px_rgba(251,191,36,0.15)] bg-dark-navy">
            <CardHeader>
              <CardTitle className="text-xl font-cyber text-amber-400 flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                {isArabic ? 'تأكيد تغيير الرتبة والصلاحية' : 'CONFIRM ROLE CLEARANCE UPDATE'}
              </CardTitle>
              <CardDescription>
                {isArabic 
                  ? 'يرجى مراجعة وتأكيد هذا الإجراء قبل حفظه في قاعدة البيانات.' 
                  : 'Please verify and authorize this clearance modification.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-white/5 rounded-lg border border-white/10 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{isArabic ? 'العضو:' : 'Operative:'}</span>
                  <span className="font-bold text-white">{pendingRoleChange.user.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{isArabic ? 'البريد الإلكتروني:' : 'Email:'}</span>
                  <span className="font-mono text-neon-blue">{pendingRoleChange.user.email}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-white/5">
                  <span className="text-muted-foreground">{isArabic ? 'الرول الحالي:' : 'Current Role:'}</span>
                  <span className="px-2 py-0.5 rounded bg-white/10 text-white font-mono uppercase font-bold text-[10px]">
                    {pendingRoleChange.user.role}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{isArabic ? 'الرول الجديد:' : 'New Role:'}</span>
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono uppercase font-bold text-[10px]">
                    {pendingRoleChange.newRole}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button 
                  variant="ghost" 
                  onClick={() => setPendingRoleChange(null)}
                  className="text-xs"
                >
                  {isArabic ? 'إلغاء' : 'CANCEL'}
                </Button>
                <Button 
                  variant="cyber" 
                  onClick={confirmRoleChange}
                  className="text-xs bg-amber-500 text-black hover:bg-amber-400"
                >
                  {isArabic ? 'تأكيد التغيير الآن 👑' : 'AUTHORIZE ROLE CHANGE 👑'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-dark-navy/90 backdrop-blur-md">
          <Card className="w-full max-w-md border-destructive/40 shadow-[0_0_50px_rgba(239,68,68,0.15)] bg-dark-navy">
            <CardHeader>
              <CardTitle className="text-xl font-cyber text-destructive flex items-center gap-2">
                <ShieldAlert className="w-6 h-6" />
                DANGER_ZONE: REDACT OPERATIVE
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {isArabic 
                  ? 'هل أنت متأكد من حذف هذا العضو نهائياً من قاعدة البيانات السحابية؟ هذا الإجراء لا يمكن التراجع عنه.' 
                  : 'Are you sure you want to remove this operative from Supabase? This action is permanent.'}
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="ghost" onClick={() => setShowDeleteConfirm(null)}>
                  {isArabic ? 'إلغاء' : 'CANCEL'}
                </Button>
                <Button variant="destructive" onClick={() => deleteUser(showDeleteConfirm)}>
                  {isArabic ? 'تأكيد الحذف النهائي' : 'REDACT_OPERATIVE'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Operative Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-dark-navy/90 backdrop-blur-md">
          <Card className="w-full max-w-lg border-primary/30 shadow-[0_0_50px_rgba(57,255,20,0.1)] bg-dark-navy">
            <CardHeader>
              <CardTitle className="text-2xl font-cyber">{isArabic ? 'إضافة عضو جديد للنادي' : 'INITIALIZE_NEW_OPERATIVE'}</CardTitle>
              <CardDescription className="text-neon-blue font-mono text-[11px]">
                {isArabic ? 'يتم حفظ السجل في Supabase Auth & Profiles مباشرةً.' : 'Creates account directly in Supabase Cloud.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddUser} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-cyber uppercase tracking-widest text-muted-foreground">{isArabic ? 'الاسم بالكامل' : 'Full Name'}</label>
                  <Input 
                    placeholder="e.g. John Doe" 
                    value={newUser.fullName} 
                    onChange={(e) => setNewUser({...newUser, fullName: e.target.value})} 
                    required 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-cyber uppercase tracking-widest text-muted-foreground">{isArabic ? 'البريد الإلكتروني' : 'Email Address'}</label>
                  <Input 
                    type="email"
                    placeholder="operative@datacamp.club" 
                    value={newUser.email} 
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})} 
                    required 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-cyber uppercase tracking-widest text-muted-foreground">{isArabic ? 'كلمة المرور المبدئية' : 'Initial Password'}</label>
                  <Input 
                    type="password"
                    placeholder="Set temporary password" 
                    value={newUser.password} 
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})} 
                    required 
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-cyber uppercase tracking-widest text-muted-foreground">{isArabic ? 'الرول' : 'Assigned Role'}</label>
                    <select 
                      className="w-full bg-white/5 border border-white/10 rounded-md p-2 text-xs focus:ring-1 focus:ring-primary outline-none"
                      value={newUser.role}
                      onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    >
                      <option value="member" className="bg-dark-navy">Member</option>
                      <option value="super_admin" className="bg-dark-navy text-primary">Admin</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-cyber uppercase tracking-widest text-muted-foreground">{isArabic ? 'الكلية' : 'Faculty'}</label>
                    <select 
                      className="w-full bg-white/5 border border-white/10 rounded-md p-2 text-xs focus:ring-1 focus:ring-primary outline-none"
                      value={newUser.faculty}
                      onChange={(e) => setNewUser({...newUser, faculty: e.target.value})}
                    >
                      <option value="Computer Science" className="bg-dark-navy">Computer Science</option>
                      <option value="Engineering" className="bg-dark-navy">Engineering</option>
                      <option value="Nursing" className="bg-dark-navy">Nursing</option>
                      <option value="Physical Therapy" className="bg-dark-navy">Physical Therapy</option>
                      <option value="Business" className="bg-dark-navy">Business</option>
                      <option value="Arts" className="bg-dark-navy">Arts</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="ghost" type="button" onClick={() => setShowAddModal(false)}>{isArabic ? 'إلغاء' : 'ABORT'}</Button>
                  <Button variant="cyber" type="submit" disabled={loading}>
                    {loading ? (isArabic ? 'جاري الحفظ...' : 'SAVING...') : (isArabic ? 'تأكيد الإضافة ⚡' : 'CONFIRM_ENTRY')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* View User Activity Modal */}
      {viewingUser && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-dark-navy/90 backdrop-blur-md">
          <Card className="w-full max-w-2xl border-primary/30 shadow-[0_0_50px_rgba(57,255,20,0.1)] bg-dark-navy">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg overflow-hidden">
                  {viewingUser.photoURL ? (
                    <img src={viewingUser.photoURL} alt={viewingUser.fullName} className="w-full h-full object-cover" />
                  ) : (
                    viewingUser.fullName?.charAt(0) || '?'
                  )}
                </div>
                <div>
                  <CardTitle className="text-xl font-cyber">{viewingUser.fullName}</CardTitle>
                  <CardDescription className="text-xs font-mono text-primary/70">
                    ID: {viewingUser.memberId} • {viewingUser.email}
                  </CardDescription>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setViewingUser(null)}><XCircle className="w-5 h-5" /></Button>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-[10px] font-cyber uppercase tracking-widest text-muted-foreground mb-1">
                    {isArabic ? 'الرول' : 'Role'}
                  </p>
                  <span className="font-cyber font-bold text-white text-xs">{viewingUser.role}</span>
                </div>
                <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-[10px] font-cyber uppercase tracking-widest text-muted-foreground mb-1">
                    {isArabic ? 'طريقة التسجيل' : 'Provider'}
                  </p>
                  <span className="font-mono text-xs text-neon-blue uppercase">{viewingUser.provider || 'email'}</span>
                </div>
                <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-[10px] font-cyber uppercase tracking-widest text-muted-foreground mb-1">
                    {isArabic ? 'الدورات المسجلة' : 'Enrolled Courses'}
                  </p>
                  <span className="font-mono text-xs text-neon-green font-bold">{enrollmentCounts[viewingUser.id] || 0}</span>
                </div>
              </div>

              <div className="p-4 bg-white/5 rounded-lg border border-white/10 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{isArabic ? 'تاريخ الانضمام:' : 'Created At:'}</span>
                  <span className="font-mono text-white">{new Date(viewingUser.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{isArabic ? 'آخر نشاط / ظهور:' : 'Last Seen:'}</span>
                  <span className="font-mono text-neon-green">{formatTimeAgo(viewingUser.lastSeenAt, isArabic)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{isArabic ? 'الكلية:' : 'Faculty:'}</span>
                  <span className="font-bold text-white">{viewingUser.faculty || 'Engineering'}</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    const target = viewingUser;
                    setViewingUser(null);
                    setEditingRoleUser(target);
                  }}
                  className="text-xs gap-1.5"
                >
                  <Shield className="w-3.5 h-3.5" />
                  {isArabic ? 'تعديل الصلاحيات' : 'EDIT_PERMISSIONS'}
                </Button>
                <Button variant="cyber" onClick={() => setViewingUser(null)} className="text-xs">
                  {isArabic ? 'إغلاق' : 'CLOSE'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Role & Permissions Editor Modal */}
      {editingRoleUser && (
        <RoleEditorModal
          user={editingRoleUser}
          isOpen={!!editingRoleUser}
          onClose={() => setEditingRoleUser(null)}
          onSaveRole={async (userId, newRole) => {
            setPendingRoleChange({ user: editingRoleUser, newRole });
            setEditingRoleUser(null);
          }}
        />
      )}
    </div>
  );
};

export default UserManagement;
