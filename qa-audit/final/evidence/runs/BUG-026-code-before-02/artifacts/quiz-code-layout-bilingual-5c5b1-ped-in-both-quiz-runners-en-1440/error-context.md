# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: quiz-code-layout.spec.ts >> bilingual fenced code stays readable and escaped in both quiz runners en
- Location: qa-audit\final\tests\quiz-code-layout.spec.ts:3:44

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  locator('main code[data-quiz-code]')
Expected: 1
Received: 0
Timeout:  20000ms

Call log:
  - Expect "toHaveCount" locator('main code[data-quiz-code]') with timeout 20000ms
  - waiting for locator('main code[data-quiz-code]')
    43 × locator resolved to 0 elements
       - unexpected value "0"

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
      - link "Certificates" [ref=e354] [cursor=pointer]:
        - /url: /certificates
      - link "Notifications" [ref=e364] [cursor=pointer]:
        - /url: /notifications
      - link "Events" [ref=e371] [cursor=pointer]:
        - /url: /events
      - link "Projects" [ref=e377] [cursor=pointer]:
        - /url: /projects
      - link "Blog" [ref=e384] [cursor=pointer]:
        - /url: /blog
      - link "Staff & Board" [ref=e391] [cursor=pointer]:
        - /url: /staff
      - link "Gallery" [ref=e400] [cursor=pointer]:
        - /url: /gallery
      - link "About Us" [ref=e408] [cursor=pointer]:
        - /url: /about
      - link "Contact" [ref=e414] [cursor=pointer]:
        - /url: /contact
    - generic [ref=e420]:
      - generic [ref=e421]:
        - link "Q QA_TEST_MEMBER Member" [ref=e422] [cursor=pointer]:
          - /url: /profile
          - generic [ref=e423]: Q
          - generic [ref=e425]:
            - paragraph [ref=e426]: QA_TEST_MEMBER
            - paragraph [ref=e427]: Member
        - button "Logout" [ref=e428]
      - generic [ref=e434]:
        - button "العربية" [ref=e435]
        - button "English" [ref=e437]
      - button [ref=e439]
  - generic [ref=e442]:
    - generic [ref=e444]:
      - button "العربية" [ref=e445]
      - button "EN" [ref=e447]
    - main [ref=e450]:
      - generic [ref=e452]:
        - generic [ref=e453]:
          - generic [ref=e454]:
            - link [ref=e455] [cursor=pointer]:
              - /url: /courses/qa-test-code-layout
            - generic [ref=e458]:
              - heading "QA_TEST_CODE_LAYOUT" [level=2] [ref=e459]
              - paragraph [ref=e460]: QA_TEST_QUIZ
          - generic [ref=e461]: 0%
        - generic [ref=e465]:
          - main [ref=e466]:
            - generic [ref=e467]:
              - generic [ref=e468]:
                - generic [ref=e469]:
                  - generic [ref=e470]: LESSON 1 • QUIZ
                  - heading "QA_TEST_QUIZ" [level=1] [ref=e471]
                - generic [ref=e472]: +30 XP
              - tablist "Learning stages" [ref=e477]:
                - tab "Quiz" [selected] [ref=e478]
              - region "Lesson resources"
              - generic [ref=e479]:
                - generic [ref=e480]:
                  - heading "KNOWLEDGE_VERIFICATION" [level=3] [ref=e481]
                  - paragraph [ref=e482]: Answer all questions correctly. Minimum 80% required to claim +30 XP.
                - generic [ref=e484]:
                  - 'heading "1. QA_TEST_QUESTION ```python for value in [2, 4, 6]: print(value * 2) ``` <script>globalThis.QA_TEST_INJECTED=true</script>" [level=4] [ref=e485]'
                  - generic [ref=e486]:
                    - button "4 8 12" [ref=e487]
                    - button "2 4 6" [ref=e489]
                - generic [ref=e491]:
                  - button "SUBMIT_ASSESSMENT" [disabled]
              - generic [ref=e493]:
                - button "COMPLETE & CLAIM +30 XP" [disabled]
          - complementary [ref=e494]:
            - generic [ref=e495]:
              - heading "COURSE_INDEX" [level=3] [ref=e496]
              - generic [ref=e497]: 1 Lessons
            - generic [ref=e499]:
              - generic [ref=e500]: Course Lessons
              - button "QA_TEST_QUIZ +30" [ref=e502]:
                - generic [ref=e506]: QA_TEST_QUIZ
                - generic [ref=e507]: "+30"
    - contentinfo [ref=e508]:
      - generic [ref=e509]:
        - generic [ref=e510]:
          - generic [ref=e511]:
            - link [ref=e512] [cursor=pointer]:
              - /url: /
              - generic [ref=e513]:
                - generic "DataCamp Official Emblem" [ref=e515]:
                  - img "DataCamp Emblem" [ref=e516]
                - generic "Innovation University Crest" [ref=e518]:
                  - img "Innovation University Crest" [ref=e519]
            - paragraph [ref=e520]: Empowering students with data science, AI, and software engineering skills.
          - generic [ref=e521]:
            - heading "Quick Links" [level=2] [ref=e522]
            - list [ref=e523]:
              - listitem [ref=e524]:
                - link "About Us" [ref=e525] [cursor=pointer]:
                  - /url: /about
              - listitem [ref=e526]:
                - link "Courses" [ref=e527] [cursor=pointer]:
                  - /url: /courses
              - listitem [ref=e528]:
                - link "Events" [ref=e529] [cursor=pointer]:
                  - /url: /events
              - listitem [ref=e530]:
                - link "Projects" [ref=e531] [cursor=pointer]:
                  - /url: /projects
              - listitem [ref=e532]:
                - link "Blog" [ref=e533] [cursor=pointer]:
                  - /url: /blog
              - listitem [ref=e534]:
                - link "Staff & Board" [ref=e535] [cursor=pointer]:
                  - /url: /staff
              - listitem [ref=e536]:
                - link "Gallery" [ref=e537] [cursor=pointer]:
                  - /url: /gallery
          - generic [ref=e538]:
            - heading "Support" [level=2] [ref=e539]
            - list [ref=e540]:
              - listitem [ref=e541]:
                - link "FAQ" [ref=e542] [cursor=pointer]:
                  - /url: /faq
              - listitem [ref=e543]:
                - link "Contact" [ref=e544] [cursor=pointer]:
                  - /url: /contact
              - listitem [ref=e545]:
                - link "Privacy Policy" [ref=e546] [cursor=pointer]:
                  - /url: /privacy
              - listitem [ref=e547]:
                - link "Terms of Service" [ref=e548] [cursor=pointer]:
                  - /url: /terms
          - generic [ref=e549]:
            - heading "Contact Info" [level=2] [ref=e550]
            - list [ref=e551]:
              - listitem [ref=e552]:
                - generic [ref=e556]: Not configured
              - listitem [ref=e557]:
                - generic [ref=e560]: Not configured
              - listitem [ref=e561]:
                - generic [ref=e565]: Not configured
        - generic [ref=e566]:
          - paragraph [ref=e567]: © 2026 DataCamp. All rights reserved.
          - generic [ref=e568]:
            - button "العربية" [ref=e569]
            - generic [ref=e574]: "VERSION: 2.5.0-AR"
  - generic [ref=e575]:
    - generic: NEXUS AI MENTOR
    - button "Open AI Mentor" [ref=e576]
  - region "Notifications alt+T"
