# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: lazy-features.spec.ts >> public pages defer PDF and chart packages
- Location: qa-audit\final\production-tests\lazy-features.spec.ts:21:1

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 4

- Array []
+ Array [
+   "/assets/vendor-pdf-CqUTRpU6.js",
+   "/assets/vendor-pdf-CqUTRpU6.js",
+ ]
```

# Page snapshot

```yaml
- generic [ref=f1e3]:
  - complementary [ref=f1e313]:
    - link [ref=f1e315] [cursor=pointer]:
      - /url: /
      - generic [ref=f1e316]:
        - generic "DataCamp Official Emblem" [ref=f1e318]:
          - img "DataCamp Emblem" [ref=f1e319]
        - generic "Innovation University Crest" [ref=f1e321]:
          - img "Innovation University Crest" [ref=f1e322]
    - generic [ref=f1e324]:
      - paragraph [ref=f1e325]: Main Menu
      - link "Home" [ref=f1e327] [cursor=pointer]:
        - /url: /
      - link "Courses" [ref=f1e334] [cursor=pointer]:
        - /url: /courses
      - link "Online Compiler" [ref=f1e340] [cursor=pointer]:
        - /url: /compiler
      - link "Certificates" [ref=f1e347] [cursor=pointer]:
        - /url: /certificates
      - link "Notifications" [ref=f1e357] [cursor=pointer]:
        - /url: /notifications
      - link "Events" [ref=f1e364] [cursor=pointer]:
        - /url: /events
      - link "Projects" [ref=f1e370] [cursor=pointer]:
        - /url: /projects
      - link "Blog" [ref=f1e377] [cursor=pointer]:
        - /url: /blog
      - link "Staff & Board" [ref=f1e384] [cursor=pointer]:
        - /url: /staff
      - link "Gallery" [ref=f1e393] [cursor=pointer]:
        - /url: /gallery
      - link "About Us" [ref=f1e401] [cursor=pointer]:
        - /url: /about
      - link "Contact" [ref=f1e407] [cursor=pointer]:
        - /url: /contact
    - generic [ref=f1e413]:
      - generic [ref=f1e414]:
        - button "INITIALIZE_MEMBERSHIP" [ref=f1e415]
        - button "LOGIN_SYSTEM" [ref=f1e419]
      - generic [ref=f1e421]:
        - button "العربية" [ref=f1e422]
        - button "English" [ref=f1e424]
      - button [ref=f1e426]
  - generic [ref=f1e429]:
    - generic [ref=f1e431]:
      - button "العربية" [ref=f1e432]
      - button "EN" [ref=f1e434]
    - main [ref=f1e437]:
      - generic [ref=f1e439]:
        - generic [ref=f1e441]:
          - generic [ref=f1e442]: DATACAMP ACADEMY // 2026 CURRICULUM
          - heading "MASTER DATA SCIENCE & AI" [level=1] [ref=f1e447]
          - paragraph [ref=f1e448]: Explore available courses and track your lessons and assessments. Complete the curriculum to earn a verifiable DataCamp Student Club certificate you can share.
          - generic [ref=f1e449]:
            - generic [ref=f1e450]: Each course shows its own XP reward
            - generic [ref=f1e455]: Progress saved to your account
        - generic [ref=f1e462]:
          - generic [ref=f1e463]: STUDENT PORTAL • Student Learner
          - generic [ref=f1e468]: Self-paced interactive learning • Verified certificates on 100% completion
        - region "Course search and filters" [ref=f1e469]:
          - generic [ref=f1e470]:
            - textbox "Search courses" [ref=f1e475]:
              - /placeholder: Search by topic, skill, or library (e.g. Pandas, Scikit-Learn)...
            - generic [ref=f1e476]:
              - button "ANY LEVEL" [pressed] [ref=f1e477]
              - button "BEGINNER" [ref=f1e478]
              - button "INTERMEDIATE" [ref=f1e479]
              - button "ADVANCED" [ref=f1e480]
          - generic [ref=f1e481]:
            - button "ALL TRACKS" [pressed] [ref=f1e482]
            - button "DATA SCIENCE" [ref=f1e483]
            - button "AI & MACHINE LEARNING" [ref=f1e484]
            - button "BUSINESS INTELLIGENCE" [ref=f1e485]
        - generic [ref=f1e486]:
          - heading "NO_COURSES_MATCHED" [level=3] [ref=f1e489]
          - paragraph [ref=f1e490]: No training modules match your current filter parameters. Try clearing your search query.
          - button "RESET_FILTERS" [ref=f1e491]
    - contentinfo [ref=f1e492]:
      - generic [ref=f1e493]:
        - generic [ref=f1e494]:
          - generic [ref=f1e495]:
            - link [ref=f1e496] [cursor=pointer]:
              - /url: /
              - generic [ref=f1e497]:
                - generic "DataCamp Official Emblem" [ref=f1e499]:
                  - img "DataCamp Emblem" [ref=f1e500]
                - generic "Innovation University Crest" [ref=f1e502]:
                  - img "Innovation University Crest" [ref=f1e503]
            - paragraph [ref=f1e504]: Empowering students with data science, AI, and software engineering skills.
          - generic [ref=f1e505]:
            - heading "Quick Links" [level=4] [ref=f1e506]
            - list [ref=f1e507]:
              - listitem [ref=f1e508]:
                - link "About Us" [ref=f1e509] [cursor=pointer]:
                  - /url: /about
              - listitem [ref=f1e510]:
                - link "Courses" [ref=f1e511] [cursor=pointer]:
                  - /url: /courses
              - listitem [ref=f1e512]:
                - link "Events" [ref=f1e513] [cursor=pointer]:
                  - /url: /events
              - listitem [ref=f1e514]:
                - link "Projects" [ref=f1e515] [cursor=pointer]:
                  - /url: /projects
              - listitem [ref=f1e516]:
                - link "Blog" [ref=f1e517] [cursor=pointer]:
                  - /url: /blog
              - listitem [ref=f1e518]:
                - link "Staff & Board" [ref=f1e519] [cursor=pointer]:
                  - /url: /staff
              - listitem [ref=f1e520]:
                - link "Gallery" [ref=f1e521] [cursor=pointer]:
                  - /url: /gallery
          - generic [ref=f1e522]:
            - heading "Support" [level=4] [ref=f1e523]
            - list [ref=f1e524]:
              - listitem [ref=f1e525]:
                - link "FAQ" [ref=f1e526] [cursor=pointer]:
                  - /url: /faq
              - listitem [ref=f1e527]:
                - link "Contact" [ref=f1e528] [cursor=pointer]:
                  - /url: /contact
              - listitem [ref=f1e529]:
                - link "Privacy Policy" [ref=f1e530] [cursor=pointer]:
                  - /url: /privacy
              - listitem [ref=f1e531]:
                - link "Terms of Service" [ref=f1e532] [cursor=pointer]:
                  - /url: /terms
          - generic [ref=f1e533]:
            - heading "Contact Info" [level=4] [ref=f1e534]
            - list [ref=f1e535]:
              - listitem [ref=f1e536]:
                - generic [ref=f1e540]: Not configured
              - listitem [ref=f1e541]:
                - generic [ref=f1e544]: Not configured
              - listitem [ref=f1e545]:
                - generic [ref=f1e549]: Not configured
        - generic [ref=f1e550]:
          - paragraph [ref=f1e551]: © 2026 DataCamp. All rights reserved.
          - generic [ref=f1e552]:
            - button "العربية" [ref=f1e553]
            - generic [ref=f1e558]: "VERSION: 2.5.0-AR"
  - generic [ref=f1e559]:
    - generic: NEXUS AI MENTOR
    - button "Open AI Mentor" [ref=f1e560]
  - region "Notifications alt+T"
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
  24 |  await page.goto('/login');await expect(page.locator('form input[type=email]')).toBeVisible();
  25 |  await page.goto('/courses');await expect(page.getByRole('heading',{name:'MASTER DATA SCIENCE & AI',exact:true})).toBeVisible();
  26 |  await expect(page.getByRole('alert')).toHaveCount(0);
> 27 |  expect(scripts.filter(p=>/vendor-(pdf|charts)-/.test(p))).toEqual([]);expect(errors).toEqual([]);
     |                                                            ^ Error: expect(received).toEqual(expected) // deep equality
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