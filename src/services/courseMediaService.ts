import {createMD5,createSHA256} from 'hash-wasm';
import {supabase} from '../lib/supabase';
import {authenticatedPost} from '../lib/apiClient';
import type {QuizQuestionText} from '../types';
export interface CourseAsset {id:string;lesson_id:string;kind:'video'|'material'|'subtitle';name:string;mime_type:string;size_bytes:number;url:string;language:string;}
export interface VideoPlan {summary:string;questions:{id:string;question:string;options:string[];correctIndex:number;explanation:string;translations?:Partial<Record<'ar'|'en',QuizQuestionText>>}[];exercise:null|{language:string;prompt:string;starterCode:string;solution:string;testCases:{description:string;input:string;expectedOutput:string}[]};}
export const courseAssets=async(lessonId:string)=>{const r=await supabase.from('course_assets').select('id,lesson_id,kind,name,mime_type,size_bytes,url,language').eq('lesson_id',lessonId).order('created_at');if(r.error)throw r.error;return r.data as CourseAsset[];};
export async function fileHashes(file:File,signal:AbortSignal,onProgress?:(p:number)=>void){if(file.size>2*1024*1024*1024||file.size===0)throw Error('Choose a nonempty file no larger than 2 GiB.');const md5=await createMD5(),sha=await createSHA256();md5.init();sha.init();for(let offset=0;offset<file.size;offset+=8*1024*1024){signal.throwIfAborted();const bytes=new Uint8Array(await file.slice(offset,offset+8*1024*1024).arrayBuffer());md5.update(bytes);sha.update(bytes);onProgress?.(Math.min(100,100*(offset+bytes.length)/file.size));}return{fingerprint:md5.digest(),sha256:sha.digest()};}
export async function driveUpload(file:File,lessonId:string,kind:string,hashes:{fingerprint:string;sha256:string},signal:AbortSignal,onProgress:(p:number)=>void,language='ar'){
 const start=()=>authenticatedPost('/api/courses/media',{action:'start',lessonId,kind,name:file.name,mimeType:file.type||'application/octet-stream',size:file.size,...hashes});
 let session=await start(),headers={Authorization:'Bearer '+session.accessToken},offset=0,fileId='',restarted=false;
 const position=async():Promise<void>=>{signal.throwIfAborted();const r=await fetch(session.uploadUrl,{method:'PUT',headers:{...headers,'Content-Range':'bytes */'+file.size},body:new Blob([]),signal});if(r.ok){fileId=(await r.json()).id;offset=file.size;return;}if([404,410].includes(r.status)&&!restarted){restarted=true;await authenticatedPost('/api/courses/media',{action:'restart',jobId:session.jobId});session=await start();headers={Authorization:'Bearer '+session.accessToken};offset=0;return position();}if(r.status!==308)throw Error('Drive upload is unavailable. Check free storage quota or reconnect Drive.');offset=Number(r.headers.get('range')?.match(/-(\d+)$/)?.[1]||-1)+1;if(!Number.isSafeInteger(offset)||offset<0||offset>file.size)throw Error('Invalid upload position');};
 const recoverPosition=async()=>{if(session.completedFileId){fileId=session.completedFileId;offset=file.size;return;}await position();};
 await recoverPosition();
 while(offset<file.size){signal.throwIfAborted();const end=Math.min(file.size,offset+8*1024*1024);let sent=false;
  for(let attempt=0;attempt<3&&!sent;attempt++){
   try{const r=await fetch(session.uploadUrl,{method:'PUT',headers:{...headers,'Content-Type':file.type||'application/octet-stream','Content-Range':`bytes ${offset}-${end-1}/${file.size}`},body:file.slice(offset,end),signal});if(r.ok){fileId=(await r.json()).id;offset=file.size;sent=true;}else if(r.status===308){const received=Number(r.headers.get('range')?.match(/-(\d+)$/)?.[1]||-1)+1;if(received<=offset)throw Error('Upload made no progress');offset=received;sent=true;}else throw Error('Upload failed');}
   catch(e){signal.throwIfAborted();if(attempt===2)throw e;await new Promise(resolve=>setTimeout(resolve,1000*(attempt+1)));session=await start();headers={Authorization:'Bearer '+session.accessToken};const previousJob=session.jobId;await recoverPosition();if(offset>=end||session.jobId!==previousJob)sent=true;}
  }
  onProgress(100*offset/file.size);
 }
 if(!fileId)throw Error('Provider did not confirm the completed file');
 signal.throwIfAborted();return authenticatedPost('/api/courses/media',{action:'finish',jobId:session.jobId,fileId,language});
}
export async function analyzeVideo(file:File,lessonId:string,sha256:string,signal:AbortSignal,onStatus:(label:string,p?:number)=>void):Promise<{jobId:string;plan:VideoPlan}>{
 onStatus('Starting analysis upload');const prepare=(restartJob?:string)=>authenticatedPost('/api/courses/analyze',{action:'prepare',lessonId,size:file.size,mimeType:file.type,sha256,restartJob});let session=await prepare();
 if(session.plan)return{jobId:session.jobId,plan:session.plan};let fileName=session.fileName;
 if(session.uploadUrl){try{let offset=0;let query=await fetch(session.uploadUrl,{method:'POST',headers:{'X-Goog-Upload-Command':'query'},signal});if([404,410].includes(query.status)){session=await prepare(session.jobId);query=await fetch(session.uploadUrl,{method:'POST',headers:{'X-Goog-Upload-Command':'query'},signal});}if(!query.ok)throw Error('Analysis upload unavailable. Retry later.');offset=Number(query.headers.get('x-goog-upload-size-received')||0);if(!Number.isSafeInteger(offset)||offset<0||offset>file.size)throw Error('Invalid analysis upload position');
  while(offset<file.size){signal.throwIfAborted();const end=Math.min(file.size,offset+8*1024*1024),last=end===file.size;const r=await fetch(session.uploadUrl,{method:'POST',headers:{'X-Goog-Upload-Offset':String(offset),'X-Goog-Upload-Command':last?'upload, finalize':'upload'},body:file.slice(offset,end),signal});if(!r.ok)throw Error('Video analysis upload failed. Reselect the same file to resume.');offset=end;onStatus('Uploading video to Gemini',100*offset/file.size);if(last)fileName=(await r.json()).file?.name;}
 }catch(error){signal.throwIfAborted();const recovered=await prepare();if(recovered.plan)return{jobId:recovered.jobId,plan:recovered.plan};if(!recovered.fileName)throw error;session=recovered;fileName=recovered.fileName;}}
 let status='processing';const deadline=Date.now()+20*60*1000;
 while(['processing','uploading','generating'].includes(status)){
  signal.throwIfAborted();const r=await authenticatedPost('/api/courses/analyze',{action:'status',jobId:session.jobId,fileName});signal.throwIfAborted();status=r.status;if(r.plan)return{jobId:session.jobId,plan:r.plan};if(status==='failed')throw Error('Gemini could not process this video.');if(Date.now()>deadline)throw Error('Video is still processing. Reselect the same video later to continue.');if(['processing','generating','uploading'].includes(status)){onStatus(status==='generating'?'Analyzing video':'Gemini is processing video');await new Promise<void>((resolve,reject)=>{const timer=setTimeout(done,5000);function done(){signal.removeEventListener('abort',aborted);resolve();}function aborted(){clearTimeout(timer);reject(signal.reason);}signal.addEventListener('abort',aborted,{once:true});});}
 }
 signal.throwIfAborted();onStatus('Generating quiz and coding exercise');const result=await authenticatedPost('/api/courses/analyze',{action:'generate',jobId:session.jobId});signal.throwIfAborted();return{jobId:session.jobId,plan:result.plan};
}
export async function openCourseAsset(assetId:string){return authenticatedPost<{url:string;expiresAt:number;downloadUrl:string}>('/api/courses/media',{action:'open',assetId});}
