# JYC Website — Architecture Map (V56.1)

> Maintainer companion: [CODE-ORGANIZATION.md](./CODE-ORGANIZATION.md). Use that document to decide where new functions and components belong.

This repository is intentionally organised around one active public React application plus a private Control Center.

## Active public runtime

`index.html` → `src/main.jsx` → `src/styles/public-system.css`

`main.jsx` owns:
- public routing and canonical slugs
- Supabase read/cache lifecycle
- JYC-only calendar
- home, clubs, events, gallery, team, history, recruitment and contact surfaces
- public navigation, theme switching and resilience states

## Content authority

### Current operational layer
Supabase `jyc_site_data` contains published JYC records. Only authorised editors should publish current people, events, recruitment, links and operational claims.

### Source/context layer
- `src/jyc-hub-registry.js` — maintained 23-community source registry and provenance state.
- `src/v21-hub-content.js` — source-grounded hub summaries and family structure.
- `src/v23.6-hub-details.js` — activity areas, signature experiences and source highlights.
- `src/pdf-hub-content.js` / `src/pdf-hub-extra.js` — supplied All Hubs presentation-derived visual/story material.
- `src/jyc-source-media.js` — canonical URL deduplication and media enrichment.
- `src/jyc-source-archive.js` — supplied five-volume archive inventory.

Historical/source material must not silently become a current operational claim.

## Public SEO

- `src/extra-features.jsx` — canonical metadata and JSON-LD.
- `scripts/generate-sitemap.mjs` — generates core routes plus all maintained source-hub detail URLs.
- `public/robots.txt` — public crawl policy and canonical sitemap.
- `public/llms.txt` — machine-readable JYC identity, route and community/source vocabulary.
- Club pages use stable `/clubs/<slug>` URLs.
- Event pages use stable `/events/<slug>` URLs.
- Each detail page receives unique title/description and entity-aware JSON-LD.

## Media

Use real supplied/approved JYC photography before decorative graphics.

The public archive:
1. preserves source/provenance metadata;
2. filters decorative material from featured photography where possible;
3. deduplicates by canonical URL;
4. supports keyboard-accessible lightbox navigation;
5. keeps the full source-photo traversal available without arbitrary pool caps.

## 3D JYC bot

`src/jyc-bot.jsx` loads `public/models/1780947277181-w2z6yhqv.glb` through `model-viewer`.

Interaction contract:
- no auto-rotation;
- no uncontrolled camera orbit;
- tap/hover/focus provide restrained motion;
- if the GLB contains native animations, the first relevant animation is played on interaction;
- reduced-motion disables decorative motion;
- the JYC logo remains the visual fallback/poster identity.

## Design contract

The visual system is locked to:
- JYC cream/beige surfaces;
- near-black/navy dark surfaces;
- champagne/gold accents;
- restrained red only for attention;
- readable neutral text;
- centred editorial composition;
- no neon/blue-purple AI dashboard styling;
- no custom cursor;
- no flying-bird/orbit system;
- no persistent decorative rotation;
- mobile-safe grids and typography;
- visible keyboard focus;
- reduced-motion support.

## Supabase boundary

Browser code never writes directly to the privileged media bucket. Media uploads use the JWT-protected `media-upload` Edge Function.

Public submission/error-report functions validate origin, payload size and rate limits.

The public registration RPC is no longer executable by `anon` or `authenticated`.

## QA gates

Run:

```bash
npm ci
npm run qa
npm run qa:seo
npm run build
npm run qa:browser
```

GitHub Actions additionally runs dependency vulnerability checks, CodeQL and the production/browser gates.

## Deployment boundary

Vercel deployment is intentionally separate from this code-side release. Do not introduce deployment-specific assumptions into the public runtime.
