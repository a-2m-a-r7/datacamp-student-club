/** Proposed BUG-003/004 verification, ephemeral memory only. Root executes; no .env/network. */
import {PGlite} from '@electric-sql/pglite';
import {citext} from '@electric-sql/pglite/contrib/citext';
import {pgcrypto} from '@electric-sql/pglite/contrib/pgcrypto';
import {uuid_ossp} from '@electric-sql/pglite/contrib/uuid_ossp';
import {readFile,readdir,mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {createHash} from 'node:crypto';
const root=fileURLToPath(new URL('../../../',import.meta.url));
const flags=process.argv.slice(2);
if(flags.some(flag=>!['--installed-only','--mirror-only'].includes(flag)))throw Error('Supported flags: --installed-only --mirror-only');
const installedOnly=flags.includes('--installed-only'),mirrorOnly=flags.includes('--mirror-only');
const evidenceName=`database-boundaries-${installedOnly?'installed':'candidates'}${mirrorOnly?'-mirror':''}.json`;
const output=path.join(root,'qa-audit/final/evidence',evidenceName);
const report={checkedAt:new Date().toISOString(),environment:installedOnly?'In-memory PostgreSQL, installed migration chain only':'In-memory PostgreSQL, installed chain plus proposed SQL',
 mode:{installedOnly,mirrorOnly,proposedSqlApplied:!installedOnly},
 bootstrap:'Minimal platform bootstrap extracted without importing/running full-schema-security.mjs; explicit simulated public table default DML for anon/authenticated/service_role BEFORE migrations. Not a verified production default.',
 migrations:[],proposed:[],cases:[],status:'running'};
const safe=e=>({sqlstate:/^[A-Z0-9]{5}$/.test(String(e?.code))?String(e.code):null,message:String(e?.message||'Unknown failure').replace(/[\r\n\t]+/g,' ').slice(0,250)});
const db=new PGlite({extensions:{citext,pgcrypto,'uuid-ossp':uuid_ossp}});
const uid=n=>`40000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const member=uid(1),other=uid(2),admin=uid(3),course=uid(100),lesson=uid(101);
async function as(actor,sql,params=[]){
 const role=actor==='anon'?'anon':actor==='service'?'service_role':'authenticated';
 const subject=actor==='member'?member:actor==='admin'?admin:'';
 await db.query("SELECT set_config('request.jwt.claim.sub',$1,false),set_config('request.jwt.claim.role',$2,false)",[subject,role]);
 await db.exec(({anon:'SET ROLE anon',service_role:'SET ROLE service_role',authenticated:'SET ROLE authenticated'})[role]);
 try{return{ok:true,rows:(await db.query(sql,params)).rows};}
 catch(e){return{ok:false,error:safe(e)};}
 finally{await db.exec('RESET ROLE');await db.query("SELECT set_config('request.jwt.claim.sub','',false),set_config('request.jwt.claim.role','',false)");}
}
const result=r=>r.ok?{accepted:true,rowCount:r.rows.length}:{accepted:false,...r.error};
const check=(id,passed,observed)=>report.cases.push({id,passed,observed});
const state=async()=> (await db.query('SELECT role,total_points,xp,status,is_verified FROM public.users WHERE id=$1',[member])).rows[0];
try{
 const source=await readFile(path.join(root,'qa-audit/final/tests/full-schema-security.mjs'),'utf8');
 const bootstrap=source.match(/^const bootstrap = `([\s\S]*?)`;/m)?.[1];
 if(!bootstrap||bootstrap.includes('${'))throw Error('Literal platform bootstrap not found.');
 await db.exec(bootstrap);
 await db.exec('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT,INSERT,UPDATE,DELETE ON TABLES TO anon,authenticated,service_role');
 for(const name of (await readdir(path.join(root,'supabase/migrations'))).filter(n=>/^\d{14}_[\w-]+\.sql$/.test(n)).sort()){
  await db.exec(await readFile(path.join(root,'supabase/migrations',name),'utf8'));report.migrations.push(name);
 }
 for(const name of installedOnly?[]:['BUG-003.sql',...(mirrorOnly?[]:['BUG-004.sql'])]){
  const sql=await readFile(path.join(root,'qa-audit/final/proposed-sql',name),'utf8');
  await db.exec(sql);report.proposed.push({name,sha256:createHash('sha256').update(sql).digest('hex')});
 }
 for(const [n,label]of[[1,'member'],[2,'other'],[3,'admin']]){
  await db.query(`INSERT INTO auth.users(id,email,email_confirmed_at,raw_user_meta_data,raw_app_meta_data)
   VALUES($1,$2,now(),$3::jsonb,'{"provider":"email"}')`,[uid(n),`QA_TEST_${label}@example.invalid`,JSON.stringify({full_name:`QA_TEST_${label}`})]);
 }
 await db.query("UPDATE profiles SET role='admin' WHERE id=$1",[admin]);
 await db.query("INSERT INTO courses(id,title,slug,is_published,points_reward) VALUES($1,'QA_TEST_candidate','qa-test-candidate',false,20)",[course]);
 await db.query("INSERT INTO lessons(id,course_id,title,type,points_reward) VALUES($1,$2,'QA_TEST_lesson','article',10)",[lesson,course]);
 await db.query('UPDATE courses SET is_published=true WHERE id=$1',[course]);
 const acl=(await db.query(`SELECT has_function_privilege('anon','public.refresh_course_enrolled_count(uuid)','EXECUTE') AS anon,
  has_function_privilege('authenticated','public.refresh_course_enrolled_count(uuid)','EXECUTE') AS member,
  has_function_privilege('service_role','public.refresh_course_enrolled_count(uuid)','EXECUTE') AS service`)).rows[0];
 check(mirrorOnly?'COUNTER-SERVICE-ACL':'COUNTER-EXECUTE-ACL',mirrorOnly?acl.service:!acl.anon&&!acl.member&&acl.service,acl);
 for(const actor of mirrorOnly?[]:['anon','member']){
  await db.query("UPDATE courses SET updated_at='2000-01-01T00:00:00Z' WHERE id=$1",[course]);
  const before=(await db.query('SELECT updated_at::text AS t FROM courses WHERE id=$1',[course])).rows[0].t;
  const call=await as(actor,'SELECT public.refresh_course_enrolled_count($1)',[course]);
  const after=(await db.query('SELECT updated_at::text AS t FROM courses WHERE id=$1',[course])).rows[0].t;
  check(`COUNTER-DENY-${actor}`,!call.ok&&call.error.sqlstate==='42501'&&before===after,{...result(call),unchanged:before===after});
 }
 const personal=await as('member',"UPDATE users SET full_name='QA_TEST_personal',phone='QA_TEST_phone' WHERE id=$1 RETURNING id",[member]);
 check('MIRROR-OWN-PERSONAL-EDIT',personal.ok&&personal.rows.length===1,result(personal));
 const updates=[['role','admin'],['total_points',7777],['xp',7777],['status','inactive'],['is_verified',false],['email','QA_TEST_forged@example.invalid'],
  ['provider','google'],['member_id','QA_TEST_FORGED_ID'],['level','QA_TEST_FORGED_LEVEL'],['created_at','2000-01-01T00:00:00Z'],['last_sign_in_at','2000-01-01T00:00:00Z'],['id',uid(999)]];
 for(const[field,value]of updates){
  const before=await state();
  const attempt=await as('member',`UPDATE users SET ${field}=$2 WHERE id=$1 RETURNING id`,[member,value]);
  const after=await state();
  check(`MIRROR-PROTECTED-${field}`,!attempt.ok&&JSON.stringify(before)===JSON.stringify(after),{...result(attempt),protectedStateUnchanged:JSON.stringify(before)===JSON.stringify(after)});
 }
 const foreign=await as('member',"UPDATE users SET full_name='QA_TEST_FORGED' WHERE id=$1 RETURNING id",[other]);
 check('MIRROR-FOREIGN-EDIT-DENIED',foreign.ok?foreign.rows.length===0:true,result(foreign));
 const profileUpdate=await as('member',"UPDATE profiles SET full_name='QA_TEST_profile_sync',phone='QA_TEST_sync_phone' WHERE id=$1 RETURNING id",[member]);
 const synced=(await db.query('SELECT p.full_name=u.full_name AND p.phone=u.phone AS same FROM profiles p JOIN users u ON p.id=u.id WHERE p.id=$1',[member])).rows[0].same;
 check('PROFILE-PERSONAL-EDIT-MIRROR-SYNC',profileUpdate.ok&&synced,{...result(profileUpdate),mirrorMatched:synced});
 for(let repeat=0;repeat<2;repeat++){
  const call=await as('member','SELECT public.enroll_course($1)',[course]);
  const data=(await db.query(`SELECT c.enrolled_count,p.total_points,u.total_points AS mirror_points FROM courses c,profiles p JOIN users u ON u.id=p.id WHERE c.id=$1 AND p.id=$2`,[course,member])).rows[0];
  check(`ENROLL-TRIGGERS-AND-REWARDS-${repeat+1}`,call.ok&&data.enrolled_count===1&&data.total_points===5&&data.mirror_points===5,{...result(call),...data});
 }
 const completed=await as('member','SELECT public.complete_course_lesson($1,$2)',[course,lesson]);
 const finished=(await db.query(`SELECT p.total_points,u.total_points AS mirror_points,
  (SELECT count(*)::int FROM certificates WHERE user_id=p.id AND course_id=$2) AS certificates
  FROM profiles p JOIN users u ON p.id=u.id WHERE p.id=$1`,[member,course])).rows[0];
 check('COMPLETE-CERTIFICATE-AND-TRUSTED-POINTS-SYNC',completed.ok&&finished.total_points===35&&finished.mirror_points===35&&finished.certificates===1,{...result(completed),...finished});
 const service=await as('service','SELECT public.refresh_course_enrolled_count($1)',[course]);
 check('COUNTER-SERVICE-CAPABILITY-PRESERVED',service.ok,result(service));
 const serviceMirror=await as('service','UPDATE users SET total_points=8888,xp=8888 WHERE id=$1 RETURNING id',[member]);
 check('MIRROR-SERVICE-WRITE-PRESERVED',serviceMirror.ok&&serviceMirror.rows.length===1,result(serviceMirror));
 const adminMirror=await as('admin','UPDATE users SET total_points=9999,xp=9999 WHERE id=$1 RETURNING id',[member]);
 check('MIRROR-VERIFIED-ADMIN-WRITE-PRESERVED',adminMirror.ok&&adminMirror.rows.length===1,result(adminMirror));
 // Trusted authority resynchronization must still overwrite deliberately changed mirror data.
 await db.query('UPDATE profiles SET total_points=35,xp=35 WHERE id=$1',[member]);
 check('TRUSTED-PROFILE-SYNC-REPAIRS-MIRROR',(await state()).total_points===35,{mirrorPoints:(await state()).total_points});
 // Installed-only mode never reads/applies proposed SQL, including this replay.
 if(!installedOnly){
  const reapplied=['BUG-003.sql',...(mirrorOnly?[]:['BUG-004.sql'])];
  for(const name of reapplied)await db.exec(await readFile(path.join(root,'qa-audit/final/proposed-sql',name),'utf8'));
  check('PROPOSED-SQL-REAPPLY-IDEMPOTENT',true,{reapplied:reapplied.length});
 }
 report.status=report.cases.every(c=>c.passed)?'passed':'failed';
}catch(e){report.status='blocked-by-harness';report.error=safe(e);}
finally{await db.close();}
report.finishedAt=new Date().toISOString();
await mkdir(path.dirname(output),{recursive:true});await writeFile(output,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,passed:report.cases.filter(c=>c.passed).length,failed:report.cases.filter(c=>!c.passed),error:report.error||null,evidence:`qa-audit/final/evidence/${evidenceName}`}));
if(report.status!=='passed')process.exitCode=1;
