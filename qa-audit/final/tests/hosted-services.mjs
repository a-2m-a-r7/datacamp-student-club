// Real Supabase service probes, restricted to the separately approved free QA
// project. No dotenv, service key, production host, trace or token output.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {createClient} from '@supabase/supabase-js';
const ref='kcqgnkfdpfibwkrghubl';
const root='qa-audit/.runtime/final-hosted';
const cfg=JSON.parse(await fs.readFile(root+'/config.json','utf8'));
assert.equal(cfg.projectRef,ref); assert.equal(cfg.url,`https://${ref}.supabase.co`);
const label=process.argv[2]; assert.match(label||'',/^[A-Za-z0-9_-]{1,100}$/);
const out=`qa-audit/final/evidence/runs/${label}`;
await fs.mkdir(out); // never overwrite a previous run
const rawFetch=globalThis.fetch;
const network=[];
const checkedFetch=async(input,init)=>{
 const url=new URL(typeof input==='object'&&input.url?input.url:String(input));
 assert.equal(url.hostname,ref+'.supabase.co','Unexpected network destination');
 const response=await rawFetch(input,init);
 network.push({method:init?.method||'GET',path:url.pathname,status:response.status});
 return response;
};
const client=()=>createClient(cfg.url,cfg.publishableKey,{global:{fetch:checkedFetch},auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
const anon=client(),member=client(),admin=client(),unconfirmed=client();
const accounts=Object.fromEntries(cfg.accounts.map(a=>[a.kind,a]));
const results=[],ownedObjects=[],ownedRows=[];
const redact=s=>String(s).replaceAll(cfg.publishableKey,'[REDACTED]').replace(/eyJ[A-Za-z0-9_.-]+/g,'[REDACTED_JWT]');
async function probe(name,fn){try{await fn();results.push({name,status:'PASS'});}catch(e){results.push({name,status:'FAIL',error:redact(e.message).slice(0,800)});}console.log(name+': '+results.at(-1).status);}
const ok=result=>{assert.equal(result.error,null,result.error?.message);return result.data;};
const login=async(c,kind)=>{const a=accounts[kind];const r=await c.auth.signInWithPassword({email:a.email,password:a.password});ok(r);assert.equal(r.data.user.id,a.id);return r.data;};
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jqz8AAAAASUVORK5CYII=','base64');
try{
 await probe('Auth: confirmed member/admin real password login and untrusted metadata cannot elevate',async()=>{
  await login(member,'member');await login(admin,'admin');
  const p=ok(await member.from('profiles').select('role,is_verified').eq('id',accounts.member.id).single());
  assert.equal(p.role,'user');assert.equal(p.is_verified,true);
  assert.equal(ok(await member.rpc('is_admin')),false);assert.equal(ok(await admin.rpc('is_admin')),true);
 });
 await probe('Auth: wrong password and unconfirmed email denied by GoTrue',async()=>{
  const wrong=await anon.auth.signInWithPassword({email:accounts.member.email,password:'QA_TEST_WRONG_PASSWORD'});assert.ok(wrong.error);assert.equal(wrong.data.session,null);
  const r=await unconfirmed.auth.signInWithPassword({email:accounts.unconfirmed.email,password:accounts.unconfirmed.password});assert.equal(r.error?.code,'email_not_confirmed');
 });
 await probe('Auth: refresh rotates real session and getUser validates it',async()=>{
  const refreshed=ok(await member.auth.refreshSession());assert.equal(refreshed.user.id,accounts.member.id);
  assert.equal(ok(await member.auth.getUser()).user.id,accounts.member.id);
 });
 await probe('REST RLS: own profile persists Arabic/emoji; foreign row and protected role denied',async()=>{
  const bio='QA_TEST_نبذة عربية 😀';
  ok(await member.from('profiles').update({bio}).eq('id',accounts.member.id));
  assert.equal(ok(await member.from('profiles').select('bio').eq('id',accounts.member.id).single()).bio,bio);
  assert.equal(ok(await member.from('profiles').select('id').eq('id',accounts.admin.id)).length,0);
  assert.equal(ok(await member.from('profiles').update({bio:'QA_TEST_FORGED'}).eq('id',accounts.admin.id).select()).length,0);
  assert.ok((await member.from('profiles').update({role:'admin'}).eq('id',accounts.member.id)).error);
  assert.equal(ok(await member.rpc('is_admin')),false);
 });
 await probe('REST: visitor/member cannot read private administrative tables',async()=>{
  for(const c of [anon,member])for(const table of ['audit_logs','messages','form_responses','course_drive_connections','member_cards']){
   const r=await c.from(table).select('*').limit(2);assert.ok(r.error||r.data.length===0,table+' leaked rows');
  }
 });
 await probe('Storage: owned avatar bytes upload, public URL loads, profile reference persists',async()=>{
  const name=accounts.member.id+'/QA_TEST_'+randomUUID()+'.png';ownedObjects.push({bucket:'avatars',name});
  ok(await member.storage.from('avatars').upload(name,png,{contentType:'image/png',upsert:false}));
  const url=member.storage.from('avatars').getPublicUrl(name).data.publicUrl;
  const response=await checkedFetch(url);assert.equal(response.status,200);assert.deepEqual(Buffer.from(await response.arrayBuffer()),png);
  ok(await member.from('profiles').update({avatar_url:url,photo_url:url}).eq('id',accounts.member.id));
  const p=ok(await member.from('profiles').select('avatar_url,photo_url').eq('id',accounts.member.id).single());assert.equal(p.avatar_url,url);assert.equal(p.photo_url,url);
 });
 await probe('Storage: avatar listing/overwrite/foreign path protected',async()=>{
  const name=accounts.admin.id+'/QA_TEST_'+randomUUID()+'.png';ownedObjects.push({bucket:'avatars',name});
  ok(await admin.storage.from('avatars').upload(name,png,{contentType:'image/png'}));
  const denied=await member.storage.from('avatars').upload(name,png,{contentType:'image/png',upsert:true});assert.ok(denied.error);
  assert.equal(ok(await member.storage.from('avatars').list(accounts.admin.id)).length,0);
  const bytes=await checkedFetch(admin.storage.from('avatars').getPublicUrl(name).data.publicUrl);assert.deepEqual(Buffer.from(await bytes.arrayBuffer()),png);
 });
 await probe('Storage: unsupported MIME and oversized avatar rejected without stored object',async()=>{
  for(const [data,mime] of [[Buffer.from('QA_TEST_BAD_TYPE'),'text/plain'],[Buffer.alloc(5242881),'image/png']]){
   const name=accounts.member.id+'/QA_TEST_invalid_'+randomUUID()+'.png';
   const r=await member.storage.from('avatars').upload(name,data,{contentType:mime});assert.ok(r.error);
   assert.equal(ok(await member.storage.from('avatars').list(accounts.member.id,{search:name.split('/').at(-1)})).length,0);
  }
 });
 await probe('Storage: admin course thumbnail/upload bytes persist; member write denied',async()=>{
  for(const bucket of ['course-thumbnails','uploads']){
   const name='QA_TEST_'+randomUUID()+'.png';ownedObjects.push({bucket,name});
   ok(await admin.storage.from(bucket).upload(name,png,{contentType:'image/png'}));
   const response=await checkedFetch(admin.storage.from(bucket).getPublicUrl(name).data.publicUrl);assert.deepEqual(Buffer.from(await response.arrayBuffer()),png);
   assert.ok((await member.storage.from(bucket).upload('QA_TEST_denied_'+randomUUID()+'.png',png,{contentType:'image/png'})).error);
  }
 });
 await probe('REST/RPC: real event registration idempotency and private registration list',async()=>{
  const event=ok(await admin.from('events').insert({title:'QA_TEST_Hosted_Event',date:'2030-01-01',capacity:2,status:'published'}).select().single());ownedRows.push({table:'events',id:event.id});
  ok(await member.rpc('register_for_event',{target_event_id:event.id}));
  assert.match((await member.rpc('register_for_event',{target_event_id:event.id})).error?.message||'',/Already registered/);
  const row=ok(await admin.from('events').select('registered_count,registrations').eq('id',event.id).single());assert.equal(row.registered_count,1);assert.equal(row.registrations.length,1);
  const visible=ok(await anon.from('public_events').select('*').eq('id',event.id).single());assert.equal('registrations' in visible,false);assert.equal('organizers' in visible,false);
 });
 await probe('Realtime: subscribed member receives real admin notification INSERT',async()=>{
  const events=[],system=[];const channel=member.channel('QA_TEST_'+randomUUID()).on('system',{},p=>system.push({status:p.status,message:p.message,extension:p.extension})).on('postgres_changes',{event:'INSERT',schema:'public',table:'notifications',filter:'user_id=eq.'+accounts.member.id},p=>events.push(p));
  try{
   await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Realtime subscription timed out')),15000);channel.subscribe((status)=>{if(status==='SUBSCRIBED'){clearTimeout(timer);resolve();}else if(status==='CHANNEL_ERROR'){clearTimeout(timer);reject(Error('Realtime channel error'));}});});
   // Channel join and PostgreSQL replication readiness are distinct phases.
   // Observe the provider's explicit system acknowledgement before inserting.
   for(let n=0;n<30&&!system.some(s=>s.status==='ok'&&/Subscribed to PostgreSQL/.test(s.message));n++)await new Promise(r=>setTimeout(r,500));
   assert.ok(system.some(s=>s.status==='ok'&&/Subscribed to PostgreSQL/.test(s.message)),'PostgreSQL subscription not ready: '+JSON.stringify(system));
   const row=ok(await admin.from('notifications').insert({user_id:accounts.member.id,title:'QA_TEST_Hosted_Realtime',message:'QA_TEST_تحديث مباشر',type:'info'}).select('id').single());ownedRows.push({table:'notifications',id:row.id});
   for(let n=0;n<20&&!events.some(e=>e.new.id===row.id);n++)await new Promise(r=>setTimeout(r,500));
   assert.ok(events.some(e=>e.new.id===row.id),'Persisted INSERT was not delivered: '+JSON.stringify(system));
  }finally{await member.removeChannel(channel);}
 });
 await probe('Auth: logout clears local session and old refresh token cannot start another session',async()=>{
  const {session}=ok(await member.auth.getSession());assert.ok(session);
  ok(await member.auth.signOut({scope:'local'}));assert.equal(ok(await member.auth.getSession()).session,null);
  const r=await anon.auth.refreshSession({refresh_token:session.refresh_token});assert.ok(r.error);assert.equal(r.data.session,null);
 });
} finally {
 // Exact fixture list retained privately for explicitly approved QA cleanup.
 await fs.writeFile(root+'/'+label+'-fixtures.json',JSON.stringify({ownedObjects,ownedRows},null,2));
 for(const c of [member,admin,anon,unconfirmed]){await c.removeAllChannels();await c.auth.stopAutoRefresh();}
 await fs.writeFile(out+'/hosted-services.json',JSON.stringify({projectRef:ref,scope:'real QA Auth/REST/Storage/Realtime only; no production, email or OAuth delivery claim',results,network},null,2));
 console.log(JSON.stringify({passed:results.filter(x=>x.status==='PASS').length,failed:results.filter(x=>x.status==='FAIL').length}));
 process.exitCode=results.some(x=>x.status==='FAIL')?1:0;
}
