# Changelog

## V64.0.0 — Editorial interaction, media delivery & release hardening

- Added restrained shared-element transitions for event cards → event details and gallery cards → lightbox, with reduced-motion fallbacks.
- Added the multi-day event timeline and editorial navigation layer.
- Added route-specific metadata shells for major public routes.
- Added the real Sharp-based AVIF/WebP responsive-photo derivative pipeline and wired it into production builds.
- Added dependency-lock, photo-intelligence and V64 release contracts to the quality gate.
- Synchronized package, lockfile, README, service-worker cache and public discovery metadata to V64.
- Kept the Sector 128 publication boundary, canonical JAI route and media rights/editorial gates intact.

## V58.0.8 — Media audit

- Added duplicate public-URL detection to the media-health workspace so archive collisions are visible to editors.
- Added the Best of JYC editorial photo selection route using the curated source-photography ranking.


## V58.0.7 — Verification cleanup

- Removed seven stale/duplicate verification rows after canonical club and JAI event identity cleanup; current published club verification is now one-to-one.
- Kept unresolved event/gallery records in review instead of auto-verifying them without an authenticated JYC verifier.


## V58.0.6 — Media health

- Added a Control Center media-health workspace covering photo metadata, rights, provenance, stale verification, album readiness and missing relationships.
- Added explicit album narratives, hero media and related-album discovery to published archive routes.


## V58.0.5 — Security hardening

- Hardened the internal album-publication trigger so it is not exposed as a callable PostgREST RPC.
- Kept album publication gated by approved media, rights clearance and provenance review.


## V58.0.4 — Album Guard Security Hardening

- Revoked direct `EXECUTE` privileges from the album publication SECURITY DEFINER trigger function for `public`, `anon` and `authenticated` roles.
- Kept album publication enforcement trigger-only while preserving the database-side rights/provenance gate.
- Rotated the service-worker cache and aligned package, lockfile and release QA to V58.0.4.

## V58.0.3 — Album publication guard

- Public album publication now requires linked approved photographs with cleared rights and resolved provenance where verification records exist.


## V58.0.2 — Institutional Media Governance

- Added photographer, rights, license, review and explicit album relationships to the normalized media model.
- Seeded 23 club and 8 published-event album shells as unpublished editorial drafts, without bypassing trust/publication gates.
- Added safe `Courtesy of JYC Archive` attribution where no individual credit exists.
- Added verified JIIT-128 community links for Cinekala, CypherX, Zencoders, Neural Nexus and VamUnique.
- Added canonical legacy JAI redirect coverage and expanded gallery/JAI browser QA contracts.


## V58.0.1 — Accessibility, Event Modal & Archive Polish

- Hardened the featured JAI 2026 announcement into an accessible, keyboard-trapped, scroll-safe modal with proper focus restoration and mobile behavior.
- Canonicalized the JAI 2026 event route and kept registration, official-site and Discord actions connected.
- Added verified Cinekala official LinkedIn sourcing for the JIIT-128 club directory metadata.
- Rotated the service-worker cache and aligned the package, lockfile and release guard to V58.0.1.
- Added the featured-event checks to the main static QA suite.

## V57.0.0 — Security and release hardening

- Ran the live Supabase security/performance advisors and removed seven exact duplicate RLS policies; remaining warnings are documented for intentional security-definer RPCs, auth settings and traffic-dependent index review.
- Expanded Dependabot coverage to npm and GitHub Actions with weekly grouped updates.
- Added a pull-request dependency-review gate for high-severity dependency changes and prohibited GPL-3.0/AGPL-3.0 dependencies.
- Modernized CodeQL to v4 and added JavaScript/TypeScript plus GitHub Actions analysis.
- Strengthened the repository security policy and release roadmap.
- Added external URL validation to JYC Now and server-side remote update ingestion, including private-network/metadata endpoint blocking.
- Added QA contracts for the new URL-safety boundaries.

