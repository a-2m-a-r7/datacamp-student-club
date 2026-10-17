import http from 'node:http';import fs from 'node:fs';import path from 'node:path';
import {qaKeySetup} from './qa-key-setup.mjs';
import {qaGeminiSetup} from './qa-gemini-setup.mjs';
const root=path.resolve('qa-audit/.runtime/final-hosted/build');
const headers=JSON.parse(fs.readFileSync('vercel.json','utf8')).headers[0].headers;
const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.woff2':'font/woff2','.txt':'text/plain; charset=utf-8'};
const handlers={'/api/courses/drive':'../../api/courses/drive.ts','/api/courses/media':'../../api/courses/media.ts','/api/courses/analyze':'../../api/courses/analyze.ts','/api/profile/avatar':'../../api/profile/avatar.ts','/api/admin/users':'../../api/admin/users.ts','/api/admin/backup':'../../api/admin/backup.ts','/api/forms/sync-sheet':'../../api/forms/sync-sheet.ts','/api/forms/submit':'../../api/forms/submit.ts','/api/ai/chat':'../../api/ai/chat.ts','/api/compiler/typescript':'../../api/compiler/typescript.ts'};
http.createServer(async(req,res)=>{
 for(const h of headers)res.setHeader(h.key,h.value);
 res.setHeader('Cache-Control','no-store');
 const url=new URL(req.url,'http://127.0.0.1:3200');
 if(await qaKeySetup(req,res))return;
 if(await qaGeminiSetup(req,res))return;
 if(url.pathname.startsWith('/api/')){
  res.setHeader('Content-Type','application/json');res.status=code=>{res.statusCode=code;return res;};res.json=value=>res.end(JSON.stringify(value));
  if(!process.env.SUPABASE_SERVICE_ROLE_KEY)return res.status(503).json({error:'QA hosted browser has no private server credentials'});
  if(!handlers[url.pathname])return res.status(404).json({error:'API not found'});
  try{let body='';for await(const chunk of req){body+=chunk;if(Buffer.byteLength(body)>1_000_000)return res.status(413).json({error:'Request too large'});}req.body=body?JSON.parse(body):{};await(await import(handlers[url.pathname])).default(req,res);}
  catch{if(!res.writableEnded)res.status(500).json({error:'QA server operation failed'});}return;
 }
 let file;try{file=path.resolve(root,'.'+decodeURIComponent(url.pathname));}catch{res.statusCode=400;res.end();return;}
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||fs.statSync(file).isDirectory())file=path.join(root,'index.html');
 res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);
}).listen(3200,'127.0.0.1');