```

# Test source

```ts
  1  | import {test,expect} from '@playwright/test';import {randomUUID} from 'node:crypto';import {platform,member,admin} from '../../fix-tests/persisted-platform';
  2  | let p:Awaited<ReturnType<typeof platform>>;test.afterEach(async()=>{await p?.db.close();});
  3  | for(const language of ['en','ar'] as const)test('bilingual fenced code stays readable and escaped in both quiz runners '+language,async({page})=>{
  4  |  p=await platform();const cid=randomUUID(),lid=randomUUID();const source='for value in [2, 4, 6]:\n    print(value * 2)';
  5  |  const prompt=(label:string)=>label+'\n```python\n'+source+'\n```\n<script>globalThis.QA_TEST_INJECTED=true</script>';
  6  |  const question={id:randomUUID(),question:prompt('QA_TEST_QUESTION'),options:['4 8 12','2 4 6'],correctIndex:0,explanation:'QA_TEST_EXPLANATION',translations:{ar:{question:prompt('سؤال تجريبي'),options:['4 8 12','2 4 6'],explanation:'شرح تجريبي'},en:{question:prompt('QA_TEST_QUESTION'),options:['4 8 12','2 4 6'],explanation:'QA_TEST_EXPLANATION'}}};
  7  |  await p.db.query("INSERT INTO courses(id,title,slug,is_published) VALUES($1,'QA_TEST_CODE_LAYOUT','qa-test-code-layout',true)",[cid]);await p.db.query("INSERT INTO lessons(id,course_id,title,type,position,quiz_questions) VALUES($1,$2,'QA_TEST_QUIZ','quiz',1,$3)",[lid,cid,JSON.stringify([question])]);
  8  |  await p.connect(page,member,language);
  9  |  for(const route of ['/courses/qa-test-code-layout/learn','/courses/qa-test-code-layout/quiz/'+lid]){
> 10 |   await page.goto(route);const code=page.locator('main code[data-quiz-code]');await expect(code).toHaveCount(1);await expect(code).toHaveText(source);await expect(code).toHaveAttribute('dir','ltr');expect(await code.evaluate(el=>getComputedStyle(el).whiteSpace)).toBe('pre-wrap');expect(await page.evaluate(()=>(globalThis as any).QA_TEST_INJECTED)).toBeUndefined();expect(await page.locator('main').innerText()).toContain('<script>globalThis.QA_TEST_INJECTED=true</script>');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
     |                                                                                                  ^ Error: expect(locator).toHaveCount(expected) failed
  11 |   await page.screenshot({path:test.info().outputPath('QA_TEST_code_'+language+'_'+(route.endsWith('/learn')?'inline':'standalone')+'.png')});
  12 |  }
  13 | });
  14 | 
```