## V57.0.0 — Release verification hardening

- Added a production browser-QA GitHub Actions gate using the built Vite artifact and Playwright/Chromium.
- Expanded responsive browser checks across 320–1920px target widths.
- Added a keyboard global-search smoke test.
- Made the static release gate run the complete repository QA suite on pushes and pull requests.
- Aligned the PWA cache identifier with the package release version.
- Fixed the release CI cache-version comparison for dotted package versions.
- Allowed the declared Google Fonts resources through the production Content Security Policy.

## V35.1.0 — Production hardening & discovery polish

- Synchronized release metadata, lockfile version, QA contracts and service-worker cache namespace.
- Made source-gallery fallback IDs deterministic and normalized quality-override lookup.
- Hardened public announcement links against unsafe protocols.
- Fixed multi-day Google Calendar exports to use the event end date.
- Reduced legacy loading decoration and tightened mobile hero density.
- Kept the V35.1 hub family filtering, source-coverage indicators and JAI support surface intact.

## V35.0.0 — Archive-media editorial pass

- Added an interactive 21-community source-media directory with hover/focus previews.
- Added an event timeline preview tied to deterministic event identities.
- Tightened archive discovery without introducing decorative filler.

## V34.0.0 — Source-first visual overhaul

- Every maintained JYC community now has its own visual signature and source-media treatment within the shared JYC beige/black/white system.
- Every event receives a deterministic visual identity; flagship events retain named presets.
- Live Supabase club records are enriched with supplied hub photography and source-grounded profile copy instead of losing the static source layer whenever the database is populated.
- Source gallery material is merged into the public gallery alongside published records.
- Added higher-quality photo overrides for extracted hub presentation assets and story-image fallbacks where available.
- Tightened centered alignment, page density, image crops, card sizing and mobile grids to remove accidental empty space without fabricating content.
- Added QA coverage for the source media index and deterministic event identity fallback.

## V33.3.0 — Distinct hub & event identity system

- Reconciled the public ecosystem with the supplied All Hubs material: **21 named communities across 5 families**.
- Added a distinct visual identity system for every maintained JYC community: accent, motif, glyph, geometry, display label and domain traits.
- Added event identity presets for supplied flagship experiences including Dron-O-War, Converge, Ebullience, Code Clash, TechTonic, Circuit Rush, Robo Soccer, Top Gun Challenge, RIDE Hack, Innovate, CodeAI, BITBOX and the Agentic AI experience.
- Added deterministic fallback event identity resolution so newly published events inherit their organiser/domain language without requiring hard-coded UI changes.
- Extended event cards and event detail pages with identity lockups, event DNA and source-aware visual treatments.
- Extended hub cards and hub detail pages with stronger identity surfaces while preserving the shared JYC visual system.
- Added QA contracts for all 21 hubs and event identity coverage.
- Rotated release/cache metadata to V33.3.0 / `jyc-cache-v33-3-0`.

## V33.2.0 — Hub Evidence & Discovery Pass

- Added a compact hub evidence rail to every public community profile, separating orientation/source context from live published JYC records.
- Added source navigation on hub detail pages so visitors can jump directly to supplied hub-story material.
- Added family-level filtering to the Events page across Cultural, Technical, Creative, Literary and Sports communities.
- Removed the remaining current-site copy that asserted an unsupported fixed 21-community count.
- Aligned hub identity documentation with the maintained 21-community source list.
- Repaired package-lock release metadata so package.json, lockfile, QA and service-worker cache agree on V33.2.0.
- Added production QA coverage for hub evidence, family discovery and source-count consistency.

## V33.1.0 — JYC Orientation Experience

