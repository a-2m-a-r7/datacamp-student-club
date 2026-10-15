# Backend inventory — STEP 1

Date: 2026-10-15 (Africa/Cairo). **Every proposed case is Pending approval.** Static source inventory only: no tests, requests, database/schema changes, secret reads or deployments performed. Source references are repository-relative file:line coordinates. This inventory does not assert the deployed database's effective state.

## Counts

10 HTTP handlers, 2 shared API helpers, 2 server modules; 24 timestamped migrations; 33 unique public tables, 49 unique function names including legacy/internal helpers, 18 historically declared trigger names (one explicitly dropped later), 1 explicit public view, 4 storage buckets, 13 public tables explicitly added to realtime. Exact identifier/source index follows below. Alternate combined_migration.sql, full_schema.sql and seed.sql are not independent additional schemas.

## Authorization and shared case expansion

`api/_lib/authorize.ts:4` uses Auth getUser and persisted profiles role/status: confirmed active admin/super_admin only. Missing config503; missing/invalid bearer401; nonadmin/inactive/unconfirmed403; profile-read failure503. `supabase/migrations/20261013000001_real_operations.sql:4` is_admin matches this predicate. require_active_user at line11 checks active status but not confirmed email.

Profiles CHECK supports only user/admin (`20261010000004_phase2_schema_hardening.sql:52`, `20261013000000_missing_schema.sql:9`). `api/admin/users.ts:20,24` accepts member/user/admin/super_admin but stores user/admin. Frontend maps admin to super_admin and others member (`src/contexts/AuthContext.tsx:75,88`). **hr, event_manager, content_manager, editor and distinct super_admin permissions: Needs decision.** Test unsupported/forged roles cannot gain authority; do not invent their grants.

Apply to every action: guest, expired/malformed token, active member A/B, inactive/pending/unconfirmed member, admin A/B, inactive/unconfirmed admin, forged role metadata/claim, unsupported roles, missing/deleted profile; own/other/missing/malformed IDs; wrong methods, missing/null/array/string body, unknown action, DB/network/provider failure. Assert denied requests perform no writes/provider side effects; capture sanitized response plus DB before/after. Also test repeat, concurrent repeat, partial failure, rollback and retry where writes occur.

## Every HTTP route/action — proposed cases, all Pending approval

| ID | Route/source | Actions and oracle/cases |
|---|---|---|
| API-01 | POST /api/admin/users — api/admin/users.ts:2 | create: email, password8..256/name1..200, accepted roles normalized, duplicate email/member_id, whitespace/oversize/bad types. Auth create confirmed then profile update; failure deletes only just-created Auth user. delete: UUID-like, refuse self, missing/other/repeat; Auth cascades including owned media FK scenario. create201/delete200/error400; othermethod405. |
| API-02 | POST /api/admin/backup — api/admin/backup.ts:3 | Only courses,lessons,events,staff,gallery,projects,blog,forms,form_questions; pages500, orderedid. 0/499/500/501/1001 records, tablefailure500 no partial-success, no Auth/secrets/private responses/storage binaries. Concurrent edit snapshot semantics need decision. |
| API-03 | POST /api/ai/chat — api/ai/chat.ts:11 | Public, no handler auth/rate cap. prompt<=4000/systemPrompt<=20000/history<=12 andJSON<=30000; malformed/nested history, whitespace, provider403/fallback429/empty/invalidJSON/timeout, missingconfig503/allfail502. No real provider load until isolated quota policy. |
| API-04 | POST /api/compiler/typescript — api/compiler/typescript.ts:2 | Public TS transpilation, code string<=100000, diagnostics400/output200. Syntax/unicode/empty/oversize/imports/runtime-incompatible identifiers; no server code execution implied; browser sandbox tested separately. |
| API-05 | POST /api/forms/submit — api/forms/submit.ts:4 | Forward bearer to submit_form_response RPC; formId string/answers<=200/body<=1MB; unknown/crossform answer, malformedmetadata. Save succeeds before optional internal sync; response survives provider failure; sync_status disabled/pending/synced/failed; no duplicate respondent resubmit needed. DBerrors400, missingconfig503, missing savedid500. |
| API-06 | POST /api/forms/sync-sheet — api/forms/sync-sheet.ts:25 | Externally admin only; trusted Symbol bypass only successful submit. formIdrequired400/config503/form404. create spreadsheet+RAW headers/style/frozenrow/shareconfiguredowner/saveID. responseId append binds formId (282); resyncAll rebuild (213); neither verifies spreadsheet. Repeatappend, concurrentfirstcreate, >1000 responses, >26 columns/>5000 rows, questionchanges, formula-leading values, failedshare/reference-save/log, failedprovider and retry. Real sharing requires isolated recipient/sheet. Effective defaultowner empty21 despite old comment. |
| API-07 | POST /api/profile/avatar — api/profile/avatar.ts:2 | persist-current(default),use-google; ownactiveconfirmed only. Unknown400/provider502 preserves priorphoto. api/_lib/profile-avatar.ts:5 HTTPS whitelist Googleusercontent/constrained DiceBear raster; URL4096, redirects<=3/15s/stream5MiB, magicPNG/JPEG/WebP. No-op if owned/absent; SHA ownpath; compare-and-swap bothcolumns preserves concurrentphoto and removes unusedupload. SSRFredirect/SVGHTML/oversize/truncated/missingheader/storageerror/DBerror/concurrency/identicalretry. |
| API-08 | /api/courses/drive — api/courses/drive.ts:4 | POST status: own connected/configured/maxBytes, neverrefreshtoken. POST connect: signed10min nonce cookie HttpOnly/Secure/SameSiteLax/path; drive.file/offline/consent/exactcallback. GET callback: validstate/signature/purpose/expiry/cookie + currentadmin; code exchange refresh+scope then encrypted ownerupsert; redirectconnected/failed. Missingcookie/tamper/expiry/errorcallback/scope/refreshtokenmissing/demotedadmin/DBorproviderfail/multitabnonce/retry. LocalOAuth callback setup distinct from Auth fixture. |
| API-09a | POST /api/courses/media open — api/courses/media.ts:24 | Guest publishedpreview, activeconfirmed enrolledlearner, admin. Draft/nonpreview/unrelatedcourse/wronglesson403. Onehour signedproxy URL + intentionally publicDrive downloadUrl. Existing publicproviderURL accessible independently of proxy; report this design accurately. |
| API-09b | GET /api/courses/media ticket — api/courses/media.ts:8 | Recheckcurrent account/status/course/lesson/enrollment. Bounded3MiB rangeproxy; 200/206, malformed/outofbounds416, badticket/provider403. Exactlastbyte/openend/suffix/multiple/reversed/unsafeinteger range, missing/expired/tampered ticket/purpose/asset/uid, removedenrollment/demotion, deletedasset, ignoredrange/truncated/oversizestream, Content-Type/disposition/length/no-store/referrer headers. |
| API-09c | POST /api/courses/media start/restart/finish — api/courses/media.ts:28 | Admin start: savedlesson,size1..2GiB/kind/name/MD5/SHA; ownmatchingjob resumes<=6days, completedCORSack recovered server-side. restart ownuploading marks expired. finish: ownjob; complete returnssameasset; verifies ownedByMe/appProperties/job/lesson/name/MIME/size/MD5; videoheader or UTF8timedsubtitle; publicpermission thenasset/lesson/job saves. Wrongowner/file/hash, quota,308/404/410, lostfinalresponse, pause/resume/reselect, parallelfinish, failureeachsave+retry, 0/limit/+1, supportedmaterials, subtitle5MiB, languagefallback. Drive finish directlychecksMD5; storedSHA usedbyGemini. |
| API-10 | POST /api/courses/analyze — api/courses/analyze.ts:6 | Admin+enabledflag/key; latest ownlessonjob. prepare exactsavedvideoasset size/MIME/SHA, no generatedchildren; reuseversionjob<24h; optionalrestart ownuploading; ownerdaily5 jobs/race. status recoverlist<=300 files, verifydisplayName/size/MIME/SHA; processing/active/failed, stuckgeneration>10min resets. generate compare-and-setactive,240stimeout,3..5 bilingualvalidquestions/optionalexercise, readyreuse; failure resetsactive withoutlessonwrites. apply ownjob + serviceRPC, idempotentresult. Wrongowner/stalesource/duplicates/quota/invalidJSON/answerbounds/duplicateoptions/missinglanguage/optioncountmismatch/noncodingexercise-null; runnablecodingcaseforeachsupportedlanguage; applyrollback/sequencing. |

