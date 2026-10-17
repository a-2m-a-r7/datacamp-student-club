# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: loading-layout.spec.ts >> loading route reserves footer space en 768
- Location: qa-audit\final\production-tests\loading-layout.spec.ts:2:69

# Error details

```
Error: expect(received).toBeGreaterThanOrEqual(expected)

Expected: >= 899
Received:    514
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
      - generic [ref=e332]:
        - generic [ref=e338]:
          - generic [ref=e339]:
            - generic [ref=e340]: Next Generation Tech Community
            - heading "THE FUTURE OF DATA IS HERE" [level=1] [ref=e341]
          - paragraph [ref=e342]: Join the elite community of data scientists and software engineers.
          - generic [ref=e343]:
            - link [ref=e344] [cursor=pointer]:
              - /url: /register
              - button "Initialize Membership • Join Now" [ref=e345]
            - link [ref=e348] [cursor=pointer]:
              - /url: /courses
              - button "Explore Courses" [ref=e349]
            - link [ref=e350] [cursor=pointer]:
              - /url: /compiler
              - button "Launch Compiler" [ref=e351]
        - generic [ref=e353]:
          - generic [ref=e354]:
            - generic [ref=e362]: —
            - generic [ref=e363]: Active Members
          - generic [ref=e364]:
            - generic [ref=e369]: —
            - generic [ref=e370]: Events Hosted
          - generic [ref=e371]:
            - generic [ref=e377]: —
            - generic [ref=e378]: Projects Completed
          - generic [ref=e379]:
            - generic [ref=e385]: —
            - generic [ref=e386]: Certificates Issued
        - generic [ref=e387]:
          - generic [ref=e388]:
            - heading "Core Domains" [level=2] [ref=e389]
            - paragraph [ref=e390]: We focus on the most impactful technologies shaping our world today.
          - generic [ref=e391]:
            - generic [ref=e396]:
              - heading "Data Science" [level=3] [ref=e402]
              - paragraph [ref=e403]: Master Python, R, and statistical modeling with our expert-led workshops.
            - generic [ref=e409]:
              - heading "AI & ML" [level=3] [ref=e414]
              - paragraph [ref=e415]: Deep dive into neural networks, computer vision, and natural language processing.
            - generic [ref=e421]:
              - heading "Software Engineering" [level=3] [ref=e425]
              - paragraph [ref=e426]: Build scalable applications using modern stacks and industry best practices.
        - generic [ref=e431]:
          - heading "Ready to upgrade your skills?" [level=2] [ref=e432]
          - paragraph [ref=e433]: Join our student community to learn and build together. Membership is free for all university students.
          - link [ref=e434] [cursor=pointer]:
            - /url: /register
            - button "Join the club now" [ref=e435]
    - contentinfo [ref=e436]:
      - generic [ref=e437]:
        - generic [ref=e438]:
          - generic [ref=e439]:
            - link [ref=e440] [cursor=pointer]:
              - /url: /
              - generic [ref=e441]:
                - generic "DataCamp Official Emblem" [ref=e443]:
                  - img "DataCamp Emblem" [ref=e444]
                - generic "Innovation University Crest" [ref=e446]:
                  - img "Innovation University Crest" [ref=e447]
            - paragraph [ref=e448]: Empowering students with data science, AI, and software engineering skills.
          - generic [ref=e449]:
            - heading "Quick Links" [level=4] [ref=e450]
            - list [ref=e451]:
              - listitem [ref=e452]:
                - link "About Us" [ref=e453] [cursor=pointer]:
                  - /url: /about
              - listitem [ref=e454]:
                - link "Courses" [ref=e455] [cursor=pointer]:
                  - /url: /courses
              - listitem [ref=e456]:
                - link "Events" [ref=e457] [cursor=pointer]:
                  - /url: /events
              - listitem [ref=e458]:
                - link "Projects" [ref=e459] [cursor=pointer]:
                  - /url: /projects
              - listitem [ref=e460]:
                - link "Blog" [ref=e461] [cursor=pointer]:
                  - /url: /blog
              - listitem [ref=e462]:
                - link "Staff & Board" [ref=e463] [cursor=pointer]:
                  - /url: /staff
              - listitem [ref=e464]:
                - link "Gallery" [ref=e465] [cursor=pointer]:
                  - /url: /gallery
          - generic [ref=e466]:
            - heading "Support" [level=4] [ref=e467]
            - list [ref=e468]:
              - listitem [ref=e469]:
                - link "FAQ" [ref=e470] [cursor=pointer]:
                  - /url: /faq
              - listitem [ref=e471]:
                - link "Contact" [ref=e472] [cursor=pointer]:
                  - /url: /contact
              - listitem [ref=e473]:
                - link "Privacy Policy" [ref=e474] [cursor=pointer]:
                  - /url: /privacy
              - listitem [ref=e475]:
                - link "Terms of Service" [ref=e476] [cursor=pointer]:
                  - /url: /terms
          - generic [ref=e477]:
            - heading "Contact Info" [level=4] [ref=e478]
            - list [ref=e479]:
              - listitem [ref=e480]:
                - generic [ref=e484]: Not configured
              - listitem [ref=e485]:
                - generic [ref=e488]: Not configured
              - listitem [ref=e489]:
                - generic [ref=e493]: Not configured
        - generic [ref=e494]:
          - paragraph [ref=e495]: © 2026 DataCamp. All rights reserved.
          - generic [ref=e496]:
            - button "العربية" [ref=e497]
            - generic [ref=e502]: "VERSION: 2.5.0-AR"
  - generic [ref=e503]:
    - generic: NEXUS AI MENTOR
    - button "Open AI Mentor" [ref=e504]
  - region "Notifications alt+T"
```

# Test source

```ts
  1  | import {test,expect} from '@playwright/test';
  2  | for(const width of [1440,768,375])for(const language of ['en','ar'])test('loading route reserves footer space '+language+' '+width,async({page,context})=>{
  3  |  await page.setViewportSize({width,height:900});await page.addInitScript(l=>localStorage.setItem('datacamp_language',l),language);
  4  |  await context.route('**/*',r=>{const u=new URL(r.request().url());return ['127.0.0.1','localhost','kcqgnkfdpfibwkrghubl.supabase.co','fonts.googleapis.com','fonts.gstatic.com'].includes(u.hostname)?r.continue():r.abort();});
  5  |  let release!:()=>void;const held=new Promise<void>(resolve=>release=resolve);
  6  |  await page.route('**/assets/Home-*.js',async route=>{await held;await route.continue();});
  7  |  try{
  8  |   await page.goto('/',{waitUntil:'domcontentloaded'});await expect(page.getByText('SYNCING_NEURAL_INTERFACE...',{exact:true})).toBeVisible();
> 9  |   const footer=await page.getByRole('contentinfo').boundingBox();expect(footer).not.toBeNull();expect(footer!.y).toBeGreaterThanOrEqual(899);
     |                                                                                                                  ^ Error: expect(received).toBeGreaterThanOrEqual(expected)
  10 |   await page.screenshot({path:test.info().outputPath('QA_TEST_loading_'+language+'_'+width+'.png')});
  11 |  }finally{release();}
  12 |  await expect(page.getByText('SYNCING_NEURAL_INTERFACE...',{exact:true})).toHaveCount(0);await expect(page.getByRole('main')).toBeVisible();
  13 | });
  14 | 
```