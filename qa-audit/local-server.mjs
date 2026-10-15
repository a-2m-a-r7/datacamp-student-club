import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve('qa-audit/site-build');
const headers = JSON.parse(fs.readFileSync('vercel.json','utf8')).headers[0].headers;
const handlers = { '/api/courses/drive':'../api/courses/drive.ts','/api/courses/media':'../api/courses/media.ts','/api/courses/analyze':'../api/courses/analyze.ts', '/api/profile/avatar':'../api/profile/avatar.ts', '/api/admin/users':'../api/admin/users.ts', '/api/admin/backup':'../api/admin/backup.ts',
 '/api/forms/sync-sheet':'../api/forms/sync-sheet.ts', '/api/forms/submit':'../api/forms/submit.ts', '/api/ai/chat':'../api/ai/chat.ts',
 '/api/compiler/typescript':'../api/compiler/typescript.ts' };
const server = http.createServer(async (req,res) => {
 for(const header of headers)res.setHeader(header.key,header.value);
 const pathname = new URL(req.url,'http://localhost').pathname;
 if(pathname.startsWith('/api/')) {
  res.setHeader('Content-Type','application/json');
  res.status = code => { res.statusCode=code;return res; }; res.json = value => res.end(JSON.stringify(value));
  if(!handlers[pathname])return res.status(404).json({error:'API not found'});
  try {let body='';for await(const chunk of req){body+=chunk;if(body.length>1_000_000)return res.status(413).json({error:'Request too large'});}req.body=body?JSON.parse(body):{};
   await (await import(handlers[pathname])).default(req,res);
  }catch{if(!res.writableEnded)res.status(500).json({error:'Server operation failed'});}return;
 }
 let file;
 try{file=path.resolve(root,'.'+decodeURIComponent(pathname));}catch{res.statusCode=400;res.end();return;}
 if(!file.startsWith(root+path.sep)){file=path.join(root,'index.html');}
 if(!fs.existsSync(file)||fs.statSync(file).isDirectory())file=path.join(root,'index.html');
 const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2'};
 res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);
});
server.listen(3100,'127.0.0.1');
