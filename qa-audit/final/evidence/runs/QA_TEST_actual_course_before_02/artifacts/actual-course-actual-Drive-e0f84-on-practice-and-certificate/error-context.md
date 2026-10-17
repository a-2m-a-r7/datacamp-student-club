# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: actual-course.spec.ts >> actual Drive video, bilingual Gemini quiz, Python practice and certificate
- Location: qa-audit\final\provider-browser\actual-course.spec.ts:14:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('main pre').filter({ hasText: /^14\s*$/ })
Expected: visible
Timeout: 90000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" locator('main pre').filter({ hasText: /^14\s*$/ }) with timeout 90000ms
  - waiting for locator('main pre').filter({ hasText: /^14\s*$/ })

```

```yaml
- complementary:
  - link "DataCamp Emblem Innovation University Crest":
    - /url: /
    - img "DataCamp Emblem"
    - img "Innovation University Crest"
  - paragraph: القائمة الرئيسية
  - link "الرئيسية":
    - /url: /
  - link "الدورات التدريبية":
    - /url: /courses
  - link "كورساتي":
    - /url: /my-courses
  - link "محرر الأكواد":
    - /url: /compiler
  - link "الشهادات المعتمدة":
    - /url: /certificates
  - link "الإشعارات":
    - /url: /notifications
  - link "الفعاليات والورش":
    - /url: /events
  - link "المشاريع":
    - /url: /projects
  - link "المدونة":
    - /url: /blog
  - link "فريق العمل":
    - /url: /staff
  - link "معرض الصور":
    - /url: /gallery
  - link "عن النادي":
    - /url: /about
  - link "اتصل بنا":
    - /url: /contact
  - link "Q QA_TEST_MEDIA_LEARNER عضو":
    - /url: /profile
    - text: Q
    - paragraph: QA_TEST_MEDIA_LEARNER
    - paragraph: عضو
  - button "تسجيل الخروج"
  - button "العربية"
  - button "English"
  - button
- button "العربية"
- button "EN"
- main:
  - link:
    - /url: /courses/qa-test-synthetic-e2720b4a-fe1b-4e96-97b8-6423d9537bce
  - heading "QA_TEST_Synthetic_Drive" [level=2]
  - paragraph: QA_TEST_Synthetic_Python — Coding
  - text: 67%
  - main:
    - text: الدرس 3 • EXERCISE
    - heading "QA_TEST_Synthetic_Python — Coding" [level=1]
    - text: +10 XP
    - tablist "مراحل الدرس":
      - tab "الفيديو"
      - tab "الكويز"
      - tab "التطبيق البرمجي" [selected]
    - region "موارد الدرس"
    - link "فتح التمرين في محرر الأكواد الكامل":
      - /url: /compiler?lesson=79d72817-ef86-4c67-a929-8434cf6b6557
    - text: PRACTICAL CHALLENGE Python 3.11
    - 'heading "التحدي البرمجي: QA_TEST_Synthetic_Python — Coding" [level=3]'
    - text: "+10 XP Define a function named `double(value)` that returns the given value multiplied by 2. Then, read an integer from standard input, call `double()` with that integer, and print the returned result. solution.py"
    - button "Reset"
    - textbox "# Write your Python solution here...": "def double(value): return value * 2 num = int(input()) print(double(num))"
    - text: "Output Terminal 3986 ms Traceback (most recent call last): File \"/lib/python311.zip/_pyodide/_base.py\", line 573, in eval_code_async await CodeRunner( File \"/lib/python311.zip/_pyodide/_base.py\", line 393, in run_async coroutine = eval(self.code, globals, locals) ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ File \"<exec>\", line 4, in <module> ValueError: invalid literal for int() with base 10: ''"
    - button "HINT FROM NEXUS AI"
    - button "RUN_CODE"
    - button "SUBMIT_SOLUTION"
    - button "الدرس السابق"
    - button "إكمال وحصد +10 XP" [disabled]
  - complementary:
    - heading "فهرس الدورة" [level=3]
    - text: 3 درس Course Lessons
    - button "QA_TEST_Synthetic_Python +30"
    - button "QA_TEST_Synthetic_Python — Quiz +10"
    - button "QA_TEST_Synthetic_Python — Coding +10"
