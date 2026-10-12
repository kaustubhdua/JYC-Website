# V64 — JYC Editorial System Research & Next Plan

Date: 2026-10-10

## What changed in the latest pass

- Reworked the hero media delivery to generate an AVIF derivative from the actual JYC logo for the Dither Veil input and initial loading screen. The existing WebP and original PNG remain fallback paths.
- Fixed the responsive photo fallback chain so a failed optimized JYC logo can no longer cause the original PNG fallback to be skipped. Context-specific club/event marks remain first-choice fallbacks where supplied; the component now exhausts unique candidates, clears failed picture source sets, preserves useful alternative text and hides only after all fallbacks fail.
- Moved archive-story images, the hub directory preview, album hero and collection covers onto ResponsivePhoto with intrinsic-dimension hints and responsive sizes. Approved archive images can now use the existing AVIF/WebP derivative manifest instead of always requesting the original.
- Fixed the homepage static shell: the route-shell generator now includes `/`, inserts canonical and Open Graph URLs even when the base HTML has no placeholders, replaces the generic/loading H1 with the route title, and keeps one primary heading. Added a no-JavaScript browser regression for the homepage as well as inner routes.
- Added browser regression coverage for a failed team portrait plus failed optimized-logo request, AVIF logo decoding, and light/dark Search and More surfaces with a 4.5:1 contrast assertion.
- Added responsive frame geometry checks so the new picture wrappers preserve the existing editorial collage, hub preview and album-cover crops.
- Re-checked public club sources and campus attribution. RPH’s official public profile is now gated to JIIT-128 using the profile and its Wish Town Campus event evidence. Unconfirmed similarly named profiles remain review-only.
- Targeted manual source checks currently pass, but the full build/browser suite is not confirmed because GitHub Actions jobs fail before exposing any steps/logs and the latest Vercel preview is older than the branch head.

## Research basis

### Official JIIT-128 community references

- **CICR** is a useful organisation-first pattern: clear identity, learning/research capability, projects, community, upcoming events, past events and contact. Its official site currently lists TechTonic 2.0 as a hands-on AI/ML and robotics workshop with the date still TBA. Do not invent a date.
- **Innovation JIIT** is a useful organisation → activities → upcoming events → archive → flagship-experience pattern. Its official site currently promotes RIDE Hack'26 for **1 November 2026** and describes startup incubation, prototyping/fabrication, mentorship and innovation programmes. The event has external source evidence, but it must remain in the editorial review workflow until the JYC owner confirms publication ownership/relationship.
- **RPH** public LinkedIn records Code Clash 25.2 as an archived event (22 November 2025) and a separate post describes Freshmen Clash at JIIT Wish Town Campus. Keep old contest details clearly archived; do not present them as current registration.
- **OSDC is not interchangeable with JODC.** OSDC’s public site/LinkedIn describes a community based around JIIT and its LinkedIn location reports Sector 62. Do not import its account, history or event identity into the JIIT-128 JYC directory. JODC has its own current identity and explicit JIIT-128 attribution.

Sources checked:
- Innovation JIIT: https://www.innovationjiit.in/
- Innovation JIIT LinkedIn: https://in.linkedin.com/company/innovation-jiit
- CICR: https://www.cicr.in/
- CICR official GitHub organisation: https://github.com/CICR-The-Robotics-Hub-of-JIIT-128
- JODC LinkedIn: https://in.linkedin.com/company/jodc
- OSDC public site: https://osdc.netlify.app/
- OSDC LinkedIn: https://in.linkedin.com/company/os-dc
- RPH LinkedIn: https://www.linkedin.com/company/rapid-programming-hub-jiit-noida/

### Fest and interaction references

- Concetto demonstrates a date-based timeline where selecting a day reveals that day's programme; use this only for genuinely multi-day JYC events.
- Thomso demonstrates a large event directory grouped by category/day with concise participation metadata and a dedicated FAQ.
- Sangram demonstrates live-state hierarchy (countdown/results, categories, archive, people and sponsors). JYC should use a live state only when an organiser source supports it.
- Motion provides layout/shared-element transitions suited to event-card → detail and gallery-card → lightbox. Those transitions are already present; keep keyboard focus, deep links, swipe/zoom and reduced-motion behaviour intact.
- Radix-style primitives are useful when a new dialog, accordion or tabs control needs stronger keyboard semantics.
- Embla is a good option for future lightweight photo rails, but do not add another carousel library when the current gallery rail already solves the need.
- React Bits and Aceternity are component-pattern sources only. JYC should use the Dither Veil and magnetic Bento selectively rather than adding several competing background effects.

