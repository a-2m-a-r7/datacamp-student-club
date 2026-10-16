import {test} from 'node:test';
import assert from 'node:assert/strict';
import ai from '../../../api/ai/chat';
import compile from '../../../api/compiler/typescript';
import submit from '../../../api/forms/submit';
import sync from '../../../api/forms/sync-sheet';

async function call(handler:any,body:any,method='POST',headers:any={}){
 const res:any={code:200,body:null,headers:{},setHeader(k:string,v:any){this.headers[k]=v;},status(n:number){this.code=n;return this;},json(v:any){this.body=v;return this;}};
 await handler({method,body,headers},res);return res;
}
test('public TS compiler rejects malformed boundaries and never executes submitted code',async()=>{
 for(const body of [null,[],{},{code:42},{code:'x'.repeat(100001)}])assert.equal((await call(compile,body)).code,400);
 for(const method of ['GET','PUT','PATCH','DELETE','OPTIONS'])assert.equal((await call(compile,{code:'const x:number=1'},method)).code,405);
 const result=await call(compile,{code:'const QA_TEST_value: string = "العربية 😀"; globalThis.QA_TEST_EXECUTED = true;'});
 assert.equal(result.code,200);assert.match(result.body.code,/العربية 😀/);assert.equal((globalThis as any).QA_TEST_EXECUTED,undefined);assert.equal(result.headers['Cache-Control'],'no-store');
 assert.equal((await call(compile,{code:'const = ;'})).code,400);
});
test('forms routes enforce method, body size and untrusted sheet authorization before provider access',async()=>{
 const original=globalThis.fetch;let calls=0;
 globalThis.fetch=async()=>{calls++;return new Response(JSON.stringify({message:'QA_TEST_FORGED_FORM_DENIED',code:'P0001'}),{status:400,headers:{'content-type':'application/json'}});};
 try{
  for(const method of ['GET','PUT','DELETE','OPTIONS']){assert.equal((await call(submit,{},method)).code,405);assert.equal((await call(sync,{},method)).code,405);}
  for(const body of [null,[],{},'QA_TEST_INVALID',{formId:3,answers:[]},{formId:'QA_TEST',answers:{}},{formId:'QA_TEST',answers:Array(201).fill({})},{formId:'QA_TEST',answers:[],metadata:{QA_TEST:'x'.repeat(1000001)}}])assert.equal((await call(submit,body)).code,400);
  assert.equal(calls,0);
  const forged=await call(submit,{formId:'50000000-0000-4000-8000-000000000001',answers:[]});assert.equal(forged.code,400);assert.equal(calls,1);assert.equal(forged.body.error,'QA_TEST_FORGED_FORM_DENIED');
  assert.equal((await call(sync,{formId:'QA_TEST',internalSubmissionSync:true})).code,401);assert.equal(calls,1);
 }finally{globalThis.fetch=original;}
});
test('AI validates input boundaries, handles provider failures and never returns server credentials',async()=>{
 const original=globalThis.fetch,previous=process.env.GEMINI_API_KEY;process.env.GEMINI_API_KEY='QA_TEST_DUMMY_PROVIDER_KEY';let calls:any[]=[];
 globalThis.fetch=async(_url:any,init:any)=>{calls.push(JSON.parse(init.body));return new Response(JSON.stringify({candidates:[{content:{parts:[{text:' QA_TEST_AI_RESPONSE '}]}}]}),{status:200,headers:{'content-type':'application/json'}});};
 try{
  for(const body of [null,[],{},'QA_TEST',{prompt:42},{prompt:''},{prompt:'x'.repeat(4001)},{prompt:'QA_TEST',systemPrompt:42},{prompt:'QA_TEST',history:{}},{prompt:'QA_TEST',history:Array(13).fill({})}])assert.equal((await call(ai,body)).code,400);
  assert.equal(calls.length,0);
  const result=await call(ai,{prompt:'QA_TEST بالعربية 😀',history:[]});assert.equal(result.code,200);assert.equal(result.body.text,'QA_TEST_AI_RESPONSE');assert.equal(JSON.stringify(result.body).includes('QA_TEST_DUMMY_PROVIDER_KEY'),false);assert.equal(calls.length,1);
  globalThis.fetch=async()=>new Response('{}',{status:403,headers:{'content-type':'application/json'}});assert.equal((await call(ai,{prompt:'QA_TEST'})).code,502);
 }finally{globalThis.fetch=original;if(previous===undefined)delete process.env.GEMINI_API_KEY;else process.env.GEMINI_API_KEY=previous;}
});
test('AI whitespace-only input is empty and must not consume provider calls',async()=>{
 const original=globalThis.fetch,previous=process.env.GEMINI_API_KEY;process.env.GEMINI_API_KEY='QA_TEST_DUMMY_PROVIDER_KEY';let calls=0;
 globalThis.fetch=async()=>{calls++;return new Response(JSON.stringify({candidates:[{content:{parts:[{text:'QA_TEST_RESPONSE'}]}}]}),{headers:{'content-type':'application/json'}});};
 try{const result=await call(ai,{prompt:' \n\t '});assert.deepEqual({status:result.code,providerCalls:calls},{status:400,providerCalls:0});}
 finally{globalThis.fetch=original;if(previous===undefined)delete process.env.GEMINI_API_KEY;else process.env.GEMINI_API_KEY=previous;}
});
