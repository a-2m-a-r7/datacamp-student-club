import {test,expect,Page,Locator} from '@playwright/test';
import {randomUUID} from 'node:crypto';
import {platform,admin,member} from '../../fix-tests/persisted-platform';

let app:Awaited<ReturnType<typeof platform>>;
test.afterEach(async()=>{await app?.db.close();});
async function seed() {
 app=await platform();const course=randomUUID(),lesson=randomUUID();
 await app.db.query(`INSERT INTO courses(id,title,slug,description,short_description,category,level,instructor_name,duration_hours,tags,is_published)
 VALUES($1,'QA_TEST Python للبيانات: من البداية إلى تطبيق مشروع عملي كامل','qa-test-course-layout','QA_TEST Learn through lessons and practice. تعلم وطبق خطوة بخطوة.','QA_TEST Learn through lessons and practice. تعلم وطبق خطوة بخطوة.','data_science','beginner','QA_TEST مدرب الكورس باسم طويل لاختبار العرض',4,ARRAY['Python','تحليل البيانات'],true)`,[course]);
 await app.db.query("INSERT INTO lessons(id,course_id,title,type,position) VALUES($1,$2,'QA_TEST_LESSON','article',1)",[lesson,course]);
 return {course,lesson};
}
async function editor(page:Page,language:'ar'|'en') {
 const ids=await seed();await app.connect(page,admin,language);
 await page.route('**/api/courses/drive',route=>route.fulfill({json:{configured:true,connected:true}}));
 await page.route('**/api/courses/analyze',route=>route.fulfill({json:{status:'none'}}));
 await page.goto('/admin/courses');
 await page.getByRole('button',{name:language==='ar'?'إدارة دروس الدورة':'Manage Lessons',exact:true}).click();
 await page.getByRole('button',{name:language==='ar'?'تعديل الدرس':'Edit lesson',exact:true}).click();
 await page.getByRole('checkbox',{name:language==='ar'?'تحليل الفيديو تلقائيًا بعد الرفع وإرسال نسخة إلى Gemini':'Analyze automatically after upload; send a copy to Gemini',exact:true}).uncheck();
 return ids;
}
async function drop(page:Page,zone:Locator,files:{name:string;type:string;bytes:number[]}[]) {
 const data=await page.evaluateHandle(files=>{const transfer=new DataTransfer();for(const file of files)transfer.items.add(new File([new Uint8Array(file.bytes)],file.name,{type:file.type}));return transfer;},files);
 await zone.dispatchEvent('dragenter',{dataTransfer:data});await zone.dispatchEvent('dragover',{dataTransfer:data});await zone.dispatchEvent('drop',{dataTransfer:data});await data.dispose();
}
const video={name:'QA_TEST_video.mp4',mimeType:'video/mp4',buffer:Buffer.from([0,0,0,24,102,116,121,112,105,115,111,109])};

