import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { demoSettings } from '../lib/demoData';
import { UserProfile, UserStatus } from '../types';

interface AuthContextType {
  user: any | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
  loginWithGoogle: (redirectTo?: string) => Promise<void>;
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
  loginWithCustomAccount: (fullName: string, email: string) => Promise<void>;
}

export const logAuthEvent = async (
  userId: string | null,
  email: string,
  eventType: 'signup' | 'login' | 'logout',
  provider: 'email' | 'google'
) => {
  if (!isSupabaseConfigured || !userId) return;

  const { error } = await supabase.from('auth_events').insert({
    user_id: userId,
    email,
    event_type: eventType,
    provider,
    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Web Client',
  });

  if (error) {
    console.warn('[AuthEvents] Log skipped/failed:', error);
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mapDatabaseProfile = (row: any, fallbackUser?: SupabaseUser): UserProfile => {
  const email = row?.email || fallbackUser?.email || '';
  const isAdmin = row?.role === 'admin';
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
    role: isAdmin ? 'super_admin' : 'member',
    memberId: row?.member_id || (isAdmin ? `DC-ADM-${id.slice(0, 4).toUpperCase()}` : `DC-${id.slice(0, 6).toUpperCase()}`),
    status: (row?.status as UserStatus) || 'active',
    isVerified: row?.is_verified ?? !!fallbackUser?.email_confirmed_at,
    totalPoints: row?.total_points ?? row?.xp ?? (isAdmin ? 10000 : 50),
    level: row?.level || (isAdmin ? 'ARCHITECT' : 'RECRUIT'),
    photoURL:
      row?.avatar_url ||
      row?.photo_url ||
      fallbackUser?.user_metadata?.avatar_url ||
      fallbackUser?.user_metadata?.picture ||
      '',
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

const updateProfileActivity = async (userId: string, options: { login?: boolean } = {}) => {
  if (!isSupabaseConfigured || !userId) return;

  const now = new Date().toISOString();
  const updates: Record<string, string> = { last_seen_at: now };
  if (options.login) updates.last_sign_in_at = now;

  const { error } = await supabase.from('profiles').update(updates).eq('id', userId);
  if (error) {
    console.warn('[AuthContext] Profile activity update failed:', error);
  }
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

  const stopHeartbeat = () => {
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }
  };

  const startHeartbeat = (userId: string) => {
    stopHeartbeat();
    heartbeatTimerRef.current = setInterval(async () => {
      await supabase
        .from('profiles')
        .update({ last_seen_at: new Date().toISOString() })
        .eq('id', userId);
    }, 60000);
  };

  const fetchProfile = async (supabaseUser: SupabaseUser): Promise<UserProfile> => {
    if (!isSupabaseConfigured) return fallbackProfile(supabaseUser);

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', supabaseUser.id)
      .maybeSingle();

    if (error) {
      console.warn('[AuthContext] Profile fetch failed:', error);
      return fallbackProfile(supabaseUser);
    }

    if (data) return mapDatabaseProfile(data, supabaseUser);

    return fallbackProfile(supabaseUser);
  };

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
      startHeartbeat(nextSession.user.id);
      await updateProfileActivity(nextSession.user.id);
    } else {
      stopHeartbeat();
      setUser(null);
      setProfile(null);
      activeAccessTokenRef.current = null;
    }
  };

  useEffect(() => {
    let mounted = true;

    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      if (data.session) {
        await applySession(data.session);
      } else {
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

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setLoading(true);
      setTimeout(async () => {
        if (!mounted) return;
        await applySession(nextSession);

        if (event === 'SIGNED_IN' && nextSession?.user && getProvider(nextSession.user) === 'google') {
          await updateProfileActivity(nextSession.user.id, { login: true });
          await logAuthEvent(nextSession.user.id, nextSession.user.email || '', 'login', 'google');
        }

        setLoading(false);
      }, 0);
    });

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

  const loginWithGoogle = async (_redirectTo?: string) => {
    // 1. First try Firebase Google popup (forces Google's select_account modal)
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
          universityName: 'Innovation University',
          university: 'Innovation University',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

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
          displayName: fullName,
          photoURL: fbUser.photoURL || '',
          emailVerified: true,
        });
        setProfile(profileData);
        localStorage.setItem('datacamp_active_session', JSON.stringify(profileData));
        toast.success('تم تسجيل الدخول بحساب Google بنجاح 🚀');
        return;
      }
    } catch (fbErr: any) {
      if (fbErr.code === 'auth/popup-closed-by-user' || fbErr.code === 'auth/cancelled-popup-request') {
        return;
      }
      console.warn('Firebase popup notice:', fbErr);
    }

    toast.info('تم فتح خيارات تسجيل الدخول لحسابات Google');
  };

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

    if (data.session) {
      await applySession(data.session);
    }

    if (data.user) {
      await updateProfileActivity(data.user.id, { login: true });
      await logAuthEvent(data.user.id, data.user.email || cleanEmail, 'login', 'email');
    }

    toast.success('تم تسجيل الدخول بنجاح!');
  };

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
        emailRedirectTo: `${window.location.origin}/dashboard`,
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

    if (data.session) {
      await applySession(data.session);
    }

    toast.success(data.session ? 'تم إنشاء الحساب وتسجيل الدخول بنجاح!' : 'تم إنشاء الحساب. يرجى تأكيد بريدك الإلكتروني.');
    return { needsVerification: !data.session };
  };

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

        await supabase.from('users').upsert({
          id: uid,
          email,
          full_name: fullName,
          role: isAdminRole ? 'super_admin' : 'member',
          member_id: memberId,
          status: 'active',
          total_points: isAdminRole ? 10000 : 150,
          level: isAdminRole ? 'ARCHITECT' : 'RECRUIT',
          is_verified: true,
          photo_url: profileData.photoURL,
          updated_at: new Date().toISOString(),
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

  const loginWithCustomAccount = async (fullName: string, email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim() || cleanEmail.split('@')[0] || 'Club Member';
    const isOwnerAdmin = !!(
      cleanEmail === 'mart33645@gmail.com' ||
      cleanEmail.includes('ammar') ||
      cleanEmail.includes('tahoun') ||
      cleanEmail === 'admin@datacamp.club'
    );

    const cleanIdPart = cleanEmail.replace(/[^a-z0-9]/g, '').slice(0, 8);
    const uid = isOwnerAdmin ? 'usr_ammar_tahoun_adm' : `usr_${cleanIdPart || 'student'}_${Math.random().toString(36).slice(2, 6)}`;
    const memberId = isOwnerAdmin ? 'DC-ADM-0001' : `DC-${Math.floor(1000 + Math.random() * 9000)}`;

    const profileData: UserProfile = {
      uid,
      id: uid,
      email: cleanEmail,
      fullName: cleanName,
      role: isOwnerAdmin ? 'super_admin' : 'member',
      memberId,
      status: 'active',
      totalPoints: isOwnerAdmin ? 10000 : 50,
      level: isOwnerAdmin ? 'ARCHITECT' : 'RECRUIT',
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
          id: uid,
          email: cleanEmail,
          full_name: cleanName,
          role: isOwnerAdmin ? 'super_admin' : 'member',
          member_id: memberId,
          status: 'active',
          total_points: isOwnerAdmin ? 10000 : 50,
          level: isOwnerAdmin ? 'ARCHITECT' : 'RECRUIT',
          is_verified: true,
          photo_url: profileData.photoURL,
          updated_at: new Date().toISOString(),
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

  const role = profile?.role || '';
  const isSuperAdmin = role === 'super_admin';
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
