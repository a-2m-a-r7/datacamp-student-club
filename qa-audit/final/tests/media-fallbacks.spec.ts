import {test,expect} from '@playwright/test';
import {randomUUID} from 'node:crypto';
import {platform,admin} from '../../fix-tests/persisted-platform';
test('optional course covers and account photos handle absent and failed media',async({page},info)=>{
 const app=await platform();try{
  const course=randomUUID(),lesson=randomUUID();
  await app.db.query("INSERT INTO courses(id,title,slug,thumbnail_url,is_published) VALUES($1,'QA_TEST_MEDIA_BAD','qa-test-media-bad','http://127.0.0.1:3100/QA_TEST_broken.png',false)",[course]);
  await app.db.query("INSERT INTO lessons(id,course_id,title,type) VALUES($1,$2,'QA_TEST_MEDIA_LESSON','article')",[lesson,course]);
  await app.db.query('UPDATE courses SET is_published=true WHERE id=$1',[course]);
  await app.asUser(admin,tx=>tx.query('SELECT enroll_course($1)',[course]));
  await app.db.query('UPDATE profiles SET photo_url=$2,avatar_url=$2 WHERE id=$1',[admin,`https://qa-test.supabase.co/storage/v1/object/public/avatars/${admin}/QA_TEST_missing.png`]);
  await app.connect(page,admin);await page.route('**/QA_TEST_broken.png',r=>r.fulfill({status:404,body:''}));
  const observations:any[]=[];
  for(const route of ['/courses','/my-courses','/courses/qa-test-media-bad','/admin/courses','/admin/users']){
   await page.goto(route);if(route==='/admin/users'){
    const search=page.getByPlaceholder('Search by name, ID, or email...');await expect(search).toBeVisible();await search.fill('QA_TEST_ADMIN');
    await page.getByRole('button',{name:'View Intel',exact:true}).first().click();await expect(page.getByRole('button',{name:'CLOSE',exact:true})).toBeVisible();
   }else await expect(page.getByText('QA_TEST_MEDIA_BAD',{exact:true}).first()).toBeVisible();
   await page.locator('img').evaluateAll(async images=>Promise.all(images.map(image=>new Promise<void>(resolve=>{const img=image as HTMLImageElement;if(img.complete)resolve();else{img.addEventListener('load',()=>resolve(),{once:true});img.addEventListener('error',()=>resolve(),{once:true});}}))));
   const broken=await page.locator('img').evaluateAll(images=>images.filter(image=>(image as HTMLImageElement).complete&&(image as HTMLImageElement).naturalWidth===0&&(image as HTMLElement).offsetWidth>0).map(image=>({src:image.getAttribute('src'),alt:image.getAttribute('alt')})));
   observations.push({route,broken});if(broken.length)await page.screenshot({path:info.outputPath('QA_TEST_'+route.replace(/\W/g,'_')+'.png')});
   expect.soft(broken,route).toEqual([]);
  }
  await info.attach('media-observations',{body:JSON.stringify(observations),contentType:'application/json'});
 }finally{await app.db.close();}
});
