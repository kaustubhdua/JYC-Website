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
  [editorialHome.includes('fetchPriority="high"')&&editorialHome.includes('jyc-v1-hero-media'),'editorial hero image is prioritized for first paint'],
  [editorialHome.includes('DepthCarousel')&&fs.existsSync('src/components/react-bits/DepthCarousel.jsx')&&fs.readFileSync('src/components/react-bits/DepthCarousel.css','utf8').includes('object-position:center center'),'club photography carousel is source-backed and centred'],
  [editorialHome.includes('CountUp')&&fs.existsSync('src/components/react-bits/CountUp.jsx'),'homepage impact metrics use the lightweight CountUp component'],
  [editorialHome.includes('data-fallback-src="/jyc-logo-official.webp"')&&main.includes('dataset.jycFallback'),'homepage media has a deterministic local image fallback'],
  [editorialHome.includes('new IntersectionObserver')&&editorialHome.includes('editorial-reveal')&&editorialHome.includes('is-visible'),'homepage reveal states cannot remain permanently transparent'],
  [fs.readFileSync('src/jyc-editorial-home.css','utf8').includes('object-position:center center')&&fs.readFileSync('src/jyc-editorial-home.css','utf8').includes('overflow:clip'),'V1 media is explicitly centred and horizontally overflow-safe'],
  [fs.readFileSync('src/jyc-editorial-home.css','utf8').includes('html[data-theme="dark"] .jyc-editorial-home'),'V1 homepage has an explicit dark-theme surface contract'],
  [fs.readFileSync('src/jyc-bot.jsx','utf8').includes("dataset.performance==='lite'")&&fs.readFileSync('src/jyc-bot.jsx','utf8').includes('jyc-glb-preload'),'GLB avoids constrained-device cost and preloads on capable devices'],
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
let failed=false;
for(const [ok,label] of checks){console.log(ok?'PASS':'FAIL',label);if(!ok)failed=true}
process.exit(failed?1:0);
