/**
 * dbService.ts
 * Firestore Database Service - Manages all database initialization and CRUD operations.
 * When Firebase is configured, reads/writes to Firestore collections directly.
 * Collections are initialized empty and ready for admin population.
 */

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Unsubscribe,
  writeBatch,
} from 'firebase/firestore';
import { db, isFirebaseReady } from '../lib/firebase';

// ─── Collection Names (Central Registry) ────────────────────────────────────

export const COLLECTIONS = {
  USERS: 'users',
  COURSES: 'courses',
  COURSE_MODULES: 'course_modules',
  COURSE_LESSONS: 'course_lessons',
  ENROLLMENTS: 'enrollments',
  EVENTS: 'events',
  STAFF: 'staff',
  BLOG_POSTS: 'blog_posts',
  PROJECTS: 'projects',
  GALLERY: 'gallery',
  CERTIFICATES: 'certificates',
  POINTS_LOG: 'points_log',
  USER_ACHIEVEMENTS: 'user_achievements',
  NOTIFICATIONS: 'notifications',
  CONTACT_MESSAGES: 'contact_messages',
  AI_SESSIONS: 'ai_sessions',
  AUDIT_LOGS: 'audit_logs',
  REGISTRATIONS: 'registrations',
  // Settings documents (singleton docs inside 'settings' collection)
  SETTINGS: 'settings',
} as const;

// ─── Database Status Check ──────────────────────────────────────────────────

export async function checkDatabaseConnection(): Promise<{
  connected: boolean;
  collections: string[];
  error?: string;
}> {
  if (!isFirebaseReady) {
    return {
      connected: false,
      collections: [],
      error: 'Firebase not configured. Running in demo mode.',
    };
  }

  try {
    // Try reading the settings doc to confirm connectivity
    const settingsRef = doc(db, COLLECTIONS.SETTINGS, 'site');
    await getDoc(settingsRef);
    
    return {
      connected: true,
      collections: Object.values(COLLECTIONS),
    };
  } catch (err: any) {
    return {
      connected: false,
      collections: [],
      error: err.message || 'Failed to connect to Firestore',
    };
  }
}

// ─── Initialize Default Settings (run once on first deploy) ─────────────────

