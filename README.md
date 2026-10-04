# JIIT Youth Club 128 — Official Website

> **Current release: V52 — final club-only production release**

The official public website for **JIIT Youth Club (JYC), JIIT Wish Town Campus, Sector 128, Noida**.

JYC 128 is the central coordinating body for major college events, fests and inter-society activities. This repository builds its **official organisational website**: identity, leadership, clubs/hubs, events, fest experiences, history, gallery, archive, recruitment, announcements and contact.

It is intentionally **not** a student-help portal, academic portal, attendance system, campus utility dashboard or student social network.

## Public product

### Core sections

- Home
- About JYC
- JYC History
- Clubs & Hubs
- Club detail
- Events
- Event detail
- Fest experiences
- Gallery
- Archive / memories
- Leadership / Team
- Achievements
- Recruitment
- Announcements / JYC Now
- JYC Event Calendar
- Contact

### Public journey

**Identity → About → Team → Clubs → Events → Event detail → Gallery / Archive → Recruitment / Contact**

The event calendar is limited to **JYC events**. It is not an academic calendar or campus-utility surface.

Retired student-platform destinations are handled with permanent redirects rather than being silently recreated as public pages.

## Product boundaries

The public site does **not** provide:

- My JYC / student accounts
- Academic calendar or academic utilities
- Attendance / check-in
- Event-pass or certificate systems
- Campus maps / utility dashboards
- Public AI assistant or chat launcher
- Native public event-registration accounts
- Likes, follows, DMs or social-network feeds
- Decorative popups that compete with JYC content

The private Control Center remains website-publishing infrastructure for authorised JYC editors. It is not part of the public product.

## Design direction

The senior-approved visual direction is intentionally editorial and compact:

- JYC logo-derived beige / champagne
- Deep navy, black and white neutrals
- Strong typography and readable line lengths
- Real JYC photography before decorative graphics
- Centred, compact layouts
- Pill-shaped filters and actions where useful
- Restrained hover/reveal motion
- Full reduced-motion support
- Excellent mobile layouts
- No custom cursor
- No flying-bird / orbit-ring system
- No persistent decorative rotation
- No neon / glass / generic AI-dashboard styling

The public shell should feel like an official student organisation, not an ERP.

## Content truth policy

Historical brochures, supplied presentations and old club lists are **source material**, not automatic proof of a current club, office holder or social account.

Public records should be published only when the editorial source supports them. Where possible, records carry:

- published / archived state
- provenance or source
- verification information
- organiser / owner
- official external link
- media caption and credit

Unknown social handles are left blank rather than guessed.

## Media policy

The supplied JYC image archives are treated as source material. The website's source-media pipeline preserves provenance and uses real event / hub / leadership imagery instead of invented or generic stock content.

Gallery records are intended to support:

- event / club association
- year
- caption
- alt text
- source / photographer credit
- provenance
- archive state

The remaining media-ingestion step is deliberately kept separate from the code release when the binary archive cannot be safely extracted in the development runtime.

## Event architecture

A published event can carry:

- title and poster
- organiser / club
- category
- date and time
- venue
- registration state and external registration link
- eligibility
- team size / capacity when applicable
- rules
- schedule
- prizes
- FAQs
- contact
- results / recap
- gallery

Lifecycle:

**Draft → Review → Published → Registration → Ongoing → Completed → Results → Archived**

## Club architecture

A current club/hub record can carry:

- official name
- family / category
- purpose and description
- student leadership
- faculty advisor when officially published
- activities
- events
- achievements
- gallery
- official social/contact links
- recruitment state
- provenance
- verification state
- archive state

The directory must not imply that an old supplied list is an exhaustive current roster.

## Announcements / JYC Now

JYC Now is an editorial communication layer for verified JYC activity such as:

- registrations
- results
- auditions
- recruitment
- notices
- deadlines
- JYC updates

Stale or unsupported information should not remain visually dominant.

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

The static QA suite includes source integrity, security, SEO, build preflight, production contracts, accessibility, architecture, logo/theme checks, club experience checks, final product checks, V52 release checks and final hygiene checks.

## Official identity

- **Organisation:** JIIT Youth Club 128
- **Campus:** JIIT Wish Town Campus · Sector 128, Noida
- **Instagram:** @jiityouthclub
- **LinkedIn:** JIIT Youth Club

## Research / source basis

The public architecture is based on supplied JYC hub and programme material, JIIT/JYC public references, the current JYC 128 site, accessibility guidance, event-structured-data guidance and verified public social identities available during the project.

Historical material is surfaced as history/archive/context rather than silently treated as current truth.

Key project references:

- `docs/V37-OFFICIAL-JYC-128-SCOPE.md`
- `docs/V36-DEEP-RESEARCH-2026-10-03.md`
- `src/jyc-source-media.js`
- `src/public-v1/config.js`
- `scripts/qa-v52-final-contract.mjs`
- `scripts/qa-final-hygiene.mjs`

## Production gates

A release should be considered production-ready only after:

1. Build passes.
2. Static QA passes.
3. Security and SEO QA pass.
4. Club-only architecture checks pass.
5. Desktop, tablet and mobile browser QA pass.
6. Official identity and social links are verified.
7. No stale Sector-62 JYC positioning appears in the public 128 narrative.
8. Club/event content is sourced or clearly historical.
9. Critical routes have no runtime errors.
10. Performance and accessibility regressions are checked.
11. Release metadata and documentation agree.
12. The connected Vercel production deployment is verified separately from GitHub CI.
13. The supplied photo archives have been safely ingested, deduplicated and optimised before being treated as the final production media set.

## Current release status

**V52 is the current code release.** The codebase is intentionally in finish-and-stabilise mode rather than feature-expansion mode.

The highest-value remaining production work is operational rather than architectural:

1. Safely ingest and optimise the five supplied image archives.
2. Run real browser QA against the deployed site at desktop/tablet/mobile sizes and both themes.
3. Verify live Supabase content and every published club/event record.
4. Verify the Vercel production deployment and its redirects/headers.
5. Run a final performance pass after the real production image set is known.

No new student-platform features should be added to the public site unless the JYC product scope is explicitly changed.
