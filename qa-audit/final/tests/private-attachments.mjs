// Actual Supabase QA Storage + PostgREST, never production. Retain fixtures for approved final cleanup.
import fs from 'node:fs';
import {randomUUID,createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {createClient} from '@supabase/supabase-js';
const label=process.argv[2],after=process.argv.includes('--after');
assert(/^[\w-]+$/.test(label));
const dir='qa-audit/.runtime/final-hosted',out='qa-audit/final/evidence/'+label+'.json';
assert(!fs.existsSync(out));
const cfg=JSON.parse(fs.readFileSync(dir+'/config.json','utf8'));
const key=JSON.parse(fs.readFileSync(dir+'/server-secrets.json','utf8')).SUPABASE_SERVICE_ROLE_KEY;
assert.equal(cfg.projectRef,'kcqgnkfdpfibwkrghubl');
assert.equal(cfg.url,'https://kcqgnkfdpfibwkrghubl.supabase.co');
assert.equal(JSON.parse(Buffer.from(key.split('.')[1],'base64url')).ref,cfg.projectRef);
const client=k=>createClient(cfg.url,k,{auth:{persistSession:false,autoRefreshToken:false}});
const server=client(key),anon=client(cfg.publishableKey),admin=client(cfg.publishableKey),member=client(cfg.publishableKey);
const report={at:new Date().toISOString(),target:cfg.projectRef,mode:after?'after':'before',cases:[]};
const ok=r=>{assert.equal(r.error,null);return r.data;};
const check=(name,passed,details={})=>{report.cases.push({name,passed,...details});assert(passed,name);};
try{
 const profiles=ok(await server.from('profiles').select('id,role').in('id',cfg.accounts.map(a=>a.id)));
 for(const [c,role]of[[admin,'admin'],[member,'user']]){const cred=cfg.accounts.find(a=>profiles.find(p=>p.id===a.id)?.role===role);assert(cred);ok(await c.auth.signInWithPassword({email:cred.email,password:cred.password}));}
 const buckets=ok(await server.storage.listBuckets());const bucket=buckets.find(b=>b.id==='form-attachments');
 check('private-bucket-limit-and-allowed-MIME',bucket?.public===false&&Number(bucket.file_size_limit)===10485760&&bucket.allowed_mime_types.includes('text/plain'));
 const formId=randomUUID(),questionId=randomUUID(),path=formId+'/QA_TEST_attachment_'+label+'.txt';
 const manifestFile=dir+'/private-storage-fixtures.json',manifest=fs.existsSync(manifestFile)?JSON.parse(fs.readFileSync(manifestFile,'utf8')):{forms:[]};
 ok(await server.from('forms').insert({id:formId,title:'QA_TEST_Private_Attachment_'+label,slug:'qa-test-file-'+formId,status:'published',allow_anonymous:true}));
 manifest.forms.push({id:formId,path});fs.writeFileSync(manifestFile,JSON.stringify(manifest,null,2)+'\n',{mode:0o600});
 ok(await server.from('form_questions').insert({id:questionId,form_id:formId,title:'QA_TEST_file',type:'file_upload',required:true}));
 const bytes=Buffer.from('QA_TEST_ material\nمرحبا بالاختبار\n','utf8');
 ok(await anon.storage.from(bucket.id).upload(path,bytes,{contentType:'text/plain',upsert:false}));
 const files=ok(await server.storage.from(bucket.id).list(formId));const stored=files.find(f=>f.name===path.split('/')[1]);
 check('anonymous-upload-to-open-form-really-stored',stored?.metadata?.size===bytes.length&&stored.metadata.mimetype==='text/plain',{size:bytes.length});
 const signed=ok(await admin.storage.from(bucket.id).createSignedUrl(path,60));
 const downloaded=await fetch(signed.signedUrl,{signal:AbortSignal.timeout(20000)});
 check('admin-signed-download-has-exact-UTF8-bytes',downloaded.ok&&Buffer.from(await downloaded.arrayBuffer()).equals(bytes),{sha256:createHash('sha256').update(bytes).digest('hex')});
 for(const [name,c]of[['visitor',anon],['member',member]]){
  const download=await c.storage.from(bucket.id).download(path),sign=await c.storage.from(bucket.id).createSignedUrl(path,60),replace=await c.storage.from(bucket.id).upload(path,Buffer.from('QA_TEST_overwrite'),{upsert:true,contentType:'text/plain'});
  check(name+'-cannot-read-sign-or-overwrite',!!download.error&&!!sign.error&&!!replace.error);
 }
 const pub=await fetch(cfg.url+'/storage/v1/object/public/'+bucket.id+'/'+path,{signal:AbortSignal.timeout(20000)});
 check('public-URL-does-not-expose-private-bytes',!pub.ok,{status:pub.status});await pub.body?.cancel();
 const wrong=await anon.storage.from(bucket.id).upload(formId+'/QA_TEST_wrong.exe',Buffer.from('QA_TEST_'),{contentType:'application/x-msdownload'});
 check('Storage-rejects-disallowed-MIME',!!wrong.error);
 const submit=async(value)=>anon.rpc('submit_form_response',{p_form_id:formId,p_answers:[{question_id:questionId,value}]});
 const missing=await submit({path:formId+'/QA_TEST_missing.txt',name:'QA_TEST_missing.txt',size:100});
 report.cases.push({name:'missing-object-denied',passed:!!missing.error,actual:missing.error?'denied':'accepted',knownBugBefore:!after});
 if(after)assert(missing.error);
 const emptyPath=formId+'/QA_TEST_empty.txt',empty=await anon.storage.from(bucket.id).upload(emptyPath,Buffer.alloc(0),{contentType:'text/plain'});
 if(empty.error)check('empty-file-rejected-by-Storage',true);
 else{const result=await submit({path:emptyPath,name:'QA_TEST_empty.txt',size:0});report.cases.push({name:'empty-file-denied-by-RPC',passed:!!result.error,actual:result.error?'denied':'accepted',knownBugBefore:!after});if(after)assert(result.error);}
 const response=ok(await submit({path,name:'QA_TEST_attachment.txt',size:999}));assert.equal(response.success,true);
 const answer=ok(await server.from('form_answers').select('value').eq('response_id',response.response_id).eq('question_id',questionId).single());
 report.cases.push({name:'answer-size-canonical-from-Storage',passed:answer.value.size===bytes.length,expected:bytes.length,actual:answer.value.size,knownBugBefore:!after});if(after)assert.equal(answer.value.size,bytes.length);
 report.status=report.cases.every(c=>c.passed)?'passed':after?'failed':'reproduced';
}catch(error){report.status='failed';report.failure=error?.message?.startsWith('[')?'Provider/assertion failure':String(error.message).slice(0,180);process.exitCode=1;}
finally{await Promise.allSettled([admin.auth.signOut(),member.auth.signOut()]);fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:report.status,passed:report.cases.filter(c=>c.passed).length,failed:report.cases.filter(c=>!c.passed).length,evidence:out}));}