Server helpers: `server/courseMedia.ts:9..13` AES-GCM/HMAC with server-derived secret, tamper/expiry/keyrotation; `driveToken:18..26` currentconnection check, warmcache45minutes bounded64owners, refreshdedup/failure/reconnect; `readableAsset:41..44` checks crosscourse/currentstatus/enrollment. `server/courseAi.ts:4..7` question/explanation/options/IDs schema, sharedanswerindex, bilingualcount,3..5questions; optionalexercise1..3exactoutputtests and9languages. Translation equivalence/manual grounding requires human review, schema cannot prove semantics. Dummylocalkeys only for helpertests.

## Tables/RLS — proposed own/other CRUD and bypass cases, all Pending approval

Broadreset `20261013000001_real_operations.sql:40..81` drops policies on23 named tables, creates qa_admin ALL on each. public.users omitted. Later patches below override. Effective SQLGRANT+RLS catalog must be inspected after isolated replay.

| Tables (33 total) | Expected nonadmin access / specific oracle |
|---|---|
| profiles | Own select/update; qa_protect_profile_fields blocks role/status/points/xp/verified/email/level/member_id change. Ownothersearch/count/directinsertdelete and safephoto/bio/contact change; admin protectedfieldwrites. |
| users | Legacy own/admin read/update, role unchanged, admindelete. Check self-subquery recursion, mirrorprotectedfields/drift, profiletriggersync. Mirror mustnot confer authority. |
| auth_events | Ownselect/insert +adminALL; spoofotheruser/email/provider/event constraints, anonymousdenial/deletionSETNULL. |
| courses | Publishedpublicselect +adminALL, newdefaultdraft. Draftflag RLS, searchcursor/order, locked/unpublished, empty publish, counterspoof. |
| lessons | Publishedcourse publicselect +adminALL, includingstoredquizanswers/exercisesolutions; enrollmentrequired only for media/completion. Resolve assessmentconfidentiality oracle; module/sourcecoursevalidation/quizstructure/order. |
| enrollments | OwnSELECT +adminALL; learnerwrites RPC-only. Directforgedcompletion/quiz/certificate denied, duplicate/cascade/concurrency. |
| events | Basetable adminonly; public_events safe publishedmetadata view omitsregistrations. Draft/tickets/emails privacy, capacitylocking. |
| staff | Adminonly after qa_staff_read removed by 20261013000009:2. Memberdirectory/search denied; publicnavigation expectation needsalignment. |
| projects | Activepublicselect; authenticatedownselect/insert(created_by=self,status=planning); adminALL. Spoofowner/status, memberupdate/delete denied, submissionretryduplicate semantics. |
| blog | Publishedpublicselect +adminALL; draft/archived/directlinkhidden andpublishupdates. |
| gallery | Publicselect +adminALL; unauthorizedCRUD, brokenmedia, DB/storage consistency. |
| settings | Publickeys site/general/home_content/about_data only +adminALL. Othersecurity/providerkeysprivate, missingkeyfallback, concurrentedits. |
| messages | Publicinsert name1..200/email3..254/message1..10000/statusunread; adminALL. No publicread/update, whitespace/XSS/email/subjectconstraint/oversize/spamrequirements. |
| notifications | Ownselect/update/insert +adminALL; broadcasts via RPC. Otherprivateuserdenied; ownsystemcontentspoof expectation; broadcast markers independent. |
| audit_logs | AdminALL only. Memberforge denied, loggingcoverage needsoperation-leveloracle. |
| points_log | Ownselect +adminALL; trustedawardRPC. Directmint/delete denied; referenceonce/deductions/totalfloor/retry. |
| user_achievements | Ownselect +adminALL; owninsert removed verified_badges:2. Verifiedeligibility only, noduplicates/ackown. |
| certificates | Ownselect +adminALL; publiclimitedverifyRPC; directmemberissue denied; uniquecoursecert, historicalsnapshot/curriculumchange. |
| forms / form_questions | Publishedpublicselect +adminALL; accesswindow/anonflag enforcedsubmitRPC. All14types, crossformIDs, questionsave rollback, deletingansweredquestion blocked. |
| form_responses / form_answers / sync_logs | AdminALL only; validatedRPC/routes write. Privacy/directinsertdenied, anonymousduplicateemailsemantics, responsecascade/logretention, exports>1000. |
| admin_emails | AdminALL. Legacy promotionfunctionbypass queued, latestsignup ignoresallowlist anduserrolemetadata. |
| notification_reads | OwnSELECT only; writes via read_notifications. Directmutationdenied, own/otherbroadcastreadidempotency. |
| member_cards | RLS/noordinarypolicies; owngetRPC/publicminimalverify. Listing/token enumerationdenied, stabletoken, inactive/unconfirmedinvalid. |
| course_request_windows | RLS+REVOKEALL anon/auth; internal120/minute limiter/rollover/rollback/independentusers. |
| course_modules | AdminALL, publicpublishedcourseselect. Crosscourseassociation/deleteandreorderfulllistintegrity. |
| course_assets | Readadmin or publishedpreview/enrolled; servicewritesonly. Directclientwrite denied evenadmin; asset/course/lesson match, ownerdeleteFK, RLS/APIstatusparity. |
| lesson_watch_progress | OwnALL with enrollmentWITHCHECK; RPCactivefinite0..86400 and updateslastlesson. NaN/Infinity/null/negative/oversize/revokedenrollment/ownother/backwardsseek, directwriteRPCstatusparity. |
| course_drive_connections / course_upload_jobs / lesson_analysis_jobs | Server-only: RLS+explicitREVOKEALL anon/auth includingadmin. No credential/uploadcapability/providerURI leakage; ownoperations API, retry/partialfailure/cascade/FK. |

## RPC case families — all Pending approval

