# Open-source UI/UX and release quality pass

Date: 2026-10-16

## Scope and design approach

This pass deliberately uses open-source projects as implementation references rather than copying their whole frameworks into the JYC public site.

- [shadcn/ui](https://github.com/shadcn-ui/ui) — composable, accessible controls: keyboard semantics, visible focus, reliable dialogs, and responsive component patterns.
- [Magic UI](https://github.com/magicuidesign/magicui) — restrained animation and component presentation patterns.
- [Tremor](https://github.com/tremorlabs/tremor) — clear information hierarchy and data presentation, most applicable to internal/admin metrics rather than the editorial public site.
- [Corsair](https://github.com/corsairdev/corsair) and [GenAI_Agents](https://github.com/NirDiamant/GenAI_Agents) — reviewed as integration/agent engineering references. They are not UI component kits and are not imported as runtime dependencies without a confirmed product use case.

The existing app already uses React, source-owned CSS, Motion, GSAP, OGL, React Bits-inspired Dither Veil and Magic Bento. Adding an additional animation framework, Tailwind layer, or integration/agent platform just for visual polish would increase bundle size and maintenance burden without directly resolving a user-facing issue. The established visual direction remains JYC paper/ink, oxblood red, and restrained champagne accents, with real media, responsive layouts, and reduced-motion support.

## Release evidence

The baseline merge commit reviewed for this pass is `2ceb1789b8218450707516b737c54635b7593c4e`. The following GitHub Actions runs for that exact commit completed successfully on 16 October 2026:

- CI: https://github.com/kaustubhdua/JYC-Website/actions/runs/38876607364
- Quality Gate: https://github.com/kaustubhdua/JYC-Website/actions/runs/38876607341
- Browser QA: https://github.com/kaustubhdua/JYC-Website/actions/runs/38876607432
- Lighthouse CI: https://github.com/kaustubhdua/JYC-Website/actions/runs/38876607280
- CodeQL: https://github.com/kaustubhdua/JYC-Website/actions/runs/38876607463

The CI job logs report successful dependency installation/audit, production build, static QA, photo-integrity QA, current-release QA and media/performance budgets. Browser QA reported 39 passing tests. The route visual matrix passed at its configured desktop, tablet, mobile and 320px widths for 13 routes, checking headings, image alternative text, image loading, horizontal overflow, small text, and browser errors. The matrix generated screenshots because reference baselines were missing; these captures are review artifacts, not pixel-diff proof against an approved golden baseline.

Lighthouse CI passed its configured gate. Its artifacts show synthetic Performance scores ranging from 0.86 (Gallery) to 0.89 (Clubs/Events/Fests), with Accessibility, Best Practices and SEO scoring 1.00 for the seven audited routes. Gallery LCP was approximately 2.56 seconds in that synthetic run—slightly above the configured 2.5-second target. Synthetic Lighthouse results do not substitute for field Core Web Vitals.

The linked production deployment is READY for the same baseline commit: https://vercel.com/jyc-website/jyc-website/2NqBhEMA8scNgVL6vuzTyBsQbKoD

## Remaining release review

- Compare screenshot baselines after a maintainer visually approves the current captures; don't automatically turn first-run screenshots into unquestioned goldens.
- Inspect photography semantics (not just decodability, dimensions and alt text) and verify every image belongs to the event/club described.
- Continue tracking Gallery LCP and large legacy logo/fallback requests with the browser waterfall before changing image fallback rules.
- Verify content and registration states against the responsible JIIT-128 organizer; source material isn't proof that a registration is open now.
- Do not import Corsair or an agent framework unless the product adds a specifically approved integration or agent feature with secure auth, explicit data permissions, cost controls and a working owner-approved use case.

## Definition of a fully cleared release

The main branch has meaningful automated evidence and a READY deployment, but the new improvements in this follow-up should not be declared shipped until this branch has its own successful CI/build/browser/security checks, the PR is reviewed and merged, and its exact commit is deployed. Automated checks still need a focused human content/cropping review for final editorial sign-off.
