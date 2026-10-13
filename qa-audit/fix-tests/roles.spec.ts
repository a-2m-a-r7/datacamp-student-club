import { test, expect, Page } from '@playwright/test';
import jsQR from 'jsqr';
const id = '00000000-0000-4000-8000-000000000002';
const article = { id: '00000000-0000-4000-8000-000000000009', title: 'QA_TEST_ARTICLE', content: 'QA_TEST_CONTENT', author: 'QA_TEST_ADMIN', date: '2026-10-13', status: 'published' };
async function session(page: Page, admin: boolean) {
  const profile = { id, email: 'QA_TEST@example.invalid', full_name: 'QA_TEST_ACCOUNT', role: admin ? 'admin' : 'user', status: 'active',
    member_id: 'QA_TEST_MEMBER', total_points: 0, xp: 0, is_verified: true, created_at: '2026-10-13T00:00:00Z' };
  const user = { id, email: profile.email, email_confirmed_at: '2026-10-13T00:00:00Z', app_metadata: { provider: 'email' }, user_metadata: {} };
  const token = Buffer.from(JSON.stringify({ alg: 'HS256' })).toString('base64url') + '.' + Buffer.from(JSON.stringify({ sub: id, exp: 4102444800 })).toString('base64url') + '.QA_TEST_SIGNATURE';
  await page.addInitScript(({ user, token }) => {
    localStorage.setItem('datacamp_language', 'en');
    sessionStorage.setItem('datacamp_supabase_auth_token', JSON.stringify({ user, access_token: token, refresh_token: 'QA_TEST', expires_at: 4102444800, token_type: 'bearer' }));
  }, { user, token });
  let savedForm: any = null;
  let savedQuestions: any[] = [];
  let savedArticle = { ...article };
  const writes: any[] = [];
  await page.route('https://qa-test.supabase.co/**', async route => {
    const request = route.request(), url = new URL(request.url());
    const body = request.method() === 'GET' ? null : request.postDataJSON();
    if (body) writes.push({ path: url.pathname, method: request.method(), body });
    let data: any = [];
    if (url.pathname.includes('/auth/v1/user')) data = user;
    else if (url.pathname.endsWith('/profiles')) {
      if (request.method() === 'PATCH') Object.assign(profile, body);
      data = request.headers().accept?.includes('vnd.pgrst.object') ? profile : [profile];
    }
    else if (url.pathname.endsWith('/blog')) {
      if (request.method() === 'PATCH') savedArticle = { ...savedArticle, ...body };
      data = request.headers().accept?.includes('vnd.pgrst.object') ? savedArticle : [savedArticle];
    } else if (url.pathname.endsWith('/rpc/save_form')) {
      savedForm = { ...body.p_form, id: savedForm?.id || '00000000-0000-4000-8000-000000000010' };
      savedQuestions = body.p_questions.map((q: any) => ({ ...q, form_id: savedForm.id }));
      data = { form: savedForm, questions: savedQuestions };
    } else if (url.pathname.endsWith('/forms')) data = savedForm ? [savedForm] : [];
    else if (url.pathname.endsWith('/form_questions')) data = savedQuestions;
    else if (url.pathname.endsWith('/rpc/public_stats')) data = { members: 1, events: 0, projects: 0, certificates: 0 };
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify(data) });
  });
  await page.route('https://fonts.googleapis.com/**', route => route.fulfill({ body: '' }));
  await page.route('https://api.dicebear.com/**', route => route.abort());
  return writes;
}

test('member cannot search or download the club member directory', async ({ page }) => {
  await session(page, false); let directoryCalls=0;
  page.on('request', request=>{if(request.url().includes('public_leaderboard'))directoryCalls++;});
  await page.goto('/leaderboard');
  await expect(page.getByText('Club member directory is available to administrators only')).toBeVisible();
  expect(directoryCalls).toBe(0);
  await expect(page.locator('input')).toHaveCount(0);
  await expect(page.locator('aside a[href="/leaderboard"]')).toHaveCount(0);
});