- contentinfo:
  - link "DataCamp Emblem Innovation University Crest":
    - /url: /
    - img "DataCamp Emblem"
    - img "Innovation University Crest"
  - paragraph: تمكين الطلاب من إتقان علم البيانات، الذكاء الاصطناعي، وهندسة البرمجيات عبر تعليم تفاعلي وشهادات معتمدة.
  - heading "روابط سريعة" [level=2]
  - list:
    - listitem:
      - link "عن النادي":
        - /url: /about
    - listitem:
      - link "الدورات التدريبية":
        - /url: /courses
    - listitem:
      - link "الفعاليات والورش":
        - /url: /events
    - listitem:
      - link "المشاريع":
        - /url: /projects
    - listitem:
      - link "المدونة":
        - /url: /blog
    - listitem:
      - link "فريق العمل":
        - /url: /staff
    - listitem:
      - link "معرض الصور":
        - /url: /gallery
  - heading "الدعم والمساعدة" [level=2]
  - list:
    - listitem:
      - link "الأسئلة الشائعة":
        - /url: /faq
    - listitem:
      - link "اتصل بنا":
        - /url: /contact
    - listitem:
      - link "سياسة الخصوصية":
        - /url: /privacy
    - listitem:
      - link "الشروط والأحكام":
        - /url: /terms
  - heading "معلومات التواصل" [level=2]
  - list:
    - listitem: غير محدد
    - listitem: غير محدد
    - listitem: غير محدد
  - paragraph: جميع الحقوق محفوظة © 2026 نادي داتا كامب الطلابي • جامعة الابتكار.
  - button "English"
  - text: "VERSION: 2.5.0-AR"
