# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: form-inputs.spec.ts >> choice and rating controls expose names and accept keyboard input ar
- Location: qa-audit\final\tests\form-inputs.spec.ts:36:2

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  getByText('QA_TEST_single_choice', { exact: true }).locator('xpath=ancestor::div[contains(@class,"rounded-2xl")][1]').getByRole('radio', { name: 'QA_TEST_ألف', exact: true })
Expected: 1
Received: 0
Timeout:  20000ms

Call log:
  - Expect "toHaveCount" getByText('QA_TEST_single_choice', { exact: true }).locator('xpath=ancestor::div[contains(@class,"rounded-2xl")][1]').getByRole('radio', { name: 'QA_TEST_ألف', exact: true }) with timeout 20000ms
  - waiting for getByText('QA_TEST_single_choice', { exact: true }).locator('xpath=ancestor::div[contains(@class,"rounded-2xl")][1]').getByRole('radio', { name: 'QA_TEST_ألف', exact: true })
    43 × locator resolved to 0 elements
       - unexpected value "0"

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e315]:
    - generic [ref=e316]:
      - link [ref=e317] [cursor=pointer]:
        - /url: /
        - generic [ref=e318]:
          - generic "DataCamp Official Emblem" [ref=e320]:
            - img "DataCamp Emblem" [ref=e321]
          - generic "Innovation University Crest" [ref=e323]:
            - img "Innovation University Crest" [ref=e324]
      - generic [ref=e325]: QA_TEST_MEMBER@example.invalid
    - generic [ref=e328]:
      - heading "QA_TEST_ALL_TYPES" [level=1] [ref=e331]
      - generic [ref=e332]:
        - textbox
        - generic [ref=e333]:
          - generic [ref=e334]:
            - generic [ref=e335]: QA_TEST_single_choice*
            - generic [ref=e338]:
              - generic [ref=e339] [cursor=pointer]: QA_TEST_ألف
              - generic [ref=e342] [cursor=pointer]: QA_TEST_باء
          - generic [ref=e345]:
            - generic [ref=e346]: QA_TEST_multiple_choice*
            - generic [ref=e349]:
              - generic [ref=e350] [cursor=pointer]: QA_TEST_ألف
              - generic [ref=e353] [cursor=pointer]: QA_TEST_باء
          - generic [ref=e356]:
            - generic [ref=e357]: QA_TEST_rating*
            - generic [ref=e360]:
              - button [ref=e361]
              - button [ref=e364]
              - button [ref=e367]
              - button [ref=e370]
              - button [ref=e373]
        - button "إرسال الاستجابة" [ref=e377]
    - paragraph [ref=e382]: Powered by DataCamp Student Club • Secured with Supabase RLS
  - region "Notifications alt+T"
