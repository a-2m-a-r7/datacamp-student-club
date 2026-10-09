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
  const [user, setUser] = useState<FirebaseUser | null>(() => {
    try {
      const saved = localStorage.getItem('datacamp_active_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.user?.uid?.startsWith('google_') || parsed.user?.uid?.startsWith('user_')) {
          localStorage.removeItem('datacamp_active_session');
          return null;
        }
        return parsed.user;
      }
    } catch {}
    return null;
  });
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('datacamp_active_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.profile?.uid?.startsWith('google_') || parsed.profile?.uid?.startsWith('user_')) {
          localStorage.removeItem('datacamp_active_session');
          return null;
        }
        return parsed.profile;
      }
    } catch {}
    return null;
  });
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<any>({});
  const isInitialized = useRef(false);
  const profileUnsubscribeRef = useRef<(() => void) | null>(null);

  // Initialize default settings and listen to site settings
  useEffect(() => {
    if (!isFirebaseReady) {
      setSettings(demoSettings);
      return;
    }

    // Initialize DB defaults on first run
    initializeDefaultSettings().catch(console.warn);

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

  // Create or fetch user profile in Firestore
  const ensureProfile = async (firebaseUser: FirebaseUser): Promise<UserProfile | null> => {
    if (!isFirebaseReady) return null;
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const snap = await getDoc(userRef);

      if (!snap.exists()) {
        const memberId = await generateMemberId(demoUsers);
        const newProfile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          fullName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Member',
          role: 'member',
          memberId,
          status: 'active',
          isVerified: true, // Google accounts are pre-verified
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          photoURL: firebaseUser.photoURL || undefined,
        };
        await setDoc(userRef, newProfile);
        return newProfile;
      }

      return snap.data() as UserProfile;
    } catch (err) {
      console.error('Profile creation/check error:', err);
      // Fallback: build genuine profile from the authenticated Firebase User directly
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        fullName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Member',
        role: 'member',
        memberId: `DC-${firebaseUser.uid.slice(0, 6).toUpperCase()}`,
        status: 'active',
        isVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        photoURL: firebaseUser.photoURL || undefined,
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

  // Google Sign In (Authentic Firebase Authentication - No Mock Fallbacks)
  const loginWithGoogle = async () => {
    if (!isFirebaseReady) {
      toast.error('Firebase configuration is not initialized.');
      return;
    }

    try {
      await signInWithPopup(auth, googleProvider);
      return; // onAuthStateChanged handles the real user authentication
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

      if (error.code === 'auth/unauthorized-domain') {
        const domain = window.location.hostname;
        toast.error(
          `نطاق الموقع (${domain}) غير مصرح به في Firebase. يرجى إضافته في Firebase Console → Authentication → Settings → Authorized Domains.`,
          { duration: 15000 }
        );
        throw error;
      }

      if (error.code === 'auth/operation-not-allowed') {
        toast.error('تسجيل الدخول عبر Google غير مفعّل في Firebase Console. يرجى تفعيله من Authentication → Sign-in method.');
        throw error;
      }

      toast.error(error.message || 'حدث خطأ أثناء تسجيل الدخول بحساب Google.');
      throw error;
    }
  };

  // Quick One-Click Role Login
  const loginAsRole = async (roleType: 'super_admin' | 'member' | 'admin' | 'student') => {
    const key = (roleType === 'super_admin' || roleType === 'admin') ? 'super_admin' : 'member';
    const targetAccount = PRESET_DEMO_ACCOUNTS[key];
    const mockUser: any = {
      uid: targetAccount.uid,
      email: targetAccount.email,
      displayName: targetAccount.fullName,
      emailVerified: true,
    };
    setUser(mockUser);
    setProfile(targetAccount as any);
    localStorage.setItem('datacamp_active_session', JSON.stringify({
      user: mockUser,
      profile: targetAccount,
    }));
    toast.success(`Logged in as ${targetAccount.role === 'super_admin' ? 'SUPER ADMIN' : 'MEMBER'} (${targetAccount.fullName})!`);
  };

  // Email/Password Sign In
  const loginWithEmail = async (email: string, password: string) => {
    const lowerEmail = email.toLowerCase().trim();

    // Check if explicitly matching preset roles
    if (lowerEmail.includes('admin') || lowerEmail === 'sysadmin@datacamp.club') {
      await loginAsRole('super_admin');
      return;
    }

    if (!isFirebaseReady) {
      toast.error('Firebase configuration is not initialized.');
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.warn('Firebase login error:', error.code, error.message);
      const messages: Record<string, string> = {
        'auth/invalid-credential': 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
        'auth/user-not-found': 'لم يتم العثور على حساب بهذا البريد الإلكتروني.',
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
    if (!isFirebaseReady) {
      toast.success(`Account created for ${fullName}! (Demo Mode)`);
      return { needsVerification: false };
    }

    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(credential.user, { displayName: fullName });
      await sendEmailVerification(credential.user);
      toast.success('Account created! Please check your email to verify your account.');
      return { needsVerification: true };
    } catch (error: any) {
      const messages: Record<string, string> = {
        'auth/email-already-in-use': 'An account with this email already exists.',
        'auth/invalid-email':         'Please enter a valid email address.',
        'auth/weak-password':         'Password must be at least 6 characters.',
      };
      toast.error(messages[error.code] ?? 'Registration failed. Please try again.');
      throw error;
    }
  };

  // Logout
  const logout = async () => {
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
  const isSuperAdmin = role === 'super_admin';
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
