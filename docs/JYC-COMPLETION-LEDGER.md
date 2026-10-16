# JYC Completion Ledger

Last updated: 2026-10-17 UTC (after PR check-log review)  
Baseline main: `1da5867a4f4920f4854810efd275d59bf44c344d`

This is an evidence ledger, not a declaration of completion. A task is only marked verified when the named check or owner review has actually succeeded.

## Verified source/repository observations

- [x] Repository metadata and `package.json` inspected through GitHub; Node engine is `>=24 <25`; canonical release QA is `npm run qa`; browser suite is `npm run qa:browser`; performance suite is `npm run qa:performance`.
- [x] Active public stylesheet entry confirmed as `src/styles/public-entry.css`; it imports multiple legacy style generations, so deleting old styles without browser baselines would be unsafe.
- [x] Homepage owns a separate token family in `src/jyc-editorial-home.css`; the new palette maps that family as well as the shared token families.
- [x] Open release blocker #251 inspected: production media rights/focal review, approved visual baselines and production deployment verification remain outstanding.
- [x] `Innovationjiit.in-main.zip` is not present in the current execution runtime; its contents have not been inspected in this run.

## Work in review

- [ ] PR #257 — [Unified cool editorial colour system](https://github.com/kaustubhdua/JYC-Website/pull/257). Adds a semantic cool-ivory/navy/cobalt/coral palette, theme mappings, focus/feedback tokens and source QA. A source review found the initial light/dark homepage mapping accidentally applied light values to both themes; a follow-up commit separates the theme maps and sets dark primary-button text to navy. **Not merged; source contract has not been executed after this fix, and contrast/screenshots remain unverified.**
- [ ] PR #256 — [Falcon idle motion lifecycle](https://github.com/kaustubhdua/JYC-Website/pull/256). Focused animation lifecycle change. The recorded head's CI, Quality Gate and CodeQL passed, but Browser QA failed (40 passed / 3 failed: homepage logo/plaque/dock geometry at 320px, 390px and 430px) and Lighthouse CI failed the accessible-name/visible-label assertion across six routes plus responsive image sizing on Gallery. **Do not merge until those defects are fixed and checks rerun.**

## Release blockers / owner-dependent actions

- [ ] Gallery rights-holder review for the 52 records flagged in issue #251; do not infer clearance.
- [ ] Set and review focal points and verify event/community association only for approved photos.
- [ ] Human review and approval of visual baselines for desktop, tablet, mobile and 320px.
- [ ] Confirm Vercel quota/owner-side project access, deploy the exact reviewed main SHA, verify production alias and critical routes.
- [ ] Verify custom-domain ownership/routing and configure third-party feed secrets only through authorized owner access.
- [ ] Enable Supabase Auth leaked-password protection via authorized project owner; no auth or database setting was changed here.

## Latest observed automated checks

- PR #257 checks were still running when this entry was written. Refresh the PR checks before making merge decisions.
- An earlier browser run on the prior source checkpoint reported 40 passing and 3 failing tests; the three failures were mobile homepage logo/plaque geometry at 320px, 390px and 430px.
- An earlier Lighthouse run failed the `label-content-name-mismatch` assertion across audited routes and warned about responsive image sizing on Gallery. These are known failures to reproduce and fix, not waived gates.
- Local dependency install/build/Playwright execution was unavailable because the runtime could not resolve GitHub for cloning. No local test exit code is claimed.

## Next priorities

1. Refresh PR #257 CI and inspect failures/logs; fix source or regression tests without weakening checks.
2. Review/fix the known mobile hero geometry and accessible-name mismatch, then rerun affected browser/Lighthouse checks.
3. Apply the palette consistently across active legacy layers based on actual preview screenshots and measured contrast, not source assertions alone.
4. Complete all public route journeys and the required viewport/theme matrix against a fresh preview.
5. Resolve the owner-dependent media rights, visual sign-off and production deployment gates before claiming release readiness.
