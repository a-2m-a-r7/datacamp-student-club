/** Sole executor: run manually with `node qa-audit/final/tests/full-schema-security.mjs`.
 * No environment files, remote clients, connection strings, or provider requests.
 * Two independent, ephemeral PGlite databases; migration files are never rewritten.
 */
import { PGlite } from '@electric-sql/pglite';
import { citext } from '@electric-sql/pglite/contrib/citext';
import { pgcrypto } from '@electric-sql/pglite/contrib/pgcrypto';
import { uuid_ossp } from '@electric-sql/pglite/contrib/uuid_ossp';
import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const migrations = path.join(root, 'supabase', 'migrations');
const candidateMode = process.argv.slice(2).includes('--candidate');
if (process.argv.slice(2).some(arg => arg !== '--candidate')) throw new Error('Only --candidate is supported.');
const evidenceName = candidateMode ? 'full-schema-security-candidate.json' : 'full-schema-security.json';
const evidencePath = path.join(root, 'qa-audit/final/evidence', evidenceName);
const options = { extensions: { citext, pgcrypto, 'uuid-ossp': uuid_ossp } };
const safeError = error => ({
  sqlstate: /^[A-Z0-9]{5}$/.test(String(error?.code)) ? String(error.code) : null,
  message: String(error?.message || 'Unknown failure').replace(/[\r\n\t]+/g, ' ').slice(0, 350),
});
const report = {
  checkedAt: new Date().toISOString(),
  environment: 'Two independent in-memory PGlite PostgreSQL databases, no network or .env reads',
  mode: candidateMode ? 'proposed BUG-002 SQL in-memory only' : 'unmodified baseline',
  limitations: [
    'Supabase platform prerequisites are minimal local stand-ins; this does not run GoTrue, Storage HTTP, PostgREST, or Realtime transport.',
    'Timestamped migrations are replayed verbatim, including their original local seeds and data-changing statements; never applied to production.',
    'Legacy helper case is an intentionally unpatched historical vulnerable control, not a current-regression assertion or proof of deployed privileges.',
    'No public table privilege bootstrap or blanket GRANT ALL is used. PostgreSQL default PUBLIC EXECUTE is measured unchanged.',
  ],
  fullReplay: { status: 'not-run', attempted: [], bootstrap: [] },
  legacyPromotion: { status: 'not-run', cases: [] },
};

const bootstrap = `
CREATE ROLE anon NOLOGIN;
CREATE ROLE authenticated NOLOGIN;
CREATE ROLE service_role NOLOGIN BYPASSRLS;
CREATE SCHEMA auth;
CREATE TABLE auth.users (
 id uuid PRIMARY KEY, email text, email_confirmed_at timestamptz,
 raw_user_meta_data jsonb DEFAULT '{}', raw_app_meta_data jsonb DEFAULT '{}',
 app_metadata jsonb DEFAULT '{}', created_at timestamptz DEFAULT now(),
 updated_at timestamptz DEFAULT now(), last_sign_in_at timestamptz
);
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$
 SELECT NULLIF(current_setting('request.jwt.claim.sub',true),'')::uuid
$$;
CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql STABLE AS $$
 SELECT COALESCE(NULLIF(current_setting('request.jwt.claim.role',true),''),current_user::text)
$$;
GRANT USAGE ON SCHEMA public,auth TO anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION auth.uid(),auth.role() TO anon,authenticated,service_role;
CREATE SCHEMA storage;
CREATE TABLE storage.buckets (
 id text PRIMARY KEY,name text,public boolean DEFAULT false,
 file_size_limit bigint,allowed_mime_types text[]
);
CREATE TABLE storage.objects (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),bucket_id text,name text,
 owner uuid,owner_id text,metadata jsonb DEFAULT '{}'
);
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
CREATE FUNCTION storage.foldername(name text) RETURNS text[] LANGUAGE sql IMMUTABLE AS $$
 SELECT CASE WHEN strpos(name,'/')=0 THEN ARRAY[]::text[]
 ELSE (string_to_array(name,'/'))[1:array_length(string_to_array(name,'/'),1)-1] END
$$;
GRANT USAGE ON SCHEMA storage TO anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION storage.foldername(text) TO anon,authenticated,service_role;
CREATE PUBLICATION supabase_realtime;
`;

