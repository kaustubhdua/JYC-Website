import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const main=read('src/main.jsx');
const loader=main.slice(main.indexOf('async function loadData()'),main.indexOf('\nasync function saveData'));
const admin=read('src/admin-chunk.jsx');
const html=read('index.html');
const cssFiles=[];
function walkCss(dir){ for(const entry of fs.readdirSync(dir,{withFileTypes:true})){ const full=path.join(dir,entry.name); if(entry.isDirectory()) walkCss(full); else if(entry.isFile() && full.endsWith('.css')) cssFiles.push(full); } }
walkCss(path.join(root,'src'));
const cssText=cssFiles.map(f=>fs.readFileSync(f,'utf8')).join('\n');
const checks=[
 ['featured/event navigation contract is present', /function EventCard\([\s\S]*?events\//.test(main) || /<EventCard key=\{e\.id\} e=\{e\}/.test(main)],
 ['canonical URL is not root-directory asset syntax', !html.includes('<link rel="canonical" href="/" />')],
 ['canonical URL is absolute', /<link rel="canonical" href="https?:\/\//.test(html)],
 ['GalleryItems is not redeclared locally', !/function GalleryItems\(\{items\}\)/.test(main)],
 ['AdminErrorBoundary import does not collide with local class', !(/class AdminErrorBoundary extends/.test(admin) && /import[^;]*\bAdminErrorBoundary\b[^;]*from ['\"]\.\/admin-extra\.jsx['\"]/.test(admin))],
 ['CSS keyframe identifiers are valid', !/@keyframes\s+[0-9]/.test(cssText) && !/animation(?:-name)?\s*:\s*[0-9]/.test(cssText)],
 ['Production initialization does not ship demo content', main.includes("useState(()=>import.meta.env.DEV?publicDemoData():norm(empty))")],
 ['Production missing-config path does not fabricate content', loader.includes("return import.meta.env.DEV?publicDemoData():norm(empty)")],
 ['Multi-day events use dateEnd for lifecycle state', main.includes('const effectiveEndDate=e.dateEnd||e.date')],
 ['retired academic calendar data is not in the active public feature bundle', !fs.readFileSync(path.join(root,'src/extra-features.jsx'),'utf8').includes('academicKeyDates') && !fs.readFileSync(path.join(root,'src/extra-features.jsx'),'utf8').includes('Academic dates')],
 ['GLB bot supports model-native animation without auto-rotation', fs.readFileSync(path.join(root,'src/jyc-bot.jsx'),'utf8').includes('availableAnimations') && fs.readFileSync(path.join(root,'src/jyc-bot.jsx'),'utf8').includes('disable-pan') && !fs.readFileSync(path.join(root,'src/jyc-bot.jsx'),'utf8').includes('auto-rotate')],
];
let failed=0; for(const [name,ok] of checks){ console.log(`${ok?'PASS':'FAIL'}: ${name}`); if(!ok) failed++; }
if(failed){ console.error(`BUILD PREFLIGHT FAILED: ${failed} check(s)`); process.exit(1); }
console.log('BUILD PREFLIGHT PASS');
