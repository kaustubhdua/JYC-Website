import fs from 'node:fs';
const failures=[];
const check=(name,ok,detail='')=>{console.log((ok?'PASS':'FAIL')+': '+name+(detail?' — '+detail:''));if(!ok)failures.push(name)};
const rootFiles=fs.readdirSync('.');
check('no tracked release archives remain',!rootFiles.some(x=>/\.zip$/i.test(x)));
const index=fs.readFileSync('index.html','utf8');
check('no retired /map link remains in no-JS navigation',!index.includes('href="/map"'));
check('canonical production origin is consistent',/https?:\/\/jyc-website-jyc-website\.vercel\.app\//i.test(index));
const sourceFiles=[];
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).forEach(e=>{const p=dir+'/'+e.name;if(e.isDirectory()&&!['node_modules','.git','dist'].includes(e.name))walk(p);else if(e.isFile()&&/\.(js|jsx|ts|tsx|json|html|css|sql|mjs)$/i.test(e.name))sourceFiles.push(p)});
walk('src');walk('scripts');walk('supabase');
for(const file of sourceFiles){const t=fs.readFileSync(file,'utf8');if(/https:\/\/(?:jycjiit\.vercel\.app|jyc-website-livid\.vercel\.app)/i.test(t)) failures.push(file+' contains a legacy Vercel origin');}
check('source has no legacy Vercel origins',!failures.some(x=>/legacy Vercel/.test(x)));
if(failures.length) process.exit(1);
console.log('Repository hygiene QA PASS');