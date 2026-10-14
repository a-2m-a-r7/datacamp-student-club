import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { profileSchema } from '../lib/schemas';
import { imageDataToBlob } from '../lib/imageData';
import { uploadFile, getStoragePath, deleteFile } from './storageService';

export function isOwnedProfilePhoto(url:string,uid:string):boolean {
 try {const u=new URL(url),base=new URL((import.meta as any).env.VITE_SUPABASE_URL);return u.origin===base.origin&&u.pathname.startsWith('/storage/v1/object/public/avatars/'+uid+'/')&&!decodeURIComponent(u.pathname).includes('..');}catch{return false;}
}
export async function saveOwnProfile(form:any,uid:string,savePhoto:boolean,oldPhoto:string) {
 if(!isSupabaseConfigured||!uid)throw Error('Sign in again to save your profile.');
 const values=profileSchema.parse(form);
 const phone=(values.phone||'').replace(/[\s-]/g,'');
 if(phone&&!/^(\+20|0)?1[0125][0-9]{8}$/.test(phone))throw Error('Invalid Egyptian phone format (+201XXXXXXXXX)');
 let photo=values.photoURL||'',uploaded='';
 if(savePhoto&&photo.startsWith('data:image')) {
  try {const blob=imageDataToBlob(photo);const ext=blob.type==='image/jpeg'?'jpg':blob.type.split('/')[1];uploaded=await uploadFile(getStoragePath('avatars',uid,'avatar_'+crypto.randomUUID()+'.'+ext),blob);photo=uploaded;}
  catch {throw Error('Avatar upload failed. No profile changes were saved.');}
 }
 if(savePhoto&&photo&&!isOwnedProfilePhoto(photo,uid))throw Error('Choose a device image or save your Google image first.');
 const payload:any={full_name:values.fullName,phone,faculty:values.faculty||'',academic_year:values.academicYear||'',updated_at:new Date().toISOString()};
 if(savePhoto){payload.avatar_url=photo;payload.photo_url=photo;}
 const {error}=await supabase.from('profiles').update(payload).eq('id',uid).select('id').single();
 if(error){if(uploaded)await deleteFile(uploaded).catch(()=>{});throw error;}
 let cleanupWarning=false;
 if(savePhoto&&oldPhoto&&oldPhoto!==photo&&isOwnedProfilePhoto(oldPhoto,uid))try{await deleteFile(oldPhoto);}catch{cleanupWarning=true;}
 return {photoURL:savePhoto?photo:undefined,cleanupWarning};
}
