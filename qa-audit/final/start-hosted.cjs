// No dotenv or inherited service credentials. Only the exact approved QA host.
const {spawn,spawnSync}=require('node:child_process');
const fs=require('node:fs'),path=require('node:path');
const cfg=JSON.parse(fs.readFileSync('qa-audit/.runtime/final-hosted/config.json','utf8'));
if(cfg.projectRef!=='kcqgnkfdpfibwkrghubl'||cfg.url!=='https://kcqgnkfdpfibwkrghubl.supabase.co')throw Error('Unexpected QA project');
const allowed=['SystemRoot','WINDIR','COMSPEC','ComSpec','PATH','Path','PATHEXT','TEMP','TMP','USERPROFILE','APPDATA','LOCALAPPDATA'];
const env=Object.fromEntries(allowed.filter(k=>process.env[k]!==undefined).map(k=>[k,process.env[k]]));
Object.assign(env,{VITE_SITE_URL:'http://127.0.0.1:3200',VITE_APP_URL:'http://127.0.0.1:3200',VITE_AUTH_REDIRECT_URL:'http://127.0.0.1:3200/auth/callback',VITE_SUPABASE_URL:cfg.url,VITE_SUPABASE_ANON_KEY:cfg.publishableKey,VITE_ENABLE_REALTIME:'true'});
const built=spawnSync(process.execPath,['node_modules/vite/bin/vite.js','build','--mode=qa','--outDir=qa-audit/.runtime/final-hosted/build','--emptyOutDir','false'],{env,stdio:'inherit'});
if(built.status!==0)process.exit(built.status||1);
// Private credentials are loaded only after the client build has finished.
const secretPath='qa-audit/.runtime/final-hosted/server-secrets.json';
const secrets=fs.existsSync(secretPath)?JSON.parse(fs.readFileSync(secretPath,'utf8')):{};
const geminiPath='qa-audit/.runtime/final-hosted/gemini-secrets.json';
const gemini=fs.existsSync(geminiPath)?JSON.parse(fs.readFileSync(geminiPath,'utf8')):{};
if(gemini.projectId&&gemini.projectId!=='qa-test-datacamp-final')throw Error('Unexpected Gemini project');
const sheetsPath='qa-audit/.runtime/final-hosted/google-sheets.json';
const sheets=fs.existsSync(sheetsPath)?JSON.parse(fs.readFileSync(sheetsPath,'utf8')):{};
if(sheets.project_id&&sheets.project_id!=='qa-test-datacamp-final')throw Error('Unexpected Sheets project');
const oauthPath='qa-audit/.runtime/final-hosted/google-oauth.json';
const oauth=fs.existsSync(oauthPath)?JSON.parse(fs.readFileSync(oauthPath,'utf8')).web:null;
if(oauth&&oauth.project_id!=='qa-test-datacamp-final')throw Error('Only the isolated Google QA project is allowed.');
const serverEnv={...env,SUPABASE_URL:cfg.url,SUPABASE_ANON_KEY:cfg.publishableKey,COURSE_SITE_URL:'http://127.0.0.1:3200',SUPABASE_SERVICE_ROLE_KEY:secrets.SUPABASE_SERVICE_ROLE_KEY||'',
 GOOGLE_DRIVE_CLIENT_ID:oauth?.client_id||'',GOOGLE_DRIVE_CLIENT_SECRET:oauth?.client_secret||'',GEMINI_API_KEY:gemini.GEMINI_API_KEY||'',GEMINI_COURSE_ENABLED:gemini.GEMINI_API_KEY?'true':'false',
 GOOGLE_SERVICE_ACCOUNT_EMAIL:sheets.client_email||'',GOOGLE_PRIVATE_KEY:sheets.private_key||'',GOOGLE_SPREADSHEET_OWNER_EMAIL:sheets.client_email?'mart33645@gmail.com':'',VITE_PISTON_API_URL:''};
const child=spawn(process.execPath,['--import','tsx','qa-audit/final/hosted-server.mjs'],{env:serverEnv,stdio:'inherit'});
process.on('SIGTERM',()=>child.kill());process.on('SIGINT',()=>child.kill());child.on('exit',code=>process.exitCode=code||0);
