# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: lazy-features.spec.ts >> public pages defer PDF and chart packages
- Location: qa-audit\final\production-tests\lazy-features.spec.ts:21:1

# Error details

```
Error: page.goto: net::ERR_NETWORK_ACCESS_DENIED at http://127.0.0.1:3301/login
Call log:
  - navigating to "http://127.0.0.1:3301/login", waiting until "load"

```

# Test source

```ts
  1  | import {test,expect,Page} from '@playwright/test';
  2  | import fs from 'node:fs';
  3  | import {createClient} from '@supabase/supabase-js';
  4  | const cfg=JSON.parse(fs.readFileSync('qa-audit/.runtime/final-hosted/config.json','utf8'));
  5  | const secrets=JSON.parse(fs.readFileSync('qa-audit/.runtime/final-hosted/server-secrets.json','utf8'));
  6  | if(cfg.projectRef!=='kcqgnkfdpfibwkrghubl'||cfg.url!=='https://kcqgnkfdpfibwkrghubl.supabase.co')throw Error('Wrong QA target');
  7  | const claims=JSON.parse(Buffer.from(secrets.SUPABASE_SERVICE_ROLE_KEY.split('.')[1],'base64url').toString());
  8  | if(claims.ref!==cfg.projectRef||claims.role!=='service_role')throw Error('Wrong QA server key');
  9  | const server=createClient(cfg.url,secrets.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
  10 | const courseId=crypto.randomUUID(),lessonId=crypto.randomUUID();
  11 | const member=cfg.accounts.find(a=>a.kind==='member');
  12 | async function login(page:Page,kind:string){
  13 |  const account=cfg.accounts.find(a=>a.kind===kind);
  14 |  await page.goto('/login');await page.locator('input[type=email]').fill(account.email);await page.locator('input[type=password]').fill(account.password);
  15 |  await page.locator('form button[type=submit]').click();await expect(page).toHaveURL(/\/dashboard$/);
  16 | }
  17 | test.beforeEach(async({page,context})=>{
  18 |  await context.route('**/*',r=>{const u=new URL(r.request().url());return ['127.0.0.1','localhost','kcqgnkfdpfibwkrghubl.supabase.co','cdn.jsdelivr.net','fonts.googleapis.com','fonts.gstatic.com'].includes(u.hostname)?r.continue():r.abort();});
  19 |  await page.addInitScript(()=>localStorage.setItem('datacamp_language','en'));
  20 | });
  21 | test('public pages defer PDF and chart packages',async({page})=>{
  22 |  const scripts:string[]=[];const errors:string[]=[];
  23 |  page.on('request',r=>{if(r.resourceType()==='script')scripts.push(new URL(r.url()).pathname);});page.on('pageerror',e=>errors.push(e.message));
> 24 |  await page.goto('/login');await expect(page.locator('form input[type=email]')).toBeVisible();
     |             ^ Error: page.goto: net::ERR_NETWORK_ACCESS_DENIED at http://127.0.0.1:3301/login
  25 |  await page.goto('/courses');await expect(page.getByRole('heading',{name:'MASTER DATA SCIENCE & AI',exact:true})).toBeVisible();
  26 |  await expect(page.getByRole('alert')).toHaveCount(0);
  27 |  expect(scripts.filter(p=>/vendor-(pdf|charts)-/.test(p))).toEqual([]);expect(errors).toEqual([]);
  28 |  test.info().attach('loaded-scripts',{body:JSON.stringify(scripts,null,2),contentType:'application/json'});
  29 | });
  30 | test('administrator loads real growth data and renders lazy chart',async({page})=>{
  31 |  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await login(page,'admin');
  32 |  const growth=page.waitForResponse(r=>r.url().endsWith('/rest/v1/rpc/admin_growth'));
  33 |  await page.goto('/admin');expect((await growth).status()).toBe(200);
  34 |  await expect(page.locator('.recharts-surface')).toBeVisible();await expect(page.locator('.recharts-area-curve')).toBeVisible();
  35 |  expect(errors).toEqual([]);await page.screenshot({path:test.info().outputPath('QA_TEST_lazy_chart.png')});
  36 | });
  37 | test('member downloads genuine PDF from automatically issued QA certificate',async({page})=>{
  38 |  const user=createClient(cfg.url,cfg.publishableKey,{auth:{persistSession:false,autoRefreshToken:false}});
  39 |  try{
  40 |   const c=await server.from('courses').insert({id:courseId,title:'QA_TEST_Lazy_PDF',slug:'qa-test-lazy-'+courseId,is_published:true});expect(c.error).toBeNull();
  41 |   const l=await server.from('lessons').insert({id:lessonId,course_id:courseId,title:'QA_TEST_Lazy_Lesson',type:'article',position:1,content:'QA_TEST_ONLY'});expect(l.error).toBeNull();
  42 |   const signed=await user.auth.signInWithPassword({email:member.email,password:member.password});expect(signed.error).toBeNull();
  43 |   expect((await user.rpc('enroll_course',{p_course_id:courseId})).error).toBeNull();
  44 |   expect((await user.rpc('complete_course_lesson',{p_course_id:courseId,p_lesson_id:lessonId})).error).toBeNull();
  45 |   const cert=await user.from('certificates').select('id').eq('course_id',courseId).single();expect(cert.error).toBeNull();
  46 |   const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await login(page,'member');
  47 |   await page.goto('/certificates?course='+courseId);await expect(page.locator('#printable-certificate')).toContainText('QA_TEST_Lazy_PDF');
  48 |   const pending=page.waitForEvent('download');await page.getByRole('button',{name:'DOWNLOAD PDF',exact:true}).click();
  49 |   const download=await pending;const stream=await download.createReadStream();const chunks:Buffer[]=[];for await(const part of stream!)chunks.push(Buffer.from(part));
  50 |   const bytes=Buffer.concat(chunks);expect(bytes.subarray(0,5).toString()).toBe('%PDF-');expect(bytes.length).toBeGreaterThan(10000);
  51 |   await download.saveAs(test.info().outputPath('QA_TEST_lazy_certificate.pdf'));expect(errors).toEqual([]);
  52 |  }finally{
  53 |   await user.auth.signOut({scope:'local'});await user.removeAllChannels();
  54 |   // These two IDs are generated for this isolated QA test only; course deletion cascades its assets.
  55 |   await server.from('certificates').delete().eq('course_id',courseId);
  56 |   await server.from('courses').delete().eq('id',courseId);
  57 |  }
  58 | });
  59 | 
```