| ID | Functions | Cases/source oracle |
|---|---|---|
| RPC-01 | is_admin, require_active_user | Persistedrole/status/verifiedemail permutations; activehelper confirmationdifference. |
| RPC-02 | public_stats, public_leaderboard, admin_growth | Safeaggregatecounts; leaderboard nowadminonly/clamp1..100/excludesinactive/nonmembers despitepublicname; monthlygroups/emptyresults/privacy. |
| RPC-03 | import_member_metadata, assign_member_role | Adminonly, import<=1000/name1..200/missinginvalidduplicates atomicrollback; assignuser/adminonly/no selfdemote/nonexistent. |
| RPC-04 | award_points | Verifiedownactivity/adminother, fixedrewards, customadmin±100000 only, sameaction/ref0repeat; unknown/spoofedref blocked; profileslock/crosscourseconcurrency, totalfloor0/logsignedamount. |
| RPC-05 | enroll_course, complete_course_lesson, submit_course_quiz | Publishedunlocked/nonempty; enrollmentunique+5XPonce; matchinglesson/quiz80%gate; servergradeIDs/index/100KBmap/bestscore;79/80/100rounding,missingunknownnonnumericanswers; repeat/concurrentXPcertonce, unpublished/locked/courseeditduringcompletion. |
| RPC-06 | issue_course_certificate, ensure_completed_course_certificate, issue_certificate_on_course_completion | Owneractivecompleted; internalhelpernotdirectcallable; everylesson+quiz, automatictriggercertificate+enrollmentlink, uniquerepeats, historicalbackfillvalidonly, name/titlesnapshot, credentialpreservedaftercurriculumaddition. |
| RPC-07 | register_for_event, check_in_event | Active/published/capacitylock; duplicate/full/error; adminscanboundevent+ticket/memberID, wrong/reused/unregistered; concurrentlastseat, eventstatechange. |
| RPC-08 | verify_certificate, get_own_member_card, verify_member_card, resolve_member_card_ticket | Minimalpublicdata/stableowncardverifiedactive; adminresolveURLorpassthroughticket, malformedunknowninactive, membercannotsearch/resolveothers. |
| RPC-09 | save_form, save_form_questions, has_user_responded, submit_form_response | Atomicmetadata/questionsIDpreservation,<=200/title/slug/dateorder, answeredquestiondeletionrefusal; published/open/anonflag/active/email/oneperuser; duplicate/crossformanswerIDs, requiredwhitespace, alltypes/date/time/minmax/options/20Kanswer/fileprefix. has_user_responded ignores p_email and checks auth.uid only: anonymousUIneedsalignment. |
| RPC-10 | get_notifications, read_notifications | Own+broadcast; activewrite/ownselectedvisibility; readone/all idempotent notothers. get lacksactivestatuscheck. |
| RPC-11 | refresh_badges, acknowledge_badges | Firstlesson/5courses/3enrollments/7daycompletion/5perfectscores; eligibilitythreshold/repeat/ackown. |
| RPC-12 | list_course_catalog | SECURITYINVOKER+RLS,1..100page/cursorpair/search<=200/literalsubstring/casefold/filter/stablekeyset/nextcursor; includeDrafts cannotbypassRLS. |
| RPC-13 | save_lesson_watch_progress, reorder_course_lessons, reorder_course_modules | Finiteposition/enrolled/active; adminexactfulluniqueIDlist, empty/nonexistent/null/duplicates/omitted/foreign/stalelist, concurrentadd/reorder rollback. |
| RPC-14 | apply_lesson_analysis | Serviceroleonly; row/course/sourceversionlocks, ready/appliedidempotency,3..5quiz/optionalexercise/shiftorder/sourcecontents atomic, stale/duplicate/failure leaves unchanged. |
| RPC-15 | lock_course_activity, lock_course_curriculum, adjust_course_counters, guard_course_metadata, stamp_course_lesson, validate_generated_lesson_progress | Internalgrants/advisorylockorder/5stimeout;120perminute/rollover; countersinsert/move/delete; forgedcounterignore; quizstructuralchecks; samecoursemodule/source; sourcevideo beforequiz beforeexercise. |
| RPC-16 | prevent_role_escalation, set_updated_at, sync_user_from_profile, promote_admin_by_email, refresh_course_enrolled_count, sync_course_enrolled_count, handle_new_user, handle_forms_updated_at, protect_profile_fields, sync_verified_identity | Legacygrant/safeinvocationaudit, no definerbypass; signup0XP ignoresrolemetadata/memberIDunique; mirror/emailconfirmation/emailchange sync; protectedfields/timestamps and callbackidempotency. |

## Storage and realtime — all Pending approval

Buckets from `20261013000005_storage.sql:2..8`: avatars public5MiB PNG/JPEG/WebP; course-thumbnails and uploads public10MiB PNG/JPEG/WebP; form-attachments private10MiB PNG/JPEG/WebP/PDF/text. Existingbucket ONCONFLICTDONOTHING may retainolderlimits; latest `20261014000013_profile_photos.sql:2` explicitlyenforcesavatar limits. Verifyeffectiveconfig.

Effective newer storagepolicyfamilies: qa_attachments_admin(13), qa_form_upload(16), qa_public_images(21), qa_images_admin(23), qa_own_avatar(27), restrictiveqa_private_attachment_reads(32), qa_target_upload_limits(35), qa_target_update_limits(42), qa_target_delete_limits(48) in storage.sql; qa_avatar_directory_private restrictiveSELECTowner/admin in profile_photos:7. Legacypermissiveimagepolicies coexist but intersectrestrictiveguards; exact definition index below includes historicaldeclarations.

Storagecases: anon/member/admin read/list/upload/upsert/overwrite/delete/signedURLs; ownotherprefix/nested/encodedtraversal, limit±1byte, MIME/extension/magicmismatch, SVG/HTML/EXE/empty/truncated; interruption, DBreferencefailure afterupload. KnownpublicavatarURL serving vs forbidobjectlisting separate. Formfile prefixpublished/open/anonflag enforced, privateattachmentread/signexpiry. CourseDrive publicURLs explicitlydifferentsecuritymodel.

Realtimepublishedtables(13): profiles/auth_events/courses initial:388..390, messages phase2:607, lessons/enrollments phase5:99/104, events/staff/projects/blog/gallery/settings/notifications phase6:112..136. Frontendadditional subscriptions lack explicitpublicationADDfound: notification_reads (`src/contexts/NotificationsContext.tsx:53`), points_log (`src/services/pointsService.ts:86`), user_achievements(same:149). Matrix: twoaccounts+guest, ownother/broadcast/admin edits, privatepayloadfiltering, resubscribe/sessionexpiry/rolechange, oncecallbacks/unmountcleanup; provepusheventseparatelyfromfallbackrefetch. 1000concurrentusers requiresisolatedload/resources, sourceindexesarenotloadproof.

## Reproducibility/ambiguity queue — not runtime-confirmed bugs

