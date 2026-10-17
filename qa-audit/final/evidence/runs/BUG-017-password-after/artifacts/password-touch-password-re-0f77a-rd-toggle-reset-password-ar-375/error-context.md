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
Received:    39.833160400390625
```

# Page snapshot

```yaml
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
      - generic [ref=e335]:
        - generic [ref=e336]:
          - heading "إعادة تعيين كلمة المرور" [level=3] [ref=e340]
          - paragraph [ref=e341]: أدخل كلمة المرور الجديدة لحسابك
        - generic [ref=e343]:
          - generic [ref=e344]:
            - text: كلمة المرور الجديدة
            - generic [ref=e345]:
              - textbox "••••••••" [ref=e346]
              - button "إظهار كلمة المرور" [ref=e347]
          - generic [ref=e351]:
            - text: تأكيد كلمة المرور
            - textbox "••••••••" [ref=e352]
          - button "تحديث كلمة المرور" [ref=e353]
    - contentinfo [ref=e354]:
      - generic [ref=e355]:
        - generic [ref=e356]:
          - generic [ref=e357]:
            - link [ref=e358] [cursor=pointer]:
              - /url: /
              - generic [ref=e359]:
                - generic "DataCamp Official Emblem" [ref=e361]:
                  - img "DataCamp Emblem" [ref=e362]
                - generic "Innovation University Crest" [ref=e364]:
                  - img "Innovation University Crest" [ref=e365]
            - paragraph [ref=e366]: تمكين الطلاب من إتقان علم البيانات، الذكاء الاصطناعي، وهندسة البرمجيات عبر تعليم تفاعلي وشهادات معتمدة.
          - generic [ref=e367]:
            - heading "روابط سريعة" [level=4] [ref=e368]
            - list [ref=e369]:
              - listitem [ref=e370]:
                - link "عن النادي" [ref=e371] [cursor=pointer]:
                  - /url: /about
              - listitem [ref=e372]:
                - link "الدورات التدريبية" [ref=e373] [cursor=pointer]:
                  - /url: /courses
              - listitem [ref=e374]:
                - link "الفعاليات والورش" [ref=e375] [cursor=pointer]:
                  - /url: /events
              - listitem [ref=e376]:
                - link "المشاريع" [ref=e377] [cursor=pointer]:
                  - /url: /projects
              - listitem [ref=e378]:
                - link "المدونة" [ref=e379] [cursor=pointer]:
                  - /url: /blog
              - listitem [ref=e380]:
                - link "فريق العمل" [ref=e381] [cursor=pointer]:
                  - /url: /staff
              - listitem [ref=e382]:
                - link "معرض الصور" [ref=e383] [cursor=pointer]:
                  - /url: /gallery
          - generic [ref=e384]:
            - heading "الدعم والمساعدة" [level=4] [ref=e385]
            - list [ref=e386]:
              - listitem [ref=e387]:
                - link "الأسئلة الشائعة" [ref=e388] [cursor=pointer]:
                  - /url: /faq
              - listitem [ref=e389]:
                - link "اتصل بنا" [ref=e390] [cursor=pointer]:
                  - /url: /contact
              - listitem [ref=e391]:
                - link "سياسة الخصوصية" [ref=e392] [cursor=pointer]:
                  - /url: /privacy
              - listitem [ref=e393]:
                - link "الشروط والأحكام" [ref=e394] [cursor=pointer]:
                  - /url: /terms
          - generic [ref=e395]:
            - heading "معلومات التواصل" [level=4] [ref=e396]
            - list [ref=e397]:
              - listitem [ref=e398]:
                - generic [ref=e402]: غير محدد
              - listitem [ref=e403]:
                - generic [ref=e406]: غير محدد
              - listitem [ref=e407]:
                - generic [ref=e411]: غير محدد
        - generic [ref=e412]:
          - paragraph [ref=e413]: جميع الحقوق محفوظة © 2026 نادي داتا كامب الطلابي • جامعة الابتكار.
          - generic [ref=e414]:
            - button "English" [ref=e415]
            - generic [ref=e420]: "VERSION: 2.5.0-AR"
  - button "فتح مرشد الذكاء الاصطناعي NEXUS" [ref=e422]
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