// Run emitted JavaScript with Node's real ESM resolver, without tsx's resolution fallback.
import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import ts from 'typescript';
const root=path.resolve('qa-audit/.runtime/course-api-esm');
await fs.mkdir(root,{recursive:true});await fs.writeFile(path.join(root,'package.json'),'{"type":"module"}');
const files=['api/_lib/authorize.ts','server/courseMedia.ts','server/courseAi.ts','api/courses/drive.ts','api/courses/media.ts','api/courses/analyze.ts'];
for(const file of files){const output=path.join(root,file.replace(/\.ts$/,'.js'));await fs.mkdir(path.dirname(output),{recursive:true});const source=await fs.readFile(file,'utf8');const js=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;await fs.writeFile(output,js);}
process.env.SUPABASE_URL='https://qa-test.supabase.co';process.env.SUPABASE_SERVICE_ROLE_KEY='QA_TEST_SERVER';
for(const name of ['drive','media','analyze']){const {default:handler}=await import(pathToFileURL(path.join(root,'api/courses',name+'.js')).href);const res={code:0,setHeader(){},status(code){this.code=code;return this;},json(){return this;}};await handler({method:'POST',headers:{},body:{}},res);if(res.code!==401)throw Error('Emitted endpoint did not enforce authentication: '+name);console.log('PASS emitted Node ESM endpoint '+name);}
