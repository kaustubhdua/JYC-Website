# JYC Modern Editorial 3D Website — Autonomous Engineering Prompt

Repository: kaustubhdua/JYC-Website
Date: 16 October 2026

## Mission

Act as the senior product designer, frontend engineer, accessibility specialist and release QA owner. Work in the actual JYC repository. Read these documents completely before coding:
- docs/VISUAL-BENCHMARK-AND-UI-ROADMAP.md
- docs/REFERENCE-REPOSITORY-AUDIT-2026-10.md
- docs/INNOVATION-ZIP-AUDIT-2026-10.md
- docs/JYC-UI-LIBRARIES-ADOPTION-MATRIX.md
- relevant page/route/component, asset manifest, data-model and QA files.

Deliver a modern, elegant, photography-led JYC public website with premium 3D depth, thoughtful animation, excellent typography, coherent art direction, precise copy and fully working interactions. Do not build a mockup. Make evidence-backed changes in the real codebase and keep all work reviewable.

## Non-negotiable constraints

- Preserve JYC's identity, official mark, warm ivory/paper + deep ink + oxblood/red + restrained champagne/brass palette and verified information.
- Preserve React 19, React Router, Supabase boundaries, existing event/hub IDs and slugs, responsive media manifest/derivatives, working photo lightbox/team flip/event/calendar/contact features and admin security.
- Homepage hero: JYC text and actions left, official JYC logo with the existing React Bits Dither Veil right. Logo and copy must remain visible if WebGL, shader setup or an image fails.
- Use Innovation ZIP only as a design-pattern reference. Never import Innovation logo, palette, photos, people, copy, contacts, dates, forms or registration destinations.
- Use shadcn/ui patterns selectively for Dialog/Sheet, Tabs, Accordion, filters and feedback states only where an audited gap exists. Reuse current primitives where already accessible.
- Use Magic UI bento composition, selective blur-fade, one restrained spotlight treatment or one ambient backdrop only where it adds hierarchy. Reuse existing Motion/GSAP/OGL; do not add another motion runtime without measured, documented justification.
- Use Tremor's information hierarchy for verified event metadata and sourced achievements only. Do not add dashboard aesthetics, decorative charts or fabricated numbers.
- Do not rewrite the whole app, layer new CSS over unresolved conflicts, make essential information hover-only, gate content behind animation or use placeholders to fill space.
- Do not mutate production Supabase data, secrets, custom-domain DNS or deployment settings.

## Design standard

Build one authoritative token system for brand colors, display/body/metadata type, fluid font sizes, content width, spacing, radii, borders, elevation, focus rings and motion durations. Audit stylesheet import order and the effective cascade first; retire redundant rules carefully. Make the result editorial and tactile: clear type hierarchy, asymmetrical real-photo compositions, layered surfaces, believable perspective, fine borders, directional shadows, subtle lighting and confident whitespace. One dominant visual effect per major section. Animation should support content, not compete with it.

## Pages to complete individually

1. Home: identity-first hero, verified Dither Veil fallback, concise accurate introduction, real-photo activity Bento, current featured/upcoming event, event discovery, curated photo story, published updates, About/Team entry points and meaningful contact/recruitment action.
2. About/History: concise JYC story, sourced timeline/milestones and relevant imagery.
3. Clubs/Hubs and all club details: functional search/filter/reset, category clarity, authentic logos/photos, useful descriptions, correct links and verified social/recruitment state.
4. Events, Fests and event details: date/status-first presentation, accurate upcoming/live/planned/past lifecycle, venue, audience, organiser, rules/resources/FAQ, registration deadline and approved URL, relevant gallery and related events. Past/closed/unverified registration must not look open.
5. Gallery and Archive: selected feature frames plus deterministic responsive grids, meaningful album discovery, appropriate focal points, no stretched/repeated filler, stable image dimensions and accessible viewing.
6. Lightbox: previous/next, arrow keys, Escape, touch navigation, visible count/caption, zoom/share where supported, focus trap/restore, shareable photo URL and robust fallback.
7. Team: accurate portraits/names/roles, readable front/back details, keyboard/touch equivalent flip, safe social links and neutral contained fallback when a real portrait is unavailable.
8. Achievements and Best of JYC: source-backed facts only; deep links to photos; no fabricated counters.
9. Recruitment/Join: truthful current status, official form URL, deadline and useful closed/not-configured feedback.
10. Announcements/JYC Now/Calendar: correct dates, working filters and links, route-aware history and useful empty/error states.
11. Contact: field validation, accessible focused errors, clear success/failure, safe verified contact routes.
12. Control Center: review separately for permission boundaries; do not expose it in the public redesign.

## Content and image policy

Inspect all public copy—headings, paragraphs, button labels, alt text, role labels, status pills, dates, forms, loading, empty and error states. Remove spelling errors, generic filler and contradictory labels. Verify facts from approved sources; if not verifiable, mark the state honestly instead of inventing. Audit important images for provenance, subject/event association, duplicates, focal point, aspect ratio, alt text, responsive variant, loading priority, decode errors and fallback. Logos must not be cropped as portrait substitutes. The authoritative manifest remains the photo source of truth.

## Interactions, accessibility and responsive behavior

Test real interactions, not just the presence of controls. Main/mobile navigation, search/filter/reset, club/event cards, registration, external links, gallery albums/lightbox, team flip, forms, calendar, theme and browser back/forward must work. Every route must open directly and survive refresh. Test keyboard, pointer and touch, visible focus, semantic labels, contrast, dialog Escape/outside dismissal/tab order/focus restoration, form error announcement and reduced motion. No critical information may depend on hover.

Capture and inspect at 320×740, 360×800, 390×844, 430×932, 768×1024, 1024×768, 1280×900, 1440×900 and 1920×1080. Test supported themes, reduced motion, keyboard-only use, slow network and media/backend errors. Check horizontal overflow, text wrapping, clipped content, fixed controls, layout shifts and mobile CTA visibility.

## Performance, security, SEO and QA

Maintain hero priority, lazy-load suitable below-fold media, reserve dimensions, use existing derivatives, and avoid perpetual offscreen animation. Measure LCP/INP/CLS against Core Web Vitals thresholds rather than claiming results. Inspect dependency/security findings, URL validation, target=_blank rel safety, input handling, secrets, admin boundaries, route titles/descriptions/canonicals/OG/sitemap/structured data and redirects.

Run Node 24 (package.json requires >=24 <25), npm ci, npm run build, npm run qa, npm run qa:browser, npm run qa:responsive, npm run qa:security, npm run qa:seo, npm run qa:photos, npm run qa:v64-editorial, npm run qa:photo-intelligence, npm run qa:performance and the Playwright visual route/interaction matrix. Record real exit codes. If a script is stale, prove the exact mismatch and repair either implementation or contract with a regression test; never remove a failing check merely to get green. Inspect CI artifacts/screenshots from the preview tied to the exact commit.

## Branch, PR and finish gate

Inspect open PRs and overlapping files before editing. Make logical commits in a feature branch, resolve conflicts by comparing semantics, keep the PR reviewable and never force-push/merge unrelated changes. Re-run relevant QA after each material fix. Work is not complete until every public route and primary journey has current visual/functional evidence, release tests pass, screenshots have been reviewed, and every remaining blocker is listed honestly.

## Final report

1. Main findings and highest-priority fixes.
2. Files/features changed and rationale.
3. Branch, commit, PR and exact preview links.
4. Table of tests run with real pass/fail/blocked status and logs.
5. Route-by-route visual/interaction checklist.
6. Verified remaining issues, blockers and required owner actions.
7. Never say complete where browser evidence or production verification is missing.