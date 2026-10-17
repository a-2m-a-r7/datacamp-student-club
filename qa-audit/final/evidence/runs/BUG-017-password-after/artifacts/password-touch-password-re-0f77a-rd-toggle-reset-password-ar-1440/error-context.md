# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: password-touch.spec.ts >> password reveal has a usable touch area and keyboard toggle /reset-password ar
- Location: qa-audit\final\tests\password-touch.spec.ts:3:104

# Error details

```
Error: expect(received).toBeGreaterThanOrEqual(expected)

Expected: >= 40
Received:    39.941070556640625
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
      - link "كورساتي" [ref=e340] [cursor=pointer]:
        - /url: /my-courses
      - link "محرر الأكواد" [ref=e347] [cursor=pointer]:
        - /url: /compiler
      - link "الشهادات المعتمدة" [ref=e354] [cursor=pointer]:
        - /url: /certificates
      - link "الإشعارات" [ref=e364] [cursor=pointer]:
        - /url: /notifications
      - link "الفعاليات والورش" [ref=e371] [cursor=pointer]:
        - /url: /events
      - link "المشاريع" [ref=e377] [cursor=pointer]:
        - /url: /projects
      - link "المدونة" [ref=e384] [cursor=pointer]:
        - /url: /blog
      - link "فريق العمل" [ref=e391] [cursor=pointer]:
        - /url: /staff
      - link "معرض الصور" [ref=e400] [cursor=pointer]:
        - /url: /gallery
      - link "عن النادي" [ref=e408] [cursor=pointer]:
        - /url: /about
      - link "اتصل بنا" [ref=e414] [cursor=pointer]:
        - /url: /contact
    - generic [ref=e420]:
      - generic [ref=e421]:
        - link "Q QA_TEST_MEMBER عضو" [ref=e422] [cursor=pointer]:
          - /url: /profile
          - generic [ref=e423]: Q
          - generic [ref=e425]:
            - paragraph [ref=e426]: QA_TEST_MEMBER
            - paragraph [ref=e427]: عضو
        - button "تسجيل الخروج" [ref=e428]
      - generic [ref=e434]:
        - button "العربية" [ref=e435]
        - button "English" [ref=e437]
      - button [ref=e439]
  - generic [ref=e442]:
    - generic [ref=e444]:
      - button "العربية" [ref=e445]
      - button "EN" [ref=e448]
    - main [ref=e450]:
      - generic [ref=e455]:
        - generic [ref=e456]:
          - heading "إعادة تعيين كلمة المرور" [level=3] [ref=e460]
          - paragraph [ref=e461]: أدخل كلمة المرور الجديدة لحسابك
        - generic [ref=e463]:
          - generic [ref=e464]:
            - text: كلمة المرور الجديدة
            - generic [ref=e465]:
              - textbox "••••••••" [ref=e466]
              - button "إظهار كلمة المرور" [ref=e467]
          - generic [ref=e471]:
            - text: تأكيد كلمة المرور
            - textbox "••••••••" [ref=e472]
          - button "تحديث كلمة المرور" [ref=e473]
    - contentinfo [ref=e474]:
      - generic [ref=e475]:
        - generic [ref=e476]:
          - generic [ref=e477]:
            - link [ref=e478] [cursor=pointer]:
              - /url: /
              - generic [ref=e479]:
                - generic "DataCamp Official Emblem" [ref=e481]:
                  - img "DataCamp Emblem" [ref=e482]
                - generic "Innovation University Crest" [ref=e484]:
                  - img "Innovation University Crest" [ref=e485]
            - paragraph [ref=e486]: تمكين الطلاب من إتقان علم البيانات، الذكاء الاصطناعي، وهندسة البرمجيات عبر تعليم تفاعلي وشهادات معتمدة.
          - generic [ref=e487]:
            - heading "روابط سريعة" [level=4] [ref=e488]
            - list [ref=e489]:
              - listitem [ref=e490]:
                - link "عن النادي" [ref=e491] [cursor=pointer]:
                  - /url: /about
              - listitem [ref=e492]:
                - link "الدورات التدريبية" [ref=e493] [cursor=pointer]:
                  - /url: /courses
              - listitem [ref=e494]:
                - link "الفعاليات والورش" [ref=e495] [cursor=pointer]:
                  - /url: /events
              - listitem [ref=e496]:
                - link "المشاريع" [ref=e497] [cursor=pointer]:
                  - /url: /projects
              - listitem [ref=e498]:
                - link "المدونة" [ref=e499] [cursor=pointer]:
                  - /url: /blog
              - listitem [ref=e500]:
                - link "فريق العمل" [ref=e501] [cursor=pointer]:
                  - /url: /staff
              - listitem [ref=e502]:
                - link "معرض الصور" [ref=e503] [cursor=pointer]:
                  - /url: /gallery
          - generic [ref=e504]:
            - heading "الدعم والمساعدة" [level=4] [ref=e505]
            - list [ref=e506]:
              - listitem [ref=e507]:
                - link "الأسئلة الشائعة" [ref=e508] [cursor=pointer]:
                  - /url: /faq
              - listitem [ref=e509]:
                - link "اتصل بنا" [ref=e510] [cursor=pointer]:
                  - /url: /contact
              - listitem [ref=e511]:
                - link "سياسة الخصوصية" [ref=e512] [cursor=pointer]:
                  - /url: /privacy
              - listitem [ref=e513]:
                - link "الشروط والأحكام" [ref=e514] [cursor=pointer]:
                  - /url: /terms
          - generic [ref=e515]:
            - heading "معلومات التواصل" [level=4] [ref=e516]
            - list [ref=e517]:
              - listitem [ref=e518]:
                - generic [ref=e522]: غير محدد
              - listitem [ref=e523]:
                - generic [ref=e526]: غير محدد
              - listitem [ref=e527]:
                - generic [ref=e531]: غير محدد
        - generic [ref=e532]:
          - paragraph [ref=e533]: جميع الحقوق محفوظة © 2026 نادي داتا كامب الطلابي • جامعة الابتكار.
          - generic [ref=e534]:
            - button "English" [ref=e535]
            - generic [ref=e540]: "VERSION: 2.5.0-AR"
  - generic [ref=e541]:
    - generic: مرشد NEXUS الذكي
    - button "فتح مرشد الذكاء الاصطناعي NEXUS" [ref=e542]
  - region "Notifications alt+T"
```

