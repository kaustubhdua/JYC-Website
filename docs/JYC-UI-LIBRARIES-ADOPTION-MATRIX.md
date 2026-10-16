# JYC UI Library Adoption Matrix & Implementation Prompt

**Date:** 16 October 2026
**Target:** `kaustubhdua/JYC-Website`

## Executive decision

Build a **warm, editorial, photography-led campus experience with selective three-dimensional depth**. Do not rewrite JYC or add three overlapping animation frameworks. The app already uses React 19, React Router 7, Vite 8, Motion, GSAP, OGL/React Bits Dither Veil, Magic Bento, DepthCarousel, DriftWall, responsive photos, event/archive flows, and a custom image lightbox. Treat these as the baseline and improve them.

### What to reuse from the libraries

| Source | Reuse/adapt | Do not add blindly |
|---|---|---|
| [shadcn/ui](https://github.com/shadcn-ui/ui) | Accessible patterns for Dialog/Sheet, Tabs, Accordion, Select/Popover, search-command, Skeleton and Toast/Alert when an existing component has a tested gap. Adopt components individually, preserving routing, state and local styles. | Full app conversion, a global theme reset, or migrating underlying Radix/Base UI primitives without user-facing benefit. |
| [Magic UI](https://github.com/magicuidesign/magicui) | Bento layout discipline; occasional blur/opacity section reveal; one restrained spotlight edge on selected cards; a static or low-motion grid/light field in one visual region; accessible logo rail only when real partner data exists. | A second animation runtime, perpetual animated backgrounds, multiple simultaneous effects, cursor replacement, global sparkles/shimmers, heavy WebGL everywhere, hover-only essential content. |
| [Tremor](https://github.com/tremorlabs/tremor) | Consistent compact information hierarchy for verified facts: date/status, sourced results and small achievement stats where there is real data. Borrow design principles before package adoption. | Dashboard/KPI-grid aesthetics, decorative charts, unsupported statistics or a new dependency for simple chips/cards. |
| Innovation JIIT source | Purpose-first opening, page-specific art direction, authentic-photo storytelling, activity discovery, narrative event detail, archive and team sequencing. | Innovation’s logo/palette/photos, copied code blobs without review, expired registrations/dates, placeholder bios/emails, legacy HTML/CSS baggage. |

## Design system

### Brand and surfaces
- Canvas: warm ivory/paper; elevated surfaces use slightly warmer/lighter paper.
- Main text: deep ink with strong contrast.
- Primary action: JYC oxblood/deep red; champagne/brass is a restrained secondary accent.
- Borders: fine warm-neutral lines. Depth: soft, directional, layered shadows rather than giant diffuse glows.
- Keep dark mode coherent if it is currently exposed. Never let themes drift or reduce text contrast.
- Create one canonical token source for colour, typography, spacing, radii, content widths, surfaces, shadows, focus rings and motion durations. Inventory current CSS imports first; remove conflicts deliberately, not by blindly adding another final override.

### Type and content
- Use Space Grotesk (display) and Inter (body) only if those are in the canonical font setup; monospace only for short metadata.
- Fluid display/body sizes with `clamp()`, balanced headlines, sensible line lengths and readable body leading. Do not use tiny text to squeeze cards.
- Every paragraph, status, button, empty state, event date and team role needs useful, verified meaning. Avoid generic promotional filler.

### Premium 3D style
Use layered planes, subtle perspective, deliberate image crop, lighting, material contrast and pointer-only micro-interactions. Keep the official JYC mark crisp and recognizable. Dither Veil is the signature WebGL hero effect; keep a fast static logo fallback if shader/image/WebGL fails. One dominant visual effect per major section. Reduced-motion and touch interfaces must remain complete and useful.

## Page blueprint and acceptance criteria

1. **Home:** left: identity headline, short true JYC proposition, Explore Clubs + View Events CTAs. Right: official JYC logo with existing Dither Veil and fallback. Follow with concise intro, source-photo activity Bento, one accurate featured event, event discovery, curated photo story, latest verified update, About/Team entry points and contact/recruitment CTA. No invented counts or repeated duplicate images.
2. **About/history:** explain JYC accurately and briefly, source-backed timeline, meaningful milestones and purposeful photos. Keep the legacy history route mapped intentionally; check anchors and canonical metadata.
3. **Clubs & hub details:** discovery/filter/search that really filters; keyboard/touch-ready active chips with reset; official logo/photography, clear category, concise description, verified activities/links/recruitment state. Each hub detail should have its own identity without breaking shared layout.
4. **Events/fests/event detail:** sort/filter by upcoming/live/planned/past correctly; label status/date first; all dates/status/URLs verified from approved records. Past items cannot offer registration. An unverified/planned event must not be shown as open registration. Details should offer venue, organiser, description, resources/FAQ and relevant photos when published.
5. **Gallery/archive:** intentional featured images and a varied yet deterministic responsive grid; meaningful published albums, stable image dimensions, no stretching/repeated fillers; keyboard/touch lightbox with previous/next, Escape, count, caption, focus trap/return and fallback; preserve shareable album/photo URLs if already supported.
6. **Team:** correct real portrait/name/position. Flip interaction may stay only if keyboard and touch equivalent, content isn't available only on hover, and focus remains correct. Missing portraits need a neutral branded placeholder, never a logo cropped as a person's face.
7. **Achievements/Best of JYC:** source-backed records and images only; no fabricated statistics. Validate route titles, metadata and sitemap against actual route components.
8. **Recruitment/Join:** display truthful current status, official form destination, deadline, clear closed/not-configured feedback and no stale application CTA.
9. **Announcements/JYC Now/Calendar:** correct dates, accessible states, meaningful no-result states, working links/history/deep-link; never let old notices masquerade as fresh.
10. **Contact:** working field validation/focus/error/success handling and safe external links. When endpoint is unconfigured, state so honestly and offer verified social routes.
11. **Admin/Control Center:** audit separately for access boundaries; never make private tools part of the public redesign or weaken protections.

## Interaction, accessibility and performance bar
- Test keyboard, pointer and touch; no important hover-only content.
- All controls have visible focus; dialogs close by Escape, restore focus and manage tab order; form errors announce and focus correctly.
- Follow WCAG 2.2, including contrast, labels, reduced motion and target sizing (generally at least 24×24 CSS px, with exceptions; prefer larger touch targets).
- Viewports: 320×740, 360×800, 390×844, 430×932, 768×1024, 1024×768, 1280×900, 1440×900, 1920×1080. Also test light/dark if supported, reduced motion, direct route load, refresh/back/forward and slow/network-error cases.
- Core Web Vitals target at the 75th percentile: LCP ≤2.5s, INP ≤200ms, CLS ≤0.1.
- Reserve image space, lazy-load below-fold photos, eagerly prioritise the primary hero, use existing derivatives/manifest, pause loops when offscreen, avoid repeated background work and measure rather than claim 60 FPS.
- Check broken image requests, alt-text meaning, crop/focal points, duplicate assets and actual event associations through screenshot review, not manifest validity alone.
- Check safe links, external `target=_blank` rel attributes, input validation, secrets/configuration, admin access and dependency vulnerabilities. Don’t mutate production Supabase, DNS, domain or deployment configuration.

## Required execution and release workflow
1. Read the repo's current base SHA, open PRs, CI state, route registry, package scripts, CSS entry/imports, components, image manifest, canonical data models and active PR overlap.
2. Inspect supplied Innovation source and the reference audit. Audit text/content, links, IDs, images/alt, historical event states and duplicate legacy trees. Take patterns only; do not import its assets/content into JYC.
3. Inventory each public route and page component. Baseline screenshots first, then implement by logical changes: design tokens; high-priority bugs/data; hero; homepage; Gallery/Archive; events; clubs; team; remaining routes.
4. Selectively adapt library component implementations only where existing behaviour lacks accessibility/reliability; document package/version/source/license and why needed. Do not add redundant motion/component dependencies.
5. Commit in logical branches/commits and keep changes in a PR until conflicts and visual evidence are reviewed. Do not override main or merge conflicts to satisfy a superficial completion claim.
6. Use Node 24 as required by package.json; run `npm ci`, `npm run build`, `npm run qa`, `npm run qa:responsive`, `npm run qa:security`, `npm run qa:seo`, `npm run qa:photos`, `npm run qa:v64-editorial`, `npm run qa:photo-intelligence`, `npm run qa:performance`, `npm run qa:browser`, plus Playwright route/viewport and critical interaction tests. Record real exit codes; never infer success from a visible button or build alone.
7. Inspect CI Browser QA screenshots and Lighthouse results on the exact HEAD SHA; verify preview URL opens and inspect changed public routes. Fix observed issues and rerun affected suites.
8. Before claiming completion: all public routes have a recorded visual/functional assessment; visible photos/status/links are verified; no console/runtime errors, broken images, overflows, unreadable text, disabled primary journeys or accidental admin exposure; all required CI and preview checks pass.
9. Final report must state exact branch/commit/PR/deployment links, changed files/features, real test outcomes, unresolved blockers and route-by-route status. If there is no verified evidence for an item, mark it incomplete rather than claiming completion.

---

# Copy-ready autonomous engineering prompt

You are the senior frontend/product engineer for `kaustubhdua/JYC-Website`. Execute this work in the actual repository, not a mockup. Read `docs/VISUAL-BENCHMARK-AND-UI-ROADMAP.md`, `docs/REFERENCE-REPOSITORY-AUDIT-2026-10.md`, `docs/INNOVATION-ZIP-AUDIT-2026-10.md` and this file completely. Inspect the available Innovation JIIT reference source and identify which current JYC components already fulfil each requirement before writing code.

**Objective:** deliver a consistent, modern, polished, photography-led website with premium 3D depth and selective animation, excellent mobile UX, accurate content, and tested public journeys—without breaking existing React/Supabase/router/media foundations.

**Preserve:** JYC's own logo, identity and palette; current architecture; verified content; canonical event/hub IDs and slugs; responsive image manifest/derivatives; working gallery/team/event/calendar/contact features; existing Motion/GSAP/OGL and Dither Veil; admin security.

**Implement:** authoritative tokens; readable typography; page-specific composition; homepage identity hero (text left, official JYC mark + Dither Veil right); carefully curated real-photo Bento; meaningful events and album discovery; consistent accessible interaction states; page-by-page improvements across About, Clubs/details, Events/Fests/details, Gallery/Archive, Team, Achievements/Best-of, Recruitment/Join, Updates/Announcements, Calendar and Contact; responsive design; graceful no-data/error/fallback states; verified dates, sources and external links; selective shadcn/ui and Magic UI patterns only where demonstrably useful; Tremor-inspired compact information hierarchy only for real data.

**Do not:** add another animation framework; rebuild the app using a library wholesale; copy Innovation branding/photographs/people/text/registration URLs; fabricate achievements/counts; use placeholders to fill layouts; stack effects everywhere; gate content behind animation; make hover required; suppress errors; change production backend/domains; or claim a task passed without executing its test.

**Verification:** run Node 24, `npm ci`, build and every documented static, security, SEO, media, responsive, performance, browser and route test. Test all required viewport sizes, themes and reduced-motion; keyboard focus, dialogs, filters, image lightbox, Team flip, registration states, forms, browser history and deep links. Inspect screenshots from the actual preview at the exact commit. Fix all detected P0/P1 defects and any visible text/layout/photo issues. Keep the work in reviewable commits and an open PR until overlapping changes, CI and preview evidence are reconciled. The site is not complete until every public route and critical user journey is reviewed; report remaining blockers honestly.