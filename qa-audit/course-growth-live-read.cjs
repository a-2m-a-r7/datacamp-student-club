// Read-only checks against the configured real project. Never saves personal rows.
const fs = require('node:fs'), assert = require('node:assert/strict');
const base = process.env.VITE_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY, anon = process.env.VITE_SUPABASE_ANON_KEY;
if (!base || !key || !anon) throw Error('Missing local configuration');
async function read(table, columns) {
 const rows=[];
 for(let offset=0;;offset+=500){
  const response=await fetch(`${base}/rest/v1/${table}?select=${columns}&order=id&offset=${offset}&limit=500`,{headers:{apikey:key,Authorization:'Bearer '+key}});
  if(!response.ok)throw Error('Read failed: '+response.status);
  const data=await response.json();rows.push(...data);if(data.length<500)return rows;
 }
}
(async()=>{
 const response=await fetch(base+'/rest/v1/rpc/list_course_catalog',{method:'POST',headers:{apikey:anon,Authorization:'Bearer '+anon,'Content-Type':'application/json'},body:JSON.stringify({p_limit:24,p_include_drafts:true})});
 assert.equal(response.status,200);const catalog=await response.json();assert.ok(Array.isArray(catalog.items)&&catalog.items.length<=24);assert.ok(catalog.items.every(course=>course.is_published));
 const [courses,lessons,enrollments]=await Promise.all([read('courses','id,total_lessons,enrolled_count'),read('lessons','id,course_id'),read('enrollments','id,course_id')]);
 for(const course of courses){assert.equal(course.total_lessons,lessons.filter(row=>row.course_id===course.id).length);assert.equal(course.enrolled_count,enrollments.filter(row=>row.course_id===course.id).length);}
 const privateRoutine=await fetch(base+'/rest/v1/rpc/lock_course_activity',{method:'POST',headers:{apikey:anon,Authorization:'Bearer '+anon,'Content-Type':'application/json'},body:JSON.stringify({p_course_id:'00000000-0000-4000-8000-000000000999'})});assert.ok([401,403].includes(privateRoutine.status));
 const result={passed:4,mode:'read-only real Supabase; no QA records or account changes',checks:['bounded catalog RPC is live','draft flag cannot expose unpublished rows to visitors','stored counts match actual lessons/enrollments','private activity helper denies visitors'],courses: courses.length,privateRoutineStatus:privateRoutine.status};
 fs.writeFileSync('qa-audit/course-growth-live-results.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
})().catch(error=>{console.error(error.message);process.exitCode=1;});
