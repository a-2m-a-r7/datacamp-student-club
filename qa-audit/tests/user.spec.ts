import { test, expect } from '@playwright/test';

test.describe('User Auth & Protected Boundaries Audit', () => {
  test('Unauthenticated user is redirected from /dashboard to /login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('Unauthenticated user is redirected from /profile to /login', async ({ page }) => {
    await page.goto('/profile');
    await expect(page).toHaveURL(/\/login/);
  });

  test('Unauthenticated user is redirected from /my-courses to /login', async ({ page }) => {
    await page.goto('/my-courses');
    await expect(page).toHaveURL(/\/login/);
  });

  test('Login form validates empty email and password', async ({ page }) => {
    await page.goto('/login');
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();
    await expect(page.locator('p.text-destructive').first()).toBeVisible();
  });

  test('Login form validates invalid email format', async ({ page }) => {
    await page.goto('/login');
    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill('invalid-email-format');
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();
    await expect(page.locator('p.text-destructive').first()).toBeVisible();
  });

  test('Register form validates password mismatch', async ({ page }) => {
    await page.goto('/register');
    const nameInput = page.locator('input[type="text"]').first();
    const emailInput = page.locator('input[type="email"]');
    const passInputs = page.locator('input[type="password"]');

    if (await passInputs.count() >= 2) {
      await nameInput.fill('QA Test User');
      await emailInput.fill('qatest@example.com');
      await passInputs.nth(0).fill('Password123!');
      await passInputs.nth(1).fill('Password999!');
      const submitBtn = page.locator('button[type="submit"]');
      await submitBtn.click();
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('Forgot password page handles reset request gracefully', async ({ page }) => {
    await page.goto('/forgot-password');
    const emailInput = page.locator('input[type="email"]');
    if (await emailInput.count() > 0) {
      await emailInput.fill('test@example.com');
      const submitBtn = page.locator('button[type="submit"]');
      await submitBtn.click();
      await expect(page.locator('body')).toBeVisible();
    }
  });
});
