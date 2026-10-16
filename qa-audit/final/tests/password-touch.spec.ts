import {test,expect} from '@playwright/test';
import {platform,member} from '../../fix-tests/persisted-platform';
for(const language of ['en','ar'] as const)for(const route of ['/login','/register','/reset-password'])test(`password reveal has a usable touch area and keyboard toggle ${route} ${language}`,async({page},info)=>{
 const app=await platform();try{
  await app.connect(page,route==='/reset-password'?member:null,language);await page.goto(route);
  const field=page.locator('form input[type=password]').first();await expect(field).toBeVisible();
  const toggle=page.getByRole('button',{name:/^(Show password|إظهار كلمة المرور)$/});await expect(toggle).toBeVisible();
  // Route transitions briefly scale the card. Wait for its real hit area,
  // allowing browser subpixel rounding rather than asserting 39.999 === 40.
  await expect.poll(async()=>{const box=await toggle.boundingBox();return Math.round(Math.min(box?.width||0,box?.height||0));}).toBeGreaterThanOrEqual(40);
  await field.fill('QA_TEST_Str0ng!_عربي');await toggle.focus();await toggle.press('Space');
  const hide=page.getByRole('button',{name:language==='ar'?'إخفاء كلمة المرور':'Hide password',exact:true});await expect(hide).toBeVisible();
  const shown=page.locator('form input[type=text]');
  expect(await shown.evaluateAll(inputs=>inputs.some((input:HTMLInputElement)=>input.value==='QA_TEST_Str0ng!_عربي'))).toBe(true);
  await hide.press('Enter');await expect(page.locator('form input[type=password]').first()).toHaveValue('QA_TEST_Str0ng!_عربي');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  if(route==='/login')await page.screenshot({path:info.outputPath('password-touch-'+language+'.png')});
 }finally{await app.db.close();}
});
