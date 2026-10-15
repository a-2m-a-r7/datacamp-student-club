import {test,expect} from '@playwright/test';
import {platform,admin,member} from '../../fix-tests/persisted-platform';

const course='40000000-0000-4000-8000-000000000001';
const article='40000000-0000-4000-8000-000000000002';
const quiz='40000000-0000-4000-8000-000000000003';
const form='40000000-0000-4000-8000-000000000004';
const routes=[
 '/', '/courses','/my-courses','/courses/qa-test-routes','/courses/qa-test-routes/learn',
 '/courses/qa-test-routes/quiz','/courses/qa-test-routes/quiz/'+quiz,
 '/certificates','/verify-certificate','/verify-certificate/QA_TEST_UNKNOWN',
 '/verify-membership/QA_TEST_UNKNOWN','/notifications','/leaderboard','/compiler',
 '/about','/projects','/events','/blog','/staff','/gallery','/contact','/faq','/privacy','/terms',
 '/login','/register','/forgot-password','/reset-password','/verify-email','/auth/callback',
 '/dashboard','/profile','/admin','/admin/users','/admin/events','/admin/staff','/admin/gallery',
 '/admin/content','/admin/projects','/admin/blog','/admin/messages','/admin/courses','/admin/points',
 '/admin/forms','/admin/forms/new','/admin/forms/builder/'+form,'/admin/forms/'+form+'/responses',
 '/admin/security','/admin/settings','/f/qa-test-routes','/QA_TEST_missing_route',
];
const protectedRoutes=['/my-courses','/notifications','/dashboard','/profile'];

for(const role of ['visitor','member','admin'] as const)for(const locale of ['en','ar'] as const){
 test(`${role} ${locale}: direct route, direction, console and overflow census`,async({page},info)=>{
  test.setTimeout(240000);
  const app=await platform();
  const failures:any[]=[];const observations:any[]=[];let errors:string[]=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  try{
   await app.db.query("INSERT INTO courses(id,title,slug,is_published) VALUES($1,'QA_TEST_ROUTES','qa-test-routes',false)",[course]);
   await app.db.query("INSERT INTO lessons(id,course_id,title,type,position,content) VALUES($1,$2,'QA_TEST_ARTICLE','article',0,'QA_TEST_CONTENT')",[article,course]);
   await app.db.query("INSERT INTO lessons(id,course_id,title,type,position,quiz_questions) VALUES($1,$2,'QA_TEST_QUIZ','quiz',1,$3)",[quiz,course,JSON.stringify([{id:'QA_TEST_q',question:'QA_TEST_QUESTION',options:['QA_TEST_A','QA_TEST_B'],correctIndex:0}])]);
   await app.db.query('UPDATE courses SET is_published=true WHERE id=$1',[course]);
   await app.db.query('INSERT INTO enrollments(user_id,course_id) VALUES($1,$2)',[member,course]);
   await app.db.query("INSERT INTO forms(id,title,slug,status,allow_anonymous) VALUES($1,'QA_TEST_ROUTES','qa-test-routes','published',true)",[form]);
   await app.db.query("INSERT INTO form_questions(form_id,type,title,required,position) VALUES($1,'short_text','QA_TEST_NAME',true,0)",[form]);
   await app.connect(page,role==='admin'?admin:role==='member'?member:null,locale);
   for(const route of routes){
    errors=[];
    try{
     await page.goto(route);await expect(page.locator('html')).toHaveAttribute('dir',locale==='ar'?'rtl':'ltr');
     await expect(page.locator('body')).not.toContainText(/SYNCHRONIZING|ESTABLISHING_SESSION|EVALUATING_PERMISSIONS|جاري المزامنة|جاري تهيئة الجلسة|جاري فحص الصلاحيات/);
     await expect.poll(()=>page.locator('h1,h2,[role="alert"]').filter({visible:true}).count()).toBeGreaterThan(0);
     if(role==='visitor'&&(protectedRoutes.includes(route)||route.includes('/learn')||route.includes('/quiz')||route.startsWith('/admin')))await expect(page).toHaveURL(/\/login(?:\?|$)/);
     if(role==='member'&&route.startsWith('/admin'))await expect(page).toHaveURL(/\/dashboard$/);
     if(role==='admin'&&route.startsWith('/admin'))await expect(page).toHaveURL(new RegExp(route.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'$'));
     const visual=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth,brokenImages:[...document.images].filter(i=>i.complete&&i.naturalWidth===0&&i.offsetWidth>0).map(i=>i.getAttribute('src')?.split('?')[0]),controls:[...document.querySelectorAll('button,a,input,select,textarea')].filter(e=>(e as HTMLElement).offsetWidth>0).length}));
     const row={route,finalPath:new URL(page.url()).pathname,locale,role,...visual,errors:[...errors]};observations.push(row);
     if(visual.scroll>visual.width+2)failures.push({...row,reason:'horizontal-overflow'});
     if(errors.length)failures.push({...row,reason:'console-error'});
     if(visual.brokenImages.length)failures.push({...row,reason:'broken-image'});
     if(failures.some(f=>f.route===route))await page.screenshot({path:info.outputPath('QA_TEST_'+route.replace(/\W/g,'_')+'.png'),fullPage:true});
    }catch(e:any){failures.push({route,locale,role,reason:'route-assertion',message:e.message.slice(0,1400)});await page.screenshot({path:info.outputPath('QA_TEST_'+route.replace(/\W/g,'_')+'_failure.png'),fullPage:true}).catch(()=>{});}
   }
   await info.attach('route-observations',{body:JSON.stringify({observations,failures},null,2),contentType:'application/json'});
   expect(failures,JSON.stringify(failures,null,2)).toEqual([]);
  }finally{await app.db.close();}
 });
}
