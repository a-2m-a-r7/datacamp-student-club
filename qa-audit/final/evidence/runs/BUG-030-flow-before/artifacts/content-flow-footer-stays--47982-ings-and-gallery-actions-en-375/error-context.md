# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: content-flow.spec.ts >> footer stays after long settings and gallery actions en
- Location: qa-audit\final\tests\content-flow.spec.ts:3:44

# Error details

```
Error: footer must follow the save action

expect(received).toBeGreaterThanOrEqual(expected)

Expected: >= 866
Received:    -198
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
      - generic [ref=e333]:
        - generic [ref=e334]:
          - heading "System Settings" [level=1] [ref=e335]
          - paragraph [ref=e336]: Configure global platform parameters and branding.
        - generic [ref=e337]:
          - generic [ref=e340]:
            - generic [ref=e341]:
              - heading "General Branding" [level=3] [ref=e346]
              - paragraph [ref=e347]: Update the public identity of the platform.
            - generic [ref=e348]:
              - generic [ref=e349]:
                - text: Platform Main Name (Logo)
                - textbox [ref=e350]: DataCamp
              - generic [ref=e351]:
                - text: Platform Sub Name
                - textbox [ref=e352]: Student Club
              - generic [ref=e354]:
                - text: Platform Logo
                - generic [ref=e361]:
                  - button "IMPORT_FROM_DEVICE" [ref=e362]
                  - button "SELECT_PHOTO_ARCHIVE" [ref=e366]
                  - button "TAKE_PHOTO" [ref=e371]
              - generic [ref=e375]:
                - text: Tagline / Description
                - textbox [ref=e376]
              - generic [ref=e377]:
                - generic [ref=e378]:
                  - text: Contact Email
                  - textbox [ref=e379]
                - generic [ref=e380]:
                  - text: Contact Phone
                  - textbox [ref=e381]
          - generic [ref=e385]:
            - generic [ref=e386]:
              - heading "Social Media Grid" [level=3] [ref=e391]
              - paragraph [ref=e392]: Manage links to your external platforms.
            - button "Add Link" [ref=e393]
          - generic [ref=e397]:
            - generic [ref=e398]:
              - heading "Visual Identity" [level=3] [ref=e406]
              - paragraph [ref=e407]: Customize the look and feel of the interface.
            - generic [ref=e409]:
              - text: Primary Neon Color
              - generic [ref=e410]:
                - textbox [ref=e411]: "#39ff14"
                - generic [ref=e412]: "#39FF14"
          - generic [ref=e415]:
            - generic [ref=e416]:
              - heading "Access Control" [level=3] [ref=e420]
              - paragraph [ref=e421]: Manage registration and system availability.
            - generic [ref=e422]:
              - generic [ref=e423]:
                - generic [ref=e424]:
                  - generic [ref=e425]: Open Registration
                  - generic [ref=e426]: Allow new students to initialize accounts.
                - button [ref=e427]
              - generic [ref=e429]:
                - generic [ref=e430]:
                  - generic [ref=e431]: Maintenance Mode
                  - generic [ref=e432]: Lock the platform for system updates.
                - button [ref=e433]
          - generic [ref=e437]:
            - generic [ref=e438]:
              - heading "Data Management" [level=3] [ref=e444]
              - paragraph [ref=e445]: Export platform records and clear this browser’s caches.
            - generic [ref=e446]:
              - button "Export Platform Records" [ref=e447]
              - button "Clear Browser Cache" [ref=e451]
        - button "Commit Changes" [ref=e453]
    - contentinfo [ref=e458]:
      - generic [ref=e459]:
        - generic [ref=e460]:
          - generic [ref=e461]:
            - link [ref=e462] [cursor=pointer]:
              - /url: /
              - generic [ref=e463]:
                - generic "DataCamp Official Emblem" [ref=e465]:
                  - img "DataCamp Emblem" [ref=e466]
                - generic "Innovation University Crest" [ref=e468]:
                  - img "Innovation University Crest" [ref=e469]
            - paragraph [ref=e470]: Empowering students with data science, AI, and software engineering skills.
          - generic [ref=e471]:
            - heading "Quick Links" [level=2] [ref=e472]
            - list [ref=e473]:
              - listitem [ref=e474]:
                - link "About Us" [ref=e475] [cursor=pointer]:
                  - /url: /about
              - listitem [ref=e476]:
                - link "Courses" [ref=e477] [cursor=pointer]:
                  - /url: /courses
              - listitem [ref=e478]:
                - link "Events" [ref=e479] [cursor=pointer]:
                  - /url: /events
              - listitem [ref=e480]:
                - link "Projects" [ref=e481] [cursor=pointer]:
                  - /url: /projects
              - listitem [ref=e482]:
                - link "Blog" [ref=e483] [cursor=pointer]:
                  - /url: /blog
              - listitem [ref=e484]:
                - link "Staff & Board" [ref=e485] [cursor=pointer]:
                  - /url: /staff
              - listitem [ref=e486]:
                - link "Gallery" [ref=e487] [cursor=pointer]:
                  - /url: /gallery
          - generic [ref=e488]:
            - heading "Support" [level=2] [ref=e489]
            - list [ref=e490]:
              - listitem [ref=e491]:
                - link "FAQ" [ref=e492] [cursor=pointer]:
                  - /url: /faq
              - listitem [ref=e493]:
                - link "Contact" [ref=e494] [cursor=pointer]:
                  - /url: /contact
              - listitem [ref=e495]:
                - link "Privacy Policy" [ref=e496] [cursor=pointer]:
                  - /url: /privacy
              - listitem [ref=e497]:
                - link "Terms of Service" [ref=e498] [cursor=pointer]:
                  - /url: /terms
          - generic [ref=e499]:
            - heading "Contact Info" [level=2] [ref=e500]
            - list [ref=e501]:
              - listitem [ref=e502]:
                - generic [ref=e506]: Not configured
              - listitem [ref=e507]:
                - generic [ref=e510]: Not configured
              - listitem [ref=e511]:
                - generic [ref=e515]: Not configured
        - generic [ref=e516]:
          - paragraph [ref=e517]: © 2026 DataCamp. All rights reserved.
          - generic [ref=e518]:
            - button "العربية" [ref=e519]
            - generic [ref=e524]: "VERSION: 2.5.0-AR"
  - button "Open AI Mentor" [ref=e526]
  - region "Notifications alt+T"
```

