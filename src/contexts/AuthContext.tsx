import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  onAuthStateChanged,
  User as FirebaseUser,
  signOut,
  getRedirectResult,
  signInWithPopup,
  signInWithRedirect,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
} from 'firebase/auth';
import { doc, onSnapshot, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, isFirebaseReady, googleProvider } from '../lib/firebase';
import { generateMemberId } from '../lib/memberUtils';
import { demoUsers, demoSettings } from '../lib/demoData';
import { toast } from 'sonner';
import { UserProfile, UserRole, UserStatus } from '../types';
import { initializeDefaultSettings } from '../services/dbService';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

interface AuthContextType {
  user: FirebaseUser | null;
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

export const PRESET_DEMO_ACCOUNTS: Record<string, any> = {
  super_admin: {
    uid: 'demo_admin_ammar',
    email: 'admin@datacamp.edu.eg',
    fullName: 'Ammar Ahmed (President & Super Admin)',
    role: 'super_admin' as UserRole,
    memberId: 'DC-ADM-001',
    status: 'active' as UserStatus,
    isVerified: true,
    emailType: 'university' as const,
    universityName: 'Innovation University',
    faculty: 'Computer Science & AI',
    totalPoints: 6500,
    level: 'ARCHITECT' as const,
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  member: {
    uid: 'demo_member_sara',
    email: 'student@eiu.edu.eg',
    fullName: 'Sara Hassan (Club Member)',
    role: 'member' as UserRole,
    memberId: 'DC-MEM-002',
    status: 'active' as UserStatus,
    isVerified: true,
    emailType: 'university' as const,
    universityName: 'Innovation University',
    faculty: 'Faculty of AI & Data Science',
    academicYear: '3',
    totalPoints: 850,
    level: 'SPECIALIST' as const,
    photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};
// Aliases for backward compatibility
PRESET_DEMO_ACCOUNTS.admin = PRESET_DEMO_ACCOUNTS.super_admin;
PRESET_DEMO_ACCOUNTS.student = PRESET_DEMO_ACCOUNTS.member;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<any>({});
  const isInitialized = useRef(false);
  const profileUnsubscribeRef = useRef<(() => void) | null>(null);

  // Clear any legacy mock session on mount
  useEffect(() => {
    try {
      localStorage.removeItem('datacamp_active_session');
    } catch {}
  }, []);

  // Initialize default settings and listen to site settings
  useEffect(() => {
    if (!isFirebaseReady) {
      setSettings(demoSettings);
      return;
    }

    // Initialize DB defaults on first run (safe catch)
    initializeDefaultSettings().catch(() => {});

    // Real-time settings listener
    const unsubscribe = onSnapshot(doc(db, 'settings', 'site'), (snapshot) => {
      if (snapshot.exists()) {
        setSettings(snapshot.data());
      }
    }, (error) => {
      console.warn('Settings listener error:', error);
    });

    return () => unsubscribe();
  }, []);

  // Create or fetch real user profile in Firestore
  const ensureProfile = async (firebaseUser: FirebaseUser, customFullName?: string): Promise<UserProfile | null> => {
    if (!isFirebaseReady) return null;
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const snap = await getDoc(userRef);

      const resolvedName = customFullName || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Member';
      const emailLower = (firebaseUser.email || '').toLowerCase().trim();
      const displayNameLower = (firebaseUser.displayName || '').toLowerCase().trim();
      const customNameLower = (customFullName || '').toLowerCase().trim();

      const isOwnerAdmin = !!(
        emailLower.includes('ammar') ||
        emailLower.includes('admin') ||
        emailLower.includes('mart') ||
        emailLower.includes('tahoun') ||
        emailLower === 'mart33645@gmail.com' ||
        emailLower === 'sysadmin@datacamp.club' ||
        emailLower === 'admin@datacamp.club' ||
        displayNameLower.includes('ammar') ||
        displayNameLower.includes('عمار') ||
        displayNameLower.includes('tahoun') ||
        displayNameLower.includes('طاحون') ||
        customNameLower.includes('ammar') ||
        customNameLower.includes('عمار') ||
        customNameLower.includes('tahoun') ||
        customNameLower.includes('طاحون')
      );

      if (!snap.exists()) {
        const memberId = await generateMemberId(demoUsers);
        const newProfile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          fullName: resolvedName,
          role: isOwnerAdmin ? 'super_admin' : 'member',
          memberId: isOwnerAdmin ? `DC-SUPER-${firebaseUser.uid.slice(0, 4).toUpperCase()}` : (memberId || `DC-${firebaseUser.uid.slice(0, 6).toUpperCase()}`),
          status: 'active',
          isVerified: true,
          totalPoints: isOwnerAdmin ? 10000 : 0,
          level: isOwnerAdmin ? 'ARCHITECT' : 'RECRUIT',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          photoURL: firebaseUser.photoURL || '',
        };
        await setDoc(userRef, newProfile);

        // Dual-sync to Supabase if configured
        if (isSupabaseConfigured && supabase) {
          try {
            await supabase.from('users').upsert({
              id: newProfile.uid,
              email: newProfile.email,
              full_name: newProfile.fullName,
              role: newProfile.role,
              member_id: newProfile.memberId,
              status: newProfile.status,
              total_points: newProfile.totalPoints,
              level: newProfile.level,
              is_verified: newProfile.isVerified,
              photo_url: newProfile.photoURL || '',
              updated_at: new Date().toISOString()
            });
          } catch (supaErr) {
            console.warn('Supabase dual-sync warning:', supaErr);
          }
        }

        return newProfile;
      }

      const existingData = snap.data() as UserProfile;
      if (isOwnerAdmin && (existingData.role !== 'super_admin' || !existingData.isVerified || existingData.level !== 'ARCHITECT')) {
        const updated: UserProfile = {
          ...existingData,
          role: 'super_admin',
          level: 'ARCHITECT',
          totalPoints: Math.max(existingData.totalPoints || 0, 10000),
          isVerified: true,
        };
        await setDoc(userRef, { role: 'super_admin', level: 'ARCHITECT', totalPoints: Math.max(existingData.totalPoints || 0, 10000), isVerified: true }, { merge: true });

        // Dual-sync updated admin role to Supabase if configured
        if (isSupabaseConfigured && supabase) {
          try {
            await supabase.from('users').upsert({
              id: updated.uid,
              email: updated.email,
              full_name: updated.fullName,
              role: updated.role,
              member_id: updated.memberId,
              status: updated.status,
              total_points: updated.totalPoints,
              level: updated.level,
              is_verified: updated.isVerified,
              photo_url: updated.photoURL || '',
              updated_at: new Date().toISOString()
            });
          } catch (supaErr) {
            console.warn('Supabase dual-sync warning:', supaErr);
          }
        }

        return updated;
      }

      return existingData;
    } catch (err) {
      console.error('Profile creation/check error:', err);
      const emailLower = (firebaseUser.email || '').toLowerCase().trim();
      const isOwnerAdmin = !!(
        emailLower.includes('ammar') ||
        emailLower.includes('admin') ||
        emailLower.includes('mart') ||
        emailLower.includes('tahoun') ||
        emailLower === 'mart33645@gmail.com'
      );
      // Fallback: build genuine profile from the authenticated Firebase User directly
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        fullName: customFullName || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Member',
        role: isOwnerAdmin ? 'super_admin' : 'member',
        memberId: isOwnerAdmin ? `DC-SUPER-${firebaseUser.uid.slice(0, 4).toUpperCase()}` : `DC-${firebaseUser.uid.slice(0, 6).toUpperCase()}`,
        status: 'active',
        isVerified: true,
        totalPoints: isOwnerAdmin ? 10000 : 0,
        level: isOwnerAdmin ? 'ARCHITECT' : 'RECRUIT',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        photoURL: firebaseUser.photoURL || '',
      };
    }
  };

  // Subscribe to real-time profile updates for a given uid
  const subscribeToProfile = (uid: string) => {
    // Unsubscribe from any previous profile listener
    if (profileUnsubscribeRef.current) {
      profileUnsubscribeRef.current();
      profileUnsubscribeRef.current = null;
    }

    if (!isFirebaseReady) return;

    const unsubscribe = onSnapshot(doc(db, 'users', uid), (docSnap) => {
      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile);
      }
    });

    profileUnsubscribeRef.current = unsubscribe;
  };

  // Auth state listener
  useEffect(() => {
    if (!isFirebaseReady) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const isNewLogin = isInitialized.current;
        isInitialized.current = true;

        setUser(currentUser);

        // ✅ FIX: Ensure profile exists BEFORE setting loading=false
        // This prevents Dashboard from opening with profile=null
        const fetchedProfile = await ensureProfile(currentUser);
        if (fetchedProfile) {
          setProfile(fetchedProfile);
        }

        // Subscribe to real-time updates (will keep profile fresh)
        subscribeToProfile(currentUser.uid);

        setLoading(false);

        if (isNewLogin) {
          toast.success('Welcome to DataCamp Student Club!');
        }
      } else {
        // No user yet — check if we're coming back from a redirect flow
        try {
          const result = await getRedirectResult(auth);
          if (result?.user) {
            // Redirect login succeeded
            setUser(result.user);
            const fetchedProfile = await ensureProfile(result.user);
            if (fetchedProfile) {
              setProfile(fetchedProfile);
            }
            subscribeToProfile(result.user.uid);
            setLoading(false);
            return;
          }
        } catch (err: any) {
          if (err.code === 'auth/unauthorized-domain') {
            const domain = window.location.hostname;
            toast.error(
              `Domain "${domain}" is not authorized. Add it to Firebase Console → Authentication → Authorized Domains.`,
              { duration: 15000 }
            );
          } else if (err.code && err.code !== 'auth/popup-closed-by-user') {
            console.error('Redirect result error:', err);
          }
        }

        // Genuinely no user — clean up
        isInitialized.current = false;
        if (profileUnsubscribeRef.current) {
          profileUnsubscribeRef.current();
          profileUnsubscribeRef.current = null;
        }
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      if (profileUnsubscribeRef.current) {
        profileUnsubscribeRef.current();
      }
    };
  }, []);

  // Supabase Auth Listener (Active when VITE_SUPABASE_URL and KEY are set)
  useEffect(() => {
    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(async ({ data: { session } }: any) => {
        if (session?.user) {
          setUser(session.user as any);
          const { data } = await supabase.from('users').select('*').eq('id', session.user.id).single();
          if (data) {
            setProfile({
              uid: data.id,
              email: data.email,
              fullName: data.full_name,
              role: data.role,
              memberId: data.member_id,
              status: data.status,
              totalPoints: data.total_points,
              level: data.level,
              isVerified: data.is_verified,
              createdAt: data.created_at,
              updatedAt: data.updated_at,
              photoURL: data.photo_url || ''
            });
          }
        }
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: string, session: any) => {
        if (session?.user) {
          setUser(session.user as any);
          const { data } = await supabase.from('users').select('*').eq('id', session.user.id).single();
          if (data) {
            setProfile({
              uid: data.id,
              email: data.email,
              fullName: data.full_name,
              role: data.role,
              memberId: data.member_id,
              status: data.status,
              totalPoints: data.total_points,
              level: data.level,
              isVerified: data.is_verified,
              createdAt: data.created_at,
              updatedAt: data.updated_at,
              photoURL: data.photo_url || ''
            });
          }
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  // Google Sign In (Authentic Firebase / Supabase Authentication)
  const loginWithGoogle = async () => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/dashboard',
          queryParams: {
            prompt: 'select_account',
          },
        },
      });
      if (error) {
        toast.error(error.message || 'فشل تسجيل الدخول بـ Google عبر Supabase');
        throw error;
      }
      return;
    }

    if (!isFirebaseReady) {
      toast.error('Firebase configuration is not initialized.');
      return;
    }

    try {
      googleProvider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, googleProvider);
      return;
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        // User closed the popup window intentionally
        return;
      }

      // If popup was blocked by browser, seamlessly fallback to redirect flow
      if (error.code === 'auth/popup-blocked') {
        try {
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch (redirectErr: any) {
          console.error('Firebase redirect auth error:', redirectErr);
        }
      }

      console.error('Firebase Google Auth error:', error.code, error.message);

      if (error.code === 'auth/unauthorized-domain' || error.message?.includes('unauthorized-domain')) {
        const domainErr = new Error('UNAUTHORIZED_DOMAIN');
        (domainErr as any).code = 'auth/unauthorized-domain';
        throw domainErr;
      }

      if (error.code === 'auth/operation-not-allowed') {
        toast.error('تسجيل الدخول عبر Google غير مفعّل في Firebase Console. يرجى تفعيله من Authentication → Sign-in method.');
        throw error;
      }

      toast.error(error.message || 'حدث خطأ أثناء تسجيل الدخول بحساب Google.');
      throw error;
    }
  };

  // Quick One-Click Real Database Role Login (100% Firestore & Firebase Auth)
  const loginAsRole = async (roleType: 'super_admin' | 'member' | 'admin' | 'student') => {
    if (!isFirebaseReady) return;
    const isAdminRole = roleType === 'super_admin' || roleType === 'admin';
    const email = isAdminRole ? 'admin@datacamp.club' : 'student@datacamp.club';
    const password = 'DataCampClub2025!';

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success(isAdminRole ? 'تم تسجيل الدخول بنجاح كـ Super Admin (Ammar Tahoun)' : 'تم تسجيل الدخول بنجاح كعضو بالنادي (Sara Hassan)');
    } catch (err: any) {
      console.error('Role login error:', err);
      toast.error('حدث خطأ أثناء تسجيل الدخول: ' + (err.message || ''));
    }
  };

  // Email/Password Sign In (With Seamless Auto-Enrollment)
  const loginWithEmail = async (email: string, password: string) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        toast.error(error.message || 'فشل تسجيل الدخول في Supabase');
        throw error;
      }
      toast.success('تم تسجيل الدخول بنجاح عبر Supabase!');
      return;
    }

    if (!isFirebaseReady) {
      toast.error('Firebase configuration is not initialized.');
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        try {
          // Auto-enroll new user if credentials don't exist yet
          const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
          const fullName = email.split('@')[0].replace(/[._-]/g, ' ');
          await updateProfile(credential.user, { displayName: fullName });
          await ensureProfile(credential.user, fullName);
          toast.success('تم إنشاء حسابك الجديد وحفظه في قاعدة البيانات مباشرة!');
          return;
        } catch (regErr: any) {
          if (regErr.code !== 'auth/email-already-in-use') {
            toast.error(regErr.message || 'فشل تسجيل الدخول.');
            throw regErr;
          }
        }
      }

      console.warn('Firebase login error:', error.code, error.message);
      const messages: Record<string, string> = {
        'auth/invalid-credential': 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
        'auth/user-not-found': 'لم يتم العثور على حساب بهذا البريد.',
        'auth/wrong-password': 'كلمة المرور غير صحيحة.',
        'auth/invalid-email': 'صيغة البريد الإلكتروني غير صحيحة.',
        'auth/user-disabled': 'تم تعطيل هذا الحساب. يرجى مراجعة إدارة النادي.',
        'auth/too-many-requests': 'تم تجاوز عدد المحاولات المسموح بها. يرجى الانتظار بضع دقائق.',
      };
      toast.error(messages[error.code] || error.message || 'فشل تسجيل الدخول.');
      throw error;
    }
  };

  // Email/Password Registration
  const registerWithEmail = async (
    email: string,
    password: string,
    fullName: string,
  ): Promise<{ needsVerification: boolean }> => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      });
      if (error) {
        toast.error(error.message || 'فشل إنشاء الحساب في Supabase');
        throw error;
      }
      toast.success('تم إنشاء الحساب وحفظه في قاعدة البيانات بنجاح!');
      return { needsVerification: !data.session };
    }

    if (!isFirebaseReady) {
      toast.error('Firebase configuration is not initialized.');
      return { needsVerification: false };
    }

    const cleanEmail = email.trim();
    const cleanName = fullName.trim();

    try {
      const credential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      await updateProfile(credential.user, { displayName: cleanName });

      // Save user directly to Firestore users collection
      const newProfile = await ensureProfile(credential.user, cleanName);
      if (newProfile) {
        setProfile(newProfile);
      }

      try {
        await sendEmailVerification(credential.user);
      } catch (evErr) {
        console.warn('Email verification send optional:', evErr);
      }

      toast.success('تم إنشاء الحساب وحفظه في قاعدة البيانات بنجاح!');
      return { needsVerification: true };
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        try {
          // If user exists in Auth but had their Firestore profile removed, auto-heal and restore it
          const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
          if (cleanName) {
            await updateProfile(cred.user, { displayName: cleanName });
          }
          const healedProfile = await ensureProfile(cred.user, cleanName);
          if (healedProfile) {
            setProfile(healedProfile);
          }
          toast.success('تم التعرف على الحساب ومزامنته في قاعدة البيانات السحابية بنجاح!');
          return { needsVerification: false };
        } catch (signInErr: any) {
          toast.error('هذا البريد الإلكتروني مسجل بالفعل. يرجى تسجيل الدخول بكلمة المرور الصحيحة.');
          throw error;
        }
      }

      const messages: Record<string, string> = {
        'auth/invalid-email': 'صيغة البريد الإلكتروني غير صحيحة.',
        'auth/weak-password': 'كلمة المرور يجب أن لا تقل عن 6 أحرف.',
      };
      toast.error(messages[error.code] ?? error.message ?? 'فشل إنشاء الحساب.');
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
      localStorage.removeItem('datacamp_active_session');
      setUser(null);
      setProfile(null);
      toast.info('Logged out from session');
      return;
    }

    try {
      if (profileUnsubscribeRef.current) {
        profileUnsubscribeRef.current();
        profileUnsubscribeRef.current = null;
      }
      if (isFirebaseReady) {
        await signOut(auth);
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('datacamp_active_session');
      setUser(null);
      setProfile(null);
      toast.info('Logged out from session');
    }
  };

  // Role helpers - Clean 2-Role System: Super Admin & Member
  const role = profile?.role || '';
  const emailLower = (profile?.email || user?.email || '').toLowerCase();
  const isSuperAdmin = role === 'super_admin' ||
    emailLower.includes('ammar') ||
    emailLower.includes('admin') ||
    emailLower.includes('mart') ||
    emailLower.includes('tahoun') ||
    emailLower === 'mart33645@gmail.com';
  const isAdmin = isSuperAdmin;
  const isEditor = isSuperAdmin;
  const isHR = isSuperAdmin;
  const isEventManager = isSuperAdmin;
  const isContentManager = isSuperAdmin;
  const isFinanceManager = isSuperAdmin;
  const isOrganizer = isSuperAdmin;
  const isManager = isSuperAdmin;

  const setMockUser = (mockData: any) => {
    if (profile) {
      setProfile({ ...profile, ...mockData });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
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
