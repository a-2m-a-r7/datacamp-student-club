// Reversible maintenance of exact installation examples. Never delete records or modify real memberships/learning.
const fs=require('node:fs'),crypto=require('node:crypto');
const base=process.env.VITE_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!base||!key)throw Error('Private local configuration required');
const headers={apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json'};
async function read(table){const r=await fetch(base+'/rest/v1/'+table+'?select=*',{headers,signal:AbortSignal.timeout(15000)});if(!r.ok)throw Error('Read failed: '+table);return r.json();}
(async()=>{
 const changes=[];const [settings,staff,gallery,projects,blog,events]=await Promise.all(['settings','staff','gallery','projects','blog','events'].map(read));
 for(const row of settings){const value={...row.value};if(row.key==='general'){if(value.contactEmail==='contact@datacamp.club')value.contactEmail='';if(value.contactPhone==='+20 123 456 7890')value.contactPhone='';}
  if(row.key==='home_content'&&JSON.stringify(value.stats)==='[{"label":"ACTIVE MEMBERS","value":"500+"},{"label":"WORKSHOPS","value":"50+"},{"label":"PROJECTS","value":"20+"}]')value.stats=[];
  if(row.key==='about_data'&&value.history==='Founded in 2024 with a vision for the future.')value.history='';
  if(JSON.stringify(value)!==JSON.stringify(row.value))changes.push({table:'settings',row,patch:{value,updated_at:new Date().toISOString()},match:{key:row.key,updated_at:row.updated_at}});
 }
 for(const row of staff){const seeds={'b0000000-0000-0000-0000-000000000001':'https://picsum.photos/seed/pres/400/400','b0000000-0000-0000-0000-000000000002':'https://picsum.photos/seed/ammar/400/400'};
  if(seeds[row.id]===row.image)changes.push({table:'staff',row,patch:{image:'',socials:(row.socials||[]).filter(s=>s.url!=='https://linkedin.com')},match:{id:row.id,image:row.image}});
 }
 const galleryTitles=['Data Science Workshop 2025','AI Summit Keynote','Hackathon Winners','Tech Talk: Web3','Networking Night','Neural Networks Lab'];
 for(const row of gallery){const n=galleryTitles.indexOf(row.title)+1;if(n&&row.id===`e0000000-0000-0000-0000-${String(n).padStart(12,'0')}`&&row.url===`https://picsum.photos/seed/event${n}/1200/800`)changes.push({table:'gallery',row,patch:{url:'',category:'Archived samples',title:'[Archived installation example] '+row.title},match:{id:row.id,url:row.url,title:row.title}});}
 for(const row of projects)if(row.id==='c0000000-0000-0000-0000-000000000001'&&row.title==='Data Pipeline X'&&row.description==='Real-time ETL pipeline with Apache Kafka and PostgreSQL streaming.'&&!row.created_by)changes.push({table:'projects',row,patch:{status:'planning',title:'[Archived installation example] '+row.title},match:{id:row.id,title:row.title,description:row.description}});
 for(const row of blog)if(row.id==='d0000000-0000-0000-0000-000000000001'&&row.title==='The Future of AI & Autonomous Agents'&&row.content==='Discussion on LLMs, agentic pair programming, and production neural inference...')changes.push({table:'blog',row,patch:{status:'draft',title:'[Archived installation example] '+row.title},match:{id:row.id,title:row.title,content:row.content}});
 const eventSeeds={'a0000000-0000-0000-0000-000000000001':['Data Science Workshop 2026','Advanced Python for Data Analysis & Real-world Big Data Pipelines'],'a0000000-0000-0000-0000-000000000002':['Hackathon: Grid Runner','High stakes coding competition & algorithmic optimization hackathon']};
 for(const row of events){const seed=eventSeeds[row.id];if(seed&&row.title===seed[0]&&row.description===seed[1]&&[0,row.id.endsWith('1')?45:120].includes(Number(row.registered_count))&&(row.registrations||[]).length===0)changes.push({table:'events',row,patch:{status:'draft',registered_count:0,title:'[Archived installation example] '+row.title},match:{id:row.id,title:row.title,registered_count:row.registered_count,registrations:'[]'}});}
 let applied=0;
 if(process.argv.includes('--apply')&&changes.length){fs.mkdirSync('qa-audit/.runtime',{recursive:true});fs.writeFileSync('qa-audit/.runtime/seed-content-backup-'+crypto.randomUUID()+'.json',JSON.stringify(changes,null,2));for(const change of changes){const params=new URLSearchParams({select:'id'});if(change.table==='settings')params.set('select','key');for(const [field,value] of Object.entries(change.match))params.set(field,'eq.'+value);const r=await fetch(base+'/rest/v1/'+change.table+'?'+params,{method:'PATCH',headers:{...headers,Prefer:'return=representation'},body:JSON.stringify(change.patch),signal:AbortSignal.timeout(15000)});if(!r.ok||(await r.json()).length!==1)throw Error('Concurrent change or failed maintenance: '+change.table);applied++;}}
 const result={checkedAt:new Date().toISOString(),mode:process.argv.includes('--apply')?'apply':'dry-run',matchedRows:changes.length,appliedRows:applied,tables:changes.reduce((a,c)=>(a[c.table]=(a[c.table]||0)+1,a),{}),deletedRows:0,accountsChanged:0,learningRecordsChanged:0,backupCreated:applied>0};
 if(process.argv.includes('--apply'))fs.writeFileSync('qa-audit/seed-content-repair-results.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
})().catch(e=>{console.error(e.message);process.exitCode=1;});