async function fullReplay() {
  const db = new PGlite(options);
  let phase = 'bootstrap';
  try {
    await db.exec(bootstrap);
    report.fullReplay.bootstrap = [
      'Roles anon/authenticated/service_role and minimal auth.users, auth.uid(), auth.role()',
      'Minimal storage.buckets/storage.objects, enabled object RLS, storage.foldername()',
      'Schema usage and platform-helper execute only; no app-table grants',
      'Empty supabase_realtime publication; original migrations add tables',
      'PGlite bundled uuid-ossp/pgcrypto/citext enabled; original CREATE EXTENSION statements unchanged',
    ];
    const files = (await readdir(migrations)).filter(name => /^\d{14}_[\w-]+\.sql$/.test(name)).sort();
    report.fullReplay.migrationCount = files.length;
    report.fullReplay.excludedAlternateInputs = ['combined_migration.sql', '../full_schema.sql', '../seed.sql'];
    for (const file of files) {
      phase = file;
      const sql = await readFile(path.join(migrations, file), 'utf8');
      const entry = { migration: file, sha256: createHash('sha256').update(sql).digest('hex'), status: 'attempted' };
      report.fullReplay.attempted.push(entry);
      try {
        await db.exec(sql);
        entry.status = 'passed';
      } catch (error) {
        entry.status = 'failed';
        entry.error = safeError(error);
        report.fullReplay.status = 'failed';
        report.fullReplay.firstFailure = { migration: file, ...safeError(error) };
        // Do not continue a partial/aborted schema and mislabel downstream errors.
        await db.exec('ROLLBACK').catch(() => {});
        return;
      }
    }
    report.fullReplay.status = 'passed';
    const catalog = await db.query(`SELECT
      (SELECT count(*)::int FROM pg_tables WHERE schemaname='public') AS public_tables,
      (SELECT count(*)::int FROM pg_policies WHERE schemaname IN ('public','storage')) AS policies,
      (SELECT count(*)::int FROM pg_publication_tables WHERE pubname='supabase_realtime') AS realtime_tables`);
    report.fullReplay.catalog = catalog.rows[0];
    report.fullReplay.promotionAcl = (await db.query(`SELECT
      has_function_privilege('anon','public.promote_admin_by_email(text)','EXECUTE') AS anon_execute,
      has_function_privilege('authenticated','public.promote_admin_by_email(text)','EXECUTE') AS member_execute`)).rows[0];
    // Observe the real final schema, trigger pipeline and ACLs, not only the minimal reproduction.
    report.fullReplay.baselinePromotion = await fullChainPromotion(db, false);
    if (candidateMode) {
      const candidate = await readFile(path.join(root, 'qa-audit/final/proposed-sql/BUG-002.sql'), 'utf8');
      report.fullReplay.candidateSource = {
        file: 'qa-audit/final/proposed-sql/BUG-002.sql',
        sha256: createHash('sha256').update(candidate).digest('hex'),
        appliedTo: 'this ephemeral in-memory database only, after original migration chain',
      };
      await db.exec(candidate);
      report.fullReplay.candidatePromotion = await fullChainPromotion(db, true);
    }
  } catch (error) {
    report.fullReplay.status = phase === 'bootstrap' ? 'blocked-by-harness' : 'failed';
    report.fullReplay.firstFailure = { migration: phase, ...safeError(error) };
  } finally {
    await db.close();
  }
}

