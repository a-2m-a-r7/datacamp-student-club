# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: media-apply-state.spec.ts >> applying a reviewed plan has an honest noncancellable save state en
- Location: qa-audit\final\tests\media-apply-state.spec.ts:3:44

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  getByRole('progressbar', { name: 'Course upload progress', exact: true })
Expected: 0
Received: 1
Timeout:  700ms

Call log:
  - Expect "toHaveCount" getByRole('progressbar', { name: 'Course upload progress', exact: true }) with timeout 700ms
  - waiting for getByRole('progressbar', { name: 'Course upload progress', exact: true })
    8 × locator resolved to 1 element
      - unexpected value "1"

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - complementary [ref=e313]:
      - link [ref=e315] [cursor=pointer]:
        - /url: /
        - generic [ref=e316]:
          - generic "DataCamp Official Emblem" [ref=e318]:
            - img "DataCamp Emblem" [ref=e319]
          - generic "Innovation University Crest" [ref=e321]:
            - img "Innovation University Crest" [ref=e322]
      - generic [ref=e323]:
        - generic [ref=e324]:
          - paragraph [ref=e325]: Main Menu
          - link "Home" [ref=e327] [cursor=pointer]:
            - /url: /
          - link "Courses" [ref=e334] [cursor=pointer]:
            - /url: /courses
          - link "My Courses" [ref=e340] [cursor=pointer]:
            - /url: /my-courses
          - link "Online Compiler" [ref=e347] [cursor=pointer]:
            - /url: /compiler
          - link "Leaderboard" [ref=e354] [cursor=pointer]:
            - /url: /leaderboard
          - link "Certificates" [ref=e364] [cursor=pointer]:
            - /url: /certificates
          - link "Notifications" [ref=e374] [cursor=pointer]:
            - /url: /notifications
          - link "Events" [ref=e381] [cursor=pointer]:
            - /url: /events
          - link "Projects" [ref=e387] [cursor=pointer]:
            - /url: /projects
          - link "Blog" [ref=e394] [cursor=pointer]:
            - /url: /blog
          - link "Staff & Board" [ref=e401] [cursor=pointer]:
            - /url: /staff
          - link "Gallery" [ref=e410] [cursor=pointer]:
            - /url: /gallery
          - link "About Us" [ref=e418] [cursor=pointer]:
            - /url: /about
          - link "Contact" [ref=e424] [cursor=pointer]:
            - /url: /contact
        - generic [ref=e430]:
          - paragraph [ref=e431]: Admin Portal
          - link "Overview" [ref=e432] [cursor=pointer]:
            - /url: /admin
          - link "Courses" [ref=e436] [cursor=pointer]:
            - /url: /admin/courses
          - link "Points & XP" [ref=e440] [cursor=pointer]:
            - /url: /admin/points
          - link "Users" [ref=e445] [cursor=pointer]:
            - /url: /admin/users
          - link "Events" [ref=e452] [cursor=pointer]:
            - /url: /admin/events
          - link "Forms" [ref=e456] [cursor=pointer]:
            - /url: /admin/forms
          - link "Staff" [ref=e461] [cursor=pointer]:
            - /url: /admin/staff
          - link "Gallery" [ref=e466] [cursor=pointer]:
            - /url: /admin/gallery
          - link "Projects" [ref=e472] [cursor=pointer]:
            - /url: /admin/projects
          - link "Blog" [ref=e477] [cursor=pointer]:
            - /url: /admin/blog
          - link "Messages" [ref=e482] [cursor=pointer]:
            - /url: /admin/messages
          - link "Content" [ref=e487] [cursor=pointer]:
            - /url: /admin/content
          - link "Security" [ref=e494] [cursor=pointer]:
            - /url: /admin/security
          - link "Profile" [ref=e498] [cursor=pointer]:
            - /url: /profile
          - link "Settings" [ref=e503] [cursor=pointer]:
            - /url: /admin/settings
      - generic [ref=e508]:
        - generic [ref=e509]:
          - link "Q QA_TEST_ADMIN Admin" [ref=e510] [cursor=pointer]:
            - /url: /profile
            - generic [ref=e511]: Q
            - generic [ref=e513]:
              - paragraph [ref=e514]: QA_TEST_ADMIN
              - paragraph [ref=e515]: Admin
          - button "Logout" [ref=e516]
        - generic [ref=e522]:
          - button "العربية" [ref=e523]
          - button "English" [ref=e525]
        - button [ref=e527]
    - generic [ref=e530]:
      - generic [ref=e532]:
        - button "العربية" [ref=e533]
        - button "EN" [ref=e535]
      - main [ref=e538]:
        - generic [ref=e541]:
          - generic [ref=e542]:
            - generic [ref=e543]:
              - heading "COURSE_MANAGEMENT" [level=2] [ref=e544]
              - paragraph [ref=e547]: Manage club curricula, lesson units, XP bounties, and student enrollments.
            - button "NEW_COURSE" [ref=e548]
          - textbox "Filter courses by title, category, instructor..." [ref=e554]
          - table [ref=e557]:
            - rowgroup [ref=e558]:
              - row [ref=e559]:
                - columnheader "COURSE" [ref=e560]
                - columnheader "CATEGORY" [ref=e561]
                - columnheader "LEVEL" [ref=e562]
                - columnheader "XP BOUNTY" [ref=e563]
                - columnheader "STATUS" [ref=e564]
                - columnheader "ACTIONS" [ref=e565]
            - rowgroup [ref=e566]:
              - row [ref=e567]:
                - cell "QA_TEST_APPLY_STATE DataCamp Instructor • 3 Lessons • 12h • 0 Enrolled" [ref=e568]:
                  - generic [ref=e572]:
                    - generic [ref=e573]: QA_TEST_APPLY_STATE
                    - generic [ref=e574]:
                      - generic [ref=e575]: DataCamp Instructor
                      - generic [ref=e576]: •
                      - generic [ref=e577]: 3 Lessons
                      - generic [ref=e578]: •
                      - generic [ref=e579]: 12h
                      - generic [ref=e580]: •
                      - generic [ref=e581]: 0 Enrolled
                - cell "data science" [ref=e582]
                - cell "beginner" [ref=e583]
                - cell "+500 XP" [ref=e584]
                - cell "DRAFT" [ref=e585]
                - cell [ref=e586]:
                  - generic [ref=e587]:
                    - link "View in Catalog" [ref=e588] [cursor=pointer]:
                      - /url: /courses/qa-test-apply
                    - link "Open Learning Room" [ref=e592] [cursor=pointer]:
                      - /url: /courses/qa-test-apply/learn
                    - button "Manage Lessons" [ref=e596]
                    - button "Publish" [ref=e599]
                    - button "Edit Course" [ref=e603]
                    - button "Delete Course" [ref=e607]
      - contentinfo [ref=e611]:
        - generic [ref=e612]:
          - generic [ref=e613]:
            - generic [ref=e614]:
              - link [ref=e615] [cursor=pointer]:
                - /url: /
                - generic [ref=e616]:
                  - generic "DataCamp Official Emblem" [ref=e618]:
                    - img "DataCamp Emblem" [ref=e619]
                  - generic "Innovation University Crest" [ref=e621]:
                    - img "Innovation University Crest" [ref=e622]
              - paragraph [ref=e623]: Empowering students with data science, AI, and software engineering skills.
            - generic [ref=e624]:
              - heading "Quick Links" [level=2] [ref=e625]
              - list [ref=e626]:
                - listitem [ref=e627]:
                  - link "About Us" [ref=e628] [cursor=pointer]:
                    - /url: /about
                - listitem [ref=e629]:
                  - link "Courses" [ref=e630] [cursor=pointer]:
                    - /url: /courses
                - listitem [ref=e631]:
                  - link "Events" [ref=e632] [cursor=pointer]:
                    - /url: /events
                - listitem [ref=e633]:
                  - link "Projects" [ref=e634] [cursor=pointer]:
                    - /url: /projects
                - listitem [ref=e635]:
                  - link "Blog" [ref=e636] [cursor=pointer]:
                    - /url: /blog
                - listitem [ref=e637]:
                  - link "Staff & Board" [ref=e638] [cursor=pointer]:
                    - /url: /staff
                - listitem [ref=e639]:
                  - link "Gallery" [ref=e640] [cursor=pointer]:
                    - /url: /gallery
            - generic [ref=e641]:
              - heading "Support" [level=2] [ref=e642]
              - list [ref=e643]:
                - listitem [ref=e644]:
                  - link "FAQ" [ref=e645] [cursor=pointer]:
                    - /url: /faq
                - listitem [ref=e646]:
                  - link "Contact" [ref=e647] [cursor=pointer]:
                    - /url: /contact
                - listitem [ref=e648]:
                  - link "Privacy Policy" [ref=e649] [cursor=pointer]:
                    - /url: /privacy
                - listitem [ref=e650]:
                  - link "Terms of Service" [ref=e651] [cursor=pointer]:
                    - /url: /terms
            - generic [ref=e652]:
              - heading "Contact Info" [level=2] [ref=e653]
              - list [ref=e654]:
                - listitem [ref=e655]:
                  - generic [ref=e659]: Not configured
                - listitem [ref=e660]:
                  - generic [ref=e663]: Not configured
                - listitem [ref=e664]:
                  - generic [ref=e668]: Not configured
          - generic [ref=e669]:
            - paragraph [ref=e670]: © 2026 DataCamp. All rights reserved.
            - generic [ref=e671]:
              - button "العربية" [ref=e672]
              - generic [ref=e677]: "VERSION: 2.5.0-AR"
    - generic [ref=e678]:
      - generic: NEXUS AI MENTOR
      - button "Open AI Mentor" [ref=e679]
    - region "Notifications alt+T":
      - list:
        - listitem [ref=e686]:
          - generic [ref=e690]: Quiz and coding practice added to the curriculum.
  - dialog "Course lessons" [ref=e692]:
    - generic [ref=e693]:
      - generic [ref=e694]:
        - generic [ref=e695]:
          - heading "MANAGE_COURSE_LESSONS" [level=3] [ref=e696]
          - paragraph [ref=e700]: QA_TEST_APPLY_STATE
        - generic [ref=e701]:
          - button "NEW_LESSON" [ref=e702]
          - button "CLOSE" [ref=e704]
      - region "Course units" [ref=e705]:
        - heading "Course units" [level=4] [ref=e706]
        - generic [ref=e707]:
          - textbox "Unit title" [ref=e708]
          - button "Add unit" [disabled]
        - paragraph [ref=e709]: Drag units to reorder, or use the arrow buttons.
      - paragraph [ref=e710]: Drag lessons to reorder or use arrows. Save a lesson first to attach videos and files.
      - generic [ref=e711]:
        - generic [ref=e712]:
          - generic [ref=e713]:
            - generic [ref=e714]:
              - generic [ref=e715]:
                - generic [ref=e716]: "#1"
                - generic [ref=e717]: video
              - heading "QA_TEST_SOURCE" [level=4] [ref=e718]
              - paragraph
              - paragraph [ref=e719]: 20 min • +30 XP
            - generic [ref=e720]:
              - button "Move lesson up QA_TEST_SOURCE" [disabled] [ref=e721]: ↑
              - button "Move lesson down QA_TEST_SOURCE" [ref=e722]: ↓
              - button "Edit lesson" [ref=e723]
              - button "Delete lesson" [ref=e727]
          - generic [ref=e731]:
            - generic [ref=e732]:
              - generic [ref=e733]:
                - generic [ref=e734]: "#2"
                - generic [ref=e735]: quiz
              - heading "QA_TEST_SOURCE — Quiz" [level=4] [ref=e736]
              - paragraph
              - paragraph [ref=e737]: 5 min • +10 XP
            - generic [ref=e738]:
              - button "Move lesson up QA_TEST_SOURCE — Quiz" [ref=e739]: ↑
              - button "Move lesson down QA_TEST_SOURCE — Quiz" [ref=e740]: ↓
              - button "Edit lesson" [ref=e741]
              - button "Delete lesson" [ref=e745]
          - generic [ref=e749]:
            - generic [ref=e750]:
              - generic [ref=e751]:
                - generic [ref=e752]: "#3"
                - generic [ref=e753]: exercise
              - heading "QA_TEST_SOURCE — Coding" [level=4] [ref=e754]
              - paragraph
              - paragraph [ref=e755]: 10 min • +10 XP
            - generic [ref=e756]:
              - button "Move lesson up QA_TEST_SOURCE — Coding" [ref=e757]: ↑
              - button "Move lesson down QA_TEST_SOURCE — Coding" [disabled] [ref=e758]: ↓
              - button "Edit lesson" [ref=e759]
              - button "Delete lesson" [ref=e763]
        - generic [ref=e768]:
          - group [ref=e769]:
            - generic [ref=e770]:
              - heading "EDIT_LESSON" [level=4] [ref=e771]
              - button "Close" [ref=e772]
            - textbox "Lesson title" [ref=e776]: QA_TEST_SOURCE
            - generic [ref=e777]:
              - text: Unit
              - combobox "Lesson unit" [ref=e778]:
                - option "General lessons" [selected]
            - generic [ref=e779]:
              - combobox "Lesson type" [ref=e780]:
                - option "Article"
                - option "Video" [selected]
                - option "Quiz"
                - option "Exercise"
                - option "Project"
              - spinbutton "Position" [ref=e781]: "1"
            - generic [ref=e782]:
              - spinbutton "Duration minutes" [ref=e783]: "20"
              - spinbutton "XP" [ref=e784]: "30"
            - textbox "https://www.youtube.com/embed/..." [ref=e785]
            - textbox "Lesson content or exercise instructions..." [ref=e786]: QA_TEST_REVIEW
            - generic [ref=e787]:
              - checkbox "Available as free preview" [ref=e788]
              - text: Available as free preview
          - region "Lesson media and analysis" [ref=e789]:
            - heading "Video, materials and subtitles" [level=4] [ref=e790]
            - paragraph [ref=e791]: Up to 2 GiB per file within available Drive storage. Uploads can resume. Files are accessible to anyone with their link.
            - button "Reconnect Google Drive" [ref=e792]
            - group [ref=e793]:
              - generic [ref=e794]:
                - button "Upload lesson video" [ref=e795]
                - button "Choose lesson video" [ref=e796]:
                  - generic [ref=e800]: Lesson video
                  - generic [ref=e801]: Drag and drop a file here, or click to browse
                  - generic [ref=e802]: MP4 · WebM · MOV · 2 GiB
              - generic [ref=e803]:
                - generic [ref=e804]:
                  - button "Upload lesson material" [ref=e805]
                  - button "Choose lesson material" [ref=e806]:
                    - generic [ref=e811]: Lesson materials
                    - generic [ref=e812]: Drag and drop a file here, or click to browse
                    - generic [ref=e813]: PDF · Documents · Slides · Code · ZIP · 2 GiB
                - generic [ref=e814]:
                  - button "Upload lesson subtitles" [ref=e815]
                  - button "Choose lesson subtitles" [ref=e816]:
                    - generic [ref=e821]: Lesson subtitles
                    - generic [ref=e822]: Drag and drop a file here, or click to browse
                    - generic [ref=e823]: SRT · VTT · 5 MiB
              - generic [ref=e824]:
                - text: Subtitle language
                - combobox "Subtitle language" [ref=e825]:
                  - option "العربية" [selected]
                  - option "English"
            - generic [ref=e826]:
              - checkbox "Analyze automatically after upload; send a copy to Gemini" [checked] [ref=e827]
              - text: Analyze automatically after upload; send a copy to Gemini
            - paragraph [ref=e828]:
              - text: Analysis uses unpaid Gemini; do not select personal, confidential or sensitive content.
              - link "File processing details" [ref=e829] [cursor=pointer]:
                - /url: /privacy
            - generic [ref=e830]:
              - text: "Retry analysis: select the same lesson video"
              - button "Analyze saved lesson video" [disabled] [ref=e831]
          - generic [ref=e832]:
            - button "CANCEL" [ref=e833]
            - button "SAVE_LESSON" [ref=e834]
