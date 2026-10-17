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
    - generic [ref=e313]:
      - banner [ref=e314]:
        - generic [ref=e315]:
          - button "Open navigation" [ref=e316]
          - generic [ref=e318]:
            - generic "DataCamp Official Emblem" [ref=e320]:
              - img "DataCamp Emblem" [ref=e321]
            - generic "Innovation University Crest" [ref=e323]:
              - img "Innovation University Crest" [ref=e324]
        - generic [ref=e325]:
          - button "العربية" [ref=e326]
          - button "EN" [ref=e328]
      - main [ref=e330]:
        - generic [ref=e333]:
          - generic [ref=e334]:
            - generic [ref=e335]:
              - heading "COURSE_MANAGEMENT" [level=2] [ref=e336]
              - paragraph [ref=e339]: Manage club curricula, lesson units, XP bounties, and student enrollments.
            - button "NEW_COURSE" [ref=e340]
          - textbox "Filter courses by title, category, instructor..." [ref=e346]
          - table [ref=e349]:
            - rowgroup [ref=e350]:
              - row [ref=e351]:
                - columnheader "COURSE" [ref=e352]
                - columnheader "CATEGORY" [ref=e353]
                - columnheader "LEVEL" [ref=e354]
                - columnheader "XP BOUNTY" [ref=e355]
                - columnheader "STATUS" [ref=e356]
                - columnheader "ACTIONS" [ref=e357]
            - rowgroup [ref=e358]:
              - row [ref=e359]:
                - cell "QA_TEST_APPLY_STATE DataCamp Instructor • 3 Lessons • 12h • 0 Enrolled" [ref=e360]:
                  - generic [ref=e364]:
                    - generic [ref=e365]: QA_TEST_APPLY_STATE
                    - generic [ref=e366]:
                      - generic [ref=e367]: DataCamp Instructor
                      - generic [ref=e368]: •
                      - generic [ref=e369]: 3 Lessons
                      - generic [ref=e370]: •
                      - generic [ref=e371]: 12h
                      - generic [ref=e372]: •
                      - generic [ref=e373]: 0 Enrolled
                - cell "data science" [ref=e374]
                - cell "beginner" [ref=e375]
                - cell "+500 XP" [ref=e376]
                - cell "DRAFT" [ref=e377]
                - cell [ref=e378]:
                  - generic [ref=e379]:
                    - link "View in Catalog" [ref=e380] [cursor=pointer]:
                      - /url: /courses/qa-test-apply
                    - link "Open Learning Room" [ref=e384] [cursor=pointer]:
                      - /url: /courses/qa-test-apply/learn
                    - button "Manage Lessons" [ref=e388]
                    - button "Publish" [ref=e391]
                    - button "Edit Course" [ref=e395]
                    - button "Delete Course" [ref=e399]
      - contentinfo [ref=e403]:
        - generic [ref=e404]:
          - generic [ref=e405]:
            - generic [ref=e406]:
              - link [ref=e407] [cursor=pointer]:
                - /url: /
                - generic [ref=e408]:
                  - generic "DataCamp Official Emblem" [ref=e410]:
                    - img "DataCamp Emblem" [ref=e411]
                  - generic "Innovation University Crest" [ref=e413]:
                    - img "Innovation University Crest" [ref=e414]
              - paragraph [ref=e415]: Empowering students with data science, AI, and software engineering skills.
            - generic [ref=e416]:
              - heading "Quick Links" [level=2] [ref=e417]
              - list [ref=e418]:
                - listitem [ref=e419]:
                  - link "About Us" [ref=e420] [cursor=pointer]:
                    - /url: /about
                - listitem [ref=e421]:
                  - link "Courses" [ref=e422] [cursor=pointer]:
                    - /url: /courses
                - listitem [ref=e423]:
                  - link "Events" [ref=e424] [cursor=pointer]:
                    - /url: /events
                - listitem [ref=e425]:
                  - link "Projects" [ref=e426] [cursor=pointer]:
                    - /url: /projects
                - listitem [ref=e427]:
                  - link "Blog" [ref=e428] [cursor=pointer]:
                    - /url: /blog
                - listitem [ref=e429]:
                  - link "Staff & Board" [ref=e430] [cursor=pointer]:
                    - /url: /staff
                - listitem [ref=e431]:
                  - link "Gallery" [ref=e432] [cursor=pointer]:
                    - /url: /gallery
            - generic [ref=e433]:
              - heading "Support" [level=2] [ref=e434]
              - list [ref=e435]:
                - listitem [ref=e436]:
                  - link "FAQ" [ref=e437] [cursor=pointer]:
                    - /url: /faq
                - listitem [ref=e438]:
                  - link "Contact" [ref=e439] [cursor=pointer]:
                    - /url: /contact
                - listitem [ref=e440]:
                  - link "Privacy Policy" [ref=e441] [cursor=pointer]:
                    - /url: /privacy
                - listitem [ref=e442]:
                  - link "Terms of Service" [ref=e443] [cursor=pointer]:
                    - /url: /terms
            - generic [ref=e444]:
              - heading "Contact Info" [level=2] [ref=e445]
              - list [ref=e446]:
                - listitem [ref=e447]:
                  - generic [ref=e451]: Not configured
                - listitem [ref=e452]:
                  - generic [ref=e455]: Not configured
                - listitem [ref=e456]:
                  - generic [ref=e460]: Not configured
          - generic [ref=e461]:
            - paragraph [ref=e462]: © 2026 DataCamp. All rights reserved.
            - generic [ref=e463]:
              - button "العربية" [ref=e464]
              - generic [ref=e469]: "VERSION: 2.5.0-AR"
    - generic [ref=e470]:
      - generic: NEXUS AI MENTOR
      - button "Open AI Mentor" [ref=e471]
    - region "Notifications alt+T":
      - list:
        - listitem [ref=e478]:
          - generic [ref=e482]: Quiz and coding practice added to the curriculum.
  - dialog "Course lessons" [ref=e484]:
    - generic [ref=e485]:
      - generic [ref=e486]:
        - generic [ref=e487]:
          - heading "MANAGE_COURSE_LESSONS" [level=3] [ref=e488]
          - paragraph [ref=e492]: QA_TEST_APPLY_STATE
        - generic [ref=e493]:
          - button "NEW_LESSON" [ref=e494]
          - button "CLOSE" [ref=e496]
      - region "Course units" [ref=e497]:
        - heading "Course units" [level=4] [ref=e498]
        - generic [ref=e499]:
          - textbox "Unit title" [ref=e500]
          - button "Add unit" [disabled]
        - paragraph [ref=e501]: Drag units to reorder, or use the arrow buttons.
      - paragraph [ref=e502]: Drag lessons to reorder or use arrows. Save a lesson first to attach videos and files.
      - generic [ref=e503]:
        - generic [ref=e504]:
          - generic [ref=e505]:
            - generic [ref=e506]:
              - generic [ref=e507]:
                - generic [ref=e508]: "#1"
                - generic [ref=e509]: video
              - heading "QA_TEST_SOURCE" [level=4] [ref=e510]
              - paragraph
              - paragraph [ref=e511]: 20 min • +30 XP
            - generic [ref=e512]:
              - button "Move lesson up QA_TEST_SOURCE" [disabled] [ref=e513]: ↑
              - button "Move lesson down QA_TEST_SOURCE" [ref=e514]: ↓
              - button "Edit lesson" [ref=e515]
              - button "Delete lesson" [ref=e519]
          - generic [ref=e523]:
            - generic [ref=e524]:
              - generic [ref=e525]:
                - generic [ref=e526]: "#2"
                - generic [ref=e527]: quiz
              - heading "QA_TEST_SOURCE — Quiz" [level=4] [ref=e528]
              - paragraph
              - paragraph [ref=e529]: 5 min • +10 XP
            - generic [ref=e530]:
              - button "Move lesson up QA_TEST_SOURCE — Quiz" [ref=e531]: ↑
              - button "Move lesson down QA_TEST_SOURCE — Quiz" [ref=e532]: ↓
              - button "Edit lesson" [ref=e533]
              - button "Delete lesson" [ref=e537]
          - generic [ref=e541]:
            - generic [ref=e542]:
              - generic [ref=e543]:
                - generic [ref=e544]: "#3"
                - generic [ref=e545]: exercise
              - heading "QA_TEST_SOURCE — Coding" [level=4] [ref=e546]
              - paragraph
              - paragraph [ref=e547]: 10 min • +10 XP
            - generic [ref=e548]:
              - button "Move lesson up QA_TEST_SOURCE — Coding" [ref=e549]: ↑
              - button "Move lesson down QA_TEST_SOURCE — Coding" [disabled] [ref=e550]: ↓
              - button "Edit lesson" [ref=e551]
              - button "Delete lesson" [ref=e555]
        - generic [ref=e560]:
          - group [ref=e561]:
            - generic [ref=e562]:
              - heading "EDIT_LESSON" [level=4] [ref=e563]
              - button "Close" [ref=e564]
            - textbox "Lesson title" [ref=e568]: QA_TEST_SOURCE
            - generic [ref=e569]:
              - text: Unit
              - combobox "Lesson unit" [ref=e570]:
                - option "General lessons" [selected]
            - generic [ref=e571]:
              - combobox "Lesson type" [ref=e572]:
                - option "Article"
                - option "Video" [selected]
                - option "Quiz"
                - option "Exercise"
                - option "Project"
              - spinbutton "Position" [ref=e573]: "1"
            - generic [ref=e574]:
              - spinbutton "Duration minutes" [ref=e575]: "20"
              - spinbutton "XP" [ref=e576]: "30"
            - textbox "https://www.youtube.com/embed/..." [ref=e577]
            - textbox "Lesson content or exercise instructions..." [ref=e578]: QA_TEST_REVIEW
            - generic [ref=e579]:
              - checkbox "Available as free preview" [ref=e580]
              - text: Available as free preview
          - region "Lesson media and analysis" [ref=e581]:
            - heading "Video, materials and subtitles" [level=4] [ref=e582]
            - paragraph [ref=e583]: Up to 2 GiB per file within available Drive storage. Uploads can resume. Files are accessible to anyone with their link.
            - button "Reconnect Google Drive" [ref=e584]
            - group [ref=e585]:
              - generic [ref=e586]:
                - button "Upload lesson video" [ref=e587]
                - button "Choose lesson video" [ref=e588]:
                  - generic [ref=e592]: Lesson video
                  - generic [ref=e593]: Drag and drop a file here, or click to browse
                  - generic [ref=e594]: MP4 · WebM · MOV · 2 GiB
              - generic [ref=e595]:
                - generic [ref=e596]:
                  - button "Upload lesson material" [ref=e597]
                  - button "Choose lesson material" [ref=e598]:
                    - generic [ref=e603]: Lesson materials
                    - generic [ref=e604]: Drag and drop a file here, or click to browse
                    - generic [ref=e605]: PDF · Documents · Slides · Code · ZIP · 2 GiB
                - generic [ref=e606]:
                  - button "Upload lesson subtitles" [ref=e607]
                  - button "Choose lesson subtitles" [ref=e608]:
                    - generic [ref=e613]: Lesson subtitles
                    - generic [ref=e614]: Drag and drop a file here, or click to browse
                    - generic [ref=e615]: SRT · VTT · 5 MiB
              - generic [ref=e616]:
                - text: Subtitle language
                - combobox "Subtitle language" [ref=e617]:
                  - option "العربية" [selected]
                  - option "English"
            - generic [ref=e618]:
              - checkbox "Analyze automatically after upload; send a copy to Gemini" [checked] [ref=e619]
              - text: Analyze automatically after upload; send a copy to Gemini
            - paragraph [ref=e620]:
              - text: Analysis uses unpaid Gemini; do not select personal, confidential or sensitive content.
              - link "File processing details" [ref=e621] [cursor=pointer]:
                - /url: /privacy
            - generic [ref=e622]:
              - text: "Retry analysis: select the same lesson video"
              - button "Analyze saved lesson video" [disabled] [ref=e623]
          - generic [ref=e624]:
            - button "CANCEL" [ref=e625]
            - button "SAVE_LESSON" [ref=e626]
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