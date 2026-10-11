import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 45000,
  fullyParallel: false,
  workers: 1,
  reporter: [
    ['list'],
    ['json', { outputFile: './test-results.json' }],
  ],
  use: {
    baseURL: process.env.TEST_BASE_URL || 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'Desktop (1440x900)',
      use: {
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: 'Tablet (768x1024)',
      use: {
        viewport: { width: 768, height: 1024 },
      },
    },
    {
      name: 'Mobile (375x667)',
      use: {
        viewport: { width: 375, height: 667 },
      },
    },
  ],
  webServer: process.env.TEST_BASE_URL ? undefined : {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 60000,
  },
});
