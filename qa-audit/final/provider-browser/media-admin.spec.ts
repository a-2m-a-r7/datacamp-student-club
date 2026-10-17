import {test,expect} from '@playwright/test';import fs from 'node:fs';
const cfg=JSON.parse(fs.readFileSync('qa-audit/.runtime/final-hosted/config.json','utf8'));if(cfg.projectRef!=='kcqgnkfdpfibwkrghubl')throw Error('Wrong QA host');
for(const language of ['en','ar'] as const)for(const width of [1440,768,375])test('actual saved media sizes '+language+' '+width,async({page})=>{
 const account=cfg.accounts.find(a=>a.kind==='admin');await page.setViewportSize({width,height:1000});await page.addInitScript(language=>localStorage.setItem('datacamp_language',language),language);
 await page.goto('/login');await page.locator('input[type=email]').fill(account.email);await page.locator('input[type=password]').fill(account.password);await page.locator('form button[type=submit]').click();await expect(page).toHaveURL(/\/dashboard$/);await page.goto('/admin/courses');
 const row=page.getByRole('row').filter({hasText:'QA_TEST_Synthetic_Drive'});await row.getByRole('button',{name:language==='ar'?'إدارة دروس الدورة':'Manage Lessons',exact:true}).click();
 const lesson=page.getByText('QA_TEST_Synthetic_Python',{exact:true}).locator('..').locator('..');await lesson.getByRole('button',{name:language==='ar'?'تعديل الدرس':'Edit lesson',exact:true}).click();
 const material=page.getByText(/QA_TEST_material\.txt ·/);await expect(material).toBeVisible();const captions=page.getByText(/QA_TEST_captions\.srt ·/);await expect(captions).toBeVisible();
 await page.screenshot({path:test.info().outputPath('QA_TEST_real_saved_media_'+language+'.png')});
 expect(await material.innerText()).toContain(new Intl.NumberFormat(language).format(335)+' B');expect(await captions.innerText()).toContain(new Intl.NumberFormat(language).format(243)+' B');
});
