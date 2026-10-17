// Reads approved QA secrets only to find their exact bytes elsewhere. Never emits a value.
import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';import {createHash} from 'node:crypto';
const run=process.argv[2];if(!/^[\w-]+$/.test(run))throw Error('Unique report label required');
const secrets=new Set();function collect(value,key=''){if(typeof value==='string'&&value.length>15&&/(secret|private_key|password|service_role|gemini_api_key)/i.test(key))secrets.add(value);else if(value&&typeof value==='object')for(const[k,v]of Object.entries(value))collect(v,k);}
for(const file of ['config.json','server-secrets.json','google-oauth.json','gemini-secrets.json','google-sheets.json']){const name='qa-audit/.runtime/final-hosted/'+file;if(fs.existsSync(name))collect(JSON.parse(fs.readFileSync(name,'utf8')));}
for(const value of [...secrets]){const escaped=JSON.stringify(value).slice(1,-1);if(escaped!==value)secrets.add(escaped);}
const git=(args,input)=>{const result=spawnSync('git',args,{input,encoding:null,maxBuffer:350*1024*1024});if(result.status)throw Error('Offline Git scan failed');return result.stdout;};
const findings=[],checked=new Set();let built=0,blobs=0;
function scan(data,location,scope){for(const secret of secrets)if(data.includes(Buffer.from(secret)))findings.push({scope,location,fingerprint:createHash('sha256').update(secret).digest('hex').slice(0,16)});}
for(const file of git(['ls-files','--cached','--others','--exclude-standard','-z']).toString().split('\0').filter(Boolean)){if(fs.existsSync(file)&&fs.statSync(file).isFile()){checked.add(file);scan(fs.readFileSync(file),file,'delivery-candidate');}}
function walk(dir){if(!fs.existsSync(dir))return;for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())walk(file);else{built++;scan(fs.readFileSync(file),file,'client-build');}}}
for(const dir of ['dist','qa-audit/site-build','qa-audit/.runtime/final-hosted/build','qa-audit/.runtime/BUG024_build_02','qa-audit/.runtime/BUG026_build'])walk(dir);
const objects=git(['rev-list','--objects','--all']).toString().trim().split('\n').map(line=>{const i=line.indexOf(' ');return{sha:line.split(' ')[0],name:i<0?'(object)':line.slice(i+1)};});
const batch=git(['cat-file','--batch'],objects.map(x=>x.sha).join('\n')+'\n');let offset=0;
for(const object of objects){const eol=batch.indexOf(10,offset),header=batch.subarray(offset,eol).toString().split(' '),size=Number(header[2]);if(!Number.isSafeInteger(size))throw Error('Invalid Git blob size');if(header[1]==='blob'){blobs++;scan(batch.subarray(eol+1,eol+1+size),object.name+'@'+object.sha.slice(0,12),'git-history');}offset=eol+1+size+1;}
const report={at:new Date().toISOString(),scope:{candidateFiles:checked.size,clientBuildFiles:built,gitBlobs:blobs,exactSecretValues:secrets.size},limitations:['Exact approved QA values only; generic pattern scan is a separate complementary check.','No history rewriting or credential rotation is performed.'],findings};
const file='qa-audit/final/evidence/'+run+'.json';if(fs.existsSync(file))throw Error('Evidence already exists');fs.writeFileSync(file,JSON.stringify(report,null,2));console.log(JSON.stringify({scope:report.scope,findings:findings.length,report:file}));if(findings.length)process.exitCode=1;
