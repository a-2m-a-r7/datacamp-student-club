# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: course-presentation.spec.ts >> organized course cards retain filtering, enrollment and saved progress (en)
- Location: qa-audit\final\tests\course-presentation.spec.ts:90:2

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator:  getByText('QA_TEST_LESSON', { exact: true }).first()
Expected: visible
Received: hidden
Timeout:  20000ms

Call log:
  - Expect "toBeVisible" getByText('QA_TEST_LESSON', { exact: true }).first() with timeout 20000ms
  - waiting for getByText('QA_TEST_LESSON', { exact: true }).first()
    38 × locator resolved to <p class="text-[10px] font-mono text-muted-foreground">QA_TEST_LESSON</p>
       - unexpected value "hidden"

```

```yaml
- banner:
  - button "Open navigation"
  - img "DataCamp Emblem"
  - img "Innovation University Crest"
  - button "العربية"
  - button "EN"
- main:
  - link:
    - /url: /courses/qa-test-course-layout
  - text: 0%
  - button
  - main:
    - text: LESSON 1 • ARTICLE
    - heading "QA_TEST_LESSON" [level=1]
    - text: +30 XP
    - tablist "Learning stages":
      - tab "QA_TEST_LESSON" [selected]
    - region "Lesson resources"
    - button "COMPLETE & CLAIM +30 XP"
- contentinfo:
  - link "DataCamp Emblem Innovation University Crest":
    - /url: /
    - img "DataCamp Emblem"
    - img "Innovation University Crest"
  - paragraph: Empowering students with data science, AI, and software engineering skills.
  - heading "Quick Links" [level=4]
  - list:
    - listitem:
      - link "About Us":
        - /url: /about
    - listitem:
      - link "Courses":
        - /url: /courses
    - listitem:
      - link "Events":
        - /url: /events
    - listitem:
      - link "Projects":
        - /url: /projects
    - listitem:
      - link "Blog":
        - /url: /blog
    - listitem:
      - link "Staff & Board":
        - /url: /staff
    - listitem:
      - link "Gallery":
        - /url: /gallery
  - heading "Support" [level=4]
  - list:
    - listitem:
      - link "FAQ":
        - /url: /faq
    - listitem:
      - link "Contact":
        - /url: /contact
    - listitem:
      - link "Privacy Policy":
        - /url: /privacy
    - listitem:
      - link "Terms of Service":
        - /url: /terms
  - heading "Contact Info" [level=4]
  - list:
    - listitem: Not configured
    - listitem: Not configured
    - listitem: Not configured
  - paragraph: © 2026 DataCamp. All rights reserved.
  - button "العربية"
  - text: "VERSION: 2.5.0-AR"
