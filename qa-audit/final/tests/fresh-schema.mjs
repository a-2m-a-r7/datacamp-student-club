import {PGlite} from '@electric-sql/pglite';
import {citext} from '@electric-sql/pglite/contrib/citext';
import {pgcrypto} from '@electric-sql/pglite/contrib/pgcrypto';
import {uuid_ossp} from '@electric-sql/pglite/contrib/uuid_ossp';
import fs from 'node:fs';
import {randomUUID} from 'node:crypto';
const db=new PGlite({extensions:{citext,pgcrypto,'uuid-ossp':uuid_ossp}});
const report={at:new Date().toISOString(),scope:'Fresh schema-only migration chain from 20261013 onward, no legacy sample migrations or provider default grants; in-memory only',migrations:[],cases:[],status:'running'};
const check=(id,passed,observed)=>report.cases.push({id,passed,observed});
try{
 const source=fs.readFileSync('qa-audit/final/tests/full-schema-security.mjs','utf8');const bootstrap=source.match(/^const bootstrap = `([\s\S]*?)`;/m)?.[1];if(!bootstrap||bootstrap.includes('${'))throw Error('Platform bootstrap missing');await db.exec(bootstrap);
 for(const file of fs.readdirSync('supabase/migrations').filter(f=>/^\d{14}_.+\.sql$/.test(f)&&f>='20261013000000').sort()){await db.exec(fs.readFileSync('supabase/migrations/'+file,'utf8'));report.migrations.push(file);}
 const tables=(await db.query("SELECT c.relname AS name,c.relrowsecurity AS rls FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind='r' ORDER BY c.relname")).rows;
 check('FRESH-34-TABLES-ALL-RLS',tables.length===34&&tables.every(t=>t.rls),{count:tables.length,withoutRls:tables.filter(t=>!t.rls).map(t=>t.name)});
 const published=(await db.query("SELECT tablename FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' ORDER BY tablename")).rows.map(r=>r.tablename);
 check('FRESH-REALTIME-SUBSCRIPTION-TABLES',published.length===16&&['profiles','notifications','notification_reads','form_responses','points_log','user_achievements'].every(t=>published.includes(t)),{published});
 const a=randomUUID(),b=randomUUID();
 for(const [id,label]of [[a,'A'],[b,'B']]){await db.query('INSERT INTO auth.users(id,email,email_confirmed_at,raw_user_meta_data) VALUES($1,$2,now(),$3::jsonb)',[id,`QA_TEST_FRESH_${label}@example.invalid`,JSON.stringify({full_name:'QA_TEST_FRESH_'+label})]);
 await db.query('INSERT INTO users(id,email,full_name) VALUES($1,$2,$3) ON CONFLICT(id) DO NOTHING',[id,`QA_TEST_FRESH_${label}@example.invalid`,'QA_TEST_FRESH_'+label]);}
 await db.query("SELECT set_config('request.jwt.claim.sub',$1,false),set_config('request.jwt.claim.role','authenticated',false)",[a]);await db.exec('SET ROLE authenticated');
 const own=(await db.query('SELECT id FROM users WHERE id=$1',[a])).rows;check('FRESH-OWN-MIRROR-VISIBLE',own.length===1,{rows:own.length});
 const foreign=(await db.query('SELECT id FROM users WHERE id=$1',[b])).rows;check('FRESH-FOREIGN-MIRROR-PRIVATE',foreign.length===0,{rows:foreign.length});
 const mutated=(await db.query("UPDATE users SET full_name='QA_TEST_FORGED' WHERE id=$1 RETURNING id",[b])).rows;check('FRESH-FOREIGN-MIRROR-UPDATE-DENIED',mutated.length===0,{rows:mutated.length});
 await db.exec('RESET ROLE');report.status=report.cases.every(c=>c.passed)?'passed':'failed';
}catch(e){report.status='harness-error';report.error={code:e.code,message:String(e.message).slice(0,300)};}finally{await db.close();}
const output='qa-audit/final/evidence/runs/'+process.env.QA_FINAL_RUN+'/fresh-schema.json';fs.mkdirSync(output.slice(0,output.lastIndexOf('/')),{recursive:true});fs.writeFileSync(output,JSON.stringify(report,null,2));console.log(JSON.stringify({status:report.status,cases:report.cases,error:report.error,evidence:output}));if(report.status!=='passed')process.exitCode=1;
