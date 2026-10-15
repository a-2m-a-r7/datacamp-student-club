// Local-only regression: never starts a child, builds, imports app modules,
// reads dotenv files, opens a socket, or contacts a provider.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { EventEmitter } = require('node:events');
const test = require('node:test');

const repo = path.resolve(__dirname, '../../..');
const local = 'http://127.0.0.1:3100';
const inheritedProviders = [
  'GOOGLE_DRIVE_CLIENT_ID', 'GOOGLE_DRIVE_CLIENT_SECRET',
  'GOOGLE_SERVICE_ACCOUNT_EMAIL', 'GOOGLE_PRIVATE_KEY',
  'GOOGLE_SPREADSHEET_OWNER_EMAIL', 'GEMINI_API_KEY',
];
const inheritedPublic = [
  'VITE_SITE_URL', 'VITE_APP_URL', 'VITE_AUTH_REDIRECT_URL',
  'COURSE_SITE_URL', 'VITE_PISTON_API_URL',
];

function capturedLauncher() {
  const calls = [];
  const fake = new EventEmitter();
  fake.execPath = process.execPath;
  fake.env = {
    PATH: 'QA_TEST_SYSTEM_PATH', SystemRoot: 'QA_TEST_SYSTEM_ROOT',
    SUPABASE_URL: 'https://qa-test-upstream.invalid',
    SUPABASE_ANON_KEY: 'QA_TEST_UPSTREAM_ANON',
    SUPABASE_SERVICE_ROLE_KEY: 'QA_TEST_UPSTREAM_SERVER',
    VITE_SUPABASE_URL: 'https://qa-test-upstream.invalid',
    VITE_SUPABASE_ANON_KEY: 'QA_TEST_UPSTREAM_PUBLIC_ANON',
    VITE_ENABLE_REALTIME: 'true', GEMINI_COURSE_ENABLED: 'true',
    GEMINI_COURSE_MODEL: 'QA_TEST_UPSTREAM_MODEL',
    ...Object.fromEntries(inheritedProviders.map(name => [name, 'QA_TEST_PROVIDER_CANARY_' + name])),
    ...Object.fromEntries(inheritedPublic.map(name => [name, 'https://qa-test-upstream.invalid/' + name])),
  };
  fake.cwd = () => repo;
  fake.exit = code => { throw Error('Launcher unexpectedly exited: ' + code); };
  const childProcess = {
    spawnSync(command, args, options) {
      calls.push({ kind: 'build', command, args, env: { ...options.env } });
      return { status: 0 };
    },
    spawn(command, args, options) {
      calls.push({ kind: 'server', command, args, env: { ...options.env } });
      const child = new EventEmitter();
      child.kill = () => true;
      return child;
    },
  };
  const source = fs.readFileSync(path.join(repo, 'qa-audit/start-local.cjs'), 'utf8');
  vm.runInNewContext(source, {
    process: fake, __dirname: path.join(repo, 'qa-audit'),
    require(name) {
      if (['child_process', 'node:child_process'].includes(name)) return childProcess;
      if (['path', 'node:path'].includes(name)) return path;
      throw Error('Unexpected launcher import; inspect isolation before allowing: ' + name);
    },
  }, { filename: 'start-local.cjs', timeout: 1000 });
  assert.equal(calls.length, 2, 'Expected captured build and server only');
  return calls;
}

test('QA launcher strips inherited provider credentials in both child environments', () => {
  for (const call of capturedLauncher()) {
    for (const name of inheritedProviders) {
      assert.ok(!call.env[name], call.kind + ' must clear inherited ' + name);
    }
  }
});

test('QA launcher disables inherited optional integrations and external runner URL', () => {
  for (const call of capturedLauncher()) {
    assert.equal(call.env.GEMINI_COURSE_ENABLED, 'false', call.kind + ' must explicitly disable course AI');
    assert.equal(call.env.VITE_ENABLE_REALTIME, 'false', call.kind + ' must disable remote Realtime');
    assert.ok(!call.env.VITE_PISTON_API_URL, call.kind + ' must clear external execution override');
    assert.ok(!String(call.env.GEMINI_COURSE_MODEL || '').startsWith('QA_TEST_UPSTREAM_'), call.kind + ' must not inherit provider model');
  }
});

test('QA launcher keeps canonical and authentication return URLs on isolated localhost', () => {
  for (const call of capturedLauncher()) {
    for (const name of ['VITE_SITE_URL', 'VITE_APP_URL', 'VITE_AUTH_REDIRECT_URL', 'COURSE_SITE_URL']) {
      assert.ok(call.env[name], call.kind + ' must explicitly set ' + name);
      assert.equal(new URL(call.env[name]).origin, local, call.kind + ' must isolate ' + name);
    }
    assert.equal(call.env.SUPABASE_URL, 'https://qa-test.supabase.co');
    assert.equal(call.env.VITE_SUPABASE_URL, 'https://qa-test.supabase.co');
    assert.ok(!String(call.env.SUPABASE_ANON_KEY || '').startsWith('QA_TEST_UPSTREAM_'), call.kind + ' must clear or replace server anon alias');
  }
});

test('QA Vite mode cannot hydrate project dotenv files, including unlisted VITE variables', () => {
  // Evaluate only the transpiled configuration factory with inert plugin/loadEnv
  // stubs. The real Vite loader and all dotenv reads remain unexecuted.
  const ts = require('typescript');
  const loads = [];
  const source = fs.readFileSync(path.join(repo, 'vite.config.ts'), 'utf8');
  const js = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText;
  const output = { exports: {} };
  const sandbox = {
    module: output, exports: output.exports, __dirname: repo,
    process: { env: {}, cwd: () => repo },
    require(name) {
      if (name === 'vite') return {
        defineConfig: value => value,
        loadEnv(mode, directory, prefix) {
          loads.push({ mode, directory, prefix });
          return { VITE_QA_TEST_UNLISTED_CANARY: 'QA_TEST_DOTENV_CANARY' };
        },
      };
      if (['path', 'node:path'].includes(name)) return path;
      if (['@tailwindcss/vite', '@vitejs/plugin-react'].includes(name)) return () => ({});
      throw Error('Unexpected config import; inspect before allowing: ' + name);
    },
  };
  vm.runInNewContext(js, sandbox, { filename: 'vite.config.ts (inert)', timeout: 1000 });
  const configuration = output.exports.default({ mode: 'qa' });
  const errors = [];
  if (configuration.envDir !== false) errors.push('QA config must set envDir:false to prevent automatic project dotenv hydration');
  if (loads.length) errors.push('QA config must skip explicit loadEnv entirely; observed ' + loads.length + ' call(s)');
  assert.deepEqual(errors, []);
});
