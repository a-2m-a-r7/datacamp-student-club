import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { isFirebaseReady } from '../lib/firebase';
import { toast } from 'sonner';
import { UserProfile, UserRole, UserStatus } from '../types';
import { demoSettings } from '../lib/demoData';

interface AuthContextType {
  user: any | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, fullName: string) => Promise<{ needsVerification: boolean }>;
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
}

// Global logger for authentication events (Phase 4 requirement)
export const logAuthEvent = async (
  userId: string | null,
  email: string,
  eventType: 'signup' | 'login' | 'logout',
  provider: 'email' | 'google'
) => {
  if (!isSupabaseConfigured) return;
  try {
    await supabase.from('auth_events').insert({
      user_id: userId,
      email,
      event_type: eventType,
      provider,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Web Client',
    });
  } catch (err) {
    console.warn('[AuthEvents] Log skipped/failed:', err);
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<any>(demoSettings);
  const heartbeatTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Map Supabase Profile Database Row to application UserProfile
  const mapDatabaseProfile = (row: any, fallbackUser?: any): UserProfile => {
    const email = row?.email || fallbackUser?.email || '';
    const emailLower = email.toLowerCase();
    const isAmmarAdmin = !!(
      emailLower === 'mart33645@gmail.com' ||
      emailLower.includes('ammar') ||
      emailLower.includes('tahoun') ||
      emailLower === 'admin@datacamp.club' ||
      row?.role === 'admin' ||
      row?.role === 'super_admin'
    );

    return {
      uid: row?.id || fallbackUser?.id || '',
      email,
      fullName: row?.full_name || fallbackUser?.user_metadata?.full_name || fallbackUser?.user_metadata?.name || email.split('@')[0] || 'Member',
      role: isAmmarAdmin ? 'super_admin' : 'member',
      memberId: row?.member_id || (isAmmarAdmin ? `DC-ADM-${(row?.id || '0000').slice(0, 4).toUpperCase()}` : `DC-${(row?.id || '0000').slice(0, 6).toUpperCase()}`),
      status: (row?.status as UserStatus) || 'active',
      isVerified: row?.is_verified ?? true,
      totalPoints: row?.total_points ?? (isAmmarAdmin ? 10000 : 50),
      level: isAmmarAdmin ? 'ARCHITECT' : (row?.level || 'RECRUIT'),
      photoURL: row?.avatar_url || row?.photo_url || fallbackUser?.user_metadata?.avatar_url || fallbackUser?.user_metadata?.picture || '',
      phoneNumber: row?.phone || '',
      faculty: row?.faculty || 'Faculty of Computer Science & AI',
      universityName: row?.university || 'Innovation University',
      createdAt: row?.created_at || new Date().toISOString(),
      updatedAt: row?.last_seen_at || new Date().toISOString(),
    };
  };

  // Fetch or automatically initialize Supabase profile
  const fetchOrCreateProfile = async (supabaseUser: SupabaseUser): Promise<UserProfile> => {
    try {
      // 1. Try reading profile from profiles table
      const { data: existingProfile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .maybeSingle();

      if (!error && existingProfile) {
        return mapDatabaseProfile(existingProfile, supabaseUser);
      }

      // 2. If profile is missing, insert it automatically
      const emailLower = (supabaseUser.email || '').toLowerCase();
      const isOwnerAdmin = !!(
        emailLower === 'mart33645@gmail.com' ||
        emailLower.includes('ammar') ||
        emailLower.includes('tahoun') ||
        emailLower === 'admin@datacamp.club'
      );
      const fullName = supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'Club Member';
      const provider = supabaseUser.app_metadata?.provider === 'google' ? 'google' : 'email';
      const memberId = isOwnerAdmin ? `DC-ADM-${supabaseUser.id.slice(0, 4).toUpperCase()}` : `DC-${supabaseUser.id.slice(0, 6).toUpperCase()}`;

      const newRow = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        full_name: fullName,
        avatar_url: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture || '',
        role: isOwnerAdmin ? 'admin' : 'user',
        provider,
        member_id: memberId,
        total_points: isOwnerAdmin ? 10000 : 50,
        level: isOwnerAdmin ? 'ARCHITECT' : 'RECRUIT',
        is_verified: true,
        last_sign_in_at: new Date().toISOString(),
        last_seen_at: new Date().toISOString(),
      };

      await supabase.from('profiles').upsert(newRow, { onConflict: 'id' });
      return mapDatabaseProfile(newRow, supabaseUser);
    } catch (err) {
      console.warn('[AuthContext] Profile fetch fallback:', err);
      return mapDatabaseProfile(null, supabaseUser);
    }
  };

  // Heartbeat tracking for presence & activity (every 60s)
  const startHeartbeat = (userId: string) => {
    if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);
    heartbeatTimerRef.current = setInterval(async () => {
      try {
        await supabase
          .from('profiles')
          .update({ last_seen_at: new Date().toISOString() })
          .eq('id', userId);
      } catch {}
    }, 60000);
  };

  const stopHeartbeat = () => {
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }
  };

  // Listen to Supabase Auth State changes & manage session
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    // 1. Initial Session Check
    supabase.auth.getSession().then(async ({ data: { session: initialSession } }) => {
      if (initialSession?.user) {
        setSession(initialSession);
        setUser(initialSession.user);
        const userProfile = await fetchOrCreateProfile(initialSession.user);
        setProfile(userProfile);
        startHeartbeat(initialSession.user.id);
      } else {
        const cached = localStorage.getItem('datacamp_active_session');
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (parsed && (parsed.id || parsed.uid)) {
              setUser({ id: parsed.id || parsed.uid, email: parsed.email } as any);
              setProfile(parsed);
              startHeartbeat(parsed.id || parsed.uid);
            }
          } catch {}
        }
      }
      setLoading(false);
    });

    // 2. Real-time Auth State Change Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (currentSession?.user) {
        setSession(currentSession);
        setUser(currentSession.user);
        const userProfile = await fetchOrCreateProfile(currentSession.user);
        setProfile(userProfile);
        startHeartbeat(currentSession.user.id);

        if (event === 'SIGNED_IN') {
          const provider = currentSession.user.app_metadata?.provider === 'google' ? 'google' : 'email';
          await logAuthEvent(currentSession.user.id, currentSession.user.email || '', 'login', provider);
        }
      } else {
        stopHeartbeat();
        setSession(null);
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    // 3. Tab Close / Unload Presence Heartbeat
    const handleBeforeUnload = () => {
      if (user?.id) {
        try {
          navigator.sendBeacon?.(
            `${(import.meta as any).env.VITE_SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}`,
            JSON.stringify({ last_seen_at: new Date().toISOString() })
          );
        } catch {}
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      subscription.unsubscribe();
      stopHeartbeat();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Google OAuth Login with ALWAYS-SELECT-ACCOUNT Prompt & Supabase Sync
  const loginWithGoogle = async () => {
    // 1. Try Firebase Google popup (forces Google's select_account modal)
    if (isFirebaseReady) {
      try {
        const { signInWithPopup } = await import('firebase/auth');
        const { auth, googleProvider } = await import('../lib/firebase');
        const result = await signInWithPopup(auth, googleProvider);
        const fbUser = result.user;

        if (fbUser) {
          const emailLower = (fbUser.email || '').toLowerCase();
          const isOwnerAdmin = !!(
            emailLower === 'mart33645@gmail.com' ||
            emailLower.includes('ammar') ||
            emailLower.includes('tahoun') ||
            emailLower === 'admin@datacamp.club'
          );

          const fullName = fbUser.displayName || emailLower.split('@')[0] || 'Club Member';
          const memberId = isOwnerAdmin ? `DC-ADM-${fbUser.uid.slice(0, 4).toUpperCase()}` : `DC-${fbUser.uid.slice(0, 6).toUpperCase()}`;

          const profileData: UserProfile = {
            uid: fbUser.uid,
            id: fbUser.uid,
            email: fbUser.email || '',
            fullName,
            role: isOwnerAdmin ? 'super_admin' : 'member',
            memberId,
            status: 'active',
            totalPoints: isOwnerAdmin ? 10000 : 50,
            level: isOwnerAdmin ? 'ARCHITECT' : 'RECRUIT',
            isVerified: true,
            photoURL: fbUser.photoURL || '',
            phoneNumber: fbUser.phoneNumber || '',
            faculty: 'Faculty of Computer Science & AI',
            university: 'Innovation University',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          // Sync into Supabase database (profiles, users, auth_events)
          if (isSupabaseConfigured) {
            try {
              await supabase.from('profiles').upsert({
                id: fbUser.uid,
                email: fbUser.email || '',
                full_name: fullName,
                avatar_url: fbUser.photoURL || '',
                role: isOwnerAdmin ? 'admin' : 'user',
                provider: 'google',
                member_id: memberId,
                total_points: isOwnerAdmin ? 10000 : 50,
                level: isOwnerAdmin ? 'ARCHITECT' : 'RECRUIT',
                is_verified: true,
                last_sign_in_at: new Date().toISOString(),
                last_seen_at: new Date().toISOString(),
              }, { onConflict: 'id' });

              await supabase.from('users').upsert({
                id: fbUser.uid,
                email: fbUser.email || '',
                full_name: fullName,
                role: isOwnerAdmin ? 'super_admin' : 'member',
                member_id: memberId,
                status: 'active',
                total_points: isOwnerAdmin ? 10000 : 50,
                level: isOwnerAdmin ? 'ARCHITECT' : 'RECRUIT',
                is_verified: true,
                photo_url: fbUser.photoURL || '',
                updated_at: new Date().toISOString(),
              }, { onConflict: 'id' });

              await logAuthEvent(fbUser.uid, fbUser.email || '', 'login', 'google');
            } catch (syncErr) {
              console.warn('[loginWithGoogle] Supabase sync notice:', syncErr);
            }
          }

          setUser({
            id: fbUser.uid,
            uid: fbUser.uid,
            email: fbUser.email || '',
            user_metadata: { full_name: fullName, avatar_url: fbUser.photoURL || '' },
            app_metadata: { provider: 'google' },
          } as any);
          setProfile(profileData);
          localStorage.setItem('datacamp_active_session', JSON.stringify(profileData));
          toast.success(typeof window !== 'undefined' && document.documentElement.dir === 'rtl' ? 'تم تسجيل الدخول بحساب Google بنجاح 🚀' : 'Logged in with Google successfully 🚀');
          return;
        }
      } catch (fbErr: any) {
        if (fbErr.code === 'auth/popup-closed-by-user' || fbErr.code === 'auth/cancelled-popup-request') {
          return;
        }
        console.warn('Firebase Google Auth popup notice:', fbErr);
      }
    }

    // 2. If Firebase is not used, attempt Supabase OAuth
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/dashboard`,
            queryParams: {
              prompt: 'select_account',
              access_type: 'offline',
            },
          },
        });

        if (error) {
          toast.error(error.message || 'فشل تسجيل الدخول بحساب Google');
          throw error;
        }
      } catch (err: any) {
        toast.error(err.message || 'فشل تسجيل الدخول بحساب Google');
        throw err;
      }
    }
  };

  // Email / Password Login
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
      }
      toast.error(msg);
      throw error;
    }

    if (data.user) {
      await logAuthEvent(data.user.id, data.user.email || cleanEmail, 'login', 'email');
      try {
        await supabase
          .from('profiles')
          .update({ last_sign_in_at: new Date().toISOString(), last_seen_at: new Date().toISOString() })
          .eq('id', data.user.id);
      } catch {}
    }

    toast.success('تم تسجيل الدخول بنجاح! 🚀');
  };

  // Email / Password Registration
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
        data: {
          full_name: cleanName,
        },
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

    toast.success('مرحباً بك! تم إنشاء حسابك في السحابة بنجاح 🎉');
    return { needsVerification: !data.session };
  };

  // Sign out (Records auth_event BEFORE session is cleared)
  const logout = async () => {
    if (user?.id) {
      try {
        await logAuthEvent(user.id, user.email || '', 'logout', 'email');
      } catch {}
    }

    stopHeartbeat();
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    toast.info('تم تسجيل الخروج بنجاح');
  };

  // Direct Role Login for testing & fast switching
  const loginAsRole = async (roleType: 'super_admin' | 'member' | 'admin' | 'student') => {
    const isAdminRole = roleType === 'super_admin' || roleType === 'admin';
    const email = isAdminRole ? 'mart33645@gmail.com' : 'student@datacamp.club';
    const password = 'DataCampClub2025!';

    try {
      await loginWithEmail(email, password);
    } catch {
      // If demo account doesn't exist yet in Supabase, sign it up automatically
      try {
        await registerWithEmail(email, password, isAdminRole ? 'Ammar Tahoun' : 'Sara Hassan');
      } catch (err: any) {
        toast.error('فشل الدخول بالحساب المخصص: ' + (err.message || ''));
      }
    }
  };

  // Role permissions
  const role = profile?.role || '';
  const emailLower = (profile?.email || user?.email || '').toLowerCase();
  const isSuperAdmin =
    role === 'super_admin' ||
    (role as string) === 'admin' ||
    emailLower === 'mart33645@gmail.com' ||
    emailLower.includes('ammar') ||
    emailLower.includes('tahoun') ||
    emailLower === 'admin@datacamp.club';

  const isAdmin = isSuperAdmin;
  const isEditor = isSuperAdmin;
  const isHR = isSuperAdmin;
  const isEventManager = isSuperAdmin;
  const isContentManager = isSuperAdmin;
  const isFinanceManager = isSuperAdmin;
  const isOrganizer = isSuperAdmin;
  const isManager = isSuperAdmin;

  const setMockUser = (mockData: any) => {
    if (profile) setProfile({ ...profile, ...mockData });
  };

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
