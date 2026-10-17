import fs from 'node:fs';import path from 'node:path';
const root=path.resolve(process.argv[2]||'qa-audit/.runtime/QA_TEST_fresh_clone_02/dist/assets');
const result=fs.readdirSync(root).filter(name=>/^(index|vendor-react|vendor-pdf|vendor-charts).*\.js$/.test(name)).map(file=>({file,bytes:fs.statSync(path.join(root,file)).size,imports:[...fs.readFileSync(path.join(root,file),'utf8').matchAll(/import\{([^}]+)\}from["']([^"']+)["']/g)].map(match=>({bindings:match[1],source:match[2]}))}));
console.log(JSON.stringify(result,null,2));
