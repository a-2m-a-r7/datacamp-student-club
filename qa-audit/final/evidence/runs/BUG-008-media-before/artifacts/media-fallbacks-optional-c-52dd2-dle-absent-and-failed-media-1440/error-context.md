# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: media-fallbacks.spec.ts >> optional course covers and account photos handle absent and failed media
- Location: qa-audit\final\tests\media-fallbacks.spec.ts:4:1

# Error details

```
Error: /courses

expect(received).toEqual(expected) // deep equality

- Expected  -  1
+ Received  + 10

- Array []
+ Array [
+   Object {
+     "alt": "Profile",
+     "src": "https://qa-test.supabase.co/storage/v1/object/public/avatars/00000000-0000-4000-8000-000000000301/QA_TEST_missing.png",
+   },
+   Object {
+     "alt": "QA_TEST_MEDIA_BAD",
+     "src": "http://127.0.0.1:3100/QA_TEST_broken.png",
+   },
+ ]
```

```
Error: /my-courses

expect(received).toEqual(expected) // deep equality

- Expected  -  1
+ Received  + 10

- Array []
+ Array [
+   Object {
+     "alt": "Profile",
+     "src": "https://qa-test.supabase.co/storage/v1/object/public/avatars/00000000-0000-4000-8000-000000000301/QA_TEST_missing.png",
+   },
+   Object {
+     "alt": "QA_TEST_MEDIA_BAD",
+     "src": "http://127.0.0.1:3100/QA_TEST_broken.png",
+   },
+ ]
```

```
Error: /courses/qa-test-media-bad

expect(received).toEqual(expected) // deep equality

- Expected  -  1
+ Received  + 10

- Array []
+ Array [
+   Object {
+     "alt": "Profile",
+     "src": "https://qa-test.supabase.co/storage/v1/object/public/avatars/00000000-0000-4000-8000-000000000301/QA_TEST_missing.png",
+   },
+   Object {
+     "alt": "QA_TEST_MEDIA_BAD",
+     "src": "http://127.0.0.1:3100/QA_TEST_broken.png",
+   },
+ ]
```

```
Error: /admin/courses

expect(received).toEqual(expected) // deep equality

- Expected  -  1
+ Received  + 10

- Array []
+ Array [
+   Object {
+     "alt": "Profile",
+     "src": "https://qa-test.supabase.co/storage/v1/object/public/avatars/00000000-0000-4000-8000-000000000301/QA_TEST_missing.png",
+   },
+   Object {
+     "alt": "QA_TEST_MEDIA_BAD",
+     "src": "http://127.0.0.1:3100/QA_TEST_broken.png",
+   },
+ ]
```

```
Error: /admin/users

expect(received).toEqual(expected) // deep equality

- Expected  -  1
+ Received  + 10

- Array []
+ Array [
+   Object {
+     "alt": "Profile",
+     "src": "https://qa-test.supabase.co/storage/v1/object/public/avatars/00000000-0000-4000-8000-000000000301/QA_TEST_missing.png",
+   },
+   Object {
+     "alt": "QA_TEST_ADMIN",
+     "src": "https://qa-test.supabase.co/storage/v1/object/public/avatars/00000000-0000-4000-8000-000000000301/QA_TEST_missing.png",
+   },
+ ]
```

# Page snapshot

