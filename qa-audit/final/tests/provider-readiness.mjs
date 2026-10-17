import fs from 'node:fs';
import path from 'node:path';
const config=JSON.parse(fs.readFileSync('qa-audit/.runtime/final-hosted/config.json','utf8'));
if(config.projectRef!=='kcqgnkfdpfibwkrghubl'||config.url!=='https://kcqgnkfdpfibwkrghubl.supabase.co')throw Error('Only the disposable hosted QA project is allowed.');
const response=await fetch(config.url+'/auth/v1/settings',{headers:{apikey:config.publishableKey},redirect:'error'});
if(!response.ok)throw Error('QA Auth settings request failed with HTTP '+response.status);
const settings=await response.json();
const report={checkedAt:new Date().toISOString(),target:config.projectRef,httpStatus:response.status,googleEnabled:settings.external?.google===true,emailEnabled:settings.external?.email===true,signupDisabled:settings.disable_signup===true,
 limits:'Configuration readiness only. This is not a successful Google sign-in, Drive upload, Sheets sync or Gemini analysis.'};
const target=path.resolve('qa-audit/final/evidence/QA_TEST_google_auth_readiness.json');
fs.writeFileSync(target,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
if(!report.googleEnabled)process.exitCode=1;
