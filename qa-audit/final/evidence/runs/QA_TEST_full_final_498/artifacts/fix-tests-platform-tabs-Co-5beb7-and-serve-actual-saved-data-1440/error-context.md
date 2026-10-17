# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: fix-tests\platform-tabs.spec.ts >> Content/Settings/Home/About/Contact: save every content tab, preserve branding fields, reload and serve actual saved data
- Location: qa-audit\fix-tests\platform-tabs.spec.ts:31:1

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: locator.click: Target page, context or browser has been closed
Call log:
  - waiting for getByRole('button', { name: 'Commit Changes', exact: true })
    - locator resolved to <button class="inline-flex items-center justify-center whitespace-nowrap font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 uppercase tracking-widest font-cyber group relative overflow-hidden bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-dark-navy shadow-[0_0_15px_rgba(57,255,20,0.3)] hover:shadow-[0_0_30px_rgba(57,255,20,0.6)] transition-all duration-300 h-14 rounded-md px-12 text-base">…</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="fixed bottom-6 z-40 flex items-center group right-6">…</div> intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="fixed bottom-6 z-40 flex items-center group right-6">…</div> intercepts pointer events
    - retrying click action
      - waiting 100ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="fixed bottom-6 z-40 flex items-center group right-6">…</div> intercepts pointer events
    - retrying click action
      - waiting 500ms
      - waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="fixed bottom-6 z-40 flex items-center group right-6">…</div> intercepts pointer events
    - retrying click action
      - waiting 500ms
      - waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="fixed bottom-6 z-40 flex items-center group right-6">…</div> intercepts pointer events
    - retrying click action
      - waiting 500ms
      - waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="fixed bottom-6 z-40 flex items-center group right-6">…</div> intercepts pointer events
    - retrying click action
      - waiting 500ms
      - waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="fixed bottom-6 z-40 flex items-center group right-6">…</div> intercepts pointer events
    - retrying click action
      - waiting 500ms
      - waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="fixed bottom-6 z-40 flex items-center group right-6">…</div> intercepts pointer events
    - retrying click action
      - waiting 500ms
      - waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="fixed bottom-6 z-40 flex items-center group right-6">…</div> intercepts pointer events
    - retrying click action
      - waiting 500ms
      - waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <span class="font-bold">العربية</span> from <footer class="bg-dark-navy border-t border-white/10 pt-16 pb-8">…</footer> subtree intercepts pointer events
    - retrying click action
      - waiting 500ms
      - waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <span class="font-bold">العربية</span> from <footer class="bg-dark-navy border-t border-white/10 pt-16 pb-8">…</footer> subtree intercepts pointer events
    - retrying click action
      - waiting 500ms
      - waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="fixed bottom-6 z-40 flex items-center group right-6">…</div> intercepts pointer events
    - retrying click action
      - waiting 500ms
      - waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <span class="font-bold">العربية</span> from <footer class="bg-dark-navy border-t border-white/10 pt-16 pb-8">…</footer> subtree intercepts pointer events
    - retrying click action
      - waiting 500ms
      - waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <span class="font-bold">العربية</span> from <footer class="bg-dark-navy border-t border-white/10 pt-16 pb-8">…</footer> subtree intercepts pointer events
    - retrying click action
      - waiting 500ms
      - waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <span class="font-bold">العربية</span> from <footer class="bg-dark-navy border-t border-white/10 pt-16 pb-8">…</footer> subtree intercepts pointer events
    - retrying click action
      - waiting 500ms
      - waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="fixed bottom-6 z-40 flex items-center group right-6">…</div> intercepts pointer events
    - retrying click action
      - waiting 500ms
      - waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <span class="font-bold">العربية</span> from <footer class="bg-dark-navy border-t border-white/10 pt-16 pb-8">…</footer> subtree intercepts pointer events
    - retrying click action
      - waiting 500ms
      - waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="fixed bottom-6 z-40 flex items-center group right-6">…</div> intercepts pointer events
    - retrying click action
      - waiting 500ms
    7 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="fixed bottom-6 z-40 flex items-center group right-6">…</div> intercepts pointer events
    - retrying click action
      - waiting 500ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <span class="font-bold">العربية</span> from <footer class="bg-dark-navy border-t border-white/10 pt-16 pb-8">…</footer> subtree intercepts pointer events
    - retrying click action
      - waiting 500ms
      - waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <span class="font-bold">العربية</span> from <footer class="bg-dark-navy border-t border-white/10 pt-16 pb-8">…</footer> subtree intercepts pointer events
    - retrying click action
      - waiting 500ms
      - waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="fixed bottom-6 z-40 flex items-center group right-6">…</div> intercepts pointer events
    - retrying click action
      - waiting 500ms
      - waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <span class="font-bold">العربية</span> from <footer class="bg-dark-navy border-t border-white/10 pt-16 pb-8">…</footer> subtree intercepts pointer events
    - retrying click action
      - waiting 500ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <span class="font-bold">العربية</span> from <footer class="bg-dark-navy border-t border-white/10 pt-16 pb-8">…</footer> subtree intercepts pointer events
    - retrying click action
      - waiting 500ms
      - waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="fixed bottom-6 z-40 flex items-center group right-6">…</div> intercepts pointer events
    - retrying click action
      - waiting 500ms
      - waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="fixed bottom-6 z-40 flex items-center group right-6">…</div> intercepts pointer events
    - retrying click action
      - waiting 500ms
      - waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="fixed bottom-6 z-40 flex items-center group right-6">…</div> intercepts pointer events
    - retrying click action
      - waiting 500ms
      - waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="fixed bottom-6 z-40 flex items-center group right-6">…</div> intercepts pointer events
    - retrying click action
      - waiting 500ms
      - waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="fixed bottom-6 z-40 flex items-center group right-6">…</div> intercepts pointer events
    - retrying click action
      - waiting 500ms
      - waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="fixed bottom-6 z-40 flex items-center group right-6">…</div> intercepts pointer events
    - retrying click action
      - waiting 500ms
      - waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="fixed bottom-6 z-40 flex items-center group right-6">…</div> intercepts pointer events
    - retrying click action
      - waiting 500ms
      - waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="fixed bottom-6 z-40 flex items-center group right-6">…</div> intercepts pointer events
    - retrying click action
      - waiting 500ms
      - waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="fixed bottom-6 z-40 flex items-center group right-6">…</div> intercepts pointer events
    - retrying click action
      - waiting 500ms
      - waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="fixed bottom-6 z-40 flex items-center group right-6">…</div> intercepts pointer events
    - retrying click action
      - waiting 500ms
      - waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <span class="font-bold">العربية</span> from <footer class="bg-dark-navy border-t border-white/10 pt-16 pb-8">…</footer> subtree intercepts pointer events
    - retrying click action
      - waiting 500ms
      - waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <span class="font-bold">العربية</span> from <footer class="bg-dark-navy border-t border-white/10 pt-16 pb-8">…</footer> subtree intercepts pointer events
    - retrying click action
      - waiting 500ms
      - waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <span class="font-bold">العربية</span> from <footer class="bg-dark-navy border-t border-white/10 pt-16 pb-8">…</footer> subtree intercepts pointer events
    - retrying click action
      - waiting 500ms
      - waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="fixed bottom-6 z-40 flex items-center group right-6">…</div> intercepts pointer events
    - retrying click action
      - waiting 500ms
      - waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <span class="font-bold">العربية</span> from <footer class="bg-dark-navy border-t border-white/10 pt-16 pb-8">…</footer> subtree intercepts pointer events
    - retrying click action
      - waiting 500ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <span class="font-bold">العربية</span> from <footer class="bg-dark-navy border-t border-white/10 pt-16 pb-8">…</footer> subtree intercepts pointer events
    - retrying click action
      - waiting 500ms
    9 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="fixed bottom-6 z-40 flex items-center group right-6">…</div> intercepts pointer events
    - retrying click action
      - waiting 500ms
    3 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <span class="font-bold">العربية</span> from <footer class="bg-dark-navy border-t border-white/10 pt-16 pb-8">…</footer> subtree intercepts pointer events
    - retrying click action
      - waiting 500ms
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling
    - <div class="fixed bottom-6 z-40 flex items-center group right-6">…</div> intercepts pointer events
  - retrying click action
    - waiting 500ms
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling
    - <span class="font-bold">العربية</span> from <footer class="bg-dark-navy border-t border-white/10 pt-16 pb-8">…</footer> subtree intercepts pointer events
  - retrying click action
    - waiting 500ms
    - waiting for element to be visible, enabled and stable

