# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth-profile.spec.ts >> actual Auth and profile persistence ar
- Location: qa-audit\final\hosted-tests\auth-profile.spec.ts:6:33

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/login\?redirect=/
Received string:  "http://127.0.0.1:3200/login"
Timeout: 20000ms

Call log:
  - Expect "toHaveURL" with timeout 20000ms
    41 × locator resolved to <html lang="ar" dir="rtl" class="lang-ar">…</html>
       - unexpected value "http://127.0.0.1:3200/login"

```

```yaml
- complementary:
  - link "DataCamp Emblem Innovation University Crest":
    - /url: /
    - img "DataCamp Emblem"
    - img "Innovation University Crest"
  - paragraph: القائمة الرئيسية
  - link "الرئيسية":
    - /url: /
  - link "الدورات التدريبية":
    - /url: /courses
  - link "محرر الأكواد":
    - /url: /compiler
  - link "الشهادات المعتمدة":
    - /url: /certificates
  - link "الإشعارات":
    - /url: /notifications
  - link "الفعاليات والورش":
    - /url: /events
  - link "المشاريع":
    - /url: /projects
  - link "المدونة":
    - /url: /blog
  - link "فريق العمل":
    - /url: /staff
  - link "معرض الصور":
    - /url: /gallery
  - link "عن النادي":
    - /url: /about
  - link "اتصل بنا":
    - /url: /contact
  - button "إنشاء حساب جديد"
  - button "تسجيل الدخول"
  - button "العربية"
  - button "English"
  - button
- button "العربية"
- button "EN"
- main:
  - heading "تسجيل الدخول" [level=3]
  - paragraph: سجل دخولك للوصول إلى حسابك في نادي DataCamp
  - button "المتابعة والتسجيل بحساب Google":
    - img
    - text: المتابعة والتسجيل بحساب Google
  - text: أو بالبريد الإلكتروني وكلمة المرور البريد الإلكتروني جامعي أو شخصي
  - textbox "student@eng.asu.edu.eg أو personal@gmail.com"
  - text: كلمة المرور
  - textbox "••••••••••••"
  - button "Show password"
  - link "نسيت كلمة المرور؟":
    - /url: /forgot-password
  - button "دخول إلى المنصة"
  - text: بوابة سحابية موثقة ومحمية SUPABASE POSTGRES SECURE
  - paragraph:
    - text: عضو جديد؟
    - link "إنشاء حساب جديد":
      - /url: /register
- contentinfo:
  - link "DataCamp Emblem Innovation University Crest":
    - /url: /
    - img "DataCamp Emblem"
    - img "Innovation University Crest"
  - paragraph: تمكين الطلاب من إتقان علم البيانات، الذكاء الاصطناعي، وهندسة البرمجيات عبر تعليم تفاعلي وشهادات معتمدة.
  - heading "روابط سريعة" [level=4]
  - list:
    - listitem:
      - link "عن النادي":
        - /url: /about
    - listitem:
      - link "الدورات التدريبية":
        - /url: /courses
    - listitem:
      - link "الفعاليات والورش":
        - /url: /events
    - listitem:
      - link "المشاريع":
        - /url: /projects
    - listitem:
      - link "المدونة":
        - /url: /blog
    - listitem:
      - link "فريق العمل":
        - /url: /staff
    - listitem:
      - link "معرض الصور":
        - /url: /gallery
  - heading "الدعم والمساعدة" [level=4]
  - list:
    - listitem:
      - link "الأسئلة الشائعة":
        - /url: /faq
    - listitem:
      - link "اتصل بنا":
        - /url: /contact
    - listitem:
      - link "سياسة الخصوصية":
        - /url: /privacy
    - listitem:
      - link "الشروط والأحكام":
        - /url: /terms
  - heading "معلومات التواصل" [level=4]
  - list:
    - listitem: غير محدد
    - listitem: غير محدد
    - listitem: غير محدد
  - paragraph: جميع الحقوق محفوظة © 2026 نادي داتا كامب الطلابي • جامعة الابتكار.
  - button "English"
  - text: "VERSION: 2.5.0-AR"
