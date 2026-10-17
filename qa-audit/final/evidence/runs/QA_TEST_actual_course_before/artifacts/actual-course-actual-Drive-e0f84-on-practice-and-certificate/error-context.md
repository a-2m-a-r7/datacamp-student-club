# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: actual-course.spec.ts >> actual Drive video, bilingual Gemini quiz, Python practice and certificate
- Location: qa-audit\final\provider-browser\actual-course.spec.ts:14:1

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 1

  Object {
-   "duration": 36,
+   "duration": 48,
    "error": 0,
  }

Call Log:
- Timeout 45000ms exceeded while waiting on the predicate
```

# Page snapshot

```yaml
- generic [ref=f2e3]:
  - complementary [ref=f2e313]:
    - link [ref=f2e315] [cursor=pointer]:
      - /url: /
      - generic [ref=f2e316]:
        - generic "DataCamp Official Emblem" [ref=f2e318]:
          - img "DataCamp Emblem" [ref=f2e319]
        - generic "Innovation University Crest" [ref=f2e321]:
          - img "Innovation University Crest" [ref=f2e322]
    - generic [ref=f2e324]:
      - paragraph [ref=f2e325]: Main Menu
      - link "Home" [ref=f2e327] [cursor=pointer]:
        - /url: /
      - link "Courses" [ref=f2e334] [cursor=pointer]:
        - /url: /courses
      - link "My Courses" [ref=f2e340] [cursor=pointer]:
        - /url: /my-courses
      - link "Online Compiler" [ref=f2e347] [cursor=pointer]:
        - /url: /compiler
      - link "Certificates" [ref=f2e354] [cursor=pointer]:
        - /url: /certificates
      - link "Notifications" [ref=f2e364] [cursor=pointer]:
        - /url: /notifications
      - link "Events" [ref=f2e371] [cursor=pointer]:
        - /url: /events
      - link "Projects" [ref=f2e377] [cursor=pointer]:
        - /url: /projects
      - link "Blog" [ref=f2e384] [cursor=pointer]:
        - /url: /blog
      - link "Staff & Board" [ref=f2e391] [cursor=pointer]:
        - /url: /staff
      - link "Gallery" [ref=f2e400] [cursor=pointer]:
        - /url: /gallery
      - link "About Us" [ref=f2e408] [cursor=pointer]:
        - /url: /about
      - link "Contact" [ref=f2e414] [cursor=pointer]:
        - /url: /contact
    - generic [ref=f2e420]:
      - generic [ref=f2e421]:
        - link "Q QA_TEST_MEDIA_LEARNER Member" [ref=f2e422] [cursor=pointer]:
          - /url: /profile
          - generic [ref=f2e423]: Q
          - generic [ref=f2e425]:
            - paragraph [ref=f2e426]: QA_TEST_MEDIA_LEARNER
            - paragraph [ref=f2e427]: Member
        - button "Logout" [ref=f2e428]
      - generic [ref=f2e434]:
        - button "العربية" [ref=f2e435]
        - button "English" [ref=f2e437]
      - button [ref=f2e439]
  - generic [ref=f2e442]:
    - generic [ref=f2e444]:
      - button "العربية" [ref=f2e445]
      - button "EN" [ref=f2e447]
    - main [ref=f2e450]:
      - generic [ref=f2e452]:
        - generic [ref=f2e453]:
          - generic [ref=f2e454]:
            - link [ref=f2e455] [cursor=pointer]:
              - /url: /courses/qa-test-synthetic-e2720b4a-fe1b-4e96-97b8-6423d9537bce
            - generic [ref=f2e458]:
              - heading "QA_TEST_Synthetic_Drive" [level=2] [ref=f2e459]
              - paragraph [ref=f2e460]: QA_TEST_Synthetic_Python
          - generic [ref=f2e461]: 0%
        - generic [ref=f2e465]:
          - main [ref=f2e466]:
            - generic [ref=f2e467]:
              - generic [ref=f2e468]:
                - generic [ref=f2e469]:
                  - generic [ref=f2e470]: LESSON 1 • VIDEO
                  - heading "QA_TEST_Synthetic_Python" [level=1] [ref=f2e471]
                - generic [ref=f2e472]: +30 XP
              - tablist "Learning stages" [ref=f2e477]:
                - tab "Video" [selected] [ref=f2e478]
                - tab "Quiz" [ref=f2e479]
                - tab "Coding" [ref=f2e480]
              - region "Lesson resources" [ref=f2e481]:
                - generic [ref=f2e484]:
                  - heading "Lesson materials" [level=3] [ref=f2e485]
                  - list [ref=f2e486]:
                    - listitem [ref=f2e487]:
                      - generic [ref=f2e488]: QA_TEST_material.txt
                      - link "Open / download from Drive" [ref=f2e489] [cursor=pointer]:
                        - /url: https://drive.google.com/file/d/1fExHMwfI98oUY9BsZ7IFyuZttozIUNxv/view
              - generic [ref=f2e490]: "This lesson introduces three fundamental concepts in Python: variables and basic arithmetic operations (such as multiplying variables), iterating through lists using a `for` loop to process each element, and defining reusable functions using the `def` keyword with return values."
              - generic [ref=f2e493]:
                - button "COMPLETE & CLAIM +30 XP" [ref=f2e494]
                - button "NEXT" [ref=f2e495]
          - complementary [ref=f2e498]:
            - generic [ref=f2e499]:
              - heading "COURSE_INDEX" [level=3] [ref=f2e500]
              - generic [ref=f2e501]: 3 Lessons
            - generic [ref=f2e503]:
              - generic [ref=f2e504]: Course Lessons
              - generic [ref=f2e505]:
                - button "QA_TEST_Synthetic_Python +30" [ref=f2e506]:
                  - generic [ref=f2e510]: QA_TEST_Synthetic_Python
                  - generic [ref=f2e511]: "+30"
                - button "QA_TEST_Synthetic_Python — Quiz +10" [ref=f2e512]:
                  - generic [ref=f2e516]: QA_TEST_Synthetic_Python — Quiz
                  - generic [ref=f2e517]: "+10"
                - button "QA_TEST_Synthetic_Python — Coding +10" [ref=f2e518]:
                  - generic [ref=f2e522]: QA_TEST_Synthetic_Python — Coding
                  - generic [ref=f2e523]: "+10"
    - contentinfo [ref=f2e524]:
      - generic [ref=f2e525]:
        - generic [ref=f2e526]:
          - generic [ref=f2e527]:
            - link [ref=f2e528] [cursor=pointer]:
              - /url: /
              - generic [ref=f2e529]:
                - generic "DataCamp Official Emblem" [ref=f2e531]:
                  - img "DataCamp Emblem" [ref=f2e532]
                - generic "Innovation University Crest" [ref=f2e534]:
                  - img "Innovation University Crest" [ref=f2e535]
            - paragraph [ref=f2e536]: Empowering students with data science, AI, and software engineering skills.
          - generic [ref=f2e537]:
            - heading "Quick Links" [level=2] [ref=f2e538]
            - list [ref=f2e539]:
              - listitem [ref=f2e540]:
                - link "About Us" [ref=f2e541] [cursor=pointer]:
                  - /url: /about
              - listitem [ref=f2e542]:
                - link "Courses" [ref=f2e543] [cursor=pointer]:
                  - /url: /courses
              - listitem [ref=f2e544]:
                - link "Events" [ref=f2e545] [cursor=pointer]:
                  - /url: /events
              - listitem [ref=f2e546]:
                - link "Projects" [ref=f2e547] [cursor=pointer]:
                  - /url: /projects
              - listitem [ref=f2e548]:
                - link "Blog" [ref=f2e549] [cursor=pointer]:
                  - /url: /blog
              - listitem [ref=f2e550]:
                - link "Staff & Board" [ref=f2e551] [cursor=pointer]:
                  - /url: /staff
              - listitem [ref=f2e552]:
                - link "Gallery" [ref=f2e553] [cursor=pointer]:
                  - /url: /gallery
          - generic [ref=f2e554]:
            - heading "Support" [level=2] [ref=f2e555]
            - list [ref=f2e556]:
              - listitem [ref=f2e557]:
                - link "FAQ" [ref=f2e558] [cursor=pointer]:
                  - /url: /faq
              - listitem [ref=f2e559]:
                - link "Contact" [ref=f2e560] [cursor=pointer]:
                  - /url: /contact
              - listitem [ref=f2e561]:
                - link "Privacy Policy" [ref=f2e562] [cursor=pointer]:
                  - /url: /privacy
              - listitem [ref=f2e563]:
                - link "Terms of Service" [ref=f2e564] [cursor=pointer]:
                  - /url: /terms
          - generic [ref=f2e565]:
            - heading "Contact Info" [level=2] [ref=f2e566]
            - list [ref=f2e567]:
              - listitem [ref=f2e568]:
                - generic [ref=f2e572]: Not configured
              - listitem [ref=f2e573]:
                - generic [ref=f2e576]: Not configured
              - listitem [ref=f2e577]:
                - generic [ref=f2e581]: Not configured
        - generic [ref=f2e582]:
          - paragraph [ref=f2e583]: © 2026 DataCamp. All rights reserved.
          - generic [ref=f2e584]:
            - button "العربية" [ref=f2e585]
            - generic [ref=f2e590]: "VERSION: 2.5.0-AR"
  - generic [ref=f2e591]:
    - generic: NEXUS AI MENTOR
    - button "Open AI Mentor" [ref=f2e592]
  - region "Notifications alt+T"
