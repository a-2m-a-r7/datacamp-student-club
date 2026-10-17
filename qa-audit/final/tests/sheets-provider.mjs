import fs from 'node:fs';import assert from 'node:assert/strict';import crypto from 'node:crypto';import {createClient} from '@supabase/supabase-js';
const root='qa-audit/.runtime/final-hosted',cfg=JSON.parse(fs.readFileSync(root+'/config.json','utf8')),secret=JSON.parse(fs.readFileSync(root+'/server-secrets.json','utf8')).SUPABASE_SERVICE_ROLE_KEY;
const label=process.argv[2]||'QA_TEST_actual_sheets_before';if(!/^[\w-]+$/.test(label)||fs.existsSync('qa-audit/final/evidence/'+label+'.json'))throw Error('Use a new evidence label');const driveOwner=process.argv[3]==='drive';
assert.equal(cfg.projectRef,'kcqgnkfdpfibwkrghubl');assert.equal(cfg.url,'https://kcqgnkfdpfibwkrghubl.supabase.co');assert.equal(JSON.parse(Buffer.from(secret.split('.')[1],'base64url')).ref,cfg.projectRef);
const server=createClient(cfg.url,secret,{auth:{persistSession:false,autoRefreshToken:false}}),user=createClient(cfg.url,cfg.publishableKey,{auth:{persistSession:false,autoRefreshToken:false}}),account=cfg.accounts.find(a=>a.kind==='admin');
const signed=await user.auth.signInWithPassword({email:account.email,password:account.password});assert.equal(signed.error,null);
const formId=crypto.randomUUID(),questionId=crypto.randomUUID(),report={checkedAt:new Date().toISOString(),target:cfg.projectRef,steps:[],limits:'Actual Sheets credential and create call. Synthetic QA form only; no existing sheets are modified.'};
try{
 assert.equal((await server.from('forms').insert({id:formId,title:'QA_TEST_Sheets_Actual',slug:'qa-test-sheets-'+formId,status:'draft',created_by:driveOwner?'cf94bf7d-15ab-48be-b9c7-c537a8b0b299':account.id})).error,null);
 assert.equal((await server.from('form_questions').insert({id:questionId,form_id:formId,type:'short_text',title:'QA_TEST_Question',position:0})).error,null);
 const response=await fetch('http://127.0.0.1:3200/api/forms/sync-sheet',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+signed.data.session.access_token},body:JSON.stringify({formId,resyncAll:true}),signal:AbortSignal.timeout(90000)});
 const body=await response.json();report.steps.push({action:'create-and-resync',http:response.status,success:body.success===true,message:body.error||body.message||null});
 assert.equal(response.status,200,'Actual Sheets create failed: '+(body.error||body.message));assert.equal(body.success,true);report.spreadsheetCreated=true;
 // Keep a private exact-ID cleanup manifest for any external file created.
 fs.writeFileSync(root+'/sheets-provider-fixtures.json',JSON.stringify({formId,questionId,spreadsheetId:body.spreadsheetId},null,2)+'\n',{mode:0o600,flag:'wx'});
 if(driveOwner){
  const oauth=JSON.parse(fs.readFileSync(root+'/google-oauth.json','utf8')).web;assert.equal(oauth.project_id,'qa-test-datacamp-final');
  Object.assign(process.env,{SUPABASE_URL:cfg.url,SUPABASE_SERVICE_ROLE_KEY:secret,GOOGLE_DRIVE_CLIENT_ID:oauth.client_id,GOOGLE_DRIVE_CLIENT_SECRET:oauth.client_secret,COURSE_SITE_URL:'http://127.0.0.1:3200'});
  const {driveToken}=await import('../../../server/courseMedia.ts');const access=await driveToken(server,'cf94bf7d-15ab-48be-b9c7-c537a8b0b299');
  const read=await fetch('https://sheets.googleapis.com/v4/spreadsheets/'+encodeURIComponent(body.spreadsheetId)+'/values/Responses!A1:Z5',{headers:{Authorization:'Bearer '+access},signal:AbortSignal.timeout(20000)});assert.equal(read.status,200);const rows=await read.json();assert.deepEqual(rows.values,[['Submission ID','Submitted At','Respondent Name','Respondent Email','QA_TEST_Question']]);report.actualHeaderReadBack=true;report.ownerDriveMode=true;
 }
}catch(error){report.failure=String(error.message).replace(/(AIza|AQ\.)[\w.-]+/g,'[REDACTED]');process.exitCode=1;console.error(report.failure);}
finally{
 fs.writeFileSync('qa-audit/final/evidence/'+label+'.json',JSON.stringify(report,null,2)+'\n');
 const row=await server.from('forms').select('spreadsheet_id').eq('id',formId).single();
 if(!row.data?.spreadsheet_id)await server.from('forms').delete().eq('id',formId);
 await user.auth.signOut({scope:'local'});await user.removeAllChannels();
}
