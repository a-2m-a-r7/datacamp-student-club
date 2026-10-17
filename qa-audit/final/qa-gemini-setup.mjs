// QA loopback tooling. The product never imports this credential form.
import fs from 'node:fs';import path from 'node:path';import {randomBytes,timingSafeEqual} from 'node:crypto';
const nonce=randomBytes(32).toString('hex'),origin='http://127.0.0.1:3200';
const target=path.resolve('qa-audit/.runtime/final-hosted/gemini-secrets.json');
export async function qaGeminiSetup(req,res){
 if(new URL(req.url,origin).pathname!=='/qa-gemini-setup')return false;
 res.setHeader('Cache-Control','no-store');res.setHeader('Referrer-Policy','same-origin');res.setHeader('Content-Type','text/html; charset=utf-8');
 res.setHeader('Content-Security-Policy',"default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'");
 const reply=(code,text)=>{res.statusCode=code;res.end('<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><title>QA Gemini setup</title><body style="font:18px system-ui;padding:40px;max-width:720px;margin:auto;background:#0c1019;color:#eee">'+text+'</body></html>');return true;};
 if(req.headers.host!=='127.0.0.1:3200')return reply(403,'مضيف غير مسموح.');
 if(fs.existsSync(target))return reply(200,'<h1>مفتاح Gemini QA محفوظ محليًا</h1><p>القيمة لا تُعرض ولا يحتاج النموذج إعادة الإرسال.</p>');
 if(req.method==='GET')return reply(200,`<h1>إعداد Gemini لبيئة QA فقط</h1><p>المشروع المسموح qa-test-datacamp-final. يحفظ المفتاح محليًا في ملف متجاهل من Git، دون إنتاج أو Vercel أو تفعيل فوترة.</p><form method="post" autocomplete="off"><input type="hidden" name="nonce" value="${nonce}"><label for="key">مفتاح Gemini QA</label><input id="key" type="password" name="key" required autocomplete="off" style="display:block;width:100%;padding:12px;margin:20px 0"><button type="submit" style="padding:12px">حفظ مفتاح Gemini محليًا في QA فقط</button></form>`);
 if(req.method!=='POST'||req.headers.origin!==origin||!String(req.headers['content-type']).startsWith('application/x-www-form-urlencoded'))return reply(403,'طلب غير مسموح.');
 let body='';for await(const chunk of req){body+=chunk;if(Buffer.byteLength(body)>16384)return reply(413,'طلب كبير.');}
 const form=new URLSearchParams(body),submitted=form.get('nonce')||'';
 if(submitted.length!==nonce.length||!timingSafeEqual(Buffer.from(submitted),Buffer.from(nonce)))return reply(403,'رمز غير صحيح.');
 const key=form.get('key')?.trim();if(!key||key.length<20||key.length>4096||/\s/.test(key))return reply(400,'مفتاح غير صالح.');
 try{fs.writeFileSync(target,JSON.stringify({projectId:'qa-test-datacamp-final',GEMINI_API_KEY:key})+'\n',{flag:'wx',mode:0o600});return reply(200,'<h1>تم حفظ مفتاح Gemini QA محليًا</h1><p>القيمة لا تُعرض. يلزم إعادة تشغيل خادم الاختبار لتفعيله.</p>');}catch{return reply(400,'تعذر حفظ المفتاح.');}
}
