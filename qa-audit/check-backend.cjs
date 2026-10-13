// Read-only connectivity/schema check. Never prints configuration values or records.
const fs=require('fs');
const text=fs.readFileSync('.env','utf8');
function env(name){const match=text.match(new RegExp('^'+name+'=(.*)$','m'));return match?.[1].trim().replace(/^['"]|['"]$/g,'')||'';}
const url=env('VITE_SUPABASE_URL'),key=env('VITE_SUPABASE_ANON_KEY');
(async()=>{
 try {
  const response=await fetch(url+'/auth/v1/settings',{headers:{apikey:key},signal:AbortSignal.timeout(10000)});
  const settings=await response.json();
  const result={authSettingsStatus:response.status,googleEnabled:settings.external?.google===true,emailEnabled:settings.external?.email===true,signupDisabled:settings.disable_signup===true};
  fs.writeFileSync('qa-audit/backend-auth-status.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
 } catch { console.log('Auth settings inspection unavailable'); }
 for(const table of ['courses','events','profiles','settings','forms','form_questions','points_log','certificates']){
  try {const r=await fetch(url+'/rest/v1/'+table+'?select=*&limit=0',{method:'HEAD',headers:{apikey:key,Authorization:'Bearer '+key,Prefer:'count=exact'},signal:AbortSignal.timeout(10000)});
   console.log(JSON.stringify({table,status:r.status,visibleCount:r.headers.get('content-range')?.split('/')[1]||'unknown'}));
  }catch{ console.log(JSON.stringify({table,networkError:true})); process.exitCode=1;break; }
 }
})();
