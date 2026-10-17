import {test,expect} from '@playwright/test';import {randomUUID} from 'node:crypto';import {platform,admin} from '../../fix-tests/persisted-platform';
let p:Awaited<ReturnType<typeof platform>>;test.afterEach(async()=>{await p?.db.close();});
for(const language of ['en','ar'] as const)test('applying a reviewed plan has an honest noncancellable save state '+language,async({page})=>{
 p=await platform();const cid=randomUUID(),lid=randomUUID(),job=randomUUID();
 await p.db.query("INSERT INTO courses(id,title,slug) VALUES($1,'QA_TEST_APPLY_STATE','qa-test-apply')",[cid]);await p.db.query("INSERT INTO lessons(id,course_id,title,type,position) VALUES($1,$2,'QA_TEST_SOURCE','video',1)",[lid,cid]);
 const plan={summary:'QA_TEST_REVIEW',questions:Array.from({length:3},(_,i)=>({id:randomUUID(),question:'QA_TEST_Q'+i,options:['A','B'],correctIndex:0,explanation:'QA_TEST_REASON'})),exercise:{language:'javascript',prompt:'QA_TEST_DOUBLE',starterCode:'console.log(Number(stdin)*2)',solution:'console.log(Number(stdin)*2)',testCases:[{description:'QA_TEST_CASE',input:'3',expectedOutput:'6'}]}};
 await p.db.query("INSERT INTO lesson_analysis_jobs(id,owner_id,lesson_id,status,size_bytes,mime_type,sha256,upload_url,source_updated_at,plan) SELECT $1,$2,id,'ready',100,'video/mp4','QA_TEST','QA_TEST',updated_at,$3 FROM lessons WHERE id=$4",[job,admin,JSON.stringify(plan),lid]);
 let release!:()=>void,finish!:()=>void,calls=0;const held=new Promise<void>(r=>release=r),finished=new Promise<void>(r=>finish=r);
 await p.connect(page,admin,language);await page.route('**/api/courses/drive',r=>r.fulfill({json:{configured:true,connected:true}}));
 await page.route('**/api/courses/analyze',async route=>{const body=route.request().postDataJSON();if(body.action==='latest')return route.fulfill({json:{id:job,status:'ready',plan}});if(body.action==='apply'){calls++;await held;try{const result=(await p.db.query<any>('SELECT apply_lesson_analysis($1) result',[job])).rows[0].result;await route.fulfill({json:{success:true,result}});}finally{finish();}return;}throw Error('Unexpected QA action');});
 await page.goto('/admin/courses');await page.getByRole('button',{name:language==='ar'?'إدارة دروس الدورة':'Manage Lessons',exact:true}).click();await page.getByRole('button',{name:language==='ar'?'تعديل الدرس':'Edit lesson',exact:true}).click();
 const apply=page.getByRole('button',{name:language==='ar'?'اعتماد الملخص وإضافة الكويز والتطبيق':'Apply summary, quiz and coding practice',exact:true});await expect(apply).toBeVisible();
 try{
  await apply.click();await expect.poll(()=>calls).toBe(1);await expect(apply).toBeDisabled();
  await expect(page.getByRole('progressbar',{name:'Course upload progress',exact:true})).toHaveCount(0,{timeout:700});
  await expect(page.getByRole('button',{name:language==='ar'?'إيقاف مؤقت':'Pause',exact:true})).toHaveCount(0,{timeout:700});
  await page.screenshot({path:test.info().outputPath('QA_TEST_applying_'+language+'.png')});
 }finally{release();if(calls)await finished;}
 await expect.poll(async()=>Number((await p.db.query<any>('SELECT count(*) n FROM lessons WHERE source_lesson_id=$1',[lid])).rows[0].n)).toBe(2);expect(calls).toBe(1);
});
