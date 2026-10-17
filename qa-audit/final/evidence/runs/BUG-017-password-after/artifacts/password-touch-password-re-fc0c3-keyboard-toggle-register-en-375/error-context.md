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
Received:    39.998809814453125
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
      - generic [ref=e336]:
        - generic [ref=e337]:
          - heading "INITIALIZE_MEMBERSHIP" [level=3] [ref=e338]
          - paragraph [ref=e339]: Join DataCamp Student Club and start learning
        - generic [ref=e340]:
          - button "SIGN UP WITH GOOGLE" [ref=e341]
          - generic [ref=e348]: OR CREATE ACCOUNT WITH EMAIL
          - generic [ref=e353]:
            - generic [ref=e354]:
              - text: Full Name
              - textbox "Ahmed Mansour" [ref=e359]
            - generic [ref=e360]:
              - generic [ref=e361]:
                - generic [ref=e362]: Email Address
                - generic [ref=e363]: UNIVERSITY (.EDU) OR PERSONAL
              - textbox "student@eng.asu.edu.eg or personal@gmail.com" [ref=e368]
            - generic [ref=e369]:
              - text: Strong Password
              - generic [ref=e370]:
                - textbox "••••••••••••" [ref=e374]
                - button "Show password" [ref=e375]
            - generic [ref=e379]:
              - text: Confirm Password
              - textbox "••••••••••••" [ref=e384]
            - button "ENROLL_INTO_NETWORK" [ref=e385]
        - paragraph [ref=e387]:
          - text: ALREADY_IDENTIFIED?
          - link "ACCESS_PORTAL" [ref=e388] [cursor=pointer]:
            - /url: /login
    - contentinfo [ref=e389]:
      - generic [ref=e390]:
        - generic [ref=e391]:
          - generic [ref=e392]:
            - link [ref=e393] [cursor=pointer]:
              - /url: /
              - generic [ref=e394]:
                - generic "DataCamp Official Emblem" [ref=e396]:
                  - img "DataCamp Emblem" [ref=e397]
                - generic "Innovation University Crest" [ref=e399]:
                  - img "Innovation University Crest" [ref=e400]
            - paragraph [ref=e401]: Empowering students with data science, AI, and software engineering skills.
          - generic [ref=e402]:
            - heading "Quick Links" [level=4] [ref=e403]
            - list [ref=e404]:
              - listitem [ref=e405]:
                - link "About Us" [ref=e406] [cursor=pointer]:
                  - /url: /about
              - listitem [ref=e407]:
                - link "Courses" [ref=e408] [cursor=pointer]:
                  - /url: /courses
              - listitem [ref=e409]:
                - link "Events" [ref=e410] [cursor=pointer]:
                  - /url: /events
              - listitem [ref=e411]:
                - link "Projects" [ref=e412] [cursor=pointer]:
                  - /url: /projects
              - listitem [ref=e413]:
                - link "Blog" [ref=e414] [cursor=pointer]:
                  - /url: /blog
              - listitem [ref=e415]:
                - link "Staff & Board" [ref=e416] [cursor=pointer]:
                  - /url: /staff
              - listitem [ref=e417]:
                - link "Gallery" [ref=e418] [cursor=pointer]:
                  - /url: /gallery
          - generic [ref=e419]:
            - heading "Support" [level=4] [ref=e420]
            - list [ref=e421]:
              - listitem [ref=e422]:
                - link "FAQ" [ref=e423] [cursor=pointer]:
                  - /url: /faq
              - listitem [ref=e424]:
                - link "Contact" [ref=e425] [cursor=pointer]:
                  - /url: /contact
              - listitem [ref=e426]:
                - link "Privacy Policy" [ref=e427] [cursor=pointer]:
                  - /url: /privacy
              - listitem [ref=e428]:
                - link "Terms of Service" [ref=e429] [cursor=pointer]:
                  - /url: /terms
          - generic [ref=e430]:
            - heading "Contact Info" [level=4] [ref=e431]
            - list [ref=e432]:
              - listitem [ref=e433]:
                - generic [ref=e437]: Not configured
              - listitem [ref=e438]:
                - generic [ref=e441]: Not configured
              - listitem [ref=e442]:
                - generic [ref=e446]: Not configured
        - generic [ref=e447]:
          - paragraph [ref=e448]: © 2026 DataCamp. All rights reserved.
          - generic [ref=e449]:
            - button "العربية" [ref=e450]
            - generic [ref=e455]: "VERSION: 2.5.0-AR"
  - button "Open AI Mentor" [ref=e457]
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