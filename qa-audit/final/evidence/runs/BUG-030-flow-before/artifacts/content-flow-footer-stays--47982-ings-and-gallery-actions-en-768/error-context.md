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

Expected: >= 867
Received:    -5
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
          - generic [ref=e398]:
            - generic [ref=e399]:
              - heading "Visual Identity" [level=3] [ref=e407]
              - paragraph [ref=e408]: Customize the look and feel of the interface.
            - generic [ref=e410]:
              - text: Primary Neon Color
              - generic [ref=e411]:
                - textbox [ref=e412]: "#39ff14"
                - generic [ref=e413]: "#39FF14"
          - generic [ref=e416]:
            - generic [ref=e417]:
              - heading "Access Control" [level=3] [ref=e421]
              - paragraph [ref=e422]: Manage registration and system availability.
            - generic [ref=e423]:
              - generic [ref=e424]:
                - generic [ref=e425]:
                  - generic [ref=e426]: Open Registration
                  - generic [ref=e427]: Allow new students to initialize accounts.
                - button [ref=e428]
              - generic [ref=e430]:
                - generic [ref=e431]:
                  - generic [ref=e432]: Maintenance Mode
                  - generic [ref=e433]: Lock the platform for system updates.
                - button [ref=e434]
          - generic [ref=e438]:
            - generic [ref=e439]:
              - heading "Data Management" [level=3] [ref=e445]
              - paragraph [ref=e446]: Export platform records and clear this browser’s caches.
            - generic [ref=e447]:
              - button "Export Platform Records" [ref=e448]
              - button "Clear Browser Cache" [ref=e453]
        - button "Commit Changes" [ref=e455]
    - contentinfo [ref=e460]:
      - generic [ref=e461]:
        - generic [ref=e462]:
          - generic [ref=e463]:
            - link [ref=e464] [cursor=pointer]:
              - /url: /
              - generic [ref=e465]:
                - generic "DataCamp Official Emblem" [ref=e467]:
                  - img "DataCamp Emblem" [ref=e468]
                - generic "Innovation University Crest" [ref=e470]:
                  - img "Innovation University Crest" [ref=e471]
            - paragraph [ref=e472]: Empowering students with data science, AI, and software engineering skills.
          - generic [ref=e473]:
            - heading "Quick Links" [level=2] [ref=e474]
            - list [ref=e475]:
              - listitem [ref=e476]:
                - link "About Us" [ref=e477] [cursor=pointer]:
                  - /url: /about
              - listitem [ref=e478]:
                - link "Courses" [ref=e479] [cursor=pointer]:
                  - /url: /courses
              - listitem [ref=e480]:
                - link "Events" [ref=e481] [cursor=pointer]:
                  - /url: /events
              - listitem [ref=e482]:
                - link "Projects" [ref=e483] [cursor=pointer]:
                  - /url: /projects
              - listitem [ref=e484]:
                - link "Blog" [ref=e485] [cursor=pointer]:
                  - /url: /blog
              - listitem [ref=e486]:
                - link "Staff & Board" [ref=e487] [cursor=pointer]:
                  - /url: /staff
              - listitem [ref=e488]:
                - link "Gallery" [ref=e489] [cursor=pointer]:
                  - /url: /gallery
          - generic [ref=e490]:
            - heading "Support" [level=2] [ref=e491]
            - list [ref=e492]:
              - listitem [ref=e493]:
                - link "FAQ" [ref=e494] [cursor=pointer]:
                  - /url: /faq
              - listitem [ref=e495]:
                - link "Contact" [ref=e496] [cursor=pointer]:
                  - /url: /contact
              - listitem [ref=e497]:
                - link "Privacy Policy" [ref=e498] [cursor=pointer]:
                  - /url: /privacy
              - listitem [ref=e499]:
                - link "Terms of Service" [ref=e500] [cursor=pointer]:
                  - /url: /terms
          - generic [ref=e501]:
            - heading "Contact Info" [level=2] [ref=e502]
            - list [ref=e503]:
              - listitem [ref=e504]:
                - generic [ref=e508]: Not configured
              - listitem [ref=e509]:
                - generic [ref=e512]: Not configured
              - listitem [ref=e513]:
                - generic [ref=e517]: Not configured
        - generic [ref=e518]:
          - paragraph [ref=e519]: © 2026 DataCamp. All rights reserved.
          - generic [ref=e520]:
            - button "العربية" [ref=e521]
            - generic [ref=e526]: "VERSION: 2.5.0-AR"
  - generic [ref=e527]:
    - generic: NEXUS AI MENTOR
    - button "Open AI Mentor" [ref=e528]
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