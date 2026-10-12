/* JYC IDENTITY SYSTEM · V33.3 · 23 maintained community signatures
   Each community and event gets a distinct visual language while remaining inside
   the shared JYC beige / black / white editorial system.
   Accent colours are deliberately muted and source-led; they are not replacement brands.
*/
const BASE={
  Fortissimo:{accent:'#BF9C6F',motif:'SOUND / PERFORMANCE',signature:'Music, ensemble and stage presence',traits:['Music','Performance','Ensemble'],glyph:'♫',surface:'warm',shape:'wave',display:'EDITORIAL'},
  BDS:{accent:'#BF9C6F',motif:'RHYTHM / CULTURE',signature:'Bhangra, energy and group performance',traits:['Bhangra','Dance','Culture'],glyph:'✦',surface:'warm',shape:'pulse',display:'ENERGY'},
  VamUnique:{accent:'#A82420',motif:'MOVEMENT / EXPRESSION',signature:'Dance across contemporary and classical styles',traits:['Hip Hop','Contemporary','Bollywood'],glyph:'↗',surface:'warm',shape:'motion',display:'MOVEMENT'},
  Panache:{accent:'#A82420',motif:'STYLE / PRESENTATION',signature:'Fashion, confidence and visual presence',traits:['Fashion','Styling','Performance'],glyph:'◇',surface:'warm',shape:'frame',display:'FASHION'},
  RPH:{accent:'#BF9C6F',motif:'LOGIC / COMPETITION',signature:'Algorithms, problem solving and competitive programming',traits:['DSA','Competitive Programming','Code Clash'],glyph:'01',surface:'cool',shape:'grid',display:'SYSTEMS'},
  CICR:{accent:'#BF9C6F',motif:'BUILD / PROTOTYPE',signature:'Robotics, electronics and hands-on engineering',traits:['Robotics','Prototyping','Projects'],glyph:'◈',surface:'cool',shape:'circuit',display:'ENGINEERING'},
  Innovation:{accent:'#BF9C6F',motif:'IDEAS / BUILDING',signature:'Innovation, mentorship and entrepreneurship',traits:['Innovation','Mentorship','Entrepreneurship'],glyph:'↗',surface:'warm',shape:'spark',display:'IDEAS'},
  Zencoders:{accent:'#BF9C6F',motif:'CODE / CREATE',signature:'Programming practice, development and collaborative learning',traits:['Programming','Development','Coding'],glyph:'<>',surface:'cool',shape:'terminal',display:'CODE'},
  JODC:{accent:'#A82420',motif:'OPEN / COLLABORATE',signature:'Open-source contribution and developer collaboration',traits:['Open Source','Repositories','Contribution'],glyph:'⌘',surface:'cool',shape:'nodes',display:'OPEN SOURCE'},
  CypherX:{accent:'#BF9C6F',motif:'SECURE / THINK',signature:'Cybersecurity awareness, practical learning and CTFs',traits:['Cybersecurity','CTF','Awareness'],glyph:'⌁',surface:'cool',shape:'shield',display:'SECURITY'},
  Arcadia:{accent:'#BF9C6F',motif:'PLAY / COMPETE',signature:'Esports, gaming challenges and community',traits:['Esports','Gaming','AR/VR'],glyph:'+ ',surface:'warm',shape:'pixel',display:'ESPORTS'},
  'Neural Nexus':{accent:'#A82420',motif:'LEARN / INTELLIGENTLY BUILD',signature:'Artificial intelligence, machine learning and projects',traits:['AI / ML','Hackathons','Research'],glyph:'∿',surface:'cool',shape:'network',display:'AI / ML'},
  GDG:{accent:'#A82420',motif:'DEVELOP / CONNECT',signature:'Developer community, events and practical technology',traits:['Developer Community','Events','Technology'],glyph:'●',surface:'warm',shape:'dots',display:'DEVELOPER'},
  Dronotics:{accent:'#BF9C6F',motif:'FLIGHT / ENGINEERING',signature:'Drones, aerial robotics and technical competition',traits:['Drones','Aerial Robotics','Dron-O-War'],glyph:'△',surface:'cool',shape:'flight',display:'AERIAL'},
  Aakriti:{accent:'#BF9C6F',motif:'MAKE / IMAGINE',signature:'Fine art, visual craft and campus installations',traits:['Fine Arts','Craft','Installations'],glyph:'✎',surface:'warm',shape:'brush',display:'FINE ARTS'},
  Aura:{accent:'#A82420',motif:'SEE / DOCUMENT',signature:'Photography, event coverage and visual storytelling',traits:['Photography','Photo Walks','Archive'],glyph:'◉',surface:'cool',shape:'lens',display:'PHOTOGRAPHY'},
  Cinekala:{accent:'#BF9C6F',motif:'FRAME / TELL',signature:'Film, visual storytelling and screen culture',traits:['Film','Storytelling','Visuals'],glyph:'▣',surface:'warm',shape:'film',display:'FILM'},
  Abhivyakti:{accent:'#C92A2A',motif:'PERFORM / EXPRESS',signature:'Dramatics, theatre and storytelling through performance',traits:['Dramatics','Theatre','Performance'],glyph:'◐',surface:'warm',shape:'stage',display:'DRAMATICS'},
  Prismatic:{accent:'#BF9C6F',motif:'DESIGN / COMMUNICATE',signature:'Graphic design, visual systems and creative collaboration',traits:['Graphic Design','Visual Storytelling','Projects'],glyph:'◆',surface:'warm',shape:'poster',display:'DESIGN'},
  Eloquence:{accent:'#BF9C6F',motif:'WRITE / SPEAK',signature:'Writing, debate, anchoring and literary expression',traits:['Writing','Speaking','Debate'],glyph:'“',surface:'warm',shape:'quote',display:'LITERARY'},
  JSA:{accent:'#A82420',motif:'PLAY / REPRESENT',signature:'Sport, competition, teamwork and campus representation',traits:['Cricket','Football','Basketball'],glyph:'◎',surface:'cool',shape:'court',display:'SPORTS'},
  Qriosity:{accent:'#BF9C6F',motif:'QUESTION / DISCOVER',signature:'Quizzing, curiosity and knowledge-based competition',traits:['Quizzing','Awareness','Critical Thinking'],glyph:'?',surface:'warm',shape:'question',display:'QUIZ'},
  'JIIT OPTICA':{accent:'#BF9C6F',motif:'STEM / EXPLORE',signature:'Scientific curiosity, optics and STEM exploration',traits:['STEM','Science','Exploration'],glyph:'◌',surface:'cool',shape:'lens',display:'STEM'}
};

