# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: course-presentation.spec.ts >> course file zones select with mouse, keyboard and drop, then persist three assets (ar)
- Location: qa-audit\final\tests\course-presentation.spec.ts:31:2

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: locator.click: Test timeout of 60000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'إدارة الدروس', exact: true })

```

# Page snapshot

```yaml
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
        - paragraph [ref=e325]: القائمة الرئيسية
        - link "الرئيسية" [ref=e327] [cursor=pointer]:
          - /url: /
        - link "الدورات التدريبية" [ref=e334] [cursor=pointer]:
          - /url: /courses
        - link "كورساتي" [ref=e340] [cursor=pointer]:
          - /url: /my-courses
        - link "محرر الأكواد" [ref=e347] [cursor=pointer]:
          - /url: /compiler
        - link "لوحة المتصدرين" [ref=e354] [cursor=pointer]:
          - /url: /leaderboard
        - link "الشهادات المعتمدة" [ref=e364] [cursor=pointer]:
          - /url: /certificates
        - link "الإشعارات" [ref=e374] [cursor=pointer]:
          - /url: /notifications
        - link "الفعاليات والورش" [ref=e381] [cursor=pointer]:
          - /url: /events
        - link "المشاريع" [ref=e387] [cursor=pointer]:
          - /url: /projects
        - link "المدونة" [ref=e394] [cursor=pointer]:
          - /url: /blog
        - link "فريق العمل" [ref=e401] [cursor=pointer]:
          - /url: /staff
        - link "معرض الصور" [ref=e410] [cursor=pointer]:
          - /url: /gallery
        - link "عن النادي" [ref=e418] [cursor=pointer]:
          - /url: /about
        - link "اتصل بنا" [ref=e424] [cursor=pointer]:
          - /url: /contact
      - generic [ref=e430]:
        - paragraph [ref=e431]: بوابة الإدارة
        - link "نظرة عامة" [ref=e432] [cursor=pointer]:
          - /url: /admin
        - link "إدارة الدورات" [ref=e436] [cursor=pointer]:
          - /url: /admin/courses
        - link "النقاط والـ XP" [ref=e440] [cursor=pointer]:
          - /url: /admin/points
        - link "الأعضاء" [ref=e445] [cursor=pointer]:
          - /url: /admin/users
        - link "الفعاليات" [ref=e452] [cursor=pointer]:
          - /url: /admin/events
        - link "النماذج والاستبيانات" [ref=e456] [cursor=pointer]:
          - /url: /admin/forms
        - link "فريق العمل" [ref=e461] [cursor=pointer]:
          - /url: /admin/staff
        - link "المعرض" [ref=e466] [cursor=pointer]:
          - /url: /admin/gallery
        - link "المشاريع" [ref=e472] [cursor=pointer]:
          - /url: /admin/projects
        - link "المقالات" [ref=e477] [cursor=pointer]:
          - /url: /admin/blog
        - link "الرسائل" [ref=e482] [cursor=pointer]:
          - /url: /admin/messages
        - link "إعلانات المحتوى" [ref=e487] [cursor=pointer]:
          - /url: /admin/content
        - link "مركز الأمان" [ref=e494] [cursor=pointer]:
          - /url: /admin/security
        - link "الملف الشخصي" [ref=e498] [cursor=pointer]:
          - /url: /profile
        - link "إعدادات المنصة" [ref=e503] [cursor=pointer]:
          - /url: /admin/settings
    - generic [ref=e508]:
      - generic [ref=e509]:
        - link "Q QA_TEST_ADMIN مشرف" [ref=e510] [cursor=pointer]:
          - /url: /profile
          - generic [ref=e511]: Q
          - generic [ref=e513]:
            - paragraph [ref=e514]: QA_TEST_ADMIN
            - paragraph [ref=e515]: مشرف
        - button "تسجيل الخروج" [ref=e516]
      - generic [ref=e522]:
        - button "العربية" [ref=e523]
        - button "English" [ref=e525]
      - button [ref=e527]
  - generic [ref=e530]:
    - generic [ref=e532]:
      - button "العربية" [ref=e533]
      - button "EN" [ref=e536]
    - main [ref=e538]:
      - generic [ref=e541]:
        - generic [ref=e542]:
          - generic [ref=e543]:
            - heading "إدارة الدورات والكورسات" [level=2] [ref=e544]
            - paragraph [ref=e547]: إدارة المناهج الأكاديمية والدروس التفاعلية ومكافآت نقاط الـ XP وتسجيلات الطلاب.
          - button "إضافة دورة جديدة" [ref=e548]
        - textbox "البحث في الدورات أو المدربين أو التصنيفات..." [ref=e554]
        - table [ref=e557]:
          - rowgroup [ref=e558]:
            - row [ref=e559]:
              - columnheader "الدورة التدريبية" [ref=e560]
              - columnheader "التصنيف" [ref=e561]
              - columnheader "المستوى" [ref=e562]
              - columnheader "مكافأة الـ XP" [ref=e563]
              - columnheader "الحالة" [ref=e564]
              - columnheader "الإجراءات" [ref=e565]
          - rowgroup [ref=e566]:
            - row [ref=e567]:
              - 'cell "QA_TEST Python للبيانات: من البداية إلى تطبيق مشروع عملي كامل QA_TEST مدرب الكورس باسم طويل لاختبار العرض • 1 درس • 4h • 0 طالب" [ref=e568]':
                - generic [ref=e572]:
                  - generic [ref=e573]: "QA_TEST Python للبيانات: من البداية إلى تطبيق مشروع عملي كامل"
                  - generic [ref=e574]:
                    - generic [ref=e575]: QA_TEST مدرب الكورس باسم طويل لاختبار العرض
                    - generic [ref=e576]: •
                    - generic [ref=e577]: 1 درس
                    - generic [ref=e578]: •
                    - generic [ref=e579]: 4h
                    - generic [ref=e580]: •
                    - generic [ref=e581]: 0 طالب
              - cell "data science" [ref=e582]
              - cell "beginner" [ref=e583]
              - cell "+500 XP" [ref=e584]
              - cell "منشور" [ref=e585]
              - cell [ref=e586]:
                - generic [ref=e587]:
                  - link "معاينة في الكتالوج" [ref=e588] [cursor=pointer]:
                    - /url: /courses/qa-test-course-layout
                  - link "فتح بيئة التعلم التفاعلية" [ref=e592] [cursor=pointer]:
                    - /url: /courses/qa-test-course-layout/learn
                  - button "إدارة دروس الدورة" [ref=e596]
                  - button "إلغاء النشر" [ref=e599]
                  - button "تعديل الدورة" [ref=e603]
                  - button "حذف الدورة" [ref=e607]
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
            - paragraph [ref=e623]: تمكين الطلاب من إتقان علم البيانات، الذكاء الاصطناعي، وهندسة البرمجيات عبر تعليم تفاعلي وشهادات معتمدة.
          - generic [ref=e624]:
            - heading "روابط سريعة" [level=4] [ref=e625]
            - list [ref=e626]:
              - listitem [ref=e627]:
                - link "عن النادي" [ref=e628] [cursor=pointer]:
                  - /url: /about
              - listitem [ref=e629]:
                - link "الدورات التدريبية" [ref=e630] [cursor=pointer]:
                  - /url: /courses
              - listitem [ref=e631]:
                - link "الفعاليات والورش" [ref=e632] [cursor=pointer]:
                  - /url: /events
              - listitem [ref=e633]:
                - link "المشاريع" [ref=e634] [cursor=pointer]:
                  - /url: /projects
              - listitem [ref=e635]:
                - link "المدونة" [ref=e636] [cursor=pointer]:
                  - /url: /blog
              - listitem [ref=e637]:
                - link "فريق العمل" [ref=e638] [cursor=pointer]:
                  - /url: /staff
              - listitem [ref=e639]:
                - link "معرض الصور" [ref=e640] [cursor=pointer]:
                  - /url: /gallery
          - generic [ref=e641]:
            - heading "الدعم والمساعدة" [level=4] [ref=e642]
            - list [ref=e643]:
              - listitem [ref=e644]:
                - link "الأسئلة الشائعة" [ref=e645] [cursor=pointer]:
                  - /url: /faq
              - listitem [ref=e646]:
                - link "اتصل بنا" [ref=e647] [cursor=pointer]:
                  - /url: /contact
              - listitem [ref=e648]:
                - link "سياسة الخصوصية" [ref=e649] [cursor=pointer]:
                  - /url: /privacy
              - listitem [ref=e650]:
                - link "الشروط والأحكام" [ref=e651] [cursor=pointer]:
                  - /url: /terms
          - generic [ref=e652]:
            - heading "معلومات التواصل" [level=4] [ref=e653]
            - list [ref=e654]:
              - listitem [ref=e655]:
                - generic [ref=e659]: غير محدد
              - listitem [ref=e660]:
                - generic [ref=e663]: غير محدد
              - listitem [ref=e664]:
                - generic [ref=e668]: غير محدد
        - generic [ref=e669]:
          - paragraph [ref=e670]: جميع الحقوق محفوظة © 2026 نادي داتا كامب الطلابي • جامعة الابتكار.
          - generic [ref=e671]:
            - button "English" [ref=e672]
            - generic [ref=e677]: "VERSION: 2.5.0-AR"
  - generic [ref=e678]:
    - generic: مرشد NEXUS الذكي
    - button "فتح مرشد الذكاء الاصطناعي NEXUS" [ref=e679]
  - region "Notifications alt+T"
