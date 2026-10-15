# JIIT Youth Club 128 — Official Website

> **Current release: V64.5.10 — Compact assistant media and truthful live updates**

[![Quality](https://github.com/kaustubhdua/JYC-Website/actions/workflows/ci.yml/badge.svg)](https://github.com/kaustubhdua/JYC-Website/actions/workflows/ci.yml) [![CodeQL](https://github.com/kaustubhdua/JYC-Website/actions/workflows/codeql.yml/badge.svg)](https://github.com/kaustubhdua/JYC-Website/actions/workflows/codeql.yml) [![JYC Quality](https://github.com/kaustubhdua/JYC-Website/actions/workflows/jyc-quality.yml/badge.svg)](https://github.com/kaustubhdua/JYC-Website/actions/workflows/jyc-quality.yml)

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
- Best of JYC — editorial photo selection
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

The team directory uses flip cards with biography and verified public social links. Photo delivery uses responsive AVIF/WebP derivatives where available, source-safe fallbacks, lazy loading below the fold, and reduced-motion-aware interactions.

## Design direction

The senior-approved visual direction is intentionally editorial and compact:

- JYC logo-derived beige / champagne
- Identity-first split hero with the official logo rendered through a lazy React Bits Dither Veil effect
- Magnetic, keyboard-friendly activity bento; club and event cards keep their own source-grounded identities
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

The five supplied archives contain 873 raw files, including 872 image assets, with 813 unique SHA-256 image hashes after 60 exact duplicate relationships. The complete supplied archive remains preserved under `public/assets/source-archive/` with its catalog and provenance, but it is treated as source material rather than a production asset bucket. The strict public photography pool is maintained separately (currently 356 curated photographs), while identity assets remain preserved outside the photography classification. Production builds now serve only the curated photo/identity subset from the source archive; design, presentation and other excluded source assets are not copied into the production archive.

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

For a concise explanation of the active runtime, source/content hierarchy, SEO, media, 3D bot and QA boundaries, see `docs/ARCHITECTURE-V56.1.md`. The latest source/research pass is documented in `docs/V64-EDITORIAL-RESEARCH-AND-NEXT-PLAN.md`.

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
- **Official links:** https://linktr.ee/jiityouthclub
- **LinkedIn:** JIIT Youth Club 128

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

**Repository owner:** `kaustubhdua`. GitHub links in this document intentionally use the current owner after the account rename.

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

The connected production Supabase project is active and has been hardened and populated with source-verified public content. The current live backend state includes:

- 23 published JYC club records with verified club-source relationships.
- 8 published JYC event records, including canonical JAI 2026, RIDE Hack'26, Converge 2026, DRONO-O-WAR 1.0, Innovate 3.0 and BITBOX 6.0 records.
- 52 approved normalized gallery records, all credited and alt-text complete; rights/provenance review remains intentionally gated.
- 31 editorial media-album shells, all currently unpublished; 25 are club-linked and 8 are event-linked, with 46 normalized gallery records already assigned to albums.
- Production RLS/write-boundary hardening, publication verification, fixed SECURITY DEFINER search paths and rate-limit guards.
- Source-only hub records are review-gated in `jyc_content_verification`; gallery publication now has the same verification guard.
- The public application currently consumes the compatibility JSON read model (`jyc_read_site_data`) rather than the normalized v2 tables directly; do not populate the two models independently without the planned migration/bridge.
- Seven deployed Edge Functions: admin management, notifications, backups, AI content assistance, error intake, media upload and public submissions.
- Private backup storage and constrained public media storage.

The public website release is merged and its exact release head has passed CI, Quality Gate, CodeQL, Browser QA and Lighthouse CI. The remaining launch gates are operational/owner-side: publish the merged main SHA after Vercel's daily deployment quota resets; complete DNS ownership verification for the intended custom domains or accept the verified Vercel origin; enable leaked-password protection in Supabase Auth; provide authorized JYC Now connector credentials or explicitly retain the curated fallback; and finish human review of the captured visual evidence and current archive/event source records. Do not bypass the Vercel quota, invent connector credentials, or apply JYC migrations to another project's database.

## Current release status

- **Latest UI/media review:** [JYC UI/UX, Media & Release Audit — 11 October 2026](docs/JYC-UIUX-MEDIA-DEEP-AUDIT-2026-10-11.md). It records photo fallback hardening, verified event-source corrections, animation guardrails, and remaining release gates.

**V64.5.10 is the current source release.** This pass generates a dedicated 96px AVIF JYC mark for the floating assistant, precaches it under a refreshed service-worker cache, and reduces the artificial post-load boot delay without bypassing the data-loading guard. JYC Now now distinguishes remote live connector results from curated/database fallback and ignores empty connector configuration; RSS sources must use HTTPS. The release checklist now separates the public website from the optional admin platform, and production asset QA validates the built output so generated logo files are checked at the correct stage. The existing editorial hero, responsive image fallbacks, reduced-motion safeguards, team profile interactions and source-backed club/event content remain covered by the release QA suite.

Package metadata, lockfile and the service-worker cache namespace are synchronized. The latest verified release head 85a65b6ea748793feb55083a9fe596f7ceb7d4e6 passed JYC CI, Quality Gate, CodeQL, Browser QA (38 smoke + 3 visual-route tests), and Lighthouse CI. Lighthouse reports performance scores 86–88, accessibility and SEO 100 on all seven audited routes, zero color-contrast items, and Gallery LCP of 2487ms. The exact-head Vercel preview is READY at https://jyc-website-d9cs89hm1-jyc-website.vercel.app. The release is merged to main as 35d692f67ddd1c6f7df1d00be5a0bf4bca75d3f3, but production still serves SHA 7ebef7bdbc5d744c8fc505c10663e70770f38c8a; Vercel rejected the production deployment with the daily payment_required / build-rate-limit gate. No further production retries or quota bypasses were attempted. Treat the release as source/preview-validated but not yet production-deployed.

The highest-value remaining production work is operational/editorial rather than architectural:

1. Keep the complete 873-file source archive catalogued and maintain editorial review when promoting new material into official event/club records.
2. CI now enforces the production JS/CSS/image budget, public-route hygiene and expanded browser smoke suite; run the same browser suite against the deployed site at desktop/tablet/mobile sizes and both themes.
3. Verify live Supabase content and every published club/event record.
4. Verify the Vercel production deployment and its redirects/headers.
5. Run a final performance pass after the real production image set is known.

No new student-platform features should be added to the public site unless the JYC product scope is explicitly changed.
