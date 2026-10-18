# JYC route inventory and visual QA matrix

Generated from `src/main.jsx` route resolver, `scripts/generate-sitemap.mjs`, and `scripts/generate-route-shells.mjs` on 2026-10-17. This is an inventory, not evidence of visual verification.

## Public static routes

| Route | Page/behavior | Status |
|---|---|---|
| `/` | Editorial home / Dither Veil hero | NOT VISUALLY VERIFIED |
| `/about` | About and history narrative | NOT VISUALLY VERIFIED |
| `/history` | Redirect to `/about#history` | NOT VISUALLY VERIFIED |
| `/clubs` | Club directory, search/filter | NOT VISUALLY VERIFIED |
| `/events` | Event directory | NOT VISUALLY VERIFIED |
| `/fests` | Fest directory | NOT VISUALLY VERIFIED |
| `/gallery` | Editorial photo wall/lightbox | NOT VISUALLY VERIFIED |
| `/archive` | Lazy-loaded archive | NOT VISUALLY VERIFIED |
| `/team` | Team/faculty/student profiles | NOT VISUALLY VERIFIED |
| `/leadership` | Redirect to `/team` | NOT VISUALLY VERIFIED |
| `/contact` | Contact and query form | NOT VISUALLY VERIFIED |
| `/calendar` | Event calendar | NOT VISUALLY VERIFIED |
| `/event-calendar` | Redirect to `/calendar` | NOT VISUALLY VERIFIED |
| `/announcements` | Announcements | NOT VISUALLY VERIFIED |
| `/updates` | JYC Now feed | NOT VISUALLY VERIFIED |
| `/achievements` | Achievements | NOT VISUALLY VERIFIED |
| `/best-of-jyc` | Curated photo/editorial archive | NOT VISUALLY VERIFIED |
| `/join-jyc` | Join JYC / recruitment status | NOT VISUALLY VERIFIED |
| `/recruitment` | Recruitment hub or Join JYC fallback | NOT VISUALLY VERIFIED |

## Dynamic routes

- `/clubs/:slug` — only published, non-archived clubs or registered hub profiles; invalid/unpublished records show a not-found state.
- `/events/:slug` — published event details; legacy event slugs redirect to canonical slugs; invalid/unpublished records show a not-found state.
- `/events/:slug/register` — official external registration destination where a valid event/URL exists.
- `/gallery/:album` — album/deep-link route handled by gallery page; verify direct refresh and not-found behavior.
- Dynamic club/event URLs are also generated into sitemap when source registry or published backend data is available.

## Aliases and special routes discovered in source

| Route/pattern | Current behavior | Status |
|---|---|---|
| `/moments` | Redirect to `/gallery` | NOT VISUALLY VERIFIED |
| `/discover` | Redirect to `/clubs` | NOT VISUALLY VERIFIED |
| `/resources`, `/guide` | Redirect to `/about` | NOT VISUALLY VERIFIED |
| `/planner`, `/agenda`, `/map` | Redirect to `/events` | NOT VISUALLY VERIFIED |
| `/projects`, `/projects/submit` | Redirect to `/clubs` | NOT VISUALLY VERIFIED |
| `/my-jyc`, `/login`, `/notifications` | Redirect to `/` | NOT VISUALLY VERIFIED |
| `/settings`, `/download` | Redirect to `/about` | NOT VISUALLY VERIFIED |
| `/qr/:token` | Redirect to `/events` | NOT VISUALLY VERIFIED |
| `/admin`, `/admin/*` | Redirect to public home | SECURITY-SENSITIVE; NOT AUDITED |
| Unknown paths | Public 404 with Home/Clubs actions; noindex metadata | NOT VISUALLY VERIFIED |

## Canonical event routes listed by sitemap source

`/events/jai-2026-jaypee-agentic-ai-hackathon`, `/events/ride-hack-2026`, `/events/converge-2026`, `/events/drono-o-war-2026`, `/events/innovate-3-0-2026`, `/events/bitbox-6-0-2026`, `/events/sih-college-internals-26`, `/events/jyc-function-2026`. Each must be checked against actual published data; presence in sitemap source is not proof of a currently published event or open registration.

## Responsive and interaction evidence still required

Required viewport matrix: 320×740, 360×800, 390×844, 430×932, 768×1024, 1024×768, 1280×900, 1440×900, 1920×1080. Every route remains NOT VISUALLY VERIFIED until a screenshot is captured and inspected. Direct refresh, back/forward, keyboard/focus, reduced-motion, console/network errors, page footer, form states and image fallback must be recorded per route.

## Known browser/CI findings to revisit

- Browser QA previous candidate: mobile neutral-photo fallback selector/fixture issue; PR description later records actual root cause as an Events selector expecting a nested `picture img` despite the class being on the responsive wrapper. Regression correction is committed, awaiting fresh exact-head results.
- Lighthouse previous candidate: visible-label/name mismatch on Search and gallery photo controls. PR records corresponding fixes; latest Lighthouse result must be inspected before disposition.
- Team/faculty sparse grid and mobile assistant: QA source contracts corrected in commit `54d6211641cb01d4933433ee445c28fcde91e291`; latest CI pending.
- Visual screenshot review of the exact current candidate: NOT COMPLETE. GitHub Actions Playwright artifacts are available for inspection, but only screenshots from the exact latest candidate count; the historical artifact from `483a95b0e6030edcfd2049d2453ca8126ea405b5` exposed a stale Events fallback selector and is not current visual sign-off. Do not mark routes visually verified from source inspection or artifact existence alone.
