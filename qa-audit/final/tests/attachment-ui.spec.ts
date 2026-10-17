import {test,expect} from '@playwright/test';
import {randomUUID} from 'node:crypto';
import {platform,member} from '../../fix-tests/persisted-platform';

for(const language of ['en','ar'] as const)test('form attachment rejects empty selection and saves real file metadata '+language,async({page})=>{
 const app=await platform();
 try{
  const id=randomUUID(),question=randomUUID(),slug='qa-test-file-'+id;
  await app.db.query("INSERT INTO forms(id,title,slug,status,allow_anonymous,success_message) VALUES($1,'QA_TEST_ATTACHMENT_UI',$2,'published',false,'QA_TEST_FILE_SAVED')",[id,slug]);
  await app.db.query("INSERT INTO form_questions(id,form_id,title,type,required) VALUES($1,$2,'QA_TEST_UPLOAD','file_upload',true)",[question,id]);
  await app.connect(page,member,language);
  await page.route('**/api/forms/submit',async route=>{
   const body=route.request().postDataJSON();
   try{const result=await app.asUser(member,tx=>tx.query('SELECT submit_form_response($1,$2) value',[body.formId,JSON.stringify(body.answers)]));await route.fulfill({contentType:'application/json',body:JSON.stringify(result.rows[0].value)});}
   catch(error:any){await route.fulfill({status:400,contentType:'application/json',body:JSON.stringify({error:error.message})});}
  });
  await page.goto('/f/'+slug);
  const input=page.locator('input[type=file]');await expect(input).toHaveCount(1);
  await input.setInputFiles({name:'QA_TEST_empty.txt',mimeType:'text/plain',buffer:Buffer.alloc(0)});
  await expect(page.getByText(language==='ar'?'الملف فارغ. اختر ملفًا يحتوي على بيانات.':'The file is empty. Choose a file with content.',{exact:true})).toBeVisible();
  expect(app.calls.filter(c=>c.url.includes('/storage/')&&c.method==='POST')).toHaveLength(0);
  const bytes=Buffer.from('QA_TEST_ attachment\nملف فعلي\n','utf8');
  await input.setInputFiles({name:'QA_TEST_real.txt',mimeType:'text/plain',buffer:bytes});
  await expect(page.getByText(language==='ar'?'تم رفع الملف بنجاح':'File uploaded successfully',{exact:true})).toBeVisible();
  const object=(await app.db.query<any>("SELECT name,metadata FROM storage.objects WHERE bucket_id='form-attachments'")).rows[0];
  expect(object.metadata).toMatchObject({size:bytes.length,mimetype:'text/plain'});
  expect(app.uploads.get('form-attachments/'+object.name)).toEqual(bytes);
  await page.getByRole('button',{name:language==='ar'?'إرسال الاستجابة':'Submit Form',exact:true}).click();
  await expect(page.getByText('QA_TEST_FILE_SAVED',{exact:true})).toBeVisible();
  const answers=(await app.db.query<any>('SELECT value FROM form_answers WHERE question_id=$1',[question])).rows;
  expect(answers).toHaveLength(1);expect(answers[0].value).toMatchObject({path:object.name,size:bytes.length});
 }finally{await page.context().close();await app.db.close();}
});