## Prioritised next actions

### P0 — release blockers (do before calling the site finished)
1. **Get a real green run on the exact branch head.** GitHub Actions currently fails before any steps/logs appear. Confirm runner/Actions availability first, then run `npm ci`, `npm run qa`, `npm run qa:photos`, `npm run qa:v64-editorial`, `npm run build` and `npm run qa:browser`.
2. **Obtain a fresh READY Vercel preview.** The latest available preview predates the AVIF and latest responsive-media changes; the deployment API returned the free daily deployment limit (HTTP 402). After the quota clears, inspect the generated AVIF/WebP sizes, the actual loaded source and console/network errors.
3. **Verify production domain ownership/routing.** Both custom domains previously reported unverified and the domain content did not match the JYC repository. Do not alter DNS until the authorised owner confirms the intended Vercel project and DNS records.
4. **Complete a visual matrix** at 320, 360, 390, 768, 1024, 1280 and 1440+ px in both themes, including reduced motion, keyboard-only, 200% zoom and slow network. Browser tests are necessary; source assertions alone are insufficient.

### P1 — media, accessibility and performance
1. Measure LCP, CLS, INP and total transferred image bytes on a fresh preview with a cold cache. Compare AVIF vs WebP sizes instead of assuming the new AVIF is smaller.
2. Confirm every visible photo decodes, every alt describes the image (or is intentionally empty for decorative media), every fallback is source-safe, and no derivative exceeds its source dimensions. Audit broken/redirected URLs and duplicate hashes again after the final media generation.
3. Review CMS gallery publication rights, attribution, crop/focal point and consent before promoting additional source-archive photos. Keep raw presentation exports, logos and decorative graphics out of photo-only surfaces.
4. Run a real colour-contrast audit for text, badges, links, form controls and disabled states in light/dark themes. The new Search/More browser contract is a useful guard, not a complete site-wide audit.
5. Check mobile GPU/memory/thermal cost for Dither Veil and MagicBento. Preserve the static logo fallback on coarse pointers and reduced-motion settings; do not add a continuously animated full-page image wall.

### P2 — product and editorial improvements
1. Confirm all 23 hub profiles against current official sources. Add a social link only when its campus identity is verified; otherwise keep it review-only. Recheck event date, venue, registration status and canonical URL whenever the organiser updates its page.
2. Add event timelines only to multi-day events with confirmed schedules. Add FAQ, results, sponsors and live-state sections only when the event actually has that content.
3. Improve team profiles only from authorised/public biographies and verified LinkedIn URLs. Do not infer current role, employer, headline or biography from a similarly named person.
4. Keep club/event identity differences within the JYC palette: unique accent, motif, photo/poster and typography hierarchy—not a separate design system for every card.
5. Consolidate CSS only after a visual-regression baseline exists. Historical stylesheets may contain compatibility rules; remove them only when browser snapshots and route coverage prove they are unused.
6. Keep GitHub release hygiene: meaningful PR summary, honest status badges, locked dependencies, documented rollback and a tested backup/restore path.

## Animation placement rules

- **Hero:** Dither Veil only around the official logo, with a static logo fallback. Do not animate the entire hero background.
- **Activity/club bento:** low-amplitude magnetic tilt on capable desktop pointers; reset transforms on leave and disable on coarse pointers/reduced motion.
- **Event cards:** shared image transition into detail; no tilt on every nested control.
- **Gallery:** shared-element card → lightbox transition, keyboard arrows, swipe and zoom; no autoplay.
- **Team:** click/tap flip with focus moved to the active face. Avoid hover-only reveal and preserve touch/keyboard parity.
- **Search/More:** fade/translate modestly, preserve focus trapping/return and theme contrast. Never animate layout in a way that shifts the page underneath an open dialog.
- **Loading screen:** quick fade-out after app readiness, reduced-motion safe; never make the loader wait for below-the-fold media.

## Definition of done

