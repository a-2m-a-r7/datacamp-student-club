import {test,expect,Page} from '@playwright/test';
import {PGlite} from '@electric-sql/pglite';
import fs from 'node:fs';
import jsQR from 'jsqr';

const uid='00000000-0000-4000-8000-000000000101';
const cid='00000000-0000-4000-8000-000000000102';
const lid='00000000-0000-4000-8000-000000000103';
const qid='00000000-0000-4000-8000-000000000104';
let db:PGlite;
test.afterEach(async()=>{await db?.close();});

// Browser operations execute the actual PostgreSQL routines. Only Auth identity
// is a QA fixture; data, completion, grading and certificate persistence are SQL.
async function learningDatabase(page:Page,quiz=false){
 db=new PGlite();
 await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
 CREATE SCHEMA auth; CREATE TABLE auth.users(id uuid PRIMARY KEY,email text,email_confirmed_at timestamptz,raw_user_meta_data jsonb DEFAULT '{}',raw_app_meta_data jsonb DEFAULT '{}');
 CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT NULLIF(current_setting('qa.uid',true),'')::uuid $$;
 CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql AS $$ SELECT current_user::text $$;
 GRANT USAGE ON SCHEMA public,auth TO anon,authenticated; GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA auth TO anon,authenticated;
 CREATE SCHEMA storage; CREATE TABLE storage.buckets(id text PRIMARY KEY,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
 CREATE TABLE storage.objects(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),bucket_id text,name text); ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
 GRANT USAGE ON SCHEMA storage TO anon,authenticated; GRANT SELECT,INSERT,UPDATE,DELETE ON ALL TABLES IN SCHEMA storage TO anon,authenticated;`);
 for(const file of fs.readdirSync('supabase/migrations').filter(f=>f.startsWith('20261013')).sort())await db.exec(fs.readFileSync('supabase/migrations/'+file,'utf8'));
 await db.exec('GRANT SELECT,INSERT,UPDATE,DELETE ON ALL TABLES IN SCHEMA public TO anon,authenticated;');
 await db.query("INSERT INTO auth.users(id,email,email_confirmed_at,raw_user_meta_data) VALUES($1,'qa_test_course@example.invalid',now(),'{\"full_name\":\"QA_TEST_COURSE_MEMBER\"}')",[uid]);
 await db.query("INSERT INTO courses(id,title,slug,is_published,total_lessons) VALUES($1,'QA_TEST_AUTOMATIC_COURSE','qa-test-automatic',true,$2)",[cid,quiz?2:1]);
 await db.query("INSERT INTO lessons(id,course_id,title,type,content,position,points_reward) VALUES($1,$2,'QA_TEST_LESSON','article','QA_TEST_LESSON_CONTENT',1,10)",[lid,cid]);
 if(quiz)await db.query("INSERT INTO lessons(id,course_id,title,type,position,quiz_questions) VALUES($1,$2,'QA_TEST_ASSESSMENT','quiz',2,$3)",[qid,cid,JSON.stringify([{id:'QA_TEST_Q',question:'QA_TEST_QUESTION',options:['QA_TEST_WRONG','QA_TEST_CORRECT'],correctIndex:1}])]);
 await db.query("SELECT set_config('qa.uid',$1,false)",[uid]);await db.exec('SET ROLE authenticated;');
 const user={id:uid,email:'qa_test_course@example.invalid',email_confirmed_at:'2026-10-13T00:00:00Z',app_metadata:{provider:'email'},user_metadata:{full_name:'QA_TEST_COURSE_MEMBER'}};
 const token=Buffer.from('{"alg":"HS256"}').toString('base64url')+'.'+Buffer.from(JSON.stringify({sub:uid,exp:4102444800})).toString('base64url')+'.QA_TEST_SIGNATURE';
 await page.addInitScript(({user,token})=>{localStorage.setItem('datacamp_language','en');sessionStorage.setItem('datacamp_supabase_auth_token',JSON.stringify({user,access_token:token,refresh_token:'QA_TEST',expires_at:4102444800,token_type:'bearer'}));},{user,token});
 const calls:string[]=[];
 await page.route('https://qa-test.supabase.co/**',async route=>{
  const r=route.request(),url=new URL(r.url()),resource=url.pathname.split('/').pop()!;
  const body=r.method()==='GET'?null:r.postDataJSON();let data:any=[];
  try{
   if(url.pathname.includes('/auth/v1/user'))data=user;
   else if(url.pathname.includes('/rpc/')){
    calls.push(resource);let result;
    if(resource==='enroll_course')result=await db.query('SELECT enroll_course($1) AS value',[body.p_course_id]);
    else if(resource==='complete_course_lesson')result=await db.query('SELECT complete_course_lesson($1,$2) AS value',[body.p_course_id,body.p_lesson_id]);
    else if(resource==='submit_course_quiz')result=await db.query('SELECT submit_course_quiz($1,$2) AS value',[body.p_lesson_id,JSON.stringify(body.p_answers)]);
    else if(resource==='issue_course_certificate')result=await db.query('SELECT issue_course_certificate($1) AS value',[body.p_course_id]);
    else if(resource==='verify_certificate')result=await db.query('SELECT verify_certificate($1) AS value',[body.p_code]);
    else if(resource==='public_stats')result=await db.query('SELECT public_stats() AS value');
    else if(resource==='refresh_badges')result=await db.query('SELECT refresh_badges() AS value');
    data=result?.rows[0]?.value||[];
   }else if(['profiles','courses','lessons','enrollments','certificates','points_log','user_achievements'].includes(resource)){
    if(r.method()==='PATCH'&&resource==='profiles'&&body?.last_seen_at)await db.query('UPDATE profiles SET last_seen_at=$1 WHERE id=$2',[body.last_seen_at,uid]);
    const query=resource==='courses'?['SELECT * FROM courses WHERE slug=$1',['qa-test-automatic']]:resource==='lessons'?['SELECT * FROM lessons WHERE course_id=$1 ORDER BY position',[cid]]:resource==='enrollments'?['SELECT * FROM enrollments WHERE course_id=$1',[cid]]:resource==='certificates'?['SELECT * FROM certificates ORDER BY issued_at DESC',[]]:['SELECT * FROM '+resource,[]];
    const rows=(await db.query(query[0] as string,query[1] as any[])).rows;
    data=r.headers().accept?.includes('vnd.pgrst.object')?(rows[0]||null):rows;
   }
   await route.fulfill({contentType:'application/json',body:JSON.stringify(data)});
  }catch(error:any){await route.fulfill({status:400,contentType:'application/json',body:JSON.stringify({message:error.message,code:error.code||'QA_TEST_SQL_ERROR'})});}
 });
 await page.route('https://fonts.googleapis.com/**',r=>r.fulfill({body:''}));
 await page.route('https://api.dicebear.com/**',r=>r.abort());
 return calls;
}
async function bytes(download:any){const stream=await download.createReadStream();const parts:Buffer[]=[];for await(const part of stream)parts.push(Buffer.from(part));return Buffer.concat(parts);}
async function certificates(){return(await db.query('SELECT * FROM certificates WHERE course_id=$1',[cid])).rows as any[];}

test('last lesson automatically issues one certificate, exports real PNG/PDF and verifies saved course',async({page})=>{
 const calls=await learningDatabase(page);
 const oldCourse=crypto.randomUUID(),oldLesson=crypto.randomUUID();
 await db.exec('RESET ROLE;');await db.query("INSERT INTO courses(id,title,slug,is_published) VALUES($1,'QA_TEST_OTHER_COURSE','qa-test-other',true)",[oldCourse]);await db.query("INSERT INTO lessons(id,course_id,title) VALUES($1,$2,'QA_TEST_OTHER_LESSON')",[oldLesson,oldCourse]);
 await db.query("INSERT INTO enrollments(user_id,course_id,is_completed,completed_lessons,progress_percent,status) VALUES($1,$2,true,ARRAY[$3::text],100,'completed')",[uid,oldCourse,oldLesson]);await db.query("UPDATE certificates SET issued_at='2099-01-01' WHERE course_id=$1",[oldCourse]);await db.exec('SET ROLE authenticated;');
 await page.goto('/courses/qa-test-automatic/learn');
 await page.getByRole('button',{name:'COMPLETE & CLAIM +10 XP',exact:true}).click();
 await expect(page.getByText('Course completed! Your certificate has been issued and saved.',{exact:true})).toBeVisible();
 expect(await certificates()).toHaveLength(1);const cert=(await certificates())[0];
 expect(calls).not.toContain('issue_course_certificate');
 await page.getByRole('button',{name:'VIEW CERTIFICATE',exact:true}).click();await expect(page).toHaveURL(new RegExp('/certificates\\?course='+cid+'$'));
 await expect(page.locator('#printable-certificate')).toContainText('QA_TEST_AUTOMATIC_COURSE');
 await expect(page.locator('#printable-certificate')).not.toContainText('QA_TEST_OTHER_COURSE');
 await page.getByRole('button',{name:'View certificate for QA_TEST_OTHER_COURSE',exact:true}).click();await expect(page.locator('#printable-certificate')).toContainText('QA_TEST_OTHER_COURSE');
 await page.getByRole('button',{name:'View certificate for QA_TEST_AUTOMATIC_COURSE',exact:true}).click();await expect(page.locator('#printable-certificate')).toContainText('QA_TEST_AUTOMATIC_COURSE');
 await page.route('**/logos/*.png',async route=>{await new Promise(resolve=>setTimeout(resolve,1500));await route.continue();});
 const pngPromise=page.waitForEvent('download');await page.getByRole('button',{name:'PNG IMAGE',exact:true}).click();
 await page.getByRole('button',{name:'View certificate for QA_TEST_OTHER_COURSE',exact:true}).click();
 const png=await pngPromise;
 expect(png.suggestedFilename()).toContain(cert.verification_code);const pngBytes=await bytes(png);
 if(test.info().project.name==='1440')await png.saveAs('qa-audit/course-certificate-preview.png');
 const pixels=await page.evaluate(async b=>{const i=new Image();i.src='data:image/png;base64,'+b;await i.decode();const c=document.createElement('canvas');c.width=i.width;c.height=i.height;const ctx=c.getContext('2d')!;ctx.drawImage(i,0,0);return{width:i.width,height:i.height,data:Array.from(ctx.getImageData(1355,1270,195,195).data)};},pngBytes.toString('base64'));
 expect([pixels.width,pixels.height]).toEqual([2400,1697]);expect(jsQR(new Uint8ClampedArray(pixels.data),195,195)?.data).toBe('http://127.0.0.1:3100/verify-certificate/'+cert.verification_code);
 await page.unroute('**/logos/*.png');await page.getByRole('button',{name:'View certificate for QA_TEST_AUTOMATIC_COURSE',exact:true}).click();
 const pdfPromise=page.waitForEvent('download');await page.getByRole('button',{name:'DOWNLOAD PDF',exact:true}).click();const pdf=await pdfPromise;expect((await bytes(pdf)).subarray(0,5).toString()).toBe('%PDF-');
 await page.goto('/verify-certificate/'+cert.verification_code);await expect(page.getByText('AUTHENTIC CREDENTIAL VERIFIED',{exact:true})).toBeVisible();await expect(page.locator('#printable-certificate')).toContainText('QA_TEST_AUTOMATIC_COURSE');
 await page.goto('/courses/qa-test-automatic/learn');await expect(page.getByRole('button',{name:'LESSON COMPLETED',exact:true})).toBeDisabled();expect(await certificates()).toHaveLength(1);
 await page.goto('/certificates?course=00000000-0000-4000-8000-000000000999');await expect(page.getByText('No certificate has been issued for this course yet.',{exact:true})).toBeVisible();await expect(page.locator('#printable-certificate')).toHaveCount(0);
});

test('partial completion and failed inline assessment do not issue; passing final assessment does',async({page})=>{
 const calls=await learningDatabase(page,true);await page.goto('/courses/qa-test-automatic/learn');await page.getByRole('button',{name:'COMPLETE & CLAIM +10 XP',exact:true}).click();
 await expect(page.getByRole('heading',{name:'QA_TEST_ASSESSMENT',exact:true})).toBeVisible();expect(await certificates()).toHaveLength(0);
 await page.getByRole('button',{name:'QA_TEST_WRONG',exact:true}).click();await page.getByRole('button',{name:'SUBMIT_ASSESSMENT',exact:true}).click();
 await expect(page.getByText('Passing score is 80%',{exact:true})).toBeVisible();expect(await certificates()).toHaveLength(0);
 await page.getByRole('button',{name:'RETRY_QUIZ',exact:true}).click();await page.getByRole('button',{name:'QA_TEST_CORRECT',exact:true}).click();await page.getByRole('button',{name:'SUBMIT_ASSESSMENT',exact:true}).click();
 await expect(page.getByText('Your course certificate was issued automatically',{exact:true})).toBeVisible();expect(await certificates()).toHaveLength(1);expect(calls).not.toContain('issue_course_certificate');
 await page.getByRole('button',{name:'VIEW CERTIFICATE',exact:true}).click();await expect(page.locator('#printable-certificate')).toContainText('QA_TEST_AUTOMATIC_COURSE');
});

test('standalone final quiz creates and opens the matching persisted certificate',async({page})=>{
 await learningDatabase(page,true);await page.goto('/courses/qa-test-automatic/learn');await page.getByRole('button',{name:'COMPLETE & CLAIM +10 XP',exact:true}).click();await expect(page.getByRole('heading',{name:'QA_TEST_ASSESSMENT',exact:true})).toBeVisible();
 const before=Number((await db.query<{total_points:number}>('SELECT total_points FROM profiles')).rows[0].total_points);
 await page.goto('/courses/qa-test-automatic/quiz');await page.getByRole('button',{name:/QA_TEST_CORRECT/}).click();await page.getByRole('button',{name:'SUBMIT ASSESSMENT',exact:true}).click();
 await expect(page.getByText('ASSESSMENT COMPLETED!',{exact:true})).toBeVisible();const after=Number((await db.query<{total_points:number}>('SELECT total_points FROM profiles')).rows[0].total_points);await expect(page.getByText(`+${after-before} XP recorded`,{exact:true})).toBeVisible();
 await expect(page.getByText('Course completed. Your certificate was issued automatically.',{exact:true})).toBeVisible();expect(await certificates()).toHaveLength(1);await page.getByRole('button',{name:'VIEW CERTIFICATE',exact:true}).click();await expect(page.locator('#printable-certificate')).toContainText('QA_TEST_AUTOMATIC_COURSE');
});

test('database certificate failure rolls back the UI flow; storage and list retries recover honestly',async({page})=>{
 await learningDatabase(page);await db.exec("RESET ROLE; CREATE FUNCTION qa_test_fail_certificate() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'QA_TEST_CERTIFICATE_FAILURE'; END;$$; CREATE TRIGGER qa_test_fail_certificate BEFORE INSERT ON certificates FOR EACH ROW EXECUTE FUNCTION qa_test_fail_certificate(); SET ROLE authenticated;");
 await page.goto('/courses/qa-test-automatic/learn');await page.getByRole('button',{name:'COMPLETE & CLAIM +10 XP',exact:true}).click();await expect(page.getByText('QA_TEST_CERTIFICATE_FAILURE',{exact:true})).toBeVisible();expect(await certificates()).toHaveLength(0);await expect(page.getByRole('button',{name:'VIEW CERTIFICATE',exact:true})).toHaveCount(0);
 const en=(await db.query('SELECT * FROM enrollments WHERE course_id=$1',[cid])).rows[0] as any;expect(en.is_completed).toBe(false);expect(en.progress_percent).toBe(0);
 await db.exec('RESET ROLE; DROP TRIGGER qa_test_fail_certificate ON certificates; DROP FUNCTION qa_test_fail_certificate(); SET ROLE authenticated;');await page.getByRole('button',{name:'COMPLETE & CLAIM +10 XP',exact:true}).click();await expect(page.getByRole('button',{name:'VIEW CERTIFICATE',exact:true})).toBeVisible();
 await page.route('**/rest/v1/certificates**',r=>r.fulfill({status:503,contentType:'application/json',body:'{"message":"QA_TEST_UNAVAILABLE"}'}));await page.getByRole('button',{name:'VIEW CERTIFICATE',exact:true}).click();await expect(page.getByText('Unable to load certificates from the database.',{exact:true})).toBeVisible();await expect(page.getByText('NO CERTIFICATES ISSUED YET',{exact:true})).toHaveCount(0);
 await page.unroute('**/rest/v1/certificates**');await page.getByRole('button',{name:'Retry loading certificates',exact:true}).click();await expect(page.locator('#printable-certificate')).toContainText('QA_TEST_AUTOMATIC_COURSE');
});
