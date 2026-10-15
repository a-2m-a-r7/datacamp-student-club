import {test,expect} from '@playwright/test';
import {randomUUID} from 'node:crypto';
import {platform,member} from './persisted-platform';
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
