import React, { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { JYC_HUB_CONTENT, JYC_HUB_FAMILIES } from './v21-hub-content.js';
import { sourceEventMedia } from './jyc-source-media.js';
import { ResponsivePhoto } from './jyc-responsive-photo.jsx';
import { JYCSpotlight } from './jyc-spotlight.jsx';
const LazyDitherVeil = lazy(() => import('./react-bits/DitherVeil.jsx'));
import './jyc-editorial-home.css';

const FALLBACK = '/jyc-logo-official.webp';
const DITHER_SOURCE = '/jyc-logo-official.webp';

const slug = v => String(v || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const eventPath = e => `/events/${slug(e?.slug||e?.title)}`;
const media = v => v?.url || v?.src || v?.image || v?.imageUrl || '';
const dateMs = e => {
  const raw = String(e?.date || '').trim();
  if (!raw) return Infinity;
  const time = String(e?.start || '').trim();
  const candidate = /T\d{2}:\d{2}/.test(raw) ? raw : raw + 'T' + (/^\d{1,2}:\d{2}$/.test(time) ? time.padStart(5, '0') : '00:00');
  const ms = Date.parse(candidate);
  return Number.isFinite(ms) ? ms : Infinity;
};
const dateLabel = v => {
  const d = new Date(String(v || ''));
  return Number.isNaN(d.getTime()) ? 'DATE TBA' : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};
const eventImage = e => e?.poster || sourceEventMedia(e)?.photoItems?.filter(x => x?.url).map(media)[0] || '';
const safeRegistrationUrl = value => {
  try {
    const url = new URL(String(value || ''));
    return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url.href : '';
  } catch {
    return '';
  }
};
const registrationState = e => {
  const href = safeRegistrationUrl(e?.registrationUrl);
  const endDate = String(e?.dateEnd || e?.date || '').trim();
  const endMs = endDate ? Date.parse(/T\d{2}:\d{2}/.test(endDate) ? endDate : endDate + 'T23:59:59') : NaN;
  const deadline = String(e?.registrationDeadline || '').trim();
  const deadlineMs = deadline ? Date.parse(/T\d{2}:\d{2}/.test(deadline) ? deadline : deadline + 'T23:59:59') : NaN;
  const ended = Number.isFinite(endMs) && Date.now() > endMs;
  const deadlinePassed = Number.isFinite(deadlineMs) && Date.now() > deadlineMs;
  if (e?.publicStatus === 'planned' && e?.registrationVerified !== true) return { label: 'Registration not published', href: '' };
  if (href && !ended && !deadlinePassed) return { label: 'Registration open', href };
  if (href || ended || deadlinePassed) return { label: 'Registration closed', href: '' };
  return { label: 'Registration details unavailable', href: '' };
};

const PILLARS = [
  {
    id: 'technical',
    family: 'Technical',
    title: 'Technical & Innovation',
    tag: 'AI · ROBOTICS · CP · WEB · CYBERSEC',
    desc: 'Hackathons, open-source dev-sprints, AI research, and combat robotics across OSDC, Knuth, CICR, GDG & uCR.',
    icon: '⚡',
    count: '10 Hubs'
  },
  {
    id: 'cultural',
    family: 'Cultural',
    title: 'Cultural & Performing Arts',
    tag: 'DRAMATICS · DANCE · BANDS · CLASSICAL',
    desc: 'Street play, stage dramatics, western & classical dance, and live acoustics with Abhivyakti, Jhankaar, Fortissmo & Crescendo.',
    icon: '🎭',
    count: '5 Societies'
  },
  {
    id: 'literary',
    family: 'Literary',
    title: 'Literary, MUN & Speaking',
    tag: 'DEBATES · QUIZZING · MUN · WRITING',
    desc: 'Parliamentary debates, National Model United Nations, literary journals, and inter-college quiz championships.',
    icon: '🖋️',
    count: '3 Societies'
  },
  {
    id: 'fests',
    family: 'Flagship',
    title: 'Flagship Campus Fests',
    tag: 'CONVERGE · DRON-O-WAR · INDUCTION',
    desc: 'Annual multi-day festivals uniting thousands of students across North India for competition and celebrated headliners.',
    icon: '🎪',
    count: '7 Flagships'
  },
  {
    id: 'sports',
    family: 'Sports',
    title: 'Sports & Athletics',
    tag: 'CRICKET · FOOTBALL · BASKETBALL · CHESS',
    desc: 'High-intensity athletic tournaments, intra-college leagues, table tennis, badminton, and outdoor sports championships.',
    icon: '🏆',
    count: '5 Arenas'
  },
  {
    id: 'creative',
    family: 'Creative',
    title: 'Media, Design & Outreach',
    tag: 'UI/UX · GRAPHICS · PHOTO · SOCIAL',
    desc: 'Visual arts, graphic design, photography, campus coverage, community service, and youth social outreach.',
    icon: '🎨',
    count: '4 Hubs'
  }
];

export function JYCEditorialHome({ data }) {
  const nav = useNavigate();
  const events = useMemo(() => Array.isArray(data?.events) ? data.events.filter(e => e?.published && !e?.archived).slice().sort((a, b) => dateMs(a) - dateMs(b)) : [], [data?.events]);
  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime(); }, []);
  const upcoming = events.filter(e => { const t = dateMs(e); return Number.isFinite(t) && t >= today; }).slice(0, 4);
  const team = (data?.team || []).filter(x => x?.published === true).slice(0, 4);
  const featured = upcoming[0] || events[0];
  const featuredRegistration = registrationState(featured);

  const photoStories = useMemo(() => {
    const defaultFlagships = [
      { id: 'flag-converge', url: '/assets/events/converge-2026.webp', association: 'Converge Fest', year: '2026', caption: 'Converge 2026 · Annual Cultural & Technical Flagship Fest' },
      { id: 'flag-jai', url: '/assets/events/jai-2026.webp', association: 'JAI Summit', year: '2026', caption: 'JAI · Jaypee Agentic AI International Hackathon' },
      { id: 'flag-drono', url: '/assets/home/dron-o-war-1.webp', association: 'Dron-O-War', year: '2026', caption: 'Dronotics & CICR · National Combat Robotics Championship' },
      { id: 'flag-ebullience', url: '/assets/home/ebullience.webp', association: "Ebullience '25", year: '2025', caption: "Ebullience · Fresher's Induction & Stage Arts" },
      { id: 'flag-sports', url: '/assets/hub-photos/sports-02.webp', association: 'Kshitij Sports', year: '2026', caption: 'JSA · Annual Campus Sports & Football Championship' },
      { id: 'flag-dance', url: '/assets/hub-photos/vamunique-02.webp', association: 'VamUnique Dance', year: '2026', caption: 'VamUnique · Classical & Contemporary Performing Arts' },
    ];
    const items = Array.isArray(data?.gallery) ? data.gallery : [];
    const seen = new Set();
    const selected = [];
    for (const item of items) {
      const url = String(item?.url || '').trim();
      const association = String(item?.association || item?.albumName || '').trim();
      if (!url || !association || item?.published === false || item?.archived === true || seen.has(association.toLowerCase())) continue;
      seen.add(association.toLowerCase());
      selected.push({ ...item, association });
      if (selected.length === 6) break;
    }
    return selected.length >= 4 ? selected : defaultFlagships;
  }, [data?.gallery]);

  const handleSpotlight = e => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  const handleCardTilt = e => {
    handleSpotlight(e);
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rotX = (y / (rect.height / 2)) * -5;
    const rotY = (x / (rect.width / 2)) * 5;
    card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.01, 1.01, 1.01)`;
  };

  const resetCardTilt = e => {
    e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  };

  return (
    <main className="jyc-editorial-home jyc-home">
      {/* HERO SECTION */}
      <section className="jh-hero" aria-labelledby="jh-title">
        <div className="jh-hero-copy">
          <div className="jh-cyber-badge">
            <span className="jh-live-pulse-dot" />
            <span>JIIT YOUTH CLUB · WISH TOWN CAMPUS</span>
          </div>
          <p className="jh-overline">THE PEOPLE, IDEAS &amp; EXPERIENCES OF JIIT 128</p>
          <h1 id="jh-title">
            <span>FIND YOUR</span>
            <span>PEOPLE.</span>
            <em className="jh-title-gradient">MAKE YOUR MARK.</em>
          </h1>
          <p className="jh-lead">
            From ideas taking shape in a workshop to the lights coming up on stage, JYC brings together the clubs, events and people that make campus life matter.
          </p>
          <div className="jh-actions jh-hero-actions">
            <button type="button" className="jh-btn jh-btn-primary" onClick={() => nav('/events')}>
              ⚡ Explore Events <span>↗</span>
            </button>
            <button type="button" className="jh-btn jh-btn-glass" onClick={() => nav('/clubs')}>
              Explore Clubs <span>→</span>
            </button>
            <button type="button" className="jh-btn jh-btn-outline" onClick={() => nav('/join-jyc')}>
              Join JYC <span>→</span>
            </button>
          </div>


        </div>

        {/* HERO DITHERVEIL VISUAL PLAQUE */}
        <div className="jh-hero-visual jh-hero-dither-visual">
          <div className="jh-hero-dither-backdrop" aria-hidden="true" />
          <div className="jh-hero-logo-plaque">
            <span className="jh-logo-halo" aria-hidden="true" />
            <div className="jh-dither-mark" role="img" aria-label="Official JIIT Youth Club 128 logo with an interactive Dither Veil effect">
              <Suspense fallback={
                <img className="jh-hero-logo" src={FALLBACK} alt="JYC Official Logo" loading="eager" fetchPriority="high" decoding="async" />
              }>
                <LazyDitherVeil
                  src={DITHER_SOURCE}
                  fallbackSrc={FALLBACK}
                  fit="contain"
                  pattern="floyd"
                  pixelSize={2}
                  levels={3}
                  palette="duotone"
                  inkColor="#2b1d1b"
                  paperColor="#f8f0e4"
                  contrast={1.25}
                  brightness={0.04}
                  revealRadius={250}
                  softness={0.7}
                  linger={1.2}
                  rimColor="#b33a32"
                  rim={0.22}
                  wander={false}
                  clickBurst={true}
                  className="jh-dither-veil-effect"
                />
              </Suspense>
            </div>
            <div className="jh-plaque-footer">
              <span className="jh-logo-caption">JIIT YOUTH CLUB <b>·</b> 128</span>
              <span className="jh-status-live-tag">● ONLINE</span>
            </div>
          </div>
          <span className="jh-photo-label">JYC 128 / APEX HUB</span>
          <span className="jh-photo-index">01 — IDENTITY</span>
        </div>
      </section>

      {/* 3D SPATIAL ASSISTANT SHOWCASE */}
      <section className="jh-assistant-spotlight jh-container">
        <div className="jh-assistant-spotlight-card" onMouseMove={handleCardTilt} onMouseLeave={resetCardTilt}>
          <div className="jh-assistant-visual">
            <model-viewer
              className="jh-assistant-3d-model"
              src="/models/jyc-spatial.glb"
              poster="/JYC%20Logo(4).png"
              camera-orbit="0deg 75deg auto"
              auto-rotate
              rotation-per-second="22deg"
              loading="lazy"
              reveal="auto"
              disable-zoom
              disable-pan
              interaction-prompt="none"
              shadow-intensity="0.5"
              shadow-softness="0.8"
              exposure="1.15"
              alt="Interactive 3D JYC spatial figure"
            ></model-viewer>
            <div className="jh-assistant-badge-live">
              <span className="jh-live-pulse-dot" />
              <span>3D SPATIAL AGENT</span>
            </div>
            <div className="jh-assistant-soundwave" aria-hidden="true">
              <span/><span/><span/><span/><span/><span/><span/><span/>
            </div>
          </div>
          <div className="jh-assistant-info">
            <div className="jh-section-number">AI INTELLIGENCE · CAMPUS COMPANION</div>
            <h2>Got questions? Meet the<br /><em className="jh-title-gradient">JYC Spatial Assistant.</em></h2>
            <p>
              Navigate all 23 societies, find upcoming hackathons, check registration deadlines, or learn about faculty advisors and student coordinators.
            </p>
            <div className="jh-assistant-prompts">
              <button type="button" onClick={() => { const btn = document.querySelector('.jyc-bot-orb'); if (btn) btn.click(); }}>
                ⚡ Explore Upcoming Hackathons
              </button>
              <button type="button" onClick={() => { const btn = document.querySelector('.jyc-bot-orb'); if (btn) btn.click(); }}>
                🏆 Converge &amp; Dron-O-War Dates
              </button>
              <button type="button" onClick={() => { const btn = document.querySelector('.jyc-bot-orb'); if (btn) btn.click(); }}>
                👥 Meet Apex Student Leadership
              </button>
              <button type="button" onClick={() => { const btn = document.querySelector('.jyc-bot-orb'); if (btn) btn.click(); }}>
                🎯 Which society matches my domain?
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* PILLARS / WHAT JYC DOES BENTO GRID */}
      <section className="jh-pillars-section jh-container">
        <div className="jh-section-head">
          <div>
            <div className="jh-section-number">01 / WHAT WE DO</div>
            <h2>Built for builders, creators<br /><em className="jh-title-gradient">&amp; performers.</em></h2>
          </div>
          <button type="button" className="jh-text-link" onClick={() => nav('/clubs')}>
            Explore all 23 societies <span>↗</span>
          </button>
        </div>
        <div className="jh-pillars-bento">
          {PILLARS.map(p => (
            <article
              key={p.id}
              className={`jh-pillar-card jh-pillar-${p.id}`}
              onClick={() => nav(p.id === 'fests' ? '/events' : `/clubs`)}
              onMouseMove={handleSpotlight}
            >
              <div className="jh-pillar-head">
                <span className="jh-pillar-icon">{p.icon}</span>
                <span className="jh-pillar-count">{p.count}</span>
              </div>
              <span className="jh-pillar-tag">{p.tag}</span>
              <h3>{p.title}</h3>
              <p>{p.desc}</p>
              <div className="jh-pillar-footer">
                <span>Explore Communities</span>
                <b aria-hidden="true">↗</b>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* FEATURED & UPCOMING EVENTS */}
      <section className="jh-container jh-events">
        <div className="jh-section-head">
          <div>
            <div className="jh-section-number">02 / WHAT’S NEXT</div>
            <h2>Upcoming flagship<br /><em className="jh-title-gradient">campus experiences.</em></h2>
          </div>
          <button type="button" className="jh-text-link" onClick={() => nav('/events')}>
            View event directory <span>↗</span>
          </button>
        </div>
        {featured ? (
          <article className="jh-featured-event" onMouseMove={handleSpotlight}>
            <div className="jh-event-image">
              <ResponsivePhoto
                className="jh-featured-event-photo"
                src={eventImage(featured) || FALLBACK}
                alt={featured.title + ' poster'}
                loading="lazy"
                decoding="async"
                sizes="(max-width: 680px) 100vw, 50vw"
                fallbackSrc={FALLBACK}
              />
              <span className="jh-featured-badge">FEATURED EXPERIENCE</span>
            </div>
            <div className="jh-event-copy">
              <p className="jh-event-meta">{dateLabel(featured.date)} · JIIT 128 · {featured.club || 'JYC'}</p>
              <h3>{featured.title}</h3>
              <p>{featured.description || 'Join the official campus experience. Check timings, venue, guidelines, and registration details.'}</p>
              <div className="jh-event-details">
                <span>VENUE <b>{featured.venue || 'JIIT 128 Campus'}</b></span>
                <span>TIME <b>{featured.start || 'TBA'}</b></span>
                <span>STATUS <b className="jh-status-highlight">{featuredRegistration.label}</b></span>
              </div>
              <div className="jh-registration-row">
                {featuredRegistration.href && (
                  <button type="button" className="jh-btn jh-btn-primary" onClick={() => window.open(featuredRegistration.href, '_blank', 'noopener,noreferrer')}>
                    Register Now <span>↗</span>
                  </button>
                )}
                <button type="button" className="jh-btn jh-btn-glass" onClick={() => nav(eventPath(featured))}>
                  View Event <span>→</span>
                </button>
              </div>
            </div>
          </article>
        ) : (
          <div className="jh-empty">No published upcoming events are currently available.</div>
        )}

        {upcoming.slice(1).length > 0 && (
          <div className="jh-event-list">
            {upcoming.slice(1).map(e => (
              <button type="button" key={e.id || e.title} onClick={() => nav(eventPath(e))}>
                <span>{dateLabel(e.date)}</span>
                <strong>{e.title}</strong>
                <small>{e.club || 'JYC'} · {e.venue || 'JIIT 128'}</small>
                <b>→</b>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* LIVING JYC SPOTLIGHT */}
      <JYCSpotlight data={data} />

      {/* REAL MOMENTS & VISUAL ARCHIVE */}
      {photoStories.length > 0 && (
        <section className="jh-photo-story jh-container" aria-labelledby="jh-photo-story-title">
          <div className="jh-photo-story-head">
            <div>
              <div className="jh-section-number">03 / EVENT MEMORIES</div>
              <h2 id="jh-photo-story-title">From the visual<br /><em className="jh-title-gradient">JYC record.</em></h2>
            </div>
            <div className="jh-photo-story-intro">
              <p>People, performances, competitions, and memories from the moments that make JIIT vibrant.</p>
              <button type="button" className="jh-text-link" onClick={() => nav('/gallery')}>
                Open full gallery <span>↗</span>
              </button>
            </div>
          </div>
          <div className={`jh-photo-story-grid ${photoStories.length === 3 ? 'has-three' : 'has-fewer'}`}>
            {photoStories.map((story, index) => (
              <button
                type="button"
                className={`jh-story-card jh-story-card-${index + 1}`}
                key={story.id || story.url}
                onClick={() => nav('/gallery')}
                onMouseMove={handleSpotlight}
                aria-label={`Explore ${story.association} photography in the JYC gallery`}
              >
                <ResponsivePhoto
                  className="jh-story-photo"
                  src={story.url}
                  alt={story.alt || story.caption || `${story.association} photography`}
                  loading="lazy"
                  decoding="async"
                  sizes={index === 0 ? '(max-width: 760px) 100vw, 58vw' : '(max-width: 760px) 100vw, 34vw'}
                  fallbackSrc={FALLBACK}
                />
                <span className="jh-story-shade" aria-hidden="true" />
                <span className="jh-story-copy">
                  <small>{story.year || 'JYC ARCHIVE'} <i>·</i> {story.association}</small>
                  <strong>{story.caption || story.association}</strong>
                  <b>Explore album <span aria-hidden="true">↗</span></b>
                </span>
                <span className="jh-story-index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* LEADERSHIP & APEX BODY */}
      <section className="jh-community">
        <div className="jh-container jh-community-grid">
          <div className="jh-community-copy">
            <div className="jh-section-number">04 / STUDENT LEADERSHIP</div>
            <h2>Built by students.<br /><em className="jh-title-gradient">Led with purpose.</em></h2>
            <p>
              Faculty guidance, apex student coordinators, committee heads, and society presidents form the operational leadership of JYC Sector 128.
            </p>
            <div className="jh-actions">
              <button type="button" className="jh-btn jh-btn-primary" onClick={() => nav('/team')}>
                Meet the Team <span>↗</span>
              </button>
              <button type="button" className="jh-btn jh-btn-glass" onClick={() => nav('/about')}>
                About JYC <span>→</span>
              </button>
            </div>
          </div>
          <div className="jh-team-list">
            <div className="jh-team-list-head">
              <span>LEADERSHIP SPOTLIGHT</span>
              <span>AY 2026–27</span>
            </div>
            {team.length ? (
              team.map((m, i) => (
                <button type="button" key={m.id || i} onClick={() => nav('/team')}>
                  <span className="jh-team-monogram" aria-hidden="true">
                    {String(m.name || 'JYC').trim().split(/\s+/).map(x => x[0]).slice(0, 2).join('').toUpperCase()}
                  </span>
                  <span>
                    <small>{m.role || m.position || 'JYC Apex'}</small>
                    <strong>{m.name || 'Team Member'}</strong>
                  </span>
                  <b>↗</b>
                </button>
              ))
            ) : (
              <div className="jh-empty">Official team profiles will appear here when published.</div>
            )}
            <div className="jh-years">
              <span>PEOPLE</span>
              <span>COMMUNITY</span>
              <span>MEMORIES</span>
              <b>JIIT 128</b>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="jh-final">
        <div className="jh-container jh-final-grid">
          <div>
            <div className="jh-section-number">05 / GET INVOLVED</div>
            <h2>Find your community<br /><em className="jh-title-gradient">at JIIT 128.</em></h2>
          </div>
          <div>
            <p>Ready to build, perform, organize or compete? Explore the hubs and get involved in the campus ecosystem.</p>
            <div className="jh-actions">
              <button type="button" className="jh-btn jh-btn-primary" onClick={() => nav('/clubs')}>
                Explore Clubs <span>↗</span>
              </button>
              <button type="button" className="jh-btn jh-btn-glass" onClick={() => nav('/events')}>
                Upcoming Events <span>→</span>
              </button>
              <button type="button" className="jh-btn jh-btn-outline" onClick={() => nav('/join-jyc')}>
                Join JYC <span>→</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
