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
          - link [ref=e335] [cursor=pointer]:
            - /url: /courses/qa-test-code-layout
          - generic [ref=e338]:
            - generic [ref=e339]: 0%
            - button [ref=e342]
        - main [ref=e345]:
          - generic [ref=e346]:
            - generic [ref=e347]:
              - generic [ref=e348]:
                - generic [ref=e349]: الدرس 1 • QUIZ
                - heading "QA_TEST_QUIZ" [level=1] [ref=e350]
              - generic [ref=e351]: +30 XP
            - tablist "مراحل الدرس" [ref=e356]:
              - tab "الكويز" [selected] [ref=e357]
            - region "موارد الدرس"
            - generic [ref=e358]:
              - generic [ref=e359]:
                - heading "التحقق من المعرفة والفهم" [level=3] [ref=e360]
                - paragraph [ref=e361]: أجب على جميع الأسئلة بدقة. يلزم 80% على الأقل لكسب +30 XP.
              - generic [ref=e363]:
                - 'heading "1. سؤال تجريبي ```python for value in [2, 4, 6]: print(value * 2) ``` <script>globalThis.QA_TEST_INJECTED=true</script>" [level=4] [ref=e364]'
                - generic [ref=e365]:
                  - button "4 8 12" [ref=e366]
                  - button "2 4 6" [ref=e368]
              - generic [ref=e370]:
                - button "تسليم التقييم" [disabled]
            - generic [ref=e372]:
              - button "إكمال وحصد +30 XP" [disabled]
    - contentinfo [ref=e373]:
      - generic [ref=e374]:
        - generic [ref=e375]:
          - generic [ref=e376]:
            - link [ref=e377] [cursor=pointer]:
              - /url: /
              - generic [ref=e378]:
                - generic "DataCamp Official Emblem" [ref=e380]:
                  - img "DataCamp Emblem" [ref=e381]
                - generic "Innovation University Crest" [ref=e383]:
                  - img "Innovation University Crest" [ref=e384]
            - paragraph [ref=e385]: تمكين الطلاب من إتقان علم البيانات، الذكاء الاصطناعي، وهندسة البرمجيات عبر تعليم تفاعلي وشهادات معتمدة.
          - generic [ref=e386]:
            - heading "روابط سريعة" [level=2] [ref=e387]
            - list [ref=e388]:
              - listitem [ref=e389]:
                - link "عن النادي" [ref=e390] [cursor=pointer]:
                  - /url: /about
              - listitem [ref=e391]:
                - link "الدورات التدريبية" [ref=e392] [cursor=pointer]:
                  - /url: /courses
              - listitem [ref=e393]:
                - link "الفعاليات والورش" [ref=e394] [cursor=pointer]:
                  - /url: /events
              - listitem [ref=e395]:
                - link "المشاريع" [ref=e396] [cursor=pointer]:
                  - /url: /projects
              - listitem [ref=e397]:
                - link "المدونة" [ref=e398] [cursor=pointer]:
                  - /url: /blog
              - listitem [ref=e399]:
                - link "فريق العمل" [ref=e400] [cursor=pointer]:
                  - /url: /staff
              - listitem [ref=e401]:
                - link "معرض الصور" [ref=e402] [cursor=pointer]:
                  - /url: /gallery
          - generic [ref=e403]:
            - heading "الدعم والمساعدة" [level=2] [ref=e404]
            - list [ref=e405]:
              - listitem [ref=e406]:
                - link "الأسئلة الشائعة" [ref=e407] [cursor=pointer]:
                  - /url: /faq
              - listitem [ref=e408]:
                - link "اتصل بنا" [ref=e409] [cursor=pointer]:
                  - /url: /contact
              - listitem [ref=e410]:
                - link "سياسة الخصوصية" [ref=e411] [cursor=pointer]:
                  - /url: /privacy
              - listitem [ref=e412]:
                - link "الشروط والأحكام" [ref=e413] [cursor=pointer]:
                  - /url: /terms
          - generic [ref=e414]:
            - heading "معلومات التواصل" [level=2] [ref=e415]
            - list [ref=e416]:
              - listitem [ref=e417]:
                - generic [ref=e421]: غير محدد
              - listitem [ref=e422]:
                - generic [ref=e425]: غير محدد
              - listitem [ref=e426]:
                - generic [ref=e430]: غير محدد
        - generic [ref=e431]:
          - paragraph [ref=e432]: جميع الحقوق محفوظة © 2026 نادي داتا كامب الطلابي • جامعة الابتكار.
          - generic [ref=e433]:
            - button "English" [ref=e434]
            - generic [ref=e439]: "VERSION: 2.5.0-AR"
  - button "فتح مرشد الذكاء الاصطناعي NEXUS" [ref=e441]
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