# Test source

```ts
  1  | import {test,expect} from '@playwright/test';
  2  | import {platform,member} from '../../fix-tests/persisted-platform';
  3  | for(const language of ['en','ar'] as const)for(const route of ['/login','/register','/reset-password'])test(`password reveal has a usable touch area and keyboard toggle ${route} ${language}`,async({page},info)=>{
  4  |  const app=await platform();try{
  5  |   await app.connect(page,route==='/reset-password'?member:null,language);await page.goto(route);
  6  |   const field=page.locator('form input[type=password]').first();await expect(field).toBeVisible();
  7  |   const toggle=page.getByRole('button',{name:/^(Show password|إظهار كلمة المرور)$/});await expect(toggle).toBeVisible();
> 8  |   const box=await toggle.boundingBox();expect(box!.width).toBeGreaterThanOrEqual(40);expect(box!.height).toBeGreaterThanOrEqual(40);
     |                                                           ^ Error: expect(received).toBeGreaterThanOrEqual(expected)
  9  |   await field.fill('QA_TEST_Str0ng!_عربي');await toggle.focus();await toggle.press('Space');
  10 |   const hide=page.getByRole('button',{name:language==='ar'?'إخفاء كلمة المرور':'Hide password',exact:true});await expect(hide).toBeVisible();
  11 |   const shown=page.locator('form input[type=text]');
  12 |   expect(await shown.evaluateAll(inputs=>inputs.some((input:HTMLInputElement)=>input.value==='QA_TEST_Str0ng!_عربي'))).toBe(true);
  13 |   await hide.press('Enter');await expect(page.locator('form input[type=password]').first()).toHaveValue('QA_TEST_Str0ng!_عربي');
  14 |   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  15 |   if(route==='/login')await page.screenshot({path:info.outputPath('password-touch-'+language+'.png')});
  16 |  }finally{await app.db.close();}
  17 | });
  18 | 
```