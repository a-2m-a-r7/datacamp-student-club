import {test,expect} from '@playwright/test';
for(const width of [1440,768,375])for(const language of ['en','ar'])test('loading route reserves footer space '+language+' '+width,async({page,context})=>{
 await page.setViewportSize({width,height:900});await page.addInitScript(l=>localStorage.setItem('datacamp_language',l),language);
 await context.route('**/*',r=>{const u=new URL(r.request().url());return ['127.0.0.1','localhost','kcqgnkfdpfibwkrghubl.supabase.co','fonts.googleapis.com','fonts.gstatic.com'].includes(u.hostname)?r.continue():r.abort();});
 let release!:()=>void;const held=new Promise<void>(resolve=>release=resolve);
 await page.route('**/assets/Home-*.js',async route=>{await held;await route.continue();});
 try{
  await page.goto('/',{waitUntil:'domcontentloaded'});await expect(page.getByText('SYNCING_NEURAL_INTERFACE...',{exact:true})).toBeVisible();
  const footer=await page.getByRole('contentinfo').boundingBox();expect(footer).not.toBeNull();expect(footer!.y).toBeGreaterThanOrEqual(899);
  await page.screenshot({path:test.info().outputPath('QA_TEST_loading_'+language+'_'+width+'.png')});
 }finally{release();}
 await expect(page.getByText('SYNCING_NEURAL_INTERFACE...',{exact:true})).toHaveCount(0);await expect(page.getByRole('main')).toBeVisible();
});