async function fullChainPromotion(db, afterCandidate) {
  const result = { status: 'not-run', cases: [], source: 'All original timestamped migrations already applied verbatim' };
  try {
    result.acl = (await db.query(`SELECT
      has_function_privilege('anon','public.promote_admin_by_email(text)','EXECUTE') AS anon_execute,
      has_function_privilege('authenticated','public.promote_admin_by_email(text)','EXECUTE') AS member_execute,
      has_function_privilege('service_role','public.promote_admin_by_email(text)','EXECUTE') AS service_execute,
      has_table_privilege('anon','profiles','UPDATE') AS anon_direct_profile_update,
      has_table_privilege('authenticated','profiles','UPDATE') AS member_direct_profile_update,
      (SELECT prosecdef FROM pg_proc WHERE oid='public.promote_admin_by_email(text)'::regprocedure) AS security_definer
    `)).rows[0];
    const actors = ['anon', 'authenticated', 'service_role'];
    for (let index = 0; index < actors.length; index++) {
      const actor = actors[index];
      const ordinal = (afterCandidate ? 10 : 0) + index + 1;
      const uid = `20000000-0000-4000-8000-${String(ordinal).padStart(12, '0')}`;
      const email = `QA_TEST_full_chain_${ordinal}@example.invalid`;
      // Actual latest handle_new_user and sync_user_from_profile triggers run unchanged.
      await db.query(`INSERT INTO auth.users(id,email,email_confirmed_at,raw_user_meta_data,raw_app_meta_data)
        VALUES($1,$2,now(),$3::jsonb,$4::jsonb)`,
      [uid,email,JSON.stringify({ full_name: `QA_TEST_full_chain_${ordinal}` }),JSON.stringify({ provider: 'email' })]);
      const state = async () => (await db.query(`SELECT p.role,p.total_points,p.xp,p.level,p.is_verified,
        EXISTS(SELECT 1 FROM admin_emails WHERE email=$2) AS allowlisted,
        u.role AS mirror_role,u.total_points AS mirror_points
        FROM profiles p LEFT JOIN public.users u ON u.id=p.id WHERE p.id=$1`,[uid,email])).rows[0];
      const before = await state();
      if (!before || before.role !== 'user' || before.total_points !== 0 || before.allowlisted) {
        throw new Error('Full-chain QA_TEST_ fixture did not begin as an unprivileged zero-XP account.');
      }
      const claimedUid = actor === 'authenticated' ? uid : '';
      await db.query("SELECT set_config('request.jwt.claim.sub',$1,false),set_config('request.jwt.claim.role',$2,false)",[claimedUid,actor]);
      let callError = null;
      const roleSql = { anon: 'SET ROLE anon', authenticated: 'SET ROLE authenticated', service_role: 'SET ROLE service_role' };
      await db.exec(roleSql[actor]);
      try { await db.query('SELECT public.promote_admin_by_email($1)',[email]); }
      catch (error) { callError = safeError(error); }
      finally { await db.exec('RESET ROLE'); }
      await db.query("SELECT set_config('request.jwt.claim.sub','',false),set_config('request.jwt.claim.role','',false)");
      const after = await state();
      const isService = actor === 'service_role';
      const unchanged = JSON.stringify(before) === JSON.stringify(after);
      const passed = isService
        ? !callError && after.role === 'admin' && after.total_points === 10000 && after.xp === 10000 && after.allowlisted && after.mirror_role === 'admin'
        : unchanged && callError?.sqlstate === '42501' &&
          (actor === 'anon' ? result.acl.anon_execute === false : result.acl.member_execute === false);
      result.cases.push({
        id: `FULL-CHAIN-PROMOTE-${afterCandidate ? 'CANDIDATE' : 'BASELINE'}-${actor.toUpperCase()}`,
        actor, jwtSubject: actor === 'authenticated' ? 'QA_TEST_own_member_subject' : 'empty',
        expectation: isService ? 'Trusted service_role helper remains usable' : 'Unprivileged caller denied; profile, XP and allowlist unchanged',
        before, after, callError, passed,
      });
    }
    result.status = result.cases.every(row => row.passed) ? 'passed' : 'failed';
  } catch (error) {
    result.status = 'blocked-by-harness';
    result.error = safeError(error);
    await db.exec('RESET ROLE').catch(() => {});
  }
  return result;
}

