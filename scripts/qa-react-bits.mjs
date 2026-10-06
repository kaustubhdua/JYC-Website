import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const pkg=JSON.parse(read('package.json'));
const lock=JSON.parse(read('package-lock.json'));
const main=read('src/main.jsx');
const now=read('src/jyc-now.jsx');
const bits=read('src/react-bits/JYCMicro.jsx');
const css=read('src/react-bits/JYCMicro.css');
const checks=[
 ['React Bits dependency declared',pkg.dependencies.motion==='12.23.22'&&pkg.dependencies['@hugeicons/react']==='1.1.10'&&pkg.dependencies['@hugeicons/core-free-icons']==='4.3.5'],
 ['lockfile root matches',lock.packages[''].dependencies.motion==='12.23.22'&&lock.packages[''].dependencies['@hugeicons/react']==='1.1.10'],
 ['React Bits components present',/BellToggle|JellyRadio|RubberSegment|BorderGlow/.test(bits)&&fs.existsSync(path.join(root,'src/components/react-bits/CountUp.jsx'))&&fs.existsSync(path.join(root,'src/components/react-bits/DepthCarousel.jsx'))],
 ['interaction-heavy micro-components are lazy-loaded',main.includes("LazyRubberSegment")&&main.includes("LazyBellToggle")&&!main.includes("LazyBorderGlow")],
 ['JYC Now uses JellyRadio',now.includes('LazyJellyRadio')&&now.includes('Filter JYC Now by community')],
 ['event view uses RubberSegment',main.includes('LazyRubberSegment')&&main.includes('Event view')],
 ['event reminders use BellToggle',main.includes('EventReminderControl')&&main.includes('scheduleEventReminder')],
 ['retired Agentic AI popup is removed',!main.includes('AgenticAIPopup')&&!main.includes('agentic-launcher')&&!main.includes('demo-agentic-ai-website.vercel.app')],
 ['React Bits reduced motion styles exist',css.includes('prefers-reduced-motion')],
 ['no public Control Center launcher added',!main.includes('Control Center</button>')&&!main.includes('Control Center ↗')]
];
let failed=0;for(const[c,ok]of checks){console.log((ok?'PASS':'FAIL')+' · '+c);if(!ok)failed++}process.exit(failed?1:0);
