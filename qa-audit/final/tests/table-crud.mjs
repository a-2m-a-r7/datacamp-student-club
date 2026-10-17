// Real PostgreSQL RLS commands against disposable QA_TEST_ rows, no HTTP/cloud.
import {PGlite} from '@electric-sql/pglite';
import {citext} from '@electric-sql/pglite/contrib/citext';
import {pgcrypto} from '@electric-sql/pglite/contrib/pgcrypto';
import {uuid_ossp} from '@electric-sql/pglite/contrib/uuid_ossp';
import fs from 'node:fs';
import {randomUUID} from 'node:crypto';
const db=new PGlite({extensions:{citext,pgcrypto,'uuid-ossp':uuid_ossp}});
const flags=process.argv.slice(2);if(flags.some(f=>!['--source-grants','--candidate','--before-grant-fix'].includes(f)))throw Error('Unsupported local test flag');
const sourceGrants=flags.includes('--source-grants'),candidate=flags.includes('--candidate');
const beforeGrantFix=flags.includes('--before-grant-fix');
if(beforeGrantFix&&!sourceGrants)throw Error('Historical control requires --source-grants');
const suffix=(sourceGrants?'-source':'')+(candidate?'-candidate':'');
const report={at:new Date().toISOString(),scope:sourceGrants?'Full migration chain; source grants ONLY, no simulated provider defaults':'Full migration chain; explicitly simulated provider public DML defaults before migrations',limitations:['Local transaction rollback per CRUD probe, not hosted Supabase.','UPDATE probes write an unchanged nonkey value; they test UPDATE authorization and trigger execution, not every editable field value.','INSERT probes free the exact disposable fixture first inside the rolled-back owner transaction to avoid unique-constraint false positives.'],candidate,historicalControl:beforeGrantFix?'Explicitly exclude only 20261016152338_explicit_datacamp_data_api_grants.sql':null,cases:[],fixtures:[],status:'running'};
const fixtures=new Map();let columns=[];
const uid={member:randomUUID(),other:randomUUID(),admin:randomUUID()};
const q=name=>'"'+name.replaceAll('"','""')+'"';
async function put(table,data,index){
 const keys=Object.keys(data),params=keys.map(key=>['json','jsonb'].includes(columns.find(c=>c.table_name===table&&c.column_name===key)?.udt_name)?JSON.stringify(data[key]):data[key]);
 const row=(await db.query(`INSERT INTO ${q(table)}(${keys.map(q)}) VALUES(${keys.map((_,i)=>'$'+(i+1))}) RETURNING *`,params)).rows[0];
 if(index!==undefined){const rows=fixtures.get(table)||[];rows[index]=row;fixtures.set(table,rows);}return row;
}
async function probe(table,row,actor,operation,pk){
 const predicate=pk.map(key=>`t.${q(key)} IS NOT DISTINCT FROM r.${q(key)}`).join(' AND ');
 const record=`jsonb_populate_record(NULL::public.${q(table)},$1::jsonb) r`;
 let result;await db.exec('BEGIN');
 try{
  // Free unique values for the INSERT probe in this rollback-only fixture txn.
  if(operation==='INSERT')await db.query(`DELETE FROM ${q(table)} t USING ${record} WHERE ${predicate}`,[JSON.stringify(row)]);
  await db.query("SELECT set_config('request.jwt.claim.sub',$1,true),set_config('request.jwt.claim.role',$2,true)",[actor==='anon'?'':uid[actor],actor==='anon'?'anon':'authenticated']);
  await db.exec(actor==='anon'?'SET LOCAL ROLE anon':'SET LOCAL ROLE authenticated');
  let sql;
  if(operation==='SELECT')sql=`SELECT 1 FROM ${q(table)} t CROSS JOIN ${record} WHERE ${predicate}`;
  else if(operation==='DELETE')sql=`DELETE FROM ${q(table)} t USING ${record} WHERE ${predicate} RETURNING 1`;
  else if(operation==='INSERT')sql=`INSERT INTO ${q(table)} SELECT * FROM ${record} RETURNING 1`;
  else{const key=columns.find(c=>c.table_name===table&&!pk.includes(c.column_name)&&!['updated_at','created_at'].includes(c.column_name))?.column_name||pk[0];sql=`UPDATE ${q(table)} t SET ${q(key)}=t.${q(key)} FROM ${record} WHERE ${predicate} RETURNING 1`;}
  const rows=(await db.query(sql,[JSON.stringify(row)])).rows;result={accepted:true,rows:rows.length};
 }catch(e){result={accepted:false,sqlstate:e.code||null,message:String(e.message).slice(0,180)};}
 finally{await db.exec('ROLLBACK');}
 return result;
}
const publicRead=new Set(['courses','lessons','blog','gallery','forms','form_questions','course_modules']);
const ownRead=new Set(['profiles','users','auth_events','enrollments','notifications','points_log','user_achievements','certificates','notification_reads','lesson_watch_progress','projects','course_assets']);
const noAdmin=new Set(['member_cards','course_request_windows','course_drive_connections','course_upload_jobs','lesson_analysis_jobs','notification_reads','lesson_watch_progress','form_sheet_sync_jobs']);
function allowed(table,actor,own,op){
 // The compatibility users mirror has no direct INSERT policy, including for
 // admins. Auth/profile triggers create it; preserving that denial is intended.
 if(actor==='admin')return !noAdmin.has(table)&&(table!=='course_assets'||op==='SELECT')&&!(table==='users'&&op==='INSERT');
 if(op==='SELECT')return publicRead.has(table)||(actor==='member'&&own&&ownRead.has(table));
 if(op==='INSERT')return table==='messages'||(actor==='member'&&own&&['auth_events','notifications','projects','lesson_watch_progress'].includes(table));
 if(op==='UPDATE')return actor==='member'&&own&&['profiles','users','notifications','lesson_watch_progress'].includes(table);
 return actor==='member'&&own&&table==='lesson_watch_progress';
}
try{
 const source=fs.readFileSync('qa-audit/final/tests/full-schema-security.mjs','utf8');
 const bootstrap=source.match(/^const bootstrap = `([\s\S]*?)`;/m)?.[1];if(!bootstrap||bootstrap.includes('${'))throw Error('Missing literal platform bootstrap');
 await db.exec(bootstrap);if(!sourceGrants)await db.exec('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT,INSERT,UPDATE,DELETE ON TABLES TO anon,authenticated');
 for(const file of fs.readdirSync('supabase/migrations').filter(f=>/^\d{14}_.+\.sql$/.test(f)&&!(beforeGrantFix&&f==='20261016152338_explicit_datacamp_data_api_grants.sql')).sort())await db.exec(fs.readFileSync('supabase/migrations/'+file,'utf8'));
 if(candidate)await db.exec(fs.readFileSync('qa-audit/final/proposed-sql/BUG-009.sql','utf8'));
 columns=(await db.query("SELECT table_name,column_name,udt_name FROM information_schema.columns WHERE table_schema='public' ORDER BY ordinal_position")).rows;
 for(const[name,id]of Object.entries(uid))await db.query("INSERT INTO auth.users(id,email,email_confirmed_at,raw_user_meta_data) VALUES($1,$2,now(),$3::jsonb)",[id,`QA_TEST_${name}@example.invalid`,JSON.stringify({full_name:'QA_TEST_'+name})]);
 await db.query("UPDATE profiles SET role='admin' WHERE id=$1",[uid.admin]);
 for(const [index,user]of [uid.member,uid.other].entries()){
  for(const table of ['profiles','users']){const rows=fixtures.get(table)||[];rows[index]=(await db.query(`SELECT * FROM ${table} WHERE id=$1`,[user])).rows[0];fixtures.set(table,rows);}
  const title='QA_TEST_CRUD_'+index;
  const course=await put('courses',{title,slug:'qa-test-crud-'+index,is_published:false},index);
  const lesson=await put('lessons',{course_id:course.id,title,type:'article',position:1},index);
  await db.query('UPDATE courses SET is_published=true WHERE id=$1',[course.id]);fixtures.get('courses')[index]=(await db.query('SELECT * FROM courses WHERE id=$1',[course.id])).rows[0];
  await put('enrollments',{user_id:user,course_id:course.id},index);
  await put('events',{title,date:'2030-01-01',status:'published',capacity:5},index);
  await put('staff',{name:title,role:'QA_TEST_ROLE',image:''},index);
  await put('projects',{title,status:'planning',created_by:user},index);
  await put('blog',{title,content:title,status:'published'},index);
  await put('gallery',{title,url:'http://127.0.0.1/QA_TEST_IMAGE.png'},index);
  await put('settings',{key:'QA_TEST_private_'+index,value:{QA_TEST:true}},index);
  await put('messages',{name:title,email:`QA_TEST_${index}@example.invalid`,subject:title,message:title,status:'unread'},index);
  const notification=await put('notifications',{user_id:user,title,message:title},index);
  await put('auth_events',{user_id:user,email:`QA_TEST_${index}@example.invalid`,event_type:'login',provider:'email'},index);
  await put('audit_logs',{user_id:user,action:title,user_email:`QA_TEST_${index}@example.invalid`},index);
  await put('points_log',{user_id:user,action:'QA_TEST',description:title,points:1},index);
  await put('user_achievements',{user_id:user,badge_id:title,badge_name:title},index);
  await put('certificates',{user_id:user,user_full_name:title,type:'achievement',verification_code:title},index);
  const form=await put('forms',{title,slug:'qa-test-crud-'+index,status:'published',created_by:user},index);
  await put('form_sheet_sync_jobs',{form_id:form.id},index);
  const question=await put('form_questions',{form_id:form.id,title,type:'short_text'},index);
  const response=await put('form_responses',{form_id:form.id,respondent_id:user},index);
  await put('form_answers',{response_id:response.id,question_id:question.id,value:title},index);
  await put('sync_logs',{form_id:form.id,response_id:response.id,status:'pending'},index);
  await put('admin_emails',{email:`QA_TEST_allowlist_${index}@example.invalid`},index);
  await put('notification_reads',{user_id:user,notification_id:notification.id},index);
  await put('member_cards',{user_id:user},index);
  await put('course_request_windows',{user_id:user,window_started:new Date().toISOString(),requests:1},index);
  await put('course_modules',{course_id:course.id,title},index);
  await put('course_assets',{course_id:course.id,lesson_id:lesson.id,owner_id:user,kind:'material',provider:'drive',name:title,mime_type:'text/plain',size_bytes:10,file_id:title,url:'http://127.0.0.1/QA_TEST_asset'},index);
  await put('lesson_watch_progress',{user_id:user,lesson_id:lesson.id,seconds:1},index);
  await put('course_drive_connections',{owner_id:user,encrypted_refresh_token:'QA_TEST_FAKE_NOT_A_CREDENTIAL'},index);
  await put('course_upload_jobs',{owner_id:user,lesson_id:lesson.id,kind:'material',name:title,mime_type:'text/plain',size_bytes:10,fingerprint:title,sha256:'0'.repeat(64),upload_url:'http://127.0.0.1/QA_TEST_upload'},index);
  await put('lesson_analysis_jobs',{owner_id:user,lesson_id:lesson.id,size_bytes:10,mime_type:'video/mp4',sha256:'0'.repeat(64),upload_url:'http://127.0.0.1/QA_TEST_upload',source_updated_at:new Date().toISOString()},index);
 }
 const tables=(await db.query("SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename")).rows.map(r=>r.tablename);
 const primary=(await db.query("SELECT tc.table_name,kcu.column_name FROM information_schema.table_constraints tc JOIN information_schema.key_column_usage kcu USING (constraint_name,constraint_schema) WHERE tc.table_schema='public' AND tc.constraint_type='PRIMARY KEY' ORDER BY kcu.ordinal_position")).rows;
 for(const table of tables){
  if(!fixtures.has(table))throw Error('Unseeded application table: '+table);
  const pk=primary.filter(p=>p.table_name===table).map(p=>p.column_name);if(!pk.length)throw Error('Missing primary key: '+table);
  for(const actor of ['anon','member','admin'])for(const [index,row]of fixtures.get(table).entries())for(const op of ['SELECT','INSERT','UPDATE','DELETE']){
   const expected=allowed(table,actor,index===0,op);const observed=await probe(table,row,actor,op,pk);
   const passed=expected?observed.accepted&&observed.rows===1:!observed.accepted||observed.rows===0;
   report.cases.push({id:`TABLE-${table}-${actor}-${index===0?'own':'foreign'}-${op}`,table,actor,fixture:index===0?'memberA':'memberB',operation:op,expectedAllowed:expected,observed,passed});
  }
 }
 report.fixtures=[...fixtures].map(([table,rows])=>({table,rows:rows.length}));report.status=report.cases.every(c=>c.passed)?'passed':'failed';
}catch(e){report.status='harness-error';report.error={sqlstate:e.code||null,message:String(e.message).slice(0,300)};}
finally{await db.close();}
report.finishedAt=new Date().toISOString();report.summary={passed:report.cases.filter(c=>c.passed).length,failed:report.cases.filter(c=>!c.passed).length};
const output='qa-audit/final/evidence/runs/'+process.env.QA_FINAL_RUN+'/table-crud'+suffix+'.json';
fs.mkdirSync(output.slice(0,output.lastIndexOf('/')),{recursive:true});fs.writeFileSync(output,JSON.stringify(report,null,2));
console.log(JSON.stringify({status:report.status,summary:report.summary,error:report.error,evidence:output,failures:report.cases.filter(c=>!c.passed).slice(0,8)}));
if(report.status!=='passed')process.exitCode=1;
