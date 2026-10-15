const { spawn, spawnSync } = require('child_process');
const path = require('node:path');
const allowed = ['SystemRoot','SYSTEMROOT','WINDIR','windir','COMSPEC','ComSpec','PATH','Path','PATHEXT','TEMP','TMP','USERPROFILE','APPDATA','LOCALAPPDATA','PROGRAMFILES','ProgramFiles','ProgramFiles(x86)','NUMBER_OF_PROCESSORS','PROCESSOR_ARCHITECTURE'];
const env = Object.fromEntries(allowed.filter(key=>process.env[key]!==undefined).map(key=>[key,process.env[key]]));
Object.assign(env, { VITE_SITE_URL:'http://127.0.0.1:3100', VITE_APP_URL:'http://127.0.0.1:3100', VITE_AUTH_REDIRECT_URL:'http://127.0.0.1:3100/auth/callback', COURSE_SITE_URL:'http://127.0.0.1:3100',
 VITE_SUPABASE_URL:'https://qa-test.supabase.co', VITE_SUPABASE_ANON_KEY:'QA_TEST_ANON', SUPABASE_URL:'https://qa-test.supabase.co', SUPABASE_ANON_KEY:'QA_TEST_ANON', SUPABASE_SERVICE_ROLE_KEY:'QA_TEST_SERVER',
 GEMINI_API_KEY:'', GEMINI_COURSE_ENABLED:'false', GEMINI_COURSE_MODEL:'', GOOGLE_DRIVE_CLIENT_ID:'', GOOGLE_DRIVE_CLIENT_SECRET:'', GOOGLE_SERVICE_ACCOUNT_EMAIL:'', GOOGLE_PRIVATE_KEY:'', GOOGLE_SPREADSHEET_OWNER_EMAIL:'',
 VITE_ENABLE_REALTIME:'false', VITE_PISTON_API_URL:'', NODE_OPTIONS:'--require='+JSON.stringify(path.resolve(__dirname,'final/network-guard.cjs')) });
const build = spawnSync(process.execPath, ['node_modules/vite/bin/vite.js','build','--mode=qa','--outDir=qa-audit/site-build','--emptyOutDir','false'], { env, stdio: 'inherit' });
if (build.status !== 0) process.exit(build.status || 1);
const child = spawn(process.execPath, ['--import','tsx','qa-audit/local-server.mjs'], { env, stdio: 'inherit' });
process.on('SIGTERM',()=>child.kill()); process.on('SIGINT',()=>child.kill()); child.on('exit',code=>process.exit(code||0));
