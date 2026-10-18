# JYC redesign findings

Updated: 2026-10-17 UTC  
Evidence source: exact candidate SHA `483a95b0e6030edcfd2049d2453ca8126ea405b5`, GitHub Actions run logs and PR #261.

## Open findings

| ID | Severity | Route / scope | Reproducible evidence | Root cause / disposition |
|---|---|---|---|---|
| R-001 | P1 | `/gallery`, mobile 360×800 and 390×844 | Historical browser run 38989318581 on older candidate `483a95b0e6030edcfd2049d2453ca8126ea405b5` failed in a combined gallery/events fallback test. Artifact context shows the failing selector was actually `.jyc57-event-art picture img` on `/events`, while the live DOM used the shared `ResponsivePhoto` without that ancestor. Current source changes the event assertion to the actual neutral fallback image and separately checks gallery/club fallbacks. | Historical selector mismatch is corrected in current source; do not call the fallback verified until the latest exact-head Browser QA passes. Inspect new artifacts if it fails again. |
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


| R-010 | P1 | Public site-wide typography/layout/elevation | Source inspection found generic public section headings and shared grids forced to centered alignment, plus oversized shadows on routine cards. | Follow-up commits `875c095` and `a8a4519` scope alignment and add regression checks; exact-head CI and route screenshots remain required. |


| R-011 | P2 | Homepage ambient motion / activity Bento | Source review found legacy CSS defined three perpetual blurred orb animations plus simultaneous Magic Bento magnetism, tilt, spotlight and click ripple; the JSX no longer rendered the ambient layer. This stacks motion on top of the Dither Veil hero. | Commits `00e2cb1`, `7f1334f`, `2a8eaa1`, `cf9ce1f`, `10f60b2`, and `0d576a4` remove the unused ambient CSS/keyframes and retain only the Bento spotlight interaction, disabling tilt/magnetism/ripple. Browser/performance confirmation pending. |


| R-012 | P2 | Shared public card surfaces | The final theme applied the same brass gradient to a broad collection of cards, reducing differentiation and adding decoration to unrelated content. | Commits `72a067c` and `7de3dee` use the semantic surface token and guard against the repeated gradient; visual review remains pending. |


| R-013 | P1 | Homepage WebGL hero / Dither Veil | Source comment claimed WebGL-loss fallback, but the component had no `webglcontextlost` handler. A context loss could leave the canvas blank until a full reload. | Commits `49df9cf` and `dabfb35` stop animation and expose the static logo fallback on context loss, with source-contract coverage. Forced browser context-loss test remains required. |


| R-014 | P2 | Homepage WebGL hero / background-tab performance | Dither Veil paused when offscreen but did not explicitly stop its RAF loop when the browser document became hidden. | Commit `b9ecca7` cancels scheduled frames on `visibilitychange`, resumes when visible and in view, and removes the listener on cleanup. Browser-level validation pending. |


| R-015 | P1 | Homepage hero / 320–680px | The mobile CSS used 8px overline, 13px clamped lead, 29–35px headline, 116px logo plaque and 7px caption rules; a later override repaired only the overline. | Commit `5113dc0` restores readable fluid typography and a larger identity plaque with 44px actions. Exact-head mobile screenshots at 320/360/390/430/680px are required before closing. |


| R-016 | P1 | Homepage activity pillars / content trust | Homepage copy named clubs absent from the current published 23-community registry and misspelled Fortissimo as “Fortissmo”; it also made specific programme claims without a clear source in the canonical registry. | Commit `7c4d326` replaces those names with accurate family-level descriptions. A regression assertion will guard against the old unverified names returning. |


| R-017 | P2 | Homepage CSS cascade / unused visual layers | A later “editorial restoration” block reintroduced orb selectors and a radial background after the first ambient CSS cleanup, so the obsolete effect code was not fully removed. | Commit `ccc3980` removes the residual selectors and radial background; regression test checks for absence of ambient selectors/keyframes. Browser review still required. |


| R-018 | P2 | Homepage hero / action hierarchy | The hero presented three equal-weight actions and added a special full-row mobile rule for the third, competing with the headline and logo. | Commits `08b786b` and `da16dec` retain Events and Clubs as the two primary journeys; Join JYC remains in its dedicated lower-page section. Mobile screenshot review pending. |


| R-018 follow-up | P2 | Homepage hero / mobile CSS | The two-action markup still had an obsolete `nth-child(3)` full-row selector. | Commit `26863d5` removes the dead rule; regression assertion will ensure it does not return. |
