import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/profile/avatar';
import { fetchProviderAvatar, providerAvatarUrl } from '../api/_lib/profile-avatar';
const uid='00000000-0000-4000-8000-000000000302',old='https://lh3.googleusercontent.com/QA_TEST_IMAGE';
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=','base64');
test('avatar API validates real identity, saves owned Storage bytes and reference, and reuses stored photos',async()=>{
 const original=globalThis.fetch,prior={url:process.env.SUPABASE_URL,key:process.env.SUPABASE_SERVICE_ROLE_KEY};process.env.SUPABASE_URL='https://qa-test.supabase.co';process.env.SUPABASE_SERVICE_ROLE_KEY='QA_TEST_SERVER';
 let profile:any={id:uid,status:'active',avatar_url:old,photo_url:old},user:any={id:uid,email_confirmed_at:'2026-10-14',user_metadata:{picture:old}},uploads=0,google=0,patches:any[]=[],expired=false,failSave=false,conflict=false;
 globalThis.fetch=async(input:any,init:any={})=>{
  const url=new URL(String(input)),method=init.method||'GET';
  const json=(v:any,status=200)=>new Response(JSON.stringify(v),{status,headers:{'Content-Type':'application/json'}});
  if(url.hostname==='lh3.googleusercontent.com'){google++;return new Response(png,{headers:{'Content-Type':'image/png'}});}
  if(url.pathname==='/auth/v1/user')return expired?json({msg:'Expired'},401):json(user);
  if(url.pathname==='/rest/v1/profiles') {
   assert.equal(url.searchParams.get('id'),'eq.'+uid);
   if(method==='PATCH'){const body=JSON.parse(init.body);patches.push(body);assert.deepEqual(Object.keys(body).sort(),['avatar_url','photo_url','updated_at']);if(failSave)return json({message:'QA_TEST_FAILURE'},503);if(conflict){profile.avatar_url='';profile.photo_url='';return json([]);}profile={...profile,...body};return json([{id:uid}]);}
   return json(profile);
  }
  if(url.pathname.startsWith('/storage/v1/object/avatars')){if(method==='POST'){uploads++;assert.ok(url.pathname.includes('/'+uid+'/imported_'));assert.equal(Buffer.from(init.body).toString('hex'),png.toString('hex'));}return json({path:url.pathname.split('/avatars/')[1]});}
  throw Error('Unexpected QA request');
 };
 const call=async(headers:any={authorization:'Bearer QA_TEST'},body:any={action:'persist-current',userId:'OTHER_ACCOUNT'})=>{let status=0,data:any;const res:any={setHeader(){},status(n:number){status=n;return this;},json(v:any){data=v;return this;}};await handler({method:'POST',headers,body},res);return{status,data};};
 try {
  assert.equal((await call({})).status,401);expired=true;assert.equal((await call()).status,401);expired=false;
  user.email_confirmed_at=null;assert.equal((await call()).status,403);user.email_confirmed_at='2026-10-14';profile.status='inactive';assert.equal((await call()).status,403);profile.status='active';
  const saved=await call();assert.equal(saved.status,200);assert.match(saved.data.avatarUrl,new RegExp('/avatars/'+uid+'/imported_'));assert.equal(profile.avatar_url,profile.photo_url);assert.equal(uploads,1);
  await call();assert.equal(uploads,1);assert.equal(google,1);
  profile.avatar_url='';profile.photo_url='';await call();assert.equal(uploads,1,'removed image must not be silently refilled');
  conflict=true;const raced=await call(undefined,{action:'use-google'});assert.equal(raced.data.concurrentChange,true);assert.equal(raced.data.avatarUrl,'');conflict=false;
  failSave=true;const failed=await call(undefined,{action:'use-google'});assert.equal(failed.status,502);assert.equal(profile.avatar_url,'');assert.equal(profile.photo_url,'');failSave=false;const googleSaved=await call(undefined,{action:'use-google',url:'https://attacker.invalid/photo.png'});assert.equal(googleSaved.status,200);assert.equal(googleSaved.data.changed,true);assert.match(profile.avatar_url,new RegExp('/avatars/'+uid+'/imported_'));assert.equal(user.user_metadata.picture,old);
 } finally {globalThis.fetch=original;if(prior.url===undefined)delete process.env.SUPABASE_URL;else process.env.SUPABASE_URL=prior.url;if(prior.key===undefined)delete process.env.SUPABASE_SERVICE_ROLE_KEY;else process.env.SUPABASE_SERVICE_ROLE_KEY=prior.key;}
});
test('provider image fetch rejects arbitrary URLs, hostile redirects, oversized bodies and wrong signatures',async()=>{
 for(const value of ['http://lh3.googleusercontent.com/a','https://localhost/a','https://lh3.googleusercontent.com.evil.test/a','https://user:secret@lh3.googleusercontent.com/a','https://lh3.googleusercontent.com:8443/a'])assert.throws(()=>providerAvatarUrl(value));
 assert.ok(providerAvatarUrl('https://api.dicebear.com/7.x/bottts/svg?seed=QA_TEST').pathname.endsWith('/png'));
 const original=globalThis.fetch;
 try {
  globalThis.fetch=async()=>new Response(null,{status:302,headers:{location:'https://127.0.0.1/private'}});await assert.rejects(fetchProviderAvatar(old),/Unsupported/);
  globalThis.fetch=async()=>new Response('x',{headers:{'content-length':String(6*1024*1024)}});await assert.rejects(fetchProviderAvatar(old),/5 MB/);
  globalThis.fetch=async()=>new Response('<svg/>',{headers:{'Content-Type':'image/png'}});await assert.rejects(fetchProviderAvatar(old),/PNG/);
  globalThis.fetch=async()=>new Response(png);const valid=await fetchProviderAvatar(old);assert.equal(valid.mime,'image/png');assert.equal(valid.bytes.toString('hex'),png.toString('hex'));
 }finally{globalThis.fetch=original;}
});
