from pathlib import Path
import csv,json,re,subprocess,datetime,collections
root=Path.cwd(); final=root/'qa-audit/final'
def git(*args):return subprocess.check_output(['git',*args],text=True,encoding='utf-8').strip()
def readj(p):return json.loads((root/p).read_text(encoding='utf-8'))
bugs=(final/'BUGS.md').read_text(encoding='utf-8'); parts=re.split(r'(?=^## BUG-\d{3})',bugs,flags=re.M)
sections=sorted([re.sub(r'^Only reproduced failures.*\n?','',s,flags=re.M) for s in parts[1:]],key=lambda s:int(re.search(r'BUG-(\d+)',s)[1]))
intro='# Confirmed bug log\n\nOnly reproduced failures are entered here. Results distinguish isolated local SQL/browser adapters from real hosted QA providers. Production is excluded throughout.\n\n'
(final/'BUGS.md').write_text(intro+'\n'.join(s.rstrip()+'\n' for s in sections),encoding='utf-8')
commits={m[2]:m[1] for line in git('log','--format=%h %s').splitlines() if (m:=re.search(r'^(\w+) fix\((BUG-\d+)\)',line))}
with (final/'bugs.csv').open(encoding='utf-8-sig',newline='') as f:old={r['ID']:r for r in csv.DictReader(f)}
cols=['ID','Severity','Layer','Page or endpoint','Role','Expected','Actual','Evidence','Status','Commit']; rows=[]
for s in sections:
 ident=re.search(r'BUG-\d+',s)[0];title=s.splitlines()[0].split(' — ',1)[-1]
 def field(name):
  m=re.search(r'^- '+name+r':\s*(.+)$',s,re.M);return m[1] if m else ''
 row=old.get(ident,{k:'' for k in cols});row.update({'ID':ident,'Commit':commits.get(ident,''),'Status':field('Status') or row.get('Status',''),'Severity':(field('Severity').split('.')[0] or row.get('Severity',''))})
 if ident not in old:row.update({'Layer':field('Severity').split('Layer:',1)[-1].strip(' .') if 'Layer:' in field('Severity') else 'See BUGS.md','Page or endpoint':title,'Role':'Applicable isolated QA identities; see bug entry','Expected':field('Fix'),'Actual':field('Reproduce'),'Evidence':field('Evidence') or field('Validation')})
 rows.append(row)