- text: مرشد NEXUS الذكي
- button "فتح مرشد الذكاء الاصطناعي NEXUS"
- region "Notifications alt+T"
```

# Test source

```ts
  1  | import {test,expect} from '@playwright/test';import fs from 'node:fs';import {createClient} from '@supabase/supabase-js';
  2  | const cfg=JSON.parse(fs.readFileSync('qa-audit/.runtime/final-hosted/config.json','utf8'));
  3  | if(cfg.url!=='https://kcqgnkfdpfibwkrghubl.supabase.co')throw Error('Unexpected QA target');
  4  | const account=cfg.accounts.find(a=>a.kind==='member');
  5  | const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jqz8AAAAASUVORK5CYII=','base64');
  6  | for(const locale of ['en','ar'])test('actual Auth and profile persistence '+locale,async({page,context})=>{
  7  |  // Never enable traces/HAR/storageState: these sessions contain real QA tokens.
  8  |  await context.route('**/*',route=>{const u=new URL(route.request().url());return ['127.0.0.1','localhost','kcqgnkfdpfibwkrghubl.supabase.co','cdn.jsdelivr.net','fonts.googleapis.com','fonts.gstatic.com'].includes(u.hostname)?route.continue():route.abort();});
  9  |  await page.addInitScript(l=>localStorage.setItem('datacamp_language',l),locale);
> 10 |  await page.goto('/profile');await expect(page).toHaveURL(/\/login\?redirect=/);
     |                                                 ^ Error: expect(page).toHaveURL(expected) failed
  11 |  await page.locator('input[type=email]').fill(account.email);await page.locator('input[type=password]').fill(account.password);
  12 |  await page.locator('form button[type=submit]').click();await expect(page).toHaveURL(/\/profile$/);
  13 |  const isAr=locale==='ar';
  14 |  const fullName=page.getByLabel('Full name',{exact:true});
  15 |  await expect(fullName).toBeVisible();
  16 |  const name='QA_TEST_متعلم_'+locale+'_'+test.info().project.name;await fullName.fill(name);
  17 |  await page.getByLabel('Phone number',{exact:true}).fill('');
  18 |  const chooser=page.waitForEvent('filechooser');await page.getByRole('button',{name:'IMPORT_FROM_DEVICE',exact:true}).click();
  19 |  await(await chooser).setFiles({name:'QA_TEST_browser.png',mimeType:'image/png',buffer:png});
  20 |  await page.getByRole('button',{name:isAr?'حفظ التعديلات':'SAVE_CHANGES',exact:true}).click();
  21 |  await expect(page.getByText('Profile updated successfully in database',{exact:true})).toBeVisible();
  22 |  await page.reload();await expect(fullName).toHaveValue(name);
  23 |  const verifier=createClient(cfg.url,cfg.publishableKey,{auth:{persistSession:false,autoRefreshToken:false}});
  24 |  try{
  25 |   const signed=await verifier.auth.signInWithPassword({email:account.email,password:account.password});expect(signed.error).toBeNull();
  26 |   const row=await verifier.from('profiles').select('full_name,avatar_url,photo_url').eq('id',account.id).single();expect(row.error).toBeNull();expect(row.data!.full_name).toBe(name);expect(row.data!.avatar_url).toBe(row.data!.photo_url);
  27 |   const url=new URL(row.data!.avatar_url);expect(url.hostname).toBe('kcqgnkfdpfibwkrghubl.supabase.co');expect(url.pathname).toContain('/avatars/'+account.id+'/');
  28 |   const bytes=await fetch(url);expect(bytes.status).toBe(200);expect(Buffer.from(await bytes.arrayBuffer())).toEqual(png);
  29 |  }finally{await verifier.auth.signOut({scope:'local'});await verifier.removeAllChannels();}
  30 |  const isolatedTab=await context.newPage();await isolatedTab.goto('/profile');await expect(isolatedTab).toHaveURL(/\/login\?redirect=/);await isolatedTab.close();
  31 |  await page.goto('/admin/users');await expect(page).toHaveURL(/\/dashboard$/);
  32 | });
  33 | 
```