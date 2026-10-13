import { isSupabaseConfigured, supabase } from './supabase';

// In-memory storage for Demo / Verification OTPs

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
  if (!isSupabaseConfigured) return false;
  const { data: identity, error: identityError } = await supabase.auth.getUser();
  if (identityError || !identity.user) return false;
  if (_type === 'email' && identity.user.email?.toLowerCase() !== target.trim().toLowerCase()) return false;
  if (_type === 'phone' && identity.user.phone !== target.trim()) return false;
  const { error } = await supabase.auth.signInWithOtp(_type === 'email'
    ? { email: target.trim(), options: { shouldCreateUser: false } }
    : { phone: target.trim(), options: { shouldCreateUser: false } });
  return !error;
};

export const verifyOTP = async (target: string, code: string, _type: 'email' | 'phone' = 'email') => {
  if (!isSupabaseConfigured || !/^\d{6}$/.test(code)) return false;
  const { data, error } = await supabase.auth.verifyOtp(_type === 'email'
    ? { email: target.trim(), token: code, type: 'email' }
    : { phone: target.trim(), token: code, type: 'sms' });
  return !error && Boolean(data.session?.user);
};

