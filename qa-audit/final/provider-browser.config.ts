import {defineConfig} from '@playwright/test';import path from 'node:path';
const run=process.env.QA_HOSTED_RUN;if(!run||!/^[\w-]+$/.test(run))throw Error('Unique QA_HOSTED_RUN required');
export default defineConfig({testDir:'./provider-browser',workers:1,timeout:180000,expect:{timeout:45000},outputDir:`./evidence/runs/${run}/artifacts`,reporter:[['list'],['json',{outputFile:path.resolve('qa-audit/final/evidence/runs',run,'results.json')}]],
 use:{baseURL:'http://127.0.0.1:3200',viewport:{width:1440,height:1000},trace:'off',video:'off',screenshot:'only-on-failure',launchOptions:{args:['--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1, EXCLUDE localhost, EXCLUDE kcqgnkfdpfibwkrghubl.supabase.co, EXCLUDE cdn.jsdelivr.net, EXCLUDE fonts.googleapis.com, EXCLUDE fonts.gstatic.com']}},
});
