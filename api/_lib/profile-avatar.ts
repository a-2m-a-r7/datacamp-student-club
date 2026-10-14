import { createClient } from '@supabase/supabase-js';
import { createHash } from 'node:crypto';

export const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
export function providerAvatarUrl(value: string): URL {
 const u = new URL(value);
 if (u.protocol !== 'https:' || u.username || u.password || (u.port && u.port !== '443') || value.length > 4096) throw Error('Unsupported avatar source.');
 if (u.hostname === 'api.dicebear.com' && /^\/\d+\.x\/[a-z-]+\/(svg|png|jpg|webp)$/.test(u.pathname)) {
  u.pathname=u.pathname.replace(/\/svg$/, '/png'); u.searchParams.set('size','256');
 } else if (!u.hostname.endsWith('.googleusercontent.com')) throw Error('Unsupported avatar source.');
 return u;
}
export async function fetchProviderAvatar(value: string) {
 let url=providerAvatarUrl(value);
 const signal=AbortSignal.timeout(15000);
 for(let redirects=0;redirects<=3;redirects++) {
  const response=await fetch(url,{redirect:'manual',signal});
  if([301,302,303,307,308].includes(response.status)) {
   const next=response.headers.get('location'); await response.body?.cancel();
   if(!next || redirects===3)throw Error('Avatar redirect failed.');
   url=providerAvatarUrl(new URL(next,url).href);continue;
  }
  if(!response.ok)throw Error('Unable to download the provider image.');
  if(Number(response.headers.get('content-length'))>MAX_AVATAR_BYTES){await response.body?.cancel();throw Error('Avatar exceeds 5 MB.');}
  if(!response.body)throw Error('Empty avatar response.');
  const reader=response.body.getReader(),chunks:Uint8Array[]=[];let size=0;
  try { for(;;){const {done,value:chunk}=await reader.read();if(done)break;size+=chunk.byteLength;if(size>MAX_AVATAR_BYTES){await reader.cancel();throw Error('Avatar exceeds 5 MB.');}chunks.push(chunk);} }
  finally {reader.releaseLock();}
  const bytes=Buffer.concat(chunks);let mime='',ext='';
  if(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))){mime='image/png';ext='png';}
  else if(bytes[0]===255&&bytes[1]===216&&bytes[2]===255){mime='image/jpeg';ext='jpg';}
  else if(bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP'){mime='image/webp';ext='webp';}
  else throw Error('Provider did not return a PNG, JPEG, or WebP image.');
  return {bytes,mime,ext};
 }
 throw Error('Avatar download failed.');
}
export function ownedAvatarPath(url: string, base: string, uid: string): string | null {
 try {const u=new URL(url),root=new URL(base);const prefix='/storage/v1/object/public/avatars/';if(u.origin!==root.origin||!u.pathname.startsWith(prefix))return null;const path=decodeURIComponent(u.pathname.slice(prefix.length));return path.startsWith(uid+'/')&&!path.includes('..')?path:null;}catch{return null;}
}
export async function persistProviderAvatar(client:any,user:any,profile:any,action='persist-current') {
 const base=process.env.SUPABASE_URL||process.env.VITE_SUPABASE_URL||'';
 const original=profile.avatar_url||profile.photo_url||'';
 if(action==='persist-current'&&(!original||ownedAvatarPath(original,base,user.id)))return {success:true,avatarUrl:original,changed:false};
 const source=action==='use-google'?(user.user_metadata?.avatar_url||user.user_metadata?.picture||''):original;
 const image=await fetchProviderAvatar(source);
 const path=user.id+'/imported_'+createHash('sha256').update(image.bytes).digest('hex').slice(0,32)+'.'+image.ext;
 const {error:uploadError}=await client.storage.from('avatars').upload(path,image.bytes,{upsert:true,contentType:image.mime,cacheControl:'0'});if(uploadError)throw Error('Unable to store the provider image.');
 const url=client.storage.from('avatars').getPublicUrl(path).data.publicUrl;
 let update=client.from('profiles').update({avatar_url:url,photo_url:url,updated_at:new Date().toISOString()}).eq('id',user.id);
 for(const field of ['avatar_url','photo_url'])update=profile[field]==null?update.is(field,null):update.eq(field,profile[field]);
 const {data,error}=await update.select('id').maybeSingle();
 if(error||!data) {
  const latest=await client.from('profiles').select('avatar_url,photo_url').eq('id',user.id).single();
  if(latest.error)throw Error('Unable to confirm avatar save. Uploaded file retained for safe recovery.');
  if(latest.data.avatar_url!==url&&latest.data.photo_url!==url)await client.storage.from('avatars').remove([path]);
  if(error)throw Error('Avatar reference was not saved.');
  return {success:true,avatarUrl:latest.data.avatar_url||latest.data.photo_url||'',changed:false,concurrentChange:true};
 }
 return {success:true,avatarUrl:url,changed:true};
}
export async function authorizedProfile(req:any,res:any) {
 res.setHeader('Cache-Control','no-store');
 const base=process.env.SUPABASE_URL||process.env.VITE_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!base||!key){res.status(503).json({error:'Server authentication is not configured.'});return null;}
 const authorization=req.headers?.authorization;
 const token=typeof authorization==='string'?authorization.match(/^Bearer\s+(\S+)$/i)?.[1]:null;
 if(!token){res.status(401).json({error:'Authentication required.'});return null;}
 const client=createClient(base,key,{auth:{persistSession:false,autoRefreshToken:false}});
 const identity=await client.auth.getUser(token);
 if(identity.error||!identity.data.user){res.status(401).json({error:'Invalid session.'});return null;}
 const user=identity.data.user;
 const result=await client.from('profiles').select('id,status,avatar_url,photo_url').eq('id',user.id).single();
 if(result.error){res.status(503).json({error:'Unable to read your profile.'});return null;}
 if(!user.email_confirmed_at||result.data.status!=='active'){res.status(403).json({error:'Verified active account required.'});return null;}
 return {client,user,profile:result.data};
}
