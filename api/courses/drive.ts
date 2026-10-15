import {randomBytes} from 'node:crypto';
import {authorizeAdmin} from '../_lib/authorize.js';
import {driveOAuth,serverClient,seal,sign,verify,site} from '../../server/courseMedia.js';
export default async function handler(req:any,res:any){
 res.setHeader('Cache-Control','no-store');res.setHeader('Referrer-Policy','no-referrer');
 if(req.method==='GET'){
  try{const query=new URL(req.url,'https://local.invalid').searchParams;const state=query.get('state')||'';const payload=verify(state);const cookie=String(req.headers?.cookie||'').split(';').find(c=>c.trim().startsWith('dc_drive_state='))?.trim().slice(15);if(!cookie||cookie!==payload.nonce||payload.purpose!=='drive-connect')throw Error();res.setHeader('Set-Cookie','dc_drive_state=; HttpOnly; SameSite=Lax; Secure; Path=/api/courses/drive; Max-Age=0');if(query.has('error'))throw Error();const client=serverClient();const p=await client.from('profiles').select('role,status').eq('id',payload.uid).single();if(p.error||p.data.status!=='active'||!['admin','super_admin'].includes(p.data.role))throw Error();const {tokens}=await driveOAuth().getToken(query.get('code')||'');if(!tokens.refresh_token||!tokens.scope?.split(' ').includes('https://www.googleapis.com/auth/drive.file'))throw Error();const saved=await client.from('course_drive_connections').upsert({owner_id:payload.uid,encrypted_refresh_token:seal(tokens.refresh_token),updated_at:new Date().toISOString()});if(saved.error)throw Error();res.statusCode=302;res.setHeader('Location',site()+'/admin/courses?drive=connected');return res.end();}
  catch{res.statusCode=302;res.setHeader('Location',site()+'/admin/courses?drive=failed');return res.end();}
 }
 if(req.method!=='POST')return res.status(405).json({error:'Use POST.'});
 const auth=await authorizeAdmin(req,res);if(!auth)return;
 if(req.body?.action==='status'){const row=await auth.client.from('course_drive_connections').select('owner_id').eq('owner_id',auth.user.id).maybeSingle();return res.status(row.error?503:200).json({connected:!!row.data,configured:!!(process.env.GOOGLE_DRIVE_CLIENT_ID&&process.env.GOOGLE_DRIVE_CLIENT_SECRET),maxBytes:2147483648});}
 if(req.body?.action!=='connect')return res.status(400).json({error:'Invalid action'});
 try{const oauth=driveOAuth(),nonce=randomBytes(24).toString('base64url');const state=sign({uid:auth.user.id,nonce,purpose:'drive-connect',exp:Date.now()+10*60*1000});res.setHeader('Set-Cookie','dc_drive_state='+nonce+'; HttpOnly; SameSite=Lax; Secure; Path=/api/courses/drive; Max-Age=600');return res.status(200).json({url:oauth.generateAuthUrl({scope:['https://www.googleapis.com/auth/drive.file'],access_type:'offline',prompt:'consent',state})});}
 catch{return res.status(503).json({error:'Google Drive OAuth must be configured on the server first.'});}
}
