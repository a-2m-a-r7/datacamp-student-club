# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: routes-locales.spec.ts >> member ar: direct route, direction, console and overflow census
- Location: qa-audit\final\tests\routes-locales.spec.ts:23:2

# Error details

```
Error: [
  {
    "route": "/my-courses",
    "finalPath": "/my-courses",
    "locale": "ar",
    "role": "member",
    "scroll": 768,
    "width": 768,
    "brokenImages": [
      null
    ],
    "controls": 39,
    "errors": [],
    "expectedNegativeDiagnostic": false,
    "reason": "broken-image"
  }
]

expect(received).toEqual(expected) // deep equality

- Expected  -  1
+ Received  + 17

- Array []
+ Array [
+   Object {
+     "brokenImages": Array [
+       undefined,
+     ],
+     "controls": 39,
+     "errors": Array [],
+     "expectedNegativeDiagnostic": false,
+     "finalPath": "/my-courses",
+     "locale": "ar",
+     "reason": "broken-image",
+     "role": "member",
+     "route": "/my-courses",
+     "scroll": 768,
+     "width": 768,
+   },
+ ]
```

# Page snapshot

```yaml
- generic [ref=f50e3]:
  - generic [ref=f50e313]:
    - banner [ref=f50e314]:
      - generic [ref=f50e315]:
        - button "Open navigation" [ref=f50e316]
        - generic [ref=f50e318]:
          - generic "DataCamp Official Emblem" [ref=f50e320]:
            - img "DataCamp Emblem" [ref=f50e321]
          - generic "Innovation University Crest" [ref=f50e323]:
            - img "Innovation University Crest" [ref=f50e324]
      - generic [ref=f50e325]:
        - button "العربية" [ref=f50e326]
        - button "EN" [ref=f50e328]
    - main [ref=f50e330]:
      - generic [ref=f50e332]:
        - heading "404" [level=1] [ref=f50e333]
        - heading "انقطع الاتصال • الصفحة غير موجودة" [level=2] [ref=f50e334]
        - paragraph [ref=f50e335]: الإحداثيات المطلوبة لا تتطابق مع أي صفحة معروفة في شبكة نادي DataCamp.
        - button "العودة إلى الصفحة الرئيسية" [ref=f50e336]
    - contentinfo [ref=f50e337]:
      - generic [ref=f50e338]:
        - generic [ref=f50e339]:
          - generic [ref=f50e340]:
            - link [ref=f50e341] [cursor=pointer]:
              - /url: /
              - generic [ref=f50e342]:
                - generic "DataCamp Official Emblem" [ref=f50e344]:
                  - img "DataCamp Emblem" [ref=f50e345]
                - generic "Innovation University Crest" [ref=f50e347]:
                  - img "Innovation University Crest" [ref=f50e348]
            - paragraph [ref=f50e349]: تمكين الطلاب من إتقان علم البيانات، الذكاء الاصطناعي، وهندسة البرمجيات عبر تعليم تفاعلي وشهادات معتمدة.
          - generic [ref=f50e350]:
            - heading "روابط سريعة" [level=4] [ref=f50e351]
            - list [ref=f50e352]:
              - listitem [ref=f50e353]:
                - link "عن النادي" [ref=f50e354] [cursor=pointer]:
                  - /url: /about
              - listitem [ref=f50e355]:
                - link "الدورات التدريبية" [ref=f50e356] [cursor=pointer]:
                  - /url: /courses
              - listitem [ref=f50e357]:
                - link "الفعاليات والورش" [ref=f50e358] [cursor=pointer]:
                  - /url: /events
              - listitem [ref=f50e359]:
                - link "المشاريع" [ref=f50e360] [cursor=pointer]:
                  - /url: /projects
              - listitem [ref=f50e361]:
                - link "المدونة" [ref=f50e362] [cursor=pointer]:
                  - /url: /blog
              - listitem [ref=f50e363]:
                - link "فريق العمل" [ref=f50e364] [cursor=pointer]:
                  - /url: /staff
              - listitem [ref=f50e365]:
                - link "معرض الصور" [ref=f50e366] [cursor=pointer]:
                  - /url: /gallery
          - generic [ref=f50e367]:
            - heading "الدعم والمساعدة" [level=4] [ref=f50e368]
            - list [ref=f50e369]:
              - listitem [ref=f50e370]:
                - link "الأسئلة الشائعة" [ref=f50e371] [cursor=pointer]:
                  - /url: /faq
              - listitem [ref=f50e372]:
                - link "اتصل بنا" [ref=f50e373] [cursor=pointer]:
                  - /url: /contact
              - listitem [ref=f50e374]:
                - link "سياسة الخصوصية" [ref=f50e375] [cursor=pointer]:
                  - /url: /privacy
              - listitem [ref=f50e376]:
                - link "الشروط والأحكام" [ref=f50e377] [cursor=pointer]:
                  - /url: /terms
          - generic [ref=f50e378]:
            - heading "معلومات التواصل" [level=4] [ref=f50e379]
            - list [ref=f50e380]:
              - listitem [ref=f50e381]:
                - generic [ref=f50e385]: غير محدد
              - listitem [ref=f50e386]:
                - generic [ref=f50e389]: غير محدد
              - listitem [ref=f50e390]:
                - generic [ref=f50e394]: غير محدد
        - generic [ref=f50e395]:
          - paragraph [ref=f50e396]: جميع الحقوق محفوظة © 2026 نادي داتا كامب الطلابي • جامعة الابتكار.
          - generic [ref=f50e397]:
            - button "English" [ref=f50e398]
            - generic [ref=f50e403]: "VERSION: 2.5.0-AR"
  - generic [ref=f50e404]:
    - generic: مرشد NEXUS الذكي
    - button "فتح مرشد الذكاء الاصطناعي NEXUS" [ref=f50e405]
  - region "Notifications alt+T"
```

