const fs=require('node:fs');
const {chromium}=require('@playwright/test');
const origin=process.argv[2];
if(!origin?.startsWith('https://'))throw Error('Deployment URL required');
(async()=>{
 const browser=await chromium.launch();const results=[];
 for(const width of [1440,768,375]) {
  const context=await browser.newContext({viewport:{width,height:900}});
  await context.addInitScript(()=>localStorage.setItem('datacamp_language','en'));
  const page=await context.newPage();
  for(const route of ['/','/about','/courses','/events','/projects','/blog','/staff','/gallery','/contact','/leaderboard','/login','/profile','/admin/users']) {
   const errors=[];const listener=e=>errors.push(e.message);page.on('pageerror',listener);
   const response=await page.goto(origin+route);await page.locator('main').first().waitFor({state:'visible'});
   if(route==='/leaderboard') await page.getByText('Club member directory is available to administrators only').waitFor();
   if(['/profile','/admin/users'].includes(route))await page.waitForURL('**/login**');
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
   results.push({route,width,status:response.status(),cache:response.headers()['cache-control'],errors,overflow});
   page.off('pageerror',listener);
   if(errors.length||overflow||response.status()!==200)throw Error('Deployment page check failed: '+route+' at '+width);
  }
  await context.close();
 }
 for(const endpoint of ['/api/admin/users','/api/admin/backup','/api/forms/sync-sheet']) {
  const r=await fetch(origin+endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});
  results.push({endpoint,status:r.status});if(r.status!==401)throw Error('Admin API rejection failed');
 }
 await browser.close();fs.writeFileSync('qa-audit/deployed-results.json',JSON.stringify({origin,passed:results.length,results},null,2));console.log(JSON.stringify({origin,passed:results.length}));
})().catch(e=>{console.log(e.message);process.exitCode=1});
