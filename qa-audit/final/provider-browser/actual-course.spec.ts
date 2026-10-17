import {test,expect} from '@playwright/test';import fs from 'node:fs';import crypto from 'node:crypto';import {createClient} from '@supabase/supabase-js';
const root='qa-audit/.runtime/final-hosted',cfg=JSON.parse(fs.readFileSync(root+'/config.json','utf8')),secret=JSON.parse(fs.readFileSync(root+'/server-secrets.json','utf8')).SUPABASE_SERVICE_ROLE_KEY,fixture=JSON.parse(fs.readFileSync(root+'/synthetic-drive-fixtures.json','utf8')),analysis=JSON.parse(fs.readFileSync(root+'/actual-gemini-plan.json','utf8'));
if(cfg.projectRef!=='kcqgnkfdpfibwkrghubl'||cfg.url!=='https://kcqgnkfdpfibwkrghubl.supabase.co')throw Error('Wrong QA project');
const server=createClient(cfg.url,secret,{auth:{persistSession:false,autoRefreshToken:false}});let student:any;
test.beforeAll(async()=>{
 const file=root+'/media-student-'+process.env.QA_HOSTED_RUN+'.json';
 if(fs.existsSync(file))student=JSON.parse(fs.readFileSync(file,'utf8'));
 else{
  student={email:'qa_test_media_'+crypto.randomUUID()+'@example.invalid',password:crypto.randomBytes(24).toString('base64url')};
  const made=await server.auth.admin.createUser({email:student.email,password:student.password,email_confirm:true,user_metadata:{full_name:'QA_TEST_MEDIA_LEARNER'}});expect(made.error).toBeNull();student.id=made.data.user!.id;
  expect((await server.from('profiles').update({full_name:'QA_TEST_MEDIA_LEARNER',status:'active',role:'user'}).eq('id',student.id)).error).toBeNull();fs.writeFileSync(file,JSON.stringify(student)+'\n',{mode:0o600,flag:'wx'});
 }
});
test('actual Drive video, bilingual Gemini quiz, Python practice and certificate',async({page,context})=>{
 const notes:any={target:cfg.projectRef,courseId:fixture.courseId,synthetic:true};
 await context.route('**/*',r=>{const u=new URL(r.request().url());return ['127.0.0.1','localhost','kcqgnkfdpfibwkrghubl.supabase.co','cdn.jsdelivr.net','fonts.googleapis.com','fonts.gstatic.com'].includes(u.hostname)?r.continue():r.abort();});
 await page.addInitScript(()=>localStorage.setItem('datacamp_language','en'));
 try{
  await page.goto('/login');await page.locator('input[type=email]').fill(student.email);await page.locator('input[type=password]').fill(student.password);await page.locator('form button[type=submit]').click();await expect(page).toHaveURL(/\/dashboard$/);
  const course=await server.from('courses').select('slug,is_published').eq('id',fixture.courseId).single();expect(course.error).toBeNull();expect(course.data!.is_published).toBe(true);
  await page.goto('/courses/'+course.data!.slug);await expect(page.getByRole('heading',{name:'QA_TEST_Synthetic_Drive',exact:true})).toBeVisible();const enroll=page.getByRole('button',{name:/^ENROLL_NOW/});
  if(await enroll.count()){
   const before=await server.from('profiles').select('xp').eq('id',student.id).single();await enroll.click();await expect(page.getByText(/Successfully enrolled in/)).toBeVisible();
   notes.enrollmentToast=await page.getByText(/Successfully enrolled in/).innerText();const after=await server.from('profiles').select('xp').eq('id',student.id).single();notes.actualEnrollmentXp=Number(after.data!.xp)-Number(before.data!.xp);
  }
  await page.goto('/courses/'+course.data!.slug+'/learn');const video=page.locator('video');await expect(video).toBeVisible();
  const metadata=JSON.parse(fs.readFileSync(root+'/QA_TEST_course_media/QA_TEST_metadata_actual.json','utf8'));
  await expect.poll(()=>video.evaluate((v:HTMLVideoElement)=>({duration:Math.round(v.duration||0),error:v.error?.code||0}))).toEqual({duration:Math.round(metadata.durationSeconds),error:0});
  await video.focus();await video.press('Space');await expect.poll(()=>video.evaluate((v:HTMLVideoElement)=>v.currentTime)).toBeGreaterThan(1);await video.press('Space');
  await expect.poll(async()=>{const r=await server.from('lesson_watch_progress').select('seconds').eq('user_id',student.id).eq('lesson_id',fixture.lessonId).maybeSingle();return Number(r.data?.seconds||0);}).toBeGreaterThan(0);
  notes.nativeVideoPlayed=true;await expect(page.locator('track')).toHaveAttribute('src',/^blob:/);notes.captionsLoaded=true;
  await page.screenshot({path:test.info().outputPath('QA_TEST_actual_video.png')});
  await page.getByRole('button',{name:/COMPLETE & CLAIM/}).click();await expect(page.getByRole('tab',{name:'Quiz',exact:true})).toHaveAttribute('aria-selected','true');
  const first=analysis.plan.questions[0];const firstCard=page.locator('main h4').filter({hasText:first.question.split('\n')[0]}).locator('..');await firstCard.getByRole('button').nth(first.correctIndex).click();
  await page.getByRole('button',{name:'العربية',exact:true}).first().click();await expect(page.locator('html')).toHaveAttribute('dir','rtl');
  for(const q of analysis.plan.questions){const card=page.locator('main h4').filter({hasText:q.translations.ar.question.split('\n')[0]}).locator('..');await expect(card).toBeVisible();await card.getByRole('button').nth(q.correctIndex).click();}
  notes.bilingualQuizRendered=true;await page.screenshot({path:test.info().outputPath('QA_TEST_actual_quiz_ar.png')});
  await page.getByRole('button',{name:'تسليم التقييم',exact:true}).click();await expect(page.getByRole('tab',{name:'التطبيق البرمجي',exact:true})).toHaveAttribute('aria-selected','true');
  const code=page.locator('main textarea').first();await expect(code).toHaveValue(analysis.plan.exercise.starterCode);await code.fill(analysis.plan.exercise.solution);
  await page.getByRole('button',{name:'RUN_CODE',exact:true}).click();
  await expect(page.locator('main pre').filter({hasText:/^14\s*$/})).toBeVisible({timeout:90000});notes.manualRunMatchesInput=true;
  await page.getByRole('button',{name:'SUBMIT_SOLUTION',exact:true}).click();await expect(page.getByRole('button',{name:'CHALLENGE_SOLVED',exact:true})).toBeVisible({timeout:90000});
  const enrollment=await server.from('enrollments').select('is_completed,progress_percent,quiz_scores').eq('user_id',student.id).eq('course_id',fixture.courseId).single();expect(enrollment.error).toBeNull();expect(enrollment.data!.is_completed).toBe(true);expect(Number(enrollment.data!.progress_percent)).toBe(100);notes.completionPersisted=true;
  const cert=await server.from('certificates').select('id').eq('user_id',student.id).eq('course_id',fixture.courseId);expect(cert.error).toBeNull();expect(cert.data).toHaveLength(1);notes.automaticCertificatePersisted=true;
  await page.goto('/certificates?course='+fixture.courseId);await expect(page.locator('#printable-certificate')).toContainText('QA_TEST_Synthetic_Drive');await page.getByRole('button',{name:'EN',exact:true}).click();
  const pending=page.waitForEvent('download');await page.getByRole('button',{name:'DOWNLOAD PDF',exact:true}).click();const download=await pending;await download.saveAs(test.info().outputPath('QA_TEST_actual_generated_course.pdf'));expect(fs.readFileSync(await download.path()).subarray(0,5).toString()).toBe('%PDF-');notes.realPdfDownloaded=true;
 }finally{fs.writeFileSync(test.info().outputPath('QA_TEST_provider_observations.json'),JSON.stringify(notes,null,2)+'\n');}
});