1. No supabase/config.toml present. Real localAuth/Storage/PostgREST/Realtime mustbe established aftermatrixapproval. SQLPGlite mocks cannotprovefullstack/OAuth/storageintegration.
2. Timestampchain contains samplecourses and remaining_tables samples/randomimages. seed_courses:52/103/153 deletesmatchingcourse lessons. seed.sql overwrites settings; do notapplywholesaletoproduction. Definecleanfixtureprovenance; alternatecombined/full_schemafilesareolderandcontain samples.
3. RoleCHECK/user/admin vs requested7roles and frontendcollapsedrole requiresoracledecision.
4. Legacy SECURITYDEFINER promote_admin_by_email(text) (`20261010000004_phase2_schema_hardening.sql:452`) hasnoactorcheck; no laterrevoke/dropfound. DefaultPUBLICEXECUTEpossiblyremains: prioritizeisolatedcatalogprivilege+exploitproof. Alsoauditrefresh_course_enrolled_count andotherinternalhelpers. Nevertestproductionprivilegeescalation.
5. users mirroroutside23tablepolicyreset/self-role-subquery may recurse orallowfielddrift; actualisolatedcatalog/queryrequired.
6. Activehelperdoesnotrequireemailconfirmed; enroll/quiz/points/authenticatedform inheritdifferencefromAPI/card.
7. PublishedlessonRLS exposesquizcorrectIndex/exercise_solution; mediarequiresenrollmentseparately. Decideeducationalvsprotectedassessmentexpectedbehavior.
8. Staffreadremoved/leaderboardadminonly; publicmenuexpectations/privacyagreement mustmatch.
9. Oldfullrecountenrollmenttrigger andnewdeltacountertriggerbothdeclared; verifyeffectiveorder/results/concurrentcost, do notassumeincorrectdoublecount.
10. Asset/upload/analysis ownerFK lacksONDELETECASCADE unlikeadminuserdeletecomment; seededownedmediaaccountdeletecase required.
11. Chatpublicquota/deadline, Sheetsnonidempotentappend/concurrentcreation/resyncA1:Z5000 limits needfailure/boundarytests. All externalproviderrequests localstubbed bydefault; live integration markedseparately.
12. Latermedia CREATEPOLICY/TRIGGER unconditional maynotbemigrationrerunsafe. InitialrealtimeADDunguardedassumespublication. Freshorderedreplay/catalogneeded; unqualifiedmediaobjectnamesassumepublicsearch_path.

## Required fixtures/harness, Pending approval

FreshlocalisolatedSupabase with QA_TEST_ identities/content; twoverifiedactivemembers/twoadmins plusinactive/pending/unconfirmed/forgedroles. TrustedlocalAuthadminseedtriggerpipeline, dummyserverkeys, hardassertlocalDBoriginbeforewrites; neverinheritproduction.env. Testcoursesdraft/published/locked/empty/modules/alllessonstypes/bilingualquiz/sourcegeneratedsequence, scores79/80/100/earnedcertificatepriornewlesson. Allform14types/windowflags/historicalanswers/crossformIDs; eventlastseat/ticketQR; ownotherbroadcastnotifications; rewardref/badgeeligiblehistory; private/publicsettings/mediafixtures.

Loopbackexternalproviderstubs withobservablecalls for Drive/Gemini/Sheets error/retry/idempotency, realAuth/DB/RLS/Storage/Realtime locally. Markstubbed vs live explicitly. LiveOAuthneedsisolatedclientcallback+humanconsent; OTP localmailcapture; Sheetsisolatedserviceaccount+recipient; validPNG/JPEG/WebP/PDF/SRT/VTT/MP4/WebM and invalid/limitstreams. 2GiBactualtransfer/1000userload separatelyboundedwithresources/freequota. Artifacts sanitized HTTP/status/DBbeforeafter/RLScontext/events; neverpasswords/tokens/uploadcapabilities.

## Exact definition index

Appended mechanically from timestamped source declarations. Latest occurrence by identifier for table/function/trigger/view; policy list records every historical declaration, including later-replaced policies. Read reset/drop overrides above; this is not a deployed-catalog dump.

### Tables

| Identifier | Signature / target | Source | Status |
|---|---|---|---|
| `public.profiles` | `` | `supabase/migrations/20261013000000_missing_schema.sql:4` | Pending approval |
| `public.auth_events` | `` | `supabase/migrations/20261013000000_missing_schema.sql:30` | Pending approval |
| `public.courses` | `` | `supabase/migrations/20261013000000_missing_schema.sql:40` | Pending approval |
| `public.lessons` | `` | `supabase/migrations/20261013000000_missing_schema.sql:61` | Pending approval |
| `public.enrollments` | `` | `supabase/migrations/20261013000000_missing_schema.sql:72` | Pending approval |
| `public.events` | `` | `supabase/migrations/20261013000000_missing_schema.sql:84` | Pending approval |
| `public.audit_logs` | `` | `supabase/migrations/20261013000000_missing_schema.sql:96` | Pending approval |
| `public.staff` | `` | `supabase/migrations/20261013000000_missing_schema.sql:107` | Pending approval |
| `public.projects` | `` | `supabase/migrations/20261013000000_missing_schema.sql:117` | Pending approval |
| `public.blog` | `` | `supabase/migrations/20261013000000_missing_schema.sql:126` | Pending approval |
| `public.gallery` | `` | `supabase/migrations/20261013000000_missing_schema.sql:136` | Pending approval |
| `public.notifications` | `` | `supabase/migrations/20261013000000_missing_schema.sql:143` | Pending approval |
| `public.settings` | `` | `supabase/migrations/20261013000000_missing_schema.sql:152` | Pending approval |
| `public.admin_emails` | `` | `supabase/migrations/20261013000000_missing_schema.sql:158` | Pending approval |
| `public.users` | `` | `supabase/migrations/20261013000000_missing_schema.sql:163` | Pending approval |
| `public.messages` | `` | `supabase/migrations/20261013000000_missing_schema.sql:186` | Pending approval |
| `public.points_log` | `` | `supabase/migrations/20261013000000_missing_schema.sql:197` | Pending approval |
| `public.user_achievements` | `` | `supabase/migrations/20261013000000_missing_schema.sql:208` | Pending approval |
| `public.certificates` | `` | `supabase/migrations/20261013000000_missing_schema.sql:221` | Pending approval |
| `public.forms` | `` | `supabase/migrations/20261013000000_missing_schema.sql:236` | Pending approval |
| `public.form_questions` | `` | `supabase/migrations/20261013000000_missing_schema.sql:257` | Pending approval |
| `public.form_responses` | `` | `supabase/migrations/20261013000000_missing_schema.sql:287` | Pending approval |
| `public.form_answers` | `` | `supabase/migrations/20261013000000_missing_schema.sql:297` | Pending approval |
| `public.sync_logs` | `` | `supabase/migrations/20261013000000_missing_schema.sql:305` | Pending approval |
| `public.notification_reads` | `` | `supabase/migrations/20261013000003_auth_notifications.sql:2` | Pending approval |
| `public.member_cards` | `` | `supabase/migrations/20261013000010_member_cards.sql:2` | Pending approval |
| `public.course_request_windows` | `` | `supabase/migrations/20261014000012_course_growth.sql:38` | Pending approval |
| `public.course_modules` | `` | `supabase/migrations/20261015000014_course_media.sql:2` | Pending approval |
| `public.course_assets` | `` | `supabase/migrations/20261015000014_course_media.sql:13` | Pending approval |
| `public.lesson_watch_progress` | `` | `supabase/migrations/20261015000014_course_media.sql:44` | Pending approval |
| `public.course_drive_connections` | `` | `supabase/migrations/20261015000014_course_media.sql:66` | Pending approval |
| `public.course_upload_jobs` | `` | `supabase/migrations/20261015000014_course_media.sql:69` | Pending approval |
| `public.lesson_analysis_jobs` | `` | `supabase/migrations/20261015000014_course_media.sql:74` | Pending approval |

