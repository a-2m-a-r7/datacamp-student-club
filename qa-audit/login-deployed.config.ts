import { defineConfig } from '@playwright/test';
import path from 'node:path';
if (!process.env.QA_SUPABASE_URL) throw new Error('Supabase fixture origin is required for deployed login tests.');
export default defineConfig({
 testDir:'./fix-tests', testMatch:'login-final.spec.ts', workers:1, timeout:60000,
 expect:{timeout:20000}, outputDir:'./fix-results',
 reporter:[['list'],['json',{outputFile:path.resolve(process.cwd(),'qa-audit/login-deployed-results.json')}]],
 use:{baseURL:'https://datacamp-student-club.vercel.app',screenshot:'only-on-failure',trace:'retain-on-failure'},
 projects:[1440,768,375].map(width=>({name:String(width),use:{viewport:{width,height:900}}})),
});
