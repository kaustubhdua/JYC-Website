# JYC V62 — Master checklist status

Date: 2026-10-08

This document reconciles the V23 master build contract with the current V61.1 codebase and the live Supabase/Vercel state. It is deliberately honest about external gates that cannot be closed from source control.

## Done in code

- Public information architecture: Home, About, Clubs/Hubs, Club detail, Events, Event detail, Gallery/Archive, Team, Contact, 404.
- Responsive public shell, mobile navigation, theme switching, loading/empty/error handling and reduced-motion safeguards.
- Canonical club/event navigation and stored event slugs.
- Event ↔ gallery relationships and shareable gallery album/photo deep links.
- Gallery lightbox with keyboard, swipe, zoom, focus management and share/open-event actions.
- Strict curated photography boundary: rejected source graphics/design assets cannot leak back into production gallery surfaces.
- Build-time image dimension manifest and production media boundary.
- Lazy archive rendering and constrained eager-image budget.
- 44px touch targets for the audited filter/related-album controls.
- SEO contracts, sitemap generation, canonical identifiers and public route QA.
- Accessibility contracts, focus-visible treatment and modal keyboard handling.
- Public product boundary: no student portal/dashboard, academic utilities, social network or public AI assistant.
- JYC Network signature interaction is now mounted in the hero.
- Legacy decorative dither hero layer is no longer mounted.
- Canonical hero accent is now beige/champagne rather than the legacy red accent.
- Master checklist is now part of npm run qa.

## Done in data / backend

- 23 published JYC club records with verified source relationships.
- 8 published JYC event records.
- 52/52 normalized gallery records are approved, credited and alt-text complete.
- Photographer fallback/credit coverage is established without inventing individual photographer names.
- Gallery rights are intentionally gated rather than falsely marked cleared.
- 31 media album shells exist.
- Supabase RLS/write-boundary hardening is present.
- The intentional SECURITY DEFINER public read RPC remains available for the public read model.
- Admin mutation RPCs are not executable by anon; role helper RPCs remain available where RLS policies depend on them.

## Still not done — and why it must not be faked

### 1. Supabase Auth leaked-password protection
**Not done.** Supabase's live security advisor still reports leaked-password protection disabled. This is an Auth dashboard setting, not a repository change. It must be enabled in the Supabase Auth password-security settings.

### 2. Vercel verification of V61.1/main
**Not done.** The latest V61.1 commit is on GitHub, but there is no successful Vercel deployment for that commit. The last V61 preview failed before the V61.1 regex fix; the subsequent V61.1 deployment attempt was blocked by the Vercel Hobby deployment quota. The older READY deployments are not evidence that V61.1 is production-green.

### 3. GitHub Actions execution
**Not verified.** The repository contains CI/CodeQL/quality workflows, but the V61.1 commit has no associated workflow run visible through the connected GitHub workflow API. Do not claim CI green until a real run completes.

### 4. Rights/provenance clearance
**Not done.** Live Supabase currently reports 52 approved gallery records with rights_status=review. Approval means editorial acceptance, not rights clearance. No rights claim should be invented.

### 5. Album editorial publication
**Not done.** All 31 album shells are currently unpublished. Six approved gallery records are unalbumed. These need real editorial decisions/relationships; auto-publishing them would be fabrication.

### 6. Focal-point curation
**Not done.** All 52 approved gallery records currently have null focal coordinates. This is an editorial crop decision and should be populated only after visual review, not with arbitrary 50/50 values.

### 7. True responsive image binary variants
**Not done.** The site has real dimensions, lazy loading, sizes, fetch priority and a production boundary, but it does not yet generate multiple binary image resolutions. A proper encoder/CDN transformation pipeline is still required.

### 8. Production backup/restore drill
**Not fully verified.** Backup infrastructure exists, but a complete restore drill has not been independently demonstrated in this release pass.

### 9. Production browser/performance smoke
**Not verified against the latest commit.** Static contracts exist and browser QA is wired, but the latest V61.1 code needs a successful deployment or local/CI browser run after the Vite fix.

### 10. Third-party Edge Function secrets
**Not fully verified.** Secret-backed integrations exist, but real production values must be confirmed in the Supabase project before relying on those functions.

### 11. Official domain
**Not closed.** The repository can generate canonical metadata, but the official JYC domain is external configuration and has not been supplied/verified as connected.

## Deliberately not implemented

The V23 anti-feature list remains authoritative. The public product does not add:

- student dashboard
- academic timetable/attendance
- campus utility map
- social network/chat/DMs
- public AI assistant
- gamification/leaderboards
- random WebGL/3D decoration
- custom cursor
- scroll-jacking
- fake statistics/testimonials
- invented people/events/links

## Release decision

**Source-code/product work: substantially complete.**

**Production release: not yet fully verified.**

The remaining blockers are primarily external operational/editorial gates rather than missing public-site architecture. They must be closed with real evidence; they should not be papered over with QA assertions or fabricated data.
