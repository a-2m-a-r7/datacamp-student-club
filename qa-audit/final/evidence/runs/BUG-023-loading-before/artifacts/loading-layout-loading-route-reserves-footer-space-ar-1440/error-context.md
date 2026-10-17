# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: loading-layout.spec.ts >> loading route reserves footer space ar 1440
- Location: qa-audit\final\production-tests\loading-layout.spec.ts:2:69

# Error details

```
Error: expect(received).toBeGreaterThanOrEqual(expected)

Expected: >= 899
Received:    514
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
    - generic [ref=e324]:
      - paragraph [ref=e325]: القائمة الرئيسية
      - link "الرئيسية" [ref=e327] [cursor=pointer]:
        - /url: /
      - link "الدورات التدريبية" [ref=e334] [cursor=pointer]:
        - /url: /courses
      - link "محرر الأكواد" [ref=e340] [cursor=pointer]:
        - /url: /compiler
      - link "الشهادات المعتمدة" [ref=e347] [cursor=pointer]:
        - /url: /certificates
      - link "الإشعارات" [ref=e357] [cursor=pointer]:
        - /url: /notifications
      - link "الفعاليات والورش" [ref=e364] [cursor=pointer]:
        - /url: /events
      - link "المشاريع" [ref=e370] [cursor=pointer]:
        - /url: /projects
      - link "المدونة" [ref=e377] [cursor=pointer]:
        - /url: /blog
      - link "فريق العمل" [ref=e384] [cursor=pointer]:
        - /url: /staff
      - link "معرض الصور" [ref=e393] [cursor=pointer]:
        - /url: /gallery
      - link "عن النادي" [ref=e401] [cursor=pointer]:
        - /url: /about
      - link "اتصل بنا" [ref=e407] [cursor=pointer]:
        - /url: /contact
    - generic [ref=e413]:
      - generic [ref=e414]:
        - button "إنشاء حساب جديد" [ref=e415]
        - button "تسجيل الدخول" [ref=e419]
      - generic [ref=e421]:
        - button "العربية" [ref=e422]
        - button "English" [ref=e424]
      - button [ref=e426]
  - generic [ref=e429]:
    - generic [ref=e431]:
      - button "العربية" [ref=e432]
      - button "EN" [ref=e435]
    - main [ref=e437]:
      - generic [ref=e439]:
        - generic [ref=e445]:
          - generic [ref=e446]:
            - generic [ref=e447]: النادي الأكاديمي المعتمد • جامعة الابتكار
            - heading "مستقبل علم البيانات والذكاء الاصطناعي يبدأ هنا" [level=1] [ref=e448]
          - paragraph [ref=e449]: انضم إلى مجتمع طلابي نخبوي يتقن هندسة البيانات، والذكاء الاصطناعي، ومحرر الأكواد التفاعلي مع شهادات أكاديمية معتمدة.
          - generic [ref=e450]:
            - link [ref=e451] [cursor=pointer]:
              - /url: /register
              - button "إنشاء حساب جديد • انضم الآن" [ref=e452]
            - link [ref=e455] [cursor=pointer]:
              - /url: /courses
              - button "استكشف الدورات" [ref=e456]
            - link [ref=e457] [cursor=pointer]:
              - /url: /compiler
              - button "محرر الأكواد" [ref=e458]
        - generic [ref=e460]:
          - generic [ref=e461]:
            - generic [ref=e469]: "4"
            - generic [ref=e470]: عضو مسجل
          - generic [ref=e471]:
            - generic [ref=e476]: "4"
            - generic [ref=e477]: فعالية وورشة
          - generic [ref=e478]:
            - generic [ref=e484]: "0"
            - generic [ref=e485]: مشروع منجز
          - generic [ref=e486]:
            - generic [ref=e492]: "0"
            - generic [ref=e493]: شهادة معتمدة
        - generic [ref=e494]:
          - generic [ref=e495]:
            - heading "المسارات التكنولوجية الأساسية" [level=2] [ref=e496]
            - paragraph [ref=e497]: نركز على التقنيات الأكثر تأثيراً التي تصنع مستقبل سوق العمل التكنولوجي اليوم.
          - generic [ref=e498]:
            - generic [ref=e503]:
              - heading "علم البيانات والتحليل" [level=3] [ref=e509]
              - paragraph [ref=e510]: إتقان بايثون، ومكتبات Pandas و NumPy وبناء النماذج الإحصائية مع ورش تدريبية متخصصة.
            - generic [ref=e516]:
              - heading "الذكاء الاصطناعي وتعلم الآلة" [level=3] [ref=e521]
              - paragraph [ref=e522]: غوص عميق في الشبكات العصبية، ورؤية الحاسوب، ومعالجة اللغات الطبيعية باستخدام PyTorch.
            - generic [ref=e528]:
              - heading "هندسة البرمجيات والأنظمة" [level=3] [ref=e532]
              - paragraph [ref=e533]: بناء تطبيقات متكاملة واكتساب أفضل ممارسات كتابة الكود النظيف وإدارة المشاريع.
        - generic [ref=e538]:
          - heading "هل أنت مستعد لتطوير مهاراتك البرمجية؟" [level=2] [ref=e539]
          - paragraph [ref=e540]: انضم إلى مجتمع الطلاب للتعلم والبناء معاً في جامعة الابتكار. العضوية مجانية ومفتوحة لجميع الطلاب.
          - link [ref=e541] [cursor=pointer]:
            - /url: /register
            - button "انضم للنادي الآن" [ref=e542]
    - contentinfo [ref=e543]:
      - generic [ref=e544]:
        - generic [ref=e545]:
          - generic [ref=e546]:
            - link [ref=e547] [cursor=pointer]:
              - /url: /
              - generic [ref=e548]:
                - generic "DataCamp Official Emblem" [ref=e550]:
                  - img "DataCamp Emblem" [ref=e551]
                - generic "Innovation University Crest" [ref=e553]:
                  - img "Innovation University Crest" [ref=e554]
            - paragraph [ref=e555]: تمكين الطلاب من إتقان علم البيانات، الذكاء الاصطناعي، وهندسة البرمجيات عبر تعليم تفاعلي وشهادات معتمدة.
          - generic [ref=e556]:
            - heading "روابط سريعة" [level=4] [ref=e557]
            - list [ref=e558]:
              - listitem [ref=e559]:
                - link "عن النادي" [ref=e560] [cursor=pointer]:
                  - /url: /about
              - listitem [ref=e561]:
                - link "الدورات التدريبية" [ref=e562] [cursor=pointer]:
                  - /url: /courses
              - listitem [ref=e563]:
                - link "الفعاليات والورش" [ref=e564] [cursor=pointer]:
                  - /url: /events
              - listitem [ref=e565]:
                - link "المشاريع" [ref=e566] [cursor=pointer]:
                  - /url: /projects
              - listitem [ref=e567]:
                - link "المدونة" [ref=e568] [cursor=pointer]:
                  - /url: /blog
              - listitem [ref=e569]:
                - link "فريق العمل" [ref=e570] [cursor=pointer]:
                  - /url: /staff
              - listitem [ref=e571]:
                - link "معرض الصور" [ref=e572] [cursor=pointer]:
                  - /url: /gallery
          - generic [ref=e573]:
            - heading "الدعم والمساعدة" [level=4] [ref=e574]
            - list [ref=e575]:
              - listitem [ref=e576]:
                - link "الأسئلة الشائعة" [ref=e577] [cursor=pointer]:
                  - /url: /faq
              - listitem [ref=e578]:
                - link "اتصل بنا" [ref=e579] [cursor=pointer]:
                  - /url: /contact
              - listitem [ref=e580]:
                - link "سياسة الخصوصية" [ref=e581] [cursor=pointer]:
                  - /url: /privacy
              - listitem [ref=e582]:
                - link "الشروط والأحكام" [ref=e583] [cursor=pointer]:
                  - /url: /terms
          - generic [ref=e584]:
            - heading "معلومات التواصل" [level=4] [ref=e585]
            - list [ref=e586]:
              - listitem [ref=e587]:
                - generic [ref=e591]: غير محدد
              - listitem [ref=e592]:
                - generic [ref=e595]: غير محدد
              - listitem [ref=e596]:
                - generic [ref=e600]: غير محدد
        - generic [ref=e601]:
          - paragraph [ref=e602]: جميع الحقوق محفوظة © 2026 نادي داتا كامب الطلابي • جامعة الابتكار.
          - generic [ref=e603]:
            - button "English" [ref=e604]
            - generic [ref=e609]: "VERSION: 2.5.0-AR"
  - generic [ref=e610]:
    - generic: مرشد NEXUS الذكي
    - button "فتح مرشد الذكاء الاصطناعي NEXUS" [ref=e611]
  - region "Notifications alt+T"
```

