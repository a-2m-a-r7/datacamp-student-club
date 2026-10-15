import fs from 'node:fs';
const origin='https://datacamp-student-club.vercel.app',checks=[];
for(const route of ['/','/courses','/login','/compiler']){
 const r=await fetch(origin+route,{headers:{'Cache-Control':'no-cache'}});
 const cache=r.headers.get('cache-control')||'';
 const csp=r.headers.get('content-security-policy')||'';
 const pass=r.status===200&&cache.includes('no-store')&&csp.includes('https://www.googleapis.com');
 checks.push({route,status:r.status,noStore:cache.includes('no-store'),driveConnectionAllowed:csp.includes('https://www.googleapis.com'),pass});
 await r.body?.cancel();
}
for(const route of ['/api/courses/drive','/api/courses/media','/api/courses/analyze']){
 const r=await fetch(origin+route,{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'}),body=await r.json().catch(()=>({}));
 checks.push({route,status:r.status,requiresAuthentication:body.error==='Authentication required.',pass:r.status===401&&body.error==='Authentication required.'});
}
const media=await fetch(origin+'/api/courses/media'),callback=await fetch(origin+'/api/courses/drive?state=QA_TEST_INVALID',{redirect:'manual'});
checks.push({route:'media without ticket',status:media.status,pass:media.status===403});await media.body?.cancel();
checks.push({route:'OAuth invalid state',status:callback.status,cleanFailure:callback.headers.get('location')===origin+'/admin/courses?drive=failed',pass:callback.status===302&&callback.headers.get('location')===origin+'/admin/courses?drive=failed'});await callback.body?.cancel();
const result={origin,checkedAt:new Date().toISOString(),passed:checks.filter(c=>c.pass).length,checks};fs.writeFileSync('qa-audit/course-media-deployed-results.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));if(checks.some(c=>!c.pass))process.exitCode=1;
