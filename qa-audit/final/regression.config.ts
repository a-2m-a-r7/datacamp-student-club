import { defineConfig } from '@playwright/test';
import base from './playwright.config';
export default defineConfig({
 ...base, testDir:'./tests', testMatch:'**/*.spec.ts',
 outputDir:base.outputDir,
 reporter:base.reporter,
 // This optional mode only attaches to the localhost3100 process started by
 // this audit's running baseline suite; default runs create their own server.
 webServer:process.env.QA_REUSE_OWN_SERVER==='yes'?undefined:base.webServer,
});
