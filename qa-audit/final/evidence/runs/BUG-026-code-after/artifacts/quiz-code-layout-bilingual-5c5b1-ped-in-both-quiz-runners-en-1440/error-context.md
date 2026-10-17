# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: quiz-code-layout.spec.ts >> bilingual fenced code stays readable and escaped in both quiz runners en
- Location: qa-audit\final\tests\quiz-code-layout.spec.ts:3:44

# Error details

```
Error: locator.innerText: Error: strict mode violation: locator('main') resolved to 2 elements:
    1) <main class="flex-grow w-full min-h-screen">…</main> aka getByRole('main').filter({ hasText: 'QA_TEST_CODE_LAYOUTQA_TEST_QUIZ0%LESSON 1 • QUIZQA_TEST_QUIZ+30' })
    2) <main class="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 custom-scrollbar">…</main> aka getByRole('main').filter({ hasText: 'QA_TEST_CODE_LAYOUTQA_TEST_QUIZ0%LESSON 1 • QUIZQA_TEST_QUIZ+30' }).getByRole('main')

Call log:
  - waiting for locator('main')

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
                  - heading [level=4] [ref=e485]:
                    - text: "1."
                    - generic [ref=e486]:
                      - text: QA_TEST_QUESTION
                      - code [ref=e487]: "for value in [2, 4, 6]: print(value * 2)"
                      - text: <script>globalThis.QA_TEST_INJECTED=true</script>
                  - generic [ref=e488]:
                    - button "4 8 12" [ref=e489]
                    - button "2 4 6" [ref=e491]
                - generic [ref=e493]:
                  - button "SUBMIT_ASSESSMENT" [disabled]
              - generic [ref=e495]:
                - button "COMPLETE & CLAIM +30 XP" [disabled]
          - complementary [ref=e496]:
            - generic [ref=e497]:
              - heading "COURSE_INDEX" [level=3] [ref=e498]
              - generic [ref=e499]: 1 Lessons
            - generic [ref=e501]:
              - generic [ref=e502]: Course Lessons
              - button "QA_TEST_QUIZ +30" [ref=e504]:
                - generic [ref=e508]: QA_TEST_QUIZ
                - generic [ref=e509]: "+30"
    - contentinfo [ref=e510]:
      - generic [ref=e511]:
        - generic [ref=e512]:
          - generic [ref=e513]:
            - link [ref=e514] [cursor=pointer]:
              - /url: /
              - generic [ref=e515]:
                - generic "DataCamp Official Emblem" [ref=e517]:
                  - img "DataCamp Emblem" [ref=e518]
                - generic "Innovation University Crest" [ref=e520]:
                  - img "Innovation University Crest" [ref=e521]
            - paragraph [ref=e522]: Empowering students with data science, AI, and software engineering skills.
          - generic [ref=e523]:
            - heading "Quick Links" [level=2] [ref=e524]
            - list [ref=e525]:
              - listitem [ref=e526]:
                - link "About Us" [ref=e527] [cursor=pointer]:
                  - /url: /about
              - listitem [ref=e528]:
                - link "Courses" [ref=e529] [cursor=pointer]:
                  - /url: /courses
              - listitem [ref=e530]:
                - link "Events" [ref=e531] [cursor=pointer]:
                  - /url: /events
              - listitem [ref=e532]:
                - link "Projects" [ref=e533] [cursor=pointer]:
                  - /url: /projects
              - listitem [ref=e534]:
                - link "Blog" [ref=e535] [cursor=pointer]:
                  - /url: /blog
              - listitem [ref=e536]:
                - link "Staff & Board" [ref=e537] [cursor=pointer]:
                  - /url: /staff
              - listitem [ref=e538]:
                - link "Gallery" [ref=e539] [cursor=pointer]:
                  - /url: /gallery
          - generic [ref=e540]:
            - heading "Support" [level=2] [ref=e541]
            - list [ref=e542]:
              - listitem [ref=e543]:
                - link "FAQ" [ref=e544] [cursor=pointer]:
                  - /url: /faq
              - listitem [ref=e545]:
                - link "Contact" [ref=e546] [cursor=pointer]:
                  - /url: /contact
              - listitem [ref=e547]:
                - link "Privacy Policy" [ref=e548] [cursor=pointer]:
                  - /url: /privacy
              - listitem [ref=e549]:
                - link "Terms of Service" [ref=e550] [cursor=pointer]:
                  - /url: /terms
          - generic [ref=e551]:
            - heading "Contact Info" [level=2] [ref=e552]
            - list [ref=e553]:
              - listitem [ref=e554]:
                - generic [ref=e558]: Not configured
              - listitem [ref=e559]:
                - generic [ref=e562]: Not configured
              - listitem [ref=e563]:
                - generic [ref=e567]: Not configured
        - generic [ref=e568]:
          - paragraph [ref=e569]: © 2026 DataCamp. All rights reserved.
          - generic [ref=e570]:
            - button "العربية" [ref=e571]
            - generic [ref=e576]: "VERSION: 2.5.0-AR"
  - generic [ref=e577]:
    - generic: NEXUS AI MENTOR
    - button "Open AI Mentor" [ref=e578]
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
     |                                                                                                                                                                                                                                                                                                                                                                                                                 ^ Error: locator.innerText: Error: strict mode violation: locator('main') resolved to 2 elements:
  11 |   await page.screenshot({path:test.info().outputPath('QA_TEST_code_'+language+'_'+(route.endsWith('/learn')?'inline':'standalone')+'.png')});
  12 |  }
  13 | });
  14 | 
```