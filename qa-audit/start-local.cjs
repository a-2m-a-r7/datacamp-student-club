const { spawn, spawnSync } = require('child_process');
const env = { ...process.env, VITE_SITE_URL: 'http://127.0.0.1:3100', VITE_SUPABASE_URL: 'https://qa-test.supabase.co',
 VITE_SUPABASE_ANON_KEY: 'QA_TEST_ANON', SUPABASE_URL: 'https://qa-test.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'QA_TEST_SERVER',
 GEMINI_API_KEY: '', GOOGLE_SERVICE_ACCOUNT_EMAIL: '', GOOGLE_PRIVATE_KEY: '' };
const build = spawnSync(process.execPath, ['node_modules/vite/bin/vite.js','build','--mode=qa','--outDir=qa-audit/site-build'], { env, stdio: 'inherit' });
if (build.status !== 0) process.exit(build.status || 1);
const child = spawn(process.execPath, ['--import','tsx','qa-audit/local-server.mjs'], { env, stdio: 'inherit' });
process.on('SIGTERM',()=>child.kill()); process.on('SIGINT',()=>child.kill()); child.on('exit',code=>process.exit(code||0));
