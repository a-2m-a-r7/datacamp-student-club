import fs from 'node:fs';import assert from 'node:assert/strict';import {randomUUID} from 'node:crypto';import {PGlite} from '@electric-sql/pglite';
const db=new PGlite(),cases=[];const form=randomUUID(),a=randomUUID(),b=randomUUID();
const check=(name,actual,expected)=>{assert.deepEqual(actual,expected,name);cases.push({name,passed:true});};
try{
 await db.exec('CREATE ROLE anon;CREATE ROLE authenticated;CREATE ROLE service_role BYPASSRLS;GRANT USAGE ON SCHEMA public TO anon,authenticated,service_role;CREATE TABLE forms(id uuid PRIMARY KEY)');
 await db.exec(fs.readFileSync('supabase/migrations/20261017065319_serialize_form_sheet_sync.sql','utf8'));await db.query('INSERT INTO forms VALUES($1)',[form]);
 for(const role of ['anon','authenticated']){await db.exec('SET ROLE '+role);for(const sql of ['SELECT * FROM form_sheet_sync_jobs',`SELECT queue_form_sheet_sync('${form}','${a}')`,`SELECT finish_form_sheet_sync('${form}','${a}',1)`]){await assert.rejects(db.exec(sql),e=>e.code==='42501');cases.push({name:role+' denied '+sql.split(' ')[1],passed:true});}await db.exec('RESET ROLE');}
 await db.exec('SET ROLE service_role');
 const queue=async token=>(await db.query('SELECT queue_form_sheet_sync($1,$2) value',[form,token])).rows[0].value;
 const finish=async(token,revision,error=null)=>(await db.query('SELECT finish_form_sheet_sync($1,$2,$3,$4) value',[form,token,revision,error])).rows[0].value;
 check('first owner acquires revision 1',await queue(a),{acquired:true,revision:1});
 const queued=await Promise.all(Array.from({length:20},()=>queue(b)));check('20 contenders queue without acquiring',queued.every(x=>!x.acquired),true);
 check('wrong owner cannot acknowledge',(await finish(b,21)).owned,false);
 check('older snapshot retains lease for queued work',await finish(a,1),{owned:true,pending:true,revision:21});
 check('current snapshot releases lease',await finish(a,21),{owned:true,pending:false,revision:21});
 check('next owner acquires',await queue(b),{acquired:true,revision:22});
 check('failure leaves revision pending',await finish(b,22,'QA_TEST_provider_failure'),{owned:true,pending:true,revision:22});
 check('retry acquires without losing queued revision',await queue(a),{acquired:true,revision:23});
 await db.query("UPDATE form_sheet_sync_jobs SET lease_until=now()-interval '1 second' WHERE form_id=$1",[form]);
 check('expired owner replaced',await queue(b),{acquired:true,revision:24});check('expired owner cannot acknowledge',(await finish(a,23)).owned,false);
 check('retry catches up',await finish(b,24),{owned:true,pending:false,revision:24});
 const state=(await db.query('SELECT requested_revision,synced_revision,owner_token,last_error FROM form_sheet_sync_jobs')).rows[0];check('durable state clean',{...state,requested_revision:Number(state.requested_revision),synced_revision:Number(state.synced_revision)},{requested_revision:24,synced_revision:24,owner_token:null,last_error:null});
 await db.exec('RESET ROLE');await db.query('DELETE FROM forms WHERE id=$1',[form]);check('fixture cascade removes job',(await db.query('SELECT count(*)::int n FROM form_sheet_sync_jobs')).rows[0].n,0);
}finally{await db.close();const output='qa-audit/final/evidence/BUG-024-coordination-local.json';fs.writeFileSync(output,JSON.stringify({target:'isolated in-memory PostgreSQL; no provider defaults',cases,limitations:'20 interleaved callers use one local PGlite connection; real cross-instance HTTP tested separately.'},null,2));}
console.log(JSON.stringify({passed:cases.length,cases}));
