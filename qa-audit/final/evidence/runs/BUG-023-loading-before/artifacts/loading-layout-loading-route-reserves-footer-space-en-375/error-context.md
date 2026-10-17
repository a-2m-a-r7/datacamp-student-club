# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: loading-layout.spec.ts >> loading route reserves footer space en 375
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
            - link [ref=e347] [cursor=pointer]:
              - /url: /courses
              - button "Explore Courses" [ref=e348]
            - link [ref=e349] [cursor=pointer]:
              - /url: /compiler
              - button "Launch Compiler" [ref=e350]
        - generic [ref=e352]:
          - generic [ref=e353]:
            - generic [ref=e361]: "4"
            - generic [ref=e362]: Active Members
          - generic [ref=e363]:
            - generic [ref=e368]: "4"
            - generic [ref=e369]: Events Hosted
          - generic [ref=e370]:
            - generic [ref=e376]: "0"
            - generic [ref=e377]: Projects Completed
          - generic [ref=e378]:
            - generic [ref=e384]: "0"
            - generic [ref=e385]: Certificates Issued
        - generic [ref=e386]:
          - generic [ref=e387]:
            - heading "Core Domains" [level=2] [ref=e388]
            - paragraph [ref=e389]: We focus on the most impactful technologies shaping our world today.
          - generic [ref=e390]:
            - generic [ref=e395]:
              - heading "Data Science" [level=3] [ref=e401]
              - paragraph [ref=e402]: Master Python, R, and statistical modeling with our expert-led workshops.
            - generic [ref=e408]:
              - heading "AI & ML" [level=3] [ref=e413]
              - paragraph [ref=e414]: Deep dive into neural networks, computer vision, and natural language processing.
            - generic [ref=e420]:
              - heading "Software Engineering" [level=3] [ref=e424]
              - paragraph [ref=e425]: Build scalable applications using modern stacks and industry best practices.
        - generic [ref=e430]:
          - heading "Ready to upgrade your skills?" [level=2] [ref=e431]
          - paragraph [ref=e432]: Join our student community to learn and build together. Membership is free for all university students.
          - link [ref=e433] [cursor=pointer]:
            - /url: /register
            - button "Join the club now" [ref=e434]
    - contentinfo [ref=e435]:
      - generic [ref=e436]:
        - generic [ref=e437]:
          - generic [ref=e438]:
            - link [ref=e439] [cursor=pointer]:
              - /url: /
              - generic [ref=e440]:
                - generic "DataCamp Official Emblem" [ref=e442]:
                  - img "DataCamp Emblem" [ref=e443]
                - generic "Innovation University Crest" [ref=e445]:
                  - img "Innovation University Crest" [ref=e446]
            - paragraph [ref=e447]: Empowering students with data science, AI, and software engineering skills.
          - generic [ref=e448]:
            - heading "Quick Links" [level=4] [ref=e449]
            - list [ref=e450]:
              - listitem [ref=e451]:
                - link "About Us" [ref=e452] [cursor=pointer]:
                  - /url: /about
              - listitem [ref=e453]:
                - link "Courses" [ref=e454] [cursor=pointer]:
                  - /url: /courses
              - listitem [ref=e455]:
                - link "Events" [ref=e456] [cursor=pointer]:
                  - /url: /events
              - listitem [ref=e457]:
                - link "Projects" [ref=e458] [cursor=pointer]:
                  - /url: /projects
              - listitem [ref=e459]:
                - link "Blog" [ref=e460] [cursor=pointer]:
                  - /url: /blog
              - listitem [ref=e461]:
                - link "Staff & Board" [ref=e462] [cursor=pointer]:
                  - /url: /staff
              - listitem [ref=e463]:
                - link "Gallery" [ref=e464] [cursor=pointer]:
                  - /url: /gallery
          - generic [ref=e465]:
            - heading "Support" [level=4] [ref=e466]
            - list [ref=e467]:
              - listitem [ref=e468]:
                - link "FAQ" [ref=e469] [cursor=pointer]:
                  - /url: /faq
              - listitem [ref=e470]:
                - link "Contact" [ref=e471] [cursor=pointer]:
                  - /url: /contact
              - listitem [ref=e472]:
                - link "Privacy Policy" [ref=e473] [cursor=pointer]:
                  - /url: /privacy
              - listitem [ref=e474]:
                - link "Terms of Service" [ref=e475] [cursor=pointer]:
                  - /url: /terms
          - generic [ref=e476]:
            - heading "Contact Info" [level=4] [ref=e477]
            - list [ref=e478]:
              - listitem [ref=e479]:
                - generic [ref=e483]: Not configured
              - listitem [ref=e484]:
                - generic [ref=e487]: Not configured
              - listitem [ref=e488]:
                - generic [ref=e492]: Not configured
        - generic [ref=e493]:
          - paragraph [ref=e494]: © 2026 DataCamp. All rights reserved.
          - generic [ref=e495]:
            - button "العربية" [ref=e496]
            - generic [ref=e501]: "VERSION: 2.5.0-AR"
  - button "Open AI Mentor" [ref=e503]
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