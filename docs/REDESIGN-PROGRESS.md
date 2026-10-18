# JYC redesign progress ledger

Last updated: 2026-10-17 UTC

## Latest execution cycle
- Re-queried PR #261: open, draft, unmerged; latest verified head before this fix was `06fab5f5547b0b7fbf9796e0d5c95f8391264c35`.
- Fresh CI on that head: CodeQL PASS; JYC Quality Gate FAIL. JYC CI, Browser QA and Lighthouse were still running when checked.
- Quality Gate log confirmed two QA contract defects in `scripts/qa-v64-editorial-release.mjs`: one assertion accidentally required a CSS selector to be both present and absent; another still expected the obsolete top-anchored assistant rule.
- Corrected both contracts in commit `54d6211641cb01d4933433ee445c28fcde91e291`: now assert bottom anchoring, absence of the conflicting top rule, narrow-home assistant suppression, and the real browser geometry test. This is a test expectation correction grounded in the actual active CSS and existing browser regression—not a weakened visual assertion.
- Candidate preview attempts: newest READY preview at `https://jyc-website-566te1x29-jyc-website.vercel.app` is commit `1d16cc487c33d7c8e9b2244324fd50c7ef057eac`, not this branch's verified head. The exact candidate preview remains unverified. Vercel screenshot fetch was blocked because the connected Firecrawl account has insufficient credits; no screenshot was captured in this cycle.
- Reference archive search did not establish that `Innovationjiit.in-main.zip` is available; treat it as unavailable unless an actual project file is surfaced.


## Current repository state
- Branch: `fix/gallery-neutral-photo-fallbacks`
- Candidate SHA at start of this cycle: `483a95b0e6030edcfd2049d2453ca8126ea405b5`
- PR #261: open, draft, not merged; base `main` at recorded SHA `1da5867a4f4920f4854810efd275d59bf44c344d`.
- Exact candidate preview: READY, https://jyc-website-mdk271ooc-jyc-website.vercel.app.
- Production deployment: READY but serves older SHA `55bef8b7a6ec6a2647eb3dc892371a7b54507065`.
- Latest observed candidate checks: CodeQL PASS; Browser QA FAIL (81 pass, 2 fail, 4 skipped); Lighthouse FAIL (`label-content-name-mismatch`); Quality Gate FAIL; JYC CI FAIL.
- No merge or production configuration/data change performed.

## Follow-up fixes committed after the initial failing candidate

Latest branch head: `e51821edfd775ae85374467e89e41295b348b6ba`.

- [x] Inspected the actual Playwright failure context: the gallery fallback assertion passed; the same test then failed on Events because the test required a `picture img` ancestor, while `ResponsivePhoto` renders the responsive `picture` wrapper with the class on the wrapper itself. Updated the event/club selectors to target the rendered image directly.
- [x] Inspected Lighthouse JSON artifacts across all seven routes. The common mismatch was the Search button: visible text was “Search” and “Ctrl K” while `aria-label` said “Search JYC (Ctrl K)”. Aligned the accessible name to the visible label.
- [x] Corrected gallery photo button names to include their visible index, category, caption and action so the visible label is represented in the accessible name.
- [x] Inspected the mobile Events failure screenshot. The featured event photo could shrink below a useful size beside long event copy; gave it a fixed responsive media column and added a 360px browser geometry regression.
- [x] Added browser coverage for the event and club neutral fallback images using the actual rendered DOM structure.
- [ ] Fresh CI must complete on the exact latest head before these fixes are considered verified. The prior failure reports belong to the older SHA `483a95b0e6030edcfd2049d2453ca8126ea405b5`.
- [ ] Preview deploy is still blocked by Vercel's daily build quota; do not treat the older READY preview as the latest build.

## Completed in existing candidate
- PWA manifest icon MIME/dimensions corrected and unverified maskable claim removed.
- Responsive gallery image sizes aligned with tile layout.
- Neutral fallback for unavailable photography.
- Mobile hero/assistant overlap correction and geometry tests.
- Theme/search accessible-name regression coverage and event registration status wording.
- JAI deadline/status fallback aligned to published Unstop listing.
- Generated photo derivative pipeline reported 4,172 generated, 36 skipped, zero failed in latest observed CI.

