# Innovation JIIT ZIP Audit — direct attachment inspection

**Audit date:** 16 October 2026  
**Input inspected:** Innovationjiit.in-main.zip (326,270,015 bytes)  
**JYC repository:** kaustubhdua/JYC-Website

## 1. Evidence and scope

The supplied ZIP was opened and integrity-tested. ZipFile.testzip() returned no corrupt member. It contains 300 archive entries; 264 extracted filesystem files; 39 text/code files among HTML/CSS/JS/Markdown totalling approximately 48,353 lines and 1.50 MB of source text; 202 image-file entries including duplicate trees; 6 DOCX files; and 2 PDFs. Images are grouped under assets/images with hero, events, teams, gallery, ridehack, climate, innovate2025 and miscellaneous subfolders.

The archive includes three overlapping site generations:
- Root legacy website: index.html (about 3,370 lines), 15 H1 tags, 63 image tags, 43 literal href="#" links and 228 inline style attributes.
- innovation-2.0: a modular multi-page site covering home, about, domains, events, gallery, projects, team and contact, with JavaScript and CSS modules.
- innovation hold: an older copy of nearly the same site tree.

Key files in innovation-2.0 and innovation hold are byte-identical for index, main CSS, main JavaScript, and sampled About, Events and Gallery pages. Their Team page and team JavaScript differ, so they are near-duplicate site generations rather than wholly identical. The shared main stylesheet is about 8,330 lines; the root legacy stylesheet is 10,241 lines and the root JavaScript about 1,760 lines.

This report is based directly on the supplied ZIP, not only its upstream public repository. Static source inspection does not prove every runtime interaction, accessibility criterion or performance claim. It also is not a claim that every image and document in the archive was individually reviewed by a human.

## 2. What to adapt from Innovation

1. **Purpose-first hero.** One clear JYC proposition, a strong headline, short supporting copy, one primary CTA and one secondary CTA. Preserve the requested composition: JYC text on the left and the official JYC logo with the existing Dither Veil on the right.
2. **Authentic-photo storytelling.** Lead with one strong photograph and support it with a smaller, intentionally composed set of images. Use only JYC's existing provenance-backed photo manifest in JYC; never transfer Innovation's people, logos, imagery or content.
3. **Page-specific structure.** The reference separates About, Domains, Events, Projects, Gallery, Team and Contact. JYC already has similar destinations, so improve each existing route and preserve the current routing/data model rather than importing a second architecture.
4. **Practical event details.** Place title, date, venue/audience, status, details and the correct official action where visitors can understand them quickly. Registration state and URLs must come from verified JYC records.
5. **Editorial collage discipline.** Use one dominant frame and supporting frames with intentional crops and stable dimensions. Avoid random scrapbook decoration, repeated-image filler, face cropping and text-on-image without adequate contrast.
6. **Event-specific campaign identity.** A flagship JYC event can earn a more immersive sub-brand only when an officially published programme, real assets, correct dates and verified action links exist. This is not a reason to replace JYC's year-round identity.
7. **Responsive and reusable styles.** Adapt the reference's use of CSS variables, grids, and page-specific modules as principles; do not copy its oversized legacy stylesheets.
8. **Progressive enhancement.** Important copy, navigation and the logo must remain available if WebGL, shader compilation, images, external APIs or animation fail. Motion must not gate content.

## 3. Confirmed issues in the supplied reference ZIP

These observations describe Innovation source files, not JYC defects.

### Root legacy index.html
- The misspelling “Upcomming Events” appears twice.
- “Prizes worth more than 25 Lacks !!” appears twice.
- The impossible date string “25-25” / “AUGUST 25-25, 2026” appears twice.
- Three profile images use via.placeholder.com/180 and sample profile emails include neha@example.com, karan@example.com and sneha@example.com.
- One image tag has no alt attribute.
- There are 43 literal href="#" references. Some may be placeholders handled by JavaScript, so they should be audited, not automatically labelled as broken.
- The root document contains 228 inline style attributes and a very large combined page, increasing maintenance and review burden.
- Event and team markup includes IDs that appear duplicated across repeated card/modal markup (including eventsPageRegisterBtn, eventsPageRideHackDetailBtn, webDevTeamCard and contentTeamCard); confirm via a DOM-aware duplicate-ID test before treating each case as a proven runtime defect.
- Registration Closed/success/Coming Soon states coexist with Register Now funnels in the legacy event experience. Do not copy any such state or link without fresh organiser verification.
- External target=_blank links do not consistently pair with safe rel attributes.
- Root CSS/JS are large monolithic files, and some assets are very large originals; responsive derivatives and deliberate loading priority are necessary.

