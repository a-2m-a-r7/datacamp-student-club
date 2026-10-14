// Authorized maintenance for legacy course text only. Default is a dry run.
// REST fallback when the owner's Dashboard is unavailable; no SQL/auth bypass.
const fs=require('node:fs'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const base=process.env.VITE_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!base||!key)throw Error('Missing local server configuration');
const unicode=[8364,8218,402,8222,8230,8224,8225,710,8240,352,8249,338,381,8216,8217,8220,8221,8226,8211,8212,732,8482,353,8250,339,382,376];
const bytes=[128,130,131,132,133,134,135,136,137,138,139,140,142,145,146,147,148,149,150,151,152,153,154,155,156,158,159];
const mapping=new Map(unicode.map((point,index)=>[point,bytes[index]]));
function recover(value){
 if(typeof value!=='string'||!/[ØÙ]/.test(value))return value;
 const values=[];for(const char of value){const point=char.codePointAt(0);if(point<=255)values.push(point);else if(mapping.has(point))values.push(mapping.get(point));else return value;}
 try{const candidate=new TextDecoder('utf-8',{fatal:true}).decode(new Uint8Array(values));return /[\u0600-\u06ff]/.test(candidate)?candidate:value;}catch{return value;}
}
const sample='QA_TEST من أساسيات بايثون إلى البيانات';assert.equal(recover(Buffer.from(sample,'utf8').toString('latin1')),sample);
assert.equal(recover(Buffer.from(sample,'utf8').toString('latin1').replaceAll(String.fromCharCode(133),'…')),sample);
for(const value of ['QA_TEST عربي صحيح','QA_TEST Øresund','QA_TEST العربية Ø§'])assert.equal(recover(value),value);
const headers={apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json'};
async function read(table,columns){const rows=[];for(let offset=0;;offset+=500){const r=await fetch(`${base}/rest/v1/${table}?select=${columns}&order=id&offset=${offset}&limit=500`,{headers});if(!r.ok)throw Error('Read failed: '+r.status);const data=await r.json();rows.push(...data);if(data.length<500)return rows;}}
(async()=>{
 const plans=[];const definitions=[['courses',['title','description','short_description','instructor_name','instructor_title']],['lessons',['title','content']]];
 for(const [table,columns] of definitions){const fields=table==='courses'?['id',...columns,'rating','rating_count','updated_at']:['id',...columns];
  for(const row of await read(table,fields.join(','))){const patch={};for(const column of columns){const value=recover(row[column]);if(value!==row[column])patch[column]=value;}
   if(table==='courses'&&Number(row.rating_count||0)===0&&Number(row.rating)!==0)patch.rating=0;
   if(!Object.keys(patch).length)continue;
   const url=new URL(base+'/rest/v1/'+table);url.searchParams.set('id','eq.'+row.id);
   // Each PATCH compares the source values to avoid overwriting a live edit.
   for(const column of Object.keys(patch))url.searchParams.set(column,row[column]===null?'is.null':'eq.'+row[column]);
   if(table==='courses'){url.searchParams.set('updated_at','eq.'+row.updated_at);url.searchParams.set('rating_count',row.rating_count===null?'is.null':'eq.'+row.rating_count);}
   if(url.href.length>14000)throw Error('Source row is too large for safe REST comparison; use SQL migration');
   plans.push({table,row,patch,url:url.href});
  }
 }
 const summary={mode:process.argv.includes('--apply')?'apply':'dry-run',courseRows:plans.filter(p=>p.table==='courses').length,lessonRows:plans.filter(p=>p.table==='lessons').length,fields:plans.reduce((count,p)=>count+Object.keys(p.patch).length,0),deletions:0};console.log(JSON.stringify(summary));
 if(!process.argv.includes('--apply'))return;
 fs.mkdirSync('qa-audit/.runtime',{recursive:true});const backup='qa-audit/.runtime/course-text-backup-'+crypto.randomUUID()+'.json';fs.writeFileSync(backup,JSON.stringify(plans.map(({table,row})=>({table,row})),null,2));
 let changed=0;
 for(const plan of plans){const r=await fetch(plan.url,{method:'PATCH',headers:{...headers,Prefer:'return=representation'},body:JSON.stringify(plan.patch)});if(!r.ok)throw Error('Repair failed: '+r.status);const saved=await r.json();if(saved.length!==1)throw Error('A row changed concurrently; rerun dry-run before repairing it');for(const [column,value] of Object.entries(plan.patch))assert.equal(saved[0][column],value);changed++;}
 const result={...summary,changed,backupStoredLocally:true,sqlMigrationApplied:false};fs.writeFileSync('qa-audit/course-text-repair-results.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
})().catch(error=>{console.error(error.message);process.exitCode=1;});
