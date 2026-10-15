# JYC Website — 100% Completion Roadmap

Updated: 2026-10-15

This is the execution ledger for taking the JIIT Youth Club 128 website from the current codebase to a release-ready state. Items marked **DONE** are implemented in the repository; **BLOCKED/MANUAL** items require a GitHub/Vercel/Supabase account action that the code connector cannot perform.


## Current verified release checkpoint — 2026-10-15

- [x] Public release PR #229 merged as commit 35d692f67ddd1c6f7df1d00be5a0bf4bca75d3f3; source release is V64.5.10.
- [x] Exact release-head GitHub workflows passed: JYC CI, Quality Gate, CodeQL, Browser QA (38 smoke + 3 visual-route tests), and Lighthouse CI.
- [x] Exact-head Vercel preview is READY: https://jyc-website-d9cs89hm1-jyc-website.vercel.app
- [x] Lighthouse: accessibility 100 and SEO 100 across all seven audited routes, zero color-contrast findings, Gallery LCP 2487ms.
- [x] Vercel production environment SUPABASE_URL and VITE_SUPABASE_URL were checked without exposing values; both point to the intended JYC project ogbanmjokjlxfuktkicj. No environment values were changed.
- [x] Read-only Supabase audit: project is ACTIVE_HEALTHY, 53 public tables have RLS enabled, and 77 migration records are present. No migration was applied.
- [ ] BLOCKED — production deployment: production still serves 7ebef7bdbc5d744c8fc505c10663e70770f38c8a; Vercel's daily deployment limit returned payment_required / build-rate-limit. Wait for the platform reset; do not bypass or retry repeatedly.
- [ ] OWNER ACTION — domains: jiityouthclub128.in and www.jiityouthclub128.in remain unverified. Add the exact TXT verification records shown in Vercel at the DNS provider, then verify HTTPS and canonical redirects.
- [ ] OWNER ACTION — live updates: no Instagram/YouTube/LinkedIn/RSS connector variables are configured in Vercel. Provide authorized source credentials/feed URLs or explicitly accept the truthful curated fallback; do not claim the feed is live without remote records.
- [ ] OWNER ACTION — Auth: enable Supabase leaked-password protection in the Auth dashboard.
- [ ] OWNER REVIEW — security: inspect current GitHub code-scanning/Dependabot alerts and repository security settings; the CodeQL workflow passes, but workflow success alone does not clear historical alerts.
- [ ] OWNER REVIEW — visual/content: review the captured route screenshots and verify current archive/event source records before final public launch signoff.

The source release is merged and automated validation is green; the website is not yet production-deployed from the release SHA. Do not mark the final release gate complete until production reports READY on the approved main SHA and representative production routes, headers, service-worker behavior and content are rechecked.
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
- [ ] **MANUAL:** inspect current GitHub code-scanning alerts individually; the earlier audit reported 17 findings, but the current open-alert count is not available through the connected GitHub tools. Fix real findings and document any justified dismissal.
- [ ] Review current 49 Supabase multiple-permissive-policy warnings; consolidate only where predicates are equivalent without changing role access
- [ ] Review current 80 unused-index INFO findings after production traffic exists; do not remove indexes solely because the project is currently low-traffic
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
- [x] Ran the live Supabase security advisor on 2026-10-15; no ERROR/CRITICAL lints were reported (WARN-level items remain and are listed in the current checkpoint)
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

## J. Release

- [x] GitHub main contains the current final source
- [x] Latest release-head JYC CI, Quality Gate, CodeQL, Browser QA and Lighthouse CI passed (run IDs 38722188189, 38722188247, 38722188019, 38722188099, 38722188025)
- [ ] CodeQL open findings = 0, or every remaining finding has a documented justified disposition
- [ ] Dependabot alerts = 0 high/critical
- [ ] Supabase security advisor = 0 high/critical
- [x] Vercel production deployment is READY for the current main line
- [ ] verify the exact current main SHA is the production deployment; the current PR preview is separate from production
- [ ] production HTTP/security headers verified
- [ ] all public routes smoke-tested on production
- [ ] production media/link/content check complete
- [x] release notes updated
- [ ] only then declare the site 100% release-ready

