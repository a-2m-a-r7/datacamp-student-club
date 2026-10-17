import fs from 'node:fs';
const file=process.argv[2];if(!file?.startsWith('qa-audit/final/evidence/runs/'))throw Error('Use saved QA report only');const lhr=JSON.parse(fs.readFileSync(file,'utf8'));
for(const id of ['cumulative-layout-shift','layout-shifts','cls-culprits-insight','heading-order','target-size','robots-txt']){const a=lhr.audits[id];if(a&&a.score!==1)console.log(JSON.stringify({id,score:a.score,numericValue:a.numericValue,items:a.details?.items}));}
