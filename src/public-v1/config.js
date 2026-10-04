// JYC V1 public experience contract.
// Keep navigation, discovery labels and filters here so page components stay focused on rendering.
export const JYC_PUBLIC_ROUTES=[
  ['About','/about'],['History','/history'],['Clubs','/clubs'],['Events','/events'],['Gallery','/gallery'],['Leadership','/team'],['Archive','/archive'],['Recruitment','/recruitment'],['Announcements','/announcements'],['Event Calendar','/calendar'],['Contact','/contact']
];

export const JYC_EVENT_CATEGORIES=['All','Cultural','Technical','Literary','Sports','Management','Social','Creative'];

export const JYC_COMMUNITY_DISCOVERY={
  'Build & code':['coding','programming','development','open source','competitive programming','code'],
  'AI & robotics':['ai','machine learning','robotics','drones','aerial robotics','automation','electronics'],
  'Music & dance':['music','dance','bhangra','performance','ensemble'],
  'Theatre & performance':['theatre','dramatics','performance','film','storytelling'],
  'Writing & debate':['writing','literary','speaking','debate','anchoring'],
  'Design & media':['design','graphic design','photography','film','visual','creative','media'],
  'Sports & fitness':['sports','cricket','football','basketball','fitness'],
  'Social impact':['social','sustainability','environment','outreach'],
  'Leadership & events':['leadership','management','events','community']
};

export const JYC_V1_ANIMATION_CONTRACT={
  revealClass:'reveal',
  hoverLift:4,
  heroDuration:800,
  respectReducedMotion:true,
  avoidContinuousDecorativeRotation:true
};

export const JYC_OFFICIAL_SITE_SCOPE=Object.freeze({
  organisation:'JIIT Youth Club 128',
  campus:'JIIT Wish Town Campus · Sector 128, Noida',
  purpose:'Official organisational website for JYC 128 identity, leadership, clubs, events, history, gallery, recruitment, announcements and contact.',
  excludedPublicProductTypes:['academic portal','student help portal','attendance/check-in system','event pass/certificate system','campus utility dashboard','student account area','social network'],
  publicJourney:['identity','about','history','leadership','clubs','events','event-details','fest','gallery','archive','achievements','recruitment','announcements','calendar','contact']
});

export const JYC_CONTENT_RULES={
  primaryCampus:'JIIT Sector 128, Noida',
  sourceOfTruth:'JYC website + JYC Control Center',
  archiveLabel:'Supplied / historical JYC material',
  socialPolicy:'Only publish a club handle when a public source can be attributed.'
};

export const JYC_PUBLIC_ACTIVITIES=[
  {title:'Cultural',text:'Music, dance, theatre, visual expression and the performances that shape campus culture.',link:'/clubs'},
  {title:'Technical',text:'Coding, robotics, AI, open source and hands-on technology communities.',link:'/clubs'},
  {title:'Literary',text:'Writing, debate, speaking, quizzing, anchoring and ideas in motion.',link:'/clubs'},
  {title:'Sports',text:'Competition, teamwork, fitness and student representation through sport.',link:'/clubs'},
  {title:'Management',text:'Planning, hospitality, public relations, security and event execution.',link:'/team'},
  {title:'Social Outreach',text:'Community initiatives, awareness programmes and campus impact.',link:'/events'},
  {title:'Workshops',text:'Practical learning through workshops, mentorship and skill-building sessions.',link:'/events'},
  {title:'Competitions',text:'Hackathons, contests, challenges and inter-community experiences.',link:'/events'}
];
