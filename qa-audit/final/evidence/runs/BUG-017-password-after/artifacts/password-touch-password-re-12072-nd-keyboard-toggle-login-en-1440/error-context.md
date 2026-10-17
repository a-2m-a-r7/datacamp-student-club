# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: password-touch.spec.ts >> password reveal has a usable touch area and keyboard toggle /login en
- Location: qa-audit\final\tests\password-touch.spec.ts:3:104

# Error details

```
Error: expect(received).toBeGreaterThanOrEqual(expected)

Expected: >= 40
Received:    39.7879638671875
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
      - paragraph [ref=e325]: Main Menu
      - link "Home" [ref=e327] [cursor=pointer]:
        - /url: /
      - link "Courses" [ref=e334] [cursor=pointer]:
        - /url: /courses
      - link "Online Compiler" [ref=e340] [cursor=pointer]:
        - /url: /compiler
      - link "Certificates" [ref=e347] [cursor=pointer]:
        - /url: /certificates
      - link "Notifications" [ref=e357] [cursor=pointer]:
        - /url: /notifications
      - link "Events" [ref=e364] [cursor=pointer]:
        - /url: /events
      - link "Projects" [ref=e370] [cursor=pointer]:
        - /url: /projects
      - link "Blog" [ref=e377] [cursor=pointer]:
        - /url: /blog
      - link "Staff & Board" [ref=e384] [cursor=pointer]:
        - /url: /staff
      - link "Gallery" [ref=e393] [cursor=pointer]:
        - /url: /gallery
      - link "About Us" [ref=e401] [cursor=pointer]:
        - /url: /about
      - link "Contact" [ref=e407] [cursor=pointer]:
        - /url: /contact
    - generic [ref=e413]:
      - generic [ref=e414]:
        - button "INITIALIZE_MEMBERSHIP" [ref=e415]
        - button "LOGIN_SYSTEM" [ref=e419]
      - generic [ref=e421]:
        - button "العربية" [ref=e422]
        - button "English" [ref=e424]
      - button [ref=e426]
  - generic [ref=e429]:
    - generic [ref=e431]:
      - button "العربية" [ref=e432]
      - button "EN" [ref=e434]
    - main [ref=e437]:
      - generic [ref=e443]:
        - generic [ref=e444]:
          - heading "ESTABLISH_CONNECTION" [level=3] [ref=e445]
          - paragraph [ref=e446]: Sign in to access your DataCamp Club account
        - generic [ref=e447]:
          - button "CONTINUE WITH GOOGLE" [ref=e448]
          - generic [ref=e455]: OR WITH EMAIL & PASSWORD
          - generic [ref=e460]:
            - generic [ref=e461]:
              - generic [ref=e462]:
                - generic [ref=e463]: Email Address
                - generic [ref=e464]: UNIVERSITY OR PERSONAL
              - textbox "student@eng.asu.edu.eg or personal@gmail.com" [ref=e469]
            - generic [ref=e470]:
              - text: Password
              - generic [ref=e471]:
                - textbox "••••••••••••" [ref=e475]
                - button "Show password" [ref=e476]
            - link "FORGOT_PASSWORD?" [ref=e481] [cursor=pointer]:
              - /url: /forgot-password
            - button "CONNECT_TO_NETWORK" [ref=e482]
          - generic [ref=e483]:
            - generic [ref=e484]: ENCRYPTED CLOUD PORTAL
            - generic [ref=e487]: SUPABASE POSTGRES SECURE
        - paragraph [ref=e489]:
          - text: NEW_MEMBER?
          - link "INITIALIZE_MEMBERSHIP" [ref=e490] [cursor=pointer]:
            - /url: /register
    - contentinfo [ref=e491]:
      - generic [ref=e492]:
        - generic [ref=e493]:
          - generic [ref=e494]:
            - link [ref=e495] [cursor=pointer]:
              - /url: /
              - generic [ref=e496]:
                - generic "DataCamp Official Emblem" [ref=e498]:
                  - img "DataCamp Emblem" [ref=e499]
                - generic "Innovation University Crest" [ref=e501]:
                  - img "Innovation University Crest" [ref=e502]
            - paragraph [ref=e503]: Empowering students with data science, AI, and software engineering skills.
          - generic [ref=e504]:
            - heading "Quick Links" [level=4] [ref=e505]
            - list [ref=e506]:
              - listitem [ref=e507]:
                - link "About Us" [ref=e508] [cursor=pointer]:
                  - /url: /about
              - listitem [ref=e509]:
                - link "Courses" [ref=e510] [cursor=pointer]:
                  - /url: /courses
              - listitem [ref=e511]:
                - link "Events" [ref=e512] [cursor=pointer]:
                  - /url: /events
              - listitem [ref=e513]:
                - link "Projects" [ref=e514] [cursor=pointer]:
                  - /url: /projects
              - listitem [ref=e515]:
                - link "Blog" [ref=e516] [cursor=pointer]:
                  - /url: /blog
              - listitem [ref=e517]:
                - link "Staff & Board" [ref=e518] [cursor=pointer]:
                  - /url: /staff
              - listitem [ref=e519]:
                - link "Gallery" [ref=e520] [cursor=pointer]:
                  - /url: /gallery
          - generic [ref=e521]:
            - heading "Support" [level=4] [ref=e522]
            - list [ref=e523]:
              - listitem [ref=e524]:
                - link "FAQ" [ref=e525] [cursor=pointer]:
                  - /url: /faq
              - listitem [ref=e526]:
                - link "Contact" [ref=e527] [cursor=pointer]:
                  - /url: /contact
              - listitem [ref=e528]:
                - link "Privacy Policy" [ref=e529] [cursor=pointer]:
                  - /url: /privacy
              - listitem [ref=e530]:
                - link "Terms of Service" [ref=e531] [cursor=pointer]:
                  - /url: /terms
          - generic [ref=e532]:
            - heading "Contact Info" [level=4] [ref=e533]
            - list [ref=e534]:
              - listitem [ref=e535]:
                - generic [ref=e539]: Not configured
              - listitem [ref=e540]:
                - generic [ref=e543]: Not configured
              - listitem [ref=e544]:
                - generic [ref=e548]: Not configured
        - generic [ref=e549]:
          - paragraph [ref=e550]: © 2026 DataCamp. All rights reserved.
          - generic [ref=e551]:
            - button "العربية" [ref=e552]
            - generic [ref=e557]: "VERSION: 2.5.0-AR"
  - generic [ref=e558]:
    - generic: NEXUS AI MENTOR
    - button "Open AI Mentor" [ref=e559]
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