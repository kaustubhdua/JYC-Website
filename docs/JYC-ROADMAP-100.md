# JYC Website — 100% Completion Roadmap

Updated: 2026-10-16

This is the execution ledger for taking the JIIT Youth Club 128 website from the current codebase to a release-ready state. Items marked **DONE** are implemented in the repository; **BLOCKED/MANUAL** items require a GitHub/Vercel/Supabase account action that the code connector cannot perform.

## Current release checkpoint — 2026-10-16

- [x] Main includes the JYC Now undefined-record guard and its regression coverage through merge commit `abbd7d9c22e42ae426cdc4448419005282d89a45`.
- [x] Latest production deployment is READY: `dpl_7b5pgLHfbvyFgJDiusuXkjArfsK5`, alias `jyc-website-eight.vercel.app`, commit `6b43c70ebfd0e95ab02c020b0a5e546edffcdae3`.
- [ ] **BLOCKED — exact-main production parity:** production is READY, but it is not the exact latest `main` SHA. The Vercel check for `abbd7d9c22e42ae426cdc4448419005282d89a45` reports `build-rate-limit`. Deploy the approved main SHA after the normal platform limit clears, then verify production routes and headers.
- [ ] **OWNER ACTION — custom domains:** `jiityouthclub128.in` and `www.jiityouthclub128.in` remain unverified; add Vercel's DNS TXT records only if the domain is controlled by the owner.
- [ ] **OWNER ACTION — JYC Now:** live connectors remain unconfigured; the curated fallback must remain clearly labelled unless authorized feeds/credentials are supplied.
- [ ] **OWNER ACTION — Supabase Auth:** leaked-password protection remains disabled; enable it in the Auth dashboard.
- [ ] **OWNER REVIEW — security:** review historical CodeQL/Dependabot findings and the SECURITY DEFINER RPC/function warnings; green CI does not dismiss historical findings.
- [ ] **OWNER REVIEW — visual/content:** review CI screenshots, route content, current event dates and archive provenance before final public launch signoff.

The source tree is progressing and the production alias is healthy, but 100% release readiness is not established until exact-main production parity and the owner-side launch gates above are verified.
## A. Product and UX

- [x] Editorial JYC visual system with light/dark themes
- [x] Responsive navigation and mobile dock
- [x] Global search keyboard entry and Escape behavior
- [x] Homepage rebuild with real source media
- [x] Public route map and legacy redirects
- [x] JIIT 128 event/social scope contracts
- [ ] Finish route-by-route visual polish on every public page after browser QA evidence
- [ ] Verify every real image has stable dimensions, useful alt text, fallback and correct loading priority
- [ ] Verify every event/club/gallery CTA lands on a canonical leaf route

## B. Security

- [x] CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy and nosniff headers
- [x] Browser secret-pattern QA
- [x] Supabase publishable-key browser contract
- [x] Service-role separation contract
- [x] External JYC Now URL validation
- [x] Server-side remote update URL validation
- [x] Security policy strengthened
- [x] Dependabot configuration for npm
- [x] Dependabot configuration for GitHub Actions
- [x] CodeQL workflow modernized to current v4 actions
- [x] CodeQL scans JavaScript/TypeScript and GitHub Actions
- [x] Dependency Review workflow for pull requests
- [ ] **MANUAL:** enable Dependabot alerts in GitHub Advanced Security
- [ ] **MANUAL:** enable Private vulnerability reporting
- [ ] **MANUAL:** enable Secret scanning / Push protection where GitHub plan/settings expose it
- [ ] **MANUAL:** inspect the 17 existing CodeQL findings individually; fix real findings, dismiss only documented false positives/test-only findings
- [ ] Review remaining 48 Supabase multiple-permissive-policy warnings; consolidate only where predicates are equivalent without changing role access
- [ ] Review 61 unused-index INFO findings after production traffic exists; do not remove indexes solely because the project is currently low-traffic
- [ ] **MANUAL:** remove/disable stale duplicate CodeQL configurations if GitHub reports multiple active origins
- [ ] **MANUAL:** add merge protection requiring the security/quality checks once the checks have a stable green run

## C. Dependencies and supply chain