```

# Test source

```ts
  1  | import {test,expect} from '@playwright/test';import {randomUUID} from 'node:crypto';import {platform,admin} from '../../fix-tests/persisted-platform';
  2  | let p:Awaited<ReturnType<typeof platform>>;test.afterEach(async()=>{await p?.db.close();});
  3  | for(const language of ['en','ar'] as const)test('applying a reviewed plan has an honest noncancellable save state '+language,async({page})=>{
  4  |  p=await platform();const cid=randomUUID(),lid=randomUUID(),job=randomUUID();
  5  |  await p.db.query("INSERT INTO courses(id,title,slug) VALUES($1,'QA_TEST_APPLY_STATE','qa-test-apply')",[cid]);await p.db.query("INSERT INTO lessons(id,course_id,title,type,position) VALUES($1,$2,'QA_TEST_SOURCE','video',1)",[lid,cid]);
  6  |  const plan={summary:'QA_TEST_REVIEW',questions:Array.from({length:3},(_,i)=>({id:randomUUID(),question:'QA_TEST_Q'+i,options:['A','B'],correctIndex:0,explanation:'QA_TEST_REASON'})),exercise:{language:'javascript',prompt:'QA_TEST_DOUBLE',starterCode:'console.log(Number(stdin)*2)',solution:'console.log(Number(stdin)*2)',testCases:[{description:'QA_TEST_CASE',input:'3',expectedOutput:'6'}]}};
  7  |  await p.db.query("INSERT INTO lesson_analysis_jobs(id,owner_id,lesson_id,status,size_bytes,mime_type,sha256,upload_url,source_updated_at,plan) SELECT $1,$2,id,'ready',100,'video/mp4','QA_TEST','QA_TEST',updated_at,$3 FROM lessons WHERE id=$4",[job,admin,JSON.stringify(plan),lid]);
  8  |  let release!:()=>void,finish!:()=>void,calls=0;const held=new Promise<void>(r=>release=r),finished=new Promise<void>(r=>finish=r);
  9  |  await p.connect(page,admin,language);await page.route('**/api/courses/drive',r=>r.fulfill({json:{configured:true,connected:true}}));
  10 |  await page.route('**/api/courses/analyze',async route=>{const body=route.request().postDataJSON();if(body.action==='latest')return route.fulfill({json:{id:job,status:'ready',plan}});if(body.action==='apply'){calls++;await held;try{const result=(await p.db.query<any>('SELECT apply_lesson_analysis($1) result',[job])).rows[0].result;await route.fulfill({json:{success:true,result}});}finally{finish();}return;}throw Error('Unexpected QA action');});
  11 |  await page.goto('/admin/courses');await page.getByRole('button',{name:language==='ar'?'إدارة دروس الدورة':'Manage Lessons',exact:true}).click();await page.getByRole('button',{name:language==='ar'?'تعديل الدرس':'Edit lesson',exact:true}).click();
  12 |  const apply=page.getByRole('button',{name:language==='ar'?'اعتماد الملخص وإضافة الكويز والتطبيق':'Apply summary, quiz and coding practice',exact:true});await expect(apply).toBeVisible();
  13 |  try{
  14 |   await apply.click();await expect.poll(()=>calls).toBe(1);await expect(apply).toBeDisabled();
> 15 |   await expect(page.getByRole('progressbar',{name:'Course upload progress',exact:true})).toHaveCount(0,{timeout:700});
     |                                                                                          ^ Error: expect(locator).toHaveCount(expected) failed
  16 |   await expect(page.getByRole('button',{name:language==='ar'?'إيقاف مؤقت':'Pause',exact:true})).toHaveCount(0,{timeout:700});
  17 |   await page.screenshot({path:test.info().outputPath('QA_TEST_applying_'+language+'.png')});
  18 |  }finally{release();if(calls)await finished;}
  19 |  await expect.poll(async()=>Number((await p.db.query<any>('SELECT count(*) n FROM lessons WHERE source_lesson_id=$1',[lid])).rows[0].n)).toBe(2);expect(calls).toBe(1);
  20 | });
  21 | 
```