// Production UI, isolated QA network fixtures: no production Auth or database writes.
const fs=require('node:fs');const {chromium}=require('@playwright/test');const jsQR=require('jsqr');
const origin=process.argv[2],base=process.env.VITE_SUPABASE_URL;
if(!origin?.startsWith('https://')||!base)throw Error('Deployment and Supabase origin required');
let browser;
(async()=>{
 browser=await chromium.launch();const context=await browser.newContext({viewport:{width:375,height:900}});
 const id='00000000-0000-4000-8000-000000000002';
 const profile={id,email:'qa_test@example.invalid',full_name:'QA_TEST_ACCOUNT',role:'user',status:'active',member_id:'QA_TEST_MEMBER',total_points:0,xp:0,is_verified:true};
 const user={id,email:profile.email,email_confirmed_at:'2026-10-13T00:00:00Z',app_metadata:{provider:'email'},user_metadata:{}};
 const token=Buffer.from('{"alg":"HS256"}').toString('base64url')+'.'+Buffer.from(JSON.stringify({sub:id,exp:4102444800})).toString('base64url')+'.QA_TEST_SIGNATURE';
 await context.addInitScript(({user,token})=>{localStorage.setItem('datacamp_language','en');sessionStorage.setItem('datacamp_supabase_auth_token',JSON.stringify({user,access_token:token,refresh_token:'QA_TEST',expires_at:4102444800,token_type:'bearer'}));},{user,token});
 await context.routeWebSocket('wss://'+new URL(base).host+'/**',socket=>socket.close());
 const writes=[];
 await context.route(base+'/**',async route=>{
  const request=route.request(),url=new URL(request.url());const body=request.method()==='GET'?null:request.postDataJSON();if(body)writes.push({path:url.pathname,method:request.method(),body});
  let data=[];
  if(url.pathname.endsWith('/auth/v1/user'))data=user;
  else if(url.pathname.endsWith('/profiles'))data=request.headers().accept?.includes('vnd.pgrst.object')?profile:[profile];
  else if(url.pathname.endsWith('/rpc/get_own_member_card'))data={token:'00000000-0000-4000-8000-000000000020'};
  else if(url.pathname.endsWith('/rpc/public_stats'))data={members:0,events:0,projects:0,certificates:0};
  await route.fulfill({contentType:'application/json',body:JSON.stringify(data)});
 });
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(origin+'/dashboard',{waitUntil:'domcontentloaded'});await page.locator('#id-card svg').waitFor();
 const pending=page.waitForEvent('download');await page.getByRole('button',{name:'Download ID Card',exact:true}).click();const download=await pending;
 await download.saveAs('qa-audit/card-preview.png');const bytes=fs.readFileSync('qa-audit/card-preview.png');
 const pixels=await page.evaluate(async base64=>{const i=new Image();i.src='data:image/png;base64,'+base64;await i.decode();const c=document.createElement('canvas');c.width=i.width;c.height=i.height;const ctx=c.getContext('2d');ctx.drawImage(i,0,0);return{width:i.width,height:i.height,data:Array.from(ctx.getImageData(1180,580,330,330).data)};},bytes.toString('base64'));
 const qr=jsQR(new Uint8ClampedArray(pixels.data),330,330)?.data;
 if(pixels.width!==1586||pixels.height!==1000||qr!==origin+'/verify-membership/00000000-0000-4000-8000-000000000020')throw Error('Deployed card export or QR failed');
 await page.goto(origin+'/profile',{waitUntil:'domcontentloaded'});await page.getByRole('button',{name:'Send password reset link',exact:true}).click();
 await page.getByText('Password recovery link sent to qa_test@example.invalid',{exact:true}).waitFor();
 if(!writes.some(w=>w.path.endsWith('/recover')&&w.body.email===profile.email)||writes.some(w=>w.path.endsWith('/otp')))throw Error('Deployed recovery contract failed');
 await page.getByRole('button',{name:'Change email address',exact:true}).click();await page.getByRole('dialog').getByRole('textbox',{name:'New email address'}).fill('qa_test_new@example.invalid');await page.getByRole('button',{name:'Send confirmation',exact:true}).click();await page.getByRole('dialog').waitFor({state:'hidden'});
 if(!writes.some(w=>w.method==='PUT'&&w.path.endsWith('/user')&&w.body.email==='qa_test_new@example.invalid')||writes.some(w=>w.method==='PATCH'&&w.path.endsWith('/profiles')&&'email' in w.body)||errors.length){console.log(JSON.stringify({errors,profilePatches:writes.filter(w=>w.method==='PATCH'&&w.path.endsWith('/profiles')).map(w=>w.body)}));throw Error('Deployed email change or runtime failed');}
 fs.writeFileSync('qa-audit/deployed-card-security-results.json',JSON.stringify({origin,passed:3,mode:'Deployed assets with isolated QA network fixtures; no production writes',qr,errors},null,2));console.log(JSON.stringify({passed:3,qr}));await browser.close();
})().catch(async e=>{console.error(e.message);await browser?.close();process.exitCode=1});
