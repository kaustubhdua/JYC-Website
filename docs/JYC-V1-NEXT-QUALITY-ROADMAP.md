# JYC 128 V1 — Next Quality Roadmap

## Current release objective

Ship a public, content-first JIIT Youth Club 128 website for JIIT Wish Town Campus, Sector 128, Noida. The public V1 surface is Home, About JYC, Leadership, Events, Event Details, Clubs & Communities, Gallery, Announcements, Join JYC (Coming Soon), Event Calendar and Contact.

Achievements, Projects, Impact and FAQ are not public V1 discovery surfaces. The public Control Centre/admin remains outside the public product.

## Visual system

The supplied JYC emblem is the source of the public palette:
- paper beige #F5F1E6
- ivory #FFFFFF
- near-black #0F0E11
- dark surface #18161D
- JYC red #A82420
- champagne gold #BF9C6F
- restrained bronze/muted neutrals

The interface should remain editorial, photographic and youthful without neon gradients, excessive glassmorphism, giant rounded SaaS cards or animation for its own sake.

## Interaction strategy

### React Bits
Use copy-ready React Bits source for distinctive interactions where it improves comprehension:
- Dither Veil — hero identity
- Magic Bento — activity discovery
- Dock — mobile navigation
- Flex Carousel / Drift Wall — gallery exploration
- Hover Preview / Spotlight Card — selected club/event discovery

Do not turn the website into a React Bits catalogue.

### Motion
Motion remains the animation engine. Global MotionConfig with reducedMotion="user" is required so transform/layout animation respects the user's reduced-motion preference.

### Accessibility primitives
The project currently keeps its own lightweight accessible shell rather than adding another dependency to every route. If custom dialogs/drawers grow more complex, evaluate Radix Primitives or Base UI incrementally for focus trapping, keyboard navigation, inert overlays and collision-aware popovers. Do not replace working native controls merely for library adoption.

## Quality gates

Every public release should pass:
1. production build
2. static product QA
3. SEO QA
4. media/source QA
5. JIIT 128 event-scope QA
6. accessibility contract
7. React Bits contract
8. animation/performance QA
9. browser smoke across 390 / 430 / 768 / 1280 widths
10. CodeQL/security checks

## Content integrity

- JIIT 128 / Wish Town / Sector 128 is the public campus boundary.
- Never substitute generic JIIT or Sector 62 content.
- Current facts require an attributable official source.
- Historical brochures are context, not automatic current truth.
- Do not invent people, roles, dates, registration links, club handles, achievements or statistics.
- Official JAI 2026 material remains linked as an external source/event ecosystem rather than being presented as generic photography.

## Next implementation priorities

### P0 — release
- finish current browser QA and CodeQL runs
- inspect failed screenshots if any
- merge only after CI and browser QA are green
- keep Vercel/domain work out of scope

### P1 — visual consistency
- complete screenshot review of every V1 route
- remove remaining legacy card styles and conflicting typography
- standardize spacing, button states, filter chips and focus rings
- verify dark mode for every page, not just the homepage
- keep real source photography above decorative effects

### P1 — Gallery
- make Gallery the flagship visual route
- retain provenance/source labels
- lazy-load heavy media
- preserve masonry/wall layout without cumulative layout shift
- use React Bits exploration selectively

### P1 — Events
- verify every event against its canonical source
- keep status and registration state source-backed
- ensure event details expose only populated fields
- connect calendar/share/register actions only when the underlying data is complete

### P2 — Accessibility
- test keyboard traversal through search, More, gallery lightbox, event filters and forms
- verify focus restoration after dialogs
- test 200%/400% zoom and narrow widths
- test forced-colors/high-contrast mode
- test screen-reader labels for icon-only controls

### P2 — Performance
- keep Dither Veil, Magic Bento and navigation enhancements out of the initial critical path where possible
- reserve intrinsic image dimensions
- audit largest JS chunks and raster assets
- monitor LCP, INP and CLS after deployment
- keep WebGL/animation work off the critical rendering path

### P3 — future admin
Only after the public V1 is stable, build the private publishing workflow for events, clubs, announcements, leadership and source/provenance records. It should not become part of the public navigation.

## Research references

- React Bits: https://www.reactbits.dev/
- Motion accessibility: https://motion.dev/docs/react-accessibility
- Radix accessibility: https://www.radix-ui.com/primitives/docs/overview/accessibility
- Base UI accessibility: https://base-ui.com/react/overview/accessibility
- Official JAI 2026: https://www.jiityouthclub128.in/
