const fs=require('fs'); const text=fs.readFileSync('.env','utf8');
const get=n=>text.match(new RegExp('^'+n+'=(.*)$','m'))?.[1].trim().replace(/^['"]|['"]$/g,'')||'';
(async()=>{
 const response=await fetch(get('VITE_SUPABASE_URL')+'/rest/v1/',{headers:{apikey:get('VITE_SUPABASE_ANON_KEY'),Accept:'application/openapi+json'},signal:AbortSignal.timeout(10000)});
 if(!response.ok)throw Error('Schema inspection failed: '+response.status);
 const schema=await response.json();const result={};
 for(const name of ['profiles','users','courses','lessons','enrollments','events','projects','blog','staff','gallery','notifications','settings','messages','audit_logs'])result[name]=Object.keys(schema.definitions?.[name]?.properties||{});
 fs.writeFileSync('qa-audit/backend-schema.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
})().catch(()=>{console.log('Schema inspection unavailable');process.exitCode=1;});
