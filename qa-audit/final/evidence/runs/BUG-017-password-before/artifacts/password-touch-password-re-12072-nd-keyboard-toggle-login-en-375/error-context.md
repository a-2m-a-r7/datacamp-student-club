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
Received:    15.947723388671875
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
          - heading "ESTABLISH_CONNECTION" [level=3] [ref=e338]
          - paragraph [ref=e339]: Sign in to access your DataCamp Club account
        - generic [ref=e340]:
          - button "CONTINUE WITH GOOGLE" [ref=e341]
          - generic [ref=e348]: OR WITH EMAIL & PASSWORD
          - generic [ref=e353]:
            - generic [ref=e354]:
              - generic [ref=e355]:
                - generic [ref=e356]: Email Address
                - generic [ref=e357]: UNIVERSITY OR PERSONAL
              - textbox "student@eng.asu.edu.eg or personal@gmail.com" [ref=e362]
            - generic [ref=e363]:
              - text: Password
              - generic [ref=e364]:
                - textbox "••••••••••••" [ref=e368]
                - button "Show password" [ref=e369]
            - link "FORGOT_PASSWORD?" [ref=e374] [cursor=pointer]:
              - /url: /forgot-password
            - button "CONNECT_TO_NETWORK" [ref=e375]
          - generic [ref=e376]:
            - generic [ref=e377]: ENCRYPTED CLOUD PORTAL
            - generic [ref=e380]: SUPABASE POSTGRES SECURE
        - paragraph [ref=e382]:
          - text: NEW_MEMBER?
          - link "INITIALIZE_MEMBERSHIP" [ref=e383] [cursor=pointer]:
            - /url: /register
    - contentinfo [ref=e384]:
      - generic [ref=e385]:
        - generic [ref=e386]:
          - generic [ref=e387]:
            - link [ref=e388] [cursor=pointer]:
              - /url: /
              - generic [ref=e389]:
                - generic "DataCamp Official Emblem" [ref=e391]:
                  - img "DataCamp Emblem" [ref=e392]
                - generic "Innovation University Crest" [ref=e394]:
                  - img "Innovation University Crest" [ref=e395]
            - paragraph [ref=e396]: Empowering students with data science, AI, and software engineering skills.
          - generic [ref=e397]:
            - heading "Quick Links" [level=4] [ref=e398]
            - list [ref=e399]:
              - listitem [ref=e400]:
                - link "About Us" [ref=e401] [cursor=pointer]:
                  - /url: /about
              - listitem [ref=e402]:
                - link "Courses" [ref=e403] [cursor=pointer]:
                  - /url: /courses
              - listitem [ref=e404]:
                - link "Events" [ref=e405] [cursor=pointer]:
                  - /url: /events
              - listitem [ref=e406]:
                - link "Projects" [ref=e407] [cursor=pointer]:
                  - /url: /projects
              - listitem [ref=e408]:
                - link "Blog" [ref=e409] [cursor=pointer]:
                  - /url: /blog
              - listitem [ref=e410]:
                - link "Staff & Board" [ref=e411] [cursor=pointer]:
                  - /url: /staff
              - listitem [ref=e412]:
                - link "Gallery" [ref=e413] [cursor=pointer]:
                  - /url: /gallery
          - generic [ref=e414]:
            - heading "Support" [level=4] [ref=e415]
            - list [ref=e416]:
              - listitem [ref=e417]:
                - link "FAQ" [ref=e418] [cursor=pointer]:
                  - /url: /faq
              - listitem [ref=e419]:
                - link "Contact" [ref=e420] [cursor=pointer]:
                  - /url: /contact
              - listitem [ref=e421]:
                - link "Privacy Policy" [ref=e422] [cursor=pointer]:
                  - /url: /privacy
              - listitem [ref=e423]:
                - link "Terms of Service" [ref=e424] [cursor=pointer]:
                  - /url: /terms
          - generic [ref=e425]:
            - heading "Contact Info" [level=4] [ref=e426]
            - list [ref=e427]:
              - listitem [ref=e428]:
                - generic [ref=e432]: Not configured
              - listitem [ref=e433]:
                - generic [ref=e436]: Not configured
              - listitem [ref=e437]:
                - generic [ref=e441]: Not configured
        - generic [ref=e442]:
          - paragraph [ref=e443]: © 2026 DataCamp. All rights reserved.
          - generic [ref=e444]:
            - button "العربية" [ref=e445]
            - generic [ref=e450]: "VERSION: 2.5.0-AR"
  - button "Open AI Mentor" [ref=e452]
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
  11 |   await expect(page.locator('form input').filter({visible:true}).locator('..').first()).toBeVisible();
  12 |   await expect(page.locator('form input').filter({visible:true}).first()).toBeVisible();
  13 |   const shown=page.locator('form input[type=text]').filter({hasNot:page.locator('[hidden]')});
  14 |   expect(await shown.evaluateAll(inputs=>inputs.some((input:HTMLInputElement)=>input.value==='QA_TEST_Str0ng!_عربي'))).toBe(true);
  15 |   await hide.press('Enter');await expect(page.locator('form input[type=password]').first()).toHaveValue('QA_TEST_Str0ng!_عربي');
  16 |   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  17 |   if(route==='/login')await page.screenshot({path:info.outputPath('password-touch-'+language+'.png')});
  18 |  }finally{await app.db.close();}
  19 | });
  20 | 
```