### Functions

| Identifier | Signature / target | Source | Status |
|---|---|---|---|
| `public.is_admin` | `` | `supabase/migrations/20261013000001_real_operations.sql:4` | Pending approval |
| `public.prevent_role_escalation` | `` | `supabase/migrations/20261010000000_initial_schema.sql:141` | Pending approval |
| `public.handle_new_user` | `` | `supabase/migrations/20261013000003_auth_notifications.sql:30` | Pending approval |
| `public.set_updated_at` | `` | `supabase/migrations/20261010000004_phase2_schema_hardening.sql:239` | Pending approval |
| `public.sync_user_from_profile` | `` | `supabase/migrations/20261010000004_phase2_schema_hardening.sql:272` | Pending approval |
| `public.promote_admin_by_email` | `admin_email TEXT` | `supabase/migrations/20261010000004_phase2_schema_hardening.sql:452` | Pending approval |
| `public.refresh_course_enrolled_count` | `target_course_id UUID` | `supabase/migrations/20261010000005_phase5_courses.sql:42` | Pending approval |
| `public.sync_course_enrolled_count` | `` | `supabase/migrations/20261010000005_phase5_courses.sql:57` | Pending approval |
| `public.register_for_event` | `target_event_id uuid` | `supabase/migrations/20261013000001_real_operations.sql:209` | Pending approval |
| `public.has_user_responded` | `p_form_id uuid,p_email text DEFAULT NULL` | `supabase/migrations/20261013000002_atomic_forms.sql:56` | Pending approval |
| `public.submit_form_response` | `p_form_id uuid,p_answers jsonb,p_respondent_email text DEFAULT NULL,p_metadata jsonb DEFAULT '{}'` | `supabase/migrations/20261013000002_atomic_forms.sql:60` | Pending approval |
| `public.handle_forms_updated_at` | `` | `supabase/migrations/20261011000000_form_builder.sql:461` | Pending approval |
| `public.require_active_user` | `` | `supabase/migrations/20261013000001_real_operations.sql:11` | Pending approval |
| `public.protect_profile_fields` | `` | `supabase/migrations/20261013000001_real_operations.sql:21` | Pending approval |
| `public.public_stats` | `` | `supabase/migrations/20261013000001_real_operations.sql:88` | Pending approval |
| `public.public_leaderboard` | `p_limit integer DEFAULT 50` | `supabase/migrations/20261013000008_member_directory_private.sql:2` | Pending approval |
| `public.import_member_metadata` | `p_rows jsonb` | `supabase/migrations/20261013000001_real_operations.sql:103` | Pending approval |
| `public.assign_member_role` | `p_user_id uuid,p_role text` | `supabase/migrations/20261013000001_real_operations.sql:117` | Pending approval |
| `public.award_points` | `p_user_id uuid,p_action text,p_description text, p_custom_points integer DEFAULT NULL,p_reference_id text DEFAULT NULL,p_reference_type text DEFAULT NULL` | `supabase/migrations/20261013000001_real_operations.sql:127` | Pending approval |
| `public.enroll_course` | `p_course_id uuid` | `supabase/migrations/20261014000012_course_growth.sql:160` | Pending approval |
| `public.complete_course_lesson` | `p_course_id uuid,p_lesson_id uuid` | `supabase/migrations/20261014000012_course_growth.sql:172` | Pending approval |
| `public.check_in_event` | `p_event_id uuid,p_ticket text` | `supabase/migrations/20261013000001_real_operations.sql:223` | Pending approval |
| `public.verify_certificate` | `p_code text` | `supabase/migrations/20261013000001_real_operations.sql:243` | Pending approval |
| `public.issue_course_certificate` | `p_course_id uuid` | `supabase/migrations/20261013000011_automatic_course_certificates.sql:32` | Pending approval |
| `public.save_form_questions` | `p_form_id uuid,p_questions jsonb` | `supabase/migrations/20261013000002_atomic_forms.sql:3` | Pending approval |
| `public.save_form` | `p_form jsonb,p_questions jsonb` | `supabase/migrations/20261013000002_atomic_forms.sql:29` | Pending approval |
| `public.get_notifications` | `` | `supabase/migrations/20261013000003_auth_notifications.sql:10` | Pending approval |
| `public.read_notifications` | `p_id uuid DEFAULT NULL` | `supabase/migrations/20261013000003_auth_notifications.sql:18` | Pending approval |
| `public.sync_verified_identity` | `` | `supabase/migrations/20261013000003_auth_notifications.sql:43` | Pending approval |
| `public.submit_course_quiz` | `p_lesson_id uuid,p_answers jsonb` | `supabase/migrations/20261014000012_course_growth.sql:198` | Pending approval |
| `public.refresh_badges` | `` | `supabase/migrations/20261013000006_verified_badges.sql:3` | Pending approval |
| `public.acknowledge_badges` | `` | `supabase/migrations/20261013000006_verified_badges.sql:23` | Pending approval |
| `public.admin_growth` | `` | `supabase/migrations/20261013000007_analytics.sql:2` | Pending approval |
| `public.get_own_member_card` | `` | `supabase/migrations/20261013000010_member_cards.sql:4` | Pending approval |
| `public.verify_member_card` | `p_token uuid` | `supabase/migrations/20261013000010_member_cards.sql:13` | Pending approval |
| `public.resolve_member_card_ticket` | `p_ticket text` | `supabase/migrations/20261013000010_member_cards.sql:20` | Pending approval |
| `public.ensure_completed_course_certificate` | `p_user_id uuid,p_course_id uuid` | `supabase/migrations/20261014000012_course_growth.sql:135` | Pending approval |
| `public.issue_certificate_on_course_completion` | `` | `supabase/migrations/20261013000011_automatic_course_certificates.sql:40` | Pending approval |
| `public.list_course_catalog` | `p_limit integer DEFAULT 24,p_after timestamptz DEFAULT NULL,p_after_id uuid DEFAULT NULL, p_search text DEFAULT '',p_category text DEFAULT NULL,p_level text DEFAULT NULL,p_include_drafts boolean DEFAULT false` | `supabase/migrations/20261014000012_course_growth.sql:13` | Pending approval |
| `public.lock_course_activity` | `p_course_id uuid` | `supabase/migrations/20261014000012_course_growth.sql:45` | Pending approval |
| `public.lock_course_curriculum` | `` | `supabase/migrations/20261014000012_course_growth.sql:70` | Pending approval |
| `public.adjust_course_counters` | `` | `supabase/migrations/20261014000012_course_growth.sql:95` | Pending approval |
| `public.guard_course_metadata` | `` | `supabase/migrations/20261014000012_course_growth.sql:121` | Pending approval |
| `stamp_course_lesson` | `` | `supabase/migrations/20261015000014_course_media.sql:36` | Pending approval |
| `save_lesson_watch_progress` | `p_lesson_id uuid,p_seconds numeric` | `supabase/migrations/20261015000014_course_media.sql:53` | Pending approval |
| `reorder_course_lessons` | `p_course_id uuid,p_ids uuid[]` | `supabase/migrations/20261015000014_course_media.sql:89` | Pending approval |
| `reorder_course_modules` | `p_course_id uuid,p_ids uuid[]` | `supabase/migrations/20261015000014_course_media.sql:97` | Pending approval |
| `apply_lesson_analysis` | `p_job_id uuid` | `supabase/migrations/20261015000014_course_media.sql:108` | Pending approval |
| `validate_generated_lesson_progress` | `` | `supabase/migrations/20261015000014_course_media.sql:136` | Pending approval |

