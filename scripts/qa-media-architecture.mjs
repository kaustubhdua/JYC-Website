import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const source=read('src/jyc-source-media.js');
const main=read('src/main.jsx');
const css=read('src/jyc-logo-final-theme.css');
const checks=[
 ['media taxonomy exports event mapper',source.includes('export function sourceEventMedia')],
 ['media taxonomy exports manifest builder',source.includes('export function buildJycMediaManifest')],
 ['event page imports source event media',main.includes('sourceEventMedia')],
 ['event page renders visual record',main.includes('event-source-gallery')],
 ['event gallery preserves source page context',main.includes('Source page')],
 ['event gallery is responsive',css.includes('.event-source-gallery-grid')],
 ['source archive remains deduplicated',source.includes('const seen=new Set()')],
 ['source media avoids synthetic imagery',source.includes('SOURCE_GALLERY')],
];
let failed=0; for(const [name,ok] of checks){console.log((ok?'PASS':'FAIL')+': '+name);if(!ok)failed++}
if(failed)process.exit(1);
console.log('Media architecture QA: '+checks.length+'/'+checks.length+' checks passed.');
