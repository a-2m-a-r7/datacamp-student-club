// Public production reads only; never persists identities or message contents.
const fs = require('node:fs');
const { chromium, expect } = require('@playwright/test');
const origin = process.argv[2];
if (!origin?.startsWith('https://')) throw Error('Deployment URL required');
let browser;
(async () => {
 browser = await chromium.launch();
 const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
 await context.addInitScript(() => localStorage.setItem('datacamp_language', 'en'));
 const page = await context.newPage(), results = [];
 for (const table of ['gallery', 'blog', 'projects']) {
  const data = page.waitForResponse(r => new URL(r.url()).pathname === '/rest/v1/' + table);
  await page.goto(origin + '/' + table, { waitUntil: 'domcontentloaded' });
  if (!(await data).ok()) throw Error('Public content read failed: ' + table);
  await expect(page.getByRole('heading', { name: /READY/ }).first()).toBeVisible();
  await expect(page.locator('main').getByText(/Archived installation example|Archived samples/)).toHaveCount(0);
  await expect(page.locator('img[src*="picsum.photos"]')).toHaveCount(0);
  await expect(page.getByRole('alert')).toHaveCount(0);
  results.push({ route: '/' + table, archivedSamplesHidden: true, randomImagesAbsent: true });
  if (table === 'gallery') await page.screenshot({ path: 'qa-audit/final-public-gallery.png', fullPage: true });
 }
 await page.goto(origin + '/contact', { waitUntil: 'domcontentloaded' });
 await expect(page.getByText('Not configured', { exact: true }).first()).toBeVisible();
 if (/contact@datacamp\.club|\+20 123 456 7890/.test(await page.locator('body').textContent())) throw Error('Seed contact placeholder exposed');
 results.push({ route: '/contact', seedContactPlaceholdersAbsent: true });
 await browser.close();
 fs.writeFileSync('qa-audit/deployed-content-results.json', JSON.stringify({ checkedAt: new Date().toISOString(), origin, mode: 'Public production reads; no intercepted requests or mutations', passed: results.length, results }, null, 2));
 console.log(JSON.stringify({ passed: results.length, noProductionWrites: true }));
})().catch(async e => { if (browser) await browser.close(); console.error(e.message); process.exitCode = 1; });
