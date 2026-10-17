// Actual isolated Supabase Auth + localhost API + Google Drive. No browser tokens
// are read. A QA-only admin-generated login link is verified without sending mail.
import fs from 'node:fs';import crypto from 'node:crypto';import assert from 'node:assert/strict';import {createClient} from '@supabase/supabase-js';
const root='qa-audit/.runtime/final-hosted',cfg=JSON.parse(fs.readFileSync(root+'/config.json','utf8')),secret=JSON.parse(fs.readFileSync(root+'/server-secrets.json','utf8')).SUPABASE_SERVICE_ROLE_KEY;
if(cfg.projectRef!=='kcqgnkfdpfibwkrghubl'||cfg.url!=='https://kcqgnkfdpfibwkrghubl.supabase.co')throw Error('Wrong QA target');
const claims=JSON.parse(Buffer.from(secret.split('.')[1],'base64url'));assert.equal(claims.ref,cfg.projectRef);assert.equal(claims.role,'service_role');
const server=createClient(cfg.url,secret,{auth:{persistSession:false,autoRefreshToken:false}}),ownerId='cf94bf7d-15ab-48be-b9c7-c537a8b0b299';
const owner=await server.from('profiles').select('id,email,full_name,role').eq('id',ownerId).single();assert.equal(owner.error,null);assert.equal(owner.data.full_name,'QA_TEST_GOOGLE_OWNER');assert.equal(owner.data.role,'admin');
const linked=await server.auth.admin.generateLink({type:'magiclink',email:owner.data.email});assert.equal(linked.error,null);
const user=createClient(cfg.url,cfg.publishableKey,{auth:{persistSession:false,autoRefreshToken:false}});
const login=await user.auth.verifyOtp({type:'magiclink',token_hash:linked.data.properties.hashed_token});assert.equal(login.error,null);assert.equal(login.data.user.id,ownerId);
const token=login.data.session.access_token;
const evidence={checkedAt:new Date().toISOString(),target:cfg.projectRef,origin:'http://127.0.0.1:3200',files:[],limits:'Synthetic files only. Actual transfers are 47MB/short material/SRT; not a 2GiB transfer or browser drag test. No email delivery is claimed.'};
const call=async body=>{const r=await fetch('http://127.0.0.1:3200/api/courses/media',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify(body),signal:AbortSignal.timeout(60000)});const json=await r.json();if(!r.ok)throw Error('QA media '+body.action+' HTTP '+r.status+': '+json.error);return json;};
const courseId=crypto.randomUUID(),lessonId=crypto.randomUUID();
const manifest={courseId,lessonId,ownerId,files:[]};
const save=()=>fs.writeFileSync(root+'/synthetic-drive-fixtures.json',JSON.stringify(manifest,null,2)+'\n',{mode:0o600});
if(fs.existsSync(root+'/synthetic-drive-fixtures.json'))throw Error('QA fixture manifest already exists; do not overwrite');
try{
 assert.equal((await server.from('courses').insert({id:courseId,title:'QA_TEST_Synthetic_Drive',slug:'qa-test-synthetic-'+courseId,is_published:false})).error,null);save();
 assert.equal((await server.from('lessons').insert({id:lessonId,course_id:courseId,title:'QA_TEST_Synthetic_Python',type:'video',position:1,is_preview:false})).error,null);
 for(const [name,kind,mimeType] of [['QA_TEST_Python_Basics.mp4','video','video/mp4'],['QA_TEST_material.txt','material','text/plain'],['QA_TEST_captions.srt','subtitle','application/x-subrip']]){
  const bytes=fs.readFileSync(root+'/QA_TEST_course_media/'+name),fingerprint=crypto.createHash('md5').update(bytes).digest('hex'),sha256=crypto.createHash('sha256').update(bytes).digest('hex');
  const request={action:'start',lessonId,kind,name,mimeType,size:bytes.length,fingerprint,sha256};let session=await call(request);
  const url=new URL(session.uploadUrl);assert.equal(url.origin,'https://www.googleapis.com');assert(url.pathname.startsWith('/upload/drive/v3/files'));
  const started=Date.now();let fileId='',chunks=0;
  for(let offset=0;offset<bytes.length;offset+=8*1024*1024){const end=Math.min(bytes.length,offset+8*1024*1024);const response=await fetch(session.uploadUrl,{method:'PUT',headers:{Authorization:'Bearer '+session.accessToken,'Content-Type':mimeType,'Content-Range':`bytes ${offset}-${end-1}/${bytes.length}`},body:bytes.subarray(offset,end),signal:AbortSignal.timeout(90000)});chunks++;assert([200,201,308].includes(response.status),'Unexpected Drive chunk status '+response.status);if(response.ok)fileId=(await response.json()).id;else await response.body?.cancel();
   // Trigger actual server-side position recovery after the first chunk.
   if(offset===0&&end<bytes.length){session=await call(request);assert.equal(session.resuming,true);}
  }
  assert(fileId);manifest.files.push({name,kind,fileId,jobId:session.jobId});save();
  const done=await call({action:'finish',jobId:session.jobId,fileId,language:kind==='subtitle'?'en':'ar'});assert.equal(done.success,true);
  const row=await server.from('course_assets').select('id,name,size_bytes,sha256,fingerprint,kind').eq('id',done.assetId).single();assert.equal(row.error,null);assert.equal(Number(row.data.size_bytes),bytes.length);assert.equal(row.data.sha256,sha256);assert.equal(row.data.fingerprint,fingerprint);
  const opened=await call({action:'open',assetId:done.assetId});assert(opened.url.startsWith('/api/courses/media?ticket='));
  const range=await fetch('http://127.0.0.1:3200'+opened.url,{headers:{Range:'bytes=0-31'},signal:AbortSignal.timeout(30000)});assert.equal(range.status,206);assert.deepEqual(Buffer.from(await range.arrayBuffer()),bytes.subarray(0,Math.min(32,bytes.length)));
  if(kind!=='video'){const all=await fetch('http://127.0.0.1:3200'+opened.url,{signal:AbortSignal.timeout(30000)});assert.equal(all.status,200);assert.deepEqual(Buffer.from(await all.arrayBuffer()),bytes);}
  assert.equal((await call({action:'finish',jobId:session.jobId,fileId,language:'en'})).assetId,done.assetId);
  evidence.files.push({name,kind,size:bytes.length,chunks,resumeProbe:chunks>1,persistedHashVerified:true,rangeBytesVerified:true,wholeFileVerified:kind!=='video',idempotentFinish:true,elapsedMs:Date.now()-started});console.log(JSON.stringify(evidence.files.at(-1)));
 }
 const saved=await server.from('lessons').select('video_asset_id,type').eq('id',lessonId).single();assert.equal(saved.error,null);assert.equal(saved.data.type,'video');assert(saved.data.video_asset_id);
 evidence.lessonReferenceSaved=true;
}catch(error){evidence.failure=String(error.message).replace(/(AIza|AQ\.)[\w.-]+/g,'[REDACTED]');process.exitCode=1;console.error(evidence.failure);}
finally{fs.writeFileSync('qa-audit/final/evidence/QA_TEST_actual_drive.json',JSON.stringify(evidence,null,2)+'\n');await user.auth.signOut({scope:'local'});await user.removeAllChannels();}
