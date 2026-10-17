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
        - generic [ref=e333]:
          - link [ref=e335] [cursor=pointer]:
            - /url: /courses/qa-test-code-layout
          - generic [ref=e338]:
            - generic [ref=e339]: 0%
            - button [ref=e342]
        - main [ref=e345]:
          - generic [ref=e346]:
            - generic [ref=e347]:
              - generic [ref=e348]:
                - generic [ref=e349]: LESSON 1 • QUIZ
                - heading "QA_TEST_QUIZ" [level=1] [ref=e350]
              - generic [ref=e351]: +30 XP
            - tablist "Learning stages" [ref=e356]:
              - tab "Quiz" [selected] [ref=e357]
            - region "Lesson resources"
            - generic [ref=e358]:
              - generic [ref=e359]:
                - heading "KNOWLEDGE_VERIFICATION" [level=3] [ref=e360]
                - paragraph [ref=e361]: Answer all questions correctly. Minimum 80% required to claim +30 XP.
              - generic [ref=e363]:
                - heading [level=4] [ref=e364]:
                  - text: "1."
                  - generic [ref=e365]:
                    - text: QA_TEST_QUESTION
                    - code [ref=e366]: "for value in [2, 4, 6]: print(value * 2)"
                    - text: <script>globalThis.QA_TEST_INJECTED=true</script>
                - generic [ref=e367]:
                  - button "4 8 12" [ref=e368]
                  - button "2 4 6" [ref=e370]
              - generic [ref=e372]:
                - button "SUBMIT_ASSESSMENT" [disabled]
            - generic [ref=e374]:
              - button "COMPLETE & CLAIM +30 XP" [disabled]
    - contentinfo [ref=e375]:
      - generic [ref=e376]:
        - generic [ref=e377]:
          - generic [ref=e378]:
            - link [ref=e379] [cursor=pointer]:
              - /url: /
              - generic [ref=e380]:
                - generic "DataCamp Official Emblem" [ref=e382]:
                  - img "DataCamp Emblem" [ref=e383]
                - generic "Innovation University Crest" [ref=e385]:
                  - img "Innovation University Crest" [ref=e386]
            - paragraph [ref=e387]: Empowering students with data science, AI, and software engineering skills.
          - generic [ref=e388]:
            - heading "Quick Links" [level=2] [ref=e389]
            - list [ref=e390]:
              - listitem [ref=e391]:
                - link "About Us" [ref=e392] [cursor=pointer]:
                  - /url: /about
              - listitem [ref=e393]:
                - link "Courses" [ref=e394] [cursor=pointer]:
                  - /url: /courses
              - listitem [ref=e395]:
                - link "Events" [ref=e396] [cursor=pointer]:
                  - /url: /events
              - listitem [ref=e397]:
                - link "Projects" [ref=e398] [cursor=pointer]:
                  - /url: /projects
              - listitem [ref=e399]:
                - link "Blog" [ref=e400] [cursor=pointer]:
                  - /url: /blog
              - listitem [ref=e401]:
                - link "Staff & Board" [ref=e402] [cursor=pointer]:
                  - /url: /staff
              - listitem [ref=e403]:
                - link "Gallery" [ref=e404] [cursor=pointer]:
                  - /url: /gallery
          - generic [ref=e405]:
            - heading "Support" [level=2] [ref=e406]
            - list [ref=e407]:
              - listitem [ref=e408]:
                - link "FAQ" [ref=e409] [cursor=pointer]:
                  - /url: /faq
              - listitem [ref=e410]:
                - link "Contact" [ref=e411] [cursor=pointer]:
                  - /url: /contact
              - listitem [ref=e412]:
                - link "Privacy Policy" [ref=e413] [cursor=pointer]:
                  - /url: /privacy
              - listitem [ref=e414]:
                - link "Terms of Service" [ref=e415] [cursor=pointer]:
                  - /url: /terms
          - generic [ref=e416]:
            - heading "Contact Info" [level=2] [ref=e417]
            - list [ref=e418]:
              - listitem [ref=e419]:
                - generic [ref=e423]: Not configured
              - listitem [ref=e424]:
                - generic [ref=e427]: Not configured
              - listitem [ref=e428]:
                - generic [ref=e432]: Not configured
        - generic [ref=e433]:
          - paragraph [ref=e434]: © 2026 DataCamp. All rights reserved.
          - generic [ref=e435]:
            - button "العربية" [ref=e436]
            - generic [ref=e441]: "VERSION: 2.5.0-AR"
  - button "Open AI Mentor" [ref=e443]
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
> 10 |   await page.goto(route);const code=page.locator('main code[data-quiz-code]');await expect(code).toHaveCount(1);await expect(code).toHaveText(source);await expect(code).toHaveAttribute('dir','ltr');expect(await code.evaluate(el=>getComputedStyle(el).whiteSpace)).toBe('pre-wrap');expect(await page.evaluate(()=>(globalThis as any).QA_TEST_INJECTED)).toBeUndefined();expect(await page.locator('main').first().innerText()).toContain('<script>globalThis.QA_TEST_INJECTED=true</script>');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
     |                                                                                                                                                                                                                                                                                                                                                                                                                 ^ Error: locator.innerText: Error: strict mode violation: locator('main') resolved to 2 elements:
  11 |   await page.screenshot({path:test.info().outputPath('QA_TEST_code_'+language+'_'+(route.endsWith('/learn')?'inline':'standalone')+'.png')});
  12 |  }
  13 | });
  14 | 
```