with (final/'bugs.csv').open('w',encoding='utf-8',newline='') as f:w=csv.DictWriter(f,fieldnames=cols);w.writeheader();w.writerows(rows)
full_label='QA_TEST_full_delivery_504'
fullpath=final/('evidence/runs/'+full_label+'/results.json')
full= json.loads(fullpath.read_text(encoding='utf-8')) if fullpath.exists() else None
stats=full.get('stats',{}) if full else {};fullstatus=f"{stats.get('expected',0)} passed / {stats.get('unexpected',0)} failed / {stats.get('skipped',0)} skipped" if full else 'RUNNING - not counted as a completed pass'
sourcecommit=git('log','-1','--format=%h','--','src','api','server','supabase','vite.config.ts','package.json','vercel.json')
package=readj('package.json');build=root/'qa-audit/.runtime/QA_TEST_fresh_clone_03/qa-audit/.runtime/QA_TEST_clean_delivery_04/build';built=[p for p in build.rglob('*') if p.is_file()]
tracked=git('ls-files','-z').split('\0');tracked=[root/p for p in tracked if p and (root/p).is_file()]
metrics={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'branch':git('branch','--show-current'),'reviewHead':git('rev-parse','HEAD'),'sourceCommit':'d27eb58','directProductionDependencies':len(package['dependencies']),'directDevelopmentDependencies':len(package['devDependencies']),'buildFiles':len(built),'buildBytes':sum(p.stat().st_size for p in built),'trackedFiles':len(tracked),'trackedBytes':sum(p.stat().st_size for p in tracked),'fullBrowser':stats or {'status':'running'},'limitations':['Tracked bytes include accumulated audit evidence; ignored QA clones/runtimes are excluded.','A prior full run of 480 passed precedes BUG-024..029; the current run is separate.','npm ci has one transitive node-domexception deprecation, with zero reported vulnerabilities.']}
metrics['sourceCommit']=sourcecommit
(final/'evidence/QA_TEST_delivery_metrics.json').write_text(json.dumps(metrics,indent=2)+'\n',encoding='utf-8')
summary=f'''# Current audit results - 17 October 2026

This report supersedes earlier completion statements. Branch: tester-final. Product changes through {sourcecommit}. No merge, push or deployment is authorized before final report approval; production has not been used for tests or schema changes.

| Layer | Actually observed result | Evidence / limitation |
|---|---|---|
| Complete current browser run | {fullstatus} | evidence/runs/{full_label}; EN/AR x 1440/768/375; local migrated SQL with transport adapters |
| Before footer-flow correction | 496/498 passed; 2 reproduced click failures | QA_TEST_full_final_498; BUG-030 fixes the shared layout cause; 18 targeted/related/loading cases pass |
| Previous complete browser run | 480/480 passed | Historical run QA_TEST_full_final_480; not substituted for current-source results |
| Node API/security contracts | 37/37 passed | QA_TEST_node_final.txt; no live provider claim |
| Strict source-grant SQL feature suite | 61/61 passed | QA_TEST_final_sql_strict_03; blanket client grants removed from the old harness |
| All-table CRUD | 816/816 passed | BUG-024-table-crud; 34 tables, source grants only, rolled-back local probes |
| Clean schema | 5/5 passed | 34 tables with RLS, 16 Realtime publication entries; BUG-024-fresh-schema |
| Sheet lease / ACL | 19/19 passed | BUG-024-coordination-local; local interleaved callers, not hosted capacity |
| Actual hosted services | 12/12 passed | GoTrue, REST, Storage bytes/policies, Realtime delivery in isolated Supabase QA |
| Actual hosted profile browser | 6/6 passed | QA_TEST_hosted_browser_03; EN/AR and three widths |
| Actual Google sign-in | One owner identity completed | Supabase QA identity and return observed; second Google identity/inbox delivery not established |
| Actual Drive | Three synthetic files uploaded, hashed, resumed and read back | 47,808,659-byte MP4, 335-byte material, 243-byte SRT; not a 2 GiB transfer |
| Actual Gemini | Reviewed bilingual quiz + Python plan generated and applied | Supported model alias; synthetic video only, not the personal recording |
| Actual complete learner flow | Passed on current UI | QA_TEST_actual_course_final_04; video, captions, watch bookmark, bilingual quiz, Python grading, 100% database completion, one certificate and downloaded PDF |
| Actual file metadata UI | 6/6 passed | BUG-027-sizes-after; real saved files, both languages and all widths |
| Actual Sheets | Retry/schema/parallel/failure/pagination passed | BUG-024-sheets-after; 1003 saved response IDs, 8 parallel callers; OAuth-only anonymous submission separately verified |
| Clean clone | npm ci, build, lint/types, six browser cases passed | QA_TEST_fresh_clone_03 at d27eb58; 253 installed, 254 audited, 0 vulnerabilities, one transitive deprecation |

All {len(rows)} reproduced bugs have separate fix commits. Source inventories and aggregate tests are not proof that every individual variant of every control has been executed; unverified variants remain explicit in the matrix.

## Limits and owner decisions

- No 1000-user hosted capacity test or actual 2 GiB transfer was performed. The existing real PostgreSQL exercise used 1000 fixture members, 20 connections and 10,000 successful operations. Free provider quotas remain relevant.
- C++/Java/Go/Rust require a separately hosted Piston-compatible executor, as previously accepted by the owner. Configure VITE_PISTON_API_URL and its CSP origin; apply isolation, quotas and timeouts there. Python/JavaScript/TypeScript/SQL browser execution is separate.
- Actual email inbox delivery and switching between two Google identities remain external checks. Generated Auth links are not presented as delivered email.
- Latest local mobile Lighthouse on the c64e711 build: login 67/100/100/100, courses 72/100/100/100, home 71/100/100/100. These are local uncompressed samples under concurrent QA work, not deployed capacity or a promise of 100 performance.
- Supabase advisors retain intentional server-only tables without client policies, reviewed public SECURITY DEFINER projections/RPCs, and a leaked-password-protection warning. These are disclosed, not silently called zero warnings. The restricted new sync table/RPCs are not exposed to clients or Realtime.
- Production migrations, final diff approval, push/deploy and a subsequent live smoke are pending. The existing public site does not contain these audit commits.

## Retained resources / cleanup

Cleanup state is tracked separately in CLEANUP.md. The real Google owner QA profile has been returned to role user. Preserve that identity and the user-selected personal recording/course. Synthetic QA_TEST_ fixtures may be cleaned by exact IDs only after their final provider checks. Do not delete credentials, QA clones or other runtime/download files as generic caches. Only the four explicitly approved filesystem folders may be removed after all tests stop.
'''
(final/'RESULTS-20261017.md').write_text(summary,encoding='utf-8')
(final/'AFTER.md').write_text(summary+f"\n## Measured source/build size\n\n- Production build: {len(built)} files, {metrics['buildBytes']:,} bytes.\n- Direct dependencies: {metrics['directProductionDependencies']} production, {metrics['directDevelopmentDependencies']} development.\n- Tracked working files: {metrics['trackedFiles']}, {metrics['trackedBytes']:,} bytes, including historical audit evidence and excluding ignored runtimes.\n- Full baseline and original Git status remain in BEFORE.md.\n",encoding='utf-8')
print(json.dumps({'bugEntries':len(rows),'fixCommits':len(commits),'fullBrowser':fullstatus,'metrics':'qa-audit/final/evidence/QA_TEST_delivery_metrics.json'}))
