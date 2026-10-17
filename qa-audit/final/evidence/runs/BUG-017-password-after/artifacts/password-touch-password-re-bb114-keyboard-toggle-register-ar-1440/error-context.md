# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: password-touch.spec.ts >> password reveal has a usable touch area and keyboard toggle /register ar
- Location: qa-audit\final\tests\password-touch.spec.ts:3:104

# Error details

```
Error: expect(received).toBeGreaterThanOrEqual(expected)

Expected: >= 40
Received:    39.999359130859375
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
      - generic [ref=e443]:
        - generic [ref=e444]:
          - heading "إنشاء حساب عضوية" [level=3] [ref=e445]
          - paragraph [ref=e446]: انضم لنادي DataCamp وابدأ التعلم
        - generic [ref=e447]:
          - button "التسجيل السريع بحساب Google" [ref=e448]
          - generic [ref=e455]: أو بإنشاء حساب جديد بالبريد الإلكتروني
          - generic [ref=e460]:
            - generic [ref=e461]:
              - text: الاسم بالكامل
              - textbox "أحمد منصور" [ref=e466]
            - generic [ref=e467]:
              - generic [ref=e468]:
                - generic [ref=e469]: البريد الإلكتروني
                - generic [ref=e470]: جامعي أو شخصي
              - textbox "student@eng.asu.edu.eg أو personal@gmail.com" [ref=e475]
            - generic [ref=e476]:
              - text: كلمة المرور القوية
              - generic [ref=e477]:
                - textbox "••••••••••••" [ref=e481]
                - button "إظهار كلمة المرور" [ref=e482]
            - generic [ref=e486]:
              - text: تأكيد كلمة المرور
              - textbox "••••••••••••" [ref=e491]
            - button "تسجيل العضوية بالمنصة" [ref=e492]
        - paragraph [ref=e494]:
          - text: لديك حساب بالفعل؟
          - link "تسجيل الدخول" [ref=e495] [cursor=pointer]:
            - /url: /login
    - contentinfo [ref=e496]:
      - generic [ref=e497]:
        - generic [ref=e498]:
          - generic [ref=e499]:
            - link [ref=e500] [cursor=pointer]:
              - /url: /
              - generic [ref=e501]:
                - generic "DataCamp Official Emblem" [ref=e503]:
                  - img "DataCamp Emblem" [ref=e504]
                - generic "Innovation University Crest" [ref=e506]:
                  - img "Innovation University Crest" [ref=e507]
            - paragraph [ref=e508]: تمكين الطلاب من إتقان علم البيانات، الذكاء الاصطناعي، وهندسة البرمجيات عبر تعليم تفاعلي وشهادات معتمدة.
          - generic [ref=e509]:
            - heading "روابط سريعة" [level=4] [ref=e510]
            - list [ref=e511]:
              - listitem [ref=e512]:
                - link "عن النادي" [ref=e513] [cursor=pointer]:
                  - /url: /about
              - listitem [ref=e514]:
                - link "الدورات التدريبية" [ref=e515] [cursor=pointer]:
                  - /url: /courses
              - listitem [ref=e516]:
                - link "الفعاليات والورش" [ref=e517] [cursor=pointer]:
                  - /url: /events
              - listitem [ref=e518]:
                - link "المشاريع" [ref=e519] [cursor=pointer]:
                  - /url: /projects
              - listitem [ref=e520]:
                - link "المدونة" [ref=e521] [cursor=pointer]:
                  - /url: /blog
              - listitem [ref=e522]:
                - link "فريق العمل" [ref=e523] [cursor=pointer]:
                  - /url: /staff
              - listitem [ref=e524]:
                - link "معرض الصور" [ref=e525] [cursor=pointer]:
                  - /url: /gallery
          - generic [ref=e526]:
            - heading "الدعم والمساعدة" [level=4] [ref=e527]
            - list [ref=e528]:
              - listitem [ref=e529]:
                - link "الأسئلة الشائعة" [ref=e530] [cursor=pointer]:
                  - /url: /faq
              - listitem [ref=e531]:
                - link "اتصل بنا" [ref=e532] [cursor=pointer]:
                  - /url: /contact
              - listitem [ref=e533]:
                - link "سياسة الخصوصية" [ref=e534] [cursor=pointer]:
                  - /url: /privacy
              - listitem [ref=e535]:
                - link "الشروط والأحكام" [ref=e536] [cursor=pointer]:
                  - /url: /terms
          - generic [ref=e537]:
            - heading "معلومات التواصل" [level=4] [ref=e538]
            - list [ref=e539]:
              - listitem [ref=e540]:
                - generic [ref=e544]: غير محدد
              - listitem [ref=e545]:
                - generic [ref=e548]: غير محدد
              - listitem [ref=e549]:
                - generic [ref=e553]: غير محدد
        - generic [ref=e554]:
          - paragraph [ref=e555]: جميع الحقوق محفوظة © 2026 نادي داتا كامب الطلابي • جامعة الابتكار.
          - generic [ref=e556]:
            - button "English" [ref=e557]
            - generic [ref=e562]: "VERSION: 2.5.0-AR"
  - generic [ref=e563]:
    - generic: مرشد NEXUS الذكي
    - button "فتح مرشد الذكاء الاصطناعي NEXUS" [ref=e564]
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