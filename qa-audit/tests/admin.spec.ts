import { test, expect } from '@playwright/test';

test.describe('Admin Boundaries & Route Security Audit', () => {
  const adminRoutes = [
    '/admin',
    '/admin/overview',
    '/admin/users',
    '/admin/security',
    '/admin/settings',
    '/admin/forms',
    '/admin/forms/new',
    '/admin/events',
    '/admin/courses',
    '/admin/points',
    '/admin/messages',
  ];

  for (const route of adminRoutes) {
    test(`Unauthenticated visitor cannot access ${route} directly`, async ({ page }) => {
      await page.goto(route);
      // Must be redirected away from admin route (to /login or /dashboard)
      await expect(page).not.toHaveURL(new RegExp(`${route}$`));
      await expect(page).toHaveURL(/\/(login|dashboard|verify-email)/);
    });
  }

  test('Public form view /f/:slug handles non-existent form gracefully', async ({ page }) => {
    await page.goto('/f/non-existent-form-slug-xyz');
    // Should show 404 or form not found message without blank screen
    await expect(page.locator('body')).toBeVisible();
    await expect(page.getByText(/النموذج غير موجود|Form Not Found|404/i).first()).toBeVisible();
  });
});
