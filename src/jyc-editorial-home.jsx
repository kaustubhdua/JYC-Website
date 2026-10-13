import React, { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { JYC_HUB_CONTENT, JYC_HUB_FAMILIES } from './v21-hub-content.js';
import { sourceEventMedia, sourceHubMedia } from './jyc-source-media.js';
import { teamPhotoFor } from './jyc-team-media.js';
import { rankDiverseJycPhotos } from './jyc-photo-intelligence.js';
import { ResponsivePhoto } from './jyc-responsive-photo.jsx';
import { JYCSpotlight } from './jyc-spotlight.jsx';
import { JYCNowStrip } from './jyc-now.jsx';
const LazyDitherVeil = lazy(() => import('./react-bits/DitherVeil.jsx'));
const LazyMagicBento = lazy(() => import('./components/react-bits/MagicBento.jsx'));
import './jyc-editorial-home.css';

const ORIGINAL_LOGO = '/JYC%20Logo(4).png';
const FALLBACK = import.meta.env.PROD ? '/assets/jyc-logo.webp' : ORIGINAL_LOGO;
const DITHER_SOURCE = import.meta.env.PROD ? '/assets/jyc-logo.avif' : FALLBACK;
const handleHeroLogoFallback = event => {
  const image = event.currentTarget;
  const candidates = [FALLBACK, ORIGINAL_LOGO];
  let next = Number(image.dataset.logoFallbackStage || 0);
  while (next < candidates.length && new URL(candidates[next], window.location.href).href === image.src) next += 1;
  if (next < candidates.length) { image.dataset.logoFallbackStage = String(next + 1); image.src = candidates[next]; }
  else image.hidden = true;
};

const slug = v => String(v || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const eventPath = e => `/events/${slug(e?.slug||e?.title)}`;
const media = v => v?.url || v?.src || v?.image || v?.imageUrl || '';
const dateMs = e => {
  const raw = String(e?.date || '').trim();
  if (!raw) return Infinity;
  const time = String(e?.start || '').trim();
  const candidate = /[T ]\d{1,2}:\d{2}/.test(raw) ? raw.replace(' ', 'T') : raw + 'T' + (/^\d{1,2}:\d{2}$/.test(time) ? time.padStart(5, '0') : '00:00');
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
    icon: '⚡'
  },
  {
    id: 'cultural',
    family: 'Cultural',
    title: 'Cultural & Performing Arts',
    tag: 'DRAMATICS · DANCE · BANDS · CLASSICAL',
    desc: 'Street play, stage dramatics, western & classical dance, and live acoustics with Abhivyakti, Jhankaar, Fortissmo & Crescendo.',
    icon: '🎭'
  },
  {
    id: 'literary',
    family: 'Literary',
    title: 'Literary, MUN & Speaking',
    tag: 'DEBATES · QUIZZING · MUN · WRITING',
    desc: 'Parliamentary debates, National Model United Nations, literary journals, and inter-college quiz championships.',
    icon: '🖋️'
  },
  {
    id: 'fests',
    family: 'Flagship',
    title: 'Flagship Campus Fests',
    tag: 'CONVERGE · DRON-O-WAR · INDUCTION',
    desc: 'Campus festivals, showcases, competitions and student-led experiences throughout the academic year.',
    icon: '🎪'
  },
  {
    id: 'sports',
    family: 'Sports',
    title: 'Sports & Athletics',
    tag: 'CRICKET · FOOTBALL · BASKETBALL · CHESS',
    desc: 'High-intensity athletic tournaments, intra-college leagues, table tennis, badminton, and outdoor sports championships.',
    icon: '🏆'
  },
  {
    id: 'creative',
    family: 'Creative',
    title: 'Media, Design & Outreach',
    tag: 'UI/UX · GRAPHICS · PHOTO · SOCIAL',
    desc: 'Visual arts, graphic design, photography, campus coverage, community service, and youth social outreach.',
    icon: '🎨'
  }
];

function LazyActivityBento({ activities, nav }) {
  const rootRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (typeof IntersectionObserver === 'undefined') {
      setReady(true);
      return;
    }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        setReady(true);
        observer.disconnect();
      }
    }, { rootMargin:'360px 0px' });
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  return <div ref={rootRef} className="jh-activity-bento-shell" aria-label="Explore JYC activities">
    {ready
      ? <Suspense fallback={<div className="jh-bento-loading" role="status">Loading activity discovery…</div>}>
          <LazyMagicBento items={activities} enableMagnetism={true} enableTilt={true} enableStars={false} enableSpotlight={true} enableBorderGlow={false} particleCount={0} onNavigate={nav} glowColor="191,156,111" />
        </Suspense>
      : <div className="jh-bento-loading" aria-hidden="true">
          {activities.map(activity => <div key={activity.id} className="jh-bento-loading-card"><span>{activity.label}</span><strong>{activity.title}</strong><p>{activity.description}</p></div>)}
        </div>}
  </div>;
}