test('profile saves edited name, rejects invalid phone and logs out', async ({ page }) => {
  const writes=await session(page,false); await page.goto('/profile');
  const form=page.locator('form').first();
  await form.locator('input').filter({visible:true}).first().fill('QA_TEST_UPDATED_MEMBER');
  await page.getByRole('button',{name:'SAVE_CHANGES',exact:true}).click();
  await expect(page.getByText('Profile updated successfully in database')).toBeVisible();
  expect(writes.some(w=>w.method==='PATCH'&&w.body.full_name==='QA_TEST_UPDATED_MEMBER')).toBe(true);
  const patches=writes.filter(w=>w.method==='PATCH').length;
  await form.locator('input').filter({visible:true}).nth(1).fill('000');
  await page.getByRole('button',{name:'SAVE_CHANGES',exact:true}).click();
  await expect(page.getByText('Invalid Egyptian phone format (+201XXXXXXXXX)',{exact:true})).toBeVisible();
  expect(writes.filter(w=>w.method==='PATCH')).toHaveLength(patches);
  await page.getByRole('button',{name:'SIGN_OUT',exact:true}).click();
  await expect(page).toHaveURL(/\/login$/);
});

test('form publish waits for autosave and reuses the created ID', async ({ page }) => {
  await session(page, true);
  const saves: any[] = [];
  await page.route('https://qa-test.supabase.co/rest/v1/rpc/save_form', async route => {
    const body = route.request().postDataJSON(); saves.push(body);
    if (saves.length === 1) await new Promise(resolve => setTimeout(resolve, 2200));
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify({
      form: { ...body.p_form, id: '00000000-0000-4000-8000-000000000010' }, questions: body.p_questions
    }) });
  });
  await page.goto('/admin/forms/new');
  await page.getByPlaceholder('Form Title...').fill('QA_TEST_DRAFT');
  await expect.poll(() => saves.length).toBe(1);
  await page.getByPlaceholder('Form Title...').fill('QA_TEST_PUBLISHED');
  await page.getByRole('button', { name: 'Publish', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  expect(saves).toHaveLength(2);
  expect(saves[0].p_form.id).toBe('');
  expect(saves[1].p_form.id).toBe('00000000-0000-4000-8000-000000000010');
  expect(saves[1].p_form.title).toBe('QA_TEST_PUBLISHED');
  expect(saves[1].p_form.status).toBe('published');
});

test('member direct admin URL stays outside admin controls', async ({ page }) => {
  await session(page, false); await page.goto('/admin/users');
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole('button', { name: /ADD OPERATIVE/ })).toHaveCount(0);
  await expect(page.locator('aside a[href^="/admin"]')).toHaveCount(0);
});