```

# Test source

```ts
  1   | import {test,expect,Page,Locator} from '@playwright/test';
  2   | import {randomUUID} from 'node:crypto';
  3   | import {platform,admin,member} from '../../fix-tests/persisted-platform';
  4   | 
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
> 19  |  await page.getByRole('button',{name:language==='ar'?'إدارة الدروس':'Manage Lessons',exact:true}).click();
      |                                                                                                   ^ Error: locator.click: Test timeout of 60000ms exceeded.
  20  |  await page.getByRole('button',{name:'Edit lesson',exact:true}).click();
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
  63  |   await page.reload();await page.getByRole('button',{name:language==='ar'?'إدارة الدروس':'Manage Lessons',exact:true}).click();await page.getByRole('button',{name:'Edit lesson',exact:true}).click();
  64  |   await expect(page.getByRole('link',{name:language==='ar'?'فتح الملف':'Open file',exact:true})).toHaveCount(3);
  65  |  });
  66  | 
  67  |  test(`course drop rejects invalid selection, blocks another upload while busy and pauses (${language})`,async({page},info)=>{
  68  |   await editor(page,language);let starts=0,release:()=>void=()=>{};
  69  |   const zone=page.getByRole('button',{name:language==='ar'?'اختيار فيديو الدرس':'Choose lesson video',exact:true});
  70  |   await page.route('**/api/courses/media',route=>{starts++;return route.fulfill({json:{jobId:randomUUID(),accessToken:'QA_TEST_TOKEN',uploadUrl:'https://www.googleapis.com/upload/drive/v3/files?upload_id=QA_TEST_PAUSE'}});});
  71  |   await page.route('https://www.googleapis.com/upload/drive/v3/files?upload_id=QA_TEST_PAUSE',async route=>{
  72  |    if(route.request().headers()['content-range'].startsWith('bytes */'))return route.fulfill({status:308});
  73  |    await new Promise<void>(resolve=>{release=resolve;});await route.fulfill({json:{id:'QA_TEST_PROVIDER_FILE'}}).catch(()=>{});
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
  105 |   await enrolled.getByRole('link',{name:language==='ar'?'متابعة':'CONTINUE',exact:true}).click();await expect(page).toHaveURL(/\/courses\/qa-test-course-layout\/learn$/);await expect(page.getByText('QA_TEST_LESSON',{exact:true}).first()).toBeVisible();
  106 |  });
  107 | }
  108 | 
```