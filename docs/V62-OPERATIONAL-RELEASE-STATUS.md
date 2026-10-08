# V64 operational release status

V64 is the current application release on GitHub `main`.

## Verified in source / database
- V64.0.0 is synchronized across package metadata, lockfile, README and service-worker cache.
- Production builds now generate real AVIF/WebP photo derivatives before Vite copies public assets.
- V64 shared Motion transition: event card → event detail.
- V64 shared Motion transition: gallery card → lightbox.
- Both transitions respect reduced-motion preferences.
- Responsive photo delivery now bounds derivative candidates by source dimensions.
- Route-specific static metadata shells are generated after production builds for the major public routes and canonical JAI route.
- V64 editorial/release QA is wired into the project.
- Browser QA workflow is present and runs Chromium against a production build.
- Supabase media publication trigger functions have direct client execution revoked.
- `jyc_media_albums.cover_gallery_item_id` has a supporting index.
- Internal rate-limit tables now have explicit deny policies for direct `anon`/`authenticated` access.
- Supabase production migration history contains `v64_security_performance_hardening` and `v64_1_rate_limit_rls_denials`.
- Current CMS gallery state remains intentionally unpublished: 52 approved records, 0 rights-cleared, 0 focal-complete, 0 editorially reviewed.
- Current production database therefore does not expose those CMS photos through the public gallery gate.

## Platform-gated
- Vercel currently rejects new deployment creation with `api-deployments-free-per-day` / HTTP 402 and a 24-hour retry window. The current production deployment remains an older `main` commit.
- The latest GitHub `main` code is therefore not yet the production runtime.
- GitHub Actions has historically produced zero-step failures in this repository; the new browser/release workflows are committed, but a successful runner execution has not been verified.
- Supabase leaked-password protection remains disabled. This is a hosted Auth configuration setting and cannot safely be enabled through the available project database tooling.
- No custom domain has been attached or modified.
- JAI/event Vercel infrastructure has not been touched.

## Editorial / human authorization gates
- Gallery rights clearance is still required for every CMS photograph.
- Photographer / rights-holder attribution still requires review.
- Focal points require actual visual crop decisions.
- Album publication remains intentionally blocked until media is editorially and legally ready.
- Backup/restore drill remains incomplete until a real production snapshot is created and restored in a controlled test.

## SEO
Major public routes now get static route-specific HTML metadata during build, reducing dependence on client-side metadata execution for crawlers and link unfurlers.

Dynamic entity routes beyond the explicitly generated canonical JAI route still depend on the application runtime for entity-specific metadata. A future full SSR/SSG architecture could eliminate that limitation, but it should not be introduced as an untested framework migration immediately before release.

## Release safety
The release is not marked fully production-complete until the platform-gated, editorial/legal, backup, browser/device, and deployment gates above are actually passed. No database status was falsified and no unrelated JAI/event deployment was modified.
