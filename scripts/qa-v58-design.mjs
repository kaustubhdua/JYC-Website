import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const css=read('src/styles/jyc-v58-final.css');
const system=read('src/styles/public-system.css');
const main=read('src/main.jsx');
const home=read('src/jyc-editorial-home.jsx');
const checks=[
  ['V58 visual layer exists',fs.existsSync(path.join(root,'src/styles/jyc-v58-final.css'))],
  ['V58 visual layer is imported',system.includes("@import './jyc-v58-final.css';")],
  ['official light palette',css.includes('--jyc-bg:#f5f1e6')&&css.includes('--jyc-red:#a82420')&&css.includes('--jyc-gold:#bf9c6f')],
  ['official dark palette',css.includes('--jyc-bg:#0f0e11')&&css.includes('--jyc-red:#c92a2a')&&css.includes('--jyc-gold:#d2b48c')],
  ['Space Grotesk display system',css.includes('Space Grotesk')],
  ['desktop navigation uses JYC routes',main.includes("['Clubs','/clubs']")&&main.includes("['Events','/events']")],
  ['home navigation exposes Team and Contact',main.includes("['Team','team']")&&main.includes("['Contact','/contact']")],
  ['mobile five-item dock retained',main.includes("['Home','/','home']")&&main.includes("['More','__more','more']")],
  ['home signature hero retained',home.includes('THE VOICE.')&&home.includes('THE TALENT.')&&home.includes('THE SPIRIT.')],
  ['real media fallback retained',home.includes('FALLBACK')&&home.includes('onError')],
  ['reduced-motion contract',css.includes('@media(prefers-reduced-motion:reduce)')],
  ['44px interaction target contract',css.includes('min-height:44px')||css.includes('min-height: 44px')],
  ['creator footer remains wired',main.includes('jyc-creator-credit')&&main.includes('data.creator.linkedin')],
];
let failed=0;
for(const [name,ok] of checks){console.log((ok?'PASS':'FAIL')+': '+name);if(!ok)failed++}
if(failed)process.exit(1);
console.log('JYC V58 design-contract QA passed.');
