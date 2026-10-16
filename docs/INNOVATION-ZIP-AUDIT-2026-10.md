# Innovation JIIT ZIP Audit — source inventory and reuse guidance

## Scope and verification boundary
The uploaded `Innovationjiit.in-main.zip` is 326,270,015 bytes (~326 MB). The full uploaded binary could not be opened directly inside the isolated code sandbox. I cloned the corresponding public repository `https://github.com/Omtripathi007/Innovationjiit.in` as a source-equivalent review at shallow commit `41f1fbb` (`fixed google SEO picture shit (kartik->Mukuu)`). This lets us examine the active repository text/assets, but it does **not** prove that the ZIP bytes are identical to that commit. This audit does not claim literal byte-for-byte verification of the ZIP.

## Inventory
- 55 text/code files scanned: HTML, CSS, JS, Markdown, JSON and TXT; approximately 55,604 source lines.
- 451 tracked/worktree files in the clone, including 337 image files and other binary media/docs.
- Root `index.html`: 183,066 characters / 3,471 lines, 15 H1 matches, 39 H2, 79 H3, 127 anchor/button elements, and 81 image tags.
- The `innovation-2.0` implementation has 7 main page files (home/about/domains/events/gallery/projects/team, plus contact), an 8,330-line stylesheet, a 733-line JS file and 529-line team-showcase JS.
- The `ride-hack-2026` microsite has 6 HTML pages (home/events/contact/team/speakers/sponsors), a 1,432-line stylesheet and a 594-line animated-background module.
- `innovation hold` and `innovation-2.0` are near-identical duplicate site trees. Their home page, main CSS and main JS are byte-identical; team-related files differ slightly. Only one canonical implementation should be maintained.

## What JYC should adopt from Innovation
1. **Identity-first page opening:** clear purpose, large but well-composed headline and one primary + one secondary CTA. JYC’s left-side identity text and right-side Dither Veil logo concept is right; make logo fallback instant and effects progressive.
2. **Clear information architecture:** separate About/story, community/domain discovery, Events, Gallery/Archive, Team and Contact. JYC already has most of these destinations, so polish their page-specific presentation instead of porting a second architecture.
3. **Editorial photography:** use real event photos as the core visual material, create varied but stable feature frames, albums, captions and timeline moments. Every image in JYC must be selected from the existing manifest with verified association, focal point, provenance, alt text, responsive derivative and fallback. Do not import Innovation images or reuse a repeated stock/image placeholder to fill layouts.
4. **Narrative event detail:** story and organiser, date/venue/audience, accurate registration state and URL, event details/resources, results/photos, and related programmes. JYC’s event and archive routes should remain the source of truth, including past/upcoming separation.
5. **Distinct page art direction:** an Events page should read dates/status first; Gallery should feel photo-led; Team should foreground real faces/roles; About should tell a concise source-backed story. Avoid using the same generic card grid everywhere.
6. **Flagship microsite pattern:** the RIDE Hack sub-site shows a more intense campaign shell for its own programme/tracks, speaker/team and grants. Apply this only to an officially published active JYC flagship programme with verified assets and dates, not as a site-wide JYC theme.

## Confirmed quality issues found in the reference source
These are reference-source observations, not statements about JYC.
- Root `index.html` contains the misspelling **“Upcomming Events”** more than once, **“Prizes worth more than 25 Lacks !!”**, and the impossible date string **“AUGUST 25-25, 2026”** / day **“25-25”**. Do not copy these strings or assume listed event dates/registration URLs remain valid.
- Root homepage includes 3 “Content Creator” placeholders from `via.placeholder.com/180` and emails `neha@example.com`, `karan@example.com`, `sneha@example.com`. These are not publish-ready profiles.
- Root home has one image without `alt`, several duplicate IDs (`eventsPageRegisterBtn`, `eventsPageRideHackDetailBtn`, `webDevTeamCard`, `contentTeamCard`), 47 literal `href="#"` anchors and at least 14 external target links without `rel`.
- Root home contains 229 inline-style attributes and a large repeated/duplicated event surface. It uses Windows backslash asset paths and remote logo/image dependencies. Root CSS is 10,241 lines with many transform/animation/backdrop-filter rules but no `prefers-reduced-motion` query.
- The `innovation-2.0` homepage is better structured and its sampled main pages have no missing `alt` or duplicate IDs, but `main.css` is still 8,330 lines, has 28 media queries, 19 `!important` rules, only one focus selector match and a single reduced-motion block. Contact and team stylesheets have no explicit reduced-motion block. The README claims WCAG AA and “60 FPS”; a source scan alone does not substantiate full WCAG conformance or that frame rate.
- Team JS/data includes the placeholder copy **“Tagline or quote placeholder”**; test rendered carousel/profile content too, not only static HTML.
- The RIDE Hack microsite has over 140 inline styles on its largest HTML page and 139 `!important` declarations in its CSS. `speakers.html` has awkward placeholder headline copy **“SOME THING SPECIAL Coming Soon...”** and inactive/coming-soon content mixed into the event funnel.
- The root source mixes event records and page modules from 2025/2026 with different registration notices. Given the present date 16 October 2026, past dates should be archived, and any upcoming event or registration state needs fresh organiser verification rather than inference from the bundle.
- Root HTML references a Google thumbnail for the SIH logo; images are reused repeatedly across cards. This is a fragile dependency and visual repetition problem.

