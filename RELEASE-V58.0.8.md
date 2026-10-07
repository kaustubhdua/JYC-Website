# V58.0.8 — Accessibility, Event Modal & Media Audit

V58.0.8 is the current JYC public-code release boundary.

## Included
- Accessible featured-event modal and keyboard/focus hardening.
- Canonical JAI 2026 event routing with legacy redirect support.
- Source-archive photography curation and strict separation of photography from identity/design/utility assets.
- Media-health and duplicate-public-URL audit tooling.
- Album narrative/hero fields and guarded publication workflow.
- Supabase media rights/provenance model and trigger-only album publication guard.
- Gallery deep-link, keyboard, swipe and zoom QA coverage.
- Responsive/mobile-network and Core Web Vitals browser harness checks.
- Public-link hardening so missing external URLs are not emitted as `#`.
- Release metadata and service-worker cache aligned to V58.0.8.

## Current data posture
The live Supabase project contains 23 published JYC clubs, 8 published JYC events, 31 unpublished editorial album shells, and a review-gated media/provenance queue. Gallery publication remains conservative: approved photography is not automatically treated as rights-cleared or provenance-verified.

## Remaining launch gates
1. Obtain a green GitHub CI/quality/browser/CodeQL run on the current main revision.
2. Publish the current main revision to the connected Vercel production project.
3. Run the browser and HTTP smoke suite against the production URL.
4. Complete manual Supabase Auth configuration review, especially leaked-password protection.
5. Continue editorial media review for rights, photographer attribution, focal points and album promotion.

These are release/operations gates, not reasons to add more visual effects or another redesign.
CI verification is intentionally exercised through the pull-request quality gates before this release is considered green.
