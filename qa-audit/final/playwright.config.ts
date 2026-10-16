import {defineConfig} from '@playwright/test';
import base from '../fixes.config';
import path from 'node:path';
const run=process.env.QA_FINAL_RUN;
if(!run||!/^[a-zA-Z0-9_-]{1,100}$/.test(run))throw Error('Use final/run-isolated.cjs with a unique --audit-run label.');
export default defineConfig({
 ...base,
 testDir:'../fix-tests',
 outputDir:`./evidence/runs/${run}/artifacts`,
 reporter:[['list'],['json',{outputFile:path.resolve('qa-audit/final/evidence/runs',run,'results.json')}]],
 use:{...base.use,launchOptions:{args:[
  // Browser transport adapters run before DNS. Real network resolves only local
  // services or static runtime/font distributions, never live account APIs.
  '--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE localhost, EXCLUDE 127.0.0.1, EXCLUDE cdn.jsdelivr.net, EXCLUDE fonts.googleapis.com, EXCLUDE fonts.gstatic.com',
 ]}},
});
