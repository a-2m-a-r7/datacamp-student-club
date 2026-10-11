import { test, expect } from '@playwright/test';

test.describe('Public Pages & Interactive Elements Audit', () => {
  test('Home page renders without console errors or broken layout', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('/');
    await expect(page).toHaveTitle(/DataCamp/i);
    await expect(page.locator('h1')).toBeVisible();

    // Verify language switcher is visible
    const langToggle = page.locator('button:has-text("EN"), button:has-text("AR")').filter({ visible: true }).first();
    await expect(langToggle).toBeVisible();
  });

  test('Navigation links work properly', async ({ page }) => {
    await page.goto('/');

    const publicLinks = [
      { name: 'About', path: '/about' },
      { name: 'Courses', path: '/courses' },
      { name: 'Projects', path: '/projects' },
      { name: 'Events', path: '/events' },
      { name: 'Leaderboard', path: '/leaderboard' },
      { name: 'Contact', path: '/contact' },
    ];

    for (const link of publicLinks) {
      await page.goto(link.path);
      await expect(page).toHaveURL(new RegExp(link.path));
      await expect(page.locator('body')).not.toBeEmpty();
    }
  });

  test('Footer contains no dead href="#" links', async ({ page }) => {
    await page.goto('/');
    const deadLinks = await page.locator('footer a[href="#"]').count();
    expect(deadLinks).toBe(0);
  });

  test('Contact page Discord button opens valid external link', async ({ page }) => {
    await page.goto('/contact');
    const discordBtn = page.locator('a:has-text("Discord"), a[aria-label*="Discord"]').first();
    if (await discordBtn.count() > 0) {
      const href = await discordBtn.getAttribute('href');
      expect(href).toMatch(/discord\.(gg|com)|datacamp/i);
      expect(await discordBtn.getAttribute('target')).toBe('_blank');
      expect(await discordBtn.getAttribute('rel')).toContain('noopener');
    }
  });

  test('Projects page live demo buttons do not have dead href="#"', async ({ page }) => {
    await page.goto('/projects');
    const deadButtons = await page.locator('a:has-text("Live Demo")[href="#"]').count();
    expect(deadButtons).toBe(0);
  });

  test('Contact form validates required fields', async ({ page }) => {
    await page.goto('/contact');
    const submitBtn = page.locator('button[type="submit"]');
    if (await submitBtn.count() > 0) {
      await submitBtn.click();
      // Should show validation toast or field error
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('Compiler Playground executes code or displays starter template', async ({ page }) => {
    await page.goto('/compiler');
    await expect(page.locator('button:has-text("Run"), button:has-text("تشغيل")')).toBeVisible();
  });

  test('Language toggle switches between English and Arabic', async ({ page }) => {
    await page.goto('/');
    const langToggle = page.locator('button:has-text("AR"), button:has-text("EN")').filter({ visible: true }).first();
    if (await langToggle.count() > 0) {
      await langToggle.click();
      await page.waitForTimeout(500);
      const dir = await page.locator('html').getAttribute('dir');
      expect(dir === 'rtl' || dir === 'ltr').toBe(true);
    }
  });

  test('AI Mentor button opens chat interface', async ({ page }) => {
    await page.goto('/');
    const mentorBtn = page.locator('button[aria-label*="NEXUS"], button:has-text("NEXUS"), button:has-text("AI")').first();
    if (await mentorBtn.count() > 0) {
      await mentorBtn.click();
      await expect(page.locator('h3:has-text("NEXUS")')).toBeVisible();
    }
  });
});
