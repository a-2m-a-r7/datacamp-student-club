// Actual connected backend checks: reads only, no account or test-record creation.
const fs=require('node:fs');
process.loadEnvFile('.env');
const url=process.env.VITE_SUPABASE_URL, anon=process.env.VITE_SUPABASE_ANON_KEY, service=process.env.SUPABASE_SERVICE_ROLE_KEY;
const results=[];
async function read(table,key) {
 const response=await fetch(url+'/rest/v1/'+table+'?select=*&limit=0',{method:'HEAD',headers:{apikey:key,Authorization:'Bearer '+key,Prefer:'count=exact'},signal:AbortSignal.timeout(15000)});
 return {status:response.status,count:Number(response.headers.get('content-range')?.split('/')[1])};
}
(async()=>{
 for(const table of ['profiles','events','forms','form_questions','points_log','certificates']) {
  const result=await read(table,anon);
  results.push({check:'anonymous read '+table,...result});
  if(![200,206].includes(result.status)||result.count!==0)throw Error('Unexpected anonymous result: '+table);
 }
 const events=await read('public_events',anon); results.push({check:'sanitized public events',...events});
 if(![200,206].includes(events.status)||events.count!==2)throw Error('Public event projection unavailable');
 const profiles=await read('profiles',service); results.push({check:'server key reads existing profile count',...profiles});
 if(![200,206].includes(profiles.status)||profiles.count!==5)throw Error('Server key cannot read existing profiles');
 for(const endpoint of ['/api/admin/users','/api/admin/backup','/api/forms/sync-sheet']) {
  const response=await fetch('http://127.0.0.1:3000'+endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:'{}',signal:AbortSignal.timeout(15000)});
  results.push({check:'local server visitor rejection '+endpoint,status:response.status});
  if(response.status!==401)throw Error('Unauthorized request was not rejected correctly');
 }
 fs.writeFileSync('qa-audit/live-readonly-results.json',JSON.stringify({passed:results.length,results},null,2));
 console.log(JSON.stringify({passed:results.length,checks:results}));
})().catch(()=>{console.log('Live read-only check failed; no secrets or response records logged.');process.exitCode=1;});
