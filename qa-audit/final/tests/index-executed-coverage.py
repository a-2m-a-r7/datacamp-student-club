from pathlib import Path
import csv,json,collections,re
base=Path('qa-audit/final');label='QA_TEST_full_delivery_504';path=base/f'evidence/runs/{label}/results.json';source=list(csv.DictReader((base/'TEST-MATRIX.csv').open(encoding='utf-8-sig',newline='')))
crud=json.loads((base/'evidence/runs/BUG-024-table-crud/table-crud-source.json').read_text());groups=collections.defaultdict(list)
for case in crud['cases']:groups[case['table']].append(case)
runtime=[];completed=path.exists();run=json.loads(path.read_text()) if completed else None
def visit(suite):
 for spec in suite.get('specs',[]):
  for test in spec.get('tests',[]):runtime.append({'ID':f'RUN-{len(runtime)+1:04d}','File':spec.get('file',suite.get('file','')),'Line':spec.get('line',''),'Viewport':test.get('projectName',''),'Scenario':spec['title'],'Status':test['status'],'Evidence':f'evidence/runs/{label}/results.json'})
 for child in suite.get('suites',[]):visit(child)
if run:visit(run)
with (base/'EXECUTED-CASES.csv').open('w',encoding='utf-8',newline='')as f:
 w=csv.DictWriter(f,fieldnames=['ID','File','Line','Viewport','Scenario','Status','Evidence']);w.writeheader();w.writerows(runtime)
for row in source:
 if row['Status']=='Pending approval':row['Status']='Execution approved; individual variants not separately verified'
 if row['ID'].startswith('DB-TBL-'):
  table=row['Element'].split('.')[-1].strip('` ')
  cases=groups.get(table,[])
  if len(cases)==24 and all(c['passed'] for c in cases):row['Status']='PARTIAL: 24/24 local grants/RLS CRUD probes pass; other table behavior is separate';row['Evidence']='evidence/runs/BUG-024-table-crud/table-crud-source.json; TABLE-'+table+'-*'
 if row['ID'].startswith(('UI-','ROUTE-')) and (row['Evidence']=='Not executed' or row['Status']=='Current module rerun in progress; no individual-template pass inferred'):
  row['Evidence']='EXECUTED-CASES.csv and module scenarios; source-template row is not an independent passed test'
  row['Status']='Module evidence indexed; per-template variants not independently mapped' if completed else 'Current module rerun in progress; no individual-template pass inferred'
 if row['ID'].startswith('DB-') and not row['ID'].startswith('DB-TBL-') and row['Evidence']=='Not executed':row['Evidence']='Effective catalogue / boundaries / table CRUD reports; historical declaration is not a separate runtime test'
 updates={
 'AUTH-007':('PARTIAL: one actual Google QA owner login completed; broader account variants unverified','evidence/QA_TEST_google_auth_database.json; QA-ENVIRONMENT.md'),
 'AUTH-008':('BLOCKED: second user-controlled Google identity not exercised','DECISIONS.md; RESULTS-20261017.md'),
 'AUTH-011':('Preserved per-tab isolation; refresh and account separation exercised in named scenarios','EXECUTED-CASES.csv; DECISIONS.md'),
 'NAV-008':('Not applicable: shell has no global theme toggle; existing form themes tested separately','DECISIONS.md'),
 'DEL-007':('Owner decision resolved: private delivery, UNLICENSED; third-party notices preserved','LICENSE; DECISIONS.md'),
 'LRN-013':('PARTIAL: Python/JavaScript/TypeScript/SQL executed; C++/Java/R/Go/Rust require external Piston','RESULTS-20261017.md; HANDOVER.md'),
 'BUCKET-01':('PARTIAL: actual avatar bytes/persistence and selected policy/error checks pass','evidence/QA_TEST_hosted_browser_03.txt; evidence/runs/QA_TEST_hosted_realtime_after/hosted-services.json'),
 'BUCKET-02':('PARTIAL: actual upload/public read/admin and member policy probes pass','evidence/runs/QA_TEST_hosted_realtime_after/hosted-services.json'),
 'BUCKET-03':('PARTIAL: actual upload/public read/admin and member policy probes pass','evidence/runs/QA_TEST_hosted_realtime_after/hosted-services.json'),
 'BUCKET-04':('PASS for named actual private attachment checks; remaining upload variants unverified','evidence/BUG-031-hosted-after.json'),
 }
 if row['ID'] in updates:row['Status'],row['Evidence']=updates[row['ID']]
 if row['ID']=='BUCKET-04':row['Element']='form-attachments (private; current canonical bucket ID)'
