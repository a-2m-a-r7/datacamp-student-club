import {test,expect,Page} from '@playwright/test';
import fs from 'node:fs';
import {createClient} from '@supabase/supabase-js';
const cfg=JSON.parse(fs.readFileSync('qa-audit/.runtime/final-hosted/config.json','utf8'));
const secrets=JSON.parse(fs.readFileSync('qa-audit/.runtime/final-hosted/server-secrets.json','utf8'));
if(cfg.projectRef!=='kcqgnkfdpfibwkrghubl'||cfg.url!=='https://kcqgnkfdpfibwkrghubl.supabase.co')throw Error('Wrong QA target');
const claims=JSON.parse(Buffer.from(secrets.SUPABASE_SERVICE_ROLE_KEY.split('.')[1],'base64url').toString());
if(claims.ref!==cfg.projectRef||claims.role!=='service_role')throw Error('Wrong QA server key');
const server=createClient(cfg.url,secrets.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const courseId=crypto.randomUUID(),lessonId=crypto.randomUUID();
const member=cfg.accounts.find(a=>a.kind==='member');
async function login(page:Page,kind:string){
 const account=cfg.accounts.find(a=>a.kind===kind);
 await page.goto('/login');await page.locator('input[type=email]').fill(account.email);await page.locator('input[type=password]').fill(account.password);
 await page.locator('form button[type=submit]').click();await expect(page).toHaveURL(/\/dashboard$/);
}
test.beforeEach(async({page,context})=>{
 await context.route('**/*',r=>{const u=new URL(r.request().url());return ['127.0.0.1','localhost','kcqgnkfdpfibwkrghubl.supabase.co','cdn.jsdelivr.net','fonts.googleapis.com','fonts.gstatic.com'].includes(u.hostname)?r.continue():r.abort();});
 await page.addInitScript(()=>localStorage.setItem('datacamp_language','en'));
});
test('public pages defer PDF and chart packages',async({page})=>{
 const scripts:string[]=[];const errors:string[]=[];
 page.on('request',r=>{if(r.resourceType()==='script')scripts.push(new URL(r.url()).pathname);});page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/login');await expect(page.locator('form input[type=email]')).toBeVisible();
 await page.goto('/courses');await expect(page.getByRole('heading',{name:'MASTER DATA SCIENCE & AI',exact:true})).toBeVisible();
 await expect(page.getByRole('alert')).toHaveCount(0);
 expect(scripts.filter(p=>/vendor-(pdf|charts)-/.test(p))).toEqual([]);expect(errors).toEqual([]);
 test.info().attach('loaded-scripts',{body:JSON.stringify(scripts,null,2),contentType:'application/json'});
});
test('administrator loads real growth data and renders lazy chart',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await login(page,'admin');
 const growth=page.waitForResponse(r=>r.url().endsWith('/rest/v1/rpc/admin_growth'));
 await page.goto('/admin');const response=await growth;expect(response.status()).toBe(200);const points=await response.json();expect(points.length).toBeGreaterThan(0);
 await expect(page.locator('.recharts-surface')).toBeVisible();await expect(page.locator('.recharts-surface')).toContainText(points[0].name);
 // A single month has no line segment; require a curve only with two points.
 if(points.length>1)await expect(page.locator('.recharts-area-curve')).toBeVisible();
 expect(errors).toEqual([]);await page.screenshot({path:test.info().outputPath('QA_TEST_lazy_chart.png')});
});
test('member downloads genuine PDF from automatically issued QA certificate',async({page})=>{
 const user=createClient(cfg.url,cfg.publishableKey,{auth:{persistSession:false,autoRefreshToken:false}});
 try{
  const c=await server.from('courses').insert({id:courseId,title:'QA_TEST_Lazy_PDF',slug:'qa-test-lazy-'+courseId,is_published:true});expect(c.error).toBeNull();
  const l=await server.from('lessons').insert({id:lessonId,course_id:courseId,title:'QA_TEST_Lazy_Lesson',type:'article',position:1,content:'QA_TEST_ONLY'});expect(l.error).toBeNull();
  const signed=await user.auth.signInWithPassword({email:member.email,password:member.password});expect(signed.error).toBeNull();
  expect((await user.rpc('enroll_course',{p_course_id:courseId})).error).toBeNull();
  expect((await user.rpc('complete_course_lesson',{p_course_id:courseId,p_lesson_id:lessonId})).error).toBeNull();
  const cert=await user.from('certificates').select('id').eq('course_id',courseId).single();expect(cert.error).toBeNull();
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await login(page,'member');
  await page.goto('/certificates?course='+courseId);await expect(page.locator('#printable-certificate')).toContainText('QA_TEST_Lazy_PDF');
  const pending=page.waitForEvent('download');await page.getByRole('button',{name:'DOWNLOAD PDF',exact:true}).click();
  const download=await pending;const stream=await download.createReadStream();const chunks:Buffer[]=[];for await(const part of stream!)chunks.push(Buffer.from(part));
  const bytes=Buffer.concat(chunks);expect(bytes.subarray(0,5).toString()).toBe('%PDF-');expect(bytes.length).toBeGreaterThan(10000);
  await download.saveAs(test.info().outputPath('QA_TEST_lazy_certificate.pdf'));expect(errors).toEqual([]);
 }finally{
  await user.auth.signOut({scope:'local'});await user.removeAllChannels();
  // These two IDs are generated for this isolated QA test only; course deletion cascades its assets.
  await server.from('certificates').delete().eq('course_id',courseId);
  await server.from('courses').delete().eq('id',courseId);
 }
});