```

# Page snapshot

```yaml
- generic [ref=f1e3]:
  - complementary [ref=f1e313]:
    - link [ref=f1e315] [cursor=pointer]:
      - /url: /
      - generic [ref=f1e316]:
        - generic "DataCamp Official Emblem" [ref=f1e318]:
          - img "DataCamp Emblem" [ref=f1e319]
        - generic "Innovation University Crest" [ref=f1e321]:
          - img "Innovation University Crest" [ref=f1e322]
    - generic [ref=f1e323]:
      - generic [ref=f1e324]:
        - paragraph [ref=f1e325]: Main Menu
        - link "Home" [ref=f1e327] [cursor=pointer]:
          - /url: /
        - link "Courses" [ref=f1e334] [cursor=pointer]:
          - /url: /courses
        - link "My Courses" [ref=f1e340] [cursor=pointer]:
          - /url: /my-courses
        - link "Online Compiler" [ref=f1e347] [cursor=pointer]:
          - /url: /compiler
        - link "Leaderboard" [ref=f1e354] [cursor=pointer]:
          - /url: /leaderboard
        - link "Certificates" [ref=f1e364] [cursor=pointer]:
          - /url: /certificates
        - link "Notifications" [ref=f1e374] [cursor=pointer]:
          - /url: /notifications
        - link "Events" [ref=f1e381] [cursor=pointer]:
          - /url: /events
        - link "Projects" [ref=f1e387] [cursor=pointer]:
          - /url: /projects
        - link "Blog" [ref=f1e394] [cursor=pointer]:
          - /url: /blog
        - link "Staff & Board" [ref=f1e401] [cursor=pointer]:
          - /url: /staff
        - link "Gallery" [ref=f1e410] [cursor=pointer]:
          - /url: /gallery
        - link "About Us" [ref=f1e418] [cursor=pointer]:
          - /url: /about
        - link "Contact" [ref=f1e424] [cursor=pointer]:
          - /url: /contact
      - generic [ref=f1e430]:
        - paragraph [ref=f1e431]: Admin Portal
        - link "Overview" [ref=f1e432] [cursor=pointer]:
          - /url: /admin
        - link "Courses" [ref=f1e436] [cursor=pointer]:
          - /url: /admin/courses
        - link "Points & XP" [ref=f1e440] [cursor=pointer]:
          - /url: /admin/points
        - link "Users" [ref=f1e445] [cursor=pointer]:
          - /url: /admin/users
        - link "Events" [ref=f1e452] [cursor=pointer]:
          - /url: /admin/events
        - link "Forms" [ref=f1e456] [cursor=pointer]:
          - /url: /admin/forms
        - link "Staff" [ref=f1e461] [cursor=pointer]:
          - /url: /admin/staff
        - link "Gallery" [ref=f1e466] [cursor=pointer]:
          - /url: /admin/gallery
        - link "Projects" [ref=f1e472] [cursor=pointer]:
          - /url: /admin/projects
        - link "Blog" [ref=f1e477] [cursor=pointer]:
          - /url: /admin/blog
        - link "Messages" [ref=f1e482] [cursor=pointer]:
          - /url: /admin/messages
        - link "Content" [ref=f1e487] [cursor=pointer]:
          - /url: /admin/content
        - link "Security" [ref=f1e494] [cursor=pointer]:
          - /url: /admin/security
        - link "Profile" [ref=f1e498] [cursor=pointer]:
          - /url: /profile
        - link "Settings" [ref=f1e503] [cursor=pointer]:
          - /url: /admin/settings
    - generic [ref=f1e508]:
      - generic [ref=f1e509]:
        - link "Q QA_TEST_ADMIN Admin" [ref=f1e510] [cursor=pointer]:
          - /url: /profile
          - generic [ref=f1e511]: Q
          - generic [ref=f1e513]:
            - paragraph [ref=f1e514]: QA_TEST_ADMIN
            - paragraph [ref=f1e515]: Admin
        - button "Logout" [ref=f1e516]
      - generic [ref=f1e522]:
        - button "العربية" [ref=f1e523]
        - button "English" [ref=f1e525]
      - button [ref=f1e527]
  - generic [ref=f1e530]:
    - generic [ref=f1e532]:
      - button "العربية" [ref=f1e533]
      - button "EN" [ref=f1e535]
    - main [ref=f1e538]:
      - generic [ref=f1e541]:
        - generic [ref=f1e542]:
          - heading "System Settings" [level=1] [ref=f1e543]
          - paragraph [ref=f1e544]: Configure global platform parameters and branding.
        - generic [ref=f1e545]:
          - generic [ref=f1e548]:
            - generic [ref=f1e549]:
              - heading "General Branding" [level=3] [ref=f1e554]
              - paragraph [ref=f1e555]: Update the public identity of the platform.
            - generic [ref=f1e556]:
              - generic [ref=f1e557]:
                - text: Platform Main Name (Logo)
                - textbox [active] [ref=f1e558]: QA_TEST_UPDATED_BRAND
              - generic [ref=f1e559]:
                - text: Platform Sub Name
                - textbox [ref=f1e560]: Student Club
              - generic [ref=f1e562]:
                - text: Platform Logo
                - generic [ref=f1e569]:
                  - button "IMPORT_FROM_DEVICE" [ref=f1e570]
                  - button "SELECT_PHOTO_ARCHIVE" [ref=f1e574]
                  - button "TAKE_PHOTO" [ref=f1e579]
              - generic [ref=f1e583]:
                - text: Tagline / Description
                - textbox [ref=f1e584]
              - generic [ref=f1e585]:
                - generic [ref=f1e586]:
                  - text: Contact Email
                  - textbox [ref=f1e587]: QA_TEST_CONTACT@example.invalid
                - generic [ref=f1e588]:
                  - text: Contact Phone
                  - textbox [ref=f1e589]
          - generic [ref=f1e592]:
            - generic [ref=f1e593]:
              - generic [ref=f1e594]:
                - heading "Social Media Grid" [level=3] [ref=f1e599]
                - paragraph [ref=f1e600]: Manage links to your external platforms.
              - button "Add Link" [ref=f1e601]
            - generic [ref=f1e604]:
              - generic [ref=f1e605]:
                - generic [ref=f1e606]:
                  - text: Platform
                  - textbox "e.g. Facebook" [ref=f1e607]: github
                - generic [ref=f1e608]:
                  - text: URL
                  - textbox "https://..." [ref=f1e609]: https://github.com/QA_TEST
              - button "Delete" [ref=f1e610]
          - generic [ref=f1e616]:
            - generic [ref=f1e617]:
              - heading "Visual Identity" [level=3] [ref=f1e625]
              - paragraph [ref=f1e626]: Customize the look and feel of the interface.
            - generic [ref=f1e628]:
              - text: Primary Neon Color
              - generic [ref=f1e629]:
                - textbox [ref=f1e630]: "#39ff14"
                - generic [ref=f1e631]: "#39FF14"
          - generic [ref=f1e634]:
            - generic [ref=f1e635]:
              - heading "Access Control" [level=3] [ref=f1e639]
              - paragraph [ref=f1e640]: Manage registration and system availability.
            - generic [ref=f1e641]:
              - generic [ref=f1e642]:
                - generic [ref=f1e643]:
                  - generic [ref=f1e644]: Open Registration
                  - generic [ref=f1e645]: Allow new students to initialize accounts.
                - button [ref=f1e646]
              - generic [ref=f1e648]:
                - generic [ref=f1e649]:
                  - generic [ref=f1e650]: Maintenance Mode
                  - generic [ref=f1e651]: Lock the platform for system updates.
                - button [ref=f1e652]
          - generic [ref=f1e656]:
            - generic [ref=f1e657]:
              - heading "Data Management" [level=3] [ref=f1e663]
              - paragraph [ref=f1e664]: Export platform records and clear this browser’s caches.
            - generic [ref=f1e665]:
              - button "Export Platform Records" [ref=f1e666]
              - button "Clear Browser Cache" [ref=f1e671]
        - button "Commit Changes" [ref=f1e673]
    - contentinfo [ref=f1e678]:
      - generic [ref=f1e679]:
        - generic [ref=f1e680]:
          - generic [ref=f1e681]:
            - link [ref=f1e682] [cursor=pointer]:
              - /url: /
              - generic [ref=f1e683]:
                - generic "DataCamp Official Emblem" [ref=f1e685]:
                  - img "DataCamp Emblem" [ref=f1e686]
                - generic "Innovation University Crest" [ref=f1e688]:
                  - img "Innovation University Crest" [ref=f1e689]
            - paragraph [ref=f1e690]: Empowering students with data science, AI, and software engineering skills.
            - link "DataCamp Student Club on github" [ref=f1e692] [cursor=pointer]:
              - /url: https://github.com/QA_TEST
          - generic [ref=f1e696]:
            - heading "Quick Links" [level=2] [ref=f1e697]
            - list [ref=f1e698]:
              - listitem [ref=f1e699]:
                - link "About Us" [ref=f1e700] [cursor=pointer]:
                  - /url: /about
              - listitem [ref=f1e701]:
                - link "Courses" [ref=f1e702] [cursor=pointer]:
                  - /url: /courses
              - listitem [ref=f1e703]:
                - link "Events" [ref=f1e704] [cursor=pointer]:
                  - /url: /events
              - listitem [ref=f1e705]:
                - link "Projects" [ref=f1e706] [cursor=pointer]:
                  - /url: /projects
              - listitem [ref=f1e707]:
                - link "Blog" [ref=f1e708] [cursor=pointer]:
                  - /url: /blog
              - listitem [ref=f1e709]:
                - link "Staff & Board" [ref=f1e710] [cursor=pointer]:
                  - /url: /staff
              - listitem [ref=f1e711]:
                - link "Gallery" [ref=f1e712] [cursor=pointer]:
                  - /url: /gallery
          - generic [ref=f1e713]:
            - heading "Support" [level=2] [ref=f1e714]
            - list [ref=f1e715]:
              - listitem [ref=f1e716]:
                - link "FAQ" [ref=f1e717] [cursor=pointer]:
                  - /url: /faq
              - listitem [ref=f1e718]:
                - link "Contact" [ref=f1e719] [cursor=pointer]:
                  - /url: /contact
              - listitem [ref=f1e720]:
                - link "Privacy Policy" [ref=f1e721] [cursor=pointer]:
                  - /url: /privacy
              - listitem [ref=f1e722]:
                - link "Terms of Service" [ref=f1e723] [cursor=pointer]:
                  - /url: /terms
          - generic [ref=f1e724]:
            - heading "Contact Info" [level=2] [ref=f1e725]
            - list [ref=f1e726]:
              - listitem [ref=f1e727]:
                - generic [ref=f1e731]: QA_TEST_CONTACT@example.invalid
              - listitem [ref=f1e732]:
                - generic [ref=f1e735]: Not configured
              - listitem [ref=f1e736]:
                - generic [ref=f1e740]: Not configured
        - generic [ref=f1e741]:
          - paragraph [ref=f1e742]: © 2026 QA_TEST_BRAND. All rights reserved.
          - generic [ref=f1e743]:
            - button "العربية" [ref=f1e744]
            - generic [ref=f1e749]: "VERSION: 2.5.0-AR"
  - generic [ref=f1e750]:
    - generic: NEXUS AI MENTOR
    - button "Open AI Mentor" [ref=f1e751]
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
  28 |  await page.getByRole('button',{name:'Delete',exact:true}).click();await page.getByRole('button',{name:'CONFIRM_PURGE',exact:true}).click();await expect.poll(async()=>Number((await scalar('SELECT count(*) n FROM gallery')).n)).toBe(0);
  29 | });
  30 | 
  31 | test('Content/Settings/Home/About/Contact: save every content tab, preserve branding fields, reload and serve actual saved data',async({page,browser})=>{
  32 |  await app.db.query("INSERT INTO settings(key,value) VALUES('general',$1)",[JSON.stringify({siteName:'QA_TEST_BRAND',contactEmail:'QA_TEST_CONTACT@example.invalid',enableRegistration:false,maintenanceMode:false,socialLinks:[]})]);
  33 |  await app.connect(page);await page.goto('/admin/content');await expect(page.getByRole('button',{name:'Save All Changes',exact:true})).toBeEnabled();await page.locator('main input').first().fill('QA_TEST_HOME');await expect(page.locator('main input').first()).toHaveValue('QA_TEST_HOME');await page.locator('main textarea').first().fill('QA_TEST_SUBTITLE');
  34 |  await page.getByRole('button',{name:'About Us',exact:true}).click();await page.locator('main textarea').nth(0).fill('QA_TEST_MISSION');await page.locator('main textarea').nth(1).fill('QA_TEST_VISION');await page.locator('main textarea').nth(2).fill('QA_TEST_HISTORY');
  35 |  await page.getByRole('button',{name:'Discord & Social Links',exact:true}).click();await page.getByPlaceholder('https://discord.gg/your-club-invite').fill('https://discord.gg/QA_TEST');await page.getByPlaceholder('https://github.com/datacamp-club').fill('https://github.com/QA_TEST');await page.getByRole('button',{name:'Save All Changes',exact:true}).click();await expect(page.getByText('All content changes saved to database',{exact:true})).toBeVisible();
  36 |  expect((await scalar("SELECT value FROM settings WHERE key='home_content'")).value.heroTitle).toBe('QA_TEST_HOME');expect((await scalar("SELECT value FROM settings WHERE key='about_data'")).value.history).toBe('QA_TEST_HISTORY');expect((await scalar("SELECT value FROM settings WHERE key='general'")).value).toMatchObject({siteName:'QA_TEST_BRAND',contactEmail:'QA_TEST_CONTACT@example.invalid',enableRegistration:false,discordUrl:'https://discord.gg/QA_TEST'});
> 37 |  await page.goto('/admin/settings');await expect(page.locator('main input').first()).toHaveValue('QA_TEST_BRAND');await page.locator('main input').first().fill('QA_TEST_UPDATED_BRAND');await page.getByRole('button',{name:'Commit Changes',exact:true}).click();await expect(page.getByText('System settings saved to Supabase',{exact:true})).toBeVisible();expect((await scalar("SELECT value FROM settings WHERE key='general'")).value.discordUrl).toBe('https://discord.gg/QA_TEST');
     |                                                                                                                                                                                                                                                            ^ Error: locator.click: Target page, context or browser has been closed
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