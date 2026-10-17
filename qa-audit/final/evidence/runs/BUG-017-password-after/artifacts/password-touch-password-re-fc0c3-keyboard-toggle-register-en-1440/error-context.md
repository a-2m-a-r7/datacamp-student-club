# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: password-touch.spec.ts >> password reveal has a usable touch area and keyboard toggle /register en
- Location: qa-audit\final\tests\password-touch.spec.ts:3:104

# Error details

```
Error: expect(received).toBeGreaterThanOrEqual(expected)

Expected: >= 40
Received:    39.99981689453125
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
          - heading "INITIALIZE_MEMBERSHIP" [level=3] [ref=e445]
          - paragraph [ref=e446]: Join DataCamp Student Club and start learning
        - generic [ref=e447]:
          - button "SIGN UP WITH GOOGLE" [ref=e448]
          - generic [ref=e455]: OR CREATE ACCOUNT WITH EMAIL
          - generic [ref=e460]:
            - generic [ref=e461]:
              - text: Full Name
              - textbox "Ahmed Mansour" [ref=e466]
            - generic [ref=e467]:
              - generic [ref=e468]:
                - generic [ref=e469]: Email Address
                - generic [ref=e470]: UNIVERSITY (.EDU) OR PERSONAL
              - textbox "student@eng.asu.edu.eg or personal@gmail.com" [ref=e475]
            - generic [ref=e476]:
              - text: Strong Password
              - generic [ref=e477]:
                - textbox "••••••••••••" [ref=e481]
                - button "Show password" [ref=e482]
            - generic [ref=e486]:
              - text: Confirm Password
              - textbox "••••••••••••" [ref=e491]
            - button "ENROLL_INTO_NETWORK" [ref=e492]
        - paragraph [ref=e494]:
          - text: ALREADY_IDENTIFIED?
          - link "ACCESS_PORTAL" [ref=e495] [cursor=pointer]:
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
            - paragraph [ref=e508]: Empowering students with data science, AI, and software engineering skills.
          - generic [ref=e509]:
            - heading "Quick Links" [level=4] [ref=e510]
            - list [ref=e511]:
              - listitem [ref=e512]:
                - link "About Us" [ref=e513] [cursor=pointer]:
                  - /url: /about
              - listitem [ref=e514]:
                - link "Courses" [ref=e515] [cursor=pointer]:
                  - /url: /courses
              - listitem [ref=e516]:
                - link "Events" [ref=e517] [cursor=pointer]:
                  - /url: /events
              - listitem [ref=e518]:
                - link "Projects" [ref=e519] [cursor=pointer]:
                  - /url: /projects
              - listitem [ref=e520]:
                - link "Blog" [ref=e521] [cursor=pointer]:
                  - /url: /blog
              - listitem [ref=e522]:
                - link "Staff & Board" [ref=e523] [cursor=pointer]:
                  - /url: /staff
              - listitem [ref=e524]:
                - link "Gallery" [ref=e525] [cursor=pointer]:
                  - /url: /gallery
          - generic [ref=e526]:
            - heading "Support" [level=4] [ref=e527]
            - list [ref=e528]:
              - listitem [ref=e529]:
                - link "FAQ" [ref=e530] [cursor=pointer]:
                  - /url: /faq
              - listitem [ref=e531]:
                - link "Contact" [ref=e532] [cursor=pointer]:
                  - /url: /contact
              - listitem [ref=e533]:
                - link "Privacy Policy" [ref=e534] [cursor=pointer]:
                  - /url: /privacy
              - listitem [ref=e535]:
                - link "Terms of Service" [ref=e536] [cursor=pointer]:
                  - /url: /terms
          - generic [ref=e537]:
            - heading "Contact Info" [level=4] [ref=e538]
            - list [ref=e539]:
              - listitem [ref=e540]:
                - generic [ref=e544]: Not configured
              - listitem [ref=e545]:
                - generic [ref=e548]: Not configured
              - listitem [ref=e549]:
                - generic [ref=e553]: Not configured
        - generic [ref=e554]:
          - paragraph [ref=e555]: © 2026 DataCamp. All rights reserved.
          - generic [ref=e556]:
            - button "العربية" [ref=e557]
            - generic [ref=e562]: "VERSION: 2.5.0-AR"
  - generic [ref=e563]:
    - generic: NEXUS AI MENTOR
    - button "Open AI Mentor" [ref=e564]
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