for(const language of ['en','ar'] as const) {
 test(`course file zones select with mouse, keyboard and drop, then persist three assets (${language})`,async({page},info)=>{
  const {course,lesson}=await editor(page,language);const starts:any[]=[],received:Buffer[]=[];let active:any,assetCount=0;
  await page.route('**/api/courses/media',async route=>{
   const body=route.request().postDataJSON();if(body.action==='start'){
    active={...body,id:randomUUID()};starts.push(active);return route.fulfill({json:{jobId:active.id,accessToken:'QA_TEST_TOKEN',uploadUrl:'https://www.googleapis.com/upload/drive/v3/files?upload_id=QA_TEST_DROP'}});
   }
   expect(body.action).toBe('finish');expect(body.jobId).toBe(active.id);
   const file='QA_TEST_FILE_'+(++assetCount);
   await app.db.query(`INSERT INTO course_assets(id,course_id,lesson_id,owner_id,kind,provider,name,mime_type,size_bytes,file_id,url,language) VALUES($1,$2,$3,$4,$5,'drive',$6,$7,$8,$9,$10,$11)`,[active.id,course,lesson,admin,active.kind,active.name,active.mimeType,active.size,file,'https://drive.google.com/file/d/'+file+'/view',body.language]);
   if(active.kind==='video')await app.db.query('UPDATE lessons SET video_asset_id=$1 WHERE id=$2',[active.id,lesson]);
   return route.fulfill({json:{success:true,assetId:active.id}});
  });
  await page.route('https://www.googleapis.com/upload/drive/v3/files?upload_id=QA_TEST_DROP',route=>{
   const range=route.request().headers()['content-range'];if(range.startsWith('bytes */'))return route.fulfill({status:308});
   received.push(route.request().postDataBuffer()!);return route.fulfill({json:{id:'QA_TEST_PROVIDER_FILE'}});
  });
  const choose=page.getByRole('button',{name:language==='ar'?'اختيار فيديو الدرس':'Choose lesson video',exact:true});
  const picker=page.waitForEvent('filechooser');await choose.click();await (await picker).setFiles(video);
  await expect.poll(async()=>Number((await app.db.query<any>('SELECT count(*) n FROM course_assets WHERE lesson_id=$1',[lesson])).rows[0].n)).toBe(1);
  await expect(choose).toBeEnabled();
  const material=page.getByRole('button',{name:language==='ar'?'اختيار ملفات الماتريال':'Choose lesson material',exact:true});
  const keyboardPicker=page.waitForEvent('filechooser');await material.focus();await material.press('Enter');await (await keyboardPicker).setFiles({name:'QA_TEST_material.pdf',mimeType:'application/pdf',buffer:Buffer.from('%PDF-1.7 QA_TEST')});
  await expect.poll(async()=>Number((await app.db.query<any>('SELECT count(*) n FROM course_assets WHERE lesson_id=$1',[lesson])).rows[0].n)).toBe(2);
  const subtitle=page.getByRole('button',{name:language==='ar'?'اختيار ملف الترجمة':'Choose lesson subtitles',exact:true});
  await expect(subtitle).toBeEnabled();await drop(page,subtitle,[{name:'QA_TEST_subtitles.srt',type:'text/plain',bytes:Array.from(Buffer.from('1\n00:00:01,000 --> 00:00:02,000\nQA_TEST مرحبا\n'))}]);
  await expect.poll(async()=>Number((await app.db.query<any>('SELECT count(*) n FROM course_assets WHERE lesson_id=$1',[lesson])).rows[0].n)).toBe(3);
  const rows=(await app.db.query<any>('SELECT kind,name,size_bytes,language FROM course_assets WHERE lesson_id=$1 ORDER BY kind',[lesson])).rows;
  expect(rows.map(row=>row.kind)).toEqual(['material','subtitle','video']);expect(starts).toHaveLength(3);expect(received).toHaveLength(3);
  for(let i=0;i<3;i++){expect(received[i].length).toBe(starts[i].size);expect(starts[i].sha256).toMatch(/^[a-f0-9]{64}$/);}
  await expect.poll(async()=>(await app.db.query<any>('SELECT video_asset_id FROM lessons WHERE id=$1',[lesson])).rows[0].video_asset_id).toBe(starts[0].id);
  await expect(page.getByRole('link',{name:language==='ar'?'فتح الملف':'Open file',exact:true})).toHaveCount(3);
  await expect(page.getByText(language==='ar'?'الملف محفوظ ومربوط بالدرس.':'File saved and linked to the lesson.',{exact:true})).toHaveCount(0);
  await choose.scrollIntoViewIfNeeded();await page.screenshot({path:info.outputPath(`upload-zone-${language}.png`)});await choose.screenshot({path:info.outputPath(`video-dropzone-${language}.png`)});
  await page.reload();await page.getByRole('button',{name:language==='ar'?'إدارة دروس الدورة':'Manage Lessons',exact:true}).click();await page.getByRole('button',{name:language==='ar'?'تعديل الدرس':'Edit lesson',exact:true}).click();
  await expect(page.getByRole('link',{name:language==='ar'?'فتح الملف':'Open file',exact:true})).toHaveCount(3);
 });

 test(`course drop rejects invalid selection, blocks another upload while busy and pauses (${language})`,async({page},info)=>{
  await editor(page,language);let starts=0,release!:()=>void;const pending=new Promise<void>(resolve=>{release=resolve;});
  const zone=page.getByRole('button',{name:language==='ar'?'اختيار فيديو الدرس':'Choose lesson video',exact:true});
  await page.route('**/api/courses/media',route=>{starts++;return route.fulfill({json:{jobId:randomUUID(),accessToken:'QA_TEST_TOKEN',uploadUrl:'https://www.googleapis.com/upload/drive/v3/files?upload_id=QA_TEST_PAUSE'}});});
  await page.route('https://www.googleapis.com/upload/drive/v3/files?upload_id=QA_TEST_PAUSE',async route=>{
   if(route.request().headers()['content-range'].startsWith('bytes */'))return route.fulfill({status:308});
   await pending;await route.fulfill({json:{id:'QA_TEST_PROVIDER_FILE'}}).catch(()=>{});
  });
  const alert=page.getByRole('alert');
  await drop(page,zone,[{name:'QA_TEST_empty.mp4',type:'video/mp4',bytes:[]}]);await expect(alert).toContainText(language==='ar'?'غير فارغ':'nonempty');
  await drop(page,zone,[{name:'QA_TEST_wrong.pdf',type:'application/pdf',bytes:[1]}]);await expect(alert).toContainText('MP4');
  await drop(page,zone,[{name:'QA_TEST_1.mp4',type:'video/mp4',bytes:[1]},{name:'QA_TEST_2.mp4',type:'video/mp4',bytes:[2]}]);await expect(alert).toContainText(language==='ar'?'ملفًا واحدًا':'one file');expect(starts).toBe(0);
  const transfer=await page.evaluateHandle(()=>{const dt=new DataTransfer();const file=new File(['QA_TEST'],'QA_TEST_oversize.mp4',{type:'video/mp4'});Object.defineProperty(file,'size',{value:2147483649});dt.items.add(file);return dt;});
  await zone.dispatchEvent('drop',{dataTransfer:transfer});await transfer.dispose();await expect(alert).toContainText(language==='ar'?'2 جيجا':'2 GiB');expect(starts).toBe(0);
  // This probes declared-size validation; no 2 GiB transfer is claimed.
  await drop(page,zone,[{name:video.name,type:video.mimeType,bytes:Array.from(video.buffer)}]);
  await expect(zone).toBeDisabled();await expect(page.getByLabel('Course upload progress',{exact:true})).toBeVisible();
  await drop(page,zone,[{name:'QA_TEST_SECOND.mp4',type:'video/mp4',bytes:[1]}]);expect(starts).toBe(1);
  await page.getByRole('button',{name:language==='ar'?'إيقاف مؤقت':'Pause',exact:true}).click();release();
  await expect(alert).toContainText(language==='ar'?'توقف الرفع':'Paused');await expect(zone).toBeEnabled();expect(starts).toBe(1);
  await page.screenshot({path:info.outputPath(`upload-paused-${language}.png`)});
 });

 test(`organized course cards retain filtering, enrollment and saved progress (${language})`,async({page},info)=>{
  const {course}=await seed();await app.connect(page,member,language);await page.goto('/courses');
  const card=page.getByRole('article').filter({hasText:'QA_TEST Python'});await expect(card).toHaveCount(1);
  await page.getByRole('button',{name:language==='ar'?'علم البيانات':'DATA SCIENCE',exact:true}).click();await expect(card).toBeVisible();
  await page.getByRole('button',{name:language==='ar'?'متقدم':'ADVANCED',exact:true}).click();await expect(card).toHaveCount(0);
  await page.getByRole('button',{name:language==='ar'?'إعادة ضبط الفلاتر':'RESET_FILTERS',exact:true}).click();await expect(card).toHaveCount(1);
  const search=page.getByRole('textbox',{name:language==='ar'?'البحث في الكورسات':'Search courses',exact:true});await search.fill('QA_TEST_NO_MATCH');await expect(card).toHaveCount(0);await search.fill('Python');await expect(card).toHaveCount(1);
  await card.scrollIntoViewIfNeeded();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);await page.screenshot({path:info.outputPath(`course-catalog-${language}.png`),fullPage:true});
  await card.getByRole('button',{name:language==='ar'?'سجل الآن ⚡':'ENROLL NOW ⚡',exact:true}).click();
  await expect.poll(async()=>Number((await app.db.query<any>('SELECT count(*) n FROM enrollments WHERE user_id=$1 AND course_id=$2',[member,course])).rows[0].n)).toBe(1);
  await expect(card.getByRole('progressbar')).toHaveAttribute('value','0');expect(app.calls.some(call=>call.table==='enroll_course'&&call.method==='POST')).toBe(true);
  await page.goto('/my-courses');const enrolled=page.getByRole('article').filter({hasText:'QA_TEST Python'});await expect(enrolled.getByRole('progressbar')).toHaveAttribute('value','0');
  await expect(page.getByLabel(language==='ar'?'ملخص التعلم':'Learning summary')).toContainText('1');
  const mySearch=page.getByRole('textbox',{name:language==='ar'?'البحث داخل كورساتك':'Search your courses',exact:true});await mySearch.fill('QA_TEST_NO_MATCH');await expect(enrolled).toHaveCount(0);await mySearch.clear();await expect(enrolled).toHaveCount(1);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);await page.screenshot({path:info.outputPath(`my-courses-${language}.png`),fullPage:true});
  await enrolled.getByRole('link',{name:language==='ar'?'متابعة':'CONTINUE',exact:true}).click();await expect(page).toHaveURL(/\/courses\/qa-test-course-layout\/learn$/);await expect(page.getByRole('heading',{name:'QA_TEST_LESSON',exact:true})).toBeVisible();
 });
}
