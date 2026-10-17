import fs from 'node:fs';
const dir='qa-audit/.runtime/final-hosted',cfg=JSON.parse(fs.readFileSync(dir+'/gemini-secrets.json','utf8'));
if(cfg.projectId!=='qa-test-datacamp-final')throw Error('Wrong QA project');
const response=await fetch('https://generativelanguage.googleapis.com/v1beta/models',{headers:{'x-goog-api-key':cfg.GEMINI_API_KEY},signal:AbortSignal.timeout(25000)});
const data=await response.json();
const result={checkedAt:new Date().toISOString(),target:cfg.projectId,status:response.status,errorStatus:data.error?.status||null,models:(data.models||[]).filter(m=>m.supportedGenerationMethods?.includes('generateContent')).map(m=>m.name),limits:'Model listing proves API credential access only, not free inference quota or video analysis.'};
fs.writeFileSync('qa-audit/final/evidence/QA_TEST_gemini_models.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
if(!response.ok)process.exitCode=1;
