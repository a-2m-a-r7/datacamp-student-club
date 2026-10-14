/**
 * AuthContext.tsx - Production Supabase Authentication System
 * Supabase-managed OAuth callbacks, email confirmation handling,
 * security-definer profile synchronization, activity auditing, and presence heartbeat.
 */

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { defaultSettings } from '../lib/defaultContent';
import { contentService } from '../services/contentService';
import { UserProfile, UserRole, UserStatus } from '../types';
import { getSiteUrl } from '../lib/siteUrl';
import { watchQuery } from '../lib/watchQuery';
import { safeAuthRedirect } from '../lib/authRedirect';

interface AuthContextType {
  user: any | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
  loginWithGoogle: (redirectTo?: string) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, fullName: string) => Promise<{ needsVerification: boolean }>;
  resetPassword: (email: string) => Promise<void>;
  switchAccount: () => Promise<void>;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isEditor: boolean;
  isHR: boolean;
  isEventManager: boolean;
  isContentManager: boolean;
  isFinanceManager: boolean;
  isOrganizer: boolean;
  isManager: boolean;
  settings: any;
  refreshProfile: () => Promise<void>;



}

// Global logger for authentication events (Auditing Phase)
export const logAuthEvent = async (
  userId: string | null,
  email: string,
  eventType: 'signup' | 'login' | 'logout',
  provider: 'email' | 'google'
) => {
  if (!isSupabaseConfigured || !email) return;

  try {
    await supabase.from('auth_events').insert({
      user_id: userId || null,
      email: email.trim().toLowerCase(),
      event_type: eventType,
      provider,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Web Client',
    });
  } catch (err) {
    console.warn('[AuthEvents] Log skipped/failed:', err);
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to determine if an email belongs to the primary admin


// Map database profile row to UI UserProfile
const mapDatabaseProfile = (row: any, fallbackUser?: SupabaseUser | null): UserProfile => {
  const email = (row?.email || fallbackUser?.email || '').toLowerCase().trim();
  const isOwner = row?.role === 'admin' || row?.role === 'super_admin';
  const id = row?.id || fallbackUser?.id || '';

  return {
    uid: id,
    id,
    email,
    fullName:
      row?.full_name ||
      fallbackUser?.user_metadata?.full_name ||
      fallbackUser?.user_metadata?.name ||
      email.split('@')[0] ||
      'Member',
    role: isOwner ? 'super_admin' : 'member',
    memberId: row?.member_id || '',
    status: (row?.status as UserStatus) || 'active',
    isVerified: row?.is_verified ?? !!fallbackUser?.email_confirmed_at,
    totalPoints: row?.total_points ?? row?.xp ?? 0,
    level: isOwner ? 'ARCHITECT' : row?.level || 'RECRUIT',
    photoURL:
      row?.avatar_url ||
      row?.photo_url ||
      fallbackUser?.user_metadata?.avatar_url ||
      fallbackUser?.user_metadata?.picture ||
      `https://api.dicebear.com/7.x/bottts/svg?seed=${id || email}`,
    phoneNumber: row?.phone || '',
    faculty: row?.faculty || '',
    universityName: row?.university || '',
    university: row?.university || '',
    createdAt: row?.created_at || new Date().toISOString(),
    updatedAt: row?.updated_at || row?.last_seen_at || new Date().toISOString(),
  };
};


const getProvider = (user: SupabaseUser | null): 'email' | 'google' => {
  return user?.app_metadata?.provider === 'google' ? 'google' : 'email';
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<any>(defaultSettings);
  useEffect(() => {
    let active = true;
    const load = () => contentService.getSetting('general').then(value => {
      if (active) setSettings({ ...defaultSettings, ...value });
    }).catch(() => {});
    load();
    const unsubscribe = contentService.subscribe('settings', load);
    return () => { active = false; unsubscribe(); };
  }, []);
  const heartbeatTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeUserRef = useRef<SupabaseUser | null>(null);
  const activeAccessTokenRef = useRef<string | null>(null);
  const sessionRevision = useRef(0);
  const refreshProfile = async () => {
    const activeUser = activeUserRef.current;
    const revision = sessionRevision.current;
    if (!activeUser) throw new Error('Authentication required.');
    const { data, error } = await supabase.from('profiles').select('*').eq('id', activeUser.id).single();
    if (error) throw error;
    if (revision === sessionRevision.current && activeUserRef.current?.id === activeUser.id) setProfile(mapDatabaseProfile(data, activeUser));
  };
  useEffect(() => {
    if (!user?.id || !isSupabaseConfigured) return;
    const identity = activeUserRef.current;
    return watchQuery(async () => {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (error) throw error;
      return data;
    }, row => { if (activeUserRef.current?.id === user.id) setProfile(mapDatabaseProfile(row, identity)); }, refresh => {
      const channel = supabase.channel(`account_profile_${user.id}`).on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` }, refresh).subscribe();
      return () => { supabase.removeChannel(channel); };
    }, false);
  }, [user?.id]);

  // Stop heartbeat timer
  const stopHeartbeat = () => {
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }
  };

  // Start presence heartbeat (updates last_seen_at in profiles table every 60 seconds)
  const startHeartbeat = (userId: string) => {
    stopHeartbeat();
    if (!isSupabaseConfigured || !userId) return;

    heartbeatTimerRef.current = setInterval(async () => {
      if (document.visibilityState === 'hidden' || !navigator.onLine) return;
      try {
        await supabase
          .from('profiles')
          .update({ last_seen_at: new Date().toISOString() })
          .eq('id', userId);
      } catch {}
    }, 60000 + Math.random() * 15000);
  };

  // Fetch or construct profile from Supabase
  const fetchProfile = async (supabaseUser: SupabaseUser): Promise<UserProfile | null> => {
    if (!isSupabaseConfigured) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .maybeSingle();

      if (!error && data) {
        return mapDatabaseProfile(data, supabaseUser);
      }

      if (error) throw error;
      return null;
    } catch (err) {
      console.warn('[AuthContext] Profile fetch warning:', err);
      return null;
    }
  };

  // Synchronize state with current active session
  const applySession = async (nextSession: Session | null) => {
    const revision = ++sessionRevision.current;
    if (activeUserRef.current?.id !== nextSession?.user?.id) {
      setUser(null); setProfile(null); setLoading(true);
    }
    setSession(nextSession);
    activeUserRef.current = nextSession?.user ?? null;
    activeAccessTokenRef.current = nextSession?.access_token ?? null;

    if (nextSession?.user) {
      const nextProfile = await fetchProfile(nextSession.user);
      if (revision !== sessionRevision.current) return false;
      const compatibleUser = {
        ...nextSession.user,
        uid: nextSession.user.id,
        displayName: nextProfile?.fullName || '',
        photoURL: nextProfile?.photoURL || '',
        emailVerified: !!nextSession.user.email_confirmed_at,
      };
      setUser(compatibleUser);
      setProfile(nextProfile);
      startHeartbeat(nextSession.user.id);
    } else {
      stopHeartbeat();
      setUser(null);
      setProfile(null);
      activeAccessTokenRef.current = null;
    }
    setLoading(false);
    return true;
  };

  // 1. Initial Session Check & Realtime Auth Listener
  useEffect(() => {
    let mounted = true;

    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    localStorage.removeItem('datacamp_active_session');
    // A. Check initial session
    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      const applied = await applySession(data?.session || null);
      if (mounted && applied) setLoading(false);
    }).catch(() => { if (mounted) { setLoading(false); toast.error('Unable to restore your session. Please sign in again.'); } });

    // B. Real-time auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setTimeout(async () => {
      if (!mounted) return;
      const applied = await applySession(nextSession);
      if (!mounted || !applied) return;

      if (event === 'SIGNED_IN' && nextSession?.user) {
        const prov = getProvider(nextSession.user);
        await logAuthEvent(nextSession.user.id, nextSession.user.email || '', 'login', prov);
      }

      setLoading(false);
      }, 0);
    });

    // C. Handle tab close/unload presence
    const handleBeforeUnload = () => {
      const currentUser = activeUserRef.current;
      const accessToken = activeAccessTokenRef.current;
      if (!currentUser || !accessToken || !isSupabaseConfigured) return;

      const payload = JSON.stringify({ last_seen_at: new Date().toISOString() });
      fetch(
        `${(import.meta as any).env.VITE_SUPABASE_URL}/rest/v1/profiles?id=eq.${currentUser.id}`,
        {
          method: 'PATCH',
          headers: {
            apikey: (import.meta as any).env.VITE_SUPABASE_ANON_KEY,
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
          },
          body: payload,
          keepalive: true,
        }
      ).catch(() => {});
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      mounted = false;
      sessionRevision.current++;
      subscription.unsubscribe();
      stopHeartbeat();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // 2. Google OAuth with ALWAYS prompt=select_account
  const loginWithGoogle = async (redirectTo?: string) => {
    if (!isSupabaseConfigured) {
      toast.error('Supabase configuration is not initialized in .env.');
      throw new Error('Authentication service is not configured.');
    }

    const target = safeAuthRedirect(redirectTo || sessionStorage.getItem('datacamp_auth_redirect'));
    sessionStorage.setItem('datacamp_auth_redirect', target);

    const redirectUri = `${getSiteUrl()}/auth/callback`;

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUri,
          queryParams: {
            prompt: 'select_account',
            access_type: 'offline',
          },
        },
      });

      if (error) {
        // If Google provider is not yet enabled in the Supabase Dashboard, explain clearly
        if (error.message.includes('not enabled') || error.message.includes('validation_failed')) {
          toast.error('مزود Google غير مفعّل بعد في لوحة Supabase. يرجى تفعيله من Settings > Auth Providers.');
        } else {
          toast.error(error.message || 'فشل بدء تسجيل الدخول بحساب Google');
        }
        throw error;
      }
    } catch (err: any) {
      console.warn('[AuthContext] Google signInWithOAuth notice:', err);
      throw err;
    }
  };

  // 3. Email & Password Login
  const loginWithEmail = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      toast.error('Supabase configuration is not initialized in .env.');
      throw new Error('Authentication service is not configured.');
    }

    const cleanEmail = email.trim().toLowerCase();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      let msg = error.message;
      if (error.message.includes('Invalid login credentials')) {
        msg = 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
      } else if (error.message.includes('Email not confirmed')) {
        msg = 'يرجى تأكيد بريدك الإلكتروني عبر الرابط المرسل إليك.';
      } else if (error.message.includes('rate limit') || error.message.includes('too many requests')) {
        msg = 'تم تجاوز عدد المحاولات المسموح به. يرجى الانتظار قليلاً.';
      }
      toast.error(msg);
      throw error;
    }

    if (!data.session || !data.user) { toast.error('Authentication did not return a valid session.'); throw new Error('Authentication did not return a valid session.'); }
    await applySession(data.session);

    toast.success('تم تسجيل الدخول بنجاح! 🚀');
  };

  // 4. Email & Password Registration
  const registerWithEmail = async (
    email: string,
    password: string,
    fullName: string
  ): Promise<{ needsVerification: boolean }> => {
    if (!isSupabaseConfigured) {
      toast.error('Supabase configuration is not initialized in .env.');
      throw new Error('Authentication service is not configured.');
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: { full_name: cleanName },
        emailRedirectTo: `${getSiteUrl()}/auth/callback`,
      },
    });

    if (error) {
      let msg = error.message;
      if (error.message.includes('User already registered')) {
        msg = 'هذا البريد الإلكتروني مسجل بالفعل. يرجى تسجيل الدخول.';
      }
      toast.error(msg);
      throw error;
    }

    if (data.user) {
      await logAuthEvent(data.user.id, cleanEmail, 'signup', 'email');
    }

    if (data.session) {
      await applySession(data.session);
      toast.success('مرحباً بك! تم إنشاء حسابك في السحابة بنجاح 🎉');
      return { needsVerification: false };
    }

    sessionStorage.setItem('datacamp_pending_verification_email', cleanEmail);
    toast.info('يرجى مراجعة بريدك الإلكتروني لتأكيد التسجيل ثم تسجيل الدخول.');
    return { needsVerification: true };
  };

  // 5. Password Reset Request
  const resetPassword = async (email: string) => {
    if (!isSupabaseConfigured) {
      toast.error('Supabase configuration is not initialized in .env.');
      throw new Error('Authentication service is not configured.');
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${getSiteUrl()}/reset-password`,
    });

    if (error) {
      toast.error(error.message || 'فشل إرسال رابط استعادة كلمة المرور');
      throw error;
    }

    toast.success('تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني');
  };

  // 6. Sign out (Records logout in auth_events BEFORE session is cleared)
  const logout = async () => {
    sessionRevision.current++;
    const currentUser = activeUserRef.current || user;
    if (currentUser) {
      await logAuthEvent(currentUser.id, currentUser.email || '', 'logout', getProvider(currentUser));
    }

    stopHeartbeat();
    sessionStorage.removeItem('datacamp_auth_redirect');
    sessionStorage.removeItem('datacamp_pending_verification_email');
    localStorage.removeItem('datacamp_active_session');

    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut({ scope: 'local' });
      } catch {}
    }

    setSession(null);
    setUser(null);
    setProfile(null);
    activeUserRef.current = null;
    activeAccessTokenRef.current = null;
    toast.info('تم تسجيل الخروج بنجاح');
  };

  // 7. Switch Account (Logs out, then prompts account selection)
  const switchAccount = async () => {
    await logout();
    await loginWithGoogle();
  };

  // 8. Instant Role Authentication (Full Supabase Sync)


  // 9. Instant Custom Account (Full Supabase Sync)




  // Role permissions
  const role = profile?.role || '';

  const isSuperAdmin =
    Boolean(session && user?.email_confirmed_at && profile?.status === 'active' &&
      (role === 'super_admin' || (role as string) === 'admin'));

  const isAdmin = isSuperAdmin;
  const isEditor = isSuperAdmin;
  const isHR = isSuperAdmin;
  const isEventManager = isSuperAdmin;
  const isContentManager = isSuperAdmin;
  const isFinanceManager = isSuperAdmin;
  const isOrganizer = isSuperAdmin;
  const isManager = isSuperAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        logout,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        resetPassword,
        switchAccount,
        isSuperAdmin,
        isAdmin,
        isEditor,
        isHR,
        isEventManager,
        isContentManager,
        isFinanceManager,
        isOrganizer,
        isManager,
        settings,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default AuthContext;
