import { test, expect, Page } from '@playwright/test';

const uid = '00000000-0000-4000-8000-000000000002';
const certificate = { id: 'QA_TEST_CERTIFICATE', user_id: uid, user_full_name: 'QA_TEST_MEMBER', course_id: 'QA_TEST_COURSE', course_title: 'QA_TEST Python & تحليل البيانات', type: 'course', issued_at: '2026-10-14T12:00:00Z', verification_code: 'DC-QA_TEST-1' };
async function session(page: Page, arabic = false, denyClipboard = false) {
  const profile = { id: uid, email: 'QA_TEST@example.invalid', full_name: 'QA_TEST_MEMBER', role: 'user', status: 'active', member_id: 'QA_TEST_MEMBER_ID', total_points: 10, is_verified: true };
  const user = { id: uid, email: profile.email, email_confirmed_at: '2026-10-14T00:00:00Z', app_metadata: { provider: 'email' }, user_metadata: {} };
  const token = Buffer.from('{"alg":"HS256"}').toString('base64url') + '.' + Buffer.from(JSON.stringify({ sub: uid, exp: 4102444800 })).toString('base64url') + '.QA_TEST_SIGNATURE';
  await page.addInitScript(({ user, token, arabic, denyClipboard }) => {
    localStorage.setItem('datacamp_language', arabic ? 'ar' : 'en');
    sessionStorage.setItem('datacamp_supabase_auth_token', JSON.stringify({ user, access_token: token, refresh_token: 'QA_TEST', expires_at: 4102444800, token_type: 'bearer' }));
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async (value: string) => { if (denyClipboard) throw Error('QA_TEST_PERMISSION_DENIED'); (window as any).qaClipboard = value; } } });
  }, { user, token, arabic, denyClipboard });
  const writes: string[] = [];
  await page.route('https://qa-test.supabase.co/**', async route => {
    const request = route.request(), url = new URL(request.url()), resource = url.pathname.split('/').pop();
    if (request.method() !== 'GET') writes.push(resource || '');
    let data: any = [];
    if (url.pathname.includes('/auth/v1/user')) data = user;
    else if (resource === 'profiles') data = request.headers().accept?.includes('vnd.pgrst.object') ? profile : [profile];
    else if (resource === 'certificates') data = [certificate, { ...certificate, id: 'QA_TEST_CERTIFICATE_2', course_title: 'QA_TEST_SECOND_COURSE', verification_code: 'DC-QA_TEST-2' }];
    else if (resource === 'user_achievements') data = [{ id: 'QA_TEST_BADGE', user_id: uid, badge_id: 'first_steps', badge_name: 'First Steps', badge_icon: '🥇', badge_color: '#F59E0B', description: 'Completed your first lesson', unlocked_at: '2026-10-14T00:00:00Z', is_new: false }];
    else if (resource === 'get_own_member_card') data = { token: 'QA_TEST_CARD_TOKEN' };
    else if (resource === 'public_stats') data = { members: 1, events: 0, projects: 0, certificates: 1 };
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify(data) });
  });
  await page.route('https://fonts.googleapis.com/**', route => route.fulfill({ body: '' }));
  await page.route('https://api.dicebear.com/**', route => route.abort());
  return writes;
}

