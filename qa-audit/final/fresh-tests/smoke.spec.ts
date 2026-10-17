import {test,expect} from '@playwright/test';
for(const locale of ['en','ar'])test('fresh lockfile install serves routes and real QA catalog '+locale,async({page,context},info)=>{
 await context.route('**/*',route=>{const url=new URL(route.request().url());return ['127.0.0.1','localhost','kcqgnkfdpfibwkrghubl.supabase.co','cdn.jsdelivr.net','fonts.googleapis.com','fonts.gstatic.com'].includes(url.hostname)?route.continue():route.abort();});
 await page.addInitScript(locale=>localStorage.setItem('datacamp_language',locale),locale);
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.name+': '+error.message));
 await page.goto('/login');await expect(page.locator('form input[type=email]')).toBeVisible();await expect(page.locator('form input[type=password]')).toBeVisible();
 await expect(page.getByRole('heading',{name:locale==='ar'?'تسجيل الدخول':'ESTABLISH_CONNECTION',exact:true})).toBeVisible();
 const catalog=page.waitForResponse(response=>response.url()==='https://kcqgnkfdpfibwkrghubl.supabase.co/rest/v1/rpc/list_course_catalog'&&response.request().method()==='POST');
 await page.goto('/courses');expect((await catalog).status()).toBe(200);
 await expect(page.getByRole('heading',{name:locale==='ar'?'احترف علم البيانات والذكاء الاصطناعي':'MASTER DATA SCIENCE & AI',exact:true})).toBeVisible();
 await expect(page.getByRole('alert')).toHaveCount(0);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
 await page.goto('/profile');await expect(page).toHaveURL(/\/login$/);await expect(page.locator('form input[type=email]')).toBeVisible();expect(errors).toEqual([]);
 await page.screenshot({path:info.outputPath('fresh-login-'+locale+'.png')});
});
