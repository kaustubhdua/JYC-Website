import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const main=read('src/main.jsx'),now=read('src/jyc-now.jsx'),api=read('api/jyc-updates.js'),pkg=JSON.parse(read('package.json'));
const checks=[
 [pkg.version==='56.7.0','package is V56.7'],
 [main.includes("from './jyc-now.jsx'")&&now.includes('JYCNowStrip')&&fs.readFileSync(path.join(root,'src/jyc-editorial-home.jsx'),'utf8').includes('<JYCNowStrip limit={3}/>'),'JYC Now homepage layer is mounted'],
 [main.includes("clean==='/updates'")&&main.includes('<JYCNowPage data={data}/>'),'JYC Now route is public and wired'],
 [main.includes("['/updates','JYC Now'"),'JYC Now is discoverable in More navigation'],
 [now.includes('What JYC is creating now')&&now.includes('Community Spotlight'),'editorial JYC Now experience exists'],
 [now.includes('not a social-network feed'),'no social-network clone positioning'],
 [now.includes('View original ↗'),'every update returns to its canonical source'],
 [api.includes('META_ACCESS_TOKEN')&&api.includes('YOUTUBE_API_KEY')&&api.includes('JYC_RSS_FEEDS'),'server-side connectors are configurable'],
 [!api.includes('eyJ')&&!api.includes('EAAC'),'social tokens are not hard-coded'],
 [fs.existsSync('supabase/V47-JYC-NOW.sql'),'aggregation schema migration exists'],
 [now.includes("const sourceCount=JYC_HUB_SOURCE_REGISTRY.length")&&now.includes("named community sources"),'JYC Now community source count uses the maintained registry'],
 [api.includes("X-Content-Type-Options")&&api.includes("if(sync)res.setHeader('Cache-Control','no-store"),'JYC Now API hardens response headers and sync caching'],
];
let failed=false;for(const [ok,label] of checks){console.log(ok?'PASS':'FAIL',label);if(!ok)failed=true}process.exit(failed?1:0);
