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
    else if (url.pathname.endsWith('/rpc/get_own_member_card')) data = {token:'00000000-0000-4000-8000-000000000020'};
    else if (url.pathname.endsWith('/rpc/verify_member_card')) data = {valid:true,member_id:'QA_TEST_MEMBER'};
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

test('member card downloads a real PNG whose QR opens private-safe verification', async ({ page }) => {
  await session(page, false); await page.goto('/dashboard');
  const selector = '#id-card svg'; await expect(page.locator(selector)).toBeVisible();
  const url='http://127.0.0.1:3100/verify-membership/00000000-0000-4000-8000-000000000020';
  expect(await decodeSvg(page, selector)).toBe(url);
  const pending=page.waitForEvent('download');await page.getByRole('button',{name:'Download ID Card',exact:true}).click();
  const download=await pending;expect(download.suggestedFilename()).toBe('DataCamp-ID-QA_TEST_MEMBER.png');
  const stream=await download.createReadStream();const chunks:Buffer[]=[];for await(const chunk of stream!)chunks.push(Buffer.from(chunk));
  const pixels=await page.evaluate(async value=>{const image=new Image();image.src='data:image/png;base64,'+value;await image.decode();const c=document.createElement('canvas');c.width=image.width;c.height=image.height;const ctx=c.getContext('2d')!;ctx.drawImage(image,0,0);return {width:image.width,height:image.height,data:Array.from(ctx.getImageData(1180,580,330,330).data)};},Buffer.concat(chunks).toString('base64'));
  expect(pixels.width).toBe(1586);expect(pixels.height).toBe(1000);
  expect(jsQR(new Uint8ClampedArray(pixels.data),330,330)?.data).toBe(url);
  await page.goto(url);await expect(page.getByText('Valid membership card',{exact:true})).toBeVisible();
  await expect(page.getByText('QA_TEST_MEMBER',{exact:true})).toBeVisible();
});

test('profile security sends recovery link and requests email confirmation without profile overwrite',async({page})=>{
 const writes=await session(page,false);await page.goto('/profile');
 await page.getByRole('button',{name:'Send password reset link',exact:true}).click();
 await expect(page.getByText('Password recovery link sent to qa_test@example.invalid',{exact:true})).toBeVisible();
 expect(writes.some(w=>w.path.endsWith('/recover')&&w.body.email==='qa_test@example.invalid')).toBe(true);
 expect(writes.some(w=>w.path.endsWith('/otp'))).toBe(false);
 await page.getByRole('button',{name:'Change email address',exact:true}).click();
 await page.getByRole('dialog').getByRole('textbox',{name:'New email address'}).fill('QA_TEST_NEW@example.invalid');
 await page.getByRole('button',{name:'Send confirmation',exact:true}).click();
 await expect(page.getByRole('dialog')).toHaveCount(0);
 expect(writes.some(w=>w.method==='PUT'&&w.path.endsWith('/user')&&w.body.email==='QA_TEST_NEW@example.invalid')).toBe(true);
 expect(writes.some(w=>w.method==='PATCH'&&w.path.endsWith('/profiles'))).toBe(false);
  await expect(page.getByText(/SMS fallback|via OTP/)).toHaveCount(0);
});

