# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: quiz-code-layout.spec.ts >> bilingual fenced code stays readable and escaped in both quiz runners ar
- Location: qa-audit\final\tests\quiz-code-layout.spec.ts:3:44

# Error details

```
Error: locator.innerText: Error: strict mode violation: locator('main') resolved to 2 elements:
    1) <main class="flex-grow w-full min-h-screen">…</main> aka getByRole('main').filter({ hasText: 'QA_TEST_CODE_LAYOUTQA_TEST_QUIZ0%الدرس 1 • QUIZQA_TEST_QUIZ+30 XP' })
    2) <main class="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 custom-scrollbar">…</main> aka getByRole('main').filter({ hasText: 'QA_TEST_CODE_LAYOUTQA_TEST_QUIZ0%الدرس 1 • QUIZQA_TEST_QUIZ+30 XP' }).getByRole('main')

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
          - generic [ref=e334]:
            - link [ref=e335] [cursor=pointer]:
              - /url: /courses/qa-test-code-layout
            - generic [ref=e338]:
              - heading "QA_TEST_CODE_LAYOUT" [level=2] [ref=e339]
              - paragraph [ref=e340]: QA_TEST_QUIZ
          - generic [ref=e341]:
            - generic [ref=e342]: 0%
            - button [ref=e345]
        - main [ref=e348]:
          - generic [ref=e349]:
            - generic [ref=e350]:
              - generic [ref=e351]:
                - generic [ref=e352]: الدرس 1 • QUIZ
                - heading "QA_TEST_QUIZ" [level=1] [ref=e353]
              - generic [ref=e354]: +30 XP
            - tablist "مراحل الدرس" [ref=e359]:
              - tab "الكويز" [selected] [ref=e360]
            - region "موارد الدرس"
            - generic [ref=e361]:
              - generic [ref=e362]:
                - heading "التحقق من المعرفة والفهم" [level=3] [ref=e363]
                - paragraph [ref=e364]: أجب على جميع الأسئلة بدقة. يلزم 80% على الأقل لكسب +30 XP.
              - generic [ref=e366]:
                - heading [level=4] [ref=e367]:
                  - text: "1."
                  - generic [ref=e368]:
                    - text: سؤال تجريبي
                    - code [ref=e369]: "for value in [2, 4, 6]: print(value * 2)"
                    - text: <script>globalThis.QA_TEST_INJECTED=true</script>
                - generic [ref=e370]:
                  - button "4 8 12" [ref=e371]
                  - button "2 4 6" [ref=e373]
              - generic [ref=e375]:
                - button "تسليم التقييم" [disabled]
            - generic [ref=e377]:
              - button "إكمال وحصد +30 XP" [disabled]
    - contentinfo [ref=e378]:
      - generic [ref=e379]:
        - generic [ref=e380]:
          - generic [ref=e381]:
            - link [ref=e382] [cursor=pointer]:
              - /url: /
              - generic [ref=e383]:
                - generic "DataCamp Official Emblem" [ref=e385]:
                  - img "DataCamp Emblem" [ref=e386]
                - generic "Innovation University Crest" [ref=e388]:
                  - img "Innovation University Crest" [ref=e389]
            - paragraph [ref=e390]: تمكين الطلاب من إتقان علم البيانات، الذكاء الاصطناعي، وهندسة البرمجيات عبر تعليم تفاعلي وشهادات معتمدة.
          - generic [ref=e391]:
            - heading "روابط سريعة" [level=2] [ref=e392]
            - list [ref=e393]:
              - listitem [ref=e394]:
                - link "عن النادي" [ref=e395] [cursor=pointer]:
                  - /url: /about
              - listitem [ref=e396]:
                - link "الدورات التدريبية" [ref=e397] [cursor=pointer]:
                  - /url: /courses
              - listitem [ref=e398]:
                - link "الفعاليات والورش" [ref=e399] [cursor=pointer]:
                  - /url: /events
              - listitem [ref=e400]:
                - link "المشاريع" [ref=e401] [cursor=pointer]:
                  - /url: /projects
              - listitem [ref=e402]:
                - link "المدونة" [ref=e403] [cursor=pointer]:
                  - /url: /blog
              - listitem [ref=e404]:
                - link "فريق العمل" [ref=e405] [cursor=pointer]:
                  - /url: /staff
              - listitem [ref=e406]:
                - link "معرض الصور" [ref=e407] [cursor=pointer]:
                  - /url: /gallery
          - generic [ref=e408]:
            - heading "الدعم والمساعدة" [level=2] [ref=e409]
            - list [ref=e410]:
              - listitem [ref=e411]:
                - link "الأسئلة الشائعة" [ref=e412] [cursor=pointer]:
                  - /url: /faq
              - listitem [ref=e413]:
                - link "اتصل بنا" [ref=e414] [cursor=pointer]:
                  - /url: /contact
              - listitem [ref=e415]:
                - link "سياسة الخصوصية" [ref=e416] [cursor=pointer]:
                  - /url: /privacy
              - listitem [ref=e417]:
                - link "الشروط والأحكام" [ref=e418] [cursor=pointer]:
                  - /url: /terms
          - generic [ref=e419]:
            - heading "معلومات التواصل" [level=2] [ref=e420]
            - list [ref=e421]:
              - listitem [ref=e422]:
                - generic [ref=e426]: غير محدد
              - listitem [ref=e427]:
                - generic [ref=e430]: غير محدد
              - listitem [ref=e431]:
                - generic [ref=e435]: غير محدد
        - generic [ref=e436]:
          - paragraph [ref=e437]: جميع الحقوق محفوظة © 2026 نادي داتا كامب الطلابي • جامعة الابتكار.
          - generic [ref=e438]:
            - button "English" [ref=e439]
            - generic [ref=e444]: "VERSION: 2.5.0-AR"
  - generic [ref=e445]:
    - generic: مرشد NEXUS الذكي
    - button "فتح مرشد الذكاء الاصطناعي NEXUS" [ref=e446]
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