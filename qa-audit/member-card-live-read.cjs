const fs=require('node:fs');
const base=process.env.VITE_SUPABASE_URL,key=process.env.VITE_SUPABASE_ANON_KEY;
if(!base||!key)throw Error('Missing Supabase configuration');
(async()=>{
 const results=[];
 for(const [name,path,method,body] of [
  ['Unknown card is invalid','rpc/verify_member_card','POST',{p_token:'00000000-0000-4000-8000-000000000020'}],
  ['Visitor cannot issue a card','rpc/get_own_member_card','POST',{}],
  ['Visitor cannot enumerate cards','member_cards?select=token','GET',null],
  ['Visitor cannot resolve attendance identity','rpc/resolve_member_card_ticket','POST',{p_ticket:'test'}]
 ]){
  const response=await fetch(base+'/rest/v1/'+path,{method,headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
  const data=await response.json();
  if(name==='Unknown card is invalid'&&(response.status!==200||JSON.stringify(data)!=='{"valid":false}'))throw Error(name);
  if(name==='Visitor cannot enumerate cards'&&!(response.status===401||response.status===403||(response.status===200&&Array.isArray(data)&&!data.length)))throw Error(name);
  if(name!=='Unknown card is invalid'&&name!=='Visitor cannot enumerate cards'&&![401,403].includes(response.status))throw Error(name);
  results.push({name,status:response.status});
 }
 fs.writeFileSync('qa-audit/member-card-live-read-results.json',JSON.stringify({passed:results.length,results},null,2));console.log(JSON.stringify({passed:results.length,results}));
})().catch(e=>{console.error(e.message);process.exitCode=1});