test('profile email-change rejection stays visible and does not claim success',async({page})=>{
 await session(page,false);
 await page.route('https://qa-test.supabase.co/auth/v1/user**',async route=>{if(route.request().method()==='PUT')return route.fulfill({status:422,contentType:'application/json',body:JSON.stringify({msg:'QA_TEST_EMAIL_REJECTED',code:'validation_failed'})});await route.fallback();});
 await page.goto('/profile');await page.getByRole('button',{name:'Change email address',exact:true}).click();
 await page.getByRole('dialog').getByRole('textbox',{name:'New email address'}).fill('QA_TEST_NEW@example.invalid');
 await page.getByRole('button',{name:'Send confirmation',exact:true}).click();
 await expect(page.getByText('QA_TEST_EMAIL_REJECTED',{exact:true})).toBeVisible();await expect(page.getByRole('dialog')).toBeVisible();
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

test('card issuance failure disables download and retry recovers', async ({page}) => {
 await session(page,false);let attempts=0;
 await page.route('**/rest/v1/rpc/get_own_member_card',route=>{attempts++;return route.fulfill(attempts===1?{status:403,contentType:'application/json',body:JSON.stringify({message:'Verify email'})}:{contentType:'application/json',body:JSON.stringify({token:'00000000-0000-4000-8000-000000000020'})});});
 await page.goto('/dashboard');await expect(page.getByRole('alert')).toContainText('Unable to issue card');
 await expect(page.getByRole('button',{name:'Download ID Card',exact:true})).toBeDisabled();
 await expect(page.locator('#id-card svg')).toHaveCount(0);
 await page.getByRole('button',{name:'Retry card issuance'}).click();
 await expect(page.locator('#id-card svg')).toBeVisible();
 await expect(page.getByRole('button',{name:'Download ID Card',exact:true})).toBeEnabled();expect(attempts).toBe(2);
});

test('password recovery rejection is visible and retry works',async({page})=>{
 await session(page,false);let attempts=0;
 await page.route('**/auth/v1/recover**',route=>{attempts++;return route.fulfill(attempts===1?{status:429,contentType:'application/json',body:JSON.stringify({msg:'QA_TEST_MAIL_LIMIT',code:'over_email_send_rate_limit'})}:{contentType:'application/json',body:'{}'});});
 await page.goto('/profile');const button=page.getByRole('button',{name:'Send password reset link',exact:true});await button.click();
 await expect(page.getByText('QA_TEST_MAIL_LIMIT',{exact:true})).toBeVisible();await expect(button).toBeEnabled();
 await expect(page.getByText(/Password recovery link sent/)).toHaveCount(0);await button.click();
 await expect(page.getByText('Password recovery link sent to qa_test@example.invalid',{exact:true})).toBeVisible();
});

test('malformed membership URL is rejected without database lookup',async({page})=>{
 await session(page,false);let calls=0;page.on('request',r=>{if(r.url().includes('verify_member_card'))calls++;});
 await page.goto('/verify-membership/------------------------------------');
 await expect(page.getByText('Invalid card or inactive membership',{exact:true})).toBeVisible();expect(calls).toBe(0);
});

test('unknown membership token exposes no personal details',async({page})=>{
 await session(page,false);await page.route('**/rest/v1/rpc/verify_member_card',r=>r.fulfill({contentType:'application/json',body:'{"valid":false}'}));
 await page.goto('/verify-membership/00000000-0000-4000-8000-000000000020');
 await expect(page.getByText('Invalid card or inactive membership',{exact:true})).toBeVisible();
 await expect(page.locator('main')).not.toContainText('QA_TEST_MEMBER');await expect(page.locator('main')).not.toContainText('qa_test@example.invalid');
});

test('password reset validates strength and surfaces authentication rejection',async({page})=>{
 const writes=await session(page,false);await page.route('**/auth/v1/user**',async r=>{if(r.request().method()==='PUT')return r.fulfill({status:401,contentType:'application/json',body:JSON.stringify({msg:'QA_TEST_RECOVERY_EXPIRED',code:'session_not_found'})});await r.fallback();});
 await page.goto('/reset-password');const inputs=page.locator('input');await inputs.nth(0).fill('weak');await inputs.nth(1).fill('weak');
 await page.locator('form button[type="submit"]').click();await expect(page.getByText('Password must be at least 8 characters long.',{exact:true})).toBeVisible();expect(writes.filter(w=>w.method==='PUT')).toHaveLength(0);
 await inputs.nth(0).fill('QA_TEST_Strong1!');await inputs.nth(1).fill('QA_TEST_Strong1!');await page.locator('form button[type="submit"]').click();
 await expect(page.getByText('QA_TEST_RECOVERY_EXPIRED',{exact:true})).toBeVisible();await expect(page.getByText('Password updated successfully!',{exact:true})).toHaveCount(0);
});
