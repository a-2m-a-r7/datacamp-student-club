// Real multi-connection PostgreSQL on loopback only. No production credentials.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
const runtime = process.argv[2] || process.env.QA_POSTGRES_RUNTIME || path.resolve('qa-audit/.runtime');
const {default: EmbeddedPostgres} = await import(pathToFileURL(path.join(runtime,'node_modules/embedded-postgres/dist/index.js')).href);
const {default: pg} = await import(pathToFileURL(path.join(runtime,'node_modules/pg/lib/index.js')).href);
const root = path.resolve(runtime,'QA_TEST_final_databases');
fs.mkdirSync(root,{recursive:true});
const databaseDir = path.resolve(root, 'qa_run_' + crypto.randomUUID());
if (!databaseDir.startsWith(root + path.sep)) throw Error('QA database path escapes its directory');
const password = crypto.randomUUID(), port = 35432;
const server = new EmbeddedPostgres({ databaseDir, user: 'qa_owner', password, port, persistent: true, initdbFlags: ['--encoding=UTF8'], postgresFlags: ['-h', '127.0.0.1', '-c', 'max_connections=80'], onLog: () => {}, onError: () => {} });
let pool, owner, passed = 0;
fs.mkdirSync('qa-audit/final/evidence/runs/'+process.env.QA_FINAL_RUN,{recursive:true});
const metrics = {}, tests = [];
async function check(name, run) { await run(); passed++; tests.push(name); console.log('PASS ' + name); }
async function asUser(uid, sql, args = []) {
  const client = await pool.connect();
  try { await client.query('BEGIN'); await client.query('SET LOCAL ROLE authenticated'); await client.query("SELECT set_config('qa.uid',$1,true)", [uid]); const result = await client.query(sql, args); await client.query('COMMIT'); return result; }
  catch (error) { await client.query('ROLLBACK'); throw error; } finally { client.release(); }
}
async function benchmark(name, count, work) {
  const start = performance.now(), times = [];
  await Promise.all(Array.from({ length: count }, (_, index) => (async () => { const begin = performance.now(); await work(index); times.push(performance.now() - begin); })()));
  times.sort((a,b) => a-b); metrics[name] = { requests: count, concurrentPool: 20, elapsedMs: Math.round(performance.now() - start), p50Ms: Math.round(times[Math.floor(count * .5)]), p95Ms: Math.round(times[Math.min(count-1, Math.floor(count * .95))]), errors: 0 };
}
const admin = crypto.randomUUID(), members = Array.from({ length: 1000 }, () => crypto.randomUUID());
const course = crypto.randomUUID(), lesson = crypto.randomUUID(), finalQuiz = crypto.randomUUID();
try {
  await server.initialise(); await server.start();
  pool = new pg.Pool({ host: '127.0.0.1', port, user: 'qa_owner', password, database: 'postgres', max: 20, connectionTimeoutMillis: 10000, statement_timeout: 10000 });
  owner = await pool.connect();
  await owner.query(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
   CREATE SCHEMA auth; CREATE TABLE auth.users(id uuid PRIMARY KEY,email text,email_confirmed_at timestamptz,raw_user_meta_data jsonb DEFAULT '{}',raw_app_meta_data jsonb DEFAULT '{}');
   CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT NULLIF(current_setting('qa.uid',true),'')::uuid $$;
   CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql AS $$ SELECT current_user::text $$;
   GRANT USAGE ON SCHEMA public,auth TO anon,authenticated; GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA auth TO anon,authenticated;
   CREATE SCHEMA storage; CREATE TABLE storage.buckets(id text PRIMARY KEY,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
   CREATE TABLE storage.objects(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),bucket_id text,name text); ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
   GRANT USAGE ON SCHEMA storage TO anon,authenticated; GRANT SELECT,INSERT,UPDATE,DELETE ON ALL TABLES IN SCHEMA storage TO anon,authenticated;`);
  for (const file of fs.readdirSync('supabase/migrations').filter(file => /^\d{14}_.+\.sql$/.test(file)&&file>='20261013000000').sort()) await owner.query(fs.readFileSync('supabase/migrations/' + file, 'utf8'));
  // Application privileges come from the actual migrations.
  await owner.query("INSERT INTO auth.users(id,email,email_confirmed_at,raw_user_meta_data) SELECT id, 'QA_TEST_'||id::text||'@example.invalid',now(),'{\"full_name\":\"QA_TEST_GROWTH_MEMBER\"}' FROM jsonb_to_recordset($1::jsonb) AS t(id uuid)", [JSON.stringify([admin,...members].map(id => ({id})))]);
  await owner.query("UPDATE profiles SET role='admin' WHERE id=$1", [admin]);
  await owner.query("INSERT INTO courses(id,title,slug,is_published,points_reward) VALUES($1,'QA_TEST_دورة مستقبلية','qa-test-future',true,0)", [course]);
  await owner.query("INSERT INTO lessons(id,course_id,title,points_reward) VALUES($1,$2,'QA_TEST_ARTICLE',0)", [lesson,course]);
  await owner.query("INSERT INTO lessons(id,course_id,title,type,quiz_questions,points_reward) VALUES($1,$2,'QA_TEST_FINAL','quiz',$3,10)", [finalQuiz,course,JSON.stringify([{id:'QA_TEST_Q',question:'QA_TEST_QUESTION',options:['wrong','correct'],correctIndex:1}])]);
  await owner.query("INSERT INTO courses(title,slug,is_published,created_at) SELECT 'QA_TEST_CATALOG_'||n,'qa-test-catalog-'||n,true,'2026-10-14T00:00:00Z'::timestamptz FROM generate_series(1,1200) n");
  const draft = (await owner.query("INSERT INTO courses(title,slug) VALUES('QA_TEST_PRIVATE_DRAFT','qa-test-private-draft') RETURNING id")).rows[0].id;
  await owner.query('ANALYZE courses; ANALYZE lessons;');
  await check('legacy Arabic repair is reversible and preserves valid/mixed text and ratings with actual reviews', async () => {
    await owner.query(fs.readFileSync('qa-audit/course-text-repair.sql','utf8'));
    const correct='QA_TEST من أساسيات بايثون إلى البيانات', latin=Buffer.from(correct,'utf8').toString('latin1');
    const cp1252=latin.replaceAll(String.fromCharCode(133),'…').replaceAll(String.fromCharCode(134),'†').replaceAll(String.fromCharCode(138),'Š').replaceAll(String.fromCharCode(156),'œ');
    for(const value of [latin,cp1252])assert.equal((await owner.query('SELECT dc_repair_arabic_encoding($1) value',[value])).rows[0].value,correct);
    for(const value of ['QA_TEST عربي صحيح','QA_TEST Øresund','QA_TEST العربية Ø§'])assert.equal((await owner.query('SELECT dc_repair_arabic_encoding($1) value',[value])).rows[0].value,value);
    await owner.query("UPDATE courses SET description=$1,rating=5,rating_count=0 WHERE id=$2",[cp1252,course]);
    await owner.query("UPDATE courses SET rating=4.5,rating_count=2 WHERE id=$1",[draft]);
    await owner.query('UPDATE lessons SET title=$1,content=$1 WHERE id=$2',[cp1252,lesson]);
    await owner.query(fs.readFileSync('qa-audit/course-text-repair.sql','utf8'));
    const row=(await owner.query('SELECT description,rating FROM courses WHERE id=$1',[course])).rows[0];assert.equal(row.description,correct);assert.equal(Number(row.rating),0);assert.equal(Number((await owner.query('SELECT rating FROM courses WHERE id=$1',[draft])).rows[0].rating),4.5);
    const fixedLesson=(await owner.query('SELECT title,content FROM lessons WHERE id=$1',[lesson])).rows[0];assert.equal(fixedLesson.title,correct);assert.equal(fixedLesson.content,correct);
  });
  await check('new courses have genuine lesson counts and cannot publish an empty curriculum', async () => {
    assert.equal((await owner.query('SELECT total_lessons FROM courses WHERE id=$1',[course])).rows[0].total_lessons,2);
    await assert.rejects(asUser(admin,'UPDATE courses SET is_published=true WHERE id=$1',[draft]),/Add course lessons/);
    await assert.rejects(asUser(members[0],'SELECT enroll_course($1)',[draft]),/Course unavailable/);
  });
  await check('member catalog uses keyset pages beyond 1000 rows without duplicates, including equal timestamps', async () => {
    let after=null, afterId=null; const ids=new Set();
    do { const result=(await asUser(members[0],'SELECT list_course_catalog(100,$1,$2) AS value',[after,afterId])).rows[0].value;
      assert.ok(result.items.length<=100); for(const item of result.items) {assert.ok(!ids.has(item.id));ids.add(item.id);}
      after=result.nextCursor?.createdAt||null; afterId=result.nextCursor?.id||null;
    } while(after);
    assert.equal(ids.size,1201); assert.ok(!ids.has(draft));
  });
  await check('Arabic search is generic; large limits are clamped and draft flags cannot bypass RLS', async () => {
    const result=(await asUser(members[0],"SELECT list_course_catalog(100000,NULL,NULL,'مستقبلية') AS value")).rows[0].value;
    assert.equal(result.items.length,1); assert.equal(result.items[0].id,course);
    const clamp=(await asUser(members[0],"SELECT list_course_catalog(100000,NULL,NULL,'',NULL,NULL,true) AS value")).rows[0].value;
    assert.equal(clamp.items.length,100); assert.ok(!clamp.items.some(item=>item.id===draft));
    const adminPage=(await asUser(admin,"SELECT list_course_catalog(24,NULL,NULL,'PRIVATE_DRAFT',NULL,NULL,true) AS value")).rows[0].value;assert.equal(adminPage.items[0].id,draft);
  });
  await check('indexed catalog handles 1000 requests through 20 simultaneous real connections', async () => {
    await benchmark('catalog',1000,index=>asUser(members[index%members.length],'SELECT list_course_catalog()'));
    const plan=(await owner.query('EXPLAIN (FORMAT JSON) SELECT * FROM courses WHERE is_published ORDER BY created_at DESC,id DESC LIMIT 25')).rows[0]['QUERY PLAN'];
    assert.match(JSON.stringify(plan),/dc_(published_catalog|course_catalog)/);
  });
  await check('concurrent enrollment retries create one enrollment/reward per member and accurate totals', async () => {
    await benchmark('enrollment',3000,index=>asUser(members[index%members.length],'SELECT enroll_course($1)',[course]));
    assert.equal((await owner.query('SELECT count(*)::int n FROM enrollments WHERE course_id=$1',[course])).rows[0].n,members.length);
    assert.equal((await owner.query('SELECT enrolled_count FROM courses WHERE id=$1',[course])).rows[0].enrolled_count,members.length);
    assert.equal((await owner.query("SELECT count(*)::int n FROM points_log WHERE action='COURSE_ENROLL' AND reference_id=$1",[course])).rows[0].n,members.length);
  });
  await check('concurrent lesson/quiz retries issue exactly one linked certificate and only persisted rewards', async () => {
    await benchmark('lessonCompletion',3000,index=>asUser(members[index%members.length],'SELECT complete_course_lesson($1,$2)',[course,lesson]));
    assert.equal((await owner.query('SELECT count(*)::int n FROM certificates WHERE course_id=$1',[course])).rows[0].n,0);
    await benchmark('quizCompletion',3000,index=>asUser(members[index%members.length],'SELECT submit_course_quiz($1,$2)',[finalQuiz,JSON.stringify({QA_TEST_Q:1})]));
    assert.equal((await owner.query('SELECT count(*)::int n FROM certificates WHERE course_id=$1',[course])).rows[0].n,members.length);
    assert.equal((await owner.query('SELECT count(*)::int n FROM enrollments WHERE course_id=$1 AND certificate_id IS NOT NULL AND is_completed',[course])).rows[0].n,members.length);
    assert.equal((await owner.query('SELECT count(*)::int n FROM profiles WHERE id=ANY($1::uuid[]) AND total_points=15',[members])).rows[0].n,members.length);
  });
  await check('a later curriculum edit preserves historical certificates and requires new learners to finish new lessons', async () => {
    const extra=crypto.randomUUID();await asUser(admin,"INSERT INTO lessons(id,course_id,title) VALUES($1,$2,'QA_TEST_NEW_CONTENT')",[extra,course]);
    await asUser(admin,"UPDATE courses SET title='QA_TEST_RENAMED' WHERE id=$1",[course]);
    const cert=(await owner.query('SELECT id,course_title FROM certificates WHERE user_id=$1 AND course_id=$2',[members[0],course])).rows[0];assert.equal(cert.course_title,'QA_TEST_دورة مستقبلية');
    const retry=(await asUser(members[0],'SELECT complete_course_lesson($1,$2) AS value',[course,lesson])).rows[0].value;assert.equal(retry.enrollment.certificate_id,cert.id);assert.equal(retry.enrollment.progress_percent,100);
    const newMember=crypto.randomUUID();await owner.query("INSERT INTO auth.users(id,email,email_confirmed_at,raw_user_meta_data) VALUES($1,'QA_TEST_NEW@example.invalid',now(),'{\"full_name\":\"QA_TEST_NEW\"}')",[newMember]);
    await asUser(newMember,'SELECT enroll_course($1)',[course]);await asUser(newMember,'SELECT complete_course_lesson($1,$2)',[course,lesson]);await asUser(newMember,'SELECT submit_course_quiz($1,$2)',[finalQuiz,JSON.stringify({QA_TEST_Q:1})]);
    assert.equal((await owner.query('SELECT count(*)::int n FROM certificates WHERE user_id=$1',[newMember])).rows[0].n,0);
    const done=(await asUser(newMember,'SELECT complete_course_lesson($1,$2) AS value',[course,extra])).rows[0].value;assert.ok(done.enrollment.certificate_id);
  });
  await check('course request throttling is shared across connections, returns 429, and recovers next window', async () => {
    const uid=members[59];await owner.query('DELETE FROM course_request_windows WHERE user_id=$1',[uid]);
    const result=await Promise.allSettled(Array.from({length:150},()=>asUser(uid,'SELECT enroll_course($1)',[course])));
    assert.equal(result.filter(item=>item.status==='fulfilled').length,120);
    const rejected=result.filter(item=>item.status==='rejected');assert.equal(rejected.length,30);assert.ok(rejected.every(item=>item.reason.code==='PT429'));
    await assert.rejects(asUser(uid,'SELECT * FROM course_request_windows'),/permission denied/);
    await assert.rejects(asUser(uid,'SELECT lock_course_activity($1)',[course]),/permission denied/);
    await owner.query("UPDATE course_request_windows SET window_started=now()-interval '2 minutes' WHERE user_id=$1",[uid]);await asUser(uid,'SELECT enroll_course($1)',[course]);
    assert.equal((await owner.query('SELECT requests FROM course_request_windows WHERE user_id=$1',[uid])).rows[0].requests,1);
  });
  await check('curriculum edits wait for a real completion transaction, with no mixed curriculum certificate', async () => {
    const learner=await pool.connect(), editor=await pool.connect(), cid=crypto.randomUUID(), lid=crypto.randomUUID();
    try {await owner.query("INSERT INTO courses(id,title,slug,is_published) VALUES($1,'QA_TEST_LOCK','qa-test-lock',true)",[cid]);await owner.query("INSERT INTO lessons(id,course_id,title) VALUES($1,$2,'QA_TEST_LOCK_LESSON')",[lid,cid]);await asUser(members[1],'SELECT enroll_course($1)',[cid]);
      await learner.query('BEGIN');await learner.query('SET LOCAL ROLE authenticated');await learner.query("SELECT set_config('qa.uid',$1,true)",[members[1]]);await learner.query('SELECT complete_course_lesson($1,$2)',[cid,lid]);
      await editor.query('BEGIN');await editor.query('SET LOCAL ROLE authenticated');await editor.query("SELECT set_config('qa.uid',$1,true)",[admin]);
      const editing=editor.query("INSERT INTO lessons(course_id,title) VALUES($1,'QA_TEST_LOCK_ADDITION')",[cid]);
      let blocked=false;for(let i=0;i<80;i++){if((await owner.query("SELECT EXISTS(SELECT 1 FROM pg_locks WHERE locktype='advisory' AND NOT granted) AS blocked")).rows[0].blocked){blocked=true;break;}await new Promise(resolve=>setTimeout(resolve,25));}
      assert.ok(blocked);await learner.query('COMMIT');await editing;await editor.query('COMMIT');
      assert.equal((await owner.query('SELECT count(*)::int n FROM certificates WHERE course_id=$1',[cid])).rows[0].n,1);assert.equal((await owner.query('SELECT total_lessons FROM courses WHERE id=$1',[cid])).rows[0].total_lessons,2);
    } finally {await learner.query('ROLLBACK');await editor.query('ROLLBACK');learner.release();editor.release();}
  });
  await check('removing or renaming a course preserves earned public credentials', async () => {
    const cid=crypto.randomUUID(), lid=crypto.randomUUID();await owner.query("INSERT INTO courses(id,title,slug,is_published) VALUES($1,'QA_TEST_ARCHIVED','qa-test-archived',true)",[cid]);await owner.query("INSERT INTO lessons(id,course_id,title) VALUES($1,$2,'QA_TEST_ARCHIVED_LESSON')",[lid,cid]);await asUser(members[2],'SELECT enroll_course($1)',[cid]);await asUser(members[2],'SELECT complete_course_lesson($1,$2)',[cid,lid]);
    const cert=(await owner.query('SELECT verification_code FROM certificates WHERE course_id=$1',[cid])).rows[0];await asUser(admin,'DELETE FROM courses WHERE id=$1',[cid]);
    const verified=(await asUser(members[2],'SELECT verify_certificate($1) AS value',[cert.verification_code])).rows[0].value;assert.equal(verified.course_title,'QA_TEST_ARCHIVED');
  });
  fs.writeFileSync('qa-audit/final/evidence/runs/'+process.env.QA_FINAL_RUN+'/course-growth-postgres-results.json',JSON.stringify({passed,failed:0,environment:'isolated real PostgreSQL 18, loopback, 20 simultaneous connections; NOT a production capacity benchmark',catalogCourses:1200,members:members.length,tests,metrics},null,2));
  console.log(JSON.stringify({passed,metrics}));
} catch(error) { console.error(error); process.exitCode=1; }
finally {owner?.release();await pool?.end();await server.stop();}
process.exit(process.exitCode || 0);
