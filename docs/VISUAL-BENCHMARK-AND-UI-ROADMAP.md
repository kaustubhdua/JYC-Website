# JYC Visual Benchmark & Page-by-Page Upgrade Plan
Date: 2026-10-13

## Executive finding

The reference sites win attention for different reasons: they commit to one strong visual concept, make the primary action obvious, and let imagery/typography do much of the work. JYC's current source already has many premium ingredients—warm editorial styling, an asymmetric photo story, a Dither Veil logo hero, Magic Bento discovery cards, event listings, responsive image derivatives, a published-media policy, and separate route experiences. The gap is therefore not simply “add more animations.” It is consistency, information hierarchy, real content quality, page-level fit-and-finish, and avoiding the accumulation of competing design layers.

The best direction is to make JYC itself a signature year-round campus-culture product, not clone a one-off event website. Keep a warm ivory / ink / heritage red / muted gold editorial system for the core site. Let individual flagship fests earn more immersive, ownable visual sub-brands when the underlying event data supports them.

## What the reference sites get right

### JODC / FromRoots
Repository: https://github.com/8BitsLife/jodc-fromroots
- One brand-derived palette and a deliberate type system (display, body, mono); no random colour palette per component.
- A distinctive hero (“Build in the open”), animated verb, hand-drawn underline, and three plain-language value propositions.
- A shared atmospheric backdrop carries through sections, making the page feel continuous.
- The navbar changes from full header to compact glass capsule, and tracks scroll position.
- A custom WebGL effect only runs for fine pointers with motion allowed and suitable GPU; otherwise it renders a static version. This progressive enhancement is the right model for any effect-heavy hero.
- A functional product layer: Repo of the Week, submissions, Supabase RLS, fallback content, and automated GitHub metadata sync. The site is not only a visual landing page.
- Motion conventions are documented: meaningful, brief, transform/opacity only, reduced-motion support, 44px targets, visible focus and readable contrast.

### Dron-o-War / Dronotics
Repository: https://github.com/Mercy036/drone-wars
Live website: https://www.dronotics.in/
- Focused single-event art direction: deep space-black base, vivid orange/cyan/purple, a strong event title, a primary registration action and a compact set of factual details.
- Card art gets a high-contrast scrim so the text stays readable, while the cards make the events feel like distinct “arenas.”
- Journey is clear: what it is → competitions → prizes → team → location/contact.
- Strong visual energy is appropriate to a high-speed drone competition.
- Caution from the live content audit: the page still exposed past deadlines and “reveal by” content after the 2–3 May 2026 event date in crawlable page text. JYC must be better at automatically separating upcoming/live/past states and preventing stale CTA copy.

### OSDHack’26
Repository: https://github.com/osdc/osdhack26
- The site picks one memorable metaphor—the retro pizza arcade—and carries it through its CRT styling, Press Start type, pixel artwork, menu structure, custom cursor and cut-scene media.
- Its separate CSS modules map to parts of that experience, so the concept reads as a deliberately art-directed product instead of a generic hero plus repeated cards.
- It is a good model for fest-specific sub-sites, not the default look of the entire JYC portal.
- Caution: it preloads multiple videos and locks the page to a fixed viewport. Check mobile, keyboard-only access, load cost and reduced motion before borrowing any full-screen pattern.

### Innovation JIIT
Repository: https://github.com/Omtripathi007/Innovationjiit.in
Live website: https://www.innovationjiit.in/
- Broad but useful information architecture: About, Events, Gallery, Updates, Team and Contact, with track/event detail pages.
- Clear innovation pillars; dense event history; featured next event; action-oriented “Register Now / Know More” CTAs; visual activity feed; team and contact are all part of the product.
- It demonstrates the value of useful content depth rather than just an impressive first screen.
- Caution from the current page audit: the crawl exposed contradictory/stale registration modal copy for RIDE Hack’25 alongside a November 2026 RIDE Hack’26, plus spelling and date-range errors such as “Upcomming,” “Lacks,” and “25-25 AUG.” JYC should beat it on content governance, not copy its breadth at the cost of trust.