# Test source

```ts
  1  | import {test,expect} from '@playwright/test';
  2  | for(const width of [1440,768,375])for(const language of ['en','ar'])test('loading route reserves footer space '+language+' '+width,async({page,context})=>{
  3  |  await page.setViewportSize({width,height:900});await page.addInitScript(l=>localStorage.setItem('datacamp_language',l),language);
  4  |  await context.route('**/*',r=>{const u=new URL(r.request().url());return ['127.0.0.1','localhost','kcqgnkfdpfibwkrghubl.supabase.co','fonts.googleapis.com','fonts.gstatic.com'].includes(u.hostname)?r.continue():r.abort();});
  5  |  let release!:()=>void;const held=new Promise<void>(resolve=>release=resolve);
  6  |  await page.route('**/assets/Home-*.js',async route=>{await held;await route.continue();});
  7  |  try{
  8  |   await page.goto('/',{waitUntil:'domcontentloaded'});await expect(page.getByText('SYNCING_NEURAL_INTERFACE...',{exact:true})).toBeVisible();
> 9  |   const footer=await page.getByRole('contentinfo').boundingBox();expect(footer).not.toBeNull();expect(footer!.y).toBeGreaterThanOrEqual(899);
     |                                                                                                                  ^ Error: expect(received).toBeGreaterThanOrEqual(expected)
  10 |   await page.screenshot({path:test.info().outputPath('QA_TEST_loading_'+language+'_'+width+'.png')});
  11 |  }finally{release();}
  12 |  await expect(page.getByText('SYNCING_NEURAL_INTERFACE...',{exact:true})).toHaveCount(0);await expect(page.getByRole('main')).toBeVisible();
  13 | });
  14 | 
```