# Test source

```ts
  1  | import {test,expect} from '@playwright/test';import {randomUUID} from 'node:crypto';import {platform,admin} from '../../fix-tests/persisted-platform';
  2  | let p:Awaited<ReturnType<typeof platform>>;test.afterEach(async()=>{await p?.db.close();});
  3  | for(const language of ['en','ar'] as const)test('footer stays after long settings and gallery actions '+language,async({page})=>{
  4  |  p=await platform();await p.connect(page,admin,language);await page.goto('/admin/settings');const save=page.getByRole('button',{name:'Commit Changes',exact:true});await expect(save).toBeVisible();await save.scrollIntoViewIfNeeded();
> 5  |  const settings=await save.evaluate(button=>({buttonBottom:button.getBoundingClientRect().bottom,footerTop:document.querySelector('footer')!.getBoundingClientRect().top}));expect(settings.footerTop,'footer must follow the save action').toBeGreaterThanOrEqual(settings.buttonBottom-1);
     |                                                                                                                                                                                                                                             ^ Error: footer must follow the save action
  6  |  await save.click();await expect(page.getByText('Settings updated successfully',{exact:true})).toBeVisible();
  7  |  const ids=Array.from({length:8},()=>randomUUID());for(const[id,index]of ids.map((id,i)=>[id,i]as const))await p.db.query("INSERT INTO gallery(id,title,url,category) VALUES($1,$2,$3,'Workshops')",[id,'QA_TEST_FLOW_'+index,'https://qa-test.supabase.co/storage/v1/object/public/uploads/gallery/QA_TEST_'+index+'.png']);
  8  |  await page.goto('/admin/gallery');const remove=page.getByRole('button',{name:'Delete',exact:true}).last();await expect(remove).toBeAttached();await remove.scrollIntoViewIfNeeded();
  9  |  const gallery=await remove.evaluate(button=>({buttonBottom:button.getBoundingClientRect().bottom,footerTop:document.querySelector('footer')!.getBoundingClientRect().top}));expect(gallery.footerTop,'footer must follow the last gallery action').toBeGreaterThanOrEqual(gallery.buttonBottom-1);
  10 |  await remove.click();await page.getByRole('button',{name:'CONFIRM_PURGE',exact:true}).click();await expect.poll(async()=>Number((await p.db.query<any>('SELECT count(*) n FROM gallery')).rows[0].n)).toBe(7);
  11 |  await page.screenshot({path:test.info().outputPath('QA_TEST_long_flow_'+language+'.png')});
  12 | });
  13 | 
```