for (const route of ['/admin', '/admin/users', '/admin/events', '/admin/staff', '/admin/gallery', '/admin/content', '/admin/projects',
  '/admin/blog', '/admin/messages', '/admin/courses', '/admin/points', '/admin/forms', '/admin/forms/new', '/admin/security', '/admin/settings',
  '/dashboard', '/profile', '/my-courses', '/notifications']) {
  test('authenticated fixture renders ' + route, async ({ page }) => {
    await session(page, true);
    const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
    await page.goto(route); await expect(page.locator('main')).toBeVisible();
    await expect(page).toHaveURL(new RegExp(route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$'));
    await expect(page.getByText('Something went wrong', { exact: false })).toHaveCount(0);
    expect(errors).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  });
}

test('blog edit opens, saves via PATCH and closes', async ({ page }) => {
  const writes = await session(page, true); await page.goto('/admin/blog');
  await page.getByRole('button', { name: 'Edit QA_TEST_ARTICLE' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('dialog').locator('input').first().fill('QA_TEST_UPDATED_ARTICLE');
  await page.getByRole('button', { name: 'PUBLISH', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByText('QA_TEST_UPDATED_ARTICLE', { exact: true })).toBeVisible();
  expect(writes.some(write => write.method === 'PATCH' && write.path.endsWith('/blog') && write.body.title === 'QA_TEST_UPDATED_ARTICLE')).toBe(true);
});

test('modal Escape closes and restores trigger focus', async ({ page }) => {
  await session(page, true); await page.goto('/admin/blog');
  const trigger = page.getByRole('button', { name: 'NEW_POST' });
  await trigger.click(); await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape'); await expect(page.getByRole('dialog')).toHaveCount(0); await expect(trigger).toBeFocused();
});

test('record export downloads actual returned JSON and cache button clears browser cache', async ({ page }) => {
  await session(page, true);
  await page.route('**/api/admin/backup', route => route.fulfill({ contentType: 'application/json', body: JSON.stringify({ success: true, records: { courses: [{ title: 'QA_TEST_EXPORT' }] } }) }));
  await page.goto('/admin/settings');
  const download = page.waitForEvent('download'); await page.getByRole('button', { name: 'Export Platform Records' }).click();
  const saved = await download;
  expect(saved.suggestedFilename()).toMatch(/datacamp-records.*\.json/);
  const stream = await saved.createReadStream(); const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
  expect(JSON.parse(Buffer.concat(chunks).toString()).records.courses[0].title).toBe('QA_TEST_EXPORT');
  await page.evaluate(async () => { const cache = await caches.open('QA_TEST_CACHE'); await cache.put('/qa-cache', new Response('QA_TEST')); });
  await page.getByRole('button', { name: 'Clear Browser Cache' }).click();
  await expect.poll(() => page.evaluate(() => caches.keys())).toEqual([]);
});

async function decodeSvg(page: Page, selector: string) {
  const pixels = await page.locator(selector).first().evaluate(async element => {
    const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(element)], { type: 'image/svg+xml' }));
    try {
      const image = new Image(); image.src = url; await image.decode();
      const canvas = document.createElement('canvas'); canvas.width = canvas.height = 600;
      const ctx = canvas.getContext('2d')!; ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 600, 600); ctx.drawImage(image, 20, 20, 560, 560);
      return { data: Array.from(ctx.getImageData(0, 0, 600, 600).data), width: 600, height: 600 };
    } finally { URL.revokeObjectURL(url); }
  });
  return jsQR(new Uint8ClampedArray(pixels.data), pixels.width, pixels.height)?.data;
}

test('member badge QR decodes to the displayed member ID', async ({ page }) => {
  await session(page, false); await page.goto('/dashboard');
  const selector = 'svg[height="60"]'; await expect(page.locator(selector)).toBeVisible();
  expect(await decodeSvg(page, selector)).toBe('QA_TEST_MEMBER');
});

test('form QR has correct URL and download is a decodable PNG', async ({ page }) => {
  await session(page, true);
  const form = { id: '00000000-0000-4000-8000-000000000010', title: 'QA_TEST_FORM', slug: 'qa-test-form', status: 'published',
    allow_anonymous: true, collect_email: false, one_response_per_user: false, theme: {}, created_at: '2026-10-13T00:00:00Z' };
  await page.route('https://qa-test.supabase.co/rest/v1/forms**', route => route.fulfill({ contentType: 'application/json',
    body: JSON.stringify(route.request().headers().accept?.includes('vnd.pgrst.object') ? form : [form]) }));
  await page.goto('/admin/forms'); await page.getByRole('button', { name: 'Share Link & QR' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  expect(await decodeSvg(page, 'svg[height="130"]')).toBe('http://127.0.0.1:3100/f/qa-test-form');
  const pending = page.waitForEvent('download'); await page.getByRole('button', { name: 'Download PNG', exact: true }).click();
  const download = await pending; const stream = await download.createReadStream(); const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
  const base64 = Buffer.concat(chunks).toString('base64');
  const pixels = await page.evaluate(async value => {
    const image = new Image(); image.src = 'data:image/png;base64,' + value; await image.decode();
    const canvas = document.createElement('canvas'); canvas.width = image.width; canvas.height = image.height;
    const ctx = canvas.getContext('2d')!; ctx.drawImage(image, 0, 0);
    return { data: Array.from(ctx.getImageData(0, 0, canvas.width, canvas.height).data), width: canvas.width, height: canvas.height };
  }, base64);
  expect(jsQR(new Uint8ClampedArray(pixels.data), pixels.width, pixels.height)?.data).toBe('http://127.0.0.1:3100/f/qa-test-form');
  await page.goto('http://127.0.0.1:3100/f/qa-test-form'); await expect(page.getByText('QA_TEST_FORM', { exact: true })).toBeVisible();
});

test('certificate SVG and canvas QR decode to the matching verification URL', async ({ page }) => {
  await session(page, false);
  await page.route('https://qa-test.supabase.co/rest/v1/rpc/verify_certificate', route => route.fulfill({ contentType: 'application/json', body: JSON.stringify({
    id: 'QA_TEST_CERT', user_full_name: 'QA_TEST_MEMBER', course_title: 'QA_TEST_COURSE', type: 'course', issued_at: '2026-10-13T00:00:00Z', verification_code: 'QA_TEST_CODE',
  }) }));
  await page.goto('/verify-certificate/QA_TEST_CODE');
  await expect(page.locator('canvas[width="300"]')).toBeAttached();
  const pixels = await page.locator('canvas[width="300"]').evaluate((canvas: HTMLCanvasElement) => ({ data: Array.from(canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height).data), width: canvas.width, height: canvas.height }));
  expect(jsQR(new Uint8ClampedArray(pixels.data), pixels.width, pixels.height)?.data).toBe('http://127.0.0.1:3100/verify-certificate/QA_TEST_CODE');
  expect(await decodeSvg(page, 'svg[height="65"]')).toBe('http://127.0.0.1:3100/verify-certificate/QA_TEST_CODE');
});
