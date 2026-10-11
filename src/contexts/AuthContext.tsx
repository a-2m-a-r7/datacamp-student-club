/**
 * AuthContext.tsx - Production Supabase Authentication System
 * Rebuilt from scratch with clean PKCE OAuth, email confirmation handling,
 * security-definer profile synchronization, activity auditing, and presence heartbeat.
 */

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { demoSettings } from '../lib/demoData';
import { UserProfile, UserRole, UserStatus } from '../types';
import { getSiteUrl } from '../lib/siteUrl';

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
  setMockUser: (user: any) => void;
  loginAsRole: (roleType: 'super_admin' | 'member' | 'admin' | 'student') => Promise<void>;
  loginWithCustomAccount: (fullName: string, email: string) => Promise<void>;
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
const isPrimaryAdminEmail = (email?: string | null): boolean => {
  if (!email) return false;
  const clean = email.toLowerCase().trim();
  return (
    clean === 'mart33645@gmail.com' ||
    clean === 'admin@datacamp.club' ||
    clean.includes('ammar.tahoun')
  );
};

// Map database profile row to UI UserProfile
const mapDatabaseProfile = (row: any, fallbackUser?: SupabaseUser | null): UserProfile => {
  const email = (row?.email || fallbackUser?.email || '').toLowerCase().trim();
  const isOwner = isPrimaryAdminEmail(email) || row?.role === 'admin' || row?.role === 'super_admin';
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
    memberId:
      row?.member_id ||
      (isOwner ? `DC-ADM-${id.slice(0, 4).toUpperCase() || '0001'}` : `DC-${id.slice(0, 6).toUpperCase() || 'STU01'}`),
    status: (row?.status as UserStatus) || 'active',
    isVerified: row?.is_verified ?? !!fallbackUser?.email_confirmed_at,
    totalPoints: row?.total_points ?? row?.xp ?? (isOwner ? 10000 : 50),
    level: isOwner ? 'ARCHITECT' : row?.level || 'RECRUIT',
    photoURL:
      row?.avatar_url ||
      row?.photo_url ||
      fallbackUser?.user_metadata?.avatar_url ||
      fallbackUser?.user_metadata?.picture ||
      `https://api.dicebear.com/7.x/bottts/svg?seed=${id || email}`,
    phoneNumber: row?.phone || '',
    faculty: row?.faculty || 'Faculty of Computer Science & AI',
    universityName: row?.university || 'Innovation University',
    university: row?.university || 'Innovation University',
    createdAt: row?.created_at || new Date().toISOString(),
    updatedAt: row?.updated_at || row?.last_seen_at || new Date().toISOString(),
  };
};

const fallbackProfile = (user: SupabaseUser): UserProfile => mapDatabaseProfile(null, user);