## Current blockers

1. GitHub Advanced Security account settings are not writable through the connected repository file API, so the manual toggles above must be done in GitHub Settings.
2. The provided GitHub Security screenshot reports 142 open code-scanning alerts, but the connected GitHub file API does not expose the alert list. They must be opened in Security and quality > Code scanning so each finding can be mapped to a source line and remediated or justified.
3. Vercel previously hit the deployment-rate limit; do not repeatedly retry deployments until the limit clears.
4. The local sandbox Chromium launch has been unreliable; GitHub Actions is the authoritative browser-QA environment once its workflow completes.

## Definition of done

The website is 100% done only when sections A–J are either implemented and green, or a manual/account-level item has an explicit verified disposition. No “looks fine” release is allowed with open high/critical security findings, unknown production deployment state, broken media, wrong campus scope, or unverified browser behavior.

## Live release state (2026-10-07)

- GitHub `main` currently points to `4172d294a5ab13efedc99bbe6f0852adca1086eb` (Dependabot merge updating Vite/Motion).
- Vercel production is READY at deployment `dpl_HmQN44hacjado1jUFgwiez1wfavD`, built from the exact current `main` SHA `4172d294a5ab13efedc99bbe6f0852adca1086eb` and aliased to `jyc-website-eight.vercel.app`.
- The latest completed Quality Gate, CI and CodeQL checks are green; Browser QA is still running in GitHub Actions.
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
- This validation note is historical and superseded by the verified 2026-10-15 checkpoint at the top of this roadmap. The latest release head passed JYC CI, Quality Gate, CodeQL, Browser QA (38 smoke + 3 visual-route tests) and Lighthouse CI.
- The latest release-head Vercel preview is READY. Automated route screenshots are available in CI artifacts; independent human visual signoff remains open because the connected browser fetch cannot access the protected preview directly.
- The release is already merged. Production deployment is still blocked by Vercel's daily deployment limit; do not bypass the quota. Publish after the platform allows deployment, then verify production routes and headers.
- Custom-domain verification/routing and production-domain visual QA remain open; do not change DNS without verified ownership/authorization.

### Animation and design follow-up priorities

1. **P0 — release evidence:** successful npm ci, full npm run qa, production build, Playwright at 320/360/390/430/768/1024/1280/1440/1920px, and light/dark visual inspection on the exact branch head.
2. **P0 — media integrity:** verify every visible image request decodes on Home, Club Detail, Event Detail, Gallery, Team, Archive and About; check alt text, natural dimensions, crop/focal point, poster-vs-photo classification and fallback chain. Never use another event's image as a fallback.
3. **P1 — real-world performance:** measure LCP, CLS, INP and long tasks on a mid-range Android device; keep Dither Veil off the critical main-thread path, preserve a static logo fallback and keep Magic Bento pointer motion frame-coalesced.
4. **P1 — animation placement:** use Dither Veil only for the hero brand mark; Magic Bento for a short discovery set; flip cards for team profiles; shared-layout transitions for gallery/event media; restrained magnetic tilt only on desktop fine pointers. Avoid simultaneous continuous motion, autoplay carousels, or parallax behind reading-heavy content.
5. **P1 — content trust:** continue validating official club/social links, current event dates, registration windows and photo provenance. Keep campus-ambiguous accounts review-only and separate source-material copy from verified current club records.
6. **P2 — accessibility:** test keyboard-only flows, reduced motion, 200%/400% zoom, focus visibility, screen-reader labels, contrast and touch targets. Theme switching must preserve all section contrast, not only the homepage hero.
7. **P2 — editorial quality:** select one strong, verified lead photograph per club/event; use each club's identity accent/motif as supporting design, not a substitute for its actual logo or photography; keep archive presentation assets, logos and posters out of the photographic gallery.