### CICR Connect
Repository: https://github.com/amancodes8/CICRCombined
- It is primarily a full operations platform, rather than a pure fest landing page. The transferable lesson is functional completeness: events, projects, meetings, members, community, inventory, learning resources, notifications, issues and admin are connected.
- Do not use it as a visual benchmark for a public fest homepage; use it for workflows, roles and maintainable product boundaries.

### Other live fest patterns reviewed
- Espektro 2026 (https://www.espektro.in/): strong fest identity and direct event/ticket flow, with a distinct identity that feels rooted in the host campus rather than generic SaaS.
- Panache 16 (https://www.vgupanache.com/): puts event schedule, day-by-day glimpse, concert, archives/memories, creators, rules, sponsors and the event’s scale in one discoverable story. This is good information architecture for a flagship fest.
- These are idea references, not a claim that every part of either site is perfect.

## Where JYC's current implementation is already strong

Based on source inspection of `src/jyc-editorial-home.jsx`, `src/jyc-editorial-home.css`, `src/jyc57-experience.jsx`, `src/jyc-responsive-photo.jsx` and related modules:
- Home hero has community-first positioning, Explore Events / Explore Clubs / Join JYC actions and the Dither Veil logo motif.
- There is an editorial three-photo campus story; discoverable community pillars; featured upcoming event with date/venue/status; latest updates; leadership spotlight; final CTA.
- Clubs have search, quick family filters, optional advanced filtering, photo-led cards and detail routes.
- Events have upcoming/live/past/all segmentation, category/search filters, a featured event, event timelines and detail routes.
- Gallery includes albums, category/media/year filters, query-linked lightbox state, keyboard arrows/Escape, focus management and paginated visibility.
- There is a source-backed photography/derivative pipeline and logo fallback; effects are lazy-loaded, and some motion responds to reduced-motion preferences.
- Many QA scripts and browser coverage are already present. Don't install yet more animation libraries to solve what is primarily art direction and content hierarchy.

## Key gaps and risks discovered in source review

1. **Layered styling has become hard to reason about.** The JYC home stylesheet begins with dark/cyber styling, then later overrides much of it with warm editorial styling. `src/styles/public-entry.css` also imports multiple global redesign layers. A stack of late overrides makes page-to-page drift and unintended regressions more likely.
2. **The app shell is heavily concentrated in `src/main.jsx`.** It contains route selection, large site/admin logic, metadata, navigation and multiple public experiences. At ~197 KB, the file is costly to safely review and change. Consolidate carefully by domain, with visual regression tests before moving code.
3. **Route completeness and truth need auditing, not merely better paint.** `/achievements` and `/best-of-jyc` currently redirect to `/about` in the route switch despite dedicated metadata and components existing. Either wire their existing pages in or remove/redirect intentionally with correct canonical metadata. The current source shows `JYCBestOf` is defined in `jyc57-experience.jsx`, but the page route appears not to use it. The same check is required for route links, sitemap, canonical tags and direct-entry shells.
4. **Content and action hierarchy can still feel diffuse.** The homepage has many modules, effects and calls to action. Establish a dominant primary action and a deliberate section sequence; reserve secondary links for scan-friendly navigation. Avoid a CTA on every card competing with the featured event.
5. **Visual vocabulary is inconsistent.** Home uses warm editorial tokens, while generic/public pages and older style layers can use different treatments. Unify page-width, headline scale, eyebrow patterns, card treatment, border/shadow system, image ratios and section spacing without making every page identical.
6. **Content models are mixed with visual metadata and heuristic labels.** Example: static hard-coded family taxonomy and 23-society copy coexist with data-driven records; verify all counts and labels from published records before showing them as facts.
7. **Past reference sites show why content governance matters.** Live reference pages surfaced stale dates/modals and spelling/date errors. JYC’s page state and registration labels must be derived from normalized dates and verified registration URLs; published content should not inherit demo/fallback records by accident.
8. **Photography should be a first-class art direction system.** The source pipeline is an asset. Need an asset-by-asset audit for subject fit, crop, duplicate ratio, focal point, resolution, broken URL, and club/event association. A logo fallback protects layout but should never make a failed main photo look like real photography.
9. **The product should clearly distinguish ongoing JYC and a flagship fest.** JYC is all-year community discovery; fests such as Dron-o-War and OSDHack can have more intense branded modes. Sitewide “Neon/Cyberpunk/Diwali/etc.” modes should not make the core editorial surface feel visually random.
10. **First-viewport polish requires actual viewport screenshots.** The current Vercel deployment is accessible through Vercel deployment status but the browser text-fetcher could not load the production alias. Do not declare the pixel-level audit complete until Playwright screenshots from desktop/tablet/mobile and visual inspection are reviewed.

## Page-by-page plan

| Route / experience | Make it world-class by |
|---|---|
| `/` | Keep editorial red/ivory identity, use only one hero focal point, show one real high-quality campus photo or tasteful photo-story teaser above the fold, make “Explore events” the primary CTA and “Find a club” secondary, show a small truthful “What’s on next” signal. Verify logo rendering on low-power/mobile and keep static fallback instant. |
| `/about` | Replace generic copy blocks with a visual narrative: JYC purpose, governance/relationships, real campus photos, what students can do, official JIIT source link. Distinguish established facts from editorial storytelling. |
| `/history` | Timeline by year, strong event photography, archival captions/source; allow filtering and direct links to gallery albums and event detail. |
| `/clubs` | Keep search and filters. Add visible active filter chips/reset, keyboard navigation, stable portrait crop; normalize categories from the published model. Avoid fake counts. Card hover should reveal useful identity, not only tilt/glow. |
| `/clubs/:slug` | Treat each club as a mini landing page: brand/photo, real about, people/social links, upcoming events, gallery album, recruitment state and clear contact/CTA. Provide useful empty states and fallback. |
| `/events` | Feature a real upcoming event if one exists, otherwise show an honest “No published upcoming events” editorial state plus upcoming archive. Group by date, show live/upcoming/past clearly, add date/venue/eligibility and accessible category filters. The current state tabs and timeline are good foundations. |
| `/events/:slug` | Put the poster/hero, title, registration state, date/time/venue, audience eligibility, prize/details, rulebook/FAQ, organizer and directions in an obvious order. Register button must be disabled or removed after deadline; show only a verified external URL. |
| `/fests` | Treat as special event gateway only when an official published fest exists. Give each fest its own theme package with documented tokens and assets. If no active fest, redirect intentionally and do not expose a stale CTA. |
| `/gallery` & `/gallery/:album` | A cinematic photo archive with varied but controlled editorial grid, clear albums/years/category filters, image count only from actual media, high-quality lightbox, shareable query URL, keyboard/focus restoration, and no logo placeholder presented as a photo. Add progressive loading, not an enormous first render. |
| `/best-of-jyc` | Connect existing `JYCBestOf` component rather than redirecting; editorial curated photo sets, only licensed/officially published media, strong captions and album links. |
| `/team` | Real portrait cards with name/role hierarchy and accessible flip interaction only if it adds useful content; keep a visible equivalent to the reverse side for keyboard/touch users. Social links must be verified; no empty or invented bios. |
| `/achievements` | Either wire existing achievement UI or intentionally consolidate with About; as it is currently redirected while metadata implies a unique page, reconcile route implementation, sitemap and canonical metadata. |
| `/announcements` & `/updates` | Separate official notices/actions from editorial news. Make update cards attributable with publish date/source and clear CTA; show source unavailable/empty states truthfully. |
| `/recruitment` & `/join-jyc` | One clear recruitment funnel: currently open opportunities, eligibility, deadline, required steps, application link and FAQ. When closed, provide the next verified cycle/status rather than generic “coming soon” if official information is available. |
| `/calendar` | Filter date/category, add ICS export, use current time zone, distinguish upcoming/past, and support direct event details. Verify export on mobile calendar clients. |
| `/archive` | Searchable historical events + photos with year selector, connect to actual photo albums and event pages; no fabricated dates or unknown event count. |
| `/contact` | Official contact/socials, campus location link, accessible query form, success/failure state and anti-spam/security checks. |
| Global nav, search, footer, mobile tab bar | Single design system; obvious active route; keyboard-operable menus; escape closes; focus returns; 44px minimum touch targets; safe-area-aware bottom navigation; page content not obscured by fixed controls; distinct external-link affordance and robust direct route entry. |

## Priority roadmap

### P0 — trust and broken route consistency
- Fix `/achievements` and `/best-of-jyc` routing mismatch; verify their metadata, canonical URLs, sitemap and deep links.
- Reconcile production content state (upcoming/live/past) and all registration CTAs across homepage, event directory, event detail, fests, calendar and updates.
- Run media audit for every page and every hero/card image: URL status, decode success, dimensions, subject, duplicates, alt/caption, association and fallback.
- Capture and review Playwright screenshot evidence at 1440×900, 1024×768, 768×1024, 390×844, 360×800; all route first view, key interaction state, light/dark and reduced motion. Screenshot every core route; use diffs to make actual visual improvements.

### P1 — coherent signature design
- Consolidate current final CSS layers into documented tokens/components while preserving behavior; do this by page with before/after screenshots, not global regex replacements.
- Apply an editorial grid: common container widths, responsive gutters, type scale, 8px spacing rhythm, hairline borders, restrained elevation, one red action colour and muted gold detail. No gradients/text effects that harm contrast.
- Redesign each route header to match its task (browse, detail, archive, conversion) rather than reusing the same giant card pattern.
- Improve nav transitions and hover/focus states only where they aid feedback. Keep WebGL/dither, 3D and tilt as optional progressive enhancements with static fallbacks.
- Ensure real first-party media dominates; pre-generate AVIF/WebP derivatives; avoid autoplay video unless it is the core event brand.

### P2 — information architecture and engagement
- Refactor `main.jsx` into route/domain modules, starting with low-coupling page components and route definitions, guarded by tests.
- Connect `JYCBestOf` and any missing unique public routes; eliminate dead route links.
- Make club pages connect events, albums, recruitment and social links.
- Improve “this week at JIIT” discovery (event calendar plus date/status filters) from published content only.
- Add empty/error/loading states that maintain layout and tell users what to do next.

### P3 — fest-specific spectacle
- Create an optional brand shell for each active flagship fest: own poster/art direction/type/palette/micro-animation; do not force one animation metaphor onto JYC as a whole.
- Inspired by OSDHack: thematic navigation; by Dron-o-War: track cards and prize details; by Panache: daily schedule/archive/lineup; by Espektro: campus-specific identity and clear ticket/event paths.
- Every thematic mode must pass mobile/reduced-motion/low-power/accessibility budgets before launch.

## Release acceptance gates

A page is not “done” because build passed. It should pass:
- route direct-entry and in-app navigation;
- no console exceptions or failed first-party assets;
- page-specific content and metadata match route purpose;
- interactions work with mouse, touch and keyboard;
- visible focus, screen-reader labels and contrast reviewed;
- reduced-motion mode avoids decorative loops;
- 360px width and 200% zoom don’t create overflow/covered CTAs;
- performance budget meets CI (including media weight and layout shifts);
- content dates, registration state, counts, and team/social details are source-backed;
- screenshot evidence checked against the intended design at phone/tablet/desktop sizes.

## References
- https://github.com/8BitsLife/jodc-fromroots
- https://github.com/Mercy036/drone-wars
- https://www.dronotics.in/
- https://github.com/amancodes8/CICRCombined
- https://github.com/osdc/osdhack26
- https://github.com/Omtripathi007/Innovationjiit.in
- https://www.innovationjiit.in/
- https://www.espektro.in/
- https://www.vgupanache.com/
- https://github.com/kaustubhdua/JYC-Website

## Follow-up execution brief — route QA and design-library integration (2026-10-16)

This supplement turns the benchmark into a model-executable plan. It is intentionally source-first: do not guess event facts, club details, routes, image IDs, or registrations, and do not do a big-bang UI rewrite.

### Current implementation evidence checked during follow-up

- The public app is React 19 + Vite 8 + React Router 7. The lockfile's runtime constraint is Node `>=24 <25`; use Node 24 for release validation, not Node 22.
- Existing first-party visual stack includes the JYC editorial homepage, React Bits-derived Dither Veil using OGL/WebGL, Magic Bento, Motion, GSAP, responsive image delivery and a custom gallery lightbox/team-card experience. Avoid duplicating those responsibilities with new libraries.
- The site already has 34 canonical static QA contracts via `npm run qa`, route-shell generation, sitemap generation, image derivatives, Playwright visual route matrix, security/SEO checks and media integrity checks.
- Existing route QA documents a possible functional discrepancy: `/achievements` and `/best-of-jyc` may redirect to About even though dedicated components/metadata exist. Confirm current routing in `src/main.jsx`; wire dedicated pages only if still present and appropriate, otherwise intentionally remove stale links/metadata/sitemap entries.
- Existing public CSS includes `src/styles/public-entry.css`, `src/styles/jyc-experience-system.css`, `src/styles/v20-reference-restoration.css` and editorial-home motion/page styles. The recent innovation styling branch adds another 137-line global layer. Do not stack new overrides blindly; consolidate after inspecting effective styles and screenshot evidence.
- Source manifests report hundreds of images with several thousand derivative entries, so the job is visual review of actual selected assets and crop behaviour, not simply regenerating another manifest.
- Existing PR #252 is an Innovation-inspired CSS polish and has a ready preview URL, but a fresh build plus browser checks must validate the current head. Other open PRs touch overlapping public styles and screenshots. Inspect current PR/head/base state and avoid merges on unverified or conflicting stacks.

### Reference-library adoption map

#### Tremor — selective reuse, no dashboard graft
Use its component-design discipline for numeric facts only where there is a verified source: small achievement/statistic treatments, structured event metadata, status badges and information hierarchy. Public JYC is an editorial student-club experience, not an analytics dashboard; do not add chart dashboards, KPI grids or heavy dependencies for decorative metrics. First check actual installed packages, lockfile, and relevant component API. If a small accessible badge/stat primitive already exists in local components, prefer it.

#### shadcn/ui — copy/adapt individual components, no wholesale migration
Use the repository as a source for accessible composition patterns and copy only needed component implementations after checking local framework, CSS conventions, keyboard behaviour and license. Highest-value candidates: Dialog/Sheet for mobile navigation or accessible modal, Tabs for gallery/event segmentation, Command/Popover for search and filters, Select/Checkbox for filters, Accordion for event details, Skeleton for stable loading and Alert/Toast for status feedback. Preserve existing React Router, current page logic, app shell and working lightbox. Do not run a global initialization or change Radix/Base UI primitives just because shadcn's defaults changed. If adapting a component, record source/version/license and test keyboard, focus restoration, Escape/outside dismissal, touch, reduced motion and error states.

#### Magic UI — the visual-motion reference, selectively adapted
High-fit elements:
1. `bento-grid` layout principles for the homepage's activity/club discovery (reuse existing Magic Bento first; improve art direction and layout rather than mounting a duplicate).
2. `blur-fade` / modest text entrance for a few major section headings only.
3. `magic-card` / spotlight edge as a restrained pointer-only enhancement on one or two featured cards, only if it works without pointer and has no mobile overhead.
4. `animated-grid-pattern` or `warp-background` as a static/low-motion background treatment in one area only; do not put continuous canvas effects behind every page.
5. `marquee` only for a short, meaningful partner/hub rail and only if pause/keyboard/reduced-motion behaviours are sound.
6. Use `globe`, heavy particles, continuous WebGL, cursor replacement and stacked shimmer effects only if a real content need and measured performance budget justify them.
The current app already uses Motion, GSAP, OGL and React Bits, so implement lightweight CSS/Motion versions when possible rather than adding Framer Motion/duplicate animation runtimes.

### UX design blueprint

- Keep the JYC ownable warm editorial palette: warm ivory/paper, deep ink, restrained oxblood, champagne/brass. One brand action colour; muted accents for decoration only.
- Display type: current Space Grotesk (only if confirmed in current source) for purposeful large headlines; readable sans body for paragraphs; monospace metadata sparingly. Use responsive `clamp()`, comfortable line-height and measured line lengths; do not shrink text to fit cards.
- Strong page art direction:
  - Home: left-side JYC proposition and actions, right official JYC logo with Dither Veil, one real photographic story/featured-event image, activity Bento, truthful next-up event, latest updates, team/about and final CTA.
  - Clubs: search, active-filter chips and reset, meaningful club cards, canonical detail links, verified identity/logo, real photo, recruitment/social status.
  - Event directory/detail: date/status-first cards, active/upcoming/past groups, verified official registration window and URL, poster/venue/eligibility/rulebook/FAQ/source, no stale register action.
  - Gallery/archive: editorial featured images + varied but deterministic grid, genuine album metadata, responsive derivatives, shareable lightbox state, keyboard/touch navigation, Escape, focus restoration, visible fallbacks.
  - Team: accurate portraits and names/roles; flipping is optional and must have a keyboard/touch equivalent, with no content hidden exclusively on hover.
  - About/history: a single JYC story, official source attribution, real milestones and timeline.
  - Contact/recruitment/calendar/updates/achievements/best-of: page-specific hierarchy, useful states, verified links and route metadata consistent with the actual output.
  - Admin/control center: review separately; do not include in public visual redesign or weaken access controls.
- Motion: one dominant effect per section. Prefer transform/opacity, no content gates, no layout-shifting, pause out-of-view loops, reduced-motion equivalent and static logo/image fallbacks. Dither Veil must not stop the brand logo from appearing if WebGL, image load or shader compilation fails.
- Photographs: use only genuine approved JYC assets; no stock replacement, no repeating an image to fill a layout, no logo disguised as a photo, no guessed association. Every hero/album/team image must be checked for identity, subject, crop, aspect ratio, alt text, responsive size, provenance and fallback.

### Route and viewport release matrix

Use the maintained actual route registry and Playwright suites as the source of truth rather than a hand-maintained list that drifts. At minimum capture public routes at 1440×900, 1280×900, 1024×768, 768×1024, 430×932, 390×844, 360×800 and 320×740. Include light/dark where supported and reduced-motion state. For each route, verify:
- correct H1/title/canonical/description/OG metadata;
- route survives direct open, refresh, back and forward navigation;
- no uncaught exception, broken first-party image, overflow, clipped text or obscured CTA;
- images have alt text and reserved dimensions; event/date/status/link is source-accurate;
- every button/filter/search/dialog/form/link works with keyboard, pointer and touch;
- useful loading/empty/error state;
- screenshot inspected against an intentional page-specific design;
- no public/admin boundary leakage.

### Required execution sequence and definitions of done

1. Record the current main SHA, open PRs, CI state and latest tested production deployment. Do not treat a stale green deployment as proof for a new branch.
2. Audit source, current route registry, imports/cascade, dependencies, package engine, image manifest, content/status models and QA coverage. Resolve existing route/metadata mismatch before broad styling.
3. Establish design tokens in one authoritative file and document which existing CSS layers are obsolete. Remove duplicate/conflicting styling only in safe, test-backed changes.
4. Fix P0 routes, image fallbacks, registration/event status and broken interactions.
5. Polish the identity hero and design-system primitives, then the homepage, gallery, events, clubs and team, then remaining public pages.
6. Add accessible component primitives only where existing components have a tested gap. No unrequested framework migration and no duplicate animation library.
7. Run with Node 24: `npm ci`, `npm run build`, `npm run qa`, `npm run qa:browser`, `npm run qa:responsive`, `npm run qa:security`, `npm run qa:seo`, `npm run qa:photos`, `npm run qa:v64-editorial`, `npm run qa:photo-intelligence`, `npm run qa:performance`, and Playwright route/viewport checks. Do not report any test pass unless its actual exit code is zero.
8. Review generated route shells/sitemap and built media, run dependency audit and inspect high-risk authorization/URL handling without mutating production Supabase or secrets.
9. Inspect screenshots of real changed pages. Fix every observed contrast, spacing, crop, layout, and interaction defect. Capture final evidence.
10. Keep changes in logical branches/commits and resolve overlapping PRs based on head/base ancestry. Do not force merge a conflicting or unvalidated PR. Require green CI/browser/security/SEO and a ready preview. Preview quota or runner outages must be documented as infrastructure blockers, not misreported as product passes.
11. Final completion report must contain exact commit/PR/deployment links, actual test results, known limitations, and a route-by-route checklist. Do not call the website complete while any public route or critical interaction is unreviewed.

### Critical engineering note
A CSS-only finish is not the full redesign, and a production build is not equivalent to browser QA. The target is a coherent, intentional, maintainable visual system across all public routes, built on verified JYC content and tested interactions.
