import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const source=read('src/jyc-source-media.js');
const main=read('src/main.jsx');
const css=read('src/jyc-logo-final-theme.css');
const gallery=read('src/extra-features.jsx');
const checks=[
 ['media taxonomy exports event mapper',source.includes('export function sourceEventMedia')],
 ['media taxonomy exports manifest builder',source.includes('export function buildJycMediaManifest')],
 ['event page imports source event media',main.includes('sourceEventMedia')],
 ['event page renders visual record',main.includes('event-source-gallery')],
 ['event gallery preserves source page context',main.includes('Source page')],
 ['event gallery is responsive',css.includes('.event-source-gallery-grid')],
 ['source archive remains deduplicated',source.includes('const seen=new Set()')],
 ['source media avoids synthetic imagery',source.includes('SOURCE_GALLERY')],
 ['event aliases avoid shared welcome bucket',!source.includes("'Ebullience','freshers','welcome'")&&!source.includes("'Induction','orientation','welcome'")],
 ['media provenance taxonomy exists',source.includes('sourceType:')&&source.includes('sourceLabel:')&&source.includes('role')],
 ['media alt metadata exists',source.includes('alt:item.alt||item.caption')],
 ['external media is classified',source.includes('official-external-media')],
 ['gallery uses role filters',gallery.includes("roleLabels")&&gallery.includes('VISUAL TYPE')],
];
let failed=0; for(const [name,ok] of checks){console.log((ok?'PASS':'FAIL')+': '+name);if(!ok)failed++}
if(failed)process.exit(1);
console.log('Media architecture QA: '+checks.length+'/'+checks.length+' checks passed.');
