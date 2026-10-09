/**
 * certificateService.ts
 * Manages certificate generation, verification, and retrieval for courses and events.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db, isFirebaseReady } from '../lib/firebase';
import { Certificate } from '../types';

const LOCAL_CERTS_KEY = 'datacamp_user_certificates';

function generateVerificationCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'DC-';
  for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  code += '-';
  for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  return code;
}

const DEMO_CERTIFICATES: Certificate[] = [
  {
    id: 'cert-python-ds-demo',
    userId: 'demo-user',
    userFullName: 'Ammar Ahmed',
    courseId: 'course-python-ds',
    courseTitle: 'Python for Data Science & AI',
    type: 'course',
    issuedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    verificationCode: 'DC-PY99-X2K4',
    shareUrl: 'https://datacamp-club.edu/verify/DC-PY99-X2K4',
  },
  {
    id: 'cert-ai-summit-demo',
    userId: 'demo-user',
    userFullName: 'Ammar Ahmed',
    eventId: 'evt-ai-summit-2026',
    eventTitle: 'DataCamp AI & Deep Learning Summit 2026',
    type: 'event',
    issuedAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    verificationCode: 'DC-EVT1-B7M9',
    shareUrl: 'https://datacamp-club.edu/verify/DC-EVT1-B7M9',
  },
];

export const certificateService = {
  /**
   * Issue a new certificate for a student completing a course or event
   */
  async issueCertificate(data: {
    userId: string;
    userFullName: string;
    courseId?: string;
    courseTitle?: string;
    eventId?: string;
    eventTitle?: string;
    type: 'course' | 'event' | 'achievement';
  }): Promise<Certificate> {
    const verificationCode = generateVerificationCode();
    const certId = `cert_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newCert: Certificate = {
      id: certId,
      userId: data.userId,
      userFullName: data.userFullName,
      courseId: data.courseId,
      courseTitle: data.courseTitle,
      eventId: data.eventId,
      eventTitle: data.eventTitle,
      type: data.type,
      issuedAt: new Date().toISOString(),
      verificationCode,
      shareUrl: `${window.location.origin}/verify-certificate/${verificationCode}`,
    };

    if (isFirebaseReady) {
      try {
        await setDoc(doc(db, 'certificates', certId), {
          ...newCert,
          issuedAt: serverTimestamp(),
        });
      } catch (err) {
        console.warn('Firebase certificate save error, saving locally:', err);
      }
    }

    // Save to local storage
    const current = this.getLocalCertificates();
    localStorage.setItem(LOCAL_CERTS_KEY, JSON.stringify([newCert, ...current]));

    return newCert;
  },

  /**
   * Get all certificates belonging to a specific user
   */
  async getUserCertificates(userId: string): Promise<Certificate[]> {
    if (isFirebaseReady) {
      try {
        const q = query(collection(db, 'certificates'), where('userId', '==', userId));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const list: Certificate[] = [];
          snap.forEach(d => list.push({ id: d.id, ...d.data() } as Certificate));
          return list;
        }
      } catch (err) {
        console.warn('Firestore get certificates fallback:', err);
      }
    }

    const local = this.getLocalCertificates();
    const userLocal = local.filter(c => c.userId === userId || c.userId === 'demo-user');
    return userLocal.length > 0 ? userLocal : DEMO_CERTIFICATES;
  },

  /**
   * Verify certificate by verification code
   */
  async verifyCertificate(code: string): Promise<Certificate | null> {
    const formatted = code.trim().toUpperCase();

    if (isFirebaseReady) {
      try {
        const q = query(collection(db, 'certificates'), where('verificationCode', '==', formatted));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const d = snap.docs[0];
          return { id: d.id, ...d.data() } as Certificate;
        }
      } catch (err) {
        console.warn('Firestore certificate verify fallback:', err);
      }
    }

    // Local search
    const all = [...this.getLocalCertificates(), ...DEMO_CERTIFICATES];
    return all.find(c => c.verificationCode === formatted) || null;
  },

  getLocalCertificates(): Certificate[] {
    try {
      const data = localStorage.getItem(LOCAL_CERTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
};