```

# Test source

```ts
  1  | import {test,expect} from '@playwright/test';import fs from 'node:fs';import crypto from 'node:crypto';import {createClient} from '@supabase/supabase-js';
  2  | const root='qa-audit/.runtime/final-hosted',cfg=JSON.parse(fs.readFileSync(root+'/config.json','utf8')),secret=JSON.parse(fs.readFileSync(root+'/server-secrets.json','utf8')).SUPABASE_SERVICE_ROLE_KEY,fixture=JSON.parse(fs.readFileSync(root+'/synthetic-drive-fixtures.json','utf8')),analysis=JSON.parse(fs.readFileSync(root+'/actual-gemini-plan.json','utf8'));
  3  | if(cfg.projectRef!=='kcqgnkfdpfibwkrghubl'||cfg.url!=='https://kcqgnkfdpfibwkrghubl.supabase.co')throw Error('Wrong QA project');
  4  | const server=createClient(cfg.url,secret,{auth:{persistSession:false,autoRefreshToken:false}});let student:any;
  5  | test.beforeAll(async()=>{
  6  |  const file=root+'/media-student.json';
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
  21 |   await page.goto('/courses/'+course.data!.slug);const enroll=page.getByRole('button',{name:/^ENROLL_NOW/});
  22 |   if(await enroll.count()){
  23 |    const before=await server.from('profiles').select('xp').eq('id',student.id).single();await enroll.click();await expect(page.getByText(/Successfully enrolled in/)).toBeVisible();
  24 |    notes.enrollmentToast=await page.getByText(/Successfully enrolled in/).innerText();const after=await server.from('profiles').select('xp').eq('id',student.id).single();notes.actualEnrollmentXp=Number(after.data!.xp)-Number(before.data!.xp);
  25 |   }
  26 |   await page.goto('/courses/'+course.data!.slug+'/learn');const video=page.locator('video');await expect(video).toBeVisible();
> 27 |   await expect.poll(()=>video.evaluate((v:HTMLVideoElement)=>({duration:Math.round(v.duration||0),error:v.error?.code||0}))).toEqual({duration:36,error:0});
     |                                                                                                                              ^ Error: expect(received).toEqual(expected) // deep equality
  28 |   await video.focus();await video.press('Space');await expect.poll(()=>video.evaluate((v:HTMLVideoElement)=>v.currentTime)).toBeGreaterThan(1);await video.press('Space');
  29 |   await expect.poll(async()=>{const r=await server.from('lesson_watch_progress').select('seconds').eq('user_id',student.id).eq('lesson_id',fixture.lessonId).maybeSingle();return Number(r.data?.seconds||0);}).toBeGreaterThan(0);
  30 |   notes.nativeVideoPlayed=true;await expect(page.locator('track')).toHaveAttribute('src',/^blob:/);notes.captionsLoaded=true;
  31 |   await page.screenshot({path:test.info().outputPath('QA_TEST_actual_video.png')});
  32 |   await page.getByRole('button',{name:/COMPLETE & CLAIM/}).click();await expect(page.getByRole('tab',{name:'Quiz',exact:true})).toHaveAttribute('aria-selected','true');
  33 |   const first=analysis.plan.questions[0];const firstCard=page.locator('main h4').filter({hasText:first.question.split('\n')[0]}).locator('..');await firstCard.getByRole('button').nth(first.correctIndex).click();
  34 |   await page.getByRole('button',{name:'العربية',exact:true}).first().click();await expect(page.locator('html')).toHaveAttribute('dir','rtl');
  35 |   for(const q of analysis.plan.questions){const card=page.locator('main h4').filter({hasText:q.translations.ar.question.split('\n')[0]}).locator('..');await expect(card).toBeVisible();await card.getByRole('button').nth(q.correctIndex).click();}
  36 |   notes.bilingualQuizRendered=true;await page.screenshot({path:test.info().outputPath('QA_TEST_actual_quiz_ar.png')});
  37 |   await page.getByRole('button',{name:'تسليم التقييم',exact:true}).click();await expect(page.getByRole('tab',{name:'التطبيق البرمجي',exact:true})).toHaveAttribute('aria-selected','true');
  38 |   const code=page.locator('main textarea').first();await expect(code).toHaveValue(analysis.plan.exercise.starterCode);await code.fill(analysis.plan.exercise.solution);
  39 |   await page.getByRole('button',{name:'RUN_CODE',exact:true}).click();
  40 |   await expect(page.locator('main pre').filter({hasText:/^14\s*$/})).toBeVisible({timeout:90000});notes.manualRunMatchesInput=true;
  41 |   await page.getByRole('button',{name:'SUBMIT_SOLUTION',exact:true}).click();await expect(page.getByRole('button',{name:'CHALLENGE_SOLVED',exact:true})).toBeVisible({timeout:90000});
  42 |   const enrollment=await server.from('enrollments').select('is_completed,progress_percent,quiz_scores').eq('user_id',student.id).eq('course_id',fixture.courseId).single();expect(enrollment.error).toBeNull();expect(enrollment.data!.is_completed).toBe(true);expect(Number(enrollment.data!.progress_percent)).toBe(100);notes.completionPersisted=true;
  43 |   const cert=await server.from('certificates').select('id').eq('user_id',student.id).eq('course_id',fixture.courseId);expect(cert.error).toBeNull();expect(cert.data).toHaveLength(1);notes.automaticCertificatePersisted=true;
  44 |   await page.goto('/certificates?course='+fixture.courseId);await expect(page.locator('#printable-certificate')).toContainText('QA_TEST_Synthetic_Drive');await page.getByRole('button',{name:'EN',exact:true}).click();
  45 |   const pending=page.waitForEvent('download');await page.getByRole('button',{name:'DOWNLOAD PDF',exact:true}).click();const download=await pending;await download.saveAs(test.info().outputPath('QA_TEST_actual_generated_course.pdf'));expect(fs.readFileSync(await download.path()).subarray(0,5).toString()).toBe('%PDF-');notes.realPdfDownloaded=true;
  46 |  }finally{fs.writeFileSync(test.info().outputPath('QA_TEST_provider_observations.json'),JSON.stringify(notes,null,2)+'\n');}
  47 | });
  48 | 
```