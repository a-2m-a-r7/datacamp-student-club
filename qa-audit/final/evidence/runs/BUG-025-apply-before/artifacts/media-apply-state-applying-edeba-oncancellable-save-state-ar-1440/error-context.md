# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: media-apply-state.spec.ts >> applying a reviewed plan has an honest noncancellable save state ar
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
                - cell "QA_TEST_APPLY_STATE DataCamp Instructor • 3 درس • 12h • 0 طالب" [ref=e568]:
                  - generic [ref=e572]:
                    - generic [ref=e573]: QA_TEST_APPLY_STATE
                    - generic [ref=e574]:
                      - generic [ref=e575]: DataCamp Instructor
                      - generic [ref=e576]: •
                      - generic [ref=e577]: 3 درس
                      - generic [ref=e578]: •
                      - generic [ref=e579]: 12h
                      - generic [ref=e580]: •
                      - generic [ref=e581]: 0 طالب
                - cell "data science" [ref=e582]
                - cell "beginner" [ref=e583]
                - cell "+500 XP" [ref=e584]
                - cell "مسودة" [ref=e585]
                - cell [ref=e586]:
                  - generic [ref=e587]:
                    - link "معاينة في الكتالوج" [ref=e588] [cursor=pointer]:
                      - /url: /courses/qa-test-apply
                    - link "فتح بيئة التعلم التفاعلية" [ref=e592] [cursor=pointer]:
                      - /url: /courses/qa-test-apply/learn
                    - button "إدارة دروس الدورة" [ref=e596]
                    - button "نشر الدورة" [ref=e599]
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
              - heading "روابط سريعة" [level=2] [ref=e625]
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
              - heading "الدعم والمساعدة" [level=2] [ref=e642]
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
              - heading "معلومات التواصل" [level=2] [ref=e653]
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
    - region "Notifications alt+T":
      - list:
        - listitem [ref=e686]:
          - generic [ref=e690]: أُضيف الكويز والتطبيق إلى المنهج دون تكرار.
  - dialog "إدارة دروس الكورس" [ref=e692]:
    - generic [ref=e693]:
      - generic [ref=e694]:
        - generic [ref=e695]:
          - heading "إدارة دروس الدورة" [level=3] [ref=e696]
          - paragraph [ref=e700]: QA_TEST_APPLY_STATE
        - generic [ref=e701]:
          - button "درس جديد" [ref=e702]
          - button "إغلاق" [ref=e704]
      - region "Course units" [ref=e705]:
        - heading "وحدات الكورس" [level=4] [ref=e706]
        - generic [ref=e707]:
          - textbox "Unit title" [ref=e708]:
            - /placeholder: اسم الوحدة
          - button "إضافة وحدة" [disabled]
        - paragraph [ref=e709]: اسحب لترتيب الوحدات، أو استخدم الأسهم.
      - paragraph [ref=e710]: اسحب الدروس لترتيبها أو استخدم الأسهم. احفظ الدرس أولًا لإضافة الفيديو والملفات.
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
              - button "تعديل الدرس" [ref=e723]
              - button "حذف الدرس" [ref=e727]
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
              - button "تعديل الدرس" [ref=e741]
              - button "حذف الدرس" [ref=e745]
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
              - button "تعديل الدرس" [ref=e759]
              - button "حذف الدرس" [ref=e763]
        - generic [ref=e768]:
          - group [ref=e769]:
            - generic [ref=e770]:
              - heading "تعديل الدرس" [level=4] [ref=e771]
              - button "Close" [ref=e772]
            - textbox "عنوان الدرس" [ref=e776]: QA_TEST_SOURCE
            - generic [ref=e777]:
              - text: الوحدة
              - combobox "Lesson unit" [ref=e778]:
                - option "دروس عامة" [selected]
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
            - textbox "محتوى الدرس أو تعليمات التمرين..." [ref=e786]: QA_TEST_REVIEW
            - generic [ref=e787]:
              - checkbox "متاح كمعاينة مجانية" [ref=e788]
              - text: متاح كمعاينة مجانية
          - region "ملفات وتحليل الدرس" [ref=e789]:
            - heading "الفيديو والماتريال والترجمة" [level=4] [ref=e790]
            - paragraph [ref=e791]: حتى 2 جيجا للملف ضمن مساحة Drive المتاحة. الرفع قابل للاستكمال. الملفات تكون متاحة لمن يمتلك رابطها.
            - button "إعادة ربط Google Drive" [ref=e792]
            - group [ref=e793]:
              - generic [ref=e794]:
                - button "Upload lesson video" [ref=e795]
                - button "اختيار فيديو الدرس" [ref=e796]:
                  - generic [ref=e800]: فيديو الدرس
                  - generic [ref=e801]: اسحب الملف وأفلته هنا، أو اضغط لاختياره من جهازك
                  - generic [ref=e802]: MP4 · WebM · MOV · 2 GiB
              - generic [ref=e803]:
                - generic [ref=e804]:
                  - button "Upload lesson material" [ref=e805]
                  - button "اختيار ملفات الماتريال" [ref=e806]:
                    - generic [ref=e811]: ملفات الماتريال
                    - generic [ref=e812]: اسحب الملف وأفلته هنا، أو اضغط لاختياره من جهازك
                    - generic [ref=e813]: PDF · Documents · Slides · Code · ZIP · 2 GiB
                - generic [ref=e814]:
                  - button "Upload lesson subtitles" [ref=e815]
                  - button "اختيار ملف الترجمة" [ref=e816]:
                    - generic [ref=e821]: ملف الترجمة
                    - generic [ref=e822]: اسحب الملف وأفلته هنا، أو اضغط لاختياره من جهازك
                    - generic [ref=e823]: SRT · VTT · 5 MiB
              - generic [ref=e824]:
                - text: لغة الترجمة
                - combobox "Subtitle language" [ref=e825]:
                  - option "العربية" [selected]
                  - option "English"
            - generic [ref=e826]:
              - checkbox "تحليل الفيديو تلقائيًا بعد الرفع وإرسال نسخة إلى Gemini" [checked] [ref=e827]
              - text: تحليل الفيديو تلقائيًا بعد الرفع وإرسال نسخة إلى Gemini
            - paragraph [ref=e828]:
              - text: التحليل يستخدم Gemini المجاني؛ لا تختَر محتوى شخصيًا أو سريًا أو حساسًا.
              - link "تفاصيل معالجة الملفات" [ref=e829] [cursor=pointer]:
                - /url: /privacy
            - generic [ref=e830]:
              - text: "إعادة المحاولة: اختر نفس فيديو الدرس للتحليل أو استكماله"
              - button "Analyze saved lesson video" [disabled] [ref=e831]
          - generic [ref=e832]:
            - button "إلغاء" [ref=e833]
            - button "حفظ الدرس" [ref=e834]
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