- text: مرشد NEXUS الذكي
- button "فتح مرشد الذكاء الاصطناعي NEXUS"
- region "Notifications alt+T"
```

# Test source

```ts
  1  | import {test,expect} from '@playwright/test';import fs from 'node:fs';import crypto from 'node:crypto';import {createClient} from '@supabase/supabase-js';
  2  | const root='qa-audit/.runtime/final-hosted',cfg=JSON.parse(fs.readFileSync(root+'/config.json','utf8')),secret=JSON.parse(fs.readFileSync(root+'/server-secrets.json','utf8')).SUPABASE_SERVICE_ROLE_KEY,fixture=JSON.parse(fs.readFileSync(root+'/synthetic-drive-fixtures.json','utf8')),analysis=JSON.parse(fs.readFileSync(root+'/actual-gemini-plan.json','utf8'));
  3  | if(cfg.projectRef!=='kcqgnkfdpfibwkrghubl'||cfg.url!=='https://kcqgnkfdpfibwkrghubl.supabase.co')throw Error('Wrong QA project');
  4  | const server=createClient(cfg.url,secret,{auth:{persistSession:false,autoRefreshToken:false}});let student:any;
  5  | test.beforeAll(async()=>{
  6  |  const file=root+'/media-student-'+process.env.QA_HOSTED_RUN+'.json';
  7  |  if(fs.existsSync(file))student=JSON.parse(fs.readFileSync(file,'utf8'));
  8  |  else{
  9  |   student={email:'qa_test_media_'+crypto.randomUUID()+'@example.invalid',password:crypto.randomBytes(24).toString('base64url')};
  10 |   const made=await server.auth.admin.createUser({email:student.email,password:student.password,email_confirm:true,user_metadata:{full_name:'QA_TEST_MEDIA_LEARNER'}});expect(made.error).toBeNull();student.id=made.data.user!.id;
  11 |   expect((await server.from('profiles').update({full_name:'QA_TEST_MEDIA_LEARNER',status:'active',role:'user'}).eq('id',student.id)).error).toBeNull();fs.writeFileSync(file,JSON.stringify(student)+'\n',{mode:0o600,flag:'wx'});
  12 |  }
  13 | });
  14 | test('actual Drive video, bilingual Gemini quiz, Python practice and certificate',async({page,context})=>{
  15 |  const notes:any={target:cfg.projectRef,courseId:fixture.courseId,synthetic:true};
  16 |  await context.route('**/*',r=>{const u=new URL(r.request().url());return ['127.0.0.1','localhost','kcqgnkfdpfibwkrghubl.supabase.co','cdn.jsdelivr.net','fonts.googleapis.com','fonts.gstatic.com'].includes(u.hostname)?r.continue():r.abort();});
  17 |  await page.addInitScript(()=>localStorage.setItem('datacamp_language','en'));
  18 |  try{
  19 |   await page.goto('/login');await page.locator('input[type=email]').fill(student.email);await page.locator('input[type=password]').fill(student.password);await page.locator('form button[type=submit]').click();await expect(page).toHaveURL(/\/dashboard$/);
  20 |   const course=await server.from('courses').select('slug,is_published').eq('id',fixture.courseId).single();expect(course.error).toBeNull();expect(course.data!.is_published).toBe(true);
  21 |   await page.goto('/courses/'+course.data!.slug);await expect(page.getByRole('heading',{name:'QA_TEST_Synthetic_Drive',exact:true})).toBeVisible();const enroll=page.getByRole('button',{name:/^ENROLL_NOW/});
  22 |   if(await enroll.count()){
  23 |    const before=await server.from('profiles').select('xp').eq('id',student.id).single();await enroll.click();await expect(page.getByText(/Successfully enrolled in/)).toBeVisible();
  24 |    notes.enrollmentToast=await page.getByText(/Successfully enrolled in/).innerText();const after=await server.from('profiles').select('xp').eq('id',student.id).single();notes.actualEnrollmentXp=Number(after.data!.xp)-Number(before.data!.xp);
  25 |   }
  26 |   await page.goto('/courses/'+course.data!.slug+'/learn');const video=page.locator('video');await expect(video).toBeVisible();
  27 |   const metadata=JSON.parse(fs.readFileSync(root+'/QA_TEST_course_media/QA_TEST_metadata_actual.json','utf8'));
  28 |   await expect.poll(()=>video.evaluate((v:HTMLVideoElement)=>({duration:Math.round(v.duration||0),error:v.error?.code||0}))).toEqual({duration:Math.round(metadata.durationSeconds),error:0});
  29 |   await video.focus();await video.press('Space');await expect.poll(()=>video.evaluate((v:HTMLVideoElement)=>v.currentTime)).toBeGreaterThan(1);await video.press('Space');
  30 |   await expect.poll(async()=>{const r=await server.from('lesson_watch_progress').select('seconds').eq('user_id',student.id).eq('lesson_id',fixture.lessonId).maybeSingle();return Number(r.data?.seconds||0);}).toBeGreaterThan(0);
  31 |   notes.nativeVideoPlayed=true;await expect(page.locator('track')).toHaveAttribute('src',/^blob:/);notes.captionsLoaded=true;
  32 |   await page.screenshot({path:test.info().outputPath('QA_TEST_actual_video.png')});
  33 |   await page.getByRole('button',{name:/COMPLETE & CLAIM/}).click();await expect(page.getByRole('tab',{name:'Quiz',exact:true})).toHaveAttribute('aria-selected','true');
  34 |   const first=analysis.plan.questions[0];const firstCard=page.locator('main h4').filter({hasText:first.question.split('\n')[0]}).locator('..');await firstCard.getByRole('button').nth(first.correctIndex).click();
  35 |   await page.getByRole('button',{name:'العربية',exact:true}).first().click();await expect(page.locator('html')).toHaveAttribute('dir','rtl');
  36 |   for(const q of analysis.plan.questions){const card=page.locator('main h4').filter({hasText:q.translations.ar.question.split('\n')[0]}).locator('..');await expect(card).toBeVisible();await card.getByRole('button').nth(q.correctIndex).click();}
  37 |   notes.bilingualQuizRendered=true;await page.screenshot({path:test.info().outputPath('QA_TEST_actual_quiz_ar.png')});
  38 |   await page.getByRole('button',{name:'تسليم التقييم',exact:true}).click();await expect(page.getByRole('tab',{name:'التطبيق البرمجي',exact:true})).toHaveAttribute('aria-selected','true');
  39 |   const code=page.locator('main textarea').first();await expect(code).toHaveValue(analysis.plan.exercise.starterCode);await code.fill(analysis.plan.exercise.solution);
  40 |   await page.getByRole('button',{name:'RUN_CODE',exact:true}).click();
> 41 |   await expect(page.locator('main pre').filter({hasText:/^14\s*$/})).toBeVisible({timeout:90000});notes.manualRunMatchesInput=true;
     |                                                                      ^ Error: expect(locator).toBeVisible() failed
  42 |   await page.getByRole('button',{name:'SUBMIT_SOLUTION',exact:true}).click();await expect(page.getByRole('button',{name:'CHALLENGE_SOLVED',exact:true})).toBeVisible({timeout:90000});
  43 |   const enrollment=await server.from('enrollments').select('is_completed,progress_percent,quiz_scores').eq('user_id',student.id).eq('course_id',fixture.courseId).single();expect(enrollment.error).toBeNull();expect(enrollment.data!.is_completed).toBe(true);expect(Number(enrollment.data!.progress_percent)).toBe(100);notes.completionPersisted=true;
  44 |   const cert=await server.from('certificates').select('id').eq('user_id',student.id).eq('course_id',fixture.courseId);expect(cert.error).toBeNull();expect(cert.data).toHaveLength(1);notes.automaticCertificatePersisted=true;
  45 |   await page.goto('/certificates?course='+fixture.courseId);await expect(page.locator('#printable-certificate')).toContainText('QA_TEST_Synthetic_Drive');await page.getByRole('button',{name:'EN',exact:true}).click();
  46 |   const pending=page.waitForEvent('download');await page.getByRole('button',{name:'DOWNLOAD PDF',exact:true}).click();const download=await pending;await download.saveAs(test.info().outputPath('QA_TEST_actual_generated_course.pdf'));expect(fs.readFileSync(await download.path()).subarray(0,5).toString()).toBe('%PDF-');notes.realPdfDownloaded=true;
  47 |  }finally{fs.writeFileSync(test.info().outputPath('QA_TEST_provider_observations.json'),JSON.stringify(notes,null,2)+'\n');}
  48 | });
  49 | 
```