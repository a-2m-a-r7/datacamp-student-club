# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: fix-tests\platform-tabs.spec.ts >> Gallery: image upload persists a Storage URL, member search/lightbox works, missing media has a neutral fallback, deletion persists
- Location: qa-audit\fix-tests\platform-tabs.spec.ts:23:1

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: locator.click: Target page, context or browser has been closed
Call log:
  - waiting for getByRole('button', { name: 'Delete', exact: true })
    - locator resolved to <button aria-label="Delete" class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 uppercase tracking-widest font-cyber group relative overflow-hidden hover:text-primary transition-colors w-10 h-10 text-destructive hover:bg-destructive/10 border border-transparent hover:border-destructive/20">…</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div title="Innovation University Crest" class="relative rounded-xl overflow-hidden bg-[#45287c] p-1.5 border border-purple-400/50 shadow-[0_0_16px_rgba(147,51,234,0.3)] flex items-center justify-center transition-all duration-300 hover:shadow-[0_0_24px_rgba(147,51,234,0.5)] hover:scale-105 shrink-0 ">…</div> from <footer class="bg-dark-navy border-t border-white/10 pt-16 pb-8">…</footer> subtree intercepts pointer events
    - retrying click action
    - waiting 20ms
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling
    - <div title="Innovation University Crest" class="relative rounded-xl overflow-hidden bg-[#45287c] p-1.5 border border-purple-400/50 shadow-[0_0_16px_rgba(147,51,234,0.3)] flex items-center justify-center transition-all duration-300 hover:shadow-[0_0_24px_rgba(147,51,234,0.5)] hover:scale-105 shrink-0 ">…</div> from <footer class="bg-dark-navy border-t border-white/10 pt-16 pb-8">…</footer> subtree intercepts pointer events
  2 × retrying click action
      - waiting 100ms
      - waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div title="DataCamp Official Emblem" class="relative rounded-xl overflow-hidden bg-white p-1.5 border border-[#03EF62]/50 shadow-[0_0_16px_rgba(3,239,98,0.25)] flex items-center justify-center transition-all duration-300 hover:shadow-[0_0_24px_rgba(3,239,98,0.45)] hover:scale-105 shrink-0 ">…</div> from <header class="lg:hidden h-16 glass border-b border-white/10 flex items-center justify-between px-6 sticky top-0 z-40 shrink-0">…</header> subtree intercepts pointer events
  25 × retrying click action
       - waiting 500ms
       - waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <div title="Innovation University Crest" class="relative rounded-xl overflow-hidden bg-[#45287c] p-1.5 border border-purple-400/50 shadow-[0_0_16px_rgba(147,51,234,0.3)] flex items-center justify-center transition-all duration-300 hover:shadow-[0_0_24px_rgba(147,51,234,0.5)] hover:scale-105 shrink-0 ">…</div> from <footer class="bg-dark-navy border-t border-white/10 pt-16 pb-8">…</footer> subtree intercepts pointer events
     - retrying click action
       - waiting 500ms
       - waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <div title="Innovation University Crest" class="relative rounded-xl overflow-hidden bg-[#45287c] p-1.5 border border-purple-400/50 shadow-[0_0_16px_rgba(147,51,234,0.3)] flex items-center justify-center transition-all duration-300 hover:shadow-[0_0_24px_rgba(147,51,234,0.5)] hover:scale-105 shrink-0 ">…</div> from <footer class="bg-dark-navy border-t border-white/10 pt-16 pb-8">…</footer> subtree intercepts pointer events
     - retrying click action
       - waiting 500ms
       - waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <div title="DataCamp Official Emblem" class="relative rounded-xl overflow-hidden bg-white p-1.5 border border-[#03EF62]/50 shadow-[0_0_16px_rgba(3,239,98,0.25)] flex items-center justify-center transition-all duration-300 hover:shadow-[0_0_24px_rgba(3,239,98,0.45)] hover:scale-105 shrink-0 ">…</div> from <header class="lg:hidden h-16 glass border-b border-white/10 flex items-center justify-between px-6 sticky top-0 z-40 shrink-0">…</header> subtree intercepts pointer events
     - retrying click action
       - waiting 500ms
       - waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <div title="DataCamp Official Emblem" class="relative rounded-xl overflow-hidden bg-white p-1.5 border border-[#03EF62]/50 shadow-[0_0_16px_rgba(3,239,98,0.25)] flex items-center justify-center transition-all duration-300 hover:shadow-[0_0_24px_rgba(3,239,98,0.45)] hover:scale-105 shrink-0 ">…</div> from <header class="lg:hidden h-16 glass border-b border-white/10 flex items-center justify-between px-6 sticky top-0 z-40 shrink-0">…</header> subtree intercepts pointer events
  - retrying click action
    - waiting 500ms
    - waiting for element to be visible, enabled and stable

```

# Page snapshot

```yaml
- generic [ref=f1e3]:
  - generic [ref=f1e313]:
    - banner [ref=f1e314]:
      - generic [ref=f1e315]:
        - button "Open navigation" [ref=f1e316]
        - generic [ref=f1e318]:
          - generic "DataCamp Official Emblem" [ref=f1e320]:
            - img "DataCamp Emblem" [ref=f1e321]
          - generic "Innovation University Crest" [ref=f1e323]:
            - img "Innovation University Crest" [ref=f1e324]
      - generic [ref=f1e325]:
        - button "العربية" [ref=f1e326]
        - button "EN" [ref=f1e328]
    - main [ref=f1e330]:
      - generic [ref=f1e333]:
        - generic [ref=f1e334]:
          - heading "GALLERY ARCHIVE CONTROL" [level=1] [ref=f1e335]
          - paragraph [ref=f1e336]: Manage the visual history of the DataCamp Student Club.
        - generic [ref=f1e339]:
          - generic [ref=f1e340]:
            - heading "Add New Asset" [level=3] [ref=f1e341]
            - paragraph [ref=f1e342]: Enter the URL of the image you want to add to the gallery.
          - generic [ref=f1e343]:
            - generic [ref=f1e344]:
              - text: Visual Asset
              - generic [ref=f1e351]:
                - button "IMPORT_FROM_DEVICE" [ref=f1e352]
                - button "SELECT_PHOTO_ARCHIVE" [ref=f1e356]
                - button "TAKE_PHOTO" [ref=f1e361]
            - generic [ref=f1e365]:
              - generic [ref=f1e366]:
                - text: Caption / Title
                - textbox "Event Name" [ref=f1e367]
              - button "ADD TO GRID" [ref=f1e368]
            - generic [ref=f1e370]:
              - text: Category
              - combobox "Gallery category" [ref=f1e371]:
                - option "Campus Days" [selected]
                - option "Workshops"
                - option "Hackathons"
                - option "Ceremonies"
        - generic [ref=f1e373]:
          - img "QA_TEST_GALLERY" [ref=f1e374]
          - generic [ref=f1e375]:
            - paragraph [ref=f1e376]: QA_TEST_GALLERY
            - button "Delete" [ref=f1e377]
    - contentinfo [ref=f1e381]:
      - generic [ref=f1e382]:
        - generic [ref=f1e383]:
          - generic [ref=f1e384]:
            - link [ref=f1e385] [cursor=pointer]:
              - /url: /
              - generic [ref=f1e386]:
                - generic "DataCamp Official Emblem" [ref=f1e388]:
                  - img "DataCamp Emblem" [ref=f1e389]
                - generic "Innovation University Crest" [ref=f1e391]:
                  - img "Innovation University Crest" [ref=f1e392]
            - paragraph [ref=f1e393]: Empowering students with data science, AI, and software engineering skills.
          - generic [ref=f1e394]:
            - heading "Quick Links" [level=2] [ref=f1e395]
            - list [ref=f1e396]:
              - listitem [ref=f1e397]:
                - link "About Us" [ref=f1e398] [cursor=pointer]:
                  - /url: /about
              - listitem [ref=f1e399]:
                - link "Courses" [ref=f1e400] [cursor=pointer]:
                  - /url: /courses
              - listitem [ref=f1e401]:
                - link "Events" [ref=f1e402] [cursor=pointer]:
                  - /url: /events
              - listitem [ref=f1e403]:
                - link "Projects" [ref=f1e404] [cursor=pointer]:
                  - /url: /projects
              - listitem [ref=f1e405]:
                - link "Blog" [ref=f1e406] [cursor=pointer]:
                  - /url: /blog
              - listitem [ref=f1e407]:
                - link "Staff & Board" [ref=f1e408] [cursor=pointer]:
                  - /url: /staff
              - listitem [ref=f1e409]:
                - link "Gallery" [ref=f1e410] [cursor=pointer]:
                  - /url: /gallery
          - generic [ref=f1e411]:
            - heading "Support" [level=2] [ref=f1e412]
            - list [ref=f1e413]:
              - listitem [ref=f1e414]:
                - link "FAQ" [ref=f1e415] [cursor=pointer]:
                  - /url: /faq
              - listitem [ref=f1e416]:
                - link "Contact" [ref=f1e417] [cursor=pointer]:
                  - /url: /contact
              - listitem [ref=f1e418]:
                - link "Privacy Policy" [ref=f1e419] [cursor=pointer]:
                  - /url: /privacy
              - listitem [ref=f1e420]:
                - link "Terms of Service" [ref=f1e421] [cursor=pointer]:
                  - /url: /terms
          - generic [ref=f1e422]:
            - heading "Contact Info" [level=2] [ref=f1e423]
            - list [ref=f1e424]:
              - listitem [ref=f1e425]:
                - generic [ref=f1e429]: Not configured
              - listitem [ref=f1e430]:
                - generic [ref=f1e433]: Not configured
              - listitem [ref=f1e434]:
                - generic [ref=f1e438]: Not configured
        - generic [ref=f1e439]:
          - paragraph [ref=f1e440]: © 2026 DataCamp. All rights reserved.
          - generic [ref=f1e441]:
            - button "العربية" [ref=f1e442]
            - generic [ref=f1e447]: "VERSION: 2.5.0-AR"
  - button "Open AI Mentor" [ref=f1e449]
  - region "Notifications alt+T"
```

# Test source

```ts
  1  | import { test, expect, Page } from '@playwright/test';
  2  | import { platform, admin, member, other, png } from './persisted-platform';
  3  | let app:Awaited<ReturnType<typeof platform>>;
  4  | test.beforeEach(async()=>{app=await platform();});
  5  | test.afterEach(async({browser})=>{for(const c of browser.contexts())await c.close();await app?.db.close();});
  6  | async function upload(page:Page) {
  7  |  const pending=page.waitForEvent('filechooser');await page.getByRole('button',{name:'IMPORT_FROM_DEVICE',exact:true}).click();
  8  |  await(await pending).setFiles({name:'QA_TEST.png',mimeType:'image/png',buffer:png});await expect(page.getByRole('img',{name:'Preview',exact:true})).toBeVisible();
  9  | }
  10 | async function scalar(sql:string,args:any[]=[]) {return (await app.db.query<any>(sql,args)).rows[0];}
  11 | 
  12 | test('Staff: validates blank input, saves real roster, persists reload, filters admin directory and blocks members',async({page,browser})=>{
  13 |  await app.connect(page);await page.goto('/admin/staff');await page.getByRole('button',{name:'Add Operative',exact:true}).click();
  14 |  await page.getByRole('button',{name:'INITIALIZE',exact:true}).click();await expect(page.getByText('name is required',{exact:true})).toBeVisible();
  15 |  const dialog=page.getByRole('dialog');await dialog.locator('input').first().fill('QA_TEST_STAFF');await dialog.locator('input').nth(1).fill('QA_TEST_TEACHER');
  16 |  await page.getByRole('button',{name:'INITIALIZE',exact:true}).click();await expect(dialog).toHaveCount(0);const row=await scalar('SELECT * FROM staff');expect(row.image).toBe('');
  17 |  await page.reload();await expect(page.getByText('QA_TEST_STAFF',{exact:true})).toBeVisible();await page.getByRole('button',{name:'Refresh Roster',exact:true}).click();await expect(page.getByText('Roster refreshed from database',{exact:true})).toBeVisible();
  18 |  await page.goto('/staff');await page.getByPlaceholder('Search members, roles, committees...').fill('QA_TEST_STAFF');await expect(page.getByText('QA_TEST_STAFF',{exact:true})).toBeVisible();expect(await page.locator('img[src*="picsum"],img[src*="unsplash"]').count()).toBe(0);
  19 |  const student=await browser.newPage({viewport:test.info().project.use.viewport as any});await app.connect(student,member);await student.goto('/staff');await expect(student.getByText('Club member directory is available to administrators only')).toBeVisible();expect((await app.asUser(member,(tx:any)=>tx.query('SELECT * FROM staff'))).rows).toHaveLength(0);
  20 |  await page.goto('/admin/staff');await page.getByRole('button',{name:'Delete',exact:true}).click();await page.getByRole('button',{name:'ABORT',exact:true}).click();expect(await scalar('SELECT count(*) n FROM staff')).toMatchObject({n:1});await page.getByRole('button',{name:'Delete',exact:true}).click();await page.getByRole('button',{name:'CONFIRM_PURGE',exact:true}).click();await expect.poll(async()=>Number((await scalar('SELECT count(*) n FROM staff')).n)).toBe(0);
  21 | });
  22 | 
  23 | test('Gallery: image upload persists a Storage URL, member search/lightbox works, missing media has a neutral fallback, deletion persists',async({page,browser})=>{
  24 |  await app.connect(page);await page.goto('/admin/gallery');await upload(page);await page.getByLabel('Gallery category').selectOption('Workshops');await page.getByPlaceholder('Event Name').fill('QA_TEST_GALLERY');await page.getByRole('button',{name:'ADD TO GRID',exact:true}).click();await expect(page.getByText('Visual asset added to Supabase archive',{exact:true})).toBeVisible();
  25 |  const row=await scalar('SELECT * FROM gallery');expect(row.url).toMatch(/^https:\/\/qa-test.supabase.co\/storage\/v1\/object\/public\/uploads\/gallery\//);expect(row.url).not.toContain('base64');await page.reload();await expect(page.getByRole('img',{name:'QA_TEST_GALLERY',exact:true})).toBeVisible();
  26 |  const student=await browser.newPage({viewport:test.info().project.use.viewport as any});await app.connect(student,member);await student.goto('/gallery');await student.getByRole('button',{name:'Workshops',exact:true}).click();await student.getByPlaceholder('Search moments & events...').fill('QA_TEST_GALLERY');await student.getByRole('button',{name:'View image: QA_TEST_GALLERY',exact:true}).click();await expect(student.getByRole('dialog')).toBeVisible();await student.keyboard.press('Escape');await expect(student.getByRole('dialog')).toHaveCount(0);
  27 |  await student.route('**/storage/v1/object/public/**',r=>r.fulfill({status:404,body:''}));await student.reload();await expect(student.getByRole('img',{name:'QA_TEST_GALLERY',exact:true})).toBeVisible();expect(await student.locator('img[src*="picsum"]').count()).toBe(0);
> 28 |  await page.getByRole('button',{name:'Delete',exact:true}).click();await page.getByRole('button',{name:'CONFIRM_PURGE',exact:true}).click();await expect.poll(async()=>Number((await scalar('SELECT count(*) n FROM gallery')).n)).toBe(0);
     |                                                            ^ Error: locator.click: Target page, context or browser has been closed
  29 | });
  30 | 
  31 | test('Content/Settings/Home/About/Contact: save every content tab, preserve branding fields, reload and serve actual saved data',async({page,browser})=>{
  32 |  await app.db.query("INSERT INTO settings(key,value) VALUES('general',$1)",[JSON.stringify({siteName:'QA_TEST_BRAND',contactEmail:'QA_TEST_CONTACT@example.invalid',enableRegistration:false,maintenanceMode:false,socialLinks:[]})]);
  33 |  await app.connect(page);await page.goto('/admin/content');await expect(page.getByRole('button',{name:'Save All Changes',exact:true})).toBeEnabled();await page.locator('main input').first().fill('QA_TEST_HOME');await expect(page.locator('main input').first()).toHaveValue('QA_TEST_HOME');await page.locator('main textarea').first().fill('QA_TEST_SUBTITLE');
  34 |  await page.getByRole('button',{name:'About Us',exact:true}).click();await page.locator('main textarea').nth(0).fill('QA_TEST_MISSION');await page.locator('main textarea').nth(1).fill('QA_TEST_VISION');await page.locator('main textarea').nth(2).fill('QA_TEST_HISTORY');
  35 |  await page.getByRole('button',{name:'Discord & Social Links',exact:true}).click();await page.getByPlaceholder('https://discord.gg/your-club-invite').fill('https://discord.gg/QA_TEST');await page.getByPlaceholder('https://github.com/datacamp-club').fill('https://github.com/QA_TEST');await page.getByRole('button',{name:'Save All Changes',exact:true}).click();await expect(page.getByText('All content changes saved to database',{exact:true})).toBeVisible();
  36 |  expect((await scalar("SELECT value FROM settings WHERE key='home_content'")).value.heroTitle).toBe('QA_TEST_HOME');expect((await scalar("SELECT value FROM settings WHERE key='about_data'")).value.history).toBe('QA_TEST_HISTORY');expect((await scalar("SELECT value FROM settings WHERE key='general'")).value).toMatchObject({siteName:'QA_TEST_BRAND',contactEmail:'QA_TEST_CONTACT@example.invalid',enableRegistration:false,discordUrl:'https://discord.gg/QA_TEST'});
  37 |  await page.goto('/admin/settings');await expect(page.locator('main input').first()).toHaveValue('QA_TEST_BRAND');await page.locator('main input').first().fill('QA_TEST_UPDATED_BRAND');await page.getByRole('button',{name:'Commit Changes',exact:true}).click();await expect(page.getByText('System settings saved to Supabase',{exact:true})).toBeVisible();expect((await scalar("SELECT value FROM settings WHERE key='general'")).value.discordUrl).toBe('https://discord.gg/QA_TEST');
  38 |  const visitor=await browser.newPage({viewport:test.info().project.use.viewport as any});await app.connect(visitor,null);await visitor.goto('/');await expect(visitor.getByText('QA_TEST_HOME',{exact:true})).toBeVisible();await visitor.goto('/about');await expect(visitor.getByText('QA_TEST_MISSION',{exact:true})).toBeVisible();await expect(visitor.getByText('QA_TEST_HISTORY',{exact:true})).toBeVisible();await visitor.goto('/contact');await expect(visitor.locator('a[href="https://discord.gg/QA_TEST"]')).toBeVisible();await expect(visitor.getByText('QA_TEST_CONTACT@example.invalid',{exact:true}).first()).toBeVisible();
  39 | });
  40 | 
  41 | test('Contact/Messages: visitor submission saves SQL record, admin reads/marks read, cancel/delete work',async({page,browser})=>{
  42 |  await app.connect(page,null);await page.goto('/contact');const form=page.locator('form');await form.locator('input').nth(0).fill('QA_TEST_CONTACT');await form.locator('input').nth(1).fill('QA_TEST@example.invalid');await form.locator('input').nth(2).fill('QA_TEST_SUBJECT');await form.locator('textarea').fill('QA_TEST_MESSAGE');await form.locator('button[type="submit"]').click();await expect(page.getByText('Transmission received. We will contact you shortly.',{exact:true})).toBeVisible();expect(await scalar('SELECT subject,status FROM messages')).toMatchObject({subject:'QA_TEST_SUBJECT',status:'unread'});
  43 |  const manager=await browser.newPage({viewport:test.info().project.use.viewport as any});await app.connect(manager);await manager.goto('/admin/messages');await manager.getByRole('button',{name:'View',exact:true}).click();await expect(manager.getByRole('dialog')).toContainText('QA_TEST_MESSAGE');await expect.poll(async()=>(await scalar('SELECT status FROM messages')).status).toBe('read');await manager.getByRole('button',{name:'CLOSE',exact:true}).click();await manager.reload();await expect(manager.getByText('QA_TEST_SUBJECT',{exact:true})).toBeVisible();await manager.getByRole('button',{name:'Delete',exact:true}).click();await manager.getByRole('button',{name:'CANCEL',exact:true}).click();expect(Number((await scalar('SELECT count(*) n FROM messages')).n)).toBe(1);await manager.getByRole('button',{name:'Delete',exact:true}).click();await manager.getByRole('dialog').getByRole('button').last().click();await expect.poll(async()=>Number((await scalar('SELECT count(*) n FROM messages')).n)).toBe(0);
  44 | });
  45 | 
  46 | test('Projects: member proposal stays private until admin approval, links/detail/search work and removal persists',async({page,browser})=>{
  47 |  await app.connect(page,member);await page.goto('/projects');await page.getByRole('button',{name:'SUBMIT YOUR PROJECT',exact:true}).click();await page.getByPlaceholder('e.g. Arabic Sentiment Analyzer').fill('QA_TEST_PROJECT');await page.getByPlaceholder('Explain what the project does, the model architecture, dataset used, and key findings...').fill('QA_TEST_PROJECT_DESCRIPTION');await page.getByPlaceholder('Python, PyTorch, FastAPI, React').fill('Python, SQL');await page.getByPlaceholder('https://github.com/...').fill('https://github.com/QA_TEST/project');await page.getByPlaceholder('https://my-model.app').fill('https://QA_TEST.example.invalid');await page.getByRole('dialog').locator('button[type="submit"]').click();await expect(page.getByText('Project submitted for administrator review.',{exact:true})).toBeVisible();const row=await scalar('SELECT * FROM projects');expect(row).toMatchObject({status:'planning',created_by:member});await page.reload();await expect(page.getByText('QA_TEST_PROJECT',{exact:true})).toHaveCount(0);
  48 |  const manager=await browser.newPage({viewport:test.info().project.use.viewport as any});await app.connect(manager);await manager.goto('/admin/projects');await manager.getByRole('button',{name:'Approve & Publish',exact:true}).click();await expect(manager.getByText('Project approved and published',{exact:true})).toBeVisible();expect((await scalar('SELECT status FROM projects')).status).toBe('active');await page.reload();await page.getByPlaceholder('Search projects, stack, authors...').fill('QA_TEST_PROJECT');await page.getByRole('button',{name:'VIEW CASE STUDY',exact:true}).click();await expect(page.getByRole('dialog')).toContainText('QA_TEST_PROJECT_DESCRIPTION');await expect(page.getByRole('dialog').locator('a[href="https://github.com/QA_TEST/project"]')).toBeVisible();await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(0);
  49 |  await manager.getByRole('button',{name:'Delete',exact:true}).click();await manager.getByRole('button',{name:'CONFIRM_PURGE',exact:true}).click();await expect.poll(async()=>Number((await scalar('SELECT count(*) n FROM projects')).n)).toBe(0);
  50 | });
  51 | 
  52 | test('Blog: create/read/share/edit/delete persist across administrator and member sessions without random covers',async({page,browser})=>{
  53 |  await app.connect(page);await page.goto('/admin/blog');await page.getByRole('button',{name:'NEW_POST',exact:true}).click();const dialog=page.getByRole('dialog');await dialog.locator('input').first().fill('QA_TEST_BLOG');await dialog.locator('textarea').fill('QA_TEST_BLOG_CONTENT');await page.getByRole('button',{name:'PUBLISH',exact:true}).click();await expect(dialog).toHaveCount(0);const row=await scalar('SELECT * FROM blog');expect(row.content).toBe('QA_TEST_BLOG_CONTENT');
  54 |  const student=await browser.newPage({viewport:test.info().project.use.viewport as any});await app.connect(student,member);await student.goto('/blog');await student.getByPlaceholder('Search articles & authors...').fill('QA_TEST_BLOG');await student.getByText('QA_TEST_BLOG',{exact:true}).click();await expect(student.getByRole('dialog')).toContainText('QA_TEST_BLOG_CONTENT');await student.getByRole('button',{name:'DONE READING',exact:true}).click();expect(await student.locator('img[src*="picsum"]').count()).toBe(0);await student.goto('/blog?article='+row.id);await expect(student.getByRole('dialog')).toContainText('QA_TEST_BLOG_CONTENT');
  55 |  await page.getByRole('button',{name:'Edit QA_TEST_BLOG',exact:true}).click();await page.getByRole('dialog').locator('input').first().fill('QA_TEST_EDITED_BLOG');await page.getByRole('button',{name:'PUBLISH',exact:true}).click();await page.reload();await expect(page.getByText('QA_TEST_EDITED_BLOG',{exact:true})).toBeVisible();await page.getByRole('button',{name:'Delete',exact:true}).click();await page.getByRole('dialog').getByRole('button').last().click();await expect.poll(async()=>Number((await scalar('SELECT count(*) n FROM blog')).n)).toBe(0);
  56 | });
  57 | 
  58 | test('Points/Notifications/Leaderboard/Overview/Security: actual bonus updates own XP, read state is private, analytics/audit persist and forbidden access is rejected',async({page,browser})=>{
  59 |  await app.connect(page);await page.goto('/admin/points');const row=page.getByRole('row').filter({hasText:'QA_TEST_MEMBER'});await row.getByRole('button',{name:'GRANT_XP',exact:true}).click();await page.locator('form input[type="number"]').fill('200');await page.getByPlaceholder('e.g. Outstanding presentation in Week 3').fill('QA_TEST_BONUS');await page.locator('form button[type="submit"]').click();await expect(page.getByText('Points saved successfully',{exact:true})).toBeVisible();expect((await scalar('SELECT total_points FROM profiles WHERE id=$1',[member])).total_points).toBe(200);expect((await scalar('SELECT points FROM points_log WHERE user_id=$1',[member])).points).toBe(200);
  60 |  await app.db.query('INSERT INTO notifications(user_id,title,message) VALUES($1,$2,$3),(NULL,$4,$5)',[member,'QA_TEST_PRIVATE','QA_TEST_PRIVATE_BODY','QA_TEST_GLOBAL','QA_TEST_GLOBAL_BODY']);
  61 |  const student=await browser.newPage({viewport:test.info().project.use.viewport as any});await app.connect(student,member);await student.goto('/notifications');await expect(student.getByText('QA_TEST_PRIVATE',{exact:true})).toBeVisible();await student.getByRole('button',{name:'MARK ALL READ',exact:true}).click();await student.reload();await expect(student.getByRole('button',{name:'MARK ALL READ',exact:true})).toHaveCount(0);const theirs=await app.asUser(other,(tx:any)=>tx.query('SELECT get_notifications() value'));expect(theirs.rows[0].value.find((n:any)=>n.title==='QA_TEST_GLOBAL').read).toBe(false);expect(theirs.rows[0].value.some((n:any)=>n.title==='QA_TEST_PRIVATE')).toBe(false);
  62 |  await page.goto('/leaderboard');await expect(page.getByText('QA_TEST_MEMBER',{exact:true}).first()).toBeVisible();await page.goto('/admin');await expect(page.getByText('SYSTEM OVERVIEW',{exact:true})).toBeVisible();await expect(page.getByRole('alert')).toHaveCount(0);await app.db.query("INSERT INTO audit_logs(action,user_email,status) VALUES('QA_TEST_AUDIT','QA_TEST_ADMIN','success')");await page.goto('/admin/security');await expect(page.getByText('QA_TEST_AUDIT',{exact:true})).toBeVisible();await page.getByRole('button',{name:'Refresh audit records',exact:true}).click();await expect(page.getByText('QA_TEST_AUDIT',{exact:true})).toBeVisible();await student.goto('/admin/security');await expect(student).toHaveURL(/\/dashboard$/);
  63 | });
  64 | 
  65 | test('Events: administrator creates/edits event, member registration saves one ticket, public link resolves and deletion persists',async({page,browser})=>{
  66 |  await app.connect(page);await page.goto('/admin/events');await page.getByRole('button',{name:'CREATE EVENT',exact:true}).click();const form=page.getByRole('dialog').locator('form');await form.locator('input').nth(0).fill('QA_TEST_EVENT');await form.locator('textarea').fill('QA_TEST_EVENT_BODY');await form.locator('input[type="datetime-local"]').fill('2027-01-15T10:00');await form.locator('input').nth(2).fill('QA_TEST_HALL');await form.locator('button[type="submit"]').click();await expect(page.getByRole('dialog')).toHaveCount(0);const event=await scalar('SELECT * FROM events');expect(event.capacity).toBe(50);
  67 |  await page.getByRole('button',{name:'Edit',exact:true}).click();await page.getByRole('dialog').locator('input').first().fill('QA_TEST_EDITED_EVENT');await page.getByLabel('Event capacity').fill('2');await page.getByRole('dialog').locator('button[type="submit"]').click();await expect(page.getByRole('dialog')).toHaveCount(0);await page.reload();await expect(page.getByText('QA_TEST_EDITED_EVENT',{exact:true})).toBeVisible();
  68 |  const student=await browser.newPage({viewport:test.info().project.use.viewport as any});await app.connect(student,member);await student.goto('/events');await student.getByRole('button',{name:'FILTER',exact:true}).click();await student.getByLabel('Event availability').selectOption('upcoming');await student.getByPlaceholder(/Search/).fill('QA_TEST_EDITED_EVENT');await student.getByRole('button',{name:'INITIALIZE REGISTRATION',exact:true}).click();await expect(student.getByText('Mission Confirmed',{exact:true})).toBeVisible();const saved=await scalar('SELECT registrations,registered_count FROM events');expect(saved.registered_count).toBe(1);expect(saved.registrations[0].qrCode).toBe('REG-'+event.id+'-'+member);await student.getByRole('button',{name:'DISMISS',exact:true}).click();await student.getByRole('button',{name:'INITIALIZE REGISTRATION',exact:true}).click();await expect(student.getByText('Already registered',{exact:true})).toBeVisible();expect((await scalar('SELECT registered_count FROM events')).registered_count).toBe(1);
  69 |  const popup=page.waitForEvent('popup');await page.getByRole('button',{name:'PUBLIC LINK',exact:true}).click();const preview=await popup;await app.connect(preview);await preview.reload();await expect(preview).toHaveURL(new RegExp('/events\\?event='+event.id+'$'));await expect(preview.getByText('QA_TEST_EDITED_EVENT',{exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'VIEW POSTER',exact:true})).toHaveCount(0);
  70 |  await page.getByRole('button',{name:'Delete',exact:true}).click();await page.getByRole('button',{name:'PURGE DATA',exact:true}).click();await expect.poll(async()=>Number((await scalar('SELECT count(*) n FROM events')).n)).toBe(0);
  71 | });
  72 | 
```