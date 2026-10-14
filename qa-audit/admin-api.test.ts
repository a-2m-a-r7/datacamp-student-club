import { test } from 'node:test';
import assert from 'node:assert/strict';
import usersHandler from '../api/admin/users';
import backupHandler from '../api/admin/backup';
const admin='00000000-0000-4000-8000-000000000401',created='00000000-0000-4000-8000-000000000402';
const response=()=>({code:0,payload:null as any,headers:{} as any,setHeader(k:string,v:string){this.headers[k]=v;},status(c:number){this.code=c;return this;},json(v:any){this.payload=v;return this;}});
test('admin account API validates, creates, rolls back failed profile writes, refuses self-deletion and deletes Auth-owned records',async()=>{
 const savedFetch=globalThis.fetch,oldUrl=process.env.SUPABASE_URL,oldKey=process.env.SUPABASE_SERVICE_ROLE_KEY;
 process.env.SUPABASE_URL='https://qa-test.supabase.co';process.env.SUPABASE_SERVICE_ROLE_KEY='QA_TEST_SERVER';
 const accounts=new Set([admin]);let failProfile=false;const mutations:any[]=[];
 globalThis.fetch=async(input:any,init:any)=>{
  const url=new URL(String(input)),method=init?.method||'GET';let value:any,status=200;
  if(url.pathname==='/auth/v1/user')value={id:admin,email:'QA_TEST_ADMIN@example.invalid',email_confirmed_at:'2026-10-14T00:00:00Z'};
  else if(url.pathname==='/rest/v1/profiles'&&method==='GET')value=[{role:'admin',status:'active'}];
  else if(url.pathname==='/auth/v1/admin/users'&&method==='POST'){accounts.add(created);mutations.push({action:'create'});value={id:created,email:'QA_TEST_NEW@example.invalid'};}
  else if(url.pathname==='/rest/v1/profiles'&&method==='PATCH'){mutations.push({action:'profile'});value=failProfile?{message:'QA_TEST_PROFILE_WRITE_FAILED',code:'23505'}:{id:created};status=failProfile?400:200;}
  else if(url.pathname==='/auth/v1/admin/users/'+created&&method==='DELETE'){accounts.delete(created);mutations.push({action:'delete'});value={id:created};}
  else throw Error('Unexpected QA API transport');
  return new Response(JSON.stringify(value),{status,headers:{'content-type':'application/json'}});
 };
 const req=(body:any)=>({method:'POST',headers:{authorization:'Bearer QA_TEST'},body});
 try {
  let res=response();await usersHandler(req({action:'create',email:'invalid',password:'123',fullName:'',role:'admin'}),res);assert.equal(res.code,400);assert.equal(mutations.length,0);
  res=response();await usersHandler(req({action:'create',email:'QA_TEST_NEW@example.invalid',password:'QA_TEST_PASSWORD_123',fullName:'QA_TEST_NEW',role:'member'}),res);assert.equal(res.code,201);assert.equal(res.payload.userId,created);assert(accounts.has(created));assert.equal(res.headers['Cache-Control'],'no-store');
  res=response();await usersHandler(req({action:'delete',userId:admin}),res);assert.equal(res.code,400);assert(accounts.has(admin));
  res=response();await usersHandler(req({action:'delete',userId:created}),res);assert.equal(res.code,200);assert(!accounts.has(created));
  failProfile=true;res=response();await usersHandler(req({action:'create',email:'QA_TEST_NEW@example.invalid',password:'QA_TEST_PASSWORD_123',fullName:'QA_TEST_NEW',role:'member'}),res);assert.equal(res.code,400);assert(!accounts.has(created));assert.equal(mutations.at(-1).action,'delete');
 } finally {globalThis.fetch=savedFetch;if(oldUrl===undefined)delete process.env.SUPABASE_URL;else process.env.SUPABASE_URL=oldUrl;if(oldKey===undefined)delete process.env.SUPABASE_SERVICE_ROLE_KEY;else process.env.SUPABASE_SERVICE_ROLE_KEY=oldKey;}
});

test('backup exports all 1105 records in bounded pages, excludes credentials and rejects partial database failures',async()=>{
 const savedFetch=globalThis.fetch,oldUrl=process.env.SUPABASE_URL,oldKey=process.env.SUPABASE_SERVICE_ROLE_KEY;
 process.env.SUPABASE_URL='https://qa-test.supabase.co';process.env.SUPABASE_SERVICE_ROLE_KEY='QA_TEST_SERVER';let failure=false;const offsets:number[]=[];
 globalThis.fetch=async(input:any)=>{
  const url=new URL(String(input));let value:any,status=200;
  if(url.pathname==='/auth/v1/user')value={id:admin,email:'QA_TEST_ADMIN@example.invalid',email_confirmed_at:'2026-10-14T00:00:00Z'};
  else if(url.pathname==='/rest/v1/profiles')value=[{role:'admin',status:'active'}];
  else if(url.pathname==='/rest/v1/courses'){const offset=Number(url.searchParams.get('offset')||0),limit=Number(url.searchParams.get('limit'));assert.equal(limit,500);offsets.push(offset);value=Array.from({length:Math.max(0,Math.min(500,1105-offset))},(_,i)=>({id:offset+i,title:'QA_TEST_RECORD'}));}
  else if(failure&&url.pathname.endsWith('/staff')){status=503;value={message:'QA_TEST_BACKUP_FAILURE'};}
  else value=[];
  return new Response(JSON.stringify(value),{status,headers:{'content-type':'application/json'}});
 };
 try {let res=response();await backupHandler({method:'POST',headers:{authorization:'Bearer QA_TEST'}},res);assert.equal(res.code,200);assert.equal(res.payload.records.courses.length,1105);assert.deepEqual(offsets,[0,500,1000]);assert(!('profiles' in res.payload.records));assert(!('users' in res.payload.records));failure=true;res=response();await backupHandler({method:'POST',headers:{authorization:'Bearer QA_TEST'}},res);assert.equal(res.code,500);assert(!res.payload.records);}
 finally {globalThis.fetch=savedFetch;if(oldUrl===undefined)delete process.env.SUPABASE_URL;else process.env.SUPABASE_URL=oldUrl;if(oldKey===undefined)delete process.env.SUPABASE_SERVICE_ROLE_KEY;else process.env.SUPABASE_SERVICE_ROLE_KEY=oldKey;}
});