## Current defect queue
1. **P1** Reproduce and fix gallery neutral-photo fallback Playwright failure at mobile 360 and 390 (run 38989318581; artifact 12084054261).
2. **P1** Inspect Lighthouse details and fix exact `label-content-name-mismatch` offenders (run 38989318501).
3. **P1** Reconcile stale sparse-faculty QA contract with current CSS while preserving measured no-overlap behavior (runs 38989318521 and 38989318512).
4. **P1** Complete real-browser screenshot review of exact preview and route matrix.
5. **P1 external** Rights/focal review for production gallery (issue #251).
6. **P1 external** Verify custom production domains/DNS (issue #251).
7. **P2** Inspect Dither Veil visually and test WebGL/static fallback at required breakpoints.
8. **P2** Finish route inventory and route-by-route inspected/fixed/regression states, including empty/error/form and admin security boundaries.

## Routes
- Route inventory: NOT COMPLETE.
- Browser test coverage exists for multiple public routes and nine responsive projects, but a full manual route-by-route screenshot review is NOT COMPLETE.
- Visually verified routes: none claimed in this ledger.
- Required viewport matrix: 320×740, 360×800, 390×844, 430×932, 768×1024, 1024×768, 1280×900, 1440×900, 1920×1080; full visual review pending.

## Current blockers
- GitHub Actions browser/Lighthouse artifacts need detailed inspection to diagnose failures.
- No direct local terminal/browser session has been established through the current connector tools. GitHub Actions Playwright runs are available and their artifacts must be used carefully.
- Production gallery rights/focal approvals and custom-domain DNS verification require owner actions.
- Preview is READY on exact candidate SHA; it has not been manually screenshot-reviewed in this session.

## Next concrete actions
1. Retrieve the browser error-context and Lighthouse audit artifacts.
2. Fix the actual neutral-fallback behavior or test fixture and the exact visible-label/accessibility offenders.
3. Update the stale QA source contract only after confirming live geometry assertions still guard against overlap.
4. Commit changes on this branch; wait for fresh CI on the exact resulting SHA.
5. Render/inspect preview screenshots for routes and viewports; keep unresolved routes explicitly unverified.


## UI/UX implementation pass — 2026-10-17

- Candidate work is on the existing draft PR #261 branch; no merge or production deployment performed.
- Commit `9ef450ea1a54d3021ef5a3048753869fe8179daa`: capable touch devices now run the Dither Veil instead of being unconditionally forced to the static image. Coarse-pointer devices cap renderer DPR at 1 to limit GPU cost. Reduced-motion and constrained-hardware fallbacks remain.
- Commit `06dbffd03f0e31492c0a51d0f5b61f61ba64421a`: added a scoped homepage hero refinement: oxblood CTA instead of the conflicting gold/red gradient, refined type sizing and spacing, an editorial plaque with restrained depth/rings, consistent borders, mobile sizing, and reduced-motion-safe float animation.
- Commit `09243503a17abbd303ea0ea2a19f5faa492dc603`: added source-contract coverage for touch Dither Veil and the hero design layer. This is not yet a passing test result; CI must execute it.
- Source inspection confirms the homepage already lazily mounts React Bits Dither Veil and Magic Bento, uses OGL, and has fallback assets. The key behavior change was removing the blanket coarse-pointer disable. This is a targeted implementation step, not proof that the rendered effect is visually correct.
- Current latest code commit recorded before this progress update: `0417c0dc4992dafdab4519daadff890f523196f1`.
- **Still unverified:** no exact-head preview or browser screenshots were manually inspected during this pass. No claim that every route is redesigned, that the effect renders correctly in production, or that visual QA passes.
- **Next:** fresh exact-head CI; fix resulting failures without weakening contracts; inspect real screenshots when browser access is available; proceed route-by-route with the shared design system, then accessibility/performance/release gates.

- Fresh CI was triggered for code head `0417c0dc4992dafdab4519daadff890f523196f1`: JYC CI run `38992221749`, Browser QA `38992221751`, Quality Gate `38992221775`, CodeQL `38992221762`, Lighthouse CI `38992221745`. At last poll, JYC CI, Quality Gate and Lighthouse were in progress; Browser QA and CodeQL had no job details yet. Results are not yet known.


## 2026-10-18 execution — global centering override
- Created branch `fix/editorial-layout-centering-audit-2026-10-18` from `main`; no production deployment or merge performed.
- Source audit found a late-loaded block in `src/jyc-logo-final-theme.css` that forced generic public headings, multiple card grids, event rows, and contact form labels/fields into centered alignment. This was a site-wide layout rule, not a gallery-only requirement, and risked flattening page-specific editorial hierarchy and making form reading/alignment awkward.
- Replaced the global alignment rules with gallery-scoped alignment only; retained responsive gallery filter grouping. This is a focused CSS correction, not a claim that the full redesign is complete.
- Commit: `51afbc8b63624b0571230540cc5b0321ccc3a565`.
- Verification limitation: GitHub source was inspected, but this environment has not run Node 24, `npm ci`, browser screenshots, or the test suite against this commit. The PR/CI results must be checked before merge. Public routes remain visually unverified until exact-head screenshots are reviewed.
- Still blocked/out of scope for this change: owner-reviewed gallery publishing rights/focal points; production domain DNS verification; independent screenshot review of the hero and all route/viewports.


## 2026-10-18 execution — follow-up CSS and regression hardening
- Continued the same review branch after inspecting the actual theme source rather than stopping at the first override block.
- Commit `4b4e6b04c33bca9f111def1b4a3fb8f9bebcae50` changes the shared theme's base section-heading and card-grid rules so alignment is route-specific instead of globally centered; it also replaces oversized shared card shadows with restrained elevation tokens.
- Commit `3d34782f239a585ce14a89a00cd6f9c08752db7d` adds source-contract assertions to `scripts/qa-visual-redesign.mjs` for accidental global centering and oversized shared shadows.
- These are source-level improvements; no local Node/browser execution was available in this connector session. The exact-head CI runs triggered by these commits are the verification source, and screenshots still need actual visual inspection.
- Palette candidates, official-logo sampling, hero-effect comparison, all-route screenshot QA, accessibility journeys and media rights remain open; no broad redesign or release completion is claimed.
