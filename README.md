# JIIT Youth Club 128 — Official Website

> **Current release: V56.16.0 — public polish, media UX and final QA hardening**

[![Quality](https://github.com/coolbandariya/JYC-Website/actions/workflows/ci.yml/badge.svg)](https://github.com/coolbandariya/JYC-Website/actions/workflows/ci.yml) [![CodeQL](https://github.com/coolbandariya/JYC-Website/actions/workflows/codeql.yml/badge.svg)](https://github.com/coolbandariya/JYC-Website/actions/workflows/codeql.yml) [![JYC Quality](https://github.com/coolbandariya/JYC-Website/actions/workflows/jyc-quality.yml/badge.svg)](https://github.com/coolbandariya/JYC-Website/actions/workflows/jyc-quality.yml)

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

The five supplied archives contain 873 raw files, including 872 image assets, with 813 unique SHA-256 image hashes after 60 exact duplicate relationships. The complete supplied archive is now safely ingested under `public/assets/source-archive/` with its catalog and provenance. The runtime media layer indexes all 873 supplied archive entries (872 raster images plus 1 SVG), while artwork/design/presentation assets remain classified separately from photography.

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

## Repository map

For a concise explanation of the active runtime, source/content hierarchy, SEO, media, 3D bot and QA boundaries, see `docs/ARCHITECTURE-V56.1.md`. The latest source/research pass is documented in `docs/JYC-V56.8-DEEP-RESEARCH-2026-10-05.md`.

## Local development

```bash
npm install
npm run dev
npm run build
npm run qa
npm run qa:browser
```

The static QA suite includes source integrity, security, SEO, build preflight, production contracts, accessibility, architecture, logo/theme checks, hub-registry consistency, club experience checks, final product checks, visual/media checks, source-photo integrity and final hygiene checks.

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
- `src/jyc-hub-registry.js`
- `docs/JYC-SOURCE-HUB-SUPABASE-AUDIT-2026-10-04.md`
- `src/public-v1/config.js`
- `scripts/qa-v55-visual-polish.mjs`
- `scripts/qa-final-hygiene.mjs`


## 🧭 Maintainer quick-start

If you are new to this repository, start here — **do not begin by editing `src/main.jsx` blindly**.

1. Read [`docs/CODE-ORGANIZATION.md`](./docs/CODE-ORGANIZATION.md) for the responsibility map.
2. Read [`docs/ARCHITECTURE-V56.1.md`](./docs/ARCHITECTURE-V56.1.md) for runtime boundaries.
3. Read [`CONTRIBUTING.md`](./CONTRIBUTING.md) before changing public behaviour.
4. Run `npm ci` → `npm run qa` → `npm run build` locally before pushing.
5. Use a focused branch name such as `fix/gallery-lightbox`, `feat/events-filter`, or `docs/repository-guide`.

### Repository map

| Area | Responsibility | Start here |
|---|---|---|
| Public runtime | Routing, page composition, data loading | `src/main.jsx` |
| Public pages | Editorial home and page-level experiences | `src/jyc-editorial-home.jsx`, `src/extra-features.jsx` |
| Content | JYC hubs, events, history, social and source records | `src/content/`, `src/*hub*.js`, `src/jyc-source-*.js` |
| UI system | Shared public styles and responsive behaviour | `src/styles/` |
| React Bits | Isolated interactive visual components | `src/components/react-bits/`, `src/react-bits/` |
| Supabase | Public reads + privileged server boundaries | `src/lib/`, `supabase/` |
| QA | Static contracts, media, security, performance and browser checks | `scripts/` |
| GitHub | CI, CodeQL, ownership and contribution rules | `.github/` |
| Documentation | Architecture, research and maintainer guidance | `docs/` |
| Static assets | Logos, approved media, PWA files | `public/` |

### Function ownership rule

Every new function should have **one obvious owner**. Keep route composition in page modules, data normalization in content/data modules, reusable UI in components, browser/platform helpers in `src/lib/`, and validation in `scripts/`. Avoid creating another helper in `main.jsx` when the behaviour belongs to an existing domain module.

For the detailed function/domain map and naming rules, see [`docs/CODE-ORGANIZATION.md`](./docs/CODE-ORGANIZATION.md).

### Pull-request hygiene

The repository is maintained with a **clean PR queue**. Open PRs should be focused, reviewable and merged/closed before starting unrelated work. Do not leave abandoned branches as pseudo-PRs; stale branches should be cleaned up by maintainers when they are no longer useful.

**Current repository state:** 0 open pull requests at the time of this documentation pass.

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
10. Performance and accessibility regressions are checked in CI; deployment smoke is run separately against production.
11. Release metadata and documentation agree.
12. The connected Vercel production deployment is verified separately from GitHub CI.
13. The supplied photo archives have been safely ingested, deduplicated and optimised before being treated as the final production media set.

## Current experience update

The homepage now includes a restrained **Choose Your Route** discovery layer (Build / Create / Compete / Connect), a source-backed **Photo Story**, and a compact **Hub Signal Rail**. The JYC Assistant and fixed JYC bot now adapt their quick actions/label to the current public page. These additions preserve the beige editorial identity and do not introduce decorative WebGL, orbit rings or synthetic imagery.

## Current backend readiness

The connected production Supabase project is now active and has been hardened and populated with source-verified public content. The source registry now distinguishes 17 brochure-verified current communities from 6 additional source-backed communities awaiting live club publication. The current live backend state includes:

- 17 JIIT 128 club records verified against the official 2026 JIIT admission brochure.
- JAI 2026 and Converge 2026 verified event records.
- 6 curated gallery records with alt text/provenance fields.
- Production RLS/write-boundary hardening, publication verification, fixed SECURITY DEFINER search paths and rate-limit guards.
- Source-only hub records are review-gated in `jyc_content_verification`; gallery publication now has the same verification guard.
- The public application currently consumes the compatibility JSON read model (`jyc_read_site_data`) rather than the normalized v2 tables directly; do not populate the two models independently without the planned migration/bridge.
- Seven deployed Edge Functions: admin management, notifications, backups, AI content assistance, error intake, media upload and public submissions.
- Private backup storage and constrained public media storage.

The remaining production gates are operational: configure required third-party Edge Function secrets, enable leaked-password protection in Supabase Auth, verify the connected Vercel production project, review which archive visuals should be promoted as official current event records, and run final browser/performance QA against the real deployment.

## Current release status

**V56.16.0 is the current code release.** The codebase is intentionally in final public polish and production-QA mode rather than feature expansion.

The release boundary is aligned across `package.json`, `package-lock.json`, the service-worker cache, final product QA, final hygiene QA, `public/llms.txt`, and the latest public-surface hardening commits.

The highest-value remaining production work is operational rather than architectural:

1. Keep the complete 873-file source archive catalogued and maintain editorial review when promoting new material into official event/club records.
2. CI now enforces the production JS/CSS/image budget, public-route hygiene and expanded browser smoke suite; run the same browser suite against the deployed site at desktop/tablet/mobile sizes and both themes.
3. Verify live Supabase content and every published club/event record.
4. Verify the Vercel production deployment and its redirects/headers.
5. Run a final performance pass after the real production image set is known.

No new student-platform features should be added to the public site unless the JYC product scope is explicitly changed.
