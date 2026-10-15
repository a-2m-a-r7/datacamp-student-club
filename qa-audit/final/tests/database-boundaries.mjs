/** Local, in-memory only. Root is the sole executor. No .env/network/production clients.
 * node qa-audit/final/tests/database-boundaries.mjs
 */
import { PGlite } from '@electric-sql/pglite';
import { citext } from '@electric-sql/pglite/contrib/citext';
import { pgcrypto } from '@electric-sql/pglite/contrib/pgcrypto';
import { uuid_ossp } from '@electric-sql/pglite/contrib/uuid_ossp';
import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createHash } from 'node:crypto';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const dir = path.join(root, 'supabase/migrations');
const output = path.join(root, 'qa-audit/final/evidence/database-boundaries.json');
const options = { extensions: { citext, pgcrypto, 'uuid-ossp': uuid_ossp } };
const errorSummary = e => ({ sqlstate: /^[A-Z0-9]{5}$/.test(String(e?.code)) ? String(e.code) : null,
  message: String(e?.message || 'Unknown error').replace(/[\r\n\t]+/g, ' ').slice(0, 300) });
const harnessSource = await readFile(path.join(root, 'qa-audit/final/tests/full-schema-security.mjs'), 'utf8');
const platform = harnessSource.match(/^const bootstrap = `([\s\S]*?)`;/m)?.[1];
if (!platform || platform.includes('${')) throw new Error('Expected literal platform bootstrap unavailable; no schema or tests executed.');
const names = (await readdir(dir)).filter(n => /^\d{14}_[\w-]+\.sql$/.test(n)).sort();
const migrations = await Promise.all(names.map(async name => ({ name, sql: await readFile(path.join(dir, name), 'utf8') })));
const functionNames = [...new Set(migrations.flatMap(m => [...m.sql.matchAll(/CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+(?:public\.)?(\w+)\s*\(/gi)].map(x => x[1])))];
const id = n => `30000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const actors = {
  memberA: { uid: id(1), role: 'user', status: 'active', confirmed: true },
  memberB: { uid: id(2), role: 'user', status: 'active', confirmed: true },
  admin: { uid: id(3), role: 'admin', status: 'active', confirmed: true },
  inactive: { uid: id(4), role: 'user', status: 'inactive', confirmed: true },
  pending: { uid: id(5), role: 'user', status: 'pending', confirmed: true },
  unconfirmed: { uid: id(6), role: 'user', status: 'active', confirmed: false },
  inactiveAdmin: { uid: id(7), role: 'admin', status: 'inactive', confirmed: true },
  unconfirmedAdmin: { uid: id(8), role: 'admin', status: 'active', confirmed: false },
};
const report = {
  checkedAt: new Date().toISOString(), environment: 'Two independent in-memory PostgreSQL databases; no external services',
  bootstrapSource: 'qa-audit/final/tests/full-schema-security.mjs literal bootstrap, not imported/executed as a module',
  bootstrapSha256: createHash('sha256').update(platform).digest('hex'),
  limitations: [
    'Source-grants context measures privileges provided by migrations plus minimal platform bootstrap, without public table grants.',
    'Provider-default simulation is a separate database with ALTER DEFAULT PRIVILEGES public table DML BEFORE migrations. It models common exposed-schema grants, not a verified production configuration.',
    'Application REVOKE statements remain effective because the simulation grants defaults before table creation, never re-grants tables after migrations.',
    'Only PostgreSQL RLS/functions/triggers/ACLs are exercised; no GoTrue/PostgREST/Storage HTTP/Realtime transport or session validation.',
    'Unconfirmed/inactive read-policy differences are recorded as product decisions; they are not silently assigned a failing security oracle.',
  ], contexts: [],
};

async function runContext(providerDefaults) {
  const db = new PGlite(options);
  const context = { name: providerDefaults ? 'simulated-provider-public-table-defaults' : 'migration-source-grants',
    providerDefaults, migrations: [], catalog: {}, cases: [], status: 'running' };
  report.contexts.push(context);
  const observe = (caseId, expected, observed, passed = null) => context.cases.push({ id: caseId, expected, observed,
    status: passed === null ? 'observation' : passed ? 'passed' : 'failed', passed });
  const as = async (name, sql, params = []) => {
    const actor = actors[name];
    const role = name === 'anon' ? 'anon' : 'authenticated';
    await db.query("SELECT set_config('request.jwt.claim.sub',$1,false),set_config('request.jwt.claim.role',$2,false)", [actor?.uid || '', role]);
    await db.exec(role === 'anon' ? 'SET ROLE anon' : 'SET ROLE authenticated');
    try { return { ok: true, rows: (await db.query(sql, params)).rows }; }
    catch (e) { return { ok: false, error: errorSummary(e) }; }
    finally {
      await db.exec('RESET ROLE');
      await db.query("SELECT set_config('request.jwt.claim.sub','',false),set_config('request.jwt.claim.role','',false)");
    }
  };
  const summarize = result => result.ok ? { accepted: true, rowCount: result.rows.length }
    : { accepted: false, ...result.error };
  const snapshot = async uid => (await db.query(`SELECT p.role,p.status,p.total_points,p.xp,p.is_verified,
    u.role AS mirror_role,u.total_points AS mirror_points,u.xp AS mirror_xp
    FROM profiles p LEFT JOIN public.users u ON u.id=p.id WHERE p.id=$1`, [uid])).rows[0];
  const unchanged = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  try {
    await db.exec(platform);
    if (providerDefaults) {
      context.providerBootstrap = {
        statement: 'ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT,INSERT,UPDATE,DELETE ON TABLES TO anon,authenticated',
        timing: 'before any application migrations',
        rationale: 'Separates migration-only privileges from a Supabase-style exposed public schema with default table DML; deployment defaults are not assumed verified.',
      };
      await db.exec('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT,INSERT,UPDATE,DELETE ON TABLES TO anon,authenticated');
    }
    for (const migration of migrations) {
      try {
        await db.exec(migration.sql);
        context.migrations.push({ name: migration.name, status: 'passed', sha256: createHash('sha256').update(migration.sql).digest('hex') });
      } catch (e) {
        context.migrations.push({ name: migration.name, status: 'failed', ...errorSummary(e) });
        throw new Error('Migration replay failed; see sanitized migration entry.');
      }
    }
    context.catalog.tables = (await db.query(`SELECT c.relname AS name,c.relrowsecurity AS rls,c.relforcerowsecurity AS force_rls,
      has_table_privilege('anon',c.oid,'SELECT') AS anon_select,
      has_table_privilege('anon',c.oid,'INSERT') AS anon_insert,
      has_table_privilege('authenticated',c.oid,'SELECT') AS member_select,
      has_table_privilege('authenticated',c.oid,'INSERT') AS member_insert,
      has_table_privilege('authenticated',c.oid,'UPDATE') AS member_update,
      has_table_privilege('authenticated',c.oid,'DELETE') AS member_delete
      FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
      WHERE n.nspname='public' AND c.relkind='r' ORDER BY c.relname`)).rows;
    context.catalog.functions = (await db.query(`SELECT p.proname AS name,p.oid::regprocedure::text AS signature,
      p.prosecdef AS security_definer,p.prorettype::regtype::text AS return_type,
      has_function_privilege('anon',p.oid,'EXECUTE') AS anon_execute,
      has_function_privilege('authenticated',p.oid,'EXECUTE') AS member_execute,
      has_function_privilege('service_role',p.oid,'EXECUTE') AS service_execute
      FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
      WHERE n.nspname='public' AND p.proname=ANY($1::text[]) ORDER BY p.proname,p.oid`, [functionNames])).rows;
    context.catalog.triggers = (await db.query(`SELECT t.tgname AS name,n.nspname AS schema,c.relname AS table_name,
      p.proname AS function_name,t.tgenabled AS enabled FROM pg_trigger t
      JOIN pg_class c ON c.oid=t.tgrelid JOIN pg_namespace n ON n.oid=c.relnamespace
      JOIN pg_proc p ON p.oid=t.tgfoid WHERE NOT t.tgisinternal AND n.nspname IN ('public','auth')
      ORDER BY n.nspname,c.relname,t.tgname`)).rows;
    context.catalog.policies = (await db.query(`SELECT schemaname,tablename,policyname,permissive,roles,cmd
      FROM pg_policies WHERE schemaname IN ('public','storage') ORDER BY schemaname,tablename,policyname`)).rows;
    context.catalog.realtime = (await db.query("SELECT schemaname,tablename FROM pg_publication_tables WHERE pubname='supabase_realtime' ORDER BY tablename")).rows;
    observe('CATALOG-33-TABLES-RLS', '33 public application tables, all RLS enabled',
      { tableCount: context.catalog.tables.length, withoutRls: context.catalog.tables.filter(t => !t.rls).map(t => t.name) },
      context.catalog.tables.length === 33 && context.catalog.tables.every(t => t.rls));

    // Real auth insert → final signup/profile/mirror triggers; trusted local owner fixture setup only.
    for (const [label, actor] of Object.entries(actors)) {
      await db.query(`INSERT INTO auth.users(id,email,email_confirmed_at,raw_user_meta_data,raw_app_meta_data)
        VALUES($1,$2,CASE WHEN $3::boolean THEN now() ELSE NULL END,$4::jsonb,'{"provider":"email"}')`,
      [actor.uid, `QA_TEST_${label}@example.invalid`,actor.confirmed,JSON.stringify({full_name:`QA_TEST_${label}`,role:'super_admin'})]);
      await db.query('UPDATE profiles SET role=$2,status=$3 WHERE id=$1', [actor.uid,actor.role,actor.status]);
    }
    const course = id(100), lesson = id(101), notification = id(102);
    await db.query("INSERT INTO courses(id,title,slug,is_published) VALUES($1,'QA_TEST_boundaries','qa-test-boundaries',false)", [course]);
    await db.query("INSERT INTO lessons(id,course_id,title,type) VALUES($1,$2,'QA_TEST_article','article')", [lesson,course]);
    await db.query('UPDATE courses SET is_published=true WHERE id=$1',[course]);
    for (const actor of Object.values(actors)) await db.query('INSERT INTO enrollments(user_id,course_id) VALUES($1,$2)',[actor.uid,course]);
    await db.query("INSERT INTO notifications(id,user_id,title,message) VALUES($1,NULL,'QA_TEST_broadcast','QA_TEST_message')",[notification]);

    // Observable SELECT for every table; row counts only. Empty/denied probes are not inflated as policy proofs.
    for (const table of context.catalog.tables) {
      if (!/^[a-z_]+$/.test(table.name)) throw new Error('Unexpected catalog identifier.');
      for (const actor of ['anon','memberA','admin']) {
        const result = await as(actor, `SELECT 1 FROM public."${table.name}" LIMIT 1`);
        observe(`TABLE-PROBE-${table.name}-${actor}`, 'Record source privilege/RLS behavior, not proof for unseeded table', summarize(result));
      }
    }
    for (const actor of Object.keys(actors)) {
      const result = await as(actor, 'SELECT public.is_admin() AS allowed');
      observe(`IS-ADMIN-${actor}`, 'Only confirmed active admin accepted',
        result.ok ? { accepted: result.rows[0].allowed } : summarize(result),
        result.ok && result.rows[0].allowed === (actor === 'admin'));
    }
    const a = actors.memberA.uid, b = actors.memberB.uid;
    for (const table of ['profiles','users']) {
      for (const [label,target,count] of [['own',a,1],['foreign',b,0]]) {
        const result = await as('memberA', `SELECT id FROM public.${table} WHERE id=$1`,[target]);
        observe(`OWNERSHIP-${table}-${label}-select`, providerDefaults ? `Expected ${count} visible fixture rows` : 'Record migration-only table privileges',
          summarize(result), providerDefaults ? result.ok && result.rows.length === count : null);
      }
      const before = await snapshot(b);
      const foreignUpdate = await as('memberA', `UPDATE public.${table} SET full_name='QA_TEST_FORGED' WHERE id=$1 RETURNING id`,[b]);
      const after = await snapshot(b);
      observe(`OWNERSHIP-${table}-foreign-update`, 'Other account not modified', summarize(foreignUpdate),
        unchanged(before,after) && (!foreignUpdate.ok || foreignUpdate.rows.length === 0));
      const forgedInsert = await as('memberA', `INSERT INTO public.${table}(id,email,full_name) VALUES($1,$2,'QA_TEST_FORGED') RETURNING id`,
        [id(table==='profiles'?201:202),'QA_TEST_forged@example.invalid']);
      observe(`OWNERSHIP-${table}-insert`, 'Member cannot create an arbitrary auth-owned account', summarize(forgedInsert), !forgedInsert.ok);
      const beforeOwn = await snapshot(a);
      const xpAttempt = await as('memberA', `UPDATE public.${table} SET total_points=7777,xp=7777 WHERE id=$1 RETURNING id`,[a]);
      const afterOwn = await snapshot(a);
      observe(`PROTECTED-${table}-own-XP`, 'Unverified direct XP mutation must not alter authority or compatibility mirror',
        { ...summarize(xpAttempt), before: beforeOwn, after: afterOwn }, unchanged(beforeOwn,afterOwn));
      // Trusted fixture restoration only; no application migration or real records changed.
      await db.query('UPDATE profiles SET total_points=$2,xp=$3 WHERE id=$1',[a,beforeOwn.total_points,beforeOwn.xp]);
      const roleBefore = await snapshot(a);
      const roleAttempt = await as('memberA', `UPDATE public.${table} SET role='admin' WHERE id=$1 RETURNING id`,[a]);
      const roleAfter = await snapshot(a);
      observe(`PROTECTED-${table}-own-role`, 'Cannot self-promote', { ...summarize(roleAttempt), before:roleBefore,after:roleAfter }, unchanged(roleBefore,roleAfter));
    }

    // Default-executable mutable helper: exact persisted state, not an ACL-only inference.
    for (const actor of ['anon','memberA']) {
      await db.query("UPDATE courses SET updated_at='2000-01-01T00:00:00Z' WHERE id=$1",[course]);
      const before=(await db.query('SELECT enrolled_count,updated_at::text AS updated_at FROM courses WHERE id=$1',[course])).rows[0];
      const result=await as(actor,'SELECT public.refresh_course_enrolled_count($1)',[course]);
      const after=(await db.query('SELECT enrolled_count,updated_at::text AS updated_at FROM courses WHERE id=$1',[course])).rows[0];
      observe(`MUTABLE-COUNTER-HELPER-${actor}`, 'Untrusted direct helper must not mutate course metadata',
        { ...summarize(result), counterChanged:before.enrolled_count!==after.enrolled_count, timestampChanged:before.updated_at!==after.updated_at }, unchanged(before,after));
    }
    for (const signature of ['public.lock_course_activity(uuid)','public.ensure_completed_course_certificate(uuid,uuid)', 'public.apply_lesson_analysis(uuid)']) {
      const row = context.catalog.functions.find(f=>f.signature===signature.replace(/^public\./,'' )||f.signature===signature);
      observe(`INTERNAL-ACL-${signature}`, 'Anon/member execute revoked', row ? {anon:row.anon_execute,member:row.member_execute}: {missing:true},
        !!row && !row.anon_execute && !row.member_execute);
    }

    // Runtime status gates against actual final SQL. Unconfirmed semantics are observations except explicit card gate.
    const helpers = [
      ['require_active_user','SELECT public.require_active_user()'],
      ['enroll_course','SELECT public.enroll_course($1)',[course]],
      ['save_lesson_watch_progress','SELECT public.save_lesson_watch_progress($1,12)',[lesson]],
      ['refresh_badges','SELECT public.refresh_badges()'],
      ['acknowledge_badges','SELECT public.acknowledge_badges()'],
      ['read_notifications','SELECT public.read_notifications($1)',[notification]],
      ['get_own_member_card','SELECT public.get_own_member_card()'],
      ['award_points','SELECT public.award_points($1,\'COURSE_ENROLL\',\'QA_TEST_reward\',NULL,$2,\'course\')',null],
    ];
    for (const actor of ['memberA','inactive','pending','unconfirmed','inactiveAdmin','unconfirmedAdmin']) {
      for (const [helper,sql,args] of helpers) {
        const result = await as(actor,sql,args===null ? [actors[actor].uid,course] : args||[]);
        const inactive = ['inactive','pending','inactiveAdmin'].includes(actor);
        const unconfirmed = actor==='unconfirmed'||actor==='unconfirmedAdmin';
        const needsDecision = unconfirmed && helper!=='get_own_member_card';
        const shouldAccept = !inactive && !(unconfirmed&&helper==='get_own_member_card');
        observe(`STATUS-${actor}-${helper}`, needsDecision ? 'Needs product decision: active unconfirmed runtime behavior' : shouldAccept ? 'Active helper accepted' : 'Inactive/pending or unconfirmed-card helper rejected',
          {...summarize(result), needsDecision}, needsDecision ? null : result.ok===shouldAccept);
      }
      const read = await as(actor,'SELECT public.get_notifications()');
      observe(`STATUS-${actor}-get_notifications`, 'Record status gate difference; privacy remains scoped to own+broadcast',
        { ...summarize(read), needsDecision: actor!=='memberA' });
    }
    // Transition an existing active JWT's persisted account status; don't replace/forge its subject.
    await db.query("UPDATE profiles SET status='inactive' WHERE id=$1",[a]);
    const revoked = await as('memberA','SELECT public.require_active_user()');
    observe('STATUS-REVOCATION-CURRENT-SUBJECT', 'Existing subject loses active-user mutations immediately',summarize(revoked),!revoked.ok);
    context.status=context.cases.some(c=>c.passed===false)?'failed':'passed';
  } catch(e) {
    context.status='blocked-by-harness'; context.error=errorSummary(e);
  } finally { await db.close(); }
}

await runContext(false);
await runContext(true);
report.finishedAt=new Date().toISOString();
report.summary={contexts:report.contexts.map(c=>({name:c.name,status:c.status,
  passed:c.cases.filter(t=>t.passed===true).length,failed:c.cases.filter(t=>t.passed===false).length,
  observations:c.cases.filter(t=>t.passed===null).length})),
  failures:report.contexts.flatMap(c=>c.cases.filter(t=>t.passed===false).map(t=>({context:c.name,id:t.id,observed:t.observed})))};
await mkdir(path.dirname(output),{recursive:true});
await writeFile(output,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({summary:report.summary,evidence:'qa-audit/final/evidence/database-boundaries.json'}));
if(report.contexts.some(c=>c.status!=='passed'))process.exitCode=1;
