import {randomUUID} from 'node:crypto';
import {authorizeAdmin} from '../_lib/authorize';
import {UUID,MAX_COURSE_FILE,VIDEO_TYPES,geminiLocation} from '../../server/courseMedia';
import {parseLessonPlan,lessonVideoPrompt} from '../../server/courseAi';
export const config={maxDuration:300};
export default async function handler(req:any,res:any){
 res.setHeader('Cache-Control','no-store');if(req.method!=='POST')return res.status(405).json({error:'Use POST'});
 const auth=await authorizeAdmin(req,res);if(!auth)return;
 const key=process.env.GEMINI_API_KEY;if(!key||process.env.GEMINI_COURSE_ENABLED!=='true')return res.status(503).json({error:'Course video analysis is not enabled with a verified free-tier Gemini project.'});
 const gFetch=async(path:string,options:RequestInit={})=>{const r=await fetch('https://generativelanguage.googleapis.com/'+path,{...options,headers:{'x-goog-api-key':key,...options.headers},signal:options.signal||AbortSignal.timeout(20000)});if(!r.ok){await r.body?.cancel();throw Error(r.status===429?'Gemini free quota reached. Retry later; no generated lessons were saved.':'Video analysis provider failed. Retry; no generated lessons were saved.');}return r;};
 const body=req.body||{};
 try{
  if(body.action==='latest'){if(!UUID.test(body.lessonId))throw Error('Invalid lesson');const row=await auth.client.from('lesson_analysis_jobs').select('id,status,plan,result').eq('owner_id',auth.user.id).eq('lesson_id',body.lessonId).order('created_at',{ascending:false}).limit(1).maybeSingle();if(row.error)throw Error('Unable to load analysis');return res.status(200).json(row.data||{status:'none'});}
  if(body.action==='prepare'){
   if(!UUID.test(body.lessonId)||!Number.isSafeInteger(body.size)||body.size<1||body.size>MAX_COURSE_FILE||!VIDEO_TYPES.has(body.mimeType))throw Error('Choose a video no larger than 2 GiB.');
   const source=await auth.client.from('lessons').select('id,type,updated_at,video_asset_id').eq('id',body.lessonId).single();if(source.error||source.data.type!=='video'||!source.data.video_asset_id)throw Error('Save and upload the lesson video before analyzing it.');
   const asset=await auth.client.from('course_assets').select('size_bytes,mime_type,sha256').eq('id',source.data.video_asset_id).single();if(asset.error||Number(asset.data.size_bytes)!==body.size||asset.data.mime_type!==body.mimeType||asset.data.sha256!==body.sha256)throw Error('Select the same video file that is saved in this lesson.');
   const linked=await auth.client.from('lessons').select('id',{count:'exact',head:true}).eq('source_lesson_id',body.lessonId);if(linked.error||(linked.count||0)>0)throw Error('This video already has generated lessons. Edit them instead of adding duplicates.');
   if(body.restartJob){if(!UUID.test(body.restartJob))throw Error('Invalid analysis reference');const expired=await auth.client.from('lesson_analysis_jobs').update({status:'expired'}).eq('id',body.restartJob).eq('owner_id',auth.user.id).eq('lesson_id',body.lessonId).eq('status','uploading');if(expired.error)throw Error('Unable to restart analysis upload');}
   const prior=await auth.client.from('lesson_analysis_jobs').select('*').eq('owner_id',auth.user.id).eq('lesson_id',body.lessonId).eq('sha256',body.sha256).eq('source_updated_at',source.data.updated_at).in('status',['uploading','processing','active','generating','ready','applied']).gte('created_at',new Date(Date.now()-24*60*60*1000).toISOString()).order('created_at',{ascending:false}).limit(1).maybeSingle();if(prior.error)throw Error('Unable to read previous analysis');if(prior.data)return res.status(200).json({jobId:prior.data.id,uploadUrl:prior.data.status==='uploading'?geminiLocation(prior.data.upload_url):undefined,fileName:prior.data.file_name,status:prior.data.status,plan:prior.data.plan});
   const jobs=await auth.client.from('lesson_analysis_jobs').select('id',{count:'exact',head:true}).eq('owner_id',auth.user.id).gte('created_at',new Date(Date.now()-24*60*60*1000).toISOString());if(jobs.error)throw Error('Unable to verify the daily limit');if((jobs.count||0)>=5)return res.status(429).json({error:'Daily course analysis limit reached (5 videos).'});
   const id=randomUUID();const r=await gFetch('upload/v1beta/files',{method:'POST',headers:{'Content-Type':'application/json','X-Goog-Upload-Protocol':'resumable','X-Goog-Upload-Command':'start','X-Goog-Upload-Header-Content-Length':String(body.size),'X-Goog-Upload-Header-Content-Type':body.mimeType},body:JSON.stringify({file:{display_name:'dc-course-'+id}})});
   const uploadUrl=geminiLocation(r.headers.get('x-goog-upload-url')||'');const saved=await auth.client.from('lesson_analysis_jobs').insert({id,owner_id:auth.user.id,lesson_id:body.lessonId,size_bytes:body.size,mime_type:body.mimeType,sha256:body.sha256,source_updated_at:source.data.updated_at,upload_url:uploadUrl});if(saved.error)throw Error('Unable to save analysis job');
   return res.status(200).json({jobId:id,uploadUrl});
  }
  if(!UUID.test(body.jobId))throw Error('Invalid analysis reference');
  const loaded=await auth.client.from('lesson_analysis_jobs').select('*').eq('id',body.jobId).eq('owner_id',auth.user.id).single();if(loaded.error)throw Error('Analysis not found');const job=loaded.data;
  if(body.action==='status'){
   if(['ready','applied'].includes(job.status))return res.status(200).json({status:job.status,plan:job.plan,result:job.result});
   if(job.status==='generating'&&Date.now()-Date.parse(job.updated_at)<10*60*1000)return res.status(200).json({status:'generating'});
   if(job.status==='generating'){await auth.client.from('lesson_analysis_jobs').update({status:'active',updated_at:new Date().toISOString()}).eq('id',job.id).eq('updated_at',job.updated_at);return res.status(200).json({status:'active'});}
   let name=job.file_name||body.fileName;
   // A tab may close after Google finalizes the file but before its name reaches our server.
   if(!name){let pageToken='';for(let page=0;page<3&&!name;page++){const list=await(await gFetch('v1beta/files?pageSize=100'+(pageToken?'&pageToken='+encodeURIComponent(pageToken):''))).json();name=list.files?.find((f:any)=>f.displayName==='dc-course-'+job.id)?.name;pageToken=list.nextPageToken||'';if(!pageToken)break;}}
   if(typeof name!=='string'||!/^files\/[\w-]{1,100}$/.test(name))throw Error('The analysis upload is incomplete. Reselect the same video to resume.');
   const f=await(await gFetch('v1beta/'+name)).json();if(f.displayName!=='dc-course-'+job.id||Number(f.sizeBytes)!==Number(job.size_bytes)||f.mimeType!==job.mime_type||Buffer.from(f.sha256Hash||'','base64').toString('hex')!==job.sha256)throw Error('Analysis file does not match the uploaded video');
   const status=f.state==='ACTIVE'?'active':f.state==='FAILED'?'failed':'processing';
   const saved=await auth.client.from('lesson_analysis_jobs').update({file_name:name,file_uri:f.uri,status,updated_at:new Date().toISOString()}).eq('id',job.id).in('status',['uploading','processing','failed','active']);if(saved.error)throw Error('Unable to save processing status');
   return res.status(200).json({status});
  }
  if(body.action==='generate'){
   if(['ready','applied'].includes(job.status))return res.status(200).json({status:job.status,plan:job.plan});
   if(job.status!=='active')throw Error('Video is still processing or already being analyzed.');
   const claim=await auth.client.from('lesson_analysis_jobs').update({status:'generating',updated_at:new Date().toISOString()}).eq('id',job.id).eq('status','active').select('id').maybeSingle();if(claim.error||!claim.data)throw Error('Analysis is already running');
   try{
    const r=await gFetch('v1beta/models/'+encodeURIComponent(process.env.GEMINI_COURSE_MODEL||'gemini-2.5-flash')+':generateContent',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({systemInstruction:{parts:[{text:lessonVideoPrompt}]},contents:[{role:'user',parts:[{fileData:{fileUri:job.file_uri,mimeType:job.mime_type}},{text:'Create the learning plan for this video.'}]}],generationConfig:{temperature:0.2,maxOutputTokens:12000,responseMimeType:'application/json'}}),signal:AbortSignal.timeout(240000)});
    const data=await r.json(),text=(data.candidates?.[0]?.content?.parts||[]).filter((p:any)=>!p.thought).map((p:any)=>p.text||'').join('');const plan=parseLessonPlan(JSON.parse(text));
    const saved=await auth.client.from('lesson_analysis_jobs').update({status:'ready',plan,updated_at:new Date().toISOString()}).eq('id',job.id).eq('status','generating');if(saved.error)throw Error('Analysis completed but could not be saved');
    return res.status(200).json({status:'ready',plan});
   }catch{await auth.client.from('lesson_analysis_jobs').update({status:'active',error:'Generation failed; retry after checking quota.',updated_at:new Date().toISOString()}).eq('id',job.id).eq('status','generating');throw Error('Video generation failed or returned an invalid plan. No quiz or coding lesson was added. Retry later.');}
  }
  if(body.action==='apply'){if(job.status==='applied')return res.status(200).json({success:true,result:job.result});parseLessonPlan(job.plan);const result=await auth.client.rpc('apply_lesson_analysis',{p_job_id:job.id});if(result.error)throw result.error;return res.status(200).json({success:true,result:result.data});}
  return res.status(400).json({error:'Invalid action'});
 }catch(e:any){return res.status(400).json({error:e.message||'Video analysis failed'});}
}
