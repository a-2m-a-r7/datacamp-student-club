const fs=require('node:fs');
const base=process.env.VITE_SUPABASE_URL,secret=process.env.SUPABASE_SERVICE_ROLE_KEY,anon=process.env.VITE_SUPABASE_ANON_KEY;
const verify=process.argv.includes('--verify');
if(!base||!secret||!anon)throw Error('Missing local Supabase configuration');
async function read(path,key=secret,options={}){const r=await fetch(base+'/rest/v1/'+path,{headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json'},...options});const data=await r.json();if(!r.ok)throw Error('Read failed: '+r.status);return data;}
(async()=>{
 const [enrollments,certs,lessons]=await Promise.all([
  read('enrollments?select=id,user_id,course_id,is_completed,certificate_id,completed_lessons,quiz_scores'),
  read('certificates?select=id,user_id,course_id,type,verification_code'),
  read('lessons?select=id,course_id,quiz_questions')]);
 const courseCerts=certs.filter(c=>c.type==='course'&&c.course_id);const pairs=new Set();let duplicates=0;
 for(const c of courseCerts){const pair=c.user_id+':'+c.course_id;if(pairs.has(pair))duplicates++;pairs.add(pair);}
 const eligible=enrollments.filter(e=>{const curriculum=lessons.filter(l=>l.course_id===e.course_id);return e.is_completed&&curriculum.length&&curriculum.every(l=>(e.completed_lessons||[]).includes(l.id)&&(!l.quiz_questions?.length||Number(e.quiz_scores?.[l.id]||0)>=80));});
 const unlinked=eligible.filter(e=>!courseCerts.some(c=>c.id===e.certificate_id&&c.user_id===e.user_id&&c.course_id===e.course_id)).length;
 if(duplicates)throw Error('Existing duplicate course certificates require reconciliation before migration');
 const result={mode:verify?'post-migration read-only verification':'pre-migration read-only audit',enrollments:enrollments.length,certificates:certs.length,eligibleCompletedCourses:eligible.length,unlinkedEligibleCompletions:unlinked,duplicates};
 if(verify){
  if(unlinked)throw Error('Eligible completed course is missing its linked certificate');
  const r=await fetch(base+'/rest/v1/rpc/ensure_completed_course_certificate',{method:'POST',headers:{apikey:anon,Authorization:'Bearer '+anon,'Content-Type':'application/json'},body:JSON.stringify({p_user_id:'00000000-0000-4000-8000-000000000101',p_course_id:'00000000-0000-4000-8000-000000000102'})});
  if(![401,403].includes(r.status))throw Error('Private certificate routine is exposed');
  result.privateRoutineVisitorStatus=r.status;
  const unknown=await read('rpc/verify_certificate',anon,{method:'POST',body:JSON.stringify({p_code:'DC-QA-UNKNOWN-CERTIFICATE'})});if(unknown!==null)throw Error('Unknown certificate verified');result.unknownCertificateIsInvalid=true;
 }
 fs.writeFileSync(verify?'qa-audit/certificate-live-read-results.json':'qa-audit/certificate-live-before.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
})().catch(e=>{console.error(e.message);process.exitCode=1});
