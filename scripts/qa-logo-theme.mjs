import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
const system=read('src/styles/public-system.css');
const theme=read('src/jyc-logo-final-theme.css');
const main=read('src/main.jsx');
const manifest=read('public/manifest.json');

const checks=[
  [system.includes("@import '../jyc-logo-final-theme.css';")&&system.indexOf("@import '../jyc-logo-final-theme.css';")<system.indexOf("@import '../jyc-editorial-system.css';"),'senior logo theme is part of the shared stack before page-specific editorial refinements'],
  [theme.includes('--jyc-navy:#0F0E11')&&theme.includes('--jyc-champagne:#BF9C6F')&&theme.includes('--jyc-ivory:#FFF8E1')&&theme.includes('--accent-red:#A82420'),'senior logo palette tokens must be present'],
  [theme.includes('prefers-reduced-motion:reduce'),'final theme must respect reduced motion'],
  [theme.includes('prefers-contrast:more'),'final theme must support higher contrast'],
  [theme.includes('min-width:44px')&&theme.includes('min-height:44px'),'interactive targets must meet the 44px touch target used by the final public layer'],
  [main.includes("theme==='dark'?'#0f0e11':'#f5f1e6'"),'browser theme-color must match the logo palette'],
  [manifest.includes('"theme_color": "#f5f1e6"'),'PWA theme color must match the logo palette'],
  [manifest.includes('"src": "/assets/jyc-logo.webp"')&&manifest.includes('"type": "image/webp"')&&manifest.includes('"sizes": "512x512"'),'PWA manifest logo path, MIME type and intrinsic dimensions must agree'],
  [manifest.includes('"purpose": "any"')&&!manifest.includes('"purpose": "any maskable"'),'PWA does not advertise an unverified maskable safe area'],
  [main.includes('PDF_HUB_GALLERY')&&main.includes('PDF_HUB_EXTRA_GALLERY'),'homepage must retain supplied hub archive media'],
  [theme.includes('.public-app [style*="--hub-accent"]'),'hub/event accent colors must be constrained to the shared logo system']
];
let failed=false;
for(const [ok,label] of checks){console.log(ok?'PASS':'FAIL',label);if(!ok)failed=true}
process.exit(failed?1:0);