for ident,element in [('DB-TBL-034','public.form_sheet_sync_jobs'),('DB-FUNC-NEW-001','queue_form_sheet_sync(uuid,uuid)'),('DB-FUNC-NEW-002','finish_form_sheet_sync(uuid,uuid,bigint,text)')]:
 if not any(r['ID']==ident for r in source):source.append({'ID':ident,'Page':'Supabase QA/local','Role':'anon/member/server','Element':element,'Expected':'Service-only coordination; client denial, correct lease/revision state, no Realtime publication','Status':'PASS for explicit coordination/ACL cases; not a hosted capacity claim','Source':'supabase/migrations/20261017065319_serialize_form_sheet_sync.sql','Evidence':'evidence/BUG-024-coordination-local.json; evidence/BUG-024-sheets-after.json'})
with (base/'TEST-MATRIX.csv').open('w',encoding='utf-8',newline='')as f:w=csv.DictWriter(f,fieldnames=['ID','Page','Role','Element','Expected','Status','Source','Evidence']);w.writeheader();w.writerows(source)
status=collections.Counter(r['Status'] for r in source)
intro='''# Test matrix and execution index - 17 October 2026

The CSV is the master source-template inventory with current status and evidence. EXECUTED-CASES.csv is the separate runtime-case index. These are different denominators: a source census, a shared-control regression and a provider round trip must not be counted as the same kind of pass.

Execution was authorized by the owner's instruction to begin and continue. Rows no longer imply that matrix approval is still awaited. Final report approval is still required before merge/push/deploy.

## Reading the final status

- PASS applies only to the named observed result. The new coordination entries have explicit local ACL/lease and actual QA provider evidence.
- PARTIAL for a table means its 24 grant/RLS CRUD probes passed; its broader expected FK/trigger/concurrency behavior is covered only where separately named.
- A UI/route source row linked to module evidence does not claim every offline/timeout/input variant was independently executed. The exact triggered scenarios are in the runtime index and results JSON.
- Email inbox delivery, a second Google identity, actual 2 GiB transfer and 1000 simultaneous hosted viewers are not established. Piston setup is the previously accepted external requirement. Legacy roles have no invented positive privileges; see DECISIONS.md.
- Historical SQL policies/triggers may be superseded. Use the effective replay/permission reports instead of treating each old declaration as a current object.

## Source inventory status

'''
intro+='| Status | Rows |\n|---|---:|\n'+''.join(f'| {k} | {v} |\n' for k,v in status.items())
intro+=f'\nRuntime index: {len(runtime)} completed case records. Current run: {label}. '+('Results file exists; inspect its expected/unexpected/skipped counts before claiming success.\n' if completed else 'Still running; no completion pass is asserted.\n')
intro+='\nThe original detailed route/control/SQL census is preserved below as a historical plan. Its old Pending approval wording is superseded by the current CSV status, not by a blanket pass.\n\n'
md=base/'TEST-MATRIX.md';text=md.read_text(encoding='utf-8');marker='<!-- ORIGINAL SOURCE CENSUS -->';original=text.split(marker,1)[-1] if marker in text else text
md.write_text(intro+marker+'\n'+original,encoding='utf-8')
print(json.dumps({'sourceRows':len(source),'runtimeRecords':len(runtime),'completed':completed,'statusCounts':status}))
