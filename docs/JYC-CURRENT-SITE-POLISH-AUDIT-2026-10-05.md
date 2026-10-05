# JYC Current-Site Polish Audit — 2026-10-05

## Scope

This pass is deliberately **not a feature-expansion pass**. The goal is to improve the current JYC public website by tightening correctness, consistency, performance, accessibility, SEO, maintainability and visual restraint without introducing new public product capabilities.

Current baseline: V56.15.1 on `main`, including the editorial homepage consolidation, source-media hardening and Supabase migration-version cleanup.

## Changes implemented in this pass

### 1. Social metadata is now canonical and type-correct
- `og:url` now follows the page's canonical URL instead of `window.location.href`, so tracking/query parameters are not promoted as the social URL.
- `og:image:type` is derived from the actual image extension instead of being hard-coded to WebP.
- Removed hard-coded 1200×630 dimensions from the default logo preview because the current asset is not a 1200×630 social-card image.
- Page metadata now reacts when `options.image` or `options.imageAlt` changes.

### 2. Sitemap correctness
- Removed the permanently redirected `/join-jyc` URL from the sitemap.
- `lastmod` is emitted only when a real CMS content timestamp exists. Build time is not treated as a content modification time.
- This keeps sitemap signals aligned with canonical URLs and actual content changes.

### 3. Public copy consistency
- The public Join JYC CTA consistently points to `/join-jyc`, the official Coming Soon experience. Recruitment remains available as its own public destination.
- Existing QA contracts were updated to protect the current behavior.

### 4. Visual/media stability pass
- Public media containers now have a stronger centered-crop and overflow contract.
- Long event/community labels are protected from horizontal collisions.
- Runtime image failures have a deterministic local fallback so broken-image glyphs do not create dead media frames.
- GLB animation playback is throttled and disabled under reduced-motion; touch-first/constrained devices use the safe branded fallback to avoid unnecessary GPU/network cost.
- Browser QA now checks empty media frames and normal-flow section overlaps across the public route matrix.

### 5. Repository terminology
- The media documentation now distinguishes the 873 archive entries from the 872 raster images plus one SVG.

## What the current codebase already does well

- Strong centered editorial direction and JYC-specific visual language.
- Real source photography is preferred over generic/stock imagery.
- Source archive is provenance-aware rather than blindly publishing every recovered visual.
- Gallery is progressively rendered instead of putting the entire archive into the DOM at once.
- Above-the-fold photo treatment already uses eager/high-priority loading where appropriate; below-the-fold gallery items use lazy loading.
- Reduced-motion contracts are present.
- Keyboard focus and mobile interaction contracts are present.
- Public content is separated from the private Control Center.
- Supabase RLS/security-definer hardening has been materially improved.
- Production JS/CSS/image budgets are enforced in CI.
- SEO includes Organization, WebSite, Breadcrumb, CollectionPage, Event and image metadata.
- The site explicitly avoids the previously rejected custom cursor, orbit-ring and neon/AI-dashboard direction.

## Production deployment verification blocker

The repository's canonical metadata targets `https://www.jiityouthclub128.in/`, but an external verification of that public hostname currently returns a standalone JAI 2026 site rather than this repository's JYC V1 application. The repository `vercel.json` does not rewrite the root to JAI. This must be resolved in the Vercel/domain project configuration before the JYC V1 homepage can be considered production-verified.

## Highest-value improvements that do not add features

### P0 — real-world verification
1. Run desktop, tablet and mobile browser QA against the actual Vercel deployment.
2. Check both light and dark themes on the real deployment.
3. Inspect Core Web Vitals in field data/CrUX and PageSpeed Insights, especially LCP, INP and CLS.
4. Verify redirects, security headers, canonical tags, robots and generated sitemap on the real domain.
5. Enable Supabase Auth leaked-password protection in the dashboard.

