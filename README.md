# JIIT Youth Club 128 — Official Website

> **Current direction: V51 — final club-only public website**

The official public website for **JIIT Youth Club (JYC), JIIT Wish Town Campus, Sector 128, Noida**.

JYC 128 is the central coordinating body for major college events, fests and inter-society activities. The website is therefore an **official organisational presence**: it represents JYC's identity, leadership, history, clubs/hubs, events, achievements, announcements, memories and official contact channels. It is intentionally **not** a student-help portal or campus utility dashboard.

## Public website scope

### Core sections
- Home
- About JYC
- JYC History
- Leadership
- Events
- Event Details
- Clubs & Hubs
- Gallery
- Achievements
- Announcements / JYC Now
- Recruitment / Join JYC
- Contact

### Public journey

**Identity → About → Leadership → Clubs → Events → Event Details → Results / Achievements → Gallery / Memories → Contact**

This is **not** an academic portal, student-help portal, attendance/check-in system, event-pass/certificate system, student account area, campus utility dashboard or social-network clone.

## Benchmark direction

The public experience is benchmarked against JIIT’s own Innovation/CICR ecosystem, the current JYC 128 site, major student-run festival sites and strong university student-organisation sites. We borrow information architecture, editorial storytelling, event presentation, archive discipline and organisation-level credibility — **not** portal-heavy utility patterns, generic dashboards, excessive WebGL, custom cursors or visual noise.

## What the site should do exceptionally well

1. **Represent JYC 128 clearly** — correct campus identity, organisation story and official channels.
2. **Show the organisation** — faculty coordination, Apex/leadership, committee heads and clubs/hubs.
3. **Present communities professionally** — purpose, activities, leadership, achievements, events, gallery and official links.
4. **Present events as official records** — date, venue, organiser, status, registration, rules, eligibility, prizes, FAQs, contact and later results/recap.
5. **Preserve JYC's history** — achievements, event archives, photography and documented milestones.
6. **Publish trustworthy information** — public records need a source, verification date and clear published/archive state internally.
7. **Support official communication** — announcements, registration links, social channels and contact information.
8. **Remain fast and accessible** — restrained motion, responsive imagery, keyboard access, reduced-motion support and strong mobile layouts.
9. **Be the canonical editorial window** — surface verified hub activity without becoming a social-network clone or student-help portal.

## Content truth policy

Historical brochures, supplied presentations and old club lists are context, not automatic proof of a current club or office holder.

Current public records should carry:
- published / archived state
- source or provenance
- last verified date
- organiser / owner where relevant
- official external link where attributable

Unknown social handles are left blank rather than guessed.

## Design system

The public experience uses:
- JYC beige
- black / white neutrals
- editorial typography
- Phoenix/JYC mark as the signature
- strong photography
- compact, centred composition
- restrained micro-interactions
- reduced-motion support

Avoid decorative systems that compete with JYC content: persistent orbit animations, flying birds, custom cursors, excessive glow, giant empty hero stages or generic AI-dashboard styling.

## Event architecture

### Lifecycle

**Draft → Review → Published → Registration Open → Registration Closed → Ongoing → Completed → Results → Archived**

Published event pages should connect naturally to:

**registration → participation → result/recap → gallery → organiser club**

### Event record

A published event should be able to contain:
- title and poster
- organiser / club
- category
- date and time
- campus and venue
- registration state and deadline
- eligibility
- capacity/team size when applicable
- official registration link
- rules
- schedule
- prizes
- FAQs
- contact
- results
- recap/gallery

## Club architecture

A current club/hub record should be able to contain:
- official name
- category/family
- purpose and description
- student leadership
- faculty advisor when officially published
- activities
- current events
- achievements
- gallery
- official social/contact links
- recruitment status
- source/provenance
- last verified date
- archive state

The directory should never imply that an old supplied list is an exhaustive current 2026–27 roster.

## Media and achievements

Gallery items should support:
- event/club association
- year
- caption
- alt text
- photographer/source credit
- provenance
- archive state

Achievements should favour evidence-backed records: award/result, event, organiser, year and supporting source/media where available.

## Announcements

Announcements are an official communication layer for:
- registrations
- results
- auditions
- recruitment
- notices
- deadlines
- JYC updates

Each announcement should have a publication state and expiry/archive behaviour so stale notices do not remain visually dominant.

## Operations

The private Control Center is for authorised JYC editors.

**Draft → Review → Verify → Publish → Archive**

Quality checks should cover stale records, missing sources, missing media metadata, broken registration links, duplicate records, invalid dates/venues and outdated recruitment information.

The private admin layer is operational infrastructure; it should not turn the public website into a student utility portal.

## Technology

- React 19
- Vite 8
- React Router
- Supabase
- CSS-first interaction layer
- Service worker / PWA shell
- GitHub Actions quality gates
- Playwright browser QA

## Local development

```bash
npm install
npm run dev
npm run build
npm run qa
npm run qa:browser
```

## Official identity