export async function initializeDefaultSettings(): Promise<void> {
  if (!isFirebaseReady) return;

  try {
    const siteRef = doc(db, COLLECTIONS.SETTINGS, 'site');
    const siteSnap = await getDoc(siteRef);
    
    if (!siteSnap.exists()) {
      await setDoc(siteRef, {
        siteName: 'DataCamp',
        siteSubName: 'STUDENT CLUB',
        siteDescription: 'Empowering students with data science and AI skills.',
        contactEmail: 'contact@datacamp.club',
        contactPhone: '+20 123 456 7890',
        logoUrl: '',
        enableRegistration: true,
        maintenanceMode: false,
        themeColor: '#39FF14',
        socialLinks: [
          { platform: 'facebook', url: '', icon: 'Facebook' },
          { platform: 'linkedin', url: '', icon: 'Linkedin' },
          { platform: 'instagram', url: '', icon: 'Instagram' },
        ],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    const aboutRef = doc(db, COLLECTIONS.SETTINGS, 'about');
    const aboutSnap = await getDoc(aboutRef);
    
    if (!aboutSnap.exists()) {
      await setDoc(aboutRef, {
        mission: 'To empower students with cutting-edge data science, AI, and software engineering skills through hands-on learning and collaborative projects.',
        vision: 'To be the leading student tech community in Egypt and the MENA region, producing world-class data professionals.',
        history: 'Founded in 2024 at Innovation University, DataCamp Student Club has grown from a small study group into a thriving community of 500+ active members.',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    const securityRef = doc(db, COLLECTIONS.SETTINGS, 'security');
    const securitySnap = await getDoc(securityRef);
    
    if (!securitySnap.exists()) {
      await setDoc(securityRef, {
        mfaEnforced: false,
        threatLevel: 'LOW',
        firewallActive: true,
        blockedIpsCount: 0,
        activeConnections: 0,
        updatedAt: serverTimestamp(),
      });
    }
    
    // Initialize global ID counter
    const counterRef = doc(db, 'id_counters', 'global');
    const counterSnap = await getDoc(counterRef);
    
    if (!counterSnap.exists()) {
      await setDoc(counterRef, { count: 100 });
    }
    
    console.log('✅ Default settings initialized successfully.');
  } catch (err) {
    console.warn('⚠️ Settings initialization error:', err);
  }
}

// ─── Generic Firestore Helpers ──────────────────────────────────────────────

export async function getCollectionDocs<T extends Record<string, any> = any>(
  collectionName: string,
  constraints?: { field: string; op: any; value: any }[],
  sortBy?: { field: string; direction: 'asc' | 'desc' },
  limitCount?: number
): Promise<T[]> {
  if (!isFirebaseReady) return [];

  try {
    let q: any = collection(db, collectionName);
    const queryConstraints: any[] = [];
    
    if (constraints) {
      for (const c of constraints) {
        queryConstraints.push(where(c.field, c.op, c.value));
      }
    }
    if (sortBy) {
      queryConstraints.push(orderBy(sortBy.field, sortBy.direction));
    }
    if (limitCount) {
      queryConstraints.push(limit(limitCount));
    }
    
    q = query(q, ...queryConstraints);
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...(d.data() as Record<string, any>) } as unknown as T));
  } catch (err) {
    console.warn(`Firestore read error on ${collectionName}:`, err);
    return [];
  }
}

export async function addDocToCollection(collectionName: string, data: any): Promise<string | null> {
  if (!isFirebaseReady) return null;

  try {
    const ref = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return ref.id;
  } catch (err) {
    console.error(`Firestore add error on ${collectionName}:`, err);
    return null;
  }
}

export async function updateDocInCollection(collectionName: string, docId: string, data: any): Promise<boolean> {
  if (!isFirebaseReady) return false;

  try {
    await updateDoc(doc(db, collectionName, docId), {
      ...data,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (err) {
    console.error(`Firestore update error on ${collectionName}/${docId}:`, err);
    return false;
  }
}

export async function deleteDocFromCollection(collectionName: string, docId: string): Promise<boolean> {
  if (!isFirebaseReady) return false;

  try {
    await deleteDoc(doc(db, collectionName, docId));
    return true;
  } catch (err) {
    console.error(`Firestore delete error on ${collectionName}/${docId}:`, err);
    return false;
  }
}

// ─── Real-time Subscription Helper ──────────────────────────────────────────

export function subscribeToCollection<T extends Record<string, any> = any>(
  collectionName: string,
  callback: (docs: T[]) => void,
  constraints?: { field: string; op: any; value: any }[],
  sortBy?: { field: string; direction: 'asc' | 'desc' }
): Unsubscribe {
  if (!isFirebaseReady) {
    callback([]);
    return () => {};
  }

  const queryConstraints: any[] = [];
  
  if (constraints) {
    for (const c of constraints) {
      queryConstraints.push(where(c.field, c.op, c.value));
    }
  }
  if (sortBy) {
    queryConstraints.push(orderBy(sortBy.field, sortBy.direction));
  }

  const q = query(collection(db, collectionName), ...queryConstraints);

  return onSnapshot(q, (snapshot) => {
    const docs = snapshot.docs.map(d => ({ id: d.id, ...(d.data() as Record<string, any>) } as unknown as T));
    callback(docs);
  }, (error) => {
    console.warn(`Firestore subscription error on ${collectionName}:`, error);
    callback([]);
  });
}

// ─── AI Context Retrieval (for RAG) ─────────────────────────────────────────

export async function getAIContextData(): Promise<{
  courses: any[];
  events: any[];
  staff: any[];
  settings: any;
  stats: {
    totalUsers: number;
    totalCourses: number;
    totalEvents: number;
  };
}> {
  if (!isFirebaseReady) {
    return {
      courses: [],
      events: [],
      staff: [],
      settings: null,
      stats: { totalUsers: 0, totalCourses: 0, totalEvents: 0 },
    };
  }

  try {
    const [coursesSnap, eventsSnap, staffSnap, usersSnap, settingsSnap] = await Promise.all([
      getDocs(query(collection(db, COLLECTIONS.COURSES), where('status', '==', 'published'))),
      getDocs(collection(db, COLLECTIONS.EVENTS)),
      getDocs(collection(db, COLLECTIONS.STAFF)),
      getDocs(collection(db, COLLECTIONS.USERS)),
      getDoc(doc(db, COLLECTIONS.SETTINGS, 'site')),
    ]);

    return {
      courses: coursesSnap.docs.map(d => ({ id: d.id, ...d.data() })),
      events: eventsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
      staff: staffSnap.docs.map(d => ({ id: d.id, ...d.data() })),
      settings: settingsSnap.exists() ? settingsSnap.data() : null,
      stats: {
        totalUsers: usersSnap.size,
        totalCourses: coursesSnap.size,
        totalEvents: eventsSnap.size,
      },
    };
  } catch (err) {
    console.warn('AI context retrieval error:', err);
    return {
      courses: [],
      events: [],
      staff: [],
      settings: null,
      stats: { totalUsers: 0, totalCourses: 0, totalEvents: 0 },
    };
  }
}

// ─── Get User Learning Context for AI ───────────────────────────────────────

export async function getUserLearningContext(userId: string): Promise<{
  enrollments: any[];
  pointsLog: any[];
  achievements: any[];
  certificates: any[];
}> {
  if (!isFirebaseReady || !userId) {
    return { enrollments: [], pointsLog: [], achievements: [], certificates: [] };
  }

  try {
    const [enrollSnap, pointsSnap, achieveSnap, certSnap] = await Promise.all([
      getDocs(query(collection(db, COLLECTIONS.ENROLLMENTS), where('userId', '==', userId))),
      getDocs(query(collection(db, COLLECTIONS.POINTS_LOG), where('userId', '==', userId), orderBy('createdAt', 'desc'), limit(20))),
      getDocs(query(collection(db, COLLECTIONS.USER_ACHIEVEMENTS), where('userId', '==', userId))),
      getDocs(query(collection(db, COLLECTIONS.CERTIFICATES), where('userId', '==', userId))),
    ]);

    return {
      enrollments: enrollSnap.docs.map(d => ({ id: d.id, ...d.data() })),
      pointsLog: pointsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
      achievements: achieveSnap.docs.map(d => ({ id: d.id, ...d.data() })),
      certificates: certSnap.docs.map(d => ({ id: d.id, ...d.data() })),
    };
  } catch (err) {
    console.warn('User learning context retrieval error:', err);
    return { enrollments: [], pointsLog: [], achievements: [], certificates: [] };
  }
}
