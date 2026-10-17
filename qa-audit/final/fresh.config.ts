import {defineConfig} from '@playwright/test';
import path from 'node:path';
const label=process.env.QA_FINAL_RUN;if(!label||!/^[A-Za-z0-9_-]{1,100}$/.test(label))throw Error('Use the isolated launcher with a new run label.');
export default defineConfig({testDir:'./fresh-tests',workers:1,timeout:60000,expect:{timeout:20000},
 outputDir:`./evidence/runs/${label}/artifacts`,reporter:[['list'],['json',{outputFile:path.resolve('qa-audit/final/evidence/runs',label,'results.json')}]],
 use:{baseURL:'http://127.0.0.1:3300',trace:'off',video:'off',screenshot:'only-on-failure',launchOptions:{args:['--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1, EXCLUDE localhost, EXCLUDE kcqgnkfdpfibwkrghubl.supabase.co, EXCLUDE cdn.jsdelivr.net, EXCLUDE fonts.googleapis.com, EXCLUDE fonts.gstatic.com']}},
 projects:[1440,768,375].map(width=>({name:String(width),use:{viewport:{width,height:900}}})),
});
