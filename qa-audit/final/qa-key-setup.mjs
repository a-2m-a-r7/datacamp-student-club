// Local QA tooling only. Never imported by the deployed application.
import fs from 'node:fs';
import path from 'node:path';
import {randomBytes,timingSafeEqual} from 'node:crypto';
const nonce=randomBytes(32).toString('hex');
const target=path.resolve('qa-audit/.runtime/final-hosted/server-secrets.json');
const origin='http://127.0.0.1:3200';
export async function qaKeySetup(req,res) {
 if(new URL(req.url,origin).pathname!=='/qa-key-setup')return false;
 res.setHeader('Cache-Control','no-store');res.setHeader('Referrer-Policy','same-origin');
 res.setHeader('Content-Security-Policy',"default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'");
 res.setHeader('Content-Type','text/html; charset=utf-8');
 const reply=(code,message)=>{res.statusCode=code;res.end('<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><title>QA server setup</title><body style="font:18px system-ui;padding:40px;max-width:720px;margin:auto;background:#0c1019;color:#eee">'+message+'</body></html>');return true;};
 if(req.headers.host!=='127.0.0.1:3200')return reply(403,'مضيف غير مسموح.');
 if(fs.existsSync(target))return reply(200,'<h1>إعداد QA محفوظ محليًا</h1><p>القيمة لا تُعرض. لا يحتاج هذا النموذج لإعادة الإرسال.</p>');
 if(req.method==='GET')return reply(200,`<h1>مفتاح خادم بيئة QA فقط</h1><p>المشروع المسموح: kcqgnkfdpfibwkrghubl. يحفظ النموذج المفتاح في ملف محلي متجاهل من Git؛ لا يُرسل إلى الإنتاج أو Vercel.</p><form method="post" autocomplete="off"><input type="hidden" name="nonce" value="${nonce}"><label for="key">مفتاح Supabase QA</label><input type="password" id="key" name="key" required autocomplete="off" style="display:block;width:100%;padding:12px;margin:20px 0"><button type="submit" style="padding:12px">حفظ محلي في QA فقط</button></form>`);
 if(req.method!=='POST'||req.headers.origin!==origin||!String(req.headers['content-type']).startsWith('application/x-www-form-urlencoded'))return reply(403,'طلب غير مسموح.');
 let body='';for await(const chunk of req){body+=chunk;if(Buffer.byteLength(body)>16384)return reply(413,'الطلب أكبر من الحد المسموح.');}
 const form=new URLSearchParams(body),submitted=form.get('nonce')||'';
 if(submitted.length!==nonce.length||!timingSafeEqual(Buffer.from(submitted),Buffer.from(nonce)))return reply(403,'رمز النموذج غير صحيح.');
 const key=form.get('key')?.trim();if(!key||key.length>10000)return reply(400,'قيمة المفتاح غير صالحة.');
 try{
  if(!key.startsWith('sb_secret_')){const payload=JSON.parse(Buffer.from(key.split('.')[1]||'','base64url').toString());if(payload.role!=='service_role'||payload.ref!=='kcqgnkfdpfibwkrghubl')return reply(400,'المفتاح ليس مفتاح خادم المشروع المحدد للاختبار.');}
  const response=await fetch('https://kcqgnkfdpfibwkrghubl.supabase.co/auth/v1/admin/users?page=1&per_page=1',{headers:{apikey:key,Authorization:'Bearer '+key},redirect:'error',signal:AbortSignal.timeout(15000)});
  await response.body?.cancel();if(!response.ok)return reply(400,'تعذر التحقق من المفتاح في مشروع QA. لم يُحفظ.');
  fs.writeFileSync(target,JSON.stringify({SUPABASE_SERVICE_ROLE_KEY:key})+'\n',{mode:0o600,flag:'wx'});
  return reply(200,'<h1>تم حفظ مفتاح QA محليًا</h1><p>القيمة لا تُعرض، والملف متجاهل من Git. يلزم إعادة تشغيل خادم QA لتفعيلها.</p>');
 }catch{return reply(400,'تعذر حفظ إعداد QA. لم تُعرض أي بيانات اعتماد.');}
}
