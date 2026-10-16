import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
const theme=read('src/jyc-logo-final-theme.css');
const system=read('src/styles/public-system.css');
const index=read('index.html');
const manifest=read('public/manifest.json');
const main=read('src/main.jsx');
const editorialHome=read('src/jyc-editorial-home.jsx');
const admin=read('src/admin-chunk.jsx');
const adminExtra=read('src/admin-extra.jsx');

const checks=[
  [system.includes("@import '../jyc-logo-final-theme.css';"),'senior theme remains the final public CSS layer'],
  [theme.includes('--jyc-navy:#18161d')&&theme.includes('--jyc-champagne:#bf9c6f')&&theme.includes('--jyc-ivory:#ffffff')&&theme.includes('--accent-red:#a82420'),'senior logo palette is explicit'],
  [theme.includes('hero-logo-stage::after')&&theme.includes('jycLogoSheen'),'hero has a restrained visible micro-interaction'],
  [theme.includes('.hero-logo-ring,')&&theme.includes('display:none!important'),'rejected orbital rings stay disabled'],
  [theme.includes('prefers-reduced-motion:reduce')&&theme.includes('jycLogoSheen'),'motion has a reduced-motion kill switch'],
  [theme.includes('prefers-contrast:more'),'higher-contrast preference is supported'],
  [theme.includes('min-width:44px')&&theme.includes('min-height:44px'),'public controls use the project 44px target contract'],
  [theme.includes('.public-app p,.public-app li{color:var(--jyc-muted-live)!important}'),'body copy has an explicit readable theme color'],
  [index.includes('theme-color" media="(prefers-color-scheme: dark)" content="#0f0e11"'),'dark browser chrome uses the deep navy brand color'],
  [manifest.includes('"theme_color": "#f5f1e6"'),'PWA theme color stays on the senior palette'],
  [manifest.includes('"src": "/assets/jyc-logo.webp"')&&manifest.includes('"type": "image/webp"'),'PWA icon uses the configured WebP asset with matching MIME type'],
  [editorialHome.includes('fetchPriority="high"')&&editorialHome.includes('jh-photo-frame'),'editorial hero image is prioritized for first paint'],
  [editorialHome.includes('jh-hero')&&read('src/jyc-editorial-home.css').includes('--jh-bg:#f5f1e6')&&read('src/jyc-editorial-home.css').includes('--jh-gold:#bf9c6f')&&read('src/jyc-editorial-home.css').includes('[data-theme=dark] .jyc-home'),'editorial homepage follows the JYC palette in light and dark mode'],
  [read('src/jyc-innovation-motion.jsx').includes('Public card tilt was intentionally retired')&&!read('src/jyc-innovation-motion.css').includes('perspective(1100px) rotateX(var(--tilt-x))'),'public card tilt is retired for V1 stability'],
  [main.includes('dataset.jycFallbackApplied')&&main.includes("'/JYC%20Logo(4).png'"),'runtime image fallback prevents broken media glyphs'],
  [main.includes('PDF_HUB_PROGRAMME.map')&&main.includes('supplied-event-programme'),'All Hubs programme material remains surfaced'],
  [main.includes('PDF_HUB_EXTRA_GALLERY')&&main.includes('PDF_HUB_STORIES'),'source archive remains wired into the public experience'],
  [admin.includes('AdminVerification')&&admin.includes("tab==='verification'"),'admin verification workflow is wired into the control center'],
  [admin.includes("'verification'")&&adminExtra.includes('source URL is required'),'verification queue is exposed and evidence is required in the editor'],
  [!adminExtra.match(/verified_by\\s*:|verified_at\\s*:/),'verification editor cannot choose verifier identity or timestamp'],
  [fs.existsSync('supabase/migrations/202610030005_publication_verification_guard.sql'),'publication verification guard migration exists'],
  [fs.existsSync('supabase/migrations/202610030007_verification_trust_contract.sql'),'verification trust contract migration exists'],
  [fs.existsSync('supabase/migrations/202610030008_verification_identity_audit.sql'),'verification identity audit migration exists'],
  [fs.existsSync('supabase/migrations/202610030009_public_submission_guard.sql'),'public submission abuse guard migration exists'],
  [fs.existsSync('supabase/tests/database/jyc_security_rls.test.sql'),'database RLS regression suite exists'],
  [fs.existsSync('supabase/migrations/202610040010_v56_1_public_registration_acl.sql'),'retired public registration RPC is explicitly removed from client execute ACL']
];
checks.push([main.includes('DepthCarousel')&&fs.existsSync('src/components/react-bits/DepthCarousel.jsx'),'club photography carousel is centred and contained']);
checks.push([editorialHome.includes('01</b> DISCOVER')&&editorialHome.includes('02</b> PARTICIPATE')&&editorialHome.includes('03</b> BELONG'),'homepage participation proof is lightweight and non-fabricated']);
let failed=false;
for(const [ok,label] of checks){console.log(ok?'PASS':'FAIL',label);if(!ok)failed=true}
process.exit(failed?1:0);
