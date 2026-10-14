import { test, expect, Page } from '@playwright/test';
import { PGlite } from '@electric-sql/pglite';
import fs from 'node:fs';
import jsQR from 'jsqr';
const admin='00000000-0000-4000-8000-000000000201', member='00000000-0000-4000-8000-000000000202';
let db:PGlite;
test.afterEach(async()=>{await db?.close();});
async function database(){
 db=new PGlite();await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
 CREATE SCHEMA auth; CREATE TABLE auth.users(id uuid PRIMARY KEY,email text,email_confirmed_at timestamptz,raw_user_meta_data jsonb DEFAULT '{}',raw_app_meta_data jsonb DEFAULT '{}');
 CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT NULLIF(current_setting('qa.uid',true),'')::uuid $$;
 CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql AS $$ SELECT current_user::text $$;
 GRANT USAGE ON SCHEMA public,auth TO anon,authenticated; GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA auth TO anon,authenticated;
 CREATE SCHEMA storage; CREATE TABLE storage.buckets(id text PRIMARY KEY,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
 CREATE TABLE storage.objects(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),bucket_id text,name text); ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
 GRANT USAGE ON SCHEMA storage TO anon,authenticated; GRANT SELECT,INSERT,UPDATE,DELETE ON ALL TABLES IN SCHEMA storage TO anon,authenticated;`);
 for(const file of fs.readdirSync('supabase/migrations').filter(f=>/^202610(13|14)/.test(f)).sort())await db.exec(fs.readFileSync('supabase/migrations/'+file,'utf8'));
 await db.exec('GRANT SELECT,INSERT,UPDATE,DELETE ON ALL TABLES IN SCHEMA public TO anon,authenticated; REVOKE ALL ON course_request_windows FROM anon,authenticated;');
 await db.query("INSERT INTO auth.users(id,email,email_confirmed_at,raw_user_meta_data) VALUES($1,'QA_TEST_ADMIN@example.invalid',now(),'{\"full_name\":\"QA_TEST_ADMIN\"}'),($2,'QA_TEST_MEMBER@example.invalid',now(),'{\"full_name\":\"QA_TEST_MEMBER\"}')",[admin,member]);await db.query("UPDATE profiles SET role='admin' WHERE id=$1",[admin]);
}
async function connect(page:Page,uid=admin){
 const user={id:uid,email:'QA_TEST@example.invalid',email_confirmed_at:'2026-10-14T00:00:00Z',app_metadata:{provider:'email'},user_metadata:{}};
 const token=Buffer.from('{"alg":"HS256"}').toString('base64url')+'.'+Buffer.from(JSON.stringify({sub:uid,exp:4102444800})).toString('base64url')+'.QA_TEST_SIGNATURE';
 await page.addInitScript(({user,token})=>{localStorage.setItem('datacamp_language','en');sessionStorage.setItem('datacamp_supabase_auth_token',JSON.stringify({user,access_token:token,refresh_token:'QA_TEST',expires_at:4102444800,token_type:'bearer'}));},{user,token});
 const calls:any[]=[];
 await page.route('https://qa-test.supabase.co/**',async route=>{
  const request=route.request(),url=new URL(request.url()),table=url.pathname.split('/').pop()!,body=request.method()==='GET'||url.pathname.includes('/storage/')?null:request.postDataJSON();calls.push({table,body,url:url.href,method:request.method()});
  try{
   if(url.pathname.includes('/auth/v1/user'))return await route.fulfill({contentType:'application/json',body:JSON.stringify(user)});
   if(url.pathname.includes('/storage/'))return await route.fulfill({contentType:'application/json',body:JSON.stringify({Key:'QA_TEST_UPLOAD'})});
   const data=await db.transaction(async tx=>{
    await tx.query("SELECT set_config('qa.uid',$1,true)",[uid]);await tx.exec('SET LOCAL ROLE authenticated;');
    if(url.pathname.includes('/rpc/')){
     const functions:Record<string,[string,any[]]>={list_course_catalog:['SELECT list_course_catalog($1,$2,$3,$4,$5,$6,$7) value',[body.p_limit,body.p_after,body.p_after_id,body.p_search,body.p_category,body.p_level,body.p_include_drafts]],enroll_course:['SELECT enroll_course($1) value',[body.p_course_id]],complete_course_lesson:['SELECT complete_course_lesson($1,$2) value',[body.p_course_id,body.p_lesson_id]],submit_course_quiz:['SELECT submit_course_quiz($1,$2) value',[body.p_lesson_id,JSON.stringify(body.p_answers)]],verify_certificate:['SELECT verify_certificate($1) value',[body.p_code]],get_own_member_card:['SELECT get_own_member_card() value',[]],public_stats:['SELECT public_stats() value',[]],refresh_badges:['SELECT refresh_badges() value',[]],acknowledge_badges:['SELECT acknowledge_badges() value',[]]};
     const query=functions[table];return query?(await tx.query<{value:any}>(query[0],query[1])).rows[0]?.value:[];
    }
    if(!['profiles','courses','lessons','enrollments','certificates','points_log','user_achievements'].includes(table))return [];
    const args:any[]=[],where:string[]=[];
    for(const column of ['id','course_id','user_id','slug','updated_at']){const value=url.searchParams.get(column);if(!value)continue;if(value.startsWith('eq.')){args.push(value.slice(3));where.push(`${column}${column==='updated_at'?'':'::text'}=$${args.length}${column==='updated_at'?'::timestamptz':''}`);}else if(value.startsWith('in.(')){args.push(value.slice(4,-1).split(','));where.push(`${column}::text=ANY($${args.length}::text[])`);}}
    let rows:any[];
    if(request.method()==='POST'){
     const payload=Array.isArray(body)?body[0]:body,keys=Object.keys(payload).filter(key=>/^[a-z_]+$/.test(key));
     const values=keys.map(key=>['quiz_questions','exercise_test_cases'].includes(key)?JSON.stringify(payload[key]):payload[key]);
     const ignore=request.headers().prefer?.includes('ignore-duplicates');
     const update=keys.filter(key=>key!=='id').map(key=>`${key}=EXCLUDED.${key}`).join(',');
     rows=(await tx.query(`INSERT INTO ${table}(${keys.join(',')}) VALUES(${keys.map((_,i)=>'$'+(i+1)).join(',')}) ON CONFLICT(id) DO ${ignore?'NOTHING':'UPDATE SET '+update} RETURNING to_jsonb(${table}) row`,values)).rows.map((row:any)=>row.row);
    }else if(request.method()==='PATCH'){
     const keys=Object.keys(body).filter(key=>/^[a-z_]+$/.test(key));const assignments=keys.map(key=>{args.push(body[key]);return `${key}=$${args.length}`;});
     rows=(await tx.query(`UPDATE ${table} SET ${assignments.join(',')} ${where.length?'WHERE '+where.join(' AND '):''} RETURNING to_jsonb(${table}) row`,args)).rows.map((row:any)=>row.row);
    }else{
     const order=table==='lessons'?'position,id':table==='certificates'?'issued_at DESC,id':table==='courses'?'created_at DESC,id':'id';
     const limit=Math.min(1000,Number(url.searchParams.get('limit')||1000)),offset=Number(url.searchParams.get('offset')||0);
     rows=(await tx.query(`SELECT to_jsonb(t) row FROM ${table} t ${where.length?'WHERE '+where.join(' AND '):''} ORDER BY ${order} LIMIT ${limit} OFFSET ${offset}`,args)).rows.map((row:any)=>row.row);
    }
    return request.headers().accept?.includes('vnd.pgrst.object')?rows[0]||null:rows;
   });await route.fulfill({contentType:'application/json',body:JSON.stringify(data)});
  }catch(error:any){await route.fulfill({status:error.code==='PT429'?429:400,contentType:'application/json',body:JSON.stringify({message:error.message,code:error.code})});}
 });
 await page.route('https://fonts.googleapis.com/**',route=>route.fulfill({body:''}));await page.route('https://api.dicebear.com/**',route=>route.abort());return calls;
}
async function createCourse(page:Page,title:string){
 await page.getByRole('button',{name:'NEW_COURSE',exact:true}).click();await page.getByPlaceholder('e.g. Advanced Deep Learning with PyTorch').fill(title);
 const form=page.locator('form').first();for(const input of await form.locator('input[type="number"]:not([readonly])').all())await input.fill('0');
 await page.getByRole('button',{name:'SAVE_COURSE',exact:true}).click();await expect(page.getByText('Course saved successfully.',{exact:true})).toBeVisible();
 return(await db.query<any>('SELECT * FROM courses WHERE title=$1',[title])).rows[0];
}

test('admin creates a future Arabic course and quiz; learner automatically earns and shares its own certificate',async({page,context})=>{
  await database();await connect(page);await page.goto('/admin/courses');const course=await createCourse(page,'QA_TEST_كورس المستقبل ٢٠٢٧');expect(course.slug).toContain('كورس');expect(course.is_published).toBe(false);expect(course.total_lessons).toBe(0);expect(course.points_reward).toBe(0);expect(Number(course.rating)).toBe(0);expect(course.rating_count).toBe(0);
 const row=page.getByRole('row').filter({hasText:course.title});await row.getByRole('button',{name:'Publish',exact:true}).click();await expect(page.getByText('Add course lessons before publishing',{exact:true})).toBeVisible();
 await row.getByRole('button',{name:'Manage Lessons',exact:true}).click();await page.getByRole('button',{name:'NEW_LESSON',exact:true}).click();await page.getByPlaceholder('Lesson title',{exact:true}).fill('QA_TEST_FUTURE_ARTICLE');await page.getByPlaceholder('Lesson content or exercise instructions...').fill('QA_TEST_REAL_CONTENT');await page.getByPlaceholder('XP',{exact:true}).fill('0');await page.getByRole('button',{name:'SAVE_LESSON',exact:true}).click();await expect(page.getByText('Lesson saved successfully',{exact:true}).last()).toBeVisible();
 await page.getByRole('button',{name:'NEW_LESSON',exact:true}).click();await page.getByPlaceholder('Lesson title',{exact:true}).fill('QA_TEST_FUTURE_QUIZ');await page.locator('form select').selectOption('quiz');await page.getByRole('button',{name:'Add question',exact:true}).click();await page.getByLabel('Question 1',{exact:true}).fill('QA_TEST_WHICH_ANSWER');await page.getByLabel('Option 1.1',{exact:true}).fill('QA_TEST_WRONG');await page.getByLabel('Option 1.2',{exact:true}).fill('QA_TEST_RIGHT');await page.getByRole('radio',{name:'Correct answer 1.2',exact:true}).check();await page.getByPlaceholder('XP',{exact:true}).fill('0');await page.getByRole('button',{name:'SAVE_LESSON',exact:true}).click();await expect(page.getByText('Lesson saved successfully',{exact:true}).last()).toBeVisible();await page.getByRole('button',{name:'CLOSE',exact:true}).click();
 await row.getByRole('button',{name:'Publish',exact:true}).click();await expect(row).toContainText('PUBLISHED');expect((await db.query<any>('SELECT total_lessons FROM courses WHERE id=$1',[course.id])).rows[0].total_lessons).toBe(2);
 const student=await context.newPage();await connect(student,member);await student.goto('/courses/'+encodeURIComponent(course.slug)+'/learn');await student.getByRole('button',{name:'COMPLETE & CLAIM +0 XP',exact:true}).click();await expect(student.getByRole('heading',{name:'QA_TEST_FUTURE_QUIZ',exact:true})).toBeVisible();await student.getByRole('button',{name:'QA_TEST_RIGHT',exact:true}).click();await student.getByRole('button',{name:'SUBMIT_ASSESSMENT',exact:true}).click();await expect(student.getByText('Your course certificate was issued automatically',{exact:true})).toBeVisible();
 const cert=(await db.query<any>('SELECT * FROM certificates WHERE user_id=$1 AND course_id=$2',[member,course.id])).rows[0];expect(cert.course_title).toBe(course.title);await student.getByRole('button',{name:'VIEW CERTIFICATE',exact:true}).click();await student.getByRole('button',{name:'Share on LinkedIn: '+course.title,exact:true}).click();await expect(student.getByRole('dialog').getByLabel('Certificate name',{exact:true})).toHaveValue(course.title);await expect(student.getByRole('dialog').getByLabel('Credential ID',{exact:true})).toHaveValue(cert.verification_code);expect((await db.query<any>('SELECT total_points FROM profiles WHERE id=$1',[member])).rows[0].total_points).toBe(5);
});

test('duplicate slugs cannot overwrite another course and stale admin edits cannot overwrite newer data',async({page})=>{
 await database();await connect(page);await page.goto('/admin/courses');const course=await createCourse(page,'QA_TEST_DUPLICATE');
 await page.getByRole('button',{name:'NEW_COURSE',exact:true}).click();await page.getByPlaceholder('e.g. Advanced Deep Learning with PyTorch').fill('QA_TEST_DUPLICATE');await page.getByRole('button',{name:'SAVE_COURSE',exact:true}).click();await expect(page.getByText('This course URL already exists. Choose a different URL slug.',{exact:true})).toBeVisible();expect((await db.query('SELECT id FROM courses')).rows).toHaveLength(1);await page.getByRole('button',{name:'Close',exact:true}).click();
 const row=page.getByRole('row').filter({hasText:'QA_TEST_DUPLICATE'});await row.getByRole('button',{name:'Edit Course',exact:true}).click();await db.query("UPDATE courses SET title='QA_TEST_NEWER_ADMIN',updated_at=now()+interval '1 minute' WHERE id=$1",[course.id]);await page.getByPlaceholder('e.g. Advanced Deep Learning with PyTorch').fill('QA_TEST_STALE');await page.getByRole('button',{name:'SAVE_COURSE',exact:true}).click();await expect(page.getByText('This course changed in another session. Reload it before saving.',{exact:true})).toBeVisible();expect((await db.query<any>('SELECT title FROM courses WHERE id=$1',[course.id])).rows[0].title).toBe('QA_TEST_NEWER_ADMIN');
});

test('catalog pages, debounced search, cancellation and honest retry use bounded database requests',async({page})=>{
 await database();await db.exec("INSERT INTO courses(title,slug,is_published,created_at) SELECT 'QA_TEST_CATALOG_'||n,'qa-test-catalog-'||n,true,'2026-10-14T00:00:00Z' FROM generate_series(1,55) n;");const calls=await connect(page,member);await page.goto('/courses');await expect(page.getByRole('button',{name:'Load more courses',exact:true})).toBeVisible();expect(calls.filter(call=>call.table==='list_course_catalog')[0].body.p_limit).toBe(24);await page.getByRole('button',{name:'Load more courses',exact:true}).click();await expect(page.locator('a[href^="/courses/qa-test-catalog-"]').first()).toBeVisible();
 const search=page.getByPlaceholder('Search by topic, skill, or library (e.g. Pandas, Scikit-Learn)...');await search.fill('CATALOG_');await search.fill('CATALOG_55');await expect(page.getByText('QA_TEST_CATALOG_55',{exact:true})).toBeVisible();expect(calls.filter(call=>call.table==='list_course_catalog').at(-1).body.p_search).toBe('CATALOG_55');await expect(page.getByText('QA_TEST_CATALOG_54',{exact:true})).toHaveCount(0);await expect(page.getByRole('button',{name:'Load more courses',exact:true})).toHaveCount(0);
 await page.route('**/rest/v1/rpc/list_course_catalog',route=>route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({message:'QA_TEST_TEMPORARY_FAILURE'})}));await search.fill('QA_TEST_FAIL');await expect(page.getByRole('alert').getByText('Unable to load courses. Please retry.',{exact:true})).toBeVisible();await expect(page.getByText('NO_COURSES_MATCHED',{exact:true})).toHaveCount(0);await page.unroute('**/rest/v1/rpc/list_course_catalog');await page.getByRole('button',{name:'Retry courses',exact:true}).click();await expect(page.getByText('NO_COURSES_MATCHED',{exact:true})).toBeVisible();await search.fill('CATALOG_55');await expect(page.getByText('QA_TEST_CATALOG_55',{exact:true})).toBeVisible();
});

test('future long Arabic course titles and member names export PNG/PDF with the correct verification QR',async({page})=>{
 await database();await connect(page,member);const cid=crypto.randomUUID(),lid=crypto.randomUUID(),title=('QA_TEST_FUTURE '+ 'تحليل البيانات والذكاء الاصطناعي '.repeat(8)).slice(0,290),name='QA_TEST '+ 'اسم الطالب الطويل '.repeat(9);
 await db.query('UPDATE profiles SET full_name=$1 WHERE id=$2',[name,member]);await db.query("INSERT INTO courses(id,title,slug,is_published) VALUES($1,$2,'qa-test-long-course',true)",[cid,title]);await db.query("INSERT INTO lessons(id,course_id,title,content,points_reward) VALUES($1,$2,'QA_TEST_LONG_LESSON','QA_TEST_CONTENT',10)",[lid,cid]);await page.goto('/courses/qa-test-long-course/learn');await page.getByRole('button',{name:'COMPLETE & CLAIM +10 XP',exact:true}).click();await page.getByRole('button',{name:'VIEW CERTIFICATE',exact:true}).click();const cert=(await db.query<any>('SELECT * FROM certificates WHERE course_id=$1',[cid])).rows[0];await expect(page.locator('#printable-certificate')).toContainText(title);
 const pending=page.waitForEvent('download');await page.getByRole('button',{name:'PNG IMAGE',exact:true}).click();const png=await pending;if(test.info().project.name==='1440')await png.saveAs('qa-audit/future-certificate-preview.png');const stream=await png.createReadStream(),parts:Buffer[]=[];for await(const part of stream!)parts.push(Buffer.from(part));
 const image=await page.evaluate(async base64=>{const image=new Image();image.src='data:image/png;base64,'+base64;await image.decode();const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;const ctx=canvas.getContext('2d')!;ctx.drawImage(image,0,0);return {width:image.width,height:image.height,data:Array.from(ctx.getImageData(1355,1270,195,195).data)};},Buffer.concat(parts).toString('base64'));expect([image.width,image.height]).toEqual([2400,1697]);expect(jsQR(new Uint8ClampedArray(image.data),195,195)?.data).toBe('http://127.0.0.1:3100/verify-certificate/'+cert.verification_code);
 const pdfPending=page.waitForEvent('download');await page.getByRole('button',{name:'DOWNLOAD PDF',exact:true}).click();const pdf=await pdfPending;const pdfStream=await pdf.createReadStream(),pdfParts:Buffer[]=[];for await(const part of pdfStream!)pdfParts.push(Buffer.from(part));expect(Buffer.concat(pdfParts).subarray(0,5).toString()).toBe('%PDF-');
});

test('catalog displays actual Arabic text without invented population or unrated stars',async({page})=>{
 await database();const description='QA_TEST تعلم تحليل البيانات';
 await db.query("INSERT INTO courses(title,slug,description,short_description,is_published,rating,rating_count) VALUES('QA_TEST_TEXT','qa-test-text',$1,$1,true,5,0)",[description]);
 await connect(page,member);await page.goto('/courses');await expect(page.getByText(description,{exact:true})).toBeVisible();await expect(page.getByText('350+ Active Club Students',{exact:true})).toHaveCount(0);await expect(page.getByText('800 XP',{exact:true})).toHaveCount(0);await expect(page.getByLabel('Course rating',{exact:true})).toHaveCount(0);
 await page.locator('a[href="/courses/qa-test-text"]').click();await expect(page.getByRole('heading',{name:'QA_TEST_TEXT',exact:true})).toBeVisible();await expect(page.getByText('5 (0 reviews)',{exact:true})).toHaveCount(0);
});

test('lost course response retries the same draft and image tools never submit the form',async({page})=>{
 await database();const calls=await connect(page);await page.goto('/admin/courses');await page.getByRole('button',{name:'NEW_COURSE',exact:true}).click();await page.getByPlaceholder('e.g. Advanced Deep Learning with PyTorch').fill('🔥');
 const file=page.waitForEvent('filechooser');await page.getByRole('button',{name:'IMPORT_FROM_DEVICE',exact:true}).click();await(await file).setFiles({name:'QA_TEST_COVER.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=','base64')});expect((await db.query('SELECT * FROM courses')).rows).toHaveLength(0);
 let dropped=false;await page.route('**/rest/v1/courses*',async route=>{if(route.request().method()==='POST'&&!dropped){dropped=true;const body=route.request().postDataJSON();await db.query(`INSERT INTO courses(id,title,slug,is_published,thumbnail_url,description,short_description,instructor_name,instructor_title,category,level,language,duration_hours,points_reward,tags,skills,prerequisites,is_featured,is_locked,updated_at) SELECT id,title,slug,is_published,thumbnail_url,description,short_description,instructor_name,instructor_title,category,level,language,duration_hours,points_reward,tags,skills,prerequisites,is_featured,is_locked,updated_at FROM jsonb_populate_record(NULL::courses,$1)`,[JSON.stringify(body)]);return await route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({message:'QA_TEST_LOST_RESPONSE'})});}await route.fallback();});
 await page.getByRole('button',{name:'SAVE_COURSE',exact:true}).click();await expect(page.getByText('QA_TEST_LOST_RESPONSE',{exact:true})).toBeVisible();await page.getByRole('button',{name:'SAVE_COURSE',exact:true}).click();await expect(page.getByText('Course saved successfully.',{exact:true})).toBeVisible();const rows=(await db.query<any>('SELECT * FROM courses')).rows;expect(rows).toHaveLength(1);expect(rows[0].slug).toMatch(/^course-[a-f0-9-]+$/);expect(rows[0].thumbnail_url).toContain('/storage/v1/object/public/course-thumbnails/');expect(rows[0].thumbnail_url).not.toContain('data:');expect(calls.some(call=>call.url.includes('/storage/v1/object/course-thumbnails/'))).toBe(true);
});