### Triggers

| Identifier | Signature / target | Source | Status |
|---|---|---|---|
| `trg_prevent_role_escalation` | `public.prevent_role_escalation` | `supabase/migrations/20261010000000_initial_schema.sql:152` | Pending approval |
| `on_auth_user_created` | `public.handle_new_user` | `supabase/migrations/20261013000003_auth_notifications.sql:42` | Pending approval |
| `trg_profiles_updated_at` | `public.set_updated_at` | `supabase/migrations/20261010000004_phase2_schema_hardening.sql:248` | Pending approval |
| `trg_users_updated_at` | `public.set_updated_at` | `supabase/migrations/20261010000004_phase2_schema_hardening.sql:254` | Pending approval |
| `trg_courses_updated_at` | `public.set_updated_at` | `supabase/migrations/20261010000004_phase2_schema_hardening.sql:260` | Pending approval |
| `trg_messages_updated_at` | `public.set_updated_at` | `supabase/migrations/20261010000004_phase2_schema_hardening.sql:266` | Pending approval |
| `trg_sync_user_from_profile` | `public.sync_user_from_profile` | `supabase/migrations/20261010000004_phase2_schema_hardening.sql:344` | Pending approval |
| `trg_sync_course_enrolled_count` | `public.sync_course_enrolled_count` | `supabase/migrations/20261010000005_phase5_courses.sql:80` | Pending approval |
| `trigger_forms_updated_at` | `public.handle_forms_updated_at` | `supabase/migrations/20261011000000_form_builder.sql:472` | Pending approval |
| `qa_protect_profile_fields` | `public.protect_profile_fields` | `supabase/migrations/20261013000001_real_operations.sql:37` | Pending approval |
| `qa_verified_identity` | `public.sync_verified_identity` | `supabase/migrations/20261013000003_auth_notifications.sql:51` | Pending approval |
| `qa_automatic_course_certificate` | `public.issue_certificate_on_course_completion` | `supabase/migrations/20261013000011_automatic_course_certificates.sql:48` | Pending approval |
| `dc_lock_curriculum` | `public.lock_course_curriculum` | `supabase/migrations/20261014000012_course_growth.sql:93` | Pending approval |
| `dc_lesson_counts` | `public.adjust_course_counters` | `supabase/migrations/20261014000012_course_growth.sql:117` | Pending approval |
| `dc_enrollment_counts` | `public.adjust_course_counters` | `supabase/migrations/20261014000012_course_growth.sql:119` | Pending approval |
| `dc_course_metadata` | `public.guard_course_metadata` | `supabase/migrations/20261014000012_course_growth.sql:133` | Pending approval |
| `stamp_course_lesson` | `stamp_course_lesson` | `supabase/migrations/20261015000014_course_media.sql:42` | Pending approval |
| `validate_generated_lesson_progress` | `validate_generated_lesson_progress` | `supabase/migrations/20261015000014_course_media.sql:148` | Pending approval |

### Views

| Identifier | Signature / target | Source | Status |
|---|---|---|---|
| `public.public_events` | `` | `supabase/migrations/20261013000001_real_operations.sql:84` | Pending approval |

### Historical policy declarations

