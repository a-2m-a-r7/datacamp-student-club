import { Certificate, Achievement } from '../types';
import { getSiteUrl } from './siteUrl';

export const LINKEDIN_CERTIFICATION_URL = 'https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME';
export const CERTIFICATE_ISSUER = 'DataCamp Student Club at Innovation University';

export function certificateVerificationUrl(certificate: Certificate): string {
  return `${getSiteUrl()}/verify-certificate/${encodeURIComponent(certificate.verificationCode)}`;
}

export function linkedInShareUrl(publicUrl: string): string {
  const url = new URL('https://www.linkedin.com/sharing/share-offsite/');
  url.searchParams.set('url', publicUrl);
  return url.toString();
}

export function formatCredentialDate(value: Certificate['issuedAt'], isArabic: boolean): string {
  const date = typeof value === 'object' && 'toDate' in value ? value.toDate() : new Date(String(value));
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long' });
}

export function linkedInPostText(item: Certificate | Achievement, isArabic: boolean): string {
  if ('verificationCode' in item) {
    const title = item.courseTitle || item.eventTitle || (isArabic ? 'شهادة إكمال' : 'Completion certificate');
    return `${isArabic ? 'حصلت على شهادة' : 'I earned a certificate for'} ${title}\n${CERTIFICATE_ISSUER}\n${isArabic ? 'رابط التحقق' : 'Verify my certificate'}: ${certificateVerificationUrl(item)}\n#DataCampStudentClub #Learning`;
  }
  return `${isArabic ? 'اكتسبت شارة' : 'I earned the badge'} ${item.badgeName}\n${item.description}\n${CERTIFICATE_ISSUER}\n${getSiteUrl()}\n#DataCampStudentClub #Learning`;
}