- **Organisation:** JIIT Youth Club 128
- **Campus:** JIIT Wish Town Campus · Sector 128, Noida
- **Instagram:** @jiityouthclub
- **LinkedIn:** JIIT Youth Club

## Research basis

The V45 direction is based on current JIIT material, the supplied JYC hub/programme archive, current JIIT 128 community/event references, current web accessibility guidance, and current Google event structured-data guidance, verified public club social identities, and the JAI 2026 registration brief. The implementation keeps JYC's public experience source-first: historical supplied material is presented as archive/context rather than silently treated as a current roster.

See:
- `docs/V37-OFFICIAL-JYC-128-SCOPE.md`
- `docs/V36-DEEP-RESEARCH-2026-10-03.md`
- the V42/V43 public-page and QA history in GitHub pull requests

The JIIT 2026 brochure describes JYC 128 as the central coordinating body responsible for planning, managing and executing major college events, fests and inter-society activities. Current JIIT public material identifies Converge 2026 as a Sector-128 fest organised by JYC, while current JYC 128 public activity shows JAI 2026 as a major upcoming JYC 128 event.

## Production gates

A release is not production-ready until:
1. build passes
2. static QA passes
3. security/SEO QA passes
4. Senior V1 contract QA passes
5. browser QA passes on desktop/mobile
6. official identity and social links are verified
7. no stale Sector-62 JYC copy remains in the public 128 narrative
8. event/club content is clearly sourced or labelled historical
9. critical pages have no runtime errors
10. performance and accessibility regressions are checked
11. release metadata, package-lock and documentation identify the same product generation
12. the connected production deployment is verified separately from GitHub CI


## V47 product upgrades

- Added **JYC Now**, a first-class editorial layer for recent verified public updates from JYC and its published communities.
- Added `/updates` with community/platform filters, source labels, canonical “View original” links and a Community Spotlight tied back to club profiles.
- Added a server-side aggregation endpoint at `/api/jyc-updates` with configurable Instagram, YouTube, LinkedIn, RSS and manual editorial adapters.
- Added the V47 Supabase schema `supabase/V47-JYC-NOW.sql` for verified source records, normalized posts and aggregation runs. Public writes are blocked by RLS; server-side service credentials stay off the client.
- Added V47 browser/static QA coverage and refreshed the service-worker cache generation.
- The public experience deliberately avoids likes, comments, follows, DMs, algorithmic “For You” ranking and portal-style utility dashboards.

### Connector setup

The public page works with a curated official-source fallback immediately. To enable live aggregation, configure the **server-only** values in `.env` / Vercel:
- `META_ACCESS_TOKEN` + `JYC_INSTAGRAM_ACCOUNTS` for Instagram Professional accounts.
- `YOUTUBE_API_KEY` + `JYC_YOUTUBE_CHANNELS` for YouTube channels.
- `LINKEDIN_ACCESS_TOKEN` + `JYC_LINKEDIN_ORGS` for authorized organisation pages.
- `JYC_RSS_FEEDS` for official websites that expose RSS/Atom.
- `JYC_MANUAL_UPDATES` for verified sources that cannot be read through an API.
- `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` for server-side persistence.
- `JYC_SYNC_SECRET` for protected scheduled sync calls.

Provider credentials must never use a `VITE_` prefix or appear in browser code.
## V45 product upgrades

- Standalone JYC Assistant with source-grounded local search across published clubs, events, people and pages.
- Restored the supplied JYC assistant GLB at `public/models/jyc-spatial.glb` and kept its camera fixed; clicking the bot opens the Assistant and triggers a restrained wave motion.
- Featured JAI 2026 popup appears on every fresh public website visit, including returning visitors, with official site, Unstop registration and Discord actions.
- Club social identities are maintained in `src/jyc-socials.js`; only publicly verified handles are added, with hub-PDF provenance where applicable.
- Public hub/profile pages continue to use supplied All Hubs material and source photography rather than invented club facts.


## Current release

**V49 — Production Finish** is the current release candidate. It adds the final interaction layer, mobile resilience, fail-closed JYC Now synchronization, connector versioning, and the production-finish QA contract.

See RELEASE-V49-PRODUCTION-FINISH.md.


## V51 final product boundary

The public product is intentionally limited to the JYC organisational website: **Home, About, History, Clubs/Hubs, Club detail, Events, Event detail, Fest experiences, Gallery, Leadership/Team, Archive, Recruitment, Announcements/JYC Now and Contact**. A small **JYC Event Calendar** is retained only as an event-discovery view; it contains JYC events, not academic dates or campus utilities.

Legacy student-platform destinations such as My JYC, account sign-in, planner, notifications, QR utilities, projects, settings and native event-registration flows are no longer part of the public journey and redirect to the appropriate club website destination. The private Control Center remains available only for authorised JYC publishing operations.

The visual direction is deliberately editorial: JYC beige, black and white, real supplied JYC photography, compact layouts, strong typography and restrained motion. Decorative starfields, assistant/chat surfaces, intrusive event popups and portal-style UI are not mounted in the public shell.
