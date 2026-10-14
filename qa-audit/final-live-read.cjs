// Read-only production checks. Report counts/configuration, never identities, messages or keys.
const fs=require('node:fs');
const base=process.env.VITE_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!base||!key)throw Error('Private local configuration required');
const headers={apikey:key,Authorization:'Bearer '+key};
const tables=['courses','lessons','events','staff','gallery','projects','blog','forms','form_questions','form_responses','messages','notifications','settings','profiles','certificates'];
(async()=>{
 const checks=[];for(const table of tables){const response=await fetch(base+'/rest/v1/'+table+'?select=*&limit=0',{method:'HEAD',headers:{...headers,Prefer:'count=exact'},signal:AbortSignal.timeout(15000)});if(!response.ok)throw Error('Schema unavailable: '+table);checks.push({table,status:response.status,rows:Number(response.headers.get('content-range')?.split('/')[1])});}
 const settingsResponse=await fetch(base+'/rest/v1/settings?select=value&key=eq.general',{headers,signal:AbortSignal.timeout(15000)});if(!settingsResponse.ok)throw Error('Settings unavailable');const settings=(await settingsResponse.json())[0]?.value||{};
 const placeholders={contactEmail:settings.contactEmail==='contact@datacamp.club',contactPhone:settings.contactPhone==='+20 123 456 7890'};
 const result={checkedAt:new Date().toISOString(),mode:'read-only production',checks,knownSeedContactPlaceholders:placeholders,localGoogleSheetsConfigured:Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL&&process.env.GOOGLE_PRIVATE_KEY),productionMutations:0};
 fs.writeFileSync('qa-audit/final-live-results.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
})().catch(error=>{console.error(error.message);process.exitCode=1;});
