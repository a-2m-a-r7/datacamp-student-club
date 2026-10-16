import { PGlite } from '@electric-sql/pglite';
import { Page } from '@playwright/test';
import fs from 'node:fs';
export const admin = '00000000-0000-4000-8000-000000000301';
export const member = '00000000-0000-4000-8000-000000000302';
export const other = '00000000-0000-4000-8000-000000000303';
export const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64');

/** Executes the repository migrations and RLS. Auth sessions and Storage transport are isolated QA adapters. */
export async function platform() {
 const db = new PGlite();
 await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
 CREATE SCHEMA auth; CREATE TABLE auth.users(id uuid PRIMARY KEY,email text,email_confirmed_at timestamptz,raw_user_meta_data jsonb DEFAULT '{}',raw_app_meta_data jsonb DEFAULT '{}');
 CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT NULLIF(current_setting('qa.uid',true),'')::uuid $$;
 CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql AS $$ SELECT current_user::text $$;
 GRANT USAGE ON SCHEMA public,auth TO anon,authenticated; GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA auth TO anon,authenticated;
 CREATE SCHEMA storage; CREATE TABLE storage.buckets(id text PRIMARY KEY,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
 CREATE TABLE storage.objects(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),bucket_id text,name text); ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
 GRANT USAGE ON SCHEMA storage TO anon,authenticated; GRANT SELECT,INSERT,UPDATE,DELETE ON ALL TABLES IN SCHEMA storage TO anon,authenticated;`);
 for (const file of fs.readdirSync('supabase/migrations').filter(f => /^\d{14}_.+\.sql$/.test(f) && f >= '20261013000000').sort()) await db.exec(fs.readFileSync('supabase/migrations/' + file, 'utf8'));
 // The actual migration chain declares grants. Do not re-grant private job
 // tables after migrations or mask missing-grant defects in new installations.
 for (const [id, name] of [[admin,'ADMIN'],[member,'MEMBER'],[other,'OTHER']]) await db.query('INSERT INTO auth.users(id,email,email_confirmed_at,raw_user_meta_data) VALUES($1,$2,now(),$3)', [id, `QA_TEST_${name}@example.invalid`, JSON.stringify({full_name:'QA_TEST_'+name})]);
 await db.query("UPDATE profiles SET role='admin' WHERE id=$1", [admin]);
 const columns = (await db.query<any>("SELECT table_name,column_name,data_type FROM information_schema.columns WHERE table_schema='public'")).rows;
 const functions = (await db.query<any>("SELECT proname,proargnames,oidvectortypes(proargtypes) types FROM pg_proc JOIN pg_namespace n ON n.oid=pronamespace WHERE n.nspname='public'")).rows;
 const uploads = new Map<string,Buffer>();
 const calls:any[]=[];
 const asUser = async (uid:string|null, task:(tx:any)=>Promise<any>) => db.transaction(async tx => { await tx.query("SELECT set_config('qa.uid',$1,true)",[uid||'']); await tx.exec('SET LOCAL ROLE '+(uid?'authenticated':'anon')); return task(tx); });
 async function connect(page:Page,uid:string|null=admin,language:'en'|'ar'='en') {
  if (uid) {
   const user={id:uid,email:uid===admin?'QA_TEST_ADMIN@example.invalid':'QA_TEST_MEMBER@example.invalid',email_confirmed_at:'2026-10-14T00:00:00Z',app_metadata:{provider:'email'},user_metadata:{}};
   const token=Buffer.from('{"alg":"HS256"}').toString('base64url')+'.'+Buffer.from(JSON.stringify({sub:uid,exp:4102444800})).toString('base64url')+'.QA_TEST_SIGNATURE';
   await page.addInitScript(({user,token,language})=>{localStorage.setItem('datacamp_language',language);sessionStorage.setItem('datacamp_supabase_auth_token',JSON.stringify({user,access_token:token,refresh_token:'QA_TEST',expires_at:4102444800,token_type:'bearer'}));},{user,token,language});
  } else await page.addInitScript(language=>localStorage.setItem('datacamp_language',language),language);
  await page.route('https://fonts.googleapis.com/**',r=>r.fulfill({body:''}));
  await page.route('https://api.dicebear.com/**',r=>r.abort());
  await page.route('https://qa-test.supabase.co/**',async route=>{
   const req=route.request(),url=new URL(req.url()),table=url.pathname.split('/').pop()!,method=req.method();
   const json=!['GET','HEAD'].includes(method)&&!url.pathname.includes('/storage/')?req.postDataJSON():null;
   calls.push({table,method,url:url.href,body:json});
   try {
    if(url.pathname.includes('/auth/'))return route.fulfill({contentType:'application/json',body:JSON.stringify(url.pathname.endsWith('/user')?{id:uid,email:uid===admin?'QA_TEST_ADMIN@example.invalid':'QA_TEST_MEMBER@example.invalid',email_confirmed_at:'2026-10-14T00:00:00Z',app_metadata:{provider:'email'},user_metadata:{}}:{})});
    if(url.pathname.includes('/storage/')){
     const path=url.pathname.replace('/storage/v1/object/','').replace(/^public\//,'');
     if(method==='GET')return route.fulfill({status:uploads.has(path)?200:404,contentType:'image/png',body:uploads.get(path)||Buffer.from('')});
     if(method==='DELETE') { const prefixes=req.postDataJSON()?.prefixes||[]; for(const name of prefixes){await asUser(uid,tx=>tx.query('DELETE FROM storage.objects WHERE bucket_id=$1 AND name=$2',[path,name]));uploads.delete(path+'/'+name);}return route.fulfill({contentType:'application/json',body:'[]'}); }
     if(method==='POST') { await asUser(uid,tx=>tx.query('INSERT INTO storage.objects(bucket_id,name) VALUES($1,$2)',[path.split('/')[0],path.split('/').slice(1).join('/')]));let bytes=req.postDataBuffer()!;const start=bytes.indexOf(Buffer.from([137,80,78,71,13,10,26,10])),end=bytes.indexOf(Buffer.from('IEND'));if(start>=0&&end>=0)bytes=bytes.subarray(start,end+8);uploads.set(path,bytes);return route.fulfill({contentType:'application/json',body:JSON.stringify({Key:path,path:path.split('/').slice(1).join('/')})}); }
     return route.fulfill({contentType:'application/json',body:'[]'});
    }
    let total=0;
    const data=await asUser(uid,async tx=>{
     if(url.pathname.includes('/rpc/')) {
      const fn=functions.find(f=>f.proname===table);if(!fn)throw Error('Unknown QA RPC '+table);
      const types=fn.types?fn.types.split(', '):[],names=fn.proargnames||[];const values:any[]=[],args:string[]=[];
      for(let i=0;i<types.length;i++)if(json && Object.hasOwn(json,names[i])){values.push(types[i].startsWith('json')?JSON.stringify(json[names[i]]):json[names[i]]);args.push(`${names[i]}=>$${values.length}::${types[i]}`);}
      return (await tx.query(`SELECT public.${table}(${args.join(',')}) value`,values)).rows[0]?.value??null;
     }
     if(!columns.some(c=>c.table_name===table)||!/^\w+$/.test(table))throw Error('Unknown QA table '+table);
     const types=new Map(columns.filter(c=>c.table_name===table).map(c=>[c.column_name,c.data_type]));
     const values:any[]=[],where:string[]=[];
     for(const [col,filter] of url.searchParams){if(!types.has(col))continue;const dot=filter.indexOf('.'),op=filter.slice(0,dot),value=filter.slice(dot+1);
      if(op==='is'&&value==='null'){where.push(col+' IS NULL');continue;}
      if(op==='in'){values.push(value.slice(1,-1).split(','));where.push(`${col}::text=ANY($${values.length}::text[])`);continue;}
      const operators:Record<string,string>={eq:'=',neq:'<>',gt:'>',gte:'>=',lt:'<',lte:'<=',ilike:'ILIKE'};if(!operators[op])throw Error('Unsupported QA filter '+filter);
      values.push(value);where.push(`${col}${types.get(col)==='timestamp with time zone'?'':'::text'} ${operators[op]} $${values.length}`);
     }
     const cond=where.length?' WHERE '+where.join(' AND '):'';
     let rows:any[]=[];
     const encode=(col:string,value:any)=>types.get(col)?.startsWith('json')?JSON.stringify(value):value;
     if(method==='POST') {
      for(const item of Array.isArray(json)?json:[json]){
       const keys=Object.keys(item);for(const key of keys)if(!types.has(key))throw Error('Unknown column '+table+'.'+key);
       const conflict=url.searchParams.get('on_conflict')||(table==='settings'?'key':'id');if(!types.has(conflict))throw Error('Invalid conflict');
       const prefer=req.headers().prefer||'';const merge=prefer.includes('resolution=merge-duplicates'),ignore=prefer.includes('resolution=ignore-duplicates');
       const update=keys.filter(k=>k!==conflict).map(k=>`${k}=EXCLUDED.${k}`).join(',');
       rows.push(...(await tx.query(`INSERT INTO ${table}(${keys.join(',')}) VALUES(${keys.map((_,i)=>'$'+(i+1)).join(',')}) ${merge||ignore?'ON CONFLICT('+conflict+') DO '+(merge&&update?'UPDATE SET '+update:'NOTHING'):''}${prefer.includes('return=representation')?' RETURNING *':''}`,keys.map(k=>encode(k,item[k])))).rows);
      }
     } else if(method==='PATCH') {
      const assignments=Object.keys(json).map(col=>{if(!types.has(col))throw Error('Unknown column');values.push(encode(col,json[col]));return `${col}=$${values.length}`;});
      rows=(await tx.query(`UPDATE ${table} SET ${assignments.join(',')}${cond} RETURNING *`,values)).rows;
     } else if(method==='DELETE') rows=(await tx.query(`DELETE FROM ${table}${cond} RETURNING *`,values)).rows;
     else {
      total=Number((await tx.query(`SELECT count(*) n FROM ${table}${cond}`,values)).rows[0].n);
      const order=(url.searchParams.get('order')||'').split(',').filter(Boolean).map(v=>{const [col,dir]=v.split('.');if(!types.has(col))throw Error('Unknown sort');return col+(dir==='desc'?' DESC':' ASC');}).join(',');
      rows=(await tx.query(`SELECT * FROM ${table}${cond}${order?' ORDER BY '+order:''} LIMIT ${Math.min(1000,Number(url.searchParams.get('limit')||1000))} OFFSET ${Number(url.searchParams.get('offset')||0)}`,values)).rows;
      if(table==='forms'&&url.searchParams.get('select')?.includes('form_responses'))for(const row of rows)row.form_responses=[{count:Number((await tx.query('SELECT count(*) n FROM form_responses WHERE form_id=$1',[row.id])).rows[0].n)}];
      if(table==='form_responses')for(const row of rows){row.form_answers=(await tx.query('SELECT question_id,value FROM form_answers WHERE response_id=$1',[row.id])).rows;row.profiles=row.respondent_id?(await tx.query('SELECT * FROM profiles WHERE id=$1',[row.respondent_id])).rows[0]:null;}
     }
     return req.headers().accept?.includes('vnd.pgrst.object')?rows[0]||null:rows;
    });
    await route.fulfill({contentType:'application/json',headers:{'content-range':`0-${Math.max(0,total-1)}/${total}`},body:method==='HEAD'?'':JSON.stringify(data)});
   } catch(e:any){await route.fulfill({status:e.code==='PT429'?429:400,contentType:'application/json',body:JSON.stringify({message:e.message,code:e.code||'QA_ADAPTER'})});}
  });
 }
 return {db,connect,calls,uploads,asUser};
}
