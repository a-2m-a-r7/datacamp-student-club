import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {platform,admin,member} from '../../fix-tests/persisted-platform';
test('hidden branch answer cannot bypass a reachable required target or save a response',async()=>{
 const app=await platform();try{
  const start=randomUUID(),hidden=randomUUID(),target=randomUUID();
  const questions=[{id:start,title:'QA_TEST_START',type:'dropdown',position:0,options:[{id:'QA_TEST_JUMP',text:'QA_TEST_JUMP',goToQuestionId:target}]},{id:hidden,title:'QA_TEST_HIDDEN',type:'dropdown',position:1,options:[{id:'QA_TEST_END',text:'QA_TEST_END',goToQuestionId:'end'}]},{id:target,title:'QA_TEST_TARGET',type:'short_text',position:2,required:true}];
  const form=(await app.asUser(admin,tx=>tx.query('SELECT save_form($1,$2) saved',[JSON.stringify({title:'QA_TEST_BRANCH_SECURITY',slug:'qa-test-branch-security',status:'published',allow_anonymous:false}),JSON.stringify(questions)]))).rows[0].saved.form;
  await assert.rejects(app.asUser(member,tx=>tx.query('SELECT submit_form_response($1,$2)',[form.id,JSON.stringify([{question_id:start,value:'QA_TEST_JUMP'},{question_id:hidden,value:'QA_TEST_END'}])])));
  assert.equal((await app.db.query('SELECT * FROM form_responses WHERE form_id=$1',[form.id])).rows.length,0);
  const valid=await app.asUser(member,tx=>tx.query('SELECT submit_form_response($1,$2) saved',[form.id,JSON.stringify([{question_id:start,value:'QA_TEST_JUMP'},{question_id:target,value:'QA_TEST_ANSWER'}])]));assert.equal(valid.rows[0].saved.success,true);
 }finally{await app.db.close();}
});
