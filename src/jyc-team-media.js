const TEAM_LOCAL_PHOTOS = Object.freeze({
  'devansh tripathi': '/assets/team/campaign/devansh-tripathi.webp',
  'amrit kumar': '/assets/team/campaign/amrit-kumar.webp',
  'daksh sachdeva': '/assets/team/campaign/daksh-sachdeva.webp',
  'saksham kotia': '/assets/team/campaign/saksham-kotia.webp',
  'asmi srivastava': '/assets/team/campaign/asmi-srivastava.webp',
  'juhi hatuka': '/assets/team/campaign/juhi-hatuka.webp',
  'pratik kumar': '/assets/team/campaign/pratik-kumar.webp',
  'divye bajaj': '/assets/team/divye-bajaj.webp',
  'revant srivastava': '/assets/team/campaign/revant-srivastava.webp',
  'aradhyaa singh': '/assets/team/campaign/aradhyaa-singh.webp',
  'vansh mahajan': '/assets/team/campaign/vansh-mahajan.webp',
  'shriya singh': '/assets/team/campaign/shriya-singh.webp'
});

export function teamPhotoFor(member) {
  const key = String(member?.name || '').trim().toLowerCase();
  return TEAM_LOCAL_PHOTOS[key] || member?.photo || member?.image || '';
}
