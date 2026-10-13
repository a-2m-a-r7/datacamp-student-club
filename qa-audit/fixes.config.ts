import { defineConfig } from '@playwright/test';
import path from 'node:path';
export default defineConfig({
  testDir: './fix-tests', timeout: 60000, workers: 1, expect: { timeout: 20000 },
  outputDir: './fix-results',
  reporter: [['list'], ['json', { outputFile: path.resolve(process.cwd(), process.env.QA_RESULTS_FILE || 'qa-audit/fix-results.json') }]],
  use: { baseURL: 'http://127.0.0.1:3100', screenshot: 'only-on-failure', trace: 'retain-on-failure' },
  projects: [1440, 768, 375].map(width => ({ name: String(width), use: { viewport: { width, height: 900 } } })),
  webServer: { command: 'node qa-audit/start-local.cjs', cwd: process.cwd(), url: 'http://127.0.0.1:3100', reuseExistingServer: false, timeout: 60000 },
});