### P1 — performance refinement
1. **Responsive image variants:** the archive is WebP-optimized, but most runtime images still use one source URL. Add width-aware variants for major gallery/story surfaces so a phone does not receive a desktop-sized image.
2. **Measure before changing animation:** use DevTools Performance/Long Animation Frames and INP traces to identify expensive interaction/render paths. Do not add more motion.
3. **Route/code splitting:** the active `src/main.jsx` remains very large. Extract only high-cohesion existing pages/components rather than rewriting the application. Priorities: Events, Clubs, Gallery, Team/About and the existing admin boundary.
4. **CSS debt cleanup:** the active stylesheet is consolidated, but the repository still contains many historical V13–V42 stylesheet generations. After confirming they are not imported/referenced, archive or remove them in a separate hygiene pass. Do not delete anything solely by filename.
5. Keep the current performance budgets as release gates.

### P1 — visual/UX polish
1. Keep one visual hierarchy per page: eyebrow → title → short explanation → primary action → content.
2. Keep image crops consistent and preserve focal subjects; avoid making every photograph a full-bleed hero.
3. Reduce any remaining decorative surface treatment when it competes with club/event content.
4. Keep card density compact and centered; avoid large empty vertical runs.
5. Ensure mobile controls remain thumb-friendly and do not create horizontal overflow.
6. Treat dark mode as a deliberate visual theme, not a simple color inversion.
7. Keep the JYC beige/champagne accent restrained so it remains an identity signal rather than a UI fill everywhere.

### P1 — image quality and provenance
1. Continue promoting only source-backed photography into official club/event records.
2. Map stronger photographs to specific events/hubs/years when evidence exists.
3. Keep artwork, QR cards, presentation slides and decorative graphics out of the default photography narrative.
4. Preserve captions, alt text, credit and provenance for published media.
5. Use the archive as a source library, not as an instruction to publish all 873 entries.

### P1 — accessibility
1. Manually test keyboard-only navigation across every public route.
2. Test focus order and focus visibility in both themes.
3. Test dialogs/lightboxes with Escape, focus return and screen-reader labels.
4. Test touch targets and zoom at 200–400%.
5. Verify that motion-heavy existing surfaces remain comfortable with reduced-motion enabled.
6. Check contrast with actual rendered text/surfaces, especially muted text in dark mode.

### P2 — maintainability
1. Keep `src/main.jsx` as the orchestration layer, but gradually extract high-cohesion existing page implementations.
2. Keep a single canonical design-token layer instead of adding more one-off CSS overrides.
3. Replace historical QA-generation references with a small set of current release contracts where safe.
4. Keep README/release docs synchronized with the actual code and production state.
5. Avoid adding another visual system or another versioned CSS generation.

## Research basis

- Google Search Central: canonicalization, sitemaps and page experience.
- Google Search Central: structured data and accurate canonical URLs.
- web.dev / Chrome: Core Web Vitals, especially LCP, INP and CLS.
- MDN: image `width`/`height`, lazy loading and `fetchpriority`.
- W3C/WCAG 2.2: keyboard focus, target sizing and reduced-motion/accessibility requirements.
- Supabase security guidance: RLS plus grants, and pinned `search_path` for SECURITY DEFINER functions.

References:
- https://developers.google.com/search/docs/crawling-indexing/canonicalization
- https://developers.google.com/search/docs/crawling-indexing/sitemaps
- https://developers.google.com/search/docs/appearance/page-experience
- https://developers.google.com/search/docs/appearance/structured-data
- https://web.dev/
- https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img
- https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/fetchpriority
- https://www.w3.org/TR/WCAG22/
- https://supabase.com/docs/guides/database/functions
- https://supabase.com/docs/guides/api/securing-your-api

## Non-goals

This pass intentionally does **not** add:
- new public features
- new dashboards
- new student utilities
- new social-network behavior
- new AI surfaces
- new visual effects
- new navigation concepts
- new product sections

The objective is to make the existing JYC website feel **finished, fast, trustworthy, centered, readable and maintainable**.
