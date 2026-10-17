import fs from 'node:fs';import path from 'node:path';import {createRequire} from 'node:module';import {pathToFileURL} from 'node:url';import {chromium} from '@playwright/test';
const require=createRequire(import.meta.url),tool=path.resolve('qa-audit/.runtime/QA_TEST_lighthouse_1350');
const lighthouse=(await import(pathToFileURL(require.resolve('lighthouse',{paths:[tool]})))).default;
const launcher=await import(pathToFileURL(require.resolve('chrome-launcher',{paths:[tool]})));
const label=process.argv[2];if(!label||!/^[A-Za-z0-9_-]{1,100}$/.test(label))throw Error('A unique QA_TEST run label is required.');
const origin=process.argv[3]||'http://127.0.0.1:3200';if(!['http://127.0.0.1:3200','http://127.0.0.1:3300','http://127.0.0.1:3301'].includes(origin))throw Error('Only audit-owned loopback servers are allowed.');
const output=path.resolve('qa-audit/final/evidence/runs',label);if(fs.existsSync(output))throw Error('Run already exists; evidence must not be replaced.');fs.mkdirSync(output,{recursive:true});
const scores=[];
const routes=process.argv[4]==='home'?['/']:['/login','/courses','/'];
for(const route of routes){
 const name=route==='/'?'home':route.slice(1),chrome=await launcher.launch({chromePath:chromium.executablePath(),chromeFlags:['--headless','--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1, EXCLUDE localhost, EXCLUDE kcqgnkfdpfibwkrghubl.supabase.co, EXCLUDE cdn.jsdelivr.net, EXCLUDE fonts.googleapis.com, EXCLUDE fonts.gstatic.com']});
 try{
  const result=await lighthouse(origin+route,{port:chrome.port,logLevel:'warn',output:['json','html'],onlyCategories:['performance','accessibility','best-practices','seo'],enableErrorReporting:false});
  fs.writeFileSync(path.join(output,name+'.json'),result.report[0]);fs.writeFileSync(path.join(output,name+'.html'),result.report[1]);
  const failing=Object.values(result.lhr.audits).filter(a=>a.score!==null&&a.score<1&&a.scoreDisplayMode!=='informative').map(a=>({id:a.id,title:a.title,score:a.score}));
  scores.push({route,fetchTime:result.lhr.fetchTime,version:result.lhr.lighthouseVersion,formFactor:result.lhr.configSettings.formFactor,categories:Object.fromEntries(Object.entries(result.lhr.categories).map(([name,value])=>[name,Math.round(value.score*100)])),warnings:result.lhr.runWarnings,runtimeError:result.lhr.runtimeError||null,failing});
  console.log(JSON.stringify(scores.at(-1)));
 }finally{await chrome.kill();}
}
fs.writeFileSync(path.join(output,'summary.json'),JSON.stringify({target:origin+' with exact Supabase QA host; anonymous sessions',limitations:'One mobile simulated-throttling sample per route. Local static transport does not reproduce Vercel compression/CDN behavior. These scores are not production capacity or a 1000-user load test.',scores},null,2)+'\n');