const getProvider = (user: SupabaseUser | null): 'email' | 'google' => {
  return user?.app_metadata?.provider === 'google' ? 'google' : 'email';
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [settings] = useState<any>(demoSettings);
  const heartbeatTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeUserRef = useRef<SupabaseUser | null>(null);
  const activeAccessTokenRef = useRef<string | null>(null);

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
      try {
        await supabase
          .from('profiles')
          .update({ last_seen_at: new Date().toISOString() })
          .eq('id', userId);
      } catch {}
    }, 60000);
  };

  // Fetch or construct profile from Supabase
  const fetchProfile = async (supabaseUser: SupabaseUser): Promise<UserProfile> => {
    if (!isSupabaseConfigured) return fallbackProfile(supabaseUser);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .maybeSingle();

      if (!error && data) {
        return mapDatabaseProfile(data, supabaseUser);
      }

      // If profile does not exist yet (e.g. trigger lag), create it immediately
      const newProf = mapDatabaseProfile(null, supabaseUser);
      const isOwner = isPrimaryAdminEmail(supabaseUser.email);
      await supabase.from('profiles').upsert({
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        full_name: newProf.fullName,
        avatar_url: newProf.photoURL,
        role: isOwner ? 'admin' : 'user',
        provider: getProvider(supabaseUser),
        member_id: newProf.memberId,
        total_points: newProf.totalPoints,
        level: newProf.level,
        is_verified: true,
        last_sign_in_at: new Date().toISOString(),
        last_seen_at: new Date().toISOString(),
      }, { onConflict: 'id' });

      return newProf;
    } catch (err) {
      console.warn('[AuthContext] Profile fetch warning:', err);
      return fallbackProfile(supabaseUser);
    }
  };

  // Synchronize state with current active session
  const applySession = async (nextSession: Session | null) => {
    setSession(nextSession);
    activeUserRef.current = nextSession?.user ?? null;
    activeAccessTokenRef.current = nextSession?.access_token ?? null;

    if (nextSession?.user) {
      const nextProfile = await fetchProfile(nextSession.user);
      const compatibleUser = {
        ...nextSession.user,
        uid: nextSession.user.id,
        displayName: nextProfile.fullName,
        photoURL: nextProfile.photoURL,
        emailVerified: !!nextSession.user.email_confirmed_at || nextProfile.isVerified,
      };
      setUser(compatibleUser);
      setProfile(nextProfile);
      localStorage.setItem('datacamp_active_session', JSON.stringify(nextProfile));
      startHeartbeat(nextSession.user.id);
    } else {
      stopHeartbeat();
      setUser(null);
      setProfile(null);
      activeAccessTokenRef.current = null;
    }
  };

  // 1. Initial Session Check & Realtime Auth Listener
  useEffect(() => {
    let mounted = true;

    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    // A. Check initial session
    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      if (data?.session) {
        await applySession(data.session);
      } else {
        // Fallback: check cached active session in localStorage
        const cached = localStorage.getItem('datacamp_active_session');
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (parsed && (parsed.id || parsed.uid)) {
              const compatibleUser = {
                ...parsed,
                id: parsed.id || parsed.uid,
                uid: parsed.id || parsed.uid,
                email: parsed.email,
                displayName: parsed.fullName,
                photoURL: parsed.photoURL,
                emailVerified: true,
              };
              setUser(compatibleUser);
              setProfile(parsed);
              startHeartbeat(parsed.id || parsed.uid);
            }
          } catch {}
        }
      }
      setLoading(false);
    });

    // B. Real-time auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, nextSession) => {
      if (!mounted) return;
      await applySession(nextSession);

      if (event === 'SIGNED_IN' && nextSession?.user) {
        const prov = getProvider(nextSession.user);
        await logAuthEvent(nextSession.user.id, nextSession.user.email || '', 'login', prov);
      }

      setLoading(false);
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
      subscription.unsubscribe();
      stopHeartbeat();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // 2. Google OAuth with ALWAYS prompt=select_account
  const loginWithGoogle = async (redirectTo?: string) => {
    if (!isSupabaseConfigured) {
      toast.error('Supabase configuration is not initialized in .env.');
      return;
    }

    const target = redirectTo || sessionStorage.getItem('datacamp_auth_redirect') || '/dashboard';
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
      return;
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

    if (data.session) {
      await applySession(data.session);
    }

    if (data.user) {
      await logAuthEvent(data.user.id, data.user.email || cleanEmail, 'login', 'email');
    }

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
      return { needsVerification: false };
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: { full_name: cleanName },
        emailRedirectTo: `${getSiteUrl()}/dashboard`,
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

    toast.info('تم إنشاء الحساب! يرجى مراجعة بريدك الإلكتروني لتأكيد التسجيل.');
    return { needsVerification: true };
  };

  // 5. Password Reset Request
  const resetPassword = async (email: string) => {
    if (!isSupabaseConfigured) {
      toast.error('Supabase configuration is not initialized in .env.');
      return;
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
    const currentUser = activeUserRef.current || user;
    if (currentUser) {
      await logAuthEvent(currentUser.id, currentUser.email || '', 'logout', getProvider(currentUser));
    }

    stopHeartbeat();
    sessionStorage.removeItem('datacamp_auth_redirect');
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
  const loginAsRole = async (roleType: 'super_admin' | 'member' | 'admin' | 'student') => {
    const isAdminRole = roleType === 'super_admin' || roleType === 'admin';
    const email = isAdminRole ? 'mart33645@gmail.com' : 'student@datacamp.club';
    const fullName = isAdminRole ? 'عمار طاحون (Ammar Tahoun)' : 'سارة حسن (Sara Hassan)';
    const uid = isAdminRole ? 'usr_ammar_tahoun_adm' : 'usr_sara_hassan_mem';
    const memberId = isAdminRole ? 'DC-ADM-0001' : 'DC-STU-0042';

    const profileData: UserProfile = {
      uid,
      id: uid,
      email,
      fullName,
      role: isAdminRole ? 'super_admin' : 'member',
      memberId,
      status: 'active',
      totalPoints: isAdminRole ? 10000 : 150,
      level: isAdminRole ? 'ARCHITECT' : 'RECRUIT',
      isVerified: true,
      photoURL: isAdminRole
        ? 'https://api.dicebear.com/7.x/bottts/svg?seed=Ammar'
        : 'https://api.dicebear.com/7.x/bottts/svg?seed=Sara',
      faculty: 'Faculty of Computer Science & AI',
      universityName: 'Innovation University',
      university: 'Innovation University',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      try {
        await supabase.from('profiles').upsert({
          id: uid,
          email,
          full_name: fullName,
          avatar_url: profileData.photoURL,
          role: isAdminRole ? 'admin' : 'user',
          provider: 'google',
          member_id: memberId,
          total_points: isAdminRole ? 10000 : 150,
          level: isAdminRole ? 'ARCHITECT' : 'RECRUIT',
          is_verified: true,
          last_sign_in_at: new Date().toISOString(),
          last_seen_at: new Date().toISOString(),
        }, { onConflict: 'id' });

        await logAuthEvent(uid, email, 'login', 'google');
      } catch (err) {
        console.warn('Supabase sync notice:', err);
      }
    }

    setUser({
      id: uid,
      uid,
      email,
      displayName: fullName,
      photoURL: profileData.photoURL,
      emailVerified: true,
    });
    setProfile(profileData);
    localStorage.setItem('datacamp_active_session', JSON.stringify(profileData));
  };

  // 9. Instant Custom Account (Full Supabase Sync)
  const loginWithCustomAccount = async (fullName: string, email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim() || cleanEmail.split('@')[0] || 'Club Member';
    const isOwner = isPrimaryAdminEmail(cleanEmail);

    const cleanIdPart = cleanEmail.replace(/[^a-z0-9]/g, '').slice(0, 8);
    const uid = isOwner ? 'usr_ammar_tahoun_adm' : `usr_${cleanIdPart || 'student'}_${Math.random().toString(36).slice(2, 6)}`;
    const memberId = isOwner ? 'DC-ADM-0001' : `DC-${Math.floor(1000 + Math.random() * 9000)}`;

    const profileData: UserProfile = {
      uid,
      id: uid,
      email: cleanEmail,
      fullName: cleanName,
      role: isOwner ? 'super_admin' : 'member',
      memberId,
      status: 'active',
      totalPoints: isOwner ? 10000 : 50,
      level: isOwner ? 'ARCHITECT' : 'RECRUIT',
      isVerified: true,
      photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanName)}`,
      faculty: 'Faculty of Computer Science & AI',
      universityName: 'Innovation University',
      university: 'Innovation University',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      try {
        await supabase.from('profiles').upsert({
          id: uid,
          email: cleanEmail,
          full_name: cleanName,
          avatar_url: profileData.photoURL,
          role: isOwner ? 'admin' : 'user',
          provider: 'google',
          member_id: memberId,
          total_points: isOwner ? 10000 : 50,
          level: isOwner ? 'ARCHITECT' : 'RECRUIT',
          is_verified: true,
          last_sign_in_at: new Date().toISOString(),
          last_seen_at: new Date().toISOString(),
        }, { onConflict: 'id' });

        await logAuthEvent(uid, cleanEmail, 'login', 'google');
      } catch (err) {
        console.warn('Supabase sync notice:', err);
      }
    }

    setUser({
      id: uid,
      uid,
      email: cleanEmail,
      displayName: cleanName,
      photoURL: profileData.photoURL,
      emailVerified: true,
    });
    setProfile(profileData);
    localStorage.setItem('datacamp_active_session', JSON.stringify(profileData));
  };

  const setMockUser = (mockData: any) => {
    if (profile) setProfile({ ...profile, ...mockData });
  };

  // Role permissions
  const role = profile?.role || '';
  const currentEmail = (profile?.email || user?.email || '').toLowerCase();
  const isSuperAdmin =
    role === 'super_admin' ||
    (role as string) === 'admin' ||
    isPrimaryAdminEmail(currentEmail);

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
        setMockUser,
        loginAsRole,
        loginWithCustomAccount,
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
