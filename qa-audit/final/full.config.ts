import {defineConfig} from '@playwright/test';import base from './playwright.config';
export default defineConfig({...base,testDir:'..',testMatch:['**/fix-tests/*.spec.ts','**/final/tests/*.spec.ts'],
 testIgnore:['**/.runtime/**','**/node_modules/**','**/site-build/**','**/evidence/**','**/fix-results/**'],
});
