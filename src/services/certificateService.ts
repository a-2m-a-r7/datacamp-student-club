/**
 * certificateService.ts
 * Supabase-backed certificate generation, verification, and retrieval.
 */

import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { Certificate } from '../types';
import { getSiteUrl } from '../lib/siteUrl';

function generateVerificationCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'DC-';
  for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  code += '-';
  for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  return code;
}

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
 if (!isSupabaseConfigured) throw new Error('Database is not configured.');
 if (data.type !== 'course' || !data.courseId) throw new Error('Certificates for this activity require administrator issuance.');
 const { data: identity } = await supabase.auth.getUser();
 if (identity.user?.id !== data.userId) throw new Error('You can only claim your own certificate.');
 const { data: row, error } = await supabase.rpc('issue_course_certificate', { p_course_id: data.courseId });
 if (error) throw error; if (!row?.id) throw new Error('Certificate was not issued.');
 return mapCertificate(row);
},

  async getUserCertificates(userId: string): Promise<Certificate[]> {
    if (!isSupabaseConfigured) { return []; }

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
    if (!isSupabaseConfigured) { return null; }

    const { data, error } = await supabase.rpc('verify_certificate', { p_code: formatted });

    if (error) throw error;
    return data ? mapCertificate(data) : null;
  },

  getLocalCertificates(): Certificate[] {
    return [];
  },
};