The branch is not production-ready until the exact head has a successful dependency install, full QA, production build and Playwright run; a fresh preview has been visually checked across the matrix; generated media size/decoding is confirmed; official event/profile content has been reviewed; and production-domain routing is verified.

## Follow-up homepage and competitor audit — 2026-10-13

### Confirmed source-level issues on the current main branch

- The homepage hero uses a generic cyber slogan ("THE VOICE. THE TALENT. THE SPIRIT OF JIIT.") rather than explaining what JYC helps a student discover or do.
- The homepage hard-codes a November 15, 2026 countdown for Converge/Dron-O-War, plus 23+, 50+, 5,000+ and 15+ counters. These claims need verified source records and ownership before publication; otherwise they should not appear as live facts.
- The homepage uses cyan rim lighting and a cyber/ambient decoration system that conflicts with the documented restrained cream / ink / red / gold editorial direction.
- A source-level homepage QA contract has been added on the follow-up branch to guard against reintroducing unverified countdowns/counters and generic ambient cyber decoration. It is not a substitute for browser QA or owner review.

### Competitor/reference synthesis

- **Innovation JIIT** is strongest as a journey model: purpose → capabilities → activities → upcoming event → archive → team → contact. Its event cards expose participation details and distinguish completed events. Use this clarity, but avoid copying its copy, layout, or branding. Source: https://www.innovationjiit.in/
- **Official JIIT Hub directory** is a reference for breadth and campus context, but it is an institutional directory, not the visual bar JYC should aim for. Source: https://www.jiit.ac.in/existing-student/life-%40-jiit/jiit-hub
- **CICR** is a useful specialist-community reference for showing what a hub does and connecting its purpose to projects, workshops, events and people. Source: https://www.cicr.in/
- Fest sites such as Concetto, Thomso and Sangram can inspire event discovery, timelines, result states and archive navigation. Use date selectors only for confirmed multi-day programmes, and never publish a countdown, prize, sponsor, or registration claim without an organiser-backed source.

### Recommended design bar for JYC

1. **A recognizable editorial identity.** Use warm paper, ink, JYC red and restrained champagne accents. Avoid neon-cyan glows, generic cyber grids, glass panels and unrelated background effects.
2. **A useful headline, not a slogan stack.** Lead with a human benefit (e.g. “Find your people. Make your mark.”), then explain JYC in one concrete sentence. Keep one H1 per route, one clear primary action and a secondary discovery action.
3. **Real photography as the main visual asset.** The hero should combine the official logo treatment with a small, curated selection of source-backed JYC photos. Prioritise faces, performance, making/building, crowds and moments with clear subject focus. Use posters as event identity, not as substitutes for documentary photography.
4. **Editorial image sequencing.** Give each photo a context: event/club, year, caption, photographer/credit and meaningful alt text. Use varied but deliberate crops, focal points, consistent radius and restrained borders. Do not place unrelated images in one carousel merely to increase visual density.
5. **Better hub pages.** Each hub needs a short plain-language purpose statement, 2–4 real activity examples, a small photo set, upcoming/past events when verified, leadership only when current and sourced, and one clear “Explore / Join” path.
6. **Better event pages.** Surface date, venue, organiser, eligibility and registration state immediately. Keep upcoming, registration-closed, completed and archived states visibly distinct. Add timeline, FAQs, results and sponsors only when the organiser source supports them.
7. **Motion with hierarchy.** Keep Dither Veil scoped to the official logo; use small hover lift on cards; use shared-element transitions for event and photo detail; retain keyboard/touch parity on team flips and gallery controls; disable costly motion on coarse pointers and reduced-motion settings.
8. **Content governance.** Keep counts, event dates, prizes, deadlines, team roles and social links source-backed. Unknown data should be omitted or marked as unavailable—not filled with invented copy.

### Copy direction examples

- Homepage H1: **Find your people. Make your mark.**
- Homepage lead: **From ideas taking shape in a workshop to the lights coming up on stage, JYC brings together the clubs, events and people that make campus life matter.**
- Clubs section: **A place for what you love—and what you haven't tried yet.**
- Events section: **What's happening at JYC.** Use a clear date and participation state on each card.
- Gallery section: **Campus life, as it happened.** Include caption, event, year and photo credit wherever available.
- Team section: **The people who bring it all together.** Publish current positions and biographies only when verified.

These are editorial directions, not a claim that every route has already been rewritten or visually verified.