test('certificate sharing copies actual fields and post, opens LinkedIn safely, and follows selected certificate', async ({ page, context }) => {
  await session(page);
  await context.route('https://www.linkedin.com/**', route => route.fulfill({ contentType: 'text/html', body: '<h1>QA_TEST_LINKEDIN_DESTINATION</h1>' }));
  await page.goto('/certificates');
  await page.getByRole('button', { name: 'Share on LinkedIn: ' + certificate.course_title, exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Share on LinkedIn' });
  await expect(dialog.getByLabel('Certificate name', { exact: true })).toHaveValue(certificate.course_title);
  await expect(dialog.getByLabel('Credential ID', { exact: true })).toHaveValue(certificate.verification_code);
  const verifyUrl = 'http://127.0.0.1:3100/verify-certificate/' + certificate.verification_code;
  await expect(dialog.getByLabel('Credential URL', { exact: true })).toHaveValue(verifyUrl);
  await expect(dialog.getByLabel('Issue date', { exact: true })).toHaveValue('October 2026');
  for (const label of ['Certificate name', 'Issuing organization', 'Issue date', 'Credential ID', 'Credential URL']) {
    await dialog.getByRole('button', { name: 'Copy ' + label, exact: true }).click();
    expect(await page.evaluate(() => (window as any).qaClipboard)).toBe(await dialog.getByLabel(label, { exact: true }).inputValue());
  }
  await dialog.getByRole('button', { name: 'Copy post text', exact: true }).click();
  const post = await page.evaluate(() => (window as any).qaClipboard);
  expect(post).toContain(certificate.course_title); expect(post).toContain(verifyUrl);
  expect(post).not.toContain(uid); expect(post).not.toContain('QA_TEST@example.invalid');
  const add = dialog.getByRole('link', { name: 'Add certificate to profile', exact: true });
  await expect(add).toHaveAttribute('href', 'https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME');
  await expect(add).toHaveAttribute('rel', 'noopener noreferrer');
  const popupPromise = page.waitForEvent('popup'); await add.click(); const popup = await popupPromise;
  await popup.waitForLoadState(); expect(new URL(popup.url()).hostname).toBe('www.linkedin.com');
  expect(await popup.evaluate(() => window.opener === null)).toBe(true); await popup.close();
  const share = new URL((await dialog.getByRole('link', { name: 'Open LinkedIn post', exact: true }).getAttribute('href'))!);
  expect(share.pathname).toBe('/sharing/share-offsite/'); expect(share.searchParams.get('url')).toBe(verifyUrl);
  await page.keyboard.press('Escape'); await expect(dialog).toHaveCount(0);
  await page.getByRole('button', { name: 'View certificate for QA_TEST_SECOND_COURSE', exact: true }).click();
  await page.getByRole('button', { name: 'Share on LinkedIn: QA_TEST_SECOND_COURSE', exact: true }).click();
  await expect(page.getByRole('dialog').getByLabel('Credential ID', { exact: true })).toHaveValue('DC-QA_TEST-2');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('dashboard shares only persisted earned badges, without private directory or invented credential', async ({ page }) => {
  const writes = await session(page); await page.goto('/dashboard');
  const buttons = page.getByRole('button', { name: /^Share on LinkedIn:/ });
  await expect(buttons).toHaveCount(1);
  await page.getByRole('button', { name: 'Share on LinkedIn: First Steps', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('link', { name: 'Add certificate to profile' })).toHaveCount(0);
  await expect(dialog.getByLabel('Post text')).toContainText('Completed your first lesson');
  await dialog.getByRole('button', { name: 'Copy post text', exact: true }).click();
  const post = await page.evaluate(() => (window as any).qaClipboard);
  expect(post).toContain('First Steps'); expect(post).not.toContain('QA_TEST_MEMBER_ID'); expect(post).not.toContain(uid);
  const share = new URL((await dialog.getByRole('link', { name: 'Open LinkedIn post', exact: true }).getAttribute('href'))!);
  expect(share.searchParams.get('url')).toBe('http://127.0.0.1:3100');
  expect(writes).not.toContain('certificates'); expect(writes).not.toContain('user_achievements');
  await dialog.getByRole('button', { name: 'Close', exact: true }).click(); await expect(dialog).toHaveCount(0);
});

test('Arabic sharing keeps data selectable when clipboard permission fails', async ({ page }) => {
  await session(page, true, true); await page.goto('/certificates');
  await page.getByRole('button', { name: 'مشاركة على LinkedIn: ' + certificate.course_title, exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: 'نسخ رابط الشهادة', exact: true }).click();
  await expect(page.getByText('Clipboard access failed. Allow clipboard permission and try again.', { exact: true })).toBeVisible();
  await expect(dialog.getByLabel('رابط الشهادة', { exact: true })).toHaveValue('http://127.0.0.1:3100/verify-certificate/' + certificate.verification_code);
  await expect(dialog.getByRole('link', { name: 'إضافة الشهادة للبروفايل', exact: true })).toBeVisible();
  await expect(dialog.getByLabel('نص المنشور')).toContainText('حصلت على شهادة');
  await page.screenshot({ path: test.info().outputPath(`linkedin-${test.info().project.name}.png`) });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
