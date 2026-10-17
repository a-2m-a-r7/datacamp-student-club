import {test,expect} from '@playwright/test';import {randomUUID} from 'node:crypto';import {platform,admin} from '../../fix-tests/persisted-platform';
let p:Awaited<ReturnType<typeof platform>>;test.afterEach(async()=>{await p?.db.close();});
for(const language of ['en','ar'] as const)test('footer stays after long settings and gallery actions '+language,async({page})=>{
 p=await platform();await p.connect(page,admin,language);await page.goto('/admin/settings');const save=page.getByRole('button',{name:'Commit Changes',exact:true});await expect(save).toBeVisible();await save.scrollIntoViewIfNeeded();
 const settings=await save.evaluate(button=>({buttonBottom:button.getBoundingClientRect().bottom,footerTop:document.querySelector('footer')!.getBoundingClientRect().top}));expect(settings.footerTop,'footer must follow the save action').toBeGreaterThanOrEqual(settings.buttonBottom-1);
 await save.click();await expect(page.getByText('System settings saved to Supabase',{exact:true})).toBeVisible();
 const ids=Array.from({length:8},()=>randomUUID());for(const[id,index]of ids.map((id,i)=>[id,i]as const))await p.db.query("INSERT INTO gallery(id,title,url,category) VALUES($1,$2,$3,'Workshops')",[id,'QA_TEST_FLOW_'+index,'https://qa-test.supabase.co/storage/v1/object/public/uploads/gallery/QA_TEST_'+index+'.png']);
 await page.goto('/admin/gallery');const remove=page.getByRole('button',{name:'Delete',exact:true}).last();await expect(remove).toBeAttached();await remove.scrollIntoViewIfNeeded();
 const gallery=await remove.evaluate(button=>({buttonBottom:button.getBoundingClientRect().bottom,footerTop:document.querySelector('footer')!.getBoundingClientRect().top}));expect(gallery.footerTop,'footer must follow the last gallery action').toBeGreaterThanOrEqual(gallery.buttonBottom-1);
 await remove.click();await page.getByRole('button',{name:'CONFIRM_PURGE',exact:true}).click();await expect.poll(async()=>Number((await p.db.query<any>('SELECT count(*) n FROM gallery')).rows[0].n)).toBe(7);
 await page.screenshot({path:test.info().outputPath('QA_TEST_long_flow_'+language+'.png')});
});
