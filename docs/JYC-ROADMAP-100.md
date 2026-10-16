# JYC Website — 100% Completion Roadmap

## Superseding release update — 2026-10-16

The checkpoint further below records an earlier deployment state and must be read as historical evidence, not current status.

- [x] PR #244 redesign is merged to main at `2ceb1789b8218450707516b737c54635b7593c4e`.
- [x] Vercel reports production deployment `dpl_2NqBhEMA8scNgVL6vuzTyBsQbKoD` as READY for that exact SHA.
- [x] Latest repository search found no open PRs or issues at the time of this check.
- [ ] A follow-up branch `fix/contact-form-validation-and-release-ux` adds accessible contact-form validation and a browser regression. It is not production until its PR checks pass and the change is merged/deployed.
- [ ] Visual sign-off remains pending because the live browser-inspection service was unavailable in this execution. Do not mark every route, photo crop or paragraph as manually inspected.
- [ ] Owner-side operational gates remain: official domain/DNS, live JYC Now connectors, Supabase Auth leaked-password protection, security finding disposition, media rights/provenance, live backend authorization checks, real-device performance/Core Web Vitals and install/offline recovery.
- [x] Read-only Supabase audit confirms the JYC project is ACTIVE_HEALTHY and RLS is enabled on the inspected public/storage tables.
- [x] Content audit: 23/23 normalized clubs are published; 8/32 normalized event records are published and 24 remain under review. Two events are future-dated: JAI 2026 (published deadline passed on 10 October) and RIDE Hack'26 (no registration URL). The follow-up branch closes the stale JAI QR/registration state and includes a browser regression.
- [ ] Gallery editorial gate: 52 approved gallery items have alt text and public URLs, but all 52 remain rights_status='review'; 31 album shells are unpublished, 6 gallery items are unalbumed, and focal coordinates are unset for all 52. Do not auto-clear rights, publish albums, or invent crop coordinates.
- [ ] Supabase Security Advisor still reports leaked-password protection disabled; enable it in Auth settings. It also reports one intentionally public SECURITY DEFINER read RPC and seven authenticated SECURITY DEFINER helpers/save functions. Their grants and role checks were inspected; retain intentional boundaries and complete an owner-side security review rather than blindly revoking them.
- [ ] Supabase Performance Advisor reports 79 unused-index INFO findings. Do not drop indexes without workload/production-traffic evidence.


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

## J. Release — verified snapshot (16 October 2026, 23:26 UTC)

Verified deployed source checkpoint: `e348489b011fa1c590d65588c0b78ba10eb66798` (PRs #231, #239 and #240 merged). This is a timestamped release-evidence snapshot; recheck the deployment SHA after any later merge.

- [x] Current-checkpoint CI (`38822979234`) passed
- [x] Current-checkpoint Quality Gate (`38822979202`) passed
- [x] Current-checkpoint CodeQL (`38822979263`) passed
- [x] Current-checkpoint Browser QA (`38822979216`) passed
- [x] Current-checkpoint Lighthouse CI (`38822979205`) passed on seven routes
- [x] Production deployment `dpl_A97MuUSRQvZoCn56dZdRKxiwUSH3` is READY at the exact source checkpoint above; verified Vercel alias: `jyc-website-eight.vercel.app`
- [x] Production smoke tests returned HTTP 200 for homepage, team, gallery, clubs, events, fests, updates, JYC Now API, robots.txt and sitemap.xml
- [x] Playwright screenshot review confirms the faculty grid uses only populated tracks and the mobile assistant stays clear of primary homepage actions
- [x] Lighthouse scores on the tested source: Performance 86–89; Accessibility 100; Best Practices 100; SEO 100 across seven routes. These are lab results, not field Core Web Vitals.
- [x] JYC Now clearly labels the fallback as curated while API state remains `live=false`, `configured=false`
- [ ] Enable and verify Supabase Auth leaked-password protection
- [ ] Verify `jiityouthclub128.in` and `www.jiityouthclub128.in` or explicitly accept the verified Vercel alias as the launch origin
- [ ] Review current GitHub code-scanning/dependency alerts individually; the historical screenshot's count of 142 is not assumed to be current
- [ ] Verify branch protection settings; the connected API could not read the protection endpoint
- [ ] Review current Supabase advisor findings without changing role-scoped grants speculatively
- [ ] Configure official JYC Now feeds if live sources are required; otherwise obtain explicit owner acceptance of curated mode
- [ ] Finish editorial review of event dates, venues, official links and archive material
- [ ] Only then declare all account-level and editorial release gates 100% closed


## Current blockers

1. **Supabase Auth leaked-password protection is disabled.** Enable it in project Auth settings and verify the setting. No auth setting or schema was changed.
2. **Custom domains are unverified.** Vercel reports pending TXT challenges for `jiityouthclub128.in` and `www.jiityouthclub128.in`. The verified Vercel alias is live; preserve existing mail records when the DNS owner adds verification records.
3. **JYC Now live feed is not configured.** The API returns `live=false`, `configured=false`; the frontend now labels the curated fallback honestly. Configure official sources only with owner-controlled feed URLs/credentials, or explicitly accept curated mode.
4. **Security alert disposition is incomplete.** CodeQL workflow passes, but the connected GitHub API cannot enumerate the current open alert list. The earlier screenshot count of 142 is historical and must not be treated as current.
5. **Branch protection is not reverified.** The connected repository API returned 403 for the protection endpoint; owner-side settings review is required.
6. **Supabase advisor snapshot (15 October 2026) reported eight SECURITY DEFINER warnings.** `jyc_read_site_data()` was documented as intentionally callable by anon for filtered public content; seven admin/helper functions were authenticated-only with active-role/club checks and an empty search path. Re-review current findings and keep grants unchanged until a reviewed security migration proves a change is safe.
7. **Non-blocking Node `DEP0169` warning persists on `/api/jyc-updates`.** Repository source uses WHATWG `new URL` and has no direct deprecated `url.parse()` call; source remains unconfirmed. Do not patch speculatively.
8. **Editorial sign-off remains an owner task.** Verify event dates, venues, official club/social links and archive material before promoting them as current official content.
9. **Historical CI trigger-efficiency proposal P-CI-01 remains unapplied.** Do not alter browser workflow triggers until branch protection/required-check policy is verified. This is an efficiency task, not a blocker for the currently passing release.


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
