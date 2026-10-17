import {test,expect} from '@playwright/test';import fs from 'node:fs';import {createClient} from '@supabase/supabase-js';
const cfg=JSON.parse(fs.readFileSync('qa-audit/.runtime/final-hosted/config.json','utf8'));
if(cfg.url!=='https://kcqgnkfdpfibwkrghubl.supabase.co')throw Error('Unexpected QA target');
const account=cfg.accounts.find(a=>a.kind==='member');
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jqz8AAAAASUVORK5CYII=','base64');
for(const locale of ['en','ar'])test('actual Auth and profile persistence '+locale,async({page,context})=>{
 // Never enable traces/HAR/storageState: these sessions contain real QA tokens.
 await context.route('**/*',route=>{const u=new URL(route.request().url());return ['127.0.0.1','localhost','kcqgnkfdpfibwkrghubl.supabase.co','cdn.jsdelivr.net','fonts.googleapis.com','fonts.gstatic.com'].includes(u.hostname)?route.continue():route.abort();});
 await page.addInitScript(l=>localStorage.setItem('datacamp_language',l),locale);
 await page.goto('/profile');await expect(page).toHaveURL(/\/login$/);
 await page.locator('input[type=email]').fill(account.email);await page.locator('input[type=password]').fill(account.password);
 await page.locator('form button[type=submit]').click();await expect(page).toHaveURL(/\/profile$/);
 const isAr=locale==='ar';
 const fullName=page.getByLabel('Full name',{exact:true});
 await expect(fullName).toBeVisible();
 const name='QA_TEST_متعلم_'+locale+'_'+test.info().project.name;await fullName.fill(name);
 await page.getByLabel('Phone number',{exact:true}).fill('');
 const chooser=page.waitForEvent('filechooser');await page.getByRole('button',{name:'IMPORT_FROM_DEVICE',exact:true}).click();
 await(await chooser).setFiles({name:'QA_TEST_browser.png',mimeType:'image/png',buffer:png});
 await page.getByRole('button',{name:isAr?'حفظ التعديلات':'SAVE_CHANGES',exact:true}).click();
 await expect(page.getByText(isAr?'تم حفظ التعديلات بنجاح في قاعدة البيانات':'Profile updated successfully in database',{exact:true})).toBeVisible();
 await page.reload();await expect(fullName).toHaveValue(name);
 const verifier=createClient(cfg.url,cfg.publishableKey,{auth:{persistSession:false,autoRefreshToken:false}});
 try{
  const signed=await verifier.auth.signInWithPassword({email:account.email,password:account.password});expect(signed.error).toBeNull();
  const row=await verifier.from('profiles').select('full_name,avatar_url,photo_url').eq('id',account.id).single();expect(row.error).toBeNull();expect(row.data!.full_name).toBe(name);expect(row.data!.avatar_url).toBe(row.data!.photo_url);
  const url=new URL(row.data!.avatar_url);expect(url.hostname).toBe('kcqgnkfdpfibwkrghubl.supabase.co');expect(url.pathname).toContain('/avatars/'+account.id+'/');
  const bytes=await fetch(url);expect(bytes.status).toBe(200);expect(Buffer.from(await bytes.arrayBuffer())).toEqual(png);
 }finally{await verifier.auth.signOut({scope:'local'});await verifier.removeAllChannels();}
 const isolatedTab=await context.newPage();await isolatedTab.goto('/profile');await expect(isolatedTab).toHaveURL(/\/login$/);await isolatedTab.close();
 await page.goto('/admin/users');await expect(page).toHaveURL(/\/dashboard$/);
});