- [x] npm lockfile/reproducible npm ci workflow
- [x] npm audit high-severity gate
- [x] Dependabot weekly npm updates
- [x] Dependabot weekly GitHub Actions updates
- [ ] Dependency Review on PRs — deferred until GitHub Dependency Graph is enabled; the initial action failed because the repository setting is off
- [ ] Enable GitHub Dependency Graph, then restore the Dependency Review PR gate
- [ ] Review first Dependabot PR batch and merge safe updates
- [ ] Keep action versions current through Dependabot rather than hand-pinning old versions
- [ ] Re-run audit after each dependency update batch

## D. Data and Supabase

- [x] Public data fallback and timeout behavior
- [x] JIIT 128 public filtering
- [x] Browser service-role exclusion checks
- [x] RLS/security contracts in repository QA
- [x] Ran the live Supabase security advisor on 2026-10-07; no ERROR/CRITICAL lints were reported
- [x] Removed 7 exact duplicate RLS policies from production; Supabase performance warning count dropped from 56 to 48
- [ ] Verify every exposed table has intentional RLS and no accidental public write policy
- [ ] Verify storage policies and upload MIME/size limits in production
- [ ] Verify admin, JYC admin and club-admin authorization boundaries with real accounts
- [ ] Verify event registration RPC cannot be abused to alter another user's registration

## E. SEO and content trust

- [x] Organization/WebSite JSON-LD
- [x] Event/Club/Breadcrumb/Collection structured data
- [x] Canonical metadata and social previews
- [x] Sitemap generation
- [x] JIIT 128 scope QA
- [ ] Validate representative pages in Google Rich Results / Search Console after production deployment
- [ ] Verify no accidental noindex on public routes
- [ ] Verify every event page has accurate date, end time and venue before publication
- [ ] Verify official club/social links against current sources

## F. Performance and media

- [x] Lazy loading for non-critical media
- [x] Hero image priority
- [x] Media fallback architecture
- [x] Performance budget script
- [x] React Bits lazy loading where heavy
- [ ] Measure production Core Web Vitals after deployment
- [ ] Check LCP hero media and largest JS chunks on real mobile
- [ ] Convert remaining heavy source images to responsive WebP/AVIF where safe
- [ ] Verify no layout shift from images, fonts or dynamic cards

## G. PWA and resilience

- [x] Web app manifest
- [x] Versioned service-worker cache
- [x] Development cache cleanup
- [x] Same-origin/API cache safety contracts
- [ ] Verify installability in Chrome/Android
- [ ] Verify offline shell and online recovery
- [ ] Verify service-worker update behavior after a release
- [ ] Confirm dynamic Supabase content is not falsely presented as offline-complete

## H. Automated QA

- [x] Production build gate
- [x] Static release QA
- [x] Security QA
- [x] SEO QA
- [x] media/photo integrity QA
- [x] JIIT 128 events/social scope QA
- [x] responsive viewport browser matrix in Playwright
- [x] global search keyboard smoke test
- [x] browser-QA GitHub workflow
- [x] Wait for a real GitHub Actions run and fix every failing static/quality check
- [ ] Download Playwright artifacts if browser failures occur
- [ ] Keep the sandbox browser limitation separate from CI evidence

## I. Manual browser release QA

Test every route at 320, 375, 390, 430, 768, 1024, 1280, 1440 and 1920px:

- [ ] Home
- [ ] About
- [ ] Clubs
- [ ] Club detail
- [ ] Events
- [ ] Event detail
- [ ] Gallery
- [ ] Team
- [ ] History
- [ ] Achievements
- [ ] Calendar
- [ ] Updates/JYC Now
- [ ] Archive
- [ ] Contact
- [ ] 404

For each route verify:

- [ ] light and dark
- [ ] keyboard focus
- [ ] touch targets
- [ ] Escape and focus restoration
- [ ] reduced motion
- [ ] 400% zoom/reflow
- [ ] no horizontal overflow
- [ ] no overlapping/floating controls
- [ ] image failure/fallback
- [ ] empty/error/loading state
- [ ] no console errors
- [ ] no dead links
- [ ] no incorrect JIIT 62 content

## J. Release — current main snapshot (16 October 2026)