```

# Test source

```ts
  1  | import {test,expect,Page} from '@playwright/test';import {randomUUID} from 'node:crypto';
  2  | import {platform,admin,member} from '../../fix-tests/persisted-platform';
  3  | let app:Awaited<ReturnType<typeof platform>>;
  4  | test.beforeEach(async()=>{app=await platform();});test.afterEach(async({browser})=>{for(const c of browser.contexts())await c.close();await app.db.close();});
  5  | async function fixture(page:Page,locale:'ar'|'en',types:string[]){
  6  |  const questions=types.map((type,position)=>({id:randomUUID(),type,title:'QA_TEST_'+type,position,required:type!=='section_header',options:['single_choice','multiple_choice','dropdown','ranking'].includes(type)?[{id:'QA_TEST_A',text:'QA_TEST_ألف'},{id:'QA_TEST_B',text:'QA_TEST_باء'}]:[],settings:{placeholder:'QA_TEST_'+type,maxRating:5,min:type==='number'?1:undefined,max:type==='number'?10:undefined}}));
  7  |  const form=(await app.asUser(admin,tx=>tx.query('SELECT save_form($1,$2) saved',[JSON.stringify({title:'QA_TEST_ALL_TYPES',slug:'qa-test-'+randomUUID(),status:'published',allow_anonymous:false,one_response_per_user:true,success_message:'QA_TEST_ALL_SAVED'}),JSON.stringify(questions)]))).rows[0].saved.form;
  8  |  await app.connect(page,member,locale);await page.route('**/api/forms/submit',async route=>{try{const b=route.request().postDataJSON();const r=await app.asUser(member,tx=>tx.query('SELECT submit_form_response($1,$2,$3,$4) saved',[b.formId,JSON.stringify(b.answers),b.respondentEmail,JSON.stringify(b.metadata)]));await route.fulfill({status:200,json:r.rows[0].saved});}catch(e:any){await route.fulfill({status:400,json:{error:e.message}});}});
  9  |  await page.goto('/f/'+form.slug);return {form,questions};
  10 | }
  11 | const card=(page:Page,title:string)=>page.getByText(title,{exact:true}).locator('xpath=ancestor::div[contains(@class,"rounded-2xl")][1]');
  12 | for(const locale of ['en','ar'] as const){
  13 |  test('all 14 form types persist exact answers across sections '+locale,async({page})=>{
  14 |   const {form,questions}=await fixture(page,locale,['short_text','long_text','single_choice','multiple_choice','dropdown','rating','linear_scale','section_header','date','time','number','email','file_upload','ranking']);
  15 |   const field=(type:string)=>card(page,'QA_TEST_'+type);
  16 |   await field('short_text').locator('input').fill('QA_TEST_العربية 😀 <script>window.QA_TEST_XSS=1</script>');
  17 |   await field('long_text').locator('textarea').fill('QA_TEST_سطر أول\nسطر ثان 😀');
  18 |   await field('single_choice').getByText('QA_TEST_باء',{exact:true}).click();
  19 |   await field('multiple_choice').getByText('QA_TEST_ألف',{exact:true}).click();await field('multiple_choice').getByText('QA_TEST_باء',{exact:true}).click();
  20 |   await field('dropdown').locator('select').selectOption('QA_TEST_B');
  21 |   await field('rating').getByRole('button').nth(3).click();await field('linear_scale').getByRole('button',{name:'5',exact:true}).click();
  22 |   await page.getByRole('button',{name:locale==='ar'?'التالي':'Next',exact:true}).click();
  23 |   await field('date').locator('input').fill('2030-04-05');await field('time').locator('input').fill('13:45');await field('number').locator('input').fill('7');await field('email').locator('input').fill('QA_TEST_answer@example.invalid');
  24 |   await field('file_upload').locator('input[type=file]').setInputFiles({name:'QA_TEST_مرفق.txt',mimeType:'text/plain',buffer:Buffer.from('QA_TEST_محتوى عربي 😀')});
  25 |   await expect(field('file_upload').getByText('QA_TEST_مرفق.txt',{exact:true})).toBeVisible();
  26 |   const rank=field('ranking');await rank.getByText('QA_TEST_باء',{exact:true}).dragTo(rank.getByText('QA_TEST_ألف',{exact:true}));
  27 |   await page.getByRole('button',{name:locale==='ar'?'السابق':'Previous',exact:true}).click();await expect(field('short_text').locator('input')).toHaveValue(/العربية 😀/);
  28 |   await page.getByRole('button',{name:locale==='ar'?'التالي':'Next',exact:true}).click();await expect(field('number').locator('input')).toHaveValue('7');
  29 |   await page.getByRole('button',{name:locale==='ar'?'إرسال الاستجابة':'Submit Form',exact:true}).click();await expect(page.getByText('QA_TEST_ALL_SAVED',{exact:true})).toBeVisible();
  30 |   const rows=(await app.db.query<any>('SELECT question_id,value FROM form_answers WHERE response_id IN (SELECT id FROM form_responses WHERE form_id=$1)',[form.id])).rows;expect(rows).toHaveLength(13);
  31 |   const saved=Object.fromEntries(rows.map(r=>[questions.find(q=>q.id===r.question_id)!.type,r.value]));
  32 |   expect(saved).toMatchObject({short_text:'QA_TEST_العربية 😀 <script>window.QA_TEST_XSS=1</script>',long_text:'QA_TEST_سطر أول\nسطر ثان 😀',single_choice:'QA_TEST_B',multiple_choice:['QA_TEST_A','QA_TEST_B'],dropdown:'QA_TEST_B',rating:4,linear_scale:5,date:'2030-04-05',time:'13:45',number:'7',email:'QA_TEST_answer@example.invalid',ranking:['QA_TEST_B','QA_TEST_A']});
  33 |   expect(saved.file_upload.path).toMatch(new RegExp('^'+form.id+'/'));expect((await app.db.query('SELECT * FROM storage.objects WHERE bucket_id=$1',['form-attachments'])).rows).toHaveLength(1);
  34 |   expect(await page.evaluate(()=>(window as any).QA_TEST_XSS)).toBeUndefined();
  35 |  });
  36 |  test('choice and rating controls expose names and accept keyboard input '+locale,async({page})=>{
  37 |   const {form}=await fixture(page,locale,['single_choice','multiple_choice','rating']);
  38 |   const radio=card(page,'QA_TEST_single_choice').getByRole('radio',{name:'QA_TEST_ألف',exact:true});
> 39 |   await expect(radio).toHaveCount(1);await radio.focus();await page.keyboard.press('Space');await expect(radio).toBeChecked();
     |                       ^ Error: expect(locator).toHaveCount(expected) failed
  40 |   const checkbox=card(page,'QA_TEST_multiple_choice').getByRole('checkbox',{name:'QA_TEST_باء',exact:true});await checkbox.focus();await page.keyboard.press('Space');await expect(checkbox).toBeChecked();
  41 |   const rating=card(page,'QA_TEST_rating').getByRole('button',{name:locale==='ar'?'تقييم 4 من 5':'Rate 4 of 5',exact:true});await rating.focus();await page.keyboard.press('Space');await expect(rating).toHaveAttribute('aria-pressed','true');
  42 |   await page.getByRole('button',{name:locale==='ar'?'إرسال الاستجابة':'Submit Form',exact:true}).click();await expect(page.getByText('QA_TEST_ALL_SAVED',{exact:true})).toBeVisible();
  43 |   expect((await app.db.query('SELECT * FROM form_responses WHERE form_id=$1',[form.id])).rows).toHaveLength(1);
  44 |  });
  45 | }
  46 | 
```