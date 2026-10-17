import {randomUUID} from 'node:crypto';
import {google} from 'googleapis';
import {createClient} from '@supabase/supabase-js';
import {authorizeAdmin} from '../api/_lib/authorize.js';
import {driveToken} from './courseMedia.js';

// This capability cannot be represented by a JSON or HTTP caller.
export const internalSubmissionSync=Symbol('internalSubmissionSync');
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SYNC_ERROR='Google Sheets sync failed. The saved responses are safe. Check the Google connection or quota, then retry Resync all.';

async function readPages(makeQuery:()=>any){
 const rows:any[]=[];
 for(let offset=0;;offset+=500){const result=await makeQuery().range(offset,offset+499);if(result.error)throw Error('Unable to read saved form data.');rows.push(...result.data);if(result.data.length<500)return rows;}
}
function answerText(value:any):string{
 if(value==null)return '';
 if(Array.isArray(value))return value.map(answerText).join(', ');
 if(typeof value==='object')return String(value.url||value.name||JSON.stringify(value));
 return String(value);
}

export default async function handler(req:any,res:any){
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='POST')return res.status(405).json({error:'Use POST.'});
 const internal=req[internalSubmissionSync]===true;
 const authorized=internal?null:await authorizeAdmin(req,res);
 if(!internal&&!authorized)return;
 const {formId,responseId}=req.body||{};
 if(typeof formId!=='string'||!UUID.test(formId)||(responseId!==undefined&&(typeof responseId!=='string'||!UUID.test(responseId))))return res.status(400).json({error:'Invalid form or response ID.'});
 const key=process.env.SUPABASE_SERVICE_ROLE_KEY,url=process.env.SUPABASE_URL||process.env.VITE_SUPABASE_URL;
 if(!key||!url)return res.status(503).json({error:'Server database is not configured.'});
 const db=authorized?.client||createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
 const initial=await db.from('forms').select('id').eq('id',formId).maybeSingle();
 if(initial.error||!initial.data)return res.status(404).json({error:'Form not found.'});
 if(responseId){const response=await db.from('form_responses').select('id').eq('form_id',formId).eq('id',responseId).maybeSingle();if(response.error||!response.data)return res.status(404).json({error:'Saved response not found for this form.'});}
 const token=randomUUID();let revision=0,owned=false,spreadsheetId:string|undefined,spreadsheetUrl:string|undefined;
 const finish=async(error:string|null=null)=>{const r=await db.rpc('finish_form_sheet_sync',{p_form_id:formId,p_token:token,p_revision:revision,p_error:error});if(r.error)throw Error('Unable to acknowledge the sync job.');return r.data;};
 try{
  const queued=await db.rpc('queue_form_sheet_sync',{p_form_id:formId,p_token:token});
  if(queued.error)throw Error('Unable to queue the sync job.');
  if(!queued.data.acquired)return res.status(202).json({success:true,pending:true,message:'A sync is already running. This request is queued; retry Resync all if it remains pending.'});
  owned=true;revision=queued.data.revision;
  // Re-read AFTER acquiring the lease: a previous owner may have created the file.
  const current=await db.from('forms').select('*').eq('id',formId).single();if(current.error)throw Error('Unable to read the form.');const form=current.data;
  let auth:any,userOwned=false;
  if(form.created_by&&process.env.GOOGLE_DRIVE_CLIENT_ID&&process.env.GOOGLE_DRIVE_CLIENT_SECRET){
   const connection=await db.from('course_drive_connections').select('owner_id').eq('owner_id',form.created_by).maybeSingle();if(connection.error)throw Error('Unable to read Google connection.');
   if(connection.data){auth=new google.auth.OAuth2();auth.setCredentials({access_token:await driveToken(db,form.created_by)});userOwned=true;}
  }
  const ownerEmail=process.env.GOOGLE_SPREADSHEET_OWNER_EMAIL;
  if(!auth&&process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL&&process.env.GOOGLE_PRIVATE_KEY&&ownerEmail)auth=new google.auth.GoogleAuth({credentials:{client_email:process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,private_key:process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g,'\n')},scopes:['https://www.googleapis.com/auth/spreadsheets','https://www.googleapis.com/auth/drive']});
  if(!auth){await finish('Google connection is not configured.');owned=false;return res.status(503).json({success:false,configured:false,message:'Connect the form owner Google Drive account, or configure a service account with spreadsheet access.'});}
  const sheets:any=google.sheets({version:'v4',auth}),drive=google.drive({version:'v3',auth});
  const deadline=Date.now()+85000,options={timeout:20000,retry:false,signal:AbortSignal.timeout(100000)};
  spreadsheetId=form.spreadsheet_id||undefined;spreadsheetUrl=form.spreadsheet_url||undefined;
  let sheet:any;
  if(!spreadsheetId){
   const created=await sheets.spreadsheets.create({requestBody:{properties:{title:`[DataCamp] ${form.title} (Responses)`},sheets:[{properties:{title:'Responses',gridProperties:{frozenRowCount:1}}}]}},options);
   spreadsheetId=created.data.spreadsheetId;spreadsheetUrl=created.data.spreadsheetUrl||`https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;sheet=created.data.sheets?.[0]?.properties;
   // Save the reference before formatting/writing so a provider retry reuses it.
   const saved=await db.from('forms').update({spreadsheet_id:spreadsheetId,spreadsheet_url:spreadsheetUrl,sheets_sync_enabled:true}).eq('id',formId);if(saved.error)throw Error('Unable to save spreadsheet reference.');
   if(!userOwned)await drive.permissions.create({fileId:spreadsheetId,sendNotificationEmail:false,requestBody:{role:'editor',type:'user',emailAddress:ownerEmail}},options);
  }
  if(!sheet){const info=await sheets.spreadsheets.get({spreadsheetId,fields:'sheets(properties)'},options);sheet=info.data.sheets?.find((s:any)=>s.properties?.title==='Responses')?.properties;}
  if(!sheet)throw Error('Responses tab is missing.');
  for(let pass=0;pass<3;pass++){
   if(Date.now()>deadline)break;
   const questions=await readPages(()=>db.from('form_questions').select('id,title').eq('form_id',formId).neq('type','section_header').order('position').order('id'));
   const responses=await readPages(()=>db.from('form_responses').select('id,submitted_at,respondent_email,respondent_id,form_answers(question_id,value),profiles:respondent_id(full_name,email)').eq('form_id',formId).order('submitted_at').order('id'));
   const rows=[['Submission ID','Submitted At','Respondent Name','Respondent Email',...questions.map(q=>q.title)],...responses.map(r=>{const answers=new Map(r.form_answers?.map((a:any)=>[a.question_id,a.value]));return[r.id,new Date(r.submitted_at).toISOString(),r.profiles?.full_name||'Anonymous',r.respondent_email||r.profiles?.email||'',...questions.map(q=>answerText(answers.get(q.id)))];})];
   const rowCount=Math.max(rows.length,sheet.gridProperties?.rowCount||1000),columnCount=Math.max(rows[0].length,sheet.gridProperties?.columnCount||26);
   if(rowCount*columnCount>10000000)throw Error('Spreadsheet cell limit exceeded.');
   if(Date.now()>deadline)break;
   // One atomic Google batch replaces ALL values, including old rows/columns.
   // stringValue preserves Arabic and treats =... as text, never as a formula.
   await sheets.spreadsheets.batchUpdate({spreadsheetId,requestBody:{requests:[
    {updateSheetProperties:{properties:{sheetId:sheet.sheetId,gridProperties:{rowCount,columnCount,frozenRowCount:1}},fields:'gridProperties'}},
    {updateCells:{range:{sheetId:sheet.sheetId},rows:rows.map(row=>({values:row.map(value=>({userEnteredValue:{stringValue:String(value)}}))})),fields:'userEnteredValue'}},
    {repeatCell:{range:{sheetId:sheet.sheetId,startRowIndex:0,endRowIndex:1,startColumnIndex:0,endColumnIndex:rows[0].length},cell:{userEnteredFormat:{backgroundColor:{red:0.2,green:0.18,blue:0.5},textFormat:{bold:true,foregroundColor:{red:1,green:1,blue:1}}}},fields:'userEnteredFormat(backgroundColor,textFormat)'}}
   ]}},options);
   const state=await finish();
   if(!state.owned)throw Error('Sync lease no longer belongs to this request.');
   if(!state.pending){owned=false;await db.from('sync_logs').insert({form_id:formId,response_id:responseId||null,status:'synced',details:{action:'canonical_sync',totalRows:responses.length,revision}});return res.status(200).json({success:true,pending:false,spreadsheetId,spreadsheetUrl,syncedRowsCount:responses.length});}
   revision=state.revision;
  }
  await finish('More requests are queued. Retry Resync all to finish.');owned=false;
  return res.status(202).json({success:true,pending:true,spreadsheetId,spreadsheetUrl,message:'More responses are queued. Retry Resync all to finish.'});
 }catch{
  // Provider errors can contain credentials/request bodies; never log or return them.
  if(owned)try{await finish(SYNC_ERROR);}catch{}
  await db.from('sync_logs').insert({form_id:formId,response_id:responseId||null,status:'failed',error:SYNC_ERROR});
  return res.status(502).json({success:false,error:SYNC_ERROR});
 }
}