export function JYCEditorialHome({ data }) {
  const nav = useNavigate();
  const activities = useMemo(() => {
    const photoHubs = { technical: 'CICR', cultural: 'VamUnique', literary: 'Eloquence', fests: 'Aakriti', sports: 'Sports', creative: 'Aura' };
    return PILLARS.map(p => {
      const source = sourceHubMedia(photoHubs[p.id]);
      const image = source.photoItems.find(item => item?.url)?.url || '';
      return { id:p.id, label:p.family.toUpperCase(), title:p.title, description:p.desc, href:p.id === 'fests' ? '/events' : '/clubs', image };
    });
  }, []);
  const events = useMemo(() => Array.isArray(data?.events) ? data.events.filter(e => e?.published && !e?.archived).slice().sort((a, b) => dateMs(a) - dateMs(b)) : [], [data?.events]);
  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime(); }, []);
  const upcoming = events.filter(e => { const t = dateMs(e); return Number.isFinite(t) && t >= today; }).slice(0, 4);
  const team = (data?.team || []).filter(x => x?.published === true).slice(0, 4);
  const featured = upcoming[0] || events[0];
  const featuredRegistration = registrationState(featured);

  const photoStories = useMemo(() => {
    const items = Array.isArray(data?.gallery) ? data.gallery : [];
    const seen = new Set();
    const selected = [];
    for (const item of rankDiverseJycPhotos(items, { limit: items.length, maxPerAssociation: 1 })) {
      const url = String(item?.url || '').trim();
      const association = String(item?.association || item?.albumName || '').trim();
      const role = String(item?.role || '').toLowerCase();
      if (!url || !association || item?.mediaKind !== 'photo' || !['event','club'].includes(role) || item?.published === false || item?.archived === true || /jyc archive|source archive/i.test(association) || seen.has(association.toLowerCase())) continue;
      seen.add(association.toLowerCase());
      selected.push({ ...item, association });
      if (selected.length === 3) break;
    }
    return selected;
  }, [data?.gallery]);

  const handleSpotlight = e => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };



  return (
    <main className="jyc-editorial-home jyc-home">
      {/* HERO SECTION */}
      <section className="jh-hero" aria-labelledby="jh-title">
        <div className="jh-hero-copy">
          <div className="jh-cyber-badge">
            <span className="jh-live-pulse-dot" />
            <span>THE JIIT 128 COMMUNITY</span>
            <b>AY 2026–27</b>
          </div>
          <p className="jh-overline">JAYPEE INSTITUTE OF INFORMATION TECHNOLOGY · WISH TOWN</p>
          <h1 id="jh-title">
            <span>Find your people.</span>
            <span>Make your mark.</span>
            <em className="jh-title-gradient">At JIIT 128.</em>
          </h1>
          <p className="jh-lead">
            From clubs and competitions to performances, projects and campus traditions, JYC helps you find the people and experiences that make JIIT feel like yours.
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
              <Suspense fallback={<img className="jh-hero-logo jh-dither-suspense-fallback" src={DITHER_SOURCE} alt="" aria-hidden="true" loading="eager" fetchPriority="high" decoding="async" onError={handleHeroLogoFallback} />}>
                <LazyDitherVeil
                  src={DITHER_SOURCE}
                  fallbackSrc={FALLBACK}
                  originalFallbackSrc={ORIGINAL_LOGO}
                  fit="contain"
                  pattern="floyd"
                  pixelSize={2}
                  levels={3}
                  palette="duotone"
                  inkColor="#18161d"
                  paperColor="#fffdf8"
                  contrast={1.25}
                  brightness={0.04}
                  revealRadius={250}
                  softness={0.7}
                  linger={1.2}
                  rimColor="#a82420"
                  rim={0.28}
                  wander={false}
                  clickBurst={true}
                  className="jh-dither-veil-effect"
                />
              </Suspense>
            </div>
            <div className="jh-plaque-footer">
              <span className="jh-logo-caption">JIIT YOUTH CLUB <b>·</b> 128</span>
              <span className="jh-status-live-tag">OFFICIAL MARK</span>
            </div>
          </div>
          <span className="jh-photo-label">JYC 128 / CAMPUS COMMUNITY</span>
          <span className="jh-photo-index">01 — IDENTITY</span>
        </div>
      </section>

      {/* V1 EDITORIAL INTRO: context before the discovery content. */}
      <section className="jh-about-editorial jh-container" aria-labelledby="jh-about-title">
        <div className="jh-about-kicker">01 / MORE THAN A CLUB DIRECTORY</div>
        <div className="jh-about-editorial-grid">
          <h2 id="jh-about-title">A campus is made<br /><em>by the people in it.</em></h2>
          <div className="jh-about-editorial-copy">
            <p>JIIT Youth Club brings student communities together across technology, culture, performance, service and sport. Find the people, projects and experiences that make campus life feel like yours.</p>
            <div className="jh-about-editorial-actions">
              <button type="button" className="jh-text-link" onClick={() => nav('/about')}>How JYC works <span>↗</span></button>
              <button type="button" className="jh-text-link" onClick={() => nav('/clubs')}>Explore communities <span>↗</span></button>
            </div>
          </div>
        </div>
      </section>

      {photoStories.length > 0 && (
        <section className="jh-photo-story jh-container" aria-labelledby="jh-photo-story-title">
          <div className="jh-photo-story-head">
            <div>
              <div className="jh-section-number">02 / CAMPUS LIFE IN FRAME</div>
              <h2 id="jh-photo-story-title">Campus life,<br /><em className="jh-title-gradient">as it happened.</em></h2>
            </div>
            <div className="jh-photo-story-intro">
              <p>From packed stages to the moments between them — real photographs from JYC clubs, events and campus life.</p>
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
                onClick={() => nav('/gallery?q=' + encodeURIComponent(story.association || story.caption || ''))}
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
                  fallbackSrc="/assets/photo-unavailable.svg"
                  fallbackAlt="Photograph unavailable"
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

      {/* PILLARS / WHAT JYC DOES BENTO GRID */}
      <section className="jh-pillars-section jh-container">
        <div className="jh-section-head">
          <div>
            <div className="jh-section-number">03 / FIND YOUR PEOPLE</div>
            <h2>Find your kind<br /><em className="jh-title-gradient">of people.</em></h2>
          </div>
          <button type="button" className="jh-text-link" onClick={() => nav('/clubs')}>
            Explore all communities <span>↗</span>
          </button>
        </div>
        <LazyActivityBento activities={activities} nav={nav} />
      </section>

      {/* FEATURED & UPCOMING EVENTS */}
      <section className="jh-container jh-events">
        <div className="jh-section-head">
          <div>
            <div className="jh-section-number">04 / WHAT’S HAPPENING</div>
            <h2>Next up at<br /><em className="jh-title-gradient">JIIT 128.</em></h2>
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
                fallbackAlt="Official JYC logo placeholder; event media unavailable"
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

      {/* Editorial update feed: source-linked updates instead of invented activity counters. */}
      <JYCNowStrip limit={3} compact={false} />

      {/* LIVING JYC SPOTLIGHT */}
      <JYCSpotlight data={data} />

      {/* REAL MOMENTS & VISUAL ARCHIVE */}


      {/* LEADERSHIP & APEX BODY */}
      <section className="jh-community">
        <div className="jh-container jh-community-grid">
          <div className="jh-community-copy">
            <div className="jh-section-number">05 / THE PEOPLE BEHIND IT</div>
            <h2>The people<br /><em className="jh-title-gradient">behind JYC.</em></h2>
            <p>
              Meet the student team coordinating JYC's clubs, events and campus communities.
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
                    {teamPhotoFor(m)
                      ? <ResponsivePhoto className="jh-team-thumb" src={teamPhotoFor(m)} alt="" loading="lazy" decoding="async" sizes="48px" fallbackSrc="/assets/jyc-logo.webp" fallbackAlt="" />
                      : String(m.name || 'JYC').trim().split(/\s+/).map(x => x[0]).slice(0, 2).join('').toUpperCase()}
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
            <div className="jh-section-number">06 / GET INVOLVED</div>
            <h2>Find your place<br /><em className="jh-title-gradient">in campus life.</em></h2>
          </div>
          <div>
            <p>Explore a community, show up for an event, or meet the people building something at JIIT. Your next step starts here.</p>
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
