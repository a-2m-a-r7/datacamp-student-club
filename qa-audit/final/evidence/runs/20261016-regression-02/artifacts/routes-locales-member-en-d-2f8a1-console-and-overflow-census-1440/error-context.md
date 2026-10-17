# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: routes-locales.spec.ts >> member en: direct route, direction, console and overflow census
- Location: qa-audit\final\tests\routes-locales.spec.ts:23:2

# Error details

```
Error: [
  {
    "route": "/my-courses",
    "finalPath": "/my-courses",
    "locale": "en",
    "role": "member",
    "scroll": 1440,
    "width": 1440,
    "brokenImages": [
      null
    ],
    "controls": 38,
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
+     "controls": 38,
+     "errors": Array [],
+     "expectedNegativeDiagnostic": false,
+     "finalPath": "/my-courses",
+     "locale": "en",
+     "reason": "broken-image",
+     "role": "member",
+     "route": "/my-courses",
+     "scroll": 1440,
+     "width": 1440,
+   },
+ ]
```

# Page snapshot

```yaml
- generic [ref=f50e3]:
  - complementary [ref=f50e313]:
    - link [ref=f50e315] [cursor=pointer]:
      - /url: /
      - generic [ref=f50e316]:
        - generic "DataCamp Official Emblem" [ref=f50e318]:
          - img "DataCamp Emblem" [ref=f50e319]
        - generic "Innovation University Crest" [ref=f50e321]:
          - img "Innovation University Crest" [ref=f50e322]
    - generic [ref=f50e324]:
      - paragraph [ref=f50e325]: Main Menu
      - link "Home" [ref=f50e327] [cursor=pointer]:
        - /url: /
      - link "Courses" [ref=f50e334] [cursor=pointer]:
        - /url: /courses
      - link "My Courses" [ref=f50e340] [cursor=pointer]:
        - /url: /my-courses
      - link "Online Compiler" [ref=f50e347] [cursor=pointer]:
        - /url: /compiler
      - link "Certificates" [ref=f50e354] [cursor=pointer]:
        - /url: /certificates
      - link "Notifications" [ref=f50e364] [cursor=pointer]:
        - /url: /notifications
      - link "Events" [ref=f50e371] [cursor=pointer]:
        - /url: /events
      - link "Projects" [ref=f50e377] [cursor=pointer]:
        - /url: /projects
      - link "Blog" [ref=f50e384] [cursor=pointer]:
        - /url: /blog
      - link "Staff & Board" [ref=f50e391] [cursor=pointer]:
        - /url: /staff
      - link "Gallery" [ref=f50e400] [cursor=pointer]:
        - /url: /gallery
      - link "About Us" [ref=f50e408] [cursor=pointer]:
        - /url: /about
      - link "Contact" [ref=f50e414] [cursor=pointer]:
        - /url: /contact
    - generic [ref=f50e420]:
      - generic [ref=f50e421]:
        - link "Q QA_TEST_MEMBER Member" [ref=f50e422] [cursor=pointer]:
          - /url: /profile
          - generic [ref=f50e423]: Q
          - generic [ref=f50e425]:
            - paragraph [ref=f50e426]: QA_TEST_MEMBER
            - paragraph [ref=f50e427]: Member
        - button "Logout" [ref=f50e428]
      - generic [ref=f50e434]:
        - button "العربية" [ref=f50e435]
        - button "English" [ref=f50e437]
      - button [ref=f50e439]
  - generic [ref=f50e442]:
    - generic [ref=f50e444]:
      - button "العربية" [ref=f50e445]
      - button "EN" [ref=f50e447]
    - main [ref=f50e450]:
      - generic [ref=f50e452]:
        - heading "404" [level=1] [ref=f50e453]
        - heading "SIGNAL_LOST_IN_VOID" [level=2] [ref=f50e454]
        - paragraph [ref=f50e455]: The requested coordinates do not correspond to any known terminal in the network.
        - button "RETURN_TO_HOME_BASE" [ref=f50e456]
    - contentinfo [ref=f50e457]:
      - generic [ref=f50e458]:
        - generic [ref=f50e459]:
          - generic [ref=f50e460]:
            - link [ref=f50e461] [cursor=pointer]:
              - /url: /
              - generic [ref=f50e462]:
                - generic "DataCamp Official Emblem" [ref=f50e464]:
                  - img "DataCamp Emblem" [ref=f50e465]
                - generic "Innovation University Crest" [ref=f50e467]:
                  - img "Innovation University Crest" [ref=f50e468]
            - paragraph [ref=f50e469]: Empowering students with data science, AI, and software engineering skills.
          - generic [ref=f50e470]:
            - heading "Quick Links" [level=4] [ref=f50e471]
            - list [ref=f50e472]:
              - listitem [ref=f50e473]:
                - link "About Us" [ref=f50e474] [cursor=pointer]:
                  - /url: /about
              - listitem [ref=f50e475]:
                - link "Courses" [ref=f50e476] [cursor=pointer]:
                  - /url: /courses
              - listitem [ref=f50e477]:
                - link "Events" [ref=f50e478] [cursor=pointer]:
                  - /url: /events
              - listitem [ref=f50e479]:
                - link "Projects" [ref=f50e480] [cursor=pointer]:
                  - /url: /projects
              - listitem [ref=f50e481]:
                - link "Blog" [ref=f50e482] [cursor=pointer]:
                  - /url: /blog
              - listitem [ref=f50e483]:
                - link "Staff & Board" [ref=f50e484] [cursor=pointer]:
                  - /url: /staff
              - listitem [ref=f50e485]:
                - link "Gallery" [ref=f50e486] [cursor=pointer]:
                  - /url: /gallery
          - generic [ref=f50e487]:
            - heading "Support" [level=4] [ref=f50e488]
            - list [ref=f50e489]:
              - listitem [ref=f50e490]:
                - link "FAQ" [ref=f50e491] [cursor=pointer]:
                  - /url: /faq
              - listitem [ref=f50e492]:
                - link "Contact" [ref=f50e493] [cursor=pointer]:
                  - /url: /contact
              - listitem [ref=f50e494]:
                - link "Privacy Policy" [ref=f50e495] [cursor=pointer]:
                  - /url: /privacy
              - listitem [ref=f50e496]:
                - link "Terms of Service" [ref=f50e497] [cursor=pointer]:
                  - /url: /terms
          - generic [ref=f50e498]:
            - heading "Contact Info" [level=4] [ref=f50e499]
            - list [ref=f50e500]:
              - listitem [ref=f50e501]:
                - generic [ref=f50e505]: Not configured
              - listitem [ref=f50e506]:
                - generic [ref=f50e509]: Not configured
              - listitem [ref=f50e510]:
                - generic [ref=f50e514]: Not configured
        - generic [ref=f50e515]:
          - paragraph [ref=f50e516]: © 2026 DataCamp. All rights reserved.
          - generic [ref=f50e517]:
            - button "العربية" [ref=f50e518]
            - generic [ref=f50e523]: "VERSION: 2.5.0-AR"
  - generic [ref=f50e524]:
    - generic: NEXUS AI MENTOR
    - button "Open AI Mentor" [ref=f50e525]
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