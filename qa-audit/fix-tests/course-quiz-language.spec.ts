import {test,expect} from '@playwright/test';
import {randomUUID} from 'node:crypto';
import {platform,member,admin} from './persisted-platform';
let p:Awaited<ReturnType<typeof platform>>;
test.afterEach(async()=>{await p?.db.close();});
for(const view of ['learn','quiz'])test(`quiz language switches without losing the chosen answer in ${view}`,async({page})=>{
 p=await platform();const cid=randomUUID(),lid=randomUUID(),qid=randomUUID();
 await p.db.query("INSERT INTO courses(id,title,slug,is_published) VALUES($1,'QA_TEST_BILINGUAL','qa-test-bilingual',true)",[cid]);
 const questions=[{id:qid,question:'English source question',options:['Wrong','Right'],correctIndex:1,explanation:'English explanation',translations:{ar:{question:'ما الإجابة الصحيحة؟',options:['اختيار خاطئ','اختيار صحيح'],explanation:'شرح الإجابة بالعربية'},en:{question:'Which answer is correct?',options:['Incorrect option','Correct option'],explanation:'Explanation in English'}}}];
 await p.db.query("INSERT INTO lessons(id,course_id,title,type,quiz_questions) VALUES($1,$2,'QA_TEST_BILINGUAL_QUIZ','quiz',$3)",[lid,cid,JSON.stringify(questions)]);
 await p.asUser(member,t=>t.query('SELECT enroll_course($1)',[cid]));await p.connect(page,member);await page.goto('/courses/qa-test-bilingual/'+view);
 await expect(page.getByText('Which answer is correct?',{exact:view==='quiz'})).toBeVisible();
 await page.getByRole('button',{name:/Correct option$/}).click();
 await page.getByRole('button',{name:'العربية',exact:true}).first().click();await expect(page.getByText(/ما الإجابة الصحيحة؟/)).toBeVisible();await expect(page.getByRole('button',{name:/اختيار صحيح$/})).toHaveClass(/border-primary/);
 await page.getByRole('button',{name:'EN',exact:true}).click();await expect(page.getByRole('button',{name:/Correct option$/})).toHaveClass(/border-primary/);
 await page.getByRole('button',{name:view==='learn'?'SUBMIT_ASSESSMENT':'SUBMIT ASSESSMENT',exact:true}).click();
 await expect.poll(async()=>Number((await p.db.query<any>('SELECT (quiz_scores->>$1)::integer score FROM enrollments WHERE user_id=$2 AND course_id=$3',[lid,member,cid])).rows[0]?.score||0)).toBe(100);
 await expect(page.getByText('Explanation in English',{exact:false})).toBeVisible();
});
for(const view of ['learn','quiz'])test(`administrator previews a draft using profile permissions without enrollment or assessment writes in ${view}`,async({page})=>{
 p=await platform();const cid=randomUUID(),lid=randomUUID(),qid=randomUUID();
 await p.db.query("INSERT INTO courses(id,title,slug,is_published) VALUES($1,'QA_TEST_DRAFT','qa-test-draft-preview',false)",[cid]);
 await p.db.query("INSERT INTO lessons(id,course_id,title,type,quiz_questions) VALUES($1,$2,'QA_TEST_DRAFT_QUIZ','quiz',$3)",[lid,cid,JSON.stringify([{id:qid,question:'QA_TEST_PREVIEW_QUESTION',options:['QA_TEST_WRONG','QA_TEST_RIGHT'],correctIndex:1,explanation:'QA_TEST_PREVIEW_EXPLANATION'}])]);
 await p.connect(page,admin);const writes:string[]=[];page.on('request',r=>{if(r.url().includes('/rpc/')&&/enroll_course|submit_course_quiz|complete_course_lesson|save_lesson_watch_progress/.test(r.url()))writes.push(r.url());});
 await page.goto('/courses/qa-test-draft-preview/'+view);await expect(page.getByText('QA_TEST_PREVIEW_QUESTION',{exact:false})).toBeVisible();if(view==='learn')await expect(page.getByRole('status').filter({hasText:'Administrator draft preview'})).toBeVisible();else await expect(page.getByText('Preview without saving',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:/QA_TEST_RIGHT$/}).click();await page.getByRole('button',{name:'PREVIEW ANSWERS',exact:true}).click();await expect(page.getByText('QA_TEST_PREVIEW_EXPLANATION',{exact:false})).toBeVisible();
 expect(writes).toEqual([]);expect((await p.db.query('SELECT * FROM enrollments WHERE course_id=$1',[cid])).rows).toHaveLength(0);expect((await p.db.query('SELECT * FROM certificates WHERE course_id=$1',[cid])).rows).toHaveLength(0);
});
