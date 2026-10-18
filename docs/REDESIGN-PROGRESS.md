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


## Exact-head QA follow-up — 2026-10-17

Candidate at start: `9cb24019563f51463239ffcfa2d7240e986e5189` on `fix/release-qa-mobile-type`.

- Production build, dependency install, lockfile checks, dependency vulnerability gate, CodeQL, JYC CI and JYC Quality Gate passed on this candidate.
- Browser QA ran 93 cases: 83 passed and 6 failed across viewport projects. All failures traced to the new team-photo test treating a temporarily unmounted lazy-loaded FlipCard chunk as an empty team; the published team cards were present. Updated the test to distinguish “no team cards” from “lazy portraits not mounted yet,” then wait for the image elements without weakening the photo-integrity checks.
- Lighthouse CI failed its accessibility assertion `label-content-name-mismatch` on all seven audited routes. Source review found the shared `ShareButton` used the page title as its accessible name while the visible action was “Share ↗”; changed the accessible name to include the visible action and added a source-contract regression.
- Current Lighthouse failure is a real release blocker until a fresh exact-head run passes. No merge, production deployment, gallery-rights approval, DNS change or live Supabase security setting change has been performed.
- The complete route-by-route visual inspection remains incomplete; this is a targeted QA repair, not completion of the 78-point redesign.


## Latest exact-head verification — 2026-10-17

Candidate `664c54b05040b76fb96a0104aa86270fa72abc98`:
- JYC CI: PASS.
- JYC Quality Gate: PASS.
- CodeQL: PASS.
- Browser QA: 88 passed, 1 failed. Remaining failure: the homepage lab harness measured a 1,008 ms event duration against a strict 1,000 ms upper bound at the 1920px project. Do not loosen the assertion without checking repeatability and main-thread evidence.
- Lighthouse CI: FAIL. `label-content-name-mismatch` persists on all seven audited routes despite the Search and Share label fixes. The homepage also had non-blocking performance/TBT warnings. Added an always-run Lighthouse report diagnostic step so the next run prints exact offending selectors/snippets and key performance metrics before artifact upload.
- Updated ShareButton's accessible name to include the complete visible “Share ↗” text; the next Lighthouse report must confirm whether that was the offender or whether another shared control remains.
- Exact-head Vercel preview was still building at the last status check; no visual sign-off or merge is authorized from source/build success alone.


## 2026-10-18 — layout alignment and shared elevation follow-up
- On the same P0 foundation branch, commit `875c095d50128bd7ae85e9d035324c776c18c1dd` removes blanket centered alignment from generic public section headings and shared card grids, keeps gallery-specific alignment in its own scoped rules, and softens routine card shadows.
- Commit `a8a4519b74eb3b040e66544057ea133db3644e28` adds source-contract regression checks for those shared alignment/shadow rules.
- These are source changes only until exact-head CI finishes. No route is visually verified from this change alone; no production deployment, domain/DNS, backend or gallery publishing state was changed.


## 2026-10-18 — reduce stacked homepage motion
- Commit `00e2cb11b6a8c46f69d63b365f01c1903030ef2` changes the three full-page ambient orb animations into low-opacity static depth. The Dither Veil remains the single dominant hero effect.
- Commit `7f1334f0d6bc8069d281c20c5c6f1b91d9e00a18` disables Magic Bento magnetism and tilt while retaining its spotlight affordance, avoiding three simultaneous pointer effects on the same cards.
- Commit `cf9ce1fc8dd1dcf080d0c2545beaacaa7369a664` adds regression assertions for the static ambient backdrop and single-interaction Bento configuration.
- Exact-head browser screenshots and performance results are still required; this is a source-level motion simplification, not a claim that the homepage is visually approved.


## 2026-10-18 — simplify shared card surfaces
- Commit `72a067c5dbf88ab4f9f77897fa23fdcc33dcde3c` removes the repeated brass gradient applied to many unrelated public cards. Cards now use the theme surface token, leaving stronger decorative treatment to components that intentionally need it.
- Commit `7de3deed37f6936ead0737c894be55fd48c6a87b` adds a regression assertion that the shared card surface stays clean and does not regain the repeated gradient.
- Still awaiting exact-head QA and rendered screenshot review; this change is not visually signed off.


## 2026-10-18 — WebGL context-loss fallback
- Source inspection of `src/react-bits/DitherVeil.jsx` found that the implementation already had reduced-motion/constrained-hardware fallback, visibility-aware rendering and cleanup, but no `webglcontextlost` event listener despite the source comment claiming WebGL-loss protection.
- Commit `49df9cfe70ca88c634695bd186b45635d9a13cae` now stops the render loop and reveals the preloaded static logo fallback if the context is lost; the renderer is intentionally not recreated after restoration.
- Commit `dabfb35358619b737d2fed775d209c7ee4bd26c6` adds a source-contract regression check for listener setup/cleanup and static fallback behavior.
- Browser-level forced context-loss verification and screenshots remain pending; do not treat the source assertion as proof of rendered fallback quality.


## 2026-10-18 — final interaction simplification for the Bento
- Commit `2a8eaa1120717286694b903d0c0427883f020eb3` disables the Magic Bento click ripple as well as magnetism and tilt, leaving the spotlight as the one deliberate card effect.
- Commit `10f60b221fd68a1bb76daad51435824bca03b04a` updates the regression assertion to lock in the single-effect configuration.


## 2026-10-18 — hidden-tab WebGL scheduling
- Commit `b9ecca79319e2b3db25ade081059b2caeac31356` makes Dither Veil stop scheduling animation frames while the document is hidden and resume only when visible and the canvas is still in view. The visibility listener is removed during cleanup.
- This complements the existing IntersectionObserver pause and the newly added WebGL context-loss fallback. Browser-level visibility/context-loss tests and exact-head CI remain required.


## 2026-10-18 — restore mobile hero readability
- Source review found an old compact mobile override shrinking the JYC hero overline to 8px, lead copy to 13px with a two-line clamp, the headline to 29–35px, logo plaque to 116px, and caption text to 7px. A later rule only repaired the overline, leaving the other cramped values active at the same breakpoint.
- Commit `5113dc0aff29af56b20cc5efefc2ac97c26ec4de` replaces that compact block with readable responsive type (12px overline, 15px lead, 36–48px headline), a larger logo plaque, and 44px minimum action targets. The composition may grow vertically; readability takes precedence over forcing all content into a tiny viewport.
- A source-contract check is being added to guard against the microtype overrides returning. Current browser screenshots are still required to validate the resulting composition at 320px through 680px.
