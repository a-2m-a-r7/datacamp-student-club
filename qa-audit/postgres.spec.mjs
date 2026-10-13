import { PGlite } from '@electric-sql/pglite';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const db = new PGlite();
const member='00000000-0000-4000-8000-000000000001',admin='00000000-0000-4000-8000-000000000002';
const course='00000000-0000-4000-8000-000000000003',lesson='00000000-0000-4000-8000-000000000004';
let passed=0;
async function check(name,fn){await fn();passed++;console.log('PASS '+name);}
try {
 await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
 CREATE SCHEMA auth; CREATE TABLE auth.users(id uuid PRIMARY KEY,email text,email_confirmed_at timestamptz,raw_user_meta_data jsonb DEFAULT '{}',raw_app_meta_data jsonb DEFAULT '{}');
 CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT NULLIF(current_setting('qa.uid',true),'')::uuid $$;
 CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql AS $$ SELECT current_user::text $$;
 GRANT USAGE ON SCHEMA public,auth TO anon,authenticated; GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA auth TO anon,authenticated;`);
 await db.exec(`CREATE SCHEMA storage; CREATE TABLE storage.buckets(id text PRIMARY KEY,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
 CREATE TABLE storage.objects(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),bucket_id text,name text); ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
 GRANT USAGE ON SCHEMA storage TO anon,authenticated; GRANT SELECT,INSERT,UPDATE,DELETE ON ALL TABLES IN SCHEMA storage TO anon,authenticated;`);
 for(const file of fs.readdirSync('supabase/migrations').filter(f=>f.startsWith('20261013')).sort()){
  await db.exec(fs.readFileSync('supabase/migrations/'+file,'utf8')); console.log('APPLIED '+file);
 }
 await db.exec('GRANT SELECT,INSERT,UPDATE,DELETE ON ALL TABLES IN SCHEMA public TO anon,authenticated;');
 await db.query(`INSERT INTO auth.users(id,email,email_confirmed_at) VALUES ($1,'QA_TEST_member@example.invalid',now()),($2,'QA_TEST_admin@example.invalid',now())`,[member,admin]);
 await db.query("UPDATE profiles SET role='admin' WHERE id=$1",[admin]);
 await db.query("INSERT INTO courses(id,title,slug,is_published) VALUES($1,'QA_TEST_COURSE','qa-test-course',true)",[course]);
 await db.query("INSERT INTO lessons(id,course_id,title,points_reward) VALUES($1,$2,'QA_TEST_LESSON',10)",[lesson,course]);
 await check('SQL schema applies without seeds',async()=>assert.equal((await db.query('SELECT count(*)::int AS n FROM events')).rows[0].n,0));
 await check('anonymous profiles are private',async()=>{await db.exec('SET ROLE anon;');assert.equal((await db.query('SELECT * FROM profiles')).rows.length,0);await db.exec('RESET ROLE;');});
 await db.query("SELECT set_config('qa.uid',$1,false)",[member]); await db.exec('SET ROLE authenticated;');
 await check('member reads only their own profile',async()=>{const rows=(await db.query('SELECT id FROM profiles')).rows;assert.deepEqual(rows.map(r=>r.id),[member]);});
 await check('member can persist own profile name',async()=>{await db.query("UPDATE profiles SET full_name='QA_TEST_UPDATED_MEMBER' WHERE id=$1",[member]);assert.equal((await db.query('SELECT full_name FROM profiles WHERE id=$1',[member])).rows[0].full_name,'QA_TEST_UPDATED_MEMBER');});
 await check('member cannot edit another profile',async()=>assert.equal((await db.query("UPDATE profiles SET full_name='QA_TEST_FORGED' WHERE id=$1 RETURNING id",[admin])).rows.length,0));
 await check('member cannot read staff directory',async()=>assert.equal((await db.query('SELECT * FROM staff')).rows.length,0));
 await check('member cannot assign own admin role',async()=>{await assert.rejects(db.query("UPDATE profiles SET role='admin' WHERE id=$1",[member]));});
 await check('member cannot mint admin XP',async()=>await assert.rejects(db.query("SELECT award_points($1,'ADMIN_BONUS','QA_TEST',100,NULL,NULL)",[member])));
 await check('enrollment creates persisted record and repeat does not reset it',async()=>{await db.query('SELECT enroll_course($1)',[course]);await db.query('SELECT enroll_course($1)',[course]);assert.equal((await db.query('SELECT count(*)::int AS n FROM enrollments')).rows[0].n,1);});
 await check('lesson completion is idempotent',async()=>{const a=(await db.query('SELECT complete_course_lesson($1,$2) AS r',[course,lesson])).rows[0].r;const b=(await db.query('SELECT complete_course_lesson($1,$2) AS r',[course,lesson])).rows[0].r;assert.equal(a.isCourseFinished,true);assert.equal(b.pointsAwarded,0);});
 await check('certificate issuance is idempotent',async()=>{const a=(await db.query('SELECT issue_course_certificate($1) AS r',[course])).rows[0].r;const b=(await db.query('SELECT issue_course_certificate($1) AS r',[course])).rows[0].r;assert.equal(a.id,b.id);});
 await db.exec('RESET ROLE;'); await db.query("SELECT set_config('qa.uid',$1,false)",[admin]); await db.exec('SET ROLE authenticated;');
 const question=crypto.randomUUID();
 const saved=(await db.query('SELECT save_form($1,$2) AS r',[JSON.stringify({title:'QA_TEST_FORM',slug:'qa-test-form',status:'published'}),JSON.stringify([{id:question,title:'QA_TEST_NAME',type:'short_text',required:true}])])).rows[0].r;
 await check('invalid required form response is rejected',async()=>await assert.rejects(db.query('SELECT submit_form_response($1,$2)',[saved.form.id,'[]'])));
 await check('valid form response is persisted',async()=>{const r=(await db.query('SELECT submit_form_response($1,$2) AS r',[saved.form.id,JSON.stringify([{question_id:question,value:'QA_TEST'}])])).rows[0].r;assert.equal(r.success,true);});
 await check('question edit preserves original saved answer',async()=>{await db.query('SELECT save_form_questions($1,$2)',[saved.form.id,JSON.stringify([{id:question,title:'QA_TEST_RENAMED',type:'short_text',required:true}])]);assert.equal((await db.query('SELECT count(*)::int AS n FROM form_answers')).rows[0].n,1);});
 await check('removing answered question rolls back',async()=>{await assert.rejects(db.query('SELECT save_form_questions($1,$2)',[saved.form.id,'[]']));assert.equal((await db.query('SELECT count(*)::int AS n FROM form_questions')).rows[0].n,1);});
 await check('repeat response allowed when setting is off',async()=>{await db.query('SELECT submit_form_response($1,$2)',[saved.form.id,JSON.stringify([{question_id:question,value:'QA_TEST_REPEAT'}])]);assert.equal((await db.query('SELECT count(*)::int AS n FROM form_responses')).rows[0].n,2);});
 await check('form and questions save together after initial creation',async()=>{
  const result=(await db.query('SELECT save_form($1,$2) AS r',[JSON.stringify({...saved.form,title:'QA_TEST_RENAMED_FORM'}),JSON.stringify([{id:question,title:'QA_TEST_RENAMED',type:'short_text',required:true}])])).rows[0].r;
  assert.equal(result.form.title,'QA_TEST_RENAMED_FORM');assert.equal(result.questions[0].id,question);
 });
 await check('one-response setting rejects a second recorded submission',async()=>{
  await db.query('UPDATE forms SET one_response_per_user=true WHERE id=$1',[saved.form.id]);
  await assert.rejects(db.query('SELECT submit_form_response($1,$2)',[saved.form.id,JSON.stringify([{question_id:question,value:'QA_TEST_BLOCKED'}])]));
 });
 await check('answers cannot reference questions outside the form',async()=>await assert.rejects(db.query('SELECT submit_form_response($1,$2)',[saved.form.id,JSON.stringify([{question_id:crypto.randomUUID(),value:'QA_TEST'}])])));
 await check('growth analytics use real rows',async()=>{const rows=(await db.query('SELECT admin_growth() AS r')).rows[0].r;assert.equal(rows.reduce((n,r)=>n+Number(r.users),0),2);});
 await check('public verification excludes private account fields',async()=>{
  const code=(await db.query('SELECT verification_code FROM certificates LIMIT 1')).rows[0].verification_code;
  const cert=(await db.query('SELECT verify_certificate($1) AS r',[code])).rows[0].r;assert.equal(cert.type,'course');assert.equal('user_id' in cert,false);assert.equal('email' in cert,false);
 });
 await check('badge eligibility is derived from persisted lessons',async()=>{const badges=(await db.query('SELECT refresh_badges() AS r')).rows[0].r;assert.equal(badges.length,0);});
 await db.exec('RESET ROLE;');
 const quizCourse=crypto.randomUUID(),quizLesson=crypto.randomUUID(),event=crypto.randomUUID();
 await db.query("INSERT INTO courses(id,title,slug,is_published) VALUES($1,'QA_TEST_QUIZ_COURSE','qa-test-quiz',true)",[quizCourse]);
 await db.query("INSERT INTO lessons(id,course_id,title,type,quiz_questions) VALUES($1,$2,'QA_TEST_QUIZ','quiz',$3)",[quizLesson,quizCourse,JSON.stringify([{id:'QA_TEST_Q1',question:'QA_TEST_QUESTION',options:['wrong','correct'],correctIndex:1}])]);
 await db.query("INSERT INTO events(id,title,date,status,capacity) VALUES($1,'QA_TEST_EVENT','2030-01-01','published',2)",[event]);
 await db.query("SELECT set_config('qa.uid',$1,false)",[member]);await db.exec('SET ROLE authenticated;');
 await check('member cannot directly forge a badge',async()=>await assert.rejects(db.query("INSERT INTO user_achievements(user_id,badge_id,badge_name) VALUES($1,'QA_TEST_FORGED','QA_TEST')",[member])));
 await db.query('SELECT enroll_course($1)',[quizCourse]);
 await check('quiz completion cannot bypass server grading',async()=>await assert.rejects(db.query('SELECT complete_course_lesson($1,$2)',[quizCourse,quizLesson])));
 await check('wrong quiz answers persist a failing result',async()=>{const result=(await db.query('SELECT submit_course_quiz($1,$2) AS r',[quizLesson,JSON.stringify({QA_TEST_Q1:0})])).rows[0].r;assert.equal(result.scorePercentage,0);assert.equal(result.passed,false);});
 await check('correct quiz answers persist completion and points',async()=>{const result=(await db.query('SELECT submit_course_quiz($1,$2) AS r',[quizLesson,JSON.stringify({QA_TEST_Q1:1})])).rows[0].r;assert.equal(result.scorePercentage,100);assert.equal(result.progress.isCourseFinished,true);});
 const ticket=(await db.query('SELECT register_for_event($1) AS r',[event])).rows[0].r;
 await check('member cannot see event registration list',async()=>assert.equal((await db.query('SELECT * FROM events')).rows.length,0));
 await check('public event projection omits registrations',async()=>{const rows=(await db.query('SELECT * FROM public_events')).rows;assert.equal(rows.length,1);assert.equal('registrations' in rows[0],false);});
 await db.exec('RESET ROLE;');await db.query("SELECT set_config('qa.uid',$1,false)",[admin]);await db.exec('SET ROLE authenticated;');
 await check('scanner rejects unknown ticket',async()=>await assert.rejects(db.query('SELECT check_in_event($1,$2)',[event,'QA_TEST_BAD'])));
 await check('scanner saves registered attendance',async()=>{const result=(await db.query('SELECT check_in_event($1,$2) AS r',[event,ticket.qrCode])).rows[0].r;assert.ok(result.checkedInAt);});
 await check('scanner rejects duplicate attendance',async()=>await assert.rejects(db.query('SELECT check_in_event($1,$2)',[event,ticket.qrCode])));
 await check('administrator cannot revoke current own access',async()=>await assert.rejects(db.query("SELECT assign_member_role($1,'user')",[admin])));
 const announcement=crypto.randomUUID();
 await db.query("INSERT INTO notifications(id,user_id,title,message) VALUES($1,NULL,'QA_TEST_ANNOUNCEMENT','QA_TEST')",[announcement]);
 await db.exec('RESET ROLE;');await db.query("SELECT set_config('qa.uid',$1,false)",[member]);await db.exec('SET ROLE authenticated;');
 await check('announcement read state is saved per member',async()=>{await db.query('SELECT read_notifications($1)',[announcement]);const notifications=(await db.query('SELECT get_notifications() AS r')).rows[0].r;assert.equal(notifications.find(n=>n.id===announcement).read,true);});
 await db.exec('RESET ROLE;');await db.query("SELECT set_config('qa.uid',$1,false)",[admin]);await db.exec('SET ROLE authenticated;');
 await check('another member retains independent unread state',async()=>{const notifications=(await db.query('SELECT get_notifications() AS r')).rows[0].r;assert.equal(notifications.find(n=>n.id===announcement).read,false);});
 await check('administrator can query member directory',async()=>assert.ok(Array.isArray((await db.query('SELECT public_leaderboard() AS r')).rows[0].r)));
 await db.exec('RESET ROLE;');await db.query("SELECT set_config('qa.uid',$1,false)",[member]);await db.exec('SET ROLE authenticated;');
 await check('member cannot query directory RPC directly',async()=>await assert.rejects(db.query('SELECT public_leaderboard()')));
 await db.exec('RESET ROLE; SET ROLE anon;');
 await check('visitor cannot query directory RPC directly',async()=>await assert.rejects(db.query('SELECT public_leaderboard()')));
 fs.writeFileSync('qa-audit/postgres-results.json',JSON.stringify({passed,failed:0,environment:'isolated in-memory PostgreSQL'},null,2));
} catch(error){console.error(error.message);process.exitCode=1;fs.writeFileSync('qa-audit/postgres-results.json',JSON.stringify({passed,failed:1,error:error.message},null,2));}
finally {await db.close();}