## shadcn/ui, Magic UI and Tremor adoption
### shadcn/ui — accessibility/composition patterns
Do not replace the React app. Evaluate targeted component adaptations only when current controls have a tested gap:
- `Dialog` / `Sheet` for accessible mobile navigation or contextual details;
- `Tabs` for Gallery/Event scopes, with clear URL/state and keyboard handling;
- `Command`, `Popover`, `Select`, `Checkbox` for search/filter only if they simplify the current implementation;
- `Accordion` for long event FAQs/details;
- `Skeleton`, `Alert`, `Toast` for loading/error/success states.
Before adopting, check installed dependency base (Radix vs Base UI), current React Router behavior, license/version provenance and package/bundle impact. Each dialog must handle Escape, tab sequence, focus restore, outside dismissal and touch. Don’t add a wholesale shadcn CLI/theme migration just for the appearance.

### Magic UI — restrained effects only
JYC already has Motion, GSAP, OGL-powered React Bits Dither Veil, Magic Bento, depth carousel and DriftWall. Do **not** add a second motion runtime. Reuse/adapt:
- Bento grid composition (keep current Magic Bento and improve the crop/rhythm rather than mounting a duplicate);
- low-cost blur/opacity entrance on a few section headings;
- one optional fine-pointer spotlight/edge treatment on one or two featured cards;
- static or slow low-motion grid/light pattern in one region only;
- marquee only for genuine logos/partners if it pauses, works by keyboard and is disabled/replaced for reduced motion.
Avoid global cursor replacement, continuous whole-site 3D, stacked shimmer/sparkle/particles, always-on animated backdrops and high-cost WebGL on mobile.

### Tremor — surface consistency, not dashboard UI
Tremor is oriented toward reusable information/data UI. Borrow its component discipline and compact hierarchy for verified achievements, event status pills, dates and small structured facts only when they improve comprehension. Do not add KPI dashboards, invented counts, chart panels or a new package to a photography-led campus community website.

## JYC-specific design decisions
- Preserve JYC’s own warm paper/ivory, deep ink, oxblood/red, restrained champagne/brass palette. Innovation’s dark purple/pink/cyan palette belongs to its identity.
- Typography: purposeful display headings, comfortable body text, small metadata only; use fluid `clamp()` sizes, readable line lengths and robust wrapping. Never shrink important copy just to fit a card.
- “3D” should primarily come from composed depth, perspective, lighting, real photographs, responsive card elevation and selective interaction—not perpetual movement. One dominant effect per section.
- Preserve existing routes, source-backed data, responsive media system, gallery lightbox and Team interactions if verified. Any photo/route change must use canonical existing records.
- Respect reduced motion, 320px screens, keyboard/focus, contrast, screen reader names and static Dither logo fallback. Content must remain available without WebGL.
- Do not import Innovation’s assets, code blobs, names, contact information, profiles, form destinations or event dates as JYC content.

## Implementation plan
1. Establish the route and component inventory and inspect the current CSS cascade before redesign; consolidate tokens carefully with before/after evidence rather than adding endless override files.
2. Resolve P0 route, content, registration-status and image/fallback defects first.
3. Polish hero → homepage activity/event/photo sections; then Gallery/Archive, Events/details, Clubs/details, Team, About, Calendar, Announcements/Updates, Recruitment/Join, Achievements/Best-of and Contact individually.
4. Use a single reusable design token source, common container/spacing/type scale, predictable button/card states, consistent borders/radii and shared interaction states.
5. Make every primary control work by pointer, touch and keyboard. Verify filters, query state, direct route refresh/back, lightbox navigation/Escape/focus return, registration windows, forms and error/empty states.
6. Run Node 24: `npm ci`, `npm run build`, `npm run qa`, `npm run qa:seo`, `npm run qa:photos`, `npm run qa:v64-editorial`, `npm run qa:photo-intelligence`, `npm run qa:performance`, browser smoke and route/viewport tests. Keep screenshot evidence for desktop/tablet/phone/narrow phone, light/dark (where supported), and reduced motion.
7. Review Core Web Vitals, dependency risk, public/admin access boundaries, URL safety, SEO/canonical/sitemap consistency and external link security.
8. Merge only after all required CI gates and the updated preview are inspected; do not declare completion on build alone.

## Limitation
This report scans all non-binary text/code files in the accessible public repository clone and inventories image/file counts and source-level issues. The attached 326 MB ZIP itself could not be byte-inspected directly because the binary mount is isolated from this sandbox; the report explicitly treats the public repository source as the closest available equivalent. It does not claim all live Innovation pages were manually browser-tested.
