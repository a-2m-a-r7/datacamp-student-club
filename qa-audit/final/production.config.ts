import {defineConfig} from '@playwright/test';
import path from 'node:path';
const label=process.env.QA_FINAL_RUN;
if(!label||!/^[A-Za-z0-9_-]{1,100}$/.test(label))throw Error('Unique QA_FINAL_RUN required');
export default defineConfig({testDir:'./production-tests',workers:1,timeout:90000,expect:{timeout:20000},
 outputDir:`./evidence/runs/${label}/artifacts`,reporter:[['list'],['json',{outputFile:path.resolve('qa-audit/final/evidence/runs',label,'results.json')}]],
 use:{baseURL:'http://127.0.0.1:3301',viewport:{width:1440,height:900},trace:'off',video:'off',screenshot:'only-on-failure',launchOptions:{args:['--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1, EXCLUDE localhost, EXCLUDE kcqgnkfdpfibwkrghubl.supabase.co, EXCLUDE cdn.jsdelivr.net, EXCLUDE fonts.googleapis.com, EXCLUDE fonts.gstatic.com']}},
});