### innovation-2.0 and innovation hold
- The modular multi-page implementation is the more useful architecture reference compared with the root legacy file.
- pages/events.html has an href="#" View Projects CTA.
- The Team page gets dynamic entries from team-showcase JavaScript, whose data includes the placeholder “Tagline or quote placeholder”. Static HTML inspection alone would miss it.
- Input placeholders such as you@example.com are form guidance, not verified contact information; distinguish these from actual profile emails.
- The main stylesheet is still roughly 8,330 lines. The duplicate hold tree should not be maintained as a second canonical implementation.
- README claims about WCAG AA and 60 FPS are not substantiated by source inspection alone. Require actual accessibility, runtime and performance tests.
- The archive includes HEIC/HEIF files and at least one image that the local image-inspection library could not decode. Ensure browser delivery has a supported derivative and a reliable fallback.

### Visual direction

The innovation-2.0 home uses a scrapbook collage language—tape-like photo edges, stickers, doodles and playful accents. This is a distinctive visual motif but is not automatically the premium 3D direction JYC should copy wholesale. Borrow the asymmetric photo composition, page-level hierarchy and real imagery; retain JYC's paper/ivory, deep ink, oxblood and champagne/brass identity. The legacy site's more saturated purple/pink/blue palette belongs to Innovation, not JYC.

## 4. How to use the UI libraries

### shadcn/ui — accessible primitives, selectively adapted
Use the official component patterns when the current JYC implementation has a verified gap:
- Dialog/Sheet for mobile navigation or contextual modals outside the already working gallery lightbox.
- Tabs for album/event sections when selected state, keyboard navigation and URL behavior are well-defined.
- Command/Popover/Select/Checkbox only if they simplify existing search and filters.
- Accordion for event FAQs and long detail sections.
- Skeleton, Alert and Toast for loading, empty, validation, failure and success states.
- Button/field patterns for consistent sizing, focus and error display.

Do not wholesale convert the React app, force a global theme reset, or migrate between Radix/Base UI primitives just because upstream patterns change. JYC already uses React 19, React Router 7, Motion, GSAP, OGL/React Bits Dither Veil, Magic Bento, DepthCarousel, DriftWall, and custom gallery/team experiences. Adapt one component at a time, check its source/license and dependency impact, and test keyboard, focus restoration, Escape, outside dismissal, touch and reduced-motion.

### Magic UI — restrained depth and motion
Reuse/adapt:
- Bento composition (polish the existing Magic Bento rather than adding a second grid system).
- Small blur/opacity entrances on selected section headings.
- An optional fine-pointer spotlight/edge treatment on one or two featured cards.
- One static or low-motion grid/light-field background in one region if it supports hierarchy.
- A meaningful partner-logo rail only when verified partner data exists; it must pause and respect keyboard/reduced-motion.

Do not add another animation runtime. Avoid global cursor replacements, perpetual animated backgrounds, stacked sparkles/shimmers/particles, whole-site WebGL, hover-only information and effects that compete with the JYC logo or event photos. Prefer transform/opacity motion and stop offscreen loops where practical.

### Tremor — information design, not dashboard aesthetics
Borrow consistency and compact hierarchy for factual metadata: event date/status chips, source-backed achievements and small verified statistics. JYC is a campus culture/community site, not an analytics dashboard. Do not add decorative charts, invented counts, dashboard grids or a new dependency for a badge a local component can already handle.

## 5. JYC-specific implementation decisions

### Design system
- Preserve warm ivory/paper, deep ink, oxblood/red for the primary action, restrained champagne/brass for secondary accents, and fine warm-neutral borders.
- Establish one canonical token source for colors, type roles, spacing, radii, content widths, surfaces, shadows, focus rings and motion durations.
- Inventory CSS imports and the effective cascade first. Remove conflicts carefully rather than appending an endless override stylesheet.
- Use the font families already configured only in defined display/body/metadata roles. Use fluid sizing, balanced headlines, comfortable line height and sensible line lengths. Never shrink important text to make a card fit.
- Give 3D depth through composition, layered planes, perspective, subtle directional shadows, lighting, photo crops and selective pointer interactions—not WebGL on every element.

