/**
 * src/lib/siteUrl.ts
 * Single source of truth for the public/canonical site URL.
 * Guarantees that public links, QR codes, social shares, and auth redirects
 * point to the canonical production domain (e.g. https://datacamp-student-club.vercel.app)
 * and never leak localhost in production/public builds.
 */

export const getSiteUrl = (): string => {
  // 1. Check environment variable VITE_SITE_URL
  const envUrl = (import.meta as any).env?.VITE_SITE_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/+$/, '');
  }

  // 2. Default canonical public production domain
  const CANONICAL_PROD_URL = 'https://datacamp-student-club.vercel.app';

  // 3. In browser context
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    // If already running on a deployed public hostname, use it
    if (!window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1')) {
      return window.location.origin.replace(/\/+$/, '');
    }
  }

  // Fallback to canonical production URL (never localhost in public links)
  return CANONICAL_PROD_URL;
};

/**
 * Returns canonical full URL for a given path
 */
export const getCanonicalUrl = (path: string = ''): string => {
  const base = getSiteUrl();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
};