```yaml
- generic [ref=f4e3]:
  - complementary [ref=f4e313]:
    - link [ref=f4e315] [cursor=pointer]:
      - /url: /
      - generic [ref=f4e316]:
        - generic "DataCamp Official Emblem" [ref=f4e318]:
          - img "DataCamp Emblem" [ref=f4e319]
        - generic "Innovation University Crest" [ref=f4e321]:
          - img "Innovation University Crest" [ref=f4e322]
    - generic [ref=f4e323]:
      - generic [ref=f4e324]:
        - paragraph [ref=f4e325]: Main Menu
        - link "Home" [ref=f4e327] [cursor=pointer]:
          - /url: /
        - link "Courses" [ref=f4e334] [cursor=pointer]:
          - /url: /courses
        - link "My Courses" [ref=f4e340] [cursor=pointer]:
          - /url: /my-courses
        - link "Online Compiler" [ref=f4e347] [cursor=pointer]:
          - /url: /compiler
        - link "Leaderboard" [ref=f4e354] [cursor=pointer]:
          - /url: /leaderboard
        - link "Certificates" [ref=f4e364] [cursor=pointer]:
          - /url: /certificates
        - link "Notifications" [ref=f4e374] [cursor=pointer]:
          - /url: /notifications
        - link "Events" [ref=f4e381] [cursor=pointer]:
          - /url: /events
        - link "Projects" [ref=f4e387] [cursor=pointer]:
          - /url: /projects
        - link "Blog" [ref=f4e394] [cursor=pointer]:
          - /url: /blog
        - link "Staff & Board" [ref=f4e401] [cursor=pointer]:
          - /url: /staff
        - link "Gallery" [ref=f4e410] [cursor=pointer]:
          - /url: /gallery
        - link "About Us" [ref=f4e418] [cursor=pointer]:
          - /url: /about
        - link "Contact" [ref=f4e424] [cursor=pointer]:
          - /url: /contact
      - generic [ref=f4e430]:
        - paragraph [ref=f4e431]: Admin Portal
        - link "Overview" [ref=f4e432] [cursor=pointer]:
          - /url: /admin
        - link "Courses" [ref=f4e436] [cursor=pointer]:
          - /url: /admin/courses
        - link "Points & XP" [ref=f4e440] [cursor=pointer]:
          - /url: /admin/points
        - link "Users" [ref=f4e445] [cursor=pointer]:
          - /url: /admin/users
        - link "Events" [ref=f4e452] [cursor=pointer]:
          - /url: /admin/events
        - link "Forms" [ref=f4e456] [cursor=pointer]:
          - /url: /admin/forms
        - link "Staff" [ref=f4e461] [cursor=pointer]:
          - /url: /admin/staff
        - link "Gallery" [ref=f4e466] [cursor=pointer]:
          - /url: /admin/gallery
        - link "Projects" [ref=f4e472] [cursor=pointer]:
          - /url: /admin/projects
        - link "Blog" [ref=f4e477] [cursor=pointer]:
          - /url: /admin/blog
        - link "Messages" [ref=f4e482] [cursor=pointer]:
          - /url: /admin/messages
        - link "Content" [ref=f4e487] [cursor=pointer]:
          - /url: /admin/content
        - link "Security" [ref=f4e494] [cursor=pointer]:
          - /url: /admin/security
        - link "Profile" [ref=f4e498] [cursor=pointer]:
          - /url: /profile
        - link "Settings" [ref=f4e503] [cursor=pointer]:
          - /url: /admin/settings
    - generic [ref=f4e508]:
      - generic [ref=f4e509]:
        - link [ref=f4e510] [cursor=pointer]:
          - /url: /profile
          - img "Profile" [ref=f4e512]
          - generic [ref=f4e513]:
            - paragraph [ref=f4e514]: QA_TEST_ADMIN
            - paragraph [ref=f4e515]: Admin
        - button "Logout" [ref=f4e516]
      - generic [ref=f4e522]:
        - button "العربية" [ref=f4e523]
        - button "English" [ref=f4e525]
      - button [ref=f4e527]
  - generic [ref=f4e530]:
    - generic [ref=f4e532]:
      - button "العربية" [ref=f4e533]
      - button "EN" [ref=f4e535]
    - main [ref=f4e538]:
      - generic [ref=f4e541]:
        - generic [ref=f4e542]:
          - generic [ref=f4e543]:
            - generic [ref=f4e544]:
              - heading "USER MANAGEMENT & REALTIME INTEL" [level=1] [ref=f4e545]
              - generic [ref=f4e546]: SUPABASE v2
            - paragraph [ref=f4e547]: Realtime member control, session tracking, permission grants, and analytics.
          - generic [ref=f4e548]:
            - button "SYNC CLOUD ⚡" [ref=f4e549]
            - button "HIDE LIVE FEED" [ref=f4e556]
            - button "EXPORT" [ref=f4e564]
            - button "ADD OPERATIVE" [ref=f4e568]
        - generic [ref=f4e572]:
          - generic [ref=f4e573]:
            - generic [ref=f4e575]:
              - paragraph [ref=f4e576]: TOTAL OPERATIVES
              - heading "3" [level=3] [ref=f4e577]
            - generic [ref=f4e584]:
              - generic [ref=f4e585]: ●
              - text: Synced with Cloud DB
          - generic [ref=f4e586]:
            - generic [ref=f4e588]:
              - paragraph [ref=f4e589]: NEW TODAY
              - heading "+3" [level=3] [ref=f4e590]
            - generic [ref=f4e595]: Registered past 24h
          - generic [ref=f4e599]:
            - generic [ref=f4e601]:
              - paragraph [ref=f4e602]: ACTIVE NOW
              - heading "3" [level=3] [ref=f4e603]
            - generic [ref=f4e612]:
              - generic [ref=f4e613]: ●
              - text: Heartbeat active (<3m)
          - generic [ref=f4e614]:
            - generic [ref=f4e616]:
              - paragraph [ref=f4e617]: TODAY IN RECENT LOGINS
              - heading "0" [level=3] [ref=f4e618]
            - generic [ref=f4e623]: Within the last 40 authentication events
        - generic [ref=f4e628]:
          - generic [ref=f4e629]:
            - heading "LIVE AUTH_EVENTS STREAM" [level=3] [ref=f4e632]
            - generic [ref=f4e639]: 0 events captured
          - paragraph [ref=f4e641]: Awaiting live authentication events from Supabase...
        - generic [ref=f4e642]:
          - button "OPERATIVES_ROSTER 3" [ref=f4e643]:
            - generic [ref=f4e647]: OPERATIVES_ROSTER
            - generic [ref=f4e648]: "3"
          - button "ROLES_PERMISSIONS_MATRIX 2 Roles" [ref=f4e649]:
            - generic [ref=f4e652]: ROLES_PERMISSIONS_MATRIX
            - generic [ref=f4e653]: 2 Roles
        - generic [ref=f4e656]:
          - generic [ref=f4e657]:
            - generic [ref=f4e658]:
              - textbox "Search by name, ID, or email..." [ref=f4e663]
              - generic [ref=f4e664] [cursor=pointer]: IMPORT_CSV
            - generic [ref=f4e669]:
              - generic [ref=f4e670]:
                - generic [ref=f4e673]: "Role:"
                - combobox [ref=f4e674] [cursor=pointer]:
                  - option "ALL" [selected]
                  - option "Super Administrator (SUPER_ADMIN)"
                  - option "Club Member (MEMBER)"
              - generic [ref=f4e675]:
                - generic [ref=f4e679]: "Provider:"
                - combobox [ref=f4e680] [cursor=pointer]:
                  - option "ALL" [selected]
                  - option "Google"
                  - option "Email / Pass"
              - generic [ref=f4e681]:
                - generic [ref=f4e688]: "Status:"
                - combobox [ref=f4e689] [cursor=pointer]:
                  - option "ALL" [selected]
                  - option "Online Now"
                  - option "Active"
                  - option "Inactive"
              - generic [ref=f4e690]:
                - generic [ref=f4e694]: "Sort:"
                - combobox [ref=f4e695] [cursor=pointer]:
                  - option "Newest" [selected]
                  - option "Oldest"
                  - option "Last Seen"
                  - option "Name A-Z"
                  - option "Highest Points"
          - table [ref=f4e698]:
            - rowgroup [ref=f4e699]:
              - row [ref=f4e700]:
                - columnheader "Operative" [ref=f4e701]
                - columnheader "Member ID" [ref=f4e702]
                - columnheader "Provider" [ref=f4e703]
                - columnheader "Presence" [ref=f4e704]
                - columnheader "Courses" [ref=f4e705]
                - columnheader "Role & Clearance" [ref=f4e706]
                - columnheader "Actions" [ref=f4e707]
            - rowgroup [ref=f4e708]:
              - row [ref=f4e709]:
                - cell "Q Online now QA_TEST_MEMBER QA_TEST_MEMBER@example.invalid" [ref=f4e710]:
                  - generic [ref=f4e711]:
                    - generic [ref=f4e712]:
                      - generic [ref=f4e713]: Q
                      - generic "Online now" [ref=f4e714]
                    - generic [ref=f4e715]:
                      - generic [ref=f4e716]: QA_TEST_MEMBER
                      - generic [ref=f4e718]: QA_TEST_MEMBER@example.invalid
                - cell "DC-00000000000040008000000000000302 0 PTS" [ref=f4e719]:
                  - generic [ref=f4e720]: DC-00000000000040008000000000000302
                  - generic [ref=f4e721]: 0 PTS
                - cell "Email" [ref=f4e722]
                - cell "ONLINE ● ACTIVE" [ref=f4e727]:
                  - generic [ref=f4e728]: ONLINE
                  - generic [ref=f4e731]: ● ACTIVE
                - cell "0 courses" [ref=f4e733]
                - cell [ref=f4e735]:
                  - generic [ref=f4e736]:
                    - button "PROMOTE" [ref=f4e737] [cursor=pointer]
                    - combobox "Change Role" [ref=f4e741] [cursor=pointer]:
                      - option "super_admin"
                      - option "member" [selected]
                - cell [ref=f4e742]:
                  - generic [ref=f4e743]:
                    - button "Permissions Editor" [ref=f4e744]
                    - button "View Intel" [ref=f4e747]
                    - button "Delete Operative" [ref=f4e751]
              - row [ref=f4e755]:
                - cell "Q Online now QA_TEST_OTHER QA_TEST_OTHER@example.invalid" [ref=f4e756]:
                  - generic [ref=f4e757]:
                    - generic [ref=f4e758]:
                      - generic [ref=f4e759]: Q
                      - generic "Online now" [ref=f4e760]
                    - generic [ref=f4e761]:
                      - generic [ref=f4e762]: QA_TEST_OTHER
                      - generic [ref=f4e764]: QA_TEST_OTHER@example.invalid
                - cell "DC-00000000000040008000000000000303 0 PTS" [ref=f4e765]:
                  - generic [ref=f4e766]: DC-00000000000040008000000000000303
                  - generic [ref=f4e767]: 0 PTS
                - cell "Email" [ref=f4e768]
                - cell "ONLINE ● ACTIVE" [ref=f4e773]:
                  - generic [ref=f4e774]: ONLINE
                  - generic [ref=f4e777]: ● ACTIVE
                - cell "0 courses" [ref=f4e779]
                - cell [ref=f4e781]:
                  - generic [ref=f4e782]:
                    - button "PROMOTE" [ref=f4e783] [cursor=pointer]
                    - combobox "Change Role" [ref=f4e787] [cursor=pointer]:
                      - option "super_admin"
                      - option "member" [selected]
                - cell [ref=f4e788]:
                  - generic [ref=f4e789]:
                    - button "Permissions Editor" [ref=f4e790]
                    - button "View Intel" [ref=f4e793]
                    - button "Delete Operative" [ref=f4e797]
              - row [ref=f4e801]:
                - cell "QA_TEST_ADMIN Online now QA_TEST_ADMIN QA_TEST_ADMIN@example.invalid" [ref=f4e802]:
                  - generic [ref=f4e803]:
                    - generic [ref=f4e804]:
                      - img "QA_TEST_ADMIN" [ref=f4e806]
                      - generic "Online now" [ref=f4e807]
                    - generic [ref=f4e808]:
                      - generic [ref=f4e809]: QA_TEST_ADMIN
                      - generic [ref=f4e813]: QA_TEST_ADMIN@example.invalid
                - cell "DC-00000000000040008000000000000301 5 PTS" [ref=f4e814]:
                  - generic [ref=f4e815]: DC-00000000000040008000000000000301
                  - generic [ref=f4e816]: 5 PTS
                - cell "Email" [ref=f4e817]
                - cell "ONLINE ● ACTIVE" [ref=f4e822]:
                  - generic [ref=f4e823]: ONLINE
                  - generic [ref=f4e826]: ● ACTIVE
                - cell "1 courses" [ref=f4e828]
                - cell "ADMIN 👑 super_admin" [ref=f4e830]:
                  - generic [ref=f4e831]:
                    - generic [ref=f4e832]: ADMIN 👑
                    - combobox "Change Role" [ref=f4e836] [cursor=pointer]:
                      - option "super_admin" [selected]
                      - option "member"
                - cell [ref=f4e837]:
                  - generic [ref=f4e838]:
                    - button "Permissions Editor" [ref=f4e839]
                    - button "View Intel" [ref=f4e842]
                    - button "Delete Operative" [ref=f4e846]
    - contentinfo [ref=f4e850]:
      - generic [ref=f4e851]:
        - generic [ref=f4e852]:
          - generic [ref=f4e853]:
            - link [ref=f4e854] [cursor=pointer]:
              - /url: /
              - generic [ref=f4e855]:
                - generic "DataCamp Official Emblem" [ref=f4e857]:
                  - img "DataCamp Emblem" [ref=f4e858]
                - generic "Innovation University Crest" [ref=f4e860]:
                  - img "Innovation University Crest" [ref=f4e861]
            - paragraph [ref=f4e862]: Empowering students with data science, AI, and software engineering skills.
          - generic [ref=f4e863]:
            - heading "Quick Links" [level=4] [ref=f4e864]
            - list [ref=f4e865]:
              - listitem [ref=f4e866]:
                - link "About Us" [ref=f4e867] [cursor=pointer]:
                  - /url: /about
              - listitem [ref=f4e868]:
                - link "Courses" [ref=f4e869] [cursor=pointer]:
                  - /url: /courses
              - listitem [ref=f4e870]:
                - link "Events" [ref=f4e871] [cursor=pointer]:
                  - /url: /events
              - listitem [ref=f4e872]:
                - link "Projects" [ref=f4e873] [cursor=pointer]:
                  - /url: /projects
              - listitem [ref=f4e874]:
                - link "Blog" [ref=f4e875] [cursor=pointer]:
                  - /url: /blog
              - listitem [ref=f4e876]:
                - link "Staff & Board" [ref=f4e877] [cursor=pointer]:
                  - /url: /staff
              - listitem [ref=f4e878]:
                - link "Gallery" [ref=f4e879] [cursor=pointer]:
                  - /url: /gallery
          - generic [ref=f4e880]:
            - heading "Support" [level=4] [ref=f4e881]
            - list [ref=f4e882]:
              - listitem [ref=f4e883]:
                - link "FAQ" [ref=f4e884] [cursor=pointer]:
                  - /url: /faq
              - listitem [ref=f4e885]:
                - link "Contact" [ref=f4e886] [cursor=pointer]:
                  - /url: /contact
              - listitem [ref=f4e887]:
                - link "Privacy Policy" [ref=f4e888] [cursor=pointer]:
                  - /url: /privacy
              - listitem [ref=f4e889]:
                - link "Terms of Service" [ref=f4e890] [cursor=pointer]:
                  - /url: /terms
          - generic [ref=f4e891]:
            - heading "Contact Info" [level=4] [ref=f4e892]
            - list [ref=f4e893]:
              - listitem [ref=f4e894]:
                - generic [ref=f4e898]: Not configured
              - listitem [ref=f4e899]:
                - generic [ref=f4e902]: Not configured
              - listitem [ref=f4e903]:
                - generic [ref=f4e907]: Not configured
        - generic [ref=f4e908]:
          - paragraph [ref=f4e909]: © 2026 DataCamp. All rights reserved.
          - generic [ref=f4e910]:
            - button "العربية" [ref=f4e911]
            - generic [ref=f4e916]: "VERSION: 2.5.0-AR"
  - generic [ref=f4e917]:
    - generic: NEXUS AI MENTOR
    - button "Open AI Mentor" [ref=f4e918]
  - region "Notifications alt+T"
```

