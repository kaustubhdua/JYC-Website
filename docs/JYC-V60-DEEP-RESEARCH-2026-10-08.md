# JYC V60 — Deep Research & Product Pass · 2026-10-08

## Decision

The public JYC 128 website should remain an editorial student-organisation site, not a component showcase. The new pass therefore prioritises discoverability, event participation, visual archive quality, accessibility, mobile usability and performance.

## Research findings

### React Bits
Current React Bits catalogues Dock, Flex Carousel, Dither Veil and Drift Wall among its components. Dock is appropriate for mobile navigation; Dither Veil remains appropriate as a restrained hero treatment. Flex Carousel/Drift Wall are useful only where the content itself benefits from browsing. The catalogue also contains circular/drifting components, but those are deliberately **not** adopted because the project requirement is no orbiting interaction language.

Sources: https://www.reactbits.dev/get-started/index and https://reactbits.dev/components/dock

### Aceternity UI
The current library includes Expandable Cards, Sticky Scroll Reveal, Timeline, Focus Cards, Layout Grid and other Motion-based patterns. The strongest JYC use cases remain:
- event programme/timeline
- club discovery/focus
- archive expansion
- long-form “what JYC does” storytelling

These patterns should be adapted to JYC content rather than copied as generic blocks.

Sources: https://ui.aceternity.com/components/expandable-card, https://ui.aceternity.com/components/sticky-scroll-reveal, https://ui.aceternity.com/components/timeline

### PhotoSwipe
PhotoSwipe 5.4.4 remains a strong optional lightbox candidate because it supports dynamic import, keyboard navigation, focus trapping and focus restoration. It also requires explicit image dimensions and progressive enhancement. The current JYC gallery already has a custom accessible lightbox with Escape, arrow-key navigation and focus trapping, so adding PhotoSwipe is **not necessary yet**.

Sources: https://photoswipe.com/, https://photoswipe.com/options/, https://photoswipe.com/getting-started/

### Performance
Google's current Core Web Vitals guidance remains:
- LCP ≤ 2.5s
- INP ≤ 200ms
- CLS ≤ 0.1
at the 75th percentile.

The project should continue reserving hero media dimensions, lazy-loading archive media, keeping expensive visual components lazy, and validating browser performance separately from static QA.

Source: https://web.dev/articles/vitals

## What was implemented in this pass

1. Kept the JYC Network as the one purposeful relationship interaction: People → Communities → Events, with direct navigation and no orbit/auto-rotation.
2. Removed leftover orbit/camera language from the 3D showcase and kept the model non-rotating.
3. Corrected the homepage numbering so the signature WebGL moment does not consume a duplicate numbered section.
4. Expanded V59 static QA to enforce:
   - no public orbit runtime markup
   - no camera orbit/auto-rotation in WebGL
   - JYC Network presence and purpose
   - search relevance scoring
   - gallery keyboard/focus contracts
   - event programme/registration/calendar contracts
   - five-item mobile dock
   - reduced-motion support
   - no unnecessary Fuse.js/PhotoSwipe dependency added merely for appearance
5. Preserved the existing custom gallery lightbox because it already meets the researched keyboard/focus requirements.
6. Preserved the existing source-backed event experience and JYC 128 content boundary.

## Remaining highest-value work

### P0
- Run the complete static QA suite after the latest commits.
- Wait for CI, Quality Gate, Browser QA and CodeQL before merge.
- Perform an actual mobile browser pass at 390×844 and 768×1024, checking overlap, bottom-dock clearance, long event titles, filters and gallery controls.
- Measure Lighthouse/Core Web Vitals on the production build; static tests cannot prove field LCP/INP/CLS.

### P1
- Event detail visual refinement: stronger shared event-image transitions, clearer programme hierarchy and related-event navigation.
- Gallery refinement: preserve editorial wall/story/archive modes; only add PhotoSwipe if the current lightbox proves insufficient.
- Club discovery: make the active club/family relationship more legible on touch without relying on hover.
- Search: continue testing exact titles, typo tolerance, club/event/person collisions and empty states.

### P2
- One cinematic GSAP scroll moment only if it communicates content.
- More source-backed social/update integration.
- Further image optimisation and responsive srcset generation where the original media supports it.

### Explicit non-goals
- No orbiting cards, photos, icons, clubs, events, sections, navigation or 3D models.
- No custom cursor.
- No permanent particles/starfield as a default visual layer.
- No scroll-jacking.
- No giant 3D homepage.
- No fake impact/achievement metrics.
- No generic SaaS/dashboard visual language.
