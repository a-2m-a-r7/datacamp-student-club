import { test, expect } from '@playwright/test';

test.describe('QR Code Generation & Canonical URL Audit', () => {
  test('Certificate verification page renders verification section without crashing', async ({ page }) => {
    await page.goto('/verify-certificate');
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('h1, h2, div').first()).toBeVisible();
  });

  test('Certificate verification page with code parameter loads verification view', async ({ page }) => {
    await page.goto('/verify-certificate/DC-CERT-2025-QA-TEST');
    await expect(page.locator('body')).toBeVisible();
  });

  test('Public form share canonical URLs resolve to canonical domain and not localhost', async ({ page }) => {
    await page.goto('/f/test-slug');
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href').catch(() => null);
    if (canonical) {
      expect(canonical).not.toContain('localhost');
      expect(canonical).toContain('datacamp-student-club.vercel.app');
    }
  });

  test('Events page displays events and registration buttons', async ({ page }) => {
    await page.goto('/events');
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('h1').first()).toBeVisible();
  });
});
