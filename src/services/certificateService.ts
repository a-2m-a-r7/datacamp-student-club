/**
 * certificateService.ts
 * Supabase-backed certificate generation, verification, and retrieval.
 */

import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { Certificate } from '../types';

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
];

const mapCertificate = (row: any): Certificate => ({
  id: row.id,
  userId: row.user_id,
  userFullName: row.user_full_name,
  courseId: row.course_id || undefined,
  courseTitle: row.course_title || undefined,
  eventId: row.event_id || undefined,
  eventTitle: row.event_title || undefined,
  type: row.type,
  issuedAt: row.issued_at,
  pdfUrl: row.pdf_url || undefined,
  shareUrl: row.share_url || undefined,
  verificationCode: row.verification_code,
});

export const certificateService = {
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
    const shareUrl = `${window.location.origin}/verify-certificate/${verificationCode}`;

    const fallback: Certificate = {
      id: `cert_${Date.now()}`,
      userId: data.userId,
      userFullName: data.userFullName,
      courseId: data.courseId,
      courseTitle: data.courseTitle,
      eventId: data.eventId,
      eventTitle: data.eventTitle,
      type: data.type,
      issuedAt: new Date().toISOString(),
      verificationCode,
      shareUrl,
    };

    if (!isSupabaseConfigured) return fallback;

    const { data: row, error } = await supabase
      .from('certificates')
      .insert({
        user_id: data.userId,
        user_full_name: data.userFullName,
        course_id: data.courseId,
        course_title: data.courseTitle,
        event_id: data.eventId,
        event_title: data.eventTitle,
        type: data.type,
        verification_code: verificationCode,
        share_url: shareUrl,
      })
      .select()
      .single();

    if (error) throw error;
    return mapCertificate(row);
  },

  async getUserCertificates(userId: string): Promise<Certificate[]> {
    if (!isSupabaseConfigured) return DEMO_CERTIFICATES.filter(c => c.userId === userId || c.userId === 'demo-user');

    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('user_id', userId)
      .order('issued_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(mapCertificate);
  },

  async verifyCertificate(code: string): Promise<Certificate | null> {
    const formatted = code.trim().toUpperCase();
    if (!isSupabaseConfigured) return DEMO_CERTIFICATES.find(c => c.verificationCode === formatted) || null;

    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('verification_code', formatted)
      .maybeSingle();

    if (error) throw error;
    return data ? mapCertificate(data) : null;
  },

  getLocalCertificates(): Certificate[] {
    return DEMO_CERTIFICATES;
  },
};