| Identifier | Signature / target | Source | Status |
|---|---|---|---|
| `"Profiles are readable by authenticated users and admins"` | `public.profiles` | `supabase/migrations/20261010000000_initial_schema.sql:280` | Pending approval |
| `"Users can update their own profile"` | `public.profiles` | `supabase/migrations/20261010000000_initial_schema.sql:289` | Pending approval |
| `"Admins can delete profiles"` | `public.profiles` | `supabase/migrations/20261010000000_initial_schema.sql:295` | Pending approval |
| `"Admins can view all auth events"` | `public.auth_events` | `supabase/migrations/20261010000000_initial_schema.sql:303` | Pending approval |
| `"Users can insert their own auth events"` | `public.auth_events` | `supabase/migrations/20261010000000_initial_schema.sql:308` | Pending approval |
| `"Published courses are viewable by everyone"` | `public.courses` | `supabase/migrations/20261010000000_initial_schema.sql:316` | Pending approval |
| `"Admins can insert courses"` | `public.courses` | `supabase/migrations/20261010000000_initial_schema.sql:321` | Pending approval |
| `"Admins can update courses"` | `public.courses` | `supabase/migrations/20261010000000_initial_schema.sql:326` | Pending approval |
| `"Admins can delete courses"` | `public.courses` | `supabase/migrations/20261010000000_initial_schema.sql:332` | Pending approval |
| `"Lessons viewable if course is published or by admin"` | `public.lessons` | `supabase/migrations/20261010000000_initial_schema.sql:340` | Pending approval |
| `"Admins can insert lessons"` | `public.lessons` | `supabase/migrations/20261010000000_initial_schema.sql:351` | Pending approval |
| `"Admins can update lessons"` | `public.lessons` | `supabase/migrations/20261010000000_initial_schema.sql:356` | Pending approval |
| `"Admins can delete lessons"` | `public.lessons` | `supabase/migrations/20261010000000_initial_schema.sql:362` | Pending approval |
| `"Users can view their own enrollments"` | `public.enrollments` | `supabase/migrations/20261010000000_initial_schema.sql:370` | Pending approval |
| `"Users can enroll themselves in courses"` | `public.enrollments` | `supabase/migrations/20261010000000_initial_schema.sql:375` | Pending approval |
| `"Users can update their own progress"` | `public.enrollments` | `supabase/migrations/20261010000000_initial_schema.sql:380` | Pending approval |
| `"Public can view course thumbnails"` | `storage.objects` | `supabase/migrations/20261010000002_storage_buckets.sql:17` | Pending approval |
| `"Admins can upload course thumbnails"` | `storage.objects` | `supabase/migrations/20261010000002_storage_buckets.sql:22` | Pending approval |
| `"Admins can update course thumbnails"` | `storage.objects` | `supabase/migrations/20261010000002_storage_buckets.sql:27` | Pending approval |
| `"Admins can delete course thumbnails"` | `storage.objects` | `supabase/migrations/20261010000002_storage_buckets.sql:32` | Pending approval |
| `"Public can view avatars"` | `storage.objects` | `supabase/migrations/20261010000002_storage_buckets.sql:38` | Pending approval |
| `"Users can upload their own avatar"` | `storage.objects` | `supabase/migrations/20261010000002_storage_buckets.sql:43` | Pending approval |
| `"Users can update their own avatar"` | `storage.objects` | `supabase/migrations/20261010000002_storage_buckets.sql:48` | Pending approval |
| `"Events are viewable by everyone"` | `public.events` | `supabase/migrations/20261010000003_remaining_tables.sql:23` | Pending approval |
| `"Admins can manage events"` | `public.events` | `supabase/migrations/20261010000003_remaining_tables.sql:28` | Pending approval |
| `"Admins can view audit logs"` | `public.audit_logs` | `supabase/migrations/20261010000003_remaining_tables.sql:56` | Pending approval |
| `"Users can insert audit logs"` | `public.audit_logs` | `supabase/migrations/20261010000003_remaining_tables.sql:61` | Pending approval |
| `"Staff viewable by everyone"` | `public.staff` | `supabase/migrations/20261010000003_remaining_tables.sql:87` | Pending approval |
| `"Admins can manage staff"` | `public.staff` | `supabase/migrations/20261010000003_remaining_tables.sql:92` | Pending approval |
| `"Projects viewable by everyone"` | `public.projects` | `supabase/migrations/20261010000003_remaining_tables.sql:118` | Pending approval |
| `"Admins can manage projects"` | `public.projects` | `supabase/migrations/20261010000003_remaining_tables.sql:123` | Pending approval |
| `"Blog viewable by everyone"` | `public.blog` | `supabase/migrations/20261010000003_remaining_tables.sql:149` | Pending approval |
| `"Admins can manage blog"` | `public.blog` | `supabase/migrations/20261010000003_remaining_tables.sql:154` | Pending approval |
| `"Gallery viewable by everyone"` | `public.gallery` | `supabase/migrations/20261010000003_remaining_tables.sql:177` | Pending approval |
| `"Admins can manage gallery"` | `public.gallery` | `supabase/migrations/20261010000003_remaining_tables.sql:182` | Pending approval |
| `"Users can read their notifications"` | `public.notifications` | `supabase/migrations/20261010000003_remaining_tables.sql:212` | Pending approval |
| `"Users can update their notifications"` | `public.notifications` | `supabase/migrations/20261010000003_remaining_tables.sql:217` | Pending approval |
| `"Admins can manage notifications"` | `public.notifications` | `supabase/migrations/20261010000003_remaining_tables.sql:223` | Pending approval |
| `"Settings are readable by everyone"` | `public.settings` | `supabase/migrations/20261010000003_remaining_tables.sql:238` | Pending approval |
| `"Admins can update settings"` | `public.settings` | `supabase/migrations/20261010000003_remaining_tables.sql:243` | Pending approval |
| `"Admins can read admin email allowlist"` | `public.admin_emails` | `supabase/migrations/20261010000004_phase2_schema_hardening.sql:26` | Pending approval |
| `"Admins can manage admin email allowlist"` | `public.admin_emails` | `supabase/migrations/20261010000004_phase2_schema_hardening.sql:31` | Pending approval |
| `"Users can read own profile"` | `public.profiles` | `supabase/migrations/20261010000004_phase2_schema_hardening.sql:476` | Pending approval |
| `"Users can update their own profile"` | `public.profiles` | `supabase/migrations/20261010000004_phase2_schema_hardening.sql:481` | Pending approval |
| `"Admins can delete profiles"` | `public.profiles` | `supabase/migrations/20261010000004_phase2_schema_hardening.sql:493` | Pending approval |
| `"Users can read own users mirror"` | `public.users` | `supabase/migrations/20261010000004_phase2_schema_hardening.sql:498` | Pending approval |
| `"Users can update own users mirror"` | `public.users` | `supabase/migrations/20261010000004_phase2_schema_hardening.sql:503` | Pending approval |
| `"Admins can delete users mirror"` | `public.users` | `supabase/migrations/20261010000004_phase2_schema_hardening.sql:515` | Pending approval |
| `"Users can insert their own auth events"` | `public.auth_events` | `supabase/migrations/20261010000004_phase2_schema_hardening.sql:520` | Pending approval |
| `"Admins can view all auth events"` | `public.auth_events` | `supabase/migrations/20261010000004_phase2_schema_hardening.sql:525` | Pending approval |
| `"Anyone can submit contact messages"` | `public.messages` | `supabase/migrations/20261010000004_phase2_schema_hardening.sql:530` | Pending approval |
| `"Admins can read contact messages"` | `public.messages` | `supabase/migrations/20261010000004_phase2_schema_hardening.sql:535` | Pending approval |
| `"Admins can update contact messages"` | `public.messages` | `supabase/migrations/20261010000004_phase2_schema_hardening.sql:540` | Pending approval |
| `"Admins can delete contact messages"` | `public.messages` | `supabase/migrations/20261010000004_phase2_schema_hardening.sql:546` | Pending approval |
| `"Users can view own points log"` | `public.points_log` | `supabase/migrations/20261010000004_phase2_schema_hardening.sql:551` | Pending approval |
| `"Users can insert own points log"` | `public.points_log` | `supabase/migrations/20261010000004_phase2_schema_hardening.sql:556` | Pending approval |
| `"Users can view own achievements"` | `public.user_achievements` | `supabase/migrations/20261010000004_phase2_schema_hardening.sql:561` | Pending approval |
| `"Users can insert own achievements"` | `public.user_achievements` | `supabase/migrations/20261010000004_phase2_schema_hardening.sql:566` | Pending approval |
| `"Certificates are viewable by owner, admins, or verification code"` | `public.certificates` | `supabase/migrations/20261010000004_phase2_schema_hardening.sql:571` | Pending approval |
| `"Users can create own certificates"` | `public.certificates` | `supabase/migrations/20261010000004_phase2_schema_hardening.sql:576` | Pending approval |
| `"Admins can upload course thumbnails"` | `storage.objects` | `supabase/migrations/20261010000004_phase2_schema_hardening.sql:582` | Pending approval |
| `"Course thumbnails are publicly readable"` | `storage.objects` | `supabase/migrations/20261010000005_phase5_courses.sql:22` | Pending approval |
| `"Admins can upload course thumbnails"` | `storage.objects` | `supabase/migrations/20261010000005_phase5_courses.sql:27` | Pending approval |
| `"Admins can update course thumbnails"` | `storage.objects` | `supabase/migrations/20261010000005_phase5_courses.sql:32` | Pending approval |
| `"Admins can delete course thumbnails"` | `storage.objects` | `supabase/migrations/20261010000005_phase5_courses.sql:38` | Pending approval |
| `"Public profiles are viewable by authenticated users"` | `public.profiles` | `supabase/migrations/20261010000007_auth_rebuild_clean.sql:89` | Pending approval |
| `"Public profiles are viewable by anon"` | `public.profiles` | `supabase/migrations/20261010000007_auth_rebuild_clean.sql:96` | Pending approval |
| `"Users can update own profile except role"` | `public.profiles` | `supabase/migrations/20261010000007_auth_rebuild_clean.sql:103` | Pending approval |
| `"Admins can update any profile"` | `public.profiles` | `supabase/migrations/20261010000007_auth_rebuild_clean.sql:118` | Pending approval |
| `"Users can insert own profile"` | `public.profiles` | `supabase/migrations/20261010000007_auth_rebuild_clean.sql:126` | Pending approval |
| `"Users can insert own auth_events"` | `public.auth_events` | `supabase/migrations/20261010000007_auth_rebuild_clean.sql:134` | Pending approval |
| `"Users view own auth events and Admins view all"` | `public.auth_events` | `supabase/migrations/20261010000007_auth_rebuild_clean.sql:143` | Pending approval |
| `"forms_admin_manage_all"` | `public.forms` | `supabase/migrations/20261011000000_form_builder.sql:133` | Pending approval |
| `"forms_public_read_published"` | `public.forms` | `supabase/migrations/20261011000000_form_builder.sql:141` | Pending approval |
| `"form_questions_admin_manage_all"` | `public.form_questions` | `supabase/migrations/20261011000000_form_builder.sql:153` | Pending approval |
| `"form_questions_public_read_published"` | `public.form_questions` | `supabase/migrations/20261011000000_form_builder.sql:161` | Pending approval |
| `"form_responses_admin_read_all"` | `public.form_responses` | `supabase/migrations/20261011000000_form_builder.sql:177` | Pending approval |
| `"form_responses_admin_delete"` | `public.form_responses` | `supabase/migrations/20261011000000_form_builder.sql:184` | Pending approval |
| `"form_responses_insert_allowed"` | `public.form_responses` | `supabase/migrations/20261011000000_form_builder.sql:191` | Pending approval |
| `"form_answers_admin_read_all"` | `public.form_answers` | `supabase/migrations/20261011000000_form_builder.sql:211` | Pending approval |
| `"form_answers_admin_delete"` | `public.form_answers` | `supabase/migrations/20261011000000_form_builder.sql:218` | Pending approval |
| `"form_answers_insert_allowed"` | `public.form_answers` | `supabase/migrations/20261011000000_form_builder.sql:225` | Pending approval |
| `"sync_logs_admin_all"` | `public.sync_logs` | `supabase/migrations/20261011000000_form_builder.sql:241` | Pending approval |
| `"form_attachments_admin_all"` | `storage.objects` | `supabase/migrations/20261011000000_form_builder.sql:441` | Pending approval |
| `"form_attachments_upload_public"` | `storage.objects` | `supabase/migrations/20261011000000_form_builder.sql:449` | Pending approval |
| `qa_admin` | `public.` | `supabase/migrations/20261013000001_real_operations.sql:51` | Pending approval |
| `qa_profile_read` | `public.profiles` | `supabase/migrations/20261013000001_real_operations.sql:54` | Pending approval |
| `qa_profile_update` | `public.profiles` | `supabase/migrations/20261013000001_real_operations.sql:55` | Pending approval |
| `qa_course_read` | `public.courses` | `supabase/migrations/20261013000001_real_operations.sql:56` | Pending approval |
| `qa_lesson_read` | `public.lessons` | `supabase/migrations/20261013000001_real_operations.sql:57` | Pending approval |
| `qa_enrollment_read` | `public.enrollments` | `supabase/migrations/20261013000001_real_operations.sql:59` | Pending approval |
| `qa_staff_read` | `public.staff` | `supabase/migrations/20261013000001_real_operations.sql:60` | Pending approval |
| `qa_project_read` | `public.projects` | `supabase/migrations/20261013000001_real_operations.sql:61` | Pending approval |
| `qa_project_submit` | `public.projects` | `supabase/migrations/20261013000001_real_operations.sql:62` | Pending approval |
| `qa_project_own` | `public.projects` | `supabase/migrations/20261013000001_real_operations.sql:63` | Pending approval |
| `qa_blog_read` | `public.blog` | `supabase/migrations/20261013000001_real_operations.sql:64` | Pending approval |
| `qa_gallery_read` | `public.gallery` | `supabase/migrations/20261013000001_real_operations.sql:65` | Pending approval |
| `qa_settings_read` | `public.settings` | `supabase/migrations/20261013000001_real_operations.sql:66` | Pending approval |
| `qa_messages_insert` | `public.messages` | `supabase/migrations/20261013000001_real_operations.sql:67` | Pending approval |
| `qa_notifications_read` | `public.notifications` | `supabase/migrations/20261013000001_real_operations.sql:70` | Pending approval |
| `qa_notifications_update` | `public.notifications` | `supabase/migrations/20261013000001_real_operations.sql:71` | Pending approval |
| `qa_notifications_insert` | `public.notifications` | `supabase/migrations/20261013000001_real_operations.sql:72` | Pending approval |
| `qa_auth_events_read` | `public.auth_events` | `supabase/migrations/20261013000001_real_operations.sql:73` | Pending approval |
| `qa_auth_events_insert` | `public.auth_events` | `supabase/migrations/20261013000001_real_operations.sql:74` | Pending approval |
| `qa_points_read` | `public.points_log` | `supabase/migrations/20261013000001_real_operations.sql:75` | Pending approval |
| `qa_badges_read` | `public.user_achievements` | `supabase/migrations/20261013000001_real_operations.sql:76` | Pending approval |
| `qa_badges_insert` | `public.user_achievements` | `supabase/migrations/20261013000001_real_operations.sql:77` | Pending approval |
| `qa_certificates_read` | `public.certificates` | `supabase/migrations/20261013000001_real_operations.sql:78` | Pending approval |
| `qa_forms_read` | `public.forms` | `supabase/migrations/20261013000001_real_operations.sql:79` | Pending approval |
| `qa_questions_read` | `public.form_questions` | `supabase/migrations/20261013000001_real_operations.sql:80` | Pending approval |
| `qa_reads` | `public.notification_reads` | `supabase/migrations/20261013000003_auth_notifications.sql:9` | Pending approval |
| `qa_attachments_admin` | `storage.objects` | `supabase/migrations/20261013000005_storage.sql:13` | Pending approval |
| `qa_form_upload` | `storage.objects` | `supabase/migrations/20261013000005_storage.sql:16` | Pending approval |
| `qa_public_images` | `storage.objects` | `supabase/migrations/20261013000005_storage.sql:21` | Pending approval |
| `qa_images_admin` | `storage.objects` | `supabase/migrations/20261013000005_storage.sql:23` | Pending approval |
| `qa_own_avatar` | `storage.objects` | `supabase/migrations/20261013000005_storage.sql:27` | Pending approval |
| `qa_private_attachment_reads` | `storage.objects` | `supabase/migrations/20261013000005_storage.sql:32` | Pending approval |
| `qa_target_upload_limits` | `storage.objects` | `supabase/migrations/20261013000005_storage.sql:35` | Pending approval |
| `qa_target_update_limits` | `storage.objects` | `supabase/migrations/20261013000005_storage.sql:42` | Pending approval |
| `qa_target_delete_limits` | `storage.objects` | `supabase/migrations/20261013000005_storage.sql:48` | Pending approval |
| `qa_avatar_directory_private` | `storage.objects` | `supabase/migrations/20261014000013_profile_photos.sql:7` | Pending approval |
| `course_modules_read` | `course_modules` | `supabase/migrations/20261015000014_course_media.sql:10` | Pending approval |
| `course_modules_admin` | `course_modules` | `supabase/migrations/20261015000014_course_media.sql:11` | Pending approval |
| `course_assets_read` | `course_assets` | `supabase/migrations/20261015000014_course_media.sql:23` | Pending approval |
| `own_watch_progress` | `lesson_watch_progress` | `supabase/migrations/20261015000014_course_media.sql:50` | Pending approval |
