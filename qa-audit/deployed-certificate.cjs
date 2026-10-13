// Read-only production verification/export. Never logs or saves real names/codes.
const fs=require('node:fs');const {chromium}=require('@playwright/test');const jsQR=require('jsqr');
const origin=process.argv[2],base=process.env.VITE_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!origin?.startsWith('https://')||!base||!key)throw Error('Missing deployment/local configuration');
let browser;
async function bytes(download){const stream=await download.createReadStream();const parts=[];for await(const p of stream)parts.push(Buffer.from(p));return Buffer.concat(parts);}
(async()=>{
 const r=await fetch(base+'/rest/v1/certificates?select=course_title,user_full_name,verification_code&type=eq.course&limit=1',{headers:{apikey:key,Authorization:'Bearer '+key}});if(!r.ok)throw Error('Certificate read failed');const cert=(await r.json())[0];if(!cert)throw Error('No genuine persisted course certificate is available for verification');
 browser=await chromium.launch();const context=await browser.newContext({viewport:{width:375,height:900}});await context.addInitScript(()=>localStorage.setItem('datacamp_language','en'));const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const url=origin+'/verify-certificate/'+cert.verification_code;await page.goto(url,{waitUntil:'domcontentloaded'});await page.getByText('AUTHENTIC CREDENTIAL VERIFIED',{exact:true}).waitFor();
 const text=await page.locator('#printable-certificate').textContent();if(!text?.includes(cert.course_title)||!text.includes(cert.user_full_name))throw Error('Certificate view does not match its database record');
 const pngPending=page.waitForEvent('download');await page.getByRole('button',{name:'PNG IMAGE',exact:true}).click();const png=await pngPending;const pngBytes=await bytes(png);
 const image=await page.evaluate(async base64=>{const i=new Image();i.src='data:image/png;base64,'+base64;await i.decode();const c=document.createElement('canvas');c.width=i.width;c.height=i.height;const ctx=c.getContext('2d');ctx.drawImage(i,0,0);return{width:i.width,height:i.height,data:Array.from(ctx.getImageData(1355,1270,195,195).data)};},pngBytes.toString('base64'));
 if(image.width!==2400||image.height!==1697||jsQR(new Uint8ClampedArray(image.data),195,195)?.data!==url)throw Error('Real certificate PNG or QR export failed');
 const pdfPending=page.waitForEvent('download');await page.getByRole('button',{name:'DOWNLOAD PDF',exact:true}).click();const pdf=await pdfPending;if((await bytes(pdf)).subarray(0,5).toString()!=='%PDF-')throw Error('Real certificate PDF export failed');if(errors.length)throw Error('Runtime error during certificate verification/export');
 fs.writeFileSync('qa-audit/deployed-certificate-results.json',JSON.stringify({origin,passed:4,mode:'Read-only genuine production course certificate verification and export; no account changes',recordMatchesDatabase:true,pngDimensions:[image.width,image.height],pngQrMatches:true,pdfHeaderValid:true,javascriptErrors:[]},null,2));console.log(JSON.stringify({passed:4,recordMatchesDatabase:true,pngQrMatches:true,pdfHeaderValid:true}));await browser.close();
})().catch(async e=>{console.error(e.message);await browser?.close();process.exitCode=1});
