// Authorized maintenance: preserve existing pictures, copy their bytes to owned Storage.
// Private backup contains identifiers and stays in the Git-ignored runtime directory.
import { createClient } from '@supabase/supabase-js';
import { mkdir, writeFile } from 'node:fs/promises';
import { persistProviderAvatar, ownedAvatarPath, MAX_AVATAR_BYTES } from '../api/_lib/profile-avatar';
const base=process.env.VITE_SUPABASE_URL!,key=process.env.SUPABASE_SERVICE_ROLE_KEY!;
if(!base||!key)throw Error('Private server configuration required.');
const client=createClient(base,key,{auth:{persistSession:false,autoRefreshToken:false}});
const {data:bucket,error:bucketError}=await client.storage.getBucket('avatars');
if(bucketError||bucket?.file_size_limit!==MAX_AVATAR_BYTES||!['image/png','image/jpeg','image/webp'].every(m=>bucket.allowed_mime_types?.includes(m)))throw Error('Apply the profile-photo bucket migration first.');
const fields='id,status,role,full_name,phone,faculty,academic_year,avatar_url,photo_url';
const before=await client.from('profiles').select(fields);if(before.error)throw Error('Profile read failed.');
await mkdir('qa-audit/.runtime',{recursive:true});
await writeFile('qa-audit/.runtime/avatar-backup-'+Date.now()+'.json',JSON.stringify(before.data,null,2));
let migrated=0,unchanged=0,failed=0;
for(const row of before.data){
 try{const result=await persistProviderAvatar(client,{id:row.id},row);if(result.changed)migrated++;else unchanged++;}
 catch{failed++;}
}
const after=await client.from('profiles').select(fields);if(after.error)throw Error('Verification read failed.');
const protectedFields=['id','status','role','full_name','phone','faculty','academic_year'];
const recordsPreserved=before.data.length===after.data.length&&before.data.every(a=>{const b=after.data.find(b=>b.id===a.id);return b&&protectedFields.every(k=>a[k]===b[k]);});
let stored=0,filesVerified=0;
for(const row of after.data){const url=row.avatar_url||row.photo_url||'';if(!ownedAvatarPath(url,base,row.id))continue;stored++;
 const r=await fetch(url,{cache:'no-store',signal:AbortSignal.timeout(15000)});const bytes=await r.arrayBuffer();
 if(r.ok&&['image/png','image/jpeg','image/webp'].includes(r.headers.get('content-type')||'')&&bytes.byteLength>0&&bytes.byteLength<=MAX_AVATAR_BYTES&&row.avatar_url===row.photo_url)filesVerified++;
}
const anonymous=createClient(base,process.env.VITE_SUPABASE_ANON_KEY!,{auth:{persistSession:false}});
const listing=await anonymous.storage.from('avatars').list('',{limit:100});
const result={checkedAt:new Date().toISOString(),profiles:after.data.length,migrated,unchanged,failed,stored,filesVerified,recordsPreserved,anonymousDirectoryHidden:!listing.error&&listing.data.length===0,bucketLimitBytes:bucket.file_size_limit,allowedMimeTypes:bucket.allowed_mime_types};
await writeFile('qa-audit/profile-photo-live-results.json',JSON.stringify(result,null,2));
console.log(JSON.stringify(result));
if(failed||!recordsPreserved||stored!==after.data.length||filesVerified!==stored||!result.anonymousDirectoryHidden)process.exitCode=1;