- button "Open AI Mentor"
- region "Notifications alt+T"
```

# Test source

```ts
  5   | let app:Awaited<ReturnType<typeof platform>>;
  6   | test.afterEach(async()=>{await app?.db.close();});
  7   | async function seed() {
  8   |  app=await platform();const course=randomUUID(),lesson=randomUUID();
  9   |  await app.db.query(`INSERT INTO courses(id,title,slug,description,short_description,category,level,instructor_name,duration_hours,tags,is_published)
  10  |  VALUES($1,'QA_TEST Python للبيانات: من البداية إلى تطبيق مشروع عملي كامل','qa-test-course-layout','QA_TEST Learn through lessons and practice. تعلم وطبق خطوة بخطوة.','QA_TEST Learn through lessons and practice. تعلم وطبق خطوة بخطوة.','data_science','beginner','QA_TEST مدرب الكورس باسم طويل لاختبار العرض',4,ARRAY['Python','تحليل البيانات'],true)`,[course]);
  11  |  await app.db.query("INSERT INTO lessons(id,course_id,title,type,position) VALUES($1,$2,'QA_TEST_LESSON','article',1)",[lesson,course]);
  12  |  return {course,lesson};
  13  | }
  14  | async function editor(page:Page,language:'ar'|'en') {
  15  |  const ids=await seed();await app.connect(page,admin,language);
  16  |  await page.route('**/api/courses/drive',route=>route.fulfill({json:{configured:true,connected:true}}));
  17  |  await page.route('**/api/courses/analyze',route=>route.fulfill({json:{status:'none'}}));
  18  |  await page.goto('/admin/courses');
  19  |  await page.getByRole('button',{name:language==='ar'?'إدارة دروس الدورة':'Manage Lessons',exact:true}).click();
  20  |  await page.getByRole('button',{name:language==='ar'?'تعديل الدرس':'Edit lesson',exact:true}).click();
  21  |  await page.getByRole('checkbox',{name:language==='ar'?'تحليل الفيديو تلقائيًا بعد الرفع وإرسال نسخة إلى Gemini':'Analyze automatically after upload; send a copy to Gemini',exact:true}).uncheck();
  22  |  return ids;
  23  | }
  24  | async function drop(page:Page,zone:Locator,files:{name:string;type:string;bytes:number[]}[]) {
  25  |  const data=await page.evaluateHandle(files=>{const transfer=new DataTransfer();for(const file of files)transfer.items.add(new File([new Uint8Array(file.bytes)],file.name,{type:file.type}));return transfer;},files);
  26  |  await zone.dispatchEvent('dragenter',{dataTransfer:data});await zone.dispatchEvent('dragover',{dataTransfer:data});await zone.dispatchEvent('drop',{dataTransfer:data});await data.dispose();
  27  | }
  28  | const video={name:'QA_TEST_video.mp4',mimeType:'video/mp4',buffer:Buffer.from([0,0,0,24,102,116,121,112,105,115,111,109])};
  29  | 
  30  | for(const language of ['en','ar'] as const) {
  31  |  test(`course file zones select with mouse, keyboard and drop, then persist three assets (${language})`,async({page},info)=>{
  32  |   const {course,lesson}=await editor(page,language);const starts:any[]=[],received:Buffer[]=[];let active:any,assetCount=0;
  33  |   await page.route('**/api/courses/media',async route=>{
  34  |    const body=route.request().postDataJSON();if(body.action==='start'){
  35  |     active={...body,id:randomUUID()};starts.push(active);return route.fulfill({json:{jobId:active.id,accessToken:'QA_TEST_TOKEN',uploadUrl:'https://www.googleapis.com/upload/drive/v3/files?upload_id=QA_TEST_DROP'}});
  36  |    }
  37  |    expect(body.action).toBe('finish');expect(body.jobId).toBe(active.id);
  38  |    const file='QA_TEST_FILE_'+(++assetCount);
  39  |    await app.db.query(`INSERT INTO course_assets(id,course_id,lesson_id,owner_id,kind,provider,name,mime_type,size_bytes,file_id,url,language) VALUES($1,$2,$3,$4,$5,'drive',$6,$7,$8,$9,$10,$11)`,[active.id,course,lesson,admin,active.kind,active.name,active.mimeType,active.size,file,'https://drive.google.com/file/d/'+file+'/view',body.language]);
  40  |    if(active.kind==='video')await app.db.query('UPDATE lessons SET video_asset_id=$1 WHERE id=$2',[active.id,lesson]);
  41  |    return route.fulfill({json:{success:true,assetId:active.id}});
  42  |   });
  43  |   await page.route('https://www.googleapis.com/upload/drive/v3/files?upload_id=QA_TEST_DROP',route=>{
  44  |    const range=route.request().headers()['content-range'];if(range.startsWith('bytes */'))return route.fulfill({status:308});
  45  |    received.push(route.request().postDataBuffer()!);return route.fulfill({json:{id:'QA_TEST_PROVIDER_FILE'}});
  46  |   });
  47  |   const choose=page.getByRole('button',{name:language==='ar'?'اختيار فيديو الدرس':'Choose lesson video',exact:true});
  48  |   const picker=page.waitForEvent('filechooser');await choose.click();await (await picker).setFiles(video);
  49  |   await expect.poll(async()=>Number((await app.db.query<any>('SELECT count(*) n FROM course_assets WHERE lesson_id=$1',[lesson])).rows[0].n)).toBe(1);
  50  |   await expect(choose).toBeEnabled();
  51  |   const material=page.getByRole('button',{name:language==='ar'?'اختيار ملفات الماتريال':'Choose lesson material',exact:true});
  52  |   const keyboardPicker=page.waitForEvent('filechooser');await material.focus();await material.press('Enter');await (await keyboardPicker).setFiles({name:'QA_TEST_material.pdf',mimeType:'application/pdf',buffer:Buffer.from('%PDF-1.7 QA_TEST')});
  53  |   await expect.poll(async()=>Number((await app.db.query<any>('SELECT count(*) n FROM course_assets WHERE lesson_id=$1',[lesson])).rows[0].n)).toBe(2);
  54  |   const subtitle=page.getByRole('button',{name:language==='ar'?'اختيار ملف الترجمة':'Choose lesson subtitles',exact:true});
  55  |   await expect(subtitle).toBeEnabled();await drop(page,subtitle,[{name:'QA_TEST_subtitles.srt',type:'text/plain',bytes:Array.from(Buffer.from('1\n00:00:01,000 --> 00:00:02,000\nQA_TEST مرحبا\n'))}]);
  56  |   await expect.poll(async()=>Number((await app.db.query<any>('SELECT count(*) n FROM course_assets WHERE lesson_id=$1',[lesson])).rows[0].n)).toBe(3);
  57  |   const rows=(await app.db.query<any>('SELECT kind,name,size_bytes,language FROM course_assets WHERE lesson_id=$1 ORDER BY kind',[lesson])).rows;
  58  |   expect(rows.map(row=>row.kind)).toEqual(['material','subtitle','video']);expect(starts).toHaveLength(3);expect(received).toHaveLength(3);
  59  |   for(let i=0;i<3;i++){expect(received[i].length).toBe(starts[i].size);expect(starts[i].sha256).toMatch(/^[a-f0-9]{64}$/);}
  60  |   await expect.poll(async()=>(await app.db.query<any>('SELECT video_asset_id FROM lessons WHERE id=$1',[lesson])).rows[0].video_asset_id).toBe(starts[0].id);
  61  |   await expect(page.getByRole('link',{name:language==='ar'?'فتح الملف':'Open file',exact:true})).toHaveCount(3);
  62  |   await choose.scrollIntoViewIfNeeded();await page.screenshot({path:info.outputPath(`upload-zone-${language}.png`)});
  63  |   await page.reload();await page.getByRole('button',{name:language==='ar'?'إدارة دروس الدورة':'Manage Lessons',exact:true}).click();await page.getByRole('button',{name:language==='ar'?'تعديل الدرس':'Edit lesson',exact:true}).click();
  64  |   await expect(page.getByRole('link',{name:language==='ar'?'فتح الملف':'Open file',exact:true})).toHaveCount(3);
  65  |  });
  66  | 
  67  |  test(`course drop rejects invalid selection, blocks another upload while busy and pauses (${language})`,async({page},info)=>{
  68  |   await editor(page,language);let starts=0,release!:()=>void;const pending=new Promise<void>(resolve=>{release=resolve;});
  69  |   const zone=page.getByRole('button',{name:language==='ar'?'اختيار فيديو الدرس':'Choose lesson video',exact:true});
  70  |   await page.route('**/api/courses/media',route=>{starts++;return route.fulfill({json:{jobId:randomUUID(),accessToken:'QA_TEST_TOKEN',uploadUrl:'https://www.googleapis.com/upload/drive/v3/files?upload_id=QA_TEST_PAUSE'}});});
  71  |   await page.route('https://www.googleapis.com/upload/drive/v3/files?upload_id=QA_TEST_PAUSE',async route=>{
  72  |    if(route.request().headers()['content-range'].startsWith('bytes */'))return route.fulfill({status:308});
  73  |    await pending;await route.fulfill({json:{id:'QA_TEST_PROVIDER_FILE'}}).catch(()=>{});
  74  |   });
  75  |   const alert=page.getByRole('alert');
  76  |   await drop(page,zone,[{name:'QA_TEST_empty.mp4',type:'video/mp4',bytes:[]}]);await expect(alert).toContainText(language==='ar'?'غير فارغ':'nonempty');
  77  |   await drop(page,zone,[{name:'QA_TEST_wrong.pdf',type:'application/pdf',bytes:[1]}]);await expect(alert).toContainText('MP4');
  78  |   await drop(page,zone,[{name:'QA_TEST_1.mp4',type:'video/mp4',bytes:[1]},{name:'QA_TEST_2.mp4',type:'video/mp4',bytes:[2]}]);await expect(alert).toContainText(language==='ar'?'ملفًا واحدًا':'one file');expect(starts).toBe(0);
  79  |   const transfer=await page.evaluateHandle(()=>{const dt=new DataTransfer();const file=new File(['QA_TEST'],'QA_TEST_oversize.mp4',{type:'video/mp4'});Object.defineProperty(file,'size',{value:2147483649});dt.items.add(file);return dt;});
  80  |   await zone.dispatchEvent('drop',{dataTransfer:transfer});await transfer.dispose();await expect(alert).toContainText(language==='ar'?'2 جيجا':'2 GiB');expect(starts).toBe(0);
  81  |   // This probes declared-size validation; no 2 GiB transfer is claimed.
  82  |   await drop(page,zone,[{name:video.name,type:video.mimeType,bytes:Array.from(video.buffer)}]);
  83  |   await expect(zone).toBeDisabled();await expect(page.getByLabel('Course upload progress',{exact:true})).toBeVisible();
  84  |   await drop(page,zone,[{name:'QA_TEST_SECOND.mp4',type:'video/mp4',bytes:[1]}]);expect(starts).toBe(1);
  85  |   await page.getByRole('button',{name:language==='ar'?'إيقاف مؤقت':'Pause',exact:true}).click();release();
  86  |   await expect(alert).toContainText(language==='ar'?'توقف الرفع':'Paused');await expect(zone).toBeEnabled();expect(starts).toBe(1);
  87  |   await page.screenshot({path:info.outputPath(`upload-paused-${language}.png`)});
  88  |  });
  89  | 
  90  |  test(`organized course cards retain filtering, enrollment and saved progress (${language})`,async({page},info)=>{
  91  |   const {course}=await seed();await app.connect(page,member,language);await page.goto('/courses');
  92  |   const card=page.getByRole('article').filter({hasText:'QA_TEST Python'});await expect(card).toHaveCount(1);
  93  |   await page.getByRole('button',{name:language==='ar'?'علم البيانات':'DATA SCIENCE',exact:true}).click();await expect(card).toBeVisible();
  94  |   await page.getByRole('button',{name:language==='ar'?'متقدم':'ADVANCED',exact:true}).click();await expect(card).toHaveCount(0);
  95  |   await page.getByRole('button',{name:language==='ar'?'إعادة ضبط الفلاتر':'RESET_FILTERS',exact:true}).click();await expect(card).toHaveCount(1);
  96  |   const search=page.getByRole('textbox',{name:language==='ar'?'البحث في الكورسات':'Search courses',exact:true});await search.fill('QA_TEST_NO_MATCH');await expect(card).toHaveCount(0);await search.fill('Python');await expect(card).toHaveCount(1);
  97  |   await card.scrollIntoViewIfNeeded();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);await page.screenshot({path:info.outputPath(`course-catalog-${language}.png`),fullPage:true});
  98  |   await card.getByRole('button',{name:language==='ar'?'سجل الآن ⚡':'ENROLL NOW ⚡',exact:true}).click();
  99  |   await expect.poll(async()=>Number((await app.db.query<any>('SELECT count(*) n FROM enrollments WHERE user_id=$1 AND course_id=$2',[member,course])).rows[0].n)).toBe(1);
  100 |   await expect(card.getByRole('progressbar')).toHaveAttribute('value','0');expect(app.calls.some(call=>call.table==='enroll_course'&&call.method==='POST')).toBe(true);
  101 |   await page.goto('/my-courses');const enrolled=page.getByRole('article').filter({hasText:'QA_TEST Python'});await expect(enrolled.getByRole('progressbar')).toHaveAttribute('value','0');
  102 |   await expect(page.getByLabel(language==='ar'?'ملخص التعلم':'Learning summary')).toContainText('1');
  103 |   const mySearch=page.getByRole('textbox',{name:language==='ar'?'البحث داخل كورساتك':'Search your courses',exact:true});await mySearch.fill('QA_TEST_NO_MATCH');await expect(enrolled).toHaveCount(0);await mySearch.clear();await expect(enrolled).toHaveCount(1);
  104 |   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);await page.screenshot({path:info.outputPath(`my-courses-${language}.png`),fullPage:true});
> 105 |   await enrolled.getByRole('link',{name:language==='ar'?'متابعة':'CONTINUE',exact:true}).click();await expect(page).toHaveURL(/\/courses\/qa-test-course-layout\/learn$/);await expect(page.getByText('QA_TEST_LESSON',{exact:true}).first()).toBeVisible();
      |                                                                                                                                                                                                                                               ^ Error: expect(locator).toBeVisible() failed
  106 |  });
  107 | }
  108 | 
```