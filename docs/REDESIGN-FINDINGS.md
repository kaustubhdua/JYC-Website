# JYC redesign findings

Updated: 2026-10-17 UTC  
Evidence source: exact candidate SHA `483a95b0e6030edcfd2049d2453ca8126ea405b5`, GitHub Actions run logs and PR #261.

## Open findings

| ID | Severity | Route / scope | Reproducible evidence | Root cause / disposition |
|---|---|---|---|---|
| R-001 | P1 | `/gallery`, mobile 360×800 and 390×844 | Browser run 38989318581, test `failed gallery photos use the neutral unavailable-photo asset, not a logo placeholder`, failed to find a visible `.jyc57-editorial-photo img[src="/assets/photo-unavailable.svg"]`. Screenshots/error-context uploaded as artifact 12084054261. | Unresolved: determine whether the fixture fails to force a visible photo failure, fallback is applied to a different DOM shape, or the page loads a different gallery tile. Fix product or test based on screenshot/error context; do not weaken the assertion. |
| R-002 | P1 | `/`, `/about`, `/clubs`, `/events`, `/gallery`, `/best-of-jyc`, `/fests` | Lighthouse run 38989318501 reports `label-content-name-mismatch` on seven route audits. | Unresolved: inspect the generated Lighthouse/axe audit details to identify exact controls and accessible-name mismatch. Correct visible-label/name consistency and retain regression coverage. |
| R-003 | P1 | Team/faculty grid and mobile home | Quality Gate 38989318521 and CI 38989318512 fail `sparse faculty grid uses populated tracks and mobile home actions stay unobstructed`. The contract expects the old `top:calc(76px + safe-area)` assistant rule, while active CSS now intentionally anchors it with `top:auto; bottom:calc(94px + safe-area)`. | Likely stale test expectation. Update only after confirming the current browser geometry test verifies the intended no-overlap behavior; preserve the actual responsive geometry assertion. |
| R-004 | P1 | Production / gallery publishing | Issue #251: 31 production albums unpublished; 52 gallery items have `rights_status='review'` and no focal coordinates. | External owner action: rights/consent and focal-point review. Do not publish or bypass the gate. |
| R-005 | P1 | Production domains | Vercel project notes say `jiityouthclub128.in` and `www.jiityouthclub128.in` are unverified pending TXT records. | Domain owner must configure/verify DNS. No DNS changes made. |
| R-006 | P1 | All public routes | Candidate preview exists, but no independent manual screenshot-by-screenshot route audit has yet been completed in this session. | Real-browser screenshot review and route ledger required; do not label routes visually verified based only on source or test success. |
| R-007 | P2 | Dither Veil hero | Existing source/QA contracts cover Dither Veil, fallback assets, and reduced-motion safeguards. Actual visual quality and shader behavior across all nine required viewports has not been independently inspected. | Inspect exact candidate preview, canvas sizing, shader lifecycle, device-pixel ratio, visibility pause, reduced motion and WebGL failure fallback before redesigning. |

## Resolved / existing regression coverage
- Gallery responsive image `sizes` is now tile-specific; prior Lighthouse evidence showed a 251 CSS-pixel tile downloading a 480px AVIF (19,605 bytes; estimated 14,902 bytes wasted).
- Failed photography has a neutral unavailable-media fallback rather than treating the JYC logo as a photo.
- PWA manifest icon metadata declares WebP and 512×512 and no longer claims `maskable` without safe-area visual review.
- Mobile floating assistant was moved away from the hero badge/dock; the older source-only QA assertion has not yet been reconciled with the new implementation.
- Search accessible name was restored to `Search JYC (Ctrl K)` to preserve visible-name matching.

## Visual verification policy
No route is marked visually verified until a rendered browser screenshot has been inspected. Route HTTP status, source assertions and artifact existence are not sufficient.


## UI/UX pass — new finding

| ID | Severity | Route / scope | Evidence / change | Disposition |
|---|---|---|---|---|
| R-008 | P1 | Homepage hero / Dither Veil on touch devices | Source inspection found a blanket static-fallback branch for coarse pointers, which prevented the interactive effect from running on all touch devices regardless of actual capability. | Fixed in candidate commit `9ef450e`: capable touch devices now run the effect at DPR 1; reduced-motion and constrained-hardware fallback remain. Browser rendering and performance still require exact-head verification. |
| R-009 | P2 | Homepage hero CTA and plaque | Source CSS mixed a bright gold-to-red primary CTA with the approved warm editorial palette and a small logo plaque on very narrow screens. | Refined in candidate commit `06dbffd` with oxblood CTA, restrained depth and responsive plaque sizing. Rendered visual acceptance is pending. |


| R-009 | P1 | Public site-wide layout / all routes | Source inspection of the active late-loaded theme found a “CENTERED LAYOUT FINAL OVERRIDES” block forcing generic page/section headings, major card grids, event rows and contact form controls into centered alignment. | Candidate fix in `51afbc8b63624b0571230540cc5b0321ccc3a565`: scope alignment back to gallery controls/grid and remove broad centering. Needs exact-head build, responsive/browser checks and screenshot review before closing. |


| R-010 | P1 | Public site-wide typography/layout/elevation | Follow-up source review found the same theme's opening rules still forced generic section headings to center and applied centered alignment to several shared grids; the shared shadow token was also unusually strong for routine cards. | Commits `4b4e6b0` and `3d34782` scope default alignment to route/component styling, reduce shared elevation and add source-contract regression checks. Must still pass exact-head CI and visual screenshot review. |
