import {randomUUID} from 'node:crypto';
import {authorizeAdmin} from '../_lib/authorize.js';
import {driveToken,driveFetch,uploadLocation,validateCourseFile,UUID,FILE_ID,readableAsset,memberIdentity,sign,verify,serverClient,boundedBytes} from '../../server/courseMedia.js';
export const config={maxDuration:60};
const MAX_RANGE=3*1024*1024;
export default async function handler(req:any,res:any){
 res.setHeader('Cache-Control','no-store');res.setHeader('Referrer-Policy','no-referrer');
 if(req.method==='GET'){
  try{const t=verify(new URL(req.url,'https://local.invalid').searchParams.get('ticket')||'');if(t.purpose!=='course-file')throw Error('Invalid file ticket');const client=serverClient(),asset=await readableAsset(client,t.asset,t.uid);if(asset.provider!=='drive'||!FILE_ID.test(asset.file_id))throw Error('File source unavailable');const token=await driveToken(client,asset.owner_id);const size=Number(asset.size_bytes);
   const range=String(req.headers?.range||'').match(/^bytes=(\d+)-(\d*)$/);if(req.headers?.range&&!range){res.setHeader('Content-Range','bytes */'+size);return res.status(416).end();}
   const start=range?Number(range[1]):0;if(!Number.isSafeInteger(start)||start>=size){res.setHeader('Content-Range','bytes */'+size);return res.status(416).end();}
   const end=Math.min(size-1,start+MAX_RANGE-1,range?.[2]?Number(range[2]):size-1);if(end<start)throw Error('Invalid range');
   const r=await driveFetch('files/'+asset.file_id+'?alt=media',token,{headers:{Range:`bytes=${start}-${end}`}});
   if(Number(r.headers.get('content-length'))>MAX_RANGE||(r.status===200&&size>MAX_RANGE)){await r.body?.cancel();throw Error('File provider did not honor the requested range.');}
   const bytes=await boundedBytes(r,end-start+1);if(!bytes.length)throw Error('Invalid provider response');
   res.setHeader('Content-Type',asset.kind==='subtitle'?'text/plain; charset=utf-8':asset.kind==='video'?asset.mime_type:'application/octet-stream');
   res.setHeader('Accept-Ranges','bytes');res.setHeader('Content-Length',String(bytes.length));
   if(asset.kind==='material')res.setHeader('Content-Disposition',"attachment; filename*=UTF-8''"+encodeURIComponent(asset.name));
   if(range||size>MAX_RANGE){res.setHeader('Content-Range',`bytes ${start}-${start+bytes.length-1}/${size}`);res.statusCode=206;}else res.statusCode=200;
   return res.end(bytes);
  }catch(e:any){return res.status(403).json({error:e.message||'File access unavailable'});}
 }
 if(req.method!=='POST')return res.status(405).json({error:'Use POST'});
 if(req.body?.action==='open'){
  try{const {client,uid}=await memberIdentity(req);const asset=await readableAsset(client,req.body.assetId,uid);const exp=Date.now()+60*60*1000;return res.status(200).json({url:'/api/courses/media?ticket='+sign({asset:asset.id,uid,exp,purpose:'course-file'}),expiresAt:exp,downloadUrl:asset.url});}
  catch(e:any){return res.status(403).json({error:e.message||'File access unavailable'});}
 }
 const auth=await authorizeAdmin(req,res);if(!auth)return;
 try{
  const body=req.body||{};
  if(body.action==='restart'){
   if(!UUID.test(body.jobId))throw Error('Invalid upload reference');
   const saved=await auth.client.from('course_upload_jobs').update({status:'expired'}).eq('id',body.jobId).eq('owner_id',auth.user.id).eq('status','uploading');
   if(saved.error)throw Error('Unable to restart upload');return res.status(200).json({success:true});
  }
  if(body.action==='start'){
   validateCourseFile(body.name,body.mimeType,body.size,body.kind);if(!UUID.test(body.lessonId)||! /^[a-f0-9]{32}$/.test(body.fingerprint||'')||! /^[a-f0-9]{64}$/.test(body.sha256||''))throw Error('Invalid upload');
   const lesson=await auth.client.from('lessons').select('id,course_id').eq('id',body.lessonId).single();if(lesson.error)throw Error('Save the lesson before uploading files.');
   const token=await driveToken(auth.client,auth.user.id);
   const prior=await auth.client.from('course_upload_jobs').select('*').eq('owner_id',auth.user.id).eq('lesson_id',body.lessonId).eq('fingerprint',body.fingerprint).eq('sha256',body.sha256).eq('name',body.name).eq('mime_type',body.mimeType).eq('size_bytes',body.size).eq('kind',body.kind).eq('status','uploading').gte('created_at',new Date(Date.now()-6*24*60*60*1000).toISOString()).order('created_at',{ascending:false}).limit(1).maybeSingle();if(prior.error)throw Error('Unable to read upload state');
   if(prior.data&&prior.data.kind===body.kind){
    // Drive may omit CORS headers from completed resumable sessions. Recover the
    // acknowledgement on the server; finish still verifies ownership and hashes.
    const url=uploadLocation(prior.data.upload_url);
    const check=await fetch(url,{method:'PUT',headers:{Authorization:'Bearer '+token,'Content-Range':'bytes */'+body.size},body:new Blob([]),signal:AbortSignal.timeout(25000)});
    let completedFileId:string|undefined;
    if(check.ok){const metadata=JSON.parse((await boundedBytes(check,65536)).toString('utf8'));if(!FILE_ID.test(metadata.id||''))throw Error('Invalid completed upload acknowledgement');completedFileId=metadata.id;}
    else{await check.body?.cancel();if(![308,404,410].includes(check.status))throw Error('Unable to recover Drive upload status. Retry or reconnect.');}
    return res.status(200).json({jobId:prior.data.id,uploadUrl:url,accessToken:token,resuming:true,completedFileId});
   }
   const id=randomUUID();const r=await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id,size,mimeType',{
    method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json','X-Upload-Content-Type':body.mimeType||'application/octet-stream','X-Upload-Content-Length':String(body.size)},
    body:JSON.stringify({name:body.name,mimeType:body.mimeType||'application/octet-stream',appProperties:{dcUpload:id,dcLesson:body.lessonId}}),signal:AbortSignal.timeout(20000)});
   if(!r.ok)throw Error('Unable to start Drive upload. Check API setup and free storage quota.');const uploadUrl=uploadLocation(r.headers.get('location')||'');
   const saved=await auth.client.from('course_upload_jobs').insert({id,owner_id:auth.user.id,lesson_id:body.lessonId,kind:body.kind,name:body.name,mime_type:body.mimeType||'application/octet-stream',size_bytes:body.size,fingerprint:body.fingerprint,sha256:body.sha256,upload_url:uploadUrl});if(saved.error)throw Error('Upload state could not be saved');
   return res.status(200).json({jobId:id,uploadUrl,accessToken:token,resuming:false});
  }
  if(body.action==='finish'){
   if(!UUID.test(body.jobId)||!FILE_ID.test(body.fileId))throw Error('Invalid upload reference');const j=await auth.client.from('course_upload_jobs').select('*').eq('id',body.jobId).eq('owner_id',auth.user.id).single();if(j.error)throw Error('Upload not found');
   if(j.data.status==='complete')return res.status(200).json({assetId:j.data.asset_id,success:true});
   const job=j.data,token=await driveToken(auth.client,auth.user.id);const file=await(await driveFetch('files/'+body.fileId+'?fields=id,name,size,mimeType,md5Checksum,appProperties,ownedByMe',token)).json();
   if(!file.ownedByMe||file.appProperties?.dcUpload!==job.id||file.appProperties?.dcLesson!==job.lesson_id||Number(file.size)!==Number(job.size_bytes)||file.name!==job.name||file.mimeType!==job.mime_type||file.md5Checksum!==job.fingerprint)throw Error('Uploaded file does not match this lesson');
   validateCourseFile(file.name,file.mimeType,Number(file.size),job.kind);
   if(job.kind==='subtitle'){
    const bytes=await boundedBytes(await driveFetch('files/'+file.id+'?alt=media',token),5*1024*1024);let text:string;
    try{text=new TextDecoder('utf-8',{fatal:true}).decode(bytes);}catch{throw Error('Save subtitles as UTF-8 SRT or VTT.');}
    if(!/\d{1,2}:\d{2}(?::\d{2})?[.,]\d{3}\s+-->/.test(text))throw Error('Subtitle file has no valid timed captions.');
   }
   if(job.kind==='video'){const header=await boundedBytes(await driveFetch('files/'+file.id+'?alt=media',token,{headers:{Range:'bytes=0-31'}}),32);const mp4=['ftyp','moov','mdat','wide'].includes(header.toString('ascii',4,8));const webm=header.subarray(0,4).equals(Buffer.from([26,69,223,163]));if(!(file.mimeType==='video/webm'?webm:mp4))throw Error('File is not a supported video');}
   await driveFetch('files/'+file.id+'/permissions',token,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:'anyone',role:'reader'})});
   const l=await auth.client.from('lessons').select('id,course_id').eq('id',job.lesson_id).single();if(l.error)throw Error('Lesson no longer exists');
   const asset={id:job.id,course_id:l.data.course_id,lesson_id:l.data.id,owner_id:auth.user.id,kind:job.kind,provider:'drive',name:file.name,mime_type:file.mimeType,size_bytes:Number(file.size),file_id:file.id,url:'https://drive.google.com/file/d/'+file.id+'/view',fingerprint:job.fingerprint,sha256:job.sha256,language:typeof body.language==='string'&&/^[a-z]{2}(-[A-Z]{2})?$/.test(body.language)?body.language:'ar'};
   const saved=await auth.client.from('course_assets').upsert(asset,{onConflict:'id'});if(saved.error)throw Error('File uploaded, but its lesson reference was not saved. Retry finishing.');
   if(job.kind==='video'){const update=await auth.client.from('lessons').update({video_asset_id:asset.id,type:'video',video_url:'https://drive.google.com/file/d/'+file.id+'/preview'}).eq('id',l.data.id);if(update.error)throw Error('Video reference could not be saved. Retry finishing.');}
   const done=await auth.client.from('course_upload_jobs').update({status:'complete',asset_id:asset.id}).eq('id',job.id);if(done.error)throw Error('File saved. Upload status update failed; retry safely.');
   return res.status(200).json({success:true,assetId:asset.id});
  }
  return res.status(400).json({error:'Invalid action'});
 }catch(e:any){return res.status(400).json({error:e.message||'Course file operation failed'});}
}
