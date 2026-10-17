import {test,expect} from '@playwright/test';import {randomUUID} from 'node:crypto';import {platform,member} from '../../fix-tests/persisted-platform';
let p:Awaited<ReturnType<typeof platform>>;test.afterEach(async()=>{await p?.db.close();});
for(const language of ['en','ar'] as const)test('manual input runs independently of grading and reset restores defaults '+language,async({page})=>{
 p=await platform();const cid=randomUUID(),lid=randomUUID();
 await p.db.query("INSERT INTO courses(id,title,slug,is_published) VALUES($1,'QA_TEST_STDIN','qa-test-stdin',true)",[cid]);
 const cases=[{description:'QA_TEST_THREE',input:'3',expectedOutput:'6'},{description:'QA_TEST_FOUR',input:'4',expectedOutput:'8'}];
 await p.db.query("INSERT INTO lessons(id,course_id,title,type,position,exercise_language,exercise_prompt,exercise_starter_code,exercise_test_cases) VALUES($1,$2,'QA_TEST_STDIN_LESSON','exercise',1,'javascript','QA_TEST_DOUBLE_INPUT','console.log(Number(stdin)*2)',$3)",[lid,cid,JSON.stringify(cases)]);
 await p.connect(page,member,language);await page.goto('/courses/qa-test-stdin/learn');
 const stdin=page.getByLabel('Standard input (stdin)',{exact:true});await expect(stdin).toHaveValue('3');await stdin.fill('7');await page.getByRole('button',{name:'RUN_CODE',exact:true}).click();await expect(page.locator('pre').filter({hasText:/^14\s*$/})).toBeVisible();
 expect((await p.db.query<any>('SELECT completed_lessons FROM enrollments WHERE course_id=$1',[cid])).rows[0].completed_lessons).toEqual([]);
 await page.locator('main textarea').first().fill('console.log(999)');await page.getByRole('button',{name:'Reset',exact:true}).click();await expect(stdin).toHaveValue('3');await expect(page.locator('main textarea').first()).toHaveValue('console.log(Number(stdin)*2)');
 await stdin.fill('7');await page.getByRole('button',{name:'SUBMIT_SOLUTION',exact:true}).click();await expect(page.getByRole('button',{name:'CHALLENGE_SOLVED',exact:true})).toBeVisible();
 expect((await p.db.query<any>('SELECT is_completed FROM enrollments WHERE course_id=$1',[cid])).rows[0].is_completed).toBe(true);
 expect(Number((await p.db.query<any>('SELECT count(*) n FROM certificates WHERE course_id=$1',[cid])).rows[0].n)).toBe(1);
 await page.screenshot({path:test.info().outputPath('QA_TEST_stdin_'+language+'.png')});
});
