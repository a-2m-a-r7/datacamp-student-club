// Offline, value-redacting scan: never prints a matched value or a source line.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const git=args=>{const r=spawnSync('git',args,{encoding:null,maxBuffer:150*1024*1024});if(r.status!==0)throw Error('Offline Git inspection failed');return r.stdout;};
const findings=[];
const patterns=[
 ['google-api-key',/AIza[0-9A-Za-z_-]{35}/g],
 ['google-oauth-secret',/GOCSPX-[0-9A-Za-z_-]{28,}/g],
 ['google-oauth-access-token',/ya29\.[0-9A-Za-z_.-]{20,}/g],
 ['supabase-secret-key',/sb_secret_[0-9A-Za-z_-]{25,}/g],
 ['github-token',/\b(?:ghp_[0-9A-Za-z]{30,}|github_pat_[0-9A-Za-z_]{55,})\b/g],
 ['private-key',/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----\s+[A-Za-z0-9+/=\r\n]{64,}-----END (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g],
 ['service-role-jwt',/eyJ[0-9A-Za-z_-]+\.[0-9A-Za-z_-]+\.[0-9A-Za-z_-]{20,}/g],
];
function scan(data,location,scope){const source=data.toString('utf8');for(const[type,pattern]of patterns){pattern.lastIndex=0;for(const match of source.matchAll(pattern)){
 if(type==='service-role-jwt'){try{if(JSON.parse(Buffer.from(match[0].split('.')[1],'base64url').toString()).role!=='service_role')continue;}catch{continue;}}
 findings.push({scope,location,type,line:source.slice(0,match.index).split('\n').length,fingerprint:createHash('sha256').update(match[0]).digest('hex').slice(0,16)});
}}}
const tracked=[...new Set(git(['ls-files','--cached','--others','--exclude-standard','-z']).toString().split('\0').filter(Boolean))];
for(const name of tracked){if(fs.existsSync(name)&&fs.statSync(name).isFile())scan(fs.readFileSync(name),name,'working-tree-tracked');}
const dirs=['dist','qa-audit/.runtime/BUG-007-build','qa-audit/site-build'];let built=0;
function walk(dir){if(!fs.existsSync(dir))return;for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())walk(file);else{built++;scan(fs.readFileSync(file),file,'built-assets');}}}
dirs.forEach(walk);
const objects=git(['rev-list','--objects','--all']).toString().trim().split('\n').map(line=>{const sep=line.indexOf(' ');return{sha:sep<0?line:line.slice(0,sep),name:sep<0?'(git-object)':line.slice(sep+1)};});
const batch=spawnSync('git',['cat-file','--batch'],{input:objects.map(o=>o.sha).join('\n')+'\n',encoding:null,maxBuffer:200*1024*1024});
if(batch.status!==0)throw Error('Git object scan failed');
let offset=0,blobs=0;for(const object of objects){const eol=batch.stdout.indexOf(10,offset);if(eol<0)throw Error('Truncated Git object data');const header=batch.stdout.subarray(offset,eol).toString().split(' ');const size=Number(header[2]);if(!Number.isSafeInteger(size))throw Error('Unexpected Git object header');const data=batch.stdout.subarray(eol+1,eol+1+size);if(header[1]==='blob'){blobs++;scan(data,object.name+'@'+object.sha.slice(0,12),'git-history-all-refs');}offset=eol+1+size+1;}
const report={at:new Date().toISOString(),scope:{tracked:tracked.length,builtFiles:built,gitBlobs:blobs},limitations:['Pattern-based scan cannot prove absence of every possible secret.','A finding is redacted and requires review/rotation; history is never rewritten by this script.','Ignored .env, OAuth credentials and runtime secrets are intentionally not scanned or exposed.'],findings};
const label=process.argv[2]||'20261016-secrets-scan';if(!/^[\w-]+$/.test(label))throw Error('Invalid scan label');const output='qa-audit/final/evidence/'+label+'.json';if(fs.existsSync(output))throw Error('Keep prior scan evidence; use a new label');
fs.mkdirSync('qa-audit/final/evidence',{recursive:true});fs.writeFileSync(output,JSON.stringify(report,null,2));
console.log(JSON.stringify({scope:report.scope,findings:findings.length,types:[...new Set(findings.map(f=>f.type))],report:output}));
if(findings.length)process.exitCode=1;
