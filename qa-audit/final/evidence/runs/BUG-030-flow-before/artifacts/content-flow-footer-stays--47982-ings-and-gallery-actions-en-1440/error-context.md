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
Received:    397
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
    - generic [ref=e323]:
      - generic [ref=e324]:
        - paragraph [ref=e325]: Main Menu
        - link "Home" [ref=e327] [cursor=pointer]:
          - /url: /
        - link "Courses" [ref=e334] [cursor=pointer]:
          - /url: /courses
        - link "My Courses" [ref=e340] [cursor=pointer]:
          - /url: /my-courses
        - link "Online Compiler" [ref=e347] [cursor=pointer]:
          - /url: /compiler
        - link "Leaderboard" [ref=e354] [cursor=pointer]:
          - /url: /leaderboard
        - link "Certificates" [ref=e364] [cursor=pointer]:
          - /url: /certificates
        - link "Notifications" [ref=e374] [cursor=pointer]:
          - /url: /notifications
        - link "Events" [ref=e381] [cursor=pointer]:
          - /url: /events
        - link "Projects" [ref=e387] [cursor=pointer]:
          - /url: /projects
        - link "Blog" [ref=e394] [cursor=pointer]:
          - /url: /blog
        - link "Staff & Board" [ref=e401] [cursor=pointer]:
          - /url: /staff
        - link "Gallery" [ref=e410] [cursor=pointer]:
          - /url: /gallery
        - link "About Us" [ref=e418] [cursor=pointer]:
          - /url: /about
        - link "Contact" [ref=e424] [cursor=pointer]:
          - /url: /contact
      - generic [ref=e430]:
        - paragraph [ref=e431]: Admin Portal
        - link "Overview" [ref=e432] [cursor=pointer]:
          - /url: /admin
        - link "Courses" [ref=e436] [cursor=pointer]:
          - /url: /admin/courses
        - link "Points & XP" [ref=e440] [cursor=pointer]:
          - /url: /admin/points
        - link "Users" [ref=e445] [cursor=pointer]:
          - /url: /admin/users
        - link "Events" [ref=e452] [cursor=pointer]:
          - /url: /admin/events
        - link "Forms" [ref=e456] [cursor=pointer]:
          - /url: /admin/forms
        - link "Staff" [ref=e461] [cursor=pointer]:
          - /url: /admin/staff
        - link "Gallery" [ref=e466] [cursor=pointer]:
          - /url: /admin/gallery
        - link "Projects" [ref=e472] [cursor=pointer]:
          - /url: /admin/projects
        - link "Blog" [ref=e477] [cursor=pointer]:
          - /url: /admin/blog
        - link "Messages" [ref=e482] [cursor=pointer]:
          - /url: /admin/messages
        - link "Content" [ref=e487] [cursor=pointer]:
          - /url: /admin/content
        - link "Security" [ref=e494] [cursor=pointer]:
          - /url: /admin/security
        - link "Profile" [ref=e498] [cursor=pointer]:
          - /url: /profile
        - link "Settings" [ref=e503] [cursor=pointer]:
          - /url: /admin/settings
    - generic [ref=e508]:
      - generic [ref=e509]:
        - link "Q QA_TEST_ADMIN Admin" [ref=e510] [cursor=pointer]:
          - /url: /profile
          - generic [ref=e511]: Q
          - generic [ref=e513]:
            - paragraph [ref=e514]: QA_TEST_ADMIN
            - paragraph [ref=e515]: Admin
        - button "Logout" [ref=e516]
      - generic [ref=e522]:
        - button "العربية" [ref=e523]
        - button "English" [ref=e525]
      - button [ref=e527]
  - generic [ref=e530]:
    - generic [ref=e532]:
      - button "العربية" [ref=e533]
      - button "EN" [ref=e535]
    - main [ref=e538]:
      - generic [ref=e541]:
        - generic [ref=e542]:
          - heading "System Settings" [level=1] [ref=e543]
          - paragraph [ref=e544]: Configure global platform parameters and branding.
        - generic [ref=e545]:
          - generic [ref=e548]:
            - generic [ref=e549]:
              - heading "General Branding" [level=3] [ref=e554]
              - paragraph [ref=e555]: Update the public identity of the platform.
            - generic [ref=e556]:
              - generic [ref=e557]:
                - text: Platform Main Name (Logo)
                - textbox [ref=e558]: DataCamp
              - generic [ref=e559]:
                - text: Platform Sub Name
                - textbox [ref=e560]: Student Club
              - generic [ref=e562]:
                - text: Platform Logo
                - generic [ref=e569]:
                  - button "IMPORT_FROM_DEVICE" [ref=e570]
                  - button "SELECT_PHOTO_ARCHIVE" [ref=e574]
                  - button "TAKE_PHOTO" [ref=e579]
              - generic [ref=e583]:
                - text: Tagline / Description
                - textbox [ref=e584]
              - generic [ref=e585]:
                - generic [ref=e586]:
                  - text: Contact Email
                  - textbox [ref=e587]
                - generic [ref=e588]:
                  - text: Contact Phone
                  - textbox [ref=e589]
          - generic [ref=e593]:
            - generic [ref=e594]:
              - heading "Social Media Grid" [level=3] [ref=e599]
              - paragraph [ref=e600]: Manage links to your external platforms.
            - button "Add Link" [ref=e601]
          - generic [ref=e606]:
            - generic [ref=e607]:
              - heading "Visual Identity" [level=3] [ref=e615]
              - paragraph [ref=e616]: Customize the look and feel of the interface.
            - generic [ref=e618]:
              - text: Primary Neon Color
              - generic [ref=e619]:
                - textbox [ref=e620]: "#39ff14"
                - generic [ref=e621]: "#39FF14"
          - generic [ref=e624]:
            - generic [ref=e625]:
              - heading "Access Control" [level=3] [ref=e629]
              - paragraph [ref=e630]: Manage registration and system availability.
            - generic [ref=e631]:
              - generic [ref=e632]:
                - generic [ref=e633]:
                  - generic [ref=e634]: Open Registration
                  - generic [ref=e635]: Allow new students to initialize accounts.
                - button [ref=e636]
              - generic [ref=e638]:
                - generic [ref=e639]:
                  - generic [ref=e640]: Maintenance Mode
                  - generic [ref=e641]: Lock the platform for system updates.
                - button [ref=e642]
          - generic [ref=e646]:
            - generic [ref=e647]:
              - heading "Data Management" [level=3] [ref=e653]
              - paragraph [ref=e654]: Export platform records and clear this browser’s caches.
            - generic [ref=e655]:
              - button "Export Platform Records" [ref=e656]
              - button "Clear Browser Cache" [ref=e661]
        - button "Commit Changes" [ref=e663]
    - contentinfo [ref=e668]:
      - generic [ref=e669]:
        - generic [ref=e670]:
          - generic [ref=e671]:
            - link [ref=e672] [cursor=pointer]:
              - /url: /
              - generic [ref=e673]:
                - generic "DataCamp Official Emblem" [ref=e675]:
                  - img "DataCamp Emblem" [ref=e676]
                - generic "Innovation University Crest" [ref=e678]:
                  - img "Innovation University Crest" [ref=e679]
            - paragraph [ref=e680]: Empowering students with data science, AI, and software engineering skills.
          - generic [ref=e681]:
            - heading "Quick Links" [level=2] [ref=e682]
            - list [ref=e683]:
              - listitem [ref=e684]:
                - link "About Us" [ref=e685] [cursor=pointer]:
                  - /url: /about
              - listitem [ref=e686]:
                - link "Courses" [ref=e687] [cursor=pointer]:
                  - /url: /courses
              - listitem [ref=e688]:
                - link "Events" [ref=e689] [cursor=pointer]:
                  - /url: /events
              - listitem [ref=e690]:
                - link "Projects" [ref=e691] [cursor=pointer]:
                  - /url: /projects
              - listitem [ref=e692]:
                - link "Blog" [ref=e693] [cursor=pointer]:
                  - /url: /blog
              - listitem [ref=e694]:
                - link "Staff & Board" [ref=e695] [cursor=pointer]:
                  - /url: /staff
              - listitem [ref=e696]:
                - link "Gallery" [ref=e697] [cursor=pointer]:
                  - /url: /gallery
          - generic [ref=e698]:
            - heading "Support" [level=2] [ref=e699]
            - list [ref=e700]:
              - listitem [ref=e701]:
                - link "FAQ" [ref=e702] [cursor=pointer]:
                  - /url: /faq
              - listitem [ref=e703]:
                - link "Contact" [ref=e704] [cursor=pointer]:
                  - /url: /contact
              - listitem [ref=e705]:
                - link "Privacy Policy" [ref=e706] [cursor=pointer]:
                  - /url: /privacy
              - listitem [ref=e707]:
                - link "Terms of Service" [ref=e708] [cursor=pointer]:
                  - /url: /terms
          - generic [ref=e709]:
            - heading "Contact Info" [level=2] [ref=e710]
            - list [ref=e711]:
              - listitem [ref=e712]:
                - generic [ref=e716]: Not configured
              - listitem [ref=e717]:
                - generic [ref=e720]: Not configured
              - listitem [ref=e721]:
                - generic [ref=e725]: Not configured
        - generic [ref=e726]:
          - paragraph [ref=e727]: © 2026 DataCamp. All rights reserved.
          - generic [ref=e728]:
            - button "العربية" [ref=e729]
            - generic [ref=e734]: "VERSION: 2.5.0-AR"
  - generic [ref=e735]:
    - generic: NEXUS AI MENTOR
    - button "Open AI Mentor" [ref=e736]
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