# Test source

```ts
  1  | import {test,expect} from '@playwright/test';
  2  | import {platform,admin,member} from '../../fix-tests/persisted-platform';
  3  | 
  4  | const course='40000000-0000-4000-8000-000000000001';
  5  | const article='40000000-0000-4000-8000-000000000002';
  6  | const quiz='40000000-0000-4000-8000-000000000003';
  7  | const form='40000000-0000-4000-8000-000000000004';
  8  | const routes=[
  9  |  '/', '/courses','/my-courses','/courses/qa-test-routes','/courses/qa-test-routes/learn',
  10 |  '/courses/qa-test-routes/quiz','/courses/qa-test-routes/quiz/'+quiz,
  11 |  '/certificates','/verify-certificate','/verify-certificate/QA_TEST_UNKNOWN',
  12 |  '/verify-membership/QA_TEST_UNKNOWN','/notifications','/leaderboard','/compiler',
  13 |  '/about','/projects','/events','/blog','/staff','/gallery','/contact','/faq','/privacy','/terms',
  14 |  '/login','/register','/forgot-password','/reset-password','/verify-email','/auth/callback',
  15 |  '/dashboard','/profile','/admin','/admin/users','/admin/events','/admin/staff','/admin/gallery',
  16 |  '/admin/content','/admin/projects','/admin/blog','/admin/messages','/admin/courses','/admin/points',
  17 |  '/admin/forms','/admin/forms/new','/admin/forms/builder/'+form,'/admin/forms/'+form+'/responses',
  18 |  '/admin/security','/admin/settings','/f/qa-test-routes','/QA_TEST_missing_route',
  19 | ];
  20 | const protectedRoutes=['/my-courses','/notifications','/dashboard','/profile'];
  21 | 
  22 | for(const role of ['visitor','member','admin'] as const)for(const locale of ['en','ar'] as const){
  23 |  test(`${role} ${locale}: direct route, direction, console and overflow census`,async({page},info)=>{
  24 |   test.setTimeout(240000);
  25 |   const app=await platform();
  26 |   const failures:any[]=[];const observations:any[]=[];let errors:string[]=[];
  27 |   page.on('pageerror',e=>errors.push(e.message));
  28 |   page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  29 |   try{
  30 |    await app.db.query("INSERT INTO courses(id,title,slug,is_published) VALUES($1,'QA_TEST_ROUTES','qa-test-routes',false)",[course]);
  31 |    await app.db.query("INSERT INTO lessons(id,course_id,title,type,position,content) VALUES($1,$2,'QA_TEST_ARTICLE','article',0,'QA_TEST_CONTENT')",[article,course]);
  32 |    await app.db.query("INSERT INTO lessons(id,course_id,title,type,position,quiz_questions) VALUES($1,$2,'QA_TEST_QUIZ','quiz',1,$3)",[quiz,course,JSON.stringify([{id:'QA_TEST_q',question:'QA_TEST_QUESTION',options:['QA_TEST_A','QA_TEST_B'],correctIndex:0}])]);
  33 |    await app.db.query('UPDATE courses SET is_published=true WHERE id=$1',[course]);
  34 |    await app.db.query('INSERT INTO enrollments(user_id,course_id) VALUES($1,$2)',[member,course]);
  35 |    await app.db.query("INSERT INTO forms(id,title,slug,status,allow_anonymous) VALUES($1,'QA_TEST_ROUTES','qa-test-routes','published',true)",[form]);
  36 |    await app.db.query("INSERT INTO form_questions(form_id,type,title,required,position) VALUES($1,'short_text','QA_TEST_NAME',true,0)",[form]);
  37 |    await app.connect(page,role==='admin'?admin:role==='member'?member:null,locale);
  38 |    for(const route of routes){
  39 |     errors=[];
  40 |     try{
  41 |      await page.goto(route);await expect(page.locator('html')).toHaveAttribute('dir',locale==='ar'?'rtl':'ltr');
  42 |      // These are exact transient route-guard messages. The callback also has
  43 |      // a permanent SYNCHRONIZING_IDENTITY heading; it is not a loading spinner.
  44 |      await expect(page.getByText(/^(SYNCHRONIZING\.\.\.|ESTABLISHING_SESSION\.\.\.|EVALUATING_PERMISSIONS\.\.\.|جاري المزامنة\.\.\.|جاري تهيئة الجلسة\.\.\.|جاري فحص الصلاحيات\.\.\.)$/)).toHaveCount(0);
  45 |      await expect.poll(()=>page.locator('h1,h2,h3,h4,[role="alert"]').filter({visible:true}).count(),{timeout:8000}).toBeGreaterThan(0);
  46 |      if(role==='visitor'&&(protectedRoutes.includes(route)||route.includes('/learn')||route.includes('/quiz')||route.startsWith('/admin')))await expect(page).toHaveURL(/\/login(?:\?|$)/);
  47 |      if(role==='member'&&route.startsWith('/admin'))await expect(page).toHaveURL(/\/dashboard$/);
  48 |      if(role==='admin'&&route.startsWith('/admin'))await expect(page).toHaveURL(new RegExp(route.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'$'));
  49 |      const visual=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth,brokenImages:[...document.images].filter(i=>i.complete&&i.naturalWidth===0&&i.offsetWidth>0).map(i=>i.getAttribute('src')?.split('?')[0]),controls:[...document.querySelectorAll('button,a,input,select,textarea')].filter(e=>(e as HTMLElement).offsetWidth>0).length}));
  50 |      const expectedInvalidCallback=route==='/auth/callback'&&errors.every(error=>error.startsWith('[AuthCallback] Verification error: Error: Authentication link is invalid or expired.'));
  51 |      const row={route,finalPath:new URL(page.url()).pathname,locale,role,...visual,errors:[...errors],expectedNegativeDiagnostic:expectedInvalidCallback};observations.push(row);
  52 |      if(visual.scroll>visual.width+2)failures.push({...row,reason:'horizontal-overflow'});
  53 |      if(errors.length&&!expectedInvalidCallback)failures.push({...row,reason:'console-error'});
  54 |      if(visual.brokenImages.length)failures.push({...row,reason:'broken-image'});
  55 |      if(failures.some(f=>f.route===route))await page.screenshot({path:info.outputPath('QA_TEST_'+route.replace(/\W/g,'_')+'.png'),fullPage:true});
  56 |     }catch(e:any){failures.push({route,locale,role,reason:'route-assertion',message:e.message.slice(0,1400)});await page.screenshot({path:info.outputPath('QA_TEST_'+route.replace(/\W/g,'_')+'_failure.png'),fullPage:true}).catch(()=>{});}
  57 |    }
  58 |    await info.attach('route-observations',{body:JSON.stringify({observations,failures},null,2),contentType:'application/json'});
> 59 |    expect(failures,JSON.stringify(failures,null,2)).toEqual([]);
     |                                                     ^ Error: [
  60 |   }finally{await app.db.close();}
  61 |  });
  62 | }
  63 | 
```