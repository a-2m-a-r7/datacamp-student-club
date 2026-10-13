import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('https://qa-test.supabase.co/**', route => route.fulfill({ status: 200,
    contentType: 'application/json', body: route.request().url().includes('/rpc/public_stats') ? JSON.stringify({ members: 0, events: 0, projects: 0, certificates: 0 }) : '[]' }));
  await page.route('https://fonts.googleapis.com/**', route => route.fulfill({ body: '' }));
  await page.route('https://fonts.gstatic.com/**', route => route.abort());
  await page.route('https://images.unsplash.com/**', route => route.abort());
  await page.route('https://api.dicebear.com/**', route => route.abort());
  await page.addInitScript(() => localStorage.setItem('datacamp_language', 'en'));
});

for (const path of ['/', '/about', '/courses', '/projects', '/events', '/blog', '/staff', '/gallery', '/contact', '/faq',
  '/privacy', '/terms', '/leaderboard', '/certificates', '/verify-certificate', '/compiler', '/login', '/register', '/forgot-password',
  '/reset-password', '/verify-email', '/f/qa-test-missing', '/not-a-real-page']) {
  test('public route renders without exceptions: ' + path, async ({ page }) => {
    const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
    await page.goto(path);
    await expect(page.locator('body')).not.toBeEmpty();
    if (!path.startsWith('/f/')) await expect(page.locator('main')).toBeVisible();
    await expect(page.getByText('Something went wrong', { exact: false })).toHaveCount(0);
    expect(errors).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    await expect(page.locator('a[href="#"], a[href="javascript:void(0)"]')).toHaveCount(0);
  });
}

test('a cached fabricated admin does not authenticate', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('datacamp_active_session', JSON.stringify({ id: 'QA_TEST_FAKE', role: 'super_admin', email: 'ammar.tahoun@attacker.invalid' })));
  await page.goto('/admin/users');
  await expect(page).toHaveURL(/\/login$/);
  expect(await page.evaluate(() => localStorage.getItem('datacamp_active_session'))).toBeNull();
  await expect(page.getByRole('heading', { name: /USER MANAGEMENT/ })).toHaveCount(0);
});

for (const path of ['/dashboard', '/profile', '/my-courses', '/notifications', '/courses/qa-test/learn', '/courses/qa-test/quiz', '/admin/forms/new', '/admin/settings']) {
  test('visitor guard redirects: ' + path, async ({ page }) => {
    await page.goto(path); await expect(page).toHaveURL(/\/login$/);
  });
}

test('sample controls and fabricated site metrics are absent', async ({ page }) => {
  for (const path of ['/', '/about', '/projects', '/blog', '/staff', '/gallery', '/events']) {
    await page.goto(path);
    await expect(page.getByRole('button', { name: /sample|demo/i })).toHaveCount(0);
    await expect(page.locator('body')).not.toContainText(/1,200\+|850\+|500\+|300\+/);
  }
});

test('language changes direction and mobile drawer navigates', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'العربية', exact: true }).filter({ visible: true }).first().click();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await page.getByRole('button', { name: 'EN', exact: true }).filter({ visible: true }).first().click();
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  if (page.viewportSize()!.width < 1024) await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.locator('aside').getByRole('link', { name: 'Courses', exact: true }).click();
  await expect(page).toHaveURL(/\/courses$/);
});

test('contact does not submit invalid or empty values', async ({ page }) => {
  let writes = 0;
  page.on('request', req => { if (req.method() === 'POST' && req.url().includes('/messages')) writes++; });
  await page.goto('/contact'); await page.locator('button[type="submit"]').click();
  expect(writes).toBe(0);
  expect(await page.locator('form').evaluate((form: HTMLFormElement) => form.checkValidity())).toBe(false);
});

test('JavaScript compiler actually executes and reports syntax errors', async ({ page }) => {
  await page.goto('/compiler');
  await page.getByRole('button', { name: /JavaScript/i }).click();
  await page.locator('textarea').first().fill('console.log(6 * 7)');
  await page.getByRole('button', { name: /Run Code/i }).click();
  await expect(page.getByText('42', { exact: true })).toBeVisible();
  await page.locator('textarea').first().fill('const = broken');
  await page.getByRole('button', { name: /Run Code/i }).click();
  await expect(page.getByText(/Unexpected token/).first()).toBeVisible();
});

test('compiled service outage reports failure rather than invented output', async ({ page }) => {
  await page.route('https://emkc.org/**', route => route.fulfill({ status: 503, body: '{}' }));
  await page.goto('/compiler');
  await page.getByRole('button', { name: /C\+\+/ }).click();
  await page.locator('textarea').first().fill('invalid cpp');
  await page.getByRole('button', { name: /Run Code/i }).click();
  await expect(page.getByText(/Execution service unavailable/).first()).toBeVisible();
  await expect(page.locator('body')).not.toContainText('Total XP: 9500');
});

test('form backend errors never replace results with sample records', async ({ page }) => {
  await page.route('https://qa-test.supabase.co/rest/v1/forms**', route => route.fulfill({ status: 503, contentType: 'application/json', body: '{"message":"QA_TEST_OUTAGE"}' }));
  await page.goto('/');
  const result = await page.evaluate(async () => {
    const { formService } = await import('/qa-entry.js' as any);
    if (!formService) throw new Error('Test service export missing');
    try { await formService.getForms(); return 'unexpected success'; } catch (err: any) { return err.message; }
  });
  expect(result).toBe('QA_TEST_OUTAGE');
});

test('admin server rejects unauthenticated direct requests', async ({ request }) => {
  for (const url of ['/api/admin/users', '/api/admin/backup', '/api/forms/sync-sheet']) {
    const response = await request.post(url, { data: { action: 'delete', userId: 'QA_TEST' } });
    expect(response.status()).toBe(401);
    expect((await response.json()).error).toContain('Authentication');
  }
});

test('TypeScript compiles real types and runs the resulting code', async ({ page }) => {
  await page.goto('/compiler'); await page.getByRole('button', { name: /TypeScript/ }).click();
  await page.locator('textarea').first().fill('interface Point { x: number }; const point: Point = { x: 42 }; console.log(point.x);');
  await page.getByRole('button', { name: /Run Code/i }).click();
  await expect(page.getByText('42', { exact: true })).toBeVisible();
});

test('backend compilation failure is surfaced even when HTTP returns 200', async ({ page }) => {
  await page.route('https://emkc.org/**', route => route.fulfill({ contentType: 'application/json', body: '{"compile":{"code":1,"stderr":"QA_TEST_COMPILE_ERROR"}}' }));
  await page.goto('/compiler'); await page.getByRole('button', { name: /C\+\+/ }).click();
  await page.locator('textarea').first().fill('invalid cpp'); await page.getByRole('button', { name: /Run Code/i }).click();
  await expect(page.locator('pre.text-red-300')).toHaveText('QA_TEST_COMPILE_ERROR');
});

test('nonzero runtime exit without stderr is treated as an error', async ({ page }) => {
  await page.route('https://emkc.org/**', route => route.fulfill({ contentType: 'application/json', body: '{"run":{"code":7,"stdout":"","stderr":""}}' }));
  await page.goto('/compiler'); await page.getByRole('button', { name: /C\+\+/ }).click();
  await page.getByRole('button', { name: /Run Code/i }).click();
  await expect(page.locator('pre.text-red-300')).toHaveText('Process exited with code 7');
});