export const JYC_HUB_IDENTITIES=BASE;

const EVENT_PRESETS={
  'JAI 2026':{accent:'#A82420',motif:'AGENTS / SUMMIT',signature:'Agentic AI, builders and a global technology programme',traits:['Agentic AI','Summit','Hackathon'],shape:'network'},
  'DRONO-O-WAR':{accent:'#BF9C6F',motif:'FLIGHT / ARENA',signature:'Aerial robotics, precision and national competition',traits:['Drones','Engineering','Competition'],shape:'flight'},
  "RIDE Hack'26":{accent:'#BF9C6F',motif:'IDEAS / IMPACT',signature:'Innovation, entrepreneurship and real-world problem solving',traits:['Hackathon','Innovation','Entrepreneurship'],shape:'spark'},
  'CodeAI Hackathon':{accent:'#BF9C6F',motif:'CODE / INTELLIGENCE',signature:'Applied AI, coding and technical experimentation',traits:['AI','Coding','Challenge'],shape:'network'},
  'TechTonic 2.0':{accent:'#BF9C6F',motif:'ROBOTICS / IMPACT',signature:'Hands-on AI/ML, robotics and project building',traits:['Robotics','AI/ML','Workshop'],shape:'circuit'},
  'Code Clash 25.1':{accent:'#BF9C6F',motif:'CODE / PRESSURE',signature:'Algorithmic problem solving under competitive time pressure',traits:['DSA','Competitive Programming','Competition'],shape:'terminal'},
  'Code Clash 25.2':{accent:'#BF9C6F',motif:'CODE / CHALLENGE',signature:'Competitive programming, speed and precise problem solving',traits:['DSA','Coding','Competition'],shape:'terminal'},
  'Dron-O-War':{accent:'#BF9C6F',motif:'FLIGHT / BATTLES',signature:'Aerial robotics, precision and competition',traits:['Drones','Engineering','Competition'],shape:'flight'},
  'Converge':{accent:'#BF9C6F',motif:'CAMPUS / CONVERGENCE',signature:'Communities, stages and student collaboration',traits:['Annual Fest','Communities','Performance'],shape:'converge'},
  'Ebullience':{accent:'#BF9C6F',motif:'WELCOME / FIRST CHAPTER',signature:'New beginnings, performances and campus energy',traits:['Freshers','Culture','Community'],shape:'burst'},
  'Induction':{accent:'#A82420',motif:'WELCOME / ORIENTATION',signature:'The first chapter of campus life',traits:['Orientation','Community','Belonging'],shape:'path'},
  'Ethnic Day':{accent:'#A82420',motif:'CULTURE / EXPRESSION',signature:'Tradition, style and campus expression',traits:['Culture','Fashion','Performance'],shape:'pattern'},
  'Farewell':{accent:'#BF9C6F',motif:'MEMORY / MILESTONE',signature:'Celebrating journeys and campus memories',traits:['Celebration','Community','Memories'],shape:'memory'},
  'Hackathon':{accent:'#A82420',motif:'BUILD / COMPETE',signature:'Ideas turned into working technology',traits:['Innovation','Build','Competition'],shape:'grid'},
  'Code Clash':{accent:'#BF9C6F',motif:'CODE / PRESSURE',signature:'Speed, accuracy and algorithmic problem solving',traits:['DSA','Competitive Programming','Time Limits'],shape:'terminal'},
  'TechTonic':{accent:'#BF9C6F',motif:'ROBOTICS / IMPACT',signature:'Hands-on engineering and competitive robotics',traits:['Robotics','Build','Competition'],shape:'circuit'},
  'Circuit Rush':{accent:'#BF9C6F',motif:'CIRCUIT / SPEED',signature:'Electronics, control and technical problem solving',traits:['Electronics','Robotics','Challenge'],shape:'circuit'},
  'Robo Soccer':{accent:'#BF9C6F',motif:'ROBOTICS / PLAY',signature:'Autonomous machines, strategy and competition',traits:['Robotics','Strategy','Competition'],shape:'court'},
  'Top Gun Challenge':{accent:'#BF9C6F',motif:'FLIGHT / PRECISION',signature:'Simulation, reflexes and aerial decision-making',traits:['Flight Simulation','Precision','Competition'],shape:'flight'},
  'RIDE Hack':{accent:'#BF9C6F',motif:'IDEAS / IMPACT',signature:'Innovation, entrepreneurship and real-world problem solving',traits:['Hackathon','Innovation','Entrepreneurship'],shape:'spark'},
  'Innovate':{accent:'#BF9C6F',motif:'IDEATE / BUILD',signature:'Ideas, prototypes and entrepreneurial thinking',traits:['Ideation','Prototype','Innovation'],shape:'spark'},
  'CodeAI':{accent:'#BF9C6F',motif:'CODE / INTELLIGENCE',signature:'Applied AI, coding and technical experimentation',traits:['AI','Coding','Challenge'],shape:'network'},
  'BITBOX':{accent:'#A82420',motif:'BUILD / DEVELOP',signature:'Developer skills, experimentation and community',traits:['Development','Technology','Community'],shape:'nodes'},
  'Climate Data Hackathon':{accent:'#BF9C6F',motif:'DATA / CLIMATE',signature:'Data-driven ideas for environmental challenges',traits:['Data','Climate','Innovation'],shape:'network'},
  'Jaypee Agentic AI':{accent:'#A82420',motif:'AGENTS / AUTONOMY',signature:'Reasoning, tools, multi-agent systems and applied AI',traits:['Agentic AI','Hackathon','Multi-agent'],shape:'network'},
  'Student Induction Program':{accent:'#A82420',motif:'WELCOME / ORIENTATION',signature:'The first chapter of campus life, community and belonging',traits:['Orientation','Community','Belonging'],shape:'path'},
  'JYC Orientation':{accent:'#BF9C6F',motif:'WELCOME / JYC',signature:'Meeting the people and communities that shape campus life',traits:['JYC','Orientation','Community'],shape:'path'},
  'JYC Performances & Auditions':{accent:'#A82420',motif:'STAGE / AUDITION',signature:'Performance, expression and the first JYC showcase',traits:['Auditions','Performance','Culture'],shape:'stage'},
  'JYC Function':{accent:'#BF9C6F',motif:'CAMPUS / CELEBRATION',signature:'A JYC campus gathering built around community and performance',traits:['JYC','Culture','Community'],shape:'burst'},
  'Innovate 4.0':{accent:'#BF9C6F',motif:'IDEATE / BUILD',signature:'Inter-institute innovation, prototypes and entrepreneurial thinking',traits:['Innovation','Prototype','Competition'],shape:'spark'},
  'Intra-Institute Sports Week':{accent:'#A82420',motif:'PLAY / COMPETE',signature:'Campus sport, teamwork and competitive energy',traits:['Sports','Teamwork','Competition'],shape:'court'},
  "Teacher's Day":{accent:'#BF9C6F',motif:'THANK / CELEBRATE',signature:'A campus celebration of mentors, teachers and community',traits:['Celebration','Community','Gratitude'],shape:'memory'},
  'Inter-Institute Nukkad Natak':{accent:'#C92A2A',motif:'STREET / STORY',signature:'Theatre in public space, social storytelling and expression',traits:['Nukkad Natak','Theatre','Storytelling'],shape:'stage'},
  'Ethnic Day & Diwali':{accent:'#A82420',motif:'TRADITION / LIGHT',signature:'Indian culture, traditional dress, music and campus celebration',traits:['Culture','Tradition','Celebration'],shape:'pattern'},
  'Inter-Institute Sports Week 2027':{accent:'#A82420',motif:'SPORT / ARENA',signature:'Inter-institute competition, teamwork and campus representation',traits:['Sports','Competition','Teamwork'],shape:'court'},
  'Converge 2027':{accent:'#BF9C6F',motif:'CAMPUS / CONVERGENCE',signature:'The annual JYC convergence of technology, sport, culture and performance',traits:['Annual Fest','Technical','Cultural'],shape:'converge'},
  'Inter-Institute Battle of Bands':{accent:'#BF9C6F',motif:'SOUND / LIVE',signature:'Bands, stagecraft and live campus performance',traits:['Music','Bands','Performance'],shape:'wave'},
  'Inter-Institute Stage Play':{accent:'#C92A2A',motif:'STAGE / STORY',signature:'Theatre, ensemble performance and narrative craft',traits:['Theatre','Drama','Performance'],shape:'stage'},
  'Farewell 2027':{accent:'#BF9C6F',motif:'MEMORY / MILESTONE',signature:'A final campus chapter shared through stories and performance',traits:['Farewell','Memories','Community'],shape:'memory'},
  'Jaypee Youth Parliament':{accent:'#BF9C6F',motif:'DEBATE / DEMOCRACY',signature:'Parliamentary simulation, public speaking and civic dialogue',traits:['Debate','Public Affairs','Speaking'],shape:'quote'},
  'Extempore':{accent:'#BF9C6F',motif:'SPEAK / THINK',signature:'Spontaneous speaking, ideas and confident expression',traits:['Speaking','Literary','Expression'],shape:'quote'},
  'Campus Green':{accent:'#BF9C6F',motif:'EARTH / ACTION',signature:'Environmental awareness and responsible campus practice',traits:['Environment','Awareness','Action'],shape:'pattern'},
  'Scavenger Hunt':{accent:'#BF9C6F',motif:'CLUES / SOLVE',signature:'Clues, deduction and collaborative problem solving',traits:['Puzzle','Teamwork','Challenge'],shape:'question'},
  'Microbe Premier League':{accent:'#BF9C6F',motif:'SCIENCE / STRATEGY',signature:'Biotechnology, virtual industry and competitive strategy',traits:['Biotechnology','Strategy','Competition'],shape:'network'},
  'Merge & Sketch':{accent:'#BF9C6F',motif:'DRAW / CREATE',signature:'Sketching, visual imagination and creative experimentation',traits:['Art','Sketching','Creative'],shape:'brush'},
  'Conventional Rangoli':{accent:'#A82420',motif:'PATTERN / CULTURE',signature:'Traditional visual craft, colour and campus expression',traits:['Rangoli','Culture','Art'],shape:'pattern'},
  'Ebullience 2018':{accent:'#BF9C6F',motif:'WELCOME / FIRST CHAPTER',signature:'Freshers, stage energy and the beginning of campus life',traits:['Freshers','Culture','Community'],shape:'burst'},
};

