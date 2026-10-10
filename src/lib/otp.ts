import { toast } from 'sonner';

// In-memory storage for Demo / Verification OTPs
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

export const sendOTP = async (target: string, _type: 'email' | 'phone') => {
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  demoStore[target] = { otp, expiresAt: expiresAt.getTime(), attempts: 0 };
  toast.info(`رمز التحقق: ${otp}`);
  return true;
};

export const verifyOTP = async (target: string, code: string, _type: 'email' | 'phone' = 'email') => {
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
};

