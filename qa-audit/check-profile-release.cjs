const fs=require('node:fs'),cp=require('node:child_process'),crypto=require('node:crypto');
(async()=>{
 const applicationCommit=process.argv[2];if(!/^[a-f0-9]{40}$/.test(applicationCommit||''))throw Error('Application commit required');
 const status=JSON.parse(cp.execFileSync('gh',['api','repos/a-2m-a-r7/datacamp-student-club/commits/'+applicationCommit+'/status'],{encoding:'utf8'}));
 const deployment=status.statuses.find(s=>s.context==='Vercel');if(deployment?.state!=='success')throw Error('Deployment has not succeeded yet');
 const origin='https://datacamp-student-club.vercel.app';const html=await fetch(origin,{cache:'no-store'});const content=await html.text();
 const path=content.match(/src="(\/assets\/index-[^"]+\.js)"/)?.[1];if(!path)throw Error('Entry not found');
 const entryResponse=await fetch(origin+path,{cache:'no-store'});if(!entryResponse.ok)throw Error('Entry unavailable');const entry=await entryResponse.text();
 const profilePath='/assets/'+entry.match(/Profile-[\w-]+\.js/)?.[0];const profileResponse=await fetch(origin+profilePath,{cache:'no-store'});const profileBundle=await profileResponse.text();
 const checks={htmlNoStore:html.headers.get('cache-control')?.includes('no-store'),profileButton:profileResponse.ok&&profileBundle.includes('Save Google photo to account'),profileApi:profileBundle.includes('/api/profile/avatar'),frontendEntryMatchesLocal:fs.existsSync('dist'+path)&&fs.readFileSync('dist'+path,'utf8')===entry};
 const rejection=await fetch(origin+'/api/profile/avatar',{method:'POST',headers:{'Content-Type':'application/json'},body:'{"action":"use-google"}'});
 checks.unauthorizedRejected=rejection.status===401;checks.avatarApiNoStore=rejection.headers.get('cache-control')?.includes('no-store');
 // Vercel and local builds have separate environment settings; local-byte equality is informative.
 if(Object.entries(checks).some(([name,value])=>name!=='frontendEntryMatchesLocal'&&!value))throw Error('Profile release verification failed: '+JSON.stringify(checks));
 const result={checkedAt:new Date().toISOString(),applicationCommit,deployment:{state:deployment.state,url:deployment.target_url},origin,frontendEntry:{path,sha256:crypto.createHash('sha256').update(entry).digest('hex')},checks};
 fs.writeFileSync('qa-audit/profile-release-results.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
})().catch(e=>{console.error(e.message);process.exitCode=1;});