export const JYC_EVENT_IDENTITIES=EVENT_PRESETS;

const normName=v=>String(v||'').trim().toLowerCase();
function presetForEvent(name){
  const raw=normName(name);
  const key=Object.keys(EVENT_PRESETS).find(k=>raw.includes(normName(k)));
  return key?EVENT_PRESETS[key]:null;
}
const EVENT_VISUALS=[
  {accent:'#BF9C6F',shape:'grid',glyph:'01',display:'BUILD',surface:'cool'},
  {accent:'#BF9C6F',shape:'wave',glyph:'♫',display:'STAGE',surface:'warm'},
  {accent:'#BF9C6F',shape:'circuit',glyph:'◈',display:'SYSTEM',surface:'cool'},
  {accent:'#BF9C6F',shape:'poster',glyph:'◆',display:'VISUAL',surface:'warm'},
  {accent:'#A82420',shape:'nodes',glyph:'⌘',display:'CONNECT',surface:'cool'},
  {accent:'#BF9C6F',shape:'burst',glyph:'✦',display:'MOMENT',surface:'warm'},
  {accent:'#A82420',shape:'network',glyph:'∿',display:'IDEAS',surface:'cool'},
  {accent:'#A82420',shape:'frame',glyph:'◇',display:'PRESENCE',surface:'warm'},
  {accent:'#A82420',shape:'court',glyph:'◎',display:'PLAY',surface:'cool'},
  {accent:'#BF9C6F',shape:'pattern',glyph:'✳',display:'CULTURE',surface:'warm'},
  {accent:'#BF9C6F',shape:'flight',glyph:'△',display:'MOTION',surface:'cool'},
  {accent:'#C92A2A',shape:'film',glyph:'▣',display:'STORY',surface:'warm'}
];
const hashEvent=v=>{let h=2166136261;for(const ch of String(v||'')){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0};
const eventSeed=name=>EVENT_VISUALS[hashEvent(normName(name))%EVENT_VISUALS.length];

function familyForClub(name){
  const raw=normName(name);
  const key=Object.keys(BASE).find(k=>raw===normName(k)||raw.includes(normName(k)));
  return key?BASE[key]:null;
}

export function eventIdentity(input,clubName=''){
  const name=typeof input==='string'?input:(input?.title||input?.name||'');
  const club=typeof input==='object'?(input?.club||input?.organiser||clubName):clubName;
  const preset=presetForEvent(name);
  const parent=familyForClub(club);
  const eventType=typeof input==='object'?(input?.eventType||'EVENT'):'EVENT';
  if(preset){
    return {...preset,name,kind:'event',club,glyph:preset.glyph||eventSeed(name).glyph,display:preset.display||eventSeed(name).display,surface:preset.surface||eventSeed(name).surface};
  }
  const visual=eventSeed(name);
  const familyLabel=parent?.display||String(eventType).toUpperCase();
  const eventLabel=String(name||'JYC EVENT').trim().toUpperCase();
  return {...visual,name,kind:'event',club,motif:familyLabel+' / '+visual.display+' / '+String(eventType).toUpperCase(),signature:parent?(eventLabel+' · '+parent.signature):(eventLabel+' · JYC campus experience'),traits:[String(eventType).trim()||'EVENT',...(parent?.traits||['Community','Campus'])].slice(0,4)};
}
export function hubIdentity(name){
  const key=Object.keys(BASE).find(k=>normName(k)===normName(name));
  return BASE[key]||{accent:'#BF9C6F',motif:'JYC COMMUNITY',signature:'A student community within JYC',traits:['Community','Campus','Participation'],glyph:'◆',surface:'warm',shape:'community',display:'JYC'};
}