Current source SHA: `828aa7167a6feac152e4d75a2f79b9b204a81132` (PR #231 merged).

- [x] Current-main CI (`38789119846`) passed
- [x] Current-main Quality Gate (`38789119876`) passed
- [x] Current-main CodeQL (`38789120155`) passed
- [x] Current-main Browser QA (`38789119865`) passed: 39/39 tests plus three visual route checks; the dedicated 320px viewport project is included
- [x] Current-main Lighthouse CI (`38789119910`) passed on seven routes
- [x] Production build generated 4,172 responsive photo derivatives; 36 were skipped and zero failed. Logo optimization emitted 48px, 96px, 192px and 270px AVIF variants.
- [x] Automated accessibility score 100, Best Practices 100 and SEO 100 on all seven Lighthouse routes
- [ ] CodeQL open findings = 0, or every remaining finding has a documented justified disposition
- [ ] Dependabot alerts = 0 high/critical
- [ ] Supabase security advisor findings have reviewed dispositions; do not alter role-scoped grants speculatively
- [x] A Vercel production deployment is READY at `jyc-website-eight.vercel.app` on `6b43c70ebfd0e95ab02c020b0a5e546edffcdae3`.
- [ ] Vercel production deployment matches the latest `main` SHA `abbd7d9c22e42ae426cdc4448419005282d89a45`; current Vercel check reports `build-rate-limit`.
- [ ] Verify a READY production deployment has the exact approved `main` SHA
- [ ] Human visual review and production smoke tests pass on that deployment
- [ ] Supabase Auth leaked-password protection enabled and verified
- [ ] Custom domains verified, or the Vercel alias explicitly accepted as launch origin
- [ ] JYC Now official live source intentionally configured, or curated fallback explicitly accepted
- [ ] production media/link/content review complete
- [ ] only then declare the site 100% release-ready

## Current blockers

1. GitHub Advanced Security account settings are not writable through the connected repository file API, so the manual toggles above must be done in GitHub Settings.
2. The provided GitHub Security screenshot reports 142 open code-scanning alerts, but the connected GitHub file API does not expose the alert list. They must be opened in Security and quality > Code scanning so each finding can be mapped to a source line and remediated or justified.
3. Vercel previously hit the deployment-rate limit; do not repeatedly retry deployments until the limit clears.
4. The local sandbox Chromium launch has been unreliable; GitHub Actions is the authoritative browser-QA environment once its workflow completes.
5. The connected JYC Supabase project (`ogbanmjokjlxfuktkicj`) is ACTIVE_HEALTHY. The 2026-10-15 advisor returned eight SECURITY DEFINER function warnings: `jyc_read_site_data()` is intentionally callable by anon for filtered public content; seven admin/helper functions are authenticated-only and use active-role/club checks with an empty search path. RLS is enabled on the reviewed public tables. Keep these grants unchanged until a reviewed security migration confirms all RLS dependencies.
6. Supabase Auth leaked-password protection is disabled. Enable it in the Auth settings before declaring the backend security review complete; no auth setting or database schema was changed in Run 20.
7. The live `/api/jyc-updates` endpoint reports `live=false` and `configured=false`; the public page explicitly describes JYC Now as a curated editorial layer, not a live social-network feed. Official source configuration/credentials remain owner-side work.
8. Vercel reports `jiityouthclub128.in` and `www.jiityouthclub128.in` as unverified. Do not change DNS until the owner confirms access to the authoritative DNS zone and preserves existing mail records.
9. Production emitted Node `DEP0169` (`url.parse()`) warnings from `/api/jyc-updates` activity. The endpoint source uses WHATWG `new URL` and contains no direct deprecated `url.parse()` call; source of the warning is unconfirmed, so do not patch speculatively.

## Definition of done

The website is 100% done only when sections A–J are either implemented and green, or a manual/account-level item has an explicit verified disposition. No “looks fine” release is allowed with open high/critical security findings, unknown production deployment state, broken media, wrong campus scope, or unverified browser behavior.

## Historical release snapshot (2026-10-07; superseded by the current release status above)

This section records the state observed on 7 October 2026. Its branch, deployment, and workflow claims are historical and must not be used as evidence that the current `main` revision is deployed or release-ready.

- GitHub `main` pointed to `4172d294a5ab13efedc99bbe6f0852adca1086eb` (Dependabot merge updating Vite/Motion) at the time.
- Vercel deployment `dpl_HmQN44hacjado1jUFgwiez1wfavD` was READY for that historical SHA and aliased to `jyc-website-eight.vercel.app`. This does not prove that the current `main` revision is deployed.
- The latest completed Quality Gate, CI and CodeQL checks were green at the time; Browser QA was still running in GitHub Actions.
- Vercel runtime observability shows one low-impact Node deprecation warning group on `/api/jyc-updates` (`url.parse()` warning), with no application exception group reported in the last 24h.
- The screenshot-reported 142 open CodeQL findings remain an account-level disposition task; the current CodeQL workflow itself is green, so each historical alert still needs individual remediation/dismissal/verification in GitHub Security.
- Do not declare 100% release-ready until browser QA, production route/security checks, CodeQL alert disposition, and the remaining manual GitHub/Supabase checks are closed.

## Continued UI/media pass (2026-10-10)

### Implemented in PR #193 (not yet production-verified)

- The homepage uses the actual JYC logo through a lazy React Bits Dither Veil and a viewport-deferred magnetic Magic Bento. Expensive effects disable on coarse/mobile pointers and reduced-motion settings.
- The homepage now has explicit light-theme styling rather than remaining dark regardless of the user's saved theme. Contrast regression checks cover the hero heading, primary CTA and closing CTA in both themes.
- Gold CTA text and event-image badges use dark ink for accessible contrast; the closing CTA adapts between a dark and gold surface without white-on-gold body text.
- Club-card image failure now falls back to that club's own logo when available. Event-card failure falls back to that event's own poster when distinct, then the official JYC logo. It no longer substitutes an unrelated JYC archive photograph as an event poster.
- Existing photo QA covers source archive exclusions, duplicate URLs, provenance/alt metadata, team portrait existence, responsive derivatives, logo fallbacks, gallery lazy-media decode, intrinsic dimensions and responsive frame geometry.
- Team profiles already use click/keyboard-operable flip cards; available biography/headline fields and safe LinkedIn/Instagram URLs appear on the back. Do not fabricate bios or personal profile URLs when no verified public record exists.
- Official public profile research is wired into hub content/social records for JYC, CICR, Innovation JIIT, OSDC/JODC, CypherX, Dronotics, GDG and other reviewed communities. RIDE HACK 26 content now notes the 5 October 2026 application deadline and does not claim applications remain open as of 10 October without an explicit reopening.

### Validation status — do not overstate

- Targeted source-contract checks are being expanded alongside each change. These are not equivalent to a production build or successful browser run.
- GitHub Actions runs for the latest PR revisions have failed before exposing usable job steps/logs. The latest full npm build and Playwright result therefore remain unknown.
- A Vercel preview for the light-theme CSS commit reached READY, but its deployment is protected by Vercel authentication in the available browser fetch; the exact latest PR head has not been visually verified in a browser.
- Manual Vercel deployment was previously blocked by the deployment-rate limit. Do not promote or merge until a preview for the exact head is built and tested.
- Custom-domain verification/routing and production-domain visual QA remain open; do not change DNS without verified ownership/authorization.

### Animation and design follow-up priorities

1. **P0 — release evidence:** successful npm ci, full npm run qa, production build, Playwright at 320/360/390/430/768/1024/1280/1440/1920px, and light/dark visual inspection on the exact branch head.
2. **P0 — media integrity:** verify every visible image request decodes on Home, Club Detail, Event Detail, Gallery, Team, Archive and About; check alt text, natural dimensions, crop/focal point, poster-vs-photo classification and fallback chain. Never use another event's image as a fallback.
3. **P1 — real-world performance:** measure LCP, CLS, INP and long tasks on a mid-range Android device; keep Dither Veil off the critical main-thread path, preserve a static logo fallback and keep Magic Bento pointer motion frame-coalesced.
4. **P1 — animation placement:** use Dither Veil only for the hero brand mark; Magic Bento for a short discovery set; flip cards for team profiles; shared-layout transitions for gallery/event media; restrained magnetic tilt only on desktop fine pointers. Avoid simultaneous continuous motion, autoplay carousels, or parallax behind reading-heavy content.
5. **P1 — content trust:** continue validating official club/social links, current event dates, registration windows and photo provenance. Keep campus-ambiguous accounts review-only and separate source-material copy from verified current club records.
6. **P2 — accessibility:** test keyboard-only flows, reduced motion, 200%/400% zoom, focus visibility, screen-reader labels, contrast and touch targets. Theme switching must preserve all section contrast, not only the homepage hero.
7. **P2 — editorial quality:** select one strong, verified lead photograph per club/event; use each club's identity accent/motif as supporting design, not a substitute for its actual logo or photography; keep archive presentation assets, logos and posters out of the photographic gallery.