async function legacyPromotion() {
  const sourceName = '20261010000004_phase2_schema_hardening.sql';
  const source = await readFile(path.join(migrations, sourceName), 'utf8');
  const match = source.match(/CREATE\s+OR\s+REPLACE\s+FUNCTION\s+public\.promote_admin_by_email\s*\(admin_email\s+TEXT\)[\s\S]*?\$\$\s+LANGUAGE\s+plpgsql[\s\S]*?;/i);
  if (!match) throw new Error('Exact legacy helper definition could not be extracted; no substitute function executed.');
  report.legacyPromotion.source = {
    migration: sourceName,
    line: source.slice(0, match.index).split('\n').length,
    sha256: createHash('sha256').update(match[0]).digest('hex'),
  };
  const db = new PGlite(options);
  try {
    // No policies or table grants: unprivileged callers cannot directly modify rows.
    // No default-privilege changes: function EXECUTE defaults come from PostgreSQL.
    await db.exec(`CREATE EXTENSION IF NOT EXISTS citext;
      CREATE ROLE anon NOLOGIN; CREATE ROLE authenticated NOLOGIN;
      GRANT USAGE ON SCHEMA public TO anon,authenticated;
      CREATE TABLE profiles(id uuid PRIMARY KEY,email text UNIQUE,role text DEFAULT 'user',
        total_points integer DEFAULT 0,xp integer DEFAULT 0,level text DEFAULT 'RECRUIT',
        is_verified boolean DEFAULT false,updated_at timestamptz DEFAULT now());
      CREATE TABLE admin_emails(email citext PRIMARY KEY);
      ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
      ALTER TABLE admin_emails ENABLE ROW LEVEL SECURITY;
    `);
    await db.exec(match[0]);
    report.legacyPromotion.bootstrap = [
      'Only minimal profiles/admin_emails tables, citext, anon/authenticated roles, public schema usage',
      'Both tables RLS enabled, no caller table privileges, no RLS policies, no trigger substitutions',
      'Only exact extracted helper source installed; no EXECUTE grants/default privilege alterations',
    ];
    report.legacyPromotion.acl = (await db.query(`SELECT
      has_function_privilege('anon','public.promote_admin_by_email(text)','EXECUTE') AS anon_execute,
      has_function_privilege('authenticated','public.promote_admin_by_email(text)','EXECUTE') AS member_execute,
      has_table_privilege('anon','profiles','UPDATE') AS anon_direct_profile_update,
      has_table_privilege('authenticated','profiles','UPDATE') AS member_direct_profile_update,
      (SELECT prosecdef FROM pg_proc WHERE oid='public.promote_admin_by_email(text)'::regprocedure) AS security_definer
    `)).rows[0];
    const identities = [
      { actor: 'anon', uid: '10000000-0000-4000-8000-000000000001', email: 'QA_TEST_anon_target@example.invalid' },
      { actor: 'authenticated', uid: '10000000-0000-4000-8000-000000000002', email: 'QA_TEST_member_target@example.invalid' },
    ];
    for (const identity of identities) {
      await db.query('INSERT INTO profiles(id,email) VALUES($1,$2)', [identity.uid, identity.email]);
    }
    const state = async identity => (await db.query(`SELECT role,total_points,xp,level,is_verified,
      EXISTS(SELECT 1 FROM admin_emails WHERE email=$2) AS allowlisted
      FROM profiles WHERE id=$1`, [identity.uid, identity.email])).rows[0];
    for (const identity of identities) {
      const before = await state(identity);
      let callError = null;
      // Static role names above, never interpolate arbitrary external identifiers.
      await db.exec(identity.actor === 'anon' ? 'SET ROLE anon' : 'SET ROLE authenticated');
      try {
        await db.query('SELECT public.promote_admin_by_email($1)', [identity.email]);
      } catch (error) { callError = safeError(error); }
      finally { await db.exec('RESET ROLE'); }
      const after = await state(identity);
      const unchanged = JSON.stringify(before) === JSON.stringify(after);
      report.legacyPromotion.cases.push({
        id: identity.actor === 'anon' ? 'LEGACY-PROMOTE-ANON' : 'LEGACY-PROMOTE-MEMBER',
        actor: identity.actor, identityPrefix: 'QA_TEST_',
        expectation: 'Unprivileged caller cannot promote account, mint XP, verify account or edit allowlist',
        before, after, callError, passed: unchanged,
      });
    }
    report.legacyPromotion.isCurrentRegression = false;
    report.legacyPromotion.expectedHistoricalControl = 'Exact original helper permits untrusted promotion under unchanged PostgreSQL PUBLIC EXECUTE default';
    report.legacyPromotion.controlConfirmed = report.legacyPromotion.cases.length === 2 &&
      report.legacyPromotion.cases.every(row => !row.callError && !row.passed &&
        row.after.role === 'admin' && row.after.xp === 10000 && row.after.allowlisted);
    report.legacyPromotion.status = report.legacyPromotion.controlConfirmed
      ? 'historical-vulnerable-control-confirmed' : 'historical-control-differs';
  } catch (error) {
    report.legacyPromotion.status = 'blocked-by-harness';
    report.legacyPromotion.error = safeError(error);
  } finally { await db.close(); }
}

// Independent phases: a failed migration replay must not hide the legacy reproduction.
await fullReplay();
try { await legacyPromotion(); }
catch (error) {
  report.legacyPromotion.status = 'blocked-by-harness';
  report.legacyPromotion.error = safeError(error);
}
report.finishedAt = new Date().toISOString();
// Only the installed current chain (and optional candidate) defines regression success.
// The explicitly unpatched historical reproduction is retained as explanatory control evidence.
report.passed = report.fullReplay.status === 'passed' && report.fullReplay.baselinePromotion?.status === 'passed' &&
  (!candidateMode || report.fullReplay.candidatePromotion?.status === 'passed');
await mkdir(path.dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, JSON.stringify(report, null, 2) + '\n', 'utf8');
console.log(JSON.stringify({
  fullReplay: report.fullReplay.status,
  firstFailure: report.fullReplay.firstFailure || null,
  legacyPromotion: report.legacyPromotion.status,
  fullChainBaselinePromotion: report.fullReplay.baselinePromotion?.status || 'not-run',
  fullChainCandidatePromotion: report.fullReplay.candidatePromotion?.status || 'not-run',
  cases: report.legacyPromotion.cases.map(({ id, passed }) => ({ id, passed })),
  evidence: `qa-audit/final/evidence/${evidenceName}`,
}));
if (!report.passed) process.exitCode = 1;