# Test source

```ts
  1  | import {test,expect} from '@playwright/test';
  2  | import {randomUUID} from 'node:crypto';
  3  | import {platform,admin} from '../../fix-tests/persisted-platform';
  4  | test('optional course covers and account photos handle absent and failed media',async({page},info)=>{
  5  |  const app=await platform();try{
  6  |   const course=randomUUID(),lesson=randomUUID();
  7  |   await app.db.query("INSERT INTO courses(id,title,slug,thumbnail_url,is_published) VALUES($1,'QA_TEST_MEDIA_BAD','qa-test-media-bad','http://127.0.0.1:3100/QA_TEST_broken.png',false)",[course]);
  8  |   await app.db.query("INSERT INTO lessons(id,course_id,title,type) VALUES($1,$2,'QA_TEST_MEDIA_LESSON','article')",[lesson,course]);
  9  |   await app.db.query('UPDATE courses SET is_published=true WHERE id=$1',[course]);
  10 |   await app.asUser(admin,tx=>tx.query('SELECT enroll_course($1)',[course]));
  11 |   await app.db.query('UPDATE profiles SET photo_url=$2,avatar_url=$2 WHERE id=$1',[admin,`https://qa-test.supabase.co/storage/v1/object/public/avatars/${admin}/QA_TEST_missing.png`]);
  12 |   await app.connect(page,admin);await page.route('**/QA_TEST_broken.png',r=>r.fulfill({status:404,body:''}));
  13 |   const observations:any[]=[];
  14 |   for(const route of ['/courses','/my-courses','/courses/qa-test-media-bad','/admin/courses','/admin/users']){
  15 |    await page.goto(route);if(route==='/admin/users')await expect(page.getByPlaceholder('Search by name, ID, or email...')).toBeVisible();else await expect(page.getByText('QA_TEST_MEDIA_BAD',{exact:true}).first()).toBeVisible();
  16 |    await page.locator('img').evaluateAll(async images=>Promise.all(images.map(image=>new Promise<void>(resolve=>{const img=image as HTMLImageElement;if(img.complete)resolve();else{img.addEventListener('load',()=>resolve(),{once:true});img.addEventListener('error',()=>resolve(),{once:true});}}))));
  17 |    const broken=await page.locator('img').evaluateAll(images=>images.filter(image=>(image as HTMLImageElement).complete&&(image as HTMLImageElement).naturalWidth===0&&(image as HTMLElement).offsetWidth>0).map(image=>({src:image.getAttribute('src'),alt:image.getAttribute('alt')})));
  18 |    observations.push({route,broken});if(broken.length)await page.screenshot({path:info.outputPath('QA_TEST_'+route.replace(/\W/g,'_')+'.png')});
> 19 |    expect.soft(broken,route).toEqual([]);
     |                              ^ Error: /admin/users
  20 |   }
  21 |   await info.attach('media-observations',{body:JSON.stringify(observations),contentType:'application/json'});
  22 |  }finally{await app.db.close();}
  23 | });
  24 | 
```