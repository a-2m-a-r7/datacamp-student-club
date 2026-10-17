# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: quiz-code-layout.spec.ts >> bilingual fenced code stays readable and escaped in both quiz runners ar
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
                - 'heading "1. سؤال تجريبي ```python for value in [2, 4, 6]: print(value * 2) ``` <script>globalThis.QA_TEST_INJECTED=true</script>" [level=4] [ref=e367]'
                - generic [ref=e368]:
                  - button "4 8 12" [ref=e369]
                  - button "2 4 6" [ref=e371]
              - generic [ref=e373]:
                - button "تسليم التقييم" [disabled]
            - generic [ref=e375]:
              - button "إكمال وحصد +30 XP" [disabled]
    - contentinfo [ref=e376]:
      - generic [ref=e377]:
        - generic [ref=e378]:
          - generic [ref=e379]:
            - link [ref=e380] [cursor=pointer]:
              - /url: /
              - generic [ref=e381]:
                - generic "DataCamp Official Emblem" [ref=e383]:
                  - img "DataCamp Emblem" [ref=e384]
                - generic "Innovation University Crest" [ref=e386]:
                  - img "Innovation University Crest" [ref=e387]
            - paragraph [ref=e388]: تمكين الطلاب من إتقان علم البيانات، الذكاء الاصطناعي، وهندسة البرمجيات عبر تعليم تفاعلي وشهادات معتمدة.
          - generic [ref=e389]:
            - heading "روابط سريعة" [level=2] [ref=e390]
            - list [ref=e391]:
              - listitem [ref=e392]:
                - link "عن النادي" [ref=e393] [cursor=pointer]:
                  - /url: /about
              - listitem [ref=e394]:
                - link "الدورات التدريبية" [ref=e395] [cursor=pointer]:
                  - /url: /courses
              - listitem [ref=e396]:
                - link "الفعاليات والورش" [ref=e397] [cursor=pointer]:
                  - /url: /events
              - listitem [ref=e398]:
                - link "المشاريع" [ref=e399] [cursor=pointer]:
                  - /url: /projects
              - listitem [ref=e400]:
                - link "المدونة" [ref=e401] [cursor=pointer]:
                  - /url: /blog
              - listitem [ref=e402]:
                - link "فريق العمل" [ref=e403] [cursor=pointer]:
                  - /url: /staff
              - listitem [ref=e404]:
                - link "معرض الصور" [ref=e405] [cursor=pointer]:
                  - /url: /gallery
          - generic [ref=e406]:
            - heading "الدعم والمساعدة" [level=2] [ref=e407]
            - list [ref=e408]:
              - listitem [ref=e409]:
                - link "الأسئلة الشائعة" [ref=e410] [cursor=pointer]:
                  - /url: /faq
              - listitem [ref=e411]:
                - link "اتصل بنا" [ref=e412] [cursor=pointer]:
                  - /url: /contact
              - listitem [ref=e413]:
                - link "سياسة الخصوصية" [ref=e414] [cursor=pointer]:
                  - /url: /privacy
              - listitem [ref=e415]:
                - link "الشروط والأحكام" [ref=e416] [cursor=pointer]:
                  - /url: /terms
          - generic [ref=e417]:
            - heading "معلومات التواصل" [level=2] [ref=e418]
            - list [ref=e419]:
              - listitem [ref=e420]:
                - generic [ref=e424]: غير محدد
              - listitem [ref=e425]:
                - generic [ref=e428]: غير محدد
              - listitem [ref=e429]:
                - generic [ref=e433]: غير محدد
        - generic [ref=e434]:
          - paragraph [ref=e435]: جميع الحقوق محفوظة © 2026 نادي داتا كامب الطلابي • جامعة الابتكار.
          - generic [ref=e436]:
            - button "English" [ref=e437]
            - generic [ref=e442]: "VERSION: 2.5.0-AR"
  - generic [ref=e443]:
    - generic: مرشد NEXUS الذكي
    - button "فتح مرشد الذكاء الاصطناعي NEXUS" [ref=e444]
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