- Added a source-grounded JYC 2026–27 ecosystem explorer using the supplied Orientation / All Hubs material.
- Added an at-a-glance section for organisation, families, named communities and year-round experience.
- Added five family explorers with direct hub navigation.
- Added the supplied organisational model: Faculty Advisor → Apex Body → Hubs & Societies → Student Volunteers → Festival Committees.
- Added the major programme rhythm from the supplied orientation material.
- Corrected public copy that implied an unsupported fixed “21” count; the current named list contains 21 communities and the UI now derives the count from the maintained source list.
- Kept operational/current data separate from orientation source material.

## V33.0.0 — Public Experience Overhaul

- Reworked the public visual system around the supplied JYC logo beige (#F5D894), with explicit high-contrast light and dark modes.
- Added a dedicated Join JYC destination with a clear Coming Soon state.
- Added homepage latest-updates discovery and stronger cross-page pathways.
- Rebuilt the public Team hierarchy as Faculty → Apex → Core → Clubs & Hubs.
- Added explicit About principles and a clearer public information architecture.
- Added year-based Gallery filtering and structured Event Details support for eligibility, rules, prizes and FAQs.
- Expanded Contact with official LinkedIn and Sector 128 campus context.
- Rotated the service-worker cache to jyc-cache-v33-0-0.
- Updated release QA contracts for the V33 visual system.

## V31.0.0 — Production Hardening

- Production builds no longer initialize or recover fabricated demo content when Supabase configuration is absent.
- Development-only demo data remains available for local UI work.
- Multi-day events now use dateEnd when determining upcoming/live/past state.
- Admin Control Center database indicators now distinguish connected state from offline/cached operation.
- AI Content Copilot now rejects untrusted origins and oversized requests before calling the OpenAI API.
- Production preflight now verifies the no-demo production path and multi-day event lifecycle contract.
- Service-worker cache rotated to jyc-cache-v31-0-0.

## V30.0.0 — Production Finalization

- Removed the duplicate V29 interaction stylesheet import from the active application entry.
- Removed the stale /src/v27-editorial-polish.css production HTML reference; the stylesheet stack is now owned by the Vite application bundle.
- Rotated the service-worker cache namespace to jyc-cache-v30-0-0.
- Synchronized package.json and package-lock.json release metadata and Node engine requirements.
- Updated SEO and visual QA contracts so the release checks validate the actual V30 runtime stack rather than superseded V27/V29 assumptions.
- Kept the beige/black/white visual system, centered layout, V20 split hero, logo-led loading experience, reduced-motion support and responsive navigation intact.

# Changelog

## 29.0.0 — Interaction & Accessibility Polish

- Added a final interaction layer after V28 instead of introducing another competing design system.
- Removed remaining loading-screen orbital/ring decoration.
- Reworked the day/night control into a clearer, theme-aware control.
- Added stronger keyboard focus treatment and consistent reduced-motion handling.
- Harmonised navigation, mobile dock, assistant launcher, buttons, cards, gallery crops and footer surfaces.
- Kept the assistant clear of the mobile navigation dock.
- Rotated the service-worker cache and extended visual QA.

## 28.0.0 — Centered Editorial System

- Rebuilt the public visual system around one coordinated warm-neutral JYC palette for light and dark modes.
- Removed the artificial full-screen hero minimum that created excessive empty space.
- Centered major public hierarchy, cards, controls and page headers for a consistent reading experience.
- Rebuilt About JYC as a connected journey: purpose, principles, five-family ecosystem, organisational flow, major programme rhythm, vision/mission and next-step navigation.
- Added direct pathways between About, Clubs, Events, Team and Gallery so pages behave as one ecosystem rather than isolated routes.
- Added source-grounded programme storytelling using the supplied JYC material without inventing current dates or registrations.
- Tightened responsive density and dark-mode surface contrast.
- Added V28 visual QA coverage and rotated the service-worker cache.

## 27.2.0 — Community Identity System

- Connected every fallback club profile to the supplied hub image archive, including extra presentation images where available.
- Strengthened individual club identity cards with distinct motifs, signatures, muted accent systems and source photography.
- Added distinct event identities for Dron-O-War, Converge, Ebullience, Induction, Ethnic Day, Farewell and Hackathons.
- Added a source-grounded JYC programme index to the Events page using the supplied hub presentation material.
- Connected event detail galleries to matching supplied presentation photography where the association is supported by the source data.
- Added responsive identity styling for club and event detail pages.
- Bumped release to V27.2 and rotated the service-worker cache.

## 27.1.0 — Editorial Pulse

- Added a compact JYC Pulse rail for live/upcoming activity, club count and recruitment signals.
- Activated the JYC Journal as the homepage editorial storytelling layer.
- Added a responsive 12-column editorial story layout with lead/supporting story hierarchy.
- Removed the legacy duplicate hub-story grid from the homepage path while retaining the underlying content for archive use.
- Rotated the service-worker cache and expanded release QA for V27.1.

## 23.0.0 — Final Agentic Bridge Release

- Auto-opens the Agentic AI bridge on fresh JYC home/Events route loads for both new and returning users.
- Replaced the JYC-themed Agentic popup with a separate futuristic Agentic AI visual identity.
- Removed duplicate Phoenix/flight/orbit treatments from the source-level experience.
- Removed the rejected homepage Next JYC Moment plaque.
- Tightened responsive centering, page widths, typography safety and mobile spacing.


## V18.11.2
- Fixed duplicate `AdminErrorBoundary` declaration in the admin bundle.
- Hardened the Vite HTML entry against public-directory asset resolution during production builds.
- Strengthened build preflight to catch the admin boundary collision before `vite build`.


## V18.11.1

- Fixed the V18.11.0 production-build syntax error in the featured Events card click handler.
- Fixed Vite `EISDIR: illegal operation on a directory` during HTML asset processing by replacing the root-relative canonical URL with the live site URL.
- Kept all V18.11 public-site, Phoenix, Events, Club Detail, Calendar and admin improvements intact.
- Bumped the service-worker cache namespace so browsers do not retain the broken V18.11.0 shell.

## V18.11.0

- Fixed the `GalleryItems` duplicate declaration that blocked Vite dependency scanning.
- Added the final public-site visual pass across Clubs, Events, Team, Gallery, Calendar and Contact.
- Added Phoenix pointer depth, orbit, particle and hover-response interactions while keeping the effect lightweight.
- Added an editorial featured-event surface plus club/date/search filters.
- Tightened admin workspace ergonomics, sticky editor controls and mobile-safe interaction states.
- Added Playwright as an explicit browser-QA dependency and refreshed the browser journey coverage.


## V18.10.0

### Repaired
- Restored the Team route/component to module scope.
- Restored Club Detail, Gallery lightbox, Share and JYC Assistant runtime contracts.
- Restored missing Admin workspaces: Homepage, Team, Gallery, Categories, Calendar, Platform, Admins, Notifications and Fest controls.
- Fixed cross-module AdminErrorBoundary usage.
- Added explicit Gallery/GalleryItems exports.

### Preserved and improved
- Phoenix hero and three Phoenix doors.
- Custom red/gold cursor on precise pointers, including the private admin shell.
- JYC + official academic calendar.
- Exact-title-first search ranking.
- Fest Mode gating and homepage-only Recruitment.
- My JYC, event reminders, Google Calendar, ICS and QR tools.
- Contact channels and creator details.

### GitHub
- Consolidated issue/PR templates.
- Added CODEOWNERS and Dependabot configuration.
- Expanded browser QA coverage.
- Added release quality gates and a release changelog.

## V23.6 Reference Integration Pass

Applied the strongest reusable patterns found during the V65 and supplied club-site audit to V23.6 without replacing V23.6 with V65. Added a compact ecosystem context rail, compact event list view, stricter theme unification, domain-specific hub motifs, and final overflow/motion/focus safeguards. Static and source QA remain green.