### Homepage
- Left: a truthful JYC statement, concise copy, Explore Clubs and View Events.
- Right: official JYC logo plus existing Dither Veil, with an immediate static-logo fallback and tested dimensions at narrow mobile widths.
- Continue with a concise introduction; source-verified photo Bento; one accurate featured event; more event discovery; curated photo story; latest verified update; About/Team; and an appropriate recruitment/contact action.
- Never invent dates, event states, achievements or counts. Past/closed registration must not look open.

### Public pages
- About/History: concise accurate story, source-backed milestones and relevant photos.
- Clubs/Hubs and details: working search/filter/reset, clear categories, proper logos, source photo, useful descriptions, canonical routes and verified recruitment/social state.
- Events/Fests/details: date/status first, correct active/live/past grouping, approved registration URL, venue/eligibility/rules/FAQ/photos when available and no stale CTA.
- Gallery/Archive: featured editorial frames, varied deterministic responsive grid, album discovery, no repeated fillers or stretching, stable geometry, previous/next, Escape, arrows, touch/swipe, count, captions, focus trapping/restoration and safe fallback.
- Team: correct portraits/names/roles. Flip cards must be accessible to keyboard and touch, with no content exposed only on hover. Missing portrait should use a neutral contained placeholder, never crop a logo into a face.
- Achievements/Best of JYC: only verifiable records and sourced photographs.
- Recruitment/Join: truthful open/closed/not-configured state and known official destination.
- Announcements/JYC Now/Calendar: accurate dates and statuses, useful no-result states, deep links and browser history.
- Contact: validated inputs, clearly focused errors, success/failure state and verified contact methods.
- Control Center: separate administrative/security audit; do not include it in public styling or weaken access controls.

### Accessibility, reliability, performance and SEO
- Test pointer, touch and keyboard for primary journeys; show focus, label controls, make errors meaningful, manage dialog focus, support reduced motion and avoid hover-only content.
- Use WCAG 2.2 as the audit reference. Test 320px, 360px, 390px, 430px, 768px, 1024px, 1280px, 1440px and 1920px, plus supported themes, reduced motion, direct routes, refresh, back/forward, slow requests and network failures.
- Evaluate Core Web Vitals targets at the 75th percentile: LCP ≤2.5s, INP ≤200ms and CLS ≤0.1. Do not claim measured success without field/lab evidence.
- Prioritise the hero; lazy-load appropriate below-fold imagery; reserve dimensions; keep derivatives and the manifest authoritative; verify source, association, crop, alt text and actual visible decode.
- Check route titles/canonicals/OG/sitemap, safe external links, form validation, dependency risk, secrets/configuration, input/URL handling and public/admin separation.

## 6. Execution sequence and completion gate

1. Record the exact main SHA, open PRs, current statuses, route registry, stylesheet import graph/cascade, components, data models, media manifest, dependencies and QA coverage.
2. Use the supplied ZIP directly as a design reference; do not copy its assets, branding or content.
3. Fix P0 broken routes, stale dates/status/registration, image fallbacks and primary interactions.
4. Consolidate authoritative design tokens and readable typography.
5. Verify Dither Veil at every target viewport and under WebGL failure/reduced motion.
6. Improve the homepage and photo story, then Gallery/Archive, Events, Clubs, Team, About, Achievements, Recruitment, Updates, Calendar and Contact individually.
7. Reuse component-library patterns only for a demonstrated accessibility/interaction gap. Do not add overlapping motion frameworks.
8. Use Node 24 (package.json requires >=24 <25), npm ci, production build, full static QA, media/photo integrity, responsive, security, SEO, performance and Playwright/browser interactions.
9. Inspect actual preview screenshots across routes/viewports. Fix measured overflow, clipping, low contrast, wrong image/crop, stale content and nonfunctional controls.
10. Reconcile overlapping PRs and test the exact head commit. Never force-merge a conflict or treat a stale deployment as proof.
11. Report exact commit/PR/preview links, actual test exits, route status, remaining defects and infrastructure/credentials blockers honestly.

**Definition of complete:** every public route and critical action has a recorded visual and functional assessment, content/images/statuses are verified, release build and required checks pass, and the preview tied to the exact commit has been inspected. No claim of completion without evidence.