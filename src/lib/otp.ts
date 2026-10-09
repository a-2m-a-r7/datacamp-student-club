import { doc, getDoc, setDoc, updateDoc, deleteDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db, auth, isFirebaseReady } from './firebase';
import { toast } from 'sonner';

// In-memory storage for Demo Mode OTPs (not persisted across reloads for security)
const demoStore: Record<string, { otp: string; expiresAt: number; attempts: number }> = {};

const hashOTP = async (otp: string) => {
  const msgUint8 = new TextEncoder().encode(otp);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const generateOTP = () => {
  const array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  const randomNumber = array[0] / (0xFFFFFFFF + 1);
  return Math.floor(100000 + randomNumber * 900000).toString();
};

export const sendOTP = async (target: string, type: 'email' | 'phone') => {
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  if (!isFirebaseReady) {
    demoStore[target] = { otp, expiresAt: expiresAt.getTime(), attempts: 0 };
    toast.info(`[DEMO] OTP ${otp} would be sent to ${target}`);
    return true;
  }

  const currentUser = auth.currentUser;
  if (!currentUser) {
    toast.error('Authentication required to verify identity');
    return false;
  }

  try {
    const hashedOtp = await hashOTP(otp);
    const otpDocRef = doc(db, 'otps', `${currentUser.uid}_${type}`);

    await setDoc(otpDocRef, {
      userId: currentUser.uid,
      target,
      otp: hashedOtp,
      type,
      attempts: 0,
      expiresAt: Timestamp.fromDate(expiresAt),
      createdAt: serverTimestamp(),
    });

    // In a real production app, this would trigger a Cloud Function or external service hook (e.g. Twilio/SendGrid).
    toast.success(`Verification record prepared for ${target}. (Live SMS/Email transmission requires configured API keys)`);
    return true;
  } catch (error) {
    console.error('Failed to send OTP:', error);
    return false;
  }
};

export const verifyOTP = async (target: string, code: string, type: 'email' | 'phone' = 'email') => {
  if (!isFirebaseReady) {
    const saved = demoStore[target];
    if (!saved) return false;

    if (Date.now() > saved.expiresAt) {
      delete demoStore[target];
      return false;
    }

    if (saved.attempts >= 5) {
      delete demoStore[target];
      return false;
    }

    const isValid = saved.otp === code;
    if (isValid) {
      delete demoStore[target];
      return true;
    } else {
      saved.attempts = (saved.attempts || 0) + 1;
      return false;
    }
  }

  const currentUser = auth.currentUser;
  if (!currentUser) return false;

  try {
    const otpDocRef = doc(db, 'otps', `${currentUser.uid}_${type}`);
    const snap = await getDoc(otpDocRef);

    if (!snap.exists()) return false;

    const data = snap.data();
    if (data.target !== target) return false;

    const expiresAt = data.expiresAt?.toDate ? data.expiresAt.toDate() : new Date(data.expiresAt);

    if (new Date() > expiresAt || (data.attempts || 0) >= 5) {
      await deleteDoc(otpDocRef);
      return false;
    }

    const hashedInput = await hashOTP(code);
    if (data.otp !== hashedInput) {
      await updateDoc(otpDocRef, { attempts: (data.attempts || 0) + 1 });
      return false;
    }

    // Valid OTP, delete it immediately to prevent replay
    await deleteDoc(otpDocRef);
    return true;
  } catch (error) {
    console.error('Failed to verify OTP:', error);
    return false;
  }
};
