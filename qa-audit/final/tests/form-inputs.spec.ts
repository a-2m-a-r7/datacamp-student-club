import {test,expect,Page} from '@playwright/test';import {randomUUID} from 'node:crypto';
import {platform,admin,member} from '../../fix-tests/persisted-platform';
let app:Awaited<ReturnType<typeof platform>>;
test.beforeEach(async()=>{app=await platform();});test.afterEach(async({browser})=>{for(const c of browser.contexts())await c.close();await app.db.close();});
async function fixture(page:Page,locale:'ar'|'en',types:string[]){
 const questions=types.map((type,position)=>({id:randomUUID(),type,title:'QA_TEST_'+type,position,required:type!=='section_header',options:['single_choice','multiple_choice','dropdown','ranking'].includes(type)?[{id:'QA_TEST_A',text:'QA_TEST_ألف'},{id:'QA_TEST_B',text:'QA_TEST_باء'}]:[],settings:{placeholder:'QA_TEST_'+type,maxRating:5,min:type==='number'?1:undefined,max:type==='number'?10:undefined}}));
 const form=(await app.asUser(admin,tx=>tx.query('SELECT save_form($1,$2) saved',[JSON.stringify({title:'QA_TEST_ALL_TYPES',slug:'qa-test-'+randomUUID(),status:'published',allow_anonymous:false,one_response_per_user:true,success_message:'QA_TEST_ALL_SAVED'}),JSON.stringify(questions)]))).rows[0].saved.form;
 await app.connect(page,member,locale);await page.route('**/api/forms/submit',async route=>{try{const b=route.request().postDataJSON();const r=await app.asUser(member,tx=>tx.query('SELECT submit_form_response($1,$2,$3,$4) saved',[b.formId,JSON.stringify(b.answers),b.respondentEmail,JSON.stringify(b.metadata)]));await route.fulfill({status:200,json:r.rows[0].saved});}catch(e:any){await route.fulfill({status:400,json:{error:e.message}});}});
 await page.goto('/f/'+form.slug);return {form,questions};
}
const card=(page:Page,title:string)=>page.getByText(title,{exact:true}).locator('xpath=ancestor::div[contains(@class,"rounded-2xl")][1]');
for(const locale of ['en','ar'] as const){
 test('all 14 form types persist exact answers across sections '+locale,async({page})=>{
  const {form,questions}=await fixture(page,locale,['short_text','long_text','single_choice','multiple_choice','dropdown','rating','linear_scale','section_header','date','time','number','email','file_upload','ranking']);
  const field=(type:string)=>card(page,'QA_TEST_'+type);
  await field('short_text').locator('input').fill('QA_TEST_العربية 😀 <script>window.QA_TEST_XSS=1</script>');
  await field('long_text').locator('textarea').fill('QA_TEST_سطر أول\nسطر ثان 😀');
  await field('single_choice').getByText('QA_TEST_باء',{exact:true}).click();
  await field('multiple_choice').getByText('QA_TEST_ألف',{exact:true}).click();await field('multiple_choice').getByText('QA_TEST_باء',{exact:true}).click();
  await field('dropdown').locator('select').selectOption('QA_TEST_B');
  await field('rating').getByRole('button').nth(3).click();await field('linear_scale').getByRole('button',{name:'5',exact:true}).click();
  await page.getByRole('button',{name:locale==='ar'?'التالي':'Next',exact:true}).click();
  await field('date').locator('input').fill('2030-04-05');await field('time').locator('input').fill('13:45');await field('number').locator('input').fill('7');await field('email').locator('input').fill('QA_TEST_answer@example.invalid');
  await field('file_upload').locator('input[type=file]').setInputFiles({name:'QA_TEST_مرفق.txt',mimeType:'text/plain',buffer:Buffer.from('QA_TEST_محتوى عربي 😀')});
  await expect(field('file_upload').getByText('QA_TEST_مرفق.txt',{exact:true})).toBeVisible();
  const rank=field('ranking');await rank.getByText('QA_TEST_باء',{exact:true}).dragTo(rank.getByText('QA_TEST_ألف',{exact:true}));
  await page.getByRole('button',{name:locale==='ar'?'السابق':'Previous',exact:true}).click();await expect(field('short_text').locator('input')).toHaveValue(/العربية 😀/);
  await page.getByRole('button',{name:locale==='ar'?'التالي':'Next',exact:true}).click();await expect(field('number').locator('input')).toHaveValue('7');
  await page.getByRole('button',{name:locale==='ar'?'إرسال الاستجابة':'Submit Form',exact:true}).click();await expect(page.getByText('QA_TEST_ALL_SAVED',{exact:true})).toBeVisible();
  const rows=(await app.db.query<any>('SELECT question_id,value FROM form_answers WHERE response_id IN (SELECT id FROM form_responses WHERE form_id=$1)',[form.id])).rows;expect(rows).toHaveLength(13);
  const saved=Object.fromEntries(rows.map(r=>[questions.find(q=>q.id===r.question_id)!.type,r.value]));
  expect(saved).toMatchObject({short_text:'QA_TEST_العربية 😀 <script>window.QA_TEST_XSS=1</script>',long_text:'QA_TEST_سطر أول\nسطر ثان 😀',single_choice:'QA_TEST_B',multiple_choice:['QA_TEST_A','QA_TEST_B'],dropdown:'QA_TEST_B',rating:4,linear_scale:5,date:'2030-04-05',time:'13:45',number:'7',email:'QA_TEST_answer@example.invalid',ranking:['QA_TEST_B','QA_TEST_A']});
  expect(saved.file_upload.path).toMatch(new RegExp('^'+form.id+'/'));expect((await app.db.query('SELECT * FROM storage.objects WHERE bucket_id=$1',['form-attachments'])).rows).toHaveLength(1);
  expect(await page.evaluate(()=>(window as any).QA_TEST_XSS)).toBeUndefined();
 });
 test('choice and rating controls expose names and accept keyboard input '+locale,async({page})=>{
  const {form}=await fixture(page,locale,['single_choice','multiple_choice','rating']);
  const radio=card(page,'QA_TEST_single_choice').getByRole('radio',{name:'QA_TEST_ألف',exact:true});
  await expect(radio).toHaveCount(1);await radio.focus();await page.keyboard.press('Space');await expect(radio).toBeChecked();
  const checkbox=card(page,'QA_TEST_multiple_choice').getByRole('checkbox',{name:'QA_TEST_باء',exact:true});await checkbox.focus();await page.keyboard.press('Space');await expect(checkbox).toBeChecked();
  const rating=card(page,'QA_TEST_rating').getByRole('button',{name:locale==='ar'?'تقييم 4 من 5':'Rate 4 of 5',exact:true});await rating.focus();await page.keyboard.press('Space');await expect(rating).toHaveAttribute('aria-pressed','true');
  await page.getByRole('button',{name:locale==='ar'?'إرسال الاستجابة':'Submit Form',exact:true}).click();await expect(page.getByText('QA_TEST_ALL_SAVED',{exact:true})).toBeVisible();
  expect((await app.db.query('SELECT * FROM form_responses WHERE form_id=$1',[form.id])).rows).toHaveLength(1);
 });
}
