import fs from 'node:fs';
const c=fs.readFileSync('vite.config.js','utf8');
const p=JSON.parse(fs.readFileSync('package.json','utf8'));
const l=JSON.parse(fs.readFileSync('package-lock.json','utf8'));
const sw=fs.readFileSync('public/sw.js','utf8');
const checks=[
 ['version 61.1.0',p.version==='61.1.0'&&l.version==='61.1.0'&&l.packages?.['']?.version==='61.1.0'],
 ['cache v61.1',sw.includes('jyc-cache-v61-1-0')],
 ['vite config uses valid forward-slash regexes',c.includes('test: /node_modules\\/react(?:-dom)?\\//')&&c.includes('test: /node_modules\\/react-router-dom\\//')&&c.includes('test: /node_modules\\/\\@supabase\\//')&&c.includes('test: /node_modules\\/three\\//')&&c.includes('test: /node_modules\\//')],
 ['archive path regex is valid',c.includes("replace(/^\\/assets\\//,''")&&!c.includes("replace(/^\\\\/assets\\\\//,''")],
 ['archive chunk regex is valid',c.includes('test: /src\\/(?:source-archive-index|jyc-source-archive|jyc-source-media)\\.js$/')],
 ['no malformed doubled slash regex remains',!c.includes('[\\\\\\\\/]')&&!c.includes('^\\\\\\\\/assets\\\\\\\\/')]
];
for(const [n,ok] of checks) console.log((ok?'PASS':'FAIL')+': '+n);
if(checks.some(([,ok])=>!ok))process.exit(1);
console.log('V61.1 BUILD CONFIG QA PASS');
